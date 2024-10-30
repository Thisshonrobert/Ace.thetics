import { NextRequest, NextResponse } from 'next/server';
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!
});

export async function POST(request: NextRequest) {
  console.log('Starting image upload process');
  try {
    const formData = await request.formData();
    const files = formData.getAll('file'); // Changed from get to getAll
    const folder = formData.get('folder') as string || '/';

    if (!files || files.length === 0) {
      console.log('No files received');
      return NextResponse.json({ error: 'Files are required' }, { status: 400 });
    }

    console.log(`Processing ${files.length} files for upload`);
    
    // Handle multiple files
    const uploadPromises = files.map(async (file: any) => {
      if (!(file instanceof File)) {
        throw new Error('Invalid file type');
      }

      // Convert File to Buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      console.log(`Uploading file: ${file.name}`);
      
      // Upload to ImageKit using the SDK
      const result = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: folder,
        useUniqueFileName: true,
      });

      console.log(`Successfully uploaded: ${file.name}`);
      return result;
    });

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    console.log('All files uploaded successfully');

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error uploading to ImageKit:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}