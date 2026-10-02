'use client';

import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  Upload,
  Download,
  Wand2,
  Phone,
  Mail,
  Zap,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building2,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  X,
  Filter,
  RefreshCw,
  Copy,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { getStoredData, setStoredData } from '../../lib/crm-store';
import { INITIAL_LEADS } from '../../lib/crm-initial-data';
import { Lead, NichoEnum, UrgenciaEnum } from '../../types/crm';
import Link from 'next/link';

export default function ProspeccaoPage() {
  const [leads, setLeads] = useState<Lead[]>(() => getStoredData('vibe_leads', INITIAL_LEADS));
  const [selectedLeadId, setSelectedLeadId] = useState<string>(() => leads[0]?.id || 'lead_001');
  const [searchTerm, setSearchTerm] = useState('');
  const [nichoFilter, setNichoFilter] = useState('ALL');
  const [urgenciaFilter, setUrgenciaFilter] = useState('ALL');
  const [hasSiteFilter, setHasSiteFilter] = useState('ALL');
  const [whatsappFilter, setWhatsappFilter] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // New Lead Form State
  const [newCompany, setNewCompany] = useState('');
  const [newNicho, setNewNicho] = useState<NichoEnum>('ESTETICA');
  const [newBairro, setNewBairro] = useState('Vieiralves');
  const [newDecisor, setNewDecisor] = useState('');
  const [newCargo, setNewCargo] = useState('Proprietário(a)');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('(92) 9');
  const [newUrgencia, setNewUrgencia] = useState<UrgenciaEnum>('CRITICA');
  const [newDiagnostico, setNewDiagnostico] = useState('');

  const criticosCount = leads.filter(l => l.urgencia === 'CRITICA').length;
  const mediasCount = leads.filter(l => l.urgencia === 'ALTA' || l.urgencia === 'MEDIA').length;
  const baixasCount = leads.filter(l => l.urgencia === 'BAIXA').length;

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || (leads.length > 0 ? leads[0] : null);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.nomeDecisor && lead.nomeDecisor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.localizacao.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesNicho = nichoFilter === 'ALL' || lead.nicho === nichoFilter;
    const matchesUrgencia = urgenciaFilter === 'ALL' || lead.urgencia === urgenciaFilter;
    const matchesWhatsapp = !whatsappFilter || Boolean(lead.phoneWhatsapp);

    return matchesSearch && matchesNicho && matchesUrgencia && matchesWhatsapp;
  });

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany) return;

    const created: Lead = {
      id: `lead_${Date.now()}`,
      nomeEmpresa: newCompany,
      nicho: newNicho,
      localizacao: `${newBairro} • Manaus`,
      status: 'LEAD_NOVO',
      urgencia: newUrgencia,
      authorityScore: 12,
      trafegoOrganico: 45,
      palavrasChave: 18,
      percentSocial: 90,
      diagnosticoSeo: newDiagnostico || 'Sem site móvel próprio e dependente exclusivamente de redes sociais.',
      nomeDecisor: newDecisor || 'Decisor a qualificar',
      cargoDecisor: newCargo,
      emailDecisor: newEmail || 'contato@empresa.com.br',
      phoneWhatsapp: newPhone || '(92) 99202-7059',
      valorEstimado: 2400,
      interacoes: [
        {
          id: `int-${Date.now()}`,
          tipo: 'WHATSAPP',
          conteudo: 'Lead prospectado e adicionado à fila outbound.',
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [created, ...leads];
    setLeads(updated);
    setStoredData('vibe_leads', updated);
    setSelectedLeadId(created.id);
    setIsAddModalOpen(false);

    // Reset
    setNewCompany('');
    setNewDecisor('');
    setNewEmail('');
    setNewPhone('(92) 9');
    setNewDiagnostico('');
  };

  const handleCopyPitch = () => {
    const pitch = `Olá ${selectedLead?.nomeDecisor || 'Doutor(a)'}! Identificamos que a ${selectedLead?.nomeEmpresa} em Manaus possui excelente reputação local, mas perde pacientes qualificados por não ter uma Presença Própria otimizada com SLA de alta velocidade. Temos um diagnóstico de 20 minutos preparado para sua operação.`;
    navigator.clipboard.writeText(pitch);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen p-4 lg:p-8 space-y-6">
      {/* Subtle Ambient Glow */}
      <div className="relative w-full">
        <div className="absolute -top-10 left-1/4 w-96 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-10 w-72 h-24 bg-tertiary-container/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Command & Action Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px] tracking-widest uppercase font-semibold">
                Módulo 01 • Prospecção Ativa
              </span>
              <span className="flex items-center gap-1 text-text-secondary font-mono text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                {leads.length} Alvos Mapeados
              </span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Prospecção Outbound
            </h1>
            <p className="text-xs text-text-secondary">
              Empresas mapeadas com diagnóstico digital e decisores identificados em Manaus, AM.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => alert('Exportando base de leads para CSV...')}
              className="h-9 px-3 bg-surface-elevated hover:bg-surface-container-high border border-border-subtle text-text-primary text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              type="button"
            >
              <Download className="w-3.5 h-3.5 text-text-secondary" />
              <span>Exportar</span>
            </button>
            <button
              onClick={() => alert('Enriquecimento automático via API Neon/DataForSEO simulado com sucesso!')}
              className="h-9 px-3 bg-surface-elevated hover:bg-surface-container-high border border-border-subtle text-text-primary text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              type="button"
            >
              <Wand2 className="w-3.5 h-3.5 text-primary" />
              <span>Enriquecer Selecionados</span>
              <span className="ml-1 px-1.5 py-0.5 rounded bg-surface-container-highest text-primary font-mono text-[10px]">
                3
              </span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="h-9 px-4 bg-primary-container hover:bg-primary-hover text-surface-container-lowest text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-cyan-500/10 cursor-pointer"
              type="button"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Adicionar Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational Filter Hub */}
      <div className="w-full bg-surface rounded-xl p-4 border border-border-subtle shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar empresa, decisor, bairro ou nicho..."
              className="w-full h-10 pl-9 pr-4 bg-surface-container-lowest border border-border-subtle rounded-lg text-text-primary placeholder:text-text-disabled text-xs focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Quick Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={nichoFilter}
              onChange={(e) => setNichoFilter(e.target.value)}
              className="h-10 px-3 bg-surface-container-lowest border border-border-subtle text-text-primary text-xs rounded-lg cursor-pointer focus:outline-none focus:border-primary"
            >
              <option value="ALL">Nicho: Todos</option>
              <option value="ESTETICA">Estética Integrativa</option>
              <option value="ODONTOLOGIA">Odontologia</option>
              <option value="PERSONAL_TRAINER">Personal & Fitness</option>
              <option value="ADVOCACIA">Advocacia Corporativa</option>
              <option value="MEDICINA">Medicina Especializada</option>
            </select>

            <select
              value={urgenciaFilter}
              onChange={(e) => setUrgenciaFilter(e.target.value)}
              className="h-10 px-3 bg-surface-container-lowest border border-border-subtle text-text-primary text-xs rounded-lg cursor-pointer focus:outline-none focus:border-primary"
            >
              <option value="ALL">Urgência: Todas</option>
              <option value="CRITICA">Alta (Crítico)</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
            </select>

            <button
              onClick={() => setWhatsappFilter(!whatsappFilter)}
              className={`h-10 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                whatsappFilter
                  ? 'bg-success/20 text-success border-success/40'
                  : 'bg-surface-container-lowest border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
              type="button"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp {whatsappFilter ? '(Ativo)' : '(Todos)'}</span>
            </button>
          </div>
        </div>

        {/* Active Filters Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border-subtle/50 text-xs">
          <span className="font-mono text-[10px] text-text-disabled uppercase tracking-wider">
            Filtros Ativos:
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low text-text-primary font-mono text-[11px]">
            <span>Nicho: {nichoFilter === 'ALL' ? 'Todos' : nichoFilter}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low text-primary font-mono text-[11px]">
            <MapPin className="w-3 h-3" />
            <span>Manaus, AM</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low text-text-primary font-mono text-[11px]">
            <span>Decisor Mapeado</span>
          </div>
          {(searchTerm || nichoFilter !== 'ALL' || urgenciaFilter !== 'ALL' || whatsappFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setNichoFilter('ALL');
                setUrgenciaFilter('ALL');
                setWhatsappFilter(false);
              }}
              className="text-text-disabled hover:text-danger text-[11px] font-mono flex items-center gap-1 ml-auto"
            >
              <RefreshCw className="w-3 h-3" /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Main Split Canvas: Dense Outbound Table (63%) + Floating Deep Inspection Drawer (37%) */}
      <div className="w-full flex flex-col xl:flex-row gap-6 items-start">
        {/* Table Container (Fluid & Data-Dense) */}
        <div className="w-full xl:w-[63%] bg-surface rounded-xl border border-border-subtle overflow-hidden shadow-md">
          {/* Table Header Bar / Metrics */}
          <div className="px-4 py-3 bg-surface-container-low border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-bold text-text-primary">Alvos Prioritários</span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-text-secondary font-mono text-[10px]">
                {filteredLeads.length} exibidos
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-text-secondary">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-danger" /> Crítica: {criticosCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-warning" /> Média: {mediasCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" /> Baixa: {baixasCount}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-lowest font-mono text-[10px] uppercase tracking-wider text-text-disabled border-b border-border-subtle select-none">
                  <th className="py-3 px-3">Empresa / Bairro</th>
                  <th className="py-3 px-2">Nicho</th>
                  <th className="py-3 px-3">Diagnóstico SEO</th>
                  <th className="py-3 px-2">Decisor</th>
                  <th className="py-3 px-2 text-center">Urgência</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-text-primary">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-text-disabled">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <Building2 className="w-8 h-8 text-text-disabled/60" />
                        <p className="font-semibold text-text-primary text-sm">Nenhum lead encontrado</p>
                        <p className="text-xs text-text-secondary">
                          Cadastre novos leads outbound ou importe contatos para iniciar abordagens com script.
                        </p>
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="mt-2 px-3 py-1.5 bg-primary text-surface-container-lowest font-bold text-xs rounded-lg flex items-center gap-1.5"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Adicionar Lead
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedLead?.id === lead.id;
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-surface-elevated border-l-4 border-l-primary'
                            : 'hover:bg-surface-elevated/50'
                        }`}
                      >
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-text-primary hover:text-primary transition-colors">
                              {lead.nomeEmpresa}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>
                          <div className="flex items-center gap-1 text-text-secondary font-mono text-[11px] mt-0.5">
                            <MapPin className="w-3 h-3 text-text-disabled" />
                            <span>{lead.localizacao}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-2">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-text-secondary font-mono text-[10px] whitespace-nowrap">
                          {lead.nicho}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 max-w-[200px]">
                        <div className="truncate text-text-secondary" title={lead.diagnosticoSeo}>
                          {lead.diagnosticoSeo}
                        </div>
                        <div className="flex gap-1 mt-1">
                          <span className="px-1.5 py-0.2 rounded bg-danger/15 text-danger font-mono text-[9px]">
                            Sem site móvel
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-2">
                        <div className="font-medium text-text-primary">{lead.nomeDecisor}</div>
                        <div className="text-[10px] text-text-secondary font-mono">{lead.cargoDecisor || 'Proprietário(a)'}</div>
                      </td>

                      <td className="py-3.5 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider inline-block ${
                            lead.urgencia === 'CRITICA'
                              ? 'bg-danger/15 text-danger'
                              : 'bg-warning/15 text-warning'
                          }`}
                        >
                          {lead.urgencia === 'CRITICA' ? 'Alta' : lead.urgencia}
                        </span>
                      </td>

                      <td className="py-3.5 px-2">
                        <span className="px-2 py-0.5 rounded bg-secondary-container/40 text-secondary font-mono text-[10px] whitespace-nowrap">
                          {lead.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`https://wa.me/5592992027059?text=Ol%C3%A1%20${encodeURIComponent(lead.nomeDecisor || '')},%20sou%20da%20VIBE%20Design%20Tech.`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-7 h-7 rounded flex items-center justify-center bg-success/20 text-success hover:bg-success hover:text-slate-950 transition-colors"
                            title="Conversar no WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            href="/pipeline"
                            className="w-7 h-7 rounded flex items-center justify-center bg-primary/20 text-primary hover:bg-primary hover:text-slate-950 transition-colors"
                            title="Transformar em Oportunidade"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 bg-surface-container-lowest/80 border-t border-border-subtle flex items-center justify-between text-text-secondary font-mono text-xs">
            <div className="flex items-center gap-2">
              <span>Mostrando {filteredLeads.length} leads</span>
              <span>•</span>
              <span className="text-primary font-medium">Bacia: Vieiralves + Adrianópolis prioritária</span>
            </div>
            <div className="text-[11px] text-text-disabled">Página 1 de 1</div>
          </div>
        </div>

        {/* Right Drawer: Lead Deep Inspection Canvas (Embedded & Pinned) */}
        {selectedLead ? (
          <div className="w-full xl:w-[37%] bg-surface rounded-xl border border-border-subtle overflow-hidden shadow-xl flex flex-col">
            {/* Drawer Header Bar */}
            <div className="p-4 bg-surface-elevated border-b border-border-subtle flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 via-surface-container-high to-surface-container flex items-center justify-center shrink-0 border border-primary/30 shadow-inner">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-text-primary leading-tight">
                      {selectedLead.nomeEmpresa}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-danger/15 text-danger font-mono text-[10px] font-bold uppercase tracking-wider">
                      Urgência Alta
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-text-secondary mt-0.5">
                    {selectedLead.localizacao} • ID: #{selectedLead.id.slice(0, 8)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Link
                  href={`/empresas`}
                  className="p-1.5 rounded text-text-disabled hover:text-text-primary hover:bg-surface-container transition-colors"
                  title="Abrir no Módulo Empresas"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Decisor & Status Highlight Strip */}
            <div className="px-4 py-2.5 bg-surface-container-low border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-surface-container-high border border-border-subtle flex items-center justify-center font-mono text-xs font-bold text-primary">
                  {selectedLead.nomeDecisor?.split(' ').map((n) => n[0]).join('') || 'DC'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-primary">
                    {selectedLead.nomeDecisor}
                  </span>
                  <span className="font-mono text-[10px] text-text-secondary">
                    {selectedLead.cargoDecisor || 'Proprietário(a)'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-container/30 text-secondary font-mono text-[10px] font-medium">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>{selectedLead.status.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="p-3 bg-surface-container-lowest/60 border-b border-border-subtle">
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://wa.me/5592992027059?text=Ol%C3%A1%20${encodeURIComponent(selectedLead.nomeDecisor || '')},%20somos%20da%20VIBE%20Design%20Tech.`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 px-2 rounded-lg bg-success hover:bg-success/90 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`mailto:${selectedLead.emailDecisor || 'contato@vibe.tech'}`}
                  className="h-9 px-2 rounded-lg bg-surface-elevated hover:bg-surface-container-high border border-border-subtle text-text-primary text-xs font-medium flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <Mail className="w-3.5 h-3.5 text-text-secondary" />
                  <span>E-mail</span>
                </a>
                <Link
                  href="/pipeline"
                  className="h-9 px-2 rounded-lg bg-primary-container hover:bg-primary-hover text-surface-container-lowest text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Oportunidade</span>
                </Link>
              </div>
            </div>

            {/* Body Content / Deep Diagnostic */}
            <div className="p-4 space-y-4 text-xs">
              {/* Diagnostic Checklist */}
              <div>
                <span className="font-mono text-[10px] text-text-disabled uppercase tracking-wider font-semibold block mb-2">
                  Diagnóstico Técnico SEO & Presença
                </span>
                <div className="p-3 bg-surface-elevated border border-border-subtle rounded-lg space-y-2">
                  <p className="text-text-primary leading-relaxed">
                    {selectedLead.diagnosticoSeo}
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle/50 font-mono text-[10px]">
                    <div>
                      <span className="text-text-disabled block">Autoridade (AS)</span>
                      <strong className="text-primary text-xs">{selectedLead.authorityScore} / 100</strong>
                    </div>
                    <div>
                      <span className="text-text-disabled block">Tráfego Orgânico</span>
                      <strong className="text-text-primary text-xs">{selectedLead.trafegoOrganico} visitas/m</strong>
                    </div>
                    <div>
                      <span className="text-text-disabled block">Dependência Social</span>
                      <strong className="text-danger text-xs">{selectedLead.percentSocial}% (Risco)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pitch Script Ready for WhatsApp */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-text-disabled uppercase tracking-wider font-semibold">
                    Script de Abordagem Consultiva
                  </span>
                  <button
                    onClick={handleCopyPitch}
                    className="text-primary hover:underline font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>
                </div>
                <div className="p-3 bg-surface-container-lowest border border-border-subtle rounded-lg text-text-secondary leading-relaxed font-sans text-xs">
                  &quot;Olá {selectedLead.nomeDecisor}! Notamos que a {selectedLead.nomeEmpresa} em Manaus possui alta procura, mas 90% do tráfego depende do Instagram. Criamos um diagnóstico de Presença Própria para aumentar suas conversões de pacientes sem intermediários.&quot;
                </div>
              </div>

              {/* Value Estimate & SLA */}
              <div className="p-3 bg-surface-container-low rounded-lg border border-border-subtle flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-text-disabled block">Potencial de Fechamento</span>
                  <span className="font-mono text-sm font-bold text-success">
                    R$ {(selectedLead.valorEstimado || 2400).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-text-disabled block">Oferta Recomendada</span>
                  <span className="font-semibold text-text-primary">Presença Própria (SLA 7d)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full xl:w-[37%] bg-surface rounded-xl border border-dashed border-border-subtle p-8 flex flex-col items-center justify-center text-center text-text-disabled min-h-[300px]">
            <Building2 className="w-8 h-8 mb-2 opacity-40 text-primary" />
            <p className="font-semibold text-text-primary text-xs">Nenhum lead selecionado</p>
            <p className="text-[11px] text-text-secondary mt-1 max-w-xs">
              Cadastre e selecione um lead na lista para visualizar o diagnóstico técnico, métricas e script de abordagem.
            </p>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border-subtle w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-base font-bold text-text-primary">Cadastrar Novo Alvo Outbound</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-text-disabled hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-secondary font-semibold mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Ex: Clínica OdontoManaus"
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary font-semibold mb-1">Nicho</label>
                  <select
                    value={newNicho}
                    onChange={(e) => setNewNicho(e.target.value as NichoEnum)}
                    className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="ESTETICA">Estética Integrativa</option>
                    <option value="ODONTOLOGIA">Odontologia</option>
                    <option value="PERSONAL_TRAINER">Personal & Fitness</option>
                    <option value="ADVOCACIA">Advocacia</option>
                    <option value="MEDICINA">Medicina</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-secondary font-semibold mb-1">Bairro em Manaus</label>
                  <input
                    type="text"
                    value={newBairro}
                    onChange={(e) => setNewBairro(e.target.value)}
                    placeholder="Vieiralves, Adrianópolis..."
                    className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary font-semibold mb-1">Nome do Decisor</label>
                  <input
                    type="text"
                    value={newDecisor}
                    onChange={(e) => setNewDecisor(e.target.value)}
                    placeholder="Dr. Roberto Siqueira"
                    className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary font-semibold mb-1">WhatsApp Decisor</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(92) 99202-7059"
                    className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Diagnóstico Inicial</label>
                <textarea
                  value={newDiagnostico}
                  onChange={(e) => setNewDiagnostico(e.target.value)}
                  placeholder="Ex: Sem site indexado, dependente 100% de Instagram..."
                  rows={2}
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-surface-container-high text-text-secondary hover:text-text-primary text-xs rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-container hover:bg-primary-hover text-surface-container-lowest text-xs font-bold rounded-lg shadow-sm"
                >
                  Salvar Alvo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
