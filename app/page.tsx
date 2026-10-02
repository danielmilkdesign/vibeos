'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Building2,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Layers,
  Calendar,
  FileText,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { getStoredData, setStoredData, INITIAL_OPPORTUNITIES, INITIAL_PROJECTS_FULL, INITIAL_CONTRACTS, INITIAL_MEETINGS } from '../lib/crm-store';
import { INITIAL_LEADS } from '../lib/crm-initial-data';
import { Lead, Opportunity, Project, Contract, Meeting } from '../types/crm';
import { useAuth } from '../lib/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const [leads] = useState<Lead[]>(() => getStoredData('vibe_leads', INITIAL_LEADS));
  const [opportunities] = useState<Opportunity[]>(() => getStoredData('vibe_opps', INITIAL_OPPORTUNITIES));
  const [projects] = useState<Project[]>(() => getStoredData('vibe_projects', INITIAL_PROJECTS_FULL));
  const [contracts] = useState<Contract[]>(() => getStoredData('vibe_contracts', INITIAL_CONTRACTS));
  const [meetings] = useState<Meeting[]>(() => getStoredData('vibe_meetings', INITIAL_MEETINGS));

  // Calculated Metrics
  const pipelineTotal = opportunities.reduce((acc, o) => acc + o.estimatedValue, 0);
  const mrrTotal = contracts.filter(c => c.status === 'ATIVO').reduce((acc, c) => acc + c.recurringValue, 0);
  const activeProjects = projects.filter(p => p.status !== 'CONCLUIDO');
  const criticalLeads = leads.filter(l => l.urgencia === 'CRITICA');
  const criticalProjects = projects.filter(p => p.riskLevel === 'ATENCAO' || p.riskLevel === 'CRITICO');

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
              VIBE OS • Manaus, AM
            </span>
            <span className="text-xs text-slate-400">Perfil: <strong className="text-slate-200">{user?.role}</strong></span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Painel Geral de Controle Comercial & Operacional
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Prospecção Outbound, Funil de Vendas, SLA de Produção 7 Dias e MRR Recorrente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="px-4 py-2 bg-slate-950 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow"
          >
            <Building2 className="w-4 h-4 text-cyan-400" /> + Novo Lead Outbound
          </Link>
          <Link
            href="/propostas"
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Criar Proposta
          </Link>
        </div>
      </div>

      {/* Metrics Row 1: Commercial Overview */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" /> Indicadores Comerciais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-cyan-800/60 transition-all">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Empresas Mapeadas (Outbound)</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-slate-100">{leads.length}</span>
              <span className="text-xs text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                {criticalLeads.length} Sem Site
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Origem: DataForSEO / Semrush Manaus</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-cyan-800/60 transition-all">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Oportunidades Abertas</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-cyan-400">{opportunities.length}</span>
              <span className="text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 font-mono">
                Ponderado: R$ {(pipelineTotal * 0.45).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Etapas: Análise / Proposta / Negociação</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-cyan-800/60 transition-all">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Valor em Pipeline</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-emerald-400">R$ {pipelineTotal.toLocaleString('pt-BR')}</span>
              <span className="text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Ticket: R$ 2.450
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Setup + Recorrência Contratada</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-cyan-800/60 transition-all">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Receita Recorrente (MRR)</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-indigo-400">R$ {mrrTotal.toLocaleString('pt-BR')}/mês</span>
              <span className="text-xs text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                {contracts.length} Contratos
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Planos de Artes & Esteira de Crescimento</p>
          </div>
        </div>
      </div>

      {/* Grid Section: Pipeline & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Commercial Pipeline Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kanban / Pipeline Quick Summary */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Pipeline Comercial Ativo
              </h3>
              <Link href="/pipeline" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                Ver Kanban Completo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-800/50 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-200">{opp.companyName}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-mono">
                        {opp.stage.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{opp.title}</p>
                    <div className="text-[11px] text-cyan-400/80 mt-1 font-mono flex items-center gap-2">
                      <span>Próxima ação: {opp.nextAction}</span>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col justify-between sm:justify-center items-end border-t sm:border-0 border-slate-800 pt-2 sm:pt-0">
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      R$ {opp.estimatedValue.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[10px] text-slate-400">Probabilidade {opp.probability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA 7 Days Projects Pipeline */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Esteira de Projetos (Garantia SLA 7 Dias)
              </h3>
              <Link href="/projetos" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                Gerenciar Projetos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {activeProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{proj.nomeEmpresa}</h4>
                      <p className="text-xs text-slate-400">{proj.projectType} • Resp: {proj.ownerName}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                        proj.riskLevel === 'CRITICO'
                          ? 'bg-rose-950 text-rose-400 border-rose-800'
                          : proj.riskLevel === 'ATENCAO'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}
                    >
                      Risco {proj.riskLevel}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                      <span>Progresso: {proj.progress}%</span>
                      <span>SLA: 7 dias corridos</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Meetings & Alerts */}
        <div className="space-y-6">
          {/* Upcoming 20-min Analysis Meetings */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-semibold text-slate-100 text-sm mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" /> Agenda de Análise (20 min)
            </h3>
            {meetings.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhuma reunião agendada para hoje.</p>
            ) : (
              <div className="space-y-3">
                {meetings.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-200">{m.companyName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
                        {m.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Decisor: {m.contactName}</p>
                    <a
                      href={m.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-[10px] text-cyan-400 hover:underline font-mono"
                    >
                      Link: {m.meetingUrl}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Contracts & Recurrence */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-semibold text-slate-100 text-sm mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Recorrência Mensal (Franquias)
            </h3>
            <div className="space-y-3">
              {contracts.map((c) => (
                <div key={c.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-200">{c.companyName}</span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">R$ {c.recurringValue}/mês</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{c.offerName}</p>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1 font-mono">
                    <span>Franquia: {c.deliveriesUsed}/{c.deliveryLimit} artes</span>
                    <span>Vencimento Dia {c.dueDay}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
