'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Loader2,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  Copy,
  Check,
  Send,
  AlertCircle,
  Download,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

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

interface ImagemProposta {
  type: 'site' | 'automacao' | 'redes' | 'logo';
  title: string;
  svg: string;
  dataUri: string;
}

interface LoteItem {
  lead: Lead;
  analise: {
    score: number;
    prioridade: string;
    ofertaRecomendada: string;
  };
  proposta: {
    oferta: string;
    setupValue: number;
    recurringValue: number;
    texto: string;
    imagens: ImagemProposta[];
  };
}

function cleanWhatsApp(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g, '');
  return d.length >= 10 ? `55${d}` : null;
}

export default function BulkAnalysisModal({
  leads,
  onClose,
}: {
  leads: Lead[];
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<LoteItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(5);
        const res = await fetch('/api/prospeccao/analisar-lote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leads }),
        });
        setProgress(90);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Falha na análise em lote.');
        if (!cancelled) {
          setResults(data.results || []);
          setProgress(100);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Erro na análise em lote.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [leads]);

  const copyText = async (item: LoteItem) => {
    try {
      await navigator.clipboard.writeText(item.proposta.texto);
      setCopiedId(item.lead.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* clipboard indisponível */
    }
  };

  const downloadPNG = (img: ImagemProposta, empresa: string) => {
    const w = parseInt(img.svg.match(/width="(\d+)"/)?.[1] || '1200', 10);
    const h = parseInt(img.svg.match(/height="(\d+)"/)?.[1] || '630', 10);
    const url = URL.createObjectURL(new Blob([img.svg], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0A0F1D';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(image, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `${empresa.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${img.type}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, 'image/png');
      }
    };
    image.src = url;
  };

  const downloadAll = () => {
    results.forEach((item) => item.proposta.imagens.forEach((img) => downloadPNG(img, item.lead.name)));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0E1422] border border-white/[0.08] w-full max-w-4xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="border-b border-white/[0.08] p-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Análise em lote</h3>
              <p className="text-xs text-slate-400">
                {loading ? `Analisando ${leads.length} empresa${leads.length > 1 ? 's' : ''}…` : `${results.length} propostas geradas com texto + imagens`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {loading && (
            <div className="py-12 space-y-4">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
                <span className="text-sm">A IA está analisando presença digital (redes, logo, site, WhatsApp, automação)…</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{results.length} proposta{results.length > 1 ? 's' : ''} pronta{results.length > 1 ? 's' : ''}</span>
                <button onClick={downloadAll} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700">
                  <Download className="w-3.5 h-3.5 text-cyan-400" /> Baixar todas as imagens
                </button>
              </div>

              <div className="space-y-2.5">
                {results.map((item) => {
                  const isOpen = openId === item.lead.id;
                  const wa = cleanWhatsApp(item.lead.phone);
                  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(item.proposta.texto)}` : null;
                  return (
                    <div key={item.lead.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenId(isOpen ? null : item.lead.id)}
                        className="w-full p-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-800 flex items-center justify-center font-bold text-cyan-300 text-sm shrink-0">
                            {item.analise.score}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{item.lead.name}</div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {item.analise.prioridade} · {item.proposta.oferta} · {item.proposta.imagens.length} imagem{item.proposta.imagens.length !== 1 ? 'ns' : ''}
                            </div>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen && (
                        <div className="p-4 pt-0 space-y-3 border-t border-white/[0.04]">
                          <div className="flex items-center justify-between text-xs pt-3">
                            <span className="text-slate-400">Oferta</span>
                            <span className="font-mono text-white">
                              R$ {item.proposta.setupValue.toLocaleString('pt-BR')}
                              {item.proposta.recurringValue > 0 ? ` + R$ ${item.proposta.recurringValue.toLocaleString('pt-BR')}/mês` : ''}
                            </span>
                          </div>

                          {item.proposta.imagens.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {item.proposta.imagens.map((img) => (
                                <div key={img.type} className="bg-black/30 border border-white/[0.06] rounded-lg overflow-hidden group">
                                  <img src={img.dataUri} alt={img.title} className="w-full h-auto" />
                                  <button
                                    onClick={() => downloadPNG(img, item.lead.name)}
                                    className="w-full p-1 text-[10px] text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-1 transition-colors"
                                  >
                                    <Download className="w-3 h-3" /> {img.title}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <pre className="whitespace-pre-wrap text-[11px] text-slate-200 bg-slate-950 border border-slate-800 rounded-xl p-3 leading-relaxed font-sans max-h-48 overflow-y-auto">
                            {item.proposta.texto}
                          </pre>

                          <div className="flex flex-wrap gap-2">
                            {waLink ? (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" /> Enviar no WhatsApp
                              </a>
                            ) : (
                              <span className="px-3 py-2 bg-slate-800 text-slate-400 text-xs rounded-lg flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> Sem WhatsApp
                              </span>
                            )}
                            <button
                              onClick={() => copyText(item)}
                              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                            >
                              {copiedId === item.lead.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedId === item.lead.id ? 'Copiado' : 'Copiar texto'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
