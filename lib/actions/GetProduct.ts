'use server'
import { prisma } from "@/prisma";

export async function GetProduct(productid: number): Promise<{ 
  id: number;
  category: string;
  brandname: string;
  seoname: string;
  shop: string;
  image: string;
  link: string;
} | string> {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: productid
      }
    });

    if (!product) return "Product not found";

    return {
      id: product.id,
      category: product.category,
      brandname: product.brandname,
      seoname: product.seoname,
      shop: product.shop,
      image: product.imageUrl,
      link: product.link
    };

  } catch (error) {
    console.log(error)
    return "failed to fetch product";
  }
}
