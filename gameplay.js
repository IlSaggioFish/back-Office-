function damage(reason,dir=0,pit=false){
  if(!game||!game.running)return;
  const p=game.p,now=performance.now();
  if(p.inv>0 || ((game.activeUntil>now)&&['Daniele','Michele'].includes(game.ch.n)))return;
  if(game.shield>0){
    game.shield--; p.inv=900; game.cameraShake=8; resetCombo(); showMsg('🛡️ SCUDO CONSUMATO'); sfx('hurt'); updateHUD(); return;
  }
  game.lives--; game.hitsTaken++; p.inv=1500; p.hurt=500; game.cameraShake=14; resetCombo(); sfx('hurt'); updateHUD();
  if(navigator.vibrate)try{navigator.vibrate(80)}catch(e){}
  if(game.lives<=0){gameOver();return;}
  if(pit){
    p.x=game.checkpoint.x; p.y=game.checkpoint.y; p.vx=p.vy=0;
  } else {
    p.vx=(dir||-p.facing)*430; p.vy=-390;
  }
  $('#status').textContent='💥 '+reason;
}

function useAbility(){
  if(!game||!game.running||game.paused)return;
  const now=performance.now(); if(now<game.abilityReady)return;
  const ch=game.ch,p=game.p;
  game.abilityReady=now+ch.cd*1000; game.abilityFxUntil=now+650;
  sfx('ability'); showMsg('⚡ '+ch.ability);

  if(ch.n==='Eugenio'){
    const cand=game.w.tasks.filter(t=>!t.dead&&!hasSkill(ch,t.cat)).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
    if(cand&&Math.abs(cand.x-p.x)<480){cand.dead=true;addScore(20,cand.x,cand.y);}
  }
  if(ch.n==='Farris'){
    for(const t of game.w.tasks)if(!t.dead&&(t.cat==='BD'||t.cat==='CONS')&&Math.abs(t.x-p.x)<450){t.dead=true;addScore(16,t.x,t.y);}
  }
  if(ch.n==='Yurii'){p.vx=950*p.facing;p.inv=650;}
  if(ch.n==='Luca'){p.vy=-1040;p.onGround=false;}
  if(ch.n==='Tiziano')game.shield++;
  if(ch.n==='Daniele')game.activeUntil=now+4000;
  if(ch.n==='Dalila'){
    for(const t of game.w.tasks)if(!t.dead&&t.cat==='PERM'&&Math.abs(t.x-p.x)<540){t.dead=true;addScore(24,t.x,t.y);}
  }
  if(ch.n==='Giada')game.shield++;
  if(ch.n==='Michele'){game.activeUntil=now+5000;p.vx=760*p.facing;}
  updateHUD();
}

function updateTutorial(){
  const b=$('#tutorialBubble');
  if(!game||game.idx!==0){b.classList.add('hidden');return;}
  const hint=game.w.hints.find(h=>Math.abs(h.x-game.p.x)<150);
  if(!hint){b.classList.add('hidden');return;}
  b.textContent=hint.text; b.classList.remove('hidden');
  b.style.left=Math.min(75,Math.max(8,((hint.x-game.camera)/C.width)*100))+'%';
  b.style.top='22%';
}

