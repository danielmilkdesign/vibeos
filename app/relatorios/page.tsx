'use client';
import { useCrmCollection } from '../../lib/crm-client';
import { canonicalStage, commercialMetrics, PIPELINE_STAGES } from '../../lib/commercial-domain';
import { Opportunity, Contract, Proposal, Lead } from '../../types/crm';
export default function RelatoriosPage() {
 const [opportunities] = useCrmCollection<Opportunity[]>('vibe_opps', []);
 const [contracts] = useCrmCollection<Contract[]>('vibe_contracts', []);
 const [proposals] = useCrmCollection<Proposal[]>('vibe_proposals', []);
 const [leads] = useCrmCollection<Lead[]>('vibe_leads', []);
 const metrics = commercialMetrics(opportunities, contracts);
 const money = (value: number) => value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 const cards = [['Valor em aberto',money(metrics.openValue)], ['MRR contratado',money(metrics.mrr)], ['Conversão dos negócios encerrados',metrics.conversionRate === null ? 'Sem encerramentos' : `${metrics.conversionRate.toFixed(1)}%`], ['Ciclo de fechamento',metrics.averageClosingDays === null ? 'Sem datas de fechamento' : `${metrics.averageClosingDays.toFixed(1)} dias`]];
 return <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
 <header className="flex flex-wrap justify-between gap-4"><div><h1 className="text-2xl font-semibold text-white">Relatórios e performance</h1><p className="text-slate-400 mt-2">Dados persistidos da equipe. Fotografia atual, sem indicadores demonstrativos.</p></div><button type="button" onClick={()=>window.print()} className="px-4 py-2 rounded-lg border border-slate-700 text-white focus-visible:ring-2 focus-visible:ring-cyan-400">Imprimir / salvar PDF</button></header>
 <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Indicadores comerciais">{cards.map(([label,value])=><article key={label} className="rounded-xl border border-slate-800 p-5"><h2 className="text-sm text-slate-400">{label}</h2><p className="text-xl font-semibold text-white mt-3">{value}</p></article>)}</section>
 <section className="rounded-xl border border-slate-800 p-5 space-y-4"><h2 className="font-semibold text-white">Distribuição atual por etapa</h2><p className="text-sm text-slate-400">{leads.length} leads · {opportunities.length} oportunidades · {proposals.length} propostas · {contracts.length} contratos. A distribuição não representa um histórico de retenção.</p>
 <div className="overflow-x-auto"><table className="w-full text-left text-sm text-slate-300"><thead><tr><th scope="col" className="p-3">Etapa</th><th scope="col" className="p-3">Quantidade</th><th scope="col" className="p-3">Valor estimado</th></tr></thead><tbody>{PIPELINE_STAGES.map(stage=>{const items=opportunities.filter(item=>canonicalStage(item.stage)===stage.id);return <tr key={stage.id} className="border-t border-slate-800"><th scope="row" className="p-3 font-normal">{stage.title}</th><td className="p-3">{items.length}</td><td className="p-3">{money(items.reduce((sum,item)=>sum+(item.estimatedValue || 0),0))}</td></tr>;})}</tbody></table></div>
 <p className="text-xs text-slate-400">MRR normaliza recorrências mensais, trimestrais, semestrais e anuais. Conversão = ganhos / (ganhos + perdas). Churn não é informado sem histórico temporal confiável.</p>
 </section></main>;
}

