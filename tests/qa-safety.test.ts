import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolve,join} from 'node:path';
import {assertQAEnvironment,qaTarget} from '../lib/qa-safety.ts';
import setup from '../scripts/browser-qa-setup.ts';

test('browser QA requires an explicit loopback URL and matching run token',()=>{
  for(const url of [undefined,'https://example.com','http://127.0.0.1:3012/path','http://user:pass@localhost:3012','http://localhost:3012/?x=1'])assert.throws(()=>qaTarget({STUDIO_TEST_URL:url,STUDIO_QA_TOKEN:'qa-safety-test-token'}));
  assert.throws(()=>qaTarget({STUDIO_TEST_URL:'http://localhost:3012'}));
  assert.equal(qaTarget({STUDIO_TEST_URL:'http://127.0.0.1:3012',STUDIO_QA_TOKEN:'qa-safety-test-token'}).url,'http://127.0.0.1:3012');
});

test('Playwright preflight rejects unverified servers before any content request',async t=>{
  const previousURL=process.env.STUDIO_TEST_URL,previousToken=process.env.STUDIO_QA_TOKEN;
  process.env.STUDIO_TEST_URL='http://127.0.0.1:3012';process.env.STUDIO_QA_TOKEN='qa-safety-test-token';
  let response=new Response(JSON.stringify({qa:false}),{status:403});
  const calls:string[]=[];
  t.mock.method(globalThis,'fetch',async(input: string,options:RequestInit)=>{
    calls.push(input);
    assert.equal(new Headers(options.headers).get('X-Studio-QA-Token'),'qa-safety-test-token');
    assert.equal(options.redirect,'error');
    return response;
  });
  try{
    await assert.rejects(setup(),/refused/);
    response=new Response(JSON.stringify({qa:false}));
    await assert.rejects(setup(),/refused/);
    response=new Response(JSON.stringify({qa:true}));
    await setup();
    assert.deepEqual(calls,Array(3).fill('http://127.0.0.1:3012/api/studio/qa-check'));
  }finally{
    if(previousURL===undefined)delete process.env.STUDIO_TEST_URL;else process.env.STUDIO_TEST_URL=previousURL;
    if(previousToken===undefined)delete process.env.STUDIO_QA_TOKEN;else process.env.STUDIO_QA_TOKEN=previousToken;
    t.mock.restoreAll();
  }
});

test('QA server rejects defaults, wrong token and any live integration path',()=>{
  const root=resolve('artifacts/qa-safety-fixture');
  const token='qa-safety-test-token';
  const env={STUDIO_QA_TOKEN:token,STUDIO_DB:join(root,'studio.sqlite'),STUDIO_INBOX_ROOT:join(root,'inbox'),STUDIO_EXPORT_ROOT:join(root,'vault')};
  assert.doesNotThrow(()=>assertQAEnvironment(env,token));
  assert.throws(()=>assertQAEnvironment({},token));
  assert.throws(()=>assertQAEnvironment(env,'wrong-token'));
  for(const field of ['STUDIO_DB','STUDIO_INBOX_ROOT','STUDIO_EXPORT_ROOT'] as const){
    assert.throws(()=>assertQAEnvironment({...env,[field]:undefined},token));
    assert.throws(()=>assertQAEnvironment({...env,[field]:resolve('data/live.sqlite')},token));
  }
  assert.throws(()=>assertQAEnvironment({...env,STUDIO_DB:resolve('artifacts/studio.sqlite')},token));
});
