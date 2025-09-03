import { prisma } from '@/prisma'
import { NextResponse } from 'next/server'
import { withMetrics } from '../metrics/middlewareMetrics'

async function handler(req: Request) {
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

// Apply metrics (counter + histogram + gauge)
export const GET = withMetrics(handler, '/api/celebrities', {
  counter: true,
  histogram: true,
  gauge: true
});
