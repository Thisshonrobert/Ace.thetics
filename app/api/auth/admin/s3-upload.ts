import AWS from 'aws-sdk'
import sharp from 'sharp'

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

const s3 = new AWS.S3()

export async function uploadToS3(file: File, type: 'celeb' | 'product' | 'dp'): Promise<string> {
  const buffer = await file.arrayBuffer()
  let compressedBuffer: Buffer

  if (type === 'dp') {
    compressedBuffer = await sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer()
  } else {
    compressedBuffer = await sharp(buffer)
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `${type}/${Date.now()}-${file.name}`,
    Body: compressedBuffer,
    ContentType: file.type,
  }

  const { Location } = await s3.upload(params).promise()
  return Location
}