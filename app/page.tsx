'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
  UserPlus,
  Plus,
  AlertCircle,
  Video,
  CheckCircle2,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import {
  getStoredData,
  INITIAL_OPPORTUNITIES,
  INITIAL_PROJECTS_FULL,
  INITIAL_CONTRACTS,
  INITIAL_MEETINGS,
  INITIAL_PROPOSALS
} from '../lib/crm-store';
import { INITIAL_LEADS } from '../lib/crm-initial-data';
import { Lead, Opportunity, Project, Contract, Meeting, Proposal } from '../types/crm';

export default function DashboardPage() {
  const { user } = useAuth();

  const [leads] = useState<Lead[]>(() => getStoredData('vibe_leads', INITIAL_LEADS));
  const [opportunities] = useState<Opportunity[]>(() => getStoredData('vibe_opps', INITIAL_OPPORTUNITIES));
  const [projects] = useState<Project[]>(() => getStoredData('vibe_projects', INITIAL_PROJECTS_FULL));
  const [contracts] = useState<Contract[]>(() => getStoredData('vibe_contracts', INITIAL_CONTRACTS));
  const [meetings] = useState<Meeting[]>(() => getStoredData('vibe_meetings', INITIAL_MEETINGS));
  const [proposals] = useState<Proposal[]>(() => getStoredData('vibe_proposals', INITIAL_PROPOSALS));

  // Core business calculations
  const pipelineTotal = opportunities.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);
  const activeContracts = contracts.filter((c) => c.status === 'ATIVO');
  const mrrTotal = activeContracts.reduce((acc, c) => acc + (c.recurringValue || 0), 0);
  const delayedFollowupsCount = opportunities.filter(
    (o) => o.stage === 'ABORDADO_WHATSAPP' || o.stage === 'REUNIAO_AGENDADA'
  ).length;
  const riskyProjectsCount = projects.filter((p) => p.riskLevel === 'CRITICO' || p.riskLevel === 'ATENCAO').length;
  const urgentCount = delayedFollowupsCount + riskyProjectsCount;

  // Stages
  const stageNovo = opportunities.filter((o) => o.stage === 'LEAD_NOVO');
  const stageQualificado = opportunities.filter((o) => o.stage === 'DIAGNOSTICO_GERADO' || o.stage === 'ABORDADO_WHATSAPP');
  const stageAnalise = opportunities.filter((o) => o.stage === 'REUNIAO_AGENDADA');
  const stageProposta = opportunities.filter((o) => o.stage === 'PROPOSTA_ENVIADA');
  const stageNegociacao = opportunities.filter((o) => o.stage === 'FECHADO');

  const stageNovoTotal = stageNovo.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);
  const stageQualificadoTotal = stageQualificado.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);
  const stageAnaliseTotal = stageAnalise.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);
  const stagePropostaTotal = stageProposta.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);
  const stageNegociacaoTotal = stageNegociacao.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);

  const stagesList = [
    { label: 'Novo Lead', count: stageNovo.length, total: stageNovoTotal, pct: pipelineTotal > 0 ? (stageNovoTotal / pipelineTotal) * 100 : 0 },
    { label: 'Qualificado', count: stageQualificado.length, total: stageQualificadoTotal, pct: pipelineTotal > 0 ? (stageQualificadoTotal / pipelineTotal) * 100 : 0 },
    { label: 'Análise Agendada', count: stageAnalise.length, total: stageAnaliseTotal, pct: pipelineTotal > 0 ? (stageAnaliseTotal / pipelineTotal) * 100 : 0 },
    { label: 'Proposta Enviada', count: stageProposta.length, total: stagePropostaTotal, pct: pipelineTotal > 0 ? (stagePropostaTotal / pipelineTotal) * 100 : 0 },
    { label: 'Em Fechamento', count: stageNegociacao.length, total: stageNegociacaoTotal, pct: pipelineTotal > 0 ? (stageNegociacaoTotal / pipelineTotal) * 100 : 0 },
  ];

  const firstName = user?.name ? user.name.split(' ')[0] : 'Daniel';

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      {/* 1. Header: Clean, Human & Direct */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white tracking-tight">
            Visão Geral
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Olá, {firstName}. {urgentCount > 0 ? `${urgentCount} pendência${urgentCount > 1 ? 's' : ''} requer${urgentCount > 1 ? 'em' : ''} atenção hoje.` : 'Todas as operações estão em dia.'}
          </p>
        </div>

        {/* Action Buttons: Unified, quiet hierarchy */}
        <div className="flex items-center gap-2">
          <Link
            href="/prospeccao"
            className="h-9 px-3 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-400" />
            <span>Novo Lead</span>
          </Link>
          <Link
            href="/pipeline"
            className="h-9 px-3 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Oportunidade</span>
          </Link>
          <Link
            href="/propostas"
            className="h-9 px-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Nova Proposta</span>
          </Link>
        </div>
      </header>

      {/* 2. Key Metrics: 4 Essential Cards (Substitui os 8 cards sobrecarregados) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pipeline Aberto */}
        <Link
          href="/pipeline"
          className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pipeline Aberto</span>
            <TrendingUp className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-semibold text-white tracking-tight">
              R$ {pipelineTotal.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {opportunities.length} negociaç{opportunities.length === 1 ? 'ão ativa' : 'ões ativas'}
            </div>
          </div>
        </Link>

        {/* Metric 2: MRR Ativo */}
        <Link
          href="/contratos"
          className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Receita Recorrente (MRR)</span>
            <DollarSign className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-semibold text-white tracking-tight">
              R$ {mrrTotal.toLocaleString('pt-BR')}
              <span className="text-xs font-normal text-slate-400 ml-1">/mês</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {activeContracts.length} contrato{activeContracts.length === 1 ? ' ativo' : 's ativos'}
            </div>
          </div>
        </Link>

        {/* Metric 3: Reuniões Agendadas */}
        <Link
          href="/agenda"
          className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Reuniões da Semana</span>
            <Calendar className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-semibold text-white tracking-tight">
              {meetings.length}
            </div>
            <div className="text-xs text-slate-400 mt-1 truncate">
              {meetings.length > 0 ? `Próxima: ${meetings[0].companyName}` : 'Nenhum agendamento'}
            </div>
          </div>
        </Link>

        {/* Metric 4: Atenção Necessária */}
        <Link
          href="/pipeline"
          className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Atenção Imediata</span>
            <AlertCircle className={`w-4 h-4 ${urgentCount > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-semibold tracking-tight ${urgentCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                {urgentCount}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {delayedFollowupsCount > 0
                ? `${delayedFollowupsCount} follow-up${delayedFollowupsCount > 1 ? 's' : ''} aguardando`
                : 'Zero atrasos operacionais'}
            </div>
          </div>
        </Link>
      </section>

      {/* 3. Pipeline Breakdown: Clean Single Section */}
      <section className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Funil Comercial</h2>
            <p className="text-xs text-slate-400 mt-0.5">Distribuição do volume monetário por estágio</p>
          </div>
          <Link
            href="/pipeline"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Ver Kanban</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Unified Monochrome Progress Strip */}
        <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden flex gap-0.5 mb-5">
          {pipelineTotal > 0 ? (
            stagesList.map((stg, idx) => {
              if (stg.pct === 0) return null;
              const opacities = ['bg-cyan-500/30', 'bg-cyan-500/50', 'bg-cyan-500/70', 'bg-cyan-500/90', 'bg-cyan-400'];
              return (
                <div
                  key={stg.label}
                  className={`h-full ${opacities[idx % opacities.length]} transition-all`}
                  style={{ width: `${stg.pct}%` }}
                  title={`${stg.label}: R$ ${stg.total.toLocaleString('pt-BR')} (${stg.count})`}
                />
              );
            })
          ) : (
            <div className="w-full h-full bg-white/[0.04]" />
          )}
        </div>

        {/* Stage List Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {stagesList.map((stage) => (
            <div
              key={stage.label}
              className="p-3 rounded-lg bg-white/[0.015] border border-white/[0.04] flex flex-col"
            >
              <span className="text-xs text-slate-400 truncate">{stage.label}</span>
              <span className="text-base font-semibold text-white mt-1">
                {stage.count}
              </span>
              <span className="text-xs text-slate-400 font-medium mt-0.5">
                R$ {stage.total.toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Two Columns: Active Projects (60%) & Agenda/Focus (40%) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Projects */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Projetos em Andamento</h2>
              <p className="text-xs text-slate-400 mt-0.5">Entregas ativas da agência</p>
            </div>
            <Link
              href="/projetos"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Nenhum projeto em andamento.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {projects.slice(0, 4).map((p) => {
                const isWarning = p.riskLevel === 'CRITICO' || p.riskLevel === 'ATENCAO';
                return (
                  <Link
                    key={p.id}
                    href={`/projetos/${p.id}`}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-white/[0.01] -mx-2 px-2 rounded-lg transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                          {p.nomeEmpresa}
                        </span>
                        {isWarning && (
                          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded font-medium">
                            Atenção
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">
                        {p.projectType || 'Projeto Digital'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="w-24 hidden sm:block">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Progresso</span>
                          <span>{p.progress || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${p.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right text-xs text-slate-400">
                        {p.dataPrevisao ? new Date(p.dataPrevisao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Sem prazo'}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Agenda & Priority Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Meetings */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Compromissos</h2>
              <Link
                href="/agenda"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Agenda</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {meetings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhuma reunião agendada para hoje.
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.slice(0, 3).map((m) => (
                  <Link
                    key={m.id}
                    href="/agenda"
                    className="p-3 rounded-lg bg-white/[0.015] border border-white/[0.04] hover:border-white/[0.1] transition-colors flex items-start gap-3 group"
                  >
                    <div className="text-center px-2 py-1 rounded bg-white/[0.04] text-xs font-semibold text-cyan-400 shrink-0">
                      {m.time}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                        {m.companyName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {m.contactName} • {m.mainBottleneck || 'Diagnóstico comercial'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Urgent Items if any */}
          {urgentCount > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/[0.03] border border-amber-500/20 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-medium mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>Pendências Prioritárias</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {delayedFollowupsCount > 0 && `${delayedFollowupsCount} oportunidade(s) no pipeline sem retorno há mais de 48h. `}
                {riskyProjectsCount > 0 && `${riskyProjectsCount} projeto(s) com gargalo ou entrega em risco.`}
              </p>
              <Link
                href="/pipeline"
                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline font-medium mt-2"
              >
                Resolver pendências <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
