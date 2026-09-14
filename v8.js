/* BACK OFFICE ADVENTURE DX v8 - HUB, SPRITE, SEGRETI, MENGASI IV, GAMEPAD */
'use strict';

const V8_KEY='boAdventureDXv8';
let v8={hubSeen:false,secretRooms:{},gamepadSeen:false};
try{Object.assign(v8,JSON.parse(localStorage.getItem(V8_KEY)||'{}'));}catch(e){}
function persistV8(){try{localStorage.setItem(V8_KEY,JSON.stringify(v8));}catch(e){}}

// ---------- VERSIONE / UI ----------
(function initV8(){
  document.title='Back Office Adventure DX v8';
  const logo=document.querySelector('.header .logo span');if(logo)logo.textContent='ADVENTURE DX v8';
  const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Hub esplorabile, sprite più animati, percorsi verticali, stanze segrete, supporto gamepad e una quarta fase di Mengasi che nessun regolamento aveva previsto.';
  const credits=document.querySelector('#credits h2');if(credits)credits.textContent='BACK OFFICE ADVENTURE DX v8';
  const v7buttons=document.querySelector('#v7CareerBox .v7buttons');
  if(v7buttons&&!document.querySelector('#hubBtn')){
    const b=document.createElement('button');b.id='hubBtn';b.className='secondary hubLaunch';b.textContent='🏢 Hub Ufficio';v7buttons.prepend(b);b.onclick=openHub;
  }
  const note=document.querySelector('#menu .note');
  if(note&&!document.querySelector('#gamepadBadge')){
    const d=document.createElement('div');d.id='gamepadBadge';d.className='gamepadBadge';d.textContent='🎮 Gamepad: non rilevato';note.after(d);
  }
  const leader=document.querySelector('#leaderModal .mcard');
  if(leader&&!leader.querySelector('.v8onlineNote')){
    const n=document.createElement('div');n.className='v8onlineNote';n.textContent='Classifica online reale: struttura pronta, ma per salvare punteggi condivisi serve un backend esterno. GitHub Pages da solo può leggere il mondo, non scriverci sopra. Un raro momento di buon senso informatico.';leader.insertBefore(n,leader.lastElementChild);
  }
})();

