import type { Lead } from '../types/crm';
import { analyzeLead } from './lead-analysis';
import { normalizePhone } from './lead-normalization';
import { createProposalDraft, exportProposalHTML, proposalWhatsAppText, type ProposalDocument, type BillingPeriod } from './proposal-domain';

// One catalog for the generator and the proposal editor. No historical prices or SLA
// are carried into a customer's offer without explicit human confirmation.
export const SERVICE_CATALOG = {
  SITE_INSTITUCIONAL: { nome:'Site Institucional', descricao:'Site institucional: páginas, conteúdo e integrações a definir no escopo.' },
  LANDING_PAGE: { nome:'Landing Page com WhatsApp', descricao:'Página de apresentação com contato WhatsApp: entregas e integrações a confirmar.' },
  AUTOMACAO_VENDAS: { nome:'Automação de Vendas', descricao:'Fluxo comercial e integrações: canais, permissões e dependências a confirmar.' },
  GESTAO_REDES_SOCIAIS: { nome:'Gestão de Redes Sociais', descricao:'Planejamento e produção de conteúdo: canais, volume e revisões a confirmar.' },
  IDENTIDADE_VISUAL: { nome:'Identidade visual', descricao:'Conceito de logo e direção visual: pesquisa, aplicações e revisões a confirmar. Prévia ilustrativa, não uma marca final.' },
} as const;
export type ServiceType = keyof typeof SERVICE_CATALOG;
export const TIPOS_SERVICO = Object.keys(SERVICE_CATALOG) as ServiceType[];
export function missingServiceTypes(selection: ServiceType | 'TODOS', existingTypes: Iterable<string | undefined>): ServiceType[] {
  const seen = new Set(existingTypes);
  const types: ServiceType[] = selection === 'TODOS' ? [...TIPOS_SERVICO] : [selection];
  return types.filter(t => !seen.has(t));
}
export function gerarRascunhosParaLead(lead: Lead, options: { opportunityId?: string; serviceType?: ServiceType; now?: string } = {}): ProposalDocument[] {
  const now=options.now || new Date().toISOString();
  const analysis=analyzeLead({...lead});
  return (options.serviceType ? [options.serviceType] : TIPOS_SERVICO).map(serviceType => {
    const service=SERVICE_CATALOG[serviceType];
    if (!service) throw new Error('Serviço desconhecido.');
    return createProposalDraft({leadId:lead.id,companyId:lead.companyId,opportunityId:options.opportunityId,
      clientName:lead.nomeEmpresa,clientEmail:lead.emailDecisor || '',clientPhone:normalizePhone(lead.phoneWhatsapp || '') || '',
      serviceType,offerTitle:service.nome,scopeText:service.descricao,leadAnalysis:analysis,
      setupValue:0,recurringValue:0,billingPeriod:'UNICO',validUntil:'',deliveryTimeline:'',paymentTerms:''},now);
  });
}
export function buildProspectDraftBatch(records: {lead: Lead; opportunityId: string}[], existing: ProposalDocument[], now = new Date().toISOString()) {
  const seen = new Set(existing.map(p => `${p.leadId}:${p.serviceType}`));
  const created: ProposalDocument[] = [];
  for (const {lead,opportunityId} of records) {
    for (const serviceType of TIPOS_SERVICO) {
      const key = `${lead.id}:${serviceType}`;
      if (seen.has(key)) continue;
      created.push(...gerarRascunhosParaLead(lead,{opportunityId,serviceType,now}));
      seen.add(key);
    }
  }
  return {created,proposals:[...created,...existing]};
}
export function gerarPropostasParaClientes(leads: Lead[], tipoServico: string, opcoes: {condicoesPagamento?: string; observacoes?: string} = {}): ProposalDocument[] {
  if (!TIPOS_SERVICO.includes(tipoServico as ServiceType)) throw new Error('Serviço desconhecido.');
  return leads.flatMap(lead => gerarRascunhosParaLead(lead,{serviceType:tipoServico as ServiceType})).map(p=>({...p,paymentTerms:opcoes.condicoesPagamento || '',meetingContext:opcoes.observacoes || ''}));
}
export function gerarPropostaDeUmLead(lead: Lead, tipoServico: string, _index=0, options: {condicoesPagamento?: string; observacoes?: string} = {}): ProposalDocument { return gerarPropostasParaClientes([lead],tipoServico,options)[0]; }
export function calcularTotais(proposals: Pick<ProposalDocument,'setupValue'|'recurringValue'|'billingPeriod'>[]) {
  const recorrencia: Record<BillingPeriod,number>={MENSAL:0,TRIMESTRAL:0,SEMESTRAL:0,ANUAL:0,UNICO:0};
  let setup=0;
  for (const p of proposals) { setup+=p.setupValue; if(p.billingPeriod && p.billingPeriod !== 'UNICO') recorrencia[p.billingPeriod]+=p.recurringValue; }
  return {setup,recorrencia};
}
function individual(proposals: ProposalDocument[]): ProposalDocument {
  if (proposals.length !== 1) throw new Error('Exporte uma proposta individual por cliente e versão.');
  return proposals[0];
}
export function gerarTextoWhatsApp(proposals: ProposalDocument[]): string { return proposalWhatsAppText(individual(proposals)); }
export const gerarResumoParaWhatsApp=gerarTextoWhatsApp;
export const gerarWhatsAppText=gerarTextoWhatsApp;
export function gerarPreviewHTML(proposals: ProposalDocument[]): string { return exportProposalHTML(individual(proposals)); }
export default gerarPropostasParaClientes;

