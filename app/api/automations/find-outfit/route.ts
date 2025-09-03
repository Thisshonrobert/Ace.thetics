import { ImageAnnotatorClient } from '@google-cloud/vision';
import { NextResponse } from 'next/server';
import { withMetrics } from '../../metrics/middlewareMetrics';

//@todos
// Make sure you have set up Google Cloud authentication.
// See: https://cloud.google.com/docs/authentication/getting-started

const client = new ImageAnnotatorClient();

async function findOutfit(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const [result] = await client.webDetection(imageUrl);
    const webDetection = result.webDetection;

    if (webDetection) {
        //@todos
        // For now, we'll return the web detection object.
        // In a real application, you would process this data to find product links.
        return NextResponse.json(webDetection);
    } else {
        return NextResponse.json({ error: 'Could not detect web entities.' }, { status: 500 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withMetrics(findOutfit, "/api/automations/find-outfit", {
    counter: true,
    histogram: true,
    gauge: true
});