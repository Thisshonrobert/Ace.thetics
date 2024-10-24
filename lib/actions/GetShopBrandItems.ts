'use server'

import { prisma } from "@/prisma";
import { Product } from "./GetProduct";
import { auth } from "@/auth";

export async function GetShopBrandItems(shopname: string, brandname: string): Promise<Product[]> {
    const session = await auth();
    const userId = session?.user?.id;
    try {
        const whereClause = brandname 
            ? { shop: shopname, brandname: brandname }
            : { shop: shopname };

        const shopBrandItems = await prisma.product.findMany({
            where: whereClause,
            take: 10,
            orderBy: { id: 'desc' },
            // include: {
            //     wishList: true
            // }
        });

        return shopBrandItems.map(item => ({
            ...item,
            image: item.imageUrl,
            // isWishlisted: userId ? item.wishList.some(user => user.id === userId) : false
        }));
    } catch (error) {
        console.error("Failed to fetch shop brand items:", error);
        return [];
    }
}