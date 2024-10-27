'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/prisma'
import { auth } from '@/auth'
import { LikedPost } from '@/app/store/likedPostAtom'

export async function likePost(postId: number) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error('You must be logged in to like a post')
  }

  const userId = session.user.id;
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { Liked: true, Celebrity: true, products: { include: { Product: true } } }
  })

  if (!post) {
    throw new Error('Post not found')
  }

  const userLiked = post.Liked.some(user => user.id === userId)

  if (userLiked) {
    await prisma.post.update({
      where: { id: postId },
      data: {
        Liked: {
          disconnect: { id: userId }
        }
      }
    })
  } else {
    await prisma.post.update({
      where: { id: postId },
      data: {
        Liked: {
          connect: { id: userId }
        }
      }
    })
  }

  revalidatePath('/') // Adjust this path as needed

  return { success: true, liked: !userLiked }
}

export async function GetAllLikedPosts(): Promise<LikedPost[]> {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error('You must be logged in to fetch liked posts')
  }
  const userId = session.user.id;
  const likedPosts = await prisma.post.findMany({
    where: { Liked: { some: { id: userId } } },
    include: {
      Celebrity: true,
      products: {
        include: {
          Product: true
        }
      }
    }
  })
  if (!likedPosts) {
    throw new Error('No liked posts found')
  }
  return likedPosts.map(post => ({
    id: post.id,
    celebrityImages: post.imageUrl,
    celebrityDp: post.Celebrity.dp,
    celebrityName: post.Celebrity.name,
    postDate: post.date.toISOString(),
    products: post.products.map(pp => ({
      id: pp.Product.id,
      brandname: pp.Product.brandname,
      seoname: pp.Product.seoname,
      shop: pp.Product.shop,
      image: pp.Product.imageUrl
    }))
  }))
}