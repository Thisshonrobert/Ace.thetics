'use server'

import { prisma } from "@/prisma";
import { Product } from "./GetProduct";

export async function GetShopItems(shopname: string, productId: number): Promise<Product[]> {
    try {
        const shopItems = await prisma.product.findMany({
            where: {
                shop: shopname,
                NOT: {
                    id: productId
                }
            },
            include: {
                wishList: {
                  select: {
                    id: true
                  }
                }
              },
            take: 10,
            orderBy: { id: 'desc' },
        });

        return shopItems.map(item => ({
            id: item.id,
            category: item.category,
            brandname: item.brandname,
            seoname: item.seoname,
            shop: item.shop,
            imageUrl: item.imageUrl,
            link: item.link,
            description: item.description,
            wishList: item.wishList.map((wl) => ({ id: wl.id })),
        }));
    } catch (error) {
        console.error("Failed to fetch shop items:", error);
        return [];
    }
}

export async function GetCategoryItems(category: string, productId: number): Promise<Product[]> {
    try {
        const categoryItems = await prisma.product.findMany({
            where: {
                category: category,
                NOT: {
                    id: productId
                }
            },
            include: {
                wishList: {
                  select: {
                    id: true
                  }
                }
              },
            take: 10,
            orderBy: { id: 'desc' },
        });

        return categoryItems.map(item => ({
            id: item.id,
            category: item.category,
            brandname: item.brandname,
            seoname: item.seoname,
            shop: item.shop,
            imageUrl: item.imageUrl,
            link: item.link,
            description: item.description,
            wishList: item.wishList.map((wl) => ({ id: wl.id })),
        }));
    } catch (error) {
        console.error("Failed to fetch category items:", error);
        return [];
    }
}