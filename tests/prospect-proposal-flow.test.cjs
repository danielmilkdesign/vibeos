const test=require('node:test');
const assert=require('node:assert/strict');
const {load}=require('./security-loader.cjs');

test('salvar prospecção retorna vínculos confirmados para gerar proposta no mesmo CRM',async()=>{
  const {saveProspects}=load('lib/prospect-client.ts');
  const result=await saveProspects([{id:'origem',name:'Empresa sintética'}],async()=>Response.json({success:true,persisted:true,lead:{id:'lead-db',companyId:'empresa-db',nomeEmpresa:'Empresa sintética'},opportunity:{id:'opp-db'}}));
  assert.deepEqual(result.records,[{sourceId:'origem',lead:{id:'lead-db',companyId:'empresa-db',nomeEmpresa:'Empresa sintética'},opportunityId:'opp-db'}]);
});

test('lote usa IDs do banco e não duplica nem sobrescreve propostas existentes',()=>{
  const g=load('lib/gerador-propostas.ts');
  assert.equal(typeof g.buildProspectDraftBatch,'function');
  const record={sourceId:'src',lead:{id:'l',companyId:'c',nomeEmpresa:'Empresa sintética'},opportunityId:'o'};
  const existing=g.gerarRascunhosParaLead(record.lead,{opportunityId:'o',serviceType:'LANDING_PAGE'})[0];
  existing.scopeText='Escopo editado manualmente';
  const batch=g.buildProspectDraftBatch([record,record],[existing]);
  assert.equal(batch.created.length,4);
  assert.equal(batch.proposals.length,5);
  assert.equal(batch.proposals.find(p=>p.id===existing.id).scopeText,'Escopo editado manualmente');
  assert.ok(batch.created.every(p=>p.leadId==='l'&&p.companyId==='c'&&p.opportunityId==='o'));
  assert.equal(g.buildProspectDraftBatch([record],batch.proposals).created.length,0);
});

test('catálogo inclui identidade visual sem confundir conceito com marca verificada',()=>{
  const g=load('lib/gerador-propostas.ts');
  assert.ok(g.TIPOS_SERVICO.includes('IDENTIDADE_VISUAL'));
  const [p]=g.gerarRascunhosParaLead({id:'l',nomeEmpresa:'Empresa sintética'},{serviceType:'IDENTIDADE_VISUAL'});
  assert.equal(p.serviceType,'IDENTIDADE_VISUAL');
  assert.equal(p.pricingStatus,'PENDENTE');
});
