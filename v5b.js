// --- START, DIFFICOLTA, ENDLESS, GHOST ---
const v4StartGame=startGame;
startGame=function(){
  v4StartGame();if(!game)return;
  game.ch={...game.ch};
  const d=DIFFS[difficultyMode];game.difficulty*=d.difficulty;game.scoreMult=d.score;game.v5Difficulty=difficultyMode;
  game.costume=selectedCostume;game.mode='story';game.v5Relics=0;game.v5EnemyKills=0;game.v5Abilities=0;game.v5Coffee=0;
  game.v5Event=null;game.v5EventNext=performance.now()+18000+Math.random()*9000;game.v5UpgradeOpen=false;
  game.v5Samples=[];game.v5LastSample=0;game.v5Ghost=v5extra.ghost[recKey(game.idx,game.ch.n)]||null;game.v5BossCounted=false;
  game.v5Prev={tasks:0,enemies:0,coffee:0};
  v5extra.stats.runs++;v5extra.stats.chars[game.ch.n]=(v5extra.stats.chars[game.ch.n]||0)+1;persistV5();
  $('#ghostTag').classList.toggle('hidden',!game.v5Ghost);
  $('#levelPill').textContent+=` • ${d.label}`;
};
$('#start').onclick=startGame;

function extendEndless(toX){
  const w=game.w,cats=['BD','CONS','PERM','SIC'];let start=Math.max(350,w.v5BuiltTo||350);
  for(let x=start;x<toX;x+=360){
    const k=Math.floor(x/360);
    if(k%6===0)w.pits.push({x:x+110,w:125});
    if(k%2===0)w.platforms.push({x,y:330-(k%3)*45,w:150,h:16});
    w.tasks.push({x:x+80,y:w.groundY-46,w:52,h:46,cat:cats[k%4],base:x+80,range:65+Math.min(80,k/15),dead:false});
    if(k%3===0)w.enemies.push({type:['pec','scaduta','ticket','sollecito'][k%4],x:x+190,y:w.groundY-42,base:x+190,range:90,w:48,h:42,dead:false,phase:k});
    w.collect.push({x:x+40,y:300,type:k%5===0?'coffee':'stamp',taken:false,bob:Math.random()*6});
    if(k%9===0)w.upgradeStations.push({x:x+250,y:w.groundY-55,used:false});
  }
  w.v5BuiltTo=toX;w.w=toX+5000;
}
function startEndless(){
  if(selectedChar<0)selectedChar=0;selectedLevel=0;startGame();if(!game)return;
  game.mode='endless';game.lv={...game.lv,name:'Endless',boss:null,par:99999};game.bossZone=null;game.w.w=12000;game.w.pits=[];game.w.platforms=[];game.w.tasks=[];game.w.enemies=[];game.w.collect=[];game.w.check=[];game.w.hazards=[];game.w.relics=[];game.w.upgradeStations=[];game.w.npcs=[];game.w.v5BuiltTo=350;
  extendEndless(11000);
  $('#levelPill').textContent='♾ ENDLESS • '+DIFFS[difficultyMode].label;
  $('#status').textContent='Corri finché puoi. Il fine mese, concettualmente, non termina mai.';
  $('#ghostTag').classList.add('hidden');
}
$('#endlessBtn').onclick=startEndless;

// Punteggio globale con moltiplicatori upgrade/eventi/difficoltà.
const v4AddScore=addScore;
addScore=function(v,x,y){const m=game?.scoreMult||1;return v4AddScore(v*m,x,y);};

