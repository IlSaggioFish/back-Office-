/* v21: Assalto all'Open Space — first run-and-gun layer. */
'use strict';
(function(){
  const previousMakeLevel=makeLevel;
  const previousStartGame=startGame;
  const previousUpdate=update;
  const previousDraw=draw;
  const previousUpdateHUD=updateHUD;
  const previousDrawEnemy=drawEnemy;
  const previousSfx=sfx;
  let shootHeld=false;

  const RESCUE_NAMES=['Michele','Giada','Farris','Daniele','Dalila'];
  const CRATE_XS=[
    [690,1580,2700],
    [600,1110,2200,3340],
    [540,1370,2810,3820],
    [620,1740,2860,4140],
    [560,1180,2030,3020,4020]
  ];
  const GUARD_XS=[
    [1160,2050,3000],
    [520,1510,2700,3700],
    [850,1870,3220],
    [820,1850,3180,4380],
    [960,1740,2740,3660,4520]
  ];

  function inPit(w,x,pad=0){
    return w.pits.some(p=>x>p.x-pad&&x<p.x+p.w+pad);
  }
  function firstSafe(list,w,fallback){
    return list.find(x=>!inPit(w,x,70)) ?? fallback;
  }
  function decorateLevel(result,idx){
    const w=result.w;
    w.destructibles=[];
    w.rescues=[];
    w.weaponPickups=[];
    for(const e of w.enemies){
      e.combat=true;
      e.combatMax=e.type==='portale'?2:1;
      e.combatHp=e.combatMax;
      e.hitFlash=0;
    }

    (CRATE_XS[idx]||[]).forEach((x,i)=>{
      const px=firstSafe([x],w,null);
      if(px===null)return;
      w.destructibles.push({x:px,y:w.groundY-48,w:58,h:48,hp:i%3===0?2:1,maxHp:i%3===0?2:1,dead:false,kind:'crate',drop:i===1?'burst':null});
    });

    const guardFallback=Math.max(420,w.w-820);
    (GUARD_XS[idx]||[]).forEach((x,i)=>{
      const px=firstSafe([x],w,guardFallback-i*140);
      if(inPit(w,px,35))return;
      w.enemies.push({type:'scanner',x:px,y:w.groundY-52,w:50,h:52,base:px,range:0,dead:false,phase:i,combat:true,combatMax:2,combatHp:2,hitFlash:0});
    });

    const rescueX=firstSafe([760+idx*760,1540+idx*260,3100],w,Math.max(420,w.w-1050));
    const rescueName=RESCUE_NAMES[idx%RESCUE_NAMES.length];
    w.rescues.push({x:rescueX,y:w.groundY-70,w:58,h:70,hp:2,maxHp:2,name:rescueName,rescued:false,phase:idx*.8});

    const pickupX=firstSafe([980+idx*420,2280,3560],w,Math.max(520,w.w-1250));
    w.weaponPickups.push({x:pickupX,y:w.groundY-122,w:40,h:32,type:idx%2?'spread':'burst',taken:false,bob:idx*.7});
    return result;
  }
  makeLevel=function(idx){return decorateLevel(previousMakeLevel(idx),idx);};

  function ensureState(){
    if(!game)return;
    game.bullets=game.bullets||[];
    game.weapon=game.weapon||{kind:'single',label:'TIMBRO BLASTER',ammo:null,cooldown:235};
    game.fireReady=game.fireReady||0;
    game.kills=game.kills||0;
    game.rescued=game.rescued||0;
    game.shots=game.shots||0;
  }
  function weaponConfig(){
    const w=game.weapon||{};
    if(w.kind==='burst')return {cooldown:112,speed:760,damage:1,spread:0,label:w.label||'RAFFICA PEC'};
    if(w.kind==='spread')return {cooldown:285,speed:690,damage:1,spread:105,label:w.label||'TRIPLO NTW'};
    return {cooldown:235,speed:720,damage:game.ch.n==='Farris'||game.ch.n==='Michele'?2:1,spread:0,label:'TIMBRO BLASTER'};
  }
  function aimVector(){
    const p=game.p,f=p.facing||1;
    if(keys.aimDown)return {vx:f*560,vy:220};
    if(keys.jump&&!p.onGround)return {vx:f*570,vy:-300};
    return {vx:f*weaponConfig().speed,vy:0};
  }
  function fireBullet(now){
    if(!game||!game.running||game.paused)return;
    ensureState();
    const w=game.weapon,cfg=weaponConfig();
    if(now<game.fireReady)return;
    if(Number.isFinite(w.ammo)&&w.ammo<=0){game.weapon={kind:'single',label:'TIMBRO BLASTER',ammo:null,cooldown:235};return;}
    const p=game.p,dir=p.facing||1,vec=aimVector();
    const angles=cfg.spread?[{vx:vec.vx,vy:vec.vy-cfg.spread},{vx:vec.vx,vy:vec.vy},{vx:vec.vx,vy:vec.vy+cfg.spread}]:[vec];
    for(const v of angles){
      game.bullets.push({x:dir>0?p.x+p.w-2:p.x-18,y:p.y+23,w:18,h:7,vx:v.vx,vy:v.vy,gravity:keys.jump&&!p.onGround?0:0,damage:cfg.damage,life:1500,dead:false});
    }
    if(Number.isFinite(w.ammo))w.ammo--;
    game.fireReady=now+cfg.cooldown;game.shots++;
    sfx('shoot');
  }
  function destroyEnemy(e){
    e.dead=true;game.kills++;
    comboScore(e.type==='scanner'?32:24,e.x,e.y);
    particle(e.x+e.w/2,e.y+e.h/2,'KO','#ff8090');
    sfx('shotHit');
  }
  function destroyCrate(d){
    d.dead=true;comboScore(30,d.x,d.y);particle(d.x+d.w/2,d.y,'DISTRUTTO','#ffcf68');sfx('shotHit');
    if(d.drop)game.w.weaponPickups.push({x:d.x+d.w/2,y:d.y-35,w:40,h:32,type:d.drop,taken:false,bob:1.5});
  }
  function rescueAlly(r){
    r.rescued=true;game.rescued++;game.shield++;comboScore(80,r.x,r.y);showMsg('🤝 '+r.name.toUpperCase()+' LIBERATO • +1 SCUDO',1500);sfx('clear');
  }
  function updateCombat(dt,now){
    if(!game||!game.running||game.paused)return;
    ensureState();
    if(shootHeld)fireBullet(now);
    const w=game.w;
    for(const pick of w.weaponPickups||[]){
      if(pick.taken)continue;
      if(hit(game.p,pick)){
        pick.taken=true;
        const type=pick.type==='spread'?'spread':'burst';
        game.weapon={kind:type,label:type==='spread'?'TRIPLO NTW':'RAFFICA PEC',ammo:type==='spread'?12:20,cooldown:type==='spread'?285:112};
        showMsg('🔫 '+game.weapon.label+' • '+game.weapon.ammo+' VOLTE',1400);sfx('coin');
      }
    }
    for(const b of game.bullets){
      if(b.dead)continue;
      b.x+=b.vx*dt/1000;b.y+=b.vy*dt/1000;b.life-=dt;
      if(b.life<=0||b.x<-80||b.x>w.w+80||b.y<-80||b.y>600){b.dead=true;continue;}
      for(const d of w.destructibles||[]){
        if(d.dead||!hit(b,d))continue;
        d.hp-=b.damage;b.dead=true;particle(b.x,b.y,'✦','#ffe378');
        if(d.hp<=0)destroyCrate(d);else sfx('shotHit');
        break;
      }
      if(b.dead)continue;
      for(const r of w.rescues||[]){
        if(r.rescued||!hit(b,r))continue;
        r.hp-=b.damage;b.dead=true;particle(b.x,b.y,'✦','#9feaff');
        if(r.hp<=0)rescueAlly(r);else sfx('shotHit');
        break;
      }
      if(b.dead)continue;
      for(const e of w.enemies){
        if(e.dead||!e.combat||!hit(b,e))continue;
        e.combatHp-=b.damage;e.hitFlash=now+100;b.dead=true;particle(b.x,b.y,'✦','#ffbac2');
        if(e.combatHp<=0)destroyEnemy(e);else sfx('shotHit');
        break;
      }
      if(b.dead||!game.boss||game.bossDone)continue;
      const boss=game.boss;
      if(hit(b,{x:boss.x-54,y:boss.y-52,w:120,h:170})){
        b.dead=true;boss.hp-=b.damage;boss.hitFlash=now+120;comboScore(20,b.x,b.y);sfx('shotHit');
        if(boss.hp<=0){
          game.bossDone=true;showMsg('🏆 BOSS ABBATTUTO • +200',1600);addScore(200);sfx('clear');$('#bossPill').classList.remove('show');
        }
      }
    }
    game.bullets=game.bullets.filter(b=>!b.dead);
  }
  update=function(dt,now){previousUpdate(dt,now);if(game?.running&&!game.paused)updateCombat(dt,now);};

  function installHUD(){
    const hud=document.querySelector('.hud');
    if(hud&&!$('#weaponHud')){
      const add=(id,label)=>{const el=document.createElement('div');el.className='hb v21-hud';el.id=id;el.innerHTML=label+'<b>—</b>';hud.appendChild(el);};
      add('weaponHud','Arma');add('rescueHud','Salvati');
    }
    const gamePanel=$('#game');
    if(gamePanel&&!$('#combatBar')){
      const bar=document.createElement('div');bar.id='combatBar';bar.innerHTML='<span id="combatHint">ASSALTO ALL’OPEN SPACE · Z / SPARO · in aria = mira alta · S = mira bassa</span><button id="shoot" class="secondary v21-control" type="button">SPARO<small>Z</small></button>';
      const controls=$('#controls');controls.parentNode.insertBefore(bar,controls);
      const button=$('#shoot');
      const stop=()=>{shootHeld=false;};
      button.addEventListener('pointerdown',e=>{e.preventDefault();shootHeld=true;audioReady();fireBullet(performance.now());button.setPointerCapture?.(e.pointerId);});
      for(const ev of ['pointerup','pointercancel','pointerleave','lostpointercapture'])button.addEventListener(ev,stop);
    }
    const note=document.querySelector('#menu .note');
    if(note)note.textContent='PC: A/D o ←/→, SPAZIO/↑ salta, Z spara, S mira bassa, X abilità, E gestisce le pratiche. Mobile: pulsanti o joystick. Sconfiggi i nemici, distruggi gli archivi e libera i colleghi.';
    const logo=document.querySelector('.header .logo span');if(logo)logo.textContent='ADVENTURE DX v21';
    const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Assalto all’Open Space: corri, spara, gestisci e porta in salvo la squadra.';
    document.title='Back Office Adventure DX v21';
    const credits=document.querySelector('#credits h2');if(credits)credits.textContent='BACK OFFICE ADVENTURE DX v21';
  }
  function combatHUD(){
    if(!game)return;
    const w=game.weapon||{label:'TIMBRO BLASTER',ammo:null};
    const weapon=$('#weaponHud'),rescue=$('#rescueHud');
    if(weapon)weapon.innerHTML='Arma<b>'+w.label+' '+(Number.isFinite(w.ammo)?w.ammo:'∞')+'</b>';
    if(rescue)rescue.innerHTML='Salvati<b>'+(game.rescued||0)+'/'+((game.w.rescues||[]).length)+'</b>';
    const bar=$('#combatBar');if(bar)bar.classList.toggle('hot',shootHeld||((game.bullets||[]).length>0));
    const hint=$('#combatHint');if(hint){const cfg=weaponConfig();hint.textContent=(w.label||cfg.label)+' · '+(Number.isFinite(w.ammo)?w.ammo+' colpi':'∞ colpi')+' · '+(game.rescued||0)+' collega salvato';}
  }
  updateHUD=function(){previousUpdateHUD();if(game){combatHUD();}};
  startGame=function(){previousStartGame();if(game){ensureState();game.weapon={kind:'single',label:'TIMBRO BLASTER',ammo:null,cooldown:235};game.fireReady=0;game.kills=0;game.rescued=0;game.shots=0;game.bullets=[];combatHUD();}};

  function drawScanner(e){
    ctx.save();ctx.translate(e.x,e.y);ctx.textAlign='center';ctx.fillStyle=e.hitFlash>performance.now()?'#fff':'#263c4a';ctx.strokeStyle='#ff8292';ctx.lineWidth=2;rr(0,4,e.w,e.h-4,8,1,1);
    ctx.fillStyle='#ffcf68';ctx.fillRect(9,12,e.w-18,6);ctx.fillStyle='#09151e';ctx.font='20px system-ui';ctx.fillText('◈',e.w/2,38);ctx.fillStyle='#f4dce0';ctx.font='bold 7px system-ui';ctx.fillText('SCANNER',e.w/2,49);
    if(e.combatHp<e.combatMax){ctx.fillStyle='#421c28';ctx.fillRect(0,-6,e.w,4);ctx.fillStyle='#ff7085';ctx.fillRect(0,-6,e.w*(e.combatHp/e.combatMax),4);}ctx.restore();
  }
  drawEnemy=function(e){if(e.type==='scanner')drawScanner(e);else previousDrawEnemy(e);if(e.combat&&e.type!=='scanner'&&e.combatHp<e.combatMax){ctx.save();ctx.fillStyle='#431d2a';ctx.fillRect(e.x,e.y-7,e.w,4);ctx.fillStyle='#ff7185';ctx.fillRect(e.x,e.y-7,e.w*(e.combatHp/e.combatMax),4);ctx.restore();}};
  function drawCombatOverlay(){
    if(!game||!game.running)return;
    ctx.save();ctx.translate(-(game.camera||0),0);
    for(const d of game.w.destructibles||[]){
      if(d.dead)continue;
      ctx.save();ctx.translate(d.x,d.y);ctx.fillStyle='#704b30';ctx.strokeStyle='#e7ad63';ctx.lineWidth=2;rr(0,0,d.w,d.h,5,1,1);ctx.strokeStyle='#bb7b48';ctx.beginPath();ctx.moveTo(5,5);ctx.lineTo(d.w-5,d.h-5);ctx.moveTo(d.w-5,5);ctx.lineTo(5,d.h-5);ctx.stroke();ctx.fillStyle='#ffe2a1';ctx.font='bold 8px system-ui';ctx.textAlign='center';ctx.fillText('ARCHIVIO',d.w/2,27);ctx.fillStyle='#3d1f27';ctx.fillRect(4,-7,d.w-8,4);ctx.fillStyle='#ffbf5e';ctx.fillRect(4,-7,(d.w-8)*(d.hp/d.maxHp),4);ctx.restore();
    }
    for(const r of game.w.rescues||[]){
      if(r.rescued)continue;
      ctx.save();ctx.translate(r.x,r.y);ctx.fillStyle='#132c3d';ctx.strokeStyle='#9feaff';ctx.lineWidth=2;rr(0,0,r.w,r.h,8,1,1);ctx.strokeStyle='#5fc7e9';ctx.strokeRect(5,5,r.w-10,r.h-10);ctx.beginPath();ctx.moveTo(8,8);ctx.lineTo(r.w-8,r.h-8);ctx.moveTo(r.w-8,8);ctx.lineTo(8,r.h-8);ctx.stroke();ctx.restore();
      face(r.name,r.x+r.w/2,r.y+27,14,.95);ctx.save();ctx.fillStyle='#dff7ff';ctx.font='bold 8px system-ui';ctx.textAlign='center';ctx.fillText(r.name,r.x+r.w/2,r.y+r.h+12);ctx.fillStyle='#163044';ctx.fillRect(r.x,r.y-7,r.w,4);ctx.fillStyle='#8be7ff';ctx.fillRect(r.x,r.y-7,r.w*(r.hp/r.maxHp),4);ctx.restore();
    }
    for(const p of game.w.weaponPickups||[]){
      if(p.taken)continue;const y=p.y+Math.sin(performance.now()/260+p.bob)*4;ctx.save();ctx.translate(p.x,y);ctx.fillStyle='#8b293f';ctx.strokeStyle='#ffb0b7';ctx.lineWidth=2;rr(-20,-15,40,30,7,1,1);ctx.fillStyle='#fff';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(p.type==='spread'?'3X':'R',0,4);ctx.restore();
    }
    for(const b of game.bullets||[]){ctx.save();ctx.translate(b.x,b.y);ctx.fillStyle='#ffe36b';ctx.shadowColor='#ff7180';ctx.shadowBlur=8;rr(0,0,b.w,b.h,3,1,0);ctx.fillStyle='#fff8c7';ctx.fillRect(b.vx<0?0:b.w-5,1,5,b.h-2);ctx.restore();}
    ctx.restore();
  }
  const previousDrawCombat=draw;
  draw=function(){previousDrawCombat();drawCombatOverlay();};

  document.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if(k==='z'||k==='c'){shootHeld=true;audioReady();fireBullet(performance.now());e.preventDefault();}
    if(k==='s'||e.key==='arrowdown'){keys.aimDown=true;e.preventDefault();}
  });
  document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='z'||k==='c')shootHeld=false;if(k==='s'||e.key==='arrowdown')keys.aimDown=false;});
  window.addEventListener('blur',()=>{shootHeld=false;keys.aimDown=false;});
  document.addEventListener('visibilitychange',()=>{shootHeld=false;keys.aimDown=false;});

  sfx=function(k){
    if(k==='shoot'){audioReady();if(audioCtx){tone(240,.035,'square',.025);tone(110,.055,'sawtooth',.018,.025);}return;}
    if(k==='shotHit'){audioReady();if(audioCtx){tone(760,.035,'square',.025);tone(1120,.045,'sine',.018,.025);}return;}
    previousSfx(k);
  };
  installHUD();
  const oldStartClick=$('#start');if(oldStartClick)oldStartClick.onclick=startGame;
})();
