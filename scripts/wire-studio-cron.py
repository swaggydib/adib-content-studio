import json,pathlib,subprocess,shutil
root=pathlib.Path('D:/personal/projects/adib-content-studio')
workspace=pathlib.Path('C:/Users/LENOVO/AppData/Local/hermes/profiles/social-manager/workspace')
jobs_path=workspace.parent/'cron/jobs.json'
before=json.loads(jobs_path.read_text(encoding='utf-8-sig'))
(root/'artifacts/followup-cron-before.json').write_text(json.dumps(before,indent=2),encoding='utf8')
guide=workspace/'studio-intake-guide.md'
if guide.exists():
    assert guide.read_bytes()==(root/'docs/STUDIO-INTAKE.md').read_bytes(), 'Existing guide differs; do not overwrite'
else:
    with guide.open('xb') as f:f.write((root/'docs/STUDIO-INTAKE.md').read_bytes())
exe=shutil.which('hermes.exe') or 'D:/Hermes/hermes-agent/.hermes/bin/hermes.exe'
append='\n\nCONTENT STUDIO INTAKE v1: In addition to ALL existing tasks and deliverables above, read workspace studio-intake-guide.md (full source D:/personal/projects/adib-content-studio/docs/STUDIO-INTAKE.md). For genuinely NEW drafts only, emit a validated schema-v1 JSON pack to workspace/studio-inbox using stable externalId and ideaId. Check existing and rejected ideas read-only with the fixed node scripts/intake-status.ts command from app root; never replace human edits, approvals, or rejected ideas under new IDs. Retain prior IDs in continuity/report. Feedback-only runs must NOT create spam drafts: no new content means no inbox pack. Keep Bot Chat and NEW Obsidian report outputs unchanged. Report emitted file path and pending ingestion honestly; never claim publication or scheduling.'
ids=['eeee27007806','9074747296c7']
for job_id in ids:
    job=next(j for j in before['jobs'] if j['id']==job_id)
    prompt=job['prompt'] if 'CONTENT STUDIO INTAKE v1:' in job['prompt'] else job['prompt']+append
    p=subprocess.run([exe,'-p','social-manager','cron','edit',job_id,'--prompt',prompt],capture_output=True,text=True,encoding='utf8',timeout=40)
    if p.returncode:raise RuntimeError('Supported cron edit failed for '+job_id)
after=json.loads(jobs_path.read_text(encoding='utf-8-sig'))
for old in before['jobs']:
    new=next(j for j in after['jobs'] if j['id']==old['id'])
    for key in old:
        if key!='prompt':assert new[key]==old[key],f'Unexpected job field changed: {key}'
    assert new['prompt'].startswith(old['prompt'])
    assert 'CONTENT STUDIO INTAKE v1:' in new['prompt']
(root/'artifacts/followup-cron-after.json').write_text(json.dumps(after,indent=2),encoding='utf8')
print('Verified exact two prompts extended; all other job fields unchanged; guide:',guide)
