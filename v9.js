/* BACK OFFICE ADVENTURE DX v9 - STORIA, SUPER, IA, MISSIONI HUB */
'use strict';

const V9_KEY='boAdventureDXv9';
let v9={storySeen:{},missions:{},padY:false};
try{Object.assign(v9,JSON.parse(localStorage.getItem(V9_KEY)||'{}'));}catch(e){}
v9.storySeen||={};v9.missions||={};
function persistV9(){try{localStorage.setItem(V9_KEY,JSON.stringify(v9));}catch(e){}}

const V9_STORY=[
  {title:'CAPITOLO 1 • IL TURNO COMINCIA',face:'Eugenio',pages:[
    'Una mattina apparentemente normale. Poi si accende il primo monitor e qualcuno pronuncia la parola “urgente”.',
    'Attraversa l’Open Space, chiudi le attività compatibili e cerca di arrivare al caffè prima che il caffè arrivi a te.'
  ]},
  {title:'CAPITOLO 2 • IL LABIRINTO',face:'Mengozzi',pages:[
    'I permessi si moltiplicano. Gli allegati spariscono. I portali scoprono improvvisamente di avere dei sentimenti e smettono di funzionare.',
    'In fondo al labirinto Mengozzi ha già un’altra urgenza pronta. Naturalmente “sono solo due cose”.'
  ]},
  {title:'CAPITOLO 3 • FUORI DALL’UFFICIO',face:'Gervasi',pages:[
    'La pratica esce dall’ufficio e diventa cantiere. Transenne, buche, mezzi e documenti continuano comunque a inseguirti.',
    'Gervasi presidia la zona operativa. Qui saltare male non produce una mail: produce direttamente una buca.'
  ]},
  {title:'CAPITOLO 4 • I NUMERI NON DORMONO',face:'Mengozzi',pages:[
    'NTW, report e consuntivi si accumulano nella Sala Dati. Ogni grafico sale. Anche la pressione, stranamente.',
    'Chiudi il flusso prima che il Fine Mese inizi a chiudere te.'
  ]},
  {title:'CAPITOLO 5 • LA FUSIONE',face:'Mengasi',pages:[
    'Mengozzi e Gervasi hanno violato ogni procedura conosciuta e si sono fusi in una singola entità amministrativa.',
    'Il suo nome è MENGASI. Ha tutte le urgenze, tutte le competenze e nessuna intenzione di rimandare a domani.'
  ]}
];
const V9_OUTRO=[
  'L’Open Space è salvo. Per circa undici secondi. Dal corridoio Permessi arriva già una nuova notifica.',
  'Il labirinto è superato. La pratica, contro ogni previsione statistica, ha ottenuto un’autorizzazione.',
  'Il cantiere regge. Del Vecchio annuisce appena, che nel suo sistema operativo equivale a una standing ovation.',
  'I numeri tornano. Le NTW sono chiuse. In fondo alla sala però qualcosa sta fondendo due badge aziendali insieme.',
  'Mengasi è caduto. Il mese è chiuso. Nessuno osa chiedere cosa succede il primo giorno del mese successivo.'
];

const V9_MISSIONS={
  dalila:{npc:'Dalila',x:215,icon:'📝',title:'Permessi in ordine',desc:'Gestisci 6 attività PERM.',goal:6,reward:25},
  daniele:{npc:'Daniele',x:570,icon:'🦺',title:'Zero caos sicurezza',desc:'Completa un livello subendo al massimo 1 colpo.',goal:1,reward:30},
  michele:{npc:'Michele',x:742,icon:'👑',title:'Chiusura da responsabile',desc:'Sconfiggi un boss con combo almeno x3.',goal:1,reward:40}
};
for(const id of Object.keys(V9_MISSIONS))v9.missions[id]||={active:false,done:false,claimed:false,progress:0};

