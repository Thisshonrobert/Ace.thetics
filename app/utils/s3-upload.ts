import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File, type: 'celeb' | 'product' | 'dp'): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `${type}/${uuidv4()}.${fileExtension}`;

  let compressedBuffer: Buffer;
  let contentType: string;

  if (['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension)) {
    // Image compression settings
    const compressionOptions = {
      jpeg: { quality: 80 },
      png: { compressionLevel: 8 },
      webp: { quality: 80 }
    };

    try {
      let sharpInstance = sharp(Buffer.from(fileBuffer));

      // Resize large images
      const metadata = await sharpInstance.metadata();
      if (metadata.width && metadata.width > 2000) {
        sharpInstance = sharpInstance.resize({ width: 2000, withoutEnlargement: true });
      }

      // Compress based on file type
      if (fileExtension === 'png') {
        compressedBuffer = await sharpInstance.png(compressionOptions.png).toBuffer();
      } else if (fileExtension === 'webp') {
        compressedBuffer = await sharpInstance.webp(compressionOptions.webp).toBuffer();
      } else {
        compressedBuffer = await sharpInstance.jpeg(compressionOptions.jpeg).toBuffer();
      }

      contentType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error(`Failed to compress image: ${(error as Error).message}`);
    }
  } else {
    
    compressedBuffer = Buffer.from(fileBuffer);
    contentType = file.type;
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: compressedBuffer,
    ContentType: contentType,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return key; // Just return the key, not the full S3 URL
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload file to S3: ${(error as Error).message}`);
  }
}