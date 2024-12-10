'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function searchCelebrities(query: string, country?: string, profession?: string) {
  if (query.length < 2 && !country && !profession) {
    return [];
  }

  const whereClause: any = {
    AND: []
  };

  if (query.length >= 2) {
    whereClause.AND.push({
      name: {
        contains: query,
        mode: 'insensitive',
      }
    });
  }

  if (country) {
    whereClause.AND.push({
      country: {
        equals: country,
        mode: 'insensitive'
      }
    });
  }

  if (profession) {
    whereClause.AND.push({
      profession: profession
    });
  }

  const celebrities = await prisma.celebrity.findMany({
    where: whereClause.AND.length > 0 ? whereClause : undefined,
    take: 5,
    select: {
      id: true,
      name: true,
      dp: true,
    },
  });

  return celebrities;
}