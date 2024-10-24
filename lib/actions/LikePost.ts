'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/prisma'
import { auth } from '@/auth'

export async function likePost(postId: number) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error('You must be logged in to like a post')
  }

  const userId = session.user.id
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { Liked: true }
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