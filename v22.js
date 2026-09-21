/* v22: mansioni come obiettivi di livello, non più semplici collezionabili. */
'use strict';
(function(){
  const previousMakeLevel=makeLevel;
  const previousUpdate=update;
  const previousUpdateWorkTasks=updateWorkTasks;
  const previousUpdateHUD=updateHUD;
  const previousStartGame=startGame;
  const previousStartBoss=startBoss;
  const previousDrawTask=drawTask;
  const previousDraw=draw;

  const GATE_PLANS=[
    {x:1540,required:'PERM',label:'AUTORIZZAZIONE'},
    {x:1900,required:'PERM',label:'PORTALE OFFLINE'},
    {x:2100,required:'SIC',label:'ZONA SICURA'},
    {x:2700,required:'CONS',label:'CHIUSURA REPORT'},
    {x:2950,required:'BD',label:'ACCESSO ARCHIVIO'}
  ];

  function prepareLevel(result,idx){
    const w=result.w;
    const plan=GATE_PLANS[idx]||GATE_PLANS[0];
    const gateX=Math.min(plan.x,w.w-520);
    w.gates=[{x:gateX,y:160,w:72,h:300,required:plan.required,label:plan.label,open:false}];
    w.v22Mission={gateX,required:plan.required,label:plan.label};
    w.tasks.forEach((t,i)=>{
      t.v22=true;
      t.required=i<4;
      t.v22Applied=false;
      t.roleLabel=CAT[t.cat];
    });
    return result;
  }
  makeLevel=function(idx){return prepareLevel(previousMakeLevel(idx),idx);};

  function ensureObjectives(){
    if(!game)return;
    if(game.roleTotalReady)return;
    game.roleDone=game.roleDone||{BD:0,CONS:0,PERM:0,SIC:0};
    game.roleTotal=game.roleTotal||{BD:0,CONS:0,PERM:0,SIC:0};
    for(const t of game.w.tasks||[])if(t.required&&!t.v22Counted)game.roleTotal[t.cat]++;
    game.roleTotalReady=true;
  }
  function objectiveProgress(){
    if(!game)return {done:0,total:0};
    const tasks=game.w.tasks||[];
    const total=tasks.filter(t=>t.required).length;
    const done=tasks.filter(t=>t.required&&t.dead).length;
    return {done,total};
  }
  function unlockGate(cat){
    const gate=(game.w.gates||[]).find(g=>!g.open&&g.required===cat);
    if(!gate)return false;
    gate.open=true;game.routeUnlocked=true;
    showMsg('📝 '+gate.label+' SBLOCCATA • VIA LIBERA',1500);
    sfx('clear');
    return true;
  }
  function applyTaskEffect(t){
    if(!game||!t.v22||t.v22Applied)return;
    t.v22Applied=true;
    ensureObjectives();
    game.roleDone[t.cat]=(game.roleDone[t.cat]||0)+1;
    t.v22Counted=true;
    const specialist=hasSkill(game.ch,t.cat);
    unlockGate(t.cat);
    if(t.cat==='BD'){
      game.intelUntil=performance.now()+10000;
      for(const e of game.w.enemies||[])e.exposed=true;
      for(const p of game.w.weaponPickups||[])p.revealed=true;
      showMsg((specialist?'🗄️ BD SPECIALIST':'🗄️ BD INOLTRATA')+' • DEBOLEZZE RIVELATE',1500);
    }
    if(t.cat==='PERM'){
      if(!game.routeUnlocked)game.shield++;
      if(specialist)game.permBonus=(game.permBonus||0)+1;
    }
    if(t.cat==='SIC'){
      const disabled=game.w.hazards||[];
      game.w.disabledHazards=(game.w.disabledHazards||[]).concat(disabled);
      game.w.hazards=[];
      game.safetyUntil=performance.now()+9000;
      game.shield++;
      showMsg('🦺 SICUREZZA ATTIVA • TRAPPOLE NEUTRALIZZATE',1500);
    }
    if(t.cat==='CONS'){
      game.consChain=(game.consChain||0)+1;
      game.combo=Math.max(game.combo,Math.min(5,2+game.consChain));
      game.maxCombo=Math.max(game.maxCombo,game.combo);
      game.consBonus=(game.consBonus||0)+(specialist?45:25);
      showMsg('📊 CONSUNTIVO CHIUSO • COMBO E RISORSE POTENZIATE',1500);
      if(Number.isFinite(game.weapon?.ammo))game.weapon.ammo+=specialist?6:3;
    }
    updateHUD();
  }
  updateWorkTasks=function(dt,now){
    const before=new Set((game?.w?.tasks||[]).filter(t=>t.dead));
    previousUpdateWorkTasks(dt,now);
    if(!game)return;
    for(const t of game.w.tasks||[])if(t.dead&&!t.v22Applied)applyTaskEffect(t);
  };

  function enforceGates(){
    if(!game?.running||game.paused)return;
    for(const gate of game.w.gates||[]){
      if(gate.open)continue;
      const p=game.p;
      if(p.x+p.w>gate.x&&p.x<gate.x+gate.w&&p.y+p.h>gate.y){
        p.x=gate.x-p.w-3;p.vx=0;
        if(!gate.warned){gate.warned=true;showMsg('🔒 '+gate.label+' • GESTISCI '+CAT[gate.required],1700);}
      }
    }
  }
  update=function(dt,now){previousUpdate(dt,now);enforceGates();};

  startGame=function(){
    previousStartGame();
    if(!game)return;
    ensureObjectives();
    game.roleDone={BD:0,CONS:0,PERM:0,SIC:0};
    game.routeUnlocked=false;game.intelUntil=0;game.safetyUntil=0;game.consChain=0;game.consBonus=0;
  };
  startBoss=function(){
    previousStartBoss();
    if(!game?.boss)return;
    const reduction=Math.min(8,(game.consChain||0)*2);
    if(reduction){game.boss.hp=Math.max(5,game.boss.hp-reduction);game.boss.max=game.boss.hp;}
    if(game.roleDone?.BD)game.boss.exposed=true;
  };

  function installMissionUI(){
    const hud=document.querySelector('.hud');
    if(hud&&!$('#missionHud')){
      const el=document.createElement('div');el.className='hb v22-hud';el.id='missionHud';el.innerHTML='Mansioni<b>—</b>';hud.appendChild(el);
    }
    const combat=$('#combatBar');
    if(combat&&!$('#missionBar')){
      const bar=document.createElement('div');bar.id='missionBar';bar.innerHTML='<span id="missionHint">OBIETTIVO OPERATIVO</span><b id="missionState">—</b>';
      combat.parentNode.insertBefore(bar,combat.nextSibling);
    }
  }
  function updateMissionUI(){
    if(!game)return;
    const p=objectiveProgress(),gate=(game.w.gates||[])[0],target=(game.w.tasks||[]).find(t=>!t.dead&&t.required);
    const hud=$('#missionHud');if(hud)hud.innerHTML='Mansioni<b>'+p.done+'/'+p.total+'</b>';
    const hint=$('#missionHint'),state=$('#missionState');
    if(hint){
      hint.textContent=target?'GESTISCI '+CAT[target.cat]+' · '+(hasSkill(game.ch,target.cat)?'SPECIALISTA':'INOLTRA'):(gate&&!gate.open?'SBLOCCA '+gate.label:'AVANZA VERSO IL BOSS');
    }
    if(state)state.textContent=gate?.open?'VIA LIBERA':(gate?CAT[gate.required]:'—');
  }
  updateHUD=function(){previousUpdateHUD();updateMissionUI();};

  drawTask=function(t){
    previousDrawTask(t);
    if(!t.v22)return;
    ctx.save();ctx.translate(t.x,t.y);
    if(t.required){ctx.strokeStyle='#ffe16b';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.strokeRect(-4,-4,t.w+8,t.h+8);ctx.setLineDash([]);ctx.fillStyle='#ffe16b';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText('OBIETTIVO',t.w/2,-8);}
    ctx.restore();
  };

  function drawRoleOverlay(){
    if(!game?.running)return;
    ctx.save();ctx.translate(-(game.camera||0),0);
    for(const gate of game.w.gates||[]){
      if(gate.open){ctx.globalAlpha=.35;ctx.fillStyle='#70e0aa';ctx.fillRect(gate.x,game.w.groundY-8,gate.w,8);ctx.globalAlpha=1;continue;}
      ctx.fillStyle='#151d2a';ctx.strokeStyle='#ffcf68';ctx.lineWidth=3;rr(gate.x,gate.y,gate.w,gate.h,8,1,1);
      ctx.fillStyle='#f3c85e';ctx.fillRect(gate.x+8,gate.y+18,gate.w-16,7);ctx.fillRect(gate.x+8,gate.y+gate.h-27,gate.w-16,7);
      ctx.strokeStyle='#db5868';ctx.lineWidth=5;for(let y=gate.y+40;y<gate.y+gate.h-30;y+=38){ctx.beginPath();ctx.moveTo(gate.x+9,y);ctx.lineTo(gate.x+gate.w-9,y+20);ctx.stroke();}
      ctx.fillStyle='#fff4be';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText('🔒 '+gate.label,gate.x+gate.w/2,gate.y-10);
    }
    const target=(game.w.tasks||[]).find(t=>!t.dead&&t.required);
    if(target){ctx.fillStyle='#ffe16b';ctx.font='bold 18px system-ui';ctx.textAlign='center';ctx.fillText('▼',target.x+target.w/2,target.y-22);}
    ctx.restore();
  }
  draw=function(){previousDraw();drawRoleOverlay();};
  const versionLabel=document.querySelector('.header .logo span');
  if(versionLabel)versionLabel.textContent='ADVENTURE DX v22';
  document.title='Back Office Adventure DX v22';
  const creditsTitle=document.querySelector('#credits h2');
  if(creditsTitle)creditsTitle.textContent='BACK OFFICE ADVENTURE DX v22';
  installMissionUI();
  updateHUD();
})();

