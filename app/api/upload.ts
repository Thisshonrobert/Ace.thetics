import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { uploadToS3 } from '../utils/s3-upload'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const form = new formidable.IncomingForm()

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing form data' })
    }

    try {
      const file = Array.isArray(files.file) ? files.file[0] : files.file
      const type = fields.type

      if (!file) {
        return res.status(400).json({ message: 'No file provided' })
      }

      if (!type || (typeof type !== 'string') || !['celeb', 'product', 'dp'].includes(type)) {
        return res.status(400).json({ message: 'Invalid or missing type' })
      }

      const s3Url = await uploadToS3(file, type as 'celeb' | 'product' | 'dp')
      res.status(200).json({ url: s3Url })
    } catch (error) {
      console.error('Error uploading to S3:', error)
      res.status(500).json({ message: 'Error uploading file' })
    }
  })
}