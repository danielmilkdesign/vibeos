const test = require('node:test');
const assert = require('node:assert/strict');
const {load}=require('./security-loader.cjs');
test('leitura de login limita bytes antes de acumular corpo completo',async()=>{
 const a=load('lib/server-auth.ts',{'./prisma':{__esModule:true,default:{}}});
 assert.equal(await a.readRequestText(new Request('https://test.invalid',{method:'POST',body:'á'}),2),'á');
 await assert.rejects(()=>a.readRequestText(new Request('https://test.invalid',{method:'POST',body:'áá'}),3));
});
test('sessão assinada rejeita falsificação, expiração e segredo ausente', async () => {
 const s = load('lib/session.ts');
 process.env.NEXTAUTH_SECRET = 'x'.repeat(40);
 const token = await s.createSession({sub:'synthetic',fingerprint:'fp'},60);
 assert.equal((await s.verifySession(token)).sub,'synthetic');
 assert.equal(await s.verifySession(token+'x'),null);
 assert.equal(await s.verifySession('vibe_sess_forged'),null);
 const expired = await s.createSession({sub:'synthetic',fingerprint:'fp'},-1);
 assert.equal(await s.verifySession(expired),null);
 delete process.env.NEXTAUTH_SECRET;
 assert.equal(await s.verifySession(token),null);
 await assert.rejects(()=>s.createSession({sub:'a',fingerprint:'fp'},60));
});
