'use server'

import { prisma } from "@/prisma";

export type Celebrity = {
  id: number;
  name: string;
  image: string;
};

export default async function GetRecentCelebrity(): Promise<Celebrity[]> {
    try {
        const recentCelebrities = await prisma.celebrity.findMany({
            take: 6,
            orderBy: { id: 'desc' },  
        });
    
        return recentCelebrities.map((celeb) => ({
            id: celeb.id,
            name: celeb.name,
            image: celeb.dp
        }));
        
    } catch (error) {
        console.error("Failed to Get Recent Celebrities:", error);
        return []; 
    }
}