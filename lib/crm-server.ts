import prisma from './prisma';
import { CRM_TRANSACTION_BUDGET } from './db-transactions';
import { CRM_KEYS, CrmKey } from './crm-store';
import { Prisma, NichoEnum } from '@prisma/client';
import { normalizePhone, normalizeNicho } from './lead-normalization';
import { proposalPending, acceptProposal, type ProposalDocument } from './proposal-domain';
export class CrmError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export const CRM_MAX_BYTES = 1024 * 1024;
const allRoles = ['ADMINISTRADOR','GESTOR_COMERCIAL','COMERCIAL','OPERACOES','DESIGN_CONTEUDO','FINANCEIRO'];
const commercial = ['COMERCIAL'];
const operations = ['OPERACOES','DESIGN_CONTEUDO'];
export function canWriteCollection(key: string, role: string): boolean {
  if (!allRoles.includes(role)) return false;
  if (['ADMINISTRADOR','GESTOR_COMERCIAL'].includes(role)) return true;
  if (['vibe_leads','vibe_companies','vibe_opps','vibe_proposals','vibe_proposal_versions','vibe_meetings','vibe_clientes'].includes(key)) return commercial.includes(role);
  if (key === 'vibe_contracts') return ['FINANCEIRO','COMERCIAL'].includes(role);
  if (key === 'vibe_offers') return role === 'FINANCEIRO';
  if (key === 'vibe_notifications') return true;
  return operations.includes(role);
}
export function validateCollectionWrite(key: string, body: unknown, role: string): asserts body is {data: Prisma.InputJsonValue[]; version: number} {
  if (!CRM_KEYS.includes(key as CrmKey)) throw new CrmError('Coleção inválida.');
  if (!canWriteCollection(key,role)) throw new CrmError('Sem permissão para alterar esta coleção.',403);
  if (!body || typeof body !== 'object' || !('data' in body) || !('version' in body) || !Number.isSafeInteger(body.version) || (body.version as number) < 0 || (body.version as number) >= 2147483647) throw new CrmError('Versão inválida.');
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > CRM_MAX_BYTES) throw new CrmError('Coleção excede o limite de 1 MiB.',413);
  if (!Array.isArray(body.data) || body.data.length > 10000) throw new CrmError('Coleção deve ser lista de até 10000 registros.');
  const ids = new Set<string>();
  const visit = (value: unknown, depth: number): void => {
    if (depth > 20) throw new CrmError('Estrutura muito profunda.');
    if (typeof value === 'number' && !Number.isFinite(value)) throw new CrmError('Número inválido.');
    if (value && typeof value === 'object') for (const [k,v] of Object.entries(value)) {
      if (['__proto__','prototype','constructor'].includes(k)) throw new CrmError('Campo inválido.');
      visit(v,depth+1);
    }
  };
  for (const row of body.data) {
    if (!row || typeof row !== 'object' || Array.isArray(row) || typeof row.id !== 'string' || !row.id.trim() || row.id.length > 200 || ids.has(row.id)) throw new CrmError('Registros exigem IDs únicos válidos.');
    ids.add(row.id); visit(row,0);
    for (const field of ['companyId','leadId','projectId','contractId','opportunityId','proposalId','title','name','nomeEmpresa','companyName','clientName','ownerName']) {
      if (row[field] != null && (typeof row[field] !== 'string' || row[field].length > 2000)) throw new CrmError(`Campo inválido: ${field}`);
    }
    for (const field of ['estimatedValue','setupValue','recurringValue','valorEstimado','valorTotal','valorSinal','mrr','probability','progress']) {
      if (row[field] != null && (typeof row[field] !== 'number' || !Number.isFinite(row[field]) || row[field] < 0 || (['progress','probability'].includes(field) && row[field] > 100))) throw new CrmError(`Campo inválido: ${field}`);
    }
    if (key === 'vibe_proposals') {
      const p = row as unknown as ProposalDocument;
      if (p.status && !['RASCUNHO','EM_REVISAO','ENVIADA','VISUALIZADA','NEGOCIACAO','APROVADA','RECUSADA','EXPIRADA'].includes(p.status)) throw new CrmError('Status de proposta inválido.');
      if (p.internalApprovedAt || ['ENVIADA','VISUALIZADA','NEGOCIACAO','APROVADA'].includes(p.status)) {
        const at = p.acceptance?.recordedAt || p.sentAt || p.internalApprovedAt || new Date().toISOString();
        if (proposalPending(p,at).length || !p.internalApprovedAt) throw new CrmError('Proposta exige termos completos e aprovação interna.');
        if (['ENVIADA','VISUALIZADA','NEGOCIACAO','APROVADA'].includes(p.status) && (!p.sentAt || p.sentVersion !== (p.version || 1) || !p.sentEvidence?.trim())) throw new CrmError('Envio exige evidência e versão vigente.');
        if (p.status === 'APROVADA') {
          if (!p.acceptance || !Number.isFinite(Date.parse(p.acceptance.recordedAt)) || Date.parse(p.acceptance.recordedAt) > Date.now()) throw new CrmError('Aceite inválido.');
          try { acceptProposal({...p,acceptance:undefined},p.acceptance,p.acceptance.recordedAt); } catch { throw new CrmError('Aceite exige evidência, data e versão válidas.'); }
        }
      }
    }
    if (key === 'vibe_opps' && row.stage !== undefined && !['QUALIFICADO','ANALISE_AGENDADA','ANALISE_REALIZADA','PROPOSTA_ENVIADA','NEGOCIACAO','FECHADO_GANHO','FECHADO_PERDIDO','LEAD_NOVO','DIAGNOSTICO_GERADO','REUNIAO_AGENDADA','ABORDADO_EMAIL','ABORDADO_WHATSAPP','FECHADO','PERDIDO'].includes(row.stage)) throw new CrmError('Etapa inválida.');
  }
}
export async function readCrmCollections() {
  const rows = await prisma.crmCollection.findMany({ where: { key: { in: [...CRM_KEYS] } } });
  const collections = Object.fromEntries(CRM_KEYS.map(key => [key, {data: [] as unknown, version: 0}]));
  for (const row of rows) collections[row.key] = {data: row.data, version: row.version};
  return {collections};
}
export async function writeCrmCollection(key: string, body: unknown, role: string, db = prisma) {
  validateCollectionWrite(key,body,role);
  try {
    return await db.$transaction(async tx => {
      const current = await tx.crmCollection.findUnique({where:{key}});
      if (!current) {
        if (body.version !== 0) throw new CrmError('Conflito de versão. Recarregue antes de salvar.',409);
        return tx.crmCollection.create({data:{key,data:body.data,version:1}});
      }
      const changed = await tx.crmCollection.updateMany({where:{key,version:body.version},data:{data:body.data,version:{increment:1}}});
      if (changed.count !== 1) throw new CrmError('Conflito de versão. Recarregue antes de salvar.',409);
      return {key,data:body.data,version:body.version+1};
    }, CRM_TRANSACTION_BUDGET);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && ['P2002','P2034'].includes(String(error.code))) throw new CrmError('Conflito de versão. Recarregue antes de salvar.',409);
    throw error;
  }
}
export function normalizeCrmPhone(value: unknown): string | null {
  if (value == null || value === '') return null;
  const digits = normalizePhone(value);
  if (!digits) throw new CrmError('Telefone inválido.');
  return `+${digits}`;
}
export function normalizeCrmNicho(value: unknown): NichoEnum {
  return normalizeNicho(value) as NichoEnum;
}
function leadString(body: Record<string, unknown>, key: string, max = 2000): string | undefined {
  const value = body[key];
  if (value == null || value === '') return undefined;
  if (typeof value !== 'string' || value.length > max) throw new CrmError(`Campo inválido: ${key}`);
  return value.trim() || undefined;
}
export async function persistLead(input: unknown, role: string, db: typeof prisma | Prisma.TransactionClient = prisma) {
  if (!canWriteCollection('vibe_leads',role)) throw new CrmError('Sem permissão para criar leads.',403);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new CrmError('Lead inválido.');
  const body = input as Record<string,unknown>;
  const nomeEmpresa = leadString(body,'nomeEmpresa',300);
  if (!nomeEmpresa) throw new CrmError('O campo nomeEmpresa é obrigatório.');
  const phone = normalizeCrmPhone(body.phoneWhatsapp);
  const externalId = leadString(body,'externalId',200) || leadString(body,'id',200);
  if (!phone && !externalId) throw new CrmError('Informe telefone ou ID externo para idempotência.');
  const value = body.valorEstimado === undefined ? 0 : body.valorEstimado;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new CrmError('Valor estimado inválido.');
  const nicho = normalizeCrmNicho(body.nicho);
  const localizacao = leadString(body,'localizacao',300) || '';
  const website = leadString(body,'website') || leadString(body,'linkBio');
  if (website) { try { if (!['http:','https:'].includes(new URL(website).protocol)) throw Error(); } catch { throw new CrmError('Website inválido.'); } }
  const details = {
    nomeDecisor:leadString(body,'nomeDecisor',300), emailDecisor:leadString(body,'emailDecisor',300),
    instagramUrl:leadString(body,'instagramUrl'),diagnosticoSeo:leadString(body,'diagnosticoSeo',20000),
  };
  // Reject malformed/deep JSON before opening a transaction; analysis remains observed data, not generated metrics.
  validateCollectionWrite('vibe_leads',{data:[{...body,id:externalId || phone}],version:0},role);
  for (let attempt=0; attempt<3; attempt++) {
    try {
      const persist = async (tx: Prisma.TransactionClient) => {
        const identities: Prisma.LeadWhereInput[] = [];
        if (phone) identities.push({normalizedPhone:phone});
        if (externalId) identities.push({externalId});
        const matches = await tx.lead.findMany({where:{OR:identities}});
        if (matches.length > 1) throw new CrmError('Telefone e ID externo identificam leads diferentes.',409);
        let lead = matches[0];
        let company = lead?.companyId ? await tx.company.findUnique({where:{id:lead.companyId}}) : null;
        if (!company) company = await tx.company.create({data:{tradeName:nomeEmpresa,segment:nicho,city:localizacao,state:'',website}});
        if (!lead) {
          lead = await tx.lead.create({data:{nomeEmpresa,nicho,localizacao,...details,phoneWhatsapp:phone,normalizedPhone:phone,externalId,companyId:company.id,linkBio:website,valorEstimado:value,status:'LEAD_NOVO',urgencia:'ALTA',authorityScore:0,trafegoOrganico:0,palavrasChave:0,percentSocial:0}});
        } else if (!lead.companyId || (externalId && !lead.externalId) || (phone && !lead.normalizedPhone)) {
          lead = await tx.lead.update({where:{id:lead.id},data:{companyId:company.id,...(!lead.externalId && externalId ? {externalId} : {}),...(!lead.normalizedPhone && phone ? {normalizedPhone:phone,phoneWhatsapp:phone} : {})}});
        }
        let opportunity = await tx.opportunity.findUnique({where:{leadId:lead.id}});
        if (!opportunity) opportunity = await tx.opportunity.create({data:{leadId:lead.id,companyId:company.id,title:`Oportunidade — ${lead.nomeEmpresa}`,offerName:'A definir',estimatedValue:lead.valorEstimado,setupValue:0,recurringValue:0,probability:20,stage:'LEAD_NOVO',ownerName:'Time Comercial'}});
        const json = (data: unknown) => JSON.parse(JSON.stringify(data)) as Prisma.InputJsonObject;
        const canonical: Record<string,string> = {LEAD_NOVO:'QUALIFICADO',DIAGNOSTICO_GERADO:'ANALISE_REALIZADA',REUNIAO_AGENDADA:'ANALISE_AGENDADA',FECHADO:'FECHADO_GANHO',PERDIDO:'FECHADO_PERDIDO',ABORDADO_EMAIL:'NEGOCIACAO',ABORDADO_WHATSAPP:'NEGOCIACAO'};
        const rows = [
          ['vibe_leads',json({...lead,website,...(body.analysis ? {analysis:body.analysis} : {})})],
          ['vibe_companies',json({...company,name:company.tradeName,nicho:company.segment,whatsapp:lead.phoneWhatsapp,decisorName:lead.nomeDecisor,decisorEmail:lead.emailDecisor,isClient:false,mrr:0,health:'SAUDAVEL',ownerName:'Time Comercial'})],
          ['vibe_opps',json({...opportunity,companyName:company.tradeName,decisorName:lead.nomeDecisor,stage:canonical[opportunity.stage] || opportunity.stage})],
        ] as const;
        const persisted: Record<string,Prisma.InputJsonObject> = {};
        for (const [key,row] of rows) {
          const current = await tx.crmCollection.findUnique({where:{key}});
          const data = (current?.data || []) as Prisma.InputJsonObject[];
          if (!Array.isArray(data)) throw new CrmError('Coleção inválida no servidor.',409);
          const existing = data.find(item=>item.id === row.id);
          // Idempotent retries never revert stage or any edits performed through collection API.
          persisted[key] = existing || row;
          if (existing) continue;
          const next = [...data,row];
          validateCollectionWrite(key,{data:next,version:current?.version || 0},'ADMINISTRADOR');
          if (!current) await tx.crmCollection.create({data:{key,data:next,version:1}});
          else {
            const changed = await tx.crmCollection.updateMany({where:{key,version:current.version},data:{data:next,version:{increment:1}}});
            if (changed.count !== 1) throw new CrmError('Conflito ao sincronizar CRM. Tente novamente.',409);
          }
        }
        return {success:true,persisted:true,lead:persisted.vibe_leads,company:persisted.vibe_companies,opportunity:persisted.vibe_opps};
      };
      return '$transaction' in db ? await db.$transaction(persist,{...CRM_TRANSACTION_BUDGET,isolationLevel:'Serializable'}) : await persist(db);
    } catch (error) {
      if (!('$transaction' in db)) throw error; // The caller owns rollback/retry for an outer transaction.
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
      if (!['P2002','P2034'].includes(code)) throw error;
      if (attempt === 2) throw new CrmError('Conflito concorrente. Tente novamente.',409);
    }
  }
  throw new CrmError('Não foi possível persistir lead.',503);
}
export async function readJsonBody(request: Request, maxBytes = CRM_MAX_BYTES): Promise<unknown> {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new CrmError('Content-Type deve ser application/json.',415);
  if (Number(request.headers.get('content-length')) > maxBytes) throw new CrmError('Corpo excede o limite.',413);
  const reader = request.body?.getReader();
  if (!reader) throw new CrmError('Corpo obrigatório.');
  const parts: Uint8Array[] = []; let size = 0;
  while (true) {
    const {done,value} = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new CrmError('Corpo excede o limite.',413); }
    parts.push(value);
  }
  try { return JSON.parse(Buffer.concat(parts).toString('utf8')); } catch { throw new CrmError('JSON inválido.'); }
}
