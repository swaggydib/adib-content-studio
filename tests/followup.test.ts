import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {Studio} from '../lib/studio.ts';
const scratch=process.env.TMPDIR||'C:/Users/LENOVO/AppData/Local/hermes/cache/scratch';
function fixture(){mkdirSync(scratch,{recursive:true});const root=mkdtempSync(join(scratch,'followup-'));const studio=new Studio(join(root,'test.sqlite'),join(root,'exports'));return {studio,root,close(){studio.close();rmSync(root,{recursive:true,force:true});}};}
test('title-only idea, rejection audit, stale duplicate, reopen without deleting history',()=>{const f=fixture();try{let i=f.studio.create({title:'Unpolished idea'});assert.equal(i.stage,'Idea');i=f.studio.action(i.id,{action:'reject',version:i.version,note:'Not my direction'});assert.equal(i.stage,'Rejected');assert.equal(i.approvals.length,0);assert.equal(i.history.at(-1)?.note,'Not my direction');assert.throws(()=>f.studio.action(i.id,{action:'reject',version:i.version-1}),/conflict/);assert.throws(()=>f.studio.action(i.id,{action:'reject',version:i.version}),/transition/);i=f.studio.action(i.id,{action:'reopen',version:i.version});assert.equal(i.stage,'Draft');assert.ok(i.history.some(e=>e.action==='reject'));}finally{f.close();}});
