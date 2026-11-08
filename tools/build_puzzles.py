import sys, os, json, random, csv, math, re
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import *; from content import *
f=load_freq(); n,a,s=load_words(); known=a|s
EXTRA_OK=set(ANSWER_CANDIDATES[-40:])  # hand-confirmed tail
# ---- Mode A: word guess
answers=[]; seen=set()
for w in ANSWER_CANDIDATES:
    w=clean(w); sy=syls(w)
    if w in seen or len(sy)!=2 or len(set(sy))!=2: continue
    if w in ('မုန့်ဟင်း','ကြောင်ပေါက်','မှန်ဘီး','ကြိုးတံ','ဒုတ်ချောင်း'): continue
    if not (w in known or f.get(w,0)>=50 or w in EXTRA_OK): print('skip',w); continue
    seen.add(w); answers.append(w)
dict2=set()
for w in known|set(answers):
    sy=syls(w)
    if len(sy)==2 and all(re.fullmatch(r'[က-႟]+',x) for x in sy): dict2.add(w)
bysyl={}
for w in dict2:
    for x in syls(w): bysyl.setdefault(x,set()).add(w)
rng=random.Random(20261108)
common2=sorted([w for w in dict2 if f.get(w,0)>=200], key=lambda w:-f.get(w,0))
A=[]
order=answers[:]; rng.shuffle(order)
for ans in order:
    s1,s2=syls(ans); bank=[s1,s2]
    rel=[w for w in (bysyl.get(s1,set())|bysyl.get(s2,set())) if w!=ans]
    rel.sort(key=lambda w:-f.get(w,0)); rel=rel[:12]; rng.shuffle(rel)
    for w in rel[:4]:
        for x in syls(w):
            if x not in bank and len(bank)<12: bank.append(x)
    while len(bank)<12:
        w=rng.choice(common2[:3000])
        for x in syls(w):
            if x not in bank and len(bank)<12: bank.append(x)
    rng.shuffle(bank); bs=set(bank)
    valid=sorted(w for w in dict2 if all(x in bs for x in syls(w)))
    A.append({"a":ans,"b":bank,"v":valid})
print('A puzzles',len(A),'avg valid',sum(len(p['v']) for p in A)/len(A))
# ---- Mode B: proverbs (segment with unigram Viterbi)
tot=sum(f.values())
def wscore(w): return math.log((f.get(w,0)+0.1)/tot) + (0 if w in f else -8)
def seg(sy):
    n=len(sy); best=[(0,[])]+[(-1e9,None)]*n
    for i in range(1,n+1):
        for k in range(1,min(4,i)+1):
            w=''.join(sy[i-k:i]); sc=best[i-k][0]+wscore(w)+ (2 if k>1 and w in f else 0)
            if sc>best[i][0]: best[i]=(sc,best[i-k][1]+[w])
    return best[n][1]
B=[]; seenp=set()
for row in csv.reader(open(D+'/BurmeseProverbDataSet/proverbs.csv',encoding='utf8')):
    if len(row)<2: continue
    p=clean(row[1]).strip('"')
    if not p or p in seenp or any(c in p for c in CRUDE): continue
    if re.search(r'[^က-႟ ၊။]',p): continue
    seenp.add(p)
    phrases=[x for x in re.split(r'[ ၊။]+',p) if x]
    tiles=[]
    for ph in phrases:
        ws=seg(syls(ph))
        # merge words into chunks of <=3 syllables
        cur=''
        for w in ws:
            if cur and len(syls(cur+w))<=2: cur+=w
            elif cur and len(syls(w))==1 and len(syls(cur+w))<=3: cur+=w
            else:
                if cur: tiles.append(cur)
                cur=w
        if cur: tiles.append(cur)
    t2=[]
    for t in tiles:
        sy=syls(t)
        while len(sy)>3:
            t2.append(''.join(sy[:2])); sy=sy[2:]
        t2.append(''.join(sy))
    tiles=t2
    total=len(syls(p.replace(' ','')))
    if 4<=len(tiles)<=9 and 5<=total<=20 and len(set(tiles))==len(tiles):
        B.append({"p":p,"t":tiles})
rng.shuffle(B); print('B puzzles',len(B))
# ---- Mode C: connections
groups=[{"d":g[0],"my":g[1],"en":g[2],"w":[clean(x) for x in g[3]]} for g in GROUPS]
allw=[w for g in groups for w in g['w']]; dup={w for w in allw if allw.count(w)>1}; print('dup words',dup)
ex={frozenset(e) for e in EXCLUDE}
bylevel={d:[g for g in groups if g['d']==d] for d in (1,2,3,4)}
C=[]; last=[]
while len(C)<365:
    pick=[rng.choice(bylevel[d]) for d in (1,2,3,4)]
    names=[g['en'] for g in pick]
    if any(frozenset((x,y)) in ex for i,x in enumerate(names) for y in names[i+1:]): continue
    key=tuple(sorted(names))
    if key in last[-60:]: continue
    last.append(key)
    C.append([[groups.index(g)]+sorted(rng.sample(range(len(g['w'])),4)) for g in pick])
print('C puzzles',len(C))
json.dump({"A":A,"B":B,"C":C,"G":groups},open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','pahaeli','src','puzzles.json'),'w'),ensure_ascii=False,separators=(',',':'))
import os; print(os.path.getsize(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','pahaeli','src','puzzles.json')))
for p in A[:5]: print(p['a'],p['b'],len(p['v']),p['v'][:15])
for p in B[:12]: print(p['p'],'|'.join(p['t']))
