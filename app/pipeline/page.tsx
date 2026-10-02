'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Video,
  Gavel,
  Store,
  Building,
  Dumbbell,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Lock,
  Plus,
  Eye,
  FileText
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { getStoredData, setStoredData, INITIAL_OPPORTUNITIES } from '../../lib/crm-store';
import { Opportunity } from '../../types/crm';

interface KanbanColumn {
  id: string;
  title: string;
  colorDot: string;
  totalAcc: number;
}

export default function PipelinePage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() =>
    getStoredData('vibe_opps', INITIAL_OPPORTUNITIES)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [isNewOppModalOpen, setIsNewOppModalOpen] = useState(false);

  // Mandatory Next Action Prompt State
  const [pendingMove, setPendingMove] = useState<{ oppId: string; newStage: any } | null>(null);
  const [nextActionText, setNextActionText] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDecisor, setNewDecisor] = useState('');
  const [newValue, setNewValue] = useState(2200);
  const [newStage, setNewStage] = useState('QUALIFICADO');

  const totalPipeline = opportunities.reduce((acc, o) => acc + o.estimatedValue, 0);
  const weightedValue = Math.round(opportunities.reduce((acc, o) => acc + o.estimatedValue * (o.probability / 100), 0));

  const columns: KanbanColumn[] = [
    { id: 'QUALIFICADO', title: 'Qualificado', colorDot: 'bg-text-disabled', totalAcc: 3700 },
    { id: 'ANALISE_AGENDADA', title: 'Análise Agendada', colorDot: 'bg-primary', totalAcc: 1500 },
    { id: 'ANALISE_REALIZADA', title: 'Análise Realizada', colorDot: 'bg-surface-tint', totalAcc: 2200 },
    { id: 'PROPOSTA_ENVIADA', title: 'Proposta Enviada', colorDot: 'bg-secondary', totalAcc: 4289 },
    { id: 'NEGOCIACAO', title: 'Em Negociação', colorDot: 'bg-warning', totalAcc: 1890 },
    { id: 'FECHADO_GANHO', title: 'Fechado Ganho', colorDot: 'bg-success', totalAcc: 7900 }
  ];

  const handleStageChangeInitiate = (oppId: string, targetStage: string) => {
    if (targetStage !== 'FECHADO_GANHO' && targetStage !== 'FECHADO_PERDIDO') {
      setPendingMove({ oppId, newStage: targetStage });
      setNextActionText('');
      setNextActionDate('');
    } else {
      executeStageUpdate(oppId, targetStage);
    }
  };

  const executeStageUpdate = (oppId: string, targetStage: string, actionNote?: string) => {
    const updated = opportunities.map((o) => {
      if (o.id === oppId) {
        return {
          ...o,
          stage: targetStage as any,
          nextAction: actionNote || o.nextAction,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });

    setOpportunities(updated);
    setStoredData('vibe_opps', updated);
    setPendingMove(null);
  };

  const handleConfirmNextAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingMove) return;
    executeStageUpdate(
      pendingMove.oppId,
      pendingMove.newStage,
      `${nextActionText} (${nextActionDate || 'Data em aberto'})`
    );
  };

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany) return;

    const newOpp: Opportunity = {
      id: `opp_${Date.now()}`,
      companyId: `comp_${Date.now()}`,
      title: newTitle || 'Presença Própria + Tráfego Local',
      companyName: newCompany,
      decisorName: newDecisor || 'Decisor a qualificar',
      offerName: 'Presença Própria (SLA 7d)',
      setupValue: Number(newValue),
      recurringValue: 0,
      stage: newStage as any,
      estimatedValue: Number(newValue),
      probability: newStage === 'QUALIFICADO' ? 30 : newStage === 'ANALISE_AGENDADA' ? 50 : 70,
      nextAction: 'Agendar diagnóstico inicial de 20 min',
      nextActionDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      ownerName: user?.name || 'Daniel Leite',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newOpp, ...opportunities];
    setOpportunities(updated);
    setStoredData('vibe_opps', updated);
    setIsNewOppModalOpen(false);
    setNewCompany('');
    setNewTitle('');
    setNewDecisor('');
  };

  const filteredOpps = opportunities.filter((opp) => {
    const matchesSearch =
      opp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opp.decisorName && opp.decisorName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="bg-surface-container-lowest min-h-screen p-4 lg:p-8 space-y-6">
      {/* Top Executive Overview & Tactical Metric Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-low p-6 rounded-xl border border-border-subtle shadow-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                Pipeline Comercial
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[11px] font-semibold">
                Q4 Ciclo Ativo
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Gestão visual do ciclo de vendas: da qualificação ao fechamento ganho com Próximo Passo Obrigatório.
            </p>
          </div>

          {/* Live Calculated Summary Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-col bg-surface-elevated px-4 py-2.5 rounded-lg border border-border-subtle shadow-sm min-w-[140px]">
              <span className="font-mono text-[10px] text-text-secondary uppercase tracking-wider">
                Total em Pipeline
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-mono text-base font-bold text-text-primary">
                  R$ {totalPipeline.toLocaleString('pt-BR')}
                </span>
                <span className="font-mono text-[11px] text-success font-semibold">+14%</span>
              </div>
            </div>

            <div className="flex flex-col bg-surface-elevated px-4 py-2.5 rounded-lg border border-border-subtle shadow-sm min-w-[140px]">
              <span className="font-mono text-[10px] text-text-secondary uppercase tracking-wider">
                Valor Ponderado
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-mono text-base font-bold text-primary">
                  R$ {weightedValue.toLocaleString('pt-BR')}
                </span>
                <span className="font-mono text-[11px] text-text-disabled">54.1%</span>
              </div>
            </div>

            <div className="flex flex-col bg-surface-elevated px-4 py-2.5 rounded-lg border border-border-subtle shadow-sm min-w-[140px]">
              <span className="font-mono text-[10px] text-text-secondary uppercase tracking-wider">
                Taxa de Conversão
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-mono text-base font-bold text-success">28%</span>
                <span className="font-mono text-[10px] text-text-secondary">meta 25%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Control & Filtering Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface p-3 rounded-xl border border-border-subtle shadow-sm">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search filter input */}
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
              <input
                type="text"
                id="pipelineSearch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar oportunidade, decisor ou bairro..."
                className="w-full h-9 pl-9 pr-3 bg-surface-container rounded-lg border border-border-subtle text-text-primary placeholder:text-text-disabled text-xs focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Filter Pill: Responsavel */}
            <div className="flex items-center gap-1.5 h-9 px-3 bg-surface-container border border-border-subtle rounded-lg text-text-primary text-xs font-medium cursor-pointer">
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono text-[10px] font-bold">
                {user?.name?.split(' ').map((n) => n[0]).join('') || 'DL'}
              </div>
              <span>{user?.name || 'Daniel Leite'}</span>
            </div>

            {/* Filter Pill: Segmento */}
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="h-9 px-3 bg-surface-container border border-border-subtle rounded-lg text-text-secondary text-xs focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">Segmento: Todos</option>
              <option value="ESTETICA">Estética Integrativa</option>
              <option value="ODONTOLOGIA">Odontologia</option>
              <option value="ADVOCACIA">Advocacia</option>
            </select>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setIsNewOppModalOpen(true)}
            className="h-9 px-4 bg-primary hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-500/10 cursor-pointer transition-all"
            type="button"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nova Oportunidade</span>
          </button>
        </div>
      </div>

      {/* Horizontal Kanban Board (Min width 1720px for high density) */}
      <div className="w-full overflow-x-auto pb-6">
        <div className="flex items-start gap-4 min-w-[1720px]">
          {columns.map((col) => {
            const colOpps = filteredOpps.filter((o) => {
              const stage = o.stage as string;
              if (col.id === 'QUALIFICADO') return stage === 'QUALIFICADO' || stage === 'LEAD_NOVO';
              if (col.id === 'ANALISE_AGENDADA') return stage === 'ANALISE_AGENDADA' || stage === 'REUNIAO_AGENDADA';
              if (col.id === 'ANALISE_REALIZADA') return stage === 'ANALISE_REALIZADA' || stage === 'DIAGNOSTICO_GERADO';
              if (col.id === 'NEGOCIACAO') return stage === 'NEGOCIACAO' || stage === 'ABORDADO_WHATSAPP' || stage === 'ABORDADO_EMAIL';
              if (col.id === 'FECHADO_GANHO') return stage === 'FECHADO_GANHO' || stage === 'FECHADO';
              return stage === col.id;
            });
            const colTotal = colOpps.reduce((acc, o) => acc + o.estimatedValue, 0) || col.totalAcc;

            return (
              <div
                key={col.id}
                className={`flex-1 min-w-[280px] bg-surface-container-lowest border rounded-xl p-2.5 flex flex-col gap-2 shadow-sm ${
                  col.id === 'FECHADO_GANHO' ? 'border-t-2 border-t-success border-border-subtle' : 'border-border-subtle'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.colorDot}`} />
                    <span className="text-xs font-bold text-text-primary">{col.title}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-surface-elevated font-mono text-[10px] text-text-secondary font-semibold">
                      {colOpps.length}
                    </span>
                  </div>
                  {col.id === 'FECHADO_GANHO' ? (
                    <Lock className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <button
                      onClick={() => {
                        setNewStage(col.id);
                        setIsNewOppModalOpen(true);
                      }}
                      className="w-6 h-6 rounded hover:bg-surface-elevated flex items-center justify-center text-text-secondary hover:text-primary transition-colors"
                      title="Adicionar nesta etapa"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between px-1 text-text-disabled font-mono text-[11px] pb-1 border-b border-border-subtle/50">
                  <span>{col.id === 'FECHADO_GANHO' ? 'Este Ciclo' : 'Acumulado'}</span>
                  <span className={`font-semibold ${col.id === 'FECHADO_GANHO' ? 'text-success font-bold' : 'text-text-primary'}`}>
                    R$ {colTotal.toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex flex-col gap-2.5 min-h-[460px]">
                  {colOpps.map((opp) => {
                    const isDelayed = opp.companyName.includes('FitManaus');
                    return (
                      <div
                        key={opp.id}
                        className={`group p-3.5 bg-surface rounded-xl border shadow-sm hover:bg-surface-elevated transition-all flex flex-col gap-2 cursor-grab active:cursor-grabbing ${
                          isDelayed
                            ? 'border-l-4 border-l-danger border-border-subtle'
                            : col.id === 'FECHADO_GANHO'
                            ? 'border-border-subtle opacity-95 hover:opacity-100'
                            : 'border-border-subtle'
                        }`}
                      >
                        {/* Card Header Tag */}
                        <div className="flex items-start justify-between gap-1">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-semibold">
                            {opp.title.includes('Esteira') ? 'Esteira de Crescimento' : 'Presença Própria'}
                          </span>
                          {isDelayed ? (
                            <span className="px-1.5 py-0.5 rounded bg-danger/15 text-danger font-mono text-[10px] font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Atrasado 1d
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] text-text-disabled">Recente</span>
                          )}
                        </div>

                        {/* Company & Title */}
                        <div>
                          <div className="flex items-center gap-1 text-text-secondary text-[11px]">
                            <span>{opp.companyName}</span>
                          </div>
                          <h4 className="text-xs text-text-primary font-bold mt-0.5 leading-snug">
                            {opp.title}
                          </h4>
                        </div>

                        {/* Value / Decisor Box */}
                        <div className="bg-surface-container-low p-2 rounded-lg border border-border-subtle/40 flex items-center justify-between">
                          <div>
                            <span className="font-mono text-[9px] text-text-disabled block">
                              {col.id === 'FECHADO_GANHO' ? 'Total Contratado' : 'Valor Estimado'}
                            </span>
                            <span className={`font-mono text-xs font-bold ${col.id === 'FECHADO_GANHO' ? 'text-success' : 'text-text-primary'}`}>
                              R$ {opp.estimatedValue.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-[9px] text-text-disabled block">Decisor</span>
                            <span className="text-[11px] text-text-secondary font-medium">
                              {opp.decisorName || 'Decisor'}
                            </span>
                          </div>
                        </div>

                        {/* Probability Micro-Bar (if not won) */}
                        {col.id !== 'FECHADO_GANHO' && (
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between font-mono text-[10px] text-text-disabled">
                              <span>Probabilidade</span>
                              <span className="text-primary font-semibold">{opp.probability}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  opp.probability > 60 ? 'bg-primary' : 'bg-text-disabled'
                                }`}
                                style={{ width: `${opp.probability}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Next Action Box / Status */}
                        {col.id === 'FECHADO_GANHO' ? (
                          <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50 text-[11px] text-text-secondary">
                            <span>Onboarding em Produção</span>
                            <span className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center font-mono text-[10px] font-bold">
                              ✓
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                              isDelayed ? 'bg-danger/10 text-danger' : 'bg-surface-container-low/70 text-text-secondary'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate text-[11px]">{opp.nextAction}</span>
                            </div>
                          </div>
                        )}

                        {/* Card Footer: Advance Action Dropdown */}
                        {col.id !== 'FECHADO_GANHO' && (
                          <div className="flex items-center justify-between pt-1 border-t border-border-subtle/40 text-[11px]">
                            <select
                              value={opp.stage}
                              onChange={(e) => handleStageChangeInitiate(opp.id, e.target.value)}
                              className="bg-surface-container border border-border-subtle rounded px-1.5 py-0.5 text-[10px] font-mono text-primary focus:outline-none cursor-pointer"
                            >
                              <option value="QUALIFICADO">Mover: Qualificado</option>
                              <option value="ANALISE_AGENDADA">Mover: Análise</option>
                              <option value="ANALISE_REALIZADA">Mover: Diagnóstico</option>
                              <option value="PROPOSTA_ENVIADA">Mover: Proposta</option>
                              <option value="NEGOCIACAO">Mover: Negociação</option>
                              <option value="FECHADO_GANHO">Mover: Fechado Ganho ✓</option>
                            </select>

                            <div
                              className="w-5 h-5 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-mono text-[9px] font-bold"
                              title={`Responsável: ${opp.ownerName}`}
                            >
                              DL
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Next Action Modal */}
      {pendingMove && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border-subtle w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-text-primary">
                Regra 1: Próximo Passo Obrigatório
              </h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              No VIBE OS, toda oportunidade em aberto precisa de um compromisso e data limite agendada para não esfriar no pipeline.
            </p>

            <form onSubmit={handleConfirmNextAction} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-secondary font-semibold mb-1">Qual a próxima ação?</label>
                <input
                  type="text"
                  required
                  value={nextActionText}
                  onChange={(e) => setNextActionText(e.target.value)}
                  placeholder="Ex: Apresentar Proposta VIBE / Follow-up WhatsApp"
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Data Limite da Ação</label>
                <input
                  type="date"
                  required
                  value={nextActionDate}
                  onChange={(e) => setNextActionDate(e.target.value)}
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setPendingMove(null)}
                  className="px-4 py-2 bg-surface-container-high text-text-secondary hover:text-text-primary rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-cyan-300 text-slate-950 font-bold rounded-lg shadow-sm"
                >
                  Confirmar Avanço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Opportunity Modal */}
      {isNewOppModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border-subtle w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-text-primary">Nova Oportunidade no Pipeline</h3>
            <form onSubmit={handleCreateOpportunity} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-secondary font-semibold mb-1">Empresa</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Ex: Prime Odonto Adrianópolis"
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Título da Oferta</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Presença Própria (Setup + SEO Local)"
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary font-semibold mb-1">Decisor</label>
                  <input
                    type="text"
                    value={newDecisor}
                    onChange={(e) => setNewDecisor(e.target.value)}
                    placeholder="Dr. Fernando"
                    className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary font-semibold mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsNewOppModalOpen(false)}
                  className="px-4 py-2 bg-surface-container-high text-text-secondary hover:text-text-primary rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-container hover:bg-primary-hover text-surface-container-lowest font-bold rounded-lg shadow-sm"
                >
                  Criar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
