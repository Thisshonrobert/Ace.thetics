'use server'

import { Prisma } from '@prisma/client'
// Was `new PrismaClient()` at module scope, which opened a second connection
// pool alongside the shared client and leaked a new one on every HMR reload.
import { prisma } from '@/prisma'

export interface CelebritySearchResult {
  id: number
  name: string
  dp: string
}

export async function searchCelebrities(
  query: string,
  country?: string,
  profession?: string
): Promise<CelebritySearchResult[]> {
  const term = query.trim()
  const filters: Prisma.CelebrityWhereInput[] = []

  if (term.length >= 2) {
    filters.push({ name: { contains: term, mode: 'insensitive' } })
  }
  if (country) {
    filters.push({ country: { equals: country, mode: 'insensitive' } })
  }
  if (profession) {
    filters.push({ profession: profession as Prisma.CelebrityWhereInput['profession'] })
  }

  // With no term and no filters there is nothing to search for — the caller
  // shows the "recent celebrities" list instead.
  if (filters.length === 0) return []

  try {
    return await prisma.celebrity.findMany({
      where: { AND: filters },
      take: 12,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, dp: true },
    })
  } catch (error) {
    console.error('Failed to search celebrities:', error)
    return []
  }
}
