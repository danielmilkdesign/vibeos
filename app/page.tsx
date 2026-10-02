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
  INITIAL_MEETINGS
} from '../lib/crm-store';
import { INITIAL_LEADS } from '../lib/crm-initial-data';
import { Lead, Opportunity, Project, Contract, Meeting } from '../types/crm';

export default function DashboardPage() {
  const { user } = useAuth();

  const [leads] = useState<Lead[]>(() => getStoredData('vibe_leads', INITIAL_LEADS));
  const [opportunities] = useState<Opportunity[]>(() => getStoredData('vibe_opps', INITIAL_OPPORTUNITIES));
  const [projects] = useState<Project[]>(() => getStoredData('vibe_projects', INITIAL_PROJECTS_FULL));
  const [contracts] = useState<Contract[]>(() => getStoredData('vibe_contracts', INITIAL_CONTRACTS));
  const [meetings] = useState<Meeting[]>(() => getStoredData('vibe_meetings', INITIAL_MEETINGS));

  // Dynamic calculations with Stitch fallbacks
  const mappedCompaniesCount = leads.length > 0 ? leads.length : 10;
  const delayedFollowupsCount = 3;
  const pipelineTotal = opportunities.length > 0
    ? opportunities.reduce((acc, o) => acc + o.estimatedValue, 0)
    : 10779;
  const weightedRevenue = Math.round(pipelineTotal * 0.542);
  const activeContractsCount = contracts.length > 0 ? contracts.length : 3;
  const mrrTotal = contracts.length > 0
    ? contracts.filter((c) => c.status === 'ATIVO').reduce((acc, c) => acc + c.recurringValue, 0)
    : 490;

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
                +2 esta semana
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-disabled">Base qualificada AM</span>
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
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-danger/15 text-danger font-mono text-[10px] font-bold">
                Ação Imediata
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-disabled">Tempo médio &gt; 48h</span>
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
            <span className="font-mono text-[11px] text-text-secondary">4 negociações ativas</span>
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
            <span className="font-mono text-[11px] text-text-disabled">Probabilidade 54.2%</span>
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
              <span className="text-2xl font-bold text-text-primary">1</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-elevated text-secondary font-mono text-[10px] font-semibold">
                OdontoArt
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-secondary truncate">05/10 às 15:30</span>
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
              <span className="text-2xl font-bold text-warning">2</span>
              <span className="font-mono text-[10px] text-text-secondary">001 e 003</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-disabled">Aguardando decisão</span>
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
              <span className="text-2xl font-bold text-danger">1</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-danger/15 text-danger font-mono text-[10px] font-semibold">
                OdontoClin
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-disabled">Aguardando cliente</span>
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
            <span className="font-mono text-[11px] text-text-secondary">{activeContractsCount} contratos ativos</span>
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
                  Fechado Ganho: R$ 4.800 este mês
                </span>
              </div>
            </div>

            {/* Funnel Multi-segment Progress Bar */}
            <div className="flex flex-col gap-2">
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-primary hover:opacity-90 transition-opacity"
                  style={{ width: '28%' }}
                  title="Novo Lead: R$ 3.000 (3)"
                />
                <div
                  className="h-full bg-secondary hover:opacity-90 transition-opacity"
                  style={{ width: '22%' }}
                  title="Qualificado: R$ 2.400 (2)"
                />
                <div
                  className="h-full bg-surface-tint hover:opacity-90 transition-opacity"
                  style={{ width: '14%' }}
                  title="Análise Agendada: R$ 1.500 (1)"
                />
                <div
                  className="h-full bg-tertiary hover:opacity-90 transition-opacity"
                  style={{ width: '25%' }}
                  title="Proposta Enviada: R$ 2.689 (2)"
                />
                <div
                  className="h-full bg-warning hover:opacity-90 transition-opacity"
                  style={{ width: '11%' }}
                  title="Negociação: R$ 1.190 (1)"
                />
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
                <span className="text-lg font-bold text-text-primary mt-1">3</span>
                <span className="font-mono text-xs text-primary mt-0.5">R$ 3.000</span>
              </Link>
              <Link
                href="/pipeline"
                className="p-3 bg-surface-elevated rounded-lg border border-border-subtle flex flex-col hover:border-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-secondary">Qualificado</span>
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                </div>
                <span className="text-lg font-bold text-text-primary mt-1">2</span>
                <span className="font-mono text-xs text-secondary mt-0.5">R$ 2.400</span>
              </Link>
              <Link
                href="/pipeline"
                className="p-3 bg-surface-elevated rounded-lg border border-border-subtle flex flex-col hover:border-cyan-400/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-secondary truncate">Análise</span>
                  <span className="w-2 h-2 rounded-full bg-surface-tint" />
                </div>
                <span className="text-lg font-bold text-text-primary mt-1">1</span>
                <span className="font-mono text-xs text-surface-tint mt-0.5">R$ 1.500</span>
              </Link>
              <Link
                href="/pipeline"
                className="p-3 bg-surface-elevated rounded-lg border border-border-subtle flex flex-col hover:border-tertiary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-secondary truncate">Proposta</span>
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                </div>
                <span className="text-lg font-bold text-text-primary mt-1">2</span>
                <span className="font-mono text-xs text-tertiary mt-0.5">R$ 2.689</span>
              </Link>
              <Link
                href="/pipeline"
                className="p-3 bg-surface-elevated rounded-lg border border-border-subtle flex flex-col col-span-2 sm:col-span-1 hover:border-warning/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-secondary">Negociação</span>
                  <span className="w-2 h-2 rounded-full bg-warning" />
                </div>
                <span className="text-lg font-bold text-text-primary mt-1">1</span>
                <span className="font-mono text-xs text-warning mt-0.5">R$ 1.190</span>
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

            <div className="flex flex-col gap-3">
              {/* Item 1: Clínica Dra. Juliana Estética */}
              <Link
                href="/projetos/proj_001"
                className="bg-surface-elevated border border-border-subtle p-4 rounded-lg flex flex-col gap-3 hover:bg-surface-container-high transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-primary font-mono text-xs font-bold shrink-0">
                      JE
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-primary font-semibold truncate">
                          Clínica Dra. Juliana Estética
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-success/15 text-success font-mono text-[10px] font-semibold">
                          No prazo
                        </span>
                      </div>
                      <span className="text-xs text-text-secondary truncate">
                        Presença Própria (Setup + Landing Page)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                    <div className="flex flex-col text-right">
                      <span className="font-mono text-[10px] text-text-disabled">Prazo de Entrega</span>
                      <span className="font-mono text-xs text-text-primary">12/10/2026</span>
                    </div>
                    <div
                      className="w-7 h-7 rounded-full bg-surface-container-highest border border-border-subtle flex items-center justify-center font-mono text-[10px] text-text-primary"
                      title="Responsável: Daniel Leite"
                    >
                      DL
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-success h-full rounded-full transition-all" style={{ width: '75%' }} />
                  </div>
                  <span className="font-mono text-xs text-text-primary font-semibold">75%</span>
                </div>
              </Link>

              {/* Item 2: Harmonia & Face Estética */}
              <Link
                href="/projetos/proj_002"
                className="bg-surface-elevated border border-border-subtle p-4 rounded-lg flex flex-col gap-3 hover:bg-surface-container-high transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-secondary font-mono text-xs font-bold shrink-0">
                      HF
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-primary font-semibold truncate">
                          Harmonia & Face Estética
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-mono text-[10px] font-semibold">
                          Em análise
                        </span>
                      </div>
                      <span className="text-xs text-text-secondary truncate">
                        Esteira de Crescimento
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                    <div className="flex flex-col text-right">
                      <span className="font-mono text-[10px] text-text-disabled">Prazo de Entrega</span>
                      <span className="font-mono text-xs text-text-primary">18/10/2026</span>
                    </div>
                    <div
                      className="w-7 h-7 rounded-full bg-surface-container-highest border border-border-subtle flex items-center justify-center font-mono text-[10px] text-text-primary"
                      title="Responsável: Daniel Leite"
                    >
                      DL
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-secondary h-full rounded-full transition-all" style={{ width: '30%' }} />
                  </div>
                  <span className="font-mono text-xs text-text-primary font-semibold">30%</span>
                </div>
              </Link>

              {/* Item 3: OdontoClin Adrianópolis */}
              <Link
                href="/projetos/proj_003"
                className="bg-surface-elevated border border-border-subtle p-4 rounded-lg flex flex-col gap-3 hover:bg-surface-container-high transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-danger font-mono text-xs font-bold shrink-0">
                      OA
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-primary font-semibold truncate">
                          OdontoClin Adrianópolis
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-danger/15 text-danger font-mono text-[10px] font-semibold flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" />
                          Em Risco
                        </span>
                      </div>
                      <span className="text-xs text-danger/90 truncate">
                        Identidade & Redes (Plano 12 Artes) — Aguardando aprovação de artes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                    <div className="flex flex-col text-right">
                      <span className="font-mono text-[10px] text-danger">Prazo Crítico</span>
                      <span className="font-mono text-xs text-danger font-semibold">08/10/2026</span>
                    </div>
                    <div
                      className="w-7 h-7 rounded-full bg-surface-container-highest border border-border-subtle flex items-center justify-center font-mono text-[10px] text-text-primary"
                      title="Responsável: Daniel Leite"
                    >
                      DL
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-danger h-full rounded-full transition-all" style={{ width: '45%' }} />
                  </div>
                  <span className="font-mono text-xs text-danger font-semibold">45%</span>
                </div>
              </Link>
            </div>
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
              <span className="font-mono text-xs text-text-disabled">3 compromissos</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Event 1 */}
              <Link
                href="/agenda"
                className="p-3 bg-surface-elevated border border-border-subtle rounded-lg flex items-start gap-3 hover:bg-surface-container-high transition-colors"
              >
                <div className="flex flex-col items-center justify-center w-12 py-1.5 bg-surface border border-border-subtle rounded text-center shrink-0">
                  <span className="font-mono text-[10px] text-text-secondary uppercase">Out</span>
                  <span className="font-mono text-sm font-bold text-text-primary">05</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-text-primary font-semibold truncate">
                      Análise OdontoArt
                    </span>
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary font-mono text-[10px] rounded flex items-center gap-0.5">
                      <Video className="w-2.5 h-2.5" /> Meet
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-text-secondary mt-0.5">
                    15:30 • Dr. Fernando Alencar
                  </span>
                  <span className="text-[11px] text-text-disabled truncate mt-0.5">
                    Apresentação de diagnóstico comercial
                  </span>
                </div>
              </Link>

              {/* Event 2 */}
              <Link
                href="/agenda"
                className="p-3 bg-surface-elevated border border-border-subtle rounded-lg flex items-start gap-3 hover:bg-surface-container-high transition-colors"
              >
                <div className="flex flex-col items-center justify-center w-12 py-1.5 bg-surface border border-border-subtle rounded text-center shrink-0">
                  <span className="font-mono text-[10px] text-primary uppercase font-bold">Hoje</span>
                  <span className="font-mono text-sm font-bold text-primary">16h</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-text-primary font-semibold truncate">
                      Follow-up Harmonia & Face
                    </span>
                    <span className="px-1.5 py-0.5 bg-success/10 text-success font-mono text-[10px] rounded flex items-center gap-0.5">
                      <MessageSquare className="w-2.5 h-2.5" /> WhatsApp
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-text-secondary mt-0.5">
                    16:00 • Dra. Camila Ramos
                  </span>
                  <span className="text-[11px] text-text-disabled truncate mt-0.5">
                    Cobrança de alinhamento de ativos
                  </span>
                </div>
              </Link>

              {/* Event 3 */}
              <Link
                href="/agenda"
                className="p-3 bg-surface-elevated border border-border-subtle rounded-lg flex items-start gap-3 hover:bg-surface-container-high transition-colors"
              >
                <div className="flex flex-col items-center justify-center w-12 py-1.5 bg-surface border border-border-subtle rounded text-center shrink-0">
                  <span className="font-mono text-[10px] text-text-secondary uppercase">Amanhã</span>
                  <span className="font-mono text-sm font-bold text-text-secondary">10h</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-text-primary font-semibold truncate">
                      Revisão OdontoClin
                    </span>
                    <span className="px-1.5 py-0.5 bg-surface-container text-text-secondary font-mono text-[10px] rounded">
                      Interno
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-text-secondary mt-0.5">
                    10:00 • Validação de Criativos
                  </span>
                  <span className="text-[11px] text-text-disabled truncate mt-0.5">
                    Remodelação do lote de artes
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Widget: Atenção Necessária */}
          <div className="bg-surface p-6 rounded-xl border border-border-subtle flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h2 className="text-base font-bold text-text-primary">Atenção Necessária</h2>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-danger" />
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Alerta Âmbar */}
              <div className="p-3 bg-surface-elevated border border-amber-500/20 rounded-lg flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-warning">
                      Proposta Prestes a Expirar
                    </span>
                    <span className="font-mono text-[10px] text-text-disabled">13 dias</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    A proposta <strong className="text-text-primary font-mono">VIBE-2026-001</strong> para{' '}
                    <span className="text-text-primary">Studio FitManaus</span> precisa de toque antes do descarte.
                  </p>
                </div>
              </div>

              {/* Alerta Vermelho */}
              <div className="p-3 bg-surface-elevated border border-rose-500/20 rounded-lg flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-danger">
                      Gargalo de Materiais
                    </span>
                    <span className="font-mono text-[10px] text-danger font-bold">4 dias atrás</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    <span className="text-text-primary font-medium">Harmonia & Face</span> aguarda envio de logos vetorizados e acessos ao domínio.
                  </p>
                </div>
              </div>

              {/* Alerta Azul */}
              <div className="p-3 bg-surface-elevated border border-cyan-500/20 rounded-lg flex items-start gap-2.5">
                <RefreshCw className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">
                      Renovação de Contrato MRR
                    </span>
                    <span className="font-mono text-[10px] text-text-disabled">13 dias</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Contrato da <span className="text-text-primary">Advocacia Castro & Assis</span> entra no ciclo de renovação trimestral.
                  </p>
                </div>
              </div>
            </div>

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
