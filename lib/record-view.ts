import type {Item} from './studio.ts';
export type SortField='title'|'platform'|'stage'|'version'|'plannedAt';
export function sortRecords(items:Item[],field:SortField,order:'asc'|'desc'):Item[]{return [...items].sort((a,b)=>{const result=field==='version'?a.version-b.version:field==='plannedAt'?(a.plannedAt?Date.parse(a.plannedAt):Number.MAX_SAFE_INTEGER)-(b.plannedAt?Date.parse(b.plannedAt):Number.MAX_SAFE_INTEGER):String(a[field]).localeCompare(String(b[field]),'id');return (result||a.id.localeCompare(b.id))*(order==='asc'?1:-1);});}
export function searchRecords(items:Item[],query:string,limit=30):Item[]{const q=query.trim().toLocaleLowerCase('id');return items.filter(i=>`${i.title}\n${i.body}\n${i.platform}\n${i.stage}`.toLocaleLowerCase('id').includes(q)).slice(0,limit);}
