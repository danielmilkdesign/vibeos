'use client';

import React, { useState } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import { getStoredData, setStoredData, INITIAL_COMPLIANCE } from '../../lib/crm-store';
import { ComplianceCheck, NichoEnum } from '../../types/crm';

export default function ConformidadePage() {
  const [items, setItems] = useState<ComplianceCheck[]>(() => getStoredData('vibe_compliance', INITIAL_COMPLIANCE));
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [nicho, setNicho] = useState<NichoEnum>('ODONTOLOGIA');
  const [notes, setNotes] = useState('');

  const handleToggleCheck = (id: string, field: keyof ComplianceCheck) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: !item[field] };
      }
      return item;
    });
    setItems(updated);
    setStoredData('vibe_compliance', updated);
  };

  const handleCreateCompliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) return;

    const newItem: ComplianceCheck = {
      id: `cmp-${Date.now()}`,
      projectName,
      nicho,
      identityVerified: true,
      socialProofReviewed: false,
      claimsVerified: false,
      sensitiveDataProtected: true,
      internalApproved: false,
      notes: notes || 'Auditoria de normas iniciada.'
    };

    const updated = [newItem, ...items];
    setItems(updated);
    setStoredData('vibe_compliance', updated);
    setIsModalOpen(false);
    setProjectName('');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white tracking-tight">
            Conformidade & Auditoria
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Checklist de validação ética e regulatória (CFO, CRM, OAB, LGPD).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-8 px-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Auditoria</span>
        </button>
      </div>

      {/* 2. Compliance Grid */}
      {items.length === 0 ? (
        <div className="py-16 text-center rounded-xl bg-white/[0.015] border border-white/[0.05] p-6 space-y-3">
          <ShieldCheck className="w-8 h-8 mx-auto text-slate-500" />
          <div>
            <h3 className="text-sm font-medium text-white">Nenhuma auditoria iniciada</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Inicie checklists de auditoria ética e regulatória para cada projeto ativo.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Iniciar Primeira Auditoria</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const isComplete =
              item.identityVerified &&
              item.socialProofReviewed &&
              item.claimsVerified &&
              item.sensitiveDataProtected &&
              item.internalApproved;

            return (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">
                      Nicho: {item.nicho}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-0.5">{item.projectName}</h3>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      isComplete
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-300'
                    }`}
                  >
                    {isComplete ? 'Aprovado' : 'Pendências'}
                  </span>
                </div>

                {/* Checklist Items */}
                <div className="space-y-1.5 p-3 rounded-lg bg-white/[0.015] border border-white/[0.04] text-xs">
                  <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-white/[0.02] rounded transition-colors">
                    <span className="text-slate-300 text-xs">Identidade e Registro (CRO / CRM / OAB)</span>
                    <input
                      type="checkbox"
                      checked={item.identityVerified}
                      onChange={() => handleToggleCheck(item.id, 'identityVerified')}
                      className="accent-cyan-400 w-3.5 h-3.5 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-white/[0.02] rounded transition-colors">
                    <span className="text-slate-300 text-xs">Prova Social e Depoimentos Revisados</span>
                    <input
                      type="checkbox"
                      checked={item.socialProofReviewed}
                      onChange={() => handleToggleCheck(item.id, 'socialProofReviewed')}
                      className="accent-cyan-400 w-3.5 h-3.5 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-white/[0.02] rounded transition-colors">
                    <span className="text-slate-300 text-xs">Promessas de Resultado e Claims Auditadas</span>
                    <input
                      type="checkbox"
                      checked={item.claimsVerified}
                      onChange={() => handleToggleCheck(item.id, 'claimsVerified')}
                      className="accent-cyan-400 w-3.5 h-3.5 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-white/[0.02] rounded transition-colors">
                    <span className="text-slate-300 text-xs">Proteção de Dados Sensíveis (LGPD)</span>
                    <input
                      type="checkbox"
                      checked={item.sensitiveDataProtected}
                      onChange={() => handleToggleCheck(item.id, 'sensitiveDataProtected')}
                      className="accent-cyan-400 w-3.5 h-3.5 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-white/[0.02] rounded transition-colors">
                    <span className="text-slate-300 text-xs">Aprovação Final Interna</span>
                    <input
                      type="checkbox"
                      checked={item.internalApproved}
                      onChange={() => handleToggleCheck(item.id, 'internalApproved')}
                      className="accent-cyan-400 w-3.5 h-3.5 rounded"
                    />
                  </label>
                </div>

                {item.notes && (
                  <p className="text-slate-400 text-xs italic p-2.5 rounded-lg bg-white/[0.015] border border-white/[0.03]">
                    "{item.notes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Compliance Audit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1422] border border-white/[0.08] w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Nova Auditoria de Conformidade</h3>
              <p className="text-xs text-slate-400 mt-0.5">Criar checklist regulatório para projeto</p>
            </div>

            <form onSubmit={handleCreateCompliance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome do Projeto</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ex: Clínica Dra. Juliana"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nicho Regulado</label>
                <select
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value as NichoEnum)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="ODONTOLOGIA">Odontologia (CFO)</option>
                  <option value="MEDICINA">Medicina (CRM)</option>
                  <option value="ADVOCACIA">Advocacia (OAB)</option>
                  <option value="ESTETICA">Estética / Biomedicina</option>
                  <option value="PERSONAL_TRAINER">Personal Trainer (CREF)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Registro verificado no conselho regional..."
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
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
                  Iniciar Auditoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
