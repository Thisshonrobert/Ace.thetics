'use server'

import { prisma } from "@/prisma";
import { Product } from "./GetProduct";

export async function GetShopBrandItems(shopname: string, brandname: string): Promise<Product[]> {
    try {
        const whereClause = brandname 
            ? { shop: shopname, brandname: brandname }
            : { shop: shopname };

        const shopBrandItems = await prisma.product.findMany({
            where: whereClause,
            take: 10,
            orderBy: { id: 'desc' },
        });

        return shopBrandItems.map(item => ({
            ...item,
            image: item.imageUrl,
        }));
    } catch (error) {
        console.error("Failed to fetch shop brand items:", error);
        return [];
    }
}