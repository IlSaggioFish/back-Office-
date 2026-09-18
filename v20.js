/* v20: one visual layer per map and explicit professional activities. */
'use strict';
let workHeld=false;
const WORK={BD:{color:'#79bfff',action:'Aggiorna banca dati',owner:'Farris'},CONS:{color:'#70ddd2',action:'Chiudi consuntivo',owner:'Tiziano'},PERM:{color:'#d6adff',action:'Verifica autorizzazione',owner:'Dalila'},SIC:{color:'#ffcf75',action:'Controlla sicurezza',owner:'Daniele'}};
function workProfile(ch,cat){
  if(!hasSkill(ch,cat))return {time:2800,score:8,label:'INOLTRA A '+WORK[cat].owner.toUpperCase()};
  if(isBackup(ch,cat))return {time:1600,score:18,label:'SUPPORTO'};
  return {time:Math.max(650,1100/mult(ch,cat)),score:Math.round(32*mult(ch,cat)),label:'COMPETENZA'};
}
function updateWorkTasks(dt,now){
  if(!game?.running||game.paused)return;
  const p=game.p;
  const near=game.w.tasks.filter(t=>!t.dead&&Math.abs(t.x+t.w/2-p.x-p.w/2)<92&&Math.abs(t.y+t.h/2-p.y-p.h/2)<70).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
  game.workTarget=near||null;
  for(const t of game.w.tasks){
    if(t.dead)continue;
    if(t!==near||!workHeld||Math.abs(p.vx)>70||!p.onGround||p.hurt>0){t.workProgress=0;continue;}
    const profile=workProfile(game.ch,t.cat);
    t.workProgress=(t.workProgress||0)+dt;
    if(t.workProgress>=profile.time){
      t.dead=true;t.workProgress=0;game.workDone=(game.workDone||0)+1;
      comboScore(profile.score,t.x,t.y);sfx('good');
      if(hasSkill(game.ch,t.cat)){
        game.abilityReady=Math.max(now,(game.abilityReady||now)-1200);
        if(game.ch.n==='Giada'&&t.cat==='PERM'){game.permCount++;if(game.permCount%5===0)game.shield++;}
      }
      showMsg(hasSkill(game.ch,t.cat)?CAT[t.cat]+' completata • abilità −1,2 s':'Inoltrata a '+WORK[t.cat].owner,1300);
      game.workTarget=null;
    }
  }
}
(function(){
  document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='e'&&game?.running&&!game.paused&&!hub.open){workHeld=true;e.preventDefault();}});
  document.addEventListener('keyup',e=>{if(e.key.toLowerCase()==='e')workHeld=false;});
  window.addEventListener('blur',()=>workHeld=false);
  document.addEventListener('visibilitychange',()=>workHeld=false);
  const bar=document.createElement('div');bar.id='workBar';bar.innerHTML='<span id="workHint"></span><button id="workButton" type="button">TIENI E · GESTISCI</button>';
  document.querySelector('#game .ga').before(bar);
  const button=bar.querySelector('button');
  button.addEventListener('pointerdown',e=>{e.preventDefault();workHeld=true;button.setPointerCapture(e.pointerId);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>workHeld=false);
  const oldHud=updateHUD;
  updateHUD=function(){oldHud();if(!game)return;const t=game.workTarget;const ch=game.ch;
    const skills=ch.skills.map(s=>CAT[skillBase(s)]+(s.endsWith('*')?' (supporto)':'')).join(' · ');
    document.querySelector('#workHint').textContent=t?WORK[t.cat].action+' · '+workProfile(ch,t.cat).label+' · '+Math.min(100,Math.floor((t.workProgress||0)/workProfile(ch,t.cat).time*100))+'%':ch.n+' · '+skills;
    button.disabled=!t||game.paused;button.textContent=t&&!hasSkill(ch,t.cat)?'TIENI E · INOLTRA':'TIENI E · GESTISCI';
  };
  drawV6Foreground=function(){};
  // The collision geometry stays authoritative; decorations never sit on platforms.
  const PALETTES={office:['#182c3b','#263f4b','#8bd8e7'],permits:['#29283d','#403c53','#c7b5ed'],site:['#34352e','#555744','#ebd395'],cons:['#183334','#29494c','#91ddd0'],final:['#332735','#503747','#e5aec5']};
  drawParallax=function(cam,col,theme){
    const p=PALETTES[theme]||PALETTES.office;ctx.save();ctx.fillStyle=p[0];ctx.fillRect(0,0,960,540);
    ctx.fillStyle=p[1];
    for(let x=-((cam*.1)%380)-380;x<960;x+=380){
      if(theme==='site'){ctx.fillRect(x+30,220,145,210);ctx.fillRect(x+195,285,125,145);}
      else {ctx.fillRect(x+40,65,250,165);ctx.fillStyle=p[0];ctx.fillRect(x+161,65,8,165);ctx.fillRect(x+40,143,250,6);ctx.fillStyle=p[1];}
    }
    ctx.fillStyle='#101d2580';ctx.fillRect(0,360,960,180);ctx.restore();
  };
  drawWorldDecor=function(theme,cam){
    const p=PALETTES[theme]||PALETTES.office;ctx.save();ctx.globalAlpha=.35;ctx.fillStyle=p[1];
    for(let x=Math.floor(cam/800)*800;x<cam+1100;x+=800){
      if(theme==='site'){ctx.fillRect(x+130,300,100,120);ctx.fillRect(x+255,335,150,85);}
      else if(theme==='permits'){ctx.fillRect(x+130,270,140,150);for(let y=295;y<420;y+=35){ctx.fillStyle=p[0];ctx.fillRect(x+140,y,120,4);}ctx.fillStyle=p[1];}
      else if(theme==='cons'){ctx.fillRect(x+130,275,85,145);ctx.fillRect(x+235,275,85,145);}
      else {ctx.fillRect(x+130,390,200,10);ctx.fillRect(x+150,340,65,40);ctx.fillRect(x+155,400,8,45);ctx.fillRect(x+300,400,8,45);}
    }
    ctx.globalAlpha=.65;ctx.fillStyle='#bed0da';ctx.font='bold 11px system-ui';ctx.textAlign='center';
    for(const l of game.w.v11?.landmarks||[])if(l.x>cam-100&&l.x<cam+1060)ctx.fillText(l.label,l.x,48);
    ctx.restore();
  };
  drawPlatform=function(p){
    ctx.save();ctx.fillStyle='#0b1722';ctx.fillRect(p.x-2,p.y,p.w+4,p.h+3);ctx.fillStyle='#516778';ctx.fillRect(p.x,p.y+4,p.w,p.h-4);ctx.fillStyle='#d9edf0';ctx.fillRect(p.x,p.y,p.w,4);ctx.restore();
  };
  drawMoving=function(p){drawPlatform(p);ctx.save();ctx.fillStyle='#a8bfff';ctx.fillRect(p.x,p.y,p.w,4);ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText(p.v8Vertical?'↕':'↔',p.x+p.w/2,p.y+14);ctx.restore();};
  drawTask=function(t){
    const cfg=WORK[t.cat],profile=workProfile(game.ch,t.cat),active=game.workTarget===t;
    ctx.save();ctx.fillStyle='#10202c';ctx.strokeStyle=active?'#ffffff':cfg.color;ctx.lineWidth=active?3:2;rr(t.x,t.y,t.w,t.h,5,1,1);
    ctx.fillStyle=cfg.color;ctx.fillRect(t.x+4,t.y+4,t.w-8,5);ctx.textAlign='center';ctx.font='bold 11px system-ui';ctx.fillText(t.cat,t.x+t.w/2,t.y+25);
    ctx.font='bold 8px system-ui';ctx.fillStyle='#e5edf2';ctx.fillText(hasSkill(game.ch,t.cat)?(isBackup(game.ch,t.cat)?'SUPPORTO':'GESTISCI'):'INOLTRA',t.x+t.w/2,t.y+38);
    if(active){ctx.fillStyle='#10202c';ctx.fillRect(t.x-5,t.y-15,t.w+10,7);ctx.fillStyle=cfg.color;ctx.fillRect(t.x-5,t.y-15,(t.w+10)*Math.min(1,(t.workProgress||0)/profile.time),7);}ctx.restore();
  };
  const oldHazard=drawHazard;
  drawHazard=function(h){oldHazard(h);ctx.save();ctx.strokeStyle='#ff717b';ctx.lineWidth=2;ctx.strokeRect(h.x-2,h.y-2,h.w+4,h.h+4);ctx.fillStyle='#ff717b';ctx.font='bold 12px system-ui';ctx.fillText('!',h.x+h.w/2,h.y-6);ctx.restore();};
  const make=makeLevel;
  makeLevel=function(idx){const r=make(idx);for(const t of r.w.tasks){t.x=t.base;t.range=0;t.workProgress=0;}for(const h of r.w.hints||[])if(/competenz|pratic/i.test(h.text))h.text='Vicino alle pratiche: tieni E o GESTISCI. Fuori ruolo: INOLTRA.';return r;};
  document.title='Back Office Adventure DX v20';
  const logo=document.querySelector('.header .logo span');if(logo)logo.textContent='ADVENTURE DX v20';
  const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Mappe leggibili · Attività di reparto: avvicinati e tieni E / GESTISCI. Gli specialisti lavorano più velocemente; fuori ruolo puoi inoltrare.';
})();
