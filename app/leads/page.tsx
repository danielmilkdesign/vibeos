'use client';

import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Zap,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Mail,
  PhoneCall,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { getStoredData, setStoredData } from '../../lib/crm-store';
import { INITIAL_LEADS } from '../../lib/crm-initial-data';
import { Lead, NichoEnum, UrgenciaEnum } from '../../types/crm';
import LeadDetailModal from '../../components/CRM/LeadDetailModal';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(() => getStoredData('vibe_leads', INITIAL_LEADS));
  const [searchTerm, setSearchTerm] = useState('');
  const [nichoFilter, setNichoFilter] = useState<string>('ALL');
  const [urgenciaFilter, setUrgenciaFilter] = useState<string>('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Lead Form State
  const [newCompany, setNewCompany] = useState('');
  const [newNicho, setNewNicho] = useState<NichoEnum>('ESTETICA');
  const [newLocal, setNewLocal] = useState('Vieiralves, Manaus');
  const [newDecisor, setNewDecisor] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSeo, setNewSeo] = useState('');
  const [newUrgencia, setNewUrgencia] = useState<UrgenciaEnum>('CRITICA');

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.nomeDecisor && lead.nomeDecisor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.localizacao.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesNicho = nichoFilter === 'ALL' || lead.nicho === nichoFilter;
    const matchesUrgencia = urgenciaFilter === 'ALL' || lead.urgencia === urgenciaFilter;

    return matchesSearch && matchesNicho && matchesUrgencia;
  });

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany) return;

    const createdLead: Lead = {
      id: `lead-${Date.now()}`,
      nomeEmpresa: newCompany,
      nicho: newNicho,
      localizacao: newLocal,
      status: 'LEAD_NOVO',
      urgencia: newUrgencia,
      authorityScore: 0,
      trafegoOrganico: 0,
      palavrasChave: 0,
      percentSocial: 100,
      diagnosticoSeo: newSeo || 'Mapeado via formulário de entrada manual.',
      nomeDecisor: newDecisor || 'Decisor a confirmar',
      emailDecisor: newEmail,
      phoneWhatsapp: newPhone,
      valorEstimado: 2200,
      interacoes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [createdLead, ...leads];
    setLeads(updated);
    setStoredData('vibe_leads', updated);
    setIsCreateModalOpen(false);

    // Reset Form
    setNewCompany('');
    setNewDecisor('');
    setNewEmail('');
    setNewPhone('');
    setNewSeo('');
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: any) => {
    const updated = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
    setLeads(updated);
    setStoredData('vibe_leads', updated);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  const handleAddInteraction = (leadId: string, interacao: any) => {
    const fullInt = {
      ...interacao,
      id: `int-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          interacoes: [fullInt, ...(l.interacoes || [])]
        };
      }
      return l;
    });
    setLeads(updated);
    setStoredData('vibe_leads', updated);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
              Prospecção Outbound • Apollo / Semrush
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Painel de Prospecção & Mapeamento de Leads
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Base de empresas prospectadas com diagnósticos digitais e dados de decisores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Adicionar Lead Outbound
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por empresa, decisor ou bairro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={nichoFilter}
            onChange={(e) => setNichoFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">Todos os Nichos</option>
            <option value="ESTETICA">Estética</option>
            <option value="ODONTOLOGIA">Odontologia</option>
            <option value="PERSONAL_TRAINER">Personal Trainer</option>
            <option value="MEDICINA">Medicina</option>
            <option value="ADVOCACIA">Advocacia</option>
          </select>

          <select
            value={urgenciaFilter}
            onChange={(e) => setUrgenciaFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">Todas as Urgências</option>
            <option value="CRITICA">Urgência Crítica</option>
            <option value="ALTA">Urgência Alta</option>
            <option value="MEDIA">Urgência Média</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200 text-xs flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Empresas Mapeadas ({filteredLeads.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Empresa / Bairro</th>
                <th className="p-4">Nicho</th>
                <th className="p-4">Diagnóstico SEO & Tráfego</th>
                <th className="p-4">Decisor (Apollo)</th>
                <th className="p-4">Urgência</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-medium text-slate-100">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="font-bold text-slate-100 hover:text-cyan-400 text-left"
                    >
                      {lead.nomeEmpresa}
                    </button>
                    <div className="text-[11px] text-slate-400">{lead.localizacao}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {lead.nicho}
                    </span>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="truncate text-slate-300" title={lead.diagnosticoSeo}>
                      {lead.diagnosticoSeo}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      AS: <span className="font-semibold text-slate-200">{lead.authorityScore}</span> | Social: <span className="text-cyan-400">{lead.percentSocial}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-200">{lead.nomeDecisor || 'A identificar'}</div>
                    <div className="text-[10px] text-slate-400">{lead.cargoDecisor}</div>
                  </td>
                  <td className="p-4">
                    {lead.urgencia === 'CRITICA' ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50 font-medium">
                        <AlertTriangle className="w-3 h-3" /> Crítica
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> {lead.urgencia}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 font-mono text-[10px] border border-cyan-800/40">
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium"
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Details */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={handleUpdateLeadStatus}
          onAddInteraction={handleAddInteraction}
        />
      )}

      {/* Create Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Cadastrar Novo Lead Outbound</h3>
            <form onSubmit={handleAddLead} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Ex: Clínica OdontoViva"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nicho</label>
                  <select
                    value={newNicho}
                    onChange={(e) => setNewNicho(e.target.value as NichoEnum)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ESTETICA">Estética</option>
                    <option value="ODONTOLOGIA">Odontologia</option>
                    <option value="PERSONAL_TRAINER">Personal Trainer</option>
                    <option value="MEDICINA">Medicina</option>
                    <option value="ADVOCACIA">Advocacia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Urgência</label>
                  <select
                    value={newUrgencia}
                    onChange={(e) => setNewUrgencia(e.target.value as UrgenciaEnum)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICA">Crítica (Sem Site)</option>
                    <option value="ALTA">Alta</option>
                    <option value="MEDIA">Média</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Decisor (Nome & Cargo)</label>
                <input
                  type="text"
                  value={newDecisor}
                  onChange={(e) => setNewDecisor(e.target.value)}
                  placeholder="Ex: Dr. Roberto Siqueira (Proprietário)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Decisor</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(92) 99000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Diagnóstico SEO Inicial</label>
                <textarea
                  value={newSeo}
                  onChange={(e) => setNewSeo(e.target.value)}
                  placeholder="Ex: Sem site indexado, dependente de Linktree."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25"
                >
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
