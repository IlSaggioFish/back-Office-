// ---------- PIATTAFORME TEMATIZZATE ----------
const v5DrawPlatform=drawPlatform;
drawPlatform=function(p){
  if(!p.v6Type)return v5DrawPlatform(p);
  ctx.save();const x=p.x,y=p.y,w=p.w,h=p.h,type=p.v6Type;
  if(['desk','brokenDesk'].includes(type)){
    ctx.fillStyle=type==='brokenDesk'?'#5c3a45':'#7a624c';ctx.fillRect(x,y,w,h);ctx.fillRect(x+14,y+h,8,35);ctx.fillRect(x+w-22,y+h,8,35);ctx.fillStyle='#b48a61';ctx.fillRect(x,y,w,5);
    if(type==='brokenDesk'){v6Line(x+w*.55,y,x+w*.43,y+h,'#ff6b85',3,.8);}
  }else if(type==='cabinet'||type==='archive'||type==='shelf'){
    ctx.fillStyle=type==='shelf'?'#4f476d':'#526779';ctx.fillRect(x,y,w,h+26);ctx.strokeStyle='#92a9bb';ctx.lineWidth=2;for(let q=20;q<w;q+=38)ctx.strokeRect(x+q-14,y+5,28,18);
  }else if(type==='printerDesk'){
    ctx.fillStyle='#536879';ctx.fillRect(x,y,w,h);ctx.fillStyle='#8797a4';rr(x+w*.28,y-28,w*.44,30,5,1,0);ctx.fillStyle='#e9f0f4';ctx.fillRect(x+w*.35,y-22,w*.3,7);
  }else if(type==='folder'||type==='folderStack'||type==='ntwBlock'){
    const c=type==='ntwBlock'?'#6cd2c9':type==='folderStack'?'#8f3c5e':'#6b5f91';ctx.fillStyle=c;rr(x,y,w,h+10,5,1,0);ctx.fillStyle='#ffffff33';for(let q=8;q<w-15;q+=45)ctx.fillRect(x+q,y+4,28,4);
  }else if(type==='counter'){
    ctx.fillStyle='#4b426b';ctx.fillRect(x,y,w,h);ctx.fillStyle='#a995e6';ctx.fillRect(x,y,w,5);ctx.fillStyle='#332c4d';ctx.fillRect(x+12,y+h,w-24,28);
  }else if(type==='stamp'){
    ctx.fillStyle='#845d7c';rr(x,y,w,h,6,1,0);ctx.fillStyle='#d7b7d0';ctx.beginPath();ctx.arc(x+w/2,y-10,18,Math.PI,0);ctx.fill();ctx.fillRect(x+w/2-20,y-10,40,13);
  }else if(type==='scaffold'||type==='mengasiRight'){
    ctx.fillStyle='#7c692f';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#d5ae45';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+12,y+h);ctx.lineTo(x+12,y+h+45);ctx.moveTo(x+w-12,y+h);ctx.lineTo(x+w-12,y+h+45);ctx.moveTo(x+12,y+h+38);ctx.lineTo(x+w-12,y+h+12);ctx.stroke();
  }else if(type==='cable'){
    ctx.fillStyle='#805f35';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#25292c';ctx.lineWidth=6;ctx.beginPath();ctx.arc(x+w/2,y+9,24,0,Math.PI*2);ctx.stroke();
  }else if(type==='pipe'){
    ctx.fillStyle='#70818a';rr(x,y,w,h,8,1,0);ctx.strokeStyle='#aabac2';ctx.lineWidth=3;for(let q=18;q<w;q+=50){ctx.beginPath();ctx.moveTo(x+q,y);ctx.lineTo(x+q,y+h);ctx.stroke();}
  }else if(type==='pallet'){
    ctx.fillStyle='#9c7547';for(let q=0;q<3;q++)ctx.fillRect(x,y+q*7,w,5);
  }else if(type==='dashboard'||type==='glitch'){
    ctx.fillStyle=type==='glitch'?'#542040':'#17464c';rr(x,y,w,h+8,6,1,0);ctx.fillStyle=type==='glitch'?'#ff5c8e':'#76ddd1';ctx.fillRect(x+10,y+5,w-20,4);if(type==='glitch'){ctx.fillRect(x+w*.4,y-8,6,22);ctx.fillRect(x+w*.65,y-4,4,17);}
  }else if(type==='conveyor'){
    ctx.fillStyle='#596c72';ctx.fillRect(x,y,w,h);ctx.fillStyle='#90a5ab';for(let q=10;q<w;q+=28){ctx.beginPath();ctx.arc(x+q,y+h/2,5,0,Math.PI*2);ctx.fill();}
  }else if(type==='server'){
    ctx.fillStyle='#28343c';ctx.fillRect(x,y,w,h+20);ctx.fillStyle='#69dcd1';for(let q=10;q<w-5;q+=28)ctx.fillRect(x+q,y+5,15,4);
  }else if(type==='portalSlab'){
    ctx.fillStyle='#542644';rr(x,y,w,h,5,1,0);ctx.strokeStyle='#ff5c8c';ctx.lineWidth=3;ctx.strokeRect(x+5,y+4,w-10,h-8);
  }else if(type==='mengasiLeft'||type==='mengasiCore'){
    ctx.fillStyle=type==='mengasiCore'?'#7a4b3d':'#57213f';rr(x,y,w,h,7,1,0);ctx.fillStyle='#ffd05c';ctx.fillRect(x,y,w,4);
  }else return v5DrawPlatform(p);
  ctx.restore();
};
const v5DrawMoving=drawMoving;
drawMoving=function(p){if(p.v6Type){drawPlatform(p);ctx.save();ctx.globalAlpha=.5;ctx.strokeStyle='#d8c4ff';ctx.setLineDash([5,5]);ctx.strokeRect(p.x+3,p.y+3,p.w-6,p.h-6);ctx.restore();}else v5DrawMoving(p);};

