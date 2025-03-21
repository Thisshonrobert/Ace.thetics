'use server'
import { prisma } from '@/prisma'

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
      try {
        const revalidateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate?secret=${process.env.REVALIDATION_SECRET}`, {
          method: 'POST',
        });
   
        if (!revalidateResponse.ok) {
          const errorData = await revalidateResponse.json();
          console.error('Revalidation failed:', errorData);
        }
      } catch (error) {
        console.error('Error during revalidation fetch:', error);
      }
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