'use server'

import { prisma } from '@/prisma'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/auth'

export async function deleteCelebrity(celebrityId: number) {
  if (!(await isAdmin())) {
    return { success: false, message: 'Unauthorized' }
  }

  try {
    const celebrity = await prisma.celebrity.findUnique({
      where: { id: celebrityId },
      select: { name: true },
    })
    if (!celebrity) {
      return { success: false, message: 'Celebrity not found' }
    }

    await prisma.$transaction(async (tx) => {
      // Post.Celebrity and PostProduct.Post both cascade, so deleting the
      // celebrity takes their posts and join rows with it.
      await tx.celebrity.delete({ where: { id: celebrityId } })

      // Then sweep up products that are no longer on any post.
      await tx.product.deleteMany({ where: { PostProduct: { none: {} } } })
    }, { timeout: 15000 })

    // Revalidation moved out of the transaction: it used to be an awaited
    // `fetch` to /api/revalidate *inside* the transaction, holding a database
    // transaction open for the duration of a network round-trip.
    revalidatePath('/')
    revalidatePath(`/celebrity/${encodeURIComponent(celebrity.name)}`)

    return { success: true, message: 'Celebrity and related data deleted successfully' }
  } catch (error) {
    console.error('Error deleting celebrity:', error)
    return { success: false, message: 'Failed to delete celebrity and related data' }
  }
}
