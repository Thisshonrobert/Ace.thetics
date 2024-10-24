'use server'

import { prisma } from "@/prisma";

export interface Product {
  id: number;
  category: string;
  brandname: string;
  seoname: string;
  shop: string;
  imageUrl: string;
  link: string;
  description: string;
  wishList?:boolean
}

export async function GetProduct(productid: number): Promise<Product | null> {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: productid
      }
    });

    if (!product) return null;

    return {
      id: product.id,
      category: product.category,
      brandname: product.brandname,
      seoname: product.seoname,
      shop: product.shop,
      imageUrl: product.imageUrl,
      link: product.link,
      description: product.description,
     
    };

  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}