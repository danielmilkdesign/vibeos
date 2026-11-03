// Fonte única das etapas visuais. Aceita os valores legados sem perder registros.
export const PIPELINE_STAGES = [
  { id: 'QUALIFICADO', title: 'Qualificado' },
  { id: 'ANALISE_AGENDADA', title: 'Análise agendada' },
  { id: 'ANALISE_REALIZADA', title: 'Diagnóstico realizado' },
  { id: 'PROPOSTA_ENVIADA', title: 'Proposta enviada' },
  { id: 'NEGOCIACAO', title: 'Em negociação' },
  { id: 'FECHADO_GANHO', title: 'Fechado ganho' },
  { id: 'FECHADO_PERDIDO', title: 'Fechado perdido' },
] as const;
export function canonicalStage(stage: string): string {
  return ({ LEAD_NOVO: 'QUALIFICADO', REUNIAO_AGENDADA: 'ANALISE_AGENDADA', DIAGNOSTICO_GERADO: 'ANALISE_REALIZADA', ABORDADO_EMAIL: 'NEGOCIACAO', ABORDADO_WHATSAPP: 'NEGOCIACAO', FECHADO: 'FECHADO_GANHO', PERDIDO: 'FECHADO_PERDIDO' } as Record<string, string>)[stage] || stage;
}
export function filterOpportunities<T extends { companyName: string; title: string; decisorName?: string; nicho?: string; companyId?: string }>(items: T[], query: string, segment: string, companies: {id: string; nicho: string}[] = []): T[] {
  const q = query.trim().toLocaleLowerCase('pt-BR');
  return items.filter(item => {
    const nicho = item.nicho || companies.find(c => c.id === item.companyId)?.nicho;
    return (segment === 'ALL' || nicho === segment) && [item.companyName,item.title,item.decisorName || ''].some(value => value.toLocaleLowerCase('pt-BR').includes(q));
  });
}
export type CommercialOpportunity = { stage: string; estimatedValue?: number; probability?: number; createdAt?: string; closedAt?: string };
export type CommercialContract = { status: string; recurringValue: number; billingPeriod?: string };
export function commercialMetrics(opportunities: CommercialOpportunity[], contracts: CommercialContract[]) {
  const won = opportunities.filter(o => canonicalStage(o.stage) === 'FECHADO_GANHO');
  const lost = opportunities.filter(o => canonicalStage(o.stage) === 'FECHADO_PERDIDO');
  const open = opportunities.filter(o => !['FECHADO_GANHO', 'FECHADO_PERDIDO'].includes(canonicalStage(o.stage)));
  const finite = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : 0;
  const active = contracts.filter(c => ['ATIVO', 'RENOVACAO_PROXIMA'].includes(c.status));
  const cycles: Record<string, number> = { MENSAL: 1, TRIMESTRAL: 3, SEMESTRAL: 6, ANUAL: 12 };
  const mrr = active.reduce((sum,c) => sum + (cycles[c.billingPeriod || 'MENSAL'] ? finite(c.recurringValue) / cycles[c.billingPeriod || 'MENSAL'] : 0), 0);
  const closingDays = won.flatMap(o => {
    if (!o.createdAt || !o.closedAt) return [];
    const duration = (Date.parse(o.closedAt) - Date.parse(o.createdAt)) / 86400000;
    return Number.isFinite(duration) && duration >= 0 ? [duration] : [];
  });
  return {
    openCount: open.length,
    openValue: open.reduce((sum,o) => sum + finite(o.estimatedValue), 0),
    weightedValue: open.reduce((sum,o) => sum + finite(o.estimatedValue) * Math.min(100,finite(o.probability)) / 100, 0),
    wonCount: won.length, lostCount: lost.length,
    conversionRate: won.length + lost.length ? won.length / (won.length + lost.length) * 100 : null,
    mrr, averageRecurring: active.length ? mrr / active.length : null,
    averageClosingDays: closingDays.length ? closingDays.reduce((a,b) => a+b,0) / closingDays.length : null,
  };
}