// --- UPGRADE MODAL ---
function openUpgrade(st){
  if(!game||game.v5UpgradeOpen||st.used)return;st.used=true;game.v5UpgradeOpen=true;game.paused=true;
  const picks=[...UPGRADES].sort(()=>Math.random()-.5).slice(0,3),box=$('#upgradeGrid');box.innerHTML='';
  picks.forEach(u=>{const b=document.createElement('button');b.className='upgradeCard';b.innerHTML=`<strong>${u.icon}</strong><b>${u.name}</b><span>${u.desc}</span>`;b.onclick=()=>{u.apply(game);game.v5UpgradeOpen=false;game.paused=false;$('#upgradeModal').classList.add('hidden');showMsg(`${u.icon} ${u.name}`,1200);updateHUD();};box.appendChild(b);});
  $('#upgradeModal').classList.remove('hidden');
}

function startRandomEvent(now){
  const ev={...EVENTS[Math.floor(Math.random()*EVENTS.length)]};ev.until=now+ev.dur;game.v5Event=ev;
  if(ev.id==='smart')game.shield++;
  const b=$('#eventBanner');b.textContent=`${ev.icon} ${ev.name} • ${ev.desc}`;b.classList.add('show');showMsg(`${ev.icon} ${ev.name}`,1100);
}
function endRandomEvent(){game.v5Event=null;$('#eventBanner').classList.remove('show');game.v5EventNext=performance.now()+18000+Math.random()*13000;}

const v4Update=update;
update=function(dt,now){
  if(!game)return;
  const beforeTasks=game.w.tasks?.filter(t=>t.dead).length||0,beforeEnemies=game.w.enemies?.filter(e=>e.dead).length||0,beforeCoffee=game.w.collect?.filter(c=>c.taken&&c.type==='coffee').length||0;

  // Reliquie vengono raccolte prima del motore base.
  for(const r of game.w.relics||[]){if(!r.taken&&hit(game.p,{x:r.x-22,y:r.y-22,w:44,h:44})){r.taken=true;game.v5Relics++;v5extra.archive[r.id]=true;addScore(120,r.x,r.y);showMsg('🏺 REPERTO ARCHIVIATO • +120',1600);sfx('clear');persistV5();}}

  if(!game.v5Event&&now>game.v5EventNext)startRandomEvent(now);
  if(game.v5Event&&now>game.v5Event.until)endRandomEvent();

  const baseSpd=game.ch.spd,baseDiff=game.difficulty,baseMult=game.scoreMult;
  if(game.v5Event?.id==='meeting')game.ch.spd*=.72;
  if(game.v5Event?.id==='urgent'){game.ch.spd*=1.15;game.difficulty*=1.10;game.scoreMult*=2;}
  if(game.v5Event?.id==='maintenance')game.difficulty*=.80;
  if(game.v5Event?.id==='slow')game.difficulty*=.86;

  v4Update(dt,now);
  game.ch.spd=baseSpd;game.difficulty=baseDiff;game.scoreMult=baseMult;
  if(!game)return;
  if(game.mode==='endless'&&game.p.x>game.w.v5BuiltTo-4500)extendEndless(game.w.v5BuiltTo+10000);

  // Stazioni di potenziamento.
  for(const st of game.w.upgradeStations||[])if(!st.used&&hit(game.p,{x:st.x-30,y:st.y,w:60,h:58})){openUpgrade(st);break;}

  // Del Vecchio ricorrente.
  for(const n of game.w.npcs||[])if(!n.seen&&Math.abs((game.p.x+game.p.w/2)-n.x)<72){n.seen=true;showMsg(`👷 ${n.text}`,1900);}

  // Ghost recording ogni ~140ms.
  if(game.mode==='story'&&now-game.v5LastSample>140){game.v5LastSample=now;game.v5Samples.push([Math.round(now-game.start),Math.round(game.p.x),Math.round(game.p.y)]);if(game.v5Samples.length>1300)game.v5Samples.shift();}

  v5extra.stats.playTime+=dt/1000;
  const afterTasks=game.w.tasks?.filter(t=>t.dead).length||0,afterEnemies=game.w.enemies?.filter(e=>e.dead).length||0,afterCoffee=game.w.collect?.filter(c=>c.taken&&c.type==='coffee').length||0;
  if(afterTasks>beforeTasks)v5extra.stats.tasks+=afterTasks-beforeTasks;
  if(afterEnemies>beforeEnemies){const d=afterEnemies-beforeEnemies;v5extra.stats.enemies+=d;game.v5EnemyKills+=d;}
  if(afterCoffee>beforeCoffee){const d=afterCoffee-beforeCoffee;v5extra.stats.coffees+=d;game.v5Coffee+=d;}
};

