/* BACK OFFICE ADVENTURE DX v7 - GAMEPLAY & CARRIERA */
'use strict';

const V7_KEY='boAdventureDXv7';
const V7_RANKS=[
  {n:'Operatore',p:0},{n:'Specialista',p:6},{n:'Senior',p:12},{n:'Riferimento',p:19},{n:'Responsabile',p:27},{n:'Leggenda Back Office',p:36}
];
const V7_ACH=[
  {id:'prima',icon:'🎮',name:'Prima pratica',desc:'Completa una partita.',test:()=>v5extra.stats.runs>=1},
  {id:'cento',icon:'📚',name:'Archivista seriale',desc:'Gestisci 100 attività.',test:()=>v5extra.stats.tasks>=100},
  {id:'caffe',icon:'☕',name:'Sistema nervoso aziendale',desc:'Raccogli 25 caffè.',test:()=>v5extra.stats.coffees>=25},
  {id:'boss3',icon:'👔',name:'Riunione con la dirigenza',desc:'Sconfiggi 3 boss.',test:()=>v5extra.stats.bosses>=3},
  {id:'mengasi',icon:'🧬',name:'Fusione respinta',desc:'Sconfiggi Mengasi.',test:()=>!!save.cleared?.[4]},
  {id:'stelle',icon:'⭐',name:'Qualità certificata',desc:'Ottieni 12 stelle totali.',test:()=>((save.stars||[]).reduce((a,b)=>a+(b||0),0)>=12)},
  {id:'endless',icon:'♾️',name:'Il fine mese non finisce',desc:'Fai 5000 punti in Endless.',test:()=>v5extra.stats.endlessBest>=5000},
  {id:'nohit',icon:'🛡️',name:'Immacolato',desc:'Completa un livello senza danni.',test:()=>Object.values(v7.noHitLevels||{}).some(Boolean)}
];
const V7_SHOP=[
  {id:'trail',icon:'✨',name:'Scia Operativa',need:30,desc:'Piccola scia luminosa durante la corsa.'},
  {id:'coffeeAura',icon:'☕',name:'Aura Caffè',need:55,desc:'Vapore permanente intorno al personaggio.'},
  {id:'goldHud',icon:'🏆',name:'HUD Oro',need:80,desc:'Interfaccia dorata da leggenda amministrativa.'},
  {id:'mengasiBadge',icon:'🧬',name:'Badge Anti-Mengasi',need:110,desc:'Emblema della fusione sconfitta.'}
];
const V7_MINI=[
  {name:'Stampante Suprema',icon:'🖨️',hp:4,color:'#99b5c7'},
  {name:'PEC Suprema',icon:'✉️',hp:5,color:'#b69aff'},
  {name:'Escavatore Impazzito',icon:'🚜',hp:6,color:'#e7b64c'},
  {name:'Report Infinito',icon:'📊',hp:6,color:'#72ded0'},
  {name:'Urgenza Assoluta',icon:'🚨',hp:7,color:'#ff6f8f'}
];

let v7={ach:{},shop:{},settings:{reducedShake:false,highContrast:false,master:1},bossRushBest:null,timeAttack:{},noHitLevels:{}};
try{Object.assign(v7,JSON.parse(localStorage.getItem(V7_KEY)||'{}'));}catch(e){}
v7.ach||={};v7.shop||={};v7.noHitLevels||={};v7.timeAttack||={};v7.settings={reducedShake:false,highContrast:false,master:1,...(v7.settings||{})};
function persistV7(){try{localStorage.setItem(V7_KEY,JSON.stringify(v7));}catch(e){}}
function careerPoints(){
  const stars=(save.stars||[]).reduce((a,b)=>a+(b||0),0);
  const obj=Object.values(v5extra.objectives||{}).reduce((a,x)=>a+Object.values(x||{}).filter(Boolean).length,0);
  const ach=Object.values(v7.ach||{}).filter(Boolean).length*2;
  return stars+obj+ach;
}
function careerRankIndex(){const p=careerPoints();let r=0;V7_RANKS.forEach((x,i)=>{if(p>=x.p)r=i;});return r;}
function careerRank(){return V7_RANKS[careerRankIndex()];}
function checkAchievements(){
  let changed=false;
  V7_ACH.forEach(a=>{if(!v7.ach[a.id]&&a.test()){v7.ach[a.id]=Date.now();changed=true;showMsg?.(`🏆 OBIETTIVO: ${a.name}`,1800);}});
  if(changed){persistV7();renderV7Career();}
}