const v5DrawGround=drawGround;
drawGround=function(){
  v5DrawGround();const idx=game.idx,gy=game.w.groundY,cam=game.camera;
  ctx.save();
  if(idx===0){ctx.globalAlpha=.22;ctx.strokeStyle='#a8cee3';ctx.lineWidth=1;for(let x=Math.floor(cam/55)*55-110;x<cam+1100;x+=55){ctx.beginPath();ctx.moveTo(x,gy+8);ctx.lineTo(x,540);ctx.stroke();}for(let y=gy+35;y<540;y+=35){ctx.beginPath();ctx.moveTo(cam,y);ctx.lineTo(cam+960,y);ctx.stroke();}}
  if(idx===1){ctx.globalAlpha=.18;ctx.fillStyle='#907ab6';for(let x=Math.floor(cam/70)*70-100;x<cam+1100;x+=70)ctx.fillRect(x,gy+13,48,5);}
  if(idx===2){ctx.globalAlpha=.45;ctx.fillStyle='#8b6b3f';for(let x=Math.floor(cam/90)*90-100;x<cam+1100;x+=90){ctx.beginPath();ctx.arc(x,gy+28,5+(x%7),0,Math.PI*2);ctx.fill();}ctx.fillStyle='#d1a83e';for(let x=Math.floor(cam/170)*170-170;x<cam+1100;x+=170)ctx.fillRect(x,gy+10,70,5);}
  if(idx===3){ctx.globalAlpha=.17;ctx.strokeStyle='#6ce0d5';for(let x=Math.floor(cam/60)*60-100;x<cam+1100;x+=60){ctx.beginPath();ctx.moveTo(x,gy+8);ctx.lineTo(x,540);ctx.stroke();}}
  if(idx===4){ctx.globalAlpha=.48;ctx.strokeStyle='#ff4f79';ctx.lineWidth=2;for(let x=Math.floor(cam/210)*210-210;x<cam+1100;x+=210){ctx.beginPath();ctx.moveTo(x,gy+5);ctx.lineTo(x+25,gy+28);ctx.lineTo(x+12,gy+51);ctx.lineTo(x+42,gy+72);ctx.stroke();}}
  ctx.restore();
};