(function initV9UI(){
  document.title='Back Office Adventure DX v9';
  const logo=document.querySelector('.header .logo span');if(logo)logo.textContent='ADVENTURE DX v9';
  const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Storia a capitoli, Super Abilità, nemici più reattivi, mini-boss con pattern propri e missioni vere nell’Hub. La burocrazia ha ottenuto una trama.';
  const credits=document.querySelector('#credits h2');if(credits)credits.textContent='BACK OFFICE ADVENTURE DX v9';

  const hud=document.querySelector('.hud');
  if(hud&&!document.querySelector('#superHud')){
    const d=document.createElement('div');d.className='hb superHb';d.id='superHud';d.innerHTML='SUPER<div class="superMeter"><i id="superFill"></i></div><b id="superPct">0%</b>';hud.appendChild(d);
  }
  const controls=document.querySelector('#controls');
  if(controls&&!document.querySelector('#superBtn')){
    const b=document.createElement('button');b.id='superBtn';b.className='superBtn';b.innerHTML='SUPER<span class="cd">V / Y</span>';controls.insertBefore(b,document.querySelector('#right'));b.onclick=useSuper;
  }
  ensureV9StoryModal();
  const menuActions=document.querySelector('#menu .actions');
  if(menuActions&&!document.querySelector('#v9MissionBar')){
    const box=document.createElement('div');box.id='v9MissionBar';box.className='v9MissionBar';menuActions.parentNode.insertBefore(box,menuActions);
  }
})();

function ensureV9StoryModal(){
  let m=document.querySelector('#v9StoryModal');if(m)return m;
  m=document.createElement('div');m.id='v9StoryModal';m.className='modal hidden';
  m.innerHTML=`<div class="mcard v9StoryCard"><div class="v9StoryKicker">STORY MODE</div><img id="v9StoryFace" class="cutface"><h2 id="v9StoryTitle"></h2><div id="v9StoryText" class="v9StoryText"></div><div class="v9StoryDots" id="v9StoryDots"></div><button id="v9StoryNext" class="primary">Continua</button></div>`;
  document.body.appendChild(m);return m;
}
function storyPortrait(name){if(name==='Mengasi'&&typeof portraitMengasi==='function')return portraitMengasi();return FACE_DATA[name]||FACE_DATA.Eugenio;}
function showStory(idx,done){
  const data=V9_STORY[idx];if(!data){done?.();return;}
  const m=ensureV9StoryModal();let page=0;
  $('#v9StoryFace').src=storyPortrait(data.face);$('#v9StoryTitle').textContent=data.title;m.classList.remove('hidden');
  const paint=()=>{$('#v9StoryText').textContent=data.pages[page];$('#v9StoryDots').textContent=data.pages.map((_,i)=>i===page?'●':'○').join(' ');$('#v9StoryNext').textContent=page===data.pages.length-1?'Entra nel livello':'Continua';};
  $('#v9StoryNext').onclick=()=>{if(page<data.pages.length-1){page++;paint();return;}v9.storySeen[idx]=true;persistV9();m.classList.add('hidden');done?.();};paint();
}

const v8StartGameV9=startGame;
startGame=function(){
  v8StartGameV9();if(!game)return;
  game.v9Super=0;game.v9FreezeUntil=0;game.v9SlowUntil=0;game.v9EnemyShots=[];game.v9MiniFx=[];game.v9LastCounts={perm:game.w.tasks.filter(t=>t.dead&&t.cat==='PERM').length,enemies:game.w.enemies.filter(e=>e.dead).length,boss:game.boss?.hp??null,mini:game.w.v7Mini?.hp??null};
  updateSuperHUD();
};
function storyStart(){
  if(selectedLevel<0||selectedChar<0)return;
  if(!v9.storySeen[selectedLevel])showStory(selectedLevel,()=>startGame());else startGame();
}
$('#start').onclick=storyStart;
const nextBtn=document.querySelector('#next');
if(nextBtn)nextBtn.onclick=()=>{const n=Math.min(4,game.idx+1);$('#clear').classList.add('hidden');selectedLevel=n;if(!v9.storySeen[n])showStory(n,()=>startGame());else startGame();};

