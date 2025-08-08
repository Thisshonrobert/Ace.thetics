'use server'
import { prisma } from '@/prisma'

export async function deleteCelebrity(celebrityId: number) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Delete the celebrity. Due to onDelete: Cascade on Post.Celebrity and PostProduct.Post,
      // this removes the celebrity's posts and their join rows automatically.
      await tx.celebrity.delete({ where: { id: celebrityId } })

      // Cleanup: delete any products that are no longer associated with any posts
      await tx.product.deleteMany({
        where: { PostProduct: { none: {} } },
      })

      try {
        const revalidateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate?secret=${process.env.REVALIDATION_SECRET}`, {
          method: 'POST',
        })

        if (!revalidateResponse.ok) {
          const errorData = await revalidateResponse.json()
          console.error('Revalidation failed:', errorData)
        }
      } catch (error) {
        console.error('Error during revalidation fetch:', error)
      }

      return { success: true, message: 'Celebrity and related data deleted successfully' }
    }, { timeout: 15000 })

    return result
  } catch (error) {
    console.error('Error deleting celebrity:', error)
    return { success: false, message: 'Failed to delete celebrity and related data' }
  } 
}