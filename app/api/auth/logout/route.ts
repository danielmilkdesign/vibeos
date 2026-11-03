import prisma from '../../../../lib/prisma';
import {requireSession,authJson} from '../../../../lib/server-auth';
import {sessionCookie} from '../../../../lib/session';
export async function POST(request:Request) {
 const session=await requireSession(request);
 if(session instanceof Response)return session;
 try {
  // updatedAt participates in the fingerprint. Logout revokes ALL this user's sessions.
  await prisma.user.update({where:{id:session.user.id},data:{updatedAt:new Date()}});
  const response=authJson({success:true});response.headers.set('Set-Cookie',sessionCookie('',0));return response;
 }catch{return authJson({error:'Não foi possível revogar a sessão.'},503);}
}
