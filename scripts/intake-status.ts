import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync('data/studio.sqlite',{readOnly:true});
const rows=db.prepare('SELECT external_id,document FROM studio_items ORDER BY created_at').all() as {external_id:string|null;document:string}[];
console.log(JSON.stringify(rows.map(r=>{const i=JSON.parse(r.document);return {externalId:r.external_id,ideaId:i.ideaId,title:i.title,platform:i.platform,stage:i.stage};}),null,2));db.close();
