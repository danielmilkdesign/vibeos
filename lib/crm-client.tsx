'use client';
import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { useAuth } from './auth-context';
import { getCrmSnapshot, getStoredData, replaceCrmCache, refreshCrmCache, setStoredData, subscribeCrm } from './crm-store';
export { refreshCrm } from './crm-store';
const SyncContext = createContext({ loading: true, error: null as string | null });
const EMPTY_SNAPSHOT = {};
export function CrmSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const identity = user ? `${user.id}:${user.role}` : null;
  useEffect(() => {
    let active = true;
    replaceCrmCache({}); setLoadedFor(null); setError(null);
    if (!authLoading && identity) {
      refreshCrmCache().then(() => { if (active) setLoadedFor(identity); })
        .catch(() => { if (active) setError('Não foi possível carregar o CRM. Seus dados não foram alterados.'); });
    }
    return () => { active = false; replaceCrmCache({}); };
  }, [authLoading, identity, retry]);
  const loading = authLoading || (!!identity && loadedFor !== identity);
  if (!authLoading && !identity) return <SyncContext.Provider value={{loading:false,error:null}}>{children}</SyncContext.Provider>;
  if (loading) return <section role={error ? 'alert' : 'status'} aria-live="polite" className="p-6 text-slate-200">
    <p>{error || 'Carregando dados do CRM…'}</p>
    {error && <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-4 rounded border border-slate-500 p-2 focus-visible:ring-2 focus-visible:ring-offset-2">Tentar novamente</button>}
  </section>;
  return <SyncContext.Provider value={{loading:false,error}}>{children}</SyncContext.Provider>;
}
export function useCrmCollection<T>(key: string, defaultValue: T): [T, (value: T) => Promise<void>, { loading: boolean; error: string | null }] {
  const sync = useContext(SyncContext);
  const [error, setError] = useState<string | null>(null);
  useSyncExternalStore(subscribeCrm,getCrmSnapshot,() => EMPTY_SNAPSHOT);
  const save = async (value: T) => {
    setError(null);
    try { await setStoredData(key,value); }
    catch (cause) { const message = cause instanceof Error ? cause.message : 'Falha ao salvar CRM.'; setError(message); throw cause; }
  };
  return [getStoredData(key,defaultValue),save,{loading:sync.loading,error:error || sync.error}];
}
