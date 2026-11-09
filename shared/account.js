/* Thin Thi Lar Games — one sign-in for the whole site, and cloud saves for every game.
   Load this BEFORE a page's own script (it tidies the sign-in return address first),
   then call TTLAccount.mount(buttonElement, ['egg']) with the games that page shows.
   Saves go to Supabase through my_saves() / put_save() (see supabase/schema.sql).
   To add a game: add it to GAMES below (localStorage key + how to describe a save). */
(function(){
"use strict";
const SB_URL='https://rxfsmvbukzlcdgvkjcsg.supabase.co';
const SB_KEY='sb_publishable_8ElijCo3o5fFzw6VqtMuJA_WQsWB7vS';   // public by design
const AK='tg.auth', SK='tg.sync';

const GAMES={
  egg:{ls:'littleegg.v1', my:'ဥလေး', en:'Little Egg',
    pets:d=> d ? (d.pets || (d.pet?[d.pet]:[])) : [],
    empty(d){ return !d || (!this.pets(d).length && !(d.past&&d.past.length) && !Object.keys(d.dex||{}).length); },
    sum(d,L){ const p=this.pets(d), n=p.filter(x=>x.hatched).map(x=>x.name).filter(Boolean);
      return n.length ? n.join(', ') : p.length ? (L==='my'?'ဥ':'an egg') : (L==='my'?'အကောင်မရှိ':'no pets'); }},
  pahaeli:{ls:'pahaeli.v1', my:'ပဟေဠိ', en:'Pahaeli',
    empty(d){ return !d || (!Object.keys(d.games||{}).length && !(d.groups&&d.groups.length)); },
    sum(d,L){ const n=Object.keys((d&&d.games)||{}).length; return L==='my' ? ('ပဟေဠိ '+n+' ခု') : (n+' puzzles'); }}
};

const T={
 my:{title:'အကောင့်',pitch:'အကောင့်ဝင်ထားရင် ဂိမ်းအားလုံးရဲ့ တိုးတက်မှုကို သိမ်းထားပေးပြီး ဘယ်ဖုန်းကနေမဆို ဆက်ကစားနိုင်တယ်။',
  google:'Google ဖြင့် ဝင်မယ်',privacy:'ကိုယ်ရေးအချက်အလက် မူဝါဒ',signedAs:'ဝင်ထားသည်',saved:'သိမ်းပြီးပြီ ✓',saving:'သိမ်းနေတယ်…',
  offline:'အင်တာနက် မရ — နောက်မှ ထပ်သိမ်းမယ်',signOut:'အကောင့်မှ ထွက်မယ်',signOutNote:'ထွက်ပြီးရင်လည်း ဒီဖုန်းမှာ ဆက်ကစားလို့ရတယ်။ ပြန်ဝင်ရင် အကောင့်ထဲက တိုးတက်မှု ပြန်ရမယ်။',
  close:'ပိတ်မယ်',later:'နောက်မှ',conflictT:'ဘယ်ဟာကို ထားမလဲ?',conflictD:'{game} အတွက် ဒီဖုန်းမှာရော အကောင့်ထဲမှာပါ တိုးတက်မှု ရှိနေတယ်။ ဘယ်ဟာကို ထားမလဲ?',
  useCloud:'အကောင့်ထဲကဟာ',useLocal:'ဒီဖုန်းထဲကဟာ',conflictN:'မရွေးတဲ့ဘက်ကဟာကို အစားထိုးလိုက်မယ်။',
  hi:'မင်္ဂလာပါ {name}! တိုးတက်မှု သိမ်းထားပြီ',err:'အကောင့်ဝင်လို့ မရပါ — ထပ်ကြိုးစားကြည့်ပါ',out:'အကောင့်မှ ထွက်ပြီးပြီ',games:'သိမ်းထားသော ဂိမ်းများ'},
 en:{title:'Account',pitch:'Sign in to save your progress in every game and continue on any phone.',
  google:'Continue with Google',privacy:'Privacy policy',signedAs:'Signed in as',saved:'Saved ✓',saving:'Saving…',
  offline:"No internet — we'll save later",signOut:'Sign out',signOutNote:'You can keep playing on this phone after signing out. Sign in again to get your account progress back.',
  close:'Close',later:'Later',conflictT:'Which progress should we keep?',conflictD:'You have {game} progress on this phone and in your account. Which one should we keep?',
  useCloud:'From my account',useLocal:'From this phone',conflictN:'The other one will be replaced.',
  hi:'Hi {name}! Your progress is saved.',err:"Couldn't sign in — please try again",out:'Signed out',games:'Saved games'}
};
const L=()=>{ try{ return localStorage.getItem('tg.lang')==='en'?'en':'my'; }catch(e){ return 'my'; } };
const t=(k,v)=>{ let s=T[L()][k]; if(v) for(const x in v) s=s.split('{'+x+'}').join(v[x]); return s; };
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=(k,d)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } };
const put=(k,v)=>{ try{ if(v==null) localStorage.removeItem(k); else localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };

/* ---------- returning from Google: tokens arrive in the address after # ---------- */
let justIn=false, signErr='';
(function readReturn(){
  const h=location.hash; if(!/access_token=|error_description=|error=/.test(h)) return;
  const q=new URLSearchParams(h.slice(1)); let back='';
  try{ back=sessionStorage.getItem('tg.ret')||''; sessionStorage.removeItem('tg.ret'); }catch(e){}
  if(q.get('access_token')){ put(AK,{at:q.get('access_token'),rt:q.get('refresh_token'),exp:Math.floor(Date.now()/1000)+(+q.get('expires_in')||3600),user:null}); justIn=true; }
  else signErr=q.get('error_description')||q.get('error')||'error';
  try{ history.replaceState(null,'',location.pathname+location.search+back); }catch(e){}
})();

/* ---------- login token ---------- */
let auth=get(AK,null);
async function token(){
  if(!auth||!auth.rt) return null;
  if(auth.exp-90 > Date.now()/1000) return auth.at;
  const r=await fetch(SB_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:auth.rt})});
  if(r.status>=400 && r.status<500){ auth=null; put(AK,null); fire(); return null; }   // login expired or revoked
  if(!r.ok) throw new Error('offline');
  const j=await r.json(); auth={at:j.access_token,rt:j.refresh_token,exp:Math.floor(Date.now()/1000)+(j.expires_in||3600),user:userOf(j.user)||auth.user}; put(AK,auth);
  return auth.at;
}
function userOf(u){ if(!u) return null; const m=u.user_metadata||{}; return {id:u.id,email:u.email||m.email||'',name:m.full_name||m.name||(u.email||'').split('@')[0],pic:m.avatar_url||m.picture||''}; }
async function loadUser(){
  const tk=await token(); if(!tk) return null;
  if(auth.user) return auth.user;
  const r=await fetch(SB_URL+'/auth/v1/user',{headers:{apikey:SB_KEY,Authorization:'Bearer '+tk}});
  if(!r.ok) throw new Error('user');
  auth.user=userOf(await r.json()); put(AK,auth); return auth.user;
}
async function rpc(fn,args){
  const tk=await token(); if(!tk) throw new Error('signed out');
  const r=await fetch(SB_URL+'/rest/v1/rpc/'+fn,{method:'POST',keepalive:!!document.hidden,headers:{apikey:SB_KEY,Authorization:'Bearer '+tk,'Content-Type':'application/json'},body:JSON.stringify(args||{})});
  if(!r.ok) throw new Error(fn+' '+r.status);
  const x=await r.text(); return x?JSON.parse(x):null;
}

