import type { Proposal, Contract } from '../types/crm';
export function resolveProposalContext(leads: {id:string;companyId?:string}[], opportunities: {id:string;leadId?:string;companyId?:string}[], search: string) {
  const params=new URLSearchParams(search);
  const leadId=params.get('leadId') || '';
  const opportunityId=params.get('opportunityId') || '';
  if (!leadId && !opportunityId) return {leadId:'',opportunityId:''};
  const lead=leads.find(item=>item.id===leadId);
  if (!lead) throw new Error('Lead do link não foi encontrado no CRM. Selecione um lead válido.');
  if (opportunityId) {
    const opportunity=opportunities.find(item=>item.id===opportunityId);
    if (!opportunity || (opportunity.leadId ? opportunity.leadId !== lead.id : !lead.companyId || opportunity.companyId !== lead.companyId)) throw new Error('Oportunidade do link não pertence ao lead selecionado.');
  }
  return {leadId,opportunityId};
}
export type BillingPeriod = NonNullable<Proposal['billingPeriod']>;
export type ProposalDocument = Proposal & {
  leadId?: string; serviceType?: string; version?: number; confirmedTerms?: boolean;
  pricingStatus?: 'PENDENTE' | 'CONFIRMADO'; deliveryTimeline?: string;
  exclusions?: string; acceptanceCriteria?: string; responsibilities?: string; thirdPartyCosts?: string;
  meetingContext?: string; leadAnalysis?: unknown; internalApprovedAt?: string;
  sentAt?: string; sentVersion?: number; sentEvidence?: string;
  acceptance?: { evidence: string; acceptedAt: string; version: number; recordedAt: string };
  updatedAt?: string;
};
export type ContractDocument = Omit<Contract, 'billingPeriod'> & {
  billingPeriod: BillingPeriod; proposalId: string; proposalVersion: number;
  opportunityId?: string; leadId?: string; scopeText: string; deliveryTimeline: string;
  paymentTerms: string; exclusions: string; acceptanceCriteria: string;
  responsibilities: string; thirdPartyCosts: string; acceptanceEvidence: string;
  acceptedAt: string; createdAt: string;
};
export type ProposalVersion = { id: string; proposalId: string; version: number; savedAt: string; reason: string; snapshot: ProposalDocument };
export function createProposalDraft(input: Partial<ProposalDocument>, now = new Date().toISOString()): ProposalDocument {
  if (!input.clientName?.trim()) throw new Error('Informe o cliente.');
  return { ...input, id: input.id || `prop-${globalThis.crypto.randomUUID()}`, proposalNumber: input.proposalNumber || `VIBE-${now.slice(0,4)}-${globalThis.crypto.randomUUID().slice(0,8)}`,
    clientName: input.clientName.trim(), clientEmail: input.clientEmail === 'cliente@vibe.tech' ? '' : input.clientEmail || '',
    offerTitle: input.offerTitle || '', scopeText: input.scopeText || '', setupValue: input.setupValue ?? 0,
    recurringValue: input.billingPeriod === 'UNICO' ? 0 : input.recurringValue ?? 0,
    billingPeriod: input.billingPeriod || 'UNICO', validUntil: input.validUntil || '',
    status: 'RASCUNHO', version: 1, confirmedTerms: false, pricingStatus: 'PENDENTE',
    internalApprovedAt: undefined, acceptance: undefined, sentAt: undefined, sentVersion: undefined,
    createdAt: now, updatedAt: now };
}
function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function proposalPending(p: ProposalDocument, now = new Date().toISOString()): string[] {
  const pending: string[] = [];
  if (!p.confirmedTerms || p.pricingStatus !== 'CONFIRMADO') pending.push('Confirmação humana dos termos e preços pendente');
  for (const key of ['clientName','offerTitle','scopeText','paymentTerms','deliveryTimeline','exclusions','acceptanceCriteria','responsibilities','thirdPartyCosts'] as const) {
    if (!p[key]?.trim()) pending.push(`Preencher ${key}`);
  }
  if (![p.setupValue,p.recurringValue].every(v => Number.isFinite(v) && v >= 0)) pending.push('Preços inválidos');
  if (!p.billingPeriod || !['UNICO','MENSAL','TRIMESTRAL','SEMESTRAL','ANUAL'].includes(p.billingPeriod)) pending.push('Periodicidade pendente');
  if (p.billingPeriod === 'UNICO' && p.recurringValue !== 0) pending.push('Pagamento único deve ter recorrência zero');
  if (!validDate(p.validUntil) || p.validUntil < now.slice(0,10)) pending.push('Validade pendente ou vencida');
  return pending;
}
function assertReady(p: ProposalDocument, now: string, internal = true): void {
  const pending = proposalPending(p,now);
  if (internal && !p.internalApprovedAt) pending.push('Aprovação interna pendente');
  if (pending.length) throw new Error(pending.join('; '));
}
export function approveProposalInternally(p: ProposalDocument, now = new Date().toISOString()): ProposalDocument {
  assertReady(p,now,false);
  if (p.acceptance) throw new Error('Versão aceita é imutável; crie nova revisão.');
  return {...p, status:'EM_REVISAO', internalApprovedAt:now, updatedAt:now};
}
export function editProposal(p: ProposalDocument, changes: Partial<ProposalDocument>, now = new Date().toISOString()): ProposalDocument {
  return {...p,...changes,id:p.id,proposalNumber:p.proposalNumber,createdAt:p.createdAt,validUntil:p.validUntil || changes.validUntil || '',
    recurringValue: (changes.billingPeriod ?? p.billingPeriod) === 'UNICO' ? 0 : changes.recurringValue ?? p.recurringValue,
    version:(p.version || 1)+1,status:'RASCUNHO',internalApprovedAt:undefined,confirmedTerms:false,pricingStatus:'PENDENTE',
    sentAt:undefined,sentVersion:undefined,sentEvidence:undefined,acceptance:undefined,updatedAt:now};
}
export function renewProposal(p: ProposalDocument, validUntil: string, now = new Date().toISOString()): ProposalDocument {
  if (!validDate(validUntil) || validUntil <= p.validUntil || validUntil < now.slice(0,10)) throw new Error('Informe nova validade futura e posterior à atual.');
  return {...editProposal(p,{},now),validUntil};
}
export function recordProposalSent(p: ProposalDocument, evidence: string, now = new Date().toISOString()): ProposalDocument {
  assertReady(p,now);
  if (!evidence.trim()) throw new Error('Informe evidência ou canal do envio realizado.');
  if (p.acceptance) throw new Error('Proposta já aceita.');
  return {...p,status:'ENVIADA',sentAt:now,sentVersion:p.version || 1,sentEvidence:evidence.trim(),updatedAt:now};
}
export function acceptProposal(p: ProposalDocument, input: { evidence: string; acceptedAt: string; version: number }, now = new Date().toISOString()): ProposalDocument {
  assertReady(p,input.acceptedAt);
  if (!p.sentAt || p.sentVersion !== (p.version || 1)) throw new Error('Registre o envio desta versão antes do aceite.');
  const time = Date.parse(input.acceptedAt);
  if (!input.evidence.trim() || input.version !== (p.version || 1) || !Number.isFinite(time) || time > Date.parse(now) || time < Date.parse(p.sentAt) || input.acceptedAt.slice(0,10) > p.validUntil) throw new Error('Aceite requer evidência, data válida após envio e versão vigente dentro da validade.');
  return {...p,status:'APROVADA',acceptance:{...input,evidence:input.evidence.trim(),recordedAt:now},updatedAt:now};
}
export function contractFromAcceptedProposal(p: ProposalDocument, now = new Date().toISOString()): ContractDocument {
  // Acceptance is validated at its event date, not against today's expiry.
  if (p.status !== 'APROVADA' || !p.acceptance || p.acceptance.version !== (p.version || 1)) throw new Error('Necessária proposta aceita com evidência e versão.');
  const accepted = acceptProposal({...p,acceptance:undefined},p.acceptance,p.acceptance.recordedAt);
  return {id:`ctr-${globalThis.crypto.randomUUID()}`,contractNumber:`CTR-${p.proposalNumber}-v${p.version || 1}`,
    proposalId:p.id,proposalVersion:p.version || 1,companyId:p.companyId,opportunityId:p.opportunityId,leadId:p.leadId,
    companyName:p.clientName,clientName:p.clientName,offerName:p.offerTitle,setupValue:p.setupValue,recurringValue:p.recurringValue,
    billingPeriod:p.billingPeriod!,scopeText:p.scopeText,deliveryTimeline:p.deliveryTimeline!,paymentTerms:p.paymentTerms!,
    exclusions:p.exclusions!,acceptanceCriteria:p.acceptanceCriteria!,responsibilities:p.responsibilities!,thirdPartyCosts:p.thirdPartyCosts!,
    acceptanceEvidence:accepted.acceptance!.evidence,acceptedAt:accepted.acceptance!.acceptedAt,
    dueDay:0,deliveryLimit:0,deliveriesUsed:0,status:'RASCUNHO',startDate:'',renewalDate:'',createdAt:now};
}
export async function persistProposalVersion(p: ProposalDocument, proposals: ProposalDocument[], versions: ProposalVersion[], saveVersions: (v: ProposalVersion[]) => Promise<unknown>, saveProposals: (v: ProposalDocument[]) => Promise<unknown>, reason: string, now = new Date().toISOString()): Promise<void> {
  const previous = proposals.find(item => item.id === p.id);
  const entries = [previous,p].filter((v): v is ProposalDocument => !!v).map(snapshot => ({id:`pv-${globalThis.crypto.randomUUID()}`,proposalId:p.id,version:snapshot.version || 1,savedAt:now,reason,snapshot:structuredClone(snapshot)}));
  // History first: failures cannot silently replace the current document. An interrupted
  // second write may leave an orphan audit entry, never an unrecorded commercial edit.
  await saveVersions([...versions,...entries]);
  await saveProposals(previous ? proposals.map(item => item.id === p.id ? p : item) : [p,...proposals]);
}
const htmlEscape = (value: string) => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/javascript:/gi,'javascript&#58;');
const markdownEscape = (value: string) => htmlEscape(value).replace(/([\\`*_{}\[\]()#!|])/g,'\\$1');
function documentText(p: ProposalDocument): string {
  return [`Proposta VIBE — ${p.clientName}`,`${p.proposalNumber} · versão ${p.version || 1}`,p.offerTitle,
    `Setup: R$ ${p.setupValue.toLocaleString('pt-BR',{minimumFractionDigits:2})}`,
    `Recorrência: R$ ${p.recurringValue.toLocaleString('pt-BR',{minimumFractionDigits:2})} / ${p.billingPeriod}`,
    `Pagamento: ${p.paymentTerms}`,`Validade: ${p.validUntil}`,`Prazo: ${p.deliveryTimeline}`,
    `Escopo: ${p.scopeText}`,`Exclusões: ${p.exclusions}`,`Critérios de aceite: ${p.acceptanceCriteria}`,
    `Responsabilidades: ${p.responsibilities}`,`Custos de terceiros: ${p.thirdPartyCosts}`,
    'Aprovação interna não equivale a aceite do cliente ou assinatura.'].join('\n\n');
}
export function exportProposalMarkdown(p: ProposalDocument, now = new Date().toISOString()): string {
  assertReady(p,now); return '# ' + markdownEscape(documentText(p));
}
export function exportProposalHTML(p: ProposalDocument, now = new Date().toISOString()): string {
  assertReady(p,now);
  return '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Proposta VIBE</title><body><main><pre style="white-space:pre-wrap;overflow-wrap:anywhere">' + htmlEscape(documentText(p)) + '</pre></main></body></html>';
}
export function proposalWhatsAppText(p: ProposalDocument, now = new Date().toISOString()): string { assertReady(p,now); return documentText(p); }
