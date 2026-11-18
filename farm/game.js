const key = 'ttl.farm.v1';
const crops = {
  rice: {name:'စပါး', frame:0, time:12000},
  corn: {name:'ပြောင်း', frame:5, time:20000},
  sesame: {name:'နှမ်း', frame:15, time:30000}
};
const orders = [
  {items:{rice:1, egg:1}, price:12},
  {items:{corn:2}, price:16},
  {items:{oil:1}, price:24}
];
const names = {rice:'စပါး', corn:'ပြောင်း', sesame:'နှမ်း', egg:'ဥ', oil:'ဆီ'};
const el = id => document.getElementById(id);
function read(){
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : {actions:0, coins:0, shipments:0, plots:[null,null,null], stock:{rice:0,corn:0,sesame:0,egg:0,oil:0}, nextEgg:0};
}
function change(action){
  const farm = read();
  const message = action(farm,Date.now());
  if(!message) return;
  farm.actions++;
  localStorage.setItem(key,JSON.stringify(farm));
  el('notice').textContent=message;
  render();
  window.TTLAccount?.sync();
}
function plotAction(farm,index,now){
  const plant = farm.plots[index];
  if(!plant){
    farm.plots[index]={type:el('seed').value,watered:0};
    return 'စိုက်ပြီးပြီ။ ရေလောင်းပေးပါ။';
  }
  if(!plant.watered){plant.watered=now;return 'ရေလောင်းပြီးပြီ။';}
  if(now-plant.watered<crops[plant.type].time) return;
  farm.stock[plant.type]++;
  farm.plots[index]=null;
  return 'ရိတ်သိမ်းပြီးပြီ။';
}
el('plots').onclick=event=>{
  const btn=event.target.closest('button[data-index]');
  if(btn) change((farm,now)=>plotAction(farm,Number(btn.dataset.index),now));
};
el('collect').onclick=()=>change((farm,now)=>{
  if(now<farm.nextEgg)return;
  farm.stock.egg++;farm.nextEgg=now+45000;return 'ကြက်ဥ ရပါပြီ။';
});
el('oil').onclick=()=>change(farm=>{
  if(farm.stock.sesame<2)return;
  farm.stock.sesame-=2;farm.stock.oil++;return 'နှမ်းဆီ ရပါပြီ။';
});
el('deliver').onclick=()=>change(farm=>{
  const order=orders[farm.shipments%orders.length];
  if(!canFill(farm,order))return;
  for(const [item,n] of Object.entries(order.items))farm.stock[item]-=n;
  farm.coins+=order.price;farm.shipments++;return 'အမှာစာ ပို့ပြီးပြီ။';
});
function canFill(farm,order){return Object.entries(order.items).every(([item,n])=>farm.stock[item]>=n);}
function render(){
  const farm=read(),now=Date.now(),order=orders[farm.shipments%orders.length];
  el('stats').textContent='🪙 '+farm.coins+'  ·  '+Object.entries(farm.stock).map(([item,n])=>names[item]+' '+n).join(' · ');
  farm.plots.forEach((plant,index)=>{
    let btn=el('plots').children[index];
    if(!btn){btn=document.createElement('button');btn.className='plot';btn.dataset.index=index;btn.innerHTML='<img alt=""><img class="plant" alt=""><span></span>';el('plots').append(btn);}
    const crop=plant && crops[plant.type];
    const ratio=plant?.watered?(now-plant.watered)/crop.time:0;
    btn.children[0].src='art/'+(plant?.watered?'wet':'dry')+'.png';
    btn.children[1].style.display=plant?'block':'none';
    if(plant)btn.children[1].src='art/crop-'+(crop.frame+Math.min(3,Math.floor(ratio*3)))+'.png';
    btn.lastChild.textContent=!plant?'စိုက်မယ်':!plant.watered?'ရေလောင်း':ratio>=1?'ရိတ်သိမ်း':Math.ceil((1-ratio)*crop.time/1000)+' s';
    btn.disabled=Boolean(plant?.watered && ratio<1);
  });
  el('order').textContent=Object.entries(order.items).map(([item,n])=>names[item]+' '+n).join(' + ')+' → 🪙 '+order.price;
  el('deliver').disabled=!canFill(farm,order);
  el('oil').disabled=farm.stock.sesame<2;
  el('collect').disabled=now<farm.nextEgg;
  el('collect').textContent=now<farm.nextEgg?'နောက်ဥ · '+Math.ceil((farm.nextEgg-now)/1000)+' s':'ဥကောက်မယ်';
}
window.TTLAccount?.mount('#account',['farm']);
render();
setInterval(render,1000);