// ---------- UI ----------
(function initV7UI(){
  document.title='Back Office Adventure DX v7';
  const logo=document.querySelector('.header .logo span');if(logo)logo.textContent='ADVENTURE DX v7';
  const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Scenari v6 + movimento rifinito, mini-boss, carriera, achievement, Time Attack e Boss Rush. A questo punto il reparto dovrebbe chiedere una licenza editoriale.';
  const credits=document.querySelector('#credits h2');if(credits)credits.textContent='BACK OFFICE ADVENTURE DX v7';

  const actions=document.querySelector('#menu .actions');
  if(actions&&!document.querySelector('#v7CareerBox')){
    const box=document.createElement('div');box.id='v7CareerBox';box.className='v7career';
    box.innerHTML=`<div><small>Carriera</small><b id="v7Rank">Operatore</b><span id="v7Points">0 pt</span></div><div class="v7buttons"><button id="achBtn" class="secondary">🏆 Obiettivi</button><button id="shopBtn" class="secondary">🛍️ Premi</button><button id="taBtn" class="secondary">⏱️ Time Attack</button><button id="rushBtn" class="secondary">👔 Boss Rush</button><button id="settingsBtn" class="secondary">⚙️ Accessibilità</button></div>`;
    actions.parentNode.insertBefore(box,actions);
  }
  const controls=document.querySelector('.controls');
  if(controls&&!document.querySelector('#dash')){
    const b=document.createElement('button');b.id='dash';b.className='dash';b.innerHTML='DASH<span id="dashcd" class="cd">PRONTO</span>';controls.insertBefore(b,document.querySelector('#right'));
  }
  const makeModal=(id,title,body)=>{const m=document.createElement('div');m.id=id;m.className='modal hidden';m.innerHTML=`<div class="mcard"><h2>${title}</h2>${body}<button class="secondary v7close">Chiudi</button></div>`;document.body.appendChild(m);m.querySelector('.v7close').onclick=()=>m.classList.add('hidden');return m;};
  if(!document.querySelector('#achModal'))makeModal('achModal','🏆 Obiettivi','<div id="achGrid" class="v7grid"></div>');
  if(!document.querySelector('#shopModal'))makeModal('shopModal','🛍️ Premi Marche','<p class="note">Si sbloccano con le marche totali raccolte. Nessun pagamento vero, perché almeno qui manteniamo un minimo di dignità.</p><div id="shopGrid" class="v7grid"></div>');
  if(!document.querySelector('#settingsModal'))makeModal('settingsModal','⚙️ Accessibilità','<div class="v7settings"><label><input id="setShake" type="checkbox"> Riduci camera shake</label><label><input id="setContrast" type="checkbox"> Contrasto alto</label><label>Volume generale <input id="setVolume" type="range" min="0" max="1" step="0.05"></label></div>');
  if(!document.querySelector('#rushModal'))makeModal('rushModal','👔 Boss Rush','<div id="rushResult" class="v7result"></div>');

  document.querySelector('#achBtn')?.addEventListener('click',()=>{renderAchievements();$('#achModal').classList.remove('hidden');});
  document.querySelector('#shopBtn')?.addEventListener('click',()=>{renderShop();$('#shopModal').classList.remove('hidden');});
  document.querySelector('#settingsBtn')?.addEventListener('click',()=>{syncSettings();$('#settingsModal').classList.remove('hidden');});
  document.querySelector('#taBtn')?.addEventListener('click',startTimeAttack);
  document.querySelector('#rushBtn')?.addEventListener('click',startBossRush);
  document.querySelector('#dash')?.addEventListener('pointerdown',e=>{e.preventDefault();doDash();});
  document.querySelector('#setShake')?.addEventListener('change',e=>{v7.settings.reducedShake=e.target.checked;applySettings();persistV7();});
  document.querySelector('#setContrast')?.addEventListener('change',e=>{v7.settings.highContrast=e.target.checked;applySettings();persistV7();});
  document.querySelector('#setVolume')?.addEventListener('input',e=>{v7.settings.master=Number(e.target.value);persistV7();});
  applySettings();renderV7Career();
})();
function renderV7Career(){const r=careerRank();const p=careerPoints();const next=V7_RANKS[Math.min(V7_RANKS.length-1,careerRankIndex()+1)];if($('#v7Rank'))$('#v7Rank').textContent=r.n;if($('#v7Points'))$('#v7Points').textContent=careerRankIndex()===V7_RANKS.length-1?`${p} pt • MAX`:`${p}/${next.p} pt`;}
function renderAchievements(){checkAchievements();const box=$('#achGrid');box.innerHTML=V7_ACH.map(a=>`<div class="v7card ${v7.ach[a.id]?'done':'locked'}"><strong>${a.icon}</strong><b>${a.name}</b><span>${a.desc}</span><em>${v7.ach[a.id]?'SBLOCCATO':'DA FARE'}</em></div>`).join('');}
function renderShop(){const box=$('#shopGrid');box.innerHTML=V7_SHOP.map(i=>{const open=save.totalStamps>=i.need;const active=!!v7.shop[i.id];return `<button class="v7card shop ${active?'done':''} ${open?'':'locked'}" data-id="${i.id}" ${open?'':'disabled'}><strong>${i.icon}</strong><b>${i.name}</b><span>${i.desc}</span><em>${active?'ATTIVO':open?'ATTIVA':i.need+' marche'}</em></button>`;}).join('');box.querySelectorAll('button[data-id]').forEach(b=>b.onclick=()=>{v7.shop[b.dataset.id]=!v7.shop[b.dataset.id];persistV7();applySettings();renderShop();});}
function syncSettings(){if($('#setShake'))$('#setShake').checked=!!v7.settings.reducedShake;if($('#setContrast'))$('#setContrast').checked=!!v7.settings.highContrast;if($('#setVolume'))$('#setVolume').value=v7.settings.master;}
function applySettings(){document.body.classList.toggle('v7contrast',!!v7.settings.highContrast);document.body.classList.toggle('v7gold',!!v7.shop.goldHud);}

