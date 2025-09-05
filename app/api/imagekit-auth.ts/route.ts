import { NextResponse } from 'next/server';
import ImageKit from "imagekit";
// import { withMetrics } from '../metrics/middlewareMetrics';
import '../metrics/metrics'


const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!
});

export async function GET() {
  const routeLabel = '/api/imagekit-auth'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    const res = NextResponse.json(authenticationParameters);
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: String(res.status) })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: String(res.status) }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  } catch (error) {
    console.error('Error generating auth parameters:', error);
    const res = NextResponse.json(
      { error: 'Failed to generate authentication parameters' },
      { status: 500 }
    );
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: '500' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: '500' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  }
}

// export const GET = withMetrics(getImageKitAuth, "/api/imagekit-auth", {
//     counter: true,
//     histogram: true,
//     gauge: true
// });