'use client';

import React, { useState } from 'react';
import {
  PackageCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  MessageSquare,
  FileText,
  Search,
  Filter,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { getStoredData, setStoredData } from '../../lib/crm-store';

interface Entrega {
  id: string;
  cliente: string;
  titulo: string;
  tipo: 'ARTWORK' | 'CARROSSEL' | 'REELS_VIDEO' | 'ARTIGO_SEO' | 'CAMPANHA_ADS';
  ciclo: string;
  responsavel: string;
  prazo: string;
  status: 'PLANEJADA' | 'EM_PRODUCAO' | 'REVISAO_INTERNA' | 'APROVACAO_CLIENTE' | 'AJUSTES' | 'APROVADA' | 'PUBLICADA';
  arquivoUrl?: string;
  comentarioCliente?: string;
}

const ENTREGAS_INICIAIS: Entrega[] = [
  {
    id: 'ent-1',
    cliente: 'Clínica Dra. Ana Silva',
    titulo: 'Vídeo Reels: 5 Mitos sobre Harmonização Facial',
    tipo: 'REELS_VIDEO',
    ciclo: 'Outubro 2026',
    responsavel: 'Lucas Silva',
    prazo: '04/10/2026',
    status: 'APROVACAO_CLIENTE',
    arquivoUrl: 'https://vibeos.media/preview-reels-1.mp4',
    comentarioCliente: 'Aguardando validação do tom de voz pelo WhatsApp'
  },
  {
    id: 'ent-2',
    cliente: 'Instituto OrtoOdonto',
    titulo: 'Carrossel Educativo: Cuidados Pós-Implante',
    tipo: 'CARROSSEL',
    ciclo: 'Outubro 2026',
    responsavel: 'Fernanda Rocha',
    prazo: '06/10/2026',
    status: 'EM_PRODUCAO'
  },
  {
    id: 'ent-3',
    cliente: 'Advocacia Lima & Associados',
    titulo: 'Artigo SEO: Direitos Trabalhistas em Contratos PJ',
    tipo: 'ARTIGO_SEO',
    ciclo: 'Outubro 2026',
    responsavel: 'Gabriel Souza',
    prazo: '01/10/2026',
    status: 'APROVADA',
    arquivoUrl: 'https://vibeos.media/artigo-pj.pdf'
  },
  {
    id: 'ent-4',
    cliente: 'Studio Fit Performance',
    titulo: 'Banner de Promoção Semanal - Stories',
    tipo: 'ARTWORK',
    ciclo: 'Setembro 2026',
    responsavel: 'Mariana Costa',
    prazo: '29/09/2026',
    status: 'PUBLICADA'
  }
];

export default function EntregasPage() {
  const [entregas, setEntregas] = useState<Entrega[]>(() =>
    getStoredData('vibe_entregas_ui', ENTREGAS_INICIAIS)
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntregas = entregas.filter((e) => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesSearch =
      e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Entrega['status']) => {
    switch (status) {
      case 'APROVADA':
      case 'PUBLICADA':
        return 'bg-emerald-950/70 border-emerald-800 text-emerald-400';
      case 'APROVACAO_CLIENTE':
        return 'bg-amber-950/70 border-amber-800 text-amber-300 animate-pulse';
      case 'AJUSTES':
        return 'bg-rose-950/70 border-rose-800 text-rose-300';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-300';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
              Operação de Mídia • Artes & Conteúdo Mensal
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <PackageCheck className="w-7 h-7 text-cyan-400" />
            Entregas & Calendário Editorial
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Controle de peças criativas, vídeos, artigos SEO e aprovações dos clientes por ciclo mensal.
          </p>
        </div>

        <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/25">
          <Plus className="w-4 h-4" /> Nova Entrega no Ciclo
        </button>
      </div>

      {/* Cycle usage progress card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1 w-full md:w-auto">
          <h3 className="font-extrabold text-slate-100 text-sm">Utilização de Entregas do Ciclo de Outubro</h3>
          <p className="text-xs text-slate-400">Total contratado na carteira ativa: 36 entregas/mês</p>
        </div>

        <div className="w-full md:w-72 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300 font-mono">
            <span>24 de 36 entregas</span>
            <span className="text-cyan-400 font-bold">66% concluído</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full w-[66%]" />
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center border-b border-slate-800 pb-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por peça, cliente ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PLANEJADA">Planejada</option>
            <option value="EM_PRODUCAO">Em Produção</option>
            <option value="REVISAO_INTERNA">Revisão Interna</option>
            <option value="APROVACAO_CLIENTE">Aprovação Cliente</option>
            <option value="AJUSTES">Ajustes</option>
            <option value="APROVADA">Aprovada</option>
            <option value="PUBLICADA">Publicada</option>
          </select>
        </div>

        {/* Deliverables Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntregas.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono">
                    {item.tipo}
                  </span>
                  <h3 className="font-extrabold text-slate-100 text-sm mt-1">{item.titulo}</h3>
                  <p className="text-xs text-slate-400">{item.cliente} • {item.ciclo}</p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold font-mono border ${getStatusBadge(item.status)}`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              {item.comentarioCliente && (
                <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>{item.comentarioCliente}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-900">
                <span className="text-slate-500 text-[11px]">Resp: {item.responsavel} • Prazo: {item.prazo}</span>

                {item.arquivoUrl ? (
                  <a
                    href={item.arquivoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    Ver Arquivo <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Anexar Peça
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