// ---------- MOVIMENTO E FEEDBACK ----------
function doDash(){
  if(!game||!game.running||game.paused)return;const now=performance.now();if(now<(game.v7DashReady||0))return;
  const rank=careerRankIndex(),cd=Math.max(2300,4200-rank*260);game.v7DashReady=now+cd;game.v7DashUntil=now+230;game.p.vx=game.p.facing*930;game.p.inv=Math.max(game.p.inv||0,280);game.cameraShake=Math.max(game.cameraShake||0,5);sfx('ability');showMsg('💨 DASH OPERATIVO',650);updateV7HUD();
}
const v6ToneV7=tone;
tone=function(f,d,type,v,delay){return v6ToneV7(f,d,type,(v??.035)*(v7.settings.master??1),delay);};
const v6PressJumpV7=pressJump;
pressJump=function(){
  if(game&&game.running&&!game.paused&&!game.p.onGround&&game.p.coyote<=0&&careerRankIndex()>=2&&!game.v7DoubleUsed){game.v7DoubleUsed=true;game.p.vy=-game.ch.jump*.86;game.p.inv=Math.max(game.p.inv||0,100);sfx('jump');particle(game.p.x,game.p.y,'DOPPIO SALTO','#a8ecff');return;}
  v6PressJumpV7();
};
document.addEventListener('keydown',e=>{if(['Shift','c','C'].includes(e.key)){doDash();e.preventDefault();}});
function updateV7HUD(){if(!game)return;const el=$('#dashcd');if(!el)return;const left=Math.max(0,(game.v7DashReady-performance.now())/1000);el.textContent=left>0?left.toFixed(1)+'s':'PRONTO';}

// ---------- PROGRESSIONE PERMANENTE ----------
const v6StartGameV7=startGame;
startGame=function(){
  v6StartGameV7();if(!game)return;const rank=careerRankIndex();
  game.v7DashReady=0;game.v7DashUntil=0;game.v7DoubleUsed=false;game.v7HitStop=0;game.v7Mode=game.mode||'story';game.v7RunHits=game.hitsTaken||0;
  if(rank>=1)game.ch.spd*=1.03;
  if(rank>=1)game.ch.jump*=1.025;
  if(rank>=3)game.ch.cd*=.92;
  if(rank>=4)game.shield++;
  if(v7.shop.mengasiBadge)game.scoreMult=(game.scoreMult||1)*1.03;
  updateV7HUD();renderV7Career();checkAchievements();
};
$('#start').onclick=startGame;

