'use server'

import { prisma } from "@/prisma";
import { Product } from "./GetProduct";

export async function GetShopItems(shopname: string,productId:number): Promise<Product[]> {
    try {
       

        const shopItems = await prisma.product.findMany({
            where:{
                shop:shopname
            } ,
            take: 10,
            orderBy: { id: 'desc' }, 
        });
        const filteredShopItems = shopItems.filter((product)=>product.id!==productId)
        return filteredShopItems.map(item => ({
            ...item,
            image: item.imageUrl,
        }));
    } catch (error) {
        console.error("Failed to fetch shop brand items:", error);
        return [];
    }
}
export async function GetCategoryItems( category: string,productId:number): Promise<Product[]> {
    try {
       

        const categoryItems = await prisma.product.findMany({
            where:{
                category:category
            } ,
            take: 10,
            orderBy: { id: 'desc' }, 
        });
        const filteredCategoryItems = categoryItems.filter((product)=>product.id!==productId)
        return filteredCategoryItems.map(item => ({
            ...item,
            image: item.imageUrl,
        }));
    } catch (error) {
        console.error("Failed to fetch shop brand items:", error);
        return [];
    }

}