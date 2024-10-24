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

  revalidatePath('/') // Adjust this path as needed

  return { success: true, wishlisted: !userWishlisted }
}