// ---------- MINI BOSS ----------
const v6MakeLevelV7=makeLevel;
makeLevel=function(idx){
  const res=v6MakeLevelV7(idx),w=res.w,cfg=V7_MINI[idx],x=Math.round(LEVELS[idx].w*.52);
  w.v7Mini={...cfg,x,y:w.groundY-72,w:88,h:72,max:cfg.hp,hp:cfg.hp,active:false,dead:false,last:0,gate:x+160,weak:['BD','CONS','PERM','SIC'][idx%4]};
  return res;
};
function updateMiniBoss(dt,now){
  const m=game?.w?.v7Mini;if(!m||m.dead||game.mode==='bossrush')return;
  if(!m.active&&game.p.x>m.x-430){m.active=true;game.v7MiniProj=[];showMsg(`⚠ MINI-BOSS: ${m.name}`,1500);sfx('boss');}
  if(!m.active)return;
  if(game.p.x>m.gate&&!m.dead)game.p.x=m.gate;
  if(now-m.last>Math.max(620,1150-game.idx*90)){m.last=now;const cats=['BD','CONS','PERM','SIC'];const cat=Math.random()<.48?m.weak:cats[Math.floor(Math.random()*4)];game.v7MiniProj.push({x:m.x-10,y:250+Math.random()*155,w:58,h:38,vx:-(300+game.idx*30)*game.difficulty,cat,dead:false});}
  for(const p of game.v7MiniProj||[]){if(p.dead)continue;p.x+=p.vx*dt/1000;if(hit(game.p,p)&&game.p.inv<=0){p.dead=true;if(hasSkill(game.ch,p.cat)){m.hp--;game.p.vy=-260;comboScore(25,p.x,p.y);game.v7HitStop=55;sfx('good');if(m.hp<=0){m.dead=true;addScore(160,m.x,m.y);showMsg(`✅ ${m.name} CHIUSO • +160`,1600);sfx('clear');}}else damage(`Mini-boss: ${CAT[p.cat]}. Non compatibile.`,game.p.x<p.x?-1:1);}if(p.x<game.camera-150)p.dead=true;}
  game.v7MiniProj=(game.v7MiniProj||[]).filter(p=>!p.dead);
  if(hit(game.p,m)&&game.p.inv<=0&&!m.dead){if(game.p.vy>160&&game.p.y+game.p.h<m.y+28){m.hp--;game.p.vy=-450;game.v7HitStop=65;sfx('good');if(m.hp<=0){m.dead=true;addScore(160,m.x,m.y);}}else damage(`${m.name}: pratica respinta.`,game.p.x<m.x?-1:1);}
}

// ---------- UPDATE WRAPPER ----------
const v6UpdateV7=update;
update=function(dt,now){
  if(!game)return;
  if(game.v7HitStop>0){game.v7HitStop-=dt;if(v7.settings.reducedShake)game.cameraShake=0;updateV7HUD();return;}
  const beforeEnemies=game.w.enemies?.filter(e=>e.dead).length||0,beforeBoss=game.boss?.hp;
  if(now<(game.v7DashUntil||0)){game.p.vx=game.p.facing*930;game.p.inv=Math.max(game.p.inv||0,120);}
  v6UpdateV7(dt,now);
  if(!game)return;
  if(game.p.onGround)game.v7DoubleUsed=false;
  updateMiniBoss(dt,now);
  const afterEnemies=game.w.enemies?.filter(e=>e.dead).length||0,afterBoss=game.boss?.hp;
  if(afterEnemies>beforeEnemies||(beforeBoss!=null&&afterBoss!=null&&afterBoss<beforeBoss))game.v7HitStop=Math.max(game.v7HitStop||0,48);
  if(v7.settings.reducedShake)game.cameraShake=0;
  if(game.mode==='bossrush')updateBossRush(now);
  updateV7HUD();checkAchievements();
};

