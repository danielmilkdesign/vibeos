'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Clock,
  Lock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { getStoredData, setStoredData, INITIAL_OPPORTUNITIES } from '../../lib/crm-store';
import { Opportunity } from '../../types/crm';

interface KanbanColumn {
  id: string;
  title: string;
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

  const totalPipeline = opportunities.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);
  const weightedValue = Math.round(opportunities.reduce((acc, o) => acc + (o.estimatedValue || 0) * ((o.probability || 0) / 100), 0));
  const closedWonCount = opportunities.filter((o) => (o.stage as string) === 'FECHADO_GANHO' || (o.stage as string) === 'FECHADO').length;
  const conversionRate = opportunities.length > 0 ? Math.round((closedWonCount / opportunities.length) * 100) : 0;
  const weightedPercent = totalPipeline > 0 ? ((weightedValue / totalPipeline) * 100).toFixed(0) : '0';

  const columns: KanbanColumn[] = [
    { id: 'QUALIFICADO', title: 'Qualificado' },
    { id: 'ANALISE_AGENDADA', title: 'Análise Agendada' },
    { id: 'ANALISE_REALIZADA', title: 'Diagnóstico Realizado' },
    { id: 'PROPOSTA_ENVIADA', title: 'Proposta Enviada' },
    { id: 'NEGOCIACAO', title: 'Em Negociação' },
    { id: 'FECHADO_GANHO', title: 'Fechado Ganho' }
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
      nextAction: 'Agendar diagnóstico inicial de 30 min',
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
    <div className="p-6 lg:p-8 space-y-6">
      {/* 1. Header & Summary Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white tracking-tight">
            Pipeline Comercial
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestão visual do funil de vendas e próximos passos com os clientes.
          </p>
        </div>

        {/* Clean Metrics Summary */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total no Funil</span>
            <span className="text-sm font-semibold text-white">R$ {totalPipeline.toLocaleString('pt-BR')}</span>
            <span className="text-[11px] text-slate-400 ml-1">({opportunities.length} deals)</span>
          </div>

          <div className="px-3.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Ponderado</span>
            <span className="text-sm font-semibold text-cyan-400">R$ {weightedValue.toLocaleString('pt-BR')}</span>
            <span className="text-[11px] text-slate-400 ml-1">({weightedPercent}%)</span>
          </div>

          <div className="px-3.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Conversão</span>
            <span className="text-sm font-semibold text-emerald-400">{conversionRate}%</span>
            <span className="text-[11px] text-slate-400 ml-1">({closedWonCount} ganhos)</span>
          </div>
        </div>
      </div>

      {/* 2. Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por empresa, oferta ou decisor..."
              className="w-full h-8 pl-8 pr-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/[0.15] transition-colors"
            />
          </div>

          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="h-8 px-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos os nichos</option>
            <option value="ESTETICA">Estética</option>
            <option value="ODONTOLOGIA">Odontologia</option>
            <option value="ADVOCACIA">Advocacia</option>
          </select>
        </div>

        <button
          onClick={() => setIsNewOppModalOpen(true)}
          className="h-8 px-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          type="button"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Oportunidade</span>
        </button>
      </div>

      {/* 3. Horizontal Kanban Board */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex items-start gap-3 min-w-max">
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
            const colTotal = colOpps.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);

            return (
              <div
                key={col.id}
                className="w-72 bg-white/[0.015] border border-white/[0.05] rounded-xl p-3 flex flex-col gap-2.5 shrink-0"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{col.title}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-[10px] text-slate-400 font-medium">
                      {colOpps.length}
                    </span>
                  </div>
                  {col.id === 'FECHADO_GANHO' ? (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <button
                      onClick={() => {
                        setNewStage(col.id);
                        setIsNewOppModalOpen(true);
                      }}
                      className="p-1 hover:bg-white/[0.06] rounded text-slate-500 hover:text-white transition-colors"
                      title="Adicionar nesta etapa"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
                  <span>Subtotal</span>
                  <span className={`font-medium ${col.id === 'FECHADO_GANHO' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    R$ {colTotal.toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex flex-col gap-2 min-h-[420px]">
                  {colOpps.length === 0 ? (
                    <div className="py-12 px-2 text-center text-xs text-slate-400 flex flex-col items-center justify-center my-auto">
                      <span>Nenhum deal nesta etapa</span>
                    </div>
                  ) : (
                    colOpps.map((opp) => {
                      const isDelayed = Boolean(opp.nextActionDate && new Date(opp.nextActionDate).getTime() < Date.now());
                      return (
                        <div
                          key={opp.id}
                          className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-colors flex flex-col gap-2 group"
                        >
                          {/* Company Name & Urgent Badge */}
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-medium text-white truncate">
                              {opp.companyName}
                            </span>
                            {isDelayed && (
                              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded font-medium shrink-0">
                                Atrasado
                              </span>
                            )}
                          </div>

                          {/* Offer Title */}
                          <div className="text-[11px] text-slate-400 truncate">
                            {opp.title}
                          </div>

                          {/* Value & Decisor */}
                          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-xs">
                            <span className={`font-semibold ${col.id === 'FECHADO_GANHO' ? 'text-emerald-400' : 'text-white'}`}>
                              R$ {opp.estimatedValue.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate max-w-[110px]">
                              {opp.decisorName || 'Decisor'}
                            </span>
                          </div>

                          {/* Next Action Box */}
                          {col.id !== 'FECHADO_GANHO' && opp.nextAction && (
                            <div className="px-2 py-1.5 rounded bg-white/[0.02] border border-white/[0.03] text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                              <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{opp.nextAction}</span>
                            </div>
                          )}

                          {/* Card Footer: Stage Advance Dropdown */}
                          {col.id !== 'FECHADO_GANHO' && (
                            <div className="flex items-center justify-between pt-1 text-[11px]">
                              <select
                                value={opp.stage}
                                onChange={(e) => handleStageChangeInitiate(opp.id, e.target.value)}
                                className="bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5 text-[10px] text-cyan-400 focus:outline-none cursor-pointer"
                              >
                                <option value="QUALIFICADO">Mover: Qualificado</option>
                                <option value="ANALISE_AGENDADA">Mover: Análise</option>
                                <option value="ANALISE_REALIZADA">Mover: Diagnóstico</option>
                                <option value="PROPOSTA_ENVIADA">Mover: Proposta</option>
                                <option value="NEGOCIACAO">Mover: Negociação</option>
                                <option value="FECHADO_GANHO">Mover: Fechado ✓</option>
                              </select>

                              <div
                                className="w-5 h-5 rounded-full bg-white/[0.06] text-slate-300 flex items-center justify-center text-[9px] font-medium"
                                title={`Responsável: ${opp.ownerName}`}
                              >
                                DL
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Next Action Modal */}
      {pendingMove && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1422] border border-white/[0.08] w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Próximo Passo Obrigatório
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Defina o compromisso e a data limite para esta oportunidade não esfriar.
              </p>
            </div>

            <form onSubmit={handleConfirmNextAction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Qual a próxima ação?</label>
                <input
                  type="text"
                  required
                  value={nextActionText}
                  onChange={(e) => setNextActionText(e.target.value)}
                  placeholder="Ex: Apresentar Proposta Comercial / Follow-up"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Data Limite da Ação</label>
                <input
                  type="date"
                  required
                  value={nextActionDate}
                  onChange={(e) => setNextActionDate(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setPendingMove(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1422] border border-white/[0.08] w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Nova Oportunidade</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cadastrar oportunidade no pipeline</p>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Empresa</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Ex: Prime Odontologia"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Título da Oferta</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Presença Própria (Setup + SEO Local)"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Decisor</label>
                  <input
                    type="text"
                    value={newDecisor}
                    onChange={(e) => setNewDecisor(e.target.value)}
                    placeholder="Dr. Fernando"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsNewOppModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
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
