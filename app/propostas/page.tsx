'use client';

import React, { useState } from 'react';
import { FileText, Plus, CheckCircle2, XCircle, Clock, DollarSign, Send, Eye } from 'lucide-react';
import { getStoredData, setStoredData, INITIAL_PROPOSALS } from '../../lib/crm-store';
import { Proposal, ProposalStatus } from '../../types/crm';

export default function PropostasPage() {
  const [proposals, setProposals] = useState<Proposal[]>(() => getStoredData('vibe_proposals', INITIAL_PROPOSALS));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [offerTitle, setOfferTitle] = useState('Presença Própria');
  const [setupVal, setSetupVal] = useState<number>(1500);
  const [recurringVal, setRecurringVal] = useState<number>(99);
  const [scope, setScope] = useState('Desenvolvimento de site de alta conversão, hospedagem de 12 meses e otimização para celular (SLA 7 Dias).');

  const handleOfferChange = (val: string) => {
    setOfferTitle(val);
    if (val === 'Presença Própria') {
      setSetupVal(1500);
      setRecurringVal(99);
      setScope('Site Institucional de alta conversão + hospedagem em nuvem + SSL + WhatsApp integrado.');
    } else if (val === 'Esteira de Crescimento') {
      setSetupVal(2200);
      setRecurringVal(890);
      setScope('Landing Page de Alta Conversão + 5 Artes Sociais Mensais + Relatório de Performance.');
    } else if (val === 'Plano 5 Artes') {
      setSetupVal(0);
      setRecurringVal(490);
      setScope('Franquia mensal de 5 artes digitais para redes sociais com aprovação em 24h.');
    } else if (val === 'Plano 12 Artes') {
      setSetupVal(0);
      setRecurringVal(1290);
      setScope('Franquia mensal de 12 artes e carrosséis com roteiro de copywriting.');
    } else if (val === 'Solução para Clínicas') {
      setSetupVal(3200);
      setRecurringVal(490);
      setScope('Sistema completo de agendamento online + Landing Page de Autoridade + Conformidade CFO/CRM.');
    }
  };

  const handleCreateProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) return;

    const newProp: Proposal = {
      id: `prop-${Date.now()}`,
      proposalNumber: `VIBE-2026-00${proposals.length + 1}`,
      clientName,
      clientEmail: clientEmail || 'cliente@vibe.tech',
      offerTitle,
      setupValue: Number(setupVal),
      recurringValue: Number(recurringVal),
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'ENVIADA',
      scopeText: scope,
      createdAt: new Date().toISOString()
    };

    const updated = [newProp, ...proposals];
    setProposals(updated);
    setStoredData('vibe_proposals', updated);
    setIsModalOpen(false);
    setClientName('');
    setClientEmail('');
  };

  const handleUpdateStatus = (id: string, status: ProposalStatus) => {
    const updated = proposals.map((p) => (p.id === id ? { ...p, status } : p));
    setProposals(updated);
    setStoredData('vibe_proposals', updated);
    if (selectedProposal && selectedProposal.id === id) {
      setSelectedProposal({ ...selectedProposal, status });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
              Gerador de Propostas VIBE Design Tech
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Propostas Comerciais
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Emissão de propostas parametrizadas com valores de setup, recorrência mensal e controle de aceite.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/25"
        >
          <Plus className="w-4 h-4" /> Emitir Nova Proposta
        </button>
      </div>

      {/* Proposals Grid */}
      {proposals.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <FileText className="w-10 h-10 text-slate-600" />
          <div className="space-y-1">
            <h3 className="text-slate-200 font-bold text-base">Nenhuma proposta emitida</h3>
            <p className="text-slate-400 text-xs max-w-sm">
              Gere orçamentos e propostas comerciais formais para enviar a clientes em negociação.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/25"
          >
            <Plus className="w-4 h-4" /> Emitir Primeira Proposta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-cyan-800/60 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-cyan-400 font-bold">{p.proposalNumber}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                      p.status === 'APROVADA'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : p.status === 'RECUSADA'
                        ? 'bg-rose-950 text-rose-400 border-rose-800'
                        : 'bg-cyan-950 text-cyan-400 border-cyan-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-100">{p.clientName}</h3>
                  <p className="text-xs text-slate-400">{p.offerTitle}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Setup Inicial:</span>
                    <span className="text-slate-100 font-bold">R$ {p.setupValue.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>Recorrência Mensal:</span>
                    <span className="font-bold">R$ {p.recurringValue.toLocaleString('pt-BR')}/mês</span>
                  </div>
                </div>

                <p className="text-slate-400 text-xs line-clamp-2 italic">
                  "{p.scopeText}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProposal(p)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Visualizar
                </button>

                {p.status !== 'APROVADA' && (
                  <button
                    onClick={() => handleUpdateStatus(p.id, 'APROVADA')}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Proposal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-100">Emitir Nova Proposta Comercial</h3>
            <form onSubmit={handleCreateProposalSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente / Empresa</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Harmonia & Face Estética"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail do Decisor</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="camila@harmoniaeface.com.br"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo de Oferta VIBE</label>
                <select
                  value={offerTitle}
                  onChange={(e) => handleOfferChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Presença Própria">Presença Própria (R$ 1.500 + R$ 99/mês)</option>
                  <option value="Esteira de Crescimento">Esteira de Crescimento (R$ 2.200 + R$ 890/mês)</option>
                  <option value="Plano 5 Artes">Plano 5 Artes (R$ 490/mês)</option>
                  <option value="Plano 12 Artes">Plano 12 Artes (R$ 1.290/mês)</option>
                  <option value="Solução para Clínicas">Solução para Clínicas (R$ 3.200 + R$ 490/mês)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor de Setup (R$)</label>
                  <input
                    type="number"
                    value={setupVal}
                    onChange={(e) => setSetupVal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Recorrência Mensal (R$)</label>
                  <input
                    type="number"
                    value={recurringVal}
                    onChange={(e) => setRecurringVal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição do Escopo</label>
                <textarea
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25"
                >
                  Emitir e Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400">{selectedProposal.proposalNumber}</span>
                <h3 className="text-lg font-bold text-slate-100">{selectedProposal.clientName}</h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800/40">
                {selectedProposal.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Oferta Selecionada:</p>
                <p className="text-slate-100 font-bold text-sm">{selectedProposal.offerTitle}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono">
                <p className="flex justify-between text-slate-300"><span>Setup Inicial:</span> <strong>R$ {selectedProposal.setupValue.toLocaleString('pt-BR')}</strong></p>
                <p className="flex justify-between text-cyan-400"><span>Recorrência Mensal:</span> <strong>R$ {selectedProposal.recurringValue.toLocaleString('pt-BR')}/mês</strong></p>
                <p className="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-900"><span>Validade:</span> <span>{selectedProposal.validUntil}</span></p>
              </div>

              <div>
                <p className="text-slate-400 font-medium mb-1">Escopo Técnico Detalhado:</p>
                <p className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 italic">{selectedProposal.scopeText}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedProposal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium"
              >
                Fechar
              </button>

              {selectedProposal.status !== 'APROVADA' && (
                <button
                  onClick={() => handleUpdateStatus(selectedProposal.id, 'APROVADA')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Registrar Aceite do Cliente
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