/* ---------- cloud save ---------- */
const canon=o=> Array.isArray(o) ? '['+o.map(canon).join(',')+']' : (o&&typeof o==='object') ? '{'+Object.keys(o).sort().map(k=>JSON.stringify(k)+':'+canon(o[k])).join(',')+'}' : JSON.stringify(o);
function hash(s){ let h=5381; for(let i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))|0; return (h>>>0).toString(36)+':'+s.length; }
const frozen=new Set();     // keys just replaced from the cloud: block old in-memory saves until the page reloads
const rawSet=Storage.prototype.setItem;
Storage.prototype.setItem=function(k,v){ if(this===window.localStorage && frozen.has(k)) return; return rawSet.call(this,k,v); };
let pageGames=[], status='', busy=false, lastPull=0;
function meta(){ const m=get(SK,null); return (m && auth && auth.user && m.uid===auth.user.id) ? m : {uid:auth&&auth.user?auth.user.id:'',g:{}}; }
function applyCloud(m,key,row){
  const s=JSON.stringify(row.data); rawSet.call(localStorage,GAMES[key].ls,s); frozen.add(GAMES[key].ls);
  m.g[key]={at:row.updated_at,h:hash(s)};
}
async function upload(m,key,s){ const at=await rpc('put_save',{p_game:key,p_data:JSON.parse(s)}); m.g[key]={at,h:hash(s)}; }
async function sync(full){
  if(busy||!auth) return; busy=true;
  try{
    await loadUser(); if(!auth) return;
    const m=meta(); let rows=null, reload=false;
    if(full){ rows={}; (await rpc('my_saves')||[]).forEach(r=>rows[r.game]=r); lastPull=Date.now(); }
    for(const key in GAMES){
      const G=GAMES[key], s=localStorage.getItem(G.ls), d=s?safe(s):null, mk=m.g[key];
      const localChanged= s!=null && (!mk || mk.h!==hash(s));
      if(!rows){ if(localChanged && !G.empty(d)){ setStatus('saving'); await upload(m,key,s); } continue; }
      const row=rows[key];
      if(!row){ if(s!=null && !G.empty(d)){ setStatus('saving'); await upload(m,key,s); } continue; }
      const cloudChanged= !mk || mk.at!==row.updated_at;
      if(!mk){                                   // first time this phone meets this account
        if(G.empty(d)){ applyCloud(m,key,row); reload=reload||pageGames.includes(key); }
        else if(canon(d)===canon(row.data)) m.g[key]={at:row.updated_at,h:hash(s)};
        else { const keepCloud=await ask(key,d,row.data); if(keepCloud){ applyCloud(m,key,row); reload=reload||pageGames.includes(key); } else { setStatus('saving'); await upload(m,key,s); } }
      } else if(cloudChanged && !localChanged){ applyCloud(m,key,row); reload=reload||pageGames.includes(key); }
      else if(localChanged && !cloudChanged){ setStatus('saving'); await upload(m,key,s); }
      else if(localChanged && cloudChanged){ const keepCloud=await ask(key,d,row.data); if(keepCloud){ applyCloud(m,key,row); reload=reload||pageGames.includes(key); } else { await upload(m,key,s); } }
    }
    put(SK,m); setStatus('saved');
    if(reload){ location.reload(); return; }
  }catch(e){ setStatus(auth?'offline':''); }
  finally{ busy=false; }
}
const safe=s=>{ try{ return JSON.parse(s); }catch(e){ return null; } };

