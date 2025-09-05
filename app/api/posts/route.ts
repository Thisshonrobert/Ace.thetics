import { prisma } from '@/prisma'
import '../metrics/metrics'
import { NextResponse } from 'next/server'
// import { withMetrics } from '../metrics/middlewareMetrics'

export async function GET(request: Request) {
  const routeLabel = '/api/posts'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()

  let response: NextResponse
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        imageUrl: true,
        date: true,
        Celebrity: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })
    response = NextResponse.json(posts)
    const status = response?.status ?? 500
    const durationMs = Date.now() - startTimeMs
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: String(status) })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: String(status) }, durationMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return response
  } catch (error) {
    console.error('Error fetching posts:', error)
    response = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    const status = response?.status ?? 500
    const durationMs = Date.now() - startTimeMs
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: String(status) })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: String(status) }, durationMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return response
  } 
 
}

// export const GET = withMetrics(getPosts, "/api/posts", {
//     counter: true,
//     histogram: true,
//     gauge: true
// });