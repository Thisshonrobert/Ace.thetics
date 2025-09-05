import { ImageAnnotatorClient } from '@google-cloud/vision';
import { NextResponse } from 'next/server';
// import { withMetrics } from '../../metrics/middlewareMetrics';
import '../../metrics/metrics'

//@todos
// Make sure you have set up Google Cloud authentication.
// See: https://cloud.google.com/docs/authentication/getting-started

const client = new ImageAnnotatorClient();

export async function POST(request: Request) {
  const routeLabel = '/api/automations/find-outfit'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      const res = NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
      globalThis.metrics?.requestCounter.inc({ method: 'POST', route: routeLabel, status_code: '400' })
      globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'POST', route: routeLabel, code: '400' }, Date.now() - startTimeMs)
      globalThis.metrics?.activeRequestsGauge.dec()
      return res;
    }

    const [result] = await client.webDetection(imageUrl);
    const webDetection = result.webDetection;

    if (webDetection) {
        //@todos
        // For now, we'll return the web detection object.
        // In a real application, you would process this data to find product links.
        const res = NextResponse.json(webDetection);
        globalThis.metrics?.requestCounter.inc({ method: 'POST', route: routeLabel, status_code: String(res.status) })
        globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'POST', route: routeLabel, code: String(res.status) }, Date.now() - startTimeMs)
        globalThis.metrics?.activeRequestsGauge.dec()
        return res;
    } else {
        const res = NextResponse.json({ error: 'Could not detect web entities.' }, { status: 500 });
        globalThis.metrics?.requestCounter.inc({ method: 'POST', route: routeLabel, status_code: '500' })
        globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'POST', route: routeLabel, code: '500' }, Date.now() - startTimeMs)
        globalThis.metrics?.activeRequestsGauge.dec()
        return res;
    }

  } catch (error) {
    console.error(error);
    const res = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    globalThis.metrics?.requestCounter.inc({ method: 'POST', route: routeLabel, status_code: '500' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'POST', route: routeLabel, code: '500' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  }
}

// export const POST = withMetrics(findOutfit, "/api/automations/find-outfit", {
//     counter: true,
//     histogram: true,
//     gauge: true
// });