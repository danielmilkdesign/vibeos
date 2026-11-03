'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  User,
  Layers,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useCrmCollection } from '../../lib/crm-client';
import { Project } from '../../types/crm';
import { toggleProjectTask, reconcileProject } from '../../lib/operations-domain';
import { useAuth } from '../../lib/auth-context';

interface Tarefa {
  id: string;
  titulo: string;
  projeto: string;
  cliente: string;
  responsavel: string;
  prazo: string;
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  status: 'A_FAZER' | 'EM_ANDAMENTO' | 'EM_REVISAO' | 'AGUARDANDO_CLIENTE' | 'BLOQUEADA' | 'CONCLUIDA';
  aguardandoCliente: boolean;
  diasAtraso?: number;
}

const TAREFAS_INICIAIS: Tarefa[] = [];

export default function TarefasPage() {
  const { user } = useAuth();
  const [projects, saveAsync, { loading, error }] = useCrmCollection<Project[]>('vibe_projects', []);
  const [actionError, setActionError] = useState('');
  const tarefas = projects.flatMap(p => (p.tasks || []).map(t => ({
    id: t.id, projectId: p.id, titulo: t.title, projeto: p.projectType, cliente: p.nomeEmpresa,
    responsavel: t.assignedTo, prazo: t.dueDate, prioridade: t.priority || 'MEDIA',
    status: t.completed ? 'CONCLUIDA' : t.status || 'A_FAZER', aguardandoCliente: t.status === 'AGUARDANDO_CLIENTE',
    diasAtraso: !t.completed && /^\d{4}-\d{2}-\d{2}/.test(t.dueDate) ? Math.max(0, Math.floor((Date.now() - Date.parse(t.dueDate + 'T23:59:59')) / 86400000)) : 0
  })));
  const [viewMode, setViewMode] = useState<'MINHAS' | 'TODAS' | 'ATRASADAS'>('TODAS');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [busy, setBusy] = useState(false);
  const createTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || loading || !user) return;
    if (!title.trim() || !projects.some(p => p.id === projectId)) { setActionError('Selecione um projeto e informe a tarefa.'); return; }
    setActionError(''); setBusy(true);
    const task = { id: crypto.randomUUID(), projectId, title: title.trim(), assignedTo: user.name, dueDate, completed: false, status: 'A_FAZER' as const };
    try {
      await saveAsync(projects.map(p => p.id === projectId ? reconcileProject({...p, tasks: [...(p.tasks || []), task]}) : p));
      setCreating(false); setTitle(''); setDueDate('');
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Falha ao criar tarefa.'); }
    finally { setBusy(false); }
  };

  const toggleTaskConcluida = async (projectId: string, id: string) => {
    setActionError('');
    try { await saveAsync(toggleProjectTask(projects, projectId, id)); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Falha ao salvar tarefa.'); }
  };

  const filteredTarefas = tarefas.filter((t) => {
    if (viewMode === 'ATRASADAS' && !t.diasAtraso && t.status !== 'BLOQUEADA') return false;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPrioridade = prioridadeFilter === 'ALL' || t.prioridade === prioridadeFilter;
    const matchesSearch =
      t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.projeto.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPrioridade && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {loading && <p role="status">Carregando tarefas…</p>}
      {(error || actionError) && <p role="alert" className="text-rose-400">{String(error || actionError)}</p>}
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
              Operação & SLA • Tarefas de Projetos
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-cyan-400" />
            Gestão de Tarefas
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Controle de demandas operacionais, entregas de sprint e bloqueios de cliente.
          </p>
        </div>

        <button disabled={loading || busy} onClick={() => setCreating(true)} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/25">
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      {creating && <form onSubmit={createTask} className="space-y-3 rounded-xl bg-slate-900 border border-slate-800 p-4 text-sm text-slate-200">
        <h2 className="font-semibold">Nova tarefa de projeto</h2>
        <select required aria-label="Projeto da tarefa" value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2"><option value="">Selecione um projeto</option>{projects.map(p => <option key={p.id} value={p.id}>{p.nomeEmpresa} — {p.projectType}</option>)}</select>
        <input required aria-label="Título da tarefa" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da tarefa" className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2" />
        <label className="block">Prazo (opcional)<input type="date" aria-label="Prazo da tarefa" value={dueDate} onChange={e => setDueDate(e.target.value)} className="block rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2" /></label>
        <button disabled={busy} className="rounded-lg bg-cyan-600 px-4 py-2 focus-visible:ring-2 focus-visible:ring-offset-2">Salvar tarefa</button>
        <button type="button" disabled={busy} onClick={() => setCreating(false)} className="px-4 py-2 focus-visible:ring-2 focus-visible:ring-offset-2">Cancelar</button>
      </form>}
      {/* View Selector & Search Filter Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('TODAS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                viewMode === 'TODAS'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Todas as Tarefas ({tarefas.length})
            </button>
            <button
              onClick={() => setViewMode('ATRASADAS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                viewMode === 'ATRASADAS'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-slate-950 text-rose-400 border border-rose-900/40 hover:bg-rose-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Atrasadas & Bloqueadas
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por tarefa, cliente ou projeto..."
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
              <option value="A_FAZER">A Fazer</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="EM_REVISAO">Em Revisão</option>
              <option value="AGUARDANDO_CLIENTE">Aguardando Cliente</option>
              <option value="BLOQUEADA">Bloqueada</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>
          </div>
        </div>

        {/* Task Cards List */}
        {filteredTarefas.length === 0 ? (
          <div className="p-12 text-center bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Nenhuma tarefa operacional pendente</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Todas as tarefas de projetos, aprovações de clientes e esteiras estão em dia.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTarefas.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                t.status === 'CONCLUIDA'
                  ? 'bg-slate-950/40 border-slate-900 opacity-60'
                  : t.diasAtraso
                  ? 'bg-rose-950/20 border-rose-900/50'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  aria-label={`Alternar conclusão de ${t.titulo}`}
                  onClick={() => toggleTaskConcluida(t.projectId, t.id)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    t.status === 'CONCLUIDA'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-700 hover:border-cyan-500 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-extrabold ${
                        t.status === 'CONCLUIDA' ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {t.titulo}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono border ${
                        t.prioridade === 'ALTA'
                          ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                          : t.prioridade === 'MEDIA'
                          ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {t.prioridade}
                    </span>

                    {t.aguardandoCliente && (
                      <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 text-[10px] font-mono">
                        Aguardando Cliente
                      </span>
                    )}

                    {t.diasAtraso && (
                      <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-mono animate-pulse">
                        {t.diasAtraso}d em atraso
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="text-cyan-400 font-semibold">{t.cliente}</span> • {t.projeto}
                  </p>
                </div>
              </div>

              {/* Meta & Status pill */}
              <div className="flex items-center justify-between md:justify-end gap-4 text-xs pt-2 md:pt-0 border-t md:border-t-0 border-slate-900">
                <div className="text-right">
                  <p className="text-slate-400 text-[11px] flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" /> {t.responsavel}
                  </p>
                  <p className="text-slate-500 text-[10px] flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3" /> Prazo: {t.prazo}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono font-bold">
                  {t.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
