// --- DRAW: CORPI, COSTUMI, GHOST, NPC, RELIQUIE, MENGASI ---
const v4Draw=draw;
draw=function(){v4Draw();if(!game)return;drawV5WorldOverlay();drawGhost();};
function drawV5WorldOverlay(){
  const cam=game.camera;ctx.save();
  for(const r of game.w.relics||[]){if(r.taken)continue;const x=r.x-cam;if(x<-50||x>1010)continue;const rr0=RELICS.find(a=>a.id===r.id);ctx.globalAlpha=.75+Math.sin(performance.now()/220)*.2;ctx.font='30px system-ui';ctx.textAlign='center';ctx.fillText(rr0?.icon||'🏺',x,r.y);}
  for(const st of game.w.upgradeStations||[]){if(st.used)continue;const x=st.x-cam;if(x<-50||x>1010)continue;ctx.fillStyle='#392a64';rr(x-22,st.y,44,54,8,1,0);ctx.font='23px system-ui';ctx.textAlign='center';ctx.fillText('⚙️',x,st.y+35);ctx.fillStyle='#d9cfff';ctx.font='bold 7px system-ui';ctx.fillText('UPGRADE',x,st.y+50);}
  for(const n of game.w.npcs||[]){const x=n.x-cam;if(x<-70||x>1030)continue;face('DelVecchio',x,n.y+22,22);ctx.fillStyle='#e5c45f';ctx.fillRect(x-18,n.y+44,36,22);ctx.fillStyle='#18222c';ctx.font='bold 7px system-ui';ctx.textAlign='center';ctx.fillText('CAPO CANTIERE',x,n.y+60);}
  ctx.restore();
}
function drawGhost(){
  const g=game.v5Ghost;if(!g||!Array.isArray(g.samples)||!g.samples.length||game.mode!=='story')return;const ms=performance.now()-game.start;let s=g.samples[0];for(let i=1;i<g.samples.length&&g.samples[i][0]<=ms;i++)s=g.samples[i];const x=s[1]-game.camera,y=s[2];if(x<-60||x>1020)return;ctx.save();ctx.globalAlpha=.24;ctx.fillStyle='#8fe8ff';ctx.beginPath();ctx.arc(x+22,y+25,23,0,Math.PI*2);ctx.fill();ctx.fillRect(x+11,y+45,22,35);ctx.globalAlpha=.6;ctx.fillStyle='#d9f7ff';ctx.font='bold 7px system-ui';ctx.fillText('GHOST',x+9,y-4);ctx.restore();
}