/* ---------- small UI: account button, dialog, toast ---------- */
let btn=null, dlg=null, listeners=[];
function fire(){ paintBtn(); listeners.forEach(f=>{ try{ f(user()); }catch(e){} }); }
function user(){ return auth&&auth.user ? auth.user : null; }
function setStatus(s){ status=s; const el=document.getElementById('ttlAccStatus'); if(el) el.textContent= s ? t(s) : ''; }
function paintBtn(){
  if(!btn) return; const u=user();
  btn.innerHTML=''; btn.setAttribute('aria-label',t('title'));
  if(u && u.pic){ const i=document.createElement('img'); i.src=u.pic; i.alt=''; i.referrerPolicy='no-referrer'; i.style.cssText='width:28px;height:28px;border-radius:50%;display:block'; i.onerror=()=>{ btn.textContent=(u.name||'?').slice(0,1).toUpperCase(); }; btn.appendChild(i); }
  else if(u) btn.textContent=(u.name||'?').slice(0,1).toUpperCase();
  else btn.textContent='👤';
}
const GLOGO='<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 2.9-2.2 5.4-4.7 7.1l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.5z"/><path fill="#FBBC05" d="M10.6 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
function ensureDlg(){
  if(dlg) return dlg;
  dlg=document.createElement('dialog');
  dlg.style.cssText='border:0;border-radius:18px;padding:0;width:min(400px,calc(100vw - 24px));background:var(--surface,#fff);color:var(--ink,#1f2937);box-shadow:0 20px 50px rgba(0,0,0,.3)';
  dlg.addEventListener('click',e=>{ if(e.target===dlg && !dlg.dataset.sticky) dlg.close(); });
  dlg.addEventListener('cancel',e=>{ if(dlg.dataset.sticky) e.preventDefault(); });
  document.body.appendChild(dlg); return dlg;
}
const BTN='display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:48px;border-radius:12px;font:inherit;font-weight:700;cursor:pointer;';
const GBTN=BTN+'background:#fff;color:#1f1f1f;border:1px solid #747775;';
const SEC=BTN+'background:transparent;color:var(--ink,#1f2937);border:1px solid var(--line,#d9dde3);';
const PRI=BTN+'background:var(--blue,#2563eb);color:#fff;border:0;';
function show(html,sticky){ const d=ensureDlg(); d.innerHTML='<div style="padding:18px;display:flex;flex-direction:column;gap:12px;font-family:inherit;line-height:1.6">'+html+'</div>'; d.dataset.sticky=sticky?'1':''; if(!d.open) d.showModal(); return d; }
function close(){ if(dlg&&dlg.open) dlg.close(); }
function open(){
  const u=user();
  if(!u){
    show(`<h2 style="margin:0;font-size:1.3rem">${esc(t('title'))}</h2><p style="margin:0">${esc(t('pitch'))}</p>
      <button type="button" id="ttlG" style="${GBTN}">${GLOGO}${esc(t('google'))}</button>
      <a href="/privacy/" style="font-size:.85rem;color:var(--muted,#6b7280)">${esc(t('privacy'))}</a>
      <button type="button" id="ttlX" style="${SEC}">${esc(t('close'))}</button>`);
    dlg.querySelector('#ttlG').onclick=()=>signIn('google'); dlg.querySelector('#ttlX').onclick=close; return;
  }
  const names=Object.keys(GAMES).filter(k=>{ const s=localStorage.getItem(GAMES[k].ls); return s && !GAMES[k].empty(safe(s)); }).map(k=>GAMES[k][L()]);
  show(`<h2 style="margin:0;font-size:1.3rem">${esc(t('title'))}</h2>
    <div style="display:flex;align-items:center;gap:12px">${u.pic?`<img src="${esc(u.pic)}" alt="" referrerpolicy="no-referrer" style="width:48px;height:48px;border-radius:50%">`:''}
      <div><div style="font-size:.8rem;color:var(--muted,#6b7280)">${esc(t('signedAs'))}</div><b>${esc(u.name)}</b><div style="font-size:.85rem;color:var(--muted,#6b7280)">${esc(u.email)}</div></div></div>
    ${names.length?`<p style="margin:0;font-size:.9rem">${esc(t('games'))}: ${esc(names.join(', '))}</p>`:''}
    <p id="ttlAccStatus" style="margin:0;font-weight:700;color:var(--blue,#2563eb)">${status?esc(t(status)):''}</p>
    <button type="button" id="ttlOut" style="${SEC}">${esc(t('signOut'))}</button>
    <p style="margin:0;font-size:.8rem;color:var(--muted,#6b7280)">${esc(t('signOutNote'))}</p>
    <button type="button" id="ttlX" style="${PRI}">${esc(t('close'))}</button>`);
  dlg.querySelector('#ttlOut').onclick=signOut; dlg.querySelector('#ttlX').onclick=close;
  sync(true);
}
function ask(key,local,cloud){
  return new Promise(res=>{
    const G=GAMES[key], name=G[L()];
    show(`<h2 style="margin:0;font-size:1.25rem">${esc(t('conflictT'))}</h2><p style="margin:0">${esc(t('conflictD',{game:name}))}</p>
      <button type="button" id="ttlC" style="${PRI}">☁️ ${esc(t('useCloud'))} — ${esc(G.sum(cloud,L()))}</button>
      <button type="button" id="ttlL" style="${SEC}">📱 ${esc(t('useLocal'))} — ${esc(G.sum(local,L()))}</button>
      <p style="margin:0;font-size:.82rem;color:var(--muted,#6b7280)">${esc(t('conflictN'))}</p>`,true);
    dlg.querySelector('#ttlC').onclick=()=>{ close(); res(true); };
    dlg.querySelector('#ttlL').onclick=()=>{ close(); res(false); };
  });
}
function toast(msg){
  const el=document.createElement('div'); el.textContent=msg; el.setAttribute('role','status');
  el.style.cssText='position:fixed;left:50%;top:16px;transform:translateX(-50%);background:#1f2937;color:#fff;padding:10px 16px;border-radius:12px;font-weight:600;z-index:99;max-width:90vw;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.25)';
  document.body.appendChild(el); setTimeout(()=>el.remove(),3200);
}
function signIn(provider){
  try{ sessionStorage.setItem('tg.ret',location.hash||''); }catch(e){}
  const back=location.origin+location.pathname+location.search;
  location.href=SB_URL+'/auth/v1/authorize?provider='+encodeURIComponent(provider||'google')+'&redirect_to='+encodeURIComponent(back);
}
async function signOut(){
  const tk=auth&&auth.at; auth=null; put(AK,null); put(SK,null); close(); fire(); toast(t('out'));
  if(tk) fetch(SB_URL+'/auth/v1/logout',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+tk}}).catch(()=>{});
}
/* A gentle "save your progress?" invitation a game can show at a good moment (only when signed out). */
function invite(message){
  if(user()) return;
  show(`<p style="margin:0;font-size:1.05rem;font-weight:700">${esc(message)}</p><p style="margin:0;font-size:.9rem">${esc(t('pitch'))}</p>
    <button type="button" id="ttlG" style="${GBTN}">${GLOGO}${esc(t('google'))}</button>
    <button type="button" id="ttlX" style="${SEC}">${esc(t('later'))}</button>`);
  dlg.querySelector('#ttlG').onclick=()=>signIn('google'); dlg.querySelector('#ttlX').onclick=close;
}

/* ---------- start ---------- */
function mount(el,games){
  btn= typeof el==='string' ? document.querySelector(el) : el; pageGames=games||[];
  if(btn){ btn.onclick=open; paintBtn(); }
  if(signErr){ setTimeout(()=>toast(t('err')),300); }
  if(auth){
    loadUser().then(u=>{ fire(); if(justIn && u) toast(t('hi',{name:u.name})); return sync(true); }).catch(()=>{ fire(); });
    setInterval(()=>{ if(auth && !document.hidden) sync(Date.now()-lastPull>120000); }, 15000);
    document.addEventListener('visibilitychange',()=>{ if(!auth) return; if(document.hidden) sync(false); else if(Date.now()-lastPull>60000) sync(true); });
  }
}
window.TTLAccount={mount,open,invite,signIn,signOut,user,onUser:f=>listeners.push(f),sync:()=>sync(true)};
})();
