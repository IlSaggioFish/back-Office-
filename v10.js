/* BACK OFFICE ADVENTURE DX v10 - BOSS, HUB VIVO, MISSIONI LATERALI, AUDIO/VFX */
'use strict';

const V10_KEY='boAdventureDXv10';
let v10={sideDone:{},coffeeBuff:false,quality:'auto',ambient:true,bossStaggers:0};
try{Object.assign(v10,JSON.parse(localStorage.getItem(V10_KEY)||'{}'));}catch(e){}
v10.sideDone ||= {};
function persistV10(){try{localStorage.setItem(V10_KEY,JSON.stringify(v10));}catch(e){}}
function v10HighFx(){return v10.quality==='high'||(v10.quality==='auto'&&!(matchMedia?.('(max-width: 620px)')?.matches));}

const V10_SIDE=[
  {icon:'📎',name:'Allegato disperso',desc:'Recupera l’allegato sopra l’archivio.',x:1730,y:92,reward:28},
  {icon:'📨',name:'Protocollo fantasma',desc:'Trova la ricevuta PEC nel percorso alto.',x:2070,y:92,reward:32},
  {icon:'🦺',name:'Riconsegna area',desc:'Recupera il verbale nel tratto sopraelevato.',x:2610,y:92,reward:35},
  {icon:'🧾',name:'NTW da chiudere',desc:'Raccogli la NTW rimasta nella sala dati.',x:2900,y:92,reward:38},
  {icon:'🧬',name:'Nodo di fusione',desc:'Disattiva il nodo secondario di Mengasi.',x:2230,y:92,reward:50}
];

const V10_HUB_WALKERS=[
  {name:'Farris',from:330,to:455,speed:.55,phase:0,color:'#4f88aa'},
  {name:'Yurii',from:500,to:635,speed:.48,phase:1.7,color:'#4d809d'},
  {name:'Luca',from:65,to:175,speed:.62,phase:3.2,color:'#5d91ab'},
  {name:'Tiziano',from:760,to:875,speed:.44,phase:4.4,color:'#8d7146'},
  {name:'Giada',from:250,to:385,speed:.51,phase:5.1,color:'#775c92'}
];

(function initV10UI(){
  document.title='Back Office Adventure DX v10';
  const logo=document.querySelector('.header .logo span');if(logo)logo.textContent='ADVENTURE DX v10';
  const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Boss rifiniti, Hub più vivo, missioni laterali nei livelli, audio ambientale e una Chiusura Definitiva di Mengasi in NG+ e Boss Rush.';
  const credits=document.querySelector('#credits h2');if(credits)credits.textContent='BACK OFFICE ADVENTURE DX v10';

  const shell=document.querySelector('.shell');
  if(shell&&!document.querySelector('#v10BossCue')){
    const cue=document.createElement('div');cue.id='v10BossCue';cue.className='v10BossCue';shell.appendChild(cue);
    const side=document.createElement('div');side.id='v10SideHud';side.className='v10SideHud hidden';shell.appendChild(side);
  }

  const settings=document.querySelector('#settingsModal .v7settings');
  if(settings&&!document.querySelector('#v10Quality')){
    const q=document.createElement('label');q.innerHTML='Qualità effetti <select id="v10Quality"><option value="auto">Auto</option><option value="high">Alta</option><option value="low">Bassa</option></select>';settings.appendChild(q);
    const a=document.createElement('label');a.innerHTML='<input id="v10Ambient" type="checkbox"> Audio ambientale';settings.appendChild(a);
    $('#v10Quality').value=v10.quality||'auto';$('#v10Ambient').checked=v10.ambient!==false;
    $('#v10Quality').onchange=e=>{v10.quality=e.target.value;persistV10();document.body.dataset.fx=v10.quality;};
    $('#v10Ambient').onchange=e=>{v10.ambient=e.target.checked;persistV10();};
  }
  document.body.dataset.fx=v10.quality;
})();

function setBossCue(text,kind='normal',ms=1300){
  const el=$('#v10BossCue');if(!el)return;el.textContent=text;el.className='v10BossCue show '+kind;clearTimeout(setBossCue.t);setBossCue.t=setTimeout(()=>el.classList.remove('show'),ms);
}
function updateSideHud(){
  const el=$('#v10SideHud');if(!el||!game?.w?.v10Side){el?.classList.add('hidden');return;}
  const s=game.w.v10Side;el.classList.remove('hidden');el.classList.toggle('done',!!s.done);el.innerHTML=`<b>${s.icon} ${s.name}</b><span>${s.done?'COMPLETATA':s.desc}</span>`;
}

