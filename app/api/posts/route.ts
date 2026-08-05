import { prisma } from '@/prisma'
import { NextResponse } from 'next/server'
import { withMetrics } from '../metrics/wrapper'

async function getHandler(request: Request) {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        imageUrl: true,
        date: true,
        Celebrity: {
          select: {
            id: true,
            name: true,
            dp: true
          }
        },
        // Lets the admin post picker show "3 products" without an extra
        // round-trip per post.
        _count: {
          select: { products: true }
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
  }
}

export const GET = withMetrics(getHandler, '/api/posts');