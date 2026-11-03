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
import { useCrmCollection } from '../../lib/crm-client';
import { Deliverable, Company, Project, Contract } from '../../types/crm';
import { useAuth } from '../../lib/auth-context';
type LinkedDelivery = Deliverable & { projectId?: string; companyId?: string };

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

const ENTREGAS_INICIAIS: Entrega[] = [];

export default function EntregasPage() {
  const { user } = useAuth();
  const [deliverables, saveAsync, { loading, error }] = useCrmCollection<LinkedDelivery[]>('vibe_deliverables', []);
  const [companies] = useCrmCollection<Company[]>('vibe_companies', []);
  const [projects] = useCrmCollection<Project[]>('vibe_projects', []);
  const [contracts] = useCrmCollection<Contract[]>('vibe_contracts', []);
  const [actionError, setActionError] = useState('');
  const entregas = deliverables.map(d => ({id: d.id, cliente: d.companyName, titulo: d.title, tipo: d.type,
    ciclo: d.cycleMonth, responsavel: d.assignedTo, prazo: d.dueDate, status: d.status,
    arquivoUrl: d.fileUrl, comentarioCliente: d.feedbackClient }));
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState<LinkedDelivery | null>(null);
  const [busy, setBusy] = useState(false);
  const persist = async (next: LinkedDelivery[]) => {
    setActionError(''); setBusy(true);
    try { await saveAsync(next); return true; }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Falha ao salvar entrega.'); return false; }
    finally { setBusy(false); }
  };
  const saveDelivery = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing || busy || loading) return;
    const company = companies.find(c => c.id === editing.companyId);
    if (!company || !editing.title.trim() || !editing.cycleMonth || !editing.dueDate) { setActionError('Informe título, empresa, ciclo e prazo.'); return; }
    if (editing.projectId && !projects.some(p => p.id === editing.projectId && p.companyId === company.id)) { setActionError('Projeto deve pertencer à empresa.'); return; }
    if (editing.contractId && !contracts.some(c => c.id === editing.contractId && c.companyId === company.id)) { setActionError('Contrato deve pertencer à empresa.'); return; }
    if (editing.fileUrl) { try { if (!['http:','https:'].includes(new URL(editing.fileUrl).protocol)) throw Error(); } catch { setActionError('URL do arquivo deve ser HTTP(S).'); return; } }
    if (['ENVIADA_CLIENTE','APROVADA','PUBLICADA'].includes(editing.status) && !editing.fileUrl?.trim()) { setActionError('Registre o link real do arquivo antes deste status.'); return; }
    const next = {...editing, title: editing.title.trim(), companyName: company.name};
    if (await persist([...deliverables.filter(d => d.id !== editing.id), next])) setEditing(null);
  };

  const filteredEntregas = entregas.filter((e) => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesSearch =
      e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Deliverable['status']) => {
    switch (status) {
      case 'APROVADA':
      case 'PUBLICADA':
        return 'bg-emerald-950/70 border-emerald-800 text-emerald-400';
      case 'ENVIADA_CLIENTE':
        return 'bg-amber-950/70 border-amber-800 text-amber-300 animate-pulse';
      case 'AJUSTES_SOLICITADOS':
        return 'bg-rose-950/70 border-rose-800 text-rose-300';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-300';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {loading && <p role="status">Carregando entregas…</p>}
      {(error || actionError) && <p role="alert" className="text-rose-400">{String(error || actionError)}</p>}
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

        <button disabled={loading || busy} onClick={() => setEditing({id: crypto.randomUUID(), title: '', companyName: '', companyId: '', projectId: '', contractId: '', type: 'LANDING_PAGE', cycleMonth: '', dueDate: '', assignedTo: user?.name || '', status: 'PLANEJADA', createdAt: new Date().toISOString()})} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/25">
          <Plus className="w-4 h-4" /> Nova Entrega no Ciclo
        </button>
      </div>

      {editing && <form onSubmit={saveDelivery} className="space-y-3 rounded-xl bg-slate-900 border border-slate-800 p-4 text-sm text-slate-200">
        <h2 className="font-semibold">Entrega — dados, vínculo e status</h2>
        <input required aria-label="Título da entrega" value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2" />
        <select required aria-label="Empresa da entrega" value={editing.companyId || ''} onChange={e => setEditing({...editing, companyId: e.target.value, projectId: '', contractId: ''})} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2"><option value="">Selecione a empresa</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select aria-label="Projeto da entrega" value={editing.projectId || ''} onChange={e => setEditing({...editing, projectId: e.target.value})} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2"><option value="">Sem projeto (opcional)</option>{projects.filter(p => p.companyId === editing.companyId).map(p => <option key={p.id} value={p.id}>{p.nomeEmpresa} — {p.projectType}</option>)}</select>
        <select aria-label="Contrato da entrega" value={editing.contractId || ''} onChange={e => setEditing({...editing, contractId: e.target.value})} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2"><option value="">Sem contrato (opcional)</option>{contracts.filter(c => c.companyId === editing.companyId).map(c => <option key={c.id} value={c.id}>{c.contractNumber}</option>)}</select>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label>Ciclo<input required type="month" aria-label="Ciclo da entrega" value={editing.cycleMonth} onChange={e => setEditing({...editing, cycleMonth: e.target.value})} className="block w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2" /></label>
          <label>Prazo<input required type="date" aria-label="Prazo da entrega" value={editing.dueDate} onChange={e => setEditing({...editing, dueDate: e.target.value})} className="block w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2" /></label>
        </div>
        <select aria-label="Tipo da entrega" value={editing.type} onChange={e => setEditing({...editing, type: e.target.value as Deliverable['type']})} className="rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2">{['ARTE_REDES','CARROSSEL','REELS_VIDEO','LANDING_PAGE','EBOOK','ANUNCIO'].map(v => <option key={v}>{v}</option>)}</select>
        <select aria-label="Status da entrega" value={editing.status} onChange={e => setEditing({...editing, status: e.target.value as Deliverable['status']})} className="rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2">{['PLANEJADA','EM_PRODUCAO','REVISAO_INTERNA','ENVIADA_CLIENTE','AJUSTES_SOLICITADOS','APROVADA','PUBLICADA'].map(v => <option key={v}>{v}</option>)}</select>
        <label className="block">Link real do arquivo (não fazemos upload)<input type="url" aria-label="URL do arquivo" value={editing.fileUrl || ''} onChange={e => setEditing({...editing, fileUrl: e.target.value})} className="block w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2" /></label>
        <label className="block">Feedback registrado do cliente<textarea aria-label="Feedback do cliente" value={editing.feedbackClient || ''} onChange={e => setEditing({...editing, feedbackClient: e.target.value})} className="block w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2" /></label>
        <button disabled={busy} className="rounded-lg bg-cyan-600 px-4 py-2 focus-visible:ring-2 focus-visible:ring-offset-2">Salvar entrega</button>
        <button type="button" disabled={busy} onClick={() => setEditing(null)} className="px-4 py-2 focus-visible:ring-2 focus-visible:ring-offset-2">Cancelar</button>
      </form>}
      {/* Cycle usage progress card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1 w-full md:w-auto">
          <h3 className="font-extrabold text-slate-100 text-sm">Utilização de Entregas do Ciclo Operacional</h3>
          <p className="text-xs text-slate-400">Total de entregas cadastradas: {entregas.length}</p>
        </div>

        <div className="w-full md:w-72 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300 font-mono">
            <span>
              {entregas.filter((e) => e.status === 'APROVADA' || e.status === 'PUBLICADA').length} de {entregas.length} concluídas
            </span>
            <span className="text-cyan-400 font-bold">
              {entregas.length > 0
                ? Math.round(
                    (entregas.filter((e) => e.status === 'APROVADA' || e.status === 'PUBLICADA').length /
                      entregas.length) *
                      100
                  )
                : 0}
              %
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all"
              style={{
                width: `${
                  entregas.length > 0
                    ? Math.round(
                        (entregas.filter((e) => e.status === 'APROVADA' || e.status === 'PUBLICADA').length /
                          entregas.length) *
                          100
                      )
                    : 0
                }%`
              }}
            />
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
            <option value="ENVIADA_CLIENTE">Enviada ao cliente</option>
            <option value="AJUSTES_SOLICITADOS">Ajustes solicitados</option>
            <option value="APROVADA">Aprovada</option>
            <option value="PUBLICADA">Publicada</option>
          </select>
        </div>

        {/* Deliverables Cards */}
        {filteredEntregas.length === 0 ? (
          <div className="p-12 text-center bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Nenhuma entrega cadastrada na esteira</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Crie entregas mensais (artes, carrosséis, vídeos ou landing pages) vinculadas aos contratos reais.
            </p>
          </div>
        ) : (
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
                  <button onClick={() => setEditing(deliverables.find(d => d.id === item.id) || null)} className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Informar link
                  </button>
                )}
              </div>
              <div className="flex gap-3 text-xs">
                <button disabled={busy} onClick={() => setEditing(deliverables.find(d => d.id === item.id) || null)} className="text-cyan-400 focus-visible:ring-2 focus-visible:ring-offset-2">Editar / alterar status</button>
                <button disabled={busy} onClick={async () => { if (window.confirm('Excluir esta entrega?')) await persist(deliverables.filter(d => d.id !== item.id)); }} className="text-rose-400 focus-visible:ring-2 focus-visible:ring-offset-2">Excluir entrega</button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
