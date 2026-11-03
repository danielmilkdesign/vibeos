import {requireSession,authJson} from '../../../../lib/server-auth';
// Disabled until an egress proxy can pin public DNS resolutions and enforce
// redirect, response-size and private-network restrictions at the socket layer.
export async function POST(request:Request) {
 const session=await requireSession(request);if(session instanceof Response)return session;
 return authJson({success:false,error:'Enriquecimento externo desabilitado por segurança (SSRF).'},503);
}