drawPlayer=function(p,ch){
  ctx.save();if(p.inv>0&&Math.floor(p.inv/90)%2===0)ctx.globalAlpha=.28;const run=Math.abs(p.vx)>40&&p.onGround,air=!p.onGround,t=performance.now()/180,phase=run?Math.sin(p.anim*11):Math.sin(t)*.12;const cx=p.x+p.w/2,headY=p.y+20,bodyY=p.y+37;const lean=air?(p.vy<0?-5:6):Math.max(-5,Math.min(5,p.vx/70));ctx.translate(lean,0);
  if(p.onGround){ctx.globalAlpha*=.3;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(cx,p.y+p.h+3,25,6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=p.inv>0&&Math.floor(p.inv/90)%2===0?.28:1;}
  ctx.strokeStyle='#17212d';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx-5,bodyY+23);ctx.lineTo(cx-13-phase*9,p.y+p.h-7);ctx.moveTo(cx+5,bodyY+23);ctx.lineTo(cx+13+phase*9,p.y+p.h-7);ctx.stroke();ctx.fillStyle='#0d1118';ctx.fillRect(cx-22-phase*9,p.y+p.h-8,16,7);ctx.fillRect(cx+7+phase*9,p.y+p.h-8,16,7);
  const shirt=ch.color;ctx.fillStyle=shirt;rr(cx-17,bodyY-4,34,34,9,1,0);ctx.fillStyle='#ffffff22';ctx.fillRect(cx-10,bodyY,20,3);
  ctx.strokeStyle=shirt;ctx.lineWidth=8;ctx.beginPath();const arm=air?-17:phase*9;ctx.moveTo(cx-14,bodyY+4);ctx.lineTo(cx-25-arm,bodyY+16);ctx.moveTo(cx+14,bodyY+4);ctx.lineTo(cx+25+arm,bodyY+16);ctx.stroke();
  face(ch.n,cx,headY,22,ctx.globalAlpha);
  const cos=game.costume||selectedCostume;
  if(cos==='site'){ctx.fillStyle='#ffd44e';ctx.beginPath();ctx.arc(cx,headY-14,20,Math.PI,0);ctx.fill();ctx.fillRect(cx-22,headY-15,44,6);ctx.fillStyle='#f6c32f';ctx.fillRect(cx-4,bodyY-3,8,34);}
  if(cos==='smart'){ctx.font='20px system-ui';ctx.textAlign='center';ctx.fillText('🎧',cx,headY+5);ctx.fillStyle='#fff';ctx.font='bold 6px system-ui';ctx.fillText('HOME',cx,bodyY+17);}
  if(cos==='legend'){ctx.font='22px system-ui';ctx.textAlign='center';ctx.fillText('👑',cx,headY-17);ctx.strokeStyle='#ffd34d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,bodyY+12,31,0,Math.PI*2);ctx.stroke();}
  if(game.shield>0||game.activeUntil>performance.now()){ctx.strokeStyle='#77edff';ctx.lineWidth=4;ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(cx,p.y+p.h/2,38,0,Math.PI*2);ctx.stroke();}
  if(game.abilityFxUntil>performance.now()){ctx.strokeStyle='#d4b7ff';ctx.lineWidth=3;ctx.globalAlpha=.75;for(let r=42;r<60;r+=8){ctx.beginPath();ctx.arc(cx,p.y+p.h/2,r,0,Math.PI*2);ctx.stroke();}}
  ctx.restore();
};
const v4DrawEnemy=drawEnemy;
drawEnemy=function(e){
  if(['pec','allegato','portale','scaduta'].includes(e.type))return v4DrawEnemy(e);ctx.save();ctx.translate(e.x,e.y);ctx.textAlign='center';
  if(e.type==='foglio'){ctx.font='30px system-ui';ctx.fillText('📄',e.w/2,30);ctx.fillStyle='#ff9cae';ctx.font='bold 7px system-ui';ctx.fillText('STAMPA',e.w/2,40);}
  if(e.type==='ticket'){ctx.fillStyle='#325b7a';rr(0,0,e.w,e.h,10,1,0);ctx.font='22px system-ui';ctx.fillText('🎫',e.w/2,26);}
  if(e.type==='sollecito'){ctx.fillStyle='#7a2535';rr(0,0,e.w,e.h,9,1,0);ctx.font='21px system-ui';ctx.fillText('📣',e.w/2,25);ctx.fillStyle='#fff';ctx.font='bold 7px system-ui';ctx.fillText('SOLLECITO',e.w/2,37);}
  if(e.type==='riunione'){ctx.fillStyle='#5a477d';rr(0,0,e.w,e.h,9,1,0);ctx.font='22px system-ui';ctx.fillText('👥',e.w/2,27);ctx.fillStyle='#fff';ctx.font='bold 7px system-ui';ctx.fillText('RIUNIONE',e.w/2,40);}
  ctx.restore();
};
drawBoss=function(b){
  if(b.name==='Mengasi'){
    ctx.save();const pulse=1+Math.sin(performance.now()/130)*.08;ctx.translate(b.x,b.y);ctx.scale(pulse,pulse);ctx.strokeStyle='#ffc65a';ctx.lineWidth=6;ctx.globalAlpha=.65;ctx.beginPath();ctx.arc(0,12,64,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
    ctx.save();ctx.beginPath();ctx.arc(0,0,48,0,Math.PI*2);ctx.clip();const a=imgs.Mengozzi,bb=imgs.Gervasi;if(a?.complete&&bb?.complete){ctx.save();ctx.beginPath();ctx.rect(-48,-48,48,96);ctx.clip();ctx.drawImage(a,-48,-48,96,96);ctx.restore();ctx.save();ctx.beginPath();ctx.rect(0,-48,48,96);ctx.clip();ctx.drawImage(bb,-48,-48,96,96);ctx.restore();}ctx.restore();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,48,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#ffd34d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-44);ctx.lineTo(0,44);ctx.stroke();
    ctx.fillStyle='#37142d';rr(-38,45,76,70,10,1,0);ctx.fillStyle='#ffd34d';ctx.fillRect(-40,45,80,7);ctx.fillStyle='#fff';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText('MENGASI',0,104);ctx.restore();return;
  }
  const color=b.name==='Gervasi'?'#6a4d2d':'#321827';face(b.name,b.x,b.y,45);ctx.fillStyle=color;ctx.fillRect(b.x-34,b.y+44,68,64);ctx.fillStyle=b.name==='Gervasi'?'#e4b75e':'#ff6f86';ctx.fillRect(b.x-36,b.y+44,72,7);
};
drawBossHUD=function(b){ctx.fillStyle='#29101a';rr(235,13,490,15,7,1,0);ctx.fillStyle=b.name==='Mengasi'?'#ffc44f':(b.phase===3?'#ff375c':'#ff6881');rr(235,13,490*(b.hp/b.max),15,7,1,0);ctx.fillStyle='#fff';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText(`${b.name} • FASE ${b.phase} • ${b.hp}/${b.max}`,480,48);};

// --- OBIETTIVI, RECORD, GHOST, CLASSIFICA, FINALE ---
const v4ClearLevel=clearLevel;
clearLevel=function(){
  if(!game||!game.running)return;const g=game,idx=g.idx,time=(performance.now()-g.start)/1000,key=recKey(idx,g.ch.n),oldTime=save.records?.[key]?.time||Infinity;
  const results=OBJECTIVES[idx].map(o=>({o,ok:o.test(g,time)}));
  v4ClearLevel();
  v5extra.objectives[idx] ||= {};results.forEach(r=>{if(r.ok)v5extra.objectives[idx][r.o.id]=true;});
  if(time<oldTime&&g.mode==='story')v5extra.ghost[key]={time,samples:g.v5Samples.slice()};
  if(save.records?.[key])save.records[key].maxCombo=Math.max(save.records[key].maxCombo||0,g.maxCombo||1);
  const daily=dailyChallenge();if(!v5extra.dailyDone[daily.key]&&daily.test(g,time)){v5extra.dailyDone[daily.key]=true;save.totalStamps+=daily.reward;showMsg(`📅 SFIDA GIORNALIERA • +${daily.reward} MARCHE`,2200);}
  addLeader(g,time);
  $('#objectiveResults').innerHTML=results.map(r=>`<div class="objective ${r.ok?'done':''}"><span>${r.ok?'✅':'⬜'} ${r.o.txt}</span><b>${r.ok?'COMPLETATO':'RIPROVA'}</b></div>`).join('');
  if(idx===4){$('#clearTitle').textContent='MENGASI È STATO SCONFITTO!';$('#creditsBtn').textContent='🎬 Guarda il finale';}
  persistV5();updateDailyUI();
};
function addLeader(g,time){
  leaders.push({name:v5extra.profile||'Giocatore',score:g.score,level:g.mode==='endless'?'Endless':g.lv.name,char:g.ch.n,time:Math.round(time),date:new Date().toISOString().slice(0,10)});
  leaders.sort((a,b)=>b.score-a.score);leaders=leaders.slice(0,60);persistV5();
}
const v4GameOver=gameOver;
gameOver=function(){if(!game)return;const g=game,time=(performance.now()-g.start)/1000;if(g.mode==='endless'){v5extra.stats.endlessBest=Math.max(v5extra.stats.endlessBest||0,g.score);addLeader(g,time);}v4GameOver();persistV5();};
