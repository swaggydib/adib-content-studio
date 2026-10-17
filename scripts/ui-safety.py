import sqlite3,pathlib,datetime,json,hashlib
root=pathlib.Path('D:/personal/projects/adib-content-studio');folder=root/'backups'/('ui-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S'));folder.mkdir(parents=True,exist_ok=False)
src=sqlite3.connect(root/'data/studio.sqlite');dst=sqlite3.connect(folder/'studio.sqlite');src.backup(dst);dst.close();rows=src.execute('SELECT id,document FROM studio_items ORDER BY id').fetchall();src.close()
manifest={'backup':str(folder/'studio.sqlite'),'items':[{'id':i,'hash':hashlib.sha256(d.encode()).hexdigest()} for i,d in rows]};(root/'artifacts/ui-preservation-before.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
for name in ['app/layout.tsx','app/globals.css','app/studio-app.tsx','app/followup-components.tsx','DESIGN.md']:
 target=folder/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes((root/name).read_bytes())
print(json.dumps({'backup':manifest['backup'],'count':len(rows)},indent=2))