function update(dt,now){
  if(!game||!game.running||game.paused)return;
  const p=game.p,ch=game.ch,w=game.w;
  if(p.inv>0)p.inv=Math.max(0,p.inv-dt);
  if(p.hurt>0)p.hurt=Math.max(0,p.hurt-dt);
  if(game.combo>1&&now-game.lastGood>3800){game.combo=1;updateHUD();}

  let dir=(keys.left?-1:0)+(keys.right?1:0); if(dir)p.facing=dir;
  const turbo=((ch.n==='Michele'&&game.activeUntil>now)?1.35:1)*(game.turboUntil>now?1.28:1);
  const target=dir*ch.spd*turbo;
  const acc=p.onGround?12:7,fric=p.onGround?.80:.94;
  p.vx+=(target-p.vx)*Math.min(1,acc*dt/1000); if(!dir)p.vx*=Math.pow(fric,dt/16.67);
  if(Math.abs(p.vx)>30)p.anim+=dt*Math.abs(p.vx)/100000;

  if(p.onGround)p.coyote=120;else p.coyote=Math.max(0,p.coyote-dt);
  const buffered=now-jumpPressedAt<140;
  if(buffered&&p.coyote>0&&jumpReleased){
    p.vy=-ch.jump; p.onGround=false; p.coyote=0; jumpReleased=false; jumpPressedAt=-9999; sfx('jump');
  }
  if(!keys.jump&&p.vy<-250)p.vy*=Math.pow(.72,dt/16.67);
  p.vy+=2050*game.difficulty*dt/1000; p.vy=Math.min(p.vy,1100);

  const prevY=p.y;
  p.x+=p.vx*dt/1000; p.y+=p.vy*dt/1000;
  p.x=Math.max(0,Math.min(w.w-p.w,p.x));
  p.onGround=false;
  const gy=groundAt(p.x+p.w/2);
  if(gy<900&&p.y+p.h>=gy&&prevY+p.h<=gy+15&&p.vy>=0){p.y=gy-p.h;p.vy=0;p.onGround=true;}

  for(const mp of w.moving)mp.x=mp.base+Math.sin(now/900+mp.phase)*mp.amp;
  for(const pl of w.platforms.concat(w.moving)){
    if(p.x+p.w>pl.x&&p.x<pl.x+pl.w&&p.y+p.h>=pl.y&&prevY+p.h<=pl.y+10&&p.vy>=0){
      p.y=pl.y-p.h;p.vy=0;p.onGround=true;
    }
  }
  if(p.y>610){damage('Sei finito nella buca. La pratica è ancora aperta.',0,true);return;}

  updateWorkTasks(dt,now);

  for(const e of w.enemies){
    if(e.dead)continue;
    updateEnemy(e,dt,now);
    if(hit(p,e)&&p.inv<=0){
      if(p.vy>180 && prevY+p.h<=e.y+12){
        e.dead=true;p.vy=-430;addScore(15,e.x,e.y);sfx('good');particle(e.x,e.y,'SCHIACCIATO','#8df7c1');
      } else damage(enemyLabel(e.type),p.x<e.x?-1:1);
    }
  }

  for(const h of w.hazards)if(hit(p,h)&&p.inv<=0)damage(h.type==='printer'?'Stampante inceppata.':'Hai centrato una transenna.',p.x<h.x?-1:1);

  for(const c of w.collect){
    if(c.taken)continue;
    if(hit(p,{x:c.x-17,y:c.y-17,w:34,h:34})){
      c.taken=true;
      if(c.type==='stamp'){game.stamps++;addScore(10,c.x,c.y);}
      if(c.type==='ntw'){addScore(35,c.x,c.y);showMsg('📄 NTW CHIUSA');}
      if(c.type==='shield'){game.shield++;showMsg('🏠 SMART WORKING • +1 SCUDO');}
      if(c.type==='coffee'){game.turboUntil=now+5000;addScore(15,c.x,c.y);showMsg('☕ CAFFÈ TURBO • 5 SECONDI',1400);}
      sfx('coin');
    }
  }

  for(const sec of w.secrets){
    if(!sec.taken&&hit(p,{x:sec.x-24,y:sec.y-24,w:48,h:48})){
      sec.taken=true;game.secretFound=true;addScore(100,sec.x,sec.y);
      showMsg('🕵️ DOCUMENTO SEGRETO • +100',1800);sfx('clear');
    }
  }

  for(const cp of w.check){
    if(!cp.hit&&hit(p,{x:cp.x-25,y:cp.y,w:50,h:64})){
      cp.hit=true;game.checkpoint={x:cp.x-20,y:w.groundY-p.h};
      showMsg('☕ CHECKPOINT CAFFÈ');sfx('coin');
    }
  }

  if(game.bossZone&&p.x>game.bossZone&&!game.bossStarted){beginCutscene();return;}
  if(game.boss)updateBoss(dt,now);

  if(!game.lv.boss&&p.x>w.w-140)clearLevel();
  if(game.bossDone&&p.x>w.w-120)clearLevel();

  for(const q of game.particles){q.life-=dt;q.y+=q.vy*dt/1000;}
  game.particles=game.particles.filter(q=>q.life>0);

  const lead=p.facing>0?C.width*.32:C.width*.60;
  const targetCam=Math.max(0,Math.min(w.w-C.width,p.x-lead));
  game.camera+=(targetCam-game.camera)*Math.min(1,dt*.006);
  if(game.cameraShake>0)game.cameraShake=Math.max(0,game.cameraShake-dt*.04);
  updateTutorial(); updateHUD();
}

function enemyLabel(type){
  return ({
    pec:'PEC respinta in volo.',
    allegato:'Manca allegato: ti sta inseguendo.',
    portale:'Portale offline. Ovviamente.',
    scaduta:'Pratica scaduta in fuga.'
  })[type] || 'Ostacolo amministrativo.';
}
function updateEnemy(e,dt,now){
  if(e.type==='pec'){
    e.x=e.base+Math.sin(now/600+e.phase)*e.range;
    e.y+=Math.sin(now/380+e.phase)*.3;
  }
  if(e.type==='allegato'){
    const dx=game.p.x-e.x,dy=game.p.y-e.y,d=Math.max(1,Math.hypot(dx,dy));
    e.x+=dx/d*55*game.difficulty*dt/1000;
    e.y+=dy/d*40*game.difficulty*dt/1000;
  }
  if(e.type==='scaduta')e.x=e.base+Math.sin(now/430+e.phase)*e.range;
  if(e.type==='portale'){
    e.active=(Math.floor(now/1300)%2===0);
    e.w=e.active?64:22;
  }
}

