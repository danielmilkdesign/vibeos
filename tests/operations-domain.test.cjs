const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load() {
 const filename = path.join(__dirname, '../lib/operations-domain.ts');
 assert.ok(fs.existsSync(filename), 'domínio operacional necessário');
 const m = {exports:{}};
 const code = ts.transpileModule(fs.readFileSync(filename,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 new Function('exports','require','module',code)(m.exports,require,m);
 return m.exports;
}
test('carteira deriva contratos por ID e normaliza MRR sem misturar homônimos',()=>{
 const d=load();
 const companies=[{id:'a',name:'Alpha',nicho:'OUTROS',isClient:false},{id:'b',name:'Alpha Centro',isClient:false}];
 const contracts=[{id:'c',companyId:'a',status:'ATIVO',recurringValue:1200,billingPeriod:'ANUAL',offerName:'Site',renewalDate:'2027-01-01'},{id:'d',companyId:'b',status:'RASCUNHO',recurringValue:999,billingPeriod:'MENSAL'}];
 const result=d.deriveClients(companies,contracts,[]);
 assert.equal(result.length,1); assert.equal(result[0].id,'a'); assert.equal(result[0].mrr,100);
 assert.equal(result[0].whatsapp,''); assert.equal(result[0].saude,'DESCONHECIDA');
 assert.equal(d.companyRelations([{companyId:'b',companyName:'Alpha'}],'a').length,0);
});
test('tarefas concluídas fecham projeto e desmarcar/adicionar reabre sem alterar outros projetos',()=>{
 const d=load();
 const p={id:'p',status:'CONCLUIDO',progress:100,tasks:[{id:'t',completed:true,status:'CONCLUIDA'}]};
 const reopened=d.toggleProjectTask([p,{id:'other',tasks:[]}],'p','t');
 assert.equal(reopened[0].status,'EM_PRODUCAO');
 assert.equal(reopened[0].progress,0);
 assert.equal(reopened[0].tasks[0].status,'A_FAZER');
 assert.equal(p.tasks[0].completed,true);
 assert.equal(d.reconcileProject({...p,tasks:[...p.tasks,{id:'new',completed:false}]}).progress,50);
 assert.equal(d.reconcileProject({...p,tasks:[]}).progress,0);
 assert.equal(d.reconcileProject({...p,tasks:[]}).status,'EM_PRODUCAO');
 assert.equal(d.toggleProjectTask(reopened,'p','t')[0].status,'CONCLUIDO');
});
