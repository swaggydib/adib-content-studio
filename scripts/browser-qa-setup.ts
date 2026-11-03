import {qaTarget} from '../lib/qa-safety.ts';

export default async function setup(){
  const {url,token}=qaTarget(process.env);
  const response=await fetch(url+'/api/studio/qa-check',{headers:{'X-Studio-QA-Token':token},redirect:'error',signal:AbortSignal.timeout(5000)});
  if(!response.ok||(await response.json()).qa!==true)throw new Error('Browser QA refused: target server has not verified isolated QA storage and matching run token.');
}
