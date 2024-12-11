import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { isAdmin } from '@/auth';

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const name = req.nextUrl.searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    const celebrity = await prisma.celebrity.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (celebrity) {
        return NextResponse.json({ exists: true, message: 'Celebrity exists' });
    } else {
        return NextResponse.json({ exists: false, message: 'Celebrity does not exist' });
    }
  } catch (error) {
    console.error('Error checking celebrity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }finally {
    await prisma.$disconnect();
  }
}