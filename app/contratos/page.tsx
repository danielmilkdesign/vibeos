'use client';

import React, { useState } from 'react';
import { FileCheck, Plus } from 'lucide-react';
import { getStoredData, setStoredData, INITIAL_CONTRACTS } from '../../lib/crm-store';
import { Contract } from '../../types/crm';

export default function ContratosPage() {
  const [contracts, setContracts] = useState<Contract[]>(() => getStoredData('vibe_contracts', INITIAL_CONTRACTS));
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Contract form
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [offerName, setOfferName] = useState('Plano 5 Artes Mensais');
  const [recurringVal, setRecurringVal] = useState(490);
  const [deliveryLimit, setDeliveryLimit] = useState(5);

  const totalMRR = contracts.filter(c => c.status === 'ATIVO' || c.status === 'RENOVACAO_PROXIMA').reduce((acc, c) => acc + c.recurringValue, 0);

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return;

    const newCtr: Contract = {
      id: `ctr-${Date.now()}`,
      contractNumber: `CTR-VIBE-0${contracts.length + 90}`,
      companyName,
      clientName: clientName || 'Cliente VIBE',
      offerName,
      setupValue: 1500,
      recurringValue: Number(recurringVal),
      billingPeriod: 'MENSAL',
      dueDay: 10,
      deliveryLimit: Number(deliveryLimit),
      deliveriesUsed: 0,
      status: 'ATIVO',
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
    };

    const updated = [newCtr, ...contracts];
    setContracts(updated);
    setStoredData('vibe_contracts', updated);
    setIsModalOpen(false);
    setCompanyName('');
  };

  const handleIncrementDelivery = (contractId: string) => {
    const updated = contracts.map(c => {
      if (c.id === contractId) {
        return { ...c, deliveriesUsed: Math.min(c.deliveriesUsed + 1, c.deliveryLimit) };
      }
      return c;
    });
    setContracts(updated);
    setStoredData('vibe_contracts', updated);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white tracking-tight">
            Contratos & Recorrência (MRR)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Controle de mensalidades, vencimentos e franquias de entregas mensais.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">MRR Ativo</span>
            <span className="text-sm font-semibold text-emerald-400">R$ {totalMRR.toLocaleString('pt-BR')}/mês</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="h-8 px-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Contrato</span>
          </button>
        </div>
      </div>

      {/* 2. Contracts List */}
      {contracts.length === 0 ? (
        <div className="py-16 text-center rounded-xl bg-white/[0.015] border border-white/[0.05] p-6 space-y-3">
          <FileCheck className="w-8 h-8 mx-auto text-slate-500" />
          <div>
            <h3 className="text-sm font-medium text-white">Nenhum contrato ativo</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Cadastre contratos de receita recorrente para acompanhar faturamentos e entregas.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Primeiro Contrato</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-cyan-400">{c.contractNumber}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      c.status === 'RENOVACAO_PROXIMA'
                        ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">{c.companyName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{c.offerName} • {c.clientName}</p>
                </div>

                <div className="p-3 rounded-lg bg-white/[0.015] border border-white/[0.04] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mensalidade:</span>
                    <span className="text-white font-semibold">R$ {c.recurringValue.toLocaleString('pt-BR')}/mês</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Vencimento:</span>
                    <span className="text-slate-200">Todo dia {c.dueDay}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Renovação:</span>
                    <span className="text-slate-200">{c.renewalDate}</span>
                  </div>
                </div>

                {/* Delivery Limit Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Franquia de Entregas:</span>
                    <span className="text-white font-medium">{c.deliveriesUsed} de {c.deliveryLimit} utilizadas</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all"
                      style={{ width: `${(c.deliveriesUsed / c.deliveryLimit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.04]">
                <button
                  onClick={() => handleIncrementDelivery(c.id)}
                  className="w-full py-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                  <span>Registrar Entrega de Conteúdo</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Contract Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1422] border border-white/[0.08] w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Novo Contrato Recorrente</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cadastrar contrato de retenção / mensalidade</p>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Studio Fit Personal"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome do Decisor</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Dr. Fernando"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Plano Recorrente</label>
                <select
                  value={offerName}
                  onChange={(e) => {
                    setOfferName(e.target.value);
                    if (e.target.value.includes('5 Artes')) {
                      setRecurringVal(490);
                      setDeliveryLimit(5);
                    } else if (e.target.value.includes('12 Artes')) {
                      setRecurringVal(1290);
                      setDeliveryLimit(12);
                    } else {
                      setRecurringVal(890);
                      setDeliveryLimit(5);
                    }
                  }}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Plano 5 Artes Mensais">Plano 5 Artes Mensais (R$ 490/mês)</option>
                  <option value="Plano 12 Artes Mensais">Plano 12 Artes Mensais (R$ 1.290/mês)</option>
                  <option value="Esteira de Crescimento Recorrente">Esteira de Crescimento (R$ 890/mês)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Valor Mensal (R$)</label>
                  <input
                    type="number"
                    value={recurringVal}
                    onChange={(e) => setRecurringVal(Number(e.target.value))}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Franquia de Entregas</label>
                  <input
                    type="number"
                    value={deliveryLimit}
                    onChange={(e) => setDeliveryLimit(Number(e.target.value))}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
                >
                  Ativar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
