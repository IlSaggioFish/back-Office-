function draw(){
  if(!game)return;
  const cam=game.camera,w=game.w,lv=game.lv;
  const themes={
    office:['#17415f','#0c2031','#80b4d0'],
    permits:['#303766','#111a37','#b29eff'],
    site:['#6b502f','#202b31','#e1b568'],
    cons:['#1b5257','#0d252d','#77d7cd'],
    final:['#511f3a','#190f22','#ff799c']
  },t=themes[lv.theme];
  const g=ctx.createLinearGradient(0,0,0,540);g.addColorStop(0,t[0]);g.addColorStop(.68,t[1]);g.addColorStop(1,'#07111c');
  ctx.fillStyle=g;ctx.fillRect(0,0,960,540);
  drawParallax(cam,t[2],lv.theme);

  const shake=game.cameraShake>0?(Math.random()-.5)*game.cameraShake:0;
  ctx.save();ctx.translate(-cam+shake,0);
  drawWorldDecor(lv.theme,cam);
  drawGround();
  for(const pl of w.platforms)drawPlatform(pl);
  for(const pl of w.moving)drawMoving(pl);
  for(const cp of w.check)drawCheckpoint(cp);
  for(const h of w.hazards)drawHazard(h);
  for(const c of w.collect)if(!c.taken)drawCollect(c);
  for(const sec of w.secrets)if(!sec.taken)drawSecret(sec);
  for(const t of w.tasks)if(!t.dead)drawTask(t);
  for(const e of w.enemies)if(!e.dead)drawEnemy(e);
  for(const pr of game.projectiles)drawProjectile(pr);
  if(game.boss&&!game.bossDone)drawBoss(game.boss);
  drawFinish(w.w-80,w.groundY-120);
  drawPlayer(game.p,game.ch);
  for(const q of game.particles){
    ctx.globalAlpha=Math.max(0,q.life/900);ctx.fillStyle=q.color;ctx.font='bold 13px system-ui';ctx.fillText(q.text,q.x,q.y);
  }
  ctx.globalAlpha=1;ctx.restore();
  if(game.boss&&!game.bossDone)drawBossHUD(game.boss);
}
function drawParallax(cam,col,theme){
  ctx.save();ctx.globalAlpha=.28;ctx.fillStyle=col;
  for(let i=0;i<10;i++){let x=((i*160-cam*.16)%1140)-100,h=70+(i%4)*28;ctx.fillRect(x,320-h,105,h);}
  ctx.globalAlpha=.10;ctx.strokeStyle='#fff';
  for(let y=95;y<430;y+=78){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
  if(theme==='site'){ctx.globalAlpha=.16;ctx.fillStyle='#ffd565';ctx.beginPath();ctx.arc(820,85,52,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}
function drawWorldDecor(theme,cam){
  ctx.save();ctx.globalAlpha=.7;
  if(theme==='office'){
    for(let x=280;x<game.w.w;x+=760){ctx.fillStyle='#755d45';ctx.fillRect(x,405,150,14);ctx.fillStyle='#263746';ctx.fillRect(x+15,365,55,38);ctx.fillRect(x+90,365,45,38);}
  }
  if(theme==='permits'){
    for(let x=500;x<game.w.w;x+=900){ctx.fillStyle='#54488e';ctx.fillRect(x,300,90,160);ctx.fillStyle='#a99aff';ctx.fillRect(x+12,315,66,40);ctx.fillStyle='#fff';ctx.font='bold 9px system-ui';ctx.fillText('PORTALE',x+20,340);}
  }
  if(theme==='site'){
    for(let x=480;x<game.w.w;x+=1200){ctx.font='54px system-ui';ctx.fillText('🚜',x,448);}
  }
  if(theme==='cons'){
    for(let x=500;x<game.w.w;x+=850){ctx.strokeStyle='#77d7cd';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,400);ctx.lineTo(x+40,350);ctx.lineTo(x+85,370);ctx.lineTo(x+130,300);ctx.stroke();}
  }
  if(theme==='final'){
    ctx.globalAlpha=.18;ctx.fillStyle='#fff';
    for(let x=300;x<game.w.w;x+=430){ctx.font='28px system-ui';ctx.fillText('📄',x,180+(x%220));}
  }
  ctx.restore();
}
function drawGround(){
  let cur=0,ps=game.w.pits.slice().sort((a,b)=>a.x-b.x);
  ctx.fillStyle='#183044';for(const p of ps){ctx.fillRect(cur,game.w.groundY,p.x-cur,100);cur=p.x+p.w;}ctx.fillRect(cur,game.w.groundY,game.w.w-cur,100);
  ctx.fillStyle='#2f5a76';cur=0;for(const p of ps){ctx.fillRect(cur,game.w.groundY,p.x-cur,8);cur=p.x+p.w;}ctx.fillRect(cur,game.w.groundY,game.w.w-cur,8);
}
function drawPlatform(pl){ctx.fillStyle=game.lv.theme==='site'?'#796747':'#2b4c65';ctx.fillRect(pl.x,pl.y,pl.w,pl.h);ctx.fillStyle='#668ba3';ctx.fillRect(pl.x,pl.y,pl.w,5);}
function drawMoving(pl){ctx.fillStyle='#6d62a8';ctx.fillRect(pl.x,pl.y,pl.w,pl.h);ctx.fillStyle='#beaaff';ctx.fillRect(pl.x,pl.y,pl.w,4);}
function face(name,x,y,r,alpha=1){
  const im=imgs[name];ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();
  if(im&&im.complete)ctx.drawImage(im,x-r,y-r,r*2,r*2);else{ctx.fillStyle='#667';ctx.fillRect(x-r,y-r,r*2,r*2);}
  ctx.restore();ctx.strokeStyle='#e8f7ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();
}
function drawPlayer(p,ch){
  ctx.save();
  if(p.inv>0&&Math.floor(p.inv/90)%2===0)ctx.globalAlpha=.28;
  const run=Math.abs(p.vx)>40&&p.onGround;
  const airborne=!p.onGround;
  const phase=run?Math.sin(p.anim*10):0;
  const cx=p.x+p.w/2,bodyY=p.y+34;
  const lean=airborne?(p.vy<0?-5:6):Math.max(-5,Math.min(5,p.vx/70));
  ctx.translate(lean,0);
  ctx.strokeStyle='#17212d';ctx.lineWidth=7;ctx.lineCap='round';
  ctx.beginPath();
  if(airborne){
    ctx.moveTo(cx,bodyY+15);ctx.lineTo(cx-14,p.y+p.h-8);ctx.moveTo(cx,bodyY+15);ctx.lineTo(cx+16,p.y+p.h-14);
  }else{
    ctx.moveTo(cx,bodyY+15);ctx.lineTo(cx-12-phase*7,p.y+p.h-5);ctx.moveTo(cx,bodyY+15);ctx.lineTo(cx+12+phase*7,p.y+p.h-5);
  }
  ctx.stroke();
  ctx.strokeStyle=ch.color;ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(cx,bodyY);ctx.lineTo(cx,bodyY+25);ctx.stroke();
  ctx.lineWidth=7;ctx.beginPath();
  if(p.hurt>0){ctx.moveTo(cx,bodyY+6);ctx.lineTo(cx-18,bodyY-2);ctx.moveTo(cx,bodyY+6);ctx.lineTo(cx+18,bodyY-2);}
  else if(airborne){ctx.moveTo(cx,bodyY+6);ctx.lineTo(cx-20,bodyY+2);ctx.moveTo(cx,bodyY+6);ctx.lineTo(cx+20,bodyY+2);}
  else{ctx.moveTo(cx,bodyY+6);ctx.lineTo(cx-16-phase*5,bodyY+18);ctx.moveTo(cx,bodyY+6);ctx.lineTo(cx+16+phase*5,bodyY+18);}
  ctx.stroke();
  face(ch.n,cx,p.y+21,22,ctx.globalAlpha);
  if(game.shield>0||game.activeUntil>performance.now()){ctx.strokeStyle='#77edff';ctx.lineWidth=4;ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(cx,p.y+p.h/2,38,0,Math.PI*2);ctx.stroke();}
  if(game.abilityFxUntil>performance.now()){ctx.strokeStyle='#d4b7ff';ctx.lineWidth=3;ctx.globalAlpha=.75;for(let r=42;r<58;r+=8){ctx.beginPath();ctx.arc(cx,p.y+p.h/2,r,0,Math.PI*2);ctx.stroke();}}
  ctx.restore();
}
function drawTask(t){
  ctx.save();ctx.translate(t.x,t.y);let ok=hasSkill(game.ch,t.cat);
  ctx.fillStyle=ok?'#f0eadc':'#522331';ctx.strokeStyle=ok?'#9aa8ae':'#ff6378';ctx.lineWidth=2;rr(0,0,t.w,t.h,8,1,1);
  ctx.fillStyle=ok?'#17222c':'#fff';ctx.textAlign='center';ctx.font='17px system-ui';ctx.fillText(ICON[t.cat],t.w/2,20);ctx.font='bold 8px system-ui';ctx.fillText(t.cat,t.w/2,36);ctx.restore();
}
function drawEnemy(e){
  ctx.save();ctx.translate(e.x,e.y);ctx.textAlign='center';
  if(e.type==='pec'){ctx.fillStyle='#551f2e';ctx.strokeStyle='#ff6680';ctx.lineWidth=2;rr(0,0,e.w,e.h,8,1,1);ctx.font='19px system-ui';ctx.fillText('✉️',e.w/2,23);}
  if(e.type==='allegato'){ctx.font='34px system-ui';ctx.fillText('📎',e.w/2,34);ctx.font='bold 7px system-ui';ctx.fillStyle='#fff';ctx.fillText('Manca',e.w/2,42);}
  if(e.type==='portale'){ctx.globalAlpha=e.active?1:.35;ctx.fillStyle='#44396d';rr(0,0,e.w,e.h,8,1,0);ctx.fillStyle='#b7a6ff';ctx.fillRect(8,10,Math.max(6,e.w-16),22);ctx.fillStyle='#fff';ctx.font='bold 8px system-ui';ctx.fillText('OFFLINE',e.w/2,26);}
  if(e.type==='scaduta'){ctx.fillStyle='#713020';rr(0,0,e.w,e.h,8,1,0);ctx.font='20px system-ui';ctx.fillText('⏰',e.w/2,23);ctx.fillStyle='#fff';ctx.font='bold 7px system-ui';ctx.fillText('SCADUTA',e.w/2,34);}
  ctx.restore();
}
function drawCollect(c){
  let y=c.y+Math.sin(performance.now()/300+c.bob)*5;ctx.save();ctx.translate(c.x,y);ctx.textAlign='center';
  if(c.type==='stamp'){ctx.fillStyle='#ffd64f';rr(-17,-13,34,26,5,1,0);ctx.fillStyle='#5b4500';ctx.font='bold 10px system-ui';ctx.fillText('€16',0,4);}
  if(c.type==='ntw'){ctx.fillStyle='#eef7ff';rr(-19,-14,38,28,4,1,0);ctx.fillStyle='#17314a';ctx.font='bold 9px system-ui';ctx.fillText('NTW',0,4);}
  if(c.type==='shield'){ctx.font='25px system-ui';ctx.fillText('🏠',0,8);}
  if(c.type==='coffee'){ctx.font='25px system-ui';ctx.fillText('☕',0,8);}ctx.restore();
}
function drawSecret(s){ctx.save();ctx.globalAlpha=.65+Math.sin(performance.now()/250)*.2;ctx.font='30px system-ui';ctx.textAlign='center';ctx.fillText('📜',s.x,s.y);ctx.globalAlpha=1;ctx.restore();}
function drawCheckpoint(cp){
  ctx.save();ctx.translate(cp.x,cp.y);const pulse=cp.hit?2+Math.sin(performance.now()/180)*2:0;
  ctx.fillStyle=cp.hit?'#4dce94':'#80919e';rr(-18-pulse/2,0-pulse/2,36+pulse,58+pulse,5,1,0);
  ctx.fillStyle='#16202a';ctx.fillRect(-12,8,24,18);ctx.font='18px system-ui';ctx.textAlign='center';ctx.fillText('☕',0,51);ctx.restore();
}
function drawHazard(h){ctx.save();ctx.translate(h.x,h.y);ctx.textAlign='center';if(h.type==='cone'){ctx.font='29px system-ui';ctx.fillText('🚧',h.w/2,28);}else{ctx.fillStyle='#7b8b98';rr(0,0,h.w,h.h,5,1,0);ctx.fillStyle='#dce5eb';ctx.fillRect(8,7,h.w-16,13);ctx.font='12px system-ui';ctx.fillText('🖨️',h.w/2,38);}ctx.restore();}
function drawProjectile(pr){
  if(pr.telegraphUntil&&performance.now()<pr.telegraphUntil){
    ctx.save();ctx.globalAlpha=.55;ctx.strokeStyle='#ff526a';ctx.lineWidth=3;ctx.setLineDash([8,6]);
    ctx.beginPath();ctx.moveTo(pr.x+pr.w/2,120);ctx.lineTo(pr.x+pr.w/2,game.w.groundY);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#ff526a';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('⚠ QUI',pr.x+pr.w/2,game.w.groundY-10);ctx.restore();return;
  }
  ctx.save();ctx.translate(pr.x,pr.y);ctx.fillStyle=pr.urgent?'#ffd6d9':'#f0eadc';ctx.strokeStyle=pr.urgent?'#ff526a':'#ff8292';ctx.lineWidth=pr.urgent?3:2;rr(0,0,pr.w,pr.h,8,1,1);
  ctx.fillStyle='#1a2430';ctx.textAlign='center';ctx.font='16px system-ui';ctx.fillText(ICON[pr.cat],pr.w/2,18);ctx.font='bold 8px system-ui';ctx.fillText(pr.urgent?'URGENTE '+pr.cat:pr.cat,pr.w/2,34);ctx.restore();
}
function drawBoss(b){
  const name=b.name==='Doppio'?(b.alt?'Gervasi':'Mengozzi'):b.name;face(name,b.x,b.y,45);ctx.fillStyle='#321827';ctx.fillRect(b.x-34,b.y+44,68,64);ctx.fillStyle='#ff6f86';ctx.fillRect(b.x-36,b.y+44,72,7);
  if(b.name==='Doppio'){let o=name==='Mengozzi'?'Gervasi':'Mengozzi';face(o,b.x+98,b.y+18,34,.85);}
}
function drawBossHUD(b){
  ctx.fillStyle='#29101a';rr(250,13,460,14,7,1,0);ctx.fillStyle=b.phase===3?'#ff375c':'#ff6881';rr(250,13,460*(b.hp/b.max),14,7,1,0);
  ctx.fillStyle='#fff';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(`${b.name} • FASE ${b.phase} • ${b.hp}/${b.max}`,480,47);
}
function drawFinish(x,y){ctx.fillStyle='#d8ebf5';ctx.fillRect(x,y,5,120);ctx.fillStyle='#50d1ff';ctx.beginPath();ctx.moveTo(x+5,y);ctx.lineTo(x+62,y+18);ctx.lineTo(x+5,y+36);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 10px system-ui';ctx.fillText('FINE',x+16,y+23);}
function rr(x,y,w,h,r,fill,stroke){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);if(fill)ctx.fill();if(stroke)ctx.stroke();}