// ---------- HUB CENTRALE ESPLORABILE ----------
let hub={open:false,x:90,vx:0,facing:1,raf:0,last:0,near:null};
const HUB_DOORS=[
  {x:120,label:'STORIA',icon:'🗺️',action:'story'},
  {x:300,label:'ARCHIVIO',icon:'📚',action:'archive'},
  {x:480,label:'CARRIERA',icon:'🏆',action:'career'},
  {x:660,label:'TIME ATTACK',icon:'⏱️',action:'time'},
  {x:820,label:'BOSS RUSH',icon:'👔',action:'rush'}
];
function ensureHub(){
  let m=document.querySelector('#hubModal');if(m)return m;
  m=document.createElement('div');m.id='hubModal';m.className='modal hidden';
  m.innerHTML=`<div class="mcard hubCard"><div class="hubTop"><div><h2 style="margin:0">🏢 Hub Back Office</h2><p>A/D o ←/→ per camminare • E/Invio per entrare • gamepad supportato</p></div><button id="hubClose" class="secondary">Chiudi</button></div><canvas id="hubCanvas" width="900" height="420"></canvas><div class="hubControls"><button id="hubL">◀</button><button id="hubUse" class="interact">ENTRA</button><button id="hubR">▶</button></div></div>`;
  document.body.appendChild(m);m.querySelector('#hubClose').onclick=closeHub;
  const hold=(el,dir)=>{el.onpointerdown=e=>{e.preventDefault();hub.vx=dir*230;hub.facing=dir};['pointerup','pointercancel','pointerleave'].forEach(ev=>el.addEventListener(ev,()=>hub.vx=0));};
  hold(m.querySelector('#hubL'),-1);hold(m.querySelector('#hubR'),1);m.querySelector('#hubUse').onclick=hubInteract;
  return m;
}
function openHub(){const m=ensureHub();m.classList.remove('hidden');hub.open=true;hub.last=performance.now();v8.hubSeen=true;persistV8();cancelAnimationFrame(hub.raf);hub.raf=requestAnimationFrame(hubLoop);}
function closeHub(){hub.open=false;cancelAnimationFrame(hub.raf);document.querySelector('#hubModal')?.classList.add('hidden');}
function hubLoop(now){if(!hub.open)return;const dt=Math.min(40,now-hub.last);hub.last=now;hub.x=Math.max(45,Math.min(855,hub.x+hub.vx*dt/1000));drawHub(now);hub.raf=requestAnimationFrame(hubLoop);}
function drawHub(now){
  const c=document.querySelector('#hubCanvas');if(!c)return;const x=c.getContext('2d'),t=now/1000;
  const g=x.createLinearGradient(0,0,0,420);g.addColorStop(0,'#173d59');g.addColorStop(1,'#081621');x.fillStyle=g;x.fillRect(0,0,900,420);
  x.globalAlpha=.16;x.fillStyle='#b9e9ff';for(let i=0;i<7;i++)x.fillRect(25+i*140,70,110,205);x.globalAlpha=1;
  x.fillStyle='#163249';x.fillRect(0,320,900,100);x.fillStyle='#34566e';x.fillRect(0,320,900,8);
  x.fillStyle='#795f48';for(let q=0;q<4;q++){const dx=70+q*230;x.fillRect(dx,285,130,10);x.fillStyle='#2a3b48';x.fillRect(dx+20,252,38,30);x.fillRect(dx+72,252,38,30);x.fillStyle='#795f48';}
  HUB_DOORS.forEach(d=>{const near=Math.abs(hub.x-d.x)<58;x.fillStyle=near?'#285878':'#17364e';x.strokeStyle=near?'#70ddff':'#45667f';x.lineWidth=near?4:2;x.fillRect(d.x-48,145,96,155);x.strokeRect(d.x-48,145,96,155);x.fillStyle='#091722';x.fillRect(d.x-27,180,54,72);x.fillStyle='#fff';x.textAlign='center';x.font='28px system-ui';x.fillText(d.icon,d.x,216);x.font='bold 9px system-ui';x.fillText(d.label,d.x,280);});
  hub.near=HUB_DOORS.reduce((best,d)=>Math.abs(hub.x-d.x)<Math.abs(hub.x-(best?.x??9999))?d:best,null);if(Math.abs(hub.x-hub.near.x)>65)hub.near=null;
  const im=imgs?.Eugenio;x.save();x.globalAlpha=.2;x.fillStyle='#000';x.beginPath();x.ellipse(hub.x,326,24,6,0,0,Math.PI*2);x.fill();x.globalAlpha=1;x.strokeStyle='#17212d';x.lineWidth=7;x.lineCap='round';const run=Math.sin(t*10)*(Math.abs(hub.vx)>5?8:1);x.beginPath();x.moveTo(hub.x-4,284);x.lineTo(hub.x-10-run,318);x.moveTo(hub.x+4,284);x.lineTo(hub.x+10+run,318);x.stroke();x.fillStyle='#56caff';x.fillRect(hub.x-15,260,30,35);x.strokeStyle='#56caff';x.beginPath();x.moveTo(hub.x-12,266);x.lineTo(hub.x-23-run,290);x.moveTo(hub.x+12,266);x.lineTo(hub.x+23+run,290);x.stroke();x.beginPath();x.arc(hub.x,244,21,0,Math.PI*2);x.clip();if(im?.complete)x.drawImage(im,hub.x-21,223,42,42);else{x.fillStyle='#667';x.fillRect(hub.x-21,223,42,42)}x.restore();
  if(hub.near){x.fillStyle='#06131eea';x.strokeStyle='#63d7ff';x.lineWidth=2;x.fillRect(315,26,270,44);x.strokeRect(315,26,270,44);x.fillStyle='#e9faff';x.textAlign='center';x.font='bold 12px system-ui';x.fillText(`E / INVIO • ${hub.near.label}`,450,53);}
  x.fillStyle='#aec9d9';x.font='bold 9px system-ui';x.textAlign='left';x.fillText('Michele: “Qui almeno i portali sembrano funzionare.”',22,398);
}
function hubInteract(){if(!hub.near)return;sfx?.('coin');const a=hub.near.action;closeHub();if(a==='story'){document.querySelector('#map')?.scrollIntoView({behavior:'smooth',block:'center'});return;}if(a==='archive'){if(typeof openArchive==='function')openArchive();return;}if(a==='career'){if(typeof renderAchievements==='function')renderAchievements();document.querySelector('#achModal')?.classList.remove('hidden');return;}if(a==='time'){if(typeof startTimeAttack==='function')startTimeAttack();return;}if(a==='rush'){if(typeof startBossRush==='function')startBossRush();return;}}
const hubKeys={left:false,right:false};
document.addEventListener('keydown',e=>{if(!hub.open)return;if(['a','A','ArrowLeft'].includes(e.key)){hubKeys.left=true;hub.vx=-230;hub.facing=-1;e.preventDefault()}if(['d','D','ArrowRight'].includes(e.key)){hubKeys.right=true;hub.vx=230;hub.facing=1;e.preventDefault()}if(['e','E','Enter'].includes(e.key)){hubInteract();e.preventDefault()}if(e.key==='Escape')closeHub();});
document.addEventListener('keyup',e=>{if(!hub.open)return;if(['a','A','ArrowLeft'].includes(e.key))hubKeys.left=false;if(['d','D','ArrowRight'].includes(e.key))hubKeys.right=false;hub.vx=hubKeys.left?-230:hubKeys.right?230:0;});

