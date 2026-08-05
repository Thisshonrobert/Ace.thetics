'use server'

import { prisma } from "@/prisma";
import { Product } from "./GetProduct";

/** Shape shared by every "related products" query below. */
const RELATED_INCLUDE = {
    wishList: { select: { id: true } },
} as const;

const toProduct = (item: any): Product => ({
    id: item.id,
    category: item.category,
    brandname: item.brandname,
    seoname: item.seoname,
    shop: item.shop,
    imageUrl: item.imageUrl,
    link: item.link,
    description: item.description,
    wishList: item.wishList.map((wl: { id: string }) => ({ id: wl.id })),
});

/**
 * Other products from the same brand — the first related row on the product
 * page, mirroring the reference layout's "More from <Brand>".
 */
export async function GetBrandItems(brandname: string, productId: number): Promise<Product[]> {
    try {
        const items = await prisma.product.findMany({
            where: {
                brandname: { equals: brandname, mode: 'insensitive' },
                NOT: { id: productId },
            },
            include: RELATED_INCLUDE,
            take: 10,
            orderBy: { id: 'desc' },
        });
        return items.map(toProduct);
    } catch (error) {
        console.error("Failed to fetch brand items:", error);
        return [];
    }
}

export interface ProductWearer {
    postId: number;
    celebrityName: string;
    celebrityDp: string;
    postImage: string;
    postDate: string;
}

/**
 * Which celebrities have been posted wearing this product. The reference site
 * links each item back to the outfit it came from; we have the same relation
 * through PostProduct but the page never surfaced it.
 */
export async function GetProductWearers(productId: number): Promise<ProductWearer[]> {
    try {
        const links = await prisma.postProduct.findMany({
            where: { productId },
            select: {
                Post: {
                    select: {
                        id: true,
                        imageUrl: true,
                        date: true,
                        Celebrity: { select: { name: true, dp: true } },
                    },
                },
            },
            take: 12,
        });

        return links
            .filter((link) => link.Post?.imageUrl?.length)
            .map((link) => ({
                postId: link.Post.id,
                celebrityName: link.Post.Celebrity.name,
                celebrityDp: link.Post.Celebrity.dp,
                postImage: link.Post.imageUrl[0],
                postDate: link.Post.date.toISOString(),
            }))
            .sort((a, b) => +new Date(b.postDate) - +new Date(a.postDate));
    } catch (error) {
        console.error("Failed to fetch product wearers:", error);
        return [];
    }
}

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