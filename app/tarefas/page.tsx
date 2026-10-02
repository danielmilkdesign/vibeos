'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  User,
  Layers,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { getStoredData, setStoredData } from '../../lib/crm-store';

interface Tarefa {
  id: string;
  titulo: string;
  projeto: string;
  cliente: string;
  responsavel: string;
  prazo: string;
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  status: 'A_FAZER' | 'EM_ANDAMENTO' | 'EM_REVISAO' | 'AGUARDANDO_CLIENTE' | 'BLOQUEADA' | 'CONCLUIDA';
  aguardandoCliente: boolean;
  diasAtraso?: number;
}

const TAREFAS_INICIAIS: Tarefa[] = [
  {
    id: 'tar-1',
    titulo: 'Revisão de Copies para Campanha Meta Ads',
    projeto: 'Lançamento Campanha Outono',
    cliente: 'Clínica Dra. Ana Silva',
    responsavel: 'Lucas Silva',
    prazo: '03/10/2026',
    prioridade: 'ALTA',
    status: 'EM_ANDAMENTO',
    aguardandoCliente: false
  },
  {
    id: 'tar-2',
    titulo: 'Aprovação de Mockups da Landing Page OAB',
    projeto: 'Módulo de Agendamento OAB',
    cliente: 'Advocacia Lima & Associados',
    responsavel: 'Fernanda Rocha',
    prazo: '01/10/2026',
    prioridade: 'ALTA',
    status: 'AGUARDANDO_CLIENTE',
    aguardandoCliente: true,
    diasAtraso: 1
  },
  {
    id: 'tar-3',
    titulo: 'Configuração de Tags no Google Tag Manager',
    projeto: 'Reformulação da Identidade e Site',
    cliente: 'Instituto OrtoOdonto',
    responsavel: 'Gabriel Souza',
    prazo: '05/10/2026',
    prioridade: 'MEDIA',
    status: 'A_FAZER',
    aguardandoCliente: false
  },
  {
    id: 'tar-4',
    titulo: 'Exportação do Relatório Mensal de Desempenho',
    projeto: 'Esteira de Crescimento - Mensal',
    cliente: 'Clínica Dra. Ana Silva',
    responsavel: 'Lucas Silva',
    prazo: '02/10/2026',
    prioridade: 'MEDIA',
    status: 'EM_REVISAO',
    aguardandoCliente: false
  },
  {
    id: 'tar-5',
    titulo: 'Coleta de credenciais do Instagram para automação',
    projeto: 'Aguardando Reabertura de Vagas',
    cliente: 'Studio Fit Performance',
    responsavel: 'Mariana Costa',
    prazo: '28/09/2026',
    prioridade: 'BAIXA',
    status: 'BLOQUEADA',
    aguardandoCliente: true,
    diasAtraso: 4
  }
];

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>(() =>
    getStoredData('vibe_tarefas_ui', TAREFAS_INICIAIS)
  );
  const [viewMode, setViewMode] = useState<'MINHAS' | 'TODAS' | 'ATRASADAS'>('TODAS');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleTaskConcluida = (id: string) => {
    const updated = tarefas.map(t => {
      if (t.id === id) {
        const nextStatus: Tarefa['status'] = t.status === 'CONCLUIDA' ? 'A_FAZER' : 'CONCLUIDA';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTarefas(updated);
    setStoredData('vibe_tarefas_ui', updated);
  };

  const filteredTarefas = tarefas.filter((t) => {
    if (viewMode === 'ATRASADAS' && !t.diasAtraso && t.status !== 'BLOQUEADA') return false;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPrioridade = prioridadeFilter === 'ALL' || t.prioridade === prioridadeFilter;
    const matchesSearch =
      t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.projeto.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPrioridade && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
              Operação & SLA • Tarefas de Projetos
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-cyan-400" />
            Gestão de Tarefas
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Controle de demandas operacionais, entregas de sprint e bloqueios de cliente.
          </p>
        </div>

        <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/25">
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      {/* View Selector & Search Filter Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('TODAS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                viewMode === 'TODAS'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Todas as Tarefas ({tarefas.length})
            </button>
            <button
              onClick={() => setViewMode('ATRASADAS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                viewMode === 'ATRASADAS'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-slate-950 text-rose-400 border border-rose-900/40 hover:bg-rose-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Atrasadas & Bloqueadas
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por tarefa, cliente ou projeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">Todos os Status</option>
              <option value="A_FAZER">A Fazer</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="EM_REVISAO">Em Revisão</option>
              <option value="AGUARDANDO_CLIENTE">Aguardando Cliente</option>
              <option value="BLOQUEADA">Bloqueada</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-3">
          {filteredTarefas.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                t.status === 'CONCLUIDA'
                  ? 'bg-slate-950/40 border-slate-900 opacity-60'
                  : t.diasAtraso
                  ? 'bg-rose-950/20 border-rose-900/50'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => toggleTaskConcluida(t.id)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    t.status === 'CONCLUIDA'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-700 hover:border-cyan-500 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-extrabold ${
                        t.status === 'CONCLUIDA' ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {t.titulo}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono border ${
                        t.prioridade === 'ALTA'
                          ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                          : t.prioridade === 'MEDIA'
                          ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {t.prioridade}
                    </span>

                    {t.aguardandoCliente && (
                      <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 text-[10px] font-mono">
                        Aguardando Cliente
                      </span>
                    )}

                    {t.diasAtraso && (
                      <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-mono animate-pulse">
                        {t.diasAtraso}d em atraso
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="text-cyan-400 font-semibold">{t.cliente}</span> • {t.projeto}
                  </p>
                </div>
              </div>

              {/* Meta & Status pill */}
              <div className="flex items-center justify-between md:justify-end gap-4 text-xs pt-2 md:pt-0 border-t md:border-t-0 border-slate-900">
                <div className="text-right">
                  <p className="text-slate-400 text-[11px] flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" /> {t.responsavel}
                  </p>
                  <p className="text-slate-500 text-[10px] flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3" /> Prazo: {t.prazo}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono font-bold">
                  {t.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
