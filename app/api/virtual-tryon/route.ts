import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { withMetrics } from '../metrics/wrapper';

export const runtime = 'nodejs';

/**
 * Diffusion inference routinely takes 20–40s, well past Vercel's 10s default
 * for serverless functions — which is what produced the 504 Gateway Timeout.
 * 60s is the ceiling on the Hobby plan; raise this if you move to Pro.
 *
 * Note this constraint did not exist when the browser called RapidAPI
 * directly: the fetch simply stayed open as long as it needed. It is the cost
 * of proxying through a serverless function to keep the API key private.
 */
export const maxDuration = 60;

const RAPIDAPI_HOST = 'try-on-diffusion.p.rapidapi.com';

/** Leaves headroom under `maxDuration` so we can return a real error body. */
const TRY_ON_TIMEOUT_MS = 50_000;
const IMAGE_FETCH_TIMEOUT_MS = 10_000;

/**
 * Proxies the virtual try-on request to RapidAPI.
 *
 * The RapidAPI key used to live in the client bundle (a `"use client"`
 * component called the provider directly), which ships it to anyone who opens
 * DevTools on /virtual-tryon. It now lives only in `RAPIDAPI_KEY`, read
 * server-side, and this route is the only thing that ever sees it. The old
 * key is already public in git history and in anyone's browser cache who
 * loaded the page before this change — rotate it on RapidAPI's dashboard.
 */
async function postHandler(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.error('RAPIDAPI_KEY is not configured');
    return NextResponse.json({ error: 'Try-on is not configured' }, { status: 503 });
  }

  try {
    const incoming = await request.formData();
    const avatarImage = incoming.get('avatar_image');
    const productImageUrl = incoming.get('imageUrl');

    if (!(avatarImage instanceof File)) {
      return NextResponse.json({ error: 'avatar_image is required' }, { status: 400 });
    }
    if (typeof productImageUrl !== 'string' || !productImageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    // Fetched here rather than trusted from the client: the client only ever
    // needs to send the URL, not the bytes, which halves the upload and keeps
    // this route the single place that talks to both the product CDN and
    // RapidAPI.
    const productImageResponse = await fetch(productImageUrl, {
      signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
    });
    if (!productImageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch product image' }, { status: 502 });
    }
    const clothingBlob = await productImageResponse.blob();

    const outgoing = new FormData();
    outgoing.append('clothing_image', clothingBlob, 'clothing.jpg');
    outgoing.append('avatar_image', avatarImage);

    let tryOnResponse: Response;
    try {
      tryOnResponse = await fetch(`https://${RAPIDAPI_HOST}/try-on-file`, {
        method: 'POST',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
        body: outgoing,
        // Abort just under the function's own limit. Without this the platform
        // kills the function first and the browser gets an HTML 504 with no
        // usable error body.
        signal: AbortSignal.timeout(TRY_ON_TIMEOUT_MS),
      });
    } catch (error) {
      if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
        console.error('RapidAPI try-on timed out');
        return NextResponse.json(
          { error: 'The try-on service took too long to respond. Please try again.' },
          { status: 504 }
        );
      }
      throw error;
    }

    if (!tryOnResponse.ok) {
      const detail = await tryOnResponse.text().catch(() => '');
      console.error('RapidAPI try-on failed:', tryOnResponse.status, detail);
      // Surface rate limiting distinctly — on RapidAPI's free tier this is the
      // most common non-transient failure and it is not worth retrying.
      if (tryOnResponse.status === 429) {
        return NextResponse.json(
          { error: 'Try-on quota exceeded for now. Please try again later.' },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: 'Try-on generation failed' }, { status: 502 });
    }

    const resultBuffer = await tryOnResponse.arrayBuffer();
    return new NextResponse(resultBuffer, {
      headers: { 'Content-Type': 'image/jpeg' },
    });
  } catch (error) {
    console.error('Error generating virtual try-on:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withMetrics(postHandler, '/api/virtual-tryon');
