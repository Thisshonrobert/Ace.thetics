'use server'

import { prisma } from '@/prisma'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/auth'

/**
 * Server actions are publicly reachable endpoints — being imported only by an
 * admin page does not protect them. Both destructive actions below were
 * callable by anyone who knew the action id.
 */
const DENIED = { success: false as const, message: 'Unauthorized' }

export async function deletePost(postId: number) {
  if (!(await isAdmin())) return DENIED

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { Celebrity: { select: { name: true } } },
    })
    if (!post) {
      return { success: false, message: 'Post not found' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.postProduct.deleteMany({ where: { postId } })
      await tx.post.delete({ where: { id: postId } })
      // Products left attached to nothing would otherwise linger in the
      // catalogue and keep showing up in the "more from" rails.
      await tx.product.deleteMany({ where: { PostProduct: { none: {} } } })
    })

    revalidatePath('/')
    revalidatePath(`/celebrity/${encodeURIComponent(post.Celebrity.name)}`)

    return { success: true, message: 'Post and related products deleted successfully' }
  } catch (error) {
    console.error('Error deleting post:', error)
    return { success: false, message: 'Failed to delete post and related products' }
  }
  // No `prisma.$disconnect()` here: the client is a long-lived singleton, and
  // tearing down its pool after every request caused intermittent
  // "Engine is not yet connected" errors on the next call.
}

export async function deleteProductFromPost(
  postId: number,
  productId: number,
  deleteOrphanedProduct: boolean = false
) {
  if (!(await isAdmin())) return DENIED

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.postProduct.deleteMany({
        where: { postId, productId },
      })

      if (deleteOrphanedProduct) {
        const remaining = await tx.postProduct.count({ where: { productId } })
        if (remaining === 0) {
          await tx.product.delete({ where: { id: productId } })
          return { success: true, message: 'Product removed from post and deleted successfully' }
        }
      }

      return { success: true, message: 'Product removed from post successfully' }
    })

    // Direct revalidation instead of a self-`fetch` to /api/revalidate, which
    // depended on NEXT_PUBLIC_APP_URL and a shared secret being set correctly
    // and silently no-opped when they weren't.
    revalidatePath('/')
    revalidatePath(`/post/${postId}`)
    revalidatePath(`/product/${productId}`)

    return result
  } catch (error) {
    console.error('Error removing product from post:', error)
    return { success: false, message: 'Failed to remove product from post' }
  }
}
