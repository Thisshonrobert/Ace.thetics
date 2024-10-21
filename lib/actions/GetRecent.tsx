'use server'

import { prisma } from "@/prisma";

export default async function GetRecentCelebrity() {
    const recentCelebrities = await prisma.celebrity.findMany({
        take: 6,
        orderBy: { id: 'desc' },  
    });

    return recentCelebrities.map((celeb) => ({
        id: celeb.id,
        name: celeb.name,
        image: celeb.dp
    }));
}
