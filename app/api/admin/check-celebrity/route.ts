import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { isAdmin } from '@/auth';
import { withMetrics } from '../../metrics/wrapper';

export const dynamic = 'force-dynamic';

async function getHandler(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const name = req.nextUrl.searchParams.get('name');
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const celebrity = await prisma.celebrity.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    console.log(celebrity ? 'exists' : 'does not exist');
    return NextResponse.json({ exists: !!celebrity });
  } catch (error) {
    console.error('Error checking celebrity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withMetrics(getHandler, '/api/admin/check-celebrity');
