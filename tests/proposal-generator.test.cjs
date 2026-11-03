const test=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');
const cache={};function load(name){if(cache[name])return cache[name];const mod={exports:{}};const file=path.join(__dirname,'../lib',name+'.ts');const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;new Function('exports','require','module',code)(mod.exports,id=>id.startsWith('./')?load(id.slice(2)):require(id),mod);return cache[name]=mod.exports;}
const g=load('gerador-propostas');
const lead={id:'l-1',companyId:'c-1',nomeEmpresa:'Cliente sintético',phoneWhatsapp:'5592992027059',urgencia:'MEDIA'};
test('catálogo único gera cinco rascunhos por lead incluindo identidade sem preço ou diagnóstico inventado',()=>{
 assert.equal(g.TIPOS_SERVICO.length,5);
 const drafts=g.gerarRascunhosParaLead(lead,{opportunityId:'o-1'});
 assert.equal(drafts.length,5);assert.equal(new Set(drafts.map(p=>p.id)).size,5);
 for(const p of drafts){assert.equal(p.status,'RASCUNHO');assert.equal(p.companyId,'c-1');assert.equal(p.opportunityId,'o-1');assert.equal(p.leadId,'l-1');assert.equal(p.pricingStatus,'PENDENTE');assert.equal(p.confirmedTerms,false);assert.equal(p.internalApprovedAt,undefined);assert.equal(p.deliveryTimeline,'');assert.ok(p.leadAnalysis);}
 assert.throws(()=>g.gerarTextoWhatsApp(drafts),/cliente|individual/i);
 assert.throws(()=>g.gerarPreviewHTML([drafts[0]]),/pend|confirm|aprova/i);
});
test('totais nunca somam setup e recorrência nem confundem períodos',()=>{
 const totals=g.calcularTotais([{setupValue:100,recurringValue:10,billingPeriod:'MENSAL'},{setupValue:50,recurringValue:30,billingPeriod:'ANUAL'},{setupValue:0,recurringValue:0,billingPeriod:'UNICO'}]);
 assert.equal(totals.setup,150);assert.equal(totals.recorrencia.MENSAL,10);assert.equal(totals.recorrencia.ANUAL,30);assert.equal(totals.total,undefined);
});
