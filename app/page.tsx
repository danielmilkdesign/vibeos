'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Building2,
  Calendar,
  FileText,
  Clock,
  ArrowRight,
  UserPlus,
  Zap,
  CalendarCheck,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  History,
  Video,
  MessageSquare,
  ShieldAlert
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

  // Dynamic calculations based strictly on real CRM data
  const mappedCompaniesCount = leads.length;
  const delayedFollowupsCount = opportunities.filter(
    (o) => o.stage === 'ABORDADO_WHATSAPP' || o.stage === 'REUNIAO_AGENDADA'
  ).length;
  const pipelineTotal = opportunities.reduce((acc, o) => acc + o.estimatedValue, 0);
  const weightedRevenue = Math.round(pipelineTotal * 0.5);
  const activeContracts = contracts.filter((c) => c.status === 'ATIVO');
  const activeContractsCount = activeContracts.length;
  const mrrTotal = activeContracts.reduce((acc, c) => acc + c.recurringValue, 0);
  const pendingProposalsCount = proposals.filter((p) => p.status === 'ENVIADA' || p.status === 'VISUALIZADA').length;
  const riskyProjectsCount = projects.filter((p) => p.riskLevel === 'CRITICO' || p.riskLevel === 'ATENCAO').length;

  const stageNovo = opportunities.filter((o) => o.stage === 'LEAD_NOVO');
  const stageQualificado = opportunities.filter((o) => o.stage === 'DIAGNOSTICO_GERADO' || o.stage === 'ABORDADO_WHATSAPP');
  const stageAnalise = opportunities.filter((o) => o.stage === 'REUNIAO_AGENDADA');
  const stageProposta = opportunities.filter((o) => o.stage === 'PROPOSTA_ENVIADA');
  const stageNegociacao = opportunities.filter((o) => o.stage === 'FECHADO');

  const stageNovoTotal = stageNovo.reduce((acc, o) => acc + o.estimatedValue, 0);
  const stageQualificadoTotal = stageQualificado.reduce((acc, o) => acc + o.estimatedValue, 0);
  const stageAnaliseTotal = stageAnalise.reduce((acc, o) => acc + o.estimatedValue, 0);
  const stagePropostaTotal = stageProposta.reduce((acc, o) => acc + o.estimatedValue, 0);
  const stageNegociacaoTotal = stageNegociacao.reduce((acc, o) => acc + o.estimatedValue, 0);

  return (
    <div className="bg-surface-container-lowest min-h-screen p-4 lg:p-8 space-y-6">
      {/* Top Operational Banner & Quick Actions */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-6 rounded-xl border border-border-subtle shadow-sm">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[11px] text-primary uppercase tracking-wider font-semibold">
              Centro de Operações Ativas
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mt-1">
            Painel Geral
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Bom dia, {user?.name.split(' ')[0] || 'Daniel'}. Aqui está o que precisa de atenção hoje em Manaus, AM.
          </p>
        </div>

        {/* Rapid Execution Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/prospeccao"
            className="h-9 px-3 bg-surface-elevated hover:bg-surface-container-high border border-border-subtle text-text-primary text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-primary" />
            <span>Criar Lead</span>
          </Link>
          <Link
            href="/pipeline"
            className="h-9 px-3 bg-surface-elevated hover:bg-surface-container-high border border-border-subtle text-text-primary text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-tertiary" />
            <span>Nova Oportunidade</span>
          </Link>
          <Link
            href="/agenda"
            className="h-9 px-3 bg-surface-elevated hover:bg-surface-container-high border border-border-subtle text-text-primary text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-secondary" />
            <span>Agendar Análise</span>
          </Link>
          <Link
            href="/propostas"
            className="h-9 px-3.5 bg-primary-container hover:bg-primary-hover text-surface-container-lowest text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-cyan-500/10"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Proposta</span>
          </Link>
        </div>
      </section>

      {/* 8 High-Density Key Operational Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Empresas Mapeadas */}
        <div className="bg-surface p-4 rounded-xl border border-border-subtle flex flex-col justify-between hover:bg-surface-elevated transition-colors group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Empresas Mapeadas</span>
              <Building2 className="w-4 h-4 text-text-disabled group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary">{mappedCompaniesCount}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-success/10 text-success font-mono text-[10px] font-semibold">
                {mappedCompaniesCount > 0 ? `${mappedCompaniesCount} ativas` : '0 cadastradas'}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-disabled">
              {mappedCompaniesCount > 0 ? 'Base qualificada AM' : 'Nenhuma empresa ainda'}
            </span>
            <Link href="/empresas" className="font-mono text-[11px] text-primary hover:underline flex items-center gap-1">
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 2. Follow-ups Atrasados */}
        <div className="bg-surface p-4 rounded-xl border border-border-subtle flex flex-col justify-between hover:bg-surface-elevated transition-colors group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Follow-ups Atrasados</span>
              <ShieldAlert className="w-4 h-4 text-danger" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-danger">{delayedFollowupsCount}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                delayedFollowupsCount > 0 ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'
              }`}>
                {delayedFollowupsCount > 0 ? 'Ação Imediata' : 'Tudo em dia'}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-disabled">
              {delayedFollowupsCount > 0 ? 'Tempo médio > 48h' : 'Sem atrasos'}
            </span>
            <Link href="/pipeline" className="font-mono text-[11px] text-primary hover:underline flex items-center gap-1">
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 3. Pipeline Aberto */}
        <div className="bg-surface p-4 rounded-xl border border-border-subtle flex flex-col justify-between hover:bg-surface-elevated transition-colors group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Pipeline Aberto</span>
              <TrendingUp className="w-4 h-4 text-text-disabled group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-text-primary">
                R$ {pipelineTotal.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-secondary">
              {opportunities.length} {opportunities.length === 1 ? 'negociação ativa' : 'negociações ativas'}
            </span>
            <Link href="/pipeline" className="font-mono text-[11px] text-primary hover:underline flex items-center gap-1">
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 4. Receita Ponderada */}
        <div className="bg-surface p-4 rounded-xl border border-border-subtle flex flex-col justify-between hover:bg-surface-elevated transition-colors group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Receita Ponderada</span>
              <Zap className="w-4 h-4 text-text-disabled group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-primary">
                R$ {weightedRevenue.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-disabled">Estimativa ponderada 50%</span>
            <Link href="/pipeline" className="font-mono text-[11px] text-primary hover:underline flex items-center gap-1">
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 5. Análises Esta Semana */}
        <div className="bg-surface p-4 rounded-xl border border-border-subtle flex flex-col justify-between hover:bg-surface-elevated transition-colors group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Análises Esta Semana</span>
              <Calendar className="w-4 h-4 text-text-disabled group-hover:text-secondary transition-colors" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary">{meetings.length}</span>
              {meetings.length > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-elevated text-secondary font-mono text-[10px] font-semibold">
                  {meetings[0].companyName}
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-secondary truncate">
              {meetings.length > 0 ? `${meetings[0].date} às ${meetings[0].time}` : 'Nenhuma reunião agendada'}
            </span>
            <Link href="/agenda" className="font-mono text-[11px] text-primary hover:underline flex items-center gap-1">
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 6. Propostas Sem Retorno */}
        <div className="bg-surface p-4 rounded-xl border border-border-subtle flex flex-col justify-between hover:bg-surface-elevated transition-colors group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Propostas Sem Retorno</span>
              <FileText className="w-4 h-4 text-warning" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-warning">{pendingProposalsCount}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-disabled">
              {pendingProposalsCount > 0 ? 'Aguardando decisão' : 'Nenhuma pendente'}
            </span>
            <Link href="/propostas" className="font-mono text-[11px] text-primary hover:underline flex items-center gap-1">
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 7. Projetos em Risco */}
        <div className="bg-surface p-4 rounded-xl border border-border-subtle flex flex-col justify-between hover:bg-surface-elevated transition-colors group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Projetos em Risco</span>
              <AlertTriangle className="w-4 h-4 text-danger" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-danger">{riskyProjectsCount}</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold ${
                riskyProjectsCount > 0 ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'
              }`}>
                {riskyProjectsCount > 0 ? 'Atenção' : 'Normal'}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-disabled">
              {riskyProjectsCount > 0 ? 'Gargalo operacional' : 'Zero atrasos'}
            </span>
            <Link href="/projetos" className="font-mono text-[11px] text-primary hover:underline flex items-center gap-1">
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 8. MRR Ativo */}
        <div className="bg-surface p-4 rounded-xl border border-border-subtle flex flex-col justify-between hover:bg-surface-elevated transition-colors group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">MRR Ativo</span>
              <RefreshCw className="w-4 h-4 text-success" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-success">
                R$ {mrrTotal.toLocaleString('pt-BR')}
              </span>
              <span className="font-mono text-[10px] text-text-secondary">/mês</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-secondary">
              {activeContractsCount} {activeContractsCount === 1 ? 'contrato ativo' : 'contratos ativos'}
            </span>
            <Link href="/contratos" className="font-mono text-[11px] text-primary hover:underline flex items-center gap-1">
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Operational Grid (65% Left / 35% Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Primary Workflow Column (65% width = 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Comercial Pipeline Funnel Overview */}
          <div className="bg-surface p-6 rounded-xl border border-border-subtle flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-text-primary">
                    Pipeline Comercial por Etapas
                  </h2>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Distribuição do volume monetário em curso
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-surface-elevated border border-emerald-800/40 text-success font-mono text-[11px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Fechado Ganho: R$ {stageNegociacaoTotal.toLocaleString('pt-BR')} este ciclo
                </span>
              </div>
            </div>

            {/* Funnel Multi-segment Progress Bar */}
            <div className="flex flex-col gap-2">
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex">
                {pipelineTotal > 0 ? (
                  <>
                    <div
                      className="h-full bg-primary hover:opacity-90 transition-opacity"
                      style={{ width: `${(stageNovoTotal / pipelineTotal) * 100}%` }}
                      title={`Novo Lead: R$ ${stageNovoTotal.toLocaleString('pt-BR')} (${stageNovo.length})`}
                    />
                    <div
                      className="h-full bg-secondary hover:opacity-90 transition-opacity"
                      style={{ width: `${(stageQualificadoTotal / pipelineTotal) * 100}%` }}
                      title={`Qualificado: R$ ${stageQualificadoTotal.toLocaleString('pt-BR')} (${stageQualificado.length})`}
                    />
                    <div
                      className="h-full bg-surface-tint hover:opacity-90 transition-opacity"
                      style={{ width: `${(stageAnaliseTotal / pipelineTotal) * 100}%` }}
                      title={`Análise Agendada: R$ ${stageAnaliseTotal.toLocaleString('pt-BR')} (${stageAnalise.length})`}
                    />
                    <div
                      className="h-full bg-tertiary hover:opacity-90 transition-opacity"
                      style={{ width: `${(stagePropostaTotal / pipelineTotal) * 100}%` }}
                      title={`Proposta Enviada: R$ ${stagePropostaTotal.toLocaleString('pt-BR')} (${stageProposta.length})`}
                    />
                    <div
                      className="h-full bg-warning hover:opacity-90 transition-opacity"
                      style={{ width: `${(stageNegociacaoTotal / pipelineTotal) * 100}%` }}
                      title={`Negociação / Fechado: R$ ${stageNegociacaoTotal.toLocaleString('pt-BR')} (${stageNegociacao.length})`}
                    />
                  </>
                ) : (
                  <div className="h-full bg-surface-elevated w-full" title="Nenhuma oportunidade cadastrada" />
                )}
              </div>
              <div className="flex items-center justify-between text-text-disabled font-mono text-[11px] px-1">
                <span>R$ 0</span>
                <span>Total em negociação: R$ {pipelineTotal.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Detailed Stage Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              <Link
                href="/pipeline"
                className="p-3 bg-surface-elevated rounded-lg border border-border-subtle flex flex-col hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-secondary">Novo Lead</span>
                  <span className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="text-lg font-bold text-text-primary mt-1">{stageNovo.length}</span>
                <span className="font-mono text-xs text-primary mt-0.5">R$ {stageNovoTotal.toLocaleString('pt-BR')}</span>
              </Link>
              <Link
                href="/pipeline"
                className="p-3 bg-surface-elevated rounded-lg border border-border-subtle flex flex-col hover:border-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-secondary">Qualificado</span>
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                </div>
                <span className="text-lg font-bold text-text-primary mt-1">{stageQualificado.length}</span>
                <span className="font-mono text-xs text-secondary mt-0.5">R$ {stageQualificadoTotal.toLocaleString('pt-BR')}</span>
              </Link>
              <Link
                href="/pipeline"
                className="p-3 bg-surface-elevated rounded-lg border border-border-subtle flex flex-col hover:border-cyan-400/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-secondary truncate">Análise</span>
                  <span className="w-2 h-2 rounded-full bg-surface-tint" />
                </div>
                <span className="text-lg font-bold text-text-primary mt-1">{stageAnalise.length}</span>
                <span className="font-mono text-xs text-surface-tint mt-0.5">R$ {stageAnaliseTotal.toLocaleString('pt-BR')}</span>
              </Link>
              <Link
                href="/pipeline"
                className="p-3 bg-surface-elevated rounded-lg border border-border-subtle flex flex-col hover:border-tertiary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-secondary truncate">Proposta</span>
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                </div>
                <span className="text-lg font-bold text-text-primary mt-1">{stageProposta.length}</span>
                <span className="font-mono text-xs text-tertiary mt-0.5">R$ {stagePropostaTotal.toLocaleString('pt-BR')}</span>
              </Link>
              <Link
                href="/pipeline"
                className="p-3 bg-surface-elevated rounded-lg border border-border-subtle flex flex-col col-span-2 sm:col-span-1 hover:border-warning/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-secondary">Negociação</span>
                  <span className="w-2 h-2 rounded-full bg-warning" />
                </div>
                <span className="text-lg font-bold text-text-primary mt-1">{stageNegociacao.length}</span>
                <span className="font-mono text-xs text-warning mt-0.5">R$ {stageNegociacaoTotal.toLocaleString('pt-BR')}</span>
              </Link>
            </div>
          </div>

          {/* Projetos Operacionais em Andamento */}
          <div className="bg-surface p-6 rounded-xl border border-border-subtle flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-text-primary">
                  Projetos em Andamento
                </h2>
              </div>
              <Link
                href="/projetos"
                className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
              >
                Ver quadro operacional <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 text-center bg-surface-elevated rounded-lg border border-dashed border-border-subtle flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-disabled">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Nenhum projeto em andamento</p>
                  <p className="text-xs text-text-secondary mt-0.5">Cadastre oportunidades ou aprove propostas para iniciar projetos.</p>
                </div>
                <Link
                  href="/projetos"
                  className="mt-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-mono text-xs font-semibold transition-colors"
                >
                  + Criar Projeto
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {projects.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/projetos/${p.id}`}
                    className="bg-surface-elevated border border-border-subtle p-4 rounded-lg flex flex-col gap-3 hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-primary font-mono text-xs font-bold shrink-0">
                          {p.nomeEmpresa ? p.nomeEmpresa.substring(0, 2).toUpperCase() : 'PR'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-text-primary font-semibold truncate">
                              {p.nomeEmpresa}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                                p.status === 'CONCLUIDO'
                                  ? 'bg-success/15 text-success'
                                  : p.riskLevel === 'CRITICO' || p.riskLevel === 'ATENCAO'
                                  ? 'bg-danger/15 text-danger'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              {p.status.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-xs text-text-secondary truncate">
                            {p.projectType || 'Projeto Digital'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                        <div className="flex flex-col text-right">
                          <span className="font-mono text-[10px] text-text-disabled">Prazo</span>
                          <span className="font-mono text-xs text-text-primary">
                            {p.dataPrevisao ? new Date(p.dataPrevisao).toLocaleDateString('pt-BR') : 'A definir'}
                          </span>
                        </div>
                        <div
                          className="w-7 h-7 rounded-full bg-surface-container-highest border border-border-subtle flex items-center justify-center font-mono text-[10px] text-text-primary"
                          title={`Responsável: ${p.ownerName || 'Daniel Leite'}`}
                        >
                          {(p.ownerName || 'DL').substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${p.progress || 0}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-text-primary font-semibold">{p.progress || 0}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Secondary Sidebar Column (35% width = 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Widget: Minha Agenda */}
          <div className="bg-surface p-6 rounded-xl border border-border-subtle flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                <h2 className="text-base font-bold text-text-primary">Minha Agenda</h2>
              </div>
              <span className="font-mono text-xs text-text-disabled">{meetings.length} compromissos</span>
            </div>

            {meetings.length === 0 ? (
              <div className="p-6 text-center bg-surface-elevated rounded-lg border border-dashed border-border-subtle flex flex-col items-center justify-center gap-2">
                <Calendar className="w-6 h-6 text-text-disabled" />
                <p className="text-xs font-semibold text-text-primary">Nenhum compromisso agendado</p>
                <p className="text-[11px] text-text-secondary">Sua agenda está livre para hoje e próximos dias.</p>
                <Link
                  href="/agenda"
                  className="mt-1 px-3 py-1 bg-surface hover:bg-surface-container-high border border-border-subtle text-primary font-mono text-[11px] rounded transition-colors"
                >
                  + Agendar Análise
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {meetings.map((m) => (
                  <Link
                    key={m.id}
                    href="/agenda"
                    className="p-3 bg-surface-elevated border border-border-subtle rounded-lg flex items-start gap-3 hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center w-12 py-1.5 bg-surface border border-border-subtle rounded text-center shrink-0">
                      <span className="font-mono text-[10px] text-text-secondary uppercase">Data</span>
                      <span className="font-mono text-xs font-bold text-text-primary">{m.time}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-text-primary font-semibold truncate">
                          {m.companyName}
                        </span>
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary font-mono text-[10px] rounded flex items-center gap-0.5">
                          <Video className="w-2.5 h-2.5" /> Meet
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-text-secondary mt-0.5">
                        {m.contactName}
                      </span>
                      <span className="text-[11px] text-text-disabled truncate mt-0.5">
                        {m.mainBottleneck || m.recommendedOffer || 'Análise comercial'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Widget: Atenção Necessária */}
          <div className="bg-surface p-6 rounded-xl border border-border-subtle flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h2 className="text-base font-bold text-text-primary">Atenção Necessária</h2>
              </div>
              {delayedFollowupsCount > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-danger" />
                </span>
              )}
            </div>

            {delayedFollowupsCount === 0 && riskyProjectsCount === 0 ? (
              <div className="p-6 text-center bg-surface-elevated rounded-lg border border-dashed border-border-subtle flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-success" />
                <p className="text-xs font-semibold text-text-primary">Tudo em dia!</p>
                <p className="text-[11px] text-text-secondary">Nenhum gargalo, lead atrasado ou alerta crítico ativo no momento.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {delayedFollowupsCount > 0 && (
                  <div className="p-3 bg-surface-elevated border border-amber-500/20 rounded-lg flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-warning">Follow-ups Pendentes</span>
                        <span className="font-mono text-[10px] text-text-disabled">{delayedFollowupsCount} alvos</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Existem oportunidades aguardando contato ou reunião no pipeline.
                      </p>
                    </div>
                  </div>
                )}
                {riskyProjectsCount > 0 && (
                  <div className="p-3 bg-surface-elevated border border-rose-500/20 rounded-lg flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-danger">Projetos em Atenção</span>
                        <span className="font-mono text-[10px] text-danger font-bold">{riskyProjectsCount} projetos</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Projetos com pendências de assets ou prazos críticos.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link
              href="/relatorios"
              className="w-full py-2 bg-surface hover:bg-surface-elevated border border-border-subtle text-text-secondary hover:text-text-primary rounded-lg font-mono text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Ver histórico de resoluções</span>
              <History className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

