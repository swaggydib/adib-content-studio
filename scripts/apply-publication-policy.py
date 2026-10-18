"""Explicit one-time policy update; never changes routine schedules or credentials."""
import argparse,json,pathlib,re,subprocess,shutil
parser=argparse.ArgumentParser();parser.add_argument('--apply',action='store_true');args=parser.parse_args()
root=pathlib.Path(__file__).resolve().parent.parent
jobs_path=pathlib.Path('D:/Hermes/profiles/social-manager/cron/jobs.json')
before=json.loads(jobs_path.read_text(encoding='utf-8-sig'))
ids=['eeee27007806','9074747296c7']
exe=shutil.which('hermes.exe') or shutil.which('hermes')
assert exe,'Hermes launcher not found'
policy=('CANONICAL OUTPUT — PUBLISHED-ONLY: Content Studio SQLite is canonical for active LinkedIn drafts, revisions and approvals. '
'Never write or mirror unpublished drafts, rejected ideas, draft packs, routine plans or routine reports into Obsidian. '
'Keep concise feedback in Bot Chat and optional dated local workspace reports/plans. Emit genuinely NEW LinkedIn drafts as schema-v1 JSON into workspace studio-inbox, stable externalId/ideaId, source references actual learning/research evidence or the actual inbox pack, never invented vault drafts. '
'Only the dashboard exports a frozen version to Obsidian after Adib confirms real post URL, time and exact version. Do not create publication confirmations, export drafts or edit vault index/Home/About/other notes. '
'Existing vault notes are historical context and must not be deleted or migrated automatically. Vault unavailable is not a blocker for draft intake. No secrets, paid APIs, social posting or changes outside LinkedIn. This supersedes older canonical-vault instructions and prior continuity outputs.')
contract=('CONTENT STUDIO: Read workspace studio-intake-guide.md and D:/personal/projects/adib-content-studio/docs/STUDIO-INTAKE.md. '
'Only genuinely NEW LinkedIn drafts may emit validated schema-v1 JSON to D:/Hermes/profiles/social-manager/workspace/studio-inbox, platform=linkedin. '
'Check existing content and rejected/deleted ID tombstones read-only with node scripts/intake-status.ts from D:/personal/projects/adib-content-studio; no DB writes or credential access. '
'Preserve human versions and approval; never resurrect a rejected idea under new IDs. Do not touch IG/TikTok records. '
'No new draft means no new inbox pack. Feedback-only runs do not create unsolicited drafts. Retain stable IDs and provenance in Bot Chat/continuity, never claim ingestion without a receipt. '
'PUBLISHED-ONLY: Bot Chat and optional bounded workspace planning/report notes continue; no draft/report/plan writes into Obsidian. No publishing or schedule changes.')
for job_id in ids:
 job=next(j for j in before['jobs'] if j['id']==job_id)
 prompt=re.sub(r'CANONICAL OUTPUT[^\n]*',lambda _:policy,job['prompt'])
 prompt=re.sub(r'CONTENT STUDIO:[^\n]*',lambda _:contract,prompt)
 assert 'PUBLISHED-ONLY' in prompt and 'all human-readable reports/plans/drafts go DIRECTLY' not in prompt
 if args.apply:
  p=subprocess.run([exe,'-p','social-manager','cron','edit',job_id,'--prompt',prompt],capture_output=True,text=True,encoding='utf8',timeout=45)
  if p.returncode:raise RuntimeError('Supported cron edit failed; private diagnostics withheld')
 else:print('Would update prompt only:',job_id)
if args.apply:
 after=json.loads(jobs_path.read_text(encoding='utf-8-sig'))
 for old in before['jobs']:
  new=next(j for j in after['jobs'] if j['id']==old['id'])
  for k in set(old)|set(new):
   if k=='prompt' and old['id'] in ids:continue
   assert old.get(k)==new.get(k),(old['id'],k)
  if old['id'] in ids:assert 'PUBLISHED-ONLY' in new['prompt'] and 'canonical vault policy take' not in new['prompt']
 result={'updatedPrompts':ids,'allOtherFieldsUnchanged':True,'schedulesUnchanged':True,'deliveryAndContinuityUnchanged':True,'naturalRunTested':False}
 (root/'artifacts/publication-cron-verification.json').write_text(json.dumps(result,indent=2))
 print(json.dumps(result,indent=2))
