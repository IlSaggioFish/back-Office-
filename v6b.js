// ---------- BACKGROUND / PARALLAX ----------
drawParallax=function(cam,col,theme){
  const idx=game.idx,t=performance.now()/1000;
  ctx.save();
  if(idx===0){
    ctx.globalAlpha=.18;ctx.fillStyle='#cceeff';
    for(let i=0;i<9;i++){const x=((i*150-cam*.06)%1150)-120,h=60+(i%4)*28;ctx.fillRect(x,300-h,105,h);}
    ctx.globalAlpha=.12;ctx.strokeStyle='#b9e5ff';ctx.lineWidth=2;
    for(let x=40;x<960;x+=150){ctx.strokeRect(x,90,120,245);}
    ctx.globalAlpha=.07;ctx.fillStyle='#fff';for(let y=130;y<330;y+=42)ctx.fillRect(0,y,960,2);
  }
  if(idx===1){
    ctx.globalAlpha=.16;ctx.fillStyle='#c9b8ff';
    for(let i=0;i<8;i++){const x=((i*180-cam*.055)%1250)-150;ctx.fillRect(x,105,120,260);ctx.fillStyle='#6d639e';ctx.fillRect(x+22,140,76,180);ctx.fillStyle='#c9b8ff';}
    ctx.globalAlpha=.08;ctx.strokeStyle='#eadfff';for(let y=95;y<410;y+=55){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
  }
  if(idx===2){
    ctx.globalAlpha=.18;ctx.fillStyle='#9db0bf';
    for(let i=0;i<10;i++){const x=((i*145-cam*.045)%1200)-120,h=45+(i%5)*22;ctx.fillRect(x,340-h,95,h);}
    ctx.globalAlpha=.22;ctx.strokeStyle='#d9b04f';ctx.lineWidth=4;
    for(let i=0;i<3;i++){const x=((i*420-cam*.08)%1350)-160;ctx.beginPath();ctx.moveTo(x,90);ctx.lineTo(x,350);ctx.moveTo(x-80,115);ctx.lineTo(x+185,115);ctx.moveTo(x+165,115);ctx.lineTo(x+165,210);ctx.stroke();}
    ctx.globalAlpha=.12;ctx.fillStyle='#ffd96a';ctx.beginPath();ctx.arc(820,82,50,0,Math.PI*2);ctx.fill();
  }
  if(idx===3){
    ctx.globalAlpha=.09;ctx.strokeStyle='#8df4e7';ctx.lineWidth=1;
    for(let x=0;x<960;x+=48){ctx.beginPath();ctx.moveTo(x,80);ctx.lineTo(x,430);ctx.stroke();}
    for(let y=90;y<430;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
    ctx.globalAlpha=.16;ctx.strokeStyle='#84e1d6';ctx.lineWidth=3;
    for(let k=0;k<4;k++){ctx.beginPath();for(let x=0;x<960;x+=30){const y=260+k*35+Math.sin((x+cam*.12)/95+k+t*.8)*20;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}
  }
  if(idx===4){
    const flash=.10+Math.max(0,Math.sin(t*4))*.08;ctx.globalAlpha=flash;ctx.fillStyle='#ff315e';ctx.fillRect(0,0,960,540);
    ctx.globalAlpha=.12;ctx.fillStyle='#fff';for(let i=0;i<13;i++){const x=((i*115-cam*.12)%1100)-80,y=105+(i%5)*62;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t+i)*.12);ctx.fillRect(-18,-12,36,24);ctx.restore();}
    ctx.globalAlpha=.22;ctx.strokeStyle='#ff7fa0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(480,80);for(let y=100;y<430;y+=35)ctx.lineTo(480+Math.sin(y*.08+t)*24,y);ctx.stroke();
  }
  ctx.globalAlpha=.09;ctx.fillStyle=col;
  for(let i=0;i<9;i++){const x=((i*170-cam*.15)%1200)-130,h=55+(i%3)*35;ctx.fillRect(x,390-h,120,h);}
  ctx.restore();
};

drawWorldDecor=function(theme,cam){
  const idx=game.idx,t=performance.now()/1000,[start,end]=v6CullRange(650,cam);
  ctx.save();
  if(idx===0){
    for(let x=start;x<end;x+=650){
      ctx.globalAlpha=.16;ctx.fillStyle='#bde8ff';ctx.fillRect(x+40,145,270,230);ctx.strokeStyle='#8bc9ea';ctx.lineWidth=3;ctx.strokeRect(x+40,145,270,230);
      ctx.globalAlpha=.82;ctx.fillStyle='#765f4a';ctx.fillRect(x+95,395,190,13);ctx.fillStyle='#2c3d4c';ctx.fillRect(x+110,352,60,40);ctx.fillRect(x+205,352,60,40);
      ctx.fillStyle=(Math.floor(t*2+x/100)%2)?'#66d8ff':'#3b7189';ctx.fillRect(x+118,358,44,25);ctx.fillRect(x+213,358,44,25);
      ctx.fillStyle='#557089';ctx.fillRect(x+80,410,14,50);ctx.fillRect(x+280,410,14,50);
      v6Label('OPEN SPACE',x+350,185,'#16394f','#c9f2ff',92);
      ctx.fillStyle='#45663c';ctx.beginPath();ctx.arc(x+400,395,24,0,Math.PI*2);ctx.fill();ctx.fillStyle='#705843';ctx.fillRect(x+384,410,32,48);
    }
  }
  if(idx===1){
    for(let x=start;x<end;x+=650){
      ctx.globalAlpha=.9;ctx.fillStyle='#454064';ctx.fillRect(x+35,205,135,255);ctx.fillStyle='#7a719e';for(let y=225;y<440;y+=42)ctx.fillRect(x+47,y,110,7);
      ctx.fillStyle='#372e59';ctx.fillRect(x+215,330,180,130);ctx.fillStyle='#ad9af1';ctx.fillRect(x+235,348,140,40);
      ctx.fillStyle=(Math.floor(t*3+x/80)%2)?'#ff6e9a':'#8d7eff';ctx.fillRect(x+251,360,108,14);
      v6Label('SPORTELLO',x+232,294,'#382d5c','#efe9ff',112);v6Label('PEC / PROTOCOLLO',x+410,205,'#362a55','#efe9ff',140);
      ctx.font='42px system-ui';ctx.fillText('📚',x+470,390);ctx.fillText('🗃️',x+520,430);
    }
  }
  if(idx===2){
    for(let x=start;x<end;x+=700){
      ctx.globalAlpha=.8;ctx.fillStyle='#6e5634';ctx.beginPath();ctx.moveTo(x+10,460);ctx.quadraticCurveTo(x+95,390,x+190,460);ctx.fill();
      ctx.fillStyle='#9c7a49';ctx.beginPath();ctx.arc(x+235,412,42,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4b3b2a';ctx.beginPath();ctx.arc(x+235,412,18,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#e1a92d';rr(x+330,385,100,45,8,1,0);ctx.fillStyle='#242d31';ctx.beginPath();ctx.arc(x+350,438,22,0,Math.PI*2);ctx.arc(x+410,438,22,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e1a92d';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(x+414,392);ctx.lineTo(x+478,330);ctx.lineTo(x+525,358);ctx.stroke();
      v6Label('AREA LAVORI',x+505,210,'#6b4e17','#fff0a8',110);ctx.strokeStyle='#e4a62d';ctx.lineWidth=4;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(x+510+k*34,250);ctx.lineTo(x+510+k*34,455);ctx.stroke();}
    }
  }
  if(idx===3){
    for(let x=start;x<end;x+=660){
      ctx.globalAlpha=.9;ctx.fillStyle='#173f47';rr(x+30,175,260,150,10,1,0);ctx.fillStyle='#73d9d0';ctx.fillRect(x+50,198,85,7);ctx.fillRect(x+50,217,135,6);ctx.fillRect(x+50,236,100,6);
      ctx.strokeStyle='#80eadf';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+50,292);ctx.lineTo(x+100,260);ctx.lineTo(x+155,280);ctx.lineTo(x+205,235);ctx.lineTo(x+260,252);ctx.stroke();
      ctx.fillStyle='#23323b';ctx.fillRect(x+360,245,90,215);ctx.fillStyle='#6fe2d5';for(let y=265;y<440;y+=25){ctx.fillRect(x+375,y,60,8);ctx.fillStyle='#2b5c62';ctx.fillRect(x+375,y+10,60,5);ctx.fillStyle='#6fe2d5';}
      ctx.fillStyle='#4c6870';ctx.fillRect(x+470,405,150,25);ctx.fillStyle='#dceff0';for(let q=0;q<3;q++)ctx.fillRect(x+485+q*44,385,30,22);
      v6Label('CONSUNTIVAZIONE',x+320,185,'#153d45','#d8fffa',145);
    }
  }
  if(idx===4){
    for(let x=start;x<end;x+=620){
      ctx.globalAlpha=.85;ctx.fillStyle='#4f2034';ctx.save();ctx.translate(x+120,405);ctx.rotate(-.08);ctx.fillRect(-75,-12,150,24);ctx.restore();
      ctx.fillStyle='#331726';ctx.fillRect(x+250,305,145,155);ctx.fillStyle=(Math.floor(t*5+x/100)%2)?'#ff335d':'#7a1832';ctx.fillRect(x+268,325,108,54);ctx.fillStyle='#fff';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillText('URGENTE',x+322,358);
      ctx.strokeStyle='#c64d75';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+430,460);ctx.lineTo(x+470,380);ctx.lineTo(x+510,430);ctx.lineTo(x+555,330);ctx.stroke();ctx.font='34px system-ui';ctx.fillText('📄',x+490,235);ctx.fillText('⚠️',x+550,280);
    }
    drawMengasiArenaDecor();
  }
  ctx.restore();
};

