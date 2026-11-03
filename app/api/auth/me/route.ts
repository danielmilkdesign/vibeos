import {requireSession,authJson} from '../../../../lib/server-auth';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
 const result=await requireSession(request);return result instanceof Response?result:authJson(result);
}
