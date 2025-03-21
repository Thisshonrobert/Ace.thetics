import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { isAdmin } from '@/auth';

interface ProductInput {
  brandName: string;
  seoName: string;
  category: string;
  shop: string;
  link: string;
  imageUrl: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { 
      name, 
      socialId, 
      dpImage, 
      gender, 
      profession,
      country,
      celebImages, 
      products 
    } = await req.json();

    if (!name || !celebImages || !products || !Array.isArray(celebImages) || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Missing required fields or invalid format' }, { status: 400 });
    }

    let celebrity = await prisma.celebrity.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (celebrity) {
      celebrity = await prisma.celebrity.update({
        where: { id: celebrity.id },
        data: { 
          name,
          dp: dpImage,
          gender: gender as 'men' | 'women' | 'kids' | null,
          profession: profession || null,
          country: country || null,
        },
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
          gender: gender as 'men' | 'women' | 'kids' | null,
          profession: profession || null,
          country: country || null,
        },
      });
    }

    const post = await prisma.post.create({
      data: {
        celebrityId: celebrity.id,
        imageUrl: celebImages,
        products: {
          create: products.map((product: ProductInput) => ({
            Product: {
              create: {
                brandname: product.brandName,
                seoname: product.seoName,
                category: product.category,
                shop: product.shop,
                link: product.link,
                imageUrl: product.imageUrl,
                description: product.description || "Elevate your style, embrace the trend!",
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
    
    return NextResponse.json({ celebrity, post }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating/updating celebrity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}