function addSuper(v){if(!game)return;game.v9Super=Math.max(0,Math.min(100,(game.v9Super||0)+v));updateSuperHUD();}
function updateSuperHUD(){
  if(!game)return;const v=Math.round(game.v9Super||0);const f=$('#superFill'),p=$('#superPct'),b=$('#superBtn');if(f)f.style.width=v+'%';if(p)p.textContent=v+'%';if(b)b.classList.toggle('ready',v>=100);
}
function finishBossFromSuper(b){
  if(!b||b.hp>0)return;game.bossDone=true;b.hp=0;game.projectiles=[];$('#bossPill')?.classList.remove('show');addScore(250);showMsg('💥 SUPER CHIUSURA • BOSS KO',1700);sfx('clear');
}
function hitBossSuper(n){const b=game?.boss;if(!b||b.hp<=0)return;b.hp=Math.max(0,b.hp-n);particle(b.x,b.y,'SUPER -'+n,'#ffe36f');finishBossFromSuper(b);}
function hitMiniSuper(n){const m=game?.w?.v7Mini;if(!m||m.dead||!m.active)return;m.hp=Math.max(0,m.hp-n);if(m.hp<=0){m.dead=true;addScore(180,m.x,m.y);showMsg(`⚡ ${m.name} ANNULLATO DALLA SUPER`,1500);sfx('clear');}}
function useSuper(){
  if(!game||!game.running||game.paused||(game.v9Super||0)<100)return;
  const ch=game.ch.n,now=performance.now();game.v9Super=0;game.abilityFxUntil=now+1300;game.cameraShake=v7?.settings?.reducedShake?4:13;sfx('clear');
  const closeTasks=(cats=null,r=720)=>{for(const t of game.w.tasks){if(t.dead)continue;if(Math.abs(t.x-game.p.x)>r)continue;if(cats&&!cats.includes(t.cat))continue;t.dead=true;addScore(18,t.x,t.y);}};
  if(ch==='Eugenio'){closeTasks(null,820);game.shield+=1;game.p.inv=2200;hitBossSuper(3);showMsg('🌐 SUPER • BACK OFFICE TOTALE',1700);}
  else if(ch==='Farris'){closeTasks(['BD','CONS'],9999);hitBossSuper(4);hitMiniSuper(3);showMsg('📊 SUPER • DATA STORM',1700);}
  else if(ch==='Yurii'){game.turboUntil=now+6500;game.p.inv=3000;game.p.vx=game.p.facing*1250;hitBossSuper(2);showMsg('💨 SUPER • HYPER DASH',1700);}
  else if(ch==='Luca'){game.p.vy=-1250;game.p.inv=3200;game.v9SlowUntil=now+5000;hitBossSuper(2);showMsg('🪽 SUPER • ORBITA OPERATIVA',1700);}
  else if(ch==='Tiziano'){game.shield+=3;game.p.inv=3800;hitBossSuper(2);showMsg('🛡️ SUPER • PROTOCOLLO SCUDO',1700);}
  else if(ch==='Daniele'){game.p.inv=6500;game.activeUntil=now+6500;game.v9FreezeUntil=now+4300;hitBossSuper(3);showMsg('🦺 SUPER • SAFETY LOCKDOWN',1700);}
  else if(ch==='Dalila'){closeTasks(['PERM'],9999);hitBossSuper(4);hitMiniSuper(3);showMsg('📝 SUPER • PERMESSO TOTALE',1700);}
  else if(ch==='Giada'){game.shield+=2;game.v9SlowUntil=now+6500;closeTasks(['PERM'],650);hitBossSuper(2);showMsg('✨ SUPER • SUPPORTO MASSIVO',1700);}
  else {closeTasks(null,9999);game.shield+=2;game.p.inv=5200;game.v9FreezeUntil=now+3000;hitBossSuper(5);hitMiniSuper(4);showMsg('👑 SUPER • RESPONSABILE ASSOLUTO',1800);}
  updateHUD();updateSuperHUD();
}
document.addEventListener('keydown',e=>{if(['v','V'].includes(e.key)){useSuper();e.preventDefault();}});

const v8PollGamepadV9=pollGamepad;
pollGamepad=function(){
  const gp=[...(navigator.getGamepads?.()||[])].find(Boolean);const y=!!gp?.buttons?.[3]?.pressed;const edge=y&&!v9.padY;v8PollGamepadV9();if(edge)useSuper();v9.padY=y;
};

