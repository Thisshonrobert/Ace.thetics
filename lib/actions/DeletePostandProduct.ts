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
    return result
  } catch (error) {
    console.error('Error deleting post:', error)
    return { success: false, message: 'Failed to delete post and related products' }
  } finally {
    await prisma.$disconnect()
  }
}
export async function deleteProductFromPost(postId: number, productId: number, deleteOrphanedProduct: boolean = false) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Remove the association between the post and the product
      await tx.postProduct.deleteMany({
        where: {
          AND: [
            { postId: postId },
            { productId: productId }
          ]
        }
      });

      if (deleteOrphanedProduct) {
        // Check if the product is associated with any other posts
        const productAssociations = await tx.postProduct.findMany({
          where: { productId: productId }
        });

        // If the product is not associated with any other posts, delete it
        if (productAssociations.length === 0) {
          await tx.product.delete({
            where: { id: productId }
          });
          return { success: true, message: 'Product removed from post and deleted successfully' };
        }
      }

      return { success: true, message: 'Product removed from post successfully' };
    });
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

    return result;
  } catch (error) {
    console.error('Error removing product from post:', error);
    return { success: false, message: 'Failed to remove product from post' };
  } finally {
    await prisma.$disconnect();
  }
}