'use client';
import React, { useState } from 'react';
import { FileCheck, Plus } from 'lucide-react';
import { useCrmCollection } from '../../lib/crm-client';
import { contractFromAcceptedProposal, type ContractDocument, type ProposalDocument } from '../../lib/proposal-domain';

const button='rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed';
const control='w-full rounded-xl border border-border bg-background p-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
export default function ContratosPage() {
  const [contracts,saveContracts,contractState]=useCrmCollection<ContractDocument[]>('vibe_contracts',[]);
  const [proposals,,proposalState]=useCrmCollection<ProposalDocument[]>('vibe_proposals',[]);
  const [selectedId,setSelectedId]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const selected=proposals.find(p=>p.id===selectedId);
  const accepted=proposals.filter(p=>p.status==='APROVADA'&&p.acceptance&&p.acceptance.version===(p.version||1));
  const blocked=busy||contractState.loading||proposalState.loading;
  const create=async(e:React.FormEvent)=>{
    e.preventDefault();setError('');setMessage('');setBusy(true);
    try{
      if(!selected)throw new Error('Selecione uma proposta aceita com evidência.');
      if(contracts.some(c=>c.proposalId===selected.id&&c.proposalVersion===(selected.version||1)))throw new Error('Já existe contrato para esta proposta e versão.');
      const draft=contractFromAcceptedProposal(selected);
      await saveContracts([draft,...contracts]);
      setMessage('Contrato rascunho salvo com os termos da versão aceita. Nenhuma assinatura ou ativação foi registrada.');setSelectedId('');
    }catch(e){setError(e instanceof Error?e.message:'Não foi possível salvar o contrato.');}finally{setBusy(false);}
  };
  const increment=async(c:ContractDocument)=>{
    setBusy(true);setError('');setMessage('');
    try{
      if(c.status!=='ATIVO'||!Number.isFinite(c.deliveryLimit)||c.deliveryLimit<=0||c.deliveriesUsed>=c.deliveryLimit)throw new Error('Contrato precisa estar ativo e ter franquia disponível confirmada.');
      await saveContracts(contracts.map(item=>item.id===c.id?{...item,deliveriesUsed:item.deliveriesUsed+1}:item));
      setMessage('Entrega registrada no CRM.');
    }catch(e){setError(e instanceof Error?e.message:'Não foi possível registrar entrega.');}finally{setBusy(false);}
  };
  const active=contracts.filter(c=>c.status==='ATIVO'||c.status==='RENOVACAO_PROXIMA');
  const recurring=active.reduce<Record<string,number>>((totals,c)=>{if(c.billingPeriod!=='UNICO')totals[c.billingPeriod]=(totals[c.billingPeriod]||0)+c.recurringValue;return totals;},{});
  return <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6 text-foreground">
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4"><div><h1 className="text-2xl font-bold">Contratos & Recorrência</h1><p className="text-sm text-muted-foreground">Condições herdadas da proposta aceita. Rascunho não significa contrato assinado ou ativo.</p></div><div className="text-sm">{Object.entries(recurring).map(([period,value])=><p key={period}>Recorrência ativa {period}: R$ {value.toLocaleString('pt-BR')}</p>)}</div></header>
    {(contractState.loading||proposalState.loading)&&<p role="status">Carregando CRM…</p>}{(contractState.error||proposalState.error)&&<p role="alert">Falha ao carregar: {String(contractState.error||proposalState.error)}</p>}{error&&<p role="alert" className="text-error">{error}</p>}{message&&<p role="status">{message}</p>}
    <section className="rounded-2xl border border-border bg-surface p-5 space-y-4" aria-labelledby="derive-contract"><h2 id="derive-contract" className="font-semibold">Novo contrato a partir de proposta aceita</h2>
      <form onSubmit={create} className="space-y-3"><label className="block">Proposta e versão aceitas<select className={control} required value={selectedId} onChange={e=>setSelectedId(e.target.value)}><option value="">Selecione uma proposta aceita</option>{accepted.map(p=><option value={p.id} key={p.id}>{p.clientName} · {p.offerTitle} · v{p.version||1}</option>)}</select></label>
      {selected&&<div className="rounded-xl bg-background border border-border p-4 space-y-2 text-sm"><p>Cliente: {selected.clientName}</p><p>Setup: R$ {selected.setupValue.toLocaleString('pt-BR')}</p><p>Recorrência: R$ {selected.recurringValue.toLocaleString('pt-BR')} · {selected.billingPeriod}</p><p>Pagamento: {selected.paymentTerms}</p><p>Prazo: {selected.deliveryTimeline}</p><p className="whitespace-pre-wrap">Escopo: {selected.scopeText}</p><p>Aceite: {selected.acceptance?.acceptedAt} · {selected.acceptance?.evidence}</p></div>}
      <p className="text-sm text-muted-foreground">Valores, escopo, exclusões, prazo, periodicidade, responsabilidades, critérios e custos de terceiros serão copiados, sem alteração. Início, renovação e franquia continuam pendentes; sem defaults mensais ou assinatura simulada.</p>
      <button type="submit" className={button} disabled={blocked||!selected}><Plus className="inline w-4 h-4"/> Criar contrato rascunho</button></form>
    </section>
    {!contractState.loading&&contracts.length===0&&<div className="rounded-2xl border border-dashed border-border p-12 text-center"><FileCheck className="w-8 h-8 mx-auto"/><h2>Nenhum contrato cadastrado</h2><p className="text-sm text-muted-foreground">Registre primeiro o aceite documentado na tela de propostas.</p></div>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{contracts.map(c=><article key={c.id} className="p-5 rounded-2xl bg-surface border border-border space-y-3"><div className="flex justify-between gap-2"><span className="text-primary text-xs">{c.contractNumber}</span><span className="text-xs">{c.status}</span></div><h2 className="font-bold">{c.companyName}</h2><p className="text-sm text-muted-foreground">{c.offerName} · {c.clientName}</p><div className="p-3 rounded-xl bg-background border border-border text-sm space-y-1"><p>Setup: R$ {c.setupValue.toLocaleString('pt-BR')}</p><p>Recorrência: R$ {c.recurringValue.toLocaleString('pt-BR')} · {c.billingPeriod}</p><p>Pagamento: {c.paymentTerms||'pendente'}</p><p>Prazo: {c.deliveryTimeline||'pendente'}</p><p>Início: {c.startDate||'pendente'} · Renovação: {c.renewalDate||'não definida'}</p><p>Vencimento: {c.dueDay?`dia ${c.dueDay}`:'pendente / conforme condições'}</p></div><p className="text-xs">Proposta: {c.proposalId||'legado sem vínculo'} · v{c.proposalVersion||'não registrada'}</p>
      <details><summary className="cursor-pointer focus-visible:ring-2 focus-visible:ring-ring">Escopo e termos copiados</summary><div className="text-sm space-y-2 whitespace-pre-wrap"><p>{c.scopeText||'Não registrado no contrato legado.'}</p><p>Exclusões: {c.exclusions||'pendente'}</p><p>Critérios: {c.acceptanceCriteria||'pendente'}</p><p>Responsabilidades: {c.responsibilities||'pendente'}</p><p>Terceiros: {c.thirdPartyCosts||'pendente'}</p><p>Evidência comercial: {c.acceptanceEvidence||'não registrada'} · {c.acceptedAt||''}</p><p>Aceite comercial documentado não equivale a assinatura do contrato.</p></div></details>
      {c.deliveryLimit>0?<p className="text-sm">Entregas: {c.deliveriesUsed} de {c.deliveryLimit}</p>:<p className="text-sm text-muted-foreground">Franquia não definida nesta versão.</p>}
      <button className={button} disabled={blocked||c.status!=='ATIVO'||!c.deliveryLimit||c.deliveriesUsed>=c.deliveryLimit} onClick={()=>increment(c)}>Registrar entrega de conteúdo</button>
    </article>)}</div>
  </div>;
}