// ---------- MISSIONI LATERALI NEI LIVELLI ----------
const v9MakeLevelV10=makeLevel;
makeLevel=function(idx){
  const res=v9MakeLevelV10(idx),w=res.w,cfg=V10_SIDE[idx];
  w.v10Side={...cfg,done:false,w:46,h:46};
  return res;
};

const v9StartGameV10=startGame;
startGame=function(){
  v9StartGameV10();if(!game)return;
  game.v10BossHits=[];game.v10RunStaggers=0;game.v10SideRewarded=false;
  if(v10.coffeeBuff){game.shield++;game.turboUntil=performance.now()+5000;v10.coffeeBuff=false;persistV10();showMsg('☕ CAFFÈ HUB • SCUDO + TURBO',1400);}
  updateSideHud();
};

function updateSideMission(){
  const s=game?.w?.v10Side;if(!s||s.done)return;
  if(hit(game.p,{x:s.x-23,y:s.y-23,w:46,h:46})){
    s.done=true;game.v10SideRewarded=true;v10.sideDone[game.idx]=true;save.totalStamps+=s.reward;persist();persistV10();addScore(120,s.x,s.y);sfx('clear');showMsg(`${s.icon} MISSIONE LATERALE • +${s.reward} MARCHE`,1800);updateSideHud();
  }
}

// ---------- HUB PIU' VIVO ----------
function v10CoffeeNear(){return !!hub?.open&&hub.x<78;}
const v9HubInteractV10=hubInteract;
hubInteract=function(){
  if(v10CoffeeNear()){
    if(v10.coffeeBuff)hubSay('Macchinetta: “Hai già preso il caffè operativo. Calma, è caffeina, non un upgrade infinito.”');
    else{v10.coffeeBuff=true;persistV10();hubSay('☕ Caffè operativo pronto: +1 scudo e turbo nella prossima partita.');}
    return;
  }
  v9HubInteractV10();
};
const v9DrawHubV10=drawHub;
drawHub=function(now){
  v9DrawHubV10(now);const c=$('#hubCanvas');if(!c)return;const x=c.getContext('2d'),t=now/1000;
  x.save();x.fillStyle='#26343e';x.fillRect(8,214,55,102);x.fillStyle='#79d8ff';x.fillRect(18,226,35,20);x.fillStyle='#111b22';x.fillRect(20,254,31,39);x.fillStyle='#e8edf0';x.font='20px system-ui';x.textAlign='center';x.fillText('☕',35,282);x.fillStyle=v10.coffeeBuff?'#85efad':'#ffd76a';x.font='bold 8px system-ui';x.fillText(v10.coffeeBuff?'PRONTO':'CAFFÈ',35,309);x.restore();
  for(const n of V10_HUB_WALKERS){
    const wave=(Math.sin(t*n.speed+n.phase)+1)/2,pos=n.from+(n.to-n.from)*wave,im=imgs?.[n.name];
    x.save();x.globalAlpha=.16;x.fillStyle='#000';x.beginPath();x.ellipse(pos,326,15,4,0,0,Math.PI*2);x.fill();x.globalAlpha=.92;x.strokeStyle='#17212b';x.lineWidth=5;x.lineCap='round';const step=Math.sin(t*9+n.phase)*5;x.beginPath();x.moveTo(pos-3,289);x.lineTo(pos-7-step,320);x.moveTo(pos+3,289);x.lineTo(pos+7+step,320);x.stroke();x.fillStyle=n.color;x.fillRect(pos-11,268,22,28);x.beginPath();x.arc(pos,254,14,0,Math.PI*2);x.clip();if(im?.complete)x.drawImage(im,pos-14,240,28,28);x.restore();
    x.save();x.globalAlpha=.7;x.fillStyle='#d7e9f3';x.font='bold 6px system-ui';x.textAlign='center';x.fillText(n.name.toUpperCase(),pos,338);x.restore();
  }
  if(v10CoffeeNear()){
    x.save();x.fillStyle='#07131ded';x.strokeStyle='#ffd269';x.lineWidth=2;x.fillRect(300,122,300,38);x.strokeRect(300,122,300,38);x.fillStyle='#fff3bf';x.textAlign='center';x.font='bold 10px system-ui';x.fillText('E / A • PRENDI CAFFÈ OPERATIVO',450,146);x.restore();
  }
};

