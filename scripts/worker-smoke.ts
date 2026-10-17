import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Studio } from '../lib/studio.ts';
import { RevisionWorker, workerCapability, hermesArgs } from '../lib/worker.ts';
async function main() {
const source = 'C:/Users/LENOVO/AppData/Local/hermes/profiles/social-manager/workspace/drafts/first-draft-pack.md';
const pack = readFileSync(source, 'utf8');
const body = pack.split('### Usulan teks unggahan')[1]?.split('### Pemeriksaan isi')[0]?.trim();
if (!body) throw new Error('Real first draft not found');
mkdirSync('artifacts', { recursive: true });
const studio = new Studio('artifacts/worker-smoke.sqlite', 'D:/personal/projects/adib-content-studio/artifacts/worker-export-unused');
const item = studio.create({ title: 'LI-01 — real first-draft smoke', body, source, platform: 'linkedin' });
const worker = new RevisionWorker({ dbPath: 'artifacts/worker-smoke.sqlite', studio });
const job = worker.queueRevision(item.id, item.version, 'Persingkat draf ini dalam bahasa Indonesia menjadi paling banyak 110 kata. Pertahankan status masih belajar, tanpa klaim, pencapaian, pengalaman, atau fakta baru.');
const start = Date.now();
let result = worker.getJob(job.id);
while (!['done', 'failed'].includes(result.status) && Date.now() - start < 110000) { await new Promise(r => setTimeout(r, 200)); result = worker.getJob(job.id); }
const report = { liveInvocation: true, capability: workerCapability(), command: ['hermes', ...hermesArgs('<server-generated-query-file>')], source: 'Existing LI-01 first draft (body only; no account IDs)', elapsedMs: Date.now() - start, job: result, originalUnchanged: studio.get(item.id).body === body, automaticallyApplied: false, rawStderrRetained: false };
writeFileSync('artifacts/worker-smoke.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
worker.close(); studio.close();
if (result.status !== 'done') process.exitCode = 1;
}
void main().catch(() => { console.error('Worker smoke failed before sanitized report; inspect local configuration.'); process.exitCode = 1; });
