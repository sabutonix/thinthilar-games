import re, math, csv, glob, os, unicodedata
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','data')
CONS=r"က-အ"; EN=r"a-zA-Z0-9"; OTHER=r"ဣဤဥဦဧဩဪဿ၌၍၏၀-၉၊။!-/:-@[-`{-~\s"
BP=re.compile(r"((?<!္)["+CONS+r"](?![့]?[်္])|["+EN+OTHER+r"])")
def clean(s):
    s=unicodedata.normalize('NFC',s).replace('﻿','').replace('​','').replace('&nbsp;',' ')
    return re.sub(r'\s+',' ',s).strip()
def syls(s):
    s=clean(s).replace(' ','')
    out=BP.sub('|'+r"\1",s).split('|')
    return [x for x in out if x]
def load_freq():
    f={}
    for line in open(D+'/ye-kyaw-thu_myWord/dict_ver1/unigram-word.txt',encoding='utf8'):
        p=line.rstrip('\n').split('\t')
        if len(p)==2:
            try: f[clean(p[0])]=int(p[1])
            except: pass
    return f
def load_words():
    nouns=set(); allw=set()
    for fn in glob.glob(D+'/myanmartools_myanmar-words/text-files/*/*.txt'):
        pos=fn.split('/')[-2]
        for l in open(fn,encoding='utf8'):
            w=clean(l)
            if w and not w.startswith('#'):
                allw.add(w)
                if pos=='နာမ်များ': nouns.add(w)
    spell=set(clean(l) for l in open(D+'/kanaung_wordlists/wordlists.list',encoding='utf8') if clean(l))
    return nouns, allw, spell
