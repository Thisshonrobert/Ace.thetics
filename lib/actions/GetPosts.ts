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
        celebrityImage: post.imageUrl,
        celebrityName: post.Celebrity.name,
        celebrityDp:post.Celebrity.dp,
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
  