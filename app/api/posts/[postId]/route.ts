import { prisma } from '@/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { isAdmin } from '@/auth'
import { withMetrics } from '../../metrics/wrapper'
import { sanitizeUrl } from '@/constants/taxonomy'

const PRODUCT_FIELDS = {
  id: true,
  brandname: true,
  seoname: true,
  imageUrl: true,
  link: true,
  description: true,
  category: true,
  shop: true,
} as const

interface ProductPayload {
  id?: number
  brandname: string
  seoname: string
  imageUrl: string
  link?: string
  description?: string
  category: string
  shop: string
}

async function getHandler(request: Request, { params }: { params: { postId: string } }) {
  try {
    const postId = parseInt(params.postId)
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        Celebrity: { select: { id: true, name: true, dp: true } },
        products: { include: { Product: { select: PRODUCT_FIELDS } } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...post,
      products: post.products.map((p) => p.Product),
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

async function putHandler(request: Request, { params }: { params: { postId: string } }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const postId = parseInt(params.postId)
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    const body = await request.json()
    const imageUrl: string[] = Array.isArray(body.imageUrl) ? body.imageUrl.filter(Boolean) : []
    const products: ProductPayload[] = Array.isArray(body.products) ? body.products : []
    const removedProductIds: number[] = Array.isArray(body.removedProductIds)
      ? body.removedProductIds.filter((id: unknown) => typeof id === 'number')
      : []
    const date: string | undefined = body.date

    if (imageUrl.length === 0) {
      return NextResponse.json({ error: 'A post needs at least one image' }, { status: 400 })
    }

    const missingField = products.find((p) => !p.brandname?.trim() || !p.imageUrl?.trim())
    if (missingField) {
      return NextResponse.json(
        { error: 'Every product needs a brand name and an image' },
        { status: 400 }
      )
    }

    const existing = await prisma.post.findUnique({
      where: { id: postId },
      select: { Celebrity: { select: { name: true } } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // One transaction so a failure part-way through doesn't leave the post with
    // new images but stale products.
    await prisma.$transaction(async (tx) => {
      await tx.post.update({
        where: { id: postId },
        data: {
          imageUrl,
          ...(date ? { date: new Date(date) } : {}),
        },
      })

      if (removedProductIds.length > 0) {
        // Detach from this post only. The Product row itself may be shared with
        // other posts, so deleting it outright would break them.
        await tx.postProduct.deleteMany({
          where: { postId, productId: { in: removedProductIds } },
        })
      }

      for (const product of products) {
        const data = {
          brandname: product.brandname.trim(),
          seoname: product.seoname?.trim() ?? '',
          imageUrl: product.imageUrl.trim(),
          link: sanitizeUrl(product.link ?? ''),
          description: product.description?.trim() || 'Elevate your style, embrace the trend!',
          category: product.category ?? '',
          shop: product.shop?.trim() ?? '',
        }

        if (product.id) {
          await tx.product.update({ where: { id: product.id }, data })
        } else {
          const created = await tx.product.create({ data })
          await tx.postProduct.create({ data: { postId, productId: created.id } })
        }
      }
    })

    revalidatePath('/')
    revalidatePath(`/post/${postId}`)
    revalidatePath(`/celebrity/${encodeURIComponent(existing.Celebrity.name)}`)
    products.forEach((p) => p.id && revalidatePath(`/product/${p.id}`))

    return NextResponse.json({ message: 'Post updated successfully!' })
  } catch (error) {
    // `Product.imageUrl` is @unique, so pointing two products at the same
    // upload is a common admin mistake worth an explicit message.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'That product image is already used by another product. Upload a different image.' },
        { status: 409 }
      )
    }
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export const GET = withMetrics(getHandler, '/api/posts/[postId]')
export const PUT = withMetrics(putHandler, '/api/posts/[postId]')
