/* v24: arcade movement, readable Open Space encounters and continuous work actions. */
'use strict';
(function(){
  const TYPES={patrol:{label:'GUARDIA PEC',color:'#cc7182',hp:2,rate:1700},sniper:{label:'TIRATORE',color:'#a998ed',hp:2,rate:2350},thrower:{label:'LANCIATORE',color:'#eab36b',hp:3,rate:2900}};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function state(){if(!game)return;game.fx24??=[];game.enemyShots24??=[];}
  function burst(x,y,color,count=8,force=130){state();if(!game)return;for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=force*(.3+Math.random());game.fx24.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-40,life:280+Math.random()*200,max:500,color,size:2+Math.random()*3});}if(game.fx24.length>140)game.fx24.splice(0,game.fx24.length-140);}
  window.bo24Fired=function(now){if(!game)return;state();const p=game.p,dir=p.facing||1;p.recoil24=100;p.flash24=now+65;game.fx24.push({x:p.x+p.w/2,y:p.y+24,vx:-dir*80,vy:-105,life:420,max:420,color:'#efbf61',size:3});};
  window.bo24Impact=function(x,y,large=false){burst(x,y,large?'#ffad66':'#fff1a0',large?16:7,large?180:100);if(large&&!reduced.matches&&!(typeof v7!=='undefined'&&v7.settings?.reducedShake))game.cameraShake=Math.max(game.cameraShake||0,4);};
  window.v23ValidateTask=()=>true;
  $('#v23Decision')?.remove();
  const oldProfile=workProfile;
  workProfile=function(ch,cat){const p=oldProfile(ch,cat);return {...p,time:hasSkill(ch,cat)?(isBackup(ch,cat)?1050:650):1800};};

  const oldMake=makeLevel;
  makeLevel=function(idx){const result=oldMake(idx),w=result.w;if(idx!==0)return result;
    const safe=(x,pad=60)=>{for(let n=0;n<60;n++,x+=20)if(x<w.w-150&&!w.pits.some(p=>x+pad>p.x&&x-pad<p.x+p.w))return x;return w.w-200;};
    const cats=['BD','PERM','SIC','CONS'];
    const locations=[410,980,1320,2250];
    cats.forEach((cat,i)=>{let t=w.tasks[i];if(!t){t={w:60,h:44};w.tasks.push(t);}Object.assign(t,{cat,x:safe(locations[i]),y:w.groundY-t.h,base:safe(locations[i]),range:0,required:true,dead:false,v22:true,v22Applied:false,workProgress:0});});
    w.tasks.slice(4).forEach(t=>t.required=false);
    w.enemies=[];
    const layout=[['patrol',720],['sniper',1190],['patrol',1770],['thrower',2070],['sniper',2700],['thrower',3180]];
    for(const [kind,wanted] of layout){const x=safe(wanted),cfg=TYPES[kind];let y=w.groundY-54;
      if(kind==='sniper'){y=w.groundY-170-54;w.platforms.push({x:x-55,y:y+54,w:180,h:16,v24:true});}
      w.enemies.push({type:'v24',kind24:kind,x,y,w:42,h:54,base:x,range:kind==='patrol'?55:0,phase:0,dead:false,combat:true,combatMax:cfg.hp,combatHp:cfg.hp,hitFlash:0,next24:0,dir24:-1});
    }
    w.hints.unshift({x:220,text:'Z: spara · S / ↓: abbassati · E: attiva i terminali. I segnali ! anticipano gli attacchi.'});
    return result;
  };
  const oldEnemy=updateEnemy;
  updateEnemy=function(e,dt,now){
    if(!e.kind24)return oldEnemy(e,dt,now);
    if(!game?.running||game.paused||e.dead)return;
    state();const p=game.p,cfg=TYPES[e.kind24];e.dir24=p.x<e.x?-1:1;
    if(Math.abs(p.x-e.x)>650){e.windup24=0;return;}
    if(e.hitFlash>now){e.windup24=0;e.next24=Math.max(e.next24,now+350);return;}
    if(e.kind24==='patrol'&&!e.windup24){const next=e.x+e.dir24*42*dt/1000;if(Math.abs(next-e.base)<55&&!game.w.pits.some(p=>next+e.w>p.x&&next<p.x+p.w))e.x=next;}
    if(!e.next24)e.next24=now+850;
    if(!e.windup24&&now>=e.next24){e.windup24=now+(e.kind24==='sniper'?900:650);e.target24={x:p.x+p.w/2,y:p.y+p.h/2};}
    if(e.windup24&&now>=e.windup24){
      const x=e.x+e.w/2,y=e.y+12,target=e.target24;
      if(game.enemyShots24.length<18){
        if(e.kind24==='thrower'){const secs=1.1;game.enemyShots24.push({x,y,w:12,h:12,vx:(target.x-x)/secs,vy:(game.w.groundY-12-y-.5*700*secs*secs)/secs,gravity:700,grenade:true,life:2200,color:cfg.color});}
        else {const dx=target.x-x,dy=target.y-y,len=Math.max(1,Math.hypot(dx,dy));game.enemyShots24.push({x,y,w:12,h:6,vx:e.kind24==='patrol'?e.dir24*290:dx/len*365,vy:e.kind24==='patrol'?0:dy/len*365,gravity:0,life:2500,color:cfg.color});}
      }
      e.windup24=0;e.next24=now+cfg.rate/game.difficulty;e.kick24=110;
    }
    e.kick24=Math.max(0,(e.kick24||0)-dt);
  };
  const oldLabel=enemyLabel;enemyLabel=function(type){return type==='v24'?'Guardia operativa: schiva o neutralizza l’attacco.':oldLabel(type);};
  const oldDrawEnemy=drawEnemy;
  drawEnemy=function(e){if(!e.kind24)return oldDrawEnemy(e);const c=TYPES[e.kind24],now=performance.now();ctx.save();ctx.translate(e.x+e.w/2,e.y+e.h);ctx.scale(e.dir24||-1,1);
    const walk=e.kind24==='patrol'&&!e.windup24?Math.sin(now/110)*4:0;
    ctx.fillStyle='#102031';ctx.fillRect(-14,-18,10,18+walk/2);ctx.fillRect(5,-18,10,18-walk/2);
    ctx.fillStyle=e.hitFlash>now?'#fff':c.color;ctx.strokeStyle='#101922';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-18,-41,36,27,6);ctx.fill();ctx.stroke();
    ctx.fillStyle='#dfb593';ctx.beginPath();ctx.arc(0,-44,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#293849';ctx.beginPath();ctx.roundRect(-13,-57,27,13,5);ctx.fill();ctx.fillStyle='#82e0e3';ctx.fillRect(1,-48,10,4);
    ctx.fillStyle='#132531';ctx.fillRect(9-(e.kick24?3:0),-42,27,8);ctx.fillStyle='#efc39b';ctx.fillRect(8,-35,8,5);
    if(e.kind24==='thrower'){ctx.fillStyle='#ffc46e';ctx.beginPath();ctx.arc(32,-39,6,0,Math.PI*2);ctx.fill();}
    ctx.restore();ctx.save();ctx.textAlign='center';ctx.font='bold 8px system-ui';ctx.fillStyle=c.color;ctx.fillText(c.label,e.x+21,e.y-12);
    if(e.windup24){ctx.fillStyle='#ffdc79';ctx.font='bold 21px system-ui';ctx.fillText('!',e.x+21,e.y-25);if(e.kind24==='sniper'){ctx.globalAlpha=.5;ctx.strokeStyle=c.color;ctx.setLineDash([7,7]);ctx.beginPath();ctx.moveTo(e.x+21,e.y+12);ctx.lineTo(e.target24.x,e.target24.y);ctx.stroke();}}
    if(e.combatHp<e.combatMax){ctx.fillStyle='#482834';ctx.fillRect(e.x,e.y-7,e.w,4);ctx.fillStyle=c.color;ctx.fillRect(e.x,e.y-7,e.w*e.combatHp/e.combatMax,4);}ctx.restore();
  };
  const oldUpdate=update;
  update=function(dt,now){if(!game?.running||game.paused)return;state();const p=game.p;p.standH24??=p.h;const feet=p.y+p.h;
    const crouch=!!keys.aimDown&&p.onGround&&!keys.jump;p.crouch24=crouch;
    p.h=crouch?Math.round(p.standH24*.57):p.standH24;p.y=feet-p.h;
    const left=keys.left,right=keys.right;if(crouch){keys.left=keys.right=false;p.vx*=.65;}
    const grounded=p.onGround;const deadBefore=new Set(game.w.enemies.filter(e=>e.dead));
    oldUpdate(dt,now);keys.left=left;keys.right=right;
    if(!game?.running||game.paused)return;
    p.recoil24=Math.max(0,(p.recoil24||0)-dt);p.land24=Math.max(0,(p.land24||0)-dt);
    if(!grounded&&p.onGround){p.land24=140;burst(p.x+p.w/2,p.y+p.h,'#afbac6',5,45);}
    for(const e of game.w.enemies)if(e.dead&&!deadBefore.has(e))window.bo24Impact(e.x+e.w/2,e.y+e.h/2,true);
    for(const q of game.enemyShots24){q.life-=dt;q.vy+=q.gravity*dt/1000;q.x+=q.vx*dt/1000;q.y+=q.vy*dt/1000;
      if(q.grenade&&q.y>=game.w.groundY-12){q.life=0;burst(q.x,game.w.groundY-10,'#ffb364',16,190);if(Math.hypot(p.x+p.w/2-q.x,p.y+p.h/2-(game.w.groundY-12))<68)damage('Esplosione: allontanati dal punto di caduta.',p.x<q.x?-1:1);}
      else if(hit(p,q)&&p.inv<=0){q.life=0;damage('Colpo nemico: abbassati o cambia posizione.',p.x<q.x?-1:1);}
      if(q.x<game.camera-100||q.x>game.camera+1160||q.y>560)q.life=0;
    }
    game.enemyShots24=game.enemyShots24.filter(q=>q.life>0);
    for(const f of game.fx24){f.life-=dt;f.x+=f.vx*dt/1000;f.y+=f.vy*dt/1000;f.vy+=350*dt/1000;}
    game.fx24=game.fx24.filter(f=>f.life>0);
  };
  const oldDrawPlayer=drawPlayer;
  drawPlayer=function(p,ch){if(!p||!ch)return oldDrawPlayer(p,ch);const dir=p.facing||1,feet=p.y+p.h,cx=p.x+p.w/2,stand=p.standH24||p.h;
    ctx.save();ctx.translate(cx,feet);const squash=p.crouch24?.68:p.land24>0?1-.09*p.land24/140:1;ctx.transform(1,0,reduced.matches?0:(p.onGround?-p.vx/6000:0),squash,0,0);ctx.translate(-cx,-feet);
    const recoil=(p.recoil24||0)/100*3;oldDrawPlayer({...p,x:p.x-dir*recoil,y:feet-stand,h:stand},ch);ctx.restore();
    const gunY=p.y+24;ctx.save();ctx.translate(cx,gunY);ctx.scale(dir,1);ctx.fillStyle='#172636';ctx.strokeStyle='#8aa9ba';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(1-recoil,-4,25,9,2);ctx.fill();ctx.stroke();ctx.fillStyle='#d3a982';ctx.fillRect(2,-1,7,7);
    if((p.flash24||0)>performance.now()){ctx.fillStyle='#fff4ac';ctx.beginPath();ctx.moveTo(26,-7);ctx.lineTo(43,0);ctx.lineTo(26,7);ctx.lineTo(30,0);ctx.closePath();ctx.fill();}ctx.restore();
  };
  const oldDraw=draw;
  draw=function(){oldDraw();if(!game?.running)return;state();ctx.save();ctx.translate(-game.camera,0);
    for(const q of game.enemyShots24){ctx.fillStyle=q.color;if(q.grenade){ctx.beginPath();ctx.arc(q.x+6,q.y+6,7,0,Math.PI*2);ctx.fill();const time=Math.max(0,(-q.vy+Math.sqrt(q.vy*q.vy+1400*Math.max(0,game.w.groundY-12-q.y)))/700);const landing=q.x+q.vx*time;ctx.strokeStyle='#ffbc64';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(landing,game.w.groundY-3,30,6,0,0,Math.PI*2);ctx.stroke();}else{ctx.fillRect(q.x,q.y,q.w,q.h);ctx.globalAlpha=.4;ctx.fillRect(q.x-Math.sign(q.vx)*18,q.y+1,18,4);ctx.globalAlpha=1;}}
    for(const f of game.fx24){ctx.globalAlpha=Math.min(1,f.life/160);ctx.fillStyle=f.color;ctx.fillRect(f.x,f.y,f.size,f.size);}ctx.globalAlpha=1;
    if(game.intelUntil>performance.now())for(const e of game.w.enemies)if(!e.dead){ctx.strokeStyle='#89e1ff';ctx.lineWidth=1.5;ctx.strokeRect(e.x-5,e.y-5,e.w+10,e.h+10);}
    ctx.restore();
  };
  const oldStart=startGame;startGame=function(){oldStart();if(game){game.fx24=[];game.enemyShots24=[];game.p.standH24=game.p.h;keys.aimDown=false;}};
  $('#start').onclick=()=>startGame();
  const crouch=document.createElement('button');crouch.id='crouch24';crouch.className='secondary';crouch.textContent='ABBASSATI · S / ↓';crouch.setAttribute('aria-label','Tieni premuto per abbassarti');$('#combatBar').appendChild(crouch);
  crouch.addEventListener('pointerdown',e=>{e.preventDefault();keys.aimDown=true;crouch.setPointerCapture?.(e.pointerId);});for(const type of ['pointerup','pointercancel','lostpointercapture'])crouch.addEventListener(type,()=>keys.aimDown=false);
  document.addEventListener('keydown',e=>{if(e.key==='ArrowDown'&&game?.running){keys.aimDown=true;e.preventDefault();}});document.addEventListener('keyup',e=>{if(e.key==='ArrowDown')keys.aimDown=false;});
  document.title='Back Office Adventure DX v24';$('.header .logo span').textContent='ADVENTURE DX v24';$('.header .sub').textContent='Open Space Assault · Guardie, tiratori e lanciatori. Corri, abbassati, spara e attiva i terminali.';$('#credits h2').textContent='BACK OFFICE ADVENTURE DX v24';
  $('#menu .note').textContent='A/D o frecce: muovi · SPAZIO: salta · Z: spara · S / ↓: abbassati · X: abilità · tieni E: terminali. Su telefono usa i pulsanti. BD rivela i nemici, PERM apre i passaggi, SIC disattiva le trappole, CONS rifornisce le armi.';
  const info=document.createElement('div');info.className='v24-info';info.textContent='V24 · OPEN SPACE ASSAULT — Attacchi anticipati da !, mira del tiratore visibile e zona di caduta delle granate. Le mansioni si completano sul campo senza interrompere la partita.';$('#menu .actions').before(info);
})();
