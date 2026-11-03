const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');
function page(route,collections,state={loading:false,error:null}){const cache={};function load(file){if(cache[file])return cache[file];const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;new Function('exports','require','module',code)(mod.exports,id=>{if(id.endsWith('crm-client'))return {useCrmCollection:(key,fallback)=>[collections[key]??fallback,async()=>{}, state]};if(id.startsWith('.')){const base=path.resolve(path.dirname(file),id);return load(fs.existsSync(base+'.ts')?base+'.ts':base+'.tsx');}return require(id)},mod);return cache[file]=mod.exports;}return require('react-dom/server').renderToStaticMarkup(require('react').createElement(load(path.join(__dirname,'../app',route,'page.tsx')).default));}
test('erro de escrita aparece sem bloquear nova tentativa após carregamento',()=>{
 const html=page('propostas',{}, {loading:false,error:'Falha de gravação'});
 assert.match(html,/role="alert"/);assert.match(html,/Falha de gravação/);
 const createButton=html.match(/<button[^>]*>.*?Nova proposta manual<\/button>/)[0];
 assert.doesNotMatch(createButton,/ disabled=/);
});
test('telas usam coleções persistentes, leads explícitos e não tratam rascunho como enviado',()=>{
 const html=page('propostas',{});assert.match(html,/Lead de origem/);assert.match(html,/Gerar 5 rascunhos/);assert.match(html,/Nenhuma proposta/);
 for(const route of ['propostas','contratos']){const source=fs.readFileSync(path.join(__dirname,'../app',route,'page.tsx'),'utf8');assert.doesNotMatch(source,/getStoredData|setStoredData|INITIAL_PROPOSALS|INITIAL_CONTRACTS/);assert.match(source,/await /);}
 const ctr=page('contratos',{});assert.match(ctr,/proposta aceita/i);assert.doesNotMatch(ctr,/Ativar Contrato/);
});
