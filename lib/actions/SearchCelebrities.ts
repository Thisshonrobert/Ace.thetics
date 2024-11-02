'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function searchCelebrities(query: string) {
  if (query.length < 2) {
    return []
  }

  const celebrities = await prisma.celebrity.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    take: 5,
    select: {
      id: true,
      name: true,
      dp: true,
    },
  })

  return celebrities
}