const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const pages=['clientes','tarefas','entregas','agenda','empresas','empresas/[id]','projetos','projetos/[id]','conformidade','configuracoes'];
function render(page,{collections={},states={},save=async()=>{},loading=false,error=null,role='OPERACOES'}={}) {
 let i=0; const writes=[]; const keys=[];
 const react={useState(init){const n=i++;return [Object.hasOwn(states,n)?states[n]:typeof init==='function'?init():init,v=>writes.push([n,v])]},useEffect(){},useMemo:f=>f(),Suspense:'suspense'};
 react.default=react;
 const jsx=(type,props)=>typeof type==='function'?type(props):({type,props:props||{}});
 const requireModule=(name)=>{
  if(name==='react')return react;
  if(name==='react/jsx-runtime')return {jsx,jsxs:jsx};
  if(name==='next/navigation')return {usePathname:()=>'/empresas',useParams:()=>({id:'p'}),useSearchParams:()=>new URLSearchParams('search=Alpha'),useRouter:()=>({})};
  if(name==='next/link')return {default:'a'};
  if(name==='lucide-react')return new Proxy({}, {get:(_,key)=>key});
  if(name.includes('crm-client'))return {useCrmCollection:(key,defaults)=>{keys.push(key);return [collections[key]||defaults,save,{loading,error}]}};
  if(name.includes('auth-context'))return {useAuth:()=>({user:{id:'u',name:'Operadora',role}})};
  if(name.includes('lead-normalization'))return {normalizePhone:v=>v?String(v).replace(/\D/g,''):null};
  if(name.includes('crm-store'))throw Error('Leitura local legada proibida: '+name);
  if(name.includes('crm-initial-data'))return {};
  if(name.startsWith('.'))return load(path.resolve('D:/vibe-os/app/'+page,name));
  return require(name);
 };
 function load(filename){if(!path.extname(filename))filename+='.ts';const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;new Function('exports','require','module',code)(m.exports,requireModule,m);return m.exports;}
 const tree=load(path.resolve('D:/vibe-os/app/'+page+'/page.tsx')).default();
 function all(node){if(!node||typeof node!=='object')return [];return [node,...[node.props?.children].flat(Infinity).flatMap(x=>all(x))]}
 return {tree,nodes:all(tree),keys,writes};
}
module.exports={render};
test('projeto vincula empresa/contrato por ID e nunca usa telefone fixo',async()=>{
 let saved;
 const r=render('projetos',{collections:{vibe_companies:[{id:'co',name:'Alpha',nicho:'ODONTOLOGIA'}],vibe_contracts:[{id:'ct',companyId:'co'}]},states:{3:true,4:'Alpha',8:'co',9:'ct'},save:async next=>{saved=next}});
 await r.nodes.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
 assert.equal(saved[0].companyId,'co');assert.equal(saved[0].contractId,'ct');assert.equal(saved[0].nicho,'ODONTOLOGIA');assert.equal(saved[0].dataPrevisao,'');
 assert.ok(!JSON.stringify(r.tree).includes('5592992027059'));
});
test('detalhe exibe apenas entregas vinculadas por ID, sem escopo inventado',()=>{
 const r=render('projetos/[id]',{collections:{vibe_projects:[{id:'p',nomeEmpresa:'Alpha',valorTotal:0,valorSinal:0,tasks:[]}],vibe_deliverables:[{id:'d',projectId:'p',title:'Entrega contratada real'},{id:'x',projectId:'outro',title:'Entrega alheia'}]},states:{2:'SLA'}});
 const text=JSON.stringify(r.tree);
 assert.ok(text.includes('Entrega contratada real'));assert.ok(!text.includes('Entrega alheia'));assert.ok(!text.includes('Setup de Rastreamento'));
});
test('busca global da URL filtra empresas sem depender de digitação',()=>{
 const r=render('empresas',{collections:{vibe_companies:[{id:'a',name:'Alpha',city:'',nicho:'OUTROS'},{id:'b',name:'Beta',city:'',nicho:'OUTROS'}]}});
 const links=r.nodes.filter(n=>n.props?.href?.startsWith('/empresas/')).map(n=>n.props.href);
 assert.ok(links.includes('/empresas/a'));assert.ok(!links.includes('/empresas/b'));
});
test('ofertas editáveis são sugestões persistidas e erro não fecha editor',async()=>{
 const offer={id:'o',title:'Site',setupValue:123,recurringValue:45,billingPeriod:'MENSAL'};
 let saved;
 const r=render('configuracoes',{states:{0:offer},role:'FINANCEIRO',save:async next=>{saved=next}});
 const form=r.nodes.find(n=>n.type==='form');assert.ok(form,'Editor da oferta precisa existir');
 await form.props.onSubmit({preventDefault(){}});assert.equal(saved[0].setupValue,123);
 const rejected=render('configuracoes',{states:{0:offer},role:'FINANCEIRO',save:async()=>{throw Error('Offline')}});
 await rejected.nodes.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
 assert.ok(rejected.writes.some(([n,v])=>v==='Offline'));assert.ok(!rejected.writes.some(([n,v])=>n===0&&v===null));
});
test('entrega cria vínculo real e altera status/link sem fingir upload',async()=>{
 let saved;
 const item={id:'d',companyId:'co',projectId:'p',contractId:'ct',title:'Landing',type:'LANDING_PAGE',cycleMonth:'2026-12',dueDate:'2026-12-01',status:'PLANEJADA',companyName:'Alpha',assignedTo:'Operadora',fileUrl:'https://example.org/arte',createdAt:'2026-10-30'};
 const collections={vibe_projects:[{id:'p',companyId:'co',nomeEmpresa:'Alpha'}],vibe_companies:[{id:'co',name:'Alpha'}],vibe_contracts:[{id:'ct',companyId:'co'}]};
 const r=render('entregas',{collections,states:{3:item},save:async next=>{saved=next}});
 const form=r.nodes.find(n=>n.type==='form');assert.ok(form,'Nova entrega precisa de formulário');
 await form.props.onSubmit({preventDefault(){}});
 assert.equal(saved[0].projectId,'p');assert.equal(saved[0].contractId,'ct');assert.equal(saved[0].companyId,'co');assert.equal(saved[0].fileUrl,'https://example.org/arte');
 const invalid=render('entregas',{collections,states:{3:{...item,fileUrl:'javascript:alert(1)'}},save:async()=>assert.fail('URL inválida não deve salvar')});
 await invalid.nodes.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
 assert.ok(invalid.writes.some(([n,v])=>typeof v==='string'&&v.includes('URL')));
});
test('Nova tarefa oferece criação vinculada e persiste nas mesmas project.tasks',async()=>{
 let saved;
 const p={id:'p',status:'CONCLUIDO',nomeEmpresa:'Alpha',projectType:'Site',tasks:[{id:'old',title:'Primeira',dueDate:'',completed:true}]};
 const r=render('tarefas',{collections:{vibe_projects:[p]},states:{5:true,6:'p',7:'Preparar entrega'},save:async next=>{saved=next}});
 const form=r.nodes.find(n=>n.type==='form');assert.ok(form,'Nova Tarefa deve ter formulário funcional');
 await form.props.onSubmit({preventDefault(){}});
 assert.equal(saved[0].tasks.length,2);assert.equal(saved[0].status,'EM_PRODUCAO');assert.equal(saved[0].tasks[1].title,'Preparar entrega');
});
test('agenda não cria link fictício e mantém vínculo/autor do diagnóstico',async()=>{
 let saved;
 const collections={vibe_companies:[{id:'co',name:'Alpha'}],vibe_opps:[{id:'op',companyId:'co',companyName:'Alpha'}]};
 const r=render('agenda',{collections,states:{3:true,5:'Alpha',8:'2026-12-01',9:'14:00',14:'co',15:'op'},save:async next=>{saved=next}});
 await r.nodes.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
 assert.equal(saved[0].meetingUrl,'');assert.equal(saved[0].assignedTo,'Operadora');assert.equal(saved[0].companyId,'co');assert.equal(saved[0].opportunityId,'op');
 const meeting=saved[0];
 const diag=render('agenda',{collections:{...collections,vibe_meetings:[meeting]},states:{2:meeting,4:true,10:'Lacuna observada',12:'Revisar proposta'},save:async next=>{saved=next}});
 await diag.nodes.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
 assert.equal(saved[0].opportunityId,'op');assert.equal(saved[0].companyId,'co');assert.equal(saved[0].mainBottleneck,'Lacuna observada');assert.equal(saved[0].diagnosticAuthorId,'u');
});
test('auditoria inicia pendente e aprovação exige evidência e autor/data',async()=>{
 let saved;
 const r=render('conformidade',{states:{2:true,3:'Projeto real'},save:async next=>{saved=next}});
 await r.nodes.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
 assert.ok(saved);assert.ok(['identityVerified','socialProofReviewed','claimsVerified','sensitiveDataProtected','internalApproved'].every(k=>saved[0][k]===false));
 const item={id:'c',projectName:'Projeto real',nicho:'OUTROS',identityVerified:false,socialProofReviewed:false,claimsVerified:false,sensitiveDataProtected:false,internalApproved:false};
 const approve=render('conformidade',{collections:{vibe_compliance:[item]},states:{6:{c:'Registro CRO consultado, documento fornecido'}},save:async next=>{saved=next}});
 await approve.nodes.find(n=>n.type==='input'&&n.props.type==='checkbox').props.onChange();
 assert.equal(saved[0].reviewerName,'Operadora');assert.ok(saved[0].reviewedAt);assert.equal(saved[0].reviewerId,'u');assert.ok(saved[0].evidence.length);
});
test('detalhe adiciona tarefa na fonte de projeto e recalcula status sem conclusão antecipada',async()=>{
 let saved;
 const project={id:'p',nomeEmpresa:'Alpha',status:'CONCLUIDO',riskLevel:'NORMAL',progress:100,valorTotal:0,valorSinal:0,tasks:[{id:'t',completed:true}]};
 const r=render('projetos/[id]',{collections:{vibe_projects:[project]},states:{3:'Nova tarefa'},save:async next=>{saved=next}});
 await r.nodes.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
 assert.equal(saved[0].status,'EM_PRODUCAO'); assert.equal(saved[0].progress,50);
 assert.equal(saved[0].tasks[1].assignedTo,'Operadora');assert.equal(saved[0].tasks[1].dueDate,'');
});
test('projeto inicia sem trabalho/pagamento/conformidade fictícios e reabre por tarefas',async()=>{
 let saved;
 const r=render('projetos',{states:{3:true,4:'Alpha'},save:async next=>{saved=next;}});
 await r.nodes.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
 assert.ok(saved); const p=saved[0];
 assert.equal(p.progress,0);assert.equal(p.checklistNormas,false);assert.equal(p.valorSinal,0);
 assert.ok(p.tasks.every(t=>!t.completed&&t.projectId===p.id));assert.equal(p.ownerName,'Operadora');
});
test('empresa sem contato não inventa telefone/email e só fecha formulário após persistir',async()=>{
 let resolve; let saved;
 const pending=new Promise(r=>resolve=r);
 const r=render('empresas',{states:{3:true,4:'Alpha'},save:async next=>{saved=next;await pending;}});
 const form=r.nodes.find(n=>n.type==='form'); assert.ok(form);
 const submitting=form.props.onSubmit({preventDefault(){}});
 assert.ok(saved); assert.equal(saved[0].whatsapp,''); assert.equal(saved[0].decisorPhone,''); assert.equal(saved[0].decisorEmail,'');
 assert.match(saved[0].id,/^[a-f0-9-]{36}$/);
 assert.ok(!r.writes.some(([n,v])=>n===3&&v===false));
 resolve();await submitting;
 assert.ok(r.writes.some(([n,v])=>n===3&&v===false));
 const rejected=render('empresas',{states:{3:true,4:'Alpha'},save:async()=>{throw Error('Offline')}});
 await rejected.nodes.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
 assert.ok(rejected.writes.some(([n,v])=>v==='Offline'));
 assert.ok(!rejected.writes.some(([n,v])=>n===3&&v===false));
});
for(const page of pages)test(page+' usa coleção persistente e mostra erro de leitura',()=>{
 const r=render(page,{error:'Falha de leitura'});
 assert.ok(r.keys.length>0);
 assert.ok(r.nodes.some(n=>n.props?.role==='alert'),'erro precisa ser visível');
});
