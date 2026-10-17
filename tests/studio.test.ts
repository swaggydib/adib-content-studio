import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync, mkdirSync, symlinkSync } from 'node:fs';

import { join } from 'node:path';
import { Studio } from '../lib/studio.ts';

const base = { title: 'A real draft', platform: 'linkedin', format: 'text', body: 'Draft body', source: 'Evidence supplied by author', owner: 'Adib', account: '', media: '', audience: '', plannedAt: '' };
function fixture() {
  const scratch = process.env.TMPDIR || 'C:/Users/LENOVO/AppData/Local/hermes/cache/scratch';
  mkdirSync(scratch, { recursive: true });
  const root = mkdtempSync(join(scratch, 'studio-test-'));
  const db = join(root, 'studio.sqlite');
  const exports = join(root, 'exports');
  const studio = new Studio(db, exports);
  return { studio, root, db, exports, clean() { studio.close(); rmSync(root, { recursive: true, force: true }); } };
}
test('creation, editing, reopening persist real content and history', () => {
  const f = fixture();
  try { const a = f.studio.create(base); assert.equal(a.stage, 'Draft'); assert.equal(a.version, 1);
    const b = f.studio.update(a.id, { version: a.version, body: 'Edited' });
    assert.equal(b.version, 2); assert.equal(b.versions.length, 2); assert.equal(b.history.length, 2);
    const other = new Studio(f.db, f.exports); assert.equal(other.get(a.id).body, 'Edited'); other.close();
  } finally { f.clean(); }
});
test('text approval is a stage approval, never a publishing permission', () => {
  const f = fixture(); try { let a = f.studio.create(base); a = f.studio.action(a.id, { action: 'submit', version: a.version }); a = f.studio.action(a.id, { action: 'approve', version: a.version });
    assert.equal(a.stage, 'Ready to Publish'); assert.equal(a.approvals.length, 1); assert.equal(a.approvals[0].kind, 'stage'); assert.equal(a.approvals[0].snapshot.body, base.body);
    assert.throws(() => f.studio.action(a.id, { action: 'publish', version: a.version }), /action|transition/i);
  } finally { f.clean(); }
});
test('video transitions require recording and final review', () => {
  const f = fixture(); try { let a = f.studio.create({ ...base, platform: 'tiktok', format: 'video' });
    for (const action of ['submit', 'approve', 'recorded', 'finish-edit', 'approve']) a = f.studio.action(a.id, { action, version: a.version });
    assert.equal(a.stage, 'Ready to Publish'); assert.equal(a.approvals.length, 2);
  } finally { f.clean(); }
});
test('invalid transitions and stale updates/actions are rejected', () => {
  const f = fixture(); try { const a = f.studio.create(base);
    assert.throws(() => f.studio.action(a.id, { action: 'approve', version: a.version }), /transition/i);
    assert.throws(() => f.studio.update(a.id, { body: 'no version' }), /version/i);
    const b = f.studio.update(a.id, { version: a.version, body: 'changed' });
    assert.throws(() => f.studio.update(a.id, { version: a.version, body: 'stale' }), /conflict/i);
    assert.throws(() => f.studio.action(a.id, { action: 'submit', version: a.version }), /conflict/i);
    assert.equal(f.studio.get(b.id).body, 'changed');
  } finally { f.clean(); }
});
test('every publication-relevant edit invalidates approval; audit survives', () => {
  const f = fixture(); try { for (const [field, value] of Object.entries({ title: 'New title', body: 'New copy', source: 'New evidence', platform: 'instagram', format: 'video', account: '@other', media: 'asset-2', audience: 'friends', plannedAt: '2026-11-01T10:00:00+08:00' })) {
    let a = f.studio.create(base); a = f.studio.action(a.id, { action: 'submit', version: a.version }); a = f.studio.action(a.id, { action: 'approve', version: a.version });
    a = f.studio.update(a.id, { version: a.version, [field]: value }); assert.equal(a.approvals.length, 0, field); assert.equal(a.stage, 'Draft', field); assert.ok(a.history.some(h => h.action === 'approve'));
  } } finally { f.clean(); }
});
test('revision requires explanation; hold resume drop work', () => {
  const f = fixture(); try { let a = f.studio.create(base); a = f.studio.action(a.id, { action: 'submit', version: a.version });
    assert.throws(() => f.studio.action(a.id, { action: 'revision', version: a.version }), /note/i);
    a = f.studio.action(a.id, { action: 'revision', version: a.version, note: 'Please clarify sources' }); assert.equal(a.owner, 'Hermes'); assert.equal(a.stage, 'Draft');
    for (const action of ['hold', 'resume', 'drop']) a = f.studio.action(a.id, { action, version: a.version }); assert.equal(a.stage, 'Dropped');
  } finally { f.clean(); }
});
test('intake is idempotent by externalId and never overwrites', () => {
  const f = fixture(); try { const pack = { schemaVersion: 1, items: [{ ...base, externalId: 'external-1' }] };
    assert.deepEqual(f.studio.importPack(pack), { imported: 1, skipped: 0 });
    assert.deepEqual(f.studio.importPack({ ...pack, items: [{ ...pack.items[0], body: 'changed upstream' }] }), { imported: 0, skipped: 1 });
    assert.equal(f.studio.list()[0].body, base.body);
  } finally { f.clean(); }
});
test('intake validates whole batch atomically and rejects malformed fields', () => {
  const f = fixture(); try {
    for (const bad of [{ schemaVersion: 2, items: [] }, { schemaVersion: 1, items: [{ ...base }] }, { schemaVersion: 1, items: [{ ...base, externalId: 'ok' }, { ...base, externalId: '../bad' }] }, { schemaVersion: 1, items: [{ ...base, externalId: 'ok', stage: 'Posted' }] }]) assert.throws(() => f.studio.importPack(bad));
    assert.equal(f.studio.list().length, 0);
    for (const bad of [{ ...base, owner: 'anyone' }, { ...base, title: '' }, { ...base, media: [] }, { ...base, body: 'x'.repeat(100001) }, { ...base, plannedAt: 'tomorrow' }, { ...base, stage: 'Scheduled' }]) assert.throws(() => f.studio.create(bad));
    assert.throws(() => f.studio.get('../escape')); assert.throws(() => f.studio.get('not-found'));
  } finally { f.clean(); }
});
test('exports use fixed safe root, unique files, and retain both versions', () => {
  const f = fixture(); try { const a = f.studio.create({ ...base, title: '../../outside' }); const one = f.studio.exportItem(a.id); const two = f.studio.exportItem(a.id);
    assert.notEqual(one.path, two.path); assert.ok(one.path.startsWith(f.exports)); assert.equal(readdirSync(f.exports).length, 2); assert.match(readFileSync(one.path, 'utf8'), /Draft body/);
    assert.throws(() => f.studio.exportItem('../bad'));
    assert.throws(() => new Studio(join(f.root, 'other.sqlite'), `${f.root}/../escape`));
  } finally { f.clean(); }
});
test('export rejects a symlink ancestor', () => {
  const f = fixture(); try { const target = join(f.root, 'target'); mkdirSync(target); const link = join(f.root, 'link'); symlinkSync(target, link, 'junction');
    assert.throws(() => new Studio(join(f.root, 'other.sqlite'), join(link, 'exports')), /symlink|junction/i);
  } finally { f.clean(); }
});
