import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

 
  revalidatePath('/'); // Revalidate the homepage
//   revalidatePath('/some-other-page'); // Revalidate other pages if needed

  
  return NextResponse.json({ revalidated: true });
}