// ---------- LEVEL DESIGN VERTICALE / SEGRETI ----------
const v7MakeLevelV8=makeLevel;
makeLevel=function(idx){
  const res=v7MakeLevelV8(idx),w=res.w;w.v8SecretDoors=[];
  const bases=[1080,1420,1960,2250,1580],types=['desk','folder','scaffold','dashboard','glitch'];const base=bases[idx],typ=types[idx];
  const stair=[
    {x:base,y:375,w:145,h:16},{x:base+165,y:315,w:135,h:16},{x:base+320,y:255,w:135,h:16},{x:base+475,y:195,w:135,h:16},{x:base+620,y:135,w:150,h:16}
  ];stair.forEach(p=>w.platforms.push({...p,v6Type:typ,v8Vertical:true}));
  w.moving.push({x:base+800,y:390,w:115,h:16,base:base+800,amp:0,phase:idx,baseY:390,ampY:175,v8Vertical:true,v6Type:typ});
  w.collect.push({x:base+690,y:92,type:'ntw',taken:false,bob:Math.random()*6});
  w.secrets.push({x:base+760,y:86,taken:false,v8:true});
  w.v8SecretDoors.push({x:base+610,y:105,w:190,h:125,opened:false,label:['ARCHIVIO RISERVATO','PROTOCOLLO SEGRETO','CONTAINER 17','SALA CHIUSURA','VARCO FUSIONE'][idx]});
  if(idx===4&&w.v6Arena){w.v8SecretDoors.push({x:w.v6Arena.x+35,y:205,w:110,h:150,opened:false,label:'PROTOCOLLO MENGASI'});}
  return res;
};

