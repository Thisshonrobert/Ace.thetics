import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';
import { withMetrics } from '../../metrics/middlewareMetrics';

 async function getCelebrity(
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
      select: {
        id: true,
        name: true,
        profession: true,
        gender: true,
        
        country: true,
        // Only include fields that exist in your Prisma schema
      }
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

export async function updateCelebrity(
  request: Request,
  { params }: { params: { celebrityId: string } }
) {
  try {
    const celebrityId = parseInt(params.celebrityId);
    const { name, profession, gender, dp, country } = await request.json();

    if (isNaN(celebrityId)) {
      return NextResponse.json({ error: 'Invalid celebrity ID' }, { status: 400 });
    }

    const updatedCelebrity = await prisma.celebrity.update({
      where: { id: celebrityId },
      data: {
        name,
        profession,
        gender,
   
        country,
        // Only include fields that exist in your Prisma schema
      }
    });

    return NextResponse.json({
      message: 'Celebrity updated successfully',
      celebrity: updatedCelebrity
    });
  } catch (error) {
    console.error('Error updating celebrity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } 
} 

export const GET = withMetrics(getCelebrity, "/api/celebrities/[celebrityId]",{counter:true,histogram:true});                                                           
export const PUT = withMetrics(updateCelebrity, "/api/celebrities/[celebrityId]",{counter:true,histogram:true});