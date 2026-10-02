'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, FileText, Lock, Plus } from 'lucide-react';
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
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[11px] font-mono">
              Regulamentação: CFO / CRM / OAB / LGPD
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Normas & Conformidade Regulatória
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Checklist de validação jurídica e operacional para nichos altamente regulados.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/25"
        >
          <Plus className="w-4 h-4" /> Nova Auditoria de Projeto
        </button>
      </div>

      {/* Compliance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-emerald-800/60 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    Nicho: {item.nicho}
                  </span>
                  <h3 className="font-bold text-lg text-slate-100 mt-1">{item.projectName}</h3>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                    isComplete
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}
                >
                  {isComplete ? 'Aprovado para Publicação' : 'Pendências de Conformidade'}
                </span>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded">
                  <span className="text-slate-200">1. Identidade e Registro do Profissional (CRO / CRM / OAB)</span>
                  <input
                    type="checkbox"
                    checked={item.identityVerified}
                    onChange={() => handleToggleCheck(item.id, 'identityVerified')}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded">
                  <span className="text-slate-200">2. Prova Social e Depoimentos Revisados</span>
                  <input
                    type="checkbox"
                    checked={item.socialProofReviewed}
                    onChange={() => handleToggleCheck(item.id, 'socialProofReviewed')}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded">
                  <span className="text-slate-200">3. Claims e Promessas de Resultado Auditadas</span>
                  <input
                    type="checkbox"
                    checked={item.claimsVerified}
                    onChange={() => handleToggleCheck(item.id, 'claimsVerified')}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded">
                  <span className="text-slate-200">4. Proteção de Dados Sensíveis do Paciente / Cliente (LGPD)</span>
                  <input
                    type="checkbox"
                    checked={item.sensitiveDataProtected}
                    onChange={() => handleToggleCheck(item.id, 'sensitiveDataProtected')}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded">
                  <span className="text-slate-200">5. Aprovação Final de Conformidade Interna</span>
                  <input
                    type="checkbox"
                    checked={item.internalApproved}
                    onChange={() => handleToggleCheck(item.id, 'internalApproved')}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                </label>
              </div>

              {item.notes && (
                <p className="text-slate-400 text-xs italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  "{item.notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* New Compliance Audit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Criar Nova Auditoria de Conformidade</h3>
            <form onSubmit={handleCreateCompliance} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Projeto</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ex: Clínica Dra. Juliana Estética"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nicho Regulado</label>
                <select
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value as NichoEnum)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ODONTOLOGIA">Odontologia (CFO)</option>
                  <option value="MEDICINA">Medicina (CRM)</option>
                  <option value="ADVOCACIA">Advocacia (OAB)</option>
                  <option value="ESTETICA">Estética / Biomedicina</option>
                  <option value="PERSONAL_TRAINER">Personal Trainer (CREF)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observações de Registro</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Validação do número de registro conselho regional..."
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
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/25"
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
