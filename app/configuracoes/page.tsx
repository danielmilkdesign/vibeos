'use client';

import React, { useState } from 'react';
import { Settings, Shield, UserCheck, DollarSign, Database, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { useCrmCollection } from '../../lib/crm-client';

type Offer = { id: string; title: string; setupValue: number; recurringValue: number; billingPeriod: string };

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const [offers, saveAsync, { loading, error }] = useCrmCollection<Offer[]>('vibe_offers', []);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [actionError, setActionError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const canEdit = ['ADMINISTRADOR','GESTOR_COMERCIAL','FINANCEIRO'].includes(user?.role || '');
  const saveOffer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing || !canEdit) return;
    setActionError(''); setSaved(false);
    if (!editing.title.trim() || ![editing.setupValue,editing.recurringValue].every(n => Number.isFinite(n) && n >= 0)) { setActionError('Informe nome e preços não negativos.'); return; }
    setBusy(true);
    try {
      const next = {...editing, recurringValue: editing.billingPeriod === 'UNICO' ? 0 : editing.recurringValue};
      await saveAsync([...offers.filter(o => o.id !== editing.id), next]);
      setEditing(null); setSaved(true);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Falha ao salvar oferta.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {loading && <p role="status">Carregando configurações…</p>}
      {(error || actionError) && <p role="alert" className="text-rose-400">{String(error || actionError)}</p>}
      {saved && <p role="status" className="text-emerald-400">Oferta salva.</p>}
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-mono">
            VIBE OS System Settings
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100">
          Configurações & Matriz de Permissões
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Gestão de usuários, controle de acessos no servidor (RBAC) e preços das ofertas.
        </p>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" /> Matriz de Permissões por Perfil (Seção 5 da Especificação)
        </h3>

        <p className="text-xs text-slate-300">Equipe única, dados compartilhados. Sessão atual: {user?.name} — {user?.role}. Não existe troca local de papel.</p>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs text-slate-300"><thead><tr><th className="p-3">Perfil</th><th className="p-3">Gravação autorizada no CRM</th></tr></thead><tbody>
          <tr><td className="p-3">Administrador / Gestor comercial</td><td className="p-3">Todas as coleções CRM</td></tr>
          <tr><td className="p-3">Comercial</td><td className="p-3">Leads, empresas, oportunidades, propostas, reuniões e contratos</td></tr>
          <tr><td className="p-3">Operações / Design e conteúdo</td><td className="p-3">Projetos, tarefas, entregas e conformidade</td></tr>
          <tr><td className="p-3">Financeiro</td><td className="p-3">Contratos e catálogo de ofertas</td></tr>
        </tbody></table></div>
        <p className="text-xs text-slate-400">Todos os perfis autorizados leem o CRM compartilhado e gerenciam notificações. Não há restrição por responsável nem gestão de usuários nesta tela. O servidor valida cada gravação.</p>
      </div>

      {/* Active Offers Config */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" /> Tabela de Ofertas VIBE (Preços Configuráveis)
        </h3>

        <p className="text-xs text-slate-400">Sugestões de preço do catálogo; não são preços confirmados por cliente. Propostas exigem confirmação humana. Alterar o catálogo não altera contratos ou propostas existentes.</p>
        {canEdit && <button disabled={busy || loading} onClick={() => { setSaved(false); setEditing({id: crypto.randomUUID(), title: '', setupValue: 0, recurringValue: 0, billingPeriod: 'MENSAL'}); }} className="bg-cyan-600 rounded-xl px-4 py-2 text-sm text-white focus-visible:ring-2 focus-visible:ring-offset-2">Nova oferta</button>}
        {!offers.length && <p className="text-sm text-slate-400">Nenhuma oferta cadastrada.</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{offers.map(offer => <article key={offer.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <h4 className="font-bold text-sm text-cyan-400">{offer.title}</h4>
          <p className="text-xs text-slate-300">Setup: R$ {offer.setupValue.toLocaleString('pt-BR')} • Recorrência: R$ {offer.recurringValue.toLocaleString('pt-BR')} ({offer.billingPeriod})</p>
          {canEdit && <button onClick={() => { setSaved(false); setEditing(offer); }} className="text-cyan-400 focus-visible:ring-2 focus-visible:ring-offset-2">Editar oferta</button>}
        </article>)}</div>
        {editing && canEdit && <form onSubmit={saveOffer} className="space-y-3 text-sm text-slate-200">
          <label className="block">Nome<input required aria-label="Nome da oferta" value={editing.title} onChange={e => setEditing({...editing,title:e.target.value})} className="block w-full bg-slate-950 border border-slate-700 rounded-xl p-2 focus-visible:ring-2 focus-visible:ring-offset-2" /></label>
          <label className="block">Setup (R$)<input required aria-label="Setup da oferta" type="number" min="0" step="0.01" value={editing.setupValue} onChange={e => setEditing({...editing,setupValue:Number(e.target.value)})} className="block w-full bg-slate-950 border border-slate-700 rounded-xl p-2 focus-visible:ring-2 focus-visible:ring-offset-2" /></label>
          <label className="block">Recorrência (R$)<input required aria-label="Recorrência da oferta" disabled={editing.billingPeriod === 'UNICO'} type="number" min="0" step="0.01" value={editing.recurringValue} onChange={e => setEditing({...editing,recurringValue:Number(e.target.value)})} className="block w-full bg-slate-950 border border-slate-700 rounded-xl p-2 focus-visible:ring-2 focus-visible:ring-offset-2" /></label>
          <label className="block">Periodicidade<select aria-label="Periodicidade da oferta" value={editing.billingPeriod} onChange={e => setEditing({...editing,billingPeriod:e.target.value})} className="block bg-slate-950 border border-slate-700 rounded-xl p-2 focus-visible:ring-2 focus-visible:ring-offset-2">{['UNICO','MENSAL','TRIMESTRAL','SEMESTRAL','ANUAL'].map(v => <option key={v}>{v}</option>)}</select></label>
          <button disabled={busy || loading} className="bg-cyan-600 rounded-xl px-4 py-2 focus-visible:ring-2 focus-visible:ring-offset-2">Salvar oferta</button>
          <button type="button" disabled={busy} onClick={() => setEditing(null)} className="px-4 py-2 focus-visible:ring-2 focus-visible:ring-offset-2">Cancelar</button>
        </form>}
      </div>
    </div>
  );
}
