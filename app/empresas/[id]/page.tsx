'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Building2,
  Phone,
  Mail,
  MessageSquare,
  Globe,
  Calendar,
  Clock,
  FileText,
  Layers,
  FileCheck,
  History,
  Plus,
  ArrowLeft,
  User,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import {
  getStoredData,
  INITIAL_OPPORTUNITIES,
  INITIAL_PROJECTS_FULL,
  INITIAL_CONTRACTS,
  INITIAL_PROPOSALS
} from '../../../lib/crm-store';
import { INITIAL_COMPANIES } from '../../../lib/crm-initial-data';
import { Company, Opportunity, Project, Contract, Proposal } from '../../../types/crm';

export default function EmpresaDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState<'VISAO_GERAL' | 'OPORTUNIDADES' | 'PROPOSTAS' | 'PROJETOS' | 'CONTRATOS'>('VISAO_GERAL');

  const companies = getStoredData<Company[]>('vibe_companies', INITIAL_COMPANIES);
  const foundCompany = companies.find(e => e.id === id) || INITIAL_COMPANIES[0];

  const opportunities = getStoredData<Opportunity[]>('vibe_opps', INITIAL_OPPORTUNITIES).filter(
    o => o.companyId === id || o.companyName.toLowerCase().includes(foundCompany.name.toLowerCase())
  );

  const projects = getStoredData<Project[]>('vibe_projects', INITIAL_PROJECTS_FULL).filter(
    p => p.companyId === id || p.nomeEmpresa.toLowerCase().includes(foundCompany.name.toLowerCase())
  );

  const contracts = getStoredData<Contract[]>('vibe_contracts', INITIAL_CONTRACTS).filter(
    c => c.companyName.toLowerCase().includes(foundCompany.name.toLowerCase())
  );

  const proposals = getStoredData<Proposal[]>('vibe_proposals', INITIAL_PROPOSALS).filter(
    p => p.clientName.toLowerCase().includes(foundCompany.name.toLowerCase()) || p.companyId === id
  );

  const cleanPhone = (foundCompany.whatsapp || foundCompany.decisorPhone || '5592992027059').replace(/\D/g, '');

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Header */}
      <div>
        <Link
          href="/empresas"
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 mb-4 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Empresas & Contas
        </Link>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan-600/20">
                {foundCompany.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-100">{foundCompany.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono font-bold">
                    {foundCompany.nicho}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                    foundCompany.isClient
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}>
                    {foundCompany.isClient ? 'CLIENTE ATIVO' : 'PROSPECT'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                  <span>Decisor: <strong className="text-slate-200">{foundCompany.decisorName || 'A confirmar'}</strong> ({foundCompany.decisorRole || 'Representante'})</span>
                  <span>•</span>
                  <span>{foundCompany.city}, {foundCompany.state}</span>
                  <span>•</span>
                  <span>Resp: <strong className="text-cyan-400">{foundCompany.ownerName || 'Victor Belichar'}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Conversar no WhatsApp
              </a>
              {foundCompany.website && (
                <a
                  href={foundCompany.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Globe className="w-4 h-4 text-cyan-400" /> Site
                </a>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Receita Recorrente (MRR)</span>
              <span className="text-emerald-400 font-bold text-base">R$ {(foundCompany.mrr || 0).toLocaleString('pt-BR')}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Oportunidades</span>
              <span className="text-cyan-400 font-bold text-base">{opportunities.length}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Projetos Executados</span>
              <span className="text-indigo-400 font-bold text-base">{projects.length}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Contratos Vigentes</span>
              <span className="text-purple-400 font-bold text-base">{contracts.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('VISAO_GERAL')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all ${
            activeTab === 'VISAO_GERAL'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Visão Geral & Contato
        </button>
        <button
          onClick={() => setActiveTab('OPORTUNIDADES')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'OPORTUNIDADES'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Oportunidades ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveTab('PROPOSTAS')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'PROPOSTAS'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Propostas ({proposals.length})
        </button>
        <button
          onClick={() => setActiveTab('PROJETOS')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'PROJETOS'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Projetos SLA ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('CONTRATOS')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'CONTRATOS'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Contratos ({contracts.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'VISAO_GERAL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" /> Dados do Decisor & Contato
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Nome:</span>
                <span className="font-bold text-slate-200">{foundCompany.decisorName || 'A confirmar'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Cargo:</span>
                <span className="text-slate-200">{foundCompany.decisorRole || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">WhatsApp Comercial:</span>
                <span className="text-cyan-400 font-mono">{foundCompany.whatsapp || '(92) 99202-7059'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">E-mail:</span>
                <span className="text-slate-200">{foundCompany.decisorEmail || 'contato@vibe.tech'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Localização:</span>
                <span className="text-slate-200">{foundCompany.city}, {foundCompany.state}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Saúde da Conta & Conformidade
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Status de Relacionamento:</span>
                <span className="text-emerald-400 font-bold font-mono">SAUDÁVEL (Ativo)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Garantia SLA VIBE:</span>
                <span className="text-cyan-400 font-bold font-mono">7 Dias Corridos</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Normas Éticas:</span>
                <span className="text-slate-200 font-mono">Auditoria CFO / OAB Concluída</span>
              </div>
            </div>
            <Link
              href="/pipeline"
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Ver no Pipeline Comercial
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'OPORTUNIDADES' && (
        <div className="space-y-4">
          {opportunities.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Nenhuma oportunidade vinculada a esta empresa no momento.
            </div>
          ) : (
            opportunities.map(opp => (
              <div key={opp.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{opp.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Etapa: <strong className="text-cyan-400 font-mono">{opp.stage}</strong> • Resp: {opp.ownerName}</p>
                  {opp.nextAction && (
                    <p className="text-[11px] text-amber-300 mt-1 font-mono">Próximo Passo: {opp.nextAction}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-emerald-400 block">R$ {opp.estimatedValue.toLocaleString('pt-BR')}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Probabilidade: {opp.probability}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'PROPOSTAS' && (
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Nenhuma proposta gerada para esta conta ainda.
            </div>
          ) : (
            proposals.map(prop => (
              <div key={prop.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                    {prop.proposalNumber}
                  </span>
                  <h4 className="font-bold text-slate-100 text-sm mt-1">{prop.offerTitle}</h4>
                  <p className="text-xs text-slate-400">{prop.scopeText}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-emerald-400 block">
                    R$ {prop.setupValue.toLocaleString('pt-BR')} {prop.recurringValue > 0 && `+ R$ ${prop.recurringValue}/mês`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Status: {prop.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'PROJETOS' && (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Nenhum projeto em esteira para esta conta.
            </div>
          ) : (
            projects.map(proj => (
              <div key={proj.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{proj.nomeEmpresa} - {proj.projectType}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Status: <strong className="text-cyan-400 font-mono">{proj.status}</strong> • Progresso: {proj.progress}%</p>
                </div>
                <Link
                  href={`/projetos/${proj.id}`}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-900/40 hover:text-cyan-300 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors border border-slate-700"
                >
                  Ver Projeto <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'CONTRATOS' && (
        <div className="space-y-4">
          {contracts.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Nenhum contrato recorrente cadastrado para esta conta.
            </div>
          ) : (
            contracts.map(c => (
              <div key={c.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">
                    {c.contractNumber}
                  </span>
                  <h4 className="font-bold text-slate-100 text-sm mt-1">{c.offerName}</h4>
                  <p className="text-xs text-slate-400 font-mono">Entregas no Ciclo: {c.deliveriesUsed || 0}/{c.deliveryLimit} artes</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-emerald-400 block">R$ {c.recurringValue.toLocaleString('pt-BR')}/mês</span>
                  <span className="text-[10px] text-slate-400 font-mono">Vencimento: dia {c.dueDay}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
