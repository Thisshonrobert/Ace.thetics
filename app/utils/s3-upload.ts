import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import formidable from "formidable";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: formidable.File, type: 'celeb' | 'product' | 'dp'): Promise<string> {
  const fileContent = fs.readFileSync(file.filepath);
  const fileExtension = file.originalFilename?.split('.').pop() || 'jpg';
  const key = `${type}/${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: fileContent,
    ContentType: file.mimetype!,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}