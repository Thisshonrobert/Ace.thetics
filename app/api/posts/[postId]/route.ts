import { prisma } from '@/prisma'
import { NextResponse } from 'next/server'


export async function GET(request: Request, { params }: { params: { postId: string } }) {
  try {
    const postId = parseInt(params.postId)
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          Celebrity: {
            select: {
              name: true
            }
          },
          products: {
            include: {
              Product: {
                select: {
                  id: true,
                  brandname: true,
                  seoname: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}