/* Thin Thi Lar Games — small, soft sound effects made on the fly with Web Audio (no sound files).
   TTLSound.play('name', extra) · TTLSound.toggle() · TTLSound.bind(button) for a 🔊/🔇 switch.
   The on/off choice is shared by every game (localStorage 'tg.sound'). */
(function(){
"use strict";
let ctx=null, out=null, on=true;
try{ on=localStorage.getItem('tg.sound')!=='off'; }catch(e){}
const N={C4:261.63,D4:293.66,E4:329.63,G4:392,A4:440,C5:523.25,D5:587.33,E5:659.25,G5:783.99,A5:880,C6:1046.5,D6:1174.66,E6:1318.51,G6:1567.98};

function ac(){
  if(!ctx){
    const C=window.AudioContext||window.webkitAudioContext; if(!C) return null;
    ctx=new C(); const comp=ctx.createDynamicsCompressor(); out=ctx.createGain(); out.gain.value=0.55;
    out.connect(comp); comp.connect(ctx.destination);
  }
  if(ctx.state==='suspended') ctx.resume();
  return ctx;
}
/* one soft note: frequency, start (s from now), length (s), options */
function tone(f,t0,d,o){
  o=o||{}; const c=ctx, at=c.currentTime+t0, osc=c.createOscillator(), g=c.createGain();
  osc.type=o.type||'sine'; osc.frequency.setValueAtTime(f,at);
  if(o.to) osc.frequency.exponentialRampToValueAtTime(o.to,at+d);
  const v=o.vol||0.16;
  g.gain.setValueAtTime(0.0001,at); g.gain.exponentialRampToValueAtTime(v,at+(o.attack||0.008));
  g.gain.exponentialRampToValueAtTime(0.0001,at+d);
  osc.connect(g); g.connect(out); osc.start(at); osc.stop(at+d+0.03);
}
/* a short puff of filtered noise (munching, bubbles, whoosh) */
function noise(t0,d,freq,o){
  o=o||{}; const c=ctx, at=c.currentTime+t0, len=Math.max(1,Math.floor(c.sampleRate*d));
  const buf=c.createBuffer(1,len,c.sampleRate), ch=buf.getChannelData(0); for(let i=0;i<len;i++) ch[i]=Math.random()*2-1;
  const src=c.createBufferSource(); src.buffer=buf;
  const f=c.createBiquadFilter(); f.type=o.type||'bandpass'; f.frequency.setValueAtTime(freq,at); if(o.to) f.frequency.exponentialRampToValueAtTime(o.to,at+d); f.Q.value=o.q||1.2;
  const g=c.createGain(); const v=o.vol||0.14; g.gain.setValueAtTime(0.0001,at); g.gain.exponentialRampToValueAtTime(v,at+0.01); g.gain.exponentialRampToValueAtTime(0.0001,at+d);
  src.connect(f); f.connect(g); g.connect(out); src.start(at); src.stop(at+d+0.02);
}
const arp=(notes,gap,len,o)=>notes.forEach((f,i)=>tone(f,i*gap,len,o));

const S={
  /* everyday taps */
  tap:   ()=>tone(N.A5,0,0.06,{type:'triangle',vol:0.07}),
  click: ()=>tone(N.E5,0,0.05,{vol:0.07}),
  del:   ()=>tone(N.A4,0,0.08,{type:'triangle',vol:0.07,to:N.E4}),
  hint:  ()=>{ tone(N.E6,0,0.12,{vol:0.07}); tone(N.A5,0.07,0.16,{vol:0.07}); },
  nope:  ()=>{ tone(N.D4,0,0.12,{type:'triangle',vol:0.12}); tone(N.C4*0.94,0.1,0.18,{type:'triangle',vol:0.11}); },
  /* word puzzles */
  flip:  (n)=>{ n=n||5; const sc=[N.C5,N.D5,N.E5,N.G5,N.A5,N.C6]; for(let i=0;i<n;i++) tone(sc[i%sc.length],i*0.22+0.1,0.09,{type:'triangle',vol:0.08}); },
  lock:  (n)=>{ n=n||1; const sc=[N.E5,N.G5,N.A5,N.C6,N.D6,N.E6]; for(let i=0;i<n;i++) tone(sc[Math.min(i,sc.length-1)],i*0.09,0.18,{vol:0.1}); },
  match: ()=>arp([N.C5,N.E5,N.G5,N.C6],0.08,0.3,{type:'triangle',vol:0.1}),
  win:   ()=>{ arp([N.C5,N.E5,N.G5,N.C6,N.E6],0.1,0.45,{type:'triangle',vol:0.11}); [N.C5,N.E5,N.G5].forEach(f=>tone(f,0.55,0.9,{vol:0.05})); },
  lose:  ()=>arp([N.G4,N.E4,N.C4],0.22,0.4,{vol:0.1}),
  /* Little Egg */
  warm:  ()=>tone(N.C5,0,0.1,{vol:0.1,to:N.G5}),
  rumble:()=>{ for(let i=0;i<6;i++) noise(i*0.3,0.18,180,{type:'lowpass',vol:0.12}); },
  hatch: (r)=>{ r=r||0; noise(0,0.25,1800,{vol:0.1,to:600}); arp([N.C5,N.E5,N.G5,N.C6],0.09,0.35,{type:'triangle',vol:0.11});
                if(r>=1) arp([N.E6,N.G6],0.08,0.3,{vol:0.06});
                if(r>=2){ for(let i=0;i<6;i++) tone([N.C6,N.E6,N.G6][i%3],0.45+i*0.07,0.25,{vol:0.05}); }
                if(r>=3){ [N.C5,N.E5,N.G5,N.C6].forEach(f=>tone(f,0.9,1.2,{type:'triangle',vol:0.06})); } },
  eat:   ()=>{ for(let i=0;i<3;i++) noise(i*0.13,0.07,900,{vol:0.13}); tone(N.G5,0.42,0.15,{vol:0.07}); },
  snack: ()=>{ for(let i=0;i<2;i++) noise(i*0.12,0.06,1200,{vol:0.12}); arp([N.E6,N.G6],0.07,0.18,{vol:0.07}); },
  clean: ()=>{ for(let i=0;i<7;i++){ const f=500+Math.random()*700; tone(f,i*0.07,0.08,{vol:0.07,to:f*1.6}); } },
  sleep: ()=>arp([N.G5,N.E5,N.D5,N.C5],0.28,0.5,{vol:0.07}),
  wake:  ()=>arp([N.C5,N.E5,N.G5],0.1,0.25,{type:'triangle',vol:0.09}),
  med:   ()=>{ tone(320,0,0.12,{vol:0.12,to:190}); tone(280,0.16,0.14,{vol:0.1,to:160}); tone(N.E6,0.38,0.2,{vol:0.05}); },
  right: ()=>{ tone(N.E6,0,0.25,{vol:0.1}); tone(N.C6,0,0.25,{type:'triangle',vol:0.05}); },
  wrong: ()=>tone(N.G4,0,0.22,{type:'triangle',vol:0.1,to:N.D4}),
  done:  ()=>arp([N.C5,N.D5,N.E5],0.1,0.25,{vol:0.08}),
  grow:  ()=>{ arp([N.C5,N.E5,N.G5,N.C6,N.G5,N.C6,N.E6],0.11,0.4,{type:'triangle',vol:0.1}); [N.C5,N.G5].forEach(f=>tone(f,0.8,1.1,{vol:0.05})); },
  newEgg:()=>{ for(let i=0;i<5;i++) tone([N.G5,N.C6,N.E6,N.G6,N.C6][i],i*0.06,0.3,{vol:0.05}); },
  free:  ()=>{ noise(0,0.7,400,{vol:0.08,to:3000}); arp([N.G5,N.E6],0.35,0.5,{vol:0.06}); },
  back:  ()=>arp([N.E5,N.G5,N.C6,N.E6],0.09,0.3,{type:'triangle',vol:0.1}),
  sad:   ()=>arp([N.E5,N.D5,N.C5,N.A4],0.25,0.45,{vol:0.07})
};
/* tiny tap/click sounds wait one moment so a bigger sound from the same tap can replace them */
const SOFT={tap:1,click:1}; let pending=null, lastBig=0;
function play(name,extra){
  if(!on || !S[name]) return;
  if(!ac()) return;
  if(SOFT[name]){
    if(pending || performance.now()-lastBig<80) return;
    pending=setTimeout(()=>{ pending=null; if(performance.now()-lastBig<80) return; try{ S[name](extra); }catch(e){} },0); return;
  }
  lastBig=performance.now(); if(pending){ clearTimeout(pending); pending=null; }
  try{ S[name](extra); }catch(e){}
}
const binds=[];
function paint(){ binds.forEach(b=>{ b.textContent= on?'🔊':'🔇'; b.setAttribute('aria-label', on?'Sound on':'Sound off'); b.setAttribute('aria-pressed', on?'true':'false'); }); }
function toggle(){ on=!on; try{ localStorage.setItem('tg.sound',on?'on':'off'); }catch(e){} paint(); if(on) play('wake'); return on; }
function bind(el){ if(!el) return; binds.push(el); el.addEventListener('click',e=>{ e.stopPropagation(); toggle(); }); paint(); }
window.TTLSound={play,toggle,bind,isOn:()=>on};
})();
