import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/app/utils/s3-upload';
import { isAdmin } from '@/auth';

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || !['celeb', 'product', 'dp'].includes(type)) {
      return NextResponse.json({ error: 'Invalid or missing type' }, { status: 400 });
    }

    const s3Url = await uploadToS3(file, type as 'celeb' | 'product' | 'dp');
    return NextResponse.json({ url: s3Url });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return NextResponse.json({ error: 'Error uploading file', details: (error as Error).message }, { status: 500 });
  }
}