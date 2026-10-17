import { Studio } from '../lib/studio.ts';
import { readFileSync } from 'node:fs';
const live=new Studio('data/studio.sqlite');
const qa=new Studio('artifacts/browser-test.sqlite');
const originals=live.list();
const pack={schemaVersion:1,items:originals.map(i=>({externalId:'browser-fixture-'+i.id,ideaId:i.ideaId,title:i.title,platform:i.platform,format:i.format,body:i.body,source:i.source,owner:i.owner,account:i.account,media:i.media,audience:i.audience,plannedAt:i.plannedAt}))};
console.log(qa.importPack(pack));
console.log({sourceCount:originals.length,qaCount:qa.list().length,schema:readFileSync('lib/schema.sql','utf8').length});
qa.close();live.close();
