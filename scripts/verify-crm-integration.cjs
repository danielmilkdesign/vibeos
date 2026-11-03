'use strict';
// Explicit integration test. Creates and drops ONLY a uniquely named PostgreSQL schema.
// Never prints credentials or cookies. Run after npm run build.
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');const assert=require('node:assert/strict');const {spawnSync,spawn}=require('node:child_process');
async function main(){
 if(!process.argv.includes('--isolated-db'))throw Error('Confirme teste isolado com --isolated-db.');
 const root=path.resolve(__dirname,'..');require('@next/env').loadEnvConfig(root);
 if(!process.env.DATABASE_URL)throw Error('DATABASE_URL não configurada.');
 const schema='vibe_verify_'+crypto.randomBytes(8).toString('hex');
 const baseUrl=new URL(process.env.DATABASE_URL);baseUrl.searchParams.set('schema',schema);
 // A disposable schema on a remote database may need a cold connection.
 if(!baseUrl.searchParams.has('connect_timeout'))baseUrl.searchParams.set('connect_timeout','30');
 const url=baseUrl.toString();const env={...process.env,DATABASE_URL:url,NEXTAUTH_SECRET:crypto.randomBytes(48).toString('hex'),LEAD_WEBHOOK_SECRET:crypto.randomBytes(48).toString('hex'),NODE_ENV:'production'};
 const {PrismaClient}=require('@prisma/client');const db=new PrismaClient({datasourceUrl:url});
 let child;let stderr='';const checks=[];const port=3212;const origin=`http://localhost:${port}`;
 try{
  const push=spawnSync(process.execPath,[path.join(root,'node_modules/prisma/build/index.js'),'db','push','--skip-generate'],{cwd:root,env,encoding:'utf8',timeout:120000});
  if(push.status!==0)throw Error('Falha ao preparar schema isolado (nenhuma saída sensível publicada).');
  checks.push('schema isolado criado');
  const password=crypto.randomBytes(24).toString('base64url');const email=`qa-${schema}@example.invalid`;
  const {passwordHash}=require('./provision-user.cjs');
  await db.user.create({data:{name:'Teste sintético',email,password:await passwordHash(password),role:'ADMINISTRADOR',active:true}});
  child=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'start','-H','127.0.0.1','-p',String(port)],{cwd:root,env,stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',()=>{});child.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString()).slice(-4000);});
  let ready=false;for(let n=0;n<80;n++){if(child.exitCode!==null)throw Error('Servidor isolado encerrou.');try{const r=await fetch(origin+'/login');if(r.status===200){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}
  assert.ok(ready,'servidor isolado deve iniciar');
  let cookie='';
  const request=(route,method='GET',body)=>fetch(origin+route,{method,redirect:'manual',headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
  assert.equal((await request('/api/crm')).status,401);checks.push('API sem sessão negada');
  cookie='vibe_auth_token=arbitrario';assert.equal((await request('/api/crm')).status,401);cookie='';checks.push('cookie arbitrário negado');
  assert.equal((await request('/api/auth/login','POST',{email,password:'incorreta'})).status,401);
  const login=await request('/api/auth/login','POST',{email,password});assert.equal(login.status,200);const setCookie=login.headers.get('set-cookie');assert.match(setCookie,/HttpOnly/);assert.match(setCookie,/Secure/);cookie=setCookie.split(';')[0];checks.push('login real e cookie seguro');
  assert.equal((await request('/api/auth/me')).status,200);
  const form=new FormData();form.set('file',new File(['Nome da Empresa;Categoria;Telefone / WhatsApp;Website\nEmpresa Sintetica;Personal trainer;+55 41 99999-0000;https://example.invalid\n'],'leads.csv',{type:'text/csv'}));
  const previewResponse=await fetch(origin+'/api/leads/import',{method:'POST',headers:{Cookie:cookie,Origin:origin},body:form});assert.equal(previewResponse.status,200);const preview=await previewResponse.json();assert.equal(preview.preview,true);assert.equal(preview.persisted,false);assert.equal(preview.leads[0].nome,'Empresa Sintetica');checks.push('CSV real preserva nome e retorna prévia');
  const payload={externalId:'sintetico-origem',nomeEmpresa:'Empresa Sintetica',nicho:'Personal trainer',phoneWhatsapp:'+55 41 99999-0000',website:'https://example.invalid',analysis:{facts:['URL informada'],pending:['Verificar titularidade']}};
  const savedResponse=await request('/api/leads','POST',payload);assert.equal(savedResponse.status,201);const saved=await savedResponse.json();assert.equal(saved.persisted,true);assert.ok(saved.lead.id&&saved.company.id&&saved.opportunity.id);assert.equal(saved.lead.nicho,'PERSONAL_TRAINER');
  const again=await request('/api/leads','POST',payload);assert.equal(again.status,201);const duplicate=await again.json();assert.equal(duplicate.opportunity.id,saved.opportunity.id);assert.equal(await db.lead.count(),1);assert.equal(await db.company.count(),1);assert.equal(await db.opportunity.count(),1);checks.push('lead/empresa/oportunidade reais e reenvio idempotente');
  const snapshot=await (await request('/api/crm')).json();const opps=snapshot.collections.vibe_opps;assert.equal(opps.data.length,1);assert.equal(opps.data[0].id,saved.opportunity.id);assert.equal(opps.data[0].stage,'QUALIFICADO');checks.push('Pipeline lê oportunidade persistida');
  const stale=await request('/api/crm/vibe_opps','PUT',{data:[],version:opps.version-1});assert.equal(stale.status,409);assert.equal((await (await request('/api/crm')).json()).collections.vibe_opps.data.length,1);checks.push('conflito de versão não apaga dados');
  // Compiles the real pure domain and generator; no network stubs.
  const ts=require('typescript');const oldExt=require.extensions['.ts'];require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,filename);
  try{
   const generator=require('../lib/gerador-propostas.ts');const domain=require('../lib/proposal-domain.ts');
   const now=new Date().toISOString();const drafts=generator.gerarRascunhosParaLead(saved.lead,{opportunityId:saved.opportunity.id,now});assert.equal(drafts.length,5);assert.ok(drafts.every(p=>p.status==='RASCUNHO'&&!p.confirmedTerms));assert.throws(()=>domain.exportProposalHTML(drafts[0]));
   let proposal=domain.editProposal(drafts[0],{setupValue:1200,recurringValue:0,billingPeriod:'UNICO',validUntil:new Date(Date.now()+14*86400000).toISOString().slice(0,10),paymentTerms:'Pagamento único confirmado',scopeText:'Site institucional conforme briefing sintético',deliveryTimeline:'15 dias após briefing',exclusions:'Sem mídia paga; uma revisão',acceptanceCriteria:'Escopo revisado',responsibilities:'Cliente fornece conteúdo',thirdPartyCosts:'Sem custos adicionais neste teste'},now);
   proposal.confirmedTerms=true;proposal.pricingStatus='CONFIRMADO';proposal=domain.approveProposalInternally(proposal,now);proposal=domain.recordProposalSent(proposal,'Registro sintético de envio, sem mensagem externa',now);proposal=domain.acceptProposal(proposal,{evidence:'Aceite sintético de teste',version:proposal.version,acceptedAt:now},now);
   const contract=domain.contractFromAcceptedProposal(proposal,now);assert.equal(contract.status,'RASCUNHO');assert.equal(contract.setupValue,1200);assert.equal(contract.billingPeriod,'UNICO');
   assert.equal((await request('/api/crm/vibe_proposals','PUT',{data:[proposal,...drafts.slice(1)],version:snapshot.collections.vibe_proposals.version})).status,200);
   assert.equal((await request('/api/crm/vibe_contracts','PUT',{data:[contract],version:snapshot.collections.vibe_contracts.version})).status,200);
   const reloaded=await (await request('/api/crm')).json();assert.equal(reloaded.collections.vibe_proposals.data.length,5);assert.equal(reloaded.collections.vibe_contracts.data[0].proposalId,proposal.id);checks.push('5 rascunhos, bloqueio de exportação, aprovação/envio/aceite e contrato persistidos');
  }finally{if(oldExt)require.extensions['.ts']=oldExt;else delete require.extensions['.ts'];}
  const raw=JSON.stringify({company:'Webhook sintético',phone:'+55 41 98888-1111'});const stamp=String(Math.floor(Date.now()/1000));const webhookId='qa-event-'+schema;const sig=crypto.createHmac('sha256',env.LEAD_WEBHOOK_SECRET).update(stamp+'.'+webhookId+'.'+raw).digest('hex');const webhook=()=>fetch(origin+'/api/webhook/lead',{method:'POST',headers:{'x-webhook-id':webhookId,'x-webhook-timestamp':stamp,'x-webhook-signature':'sha256='+sig},body:raw});assert.equal((await webhook()).status,201);assert.equal((await webhook()).status,200);assert.equal(await db.lead.count(),2);assert.equal((await (await request('/api/crm')).json()).collections.vibe_opps.data.length,2);checks.push('webhook assinado alimenta Pipeline sem duplicar');
  const other=await db.user.create({data:{name:'Perfil teste',email:'design-'+email,password:await passwordHash(password),role:'DESIGN_CONTEUDO',active:true}});const loginOther=await request('/api/auth/login','POST',{email:other.email,password});assert.equal(loginOther.status,200);const adminCookie=cookie;cookie=loginOther.headers.get('set-cookie').split(';')[0];assert.equal((await request('/api/leads','POST',payload)).status,403);cookie=adminCookie;checks.push('papel não comercial não grava leads');
  if(process.argv.includes('--browser')) {
   if(!process.env.QA_ARTIFACT_DIR)throw Error('Configure QA_ARTIFACT_DIR fora do repositório.');
   const browserResult=await require('./verify-prospect-browser.cjs')({origin,cookie,artifactDir:process.env.QA_ARTIFACT_DIR});
   checks.push(...browserResult.checks);
  }
  assert.equal((await request('/api/auth/logout','POST',{})).status,200);assert.equal((await request('/api/crm')).status,401);checks.push('logout revoga sessão no banco');
  console.log(JSON.stringify({passed:true,checks,schema,productionDataTouched:false},null,2));
 }finally{
  console.log(JSON.stringify({completedChecks:checks}));
  if(child&&child.exitCode===null){child.kill();await new Promise(r=>{child.once('exit',r);setTimeout(r,5000);});}
  try{if(!/^vibe_verify_[a-f0-9]{16}$/.test(schema))throw Error('Schema de limpeza inválido');await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);console.log('Schema sintético removido.');}finally{await db.$disconnect();}
 }
}
main().catch(error=>{console.error(JSON.stringify({passed:false,error:error instanceof assert.AssertionError?error.message:String(error.message),secretsPrinted:false}));process.exitCode=1;});
