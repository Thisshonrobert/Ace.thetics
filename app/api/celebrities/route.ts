import { prisma } from '@/prisma'
import { NextResponse } from 'next/server'
import '../metrics/metrics'
// import { withMetrics } from '../metrics/middlewareMetrics'

export async function GET(req: Request) {
  const routeLabel = '/api/celebrities'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()

  let response: NextResponse
  let statusCode = 200

  try {
    const celebrities = await prisma.celebrity.findMany({
      select: {
        id: true,
        name: true,
        dp: true
      }
    })
    response = NextResponse.json(celebrities)
    statusCode = response.status
  } catch (error) {
    console.error('Error fetching celebrities:', error)
    response = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    statusCode = 500
  } finally {
    const durationMs = Date.now() - startTimeMs
    globalThis.metrics?.requestCounter.inc({
      method: 'GET',
      route: routeLabel,
      status_code: String(statusCode)
    })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe(
      { method: 'GET', route: routeLabel, code: String(statusCode) },
      durationMs
    )
    globalThis.metrics?.activeRequestsGauge.dec()
  }

  return response
}

// Apply metrics (counter + histogram + gauge)
// export const GET = withMetrics(handler, '/api/celebrities', {
//   counter: true,
//   histogram: true,
//   gauge: true
// });
