'use server'
import { prisma } from '@/prisma'


export async function deletePost(postId: number) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Delete all PostProduct entries related to this post
      await tx.postProduct.deleteMany({
        where: { postId: postId }
      })

      // Delete the post
      await tx.post.delete({
        where: { id: postId }
      })

      return { success: true, message: 'Post and related products deleted successfully' }
    })

    return result
  } catch (error) {
    console.error('Error deleting post:', error)
    return { success: false, message: 'Failed to delete post and related products' }
  } finally {
    await prisma.$disconnect()
  }
}


export async function deleteProductFromPost(postId: number, productId: number) {
    try {
      await prisma.postProduct.deleteMany({
        where: {
          AND: [
            { postId: postId },
            { productId: productId }
          ]
        }
      })
  
      return { success: true, message: 'Product removed from post successfully' }
    } catch (error) {
      console.error('Error removing product from post:', error)
      return { success: false, message: 'Failed to remove product from post' }
    } finally {
      await prisma.$disconnect()
    }
  }