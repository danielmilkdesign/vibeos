const test=require('node:test');
const assert=require('node:assert/strict');
const {load}=require('./security-loader.cjs');
const next={NextResponse:{next:()=>new Response(null,{status:204}),json:(d,o)=>Response.json(d,o),redirect:url=>new Response(null,{status:307,headers:{location:String(url)}})}};
function request(path,cookie){ const r=new Request('https://test.invalid'+path,{headers:cookie?{cookie}: {}}); r.nextUrl=new URL(r.url); r.cookies={get:()=>cookie?{value:cookie.split('=')[1]}:undefined}; return r; }
test('middleware não aceita cookie arbitrário nem bypass por ponto/prefixo',async()=>{
 const {middleware}=load('middleware.ts',{'next/server':next});
 for(const p of ['/api/leads','/api/leads.json','/api/auth/anything','/api/webhook/evil']) assert.equal((await middleware(request(p,'vibe_auth_token=forged'))).status,401);
 assert.equal((await middleware(request('/private.html'))).status,307);
 assert.equal((await middleware(request('/login'))).status,204);
 process.env.NEXTAUTH_SECRET='x'.repeat(40);
 const s=load('lib/session.ts');const token=await s.createSession({sub:'synthetic',fingerprint:'fp'},60);
 assert.equal((await middleware(request('/api/leads','vibe_auth_token='+token))).status,204);
 assert.equal((await middleware(request('/api/leads','vibe_auth_token='+token+'x'))).status,401);
});
test('enrich desabilitado e magic access rejeitado sem efeitos colaterais',async()=>{
 const e=load('app/api/prospeccao/enrich/route.ts',{'../../../../lib/server-auth':{requireSession:async()=>({user:{id:'test'}}),authJson:(d,s)=>Response.json(d,{status:s})}});
 assert.equal((await e.POST(new Request('https://test.invalid'))).status,503);
 const a=load('app/api/auth/access/route.ts'); assert.equal((await a.GET()).status,401);
});
test('webhook falha fechado sem segredo e não escreve no DB',async()=>{
 delete process.env.LEAD_WEBHOOK_SECRET;
 const w=load('app/api/webhook/lead/route.ts',{'../../../../lib/prisma':{__esModule:true,default:{}}});
 assert.equal((await w.POST(new Request('https://test.invalid',{method:'POST',body:'{}'}))).status,503);
});
