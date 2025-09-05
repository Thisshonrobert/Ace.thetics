import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { isAdmin } from '@/auth';
import '../../metrics/metrics'

export async function GET(req: NextRequest) {
  const routeLabel = '/api/admin/check-celebrity'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()
  if (!(await isAdmin())) {
    const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: '401' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: '401' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  }

  const name = req.nextUrl.searchParams.get('name');

  if (!name) {
    const res = NextResponse.json({ error: 'Name is required' }, { status: 400 });
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: '400' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: '400' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  }

  try {
    const celebrity = await prisma.celebrity.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if(celebrity) console.log("exists");
    else console.log("does not exists")
    const res = NextResponse.json({ exists: !!celebrity });
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: String(res.status) })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: String(res.status) }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  } catch (error) {
    console.error('Error checking celebrity:', error);
    const res = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: '500' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: '500' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  }
}