import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, next internals, and webhook endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhook') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('vibe_auth_token')?.value;
  const isLoginPage = pathname === '/login';

  // If user is trying to access protected route without valid auth cookie -> Redirect to /login
  if (!authToken && !isLoginPage) {
    const loginUrl = new URL('/login', request.url);
    // Preserves redirect destination if desired
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is already authenticated and visits /login -> Redirect to dashboard
  if (authToken && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
