'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import ProposalAssets from '../../components/CRM/ProposalAssets';
import { useCrmCollection } from '../../lib/crm-client';
import type { Lead, Opportunity, Company } from '../../types/crm';
import { normalizePhone } from '../../lib/lead-normalization';
import { analyzeLead } from '../../lib/lead-analysis';
import { SERVICE_CATALOG, TIPOS_SERVICO, gerarRascunhosParaLead, gerarTextoWhatsApp, missingServiceTypes, type ServiceType } from '../../lib/gerador-propostas';
import { createHermesProposalBriefing } from '../../lib/hermes-proposal-briefing';
import { resolveProposalContext, createProposalDraft, editProposal, renewProposal, approveProposalInternally, recordProposalSent, acceptProposal, proposalPending, exportProposalHTML, exportProposalMarkdown, persistProposalVersion, type ProposalDocument, type ProposalVersion, type BillingPeriod } from '../../lib/proposal-domain';

const control = 'w-full rounded-xl border border-border bg-background p-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const button = 'rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed';
const periods: Record<BillingPeriod,string> = { UNICO:'Pagamento único', MENSAL:'Mensal', TRIMESTRAL:'Trimestral', SEMESTRAL:'Semestral', ANUAL:'Anual' };
const textFields = [ ['offerTitle','Oferta'], ['deliveryTimeline','Prazo e marco de início'], ['paymentTerms','Condições de pagamento'], ['scopeText','Escopo e entregáveis'], ['exclusions','Exclusões e revisões incluídas'], ['acceptanceCriteria','Critérios de aceite'], ['responsibilities','Responsabilidades e dependências'], ['thirdPartyCosts','Custos de terceiros (informe nenhum se aplicável)'] ] as const;
export default function PropostasPage() {
  const [proposals, saveProposals, proposalState] = useCrmCollection<ProposalDocument[]>('vibe_proposals', []);
  const [versions, saveVersions, versionState] = useCrmCollection<ProposalVersion[]>('vibe_proposal_versions', []);
  const [leads,,leadState] = useCrmCollection<Lead[]>('vibe_leads', []);
  const [opportunities,,opportunityState] = useCrmCollection<(Opportunity & {leadId?:string})[]>('vibe_opps', []);
  const [companies,,companyState] = useCrmCollection<Company[]>('vibe_companies', []);
  const [leadId,setLeadId] = useState('');
  const [opportunityId,setOpportunityId] = useState('');
  const [service,setService] = useState<ServiceType | 'TODOS'>('TODOS');
  const [form,setForm] = useState<ProposalDocument | null>(null);
  const [selectedId,setSelectedId] = useState<string | null>(null);
  const [briefing,setBriefing] = useState('');
  const [message,setMessage] = useState('');
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [evidence,setEvidence] = useState('');
  const [acceptedAt,setAcceptedAt] = useState('');
  const [acceptVersion,setAcceptVersion] = useState('');
  const [renewDate,setRenewDate] = useState('');
  const formHeading=useRef<HTMLHeadingElement>(null);
  const initialLinkApplied=useRef(false);
  const selectedLead=leads.find(l=>l.id===leadId);
  const selected=proposals.find(p=>p.id===selectedId);
  const states=[proposalState,versionState,leadState,opportunityState,companyState];
  const loading=states.some(s=>s.loading);
  const loadError=states.find(s=>s.error)?.error;
  // Provider gates read failures; hook write errors must still allow retry.
  const blocked=busy || loading;
  useEffect(()=>{
    if (loading || initialLinkApplied.current) return;
    initialLinkApplied.current=true;
    // Read only after CRM hydration; never infer identity from company names.
    const params=new URLSearchParams(window.location.search);
    try {
      const context=resolveProposalContext(leads,opportunities,params.toString());
      setLeadId(context.leadId);setOpportunityId(context.opportunityId);
    } catch(e) {setError(e instanceof Error?e.message:'Vínculos do link inválidos.');}
  },[loading,leads,opportunities]);
  const linkedOpportunities=opportunities.filter(o=>!!selectedLead && (o.leadId ? o.leadId === selectedLead.id : !!selectedLead.companyId && o.companyId === selectedLead.companyId));
  const analysis=selectedLead ? analyzeLead({...selectedLead}) : null;
  const run=async(action:()=>Promise<void>)=>{setBusy(true);setError('');setMessage('');try{await action();}catch(e){setError(e instanceof Error?e.message:'Não foi possível concluir a operação.');}finally{setBusy(false);}};
  const persist=async(p:ProposalDocument,reason:string)=>{await persistProposalVersion(p,proposals,versions,saveVersions,saveProposals,reason);setMessage('Salvo no CRM.');};
  const openEditor=(p:ProposalDocument)=>{setForm({...p,confirmedTerms:false});setBriefing('');setTimeout(()=>formHeading.current?.focus(),0);};
  const change=(patch:Partial<ProposalDocument>)=>{setForm(p=>p?{...p,...patch}:p);setBriefing('');};
  const generate=()=>run(async()=>{
    if(!selectedLead)throw new Error('Selecione um lead de origem.');
    if(opportunityId && !linkedOpportunities.some(o=>o.id===opportunityId))throw new Error('Oportunidade não pertence ao lead/empresa.');
    const missing=missingServiceTypes(service,proposals.filter(p=>p.leadId===selectedLead.id).map(p=>p.serviceType));
    if(!missing.length)throw new Error('Este lead já possui rascunhos para o(s) serviço(s) selecionado(s). Edite a revisão existente ou crie manualmente.');
    const drafts=missing.flatMap(t=>gerarRascunhosParaLead(selectedLead,{opportunityId:opportunityId||undefined,serviceType:t}));
    const savedAt=new Date().toISOString();
    await saveVersions([...versions,...drafts.map(p=>({id:`pv-${crypto.randomUUID()}`,proposalId:p.id,version:1,savedAt,reason:'Geração por lead',snapshot:p}))]);
    await saveProposals([...drafts,...proposals]);
    setMessage(`${drafts.length} rascunhos salvos. Preços, prazo e condições pendentes.`);
  });
  const submit=(e:React.FormEvent)=>{e.preventDefault();if(!form)return;void run(async()=>{
    if(!form.clientName.trim())throw new Error('Informe o cliente.');
    if(![form.setupValue,form.recurringValue].every(v=>Number.isFinite(v)&&v>=0))throw new Error('Informe preços válidos (zero é permitido quando confirmado).');
    const phone=normalizePhone(form.clientPhone || '');
    if(form.clientPhone?.trim()&&!phone)throw new Error('Telefone inválido. Use DDI e DDD.');
    const old=proposals.find(p=>p.id===form.id);
    const p=old?editProposal(old,form):createProposalDraft(form);
    p.clientPhone=phone || undefined;
    p.confirmedTerms=form.confirmedTerms===true;
    p.pricingStatus=p.confirmedTerms?'CONFIRMADO':'PENDENTE';
    await persist(p,old?'Edição comercial':'Criação manual');
    setForm(null);setSelectedId(p.id);
  });};
  const exportFile=(p:ProposalDocument,format:'md'|'html')=>run(async()=>{
    const text=format==='md'?exportProposalMarkdown(p):exportProposalHTML(p);
    const url=URL.createObjectURL(new Blob([text],{type:format==='md'?'text/markdown;charset=utf-8':'text/html;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`proposta-${p.id.replace(/[^a-zA-Z0-9-]/g,'')}-v${p.version||1}.${format}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    setMessage('Arquivo individual preparado. Exportar não registra envio.');
  });
  const copy=(p:ProposalDocument)=>run(async()=>{await navigator.clipboard.writeText(gerarTextoWhatsApp([p]));setMessage('Texto individual copiado. Registre o envio somente depois de realizá-lo.');});
  const whatsapp=(p:ProposalDocument)=>run(async()=>{const phone=normalizePhone(p.clientPhone||'');if(!phone)throw new Error('Preencha um telefone válido na edição.');const text=gerarTextoWhatsApp([p]);window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');setMessage('WhatsApp preparado; abertura não comprova envio.');});
  return <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-foreground">
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">Propostas Comerciais</h1><p className="text-sm text-muted-foreground">Rascunho → confirmação humana → aprovação interna → envio registrado → aceite com evidência.</p></div><button disabled={blocked} className={button} onClick={()=>openEditor(createProposalDraft({clientName:'Novo cliente'}))}><Plus className="inline w-4 h-4"/> Nova proposta manual</button></header>
    {loading&&<p role="status">Carregando CRM…</p>}{loadError&&<p role="alert">Falha ao carregar: {String(loadError)}</p>}{error&&<p role="alert" className="text-error">{error}</p>}{message&&<p role="status">{message}</p>}
    <section className="rounded-2xl border border-border bg-surface p-5 space-y-4" aria-labelledby="lead-generation"><h2 id="lead-generation" className="font-semibold">Gerador por cliente / serviço</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3"><label>Lead de origem<select className={control} value={leadId} onChange={e=>{setLeadId(e.target.value);setOpportunityId('');}}><option value="">Selecione um lead</option>{leads.map(l=><option key={l.id} value={l.id}>{l.nomeEmpresa} · {l.id}</option>)}</select></label>
      <label>Oportunidade vinculada<select className={control} value={opportunityId} onChange={e=>setOpportunityId(e.target.value)}><option value="">Sem oportunidade vinculada</option>{linkedOpportunities.map(o=><option key={o.id} value={o.id}>{o.title}</option>)}</select></label>
      <label>Serviço<select className={control} value={service} onChange={e=>setService(e.target.value as ServiceType|'TODOS')}><option value="TODOS">Todos os {TIPOS_SERVICO.length} tipos</option>{TIPOS_SERVICO.map(t=><option key={t} value={t}>{SERVICE_CATALOG[t].nome}</option>)}</select></label></div>
      {selectedLead&&<div className="space-y-2 text-sm"><p>Cliente: {selectedLead.nomeEmpresa} · Empresa ID: {selectedLead.companyId||'não vinculada'}</p><p>Telefone de origem: {selectedLead.phoneWhatsapp||'não informado'} (editável na proposta)</p><details><summary className="cursor-pointer focus-visible:ring-2 focus-visible:ring-ring">Fatos, fontes, hipóteses, pendências e recomendações do lead</summary><pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(analysis,null,2)}</pre></details></div>}
      <p className="text-sm text-muted-foreground">Os modelos sugerem serviços, não preços ou diagnósticos. Zero em rascunho não significa gratuidade confirmada.</p><button className={button} disabled={blocked||!selectedLead} onClick={generate}>{service==='TODOS'?`Gerar ${TIPOS_SERVICO.length} rascunhos`:'Gerar rascunho do serviço'}</button>
    </section>
    {form&&<section className="rounded-2xl border border-border bg-surface p-5 space-y-4" aria-labelledby="edit-proposal"><h2 ref={formHeading} tabIndex={-1} id="edit-proposal" className="font-bold focus-visible:ring-2 focus-visible:ring-ring">{proposals.some(p=>p.id===form.id)?'Editar proposta (nova versão)':'Nova proposta'} — {form.clientName}</h2>
      <p className="text-sm text-muted-foreground">Editar preserva a validade e remove aprovação, envio e aceite da nova versão. Renovação é uma ação separada. Confirme os termos novamente.</p>
      <form onSubmit={submit} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label>Cliente / Empresa<input className={control} required value={form.clientName} onChange={e=>change({clientName:e.target.value})}/></label>
        <label>E-mail do decisor (opcional)<input className={control} type="email" value={form.clientEmail} onChange={e=>change({clientEmail:e.target.value})}/></label>
        <label>Telefone / WhatsApp editável<input className={control} type="tel" value={form.clientPhone||''} onChange={e=>change({clientPhone:e.target.value})} placeholder="DDI + DDD + número"/></label>
        <label>Empresa vinculada por ID<select className={control} value={form.companyId||''} onChange={e=>change({companyId:e.target.value||undefined,opportunityId:undefined})}><option value="">Sem empresa vinculada</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>Oportunidade por ID<select className={control} value={form.opportunityId||''} onChange={e=>change({opportunityId:e.target.value||undefined})}><option value="">Sem oportunidade</option>{opportunities.filter(o=>(!!form.companyId&&o.companyId===form.companyId)||(!!form.leadId&&o.leadId===form.leadId)).map(o=><option key={o.id} value={o.id}>{o.title}</option>)}</select></label>
        <label>Modelo sugerido<select className={control} value={form.serviceType||''} onChange={e=>{const t=e.target.value as ServiceType;change({serviceType:t,offerTitle:SERVICE_CATALOG[t]?.nome||form.offerTitle,scopeText:SERVICE_CATALOG[t]?.descricao||form.scopeText});}}><option value="">Personalizado</option>{TIPOS_SERVICO.map(t=><option key={t} value={t}>{SERVICE_CATALOG[t].nome}</option>)}</select></label>
        <label>Setup / projeto em R$ (pendente até confirmação)<input className={control} type="number" min="0" step="0.01" required value={form.setupValue} onChange={e=>change({setupValue:e.target.value===''?NaN:Number(e.target.value)})}/></label>
        <label>Periodicidade<select className={control} value={form.billingPeriod||'UNICO'} onChange={e=>change({billingPeriod:e.target.value as BillingPeriod,...(e.target.value==='UNICO'?{recurringValue:0}:{})})}>{Object.entries(periods).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <label>Recorrência em R$ (separada do setup)<input className={control} type="number" min="0" step="0.01" required disabled={form.billingPeriod==='UNICO'} value={form.billingPeriod==='UNICO'?0:form.recurringValue} onChange={e=>change({recurringValue:e.target.value===''?NaN:Number(e.target.value)})}/></label>
        <label>Validade da oferta<input className={control} type="date" value={form.validUntil} disabled={proposals.some(p=>p.id===form.id&&!!p.validUntil)} onChange={e=>change({validUntil:e.target.value})}/></label>
      </div>
      {textFields.map(([key,label])=><label className="block" key={key}>{label}<textarea className={control} rows={2} value={form[key]||''} onChange={e=>change({[key]:e.target.value})}/></label>)}
      <label className="block">Contexto da reunião (anotações manuais)<textarea className={control} value={form.meetingContext||''} onChange={e=>change({meetingContext:e.target.value})}/></label>
      <label className="flex items-start gap-2"><input className="focus-visible:ring-2 focus-visible:ring-ring" type="checkbox" checked={form.confirmedTerms===true} onChange={e=>change({confirmedTerms:e.target.checked})}/>Confirmo explicitamente para este cliente os preços (incluindo valores zero), prazo, escopo e condições acima. Isto não é aceite do cliente.</label>
      <div className="flex flex-wrap gap-2"><button type="submit" className={button} disabled={blocked}>Salvar rascunho / revisão</button><button type="button" className={button} onClick={()=>{setForm(null);setBriefing('');}}>Cancelar</button><button type="button" className={button} onClick={()=>{try{setBriefing(createHermesProposalBriefing({...form,clientName:form.clientName,clientEmail:form.clientEmail,clientPhone:form.clientPhone,offerTitle:form.offerTitle,setupValue:form.setupValue,recurringValue:form.recurringValue,billingPeriod:form.billingPeriod||'UNICO',paymentTerms:form.paymentTerms||'',scopeText:form.scopeText,validityDays:form.validUntil?Math.max(1,Math.ceil((Date.parse(form.validUntil)-Date.now())/86400000)):14,meetingContext:form.meetingContext||'',deliveryTimeline:form.deliveryTimeline,lead:form.leadAnalysis}));setError('');}catch(e){setError(e instanceof Error?e.message:'Briefing inválido.');}}}>Preparar briefing para Hermes</button></div>
      <p className="text-sm text-muted-foreground">Briefing não salva, aprova nem envia dados. Sem validade informada, 14 dias é somente sugestão a confirmar.</p>
      {briefing&&<label className="block">Briefing preparado (copie manualmente)<textarea readOnly className={control} rows={10} value={briefing} onFocus={e=>e.currentTarget.select()}/></label>}
      </form></section>}
    {!loading&&proposals.length===0&&<div className="border border-dashed border-border rounded-2xl p-12 text-center"><FileText className="w-10 h-10 mx-auto"/><h2>Nenhuma proposta emitida</h2><p className="text-muted-foreground">Selecione um lead ou crie um rascunho manual.</p></div>}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{proposals.map(p=><article key={p.id} className="bg-surface border border-border rounded-2xl p-5 space-y-3"><div className="flex justify-between gap-2"><span className="text-primary text-xs">{p.proposalNumber} · v{p.version||1}</span><span className="text-xs">{p.status}</span></div><h2 className="font-bold">{p.clientName}</h2><p className="text-sm text-muted-foreground">{p.offerTitle}</p><div className="bg-background border border-border rounded-xl p-3 text-sm"><p>Preços: {p.pricingStatus==='CONFIRMADO'?'confirmados pelo responsável':'pendentes — não são oferta final'}</p><p>Setup: R$ {p.setupValue.toLocaleString('pt-BR')}</p><p>Recorrência: R$ {p.recurringValue.toLocaleString('pt-BR')} · {p.billingPeriod||'pendente'}</p></div><p className="text-sm">Validade: {p.validUntil||'pendente'}</p><p className="text-xs">Aprovação interna: {p.internalApprovedAt?'registrada':'pendente'} · Aceite: {p.acceptance?'evidência registrada':'pendente'}</p><div className="flex gap-2 flex-wrap"><button className={button} onClick={()=>{setSelectedId(p.id);setEvidence('');setAcceptedAt('');setAcceptVersion(String(p.version||1));setRenewDate('');}}>Detalhes</button><button className={button} disabled={blocked} onClick={()=>openEditor(p)}>Editar</button></div></article>)}</div>
    {selected&&<section aria-labelledby="proposal-detail" className="rounded-2xl bg-surface border border-border p-5 space-y-4"><h2 id="proposal-detail" className="font-bold">{selected.clientName} — {selected.offerTitle} · v{selected.version||1}</h2><p>Lead: {selected.leadId||'manual'} · Empresa: {selected.companyId||'sem vínculo'} · Oportunidade: {selected.opportunityId||'sem vínculo'}</p><p className="whitespace-pre-wrap">{selected.scopeText}</p><p>Prazo: {selected.deliveryTimeline||'pendente'} · Pagamento: {selected.paymentTerms||'pendente'}</p>
      {!!proposalPending(selected).length&&<div className="text-sm"><p>Antes de aprovar/exportar:</p><ul className="list-disc pl-5">{proposalPending(selected).map(item=><li key={item}>{item}</li>)}</ul></div>}
      <div className="flex flex-wrap gap-2"><button className={button} disabled={blocked||!!selected.acceptance||!!selected.internalApprovedAt||proposalPending(selected).length>0} onClick={()=>run(async()=>persist(approveProposalInternally(selected),'Aprovação interna'))}>Aprovar internamente</button>
      <button className={button} disabled={blocked||!selected.internalApprovedAt||proposalPending(selected).length>0} onClick={()=>copy(selected)}>Copiar WhatsApp</button><button className={button} disabled={blocked||!selected.internalApprovedAt||proposalPending(selected).length>0||!normalizePhone(selected.clientPhone||'')} onClick={()=>whatsapp(selected)}>Abrir WhatsApp do cliente</button>
      <button className={button} disabled={blocked||!selected.internalApprovedAt||proposalPending(selected).length>0} onClick={()=>exportFile(selected,'md')}>Exportar Markdown</button><button className={button} disabled={blocked||!selected.internalApprovedAt||proposalPending(selected).length>0} onClick={()=>exportFile(selected,'html')}>Exportar HTML</button></div>
      <ProposalAssets proposal={selected} canExport={!blocked && !!selected.internalApprovedAt && proposalPending(selected).length === 0} requireExport={async () => {
        if (!selected.internalApprovedAt || proposalPending(selected, new Date().toISOString()).length) return 'A proposta precisa estar liberada para exportação.';
        return null;
      }}/>
      <p className="text-sm text-muted-foreground">Copiar/exportar/abrir WhatsApp não envia automaticamente. Baixe as imagens PNG e anexe na conversa do contato. Aprovação interna não é assinatura ou aceite.</p>
      <label className="block">Evidência do envio ou aceite (canal, referência da mensagem / documento)<textarea className={control} value={evidence} onChange={e=>setEvidence(e.target.value)}/></label>
      <button className={button} disabled={blocked||!!selected.acceptance||!evidence.trim()||!selected.internalApprovedAt||proposalPending(selected).length>0} onClick={()=>run(async()=>persist(recordProposalSent(selected,evidence),'Envio registrado manualmente'))}>Registrar envio realizado</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><label>Data/hora do aceite do cliente<input className={control} type="datetime-local" value={acceptedAt} onChange={e=>setAcceptedAt(e.target.value)}/></label><label>Versão aceita pelo cliente<input className={control} type="number" min="1" value={acceptVersion} onChange={e=>setAcceptVersion(e.target.value)}/></label></div>
      <button className={button} disabled={blocked||!!selected.acceptance||!selected.sentAt||!acceptedAt||!evidence.trim()} onClick={()=>run(async()=>persist(acceptProposal(selected,{evidence,acceptedAt:new Date(acceptedAt).toISOString(),version:Number(acceptVersion)}),'Aceite do cliente documentado'))}>Registrar aceite com evidência</button>
      {selected.acceptance&&<p>Aceite documentado em {selected.acceptance.acceptedAt} · versão {selected.acceptance.version} · {selected.acceptance.evidence}. Não equivale a assinatura digital.</p>}
      <div className="flex flex-wrap gap-3 items-end"><label>Renovar explicitamente até<input className={control} type="date" value={renewDate} onChange={e=>setRenewDate(e.target.value)}/></label><button className={button} disabled={blocked||!renewDate} onClick={()=>run(async()=>persist(renewProposal(selected,renewDate),'Renovação explícita; nova versão requer confirmação'))}>Renovar e criar revisão</button></div>
      <details><summary className="cursor-pointer focus-visible:ring-2 focus-visible:ring-ring">Histórico de versões e eventos</summary><ul className="space-y-2">{versions.filter(v=>v.proposalId===selected.id).map(v=><li key={v.id}><details><summary className="focus-visible:ring-2 focus-visible:ring-ring">v{v.version} · {v.savedAt} · {v.reason}</summary><pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(v.snapshot,null,2)}</pre></details></li>)}</ul></details><button className={button} onClick={()=>setSelectedId(null)}>Fechar detalhes</button>
    </section>}
  </div>;
}

