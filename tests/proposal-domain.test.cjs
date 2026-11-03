const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(name) {
 const file = path.join(__dirname, '../lib/', name + '.ts');
 const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};
 new Function('exports','require','module',code)(mod.exports, id => id.startsWith('./') ? load(id.slice(2)) : require(id),mod);
 return mod.exports;
}
const d = load('proposal-domain');
const now = '2026-10-30T12:00:00.000Z';
const input = () => ({clientName:'Cliente',clientEmail:'',offerTitle:'Site',scopeText:'Escopo a revisar',setupValue:0,recurringValue:0,billingPeriod:'UNICO',validUntil:'2026-11-15'});
test('rascunho nunca se anuncia enviado nem confirma preços e preserva zero',()=>{
 const p=d.createProposalDraft(input(),now);
 assert.equal(p.status,'RASCUNHO'); assert.equal(p.confirmedTerms,false); assert.equal(p.setupValue,0);
 assert.equal(p.version,1); assert.equal(p.internalApprovedAt,undefined);
 assert.throws(()=>d.exportProposalMarkdown(p,now),/confirm|aprova|pend/i);
});
const complete = () => ({...d.createProposalDraft(input(),now), confirmedTerms:true,pricingStatus:'CONFIRMADO',paymentTerms:'À vista',deliveryTimeline:'10 dias após material',exclusions:'Sem mídia paga',acceptanceCriteria:'Conferência das entregas',responsibilities:'Cliente fornece conteúdo',thirdPartyCosts:'Nenhum',scopeText:'Uma página'});
test('aprovação interna exige todas as condições, não equivale a aceite nem envio',()=>{
 assert.throws(()=>d.approveProposalInternally(d.createProposalDraft(input(),now),now),/pend|confirm/i);
 for(const key of ['paymentTerms','deliveryTimeline','exclusions','acceptanceCriteria','responsibilities','thirdPartyCosts','validUntil']) assert.throws(()=>d.approveProposalInternally({...complete(),[key]:''},now));
 for(const setupValue of [-1,NaN,Infinity]) assert.throws(()=>d.approveProposalInternally({...complete(),setupValue},now));
 const p=d.approveProposalInternally(complete(),now); assert.equal(p.status,'EM_REVISAO'); assert.equal(p.acceptance,undefined);assert.equal(p.sentAt,undefined);
});
test('editar preserva validade, incrementa versão e invalida aprovação/envio/aceite; renovação é explícita',()=>{
 const old={...complete(),internalApprovedAt:now,status:'APROVADA',sentAt:now,acceptance:{evidence:'email',acceptedAt:now,version:1,recordedAt:now}};
 const p=d.editProposal(old,{clientName:'Outro',validUntil:'2099-01-01',internalApprovedAt:now},now);
 assert.equal(p.validUntil,old.validUntil);assert.equal(p.version,2);assert.equal(p.status,'RASCUNHO');assert.equal(p.confirmedTerms,false);assert.equal(p.acceptance,undefined);assert.equal(p.sentAt,undefined);
 assert.equal(d.renewProposal(old,'2026-12-15',now).validUntil,'2026-12-15');
});
test('rascunho gerado sem validade pode receber a primeira validade no formulário',()=>{
 const p=d.createProposalDraft({...input(),validUntil:''},now);
 const edited=d.editProposal(p,{validUntil:'2026-11-15'},now);
 assert.equal(edited.validUntil,'2026-11-15');
 assert.equal(d.editProposal(edited,{validUntil:'2099-01-01'},now).validUntil,'2026-11-15');
});
test('envio e aceite explícitos validam evidência, data, versão e vencimento; contrato copia termos sem ativar',()=>{
 const approved=d.approveProposalInternally(complete(),now);
 assert.throws(()=>d.acceptProposal(approved,{evidence:'email',acceptedAt:now,version:1},now),/envio/i);
 assert.throws(()=>d.recordProposalSent(approved,'',now));
 const sent=d.recordProposalSent(approved,'WhatsApp confirmado manualmente',now);
 for(const change of [{evidence:''},{version:2},{acceptedAt:'invalid'},{acceptedAt:'2026-11-20T12:00:00Z'},{acceptedAt:'2026-10-29T12:00:00Z'}]) assert.throws(()=>d.acceptProposal(sent,{evidence:'Email cliente',acceptedAt:now,version:1,...change},now));
 const accepted=d.acceptProposal(sent,{evidence:'Email cliente',acceptedAt:now,version:1},now);
 const ctr=d.contractFromAcceptedProposal(accepted,now);
 assert.equal(ctr.status,'RASCUNHO');assert.equal(ctr.setupValue,0);assert.equal(ctr.billingPeriod,'UNICO');assert.equal(ctr.scopeText,accepted.scopeText);assert.equal(ctr.paymentTerms,accepted.paymentTerms);assert.equal(ctr.deliveryTimeline,accepted.deliveryTimeline);assert.equal(ctr.proposalVersion,1);assert.equal(ctr.startDate,'');assert.equal(ctr.renewalDate,'');
 assert.throws(()=>d.contractFromAcceptedProposal({...accepted,acceptance:{...accepted.acceptance,version:2}},now));
});
test('exportação é individual, escapa HTML/Markdown, separa setup e recorrência e bloqueia vencida',()=>{
 const p=d.approveProposalInternally({...complete(),clientName:'<script>alert(1)</script>',scopeText:'[x](javascript:alert(1)) <img src=x onerror=alert(1)>'},now);
 const html=d.exportProposalHTML(p,now);assert.doesNotMatch(html,/<script>|<img|javascript:/i);assert.match(html,/&lt;script&gt;/);assert.match(html,/Setup/);assert.match(html,/Recorrência/);
 assert.doesNotMatch(d.exportProposalMarkdown(p,now),/\[x\]\(javascript:/);
 assert.throws(()=>d.exportProposalMarkdown({...p,validUntil:'2026-01-01'},now));
});
test('histórico é aguardado antes do documento e falhas não confirmam salvamento',async()=>{
 const p=complete();const events=[];
 await d.persistProposalVersion(p,[],[],async v=>events.push(['history',v]),async v=>events.push(['proposal',v]),'criação',now);
 assert.equal(events[0][0],'history');assert.deepEqual(events[0][1][0].snapshot,p);assert.equal(events[1][0],'proposal');
 let saved=false;await assert.rejects(d.persistProposalVersion(p,[],[],async()=>{throw new Error('offline')},async()=>{saved=true},'criação',now));assert.equal(saved,false);
});
test('link do Pipeline seleciona lead/oportunidade por IDs e rejeita vínculo divergente',()=>{
 const leads=[{id:'lead-1',companyId:'company-1'}];const opportunities=[{id:'opp-1',leadId:'lead-1',companyId:'company-1'}];
 assert.deepEqual(d.resolveProposalContext(leads,opportunities,'?leadId=lead-1&opportunityId=opp-1'),{leadId:'lead-1',opportunityId:'opp-1'});
 assert.throws(()=>d.resolveProposalContext(leads,[{id:'opp-2',leadId:'other',companyId:'company-1'}],'?leadId=lead-1&opportunityId=opp-2'));
 assert.throws(()=>d.resolveProposalContext(leads,opportunities,'?leadId=missing&opportunityId=opp-1'));
 assert.deepEqual(d.resolveProposalContext(leads,opportunities,''),{leadId:'',opportunityId:''});
});
module.exports={load,input,now};
