import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { isAdmin } from '@/auth';
import '../../metrics/metrics'
import axios from 'axios';
import { revalidatePath } from 'next/cache';

interface ProductInput {
  brandName: string;
  seoName: string;
  category: string;
  shop: string;
  link: string;
  imageUrl: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  const routeLabel = '/api/admin/create-celebrity'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()
  if (!(await isAdmin())) {
    const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    globalThis.metrics?.requestCounter.inc({ method: 'POST', route: routeLabel, status_code: '401' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'POST', route: routeLabel, code: '401' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  }

  try {
    const {
      name,
      socialId,
      dpImage,
      gender,
      profession,
      country,
      celebImages,
      products
    } = await req.json();

    if (!name || !celebImages || !products || !Array.isArray(celebImages) || !Array.isArray(products)) {
      const res = NextResponse.json({ error: 'Missing required fields or invalid format' }, { status: 400 });
      globalThis.metrics?.requestCounter.inc({ method: 'POST', route: routeLabel, status_code: '400' })
      globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'POST', route: routeLabel, code: '400' }, Date.now() - startTimeMs)
      globalThis.metrics?.activeRequestsGauge.dec()
      return res;
    }

    let celebrity = await prisma.celebrity.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (celebrity) {
      celebrity = await prisma.celebrity.update({
        where: { id: celebrity.id },
        data: {
          name,
          dp: dpImage,
          gender: gender as 'men' | 'women' | 'kids' | null,
          profession: profession || null,
          country: country || null,
        },
      });
    } else {
      if (!socialId || !dpImage) {
        return NextResponse.json({ error: 'Missing required fields for new celebrity' }, { status: 400 });
      }
      celebrity = await prisma.celebrity.create({
        data: {
          name,
          socialmediaId: socialId,
          dp: dpImage,
          gender: gender as 'men' | 'women' | 'kids' | null,
          profession: profession || null,
          country: country || null,
        },
      });
    }

    const post = await prisma.post.create({
      data: {
        celebrityId: celebrity.id,
        imageUrl: celebImages,
        products: {
          create: products.map((product: ProductInput) => ({
            Product: {
              create: {
                brandname: product.brandName,
                seoname: product.seoName,
                category: product.category,
                shop: product.shop,
                link: product.link,
                imageUrl: product.imageUrl,
                description: product.description || "Elevate your style, embrace the trend!",
              },
            },
          })),
        },
      },
      include: {
        products: {
          include: {
            Product: true,
          },
        },
      },
    });
    try {
      console.log(  'Sending Telegram notification via zap...');
      await axios.post(
        " https://573aa6cfe4fd.ngrok-free.app/hooks/catch/1/b2d9646b-ea94-42cf-8b9a-d059ef4901a4",
        {
          "channelUserName": "acetheticsupdates",
          "botToken": "8403896095:AAHjSnjTUB3s-YOZ1fwMGwU0fpSKJ9cexSw",
          "message": `New celebrity added: ${celebrity.name}. Check it out at ${process.env.NEXT_PUBLIC_APP_URL}/celebrity/${celebrity.id}`,
        },
        {
          headers: {
            "X-ZAP-SECRET": process.env.ZAP_SECRET!,
          }
        }
      );

    } catch (error) {
        console.error('Error sending Telegram notification: via zap', error);
    }
    // Revalidate the homepage cache server-side. Prefer direct `revalidatePath` so
    // we don't rely on an external URL or public env var. If it fails, fall back
    // to the existing fetch-based revalidation (keeps backwards compatibility).
    try {
      revalidatePath('/');
    } catch (err) {
      console.error('revalidatePath failed, attempting fallback revalidation fetch:', err);
      try {
        const revalidateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate?secret=${process.env.REVALIDATION_SECRET}`, {
          method: 'POST',
        });

        if (!revalidateResponse.ok) {
          const errorData = await revalidateResponse.json().catch(() => null);
          console.error('Fallback revalidation fetch failed:', revalidateResponse.status, errorData);
        }
      } catch (error) {
        console.error('Error during fallback revalidation fetch:', error);
      }
    }

    const res = NextResponse.json({ celebrity, post }, { status: 201 });
    globalThis.metrics?.requestCounter.inc({ method: 'POST', route: routeLabel, status_code: '201' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'POST', route: routeLabel, code: '201' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;

  } catch (error) {
    console.error('Error creating/updating celebrity:', error);
    const res = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    globalThis.metrics?.requestCounter.inc({ method: 'POST', route: routeLabel, status_code: '500' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'POST', route: routeLabel, code: '500' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  }
}