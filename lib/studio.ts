import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, parse, resolve } from 'node:path';

export const STAGES = ['Idea', 'Draft', 'Script Review', 'Ready to Record', 'Editing', 'Final Review', 'Ready to Publish', 'On Hold', 'Dropped', 'Rejected'] as const;
export type Stage = typeof STAGES[number];
export type Platform = 'linkedin' | 'instagram' | 'tiktok';
export type Owner = 'Adib' | 'Hermes';
export interface Content { ideaId: string; title: string; platform: Platform; format: 'text' | 'video'; body: string; source: string; owner: Owner; account: string; media: string; audience: string; plannedAt: string }
export interface Approval { id: string; kind: 'stage'; version: number; stage: Stage; at: string; note: string; snapshot: Content }
export interface History { id: string; at: string; action: string; version: number; note: string; from: Stage | null; to: Stage; approval?: Approval }
export interface Version { version: number; at: string; snapshot: Content }
export interface Item extends Content { id: string; stage: Stage; version: number; approvals: Approval[]; history: History[]; versions: Version[] }
export class StudioError extends Error { status: number; constructor(message: string, status = 400) { super(message); this.status = status; this.name = 'StudioError'; } }
const fields = ['ideaId', 'title', 'platform', 'format', 'body', 'source', 'owner', 'account', 'media', 'audience', 'plannedAt'] as const;
const sizes: Record<string, number> = { ideaId: 128, title: 240, body: 100000, source: 100000, account: 2048, media: 10000, audience: 1000, plannedAt: 64 };
function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new StudioError('Expected an object'); return value as Record<string, unknown>; }
function keys(value: Record<string, unknown>, allowed: readonly string[]) { for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new StudioError(`Unknown field: ${key}`); }
function text(value: unknown, field: string, max: number, required = false): string { if (typeof value !== 'string' || value.length > max || value.includes('\u0000') || (required && !value.trim())) throw new StudioError(`Invalid ${field}`); return value; }
function identifier(value: unknown, field = 'id'): string { const id = text(value, field, 128, true); if (!/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(id)) throw new StudioError(`Invalid ${field}`); return id; }
function expected(value: unknown): number { if (!Number.isSafeInteger(value) || (value as number) < 1) throw new StudioError('A positive expected version is required'); return value as number; }
function validate(input: Record<string, unknown>, existing?: Content): Content {
  const out = { ideaId: '', title: '', platform: 'linkedin', format: 'text', body: '', source: '', owner: 'Adib', account: '', media: '', audience: '', plannedAt: '', ...existing } as Content;
  for (const field of fields) if (Object.hasOwn(input, field)) (out as unknown as Record<string, unknown>)[field] = input[field];
  for (const [field, max] of Object.entries(sizes)) text((out as unknown as Record<string, unknown>)[field], field, max, field === 'title');
  if (out.ideaId) identifier(out.ideaId, 'ideaId');
  if (!['linkedin', 'instagram', 'tiktok'].includes(out.platform)) throw new StudioError('Invalid platform');
  if (!['text', 'video'].includes(out.format)) throw new StudioError('Invalid format');
  if (!['Adib', 'Hermes'].includes(out.owner)) throw new StudioError('Invalid owner');
  if (out.plannedAt && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(out.plannedAt) || !Number.isFinite(Date.parse(out.plannedAt)))) throw new StudioError('Invalid plannedAt: include timezone');
  return out;
}
function snapshot(item: Content): Content { return Object.fromEntries(fields.map(f => [f, item[f]])) as unknown as Content; }
function safeRoot(input: string): string {
  if (!isAbsolute(input) || input.split(/[\\/]/).some(p => p === '..' || p === '.')) throw new StudioError('Export root must be absolute without traversal');
  const root = resolve(input); let current = parse(root).root;
  for (const part of root.slice(current.length).split(/[\\/]/).filter(Boolean)) { current = join(current, part); if (existsSync(current)) { const stat = lstatSync(current); if (stat.isSymbolicLink()) throw new StudioError('Export root contains symlink/junction'); if (!stat.isDirectory()) throw new StudioError('Export root ancestor is not a directory'); } }
  return root;
}
export class Studio {
  private db: DatabaseSync;
  private exportRoot: string;
  constructor(dbPath = process.env.STUDIO_DB ?? 'data/studio.sqlite', exportRoot = process.env.STUDIO_EXPORT_ROOT ?? 'D:/personal/obsidian/second_brain/02-Projects/social-media-manager/content-studio') {
    this.exportRoot = safeRoot(exportRoot);
    if (dbPath !== ':memory:') mkdirSync(dirname(resolve(dbPath)), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.db.exec(readFileSync(resolve(process.cwd(), 'lib/schema.sql'), 'utf8'));
  }
  close() { this.db.close(); }
  list(): Item[] { return (this.db.prepare('SELECT document FROM studio_items ORDER BY created_at DESC, id').all() as { document: string }[]).map(r => JSON.parse(r.document)); }
  get(id: string): Item {
    identifier(id); const row = this.db.prepare('SELECT document FROM studio_items WHERE id = ?').get(id) as { document: string } | undefined;
    if (!row) throw new StudioError('Content not found', 404); return JSON.parse(row.document);
  }
  private insert(content: Content, externalId?: string): Item {
    const now = new Date().toISOString(); const id = randomUUID();
    const item: Item = { ...content, ideaId: content.ideaId || id, id, stage: externalId || content.body.trim() ? 'Draft' : 'Idea', version: 1, approvals: [], history: [], versions: [] };
    item.history.push({ id: randomUUID(), at: now, action: externalId ? 'import' : 'create', version: 1, note: externalId ? `Imported ${externalId}; no approval or publication permission` : '', from: null, to: item.stage });
    item.versions.push({ version: 1, at: now, snapshot: snapshot(item) });
    this.db.prepare('INSERT INTO studio_items(id,external_id,version,document,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(id, externalId ?? null, 1, JSON.stringify(item), now, now); return item;
  }
  create(input: unknown): Item { const raw = object(input); keys(raw, fields); return this.insert(validate(raw)); }
  private save(item: Item, previous: number): Item {
    const result = this.db.prepare('UPDATE studio_items SET version=?,document=?,updated_at=? WHERE id=? AND version=?').run(item.version, JSON.stringify(item), new Date().toISOString(), item.id, previous);
    if (result.changes !== 1) throw new StudioError('Version conflict; reload content', 409); return item;
  }
  update(id: string, input: unknown): Item {
    const raw = object(input); keys(raw, [...fields, 'version']); const version = expected(raw.version); const item = this.get(id);
    if (version !== item.version) throw new StudioError('Version conflict; reload content', 409);
    const next = validate(raw, item); const changed = fields.filter(f => next[f] !== item[f]); if (!changed.length) return item;
    const from = item.stage; const relevant = changed.some(f => f !== 'owner'); Object.assign(item, next); item.version++;
    if (relevant) { item.approvals = []; if (['Script Review', 'Ready to Record', 'Editing', 'Final Review', 'Ready to Publish'].includes(item.stage)) item.stage = 'Draft'; }
    const now = new Date().toISOString(); item.versions.push({ version: item.version, at: now, snapshot: snapshot(item) });
    item.history.push({ id: randomUUID(), at: now, action: 'update', version: item.version, note: `Changed: ${changed.join(', ')}${relevant ? '; stage approvals invalidated' : ''}`, from, to: item.stage });
    return this.save(item, version);
  }
  action(id: string, input: unknown): Item {
    const raw = object(input); keys(raw, ['action', 'version', 'note']); const version = expected(raw.version); const item = this.get(id);
    if (version !== item.version) throw new StudioError('Version conflict; reload content', 409);
    const action = text(raw.action, 'action', 40, true); const note = raw.note === undefined ? '' : text(raw.note, 'note', 5000); const from = item.stage;
    let to: Stage | undefined;
    if (action === 'submit' && ['Idea','Draft'].includes(from)) { if (!item.body.trim()) throw new StudioError('Isi naskah sebelum mengajukan review'); to = 'Script Review'; }
    if (action === 'approve' && from === 'Script Review') to = item.format === 'video' ? 'Ready to Record' : 'Ready to Publish';
    if (action === 'approve' && from === 'Final Review') to = 'Ready to Publish';
    if (action === 'revision' && ['Script Review', 'Ready to Record', 'Editing', 'Final Review', 'Ready to Publish'].includes(from)) { if (!note.trim()) throw new StudioError('Revision note is required'); to = 'Draft'; }
    if (action === 'recorded' && from === 'Ready to Record') to = 'Editing';
    if (action === 'finish-edit' && from === 'Editing') to = 'Final Review';
    if (action === 'hold' && !['On Hold', 'Dropped', 'Rejected'].includes(from)) to = 'On Hold';
    if (action === 'resume' && from === 'On Hold') to = 'Draft';
    if (action === 'drop' && !['Dropped','Rejected'].includes(from)) to = 'Dropped';
    if (action === 'reject' && !['Rejected','Dropped'].includes(from)) to = 'Rejected';
    if (action === 'reopen' && ['Rejected','Dropped'].includes(from)) to = 'Draft';
    if (!to) throw new StudioError(`Invalid action/transition: ${action} from ${from}`);
    const now = new Date().toISOString(); const event: History = { id: randomUUID(), at: now, action, version: version + 1, note, from, to };
    if (action === 'approve') { const approval: Approval = { id: randomUUID(), kind: 'stage', version, stage: from, at: now, note, snapshot: snapshot(item) }; item.approvals.push(approval); event.approval = approval; }
    if (['revision', 'resume', 'drop', 'reject', 'reopen'].includes(action)) item.approvals = [];
    if (action === 'revision') item.owner = 'Hermes'; else if (['submit', 'finish-edit'].includes(action)) item.owner = 'Adib';
    item.stage = to; item.version++; item.history.push(event); return this.save(item, version);
  }
  importPack(input: unknown): { imported: number; skipped: number } {
    const pack = object(input); keys(pack, ['schemaVersion', 'items']);
    if (pack.schemaVersion !== 1 || !Array.isArray(pack.items) || pack.items.length > 100) throw new StudioError('Invalid intake schemaVersion/items (maximum 100)');
    const batch = pack.items.map(value => { const raw = object(value); keys(raw, [...fields, 'externalId']); const externalId = identifier(raw.externalId, 'externalId');
      for (const field of fields.filter(f => f !== 'ideaId')) if (!Object.hasOwn(raw, field)) throw new StudioError(`Missing intake field: ${field}`);
      return { externalId, content: validate(raw) }; });
    let imported = 0, skipped = 0; this.db.exec('BEGIN IMMEDIATE');
    try { for (const entry of batch) { if (this.db.prepare('SELECT id FROM studio_items WHERE external_id=?').get(entry.externalId) || (entry.content.ideaId && this.list().some(i => i.ideaId === entry.content.ideaId && ['Rejected','Dropped'].includes(i.stage)))) skipped++; else { this.insert(entry.content, entry.externalId); imported++; } } this.db.exec('COMMIT'); }
    catch (error) { this.db.exec('ROLLBACK'); throw error; } return { imported, skipped };
  }
  exportItem(id: string): { path: string } {
    const item = this.get(id); const root = safeRoot(this.exportRoot); mkdirSync(root, { recursive: true }); safeRoot(root);
    const file = join(root, `${new Date().toISOString().slice(0, 10)}-studio-${randomUUID()}.md`);
    const content = `# Content Studio — ${item.title.replace(/[\r\n]/g, ' ')}\n\nSnapshot only; SQLite remains source of truth. Stage approval is NOT permission to publish.\n\n- ID: ${item.id}\n- Platform: ${item.platform}\n- Stage: ${item.stage}\n- Version: ${item.version}\n- Owner: ${item.owner}\n- Planned locally (not scheduled): ${item.plannedAt || 'Not set'}\n\n## Content\n\n${item.body}\n\n## Source evidence\n\n${item.source}\n\n## Full audit snapshot\n\n${JSON.stringify(item, null, 2)}\n`;
    writeFileSync(file, content, { flag: 'wx', encoding: 'utf8' }); return { path: file };
  }
}
let singleton: Studio | undefined;
export function getStudio(): Studio { return singleton ??= new Studio(); }
