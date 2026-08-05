import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { isAdmin } from '@/auth';
import { withMetrics } from '../../metrics/wrapper';
import { sanitizeUrl } from '@/constants/taxonomy';

async function putHandler(request: Request, { params }: { params: { productId: string } }) {
  // This route rewrites a product's affiliate `link`. Without a guard, anyone
  // could repoint any product on the site at a URL of their choosing.
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const productId = parseInt(params.productId);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { brandname, seoname, imageUrl, link, description, category, shop } =
      await request.json();

    if (!brandname?.trim() || !imageUrl?.trim()) {
      return NextResponse.json(
        { error: 'Brand name and image are required' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        brandname: brandname.trim(),
        seoname: seoname?.trim() ?? '',
        imageUrl: imageUrl.trim(),
        link: sanitizeUrl(link ?? ''),
        description: description?.trim() || 'Elevate your style, embrace the trend!',
        ...(category !== undefined ? { category } : {}),
        ...(shop !== undefined ? { shop } : {}),
      },
    });

    revalidatePath('/');
    revalidatePath(`/product/${productId}`);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'That product image is already used by another product.' },
          { status: 409 }
        );
      }
    }
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const PUT = withMetrics(putHandler, '/api/products/[productId]');