// ---------- GAMEPAD ----------
let padState={active:false,left:false,right:false,buttons:[]},keyboardState={left:false,right:false};
document.addEventListener('keydown',e=>{if(['a','A','ArrowLeft'].includes(e.key))keyboardState.left=true;if(['d','D','ArrowRight'].includes(e.key))keyboardState.right=true;});
document.addEventListener('keyup',e=>{if(['a','A','ArrowLeft'].includes(e.key))keyboardState.left=false;if(['d','D','ArrowRight'].includes(e.key))keyboardState.right=false;});
window.addEventListener('gamepadconnected',e=>{v8.gamepadSeen=true;persistV8();const b=document.querySelector('#gamepadBadge');if(b){b.classList.add('on');b.textContent=`🎮 Gamepad: ${e.gamepad.id.slice(0,28)}`;}});
window.addEventListener('gamepaddisconnected',()=>{const b=document.querySelector('#gamepadBadge');if(b){b.classList.remove('on');b.textContent='🎮 Gamepad: non rilevato';}});
function pollGamepad(){
  const gp=[...(navigator.getGamepads?.()||[])].find(Boolean);if(!gp){padState.active=false;return;}padState.active=true;const ax=gp.axes?.[0]||0,left=ax<-.22||gp.buttons?.[14]?.pressed,right=ax>.22||gp.buttons?.[15]?.pressed;
  keys.left=keyboardState.left||left;keys.right=keyboardState.right||right;
  const pressed=i=>!!gp.buttons?.[i]?.pressed,edge=i=>pressed(i)&&!padState.buttons[i];
  if(edge(0))pressJump();if(edge(1)&&typeof doDash==='function')doDash();if(edge(2))useAbility();if(edge(9)&&typeof togglePause==='function')togglePause();
  if(hub.open){if(left){hub.vx=-230;hub.facing=-1}else if(right){hub.vx=230;hub.facing=1}else if(!hubKeys.left&&!hubKeys.right)hub.vx=0;if(edge(0))hubInteract();}
  padState.buttons=gp.buttons.map(b=>b.pressed);
}

// ---------- UPDATE: ELEVATORI + GAMEPAD ----------
const v7UpdateV8=update;
update=function(dt,now){
  pollGamepad();
  if(game?.w?.moving)for(const p of game.w.moving)if(p.v8Vertical)p.y=p.baseY+Math.sin(now/850+p.phase)*p.ampY;
  v7UpdateV8(dt,now);
  if(!game)return;
  for(const d of game.w.v8SecretDoors||[]){const near=Math.abs((game.p.x+game.p.w/2)-(d.x+d.w/2))<115&&game.p.y<250;if(near&&!d.opened){d.opened=true;v8.secretRooms[`${game.idx}-${Math.round(d.x)}`]=true;persistV8();showMsg(`🔐 ${d.label} SCOPERTO`,1400);addScore(60,d.x,d.y);}}
};

