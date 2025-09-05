import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';
import '../../metrics/metrics'
// import { withMetrics } from '../../metrics/middlewareMetrics';

export async function GET(
  request: Request,
  { params }: { params: { celebrityId: string } }
) {
  const routeLabel = '/api/celebrities/[celebrityId]'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()

  try {
    const celebrityId = parseInt(params.celebrityId);
    if (isNaN(celebrityId)) {
      const res = NextResponse.json({ error: 'Invalid celebrity ID' }, { status: 400 });
      globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: '400' })
      globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: '400' }, Date.now() - startTimeMs)
      globalThis.metrics?.activeRequestsGauge.dec()
      return res;
    }

    const celebrity = await prisma.celebrity.findUnique({
      where: { id: celebrityId },
      select: {
        id: true,
        name: true,
        profession: true,
        gender: true,
        
        country: true,
        // Only include fields that exist in your Prisma schema
      }
    });

    if (!celebrity) {
      const res = NextResponse.json({ error: 'Celebrity not found' }, { status: 404 });
      globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: '404' })
      globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: '404' }, Date.now() - startTimeMs)
      globalThis.metrics?.activeRequestsGauge.dec()
      return res;
    }

    const res = NextResponse.json(celebrity);
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: String(res.status) })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: String(res.status) }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  } catch (error) {
    console.error('Error fetching celebrity:', error);
    const res = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: '500' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: '500' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { celebrityId: string } }
) {
  const routeLabel = '/api/celebrities/[celebrityId]'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()

  try {
    const celebrityId = parseInt(params.celebrityId);
    const { name, profession, gender, dp, country } = await request.json();

    if (isNaN(celebrityId)) {
      const res = NextResponse.json({ error: 'Invalid celebrity ID' }, { status: 400 });
      globalThis.metrics?.requestCounter.inc({ method: 'PUT', route: routeLabel, status_code: '400' })
      globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'PUT', route: routeLabel, code: '400' }, Date.now() - startTimeMs)
      globalThis.metrics?.activeRequestsGauge.dec()
      return res;
    }

    const updatedCelebrity = await prisma.celebrity.update({
      where: { id: celebrityId },
      data: {
        name,
        profession,
        gender,
   
        country,
        // Only include fields that exist in your Prisma schema
      }
    });

    const res = NextResponse.json({
      message: 'Celebrity updated successfully',
      celebrity: updatedCelebrity
    });
    globalThis.metrics?.requestCounter.inc({ method: 'PUT', route: routeLabel, status_code: String(res.status) })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'PUT', route: routeLabel, code: String(res.status) }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  } catch (error) {
    console.error('Error updating celebrity:', error);
    const res = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    globalThis.metrics?.requestCounter.inc({ method: 'PUT', route: routeLabel, status_code: '500' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'PUT', route: routeLabel, code: '500' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  } finally {
    await prisma.$disconnect();
  }
} 

// export const GET = withMetrics(handler, '/api/celebrities/[celebrityId]', {
//   counter: true,
//   histogram: true,
//   gauge: true
// });