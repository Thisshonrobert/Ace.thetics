import { prisma } from '@/prisma'
import { NextResponse } from 'next/server'
import { withMetrics } from '../metrics/middlewareMetrics'

async function getPosts(request: Request) {
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
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withMetrics(getPosts, "/api/posts", {
    counter: true,
    histogram: true,
    gauge: true
});