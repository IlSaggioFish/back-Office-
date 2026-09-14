/* BACK OFFICE ADVENTURE DX v11.2 - VISUAL CLARITY REDESIGN */
'use strict';

(function(){
  const oldPlatform=drawPlatform;
  const oldMoving=drawMoving;
  const oldHazard=drawHazard;
  const oldEnemy=drawEnemy;
  const oldCollect=drawCollect;
  const oldCheckpoint=drawCheckpoint;
  const oldSecret=drawSecret;
  const oldWorldDecor=drawWorldDecor;

  function box(x,y,w,h,fill='#31495c',stroke='#0b1722',r=5){
    ctx.save();ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=2;rr(x,y,w,h,r,1,1);ctx.restore();
  }
  function txt(t,x,y,size=8,color='#fff',align='center',weight='bold'){
    ctx.save();ctx.fillStyle=color;ctx.font=`${weight} ${size}px system-ui`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(t,x,y);ctx.restore();
  }
  function paper(x,y,w=22,h=18,angle=0){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='#f5f7f4';ctx.strokeStyle='#7993a5';ctx.lineWidth=1.5;ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeRect(-w/2,-h/2,w,h);ctx.strokeStyle='#b7c5cf';for(let i=-4;i<=5;i+=5){ctx.beginPath();ctx.moveTo(-w/2+4,i);ctx.lineTo(w/2-4,i);ctx.stroke();}ctx.restore();
  }
  function printer(x,y,scale=1,enemy=false){
    const w=64*scale;
    ctx.save();ctx.translate(x,y);
    box(0,10*scale,w,34*scale,enemy?'#37414a':'#536879','#0a1219',6*scale);
    box(9*scale,0,46*scale,16*scale,'#6f8290','#101820',4*scale);
    paper(32*scale,-4*scale,30*scale,20*scale,0);
    ctx.fillStyle='#0d1720';ctx.fillRect(10*scale,28*scale,44*scale,9*scale);
    ctx.fillStyle='#dfe9ef';ctx.fillRect(18*scale,32*scale,28*scale,9*scale);
    ctx.fillStyle=enemy?'#ff405f':'#62e88b';ctx.fillRect(51*scale,14*scale,7*scale,6*scale);
    if(enemy){
      ctx.fillStyle='#150d12';ctx.fillRect(16*scale,15*scale,32*scale,10*scale);
      ctx.fillStyle='#ff3958';ctx.beginPath();ctx.moveTo(20*scale,18*scale);ctx.lineTo(28*scale,21*scale);ctx.lineTo(20*scale,23*scale);ctx.fill();ctx.beginPath();ctx.moveTo(44*scale,18*scale);ctx.lineTo(36*scale,21*scale);ctx.lineTo(44*scale,23*scale);ctx.fill();
      paper(73*scale,18*scale,20*scale,14*scale,-.15);paper(87*scale,10*scale,18*scale,13*scale,.18);
    }
    txt(enemy?'STAMPANTE OSTILE':'STAMPANTE',w/2,53*scale,6*scale,enemy?'#ff8797':'#d8ecf7');
    ctx.restore();
  }
  function coffeeMachine(x,y,scale=1,glow=true){
    ctx.save();ctx.translate(x,y);
    if(glow){ctx.globalAlpha=.14;ctx.fillStyle='#62ef9b';ctx.beginPath();ctx.arc(30*scale,28*scale,38*scale,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    box(3*scale,2*scale,54*scale,53*scale,'#33495b','#0c1720',6*scale);
    ctx.fillStyle='#16232e';ctx.fillRect(10*scale,17*scale,40*scale,22*scale);
    ctx.fillStyle='#75f19c';ctx.beginPath();ctx.arc(48*scale,12*scale,4*scale,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f7f5ef';ctx.fillRect(20*scale,34*scale,20*scale,15*scale);ctx.fillStyle='#7d4b2b';ctx.beginPath();ctx.arc(30*scale,41*scale,3*scale,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#eaf7fb';ctx.lineWidth=2*scale;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo((24+i*6)*scale,2*scale);ctx.quadraticCurveTo((20+i*7)*scale,-6*scale,(28+i*7)*scale,-10*scale);ctx.stroke();}
    txt('CAFFÈ',30*scale,61*scale,6*scale,'#a8f2c2');ctx.restore();
  }
  function cabinet(x,y,scale=1,label='ARCHIVIO'){
    ctx.save();ctx.translate(x,y);box(0,0,48*scale,68*scale,'#40566a','#0d1720',4*scale);
    for(let i=0;i<3;i++){ctx.fillStyle=i%2?'#4f6679':'#465d70';ctx.fillRect(5*scale,(7+i*20)*scale,38*scale,16*scale);ctx.fillStyle='#a9bac5';ctx.fillRect(17*scale,(11+i*20)*scale,14*scale,4*scale);ctx.fillStyle='#16232e';ctx.fillRect(19*scale,(17+i*20)*scale,10*scale,2*scale);}txt(label,24*scale,75*scale,6*scale,'#cfe4ef');ctx.restore();
  }
  function workstation(x,y,scale=1){
    ctx.save();ctx.translate(x,y);ctx.fillStyle='#8b6846';ctx.fillRect(0,24*scale,88*scale,8*scale);ctx.fillStyle='#263847';ctx.fillRect(8*scale,32*scale,6*scale,28*scale);ctx.fillRect(72*scale,32*scale,6*scale,28*scale);
    box(29*scale,0,35*scale,24*scale,'#243645','#0d1720',3*scale);ctx.fillStyle='#4fc5ff';ctx.fillRect(34*scale,5*scale,25*scale,13*scale);ctx.fillStyle='#0f2636';ctx.fillRect(5*scale,8*scale,16*scale,22*scale);ctx.fillStyle='#65e889';ctx.fillRect(8*scale,12*scale,3*scale,3*scale);txt('PC',46*scale,16*scale,6*scale,'#e5f7ff');ctx.restore();
  }
  function server(x,y,scale=1){
    ctx.save();ctx.translate(x,y);box(0,0,40*scale,72*scale,'#263947','#08131c',4*scale);for(let i=0;i<6;i++){ctx.fillStyle='#152630';ctx.fillRect(5*scale,(6+i*10)*scale,30*scale,7*scale);ctx.fillStyle=i%2?'#4dd9ff':'#6bed83';ctx.fillRect(8*scale,(8+i*10)*scale,3*scale,3*scale);}txt('SERVER',20*scale,79*scale,6*scale,'#a9dff5');ctx.restore();
  }
  function portal(x,y,scale=1,active=true){
    ctx.save();ctx.translate(x,y);box(0,0,56*scale,72*scale,'#202c3b','#071018',5*scale);ctx.strokeStyle=active?'#ff3859':'#65404b';ctx.lineWidth=3*scale;ctx.strokeRect(5*scale,7*scale,46*scale,55*scale);ctx.fillStyle='#10131b';ctx.fillRect(9*scale,11*scale,38*scale,47*scale);txt('OFFLINE',28*scale,22*scale,7*scale,active?'#ff4964':'#90606d');paper(28*scale,40*scale,20*scale,25*scale,0);ctx.globalAlpha=.7;ctx.fillStyle='#ff3b58';for(let i=0;i<3;i++)ctx.fillRect((10+i*11)*scale,(50+i*3)*scale,18*scale,2*scale);ctx.restore();
  }
  function pecEnemy(x,y,w,h){
    ctx.save();ctx.translate(x,y);const s=Math.min(w/54,h/42);ctx.scale(s,s);ctx.fillStyle='#f5f2e8';ctx.strokeStyle='#5b1824';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(2,8);ctx.lineTo(52,8);ctx.lineTo(48,38);ctx.lineTo(6,38);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#d34355';ctx.beginPath();ctx.moveTo(3,9);ctx.lineTo(27,26);ctx.lineTo(51,9);ctx.lineTo(27,20);ctx.closePath();ctx.fill();ctx.fillStyle='#1b1116';ctx.beginPath();ctx.moveTo(12,22);ctx.lineTo(21,25);ctx.lineTo(13,29);ctx.fill();ctx.beginPath();ctx.moveTo(42,22);ctx.lineTo(33,25);ctx.lineTo(41,29);ctx.fill();txt('PEC',27,33,8,'#b6253d');ctx.restore();
  }
  function ntw(x,y,scale=1){ctx.save();ctx.translate(x,y);box(-16*scale,-20*scale,32*scale,40*scale,'#eef5fb','#2f65b8',4*scale);ctx.fillStyle='#2e6dd8';ctx.fillRect(-11*scale,-9*scale,22*scale,13*scale);txt('NTW',0,-2*scale,8*scale,'#fff');ctx.strokeStyle='#7ba7df';ctx.lineWidth=1.5*scale;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-10*scale,(8+i*5)*scale);ctx.lineTo(9*scale,(8+i*5)*scale);ctx.stroke();}ctx.restore();}
  function topSecret(x,y,scale=1){ctx.save();ctx.translate(x,y);box(-18*scale,-17*scale,36*scale,34*scale,'#f0df9d','#7e6225',4*scale);ctx.save();ctx.rotate(-.13);txt('TOP',0,-4*scale,7*scale,'#b82932');txt('SECRET',0,5*scale,6*scale,'#b82932');ctx.restore();ctx.restore();}
  function barrier(x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.fillStyle='#293845';ctx.fillRect(4*scale,7*scale,6*scale,30*scale);ctx.fillRect(48*scale,7*scale,6*scale,30*scale);ctx.fillStyle='#e8e9e7';ctx.fillRect(0,11*scale,58*scale,15*scale);ctx.strokeStyle='#e0474e';ctx.lineWidth=6*scale;for(let i=-8;i<65;i+=18){ctx.beginPath();ctx.moveTo(i*scale,26*scale);ctx.lineTo((i+13)*scale,11*scale);ctx.stroke();}ctx.fillStyle='#ffc74d';ctx.beginPath();ctx.arc(7*scale,6*scale,4*scale,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(51*scale,6*scale,4*scale,0,Math.PI*2);ctx.fill();ctx.restore();}
  function stamp(x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.fillStyle='#8c2632';ctx.strokeStyle='#351017';ctx.lineWidth=2*scale;ctx.beginPath();ctx.arc(18*scale,10*scale,10*scale,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillRect(13*scale,17*scale,10*scale,14*scale);box(3*scale,30*scale,30*scale,8*scale,'#671d27','#351017',2*scale);txt('TIMBRO',18*scale,46*scale,6*scale,'#f1b0b7');ctx.restore();}

  drawHazard=function(h){
    ctx.save();ctx.translate(h.x,h.y);
    if(h.type==='printer'){printer(0,-12,Math.max(.72,Math.min(1,h.w/64)),false);ctx.restore();return;}
    if(h.type==='cone'){barrier(0,-4,Math.max(.72,Math.min(1,h.w/58)));ctx.restore();return;}
    ctx.restore();return oldHazard(h);
  };

  drawCheckpoint=function(cp){ctx.save();ctx.translate(cp.x-30,cp.y-3);coffeeMachine(0,0,.9,true);if(cp.hit){ctx.globalAlpha=.22;ctx.fillStyle='#4df09b';ctx.fillRect(-6,-8,66,78);}ctx.restore();};

  drawEnemy=function(e){
    if(e.type==='pec'){pecEnemy(e.x,e.y,e.w,e.h);return;}
    if(e.type==='portale'){portal(e.x,e.y,Math.max(.55,Math.min(.95,e.h/72)),!!e.active);return;}
    if(e.type==='allegato'){
      ctx.save();ctx.translate(e.x+e.w/2,e.y+e.h/2);ctx.font=`${Math.max(26,e.w*.6)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('📎',0,0);txt('ALLEGATO',0,e.h*.48,6,'#ffe9a8');ctx.restore();return;
    }
    if(e.type==='scaduta'){
      ctx.save();ctx.translate(e.x,e.y);box(0,0,e.w,e.h,'#6b2a24','#2c1210',5);txt('SCADUTA',e.w/2,e.h/2,7,'#ffd0c7');ctx.restore();return;
    }
    oldEnemy(e);
  };

  drawCollect=function(c){
    let y=c.y+Math.sin(performance.now()/300+c.bob)*5;
    if(c.type==='ntw'){ntw(c.x,y,.9);return;}
    if(c.type==='stamp'){ctx.save();ctx.translate(c.x,y);box(-17,-13,34,26,'#f2c34f','#6c4d00',4);txt('€16',0,0,9,'#4f3800');txt('MARCA',0,18,5,'#ffe8a4');ctx.restore();return;}
    if(c.type==='coffee'){ctx.save();ctx.translate(c.x,y);txt('☕',0,0,24,'#fff');txt('TURBO',0,20,5,'#ffd46b');ctx.restore();return;}
    oldCollect(c);
  };

  drawSecret=function(s){topSecret(s.x,s.y,.95);};

  drawPlatform=function(pl){
    const t=pl.v6Type;
    if(!t){oldPlatform(pl);return;}
    ctx.save();
    ctx.fillStyle=(game.lv.theme==='site')?'#6c6049':'#2f4a5f';ctx.fillRect(pl.x,pl.y,pl.w,pl.h);ctx.fillStyle='#8ab0c5';ctx.fillRect(pl.x,pl.y,pl.w,4);
    const x=pl.x+8;
    if(['desk','printerDesk'].includes(t)){workstation(x,pl.y-58,.68);if(t==='printerDesk')printer(x+58,pl.y-47,.55,false);}
    else if(['cabinet','archive','shelf'].includes(t))cabinet(x,pl.y-58,.72,t==='shelf'?'SCAFFALE':'ARCHIVIO');
    else if(t==='server')server(x,pl.y-60,.72);
    else if(t==='folder'||t==='folderStack'){ctx.save();ctx.translate(x,pl.y-36);box(0,8,34,16,'#3768a7','#142338',3);box(6,0,34,16,'#d29c31','#5f4415',3);paper(23,-6,26,14,0);txt('FASCICOLI',25,34,5,'#e8edf0');ctx.restore();}
    else if(t==='counter'){ctx.fillStyle='#91704c';ctx.fillRect(x,pl.y-26,70,8);ctx.fillStyle='#344654';ctx.fillRect(x+6,pl.y-18,7,18);ctx.fillRect(x+56,pl.y-18,7,18);txt('SPORTELLO',x+35,pl.y-36,6,'#f8e6bb');}
    else if(t==='stamp')stamp(x,pl.y-47,.72);
    else if(['scaffold','pallet'].includes(t)){barrier(x,pl.y-38,.75);txt(t==='scaffold'?'PONTEGGIO':'PALLET',x+22,pl.y-49,5,'#ffd577');}
    else if(t==='pipe'||t==='cable'){ctx.strokeStyle=t==='pipe'?'#a57945':'#3a86b9';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x,pl.y-10);ctx.bezierCurveTo(x+18,pl.y-46,x+46,pl.y+6,x+68,pl.y-24);ctx.stroke();txt(t==='pipe'?'TUBO':'CAVO',x+34,pl.y-40,5,'#ffd98a');}
    else if(t==='dashboard'){workstation(x,pl.y-58,.7);txt('DASHBOARD',x+31,pl.y-66,5,'#7debdc');}
    else if(t==='conveyor'){ctx.fillStyle='#222f39';ctx.fillRect(x,pl.y-24,74,18);for(let i=0;i<5;i++){ctx.fillStyle='#607482';ctx.beginPath();ctx.arc(x+9+i*14,pl.y-15,5,0,Math.PI*2);ctx.fill();}paper(x+38,pl.y-34,22,14,0);}
    else if(t==='ntwBlock'){ntw(x+24,pl.y-28,.7);}
    else if(['glitch','portalSlab'].includes(t))portal(x,pl.y-58,.72,true);
    else if(t==='brokenDesk'){ctx.fillStyle='#825d45';ctx.fillRect(x,pl.y-22,64,7);ctx.strokeStyle='#3e2b22';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+8,pl.y-15);ctx.lineTo(x+3,pl.y);ctx.moveTo(x+54,pl.y-15);ctx.lineTo(x+63,pl.y);ctx.stroke();txt('ROTTO',x+31,pl.y-31,5,'#ff9b9b');}
    else oldPlatform(pl);
    ctx.restore();
  };

  drawMoving=function(pl){
    if(pl?.v8Vertical){ctx.save();ctx.fillStyle='#526c80';ctx.fillRect(pl.x,pl.y,pl.w,pl.h);ctx.fillStyle='#9bc9df';ctx.fillRect(pl.x,pl.y,pl.w,4);txt('ASCENSORE',pl.x+pl.w/2,pl.y-8,5,'#bdefff');ctx.restore();return;}
    oldMoving(pl);
  };

  drawWorldDecor=function(theme,cam){
    oldWorldDecor(theme,cam);
    if(!game)return;
    ctx.save();
    if(theme==='office'){
      for(let x=620;x<game.w.w;x+=1450){cabinet(x,game.w.groundY-68,.8,'ARCHIVIO');workstation(x+110,game.w.groundY-60,.72);}
    }
    if(theme==='cons')for(let x=900;x<game.w.w;x+=1550)server(x,game.w.groundY-72,.85);
    if(theme==='permits')for(let x=1100;x<game.w.w;x+=1700)stamp(x,game.w.groundY-47,.78);
    if(theme==='site')for(let x=1250;x<game.w.w;x+=1800)barrier(x,game.w.groundY-36,.9);
    ctx.restore();
  };

  document.title='Back Office Adventure DX v11.2';
  const logo=document.querySelector('.header .logo span');if(logo)logo.textContent='ADVENTURE DX v11.2';
  const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Visual clarity pass: stampanti, checkpoint, portali, PEC, archivi, server e oggetti ambientali ridisegnati per essere leggibili subito anche su smartphone.';
})();
