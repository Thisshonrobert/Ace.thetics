import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import '../metrics/metrics'

export async function POST(request: NextRequest) {
  const routeLabel = '/api/revalidate'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()
  
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.REVALIDATION_SECRET) {
    const res = NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    globalThis.metrics?.requestCounter.inc({ method: 'POST', route: routeLabel, status_code: '401' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'POST', route: routeLabel, code: '401' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  }

 
  revalidatePath('/'); // Revalidate the homepage
//   revalidatePath('/some-other-page'); // Revalidate other pages if needed

  
  const res = NextResponse.json({ revalidated: true });
  globalThis.metrics?.requestCounter.inc({ method: 'POST', route: routeLabel, status_code: String(res.status) })
  globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'POST', route: routeLabel, code: String(res.status) }, Date.now() - startTimeMs)
  globalThis.metrics?.activeRequestsGauge.dec()
  return res;
}