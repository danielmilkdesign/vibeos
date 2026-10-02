'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  User,
  Plus,
  FileText,
  MessageSquare,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

export default function ProjetoDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState<'RESUMO' | 'TAREFAS' | 'ETAPAS' | 'ENTREGAS' | 'ARQUIVOS' | 'APROVACOES' | 'CONFORMIDADE' | 'HISTORICO'>('RESUMO');

  const projeto = {
    id: id || 'proj-1',
    nome: 'Campanha Tráfego Pago Outono',
    cliente: 'Clínica Dra. Ana Silva',
    servico: 'Esteira de Crescimento',
    progresso: 65,
    prazoContratado: '15/10/2026',
    prazoInterno: '10/10/2026',
    diasRestantes: 8,
    slaStatus: 'DENTRO_DO_PRAZO',
    risco: 'BAIXO',
    responsavel: 'Lucas Silva',
    status: 'EM_ANDAMENTO'
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/projetos"
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 mb-4 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Esteira de Projetos
        </Link>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-100">{projeto.nome}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono font-bold">
                  {projeto.servico}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[11px] font-mono font-bold">
                  SLA: 7 Dias
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cliente: <strong className="text-slate-200">{projeto.cliente}</strong> • Resp: {projeto.responsavel}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar Tarefa
              </button>
            </div>
          </div>

          {/* Progress Bar & SLA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800/80 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-mono">
                <span>Progresso do Projeto</span>
                <span className="text-cyan-400 font-bold">{projeto.progresso}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full" style={{ width: `${projeto.progresso}%` }} />
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">Prazo Contratado:</span>
              <span className="font-mono font-bold text-slate-100">{projeto.prazoContratado} ({projeto.diasRestantes} dias)</span>
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">Nível de Risco:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono font-bold">
                {projeto.risco}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-3">
          {(
            [
              { id: 'RESUMO', label: 'Resumo Operacional' },
              { id: 'TAREFAS', label: 'Tarefas (8/12)' },
              { id: 'ETAPAS', label: 'Etapas & Milestones' },
              { id: 'ENTREGAS', label: 'Entregas & Criativos' },
              { id: 'ARQUIVOS', label: 'Arquivos & Links' },
              { id: 'APROVACOES', label: 'Aprovações' },
              { id: 'CONFORMIDADE', label: 'Checklist Conformidade' },
              { id: 'HISTORICO', label: 'Histórico' }
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab View */}
        {activeTab === 'RESUMO' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="font-extrabold text-slate-100 text-sm">Próximos Passos & SLA</h3>
              <p className="text-xs text-slate-300">
                1. Finalização da produção de copies para anúncios (Prazo interno: 04/10).<br />
                2. Configuração de conversão de pixel (Prazo interno: 06/10).<br />
                3. Lançamento oficial da campanha (10/10).
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="font-extrabold text-slate-100 text-sm">Status do Cliente</h3>
              <p className="text-xs text-slate-300">
                • Material enviado: <strong className="text-emerald-400">100% recebido</strong><br />
                • Aprovações pendentes: <strong className="text-amber-300">1 peça em revisão</strong><br />
                • Bloqueios operacionais: <strong className="text-slate-400">Nenhum no momento</strong>
              </p>
            </div>
          </div>
        )}

        {activeTab !== 'RESUMO' && (
          <div className="p-8 text-center bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-200 text-sm">Módulo de {activeTab} do Projeto</h4>
            <p className="text-xs text-slate-400">Todas as entregas, revisões e tarefas estão integradas na esteira de produção do VIBE OS.</p>
          </div>
        )}
      </div>
    </div>
  );
}