function beginCutscene(){
  game.bossStarted=true;game.paused=true;
  const name=game.lv.boss==='Doppio'?'Mengozzi':game.lv.boss;
  $('#cutFace').src=FACE_DATA[name];
  $('#cutTitle').textContent=game.lv.boss==='Doppio'?'BOSS FINALE':'BOSS IN ARRIVO';
  $('#cutLine').textContent=game.lv.boss==='Doppio'?'“Fine mese. Ve ne mando soltanto un paio.”':'“Questa è urgente. Serve entro oggi.”';
  $('#cutscene').classList.remove('hidden');sfx('boss');
}
$('#cutGo').onclick=()=>{$('#cutscene').classList.add('hidden');game.paused=false;startBoss();};

function startBoss(){
  const n=game.lv.boss,hp=(n==='Doppio'?26:15)+(ngPlus?5:0);
  game.boss={name:n,hp,max:hp,x:game.w.w-270,y:205,last:0,phase:1,alt:0,lastPhase:1};
  game.projectiles=[];$('#bossPill').classList.add('show');showMsg('👔 BOSS PHASE',1100);
}
function updateBoss(dt,now){
  const b=game.boss;if(!b||b.hp<=0)return;
  const ratio=b.hp/b.max;
  b.phase=ratio>.66?1:ratio>.33?2:3;
  if(b.phase!==b.lastPhase){
    b.lastPhase=b.phase;
    showMsg(b.phase===2?'📨 “Vi giro anche un’integrazione.”':'🔥 “È diventata PRIORITÀ MASSIMA.”',1500);
    game.cameraShake=10;sfx('boss');
  }
  const interval=(game.idx===4?760:930)-(b.phase-1)*160;
  if(now-b.last>interval/game.difficulty){
    b.last=now;
    spawnBossPattern(b,now);
    b.alt=1-b.alt;
  }
  for(const pr of game.projectiles){
    if(pr.dead)continue;
    if(pr.telegraphUntil&&now<pr.telegraphUntil){}
    else if(pr.kind==='drop')pr.y+=pr.vy*dt/1000;
    else pr.x+=pr.vx*dt/1000;

    if((!pr.telegraphUntil||now>=pr.telegraphUntil)&&hit(game.p,pr)&&game.p.inv<=0){
      pr.dead=true;
      if(hasSkill(game.ch,pr.cat)){
        b.hp--;comboScore(pr.urgent?40:30,pr.x,pr.y);game.p.vy=-270;sfx('good');
        if(b.hp<=0){
          game.bossDone=true;addScore(200);showMsg('🏆 BOSS SUPERATO • +200',1600);
          sfx('clear');$('#bossPill').classList.remove('show');
        }
      } else damage(`Attività boss: ${CAT[pr.cat]}. Dovevi schivarla.`,game.p.x<pr.x?-1:1);
    }
    if(pr.x<game.bossZone-260||pr.y>520)pr.dead=true;
  }
  game.projectiles=game.projectiles.filter(x=>!x.dead);
}
function spawnBossPattern(b,now){
  const cats=['BD','CONS','PERM','SIC'];
  const mkStraight=(y,urgent=false)=>game.projectiles.push({
    kind:'straight',x:game.w.w-310,y,w:64,h:42,vx:-(340+game.idx*35+b.phase*35)*game.difficulty,
    cat:cats[Math.floor(Math.random()*4)],dead:false,urgent
  });
  const mkDrop=(x,urgent=true)=>game.projectiles.push({
    kind:'drop',x,y:95,w:58,h:40,vy:(260+b.phase*45)*game.difficulty,telegraphUntil:performance.now()+520,
    cat:cats[Math.floor(Math.random()*4)],dead:false,urgent
  });
  if(b.phase===1){
    mkStraight(270+Math.random()*140,false);
  } else if(b.phase===2){
    mkStraight(270+Math.random()*140,Math.random()<.5);
    mkDrop(game.p.x+(-80+Math.random()*160),true);
  } else {
    [260,335,410].forEach((y,i)=>mkStraight(y,i===1));
    if(Math.random()<.65)mkDrop(game.p.x+(-120+Math.random()*240),true);
  }
}

