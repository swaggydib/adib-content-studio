import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {Studio} from '../lib/studio.ts';
const scratch=process.env.TMPDIR||'C:/Users/LENOVO/AppData/Local/hermes/cache/scratch';
function fixture(){mkdirSync(scratch,{recursive:true});const root=mkdtempSync(join(scratch,'followup-'));const studio=new Studio(join(root,'test.sqlite'),join(root,'exports'));return {studio,root,close(){studio.close();rmSync(root,{recursive:true,force:true});}};}
test('title-only idea can be rejected and deleted, with no reopen or stale resurrection',()=>{const f=fixture();try{const i=f.studio.create({title:'Unpolished idea'});assert.equal(i.stage,'Idea');f.studio.action(i.id,{action:'reject',version:i.version,note:'Not my direction'});assert.equal(f.studio.list().length,0);assert.throws(()=>f.studio.get(i.id),/not found/i);assert.throws(()=>f.studio.action(i.id,{action:'reopen',version:i.version}),/not found/i);}finally{f.close();}});
