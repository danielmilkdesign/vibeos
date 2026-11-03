import type { Project, ProjectTask, Company, Contract, ComplianceCheck, Deliverable, Meeting } from '../types/crm';

export function companyRelations<T extends { companyId?: string }>(items: T[], companyId: string): T[] {
  return items.filter(item => item.companyId === companyId);
}

export function deriveClients(companies: Company[], contracts: Contract[], projects: Project[]) {
  return companies.flatMap(company => {
    const linked = companyRelations(contracts, company.id).filter(c => c.status !== 'RASCUNHO' && c.status !== 'EM_ASSINATURA');
    if (!linked.length && !company.isClient) return [];
    const active = linked.filter(c => c.status === 'ATIVO' || c.status === 'RENOVACAO_PROXIMA');
    const status = active.length ? 'ATIVO' : linked.some(c => c.status === 'PAUSADO') ? 'PAUSADO' : linked.length ? 'ENCERRADO' : 'PROSPECT';
    return [{ id: company.id, nome: company.name, nicho: company.nicho || '', status,
      servicos: Array.from(new Set(active.map(c => c.offerName))),
      mrr: active.reduce((sum, c) => sum + (Number(c.recurringValue) || 0) / (c.billingPeriod === 'ANUAL' ? 12 : c.billingPeriod === 'TRIMESTRAL' ? 3 : 1), 0),
      projetoAtual: companyRelations(projects, company.id).map(p => p.projectType).join(', ') || 'Sem projeto vinculado',
      renovacaoEm: active.map(c => c.renewalDate).filter(Boolean).sort()[0] || '',
      saude: company.health || 'DESCONHECIDA', ultimoContato: 'Não registrado', decisor: company.decisorName || '',
      whatsapp: company.whatsapp || company.decisorPhone || '' }];
  });
}

/** Task flags and status always move together; incomplete work reopens a closed project. */
export function reconcileProject<T extends Pick<Project, 'status' | 'tasks'>>(project: T) {
  const tasks = (project.tasks || []).map(t => ({ ...t, status: t.completed ? 'CONCLUIDA' as const : t.status === 'CONCLUIDA' ? 'A_FAZER' as const : t.status || 'A_FAZER' as const }));
  const progress = tasks.length ? Math.round(tasks.filter(t => t.completed).length / tasks.length * 100) : 0;
  const status = progress === 100 ? 'CONCLUIDO' as const : project.status === 'CONCLUIDO' ? 'EM_PRODUCAO' as const : project.status;
  return { ...project, tasks, progress, status };
}

export function toggleProjectTask(projects: Project[], projectId: string, taskId: string): Project[] {
  return projects.map(p => p.id !== projectId ? p : reconcileProject({ ...p, tasks: (p.tasks || []).map(t => t.id !== taskId ? t : { ...t, completed: !t.completed, status: t.completed ? 'A_FAZER' : 'CONCLUIDA' }) }));
}