const v5DrawCheckpoint=drawCheckpoint;
drawCheckpoint=function(cp){v5DrawCheckpoint(cp);ctx.save();ctx.globalAlpha=.6;ctx.strokeStyle='#d9f6ff';ctx.lineWidth=2;const t=performance.now()/400;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(cp.x,cp.y-8-i*7+Math.sin(t+i)*2,5+i*2,Math.PI,Math.PI*2);ctx.stroke();}ctx.restore();};
const v5DrawHazard=drawHazard;
drawHazard=function(h){v5DrawHazard(h);if(game.idx===2&&h.type==='cone'){ctx.save();ctx.strokeStyle='#f6b82a';ctx.lineWidth=3;ctx.setLineDash([9,6]);ctx.beginPath();ctx.moveTo(h.x-28,h.y+4);ctx.lineTo(h.x+h.w+28,h.y+4);ctx.stroke();ctx.restore();}};
const v5DrawFinish=drawFinish;
drawFinish=function(x,y){if(game.idx===4){ctx.save();ctx.globalAlpha=.55+.25*Math.sin(performance.now()/180);ctx.strokeStyle='#ffd15c';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(x+25,y+55,32,62,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 9px system-ui';ctx.fillText('USCITA',x-1,y+58);ctx.restore();}else v5DrawFinish(x,y);};

const v5UpdateBossV6=updateBoss;
updateBoss=function(dt,now){
  v5UpdateBossV6(dt,now);
  if(!game?.boss||game.boss.name!=='Mengasi'||!game.w.v6Arena)return;
  const a=game.w.v6Arena,b=game.boss;a.phase=b.phase;a.pulse=(a.pulse+dt*.005)%6.28;
  const arenaPlatforms=game.w.moving.filter(p=>p.v6Arena);
  arenaPlatforms.forEach((p,i)=>{
    const baseY=i?265:330;
    if(b.phase===1)p.y=baseY;
    if(b.phase===2)p.y=baseY+Math.sin(now/650+i*2)*48;
    if(b.phase===3)p.y=baseY+Math.sin(now/360+i*2)*72;
  });
};

const v5DrawV6=draw;
draw=function(){
  v5DrawV6();if(!game)return;drawV6Foreground();
};
function drawV6Foreground(){
  const idx=game.idx,t=performance.now()/1000,cam=game.camera;
  ctx.save();
  if(idx===0){
    ctx.globalAlpha=.18;ctx.fillStyle='#7fb17a';for(let i=0;i<4;i++){const x=((i*330-cam*.42)%1320+1320)%1320-100;ctx.beginPath();ctx.ellipse(x,485,34,72,-.3,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=.12;ctx.fillStyle='#b8d7e8';ctx.fillRect(0,60,960,7);
  }
  if(idx===1){ctx.globalAlpha=.12;ctx.fillStyle='#d8caff';for(let i=0;i<7;i++){const x=((i*190-cam*.48)%1330+1330)%1330-100;ctx.fillRect(x,465,80,60);ctx.fillStyle='#6b5f84';ctx.fillRect(x+8,475,64,8);ctx.fillStyle='#d8caff';}}
  if(idx===2){
    ctx.globalAlpha=.28;ctx.strokeStyle='#f1a92b';ctx.lineWidth=4;ctx.setLineDash([16,10]);ctx.beginPath();ctx.moveTo(0,505);ctx.lineTo(960,505);ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=.15;ctx.fillStyle='#d7b779';for(let i=0;i<14;i++){const x=(i*79+(t*25)%79);ctx.beginPath();ctx.arc(x,500-(i%3)*14,3+(i%4),0,Math.PI*2);ctx.fill();}
  }
  if(idx===3){
    ctx.globalAlpha=.08;ctx.fillStyle='#75ded4';for(let i=0;i<6;i++){const y=95+i*72+Math.sin(t+i)*4;ctx.fillRect(0,y,960,2);}
    ctx.globalAlpha=.12;ctx.fillStyle='#fff';for(let i=0;i<5;i++){const x=((i*240-cam*.45)%1200+1200)%1200-90;ctx.fillRect(x,455,110,48);}
  }
  if(idx===4){
    for(let i=0;i<10;i++){const x=((i*113+t*45-cam*.20)%1130+1130)%1130-60,y=90+(i%5)*75+Math.sin(t*2+i)*18;ctx.save();ctx.globalAlpha=.16;ctx.translate(x,y);ctx.rotate(t*.15+i);ctx.fillStyle='#fff';ctx.fillRect(-14,-9,28,18);ctx.restore();}
    ctx.globalAlpha=.07;ctx.fillStyle='#ff315d';for(let y=0;y<540;y+=8)ctx.fillRect(0,y,960,2);
    if(game.boss?.name==='Mengasi'){
      const intensity=game.boss.phase===3?.18:game.boss.phase===2?.11:.06;ctx.globalAlpha=intensity*(.6+.4*Math.sin(t*7));ctx.fillStyle='#ffcf5a';ctx.fillRect(0,0,960,540);
    }
  }
  ctx.restore();
}

const v5RenderMenuV6=renderMenu;
renderMenu=function(){
  v5RenderMenuV6();
  const nodes=[...document.querySelectorAll('#map .node')];
  nodes.forEach((n,i)=>{if(!V6_SCENARIOS[i])return;n.title=LEVELS[i].desc;const sm=n.querySelector('small');if(sm&&!sm.dataset.v6){sm.dataset.v6='1';sm.innerHTML+=`<br><span style="color:${V6_SCENARIOS[i].accent}">${V6_SCENARIOS[i].tag}</span>`;}});
};
renderMenu();
