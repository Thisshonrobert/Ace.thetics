import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { isAdmin } from '@/auth';
import axios from 'axios';
import { revalidatePath } from 'next/cache';
import { withMetrics } from '../../metrics/wrapper';

interface ProductInput {
  brandName: string;
  seoName: string;
  category: string;
  shop: string;
  link: string;
  imageUrl: string;
  description?: string;
}

async function postHandler(req: NextRequest) {
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

    if (!name || !Array.isArray(celebImages) || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Missing required fields or invalid format' }, { status: 400 });
    }

    // The client used to send `[celebImageUrls]`, which nested an array inside
    // an array whenever more than one image was picked and made Prisma reject
    // the whole post. Assert the flat shape rather than failing deeper down.
    if (celebImages.length === 0 || celebImages.some((url) => typeof url !== 'string')) {
      return NextResponse.json(
        { error: 'celebImages must be a non-empty array of image URLs' },
        { status: 400 }
      );
    }
    if (products.length === 0) {
      return NextResponse.json({ error: 'At least one product is required' }, { status: 400 });
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
    // The webhook URL and Telegram bot token used to be hardcoded here, which
    // means they are in git history and should be rotated. They now come from
    // the environment, and the notification is skipped when unconfigured.
    const zapWebhookUrl = process.env.ZAP_WEBHOOK_URL;
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChannel = process.env.TELEGRAM_CHANNEL || 'acetheticsupdates';

    if (zapWebhookUrl && telegramBotToken) {
      try {
        await axios.post(
          zapWebhookUrl,
          {
            channelUserName: telegramChannel,
            botToken: telegramBotToken,
            message: `New celebrity added: ${celebrity.name}. Check it out at ${process.env.NEXT_PUBLIC_APP_URL}/celebrity/${encodeURIComponent(celebrity.name)}`,
          },
          { headers: { 'X-ZAP-SECRET': process.env.ZAP_SECRET ?? '' } }
        );
      } catch (error) {
        console.error('Error sending Telegram notification via zap:', error);
      }
    }
    // Revalidate the homepage cache server-side. Prefer direct `revalidatePath` so
    // we don't rely on an external URL or public env var. If it fails, fall back
    // to the existing fetch-based revalidation (keeps backwards compatibility).
    try {
      revalidatePath('/');
    } catch (err) {
      console.error('revalidatePath failed, attempting fallback revalidation fetch:', err);
      try {
        const revalidateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate?secret=${process.env.REVALIDATION_SECRET}`, {
          method: 'POST',
        });

        if (!revalidateResponse.ok) {
          const errorData = await revalidateResponse.json().catch(() => null);
          console.error('Fallback revalidation fetch failed:', revalidateResponse.status, errorData);
        }
      } catch (error) {
        console.error('Error during fallback revalidation fetch:', error);
      }
    }

    return NextResponse.json({ celebrity, post }, { status: 201 });

  } catch (error) {
    console.error('Error creating/updating celebrity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withMetrics(postHandler, '/api/admin/create-celebrity');