// ---------- BOSS: STAGGER, FASI, CHIUSURA DEFINITIVA ----------
function v10BossPhase(b){return b?.v10Phase||b?.v8Phase||b?.phase||1;}
const v9StartBossV10=startBoss;
startBoss=function(){
  v9StartBossV10();const b=game?.boss;if(!b)return;
  b.v10StunUntil=0;b.v10LastPhase=v10BossPhase(b);b.v10Ultimate=false;b.v10UltimateLast=0;game.v10BossHits=[];game.v10RunStaggers=0;
  setBossCue(`⚠ ${b.name.toUpperCase()} • PREPARATI`,'boss',1500);
};
const v9UpdateBossV10=updateBoss;
updateBoss=function(dt,now){
  const before=game?.boss;if(before&&now<(before.v10StunUntil||0)){
    before.y+=Math.sin(now/65)*.25;game.projectiles=(game.projectiles||[]).filter(p=>p.telegraphUntil&&p.telegraphUntil>now);return;
  }
  const beforeHp=before?.hp,beforePhase=v10BossPhase(before);
  v9UpdateBossV10(dt,now);
  const b=game?.boss;if(!b)return;

  if(beforeHp!=null&&b.hp<beforeHp&&b.hp>0){
    game.v10BossHits=(game.v10BossHits||[]).filter(t=>now-t<4300);game.v10BossHits.push(now);
    if(game.v10BossHits.length>=3){
      game.v10BossHits=[];b.v10StunUntil=now+1250;game.projectiles=[];game.v10RunStaggers=(game.v10RunStaggers||0)+1;v10.bossStaggers=(v10.bossStaggers||0)+1;persistV10();setBossCue('💫 BOSS STORDITO • FINESTRA D’ATTACCO','stun',1250);showMsg('💫 STAGGER! ATTACCA ORA',1050);sfx('good');
    }
  }

  const phase=v10BossPhase(b);
  if(phase!==beforePhase&&b.hp>0){setBossCue(`🔥 ${b.name.toUpperCase()} • FASE ${phase}`,'phase',1500);game.cameraShake=Math.max(game.cameraShake||0,v7?.settings?.reducedShake?3:9);}

  if(b.name==='Mengasi'&&(ngPlus||game.mode==='bossrush')&&!b.v10Ultimate&&b.hp>0&&b.hp/b.max<=.09){
    b.v10Ultimate=true;b.v10Phase=5;b.hp=Math.max(b.hp,Math.ceil(b.max*.14));b.v10UltimateLast=0;game.projectiles=[];game.cameraShake=v7?.settings?.reducedShake?5:19;setBossCue('☠ MENGASI DEFINITIVO • FASE 5','ultimate',2200);showMsg('🧬 CHIUSURA DEFINITIVA',1900);if(typeof bossSpeak==='function')bossSpeak('Questa pratica non si chiude. Si estingue.');
  }
  if(b.v10Ultimate&&b.hp>0&&now-(b.v10UltimateLast||0)>520/game.difficulty){
    b.v10UltimateLast=now;const cats=['BD','CONS','PERM','SIC'],cat=()=>cats[Math.floor(Math.random()*cats.length)];
    game.projectiles.push({kind:'straight',x:game.w.w-315,y:240+Math.random()*185,w:66,h:42,vx:-650*game.difficulty,cat:cat(),dead:false,urgent:true});
    game.projectiles.push({kind:'drop',x:game.p.x-150+Math.random()*300,y:70,w:60,h:42,vy:440*game.difficulty,telegraphUntil:now+330,cat:cat(),dead:false,urgent:true});
    if(Math.random()<.5)game.projectiles.push({kind:'straight',x:game.w.w-315,y:405,w:62,h:38,vx:-720*game.difficulty,cat:cat(),dead:false,urgent:true});
  }
};