// ---------- IA PIU' REATTIVA + FIX PORTALE ----------
const v8HitV9=hit;
hit=function(a,b){if(b?.type==='portale'&&b.active===false)return false;return v8HitV9(a,b);};
const v8UpdateEnemyV9=updateEnemy;
updateEnemy=function(e,dt,now){
  if(game?.v9FreezeUntil>now){e.v9Aggro=false;return;}
  const slow=(game?.v9SlowUntil>now)?0.52:1;v8UpdateEnemyV9(e,dt*slow,now);
  if(!game||e.dead)return;const dx=game.p.x-e.x,dy=game.p.y-e.y,dist=Math.hypot(dx,dy);e.v9Aggro=dist<360;
  if(e.type==='pec'&&dist<360)e.y+=Math.sign(dy)*22*dt/1000;
  if(e.type==='allegato'&&dist<280){e.x+=Math.sign(dx)*40*dt/1000;e.y+=Math.sign(dy)*24*dt/1000;}
  if(e.type==='scaduta'&&dist<330)e.base+=Math.sign(dx)*28*dt/1000;
  if(e.type==='foglio'&&dist<300)e.y+=Math.sign(dy)*18*dt/1000;
  if(e.type==='sollecito'&&dist<320)e.x+=Math.sign(dx)*35*dt/1000;
  if(e.type==='riunione'&&dist<250)e.v9Block=true;else e.v9Block=false;
};
const v8DrawEnemyV9=drawEnemy;
drawEnemy=function(e){v8DrawEnemyV9(e);if(!e?.v9Aggro||e.dead)return;ctx.save();ctx.fillStyle='#ffcf5a';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillText('!',e.x+(e.w||40)/2,e.y-8);ctx.restore();};

// ---------- MINI-BOSS CON PATTERN PROPRI ----------
const v8UpdateMiniV9=updateMiniBoss;
updateMiniBoss=function(dt,now){
  const m=game?.w?.v7Mini;if(m&&!m.v9Init){m.v9Init=true;m.v9Special=now+1300;m.v9BaseX=m.x;m.v9BaseY=m.y;}
  v8UpdateMiniV9(dt,now);if(!game||!m||!m.active||m.dead||game.mode==='bossrush')return;
  if(now<(game.v9FreezeUntil||0))return;
  if(now>(m.v9Special||0)){
    m.v9Special=now+Math.max(1300,2400-game.idx*170);
    const cat=['BD','CONS','PERM','SIC'][game.idx%4];
    if(game.idx===0){for(let i=0;i<3;i++)game.v9MiniFx.push({kind:'paper',x:m.x-5,y:230+i*65,w:42,h:25,vx:-360-i*35,cat,dead:false});}
    if(game.idx===1){m.y=210;for(let i=0;i<2;i++)game.v9MiniFx.push({kind:'pecDive',x:m.x-30-i*85,y:120,w:48,h:34,vx:-210-i*30,vy:210+i*50,cat,dead:false});}
    if(game.idx===2){game.v9MiniFx.push({kind:'shock',x:game.p.x-110,y:game.w.groundY-18,w:220,h:18,telegraphUntil:now+650,life:1700,cat,dead:false});}
    if(game.idx===3){for(let i=0;i<3;i++)game.v9MiniFx.push({kind:'report',x:m.x-120-i*72,y:170+i*55,w:46,h:46,vx:-160,cat,dead:false});}
    if(game.idx===4){game.v9MiniFx.push({kind:'shock',x:game.p.x-130,y:game.w.groundY-20,w:260,h:20,telegraphUntil:now+480,life:1500,cat,dead:false});for(let i=0;i<2;i++)game.v9MiniFx.push({kind:'paper',x:m.x-10,y:255+i*90,w:44,h:26,vx:-430-i*50,cat,dead:false});}
  }
  if(game.idx===1)m.y=m.v9BaseY+Math.sin(now/370)*55;
};
function updateMiniFx(dt,now){
  if(!game)return;const slow=(game.v9SlowUntil>now)?0.55:1;
  for(const q of game.v9MiniFx||[]){if(q.dead)continue;if(q.telegraphUntil&&now<q.telegraphUntil)continue;if(q.kind==='paper'||q.kind==='report'){q.x+=q.vx*dt/1000*slow;}if(q.kind==='pecDive'){q.x+=q.vx*dt/1000*slow;q.y+=q.vy*dt/1000*slow;}if(q.kind==='shock'){q.life-=dt;if(q.life<=0)q.dead=true;}
    if(!q.dead&&hit(game.p,q)&&game.p.inv<=0){q.dead=true;if(hasSkill(game.ch,q.cat)){comboScore(18,q.x,q.y);addSuper(8);game.p.vy=-240;sfx('good');}else damage(`Pattern mini-boss: ${CAT[q.cat]}.`,game.p.x<q.x?-1:1);}
    if(q.x<game.camera-220||q.y>560)q.dead=true;
  }game.v9MiniFx=(game.v9MiniFx||[]).filter(q=>!q.dead);
}
function drawMiniFx(){if(!game)return;const now=performance.now(),cam=game.camera;ctx.save();for(const q of game.v9MiniFx||[]){if(q.dead)continue;const sx=q.x-cam;if(sx<-300||sx>1200)continue;if(q.telegraphUntil&&now<q.telegraphUntil){ctx.globalAlpha=.55;ctx.strokeStyle='#ffca55';ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.strokeRect(sx,q.y,q.w,q.h);ctx.setLineDash([]);continue;}ctx.globalAlpha=.9;ctx.textAlign='center';if(q.kind==='paper'){ctx.font='24px system-ui';ctx.fillText('📄',sx+q.w/2,q.y+22);}else if(q.kind==='pecDive'){ctx.font='26px system-ui';ctx.fillText('✉️',sx+q.w/2,q.y+26);}else if(q.kind==='report'){ctx.fillStyle='#dff7f5';rr(sx,q.y,q.w,q.h,6,1,0);ctx.fillStyle='#1b4c53';ctx.font='bold 8px system-ui';ctx.fillText('REPORT',sx+q.w/2,q.y+27);}else{ctx.fillStyle='#f7b938';ctx.fillRect(sx,q.y,q.w,q.h);}}ctx.restore();}

