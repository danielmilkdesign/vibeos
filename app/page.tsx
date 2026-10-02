import React from 'react';
import { INITIAL_LEADS_MANAUS } from '../prisma/seed';
import { 
  Building2, 
  Search, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export default function VibeOsDashboard() {
  const leads = INITIAL_LEADS_MANAUS;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
              V
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                VIBE OS
              </h1>
              <p className="text-xs text-cyan-400 font-medium">Nirvana Engine v1.0</p>
            </div>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              <TrendingUp className="w-4 h-4" /> CRM & Prospecção
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors">
              <Layers className="w-4 h-4" /> Esteira de Projetos
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors">
              <Zap className="w-4 h-4" /> AIsa Hub Integrador
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors">
              <Shield className="w-4 h-4" /> Normas & Conformidade
            </a>
          </nav>
        </div>

        {/* Squad Status */}
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-2">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Squads Ativas (5/5)
          </p>
          <div className="space-y-1 text-slate-400 text-[11px]">
            <div className="flex justify-between"><span>Core & DB</span><span className="text-emerald-400">Ativo</span></div>
            <div className="flex justify-between"><span>Growth (AIsa)</span><span className="text-emerald-400">Ativo</span></div>
            <div className="flex justify-between"><span>Operations</span><span className="text-emerald-400">Ativo</span></div>
            <div className="flex justify-between"><span>UI/UX</span><span className="text-emerald-400">Ativo</span></div>
            <div className="flex justify-between"><span>N8N Webhooks</span><span className="text-emerald-400">Ativo</span></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Painel de Prospecção Outbound — Manaus</h2>
            <p className="text-slate-400 text-sm mt-1">
              Empresas mapeadas via DataForSEO, Semrush, Similarweb e Apollo
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-sm font-medium rounded-lg flex items-center gap-2 transition-all">
              <Search className="w-4 h-4 text-slate-400" /> Buscar Novo Lead (AIsa)
            </button>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all">
              <Zap className="w-4 h-4" /> Enriquecer em Lote
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Leads Qualificados</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-slate-100">{leads.length}</span>
              <span className="text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">100% Manaus</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Urgência Crítica (Sem Site)</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-rose-400">
                {leads.filter(l => l.urgencia === 'CRITICA').length}
              </span>
              <span className="text-xs text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">Perdendo Vendas</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Valor em Pipeline</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-emerald-400">R$ 18.900</span>
              <span className="text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">Ticket Médio R$1.890</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">SLA de Entrega</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-indigo-400">7 Dias</span>
              <span className="text-xs text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">Garantia VIBE</span>
            </div>
          </div>
        </div>

        {/* Lead Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              Lista de Prospecção Ativa (10 Empresas Mapeadas)
            </h3>
            <span className="text-xs text-slate-400">Ordenado por Nível de Urgência</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Empresa / Bairro</th>
                  <th className="p-3.5">Nicho</th>
                  <th className="p-3.5">Diagnóstico SEO & Tráfego</th>
                  <th className="p-3.5">Decisor (Apollo)</th>
                  <th className="p-3.5">Urgência</th>
                  <th className="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leads.map((lead, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-medium text-slate-100">
                      <div>{lead.nomeEmpresa}</div>
                      <div className="text-[11px] text-slate-400">{lead.localizacao}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {lead.nicho}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="truncate text-slate-300" title={lead.diagnosticoSeo}>
                        {lead.diagnosticoSeo}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        AS: <span className="font-semibold text-slate-200">{lead.authorityScore}</span> | Social: <span className="text-cyan-400">{lead.percentSocial}%</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-200">{lead.nomeDecisor}</div>
                      <div className="text-[10px] text-slate-400">{lead.cargoDecisor}</div>
                    </td>
                    <td className="p-3.5">
                      {lead.urgencia === 'CRITICA' ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50 font-medium">
                          <AlertTriangle className="w-3 h-3" /> Crítica
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Alta
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <a 
                        href={`mailto:${lead.emailDecisor}`} 
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 rounded transition-colors"
                        title="Enviar E-mail Personalizado"
                      >
                        <Mail className="w-3 h-3" /> E-mail
                      </a>
                      <a 
                        href={`https://wa.me/55${lead.phoneWhatsapp?.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 rounded transition-colors"
                        title="Abrir WhatsApp"
                      >
                        <PhoneCall className="w-3 h-3" /> Whats
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
