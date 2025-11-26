import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fractured-survival-secret-key-change-me';
const secret = new TextEncoder().encode(JWT_SECRET);

// Routes that do not require authentication
const publicRoutes = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/world/status',
  '/api/world/events/list',
  '/login',
  '/signup',
  '/'
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the route is public
  if (publicRoutes.some(route => pathname === route || pathname.startsWith('/_next') || pathname.includes('favicon.ico'))) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    // If API route, return JSON error
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }
    // If page, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // Verify token
    const { payload } = await jwtVerify(token, secret);
    
    // Add user info to headers for downstream use
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.userId as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware Auth Error:', error);
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'INVALID_TOKEN' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (handled in logic, but good to exclude if we wanted)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
