import {
  Opportunity,
  Proposal,
  Project,
  Contract,
  Meeting,
  ComplianceCheck
} from '../types/crm';

// Clean initial data ready for real production inputs
export const INITIAL_OPPORTUNITIES: Opportunity[] = [];

export const INITIAL_PROPOSALS: Proposal[] = [];

export const INITIAL_PROJECTS_FULL: Project[] = [];

export const INITIAL_CONTRACTS: Contract[] = [];

export const INITIAL_MEETINGS: Meeting[] = [];

export const INITIAL_COMPLIANCE: ComplianceCheck[] = [];

export const CRM_KEYS = ['vibe_leads', 'vibe_companies', 'vibe_opps', 'vibe_proposal_versions', 'vibe_offers', 'vibe_deliverables', 'vibe_compliance', 'vibe_meetings', 'vibe_notifications', 'vibe_projects', 'vibe_contracts', 'vibe_proposals', 'vibe_clientes', 'vibe_tarefas_ui', 'vibe_entregas_ui', 'vibe_tasks', 'vibe_entregas'] as const;
export type CrmKey = typeof CRM_KEYS[number];
export type CrmSnapshot = Record<string, { data: unknown; version: number }>;
let cache: CrmSnapshot = {};
let generation = 0;
const listeners = new Set<() => void>();
export function subscribeCrm(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function notify() { listeners.forEach(listener => listener()); }
export function replaceCrmCache(snapshot: CrmSnapshot) { generation++; cache = structuredClone(snapshot); notify(); }
export function getCrmSnapshot() { return cache; }
export function getStoredData<T>(key: string, defaultVal: T): T { return (cache[key]?.data as T | undefined) ?? defaultVal; }
export async function refreshCrmCache(): Promise<void> {
  const current = generation;
  const response = await fetch('/api/crm', { cache: 'no-store', credentials: 'same-origin' });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Falha ao carregar CRM.');
  if (current === generation) {
    const incoming = result.collections as CrmSnapshot;
    cache = Object.fromEntries(Object.entries(incoming).map(([key,value]) => [key,cache[key] && cache[key].version > value.version ? cache[key] : value]));
    notify();
  }
}
export async function refreshCrm(): Promise<void> { await refreshCrmCache(); }
export async function setStoredData<T>(key: string, value: T): Promise<void> {
  if (!CRM_KEYS.includes(key as CrmKey)) throw new Error('Coleção inválida.');
  if (!cache[key]) throw new Error('CRM ainda não carregado. Tente novamente.');
  const current = generation;
  const response = await fetch(`/api/crm/${encodeURIComponent(key)}`, {
    method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: value, version: cache[key].version }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Falha ao salvar CRM.');
  if (current === generation && (!cache[key] || cache[key].version < result.version)) {
    cache = { ...cache, [key]: { data: result.data, version: result.version } }; notify();
  }
}
/** Explicit action only. Legacy source is retained; server IDs win. */
export async function migrateLegacyCrm(keys: string[] = [...CRM_KEYS]): Promise<{ backupKey: string; migrated: string[] }> {
  if (typeof window === 'undefined') throw new Error('Migração disponível apenas no navegador.');
  await refreshCrmCache();
  const source: Record<string, unknown> = {};
  for (const key of keys) {
    if (!CRM_KEYS.includes(key as CrmKey)) throw new Error('Coleção inválida.');
    const raw = window.localStorage.getItem(key);
    if (raw !== null) source[key] = JSON.parse(raw);
  }
  const backupKey = `vibe_crm_backup_${new Date().toISOString()}`;
  window.localStorage.setItem(backupKey, JSON.stringify(source));
  const migrated: string[] = [];
  for (const [key, legacy] of Object.entries(source)) {
    const existing = getStoredData<unknown[]>(key, []);
    if (!Array.isArray(legacy) || !Array.isArray(existing)) throw new Error(`Coleção inválida: ${key}`);
    const merged = new Map<string, unknown>();
    for (const item of [...legacy, ...existing]) {
      if (!item || typeof item !== 'object' || !('id' in item) || typeof item.id !== 'string') throw new Error(`Registro sem ID: ${key}`);
      merged.set(item.id, item);
    }
    await setStoredData(key, Array.from(merged.values())); migrated.push(key);
  }
  return { backupKey, migrated };
}
export function clearAllCrmData(): never { throw new Error('Limpeza global desabilitada. Exclua registros explicitamente.'); }