// ---------- PERFORMANCE CULLING ----------
function visibleObj(o,pad=160){if(!game||!o)return true;const x=o.x??o.base??0,w=o.w??50;return x+w>=game.camera-pad&&x<=game.camera+C.width+pad;}
const v6DrawTaskV7=drawTask;drawTask=function(o){if(!visibleObj(o))return;return v6DrawTaskV7(o);};
const v6DrawEnemyV7=drawEnemy;drawEnemy=function(o){if(!visibleObj(o))return;return v6DrawEnemyV7(o);};
const v6DrawCollectV7=drawCollect;drawCollect=function(o){if(!visibleObj(o))return;return v6DrawCollectV7(o);};
const v6DrawHazardV7=drawHazard;drawHazard=function(o){if(!visibleObj(o))return;return v6DrawHazardV7(o);};
const v6DrawCheckpointV7=drawCheckpoint;drawCheckpoint=function(o){if(!visibleObj(o))return;return v6DrawCheckpointV7(o);};
const v6DrawProjectileV7=drawProjectile;drawProjectile=function(o){if(!visibleObj(o))return;return v6DrawProjectileV7(o);};
const v6DrawPlatformV7=drawPlatform;drawPlatform=function(o){if(!visibleObj(o))return;return v6DrawPlatformV7(o);};
const v6DrawMovingV7=drawMoving;drawMoving=function(o){if(!visibleObj(o))return;return v6DrawMovingV7(o);};

// ---------- DISEGNO V7 ----------
const v6DrawV7=draw;
draw=function(){v6DrawV7();if(!game)return;drawMiniBoss();drawV7Cosmetics();};
function drawMiniBoss(){const m=game.w.v7Mini;if(!m||!m.active||m.dead||game.mode==='bossrush')return;ctx.save();const x=m.x-game.camera,y=m.y;ctx.globalAlpha=.95;ctx.fillStyle=m.color;rr(x,y,m.w,m.h,12,1,0);ctx.font='34px system-ui';ctx.textAlign='center';ctx.fillText(m.icon,x+m.w/2,y+42);ctx.fillStyle='#fff';ctx.font='bold 8px system-ui';ctx.fillText(m.name.toUpperCase(),x+m.w/2,y+62);ctx.fillStyle='#241521';rr(x-10,y-18,m.w+20,8,4,1,0);ctx.fillStyle=m.hp<=2?'#ff4b6d':'#ffcf58';rr(x-10,y-18,(m.w+20)*(m.hp/m.max),8,4,1,0);for(const p of game.v7MiniProj||[]){ctx.fillStyle='#f2edf6';ctx.strokeStyle='#ff6b82';ctx.lineWidth=2;rr(p.x-game.camera,p.y,p.w,p.h,8,1,1);ctx.fillStyle='#182431';ctx.font='bold 8px system-ui';ctx.fillText(p.cat,p.x-game.camera+p.w/2,p.y+24);}ctx.restore();}
function drawV7Cosmetics(){if(!game)return;const x=game.p.x-game.camera+game.p.w/2,y=game.p.y+game.p.h/2,t=performance.now()/300;ctx.save();if(v7.shop.trail&&Math.abs(game.p.vx)>60){ctx.globalAlpha=.35;for(let i=1;i<=4;i++){ctx.fillStyle='#9feaff';ctx.beginPath();ctx.arc(x-game.p.facing*(15+i*12),y+Math.sin(t+i)*5,5-i*.7,0,Math.PI*2);ctx.fill();}}if(v7.shop.coffeeAura){ctx.globalAlpha=.35;ctx.strokeStyle='#eee';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x-8+i*8,y-35-i*5+Math.sin(t+i)*3,5+i*2,Math.PI,Math.PI*2);ctx.stroke();}}if(v7.shop.mengasiBadge){ctx.globalAlpha=.8;ctx.font='14px system-ui';ctx.fillText('🧬',x+20,y-25);}ctx.restore();}

// ---------- TIME ATTACK ----------
function startTimeAttack(){
  if(selectedChar<0)selectedChar=0;if(selectedLevel<0)selectedLevel=Math.max(0,Math.min(4,(save.maxLevel||1)-1));startGame();if(!game)return;
  game.mode='timeattack';game.v7Mode='timeattack';game.v5EventNext=Infinity;game.start=performance.now();$('#levelPill').textContent=`⏱️ TIME ATTACK • ${game.lv.name}`;$('#status').textContent='Batti il tempo par. Bronzo, argento, oro. L’ansia ora ha un sistema di medaglie.';
}
function medalFor(idx,time){const p=LEVELS[idx].par;return time<=p*.75?'🥇 ORO':time<=p?'🥈 ARGENTO':time<=p*1.25?'🥉 BRONZO':'—';}

