'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import { getStoredData, setStoredData } from '../../lib/crm-store';

interface Cliente {
  id: string;
  nome: string;
  nicho: string;
  status: 'ATIVO' | 'PROSPECT' | 'PAUSADO' | 'ENCERRADO';
  servicos: string[];
  mrr: number;
  projetoAtual: string;
  renovacaoEm: string;
  saude: 'SAUDAVEL' | 'ATENCAO' | 'RISCO';
  ultimoContato: string;
  decisor: string;
  whatsapp: string;
}

const CLIENTES_INICIAIS: Cliente[] = [
  {
    id: 'emp-1',
    nome: 'Clínica Dra. Ana Silva',
    nicho: 'Estética',
    status: 'ATIVO',
    servicos: ['Esteira de Crescimento', 'Anúncios Meta/Google'],
    mrr: 4500,
    projetoAtual: 'Lançamento Campanha Outono',
    renovacaoEm: '15/11/2026',
    saude: 'SAUDAVEL',
    ultimoContato: 'Há 2 dias',
    decisor: 'Dra. Ana Silva',
    whatsapp: '5592991002233'
  },
  {
    id: 'emp-2',
    nome: 'Instituto OrtoOdonto',
    nicho: 'Odontologia',
    status: 'ATIVO',
    servicos: ['Presença Própria', 'SEO Local'],
    mrr: 3200,
    projetoAtual: 'Reformulação da Identidade e Site',
    renovacaoEm: '01/12/2026',
    saude: 'ATENCAO',
    ultimoContato: 'Há 5 dias',
    decisor: 'Dr. Roberto Santos',
    whatsapp: '5592998887766'
  },
  {
    id: 'emp-3',
    nome: 'Studio Fit Performance',
    nicho: 'Fitness',
    status: 'PAUSADO',
    servicos: ['Campanha Semestral'],
    mrr: 0,
    projetoAtual: 'Aguardando Reabertura de Vagas',
    renovacaoEm: '10/10/2026',
    saude: 'RISCO',
    ultimoContato: 'Há 12 dias',
    decisor: 'Lucas Mendes',
    whatsapp: '5592981114455'
  },
  {
    id: 'emp-4',
    nome: 'Advocacia Lima & Associados',
    nicho: 'Advocacia',
    status: 'ATIVO',
    servicos: ['Sistema sob Medida', 'Gestão de Conteúdo'],
    mrr: 6800,
    projetoAtual: 'Módulo de Agendamento OAB',
    renovacaoEm: '20/01/2027',
    saude: 'SAUDAVEL',
    ultimoContato: 'Hoje',
    decisor: 'Dr. Fernando Lima',
    whatsapp: '5592993332211'
  }
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(() =>
    getStoredData('vibe_clientes', CLIENTES_INICIAIS)
  );
  const [tabFilter, setTabFilter] = useState<'TODOS' | 'ATIVO' | 'PROSPECT' | 'PAUSADO' | 'ENCERRADO'>('ATIVO');
  const [searchTerm, setSearchTerm] = useState('');
  const [saudeFilter, setSaudeFilter] = useState<string>('ALL');

  const filteredClientes = clientes.filter((c) => {
    const matchesTab = tabFilter === 'TODOS' || c.status === tabFilter;
    const matchesSearch =
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nicho.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.decisor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSaude = saudeFilter === 'ALL' || c.saude === saudeFilter;
    return matchesTab && matchesSearch && matchesSaude;
  });

  const totalMRR = clientes.filter(c => c.status === 'ATIVO').reduce((acc, curr) => acc + curr.mrr, 0);
  const totalAtivos = clientes.filter(c => c.status === 'ATIVO').length;
  const clientesEmRisco = clientes.filter(c => c.saude === 'RISCO').length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
              Relacionamento & Retenção • MRR & LTV
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Users className="w-7 h-7 text-cyan-400" />
            Clientes & Saúde da Carteira
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Acompanhamento de retenção, renovações, serviços ativos e indicador de saúde do cliente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/empresas"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Building2 className="w-4 h-4 text-cyan-400" /> Ver Lista de Empresas
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Clientes Ativos</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-100">{totalAtivos}</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
              100% retidos
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">MRR da Carteira Ativa</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-300 font-mono">
              R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-400">Mensal</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Clientes em Risco</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400">{clientesEmRisco}</span>
            <span className="text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-full">
              Ação necessária
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Renovações em 60 dias</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-300">2</span>
            <span className="text-[11px] text-amber-400 font-mono">Pre-renewal</span>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {(['ATIVO', 'TODOS', 'PROSPECT', 'PAUSADO', 'ENCERRADO'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTabFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  tabFilter === tab
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tab === 'TODOS' ? 'Todos os Clientes' : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente ou decisor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={saudeFilter}
              onChange={(e) => setSaudeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">Todas as Saúdes</option>
              <option value="SAUDAVEL">Saudável</option>
              <option value="ATENCAO">Atenção</option>
              <option value="RISCO">Risco</option>
            </select>
          </div>
        </div>

        {/* Clients Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClientes.map((cliente) => (
            <div
              key={cliente.id}
              className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-100 text-sm">{cliente.nome}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono">
                      {cliente.nicho}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Decisor: {cliente.decisor}</p>
                </div>

                {/* Health Badge */}
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold font-mono flex items-center gap-1 border ${
                    cliente.saude === 'SAUDAVEL'
                      ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
                      : cliente.saude === 'ATENCAO'
                      ? 'bg-amber-950/70 border-amber-800 text-amber-300'
                      : 'bg-rose-950/70 border-rose-800 text-rose-400 animate-pulse'
                  }`}
                >
                  {cliente.saude === 'SAUDAVEL' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : cliente.saude === 'ATENCAO' ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <ShieldAlert className="w-3 h-3" />
                  )}
                  {cliente.saude}
                </span>
              </div>

              {/* Service & MRR details */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-900 text-xs">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-semibold">Serviços Contratados</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cliente.servicos.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-semibold">MRR Mensal</p>
                  <p className="font-mono font-bold text-cyan-300 text-sm mt-0.5">
                    R$ {cliente.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Current Project & Renewal */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 text-xs space-y-1">
                <p className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> Projeto Atual:
                  <span className="text-slate-200 font-medium ml-1">{cliente.projetoAtual}</span>
                </p>
                <p className="text-slate-500 text-[11px]">
                  Próxima Renovação: <span className="text-slate-300 font-mono">{cliente.renovacaoEm}</span> • Último contato: {cliente.ultimoContato}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <a
                  href={`https://wa.me/${cliente.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Decisor
                </a>

                <Link
                  href={`/empresas/${cliente.id}`}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  Ver Ficha 360° <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
