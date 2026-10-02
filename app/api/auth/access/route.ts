import { NextRequest, NextResponse } from 'next/server';
import { FOUNDER_MAGIC_KEYS } from '../../../../lib/auth-context';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawToken =
    searchParams.get('token') ||
    searchParams.get('key') ||
    searchParams.get('k') ||
    searchParams.get('user') ||
    '';

  const token = rawToken.trim().toLowerCase();

  const match =
    FOUNDER_MAGIC_KEYS[token] ||
    (token === 'daniel' || token === 'danielleite'
      ? FOUNDER_MAGIC_KEYS['daniel']
      : token === 'victor' || token === 'victorbelichar'
      ? FOUNDER_MAGIC_KEYS['victor']
      : null);

  if (!match) {
    const errorUrl = new URL('/acesso', request.url);
    errorUrl.searchParams.set('error', 'invalid_token');
    return NextResponse.redirect(errorUrl);
  }

  // Create session token
  const sessionToken = `vibe_sess_${Date.now()}_${btoa(match.email).substring(0, 16)}`;

  // Redirect to /acesso with token to sync localStorage and finish instant signin
  const accessUrl = new URL('/acesso', request.url);
  accessUrl.searchParams.set('token', match.token);

  const response = NextResponse.redirect(accessUrl);

  // Set secure session cookie
  response.cookies.set('vibe_auth_token', sessionToken, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
