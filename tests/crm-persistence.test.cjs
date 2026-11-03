const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, deps = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  new Function('exports','require','module',code)(module.exports, n => n in deps ? deps[n] : n.startsWith('.') ? load(path.relative(path.join(__dirname,'..'),path.resolve(path.dirname(path.join(__dirname,'..',file)),n))+'.ts',deps) : require(n), module);
  return module.exports;
}
test('servidor rejeita proposta enviada/aprovada sem condições e evidência',()=>{
 const server=load('lib/crm-server.ts',{'./prisma':{default:{}},'./crm-store':store});
 for(const status of ['ENVIADA','APROVADA']) assert.throws(()=>server.validateCollectionWrite('vibe_proposals',{data:[{id:'p',status,setupValue:0,recurringValue:0}],version:0},'COMERCIAL'));
 assert.doesNotThrow(()=>server.validateCollectionWrite('vibe_proposals',{data:[{id:'p',status:'RASCUNHO',setupValue:0,recurringValue:0}],version:0},'COMERCIAL'));
});
const store = load('lib/crm-store.ts');
test('cache só muda depois de confirmação do servidor e não toca localStorage', async () => {
  global.localStorage = {getItem(){throw Error('não ler legado');},setItem(){throw Error('não escrever legado');},removeItem(){throw Error('não apagar legado');}};
  assert.deepEqual(store.getStoredData('vibe_leads', []), []);
  store.replaceCrmCache({vibe_leads:{data:[{id:'a'}],version:2}});
  let release;
  global.fetch = () => new Promise(resolve => {release=resolve;});
  const pending=store.setStoredData('vibe_leads',[{id:'b'}]);
  assert.deepEqual(store.getStoredData('vibe_leads', []), [{id:'a'}]);
  release(new Response(JSON.stringify({key:'vibe_leads',data:[{id:'b'}],version:3}),{status:200}));
  await pending;
  assert.deepEqual(store.getStoredData('vibe_leads', []), [{id:'b'}]);
  global.fetch=async()=>new Response(JSON.stringify({error:'Conflito'}),{status:409});
  await assert.rejects(store.setStoredData('vibe_leads',[]),/Conflito/);
  assert.deepEqual(store.getStoredData('vibe_leads', []), [{id:'b'}]);
});
test('valida coleção, versão, IDs únicos, tamanho e papel no servidor', () => {
  const server=load('lib/crm-server.ts',{'./prisma':{default:{}} ,'./crm-store':store});
  assert.doesNotThrow(()=>server.validateCollectionWrite('vibe_leads',{data:[{id:'a'}],version:0},'COMERCIAL'));
  for (const [key,body,role,status] of [
    ['unknown',{data:[],version:0},'ADMINISTRADOR',400],
    ['vibe_leads',{data:[],version:-1},'COMERCIAL',400],
    ['vibe_leads',{data:[{id:'a'},{id:'a'}],version:0},'COMERCIAL',400],
    ['vibe_leads',{data:[{id:'a',text:'x'.repeat(1048576)}],version:0},'COMERCIAL',413],
    ['vibe_leads',{data:[],version:0},'DESIGN_CONTEUDO',403],
  ]) assert.throws(()=>server.validateCollectionWrite(key,body,role),e=>e.status===status);
});
test('CAS transacional rejeita versão antiga sem sobrescrever', async () => {
  let row={key:'vibe_leads',data:[{id:'original'}],version:4};
  const tx={crmCollection:{findUnique:async()=>structuredClone(row),updateMany:async({where,data})=>{if(row.version!==where.version)return {count:0};row={...row,data:data.data,version:row.version+1};return {count:1};}}};
  const db={$transaction:async fn=>fn(tx)};
  const server=load('lib/crm-server.ts',{'./prisma':{default:db},'./crm-store':store});
  await assert.rejects(server.writeCrmCollection('vibe_leads',{data:[],version:3},'COMERCIAL',db),e=>e.status===409);
  assert.equal(row.version,4);
  assert.deepEqual(row.data,[{id:'original'}]);
  const result=await server.writeCrmCollection('vibe_leads',{data:[{id:'next'}],version:4},'COMERCIAL',db);
  assert.equal(result.version,5);
  assert.deepEqual(row.data,[{id:'next'}]);
});
test('lead normaliza identidade e reenvio não duplica empresa/oportunidade/coleções', async () => {
  let lead=null, company=null, opp=null; const collections=new Map(); let creates=0;
  const tx={
    lead:{findMany:async()=>lead?[lead]:[],create:async({data})=>(creates++,lead={id:'lead-1',...data,createdAt:new Date(),updatedAt:new Date()}),update:async({data})=>(lead={...lead,...data})},
    company:{findUnique:async()=>company,create:async({data})=>(company={id:'company-1',...data,createdAt:new Date()})},
    opportunity:{findUnique:async()=>opp,create:async({data})=>(opp={id:'opp-1',...data,createdAt:new Date(),updatedAt:new Date()})},
    crmCollection:{findUnique:async({where})=>collections.get(where.key)||null,create:async({data})=>(collections.set(data.key,data),data),updateMany:async({where,data})=>{const old=collections.get(where.key);if(old.version!==where.version)return {count:0};collections.set(where.key,{...old,data:data.data,version:old.version+1});return {count:1};}},
  };
  const db={$transaction:async fn=>fn(tx)};
  const server=load('lib/crm-server.ts',{'./prisma':{default:db},'./crm-store':store});
  const body={nomeEmpresa:'Empresa teste',nicho:'Personal trainer',phoneWhatsapp:'(92) 99999-1234',externalId:'external-1'};
  const first=await server.persistLead(body,'COMERCIAL',db);
  const second=await server.persistLead({...body,phoneWhatsapp:'+55 92 99999-1234'},'COMERCIAL',db);
  assert.equal(creates,1);assert.equal(first.persisted,true);assert.equal(second.lead.id,first.lead.id);
  assert.equal(second.opportunity.id,first.opportunity.id);assert.equal(second.company.id,first.company.id);
  assert.equal(lead.nicho,'PERSONAL_TRAINER');assert.equal(lead.normalizedPhone,'+5592999991234');
  for(const key of ['vibe_leads','vibe_companies','vibe_opps'])assert.equal(collections.get(key).data.length,1);
  assert.equal(collections.get('vibe_opps').data[0].companyId,company.id);
  assert.equal(collections.get('vibe_opps').data[0].stage,'QUALIFICADO');
  const webhook=await server.persistLead(body,'ADMINISTRADOR',tx);
  assert.equal(webhook.lead.id,first.lead.id); // Caller may include WebhookEvent in the same outer transaction.
});
test('provider faz gate inicial antes de renderizar consumidores autenticados', () => {
  const React=require('react');const {renderToString}=require('react-dom/server');
  const client=load('lib/crm-client.tsx',{'./auth-context':{useAuth:()=>({user:{id:'u'},loading:false})},'./crm-store':store});
  const html=renderToString(React.createElement(client.CrmSyncProvider,null,React.createElement('div',null,'CONSUMIDOR')));
  assert.doesNotMatch(html,/CONSUMIDOR/);assert.match(html,/Carregando/);
});
test('endpoints CRM et leads refusent session invalide et ne simulent jamais succès DB', async () => {
  const denied=new Response('unauthorized',{status:401});
  for(const file of ['app/api/crm/route.ts','app/api/leads/route.ts']) {
    const prefix=file.includes('/crm/')?'../../../lib/':'../../../lib/';
    const route=load(file,{[prefix+'server-auth']:{requireSession:async()=>denied},[prefix+'crm-server']:{readCrmCollections:async()=>{throw Error('must not query');}}});
    assert.equal((await route.GET(new Request('http://localhost/api/crm'))).status,401);
  }
  const route=load('app/api/leads/route.ts',{'../../../lib/server-auth':{requireSession:async()=>({user:{role:'COMERCIAL'}})},'../../../lib/crm-server':{...load('lib/crm-server.ts',{'./prisma':{default:{}},'./crm-store':store}),readJsonBody:async()=>({nomeEmpresa:'X'}),persistLead:async()=>{throw Error('DB OFFLINE SECRET');}}});
  const response=await route.POST(new Request('http://localhost/api/leads',{method:'POST'}));
  assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/SECRET|persisted|true/);
});
test('refresh ancien ne remplace pas une écriture confirmée plus récente',async()=>{
  store.replaceCrmCache({vibe_leads:{data:[{id:'old'}],version:1}});
  let release;global.fetch=()=>new Promise(r=>{release=r;});
  const refresh=store.refreshCrm();
  global.fetch=async()=>Response.json({key:'vibe_leads',data:[{id:'new'}],version:2});
  await store.setStoredData('vibe_leads',[{id:'new'}]);
  release(Response.json({collections:{vibe_leads:{data:[{id:'old'}],version:1}}}));await refresh;
  assert.deepEqual(store.getStoredData('vibe_leads',[]),[{id:'new'}]);
});
test('migração explícita preserva origem, backup e servidor vence por ID',async()=>{
  const local=new Map([['vibe_leads',JSON.stringify([{id:'shared',name:'local'},{id:'local'}])]]);
  global.window={localStorage:{getItem:k=>local.get(k)??null,setItem:(k,v)=>local.set(k,v)}};
  const original=local.get('vibe_leads');let payload;
  global.fetch=async(url,options)=>{
    if(options.method==='PUT'){payload=JSON.parse(options.body);return Response.json({key:'vibe_leads',data:payload.data,version:5});}
    return Response.json({collections:{vibe_leads:{data:[{id:'shared',name:'server'}],version:4}}});
  };
  const result=await store.migrateLegacyCrm(['vibe_leads']);
  assert.equal(local.get('vibe_leads'),original);assert.ok(local.has(result.backupKey));
  assert.deepEqual(payload.data,[{id:'shared',name:'server'},{id:'local'}]);
  delete global.window;
});
test('schema de campo rejeita etapa desconhecida e valor inválido',()=>{
  const server=load('lib/crm-server.ts',{'./prisma':{default:{}},'./crm-store':store});
  assert.throws(()=>server.validateCollectionWrite('vibe_opps',{data:[{id:'a',stage:'INVENTADA'}],version:0},'COMERCIAL'),e=>e.status===400);
  assert.throws(()=>server.validateCollectionWrite('vibe_opps',{data:[{id:'a',stage:'QUALIFICADO',estimatedValue:-1}],version:0},'COMERCIAL'),e=>e.status===400);
  assert.doesNotThrow(()=>server.validateCollectionWrite('vibe_opps',{data:[{id:'a',stage:'QUALIFICADO',companyId:'c',estimatedValue:0}],version:0},'COMERCIAL'));
});
test('parser exige application/json exato e limita stream sem Content-Length',async()=>{
  const server=load('lib/crm-server.ts',{'./prisma':{default:{}},'./crm-store':store});
  await assert.rejects(server.readJsonBody(new Request('http://localhost',{method:'POST',headers:{'content-type':'application/jsonx'},body:'{}'})),e=>e.status===415);
  await assert.rejects(server.readJsonBody(new Request('http://localhost',{method:'POST',headers:{'content-type':'application/json'},body:'invalid'})),e=>e.status===400);
  await assert.rejects(server.readJsonBody(new Request('http://localhost',{method:'POST',headers:{'content-type':'application/json'},body:'{"big":"large"}'}),5),e=>e.status===413);
  assert.deepEqual(await server.readJsonBody(new Request('http://localhost',{method:'POST',headers:{'content-type':'application/json; charset=utf-8'},body:'{"valid":true}'})),{valid:true});
});
module.exports={load};
