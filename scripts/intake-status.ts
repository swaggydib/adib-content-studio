import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync('data/studio.sqlite',{readOnly:true});
const rows=db.prepare('SELECT external_id,document FROM studio_items ORDER BY created_at').all() as {external_id:string|null;document:string}[];
const tombstones=db.prepare("SELECT name FROM sqlite_master WHERE name='studio_rejected_ids'").get()?db.prepare('SELECT external_id AS externalId,idea_id AS ideaId,rejected_at AS rejectedAt FROM studio_rejected_ids').all().map(r=>({...r,stage:'Rejected',deleted:true})):[];
console.log(JSON.stringify([...rows.map(r=>{const i=JSON.parse(r.document);return {externalId:r.external_id,ideaId:i.ideaId,title:i.title,platform:i.platform,stage:i.stage};}),...tombstones],null,2));db.close();