// ---------- SPRITE PERSONAGGI PIU' CURATI ----------
const v7DrawPlayerV8=drawPlayer;
drawPlayer=function(p,ch){
  const now=performance.now(),run=Math.abs(p.vx)>55&&p.onGround,air=!p.onGround,dash=game?.v7DashUntil>now,hurt=p.hurt>0;const cx=p.x+p.w/2,hy=p.y+20,by=p.y+38;const phase=run?Math.sin(p.anim*13):Math.sin(now/360)*.15;
  ctx.save();if(p.inv>0&&Math.floor(p.inv/85)%2===0)ctx.globalAlpha=.32;
  if(v7?.shop?.trail&&Math.abs(p.vx)>80){ctx.globalAlpha=.16;ctx.fillStyle=ch.color;for(let i=1;i<=4;i++){ctx.beginPath();ctx.arc(cx-p.facing*i*12,by+13,i*3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
  ctx.globalAlpha*=.28;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(cx,p.y+p.h+4,25,6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=p.inv>0&&Math.floor(p.inv/85)%2===0?.32:1;
  if(dash){ctx.strokeStyle='#9befff';ctx.lineWidth=3;ctx.globalAlpha=.65;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(cx-p.facing*(28+i*13),by+i*4);ctx.lineTo(cx-p.facing*(58+i*13),by+i*4);ctx.stroke();}ctx.globalAlpha=1;}
  ctx.lineCap='round';ctx.strokeStyle='#151d26';ctx.lineWidth=8;ctx.beginPath();
  const leg=run?phase*10:air?(p.vy<0?6:-5):0;ctx.moveTo(cx-6,by+24);ctx.lineTo(cx-13-leg,p.y+p.h-7);ctx.moveTo(cx+6,by+24);ctx.lineTo(cx+13+leg,p.y+p.h-7);ctx.stroke();
  ctx.fillStyle='#0c1118';ctx.fillRect(cx-24-leg,p.y+p.h-9,18,7);ctx.fillRect(cx+7+leg,p.y+p.h-9,18,7);
  const costume=game?.costume||selectedCostume;ctx.fillStyle=ch.color;rr(cx-18,by-5,36,36,9,1,0);ctx.fillStyle='#ffffff28';ctx.fillRect(cx-10,by,20,3);
  if(costume==='site'){ctx.fillStyle='#f3c934';ctx.fillRect(cx-5,by-4,10,34);}if(costume==='smart'){ctx.fillStyle='#202a35';ctx.fillRect(cx-15,by+20,30,8);}if(costume==='legend'){ctx.strokeStyle='#ffd45b';ctx.lineWidth=2;ctx.strokeRect(cx-20,by-7,40,40);}
  ctx.strokeStyle=ch.color;ctx.lineWidth=8;ctx.beginPath();const arm=hurt?-18:air?-14:phase*9;ctx.moveTo(cx-14,by+4);ctx.lineTo(cx-25-arm,by+18);ctx.moveTo(cx+14,by+4);ctx.lineTo(cx+25+arm,by+18);ctx.stroke();
  face(ch.n,cx,hy,22,ctx.globalAlpha);
  ctx.fillStyle='#d9eff8';ctx.fillRect(cx+10,by+3,6,9);ctx.fillStyle='#173149';ctx.fillRect(cx+11,by+5,4,5);
  if(costume==='site'){ctx.fillStyle='#ffd44e';ctx.beginPath();ctx.arc(cx,hy-14,20,Math.PI,0);ctx.fill();ctx.fillRect(cx-22,hy-15,44,6);}if(costume==='smart'){ctx.font='20px system-ui';ctx.textAlign='center';ctx.fillText('🎧',cx,hy+5);}if(costume==='legend'){ctx.font='22px system-ui';ctx.textAlign='center';ctx.fillText('👑',cx,hy-17);}
  if(v7?.shop?.coffeeAura){ctx.globalAlpha=.35;ctx.strokeStyle='#fff';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(cx-15+i*15,p.y-4-Math.sin(now/300+i)*7,5+i,Math.PI,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;}
  if(v7?.shop?.mengasiBadge){ctx.font='12px system-ui';ctx.fillText('🧬',cx+18,by+14);}
  if(game.shield>0||game.activeUntil>now){ctx.strokeStyle='#75ecff';ctx.lineWidth=4;ctx.globalAlpha=.72;ctx.beginPath();ctx.arc(cx,p.y+p.h/2,39,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
};

// ---------- SEGRETI VISIVI ----------
const v7DrawV8=draw;
draw=function(){v7DrawV8();if(!game)return;const cam=game.camera;ctx.save();for(const d of game.w.v8SecretDoors||[]){const x=d.x-cam;if(x<-250||x>1100)continue;ctx.globalAlpha=d.opened?.62:.22;ctx.fillStyle=d.opened?'#4b6e74':'#101c29';ctx.fillRect(x,d.y,d.w,d.h);ctx.strokeStyle=d.opened?'#ffe16b':'#4d6576';ctx.lineWidth=3;ctx.strokeRect(x,d.y,d.w,d.h);ctx.fillStyle=d.opened?'#fff3a8':'#8396a5';ctx.textAlign='center';ctx.font='bold 8px system-ui';ctx.fillText(d.opened?d.label:'???',x+d.w/2,d.y+22);}ctx.restore();};

// ---------- MENGASI: QUARTA FASE SEGRETA ----------
const v7UpdateBossV8=updateBoss;
updateBoss=function(dt,now){
  v7UpdateBossV8(dt,now);const b=game?.boss;if(!b||b.name!=='Mengasi'||b.hp<=0)return;const ratio=b.hp/b.max;
  if(ratio<=.18){
    b.v8Phase=4;
    if(!b.v8Transformed){b.v8Transformed=true;b.v8LastChaos=0;game.cameraShake=v7?.settings?.reducedShake?4:18;showMsg('🧬 MENGASI • FASE 4: CHIUSURA TOTALE',2300);sfx('boss');if(typeof bossSpeak==='function')bossSpeak('Avete chiuso il mese. Ora chiudete anche questo.');}
    if(now-(b.v8LastChaos||0)>620/game.difficulty){b.v8LastChaos=now;const cats=['BD','CONS','PERM','SIC'];const cat=()=>cats[Math.floor(Math.random()*4)];
      game.projectiles.push({kind:'straight',x:game.w.w-320,y:250+Math.random()*160,w:66,h:42,vx:-520*game.difficulty,cat:cat(),dead:false,urgent:true});
      game.projectiles.push({kind:'drop',x:game.p.x-110+Math.random()*220,y:80,w:60,h:42,vy:390*game.difficulty,telegraphUntil:now+380,cat:cat(),dead:false,urgent:true});
      if(Math.random()<.55)game.projectiles.push({kind:'straight',x:game.w.w-320,y:410,w:64,h:40,vx:-600*game.difficulty,cat:cat(),dead:false,urgent:true});
    }
  }
};
const v7DrawBossV8=drawBoss;
drawBoss=function(b){v7DrawBossV8(b);if(b.name==='Mengasi'&&b.v8Phase===4){const t=performance.now()/100;ctx.save();ctx.globalAlpha=.28+.15*Math.sin(t);ctx.strokeStyle='#fff1a0';ctx.lineWidth=5;for(let r=58;r<92;r+=14){ctx.beginPath();ctx.arc(b.x,b.y+10,r+Math.sin(t+r)*5,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=.15;ctx.fillStyle='#ff3b6a';ctx.beginPath();ctx.arc(b.x,b.y+10,105,0,Math.PI*2);ctx.fill();ctx.restore();}};
const v7DrawBossHUDV8=drawBossHUD;
drawBossHUD=function(b){if(b.name!=='Mengasi'||b.v8Phase!==4)return v7DrawBossHUDV8(b);ctx.fillStyle='#2b0d17';rr(215,12,530,17,8,1,0);ctx.fillStyle='#ffd057';rr(215,12,530*(b.hp/b.max),17,8,1,0);ctx.fillStyle='#fff7c2';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText(`MENGASI • FASE 4 SEGRETA • ${b.hp}/${b.max}`,480,49);};

// ---------- DIALOGHI BOSS PERSONALIZZATI ----------
const v7BeginCutsceneV8=beginCutscene;
beginCutscene=function(){v7BeginCutsceneV8();if(!game)return;const n=game.lv.boss,ch=game.ch.n;const lines={Mengozzi:{Eugenio:'“Eugenio, questa la prendiamo come jolly. Ma sempre entro oggi.”',Dalila:'“Dalila, qui servono permessi. Tutti.”',Giada:'“Giada, supporto rapido. Rapido davvero.”'},Gervasi:{Daniele:'“Daniele, sicurezza prima. Poi tutto il resto.”',Tiziano:'“Tiziano, serve qualcuno che tenga insieme il cantiere.”'},Mengasi:{Michele:'“Responsabile contro fusione. Vediamo chi firma per ultimo.”',Eugenio:'“Versatile? Bene. Io sono due responsabili insieme.”'}};const l=lines[n]?.[ch];if(l){$('#cutLine').textContent=l;if(typeof bossSpeak==='function')bossSpeak(l);}};

// ---------- GAMEPAD BADGE INIZIALE ----------
setTimeout(()=>{const gp=[...(navigator.getGamepads?.()||[])].find(Boolean),b=document.querySelector('#gamepadBadge');if(gp&&b){b.classList.add('on');b.textContent=`🎮 Gamepad: ${gp.id.slice(0,28)}`;}},700);

renderMenu();
