import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isAdmin } from './auth';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })
  const baseUrl = request.nextUrl.origin;
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const isAdminUser = await isAdmin(); // Use the `isAdmin` function

    if (!isAdminUser) {
      const signInUrl = new URL('/api/auth/signin', baseUrl);
      signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}