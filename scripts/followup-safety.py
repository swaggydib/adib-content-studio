import sqlite3, pathlib, datetime, json, hashlib, subprocess
root=pathlib.Path('D:/personal/projects/adib-content-studio')
stamp=datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
folder=root/'backups'/stamp
folder.mkdir(parents=True,exist_ok=False)
src=sqlite3.connect(root/'data/studio.sqlite'); dst=sqlite3.connect(folder/'studio.sqlite'); src.backup(dst); dst.close()
rows=src.execute('select id,document from studio_items order by id').fetchall()
manifest={'backup':str(folder/'studio.sqlite'),'count':len(rows),'items':[{'id':i,'sha256':hashlib.sha256(d.encode()).hexdigest(),'title':json.loads(d)['title'],'version':json.loads(d)['version'],'stage':json.loads(d)['stage']} for i,d in rows]}
src.close(); (folder/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
(root/'artifacts/followup-preservation-before.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
for p in ['lib/studio.ts','lib/worker.ts','app/studio-app.tsx','app/globals.css','app/api/studio/[[...path]]/route.ts','package.json','package-lock.json','README.md','DEV-HANDOFF.md']:
 target=folder/'source'/p;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes((root/p).read_bytes())
print(json.dumps(manifest,indent=2))
proc=subprocess.run(['netstat','-ano'],capture_output=True,text=True)
print('\nAPP PORTS\n'+'\n'.join(line for line in proc.stdout.splitlines() if any('127.0.0.1:'+str(p)+' ' in line for p in [3000,3001,3002])))
