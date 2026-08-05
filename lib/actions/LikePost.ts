'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/prisma'
import { auth } from '@/auth'
import { LikedPost } from '@/app/store/likedPostAtom'

export type LikeResult =
  | { success: true; liked: boolean; likeCount: number }
  | { success: false; reason: 'unauthenticated' | 'not-found' | 'error' }

/**
 * Toggles the like for the current user.
 *
 * Returns a discriminated result rather than throwing: the caller needs to tell
 * "you are signed out, here is a sign-in prompt" apart from "something broke",
 * and a thrown server-action error surfaces to the client as an opaque digest
 * in production, so the old code showed "Please sign in" for genuine failures
 * too.
 */
export async function likePost(postId: number): Promise<LikeResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, reason: 'unauthenticated' }
  }

  const userId = session.user.id

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likeCount: true,
        Celebrity: { select: { name: true } },
        Liked: { where: { id: userId }, select: { id: true } },
      },
    })

    if (!post) {
      return { success: false, reason: 'not-found' }
    }

    const alreadyLiked = post.Liked.length > 0

    // `likeCount` is denormalised, so it has to move with the relation.
    // Previously it was never written, which is why every post read 0 likes.
    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        Liked: alreadyLiked ? { disconnect: { id: userId } } : { connect: { id: userId } },
        likeCount: alreadyLiked ? { decrement: 1 } : { increment: 1 },
      },
      select: { likeCount: true },
    })

    revalidatePath('/liked')
    revalidatePath(`/celebrity/${encodeURIComponent(post.Celebrity.name)}`)

    return {
      success: true,
      liked: !alreadyLiked,
      likeCount: Math.max(0, updated.likeCount),
    }
  } catch (error) {
    console.error('Failed to toggle like:', error)
    return { success: false, reason: 'error' }
  }
}

/**
 * Every post id the current user has liked. Fetched once per page so the feed
 * doesn't fire one `/api/posts/:id/like` request per rendered card.
 */
export async function getLikedPostIds(): Promise<number[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const liked = await prisma.post.findMany({
    where: { Liked: { some: { id: session.user.id } } },
    select: { id: true },
  })

  return liked.map((post) => post.id)
}

export async function GetAllLikedPosts(): Promise<LikedPost[]> {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const likedPosts = await prisma.post.findMany({
    where: { Liked: { some: { id: session.user.id } } },
    include: {
      Celebrity: true,
      products: { include: { Product: true } },
    },
    orderBy: { date: 'desc' },
  })

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
      image: pp.Product.imageUrl,
      category: pp.Product.category
    }))
  }))
}
