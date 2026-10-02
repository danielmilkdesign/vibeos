'use client';

import React, { useState } from 'react';
import { FileCheck, DollarSign, Calendar, AlertCircle, Plus, CheckCircle2, RefreshCw } from 'lucide-react';
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
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[11px] font-mono">
              Receita Recorrente Mensal (MRR)
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Contratos & Recorrência Mensal
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Controle de mensalidades, vencimentos de faturamento e franquias de entregas mensais.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-right">
            <p className="text-[10px] text-slate-400 uppercase font-mono">MRR Total Ativo</p>
            <p className="text-base font-extrabold text-emerald-400">R$ {totalMRR.toLocaleString('pt-BR')}/mês</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/25"
          >
            <Plus className="w-4 h-4" /> Novo Contrato Recorrente
          </button>
        </div>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <FileCheck className="w-10 h-10 text-slate-600" />
          <div className="space-y-1">
            <h3 className="text-slate-200 font-bold text-base">Nenhum contrato ativo</h3>
            <p className="text-slate-400 text-xs max-w-sm">
              Cadastre contratos com faturamento recorrente (MRR) para monitorar vencimentos e franquias de entregas.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4" /> Cadastrar Primeiro Contrato
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-emerald-800/60 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-cyan-400 font-bold">{c.contractNumber}</span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                      c.status === 'RENOVACAO_PROXIMA'
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-slate-100">{c.companyName}</h3>
                  <p className="text-xs text-slate-400">Plano: {c.offerName} • Cliente: {c.clientName}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Mensalidade Recorrente:</span>
                    <span className="text-emerald-400 font-extrabold text-sm">R$ {c.recurringValue.toLocaleString('pt-BR')}/mês</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Vencimento do Faturamento:</span>
                    <span className="text-slate-200">Dia {c.dueDay} de cada mês</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Renovação do Contrato:</span>
                    <span className="text-slate-200">{c.renewalDate}</span>
                  </div>
                </div>

                {/* Delivery Limit Tracker */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Franquia Mensal de Entregas:</span>
                    <span className="text-cyan-400 font-bold">{c.deliveriesUsed} de {c.deliveryLimit} utilizadas</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all"
                      style={{ width: `${(c.deliveriesUsed / c.deliveryLimit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleIncrementDelivery(c.id)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Registrar Entrega de Arte/Conteúdo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Contract Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Criar Novo Contrato Recorrente</h3>
            <form onSubmit={handleCreateContract} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Studio FitManaus Personal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Decisor</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Victor Belichar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Plano Recorrente</label>
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Plano 5 Artes Mensais">Plano 5 Artes Mensais (R$ 490/mês)</option>
                  <option value="Plano 12 Artes Mensais">Plano 12 Artes Mensais (R$ 1.290/mês)</option>
                  <option value="Esteira de Crescimento Recorrente">Esteira de Crescimento (R$ 890/mês)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Mensal (R$)</label>
                  <input
                    type="number"
                    value={recurringVal}
                    onChange={(e) => setRecurringVal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Franquia de Artes</label>
                  <input
                    type="number"
                    value={deliveryLimit}
                    onChange={(e) => setDeliveryLimit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
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
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/25"
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
