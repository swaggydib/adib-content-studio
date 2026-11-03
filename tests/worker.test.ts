import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { Studio } from '../lib/studio.ts';
import { RevisionWorker, captureProcess, hermesArgs, parseProposal, type ProcessRunner, type Job } from '../lib/worker.ts';
const output = (body = 'Revisi singkat') => ({ exitCode: 0, stdout: JSON.stringify({ type: 'result', exit_code: 0, text: JSON.stringify({ body }) }) });
test('restart before expiry recovers interrupted job and drains queue without another restart', async t => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: Date.now() });
  const dir = mkdtempSync(join(tmpdir(), 'studio-recovery-'));
  const dbPath = join(dir, 'studio.sqlite');
  const studio = new Studio(dbPath, join(dir, 'exports'));
  const item = studio.create({ title: 'Recovery', body: 'Original' });
  const db = new DatabaseSync(dbPath);
  db.exec('CREATE TABLE studio_revision_jobs(id TEXT PRIMARY KEY, document TEXT NOT NULL)');
  const interrupted: Job = { id: 'interrupted', itemId: item.id, version: 1, status: 'running', createdAt: new Date().toISOString(), startedAt: new Date(Date.now() - 30000).toISOString() };
  db.prepare('INSERT INTO studio_revision_jobs VALUES(?,?)').run(interrupted.id, JSON.stringify(interrupted));
  db.close();
  let calls = 0;
  const worker = new RevisionWorker({ dbPath, studio, timeoutMs: 200, runner: async () => { calls++; return output(); } });
  try {
    const queued = worker.queueRevision(item.id, 1, 'Shorten');
    await new Promise<void>(resolve => queueMicrotask(resolve));
    assert.equal(worker.getJob(interrupted.id).status, 'running');
    assert.equal(worker.getJob(queued.id).status, 'queued');
    assert.equal(calls, 0);
    t.mock.timers.tick(201);
    await new Promise<void>(resolve => setImmediate(resolve));
    assert.equal(worker.getJob(interrupted.id).status, 'failed');
    assert.match(worker.getJob(interrupted.id).error!, /interrupted/i);
    assert.equal(worker.getJob(queued.id).status, 'done');
    assert.equal(calls, 1);
    assert.equal(studio.get(item.id).body, 'Original');
  } finally {
    worker.close(); studio.close(); t.mock.timers.reset();
    rmSync(dir, { recursive: true, force: true });
  }
});
async function settled(worker: RevisionWorker, id: string): Promise<Job> { for (let i = 0; i < 200; i++) { const job = worker.getJob(id); if (['done', 'failed'].includes(job.status)) { await new Promise(r => setTimeout(r, 0)); return job; } await new Promise(r => setTimeout(r, 5)); } throw new Error('Test worker did not settle'); }
function fixture(runner: ProcessRunner, queueCap = 4) { const dir = mkdtempSync(join(tmpdir(), 'studio-worker-test-')); const studio = new Studio(join(dir, 'studio.sqlite'), join(dir, 'exports')); const worker = new RevisionWorker({ dbPath: join(dir, 'jobs.sqlite'), studio, runner, queueCap }); const item = studio.create({ title: 'Test', body: 'Draf asli', platform: 'linkedin' }); return { studio, worker, item, dir, cleanup() { worker.close(); studio.close(); rmSync(dir, { recursive: true, force: true }); } }; }
test('proposal remains separate; explicit application invalidates approvals and prevents reuse', async () => {
  const f = fixture(async () => output()); try { const review = f.studio.action(f.item.id, { version: 1, action: 'submit' }); const approved = f.studio.action(f.item.id, { version: review.version, action: 'approve' }); const job = f.worker.queueRevision(f.item.id, approved.version, 'Ringkas'); assert.equal(job.status, 'queued'); const done = await settled(f.worker, job.id); assert.equal(done.status, 'done'); assert.equal(f.studio.get(f.item.id).body, 'Draf asli'); const updated = f.worker.applyJob(job.id); assert.equal(updated.body, 'Revisi singkat'); assert.equal(updated.stage, 'Draft'); assert.equal(updated.approvals.length, 0); assert.throws(() => f.worker.applyJob(job.id), /already applied/); } finally { f.cleanup(); }
});
test('stale proposal cannot overwrite a human edit', async () => { const f = fixture(async () => output()); try { const job = f.worker.queueRevision(f.item.id, 1, 'Ringkas'); await settled(f.worker, job.id); f.studio.update(f.item.id, { version: 1, body: 'Edit manusia' }); assert.throws(() => f.worker.applyJob(job.id), /Version conflict/); assert.equal(f.studio.get(f.item.id).body, 'Edit manusia'); } finally { f.cleanup(); } });
test('queue cap and concurrency one', async () => { let release: (() => void) | undefined; let active = 0; let peak = 0; let calls = 0; const f = fixture(async () => { active++; peak = Math.max(active, peak); calls++; if (calls === 1) await new Promise<void>(r => { release = r; }); active--; return output(); }, 2); try { const first = f.worker.queueRevision(f.item.id, 1, 'a'); const second = f.worker.queueRevision(f.item.id, 1, 'b'); assert.throws(() => f.worker.queueRevision(f.item.id, 1, 'c'), /queue full/); await new Promise(r => setTimeout(r, 10)); assert.equal(f.worker.getJob(first.id).status, 'running'); assert.equal(f.worker.getJob(second.id).status, 'queued'); release?.(); await settled(f.worker, second.id); assert.equal(peak, 1); } finally { f.cleanup(); } });
test('invalid output fails persistently, never changes content', async () => { const f = fixture(async () => ({ exitCode: 0, stdout: '{"type":"result","exit_code":0,"text":"not JSON"}' })); try { const job = f.worker.queueRevision(f.item.id, 1, 'a'); const done = await settled(f.worker, job.id); assert.equal(done.status, 'failed'); assert.match(done.error ?? '', /exact JSON/); assert.equal(f.studio.get(f.item.id).version, 1); f.worker.close(); const restarted = new RevisionWorker({ dbPath: join(f.dir, 'jobs.sqlite'), studio: f.studio, runner: async () => output() }); assert.equal(restarted.getJob(job.id).status, 'failed'); restarted.close(); f.studio.close(); rmSync(f.dir, { recursive: true, force: true }); } catch (e) { f.cleanup(); throw e; } });
test('structured validation rejects extra fields, fences, empty text, tools, and failed exit', () => { for (const text of ['```json\n{"body":"x"}\n```', '{"body":"x","command":"bad"}', '{"body":""}', '[]']) assert.throws(() => parseProposal({ exitCode: 0, stdout: JSON.stringify({ type: 'result', exit_code: 0, text }) })); assert.throws(() => parseProposal({ exitCode: 0, stdout: '{"type":"tool_use"}\n' + output().stdout }), /zero tools/); assert.throws(() => parseProposal({ ...output(), exitCode: 1 }), /unsuccessfully/); });
test('timeout kills process at boundary', async () => { const child = spawn(process.execPath, ['--input-type=module'], { stdio: ['pipe', 'pipe', 'pipe'], shell: false }); child.stdin.end('setInterval(() => {}, 1000)'); await assert.rejects(captureProcess(child, { timeoutMs: 100, outputBytes: 10000 }), /timed out/); });
test('output cap kills process at boundary', async () => { const child = spawn(process.execPath, ['--input-type=module'], { stdio: ['pipe', 'pipe', 'pipe'], shell: false }); child.stdin.end('process.stdout.write("x".repeat(10000)); setInterval(() => {}, 1000)'); await assert.rejects(captureProcess(child, { timeoutMs: 5000, outputBytes: 100 }), /safety cap/); });
test('fixed args never include user instruction, shell flags, or tools', () => { const args = hermesArgs('D:/safe/query.txt'); assert.equal(args[args.indexOf('-t') + 1], 'none'); assert.equal(args[args.indexOf('--max-turns') + 1], '2'); assert.equal(args[args.indexOf('--run-budget') + 1], '60'); assert.ok(!args.includes('--yolo')); assert.ok(!args.includes('--ignore-user-config')); });
