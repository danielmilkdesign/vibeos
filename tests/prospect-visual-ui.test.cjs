const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');
function render(relative,props={}) {
 const cache={};
 function load(file){if(cache[file])return cache[file];const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 new Function('exports','require','module',code)(m.exports,id=>{if(id.startsWith('.')){const base=path.resolve(path.dirname(file),id);return load(fs.existsSync(base+'.ts')?base+'.ts':base+'.tsx');}return require(id);},m);return cache[file]=m.exports;}
 return require('react-dom/server').renderToStaticMarkup(require('react').createElement(load(path.join(__dirname,'..',relative)).default,props));
}
test('prospecção preserva upload e oferece preparação em lote para seleção',()=>{
 const html=render('app/prospeccao/page.tsx');
 assert.match(html,/type="file"/);assert.match(html,/\.csv/);
 assert.match(html,/Preparar propostas/);
});
test('prévia visual informa conceito e não oferece envio de rascunho sem aprovação',()=>{
 const file='components/CRM/ProposalAssets.tsx';
 assert.ok(fs.existsSync(path.join(__dirname,'..',file)),'componente de imagens necessário');
 const html=render(file,{proposal:{id:'p',clientName:'Empresa sintética',serviceType:'SITE_INSTITUCIONAL',offerTitle:'Site',scopeText:'Site de apresentação',status:'RASCUNHO'},canExport:false});
 assert.match(html,/data:image\/svg\+xml/);assert.match(html,/conceito/i);assert.match(html,/Baixar PNG/);
 assert.match(html,/disabled/);assert.doesNotMatch(html,/wa.me/);
});
