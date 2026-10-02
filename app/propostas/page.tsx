'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Send,
  Eye,
  Pencil,
  Sparkles,
  Share2,
  Copy,
  Check,
  Calendar,
  X,
  CreditCard,
  Layers
} from 'lucide-react';
import { getStoredData, setStoredData, INITIAL_PROPOSALS } from '../../lib/crm-store';
import { Proposal, ProposalStatus } from '../../types/crm';

const PERIOD_LABELS: Record<string, string> = {
  MENSAL: '/mês',
  TRIMESTRAL: '/trimestre',
  SEMESTRAL: '/semestre',
  ANUAL: '/ano',
  UNICO: ' (Pagamento Único)'
};

const SCOPE_SHORTCUTS = [
  'Site Institucional de Alta Conversão',
  'Landing Page com Botão WhatsApp',
  'Hospedagem em Nuvem 12 Meses + SSL',
  'Franquia de 5 Artes Mensais',
  'Franquia de 12 Artes & Carrosséis',
  'Painel Administrativo para Atualizações',
  'Conformidade Ética e Regulatória (CFO/CRM/LGPD)',
  'Otimização de Velocidade e SEO Local',
  'SLA de Entrega em 7 Dias Úteis'
];

export default function PropostasPage() {
  const [proposals, setProposals] = useState<Proposal[]>(() =>
    getStoredData('vibe_proposals', INITIAL_PROPOSALS)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [offerModel, setOfferModel] = useState('Presença Própria');
  const [customOfferTitle, setCustomOfferTitle] = useState('');
  const [setupVal, setSetupVal] = useState<number>(1500);
  const [billingPeriod, setBillingPeriod] = useState<'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | 'UNICO'>('MENSAL');
  const [recurringVal, setRecurringVal] = useState<number>(99);
  const [validityDays, setValidityDays] = useState<number>(14);
  const [paymentTerms, setPaymentTerms] = useState('50% de entrada + 50% na aprovação final');
  const [scope, setScope] = useState(
    'Desenvolvimento de site de alta conversão, hospedagem de 12 meses e otimização para celular (SLA 7 Dias).'
  );

  const isCustomOffer = offerModel === 'PERSONALIZADA';

  const handleOfferChange = (val: string) => {
    setOfferModel(val);
    if (val === 'Presença Própria') {
      setSetupVal(1500);
      setRecurringVal(99);
      setBillingPeriod('MENSAL');
      setScope('Site Institucional de alta conversão + hospedagem em nuvem + SSL + WhatsApp integrado (SLA 7 Dias).');
    } else if (val === 'Esteira de Crescimento') {
      setSetupVal(2200);
      setRecurringVal(890);
      setBillingPeriod('MENSAL');
      setScope('Landing Page de Alta Conversão + 5 Artes Sociais Mensais + Relatório de Performance.');
    } else if (val === 'Plano 5 Artes') {
      setSetupVal(0);
      setRecurringVal(490);
      setBillingPeriod('MENSAL');
      setScope('Franquia mensal de 5 artes digitais para redes sociais com aprovação em 24h.');
    } else if (val === 'Plano 12 Artes') {
      setSetupVal(0);
      setRecurringVal(1290);
      setBillingPeriod('MENSAL');
      setScope('Franquia mensal de 12 artes e carrosséis com roteiro de copywriting.');
    } else if (val === 'Solução para Clínicas') {
      setSetupVal(3200);
      setRecurringVal(490);
      setBillingPeriod('MENSAL');
      setScope('Sistema completo de agendamento online + Landing Page de Autoridade + Conformidade CFO/CRM.');
    } else if (val === 'PERSONALIZADA') {
      if (!customOfferTitle) {
        setCustomOfferTitle('Proposta Comercial Sob Medida');
      }
    }
  };

  const openCreateModal = () => {
    setEditingProposalId(null);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setOfferModel('Presença Própria');
    setCustomOfferTitle('');
    setSetupVal(1500);
    setRecurringVal(99);
    setBillingPeriod('MENSAL');
    setValidityDays(14);
    setPaymentTerms('50% de entrada + 50% na aprovação final');
    setScope('Desenvolvimento de site de alta conversão, hospedagem de 12 meses e otimização para celular (SLA 7 Dias).');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Proposal) => {
    setEditingProposalId(p.id);
    setClientName(p.clientName);
    setClientEmail(p.clientEmail || '');
    setClientPhone(p.clientPhone || '');

    const standardPresets = [
      'Presença Própria',
      'Esteira de Crescimento',
      'Plano 5 Artes',
      'Plano 12 Artes',
      'Solução para Clínicas'
    ];

    if (standardPresets.includes(p.offerTitle) && !p.isCustom) {
      setOfferModel(p.offerTitle);
      setCustomOfferTitle('');
    } else {
      setOfferModel('PERSONALIZADA');
      setCustomOfferTitle(p.offerTitle);
    }

    setSetupVal(p.setupValue);
    setRecurringVal(p.recurringValue);
    setBillingPeriod(p.billingPeriod || (p.recurringValue > 0 ? 'MENSAL' : 'UNICO'));
    setPaymentTerms(p.paymentTerms || '50% de entrada + 50% na aprovação final');
    setScope(p.scopeText);

    // Calculate days remaining or default to 14
    setValidityDays(14);
    setIsModalOpen(true);
  };

  const handleSaveProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const finalOfferTitle = isCustomOffer
      ? (customOfferTitle.trim() || 'Proposta Personalizada')
      : offerModel;

    const finalRecurring = billingPeriod === 'UNICO' ? 0 : Number(recurringVal);

    if (editingProposalId) {
      // Update existing proposal
      const updated = proposals.map((p) => {
        if (p.id === editingProposalId) {
          const updatedItem: Proposal = {
            ...p,
            clientName: clientName.trim(),
            clientEmail: clientEmail.trim() || 'cliente@vibe.tech',
            clientPhone: clientPhone.trim() || undefined,
            offerTitle: finalOfferTitle,
            setupValue: Number(setupVal),
            recurringValue: finalRecurring,
            billingPeriod,
            paymentTerms,
            validUntil: new Date(Date.now() + validityDays * 86400000).toISOString().split('T')[0],
            scopeText: scope,
            isCustom: isCustomOffer
          };
          if (selectedProposal && selectedProposal.id === p.id) {
            setSelectedProposal(updatedItem);
          }
          return updatedItem;
        }
        return p;
      });

      setProposals(updated);
      setStoredData('vibe_proposals', updated);
    } else {
      // Create new proposal
      const newProp: Proposal = {
        id: `prop-${Date.now()}`,
        proposalNumber: `VIBE-2026-00${proposals.length + 1}`,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || 'cliente@vibe.tech',
        clientPhone: clientPhone.trim() || undefined,
        offerTitle: finalOfferTitle,
        setupValue: Number(setupVal),
        recurringValue: finalRecurring,
        billingPeriod,
        paymentTerms,
        validUntil: new Date(Date.now() + validityDays * 86400000).toISOString().split('T')[0],
        status: 'ENVIADA',
        scopeText: scope,
        isCustom: isCustomOffer,
        createdAt: new Date().toISOString()
      };

      const updated = [newProp, ...proposals];
      setProposals(updated);
      setStoredData('vibe_proposals', updated);
    }

    setIsModalOpen(false);
  };

  const handleUpdateStatus = (id: string, status: ProposalStatus) => {
    const updated = proposals.map((p) => (p.id === id ? { ...p, status } : p));
    setProposals(updated);
    setStoredData('vibe_proposals', updated);
    if (selectedProposal && selectedProposal.id === id) {
      setSelectedProposal({ ...selectedProposal, status });
    }
  };

  const handleAppendScopeShortcut = (text: string) => {
    if (scope.includes(text)) return;
    setScope((prev) => (prev ? `${prev}\n• ${text}` : `• ${text}`));
  };

  const handleCopyWhatsApp = (p: Proposal) => {
    const period = p.billingPeriod ? PERIOD_LABELS[p.billingPeriod] : '/mês';
    const text = `*PROPOSTA COMERCIAL VIBE DESIGN TECH*\nRef: ${p.proposalNumber}\nCliente: ${p.clientName}\n\n*Oferta:* ${p.offerTitle}\n*Setup Inicial:* R$ ${p.setupValue.toLocaleString('pt-BR')}\n*Recorrência:* ${p.recurringValue > 0 ? `R$ ${p.recurringValue.toLocaleString('pt-BR')}${period}` : 'Sem recorrência'}\n${p.paymentTerms ? `*Condições:* ${p.paymentTerms}\n` : ''}*Validade:* até ${p.validUntil}\n\n*Escopo de Entrega:*\n${p.scopeText}\n\n_Para aprovar e dar início ao projeto, responda esta mensagem._`;

    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2500);
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
            Emissão de propostas parametrizadas e personalizadas, com edição total de valores, periodicidade de recorrência e escopo.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
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
              Gere orçamentos e propostas comerciais formais ou sob medida para enviar a clientes em negociação.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Emitir Primeira Proposta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((p) => {
            const isCustom = p.isCustom || !['Presença Própria', 'Esteira de Crescimento', 'Plano 5 Artes', 'Plano 12 Artes', 'Solução para Clínicas'].includes(p.offerTitle);
            const periodLabel = p.billingPeriod ? PERIOD_LABELS[p.billingPeriod] : '/mês';

            return (
              <div
                key={p.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-cyan-800/60 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-cyan-400 font-bold">{p.proposalNumber}</span>
                      {isCustom && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono text-[9px] border border-cyan-800/60 flex items-center gap-1 font-bold">
                          <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Personalizada
                        </span>
                      )}
                    </div>
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
                    <h3 className="font-bold text-base text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {p.clientName}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Layers className="w-3 h-3 text-cyan-500/70" />
                      <span>{p.offerTitle}</span>
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Setup Inicial:</span>
                      <span className="text-slate-100 font-bold">R$ {p.setupValue.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-cyan-400">
                      <span>Recorrência:</span>
                      <span className="font-bold">
                        {p.recurringValue > 0
                          ? `R$ ${p.recurringValue.toLocaleString('pt-BR')}${periodLabel}`
                          : 'Sem recorrência'}
                      </span>
                    </div>
                    {p.paymentTerms && (
                      <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900 font-sans">
                        <span>Condição:</span>
                        <span className="text-slate-300 truncate max-w-[180px]">{p.paymentTerms}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-2 italic">
                    "{p.scopeText}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => setSelectedProposal(p)}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" /> Detalhes
                  </button>

                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 bg-slate-800 hover:bg-cyan-900/40 text-slate-300 hover:text-cyan-300 rounded-xl transition-colors border border-slate-700/60"
                    title="Editar Valores, Oferta e Escopo"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleCopyWhatsApp(p)}
                    className="p-1.5 bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-400 rounded-xl transition-colors border border-slate-700/60"
                    title="Copiar texto para WhatsApp"
                  >
                    {copiedId === p.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {p.status !== 'APROVADA' && (
                    <button
                      onClick={() => handleUpdateStatus(p.id, 'APROVADA')}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
                      title="Registrar Aceite"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aceitar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New / Edit Proposal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">
                  {editingProposalId ? 'Editar Proposta Comercial' : 'Emitir Nova Proposta Comercial'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProposalSubmit} className="space-y-3.5 text-xs">
              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente / Empresa *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Clínica OdontoManaus"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail do Decisor</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="contato@empresa.com.br"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Offer Model Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Modelo de Oferta VIBE</label>
                  {isCustomOffer && (
                    <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3 h-3" /> Modo Customizado Ativo
                    </span>
                  )}
                </div>
                <select
                  value={offerModel}
                  onChange={(e) => handleOfferChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Presença Própria">Presença Própria (R$ 1.500 + R$ 99/mês)</option>
                  <option value="Esteira de Crescimento">Esteira de Crescimento (R$ 2.200 + R$ 890/mês)</option>
                  <option value="Plano 5 Artes">Plano 5 Artes (R$ 490/mês)</option>
                  <option value="Plano 12 Artes">Plano 12 Artes (R$ 1.290/mês)</option>
                  <option value="Solução para Clínicas">Solução para Clínicas (R$ 3.200 + R$ 490/mês)</option>
                  <option value="PERSONALIZADA">✨ Proposta Personalizada (Definir Nome, Valores e Recorrência)</option>
                </select>
              </div>

              {/* Custom Offer Title (Shown if PERSONALIZADA) */}
              {isCustomOffer && (
                <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl space-y-1.5">
                  <label className="block text-xs font-semibold text-cyan-300">
                    Título da Oferta Personalizada *
                  </label>
                  <input
                    type="text"
                    required={isCustomOffer}
                    value={customOfferTitle}
                    onChange={(e) => setCustomOfferTitle(e.target.value)}
                    placeholder="Ex: Branding Completo + E-commerce + Tráfego Pago"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Dê um nome comercial atraente para esta solução sob medida.
                  </p>
                </div>
              )}

              {/* Pricing & Billing Period */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Setup / Projeto (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={setupVal}
                    onChange={(e) => setSetupVal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Periodicidade</label>
                  <select
                    value={billingPeriod}
                    onChange={(e) => setBillingPeriod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="MENSAL">Mensal (/mês)</option>
                    <option value="TRIMESTRAL">Trimestral (/trimestre)</option>
                    <option value="SEMESTRAL">Semestral (/semestre)</option>
                    <option value="ANUAL">Anual (/ano)</option>
                    <option value="UNICO">Pagamento Único (Sem Recorrência)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {billingPeriod === 'UNICO' ? 'Recorrência (Desativada)' : `Valor Recorrente (${PERIOD_LABELS[billingPeriod]})`}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    disabled={billingPeriod === 'UNICO'}
                    value={billingPeriod === 'UNICO' ? 0 : recurringVal}
                    onChange={(e) => setRecurringVal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Payment Terms & Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Condições de Pagamento</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="Ex: 50% de entrada + 50% na aprovação / Até 12x"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prazo de Validade</label>
                  <select
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value={7}>7 dias corridos</option>
                    <option value={14}>14 dias corridos (Padrão)</option>
                    <option value={30}>30 dias corridos</option>
                    <option value={60}>60 dias corridos</option>
                  </select>
                </div>
              </div>

              {/* Scope & Delivery */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Descrição do Escopo e Entregáveis
                  </label>
                  <span className="text-[10px] text-slate-400">Clique nas tags abaixo para adicionar</span>
                </div>

                {/* Scope Shortcut Pills */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SCOPE_SHORTCUTS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAppendScopeShortcut(item)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700/60 text-[10px] transition-colors"
                    >
                      + {item}
                    </button>
                  ))}
                </div>

                <textarea
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  rows={4}
                  required
                  placeholder="Descreva detalhadamente o que está incluso nesta proposta..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/25 transition-all"
                >
                  {editingProposalId ? 'Salvar Alterações' : 'Emitir Proposta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-bold">{selectedProposal.proposalNumber}</span>
                  {(selectedProposal.isCustom || !['Presença Própria', 'Esteira de Crescimento', 'Plano 5 Artes', 'Plano 12 Artes', 'Solução para Clínicas'].includes(selectedProposal.offerTitle)) && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono text-[9px] border border-cyan-800/60 flex items-center gap-1 font-bold">
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Personalizada
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">{selectedProposal.clientName}</h3>
                {selectedProposal.clientEmail && (
                  <p className="text-xs text-slate-400">{selectedProposal.clientEmail}</p>
                )}
              </div>
              <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800/40 font-bold">
                {selectedProposal.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Oferta Comercial:</p>
                <p className="text-slate-100 font-bold text-sm flex items-center gap-1.5 mt-0.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>{selectedProposal.offerTitle}</span>
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Setup / Projeto:</span>
                  <strong className="text-slate-100 text-sm">
                    R$ {selectedProposal.setupValue.toLocaleString('pt-BR')}
                  </strong>
                </div>
                <div className="flex justify-between text-cyan-400">
                  <span>Recorrência:</span>
                  <strong className="text-sm">
                    {selectedProposal.recurringValue > 0
                      ? `R$ ${selectedProposal.recurringValue.toLocaleString('pt-BR')}${selectedProposal.billingPeriod ? PERIOD_LABELS[selectedProposal.billingPeriod] : '/mês'}`
                      : 'Sem recorrência'}
                  </strong>
                </div>
                {selectedProposal.paymentTerms && (
                  <div className="flex justify-between text-slate-400 text-[11px] pt-1.5 border-t border-slate-900 font-sans">
                    <span>Condição:</span>
                    <span className="text-slate-200">{selectedProposal.paymentTerms}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-900">
                  <span>Validade:</span>
                  <span>até {selectedProposal.validUntil}</span>
                </div>
              </div>

              <div>
                <p className="text-slate-400 font-medium mb-1">Escopo Técnico Detalhado:</p>
                <div className="text-slate-200 bg-slate-950 p-3.5 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed text-xs">
                  {selectedProposal.scopeText}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedProposal)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700/60 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar Proposta
                </button>
                <button
                  onClick={() => handleCopyWhatsApp(selectedProposal)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700/60 transition-colors"
                >
                  {copiedId === selectedProposal.id ? (
                    <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copiado!</span>
                  ) : (
                    <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> WhatsApp</span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Fechar
                </button>

                {selectedProposal.status !== 'APROVADA' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedProposal.id, 'APROVADA')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/20"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Aceite do Cliente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
