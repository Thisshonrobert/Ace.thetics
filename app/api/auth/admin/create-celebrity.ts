import { prisma } from '@/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, socialId, dpImage, celebImages, products } = req.body

  if (!name || !socialId || !dpImage || !celebImages || !products) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    const celebrity = await prisma.celebrity.create({
      data: {
        name,
        socialmediaId: socialId,
        dp: dpImage,
      },
    })

    const post = await prisma.post.create({
      data: {
        celebrityId: celebrity.id,
        imageUrl: celebImages[0], // Assuming the first image is the main post image
        Liked: false, // Set the initial Liked status to false
        products: {
          create: products.map((product: any) => ({
            Product: {
              create: {
                brandname: product.brandName,
                seoname: product.seoName,
                category: product.category,
                whishList: false, // Set initial wishlist status to false
                shop: product.shop,
                link: product.link,
                imageUrl: product.imageUrl,
              },
            },
          })),
        },
      },
      include: {
        products: {
          include: {
            Product: true,
          },
        },
      },
    })

    res.status(201).json({ celebrity, post })
  } catch (error) {
    console.error('Error creating celebrity:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}