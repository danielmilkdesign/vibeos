'use client';

import React, { useState } from 'react';
import { Kanban, TrendingUp, AlertTriangle, Plus, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import { getStoredData, setStoredData } from '../../lib/crm-store';
import { INITIAL_LEADS } from '../../lib/crm-initial-data';
import { Lead, LeadStatus } from '../../types/crm';
import KanbanBoard from '../../components/CRM/KanbanBoard';
import LeadDetailModal from '../../components/CRM/LeadDetailModal';

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>(() => getStoredData('vibe_leads', INITIAL_LEADS));
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Mandatory Next Action Prompt state
  const [pendingMove, setPendingMove] = useState<{ leadId: string; nextStatus: LeadStatus } | null>(null);
  const [nextActionText, setNextActionText] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');

  const totalValue = leads.reduce((acc, l) => acc + (l.valorEstimado || 2000), 0);
  const wonValue = leads.filter(l => l.status === 'FECHADO').reduce((acc, l) => acc + (l.valorEstimado || 2000), 0);

  const handleInitiateStatusChange = (leadId: string, newStatus: LeadStatus) => {
    // If moving to an open stage, prompt for mandatory next action per spec Section 6.4
    if (newStatus !== 'FECHADO' && newStatus !== 'PERDIDO') {
      setPendingMove({ leadId, nextStatus: newStatus });
      setNextActionText('');
      setNextActionDate('');
    } else {
      executeStatusUpdate(leadId, newStatus);
    }
  };

  const executeStatusUpdate = (leadId: string, newStatus: LeadStatus, nextAction?: string) => {
    const updated = leads.map((l) => {
      if (l.id === leadId) {
        const newInteractions = nextAction
          ? [
              {
                id: `int-${Date.now()}`,
                leadId,
                tipo: 'NOTA' as const,
                conteudo: `Próximo Passo Agendado (${newStatus}): ${nextAction}`,
                autor: 'Time Comercial',
                createdAt: new Date().toISOString()
              },
              ...(l.interacoes || [])
            ]
          : l.interacoes;

        return {
          ...l,
          status: newStatus,
          interacoes: newInteractions,
          updatedAt: new Date().toISOString()
        };
      }
      return l;
    });

    setLeads(updated);
    setStoredData('vibe_leads', updated);
    setPendingMove(null);
  };

  const handleConfirmNextActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingMove) return;
    const formattedAction = `${nextActionText} (Data: ${nextActionDate || 'A definir'})`;
    executeStatusUpdate(pendingMove.leadId, pendingMove.nextStatus, formattedAction);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
              Regra de Negócio: Próximo Passo Obrigatório
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Pipeline Comercial & Funil de Oportunidades
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Visualização Kanban por etapas comerciais com controle de probabilidade e valores ponderados.
          </p>
        </div>

        {/* Metrics Pill */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-mono">Total em Pipeline</p>
            <p className="text-sm font-extrabold text-cyan-400">R$ {totalValue.toLocaleString('pt-BR')}</p>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <p className="text-[10px] text-slate-400 uppercase font-mono">Fechado Ganho</p>
            <p className="text-sm font-extrabold text-emerald-400">R$ {wonValue.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-2xl">
        <KanbanBoard
          leads={leads}
          onUpdateStatus={handleInitiateStatusChange}
          onSelectLead={setSelectedLead}
        />
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={handleInitiateStatusChange}
          onAddInteraction={(leadId, int) => {
            const fullInteraction = {
              ...int,
              id: `int-${Date.now()}`,
              createdAt: new Date().toISOString()
            };
            const updated = leads.map(l => l.id === leadId ? { ...l, interacoes: [fullInteraction, ...(l.interacoes || [])] } : l);
            setLeads(updated);
            setStoredData('vibe_leads', updated);
          }}
        />
      )}

      {/* Mandatory Next Action Modal */}
      {pendingMove && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-100">Próximo Passo Obrigatório</h3>
            </div>
            <p className="text-xs text-slate-400">
              Conforme as diretrizes comerciais VIBE OS (Princípio 1), todas as oportunidades abertas exigem uma ação futura agendada.
            </p>

            <form onSubmit={handleConfirmNextActionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Qual a próxima ação?</label>
                <input
                  type="text"
                  required
                  value={nextActionText}
                  onChange={(e) => setNextActionText(e.target.value)}
                  placeholder="Ex: Reunião de 20 min / Envio de Proposta PDF / Follow-up D+2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Data Limite da Ação</label>
                <input
                  type="date"
                  required
                  value={nextActionDate}
                  onChange={(e) => setNextActionDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingMove(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25"
                >
                  Confirmar Avanço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
