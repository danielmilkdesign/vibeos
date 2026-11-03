import prisma from '../../../../lib/prisma';
import {authJson, sameOrigin, verifyPassword, sessionFingerprint, hashPassword, readRequestText} from '../../../../lib/server-auth';
import {createSession,sessionCookie,sessionConfigured} from '../../../../lib/session';
export const runtime='nodejs';
let dummy: Promise<string>;
// Per-account limit; a naive global window lets a third party lock every account.
const emailWindows = new Map<string, {start: number; count: number}>();
export async function POST(request:Request) {
 if(!sessionConfigured())return authJson({error:'Autenticação indisponível.'},503);
 if(!sameOrigin(request))return authJson({error:'Origem não autorizada.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return authJson({error:'JSON obrigatório.'},415);
 let input:any;
 try {const raw=await readRequestText(request,8192);input=JSON.parse(raw);}catch{return authJson({error:'JSON inválido.'},400);}
 if(typeof input?.email!=='string'||input.email.length>254||typeof input.password!=='string'||!input.password||input.password.length>1024)return authJson({error:'Credenciais inválidas.'},401);
 // Only well-formed credential attempts count, and only against their own account.
 const emailKey=input.email.trim().toLowerCase();
 const window=emailWindows.get(emailKey)||{start:0,count:0};
 if(Date.now()-window.start>=60000){window.start=Date.now();window.count=0;}
 window.count++;emailWindows.set(emailKey,window);
 if(emailWindows.size>10000)emailWindows.clear();
 if(window.count>20)return authJson({error:'Muitas tentativas. Tente novamente em um minuto.'},429);
 try {
  const user=await prisma.user.findUnique({where:{email:emailKey}});
  dummy ||= hashPassword(crypto.randomUUID());
  const valid=await verifyPassword(input.password,user?.password||await dummy);
  if(!user?.active||!valid)return authJson({error:'Credenciais inválidas.'},401);
  const ttl=input.rememberMe===true?60*60*24*30:60*60*8;
  const token=await createSession({sub:user.id,fingerprint:sessionFingerprint(user)},ttl);
  const response=authJson({user:{id:user.id,name:user.name,email:user.email,role:user.role,active:true}});
  response.headers.set('Set-Cookie',sessionCookie(token,ttl));return response;
 }catch{return authJson({error:'Autenticação indisponível.'},503);}
}
