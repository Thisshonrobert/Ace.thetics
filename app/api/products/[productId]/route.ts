import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { productId: string } }) {
  try {
    const productId = parseInt(params.productId);
    const { brandname, seoname, imageUrl, link, description } = await request.json();

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        brandname,
        seoname,
        imageUrl,
        link,
        description,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 