// ---------- UPDATE / SUPER METER / MISSIONI ----------
const v8UpdateV9=update;
update=function(dt,now){
  if(!game)return;const beforePerm=game.w.tasks.filter(t=>t.dead&&t.cat==='PERM').length,beforeEnemies=game.w.enemies.filter(e=>e.dead).length,beforeBoss=game.boss?.hp??null,beforeMini=game.w.v7Mini?.hp??null;
  v8UpdateV9(dt,now);if(!game)return;updateMiniFx(dt,now);
  const afterPerm=game.w.tasks.filter(t=>t.dead&&t.cat==='PERM').length,afterEnemies=game.w.enemies.filter(e=>e.dead).length,afterBoss=game.boss?.hp??null,afterMini=game.w.v7Mini?.hp??null;
  if(afterEnemies>beforeEnemies)addSuper((afterEnemies-beforeEnemies)*10);if(afterPerm>beforePerm){addSuper((afterPerm-beforePerm)*7);progressMission('dalila',afterPerm-beforePerm);}if(beforeBoss!=null&&afterBoss!=null&&afterBoss<beforeBoss)addSuper((beforeBoss-afterBoss)*9);if(beforeMini!=null&&afterMini!=null&&afterMini<beforeMini)addSuper((beforeMini-afterMini)*12);
  if(game.combo>=4&&now-(game.v9ComboTick||0)>2500){game.v9ComboTick=now;addSuper(4);}
  updateSuperHUD();
};
const v8DrawV9=draw;
draw=function(){v8DrawV9();if(game)drawMiniFx();};

function progressMission(id,n=1){const m=v9.missions[id],cfg=V9_MISSIONS[id];if(!m?.active||m.done||m.claimed)return;m.progress=Math.min(cfg.goal,(m.progress||0)+n);if(m.progress>=cfg.goal){m.done=true;showMsg(`✅ MISSIONE HUB: ${cfg.title}`,1600);}persistV9();renderMissionBar();}
function renderMissionBar(){const box=$('#v9MissionBar');if(!box)return;box.innerHTML=Object.entries(V9_MISSIONS).map(([id,c])=>{const m=v9.missions[id];const state=m.claimed?'RISCOSSA':m.done?'TORNA DA '+c.npc.toUpperCase():m.active?`${m.progress||0}/${c.goal}`:'NON ACCETTATA';return `<div class="v9Mission ${m.done&&!m.claimed?'done':''}"><span>${c.icon}</span><div><b>${c.title}</b><small>${c.desc}</small></div><em>${state}</em></div>`;}).join('');}

