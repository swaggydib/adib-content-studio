import { NextRequest, NextResponse } from 'next/server';
import { getStudio, StudioError } from '@/lib/studio';
import { queueRevision, queueReview, retryJob, listJobs, applyJob, workerCapability } from '@/lib/worker';
import {getIntegrations} from '@/lib/integrations';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Ctx = {params:Promise<{path?:string[]}>};
function guard(req:NextRequest,write=false){
  const host=req.headers.get('host') ?? '';
  if (!/^(127\.0\.0\.1|localhost):[0-9]{1,5}$/.test(host)) throw new StudioError('Local access only',403);
  if(write && (req.headers.get('origin') !== `http://${host}` || !req.headers.get('content-type')?.startsWith('application/json'))) throw new StudioError('Same-origin JSON required',403);
}
async function body(req:NextRequest){const reader=req.body?.getReader();if(!reader)throw new StudioError('JSON body required');const chunks:Uint8Array[]=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1500000){await reader.cancel();throw new StudioError('Payload too large',413);}chunks.push(value);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new StudioError('Invalid JSON');}}
function failure(error:unknown){return NextResponse.json({error:error instanceof StudioError?error.message:'Local operation failed. Check server diagnostics.'},{status:error instanceof StudioError?error.status:500,headers:{'Cache-Control':'no-store'}});}
export async function GET(req:NextRequest,ctx:Ctx){try{guard(req);const path=(await ctx.params).path??[];if(path.length===0){const integration=getIntegrations();const status=integration.scanInbox();return NextResponse.json({revision:'acceptance-2',items:getStudio().list(),jobs:listJobs(),capability:workerCapability(),integrations:status,metrics:integration.listMetrics()},{headers:{'Cache-Control':'no-store'}});}if(path.length===1)return NextResponse.json(getStudio().get(path[0]));throw new StudioError('Not found',404);}catch(e){return failure(e);}}
export async function POST(req:NextRequest,ctx:Ctx){try{guard(req,true);const path=(await ctx.params).path??[];const data=await body(req);const db=getStudio();let result;
if(path.length===0)result=db.create(data);
else if(path.length===1&&path[0]==='import')result=db.importPack(data);
else if(path.length===1&&path[0]==='metrics')result=getIntegrations().importMetrics(data);
else if(path.length===2&&path[0]==='integrations'&&['scan','sync'].includes(path[1])){if(!data||Object.keys(data).length)throw new StudioError('Integration control accepts no paths or options');result=path[1]==='scan'?getIntegrations().scanInbox(true):getIntegrations().syncSnapshots();}
else if(path.length===2&&path[1]==='action')result=db.action(path[0],data);
else if(path.length===2&&path[1]==='export'){if(Object.keys(data).length)throw new StudioError('Export accepts no paths or options');result=db.exportItem(path[0]);}
else if(path.length===2&&path[1]==='revision'){if(!data||typeof data!=='object'||Object.keys(data).some(k=>!['version','instruction'].includes(k)))throw new StudioError('Invalid revision payload');result=queueRevision(path[0],data.version,data.instruction);}
else if(path.length===2&&path[1]==='review'){if(!data||typeof data!=='object'||Object.keys(data).some(k=>k!=='version'))throw new StudioError('Invalid review payload');result=queueReview(path[0],data.version);}
else if(path.length===3&&path[0]==='jobs'&&path[2]==='retry'){if(!data||Object.keys(data).length)throw new StudioError('Retry accepts no options');result=retryJob(path[1]);}
else if(path.length===3&&path[0]==='jobs'&&path[2]==='apply'){if(Object.keys(data).length)throw new StudioError('Apply accepts no options');result=applyJob(path[1]);}
else throw new StudioError('Not found',404);
return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}}
export async function PATCH(req:NextRequest,ctx:Ctx){try{guard(req,true);const path=(await ctx.params).path??[];if(path.length!==1)throw new StudioError('Not found',404);return NextResponse.json(getStudio().update(path[0],await body(req)));}catch(e){return failure(e);}}
