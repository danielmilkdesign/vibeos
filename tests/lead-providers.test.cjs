const test=require('node:test');
const assert=require('node:assert/strict');
const {load}=require('./lead-normalization.test.cjs');
const next={NextResponse:{json:(d,o)=>Response.json(d,o)}};
function serper(auth=async()=>({user:{id:'synthetic'}})) {return load('app/api/prospeccao/serper/route.ts',{'next/server':next,'../../../../lib/server-auth':{requireSession:auth}});}
test('Aisa rejects HTTP failures without leaking provider text or treating quotes as measured data',async()=>{
 const original=global.fetch;
 global.fetch=async()=>new Response('synthetic-sensitive-provider-detail',{status:429});
 try {
  const {AisaClient}=load('lib/aisa-client.ts'); const client=new AisaClient({apiKey:'synthetic'});
  const result=await client.searchTool('synthetic');
  assert.equal(result.success,false); assert.equal(JSON.stringify(result).includes('synthetic-sensitive'),false);
  const quotes=await client.enrichLeadData('Synthetic','https://synthetic.example');
  assert.equal(quotes.status,'QUOTE_FAILED'); assert.equal(quotes.metrics,null); assert.equal(quotes.executed,false);
 } finally {global.fetch=original;}
});
const req=(body)=>new Request('https://test.invalid/api/prospeccao/serper',{method:'POST',body:JSON.stringify(body),headers:{'content-type':'application/json'}});
test('Serper requires session before network, normalizes phone and returns only evidence-backed analysis',async()=>{
 const original=global.fetch; const key=process.env.SERPER_API_KEY;
 let calls=0;
 global.fetch=async(url,options)=>{calls++; assert.equal(options.headers['X-API-KEY'],'synthetic-server-key'); return Response.json({places:[{title:'Synthetic Clinic',website:'https://instagram.com/synthetic',phoneNumber:'+55 (92) 99999-0000',rating:0,ratingCount:0}]});};
 process.env.SERPER_API_KEY='synthetic-server-key';
 try {
   assert.equal((await serper(async()=>Response.json({error:'Unauthorized'},{status:401})).POST(req({query:'synthetic'}))).status,401); assert.equal(calls,0);
   const response=await serper().POST(req({query:'synthetic',apiKey:'untrusted-client-key'}));
   assert.equal(response.status,200);
   const data=await response.json(); const place=data.places[0];
   assert.equal(place.whatsappFormatted,'5592999990000');
   assert.equal(place.telefoneLimpo,'5592999990000');
   assert.equal(place.rating,0); assert.equal(place.ratingCount,0);
   assert.equal(place.authorityScore,null); assert.equal(place.percentSocial,null);
   assert.equal(place.potencialFechamento,null); assert.equal(place.urgencia,null);
   assert.ok(place.analysis.facts); assert.ok(place.analysis.pending.length);
   assert.equal(data.creditsUsed,null);
 } finally {global.fetch=original; if(key===undefined)delete process.env.SERPER_API_KEY;else process.env.SERPER_API_KEY=key;}
});
