const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./security-loader.cjs');
function prepare(){
 assert.ok(fs.existsSync(path.join(__dirname,'../lib/prospect-proposals.ts')),'orquestração de propostas deve existir');
 return load('lib/prospect-proposals.ts').prepareProspectProposals;
}
function harness(){
 let proposals=[];let reads=0;let writes=0;
 const deps={
  save:async inputs=>({savedIds:inputs.map(l=>l.id),failures:[],records:inputs.map(l=>({sourceId:l.id,lead:{id:'db-'+l.id,nomeEmpresa:l.name,companyId:'c-'+l.id},opportunityId:'opp-'+l.id}))}),
  read:async()=>{reads++;return proposals;},
  write:async next=>{writes++;proposals=next;},
 };
 return {deps,stats:()=>({proposals,reads,writes})};
}
test('preparação persiste propostas ligadas ao lead do CRM e reexecução não duplica',async()=>{
 const h=harness();const run=prepare();
 const first=await run([{id:'a',name:'Empresa sintética'}],h.deps);
 assert.equal(first.prepared.length,1);assert.equal(first.failures.length,0);
 assert.equal(first.prepared[0].proposals.length,5);
 assert.ok(first.prepared[0].proposals.every(p=>p.leadId==='db-a'&&p.opportunityId==='opp-a'&&p.status==='RASCUNHO'));
 const second=await run([{id:'a',name:'Empresa sintética'}],h.deps);
 assert.equal(second.createdCount,0);assert.equal(h.stats().proposals.length,5);assert.equal(h.stats().writes,1);
 assert.equal(h.stats().reads,3,'consulta antes de escrever e confirma após gravar');
});
test('falha parcial informa contato e permite continuar sem falso sucesso',async()=>{
 const h=harness();let n=0;const save=h.deps.save;
 h.deps.save=async inputs=> ++n===1?{savedIds:[],failures:[{id:'a',message:'Não gravado'}],records:[]}:save(inputs);
 const result=await prepare()([{id:'a',name:'Falha'},{id:'b',name:'Sucesso'}],h.deps);
 assert.deepEqual(result.savedIds,['b']);assert.equal(result.failures[0].id,'a');assert.equal(result.prepared[0].sourceId,'b');
});
test('falha ao persistir propostas preserva indicação de lead salvo mas não afirma preparo',async()=>{
 const h=harness();h.deps.write=async()=>{throw new Error('Conflito de versão');};
 const result=await prepare()([{id:'a',name:'Empresa'}],h.deps);
 assert.deepEqual(result.savedIds,['a']);assert.equal(result.prepared.length,0);assert.match(result.failures[0].message,/Conflito/);
});
test('servidor deve devolver propostas gravadas antes de confirmar preparo',async()=>{
 const h=harness();h.deps.write=async()=>{};
 const result=await prepare()([{id:'a',name:'Empresa'}],h.deps);
 assert.equal(result.prepared.length,0);assert.match(result.failures[0].message,/confirm/);
});
