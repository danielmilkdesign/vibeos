'use client';

import React, { useState } from 'react';
import { Layers, AlertTriangle, CheckCircle2, Clock, Plus, UserCheck, Shield, ChevronRight } from 'lucide-react';
import { getStoredData, setStoredData, INITIAL_PROJECTS_FULL } from '../../lib/crm-store';
import { Project, ProjectStatus, RiskLevel } from '../../types/crm';

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>(() => getStoredData('vibe_projects', INITIAL_PROJECTS_FULL));
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectType, setProjectType] = useState<'Presença Própria' | 'Esteira de Crescimento' | 'Sistema sob Medida' | 'Solução Clínica'>('Presença Própria');
  const [totalVal, setTotalVal] = useState(2400);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const created: Project = {
      id: `proj-${Date.now()}`,
      nomeEmpresa: name,
      clientName: clientName || 'Cliente VIBE',
      nicho: 'ESTETICA',
      projectType,
      status: 'ONBOARDING',
      riskLevel: 'NORMAL',
      progress: 10,
      valorTotal: Number(totalVal),
      valorSinal: Number(totalVal) * 0.5,
      prazoDias: 7,
      dataInicio: new Date().toISOString(),
      dataPrevisao: new Date(Date.now() + 7 * 86400000).toISOString(),
      checklistNormas: true,
      ownerName: 'Fernanda Rocha (PM)',
      tasks: [
        { id: `tsk-1-${Date.now()}`, projectId: `proj-${Date.now()}`, title: 'Kickoff & Envio de Briefing de Onboarding', assignedTo: 'Victor Belém', dueDate: 'Em 1 dia', completed: true },
        { id: `tsk-2-${Date.now()}`, projectId: `proj-${Date.now()}`, title: 'Aguardando Envio de Fotos & Logotipo (Cliente)', assignedTo: clientName || 'Cliente', dueDate: 'Em 2 dias', completed: false },
        { id: `tsk-3-${Date.now()}`, projectId: `proj-${Date.now()}`, title: 'Desenvolvimento Frontend & Copywriting', assignedTo: 'Daniel Milk', dueDate: 'Em 5 dias', completed: false }
      ]
    };

    const updated = [created, ...projects];
    setProjects(updated);
    setStoredData('vibe_projects', updated);
    setIsNewProjectModalOpen(false);
    setName('');
    setClientName('');
  };

  const handleTaskToggle = (projId: string, taskId: string) => {
    const updated = projects.map(p => {
      if (p.id === projId) {
        const updatedTasks = (p.tasks || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const newProgress = Math.round((completedCount / updatedTasks.length) * 100);
        return {
          ...p,
          tasks: updatedTasks,
          progress: newProgress,
          status: newProgress === 100 ? ('CONCLUIDO' as ProjectStatus) : p.status
        };
      }
      return p;
    });

    setProjects(updated);
    setStoredData('vibe_projects', updated);
    if (selectedProject && selectedProject.id === projId) {
      const p = updated.find(x => x.id === projId);
      if (p) setSelectedProject(p);
    }
  };

  const handleUpdateStatus = (projId: string, status: ProjectStatus) => {
    const updated = projects.map(p => p.id === projId ? { ...p, status } : p);
    setProjects(updated);
    setStoredData('vibe_projects', updated);
    if (selectedProject && selectedProject.id === projId) {
      setSelectedProject({ ...selectedProject, status });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 text-[11px] font-mono">
              Garantia SLA VIBE: Entrega em 7 Dias Corridos
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Esteira de Produção & Gestão de Projetos
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Acompanhamento de onboarding, entregas, bloqueios do cliente e classificação de riscos.
          </p>
        </div>

        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/25"
        >
          <Plus className="w-4 h-4" /> Iniciar Novo Projeto
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-indigo-800/60 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  {proj.projectType}
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                    proj.riskLevel === 'CRITICO'
                      ? 'bg-rose-950 text-rose-400 border-rose-800'
                      : proj.riskLevel === 'ATENCAO'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}
                >
                  Risco {proj.riskLevel}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-100">{proj.nomeEmpresa}</h3>
                <p className="text-xs text-slate-400">Decisor: {proj.clientName} • Resp: {proj.ownerName}</p>
              </div>

              {/* Progress & SLA */}
              <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Status: <strong className="text-cyan-400">{proj.status}</strong></span>
                  <span>SLA 7d: <strong className="text-emerald-400">{proj.progress}% Concluído</strong></span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* Tasks Checklist Preview */}
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Checklist de Produção:</p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(proj.tasks || []).map((t) => (
                    <label
                      key={t.id}
                      className="flex items-start gap-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 cursor-pointer text-xs group hover:bg-slate-800/60"
                    >
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => handleTaskToggle(proj.id, t.id)}
                        className="mt-0.5 accent-cyan-500 rounded"
                      />
                      <span className={`flex-1 ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {t.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{t.assignedTo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-mono font-bold">R$ {proj.valorTotal.toLocaleString('pt-BR')}</span>
              <button
                onClick={() => setSelectedProject(proj)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Gerenciar Projeto
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Iniciar Novo Projeto (SLA 7 Dias)</h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Empresa / Projeto</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: OdontoClin Adrianópolis"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Decisor</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Dra. Renata Mello"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Template de Oferta</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Presença Própria">Presença Própria (SLA 7d)</option>
                  <option value="Esteira de Crescimento">Esteira de Crescimento</option>
                  <option value="Solução Clínica">Solução para Clínicas</option>
                  <option value="Sistema sob Medida">Sistema Sob Medida</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Contratado (R$)</label>
                <input
                  type="number"
                  value={totalVal}
                  onChange={(e) => setTotalVal(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25"
                >
                  Iniciar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Project Management Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400">{selectedProject.projectType}</span>
                <h3 className="text-lg font-bold text-slate-100">{selectedProject.nomeEmpresa}</h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-400 text-xs font-mono border border-indigo-800/40">
                {selectedProject.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alterar Etapa do Projeto:</label>
                <select
                  value={selectedProject.status}
                  onChange={(e) => handleUpdateStatus(selectedProject.id, e.target.value as ProjectStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="ONBOARDING">ONBOARDING (Coleta de Briefing)</option>
                  <option value="EM_PLANEJAMENTO">EM PLANEJAMENTO (Arquitetura)</option>
                  <option value="EM_PRODUCAO">EM PRODUÇÃO (Design & Code)</option>
                  <option value="AGUARDANDO_CLIENTE">AGUARDANDO CLIENTE (Bloqueio)</option>
                  <option value="REVISAO_INTERNA">REVISÃO INTERNA (QA)</option>
                  <option value="EM_APROVACAO">EM APROVAÇÃO (Cliente)</option>
                  <option value="PUBLICACAO">PUBLICAÇÃO (Deploy Vercel)</option>
                  <option value="CONCLUIDO">CONCLUÍDO (Entregue)</option>
                </select>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <p className="flex justify-between text-slate-300"><span>Valor Total:</span> <strong>R$ {selectedProject.valorTotal.toLocaleString('pt-BR')}</strong></p>
                <p className="flex justify-between text-emerald-400"><span>Sinal 50% Pago:</span> <strong>R$ {selectedProject.valorSinal.toLocaleString('pt-BR')}</strong></p>
                <p className="flex justify-between text-slate-400"><span>Data de Início:</span> <span>{selectedProject.dataInicio.split('T')[0]}</span></p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-300">Tarefas de Produção:</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {(selectedProject.tasks || []).map((t) => (
                    <label key={t.id} className="flex items-center gap-2 p-2 bg-slate-950 rounded border border-slate-800 text-xs">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => handleTaskToggle(selectedProject.id, t.id)}
                        className="accent-cyan-500"
                      />
                      <span className={t.completed ? 'line-through text-slate-500' : 'text-slate-200'}>{t.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium"
              >
                Concluir Edição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
