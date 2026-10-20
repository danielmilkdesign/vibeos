'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Download,
  Target,
  DollarSign,
  CheckCircle2
} from 'lucide-react';

export default function RelatoriosPage() {
  const funnelStages = [
    { etapa: 'Leads Mapeados Outbound', qtd: 45, valor: 'R$ 112.500', pct: 100 },
    { etapa: 'Contatados & Respondeu', qtd: 32, valor: 'R$ 80.000', pct: 71 },
    { etapa: 'Análise de 20m Agendada', qtd: 21, valor: 'R$ 52.500', pct: 46 },
    { etapa: 'Proposta Apresentada', qtd: 15, valor: 'R$ 37.500', pct: 33 },
    { etapa: 'Contratos Fechados', qtd: 12, valor: 'R$ 30.000', pct: 26 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white tracking-tight">
            Relatórios & Performance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Métricas de conversão do funil, velocidade de fechamento e receita comercial.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="h-9 px-3.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Exportar PDF</span>
        </button>
      </div>

      {/* 2. Primary KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs text-slate-400 font-medium">Taxa de Conversão Global</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight">28.4%</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +4.2%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Lead outbound → contrato fechado</p>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs text-slate-400 font-medium">Ciclo Médio de Fechamento</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight">14 dias</span>
            <span className="text-xs text-cyan-400 font-medium flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> No prazo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Da primeira reunião até assinatura</p>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs text-slate-400 font-medium">Ticket Médio de Recorrência</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight">R$ 4.200</span>
            <span className="text-xs text-emerald-400 font-medium">+12%</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Média por cliente ativo</p>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs text-slate-400 font-medium">Taxa de Cancelamento (Churn)</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight">0.0%</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> 100% retidos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Últimos 90 dias de operação</p>
        </div>
      </section>

      {/* 3. Funnel Progression Breakdown */}
      <section className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-white">Desempenho por Etapa do Funil</h2>
          <p className="text-xs text-slate-400 mt-0.5">Evolução do volume e taxa de retenção entre etapas</p>
        </div>

        <div className="space-y-4">
          {funnelStages.map((row, idx) => {
            const opacities = ['bg-cyan-500/30', 'bg-cyan-500/45', 'bg-cyan-500/60', 'bg-cyan-500/80', 'bg-cyan-400'];
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">{row.etapa}</span>
                  <div className="text-slate-400 text-xs">
                    <span>{row.qtd} empresas ({row.pct}%)</span>
                    <span className="text-slate-600 mx-1.5">•</span>
                    <span className="text-white font-medium">{row.valor}</span>
                  </div>
                </div>

                <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
                  <div
                    className={`${opacities[idx % opacities.length]} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
