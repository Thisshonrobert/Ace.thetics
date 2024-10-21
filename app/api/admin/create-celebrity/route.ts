import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { isAdmin } from '@/auth';

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, socialId, dpImage, celebImages, products } = await req.json();

  if (!name || !celebImages || !products || !Array.isArray(celebImages)) {
    return NextResponse.json({ error: 'Missing required fields or invalid format' }, { status: 400 });
  }

  try {
    let celebrity = await prisma.celebrity.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (celebrity) {
      celebrity = await prisma.celebrity.update({
        where: { id: celebrity.id },
        data: { name },
      });
    } else {
      if (!socialId || !dpImage) {
        return NextResponse.json({ error: 'Missing required fields for new celebrity' }, { status: 400 });
      }
      celebrity = await prisma.celebrity.create({
        data: {
          name,
          socialmediaId: socialId,
          dp: dpImage,
        },
      });
    }

    const post = await prisma.post.create({
      data: {
        celebrityId: celebrity.id,
        imageUrl: celebImages, // Now using the entire array of images
        Liked: false,
        products: {
          create: products.map((product: any) => ({
            Product: {
              create: {
                brandname: product.brandName,
                seoname: product.seoName,
                category: product.category,
                whishList: false,
                shop: product.shop,
                link: product.link,
                imageUrl: product.imageUrl,
              },
            },
          })),
        },
      },
      include: {
        products: {
          include: {
            Product: true,
          },
        },
      },
    });

    return NextResponse.json({ celebrity, post }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating celebrity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}