const v4Damage=damage;
damage=function(reason,dir=0,pit=false){const before=game?.lives||0;v4Damage(reason,dir,pit);if(game&&game.lives<before){v5extra.stats.deaths++;persistV5();if(navigator.vibrate)try{navigator.vibrate([70,35,90]);}catch(e){}}};
const v4Ability=useAbility;
useAbility=function(){const before=game?.abilityReady||0;v4Ability();if(game&&game.abilityReady!==before){game.v5Abilities++;v5extra.stats.abilities++;if(navigator.vibrate)try{navigator.vibrate(25);}catch(e){}}};
$('#ability').onclick=useAbility;

// --- NEMICI EXTRA ---
const v4EnemyLabel=enemyLabel;
enemyLabel=function(type){return ({foglio:'Foglio sparato dalla stampante.',ticket:'Ticket rimbalzante.',sollecito:'Sollecito che non accetta il silenzio.',riunione:'Riunione improvvisa. Danno morale.'})[type]||v4EnemyLabel(type);};
const v4UpdateEnemy=updateEnemy;
updateEnemy=function(e,dt,now){
  if(['pec','allegato','scaduta','portale'].includes(e.type))return v4UpdateEnemy(e,dt,now);
  if(e.type==='foglio'){e.x=e.base+Math.sin(now/420+e.phase)*150;e.y=230+Math.sin(now/250+e.phase)*55;}
  if(e.type==='ticket'){e.x=e.base+Math.sin(now/360+e.phase)*e.range;e.y=game.w.groundY-42-Math.abs(Math.sin(now/310+e.phase))*80;}
  if(e.type==='sollecito'){const dx=game.p.x-e.x;e.x+=Math.sign(dx)*80*game.difficulty*dt/1000;e.y=game.w.groundY-e.h;}
  if(e.type==='riunione'){e.x=e.base+Math.sin(now/700+e.phase)*55;e.y=game.w.groundY-e.h;}
};

// --- BOSS: MENGOZZI, GERVASI, MENGASI ---
function bossSpeak(text){
  if(!audioOn||!('speechSynthesis'in window))return;
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/[“”]/g,''));u.lang='it-IT';u.rate=.96;u.pitch=.78;u.volume=.55;speechSynthesis.speak(u);}catch(e){}
}
beginCutscene=function(){
  game.bossStarted=true;game.paused=true;const n=game.lv.boss;
  if(n==='Mengasi'){$('#cutFace').src=portraitMengasi();$('#cutTitle').textContent='⚠ FUSIONE NON AUTORIZZATA: MENGASI';$('#cutLine').textContent='“Mengozzi + Gervasi. Una sola entità. Tutte le urgenze.”';}
  else{$('#cutFace').src=FACE_DATA[n];$('#cutTitle').textContent=`BOSS: ${n}`;$('#cutLine').textContent=n==='Mengozzi'?'“Questa è urgente. Serve entro oggi.”':'“Il cantiere non aspetta. Muovetevi.”';}
  $('#cutscene').classList.remove('hidden');sfx('boss');bossSpeak($('#cutLine').textContent);
};
startBoss=function(){
  const n=game.lv.boss;const base=n==='Mengasi'?34:n==='Gervasi'?18:16;const hp=base+(ngPlus?6:0)+(difficultyMode==='monthend'?5:0);
  game.boss={name:n,hp,max:hp,x:game.w.w-270,y:205,last:0,phase:1,alt:0,lastPhase:1};game.projectiles=[];$('#bossPill').classList.add('show');showMsg(n==='Mengasi'?'🧬 MENGASI SI È FORMATO':'👔 BOSS IN ARRIVO',1400);startBossMusic(n);
};
function startBossMusic(name){
  stopMusic();audioReady();if(!audioOn||!audioCtx)return;let step=0;const notes=name==='Mengasi'?[110,146,165,220,196,146]:name==='Gervasi'?[130,174,196,261]:[123,155,185,247];
  musicTimer=setInterval(()=>{if(!game||!game.running||game.paused)return;const n=notes[step%notes.length];tone(n,.22,step%2?'square':'sawtooth',.011);if(step%4===0)tone(n*2,.10,'triangle',.007,.06);step++;},260);
}
startMusic=function(theme){
  stopMusic();if(!audioOn)return;audioReady();const maps={office:[220,277,330,392,330,277],permits:[196,247,294,330,294,247],site:[174,220,261,294,261,220],cons:[207,261,311,369,311,261],final:[146,196,233,277,233,196]};const notes=maps[theme]||maps.office;musicStep=0;
  musicTimer=setInterval(()=>{if(!game||!game.running||game.paused||!audioOn)return;const n=notes[musicStep%notes.length];tone(n,.16,'triangle',.009);if(musicStep%3===0)tone(n/2,.24,'sine',.006);musicStep++;},350);
};

