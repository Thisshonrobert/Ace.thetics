import { prisma } from '@/prisma'
import { NextResponse } from 'next/server'
import { withMetrics } from '../metrics/wrapper'

async function getHandler(req: Request) {
  try {
    const celebrities = await prisma.celebrity.findMany({
      select: {
        id: true,
        name: true,
        dp: true
      }
    })
    return NextResponse.json(celebrities)
  } catch (error) {
    console.error('Error fetching celebrities:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export const GET = withMetrics(getHandler, '/api/celebrities');
