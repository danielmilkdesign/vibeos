'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Loader2,
  BarChart3,
  Star,
  Globe,
  Instagram,
  MessageCircle,
  Image as ImageIcon,
  MapPin,
  FileText,
  Send,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { getStoredData, setStoredData } from '../../lib/crm-store';
import { Proposal } from '../../types/crm';

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  category: string;
  rating?: number | null;
  ratingCount?: number | null;
  status: string;
}

interface Analise {
  empresa: string;
  categoria: string;
  bairro: string | null;
  posicionamento: { resumo: string; avaliacao: number | null; volumeAvaliacoes: number | null; forca: string };
  logo: { temLogo: boolean; fonte: string; recomendacao: string };
  site: { temSite: boolean; url: string | null; recomendacao: string };
  redesSociais: { temInstagram: boolean; instagram: string | null; recomendacao: string };
  automacaoWhatsapp: { temWhatsapp: boolean; numero: string | null; nivel: string; recomendacao: string };
  score: number;
  prioridade: string;
  ofertaRecomendada: string;
}

const PRIORIDADE_COLOR: Record<string, string> = {
  ALTA: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  MEDIA: 'bg-amber-950 text-amber-400 border-amber-800',
  BAIXA: 'bg-slate-800 text-slate-300 border-slate-700',
};

const OFERTA_PRESETS: Record<string, { setup: number; recorrencia: number; escopo: string }> = {
  'Presença Própria': {
    setup: 1500,
    recorrencia: 99,
    escopo: 'Site institucional de alta conversão + hospedagem em nuvem + SSL + WhatsApp integrado (SLA 7 dias).',
  },
  'Esteira de Crescimento': {
    setup: 2200,
    recorrencia: 890,
    escopo: 'Landing page de alta conversão + 5 artes sociais mensais + relatório de performance.',
  },
  'Plano 5 Artes': {
    setup: 0,
    recorrencia: 490,
    escopo: 'Franquia mensal de 5 artes digitais para redes sociais com aprovação em 24h.',
  },
  'Plano 12 Artes': {
    setup: 0,
    recorrencia: 1290,
    escopo: 'Franquia mensal de 12 artes e carrosséis com roteiro de copywriting.',
  },
  'Solução para Clínicas': {
    setup: 3200,
    recorrencia: 490,
    escopo: 'Sistema de agendamento online + landing page de autoridade + conformidade.',
  },
};

function cleanWhatsApp(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g, '');
  return d.length >= 10 ? `55${d}` : null;
}

