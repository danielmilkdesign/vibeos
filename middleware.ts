import { NextResponse, NextRequest } from 'next/server';
import { cookieToken, verifySession } from './lib/session';
const publicPaths = new Set(['/login','/favicon.ico','/api/auth/login','/api/auth/me','/api/auth/logout','/api/auth/access','/api/webhook/lead']);
export async function middleware(request: NextRequest) {
 const pathname=request.nextUrl.pathname;
 if (publicPaths.has(pathname) || pathname.startsWith('/_next/static/') || pathname === '/_next/image') return NextResponse.next();
 if (!await verifySession(cookieToken(request))) {
  if (pathname.startsWith('/api/')) return NextResponse.json({error:'Não autenticado.'},{status:401,headers:{'Cache-Control':'no-store'}});
  return NextResponse.redirect(new URL('/login',request.url));
 }
 return NextResponse.next();
}
export const config={matcher:['/:path*']};
