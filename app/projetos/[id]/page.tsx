'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  User,
  Plus,
  FileText,
  MessageSquare,
  ShieldCheck,
  PackageCheck,
  CheckSquare,
  ChevronRight
} from 'lucide-react';
import { useCrmCollection } from '../../../lib/crm-client';
import { reconcileProject, toggleProjectTask } from '../../../lib/operations-domain';
import { useAuth } from '../../../lib/auth-context';
import { Project, ProjectStatus, RiskLevel, ProjectTask, Deliverable } from '../../../types/crm';

export default function ProjetoDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const [projects, saveAsync, { loading, error }] = useCrmCollection<Project[]>('vibe_projects', []);
  const [deliverables] = useCrmCollection<(Deliverable & {projectId?: string})[]>('vibe_deliverables', []);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const persist = async (next: Project[]) => {
    setActionError(''); setBusy(true);
    try { await saveAsync(next); return true; }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Falha ao salvar.'); return false; }
    finally { setBusy(false); }
  };

  const foundProject = projects.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<'TAREFAS' | 'SLA' | 'CONFORMIDADE'>('TAREFAS');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  if (error) return <p role="alert" className="p-6 text-rose-400">{String(error)}</p>;
  if (loading) return <p role="status" className="p-6 text-slate-300">Carregando projeto…</p>;
  if (!foundProject) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0D1422] border border-[#1E293B] flex items-center justify-center text-[#64748B]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Projeto não encontrado</h2>
        <p className="text-sm text-[#94A3B8]">O projeto solicitado não foi localizado no sistema ou ainda não foi iniciado.</p>
        <Link
          href="/projetos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#06B6D4] text-slate-950 font-bold text-xs hover:bg-[#0891B2] transition-all"
        >
          ← Voltar para Lista de Projetos
        </Link>
      </div>
    );
  }

  const handleToggleTask = async (taskId: string) => {
    if (busy) return;
    await persist(toggleProjectTask(projects, foundProject.id, taskId));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || busy || !user) return;

    const newTask: ProjectTask = {
      id: crypto.randomUUID(),
      projectId: foundProject.id,
      title: newTaskTitle,
      assignedTo: newTaskAssignee.trim() || user.name,
      dueDate: '',
      completed: false,
      status: 'A_FAZER'
    };

    const updated = projects.map(p => {
      if (p.id === foundProject.id) {
        const tasks = [...(p.tasks || []), newTask];
        return reconcileProject({ ...p, tasks });
      }
      return p;
    });

    if (!await persist(updated)) return;
    setNewTaskTitle('');
  };

  const handleUpdateStatus = async (newStatus: ProjectStatus) => {
    if (newStatus === 'CONCLUIDO' && (!(foundProject.tasks || []).length || !(foundProject.tasks || []).every(t => t.completed))) {
      setActionError('Conclua todas as tarefas antes de concluir o projeto.'); return;
    }
    const updated = projects.map(p =>
      p.id === foundProject.id ? reconcileProject({ ...p, status: newStatus }) : p
    );
    await persist(updated);
  };

  const handleUpdateRisk = async (newRisk: RiskLevel) => {
    const updated = projects.map(p =>
      p.id === foundProject.id ? { ...p, riskLevel: newRisk } : p
    );
    await persist(updated);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {actionError && <p role="alert" className="text-rose-400">{actionError}</p>}
      {/* Back Link & Header */}
      <div>
        <Link
          href="/projetos"
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 mb-4 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Esteira de Projetos
        </Link>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-100">{foundProject.nomeEmpresa}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 text-[11px] font-mono font-bold">
                  {foundProject.projectType}
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                  foundProject.riskLevel === 'CRITICO'
                    ? 'bg-rose-950 text-rose-400 border-rose-800'
                    : foundProject.riskLevel === 'ATENCAO'
                    ? 'bg-amber-950 text-amber-400 border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                }`}>
                  Risco {foundProject.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Decisor: <strong className="text-slate-200">{foundProject.clientName}</strong> • Responsável Técnico: <strong className="text-cyan-400">{foundProject.ownerName}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={foundProject.status}
                onChange={(e) => handleUpdateStatus(e.target.value as ProjectStatus)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono focus:outline-none"
              >
                <option value="ONBOARDING">ONBOARDING</option>
                <option value="EM_PLANEJAMENTO">EM PLANEJAMENTO</option>
                <option value="EM_PRODUCAO">EM PRODUÇÃO</option>
                <option value="AGUARDANDO_CLIENTE">AGUARDANDO CLIENTE</option>
                <option value="REVISAO_INTERNA">REVISÃO INTERNA</option>
                <option value="EM_APROVACAO">EM APROVAÇÃO</option>
                <option value="PUBLICACAO">PUBLICAÇÃO</option>
                <option value="CONCLUIDO">CONCLUÍDO</option>
                <option value="PAUSADO">PAUSADO</option>
              </select>

              <select
                value={foundProject.riskLevel}
                onChange={(e) => handleUpdateRisk(e.target.value as RiskLevel)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none"
              >
                <option value="NORMAL">Risco NORMAL</option>
                <option value="ATENCAO">Risco ATENÇÃO</option>
                <option value="CRITICO">Risco CRÍTICO</option>
              </select>
            </div>
          </div>

          {/* SLA & Progress Bar */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Prazo registrado: <strong>{foundProject.prazoDias ? `${foundProject.prazoDias} dias corridos` : 'Não definido'}</strong></span>
              <span className="text-emerald-400 font-bold">{foundProject.progress}% Concluído</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${foundProject.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('TAREFAS')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'TAREFAS'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> Tarefas & Checklist ({foundProject.tasks?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('SLA')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'SLA'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Prazos & Entregáveis
        </button>
        <button
          onClick={() => setActiveTab('CONFORMIDADE')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'CONFORMIDADE'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Normas & Aprovações
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'TAREFAS' && (
        <div className="space-y-6">
          {/* Add Task Input */}
          <form onSubmit={handleAddTask} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Adicionar nova tarefa operacional ou bloqueio do cliente..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="">{user?.name || 'Sem responsável'} (sessão atual)</option>
              <option value="Cliente">Cliente (Aguardando)</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/25"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </form>

          {/* Task List */}
          <div className="space-y-2">
            {(foundProject.tasks || []).map((t) => (
              <label
                key={t.id}
                className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-850 hover:border-indigo-800/60 transition-all text-xs group"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => handleToggleTask(t.id)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                  <span className={`${t.completed ? 'line-through text-slate-500' : 'text-slate-100 font-medium'}`}>
                    {t.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {t.assignedTo}
                  </span>
                  <span>{t.dueDate}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'SLA' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Cronograma & Fases do Projeto
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Início:</span>
                <span className="text-slate-200 font-mono">{foundProject.dataInicio ? new Date(foundProject.dataInicio).toLocaleDateString('pt-BR') : 'Não informado'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Previsão de entrega registrada:</span>
                <span className="text-cyan-400 font-mono font-bold">{foundProject.dataPrevisao ? new Date(foundProject.dataPrevisao).toLocaleDateString('pt-BR') : 'Não informada'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Valor Total:</span>
                <span className="text-emerald-400 font-mono font-bold">R$ {foundProject.valorTotal.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Sinal Recebido:</span>
                <span className="text-slate-200 font-mono">R$ {foundProject.valorSinal.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-400" /> Entregáveis Contratados
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {deliverables.filter(d => d.projectId === id).map(d => <li key={d.id}>{d.title} — {d.status}</li>)}
              {!deliverables.some(d => d.projectId === id) && <li>Nenhuma entrega vinculada. Cadastre em Entregas com o ID deste projeto.</li>}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'CONFORMIDADE' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Checklist de Normas do Conselho ({foundProject.nicho})
          </h3>
          <p className="text-xs text-slate-400">
            Aprovações dependem de revisão humana e evidências registradas em Conformidade. Este painel não substitui análise jurídica ou do conselho correspondente.
          </p>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> Consulte a auditoria registrada em Conformidade; este projeto não comprova aprovação regulatória.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
