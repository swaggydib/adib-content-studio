import { readFileSync } from 'node:fs';
import { Studio } from '../lib/studio.ts';

const sourcePath = 'C:/Users/LENOVO/AppData/Local/hermes/profiles/social-manager/workspace/drafts/first-draft-pack.md';
const raw = readFileSync(sourcePath, 'utf8');
const headings = [...raw.matchAll(/^## (LI-01|LI-02|IG-01|TT-01) — (.+)$/gm)];
if (headings.length !== 4) throw new Error('Expected exactly four source draft sections');
const items = headings.map((heading, index) => {
  const end = headings[index + 1]?.index ?? raw.indexOf('## Persetujuan yang masih diperlukan', heading.index);
  if (end < 0) throw new Error('Missing final source approval boundary');
  const section = raw.slice(heading.index, end).trim();
  const code = heading[1];
  const video = code === 'TT-01';
  const bodyHeading = video ? '### Visual pembuka, kalimat pembuka, dan daftar pengambilan gambar' : code === 'IG-01' ? '### Usulan caption' : '### Usulan teks unggahan';
  const start = section.indexOf(bodyHeading);
  if (start < 0) throw new Error(`Missing body heading for ${code}`);
  const bodyStart = start + bodyHeading.length;
  const nextHeading = section.indexOf('\n### ', bodyStart);
  const body = section.slice(bodyStart, nextHeading < 0 ? undefined : nextHeading).trim();
  const account = section.match(/^- Akun: (.+)$/m)?.[1] ?? '';
  return { externalId: `first-draft-pack-2026-10-17:${code}`, ideaId: code === 'IG-01' || video ? 'desk-session-2026-10' : code,
    title: heading[2], platform: video ? 'tiktok' : code.startsWith('IG') ? 'instagram' : 'linkedin', format: video ? 'video' : 'text', body,
    source: `${sourcePath}#${code}\n\n${section}`, owner: 'Adib', account, media: '', audience: '', plannedAt: '' };
});
const studio = new Studio();
try {
  const result = studio.importPack({ schemaVersion: 1, items });
  const persisted = studio.list();
  if (items.some(item => !persisted.some(saved => saved.title === item.title && saved.body === item.body && saved.source === item.source))) throw new Error('Import read-back verification failed');
  console.log(JSON.stringify({ ...result, verifiedSourceSections: items.length, totalItems: persisted.length, note: 'Drafts only. Proposed dates/audiences retained as source evidence, not scheduling or approval.' }, null, 2));
} finally { studio.close(); }
