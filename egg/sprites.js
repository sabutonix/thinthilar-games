/* Little Egg — pixel art.
   Each body is drawn as the LEFT half (8 columns × 16 rows); it is mirrored to make 16×16.
   Letters: . empty · o outline · a main · b light (belly/face) · c accent (stripes, spots, ears, wings)
            p pink · e eye · w eye shine · y beak/feet.
   To add an animal later: add it to the END of SPECIES (never reorder — saved games use the ids). */
(function(){
const BODY = {
cat:[
"........",
".o......",
".oo.....",
".oao....",
".oapo...",
".oaaoooo",
"oaaaaaca",
"oaaaaaaa",
"oaaweaaa",
"oaaeeaaa",
"oaaaaaap",
".oaabbbb",
"..oooooo",
"..oabbbb",
".oaabbbb",
".oooo.oo"],
dog:[
"........",
"........",
"..oooooo",
".oaaaaaa",
"occaaaaa",
"occaaaaa",
"occaweaa",
"occaeeaa",
"occaaaaa",
".ocabbbb",
"..oabbbo",
"...ooooo",
"..oabbbb",
".oaabbbb",
".oaabbbb",
".oooo.oo"],
lizard:[
"......oo",
".....oaa",
".....eaa",
".....oaa",
"......oa",
"..o..oaa",
"..ooooca",
"....oaaa",
"....oaca",
"....oaaa",
"..o.oaca",
"..ooooaa",
".....oaa",
"......oa",
"......oa",
".......o"],
bird:[
"........",
"....oooo",
"...oaaaa",
"..oaaaaa",
"..oaweaa",
"..oaeeaa",
"..oaaaay",
"..oaaayy",
"..ocbbby",
".occbbbb",
".occbbbb",
".occbbbb",
"..ocbbbb",
"...ooooo",
".....y..",
"....yy.."],
owl:[
"........",
"..o.....",
"..oo....",
"..oaoooo",
".oaaaaaa",
".oabbbaa",
".oabweaa",
".oabeeaa",
".oabbbay",
".oaaaaay",
".occbbbb",
".occbcbb",
".occbbbb",
"..ocbcbb",
"...ooooo",
"....yy.."],
turtle:[
"........",
"......oo",
".....oaa",
".....eaa",
".oo..ooo",
".oaoobbb",
"..ooccbc",
"...obcbb",
"...obbcc",
"...obcbb",
"..ooccbc",
".oaoobbb",
".oo..ooo",
"......oa",
".......o",
"........"],
hedgehog:[
"........",
"...c.c.c",
"..cccccc",
".ccccccc",
".cccoooo",
"cccobbbb",
"ccobbbbb",
"ccobwebb",
"ccobeebb",
"ccobpbbb",
"ccobbbbo",
".ccobbbb",
".cccoooo",
"..cobbbb",
"..obbbbb",
"..ooo.oo"],
egg:[
"........",
"......oo",
".....oaa",
"....oaaa",
"...oaaaa",
"...oaaca",
"..oaaaaa",
"..oacaaa",
"..oaaaaa",
".oaaaaca",
".oaaaaaa",
".oacaaaa",
".oaaaaaa",
"..obaaaa",
"...oobbb",
".....ooo"],
blob:[ /* baby stage: a round little blob in the animal's colours */
"........",
"........",
"........",
"........",
"........",
"......oo",
"....ooaa",
"...oaaaa",
"..oaawea",
"..oaaeea",
".oaaaaaa",
".oaaaaap",
".oabbbbb",
"..oabbbb",
"...ooooo",
"........"]
};

/* rarity: 0 common · 1 uncommon · 2 rare · 3 super rare */
const SPECIES = [
 {id:'cat_orange', body:'cat', r:0, my:'ကြောင်ဝါ', en:'Orange cat', pal:{a:'#f0a04b',b:'#fff3e0',c:'#c46a1b',p:'#f29b9b'}},
 {id:'cat_grey',   body:'cat', r:0, my:'ကြောင်မီးခိုး', en:'Grey cat', pal:{a:'#9aa3ad',b:'#eef0f3',c:'#9aa3ad',p:'#f29b9b'}},
 {id:'cat_tux',    body:'cat', r:0, my:'အဖြူအမည်း ကြောင်', en:'Black-and-white cat', pal:{a:'#34343c',b:'#ffffff',c:'#34343c',p:'#f29b9b',o:'#111114'}},
 {id:'dog_brown',  body:'dog', r:0, my:'ခွေးညို', en:'Brown dog', pal:{a:'#b07a45',b:'#f1dcc0',c:'#7a4f28'}},
 {id:'dog_white',  body:'dog', r:0, my:'ခွေးကလေး အဖြူ', en:'White puppy', pal:{a:'#f7f6f2',b:'#ffffff',c:'#e2b98a'}},
 {id:'cat_burmese',body:'cat', r:1, my:'ဗမာကြောင်', en:'Burmese cat', pal:{a:'#7a5235',b:'#a5784f',c:'#7a5235',p:'#d98c7a',e:'#c99a1a'}},
 {id:'cat_siamese',body:'cat', r:1, my:'ယိုးဒယားကြောင်', en:'Siamese cat', pal:{a:'#efe3cc',b:'#fffaf0',c:'#4a3426',p:'#4a3426',e:'#2f6fe0'}},
 {id:'cat_persian',body:'cat', r:1, my:'ပါရှန်းကြောင်', en:'Persian cat', pal:{a:'#f6f1e8',b:'#ffffff',c:'#e4d7c3',p:'#f2a7b6',e:'#c99a1a'}},
 {id:'dog_pom',    body:'dog', r:1, my:'ပိုမရေနီယန် ခွေး', en:'Pomeranian', pal:{a:'#f08a24',b:'#ffd8a8',c:'#d46c10'}},
 {id:'dog_golden', body:'dog', r:1, my:'ရွှေဝါ ခွေး', en:'Golden retriever', pal:{a:'#e0a94a',b:'#f7e1b5',c:'#c0852c'}},
 {id:'gecko',      body:'lizard', r:2, my:'တောက်တဲ့', en:'Gecko', pal:{a:'#8fb0d6',c:'#f07b3f'}},
 {id:'chameleon',  body:'lizard', r:2, my:'ပုတ်သင်ညို', en:'Chameleon', pal:{a:'#5bb56a',c:'#f2c94c'}},
 {id:'parrot',     body:'bird', r:2, my:'ကြက်တူရွေး', en:'Parrot', pal:{a:'#e53935',b:'#ffd54f',c:'#1e63d6',y:'#3b3b3b'}},
 {id:'myna',       body:'bird', r:2, my:'ဇရက်', en:'Myna', pal:{a:'#3b2f2a',b:'#6b5a50',c:'#241c18',y:'#f2c200',o:'#120d0b'}},
 {id:'owl',        body:'owl', r:2, my:'ဇီးကွက်', en:'Owl', pal:{a:'#9c7b5b',b:'#efe2cc',c:'#6f5238',y:'#f2b134'}},
 {id:'turtle',     body:'turtle', r:3, my:'လိပ်', en:'Turtle', pal:{a:'#8fc27c',b:'#7a9a3c',c:'#4f6b2a'}},
 {id:'hedgehog',   body:'hedgehog', r:3, my:'ဖြူကလေး', en:'Hedgehog', pal:{a:'#a07c5c',b:'#f2dfc6',c:'#8a6a50'}}
];
const RARITY = [
 {my:'သာမန်', en:'Common', col:'#8b929c', w:60},
 {my:'ထူးခြား', en:'Uncommon', col:'#2563eb', w:28},
 {my:'ရှားပါး', en:'Rare', col:'#8b3fd9', w:10},
 {my:'အလွန်ရှားပါး', en:'Super rare', col:'#c9962b', w:2}
];
const BASE = {o:'#2b2f36', e:'#1d1f24', w:'#ffffff', p:'#f29b9b', y:'#f2b134', a:'#cccccc', b:'#eeeeee', c:'#999999'};
const EGG_PAL = {a:'#fbf6ea', b:'#e9dcc0', c:'#9ec1f5', o:'#6b5f4c'};

function rows(name){ const h=BODY[name]; return h.map(r=>{ r=(r+'........').slice(0,8); return r + r.split('').reverse().join(''); }); }
const CACHE={};
function grid(name){ return CACHE[name] || (CACHE[name]=rows(name)); }

/* draw a 16×16 sprite; opts: {flip, sil (silhouette colour), shine} */
function draw(ctx, name, pal, x, y, px, opts){
  opts=opts||{}; const g=grid(name); const P=Object.assign({},BASE,pal||{});
  for(let r=0;r<16;r++){ const row=g[r];
    for(let c=0;c<16;c++){ const ch=row[opts.flip?15-c:c]; if(ch==='.') continue;
      ctx.fillStyle = opts.sil || P[ch] || '#f0f';
      ctx.fillRect(Math.round(x+c*px), Math.round(y+r*px), Math.ceil(px), Math.ceil(px)); } }
}
/* Drawn art (made in Gemini, cleaned by tools/art/slice_sprites.py): egg/art/<id>.png = 4 frames of 40x40
   (baby, child, teen, adult). Animals listed here use the art; the rest keep the 16x16 code sprites above. */
const ART=['cat_orange','cat_grey','cat_tux','dog_white','dog_brown','cat_burmese','cat_siamese','cat_persian','dog_pom','dog_golden','gecko','chameleon','myna','owl','turtle','parrot','hedgehog','egg'];
const IMG={}, TOPS={}, SHUT={};
/* Closed-eye copy of an animal's art, made automatically: an eye is a small dark patch that is not on the outline
   and has a light "shine" pixel inside it. It is painted over with the fur colour and a little closed-eye line. */
function shutEyes(c,x,d){
  const W=c.width, lum=i=>0.3*d[i]+0.59*d[i+1]+0.11*d[i+2], A=(xx,yy)=>xx>=0&&yy>=0&&xx<W&&yy<40?d[(yy*W+xx)*4+3]:0;
  const dark=(xx,yy)=>A(xx,yy)>0 && lum((yy*W+xx)*4)<70;
  const out=document.createElement('canvas'); out.width=W; out.height=40; const o=out.getContext('2d'); o.drawImage(c,0,0);
  /* fallback for dark faces and big coloured eyes: start at a light shine pixel and take the nearby pixels that differ from the fur around it */
  const rgb=i=>[d[i],d[i+1],d[i+2]], dist=(p,q)=>Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])+Math.abs(p[2]-q[2]);
  function shineEyes(f){
    let top=40,bot=0; for(let yy=0;yy<40;yy++) for(let xx=f*40;xx<f*40+40;xx++) if(A(xx,yy)){ top=Math.min(top,yy); bot=Math.max(bot,yy); }
    const lim=top+(bot-top)*0.55, res=[], used=new Set();
    for(let yy=top;yy<lim;yy++) for(let xx=f*40+1;xx<f*40+39;xx++){
      const i=(yy*W+xx)*4; if(!A(xx,yy)||lum(i)<170||used.has(yy*W+xx)) continue;
      let darker=0, edge=false; for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){ if(!dx&&!dy) continue; if(!A(xx+dx,yy+dy)){ edge=true; continue; } if(lum(((yy+dy)*W+xx+dx)*4)<lum(i)-60) darker++; }
      if(edge||darker<6) continue;
      const cnt={}; let best=null;
      for(let dy=-4;dy<=4;dy++) for(let dx=-4;dx<=4;dx++){ const m=Math.max(Math.abs(dx),Math.abs(dy)); if(m<3) continue; const a=xx+dx,b=yy+dy; if(!A(a,b)) continue; const k=rgb((b*W+a)*4).join(','); cnt[k]=(cnt[k]||0)+1; if(!best||cnt[k]>cnt[best]) best=k; }
      if(!best) continue; const fur=best.split(',').map(Number);
      const px=[], q=[[xx,yy]], seen=new Set([yy*W+xx]);
      while(q.length){ const [a,b]=q.pop(); px.push([a,b]);
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const na=a+dx,nb=b+dy,nk=nb*W+na; if(seen.has(nk)||Math.abs(na-xx)>3||Math.abs(nb-yy)>3||!A(na,nb)) continue;
          seen.add(nk); if(dist(rgb(nk*4),fur)>60) q.push([na,nb]); } }
      if(px.length<3||px.length>45) continue;
      px.forEach(([a,b])=>used.add(b*W+a));
      const xs=px.map(p=>p[0]), ys=px.map(p=>p[1]); let dk=px[0], dl=999; px.forEach(p=>{ const l=lum((p[1]*W+p[0])*4); if(l<dl){ dl=l; dk=p; } });
      res.push({x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys),col:(dk[1]*W+dk[0])*4,px,fur:'rgb('+fur.join(',')+')'});
    }
    return res.length>=2 && res.length<=3 ? res : [];
  }
  const ok=[];
  for(let f=0;f<4;f++){
    const seen=new Set(), eyes=[];
    for(let yy=0;yy<40;yy++) for(let xx=f*40;xx<f*40+40;xx++){
      const k=yy*W+xx; if(seen.has(k)||!dark(xx,yy)) continue;
      const q=[[xx,yy]], px=[]; seen.add(k); let edge=false;
      while(q.length){ const [a,b]=q.pop(); px.push([a,b]);
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const na=a+dx, nb=b+dy;
          if(na<f*40||na>=f*40+40||!A(na,nb)){ edge=true; continue; }
          const nk=nb*W+na; if(!seen.has(nk)&&dark(na,nb)){ seen.add(nk); q.push([na,nb]); } } }
      if(edge||px.length<2||px.length>40) continue;
      const xs=px.map(p=>p[0]), ys=px.map(p=>p[1]), x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys);
      let shine=0; for(let b=y0;b<=y1;b++) for(let a=x0;a<=x1;a++){ if(!dark(a,b) && A(a,b) && lum((b*W+a)*4)>190) shine++; }
      if(shine && shine<=6 && x1-x0<=6 && y1-y0<=6) eyes.push({x0,x1,y0,y1,col:(px[0][1]*W+px[0][0])*4});
    }
    if(eyes.length<2) eyes.splice(0,eyes.length,...shineEyes(f));
    ok[f]= eyes.length>=2 && eyes.length<=3;
    if(!ok[f]) continue;
    eyes.forEach(e=>{
      if(e.px){ o.fillStyle=e.fur; e.px.forEach(([a,b])=>o.fillRect(a,b,1,1)); }
      else {
      const fy=Math.max(0,e.y0-1), fi=(fy*W+Math.round((e.x0+e.x1)/2))*4;
      o.fillStyle= A(Math.round((e.x0+e.x1)/2),fy) ? `rgb(${d[fi]},${d[fi+1]},${d[fi+2]})` : '#000';
      o.fillRect(e.x0,e.y0,e.x1-e.x0+1,e.y1-e.y0+1); }
      o.fillStyle=`rgb(${d[e.col]},${d[e.col+1]},${d[e.col+2]})`;
      const ly=Math.round(e.y0+(e.y1-e.y0)*0.6);
      o.fillRect(e.x0,ly-1,1,1); o.fillRect(e.x1,ly-1,1,1); if(e.x1-e.x0>=2) o.fillRect(e.x0+1,ly,e.x1-e.x0-1,1); else o.fillRect(e.x0,ly,e.x1-e.x0+1,1);
    });
  }
  out.ok=ok; return ok.some(Boolean) ? out : null;
}
ART.forEach(id=>{ const im=new Image(); im.onload=()=>{ IMG[id]=im; try{
    const c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d'); x.drawImage(im,0,0);
    const d=x.getImageData(0,0,c.width,c.height).data, t=[];
    for(let f=0;f<4;f++){ let top=40; outer: for(let y=0;y<40;y++) for(let xx=0;xx<40;xx++) if(d[(y*c.width+f*40+xx)*4+3]>0){ top=y; break outer; } t.push(top); }
    TOPS[id]=t; if(id!=='egg') SHUT[id]=shutEyes(c,x,d); }catch(e){ TOPS[id]=[20,12,6,2]; } };
  im.src='art/'+id+'.png'; });