function drawMengasiArenaDecor(){
  const a=game.w.v6Arena;if(!a)return;const t=performance.now()/1000;
  ctx.save();ctx.globalAlpha=.22;ctx.fillStyle='#6c2851';ctx.fillRect(a.x,120,a.w/2,340);ctx.fillStyle='#7a5b28';ctx.fillRect(a.x+a.w/2,120,a.w/2,340);
  ctx.globalAlpha=.7;ctx.strokeStyle='#ffd25f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(a.x+a.w/2,120);for(let y=140;y<460;y+=30)ctx.lineTo(a.x+a.w/2+Math.sin(t*4+y*.08)*15,y);ctx.stroke();
  ctx.globalAlpha=.16+.08*Math.sin(t*3);ctx.fillStyle='#ffd25f';ctx.beginPath();ctx.arc(a.x+a.w/2,235,105,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.8;ctx.fillStyle='#fff';ctx.font='900 28px system-ui';ctx.textAlign='center';ctx.fillText('MENGASI',a.x+a.w/2,246);
  ctx.globalAlpha=.8;ctx.fillStyle='#422138';ctx.fillRect(a.x+70,300,150,100);ctx.fillStyle='#ff7190';ctx.fillRect(a.x+90,320,110,28);
  ctx.strokeStyle='#d5a643';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(a.x+a.w-210,260);ctx.lineTo(a.x+a.w-210,455);ctx.moveTo(a.x+a.w-300,310);ctx.lineTo(a.x+a.w-110,310);ctx.stroke();
  for(const gx of [a.x+280,a.x+a.w-280]){ctx.globalAlpha=.65;ctx.fillStyle='#30273e';rr(gx-34,375,68,85,8,1,0);ctx.fillStyle='#ffcb58';ctx.globalAlpha=.45+.35*Math.sin(t*5+gx);ctx.beginPath();ctx.arc(gx,405,17,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}
