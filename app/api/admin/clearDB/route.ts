
import { isAdmin } from '@/auth';
import { ClearDB } from '@/lib/actions/ClearDB';
import { NextRequest, NextResponse } from 'next/server';
import '../../metrics/metrics'


export async function POST(req: NextRequest) {
    const routeLabel = '/api/admin/clearDB'
    const startTimeMs = Date.now()
    globalThis.metrics?.activeRequestsGauge.inc()
    if (!(await isAdmin())) {
        const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        globalThis.metrics?.requestCounter.inc({ method: 'POST', route: routeLabel, status_code: '401' })
        globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'POST', route: routeLabel, code: '401' }, Date.now() - startTimeMs)
        globalThis.metrics?.activeRequestsGauge.dec()
        return res;
      }
  await ClearDB();
  const res = NextResponse.json({ message: 'Database cleared successfully.' });
  globalThis.metrics?.requestCounter.inc({ method: 'POST', route: routeLabel, status_code: String(res.status) })
  globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'POST', route: routeLabel, code: String(res.status) }, Date.now() - startTimeMs)
  globalThis.metrics?.activeRequestsGauge.dec()
  return res;
  
}