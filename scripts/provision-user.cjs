'use strict';
// Server-only administrative CLI. No default users/passwords; no password CLI flag.
// DATABASE_URL required. Password: VIBE_PROVISION_PASSWORD or redirected stdin.
const {randomBytes,scrypt}=require('node:crypto');
async function passwordHash(password){
 if(typeof password!=='string'||password.length<12||password.length>1024)throw Error('Senha deve ter entre 12 e 1024 caracteres.');
 const salt=randomBytes(32).toString('hex');
 const key=await new Promise((resolve,reject)=>scrypt(password,salt,64,{N:16384,r:8,p:1},(e,k)=>e?reject(e):resolve(k)));
 return `scrypt$16384$8$1$${salt}$${key.toString('hex')}`;
}
function parseArguments(args){
 const parsed={};for(let i=0;i<args.length;i++){
  const key=args[i];
  if(key==='--apply'){if(parsed.apply)throw Error('Argumento duplicado.');parsed.apply=true;continue;}
  if(!['--email','--name','--role'].includes(key)||!args[i+1]||args[i+1].startsWith('--')||parsed[key.slice(2)])throw Error('Argumentos inválidos; senha somente via stdin/environment.');
  parsed[key.slice(2)]=args[++i];
 }
 const {email,name,role,apply}=parsed;
 const roles=['ADMINISTRADOR','GESTOR_COMERCIAL','COMERCIAL','OPERACOES','DESIGN_CONTEUDO','FINANCEIRO'];
 if(!apply||!email||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!name?.trim()||name.length>200||!roles.includes(role))throw Error('Uso: node scripts/provision-user.cjs --apply --email EMAIL --name NOME --role PAPEL (senha por stdin/env).');
 return {email:email.trim().toLowerCase(),name:name.trim(),role};
}
async function main(){
 const data=parseArguments(process.argv.slice(2));
 if(!process.env.DATABASE_URL)throw Error('DATABASE_URL é obrigatória.');
 let password=process.env.VIBE_PROVISION_PASSWORD;delete process.env.VIBE_PROVISION_PASSWORD;
 if(password===undefined){
  if(process.stdin.isTTY)throw Error('Senha requerida por stdin redirecionado ou VIBE_PROVISION_PASSWORD.');
  const chunks=[];let total=0;for await(const chunk of process.stdin){total+=chunk.length;if(total>4096)throw Error('Entrada excedida.');chunks.push(chunk);}
  password=Buffer.concat(chunks).toString('utf8').replace(/\r?\n$/,'');
 }
 const hash=await passwordHash(password);password='';
 const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();
 try{
  // Create-only. Existing users are not silently reset or elevated.
  const created=await db.user.create({data:{...data,password:hash,active:true}});
  const check=await db.user.findUnique({where:{id:created.id}});
  if(!check||check.password!==hash||!check.active)throw Error('Falha na verificação do provisionamento.');
  process.stdout.write(JSON.stringify({id:check.id,email:check.email,role:check.role})+'\n');
 }finally{await db.$disconnect();}
}
module.exports={passwordHash,parseArguments};
if(require.main===module)main().catch(()=>{process.stderr.write('Provisionamento falhou. Verifique argumentos, configuração e unicidade do e-mail; nenhum segredo será exibido.\n');process.exitCode=1;});
