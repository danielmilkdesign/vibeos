'use client';

import React, { useState } from 'react';
import { Lead, LeadStatus, Interacao } from '../../types/crm';
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Send, 
  Calendar, 
  FileText, 
  Sparkles,
  DollarSign
} from 'lucide-react';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onAddInteraction: (leadId: string, interaction: Omit<Interacao, 'id' | 'createdAt'>) => void;
}

export default function LeadDetailModal({
  lead,
  onClose,
  onUpdateStatus,
  onAddInteraction,
}: LeadDetailModalProps) {
  const [tipo, setTipo] = useState<'NOTA' | 'EMAIL' | 'WHATSAPP' | 'REUNIAO' | 'PROPOSTA'>('NOTA');
  const [conteudo, setConteudo] = useState('');
  const [autor, setAutor] = useState('Usuário VIBE');

  if (!lead) return null;

  const handleSubmitInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudo.trim()) return;

    onAddInteraction(lead.id, {
      leadId: lead.id,
      tipo,
      conteudo,
      autor: autor || 'VIBE OS',
    });

    setConteudo('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-cyan-500/20">
              {lead.nomeEmpresa.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-100">{lead.nomeEmpresa}</h3>
                <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs">
                  {lead.nicho}
                </span>
                {lead.urgencia === 'CRITICA' ? (
                  <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2.5 py-0.5 rounded font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> Urgência Crítica
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Urgência {lead.urgencia}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                <span>{lead.localizacao}</span>
                <span>•</span>
                <span>Decisor: <strong className="text-slate-200">{lead.nomeDecisor || 'Não informado'}</strong> ({lead.cargoDecisor || 'N/A'})</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-950/40">
          {/* Main Info Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Status no Pipeline</span>
              <select
                value={lead.status}
                onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                className="w-full bg-slate-950 text-cyan-400 border border-cyan-800/60 font-semibold text-xs rounded-lg p-2 focus:outline-none"
              >
                <option value="LEAD_NOVO">Lead Novo</option>
                <option value="DIAGNOSTICO_GERADO">Diagnóstico Gerado</option>
                <option value="ABORDADO_EMAIL">Abordado (E-mail)</option>
                <option value="ABORDADO_WHATSAPP">Abordado (WhatsApp)</option>
                <option value="REUNIAO_AGENDADA">Reunião Agendada</option>
                <option value="PROPOSTA_ENVIADA">Proposta Enviada</option>
                <option value="FECHADO">Fechado / Ganho</option>
                <option value="PERDIDO">Perdido</option>
              </select>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Valor Estimado</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                R$ {(lead.valorEstimado || 2000).toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Authority Score (AS)</span>
              <div className="text-lg font-bold text-indigo-400 font-mono">
                {lead.authorityScore} / 100
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Tráfego Orgânico</span>
              <div className="text-lg font-bold text-slate-200 font-mono">
                {lead.trafegoOrganico} visitas/mês
              </div>
            </div>
          </div>

          {/* Contact & Bio Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Canais de Contato & Redes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {lead.emailDecisor && (
                <a
                  href={`mailto:${lead.emailDecisor}`}
                  className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 hover:border-cyan-700 hover:text-cyan-400 transition-all"
                >
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">{lead.emailDecisor}</span>
                </a>
              )}

              {lead.phoneWhatsapp && (
                <a
                  href={`https://wa.me/55${lead.phoneWhatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 hover:border-emerald-700 hover:text-emerald-400 transition-all"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{lead.phoneWhatsapp}</span>
                </a>
              )}

              {lead.linkBio && (
                <a
                  href={lead.linkBio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 hover:border-purple-700 hover:text-purple-400 transition-all"
                >
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="truncate">Link Bio / Site Actual</span>
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              )}
            </div>
          </div>

          {/* Diagnóstico SEO & Oportunidade */}
          <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Diagnóstico AIsa & VIBE Outbound
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed">{lead.diagnosticoSeo || 'Diagnóstico sob demanda em andamento.'}</p>
          </div>

          {/* Histórico de Interações & Timeline */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200 flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Timeline de Interações ({lead.interacoes?.length || 0})
              </span>
            </h4>

            {/* Form Nova Interação */}
            <form onSubmit={handleSubmitInteraction} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                  className="bg-slate-950 text-slate-200 border border-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  <option value="NOTA">📝 Nota Interna</option>
                  <option value="WHATSAPP">💬 Mensagem WhatsApp</option>
                  <option value="EMAIL">📧 E-mail Enviado</option>
                  <option value="REUNIAO">📅 Reunião Realizada</option>
                  <option value="PROPOSTA">📄 Proposta Comercial</option>
                </select>

                <input
                  type="text"
                  placeholder="Nome do operador / autor..."
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-700 text-xs rounded-lg px-3 py-2 sm:w-48 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="Registre os detalhes da interação (ex: Cliente pediu envio da proposta na quinta)..."
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  className="flex-1 bg-slate-950 text-slate-200 border border-slate-700 text-xs rounded-lg p-3 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg flex items-center gap-1 self-end py-3 shadow-lg shadow-cyan-600/20"
                >
                  <Send className="w-3.5 h-3.5" /> Registrar
                </button>
              </div>
            </form>

            {/* List Interactions */}
            <div className="space-y-3">
              {(!lead.interacoes || lead.interacoes.length === 0) ? (
                <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  Nenhuma interação registrada ainda. Adicione uma nota ou contato acima!
                </div>
              ) : (
                lead.interacoes.map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex gap-3 text-xs">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
                      {item.tipo === 'WHATSAPP' && '💬'}
                      {item.tipo === 'EMAIL' && '📧'}
                      {item.tipo === 'REUNIAO' && '📅'}
                      {item.tipo === 'PROPOSTA' && '📄'}
                      {item.tipo === 'NOTA' && '📝'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-200">{item.autor || 'Operador'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{item.conteudo}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
