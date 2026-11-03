const test=require('node:test'); const assert=require('node:assert/strict'); const {load}=require('./security-loader.cjs');
const prisma={user:{findUnique:async()=>null,update:async()=>{}}};
const mocks={'../../../../lib/prisma':{__esModule:true,default:prisma},'./prisma':{__esModule:true,default:prisma}};
const req=(body,origin='https://test.invalid')=>new Request('https://test.invalid/api/auth/login',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
test('login falha fechado, valida origem e nunca aceita usuário inexistente',async()=>{
 const a=load('app/api/auth/login/route.ts',mocks); delete process.env.NEXTAUTH_SECRET;
 assert.equal((await a.POST(req({email:'x@example.invalid',password:'fake'}))).status,503);
 process.env.NEXTAUTH_SECRET='x'.repeat(40);
 assert.equal((await a.POST(req({},'https://evil.invalid'))).status,403);
 assert.equal((await a.POST(req({email:'x@example.invalid',password:'fake'}))).status,401);
 for(let i=0;i<40;i++) await a.POST(req({email:'x@example.invalid',password:'fake'}));
 assert.equal((await a.POST(req({email:'x@example.invalid',password:'fake'}))).status,429);
});
test('login emite cookie HttpOnly, me lê DB e logout revoga fingerprint',async()=>{
 process.env.NEXTAUTH_SECRET='x'.repeat(40);
 const auth=load('lib/server-auth.ts',mocks);
 const user={id:'synthetic',name:'Test',email:'x@example.invalid',role:'COMERCIAL',active:true,password:await auth.hashPassword('synthetic-password'),updatedAt:new Date(0)};
 prisma.user.findUnique=async()=>user;
 prisma.user.update=async({data})=>{user.updatedAt=data.updatedAt;return user;};
 const a=load('app/api/auth/login/route.ts',mocks);
 const response=await a.POST(req({email:user.email,password:'synthetic-password'}));
 assert.equal(response.status,200);const cookie=response.headers.get('set-cookie');assert.match(cookie,/HttpOnly/); assert.doesNotMatch(JSON.stringify(await response.json()),/scrypt/);
 const r=new Request('https://test.invalid/api/auth/me',{headers:{cookie}});
 const me=load('app/api/auth/me/route.ts',mocks);assert.equal((await me.GET(r)).status,200);
 const out=load('app/api/auth/logout/route.ts',mocks);
 assert.equal((await out.POST(new Request(r.url,{method:'POST',headers:{cookie,origin:'https://test.invalid'}}))).status,200);
 assert.equal((await me.GET(r)).status,401);
});
