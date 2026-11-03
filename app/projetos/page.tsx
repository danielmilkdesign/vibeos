'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  CheckSquare,
  X
} from 'lucide-react';
import { useCrmCollection } from '../../lib/crm-client';
import { reconcileProject, toggleProjectTask } from '../../lib/operations-domain';
import { Project, Company, Contract } from '../../types/crm';
import { normalizePhone } from '../../lib/lead-normalization';
type LinkedProject = Project & { contractId?: string };
import { useAuth } from '../../lib/auth-context';

export default function ProjetosPage() {
  const { user } = useAuth();
  const [projects, saveAsync, { loading, error }] = useCrmCollection<LinkedProject[]>('vibe_projects', []);
  const [companies] = useCrmCollection<Company[]>('vibe_companies', []);
  const [contracts] = useCrmCollection<Contract[]>('vibe_contracts', []);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const persist = async (next: LinkedProject[]) => {
    setActionError(''); setBusy(true);
    try { await saveAsync(next); return true; }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Falha ao salvar.'); return false; }
    finally { setBusy(false); }
  };
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'RISK_ONLY'>('ALL');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // New Project Form
  const [newCompany, setNewCompany] = useState('');
  const [newDecisor, setNewDecisor] = useState('');
  const [newType, setNewType] = useState('Presença Própria');
  const [newTotalVal, setNewTotalVal] = useState(0);
  const [companyId, setCompanyId] = useState('');
  const [contractId, setContractId] = useState('');
  const [deadlineDays, setDeadlineDays] = useState(0);

  const activeProjectsCount = projects.filter((p) => p.status !== 'CONCLUIDO').length;
  const criticalCount = projects.filter((p) => p.riskLevel === 'CRITICO' || p.riskLevel === 'ATENCAO').length;

  const filteredProjects = projects.filter((p) => {
    if (riskFilter === 'RISK_ONLY') {
      return p.riskLevel === 'CRITICO' || p.riskLevel === 'ATENCAO';
    }
    return true;
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || busy || loading || !user) return;
    const projectId = crypto.randomUUID();
    const company = companies.find(c => c.id === companyId);
    if (companyId && !company) { setActionError('Empresa não encontrada.'); return; }
    if (contractId && !contracts.some(c => c.id === contractId && c.companyId === companyId)) { setActionError('Contrato deve pertencer à empresa selecionada.'); return; }
    if (!Number.isFinite(newTotalVal) || newTotalVal < 0 || !Number.isInteger(deadlineDays) || deadlineDays < 0) { setActionError('Informe valor e prazo válidos.'); return; }

    const created: LinkedProject = {
      id: projectId,
      companyId: companyId || undefined,
      contractId: contractId || undefined,
      nomeEmpresa: company?.name || newCompany,
      clientName: newDecisor,
      nicho: company?.nicho || 'OUTROS',
      projectType: newType as Project['projectType'],
      status: 'ONBOARDING',
      riskLevel: 'NORMAL',
      progress: 0,
      valorTotal: Number(newTotalVal),
      valorSinal: 0,
      prazoDias: deadlineDays,
      dataInicio: new Date().toISOString(),
      dataPrevisao: deadlineDays ? new Date(Date.now() + deadlineDays * 86400000).toISOString() : '',
      checklistNormas: false,
      ownerName: user.name,
      tasks: [
        { id: crypto.randomUUID(), projectId, title: 'Kickoff & Briefing', assignedTo: user.name, dueDate: '', completed: false, status: 'A_FAZER' }
      ]
    };

    const updated = [created, ...projects];
    if (!await persist(updated)) return;
    setIsNewProjectModalOpen(false);
    setNewCompany('');
    setNewDecisor('');
  };

  const handleTaskToggle = async (projId: string, taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy || loading) return;
    await persist(toggleProjectTask(projects, projId, taskId));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
      {loading && <p role="status">Carregando projetos…</p>}
      {(error || actionError) && <p role="alert" className="text-rose-400">{String(error || actionError)}</p>}
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white tracking-tight">
            Projetos & SLA
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Acompanhamento operacional de produção e cumprimento de prazos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRiskFilter(riskFilter === 'ALL' ? 'RISK_ONLY' : 'ALL')}
            className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              riskFilter === 'RISK_ONLY'
                ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.04]'
            }`}
            type="button"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Atenção ({criticalCount})</span>
          </button>

          <Link
            href="/tarefas"
            className="h-8 px-3 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Tarefas</span>
          </Link>

          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="h-8 px-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            type="button"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Matrix */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs text-slate-400 font-medium">Projetos Ativos</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight">
              {String(activeProjectsCount).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400">Em produção</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs text-slate-400 font-medium">SLA Médio de Entrega</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight">
              {projects.length > 0 ? '6.2' : '--'} dias
            </span>
            <span className="text-xs text-emerald-400 font-medium">Meta: 7 dias</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs text-slate-400 font-medium">Projetos em Atenção</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-semibold tracking-tight ${criticalCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {String(criticalCount).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400">
              {criticalCount > 0 ? 'Requer ação' : 'Sem atrasos'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs text-slate-400 font-medium">Entregas no Prazo</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight">
              {projects.length > 0 ? `${Math.round(((projects.length - criticalCount) / projects.length) * 100)}%` : '100%'}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Meta 95%</span>
          </div>
        </div>
      </section>

      {/* 3. Project Execution List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="py-16 text-center rounded-xl bg-white/[0.015] border border-white/[0.05] p-6 space-y-3">
            <Clock className="w-8 h-8 mx-auto text-slate-500" />
            <div>
              <h3 className="text-sm font-medium text-white">Nenhum projeto em execução</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Inicie novos projetos a partir de oportunidades ganhas ou cadastre diretamente.
              </p>
            </div>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar Primeiro Projeto</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((proj) => {
              const isCritical = proj.riskLevel === 'CRITICO' || proj.riskLevel === 'ATENCAO';
              const company = companies.find(c => c.id === proj.companyId);
              const phone = normalizePhone(company?.whatsapp || company?.decisorPhone || '');

              return (
                <div
                  key={proj.id}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3"
                >
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projetos/${proj.id}`}
                          className="text-sm font-medium text-white hover:text-cyan-400 transition-colors truncate"
                        >
                          {proj.nomeEmpresa}
                        </Link>
                        {isCritical ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-400/10 text-amber-300">
                            Atenção
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                            No Prazo
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {proj.projectType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Cliente: {proj.clientName} • Responsável: {proj.ownerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      {isCritical && phone && (
                        <a
                          href={`https://wa.me/${phone}?text=${encodeURIComponent(`Olá ${proj.clientName}, podemos conversar sobre os próximos passos do projeto?`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="h-7 px-2.5 rounded-md bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <Link
                        href={`/projetos/${proj.id}`}
                        className="p-1.5 rounded-md hover:bg-white/[0.04] text-slate-400 hover:text-white transition-colors"
                        title="Ver detalhes"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Progress bar and SLA info */}
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Prazo: {proj.prazoDias} dias (Previsão: {proj.dataPrevisao ? new Date(proj.dataPrevisao).toLocaleDateString('pt-BR') : 'A definir'})</span>
                      <span className="text-white font-medium">{proj.progress}%</span>
                    </div>

                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCritical ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Task checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    {(proj.tasks || []).map((task) => (
                      <label
                        key={task.id}
                        onClick={(e) => handleTaskToggle(proj.id, task.id, e)}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                          task.completed
                            ? 'bg-white/[0.01] border-white/[0.03] text-slate-500 line-through'
                            : 'bg-white/[0.02] border-white/[0.05] text-slate-300 hover:text-white hover:border-white/[0.1]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          readOnly
                          className="accent-cyan-400 w-3.5 h-3.5 rounded"
                        />
                        <span className="truncate">{task.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1422] border border-white/[0.08] w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-sm font-semibold text-white">Novo Projeto Operacional</h3>
              <button onClick={() => setIsNewProjectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              {actionError && <p role="alert" className="text-rose-400">{actionError}</p>}
              <select aria-label="Empresa vinculada ao projeto" value={companyId} onChange={e => { setCompanyId(e.target.value); setContractId(''); const c=companies.find(c => c.id === e.target.value); if (c) { setNewCompany(c.name); setNewDecisor(c.decisorName || ''); } }} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2"><option value="">Cadastro direto (sem vínculo)</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <select aria-label="Contrato vinculado ao projeto" value={contractId} onChange={e => setContractId(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2"><option value="">Sem contrato vinculado</option>{contracts.filter(c => c.companyId === companyId).map(c => <option key={c.id} value={c.id}>{c.contractNumber}</option>)}</select>
              <label className="block text-slate-300">Prazo acordado em dias (0 = não definido)<input aria-label="Prazo acordado" type="number" min="0" step="1" value={deadlineDays} onChange={e => setDeadlineDays(Number(e.target.value))} className="block w-full rounded-lg bg-slate-950 border border-slate-700 p-2 focus-visible:ring-2 focus-visible:ring-offset-2" /></label>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Empresa / Cliente</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Ex: Clínica Dra. Juliana Estética"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome do Decisor</label>
                <input
                  type="text"
                  value={newDecisor}
                  onChange={(e) => setNewDecisor(e.target.value)}
                  placeholder="Dra. Juliana Vieira"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tipo de Projeto</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Presença Própria">Presença Própria</option>
                  <option value="Esteira de Crescimento">Esteira de Crescimento</option>
                  <option value="Sistema sob Medida">Sistema sob Medida</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Valor Contratado (R$)</label>
                <input
                  type="number"
                  value={newTotalVal}
                  onChange={(e) => setNewTotalVal(Number(e.target.value))}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
                >
                  Iniciar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
