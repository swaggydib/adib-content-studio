import {assertQAEnvironment} from '@/lib/qa-safety';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  try{
    const url=new URL(request.url);
    if(!/^(127\.0\.0\.1|localhost):[0-9]{1,5}$/.test(request.headers.get('host')??'')||url.protocol!=='http:')throw new Error('Local QA only');
    assertQAEnvironment(process.env,request.headers.get('X-Studio-QA-Token'));
    return Response.json({qa:true},{headers:{'Cache-Control':'no-store'}});
  }catch{return Response.json({qa:false},{status:403,headers:{'Cache-Control':'no-store'}});}
}
