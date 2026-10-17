import pathlib,sys,subprocess
p=pathlib.Path('C:/Users/LENOVO/AppData/Local/hermes/profiles/social-manager/workspace')
print('workspace canonical:',p.resolve());print('python:',sys.executable)
for parent in [p,*p.parents]:
 if parent.is_symlink() or parent.is_junction():print('alias:',parent)
