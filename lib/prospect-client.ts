import type { Lead } from '../types/crm';
export interface ProspectInput { id: string; name: string; phone?: string | null; category?: string; address?: string | null; website?: string | null; analysis?: unknown }
export interface SavedProspect { sourceId: string; lead: Lead; opportunityId: string }
export async function saveProspects(leads: ProspectInput[], fetcher: typeof fetch = fetch) {
  const savedIds: string[] = [];
  const records: SavedProspect[] = [];
  const failures: {id: string; message: string}[] = [];
  for (const lead of leads) {
    try {
      const response = await fetcher('/api/leads', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({externalId:lead.id,nomeEmpresa:lead.name,nicho:lead.category || 'OUTROS',localizacao:lead.address || '',phoneWhatsapp:lead.phone || null,website:lead.website || null,analysis:lead.analysis || null})});
      const result = await response.json();
      if (!response.ok || result.success !== true || result.persisted !== true || !result.lead?.id || !result.opportunity?.id) throw new Error(result.error || 'O servidor não confirmou a gravação do lead e da oportunidade.');
      savedIds.push(lead.id);
      records.push({sourceId:lead.id,lead:result.lead,opportunityId:result.opportunity.id});
    } catch (error) { failures.push({id:lead.id,message:error instanceof Error ? error.message : 'Falha ao gravar o contato.'}); }
  }
  return {savedIds,failures,records};
}
