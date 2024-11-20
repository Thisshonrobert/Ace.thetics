'use server'
import { prisma } from "@/prisma";

export async function GetPosts() {
    try {
      const posts = await prisma.post.findMany({
        
        include: {
          Celebrity: true,
          products: {
            include: {
              Product: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
  
      return posts.map(post => ({
        id: post.id,
        celebrityImages: post.imageUrl, // This is now an array
        celebrityName: post.Celebrity.name,
        celebrityDp: post.Celebrity.dp,
        postDate: post.date.toDateString(),
        products: post.products.map(pp => ({
          id: pp.Product.id,
          category: pp.Product.category,
          brandname: pp.Product.brandname,
          seoname: pp.Product.seoname,
          shop: pp.Product.shop,
          image: pp.Product.imageUrl,
        })),
      }));
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      return [];
    }
  }
  
export async function GetPostById(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        Celebrity: true,
        products: {
          include: {
            Product: true,
          },
        },
      },
    });

    if (!post) return null;

    return {
      id: post.id,
      celebrityImages: post.imageUrl,
      celebrityName: post.Celebrity.name,
      celebrityDp: post.Celebrity.dp,
      postDate: post.date.toDateString(),
      products: post.products.map(pp => ({
        id: pp.Product.id,
        category: pp.Product.category,
        brandname: pp.Product.brandname,
        seoname: pp.Product.seoname,
        shop: pp.Product.shop,
        image: pp.Product.imageUrl,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return null;
  }
}
  