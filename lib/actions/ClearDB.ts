'use server'
import { prisma } from '@/prisma'

export async function ClearDB() {

    if (process.env.NODE_ENV !== 'development') {
        throw new Error('clearDB can only be run in development or testing environments.');
      }
    
  try {
    // Start a transaction to ensure all deletions are atomic
    await prisma.$transaction([
      prisma.user.deleteMany(), 
      prisma.post.deleteMany(),
      prisma.product.deleteMany(),
      prisma.celebrity.deleteMany(),
      prisma.postProduct.deleteMany(),
      
    ]);
    console.log('Database cleared successfully.');
  } catch (error) {
    console.error('Error clearing the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}