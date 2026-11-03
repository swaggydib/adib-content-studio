import {existsSync,lstatSync} from 'node:fs';
import {dirname,isAbsolute,relative,resolve,sep} from 'node:path';
import {safeDirectory} from './integrations.ts';

export function qaTarget(env:Record<string,string|undefined>){
  const token=env.STUDIO_QA_TOKEN;
  if(!env.STUDIO_TEST_URL||!token||!/^[A-Za-z0-9_-]{16,128}$/.test(token))throw new Error('Browser QA requires explicit STUDIO_TEST_URL and STUDIO_QA_TOKEN (16–128 URL-safe characters).');
  const url=new URL(env.STUDIO_TEST_URL);
  if(url.protocol!=='http:'||!['127.0.0.1','localhost'].includes(url.hostname)||!url.port||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('Browser QA requires a loopback HTTP origin with an explicit port.');
  return {url:url.origin,token};
}

function inside(root:string,path:string){const rel=relative(root,path);return !!rel&&!rel.startsWith('..'+sep)&&rel!=='..'&&!isAbsolute(rel);}
export function assertQAEnvironment(env:Record<string,string|undefined>,token:string|null){
  if(!token||!/^[A-Za-z0-9_-]{16,128}$/.test(token)||env.STUDIO_QA_TOKEN!==token)throw new Error('QA run token mismatch or QA disabled.');
  const db=env.STUDIO_DB,inbox=env.STUDIO_INBOX_ROOT,out=env.STUDIO_EXPORT_ROOT;
  if(!db||!inbox||!out||![db,inbox,out].every(isAbsolute))throw new Error('QA requires explicit absolute database, inbox and export paths.');
  const root=dirname(db);
  if(!inside(resolve('artifacts'),root)||!inside(root,inbox)||!inside(root,out))throw new Error('QA database must be in a dedicated artifacts subdirectory with isolated inbox and exports.');
  safeDirectory(root);safeDirectory(inbox);safeDirectory(out);
  if(existsSync(db)&&(!lstatSync(db).isFile()||lstatSync(db).isSymbolicLink()))throw new Error('Unsafe QA database file.');
}
