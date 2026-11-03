import { requireSession } from '../../../../lib/server-auth';
import { CrmError, readJsonBody, writeCrmCollection } from '../../../../lib/crm-server';
export async function PUT(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const session = await requireSession(request);
  if (session instanceof Response) return session;
  try {
    const { key } = await params;
    const result = await writeCrmCollection(key, await readJsonBody(request), session.user.role);
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof CrmError ? error.message : 'CRM indisponível. Nenhuma alteração confirmada.' }, { status: error instanceof CrmError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