spawnBossPattern=function(b,now){
  const cats=['BD','CONS','PERM','SIC'];const cat=()=>cats[Math.floor(Math.random()*cats.length)];
  const straight=(y,urgent=false,speed=1)=>game.projectiles.push({kind:'straight',x:game.w.w-315,y,w:64,h:42,vx:-(350+b.phase*42)*game.difficulty*speed,cat:cat(),dead:false,urgent});
  const drop=(x,urgent=true,delay=500)=>game.projectiles.push({kind:'drop',x,y:90,w:58,h:40,vy:(275+b.phase*48)*game.difficulty,telegraphUntil:now+delay,cat:cat(),dead:false,urgent});
  if(b.name==='Mengozzi'){
    if(b.phase===1)straight(300+Math.random()*90,false,1);
    if(b.phase===2){straight(270,true,1.1);straight(390,false,.92);}
    if(b.phase===3){[255,330,405].forEach((y,i)=>straight(y,i!==1,1.08));}
  }else if(b.name==='Gervasi'){
    if(b.phase===1)drop(game.p.x+Math.random()*120-60,true,650);
    if(b.phase===2){drop(game.p.x-90,true,520);drop(game.p.x+90,true,720);}
    if(b.phase===3){drop(game.p.x-130,true,450);drop(game.p.x,true,620);drop(game.p.x+130,true,800);straight(365,true,.9);}
  }else{
    // MENGASI usa insieme i pattern dei due boss e aggiunge la raffica fusione.
    if(b.phase===1){straight(310,true,1.05);drop(game.p.x+Math.random()*150-75,true,600);}
    if(b.phase===2){straight(260,true,1.12);straight(400,false,1);drop(game.p.x-100,true,500);drop(game.p.x+100,true,700);}
    if(b.phase===3){[245,320,395].forEach((y,i)=>straight(y,true,1.16+i*.05));[-150,0,150].forEach((dx,i)=>drop(game.p.x+dx,true,420+i*150));}
  }
};
const v4UpdateBoss=updateBoss;
updateBoss=function(dt,now){const b=game?.boss;const phase=b?.phase;const wasDone=game?.bossDone;v4UpdateBoss(dt,now);if(b&&b.phase!==phase){const phrase=b.name==='Mengasi'?(b.phase===2?'La fusione passa alla fase due. Aprite tutto.':'Priorità assoluta. Tutto insieme.'):(b.phase===2?'Vi giro anche una integrazione.':'È diventata priorità massima.');bossSpeak(phrase);}if(game?.bossDone&&!wasDone&&!game.v5BossCounted){game.v5BossCounted=true;v5extra.stats.bosses++;persistV5();}};
