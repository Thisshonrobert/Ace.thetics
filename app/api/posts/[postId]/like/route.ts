import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';
import '../../../metrics/metrics'


export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const routeLabel = '/api/posts/[postId]/like'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()
  try {
    const session = await auth();
    if (!session?.user) {
      const res = NextResponse.json({ isLiked: false });
      globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: String(res.status) })
      globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: String(res.status) }, Date.now() - startTimeMs)
      globalThis.metrics?.activeRequestsGauge.dec()
      return res;
    }

    const postId = parseInt(params.postId);
    const userId = session.user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        Liked: {
          where: { id: userId },
        },
      },
    });

    const isLiked = (post?.Liked ?? []).length > 0;

    const res = NextResponse.json({ isLiked });
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: String(res.status) })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: String(res.status) }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  } catch (error) {
    console.error('Error checking like status:', error);
    const res = NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: '500' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: '500' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  }
}

