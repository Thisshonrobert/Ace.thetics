'use server'
import { prisma } from "@/prisma";

export default async function GetCelebrity(name: string) {
    try {
        // Trim the name and replace multiple spaces with a single space
        const formattedName = name.trim().replace(/\s+/g, ' ');

        

        const celebrity = await prisma.celebrity.findFirst({
            where: {
                name: {
                    contains: formattedName,
                    mode: 'insensitive'
                }
            }
        });

        if (!celebrity) {
            console.log(`No celebrity found with name: ${formattedName}`);
            return [];
        }

        const celebrityPosts = await prisma.post.findMany({
            where: {
                celebrityId: celebrity.id,
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
      
        return celebrityPosts.map((post) => ({
            id: post.id,
            celebrityImages: post.imageUrl,
            celebrityName: post.Celebrity.name,
            celebrityDp: post.Celebrity.dp,
            celebritySocialMedia: post.Celebrity.socialmediaId,
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
    } catch (e) {
        console.error("Error in GetCelebrity:", e);
        return [];
    }
}