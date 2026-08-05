import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/auth';
import { Gender, Profession } from '@prisma/client';
import { withMetrics } from '../../metrics/wrapper';
import { sanitizeUrl } from '@/constants/taxonomy';

const CELEBRITY_FIELDS = {
  id: true,
  name: true,
  profession: true,
  gender: true,
  dp: true,
  socialmediaId: true,
  country: true,
} as const;

async function getHandler(
  request: Request,
  { params }: { params: { celebrityId: string } }
) {
  try {
    const celebrityId = parseInt(params.celebrityId);
    if (isNaN(celebrityId)) {
      return NextResponse.json({ error: 'Invalid celebrity ID' }, { status: 400 });
    }

    const celebrity = await prisma.celebrity.findUnique({
      where: { id: celebrityId },
      select: CELEBRITY_FIELDS,
    });

    if (!celebrity) {
      return NextResponse.json({ error: 'Celebrity not found' }, { status: 404 });
    }

    return NextResponse.json(celebrity);
  } catch (error) {
    console.error('Error fetching celebrity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function putHandler(
  request: Request,
  { params }: { params: { celebrityId: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const celebrityId = parseInt(params.celebrityId);
    if (isNaN(celebrityId)) {
      return NextResponse.json({ error: 'Invalid celebrity ID' }, { status: 400 });
    }

    const { name, profession, gender, dp, socialmediaId, country } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (profession && !Object.values(Profession).includes(profession)) {
      return NextResponse.json({ error: `Unknown profession: ${profession}` }, { status: 400 });
    }
    if (gender && !Object.values(Gender).includes(gender)) {
      return NextResponse.json({ error: `Unknown gender: ${gender}` }, { status: 400 });
    }

    const existing = await prisma.celebrity.findUnique({
      where: { id: celebrityId },
      select: { name: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Celebrity not found' }, { status: 404 });
    }

    const updatedCelebrity = await prisma.celebrity.update({
      where: { id: celebrityId },
      data: {
        name: name.trim(),
        profession: profession || null,
        gender: gender || null,
        country: country || null,
        // `dp` and `socialmediaId` are non-nullable in the schema, so only
        // write them when the client actually sent a value. Previously they
        // were destructured but never persisted, which is why profile picture
        // edits silently did nothing.
        ...(dp ? { dp } : {}),
        ...(socialmediaId ? { socialmediaId: sanitizeUrl(socialmediaId) } : {}),
      },
      select: CELEBRITY_FIELDS,
    });

    revalidatePath('/');
    revalidatePath(`/celebrity/${encodeURIComponent(existing.name)}`);
    if (updatedCelebrity.name !== existing.name) {
      revalidatePath(`/celebrity/${encodeURIComponent(updatedCelebrity.name)}`);
    }

    return NextResponse.json({
      message: 'Celebrity updated successfully',
      celebrity: updatedCelebrity,
    });
  } catch (error) {
    console.error('Error updating celebrity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withMetrics(getHandler, '/api/celebrities/[celebrityId]');
export const PUT = withMetrics(putHandler, '/api/celebrities/[celebrityId]');