export default function LeadAnalysisModal({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [waText, setWaText] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendState, setSendState] = useState<'idle' | 'sent' | 'error' | 'not_configured'>('idle');
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/prospeccao/analisar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: lead.name,
            category: lead.category,
            phone: lead.phone,
            website: lead.website,
            address: lead.address,
            rating: lead.rating,
            ratingCount: lead.ratingCount,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Falha ao analisar a empresa.');
        }
        if (!cancelled) setAnalise(data.analise);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Erro ao analisar a empresa.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lead]);

  const handleGerarProposta = () => {
    if (!analise) return;
    const preset = OFERTA_PRESETS[analise.ofertaRecomendada] || OFERTA_PRESETS['Presença Própria'];
    const existing = getStoredData<Proposal[]>('vibe_proposals', []);
    const number = existing.length + 1;

    const nova: Proposal = {
      id: `prop-${Date.now()}`,
      proposalNumber: `VIBE-2026-${String(number).padStart(3, '0')}`,
      clientName: analise.empresa,
      clientEmail: 'cliente@vibe.tech',
      clientPhone: lead.phone || undefined,
      offerTitle: analise.ofertaRecomendada,
      setupValue: preset.setup,
      recurringValue: preset.recorrencia,
      billingPeriod: preset.recorrencia > 0 ? 'MENSAL' : 'UNICO',
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'RASCUNHO',
      scopeText: preset.escopo,
      paymentTerms: '50% de entrada + 50% na aprovação final',
      isCustom: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [nova, ...existing];
    setStoredData('vibe_proposals', updated);
    setProposal(nova);

    const periodo = nova.billingPeriod === 'MENSAL' ? '/mês' : '';
    const texto = `*PROPOSTA COMERCIAL VIBE DESIGN TECH*\nRef: ${nova.proposalNumber}\nCliente: ${nova.clientName}\n\n*Oferta:* ${nova.offerTitle}\n*Setup Inicial:* R$ ${nova.setupValue.toLocaleString('pt-BR')}\n*Recorrência:* ${nova.recurringValue > 0 ? `R$ ${nova.recurringValue.toLocaleString('pt-BR')}${periodo}` : 'Sem recorrência'}\n*Condições:* ${nova.paymentTerms}\n*Validade:* até ${nova.validUntil}\n\n*Escopo de Entrega:*\n${nova.scopeText}\n\n_Para aprovar e dar início ao projeto, responda esta mensagem._`;
    setWaText(texto);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(waText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard indisponível */
    }
  };

  const handleAutoSend = async () => {
    if (!proposal || !waText || !waNumber) return;
    setSending(true);
    setSendState('idle');
    setSendError('');
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: lead.phone, message: waText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendState('sent');
      } else if (data.configured === false) {
        setSendState('not_configured');
      } else {
        setSendState('error');
        setSendError(data.error || 'Falha no envio automático.');
      }
    } catch (e: any) {
      setSendState('error');
      setSendError(e.message || 'Erro de conexão ao enviar.');
    } finally {
      setSending(false);
    }
  };

  const waNumber = cleanWhatsApp(lead.phone);
  const waLink = proposal && waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0E1422] border border-white/[0.08] w-full max-w-2xl rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0E1422] border-b border-white/[0.08] p-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">{lead.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">{lead.category}</span>
                {lead.address && (
                  <span className="truncate"><MapPin className="w-3 h-3 inline text-slate-500" /> {lead.address}</span>
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
              <span className="text-sm">Analisando posicionamento, logo, site, redes e WhatsApp…</span>
            </div>
          )}

          {error && !loading && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {analise && !loading && !error && !proposal && (
            <>
              {/* Score + Prioridade */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-800 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-cyan-300">{analise.score}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">score</span>
                </div>
                <div className="flex-1">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${PRIORIDADE_COLOR[analise.prioridade]}`}>
                    Prioridade {analise.prioridade}
                  </span>
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    Oferta recomendada: <span className="text-cyan-300 font-semibold">{analise.ofertaRecomendada}</span>
                  </p>
                </div>
              </div>

              {/* Posicionamento */}
              <DiagnosticoCard
                icon={<Star className="w-4 h-4 text-amber-400" />}
                title="Posicionamento"
                text={analise.posicionamento.resumo}
                badge={analise.posicionamento.forca}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DiagnosticoCard
                  icon={<ImageIcon className="w-4 h-4 text-violet-400" />}
                  title="Logo"
                  text={analise.logo.recomendacao}
                  badge={analise.logo.temLogo ? 'Detectada' : 'Ausente'}
                />
                <DiagnosticoCard
                  icon={<Globe className="w-4 h-4 text-cyan-400" />}
                  title="Site"
                  text={analise.site.recomendacao}
                  badge={analise.site.temSite ? 'Possui site' : 'Sem site'}
                />
                <DiagnosticoCard
                  icon={<Instagram className="w-4 h-4 text-pink-400" />}
                  title="Redes Sociais"
                  text={analise.redesSociais.recomendacao}
                  badge={analise.redesSociais.temInstagram ? analise.redesSociais.instagram || 'Ativo' : 'Ausente'}
                />
                <DiagnosticoCard
                  icon={<MessageCircle className="w-4 h-4 text-emerald-400" />}
                  title="Automação WhatsApp"
                  text={analise.automacaoWhatsapp.recomendacao}
                  badge={analise.automacaoWhatsapp.temWhatsapp ? 'WhatsApp ativo' : 'Sem WhatsApp'}
                />
              </div>

              <button
                onClick={handleGerarProposta}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Gerar Proposta e Enviar por WhatsApp
              </button>
            </>
          )}

          {proposal && (
            <>
              {/* Proposta gerada */}
              <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" /> Proposta gerada
                  </span>
                  <span className="text-[10px] text-slate-400">Salva em Propostas</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-200 font-semibold">{proposal.offerTitle}</span>
                  <span className="font-mono text-white">
                    R$ {proposal.setupValue.toLocaleString('pt-BR')}
                    {proposal.recurringValue > 0 ? ` + R$ ${proposal.recurringValue.toLocaleString('pt-BR')}/mês` : ''}
                  </span>
                </div>
              </div>

              {/* Mensagem WhatsApp */}
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> Mensagem pronta para WhatsApp
                </p>
                <pre className="whitespace-pre-wrap text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-xl p-3.5 leading-relaxed font-sans">
                  {waText}
                </pre>
              </div>

              {sendState === 'sent' && (
                <div className="bg-emerald-950/50 border border-emerald-800 rounded-lg px-3 py-2 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" /> Proposta enviada automaticamente pelo WhatsApp!
                </div>
              )}
              {sendState === 'not_configured' && (
                <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg px-3 py-2 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Envio automático não configurado — use o botão WhatsApp para enviar manualmente.
                </div>
              )}
              {sendState === 'error' && (
                <div className="bg-rose-950/40 border border-rose-800/60 rounded-lg px-3 py-2 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {sendError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                {waNumber && (
                  <button
                    onClick={handleAutoSend}
                    disabled={sending}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? 'Enviando…' : 'Enviar Automaticamente'}
                  </button>
                )}
                {waLink ? (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
                    title="Abrir conversa no WhatsApp (envio manual)"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                ) : (
                  !waNumber && (
                    <div className="flex-1 py-2.5 bg-slate-800 text-slate-400 text-xs rounded-xl flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Sem número de WhatsApp no lead
                    </div>
                  )
                )}
                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DiagnosticoCard({
  icon,
  title,
  text,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  badge?: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">{icon}{title}</span>
        {badge && (
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px] whitespace-nowrap">{badge}</span>
        )}
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}
