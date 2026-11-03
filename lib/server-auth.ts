import { randomBytes, scrypt, timingSafeEqual, createHmac } from 'node:crypto';
import prisma from './prisma';
import { cookieToken, verifySession } from './session';
const derive = (password: string, salt: string): Promise<Buffer> => new Promise((resolve,reject)=>scrypt(password,salt,64,{N:16384,r:8,p:1},(error,key)=>error?reject(error):resolve(key)));
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length > 1024) throw new Error('Senha inválida.');
  const salt=randomBytes(32).toString('hex');
  return `scrypt$16384$8$1$${salt}$${(await derive(password,salt)).toString('hex')}`;
}
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (typeof password !== 'string' || password.length > 1024 || !/^scrypt\$16384\$8\$1\$[a-f0-9]{64}\$[a-f0-9]{128}$/.test(hash)) return false;
  const parts=hash.split('$');
  return timingSafeEqual(await derive(password,parts[4]),Buffer.from(parts[5],'hex'));
}
export function sessionFingerprint(user: {password:string;updatedAt:Date}): string {
  const secret=process.env.NEXTAUTH_SECRET;
  if (!secret || Buffer.byteLength(secret)<32) throw new Error('Auth indisponível.');
  return createHmac('sha256',secret).update(user.password+'\n'+user.updatedAt.toISOString()).digest('hex');
}
export async function readRequestText(request: Request, limit: number): Promise<string> {
  const reader=request.body?.getReader(); if(!reader)throw new Error('Corpo ausente.');
  let total=0; const chunks: Uint8Array[]=[];
  try {
    while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit)throw new Error('Limite excedido.');chunks.push(value);}
    return Buffer.concat(chunks).toString('utf8');
  } finally {await reader.cancel();}
}
export function authJson(data: unknown, status=200): Response {
  return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
}
export function sameOrigin(request: Request): boolean {
  // All browser mutations must carry a matching Origin. No forwarded-host trust.
  return request.headers.get('origin') === new URL(request.url).origin;
}
export async function requireSession(request: Request, roles?: string[]): Promise<{user:{id:string;name:string;email:string;role:string;active:true}}|Response> {
  const claims=await verifySession(cookieToken(request));
  if (!claims) return authJson({error:'Não autenticado.'},401);
  try {
    const user=await prisma.user.findUnique({where:{id:claims.sub}});
    if (!user?.active || claims.fingerprint!==sessionFingerprint(user)) return authJson({error:'Não autenticado.'},401);
    if (roles?.length && user.role!=='ADMINISTRADOR' && !roles.includes(user.role)) return authJson({error:'Acesso negado.'},403);
    if (!['GET','HEAD','OPTIONS'].includes(request.method) && !sameOrigin(request)) return authJson({error:'Origem não autorizada.'},403);
    return {user:{id:user.id,name:user.name,email:user.email,role:user.role,active:true}};
  } catch { return authJson({error:'Autenticação indisponível.'},503); }
}
