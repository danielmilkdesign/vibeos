const test = require('node:test');
const assert = require('node:assert/strict');
const {load} = require('./lead-normalization.test.cjs');
const next = {NextResponse:{json:(data,options)=>Response.json(data,options)}};
function route(auth = async()=>({user:{id:'synthetic'}})) {
 return load('app/api/leads/import/route.ts', {'next/server':next, '../../../../lib/server-auth':{requireSession:auth}});
}
function upload(content, name='synthetic.csv') {
 const form = new FormData(); form.set('file',new File([content],name));
 return new Request('https://test.invalid/api/leads/import',{method:'POST',body:form});
}
module.exports = {route,upload};
test('bounds streamed multipart bodies without trusting content-length or parsing oversized requests',async()=>{
 let pulled=0; let cancelled=false; let parsed=false;
 const body=new ReadableStream({pull(controller){pulled++;controller.enqueue(new Uint8Array(1024*1024));},cancel(){cancelled=true;}});
 const request=new Request('https://test.invalid',{method:'POST',body,duplex:'half',headers:{'content-type':'multipart/form-data; boundary=synthetic'}});
 request.formData=async()=>{parsed=true;throw new Error('oversized input should not be parsed');};
 const response=await route().POST(request);
 assert.equal(response.status,413); assert.equal(parsed,false); assert.equal(cancelled,true); assert.ok(pulled<=8);
});
test('supports CSV comma/tab quoted separators and synthetic Excel/JSON roundtrip',async()=>{
 const XLSX=require('xlsx');
 for(const separator of [',','\t']) {
  const response=await route().POST(upload(`"Company Name"${separator}"Telefone / WhatsApp"\n"Synthetic, semi; tab\t quoted"${separator}"+55 92 99999-0000"`));
  assert.equal(response.status,200); const data=await response.json(); assert.equal(data.leads[0].nome,'Synthetic, semi; tab\t quoted');
 }
 const rows=[{'Company Name':'Synthetic Excel','Telefone / WhatsApp':'+55 92 99999-0000','Qtde Avaliações':23}];
 for(const bookType of ['xls','xlsx']) {
  const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(rows),'Synthetic');
  const response=await route().POST(upload(XLSX.write(book,{type:'buffer',bookType}),`synthetic.${bookType}`));
  assert.equal(response.status,200); const excel=await response.json();
  assert.equal(excel.leads[0].nome,'Synthetic Excel'); assert.equal(excel.leads[0].rating_count,23);
  const json=await route().POST(upload(JSON.stringify({leads:excel.leads}),'synthetic.json'));
  assert.deepEqual((await json.json()).leads,excel.leads);
 }
});
test('rejects missing files/names, malformed content, oversized files/rows and fails auth before parsing',async()=>{
 const denied=route(async()=>Response.json({error:'Unauthorized'},{status:401}));
 const blocked={formData(){throw new Error('must not parse');}};
 assert.equal((await denied.POST(blocked)).status,401);
 for(const [content,name,status] of [['synthetic-sensitive-secret {','synthetic.json',400],['telefone\n92999990000','synthetic.csv',400],['nome\n"synthetic-sensitive-secret','synthetic.csv',400],['x','synthetic.exe',400],['x'.repeat(5*1024*1024+1),'synthetic.csv',413],[JSON.stringify(Array.from({length:5001},(_,i)=>({nome:`Synthetic ${i}`}))),'synthetic.json',413],['nome\n'+Array.from({length:5001},(_,i)=>`Synthetic ${i}`).join('\n'),'synthetic.csv',413]]) {
  const response=await route().POST(upload(content,name)); assert.equal(response.status,status,name);
  const text=await response.text(); assert.equal(text.includes('synthetic-sensitive-secret'),false); assert.equal(text.includes('stack'),false);
 }
 const response=await route().POST(new Request('https://test.invalid',{method:'POST',body:new FormData()}));assert.equal(response.status,400);
});
test('CSV quoted BOM preview deduplicates batch and skips missing name without claiming persistence',async()=>{
 const response = await route().POST(upload('\uFEFFNome da Empresa;Telefone / WhatsApp;Qtde Avaliações\n"Synthetic; One";+55 (92) 99999-0000;10\nDuplicate;(92) 99999-0000;10\n;92988880000;2\nOther;;0'));
 assert.equal(response.status,200);
 const data=await response.json();
 assert.equal(data.preview,true); assert.equal(data.persisted,false);
 assert.equal(data.count,2); assert.equal(data.newCount,2); assert.equal(data.skipped,2);
 assert.equal(data.leads.length,2); assert.equal(data.leads[0].nome,'Synthetic; One');
 assert.equal(data.leads[0].phone_digits,'5592999990000');
 assert.equal(data.leads[1].rating_count,0); assert.ok(data.warnings.length);
 assert.equal(data.leads[0].rawData,undefined);
});
