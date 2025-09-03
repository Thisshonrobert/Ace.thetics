import { prisma } from '@/prisma'
import { NextResponse } from 'next/server'
import { Product } from '@/lib/actions/GetProduct'
import { withMetrics } from '../../metrics/middlewareMetrics'

async function getPost(request: Request, { params }: { params: { postId: string } }) {
  try {
    const postId = parseInt(params.postId)
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
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

    return NextResponse.json(flattenedPost)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

async function updatePost(request: Request, { params }: { params: { postId: string } }) {
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

    // Update or create products
    for (const product of products) {
      if (product.id) {
        // Update existing product
        await prisma.product.update({
          where: { id: product.id },
          data: {
            brandname: product.brandname,
            seoname: product.seoname,
            imageUrl: product.imageUrl,
            link: product.link,
            description: product.description,
            category: product.category,
            shop: product.shop
          },
        });
      } 
    }

    return NextResponse.json({ message: 'Post updated successfully!' });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export const GET = withMetrics(getPost, "/api/posts/[postId]", {
    counter: true,
    histogram: true,
    gauge: true
});

export const PUT = withMetrics(updatePost, "/api/posts/[postId]", {
    counter: true,
    histogram: true,
    gauge: true
});