'use server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function deleteCelebrity(celebrityId: number) {
  try {
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find all posts by the celebrity
      const posts = await tx.post.findMany({
        where: { celebrityId: celebrityId },
        select: { id: true }
      })

      // Delete all PostProduct entries related to these posts
      await tx.postProduct.deleteMany({
        where: {
          postId: { in: posts.map(post => post.id) }
        }
      })

      // Delete all posts by the celebrity
      await tx.post.deleteMany({
        where: { celebrityId: celebrityId }
      })

      // Delete the celebrity
      await tx.celebrity.delete({
        where: { id: celebrityId }
      })

      return { success: true, message: 'Celebrity and related data deleted successfully' }
    })

    return result
  } catch (error) {
    console.error('Error deleting celebrity:', error)
    return { success: false, message: 'Failed to delete celebrity and related data' }
  } finally {
    await prisma.$disconnect()
  }
}