const v9DrawBossV10=drawBoss;
drawBoss=function(b){
  v9DrawBossV10(b);if(!b)return;const now=performance.now();ctx.save();
  if(now<(b.v10StunUntil||0)){ctx.globalAlpha=.85;ctx.font='24px system-ui';ctx.textAlign='center';ctx.fillText('💫',b.x,b.y-62);ctx.strokeStyle='#ffe06d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y+6,58+Math.sin(now/80)*5,0,Math.PI*2);ctx.stroke();}
  if(b.v10Ultimate){ctx.globalAlpha=.25+.12*Math.sin(now/70);ctx.strokeStyle='#fff6b0';ctx.lineWidth=5;for(let r=72;r<=112;r+=20){ctx.beginPath();ctx.arc(b.x,b.y+8,r,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=.12;ctx.fillStyle='#ff174f';ctx.beginPath();ctx.arc(b.x,b.y+8,125,0,Math.PI*2);ctx.fill();}
  ctx.restore();
};
const v9DrawBossHUDV10=drawBossHUD;
drawBossHUD=function(b){
  v9DrawBossHUDV10(b);if(!b)return;ctx.save();ctx.textAlign='center';ctx.font='bold 8px system-ui';ctx.fillStyle='#dceaf4';ctx.fillText(`STAGGER ${Math.min(3,game?.v10BossHits?.length||0)}/3`,480,65);if(b.v10Ultimate){ctx.fillStyle='#ffe57c';ctx.fillText('FASE 5 • CHIUSURA DEFINITIVA',480,77);}ctx.restore();
};

// ---------- AUDIO AMBIENTALE ----------
let v10AmbientTimer=null;
const v9StopMusicV10=stopMusic;
stopMusic=function(){if(v10AmbientTimer){clearInterval(v10AmbientTimer);v10AmbientTimer=null;}return v9StopMusicV10();};
const v9StartMusicV10=startMusic;
startMusic=function(theme){
  v9StartMusicV10(theme);if(!v10.ambient||!audioOn)return;
  const idx=game?.idx||0,amb=[330,247,146,392,110][idx]||220;
  v10AmbientTimer=setInterval(()=>{if(!game||!game.running||game.paused||!audioOn||!v10.ambient)return;const n=amb*(Math.random()<.5?1:1.5);tone(n,.08,'sine',v10HighFx()?.004:.002);if(idx===2&&Math.random()<.35)tone(82,.12,'triangle',.003,.05);if(idx===4&&Math.random()<.4)tone(amb*.75,.11,'square',.0025,.07);},5200);
};

// ---------- UPDATE GENERALE ----------
const v9UpdateV10=update;
update=function(dt,now){v9UpdateV10(dt,now);if(!game)return;updateSideMission();updateSideHud();};

// ---------- VFX / MISSIONI / RISULTATI ----------
const v9ParticleV10=particle;
particle=function(...args){if(v10.quality==='low'&&Math.random()<.5)return;return v9ParticleV10(...args);};
const v9DrawV10=draw;
draw=function(){
  v9DrawV10();if(!game)return;const s=game.w.v10Side,cam=game.camera,now=performance.now();ctx.save();
  if(s&&!s.done){const x=s.x-cam;if(x>-80&&x<1040){ctx.globalAlpha=.75+.2*Math.sin(now/180);ctx.fillStyle='#ffd85c';ctx.beginPath();ctx.arc(x,s.y,25,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.font='27px system-ui';ctx.textAlign='center';ctx.fillText(s.icon,x,s.y+9);ctx.fillStyle='#fff4bd';ctx.font='bold 7px system-ui';ctx.fillText('MISSIONE',x,s.y-34);}}
  if(v10HighFx()){
    const grad=ctx.createRadialGradient(480,270,160,480,270,620);grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(1,game.idx===4?'rgba(54,0,18,.24)':'rgba(0,0,0,.18)');ctx.fillStyle=grad;ctx.fillRect(0,0,C.width,C.height);
    if(game.idx===2){ctx.globalAlpha=.14;ctx.fillStyle='#d9c08d';for(let i=0;i<9;i++){const x=(i*127+now*.035)%1040-40,y=90+(i%5)*80;ctx.beginPath();ctx.arc(x,y,2+(i%3),0,Math.PI*2);ctx.fill();}}
  }
  ctx.restore();
};

const v9ClearV10=clearLevel;
clearLevel=function(){
  if(!game)return;const g=game,sideDone=!!g.w?.v10Side?.done,staggers=g.v10RunStaggers||0;v9ClearV10();
  const box=$('#results');if(box){box.innerHTML+=`<div>Missione<b>${sideDone?'✅':'—'}</b></div><div>Stagger<b>${staggers}</b></div>`;}
  persistV10();
};

const v9RenderMenuV10=renderMenu;
renderMenu=function(){
  v9RenderMenuV10();
  const nodes=[...document.querySelectorAll('#map .node')];nodes.forEach((n,i)=>{if(!V10_SIDE[i])return;let tag=n.querySelector('.v10sideTag');if(!tag){tag=document.createElement('div');tag.className='v10sideTag';n.appendChild(tag);}tag.textContent=(v10.sideDone[i]?'✅ ':'🎯 ')+V10_SIDE[i].name;});
};
renderMenu();