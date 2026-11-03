export async function GET() {
 return Response.json({error:'Acesso por chave removido. Utilize e-mail e senha.'},{status:401,headers:{'Cache-Control':'no-store'}});
}
