'use server'
import { prisma } from "@/prisma";
import { Gender } from "@prisma/client";

export async function GetGenderPosts(gender:Gender) {
    try {
      const posts = await prisma.post.findMany({
        where:{
            Celebrity:{
                gender:gender
            }
        },
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