'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { getStoredData } from '../../lib/crm-store';

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

const CLIENTES_INICIAIS: Cliente[] = [];

export default function ClientesPage() {
  const [clientes] = useState<Cliente[]>(() =>
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
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white tracking-tight">
            Clientes & Carteira
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Acompanhamento de retenção, renovações e saúde das contas ativas.
          </p>
        </div>

        <Link
          href="/empresas"
          className="h-8 px-3 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Ver Empresas</span>
        </Link>
      </div>

      {/* 2. Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs text-slate-400 font-medium">Clientes Ativos</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight">{totalAtivos}</span>
            <span className="text-xs text-emerald-400 font-medium">100% retidos</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs text-slate-400 font-medium">MRR da Carteira Ativa</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-white tracking-tight">
              R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400">/mês</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs text-slate-400 font-medium">Contas em Atenção</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-semibold tracking-tight ${clientesEmRisco > 0 ? 'text-amber-400' : 'text-white'}`}>
              {clientesEmRisco}
            </span>
            <span className="text-xs text-slate-400">
              {clientesEmRisco > 0 ? 'Requer contato' : 'Nenhuma em risco'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs text-slate-400 font-medium">Renovações em 60 dias</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight">2</span>
            <span className="text-xs text-slate-400">Pré-renovação</span>
          </div>
        </div>
      </section>

      {/* 3. Toolbar & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['ATIVO', 'TODOS', 'PROSPECT', 'PAUSADO', 'ENCERRADO'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTabFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  tabFilter === tab
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                {tab === 'TODOS' ? 'Todos' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente ou decisor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/[0.15] transition-colors"
              />
            </div>

            <select
              value={saudeFilter}
              onChange={(e) => setSaudeFilter(e.target.value)}
              className="h-8 px-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todas as Saúdes</option>
              <option value="SAUDAVEL">Saudável</option>
              <option value="ATENCAO">Atenção</option>
              <option value="RISCO">Risco</option>
            </select>
          </div>
        </div>

        {/* 4. Client List / Empty State */}
        {filteredClientes.length === 0 ? (
          <div className="py-16 text-center rounded-xl bg-white/[0.015] border border-white/[0.05] p-6 space-y-3">
            <Users className="w-8 h-8 mx-auto text-slate-500" />
            <div>
              <h3 className="text-sm font-medium text-white">Nenhum cliente cadastrado ainda</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Cadastre clientes a partir de oportunidades ganhas ou crie novos registros em Empresas.
              </p>
            </div>
            <Link
              href="/empresas"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ver Lista de Empresas</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClientes.map((cliente) => (
              <div
                key={cliente.id}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white">{cliente.nome}</h3>
                      <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400 text-[10px]">
                        {cliente.nicho}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Decisor: {cliente.decisor}</p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${
                      cliente.saude === 'SAUDAVEL'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : cliente.saude === 'ATENCAO'
                        ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {cliente.saude === 'SAUDAVEL' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {cliente.saude}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.04] text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Serviços</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cliente.servicos.map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300 text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">MRR Mensal</span>
                    <span className="font-semibold text-white text-sm mt-0.5 block">
                      R$ {cliente.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.015] border border-white/[0.03] text-xs space-y-1">
                  <p className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> Projeto:
                    <span className="text-slate-200 font-medium ml-1">{cliente.projetoAtual}</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Renovação: {cliente.renovacaoEm} • Contato: {cliente.ultimoContato}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
                  <a
                    href={`https://wa.me/${cliente.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </a>

                  <Link
                    href={`/empresas/${cliente.id}`}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Ficha 360°</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
