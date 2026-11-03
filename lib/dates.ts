export function localParts(value:string):{day:string;time:string}{if(!value)return {day:'',time:'12:30'};const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value));const get=(s:string)=>p.find(v=>v.type===s)!.value;return {day:`${get('year')}-${get('month')}-${get('day')}`,time:`${get('hour')}:${get('minute')}`};}
export function plannedISO(day:string,time:string){return day?`${day}T${time||'12:30'}:00+08:00`:'';}
export function monthDays(month:string){const [y,m]=month.split('-').map(Number);const count=new Date(Date.UTC(y,m,0)).getUTCDate();return Array.from({length:count},(_,i)=>`${month}-${String(i+1).padStart(2,'0')}`);}
export function shiftMonth(month:string,delta:number){const [y,m]=month.split('-').map(Number);const d=new Date(Date.UTC(y,m-1+delta,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;}
export function isZonedDateTime(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day, hour, minute, second] = match.slice(1).map(v => Number(v ?? 0));
  const civil = new Date(0);
  civil.setUTCFullYear(year, month - 1, day);
  civil.setUTCHours(hour, minute, second, 0);
  return civil.getUTCFullYear() === year && civil.getUTCMonth() === month - 1 && civil.getUTCDate() === day && civil.getUTCHours() === hour && civil.getUTCMinutes() === minute && civil.getUTCSeconds() === second && Number.isFinite(Date.parse(value));
}
