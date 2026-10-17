import sqlite3,pathlib
root=pathlib.Path('D:/personal/projects/adib-content-studio');qa=root/'artifacts/ui-qa';qa.mkdir(exist_ok=True);(qa/'inbox').mkdir(exist_ok=True);(qa/'vault').mkdir(exist_ok=True)
a=sqlite3.connect(root/'data/studio.sqlite');b=sqlite3.connect(qa/'studio.sqlite');a.backup(b);a.close();b.close();print('Isolated UI QA database backed up from live SQLite; no original writes.')
