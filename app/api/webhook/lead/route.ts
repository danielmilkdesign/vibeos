import {createHmac,timingSafeEqual} from 'node:crypto';
import prisma from '../../../../lib/prisma';
import { persistLead } from '../../../../lib/crm-server';
import { CRM_TRANSACTION_BUDGET } from '../../../../lib/db-transactions';
const json=(data:unknown,status:number)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
// Per-process safety cap; configure a distributed limiter/WAF at deployment.
let windowStart=Date.now(), requestsInWindow=0;
async function readBody(request:Request):Promise<string> {
 const reader=request.body?.getReader(); if(!reader)throw new Error('body');
 const chunks:Uint8Array[]=[];let total=0;
 try {while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>65536)throw new Error('size');chunks.push(value);}}finally{await reader.cancel();}
 return Buffer.concat(chunks).toString('utf8');
}
export async function POST(request:Request) {
 const secret=process.env.LEAD_WEBHOOK_SECRET;
 if(!secret||Buffer.byteLength(secret)<32)return json({error:'Webhook indisponível.'},503);
 if(Date.now()-windowStart>=60000){windowStart=Date.now();requestsInWindow=0;}
 if(++requestsInWindow>60)return json({error:'Limite temporário de requisições.'},429);
 const timestamp=request.headers.get('x-webhook-timestamp')||'';
 const id=request.headers.get('x-webhook-id')||'';
 const signature=request.headers.get('x-webhook-signature')||'';
 if(!/^\d{10}$/.test(timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>300||! /^[A-Za-z0-9_-]{8,128}$/.test(id)||!/^sha256=[a-f0-9]{64}$/.test(signature))return json({error:'Webhook não autorizado.'},401);
 let body:string;
 try{body=await readBody(request);}catch{return json({error:'Corpo inválido ou excede 64 KiB.'},413);}
 // Signature covers the timestamp, idempotency key AND exact raw body.
 const expected=createHmac('sha256',secret).update(timestamp+'.'+id+'.'+body).digest();
 if(!timingSafeEqual(expected,Buffer.from(signature.slice(7),'hex')))return json({error:'Webhook não autorizado.'},401);
 let payload:any;
 try{payload=JSON.parse(body);}catch{return json({error:'JSON inválido.'},400);}
 if(!payload||typeof payload!=='object'||Array.isArray(payload))return json({error:'Payload inválido.'},400);
 const field=(...keys:string[])=>{for(const k of keys){const v=payload[k];if(typeof v==='string'&&v.trim())return v.trim().slice(0,2000);}return '';};
 const nomeEmpresa=field('nomeEmpresa','empresa','company');
 if(!nomeEmpresa||nomeEmpresa.length>200)return json({error:'Empresa obrigatória (máximo 200 caracteres).'},400);
 try {
  // WebhookEvent.id must be a DB primary key. Claim and lead insert are atomic.
  const db=prisma as any;
  const result=await db.$transaction(async(tx:any)=>{
   const existing=await tx.webhookEvent.findUnique({where:{id}});
   if(existing)return {duplicate:true};
   await tx.webhookEvent.create({data:{id}});
   const result=await persistLead({nomeEmpresa,externalId:`webhook:${id}`,nomeDecisor:field('nomeDecisor','nomeContato','contact_name')||null,
    emailDecisor:field('emailDecisor','email')||null,phoneWhatsapp:field('phoneWhatsapp','whatsapp','telefone','phone')||null,
    nicho:field('nicho','segmento')||'OUTROS',localizacao:field('cidade')||'',website:field('website','site')||null,diagnosticoSeo:field('mensagem','diagnostico')||null,
    valorEstimado:0},'ADMINISTRADOR',tx);
   return {leadId:result.lead.id,opportunityId:result.opportunity.id,persisted:true};
  }, CRM_TRANSACTION_BUDGET);
  return json({success:true,...result},result.duplicate?200:201);
 }catch(error:any){
  if(error?.code==='P2002'){
   try{const prior=await (prisma as any).webhookEvent.findUnique({where:{id}});if(prior)return json({success:true,duplicate:true},200);}catch{}
  }
  return json({error:'Persistência indisponível; evento não confirmado.'},503);
 }
}
