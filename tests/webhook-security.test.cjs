const test=require('node:test');const assert=require('node:assert/strict');const {createHmac}=require('node:crypto');const {load}=require('./security-loader.cjs');
test('webhook autentica corpo/id/timestamp e persiste uma vez, sem sucesso simulado',async()=>{
 process.env.LEAD_WEBHOOK_SECRET='w'.repeat(40);
 const events=new Map();let writes=0;
 const tx={webhookEvent:{findUnique:async({where})=>events.get(where.id),create:async({data})=>events.set(data.id,data)},lead:{create:async()=>{throw Error('Webhook não deve gravar Lead isolado do Pipeline');}}};
 const db={$transaction:async fn=>fn(tx)};
 const service={persistLead:async(payload,role,transaction)=>{assert.equal(transaction,tx);assert.equal(role,'ADMINISTRADOR');assert.equal(payload.externalId,'webhook:synthetic-event-01');writes++;return {persisted:true,lead:{id:'synthetic'},company:{id:'c'},opportunity:{id:'o'}};}};
 const w=load('app/api/webhook/lead/route.ts',{'../../../../lib/prisma':{__esModule:true,default:db},'../../../../lib/crm-server':service});
 const timestamp=String(Math.floor(Date.now()/1000));const id='synthetic-event-01';
 function req(body,stamp=timestamp,signBody=body){const sig=createHmac('sha256',process.env.LEAD_WEBHOOK_SECRET).update(stamp+'.'+id+'.'+signBody).digest('hex');return new Request('https://test.invalid/api/webhook/lead',{method:'POST',headers:{'x-webhook-id':id,'x-webhook-timestamp':stamp,'x-webhook-signature':'sha256='+sig},body});}
 const body=JSON.stringify({company:'Synthetic only'});
 assert.equal((await w.POST(req(body))).status,201);
 assert.equal((await w.POST(req(body))).status,200);assert.equal(writes,1);
 assert.equal((await w.POST(req('{"company":"tampered"}',timestamp,body))).status,401);
 assert.equal((await w.POST(req(body,String(Number(timestamp)-600)))).status,401);
 assert.equal((await w.POST(req('{"company":"another"}'))).status,200);assert.equal(writes,1);assert.deepEqual(Object.keys(events.get(id)),['id']);
 const offline=load('app/api/webhook/lead/route.ts',{'../../../../lib/prisma':{__esModule:true,default:{$transaction:async()=>{throw Error('offline')}}}});
 assert.equal((await offline.POST(req(body))).status,503);
 for(let i=0;i<65;i++)await w.POST(req(body));
 assert.equal((await w.POST(req(body))).status,429);
});
test('provisionador CLI gera scrypt compatível sem defaults e sem persistência ao importar',async()=>{
 const cli=require('../scripts/provision-user.cjs');
 assert.deepEqual(cli.parseArguments(['--apply','--email','test@example.invalid','--name','Synthetic','--role','ADMINISTRADOR']),{email:'test@example.invalid',name:'Synthetic',role:'ADMINISTRADOR'});
 assert.throws(()=>cli.parseArguments(['--apply','--email','test@example.invalid','--name','Synthetic','--role','ADMINISTRADOR','--password','never-accepted']));
 assert.throws(()=>cli.parseArguments(['--apply','--email','test@example.invalid','--name','Synthetic']));
 const {verifyPassword}=load('lib/server-auth.ts',{'./prisma':{__esModule:true,default:{}}});
 assert.equal(await verifyPassword('synthetic-password',await cli.passwordHash('synthetic-password')),true);
 await assert.rejects(()=>cli.passwordHash(''));
});
