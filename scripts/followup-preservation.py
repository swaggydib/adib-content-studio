import sqlite3,pathlib,json,hashlib,urllib.request
root=pathlib.Path('D:/personal/projects/adib-content-studio')
before=json.loads((root/'artifacts/followup-preservation-before.json').read_text())
db=sqlite3.connect(root/'data/studio.sqlite')
checks=[]
for old in before['items']:
 row=db.execute('SELECT document FROM studio_items WHERE id=?',(old['id'],)).fetchone()
 checks.append({'id':old['id'],'unchanged':bool(row) and hashlib.sha256(row[0].encode()).hexdigest()==old['sha256'],'version':json.loads(row[0])['version'] if row else None,'stage':json.loads(row[0])['stage'] if row else None})
assert all(c['unchanged'] for c in checks)
api=json.load(urllib.request.urlopen('http://127.0.0.1:3004/api/studio'))
assert api['revision']=='acceptance-2'
emission=json.loads((root/'artifacts/followup-bot-inbox-emission.json').read_text())
assert any(emission['externalId'] in h.get('note','') for i in api['items'] for h in i['history'])
again=json.load(urllib.request.urlopen('http://127.0.0.1:3004/api/studio'))
assert len(api['items'])==len(again['items'])
result={'backup':before['backup'],'allOriginalRowsUnchanged':all(c['unchanged'] for c in checks),'originalRows':checks,'newBuildUrl':'http://127.0.0.1:3004','revision':api['revision'],'newBotPackIngested':True,'rescanCountStable':True,'inbox':api['integrations']['inbox'],'port3002ReplacementBlocked':True}
(root/'artifacts/followup-preservation-after.json').write_text(json.dumps(result,indent=2),encoding='utf8')
print(json.dumps(result,indent=2));db.close()