// ---------- BOSS RUSH ----------
function startBossRush(){
  if(selectedChar<0)selectedChar=0;selectedLevel=4;startGame();if(!game)return;
  game.mode='bossrush';game.v7Mode='bossrush';game.v5EventNext=Infinity;game.v7Rush=['Mengozzi','Gervasi','Mengasi'];game.v7RushIndex=0;game.v7RushStart=performance.now();game.v7RushNextAt=0;
  game.w.pits=[];game.w.tasks=[];game.w.enemies=[];game.w.hazards=[];game.w.collect=[];game.w.secrets=[];game.w.check=[];game.w.relics=[];game.w.upgradeStations=[];game.w.npcs=[];game.w.v7Mini=null;game.w.w=2600;game.w.groundY=460;game.w.platforms=[{x:1080,y:360,w:190,h:18,v6Type:'mengasiLeft'},{x:1480,y:300,w:180,h:18,v6Type:'mengasiCore'},{x:1880,y:370,w:180,h:18,v6Type:'mengasiRight'}];game.w.moving=[];game.bossZone=1450;game.p.x=1180;game.checkpoint={x:1180,y:360};game.lv={...LEVELS[4],name:'Boss Rush',boss:'Mengozzi',theme:'final'};game.bossStarted=true;game.bossDone=false;game.boss=null;game.projectiles=[];startBoss();$('#levelPill').textContent='👔 BOSS RUSH • 1/3 • MENGOZZI';$('#status').textContent='Tre boss. Una vita lavorativa molto discutibile.';
}
function updateBossRush(now){
  if(!game||game.mode!=='bossrush')return;
  if(game.bossDone&&!game.v7RushNextAt){game.v7RushNextAt=now+1150;game.p.inv=1500;game.p.x=1180;game.projectiles=[];}
  if(game.v7RushNextAt&&now>=game.v7RushNextAt){
    game.v7RushNextAt=0;
    if(game.v7RushIndex>=2){finishBossRush();return;}
    game.v7RushIndex++;const n=game.v7Rush[game.v7RushIndex];game.lv.boss=n;game.bossDone=false;game.bossStarted=true;game.boss=null;game.projectiles=[];game.p.x=1180;game.p.y=360;startBoss();showMsg(`👔 ROUND ${game.v7RushIndex+1}/3 • ${n.toUpperCase()}`,1400);$('#levelPill').textContent=`👔 BOSS RUSH • ${game.v7RushIndex+1}/3 • ${n.toUpperCase()}`;
  }
  if(game.p.x>2250)game.p.x=2250;
}
function finishBossRush(){
  const time=(performance.now()-game.v7RushStart)/1000;game.running=false;cancelAnimationFrame(raf);stopMusic();v7.bossRushBest=Math.min(v7.bossRushBest||Infinity,time);persistV7();sfx('clear');
  $('#rushResult').innerHTML=`<div class="stars">★★★</div><h3>Boss Rush completata</h3><p>Tempo: <b>${fmt(time)}</b><br>Record: <b>${fmt(v7.bossRushBest)}</b><br>Punti: <b>${game.score}</b></p>`;$('#rushModal').classList.remove('hidden');checkAchievements();
}

// ---------- CLEAR / GAME OVER / ACHIEVEMENT ----------
const v6ClearV7=clearLevel;
clearLevel=function(){
  if(!game)return;if(game.mode==='bossrush'){finishBossRush();return;}
  const g=game,time=(performance.now()-g.start)/1000,idx=g.idx,mode=g.mode;v6ClearV7();
  if(g.hitsTaken===0)v7.noHitLevels[idx]=true;
  if(mode==='timeattack'){
    const old=v7.timeAttack[idx];if(!old||time<old.time)v7.timeAttack[idx]={time,medal:medalFor(idx,time),char:g.ch.n};
    $('#results').innerHTML+=`<div>Medaglia<b>${medalFor(idx,time)}</b></div>`;
  }
  persistV7();checkAchievements();renderV7Career();
};
const v6GameOverV7=gameOver;
gameOver=function(){v6GameOverV7();persistV7();checkAchievements();};

// ---------- RENDER MENU / RANK ----------
const v6RenderMenuV7=renderMenu;
renderMenu=function(){v6RenderMenuV7();renderV7Career();checkAchievements();};
renderMenu();
