import { requireSession } from '../../../lib/server-auth';
import { CrmError, readCrmCollections, readJsonBody, persistLead } from '../../../lib/crm-server';
export const dynamic = 'force-dynamic';
const headers = {'Cache-Control':'no-store'};
export async function GET(request: Request) {
  const session = await requireSession(request);
  if (session instanceof Response) return session;
  try {
    const {collections} = await readCrmCollections();
    const query = new URL(request.url).searchParams;
    const nicho = query.get('nicho'); const status = query.get('status');
    const leads = (collections.vibe_leads.data as Record<string,unknown>[]).filter(lead => (!nicho || nicho==='ALL' || lead.nicho===nicho) && (!status || status==='ALL' || lead.status===status));
    return Response.json({success:true,count:leads.length,data:leads},{headers});
  } catch { return Response.json({success:false,error:'Leads indisponíveis. Tente novamente.'},{status:503,headers}); }
}
export async function POST(request: Request) {
  const session = await requireSession(request,['ADMINISTRADOR','GESTOR_COMERCIAL','COMERCIAL']);
  if (session instanceof Response) return session;
  try {
    const result = await persistLead(await readJsonBody(request,65536),session.user.role);
    return Response.json(result,{status:201,headers});
  } catch (error) {
    return Response.json({success:false,error:error instanceof CrmError ? error.message : 'Não foi possível persistir o lead. Tente novamente.'},{status:error instanceof CrmError ? error.status : 503,headers});
  }
}
