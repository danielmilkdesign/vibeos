// Edge-compatible: never import Node crypto or Prisma here.
export const SESSION_COOKIE = 'vibe_auth_token';
export interface SessionClaims { sub: string; fingerprint: string; iat: number; exp: number }
const encoder = new TextEncoder();
function secret(): string {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value || encoder.encode(value).length < 32) throw new Error('NEXTAUTH_SECRET não configurado com 32 bytes mínimos.');
  return value;
}
export function sessionConfigured(): boolean { try { secret(); return true; } catch { return false; } }
function encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...Array.from(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decode(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid encoding');
  const raw = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
  if (encode(bytes) !== value) throw new Error('Noncanonical encoding');
  return bytes;
}
async function key() {
  return crypto.subtle.importKey('raw', encoder.encode(secret()), {name:'HMAC',hash:'SHA-256'}, false, ['sign','verify']);
}
export async function createSession(input: Pick<SessionClaims,'sub'|'fingerprint'>, ttl: number): Promise<string> {
  const iat = Math.floor(Date.now()/1000);
  const body = encode(encoder.encode(JSON.stringify({...input, iat, exp:iat+ttl})));
  return body + '.' + encode(new Uint8Array(await crypto.subtle.sign('HMAC',await key(),encoder.encode(body))));
}
export async function verifySession(token?: string): Promise<SessionClaims|null> {
  try {
    if (!token || token.length > 4096) return null;
    const parts = token.split('.');
    if (parts.length !== 2 || !await crypto.subtle.verify('HMAC',await key(),new Uint8Array(decode(parts[1])).buffer,encoder.encode(parts[0]))) return null;
    const claims = JSON.parse(new TextDecoder().decode(decode(parts[0])));
    const now = Math.floor(Date.now()/1000);
    if (typeof claims.sub !== 'string' || !claims.sub || typeof claims.fingerprint !== 'string' || !claims.fingerprint || !Number.isInteger(claims.exp) || !Number.isInteger(claims.iat) || claims.exp <= now || claims.iat > now || claims.exp - claims.iat > 60*60*24*30) return null;
    return claims;
  } catch { return null; }
}
export function cookieToken(request: Request): string|undefined {
  return request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(SESSION_COOKIE+'='))?.slice(SESSION_COOKIE.length+1);
}
export function sessionCookie(token: string, ttl: number): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ttl}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
