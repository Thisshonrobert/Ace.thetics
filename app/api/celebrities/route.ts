import { prisma } from '@/prisma'
import { NextResponse } from 'next/server'


export async function GET() {
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
  } finally {
    await prisma.$disconnect()
  }
}