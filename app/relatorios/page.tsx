'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Users,
  Target,
  Clock,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

export default function RelatoriosPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
              Gestão Executiva • Métricas de Performance & Conversão
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            Relatórios & Performance Comercial
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Análise de taxa de conversão do funil, velocidade de fechamento e rendimento por responsável.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition-colors">
            <Download className="w-4 h-4 text-cyan-400" /> Exportar Relatório PDF
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Taxa de Conversão Funil</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-400">28.4%</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +4.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Lead Outbound → Contrato Fechado</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Tempo Médio de Fechamento</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-cyan-300 font-mono">14 Dias</span>
            <span className="text-xs font-semibold text-cyan-400 flex items-center gap-0.5">
              <Clock className="w-3.5 h-3.5" /> SLA Cumprido
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Da primeira reunião até assinatura</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Ticket Médio de Recorrência</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-100 font-mono">R$ 4.200</span>
            <span className="text-xs font-semibold text-emerald-400">+12%</span>
          </div>
          <p className="text-[11px] text-slate-500">Por cliente ativo em 2026</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Churn Rate (Taxa de Cancelamento)</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-100">0.0%</span>
            <span className="text-xs font-semibold text-emerald-400">Zero Cancelamentos</span>
          </div>
          <p className="text-[11px] text-slate-500">Últimos 90 dias</p>
        </div>
      </div>

      {/* Detailed Funnel Section */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6">
        <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          Desempenho por Etapa do Funil Comercial
        </h3>

        <div className="space-y-4">
          {[
            { etapa: '1. Leads Mapeados Outbound', qtd: 45, valor: 'R$ 112.500', pct: 100, color: 'bg-blue-600' },
            { etapa: '2. Contatados & Respondeu', qtd: 32, valor: 'R$ 80.000', pct: 71, color: 'bg-cyan-600' },
            { etapa: '3. Análise de 20m Agendada', qtd: 21, valor: 'R$ 52.500', pct: 46, color: 'bg-indigo-600' },
            { etapa: '4. Proposta Apresentada', qtd: 15, valor: 'R$ 37.500', pct: 33, color: 'bg-purple-600' },
            { etapa: '5. Fechados & Assinados', qtd: 12, valor: 'R$ 30.000', pct: 26, color: 'bg-emerald-500' }
          ].map((row, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-200">
                <span className="font-bold">{row.etapa}</span>
                <span className="font-mono text-slate-400">
                  {row.qtd} empresas ({row.pct}%) • <strong className="text-cyan-300">{row.valor}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div className={`${row.color} h-full rounded-full transition-all duration-500`} style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
