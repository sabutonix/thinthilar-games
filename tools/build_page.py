"""Build pahaeli/index.html from pahaeli/src/game.template.html + pahaeli/src/puzzles.json"""
import json, os, sys
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
from common import syls
ROOT=os.path.join(HERE,'..')
d=json.load(open(os.path.join(ROOT,'pahaeli','src','puzzles.json'),encoding='utf8'))
for p in d['A']: p['s']=syls(p['a'])
for g in d['G']: g['w']=['|'.join(syls(w.replace('|',''))) for w in g['w']]
s=open(os.path.join(ROOT,'pahaeli','src','game.template.html'),encoding='utf8').read()
s=s.replace('/*PUZZLES*/',json.dumps(d,ensure_ascii=False,separators=(',',':')))
open(os.path.join(ROOT,'pahaeli','index.html'),'w',encoding='utf8').write(s)
print('built pahaeli/index.html', len(s))
