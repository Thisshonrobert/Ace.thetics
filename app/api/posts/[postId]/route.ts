import { prisma } from '@/prisma'
import { NextResponse } from 'next/server'
import { Product } from '@/lib/actions/GetProduct'
import '../../metrics/metrics'
// import { withMetrics } from '../../metrics/middlewareMetrics'

export async function GET(request: Request, { params }: { params: { postId: string } }) {
  const routeLabel = '/api/posts/[postId]'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()
  try {
    const postId = parseInt(params.postId)
    if (isNaN(postId)) {
      const res = NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
      globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: '400' })
      globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: '400' }, Date.now() - startTimeMs)
      globalThis.metrics?.activeRequestsGauge.dec()
      return res
    }

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
                imageUrl: true,
                link: true,
                description: true,
                category: true,
                shop: true
              }
            }
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const flattenedPost = {
      ...post,
      products: post.products.map((p) => ({
        id: p.Product.id,
        brandname: p.Product.brandname,
        seoname: p.Product.seoname,
        imageUrl: p.Product.imageUrl, 
        link: p.Product.link,
        description: p.Product.description,
        category: p.Product.category,
        shop: p.Product.shop
      })),
    }

    const res = NextResponse.json(flattenedPost)
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: String(res.status) })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: String(res.status) }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res
  } catch (error) {
    console.error('Error fetching post:', error)
    const res = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    globalThis.metrics?.requestCounter.inc({ method: 'GET', route: routeLabel, status_code: '500' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'GET', route: routeLabel, code: '500' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: Request, { params }: { params: { postId: string } }) {
  const routeLabel = '/api/posts/[postId]'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()
  try {
    const postId = parseInt(params.postId);
    const { imageUrl, products } = await request.json();

    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // Update the post's image URLs
    await prisma.post.update({
      where: { id: postId },
      data: {
        imageUrl,
      },
    });

    // Update existing products or create and attach new ones
    for (const product of products) {
      if (product.id) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            brandname: product.brandname,
            seoname: product.seoname,
            imageUrl: product.imageUrl,
            link: product.link,
            description: product.description,
            category: product.category,
            shop: product.shop,
          },
        });
      } else {
        // Create new product and attach to the post via join table
        const created = await prisma.product.create({
          data: {
            brandname: product.brandname,
            seoname: product.seoname,
            imageUrl: product.imageUrl,
            link: product.link,
            description: product.description,
            category: product.category,
            shop: product.shop,
          },
        });
        await prisma.postProduct.create({
          data: { postId, productId: created.id },
        });
      }
    }

    const res = NextResponse.json({ message: 'Post updated successfully!' });
    globalThis.metrics?.requestCounter.inc({ method: 'PUT', route: routeLabel, status_code: String(res.status) })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'PUT', route: routeLabel, code: String(res.status) }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  } catch (error) {
    console.error('Error updating post:', error);
    const res = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    globalThis.metrics?.requestCounter.inc({ method: 'PUT', route: routeLabel, status_code: '500' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'PUT', route: routeLabel, code: '500' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  } 
}

// export const GET = withMetrics(getPost, "/api/posts/[postId]", {
//     counter: true,
//     histogram: true,
//     gauge: true
// });

// export const PUT = withMetrics(updatePost, "/api/posts/[postId]", {
//     counter: true,
//     histogram: true,
//     gauge: true
// });