import { prisma } from '@/prisma'
import { NextApiRequest, NextApiResponse } from 'next'



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name } = req.query

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Name is required' })
  }

  try {
    const celebrity = await prisma.celebrity.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    })

    res.status(200).json({ exists: !!celebrity })
  } catch (error) {
    console.error('Error checking celebrity:', error)
    res.status(500).json({ message: 'Internal server error' })
  } 
}