const hasArt=id=>!!IMG[id];
/* frames where the automatic closed eyes looked wrong (checked by eye, 15 Nov 2026) — these keep their eyes open */
const NO_SHUT={dog_brown:[2,3],parrot:[2],owl:[3],cat_siamese:[3]};
const canShut=(id,f)=>!!(SHUT[id] && SHUT[id].ok[f] && !(NO_SHUT[id]||[]).includes(f));
const artTop=(id,f)=>(TOPS[id]||[20,12,6,2])[f];
/* draw frame f (0-3) of an animal's art at x,y with pixel size px; opts {flip, sil, shut (eyes closed)} */
function drawArt(ctx,id,f,x,y,px,opts){
  opts=opts||{}; const im=IMG[id]; if(!im) return; ctx.save(); ctx.imageSmoothingEnabled=false;
  let srcEl= (opts.shut && canShut(id,f) && SHUT[id]) || im, sx=f*40;
  if(opts.sil){ const c=document.createElement('canvas'); c.width=c.height=40; const k=c.getContext('2d'); k.drawImage(srcEl,f*40,0,40,40,0,0,40,40); k.globalCompositeOperation='source-in'; k.fillStyle=opts.sil; k.fillRect(0,0,40,40); srcEl=c; sx=0; }
  if(opts.flip){ ctx.translate(Math.round(x+40*px),Math.round(y)); ctx.scale(-1,1); ctx.drawImage(srcEl,sx,0,40,40,0,0,40*px,40*px); }
  else ctx.drawImage(srcEl,sx,0,40,40,Math.round(x),Math.round(y),40*px,40*px);
  ctx.restore();
}
window.PETART = {BODY, SPECIES, RARITY, EGG_PAL, draw, grid, hasArt, canShut, artTop, drawArt};
})();