const v8ClearV9=clearLevel;
clearLevel=function(){
  if(!game)return;const g=game,idx=g.idx,bossDone=!!g.bossDone,combo=g.maxCombo||1,hits=g.hitsTaken||0;v8ClearV9();
  if(v9.missions.daniele.active&&!v9.missions.daniele.done&&!v9.missions.daniele.claimed&&hits<=1){v9.missions.daniele.progress=1;v9.missions.daniele.done=true;}
  if(v9.missions.michele.active&&!v9.missions.michele.done&&!v9.missions.michele.claimed&&bossDone&&combo>=3){v9.missions.michele.progress=1;v9.missions.michele.done=true;}
  persistV9();renderMissionBar();
  const card=document.querySelector('#clear .mcard');if(card){let beat=card.querySelector('#v9StoryBeat');if(!beat){beat=document.createElement('div');beat.id='v9StoryBeat';beat.className='v9StoryBeat';const acts=card.querySelector('.actions');card.insertBefore(beat,acts);}beat.textContent='📖 '+V9_OUTRO[idx];}
};

// ---------- HUB NPC E MISSIONI ----------
function missionNpcNear(){if(!hub?.open)return null;let best=null;for(const [id,c] of Object.entries(V9_MISSIONS)){const d=Math.abs(hub.x-c.x);if(d<44&&(!best||d<best.d))best={id,c,d};}return best;}
function hubSay(text,ms=2600){v9.hubSpeech={text,until:performance.now()+ms};}
function interactMission(id){const cfg=V9_MISSIONS[id],m=v9.missions[id];if(m.claimed){hubSay(`${cfg.npc}: “Questa l’abbiamo già chiusa. Non riapriamola per sport.”`);return;}if(m.done){m.claimed=true;save.totalStamps+=cfg.reward;persist();persistV9();hubSay(`${cfg.npc}: “Perfetto. +${cfg.reward} marche. Questa volta il sistema ha collaborato.”`);renderMissionBar();return;}if(!m.active){m.active=true;m.progress=0;persistV9();hubSay(`${cfg.npc}: “${cfg.desc} Poi torna da me.”`);renderMissionBar();return;}hubSay(`${cfg.npc}: “Sei a ${m.progress||0}/${cfg.goal}. La pratica non si chiude guardandola.”`);}
const v8HubInteractV9=hubInteract;
hubInteract=function(){const n=missionNpcNear();if(n){interactMission(n.id);return;}v8HubInteractV9();};
const v8DrawHubV9=drawHub;
drawHub=function(now){
  v8DrawHubV9(now);const c=$('#hubCanvas');if(!c)return;const x=c.getContext('2d');
  for(const [id,n] of Object.entries(V9_MISSIONS)){const m=v9.missions[id],im=imgs?.[n.npc];x.save();x.globalAlpha=.22;x.fillStyle='#000';x.beginPath();x.ellipse(n.x,326,18,5,0,0,Math.PI*2);x.fill();x.globalAlpha=1;x.fillStyle=m.done&&!m.claimed?'#e5b64e':'#34566e';x.fillRect(n.x-14,278,28,40);x.beginPath();x.arc(n.x,258,18,0,Math.PI*2);x.clip();if(im?.complete)x.drawImage(im,n.x-18,240,36,36);else{x.fillStyle='#687b89';x.fillRect(n.x-18,240,36,36);}x.restore();x.fillStyle='#eaf7ff';x.textAlign='center';x.font='bold 8px system-ui';x.fillText(n.npc.toUpperCase(),n.x,342);x.fillStyle='#ffda68';x.font='13px system-ui';x.fillText(m.done&&!m.claimed?'!':m.active?'•':'?',n.x,232);}
  const near=missionNpcNear();if(near){x.fillStyle='#07131ded';x.strokeStyle='#ffd269';x.lineWidth=2;x.fillRect(300,76,300,42);x.strokeRect(300,76,300,42);x.fillStyle='#fff3bf';x.textAlign='center';x.font='bold 11px system-ui';x.fillText(`E / A • PARLA CON ${near.c.npc.toUpperCase()}`,450,102);}
  if(v9.hubSpeech&&now<v9.hubSpeech.until){x.fillStyle='#06131ef2';x.strokeStyle='#69dfff';x.lineWidth=2;x.fillRect(150,25,600,44);x.strokeRect(150,25,600,44);x.fillStyle='#e9faff';x.textAlign='center';x.font='bold 10px system-ui';x.fillText(v9.hubSpeech.text.slice(0,96),450,52);}
};

// ---------- MENU / RENDER ----------
const v8RenderMenuV9=renderMenu;
renderMenu=function(){v8RenderMenuV9();renderMissionBar();};
renderMissionBar();
