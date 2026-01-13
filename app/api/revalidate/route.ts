import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import '../metrics/metrics'

export async function POST(request: NextRequest) {
  const routeLabel = '/api/revalidate'
  
  
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.REVALIDATION_SECRET) {
    const res = NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  
    return res;
  }

 
  revalidatePath('/'); // Revalidate the homepage
//   revalidatePath('/some-other-page'); // Revalidate other pages if needed

  
  const res = NextResponse.json({ revalidated: true });
  
  return res;
}