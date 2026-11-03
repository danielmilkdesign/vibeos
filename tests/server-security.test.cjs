const test = require('node:test');
const assert = require('node:assert/strict');
const {load} = require('./security-loader.cjs');
const user = {id:'synthetic',name:'Test',email:'test@example.invalid',role:'COMERCIAL',active:true,password:'',updatedAt:new Date(0)};
const prisma = {user:{findUnique:async()=>user}};
test('scrypt usa salt aleatório e rejeita senha incorreta ou hash malformado',async()=>{
 const a=load('lib/server-auth.ts',{'./prisma':{default:prisma,__esModule:true}});
 const hash=await a.hashPassword('synthetic-password');
 assert.notEqual(hash,await a.hashPassword('synthetic-password'));
 assert.equal(await a.verifyPassword('synthetic-password',hash),true);
 assert.equal(await a.verifyPassword('wrong',hash),false);
 assert.equal(await a.verifyPassword('wrong','scrypt$bad'),false);
});
test('API consulta usuário ativo, RBAC e revogação por fingerprint',async()=>{
 process.env.NEXTAUTH_SECRET='x'.repeat(40);
 const a=load('lib/server-auth.ts',{'./prisma':{default:prisma,__esModule:true}});
 const s=load('lib/session.ts'); user.password=await a.hashPassword('synthetic-password');
 const token=await s.createSession({sub:user.id,fingerprint:a.sessionFingerprint(user)},60);
 const req=new Request('https://test.invalid/api/leads',{headers:{cookie:'vibe_auth_token='+token}});
 assert.equal((await a.requireSession(req)).user.id,user.id);
 assert.equal((await a.requireSession(req,['FINANCEIRO'])).status,403);
 user.active=false; assert.equal((await a.requireSession(req)).status,401); user.active=true;
 user.password=await a.hashPassword('changed'); assert.equal((await a.requireSession(req)).status,401);
 assert.equal((await a.requireSession(new Request('https://test.invalid'))).status,401);
});
