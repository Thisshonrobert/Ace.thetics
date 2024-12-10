import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ isLiked: false });
    }

    const postId = parseInt(params.postId);
    const userId = session.user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        Liked: {
          where: { id: userId },
        },
      },
    });

    const isLiked = (post?.Liked ?? []).length > 0;

    return NextResponse.json({ isLiked });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 