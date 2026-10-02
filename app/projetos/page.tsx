'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Download,
  Filter,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  AlertOctagon,
  CheckSquare,
  ExternalLink,
  X
} from 'lucide-react';
import { getStoredData, setStoredData, INITIAL_PROJECTS_FULL } from '../../lib/crm-store';
import { Project, ProjectStatus } from '../../types/crm';
import { useAuth } from '../../lib/auth-context';

export default function ProjetosPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(() =>
    getStoredData('vibe_projects', INITIAL_PROJECTS_FULL)
  );
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'RISK_ONLY'>('ALL');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // New Project Form
  const [newCompany, setNewCompany] = useState('');
  const [newDecisor, setNewDecisor] = useState('');
  const [newType, setNewType] = useState('Presença Própria');
  const [newTotalVal, setNewTotalVal] = useState(2400);

  const activeProjectsCount = projects.filter((p) => p.status !== 'CONCLUIDO').length;
  const criticalCount = projects.filter((p) => p.riskLevel === 'CRITICO' || p.riskLevel === 'ATENCAO').length;

  const filteredProjects = projects.filter((p) => {
    if (riskFilter === 'RISK_ONLY') {
      return p.riskLevel === 'CRITICO' || p.riskLevel === 'ATENCAO';
    }
    return true;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany) return;

    const created: Project = {
      id: `proj_${Date.now()}`,
      nomeEmpresa: newCompany,
      clientName: newDecisor || 'Cliente VIBE',
      nicho: 'ESTETICA',
      projectType: newType as any,
      status: 'ONBOARDING',
      riskLevel: 'NORMAL',
      progress: 15,
      valorTotal: Number(newTotalVal),
      valorSinal: Number(newTotalVal) * 0.5,
      prazoDias: 7,
      dataInicio: new Date().toISOString(),
      dataPrevisao: new Date(Date.now() + 7 * 86400000).toISOString(),
      checklistNormas: true,
      ownerName: user?.name || 'Daniel Leite',
      tasks: [
        { id: `tsk-1-${Date.now()}`, projectId: `proj_${Date.now()}`, title: 'Kickoff & Coleta de Briefing', assignedTo: 'Victor Belichar', dueDate: '1 dia', completed: true },
        { id: `tsk-2-${Date.now()}`, projectId: `proj_${Date.now()}`, title: 'Estruturação Wireframe & Copywriting', assignedTo: 'Daniel Leite', dueDate: '2 dias', completed: false },
        { id: `tsk-3-${Date.now()}`, projectId: `proj_${Date.now()}`, title: 'Desenvolvimento Frontend & SEO Local', assignedTo: 'Daniel Leite', dueDate: '4 dias', completed: false }
      ]
    };

    const updated = [created, ...projects];
    setProjects(updated);
    setStoredData('vibe_projects', updated);
    setIsNewProjectModalOpen(false);
    setNewCompany('');
    setNewDecisor('');
  };

  const handleTaskToggle = (projId: string, taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = projects.map((p) => {
      if (p.id === projId) {
        const tasks = (p.tasks || []).map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
        const completed = tasks.filter((t) => t.completed).length;
        const progress = Math.round((completed / tasks.length) * 100);
        return {
          ...p,
          tasks,
          progress,
          status: progress === 100 ? ('CONCLUIDO' as ProjectStatus) : p.status
        };
      }
      return p;
    });

    setProjects(updated);
    setStoredData('vibe_projects', updated);
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen p-4 lg:p-8 space-y-6">
      {/* Sub-Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-semibold">
              Operação // Sprint Q4
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-text-disabled" />
            <span className="font-mono text-[11px] text-text-disabled">Live Sync</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Projetos &amp; SLA
          </h1>
          <p className="text-xs text-text-secondary">
            Acompanhamento operacional de produção, etapas de design, desenvolvimento e conformidade com o SLA contratual de 7 dias.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRiskFilter(riskFilter === 'ALL' ? 'RISK_ONLY' : 'ALL')}
            className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              riskFilter === 'RISK_ONLY'
                ? 'bg-warning/20 text-warning border-warning/40'
                : 'bg-surface-container-high border-border-subtle text-text-primary hover:bg-surface-elevated'
            }`}
            type="button"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            <span>Filtrar por Risco</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-warning/20 text-warning font-mono text-[10px]">
              {criticalCount}
            </span>
          </button>

          <Link
            href="/tarefas"
            className="h-9 px-3 bg-surface-container-high hover:bg-surface-elevated border border-border-subtle text-text-primary text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-text-secondary" />
            <span>Tarefas</span>
          </Link>

          <button
            onClick={() => alert('Exportando relatório operacional em PDF...')}
            className="h-9 px-3 bg-surface-container-high hover:bg-surface-elevated border border-border-subtle text-text-primary text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            type="button"
          >
            <Download className="w-3.5 h-3.5 text-text-secondary" />
            <span>Exportar Relatório</span>
          </button>

          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="h-9 px-3.5 bg-primary-container hover:bg-primary-hover text-surface-container-lowest text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-cyan-500/10 cursor-pointer"
            type="button"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Top Metrics KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Projetos Ativos</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-border-subtle flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-text-primary">
              {String(activeProjectsCount).padStart(2, '0')}
            </span>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-semibold">
              Capacidade 75%
            </span>
          </div>
          <div className="mt-2 text-text-disabled font-mono text-[11px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Manaus Studio Hub Operacional
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">SLA Médio de Entrega</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-border-subtle flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-success" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-text-primary">
                {projects.length > 0 ? '6.2' : '--'}
              </span>
              <span className="text-xs text-text-secondary">dias</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-success/15 text-success font-mono text-[10px] font-semibold">
              {projects.length > 0 ? '-0.8d vs Meta' : 'Sem dados'}
            </span>
          </div>
          <div className="mt-2 text-text-disabled font-mono text-[11px]">
            Meta contratual: <strong className="text-text-primary">7.0 dias corridos</strong>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Em Risco / Bloqueados</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-border-subtle flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-warning">
              {String(criticalCount).padStart(2, '0')}
            </span>
            <span className="px-2 py-0.5 rounded bg-warning/20 text-warning font-mono text-[10px] font-semibold">
              {criticalCount > 0 ? 'Aguardando Cliente' : 'Tudo Operacional'}
            </span>
          </div>
          <div className="mt-2 text-text-disabled font-mono text-[11px]">
            {criticalCount > 0 ? (
              <span>Projetos com atenção requerida</span>
            ) : (
              <span className="text-success font-medium">Nenhum gargalo ativo</span>
            )}
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Entregas no Prazo</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-border-subtle flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-text-primary">
              {projects.length > 0 ? `${Math.round(((projects.length - criticalCount) / projects.length) * 100)}%` : '100%'}
            </span>
            <span className="px-2 py-0.5 rounded bg-success/15 text-success font-mono text-[10px] font-semibold">
              Meta 95%
            </span>
          </div>
          <div className="mt-2 text-text-disabled font-mono text-[11px]">
            Histórico: <strong className="text-text-primary">{projects.filter(p => p.status === 'CONCLUIDO').length}/{projects.length} entregues</strong>
          </div>
        </div>
      </div>

      {/* Operational Project Execution Stack */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-text-primary">
              Fila de Execução em Tempo Real
            </h2>
          </div>
          <span className="font-mono text-xs text-text-secondary">
            Filtro atual: Todos os Projetos ({filteredProjects.length})
          </span>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="p-12 rounded-xl bg-surface-container-low border border-dashed border-border-subtle text-center flex flex-col items-center justify-center gap-3">
            <Layers className="w-10 h-10 text-text-disabled" />
            <div className="space-y-1">
              <h3 className="text-text-primary font-bold text-base">Nenhum projeto em execução</h3>
              <p className="text-text-secondary text-xs max-w-sm">
                Inicie novos projetos fechados no pipeline ou crie ordens operacionais diretamente.
              </p>
            </div>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="mt-2 px-4 py-2 bg-primary hover:bg-primary-hover text-surface-container-lowest font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              <PlusCircle className="w-4 h-4" /> Criar Primeiro Projeto
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
          {filteredProjects.map((proj) => {
            const isCritical = proj.riskLevel === 'CRITICO' || proj.riskLevel === 'ATENCAO';
            const initials = proj.nomeEmpresa
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2);

            return (
              <div
                key={proj.id}
                className={`p-5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border shadow-sm flex flex-col gap-3 ${
                  isCritical ? 'border-l-4 border-l-warning border-border-subtle' : 'border-l-4 border-l-success border-border-subtle'
                }`}
              >
                {/* Project Header Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-surface-container-high border border-border-subtle flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        isCritical ? 'text-warning' : 'text-primary'
                      }`}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projetos/${proj.id}`}
                          className="text-sm font-bold text-text-primary hover:text-primary transition-colors"
                        >
                          {proj.nomeEmpresa}
                        </Link>
                        {isCritical ? (
                          <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning font-mono text-[10px] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-ping" />
                            Em Risco
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-success/15 text-success font-mono text-[10px] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                            No Prazo
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-text-secondary font-mono text-[10px]">
                          {proj.projectType}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {proj.projectType} (Setup + SEO Local + SLA 7 Dias)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end lg:self-auto">
                    {/* Quick WhatsApp Action if in risk */}
                    {isCritical && (
                      <a
                        href={`https://wa.me/5592992027059?text=Ol%C3%A1%20${encodeURIComponent(proj.clientName)},%20precisamos%20dos%20ativos%20para%20concluir%20a%20entrega%20no%20prazo!`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 px-3 bg-warning/15 hover:bg-warning/25 text-warning text-xs rounded-lg flex items-center gap-1.5 transition-colors font-semibold"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Cobrar via WhatsApp</span>
                      </a>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-elevated text-primary font-mono text-[10px] font-bold flex items-center justify-center border border-border-subtle">
                        DL
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="font-mono text-[10px] text-text-disabled">Responsável</span>
                        <span className="text-xs text-text-primary font-medium">{proj.ownerName}</span>
                      </div>
                    </div>

                    <Link
                      href={`/projetos/${proj.id}`}
                      className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                      title="Abrir Detalhes do Projeto"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Blocking alert pill if critical */}
                {isCritical && (
                  <div className="px-3.5 py-2 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-between text-warning text-xs">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Bloqueio registrado:</strong> Cliente não enviou fotos em alta resolução da clínica ou acessos de domínio.
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider font-bold">
                      Parado há 1d 14h
                    </span>
                  </div>
                )}

                {/* SLA & Progress Visual Section */}
                <div className="p-3.5 rounded-lg bg-surface-container-lowest/80 border border-border-subtle/50 flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary">
                        SLA Contratado: <strong className="text-text-primary">{proj.prazoDias} dias</strong>
                      </span>
                      <span className="text-border-subtle">|</span>
                      <span className={isCritical ? 'text-warning font-bold' : 'text-text-secondary'}>
                        Dia Atual: <strong>4 de {proj.prazoDias}</strong>
                      </span>
                      <span className="text-border-subtle">|</span>
                      <span className={`font-semibold flex items-center gap-1 ${isCritical ? 'text-warning' : 'text-success'}`}>
                        {isCritical ? (
                          <>Atenção ao Prazo</>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> SLA Protegido
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-text-secondary">
                        Fase: <strong className="text-text-primary">{proj.status}</strong>
                      </span>
                      <span className={`font-bold ${isCritical ? 'text-warning' : 'text-text-primary'}`}>
                        {proj.progress}% Concluído
                      </span>
                    </div>
                  </div>

                  {/* Multi-segment Progress Bar */}
                  <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isCritical ? 'bg-warning' : 'bg-primary'
                      }`}
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>

                  {/* Checklist summary & interactive toggles */}
                  <div className="flex flex-wrap items-center justify-between font-mono text-[11px] text-text-disabled pt-1">
                    <span className="flex items-center gap-1 text-primary">
                      Checklist: {(proj.tasks || []).filter((t) => t.completed).length}/{(proj.tasks || []).length} tarefas concluídas
                    </span>
                    <span>Prazo Limite: {proj.dataPrevisao.split('T')[0]}</span>
                  </div>

                  {/* Inline quick task checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border-subtle/40">
                    {(proj.tasks || []).map((task) => (
                      <label
                        key={task.id}
                        onClick={(e) => handleTaskToggle(proj.id, task.id, e)}
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-xs transition-colors ${
                          task.completed
                            ? 'bg-surface-elevated/40 border-border-subtle text-text-disabled line-through'
                            : 'bg-surface-elevated border-border-subtle text-text-primary hover:border-primary/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          readOnly
                          className="accent-primary"
                        />
                        <span className="truncate">{task.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border-subtle w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-base font-bold text-text-primary">Iniciar Novo Projeto (SLA 7 Dias)</h3>
              <button onClick={() => setIsNewProjectModalOpen(false)} className="text-text-disabled hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-secondary font-semibold mb-1">Empresa / Cliente</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Ex: Clínica Dra. Juliana Estética"
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Nome do Decisor</label>
                <input
                  type="text"
                  value={newDecisor}
                  onChange={(e) => setNewDecisor(e.target.value)}
                  placeholder="Dra. Juliana Vieira"
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Tipo de Projeto</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Presença Própria">Presença Própria (SLA 7d)</option>
                  <option value="Esteira de Crescimento">Esteira de Crescimento (12 artes/mês)</option>
                  <option value="Sistema Sob Medida">Sistema Sob Medida</option>
                </select>
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Valor Contratado (R$)</label>
                <input
                  type="number"
                  value={newTotalVal}
                  onChange={(e) => setNewTotalVal(Number(e.target.value))}
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 bg-surface-container-high text-text-secondary hover:text-text-primary rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-container hover:bg-primary-hover text-surface-container-lowest font-bold rounded-lg shadow-sm"
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
