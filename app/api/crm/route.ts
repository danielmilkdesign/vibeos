import { requireSession } from '../../../lib/server-auth';
import { readCrmCollections } from '../../../lib/crm-server';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const session = await requireSession(request);
  if (session instanceof Response) return session;
  try { return Response.json(await readCrmCollections(), {headers:{'Cache-Control':'no-store'}}); }
  catch { return Response.json({error:'CRM indisponível. Tente novamente.'},{status:503,headers:{'Cache-Control':'no-store'}}); }
}
