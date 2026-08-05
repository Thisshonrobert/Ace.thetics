import { NextRequest, NextResponse } from 'next/server';
import ImageKit from "imagekit";
import { isAdmin } from '@/auth';
import { withMetrics } from '../metrics/wrapper';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!
});

const MAX_FILE_BYTES = 10 * 1024 * 1024; // ImageKit's free-tier per-file ceiling
const ALLOWED_FOLDERS = ['/dp', '/celebrities', '/products'];

async function postHandler(request: NextRequest) {
  // This endpoint burns the site's ImageKit quota, so it must not be open to
  // anonymous callers.
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('file');
    const folder = (formData.get('folder') as string) || '/';

    if (files.length === 0) {
      return NextResponse.json({ error: 'Files are required' }, { status: 400 });
    }
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: `Unsupported folder: ${folder}` }, { status: 400 });
    }

    const uploadPromises = files.map(async (file: any) => {
      if (!(file instanceof File)) {
        throw new Error('Invalid file type');
      }
      if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} is not an image`);
      }
      if (file.size > MAX_FILE_BYTES) {
        throw new Error(`${file.name} is larger than 10MB`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      return imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder,
        useUniqueFileName: true,
      });
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error uploading to ImageKit:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload images' },
      { status: 500 }
    );
  }
}

export const POST = withMetrics(postHandler, '/api/imagekit-upload');