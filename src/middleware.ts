// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register', '/forgot-password'];
const apiAuthRoutes = '/api/auth';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Token dari cookie NextAuth
  const token = request.cookies.get('next-auth.session-token') || 
                request.cookies.get('__Secure-next-auth.session-token');

  const isAuthenticated = !!token;
  const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(route + '/'));
  const isApiAuthRoute = path.startsWith(apiAuthRoutes);

  // Biarkan API auth selalu lewat
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Halaman publik: login, register, forgot-password
  if (isPublicRoute) {
    // Jika sudah login dan akses halaman login → redirect ke home
    if (isAuthenticated && path === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes: butuh login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/history/:path*',
    '/result/:path*',
    '/builder/:path*',
    '/ai-generate/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};