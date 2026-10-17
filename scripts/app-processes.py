import json,pathlib,subprocess
# Discover only app-owned listeners. No secrets or unrelated commands are printed.
ports={3000,3001,3002}
net=subprocess.run(['netstat','-ano'],capture_output=True,text=True).stdout
pids=set()
for line in net.splitlines():
 fields=line.split()
 if len(fields)>=5 and fields[0]=='TCP' and fields[3]=='LISTENING' and fields[1] in {f'127.0.0.1:{p}' for p in ports}:pids.add(int(fields[-1]))
# CIM returns only these process identities, never system-wide command lines.
script='Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -in @('+','.join(map(str,sorted(pids)))+') } | Select-Object ProcessId,ParentProcessId,ExecutablePath,CommandLine | ConvertTo-Json -Compress'
p=subprocess.run(['powershell.exe','-NoProfile','-Command',script],capture_output=True,text=True,encoding='utf8')
records=json.loads(p.stdout) if p.stdout.strip() else []
if isinstance(records,dict):records=[records]
for r in records:
 command=r.get('CommandLine') or ''
 if 'adib-content-studio' in command or ('next' in command.lower() and '/node_modules/next/' in command.replace('\\','/').lower()):
  print(json.dumps(r))
pathlib.Path('artifacts/followup-app-processes.json').write_text(json.dumps(records,indent=2),encoding='utf8')
