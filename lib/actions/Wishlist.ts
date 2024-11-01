'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/prisma'
import { auth } from '@/auth'

export async function toggleWishlist(productId: number) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error('You must be logged in to wishlist a product')
  }

  const userId = session.user.id
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { wishList: true }
  })

  if (!product) {
    throw new Error('Product not found')
  }

  const userWishlisted = product.wishList.some(user => user.id === userId)

  if (userWishlisted) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        wishList: {
          disconnect: { id: userId }
        }
      }
    })
  } else {
    await prisma.product.update({
      where: { id: productId },
      data: {
        wishList: {
          connect: { id: userId }
        }
      }
    })
  }

  revalidatePath('/wishlist') // Adjust this path as needed

  return { success: true, wishlisted: !userWishlisted }
}

export async function GetAllWishlistedProduct() {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error('You must be logged in to view your wishlist')
  }

  const userId = session.user.id

  const wishlistedProducts = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      wishList: true
    }
  })

  return wishlistedProducts?.wishList || []
}