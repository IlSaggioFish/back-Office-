/* BACK OFFICE ADVENTURE DX v15 - CINEMATIC GRAPHICS */
'use strict';

(function(){
  const THEMES={
    office:{top:'#123e60',bottom:'#06131f',far:'#214963',mid:'#123247',near:'#0a2232',edge:'#67dcff',glow:'#74e4ff'},
    permits:{top:'#302d62',bottom:'#0a1024',far:'#514b82',mid:'#272951',near:'#171a38',edge:'#c3a6ff',glow:'#c6adff'},
    site:{top:'#765737',bottom:'#14212a',far:'#9b7040',mid:'#4c493b',near:'#273139',edge:'#ffd069',glow:'#ffd56e'},
    cons:{top:'#12545b',bottom:'#061d27',far:'#22717a',mid:'#123f49',near:'#092a33',edge:'#6df0dc',glow:'#73ffe7'},
    final:{top:'#541733',bottom:'#120712',far:'#7c2548',mid:'#39132a',near:'#210b1c',edge:'#ff5d7b',glow:'#ff4569'}
  };
  const theme=()=>THEMES[game?.lv?.theme]||THEMES.office;
  const now=()=>performance.now();
  const label=(text,x,y,size=8,color='#fff',align='center')=>{ctx.save();ctx.fillStyle=color;ctx.font=`900 ${size}px ui-monospace,Consolas,monospace`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(text,x,y);ctx.restore();};
  const box=(x,y,w,h,r,fill,stroke,lw=1)=>{ctx.save();ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=lw;rr(x,y,w,h,r,1,1);ctx.restore();};

  function windowRow(x,y,w,h,p,t){
    ctx.save();ctx.fillStyle='#06121bc4';ctx.fillRect(x,y,w,h);ctx.strokeStyle=p.edge+'45';ctx.lineWidth=1;ctx.strokeRect(x,y,w,h);
    const pulse=.35+.25*Math.sin(t/650+x*.02);
    for(let wy=y+13;wy<y+h-5;wy+=21){
      for(let wx=x+12;wx<x+w-7;wx+=23){ctx.globalAlpha=pulse*((wx+wy)%3?1:.45);ctx.fillStyle=p.glow;ctx.fillRect(wx,wy,7,6);}
    }ctx.restore();
  }

  drawParallax=function(cam,col,themeName){
    const p=THEMES[themeName]||THEMES.office,t=now();ctx.save();
    const sky=ctx.createLinearGradient(0,0,0,540);sky.addColorStop(0,p.top);sky.addColorStop(.68,p.bottom);sky.addColorStop(1,'#03090e');ctx.fillStyle=sky;ctx.fillRect(0,0,960,540);

    const halo=ctx.createRadialGradient(themeName==='site'?790:475,themeName==='site'?85:165,10,480,210,520);halo.addColorStop(0,p.glow+'2f');halo.addColorStop(.5,p.glow+'0b');halo.addColorStop(1,'#0000');ctx.fillStyle=halo;ctx.fillRect(0,0,960,470);

    ctx.globalAlpha=.24;ctx.fillStyle=p.far;
    for(let i=-2;i<13;i++){const x=((i*128-cam*.035)%1664)-120,h=95+((i*31)%5+5)%5*24;ctx.fillRect(x,330-h,94,h);windowRow(x+6,342-h,82,h-22,p,t);}

    ctx.globalAlpha=.42;ctx.fillStyle=p.mid;
    for(let i=-2;i<10;i++){const x=((i*210-cam*.095)%2100)-190,h=100+((i*47)%4+4)%4*34;ctx.fillRect(x,382-h,150,h);ctx.fillStyle='#050d14a8';ctx.fillRect(x+15,397-h,120,h-30);ctx.fillStyle=p.mid;}

    ctx.globalAlpha=.34;ctx.strokeStyle=p.edge;ctx.lineWidth=2;
    if(themeName==='office'){
      for(let x=((-(cam*.19))%220)-70;x<1040;x+=220){ctx.strokeRect(x,92,178,294);ctx.fillStyle='#d9f7ff0a';ctx.fillRect(x+5,97,168,284);ctx.strokeStyle='#7fddff20';for(let y=140;y<370;y+=58){ctx.beginPath();ctx.moveTo(x+5,y);ctx.lineTo(x+173,y);ctx.stroke();}}
    }else if(themeName==='permits'){
      for(let x=((-(cam*.17))%260)-70;x<1040;x+=260){ctx.fillStyle='#151833c7';ctx.fillRect(x,122,194,282);ctx.strokeStyle=p.edge+'45';for(let y=140;y<386;y+=38)ctx.strokeRect(x+15,y,164,28);}
      for(let i=0;i<9;i++){const x=((i*145-cam*.25)%1310)-100,y=90+(i%5)*55;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t/900+i)*.04);ctx.fillStyle='#e8e5ff18';ctx.fillRect(0,0,50,34);ctx.restore();}
    }else if(themeName==='site'){
      ctx.globalAlpha=.23;ctx.fillStyle='#ffd56d';ctx.beginPath();ctx.arc(800,80,58,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#d1a14e77';ctx.lineWidth=5;for(let i=0;i<4;i++){const x=((i*440-cam*.1)%1760)-170;ctx.beginPath();ctx.moveTo(x,395);ctx.lineTo(x,130);ctx.lineTo(x+250,130);ctx.stroke();ctx.beginPath();ctx.moveTo(x+58,130);ctx.lineTo(x+58,65);ctx.stroke();}
    }else if(themeName==='cons'){
      ctx.strokeStyle=p.edge+'3d';ctx.lineWidth=1;for(let x=(-cam*.12)%64;x<960;x+=64){ctx.beginPath();ctx.moveTo(x,78);ctx.lineTo(x,405);ctx.stroke();}for(let y=92;y<405;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
      for(let i=0;i<8;i++){const x=((i*185-cam*.18)%1480)-100,h=88+(i%4)*28;ctx.fillStyle='#061f29d8';ctx.fillRect(x,390-h,82,h);for(let q=0;q<6;q++){ctx.fillStyle=q%2?p.edge:'#70a8ff';ctx.fillRect(x+12,390-h+14+q*12,5,3);}}
    }else{
      ctx.strokeStyle=p.edge+'52';ctx.lineWidth=3;for(let i=0;i<10;i++){const x=((i*150-cam*.13)%1500)-120;ctx.beginPath();ctx.moveTo(x,65);ctx.lineTo(x+16,145);ctx.lineTo(x-8,225);ctx.lineTo(x+22,330);ctx.stroke();}
      ctx.globalAlpha=.09+.045*Math.sin(t/120);ctx.fillStyle='#ff244f';ctx.fillRect(0,0,960,440);
    }

    const haze=ctx.createLinearGradient(0,300,0,510);haze.addColorStop(0,'#07111a00');haze.addColorStop(1,'#02070db8');ctx.globalAlpha=1;ctx.fillStyle=haze;ctx.fillRect(0,300,960,220);
    ctx.restore();
  };

  const oldWorld=drawWorldDecor;
  drawWorldDecor=function(themeName,cam){
    oldWorld(themeName,cam);if(!game)return;const p=THEMES[themeName]||THEMES.office,t=now(),from=Math.floor((game.camera-300)/720)*720,to=game.camera+1350;
    ctx.save();
    for(let x=from;x<to;x+=720){
      if(themeName==='office'){
        box(x+82,372,172,76,5,'#102431','#365a70',2);ctx.fillStyle='#061019';ctx.fillRect(x+98,390,60,38);ctx.fillRect(x+171,390,60,38);
        ctx.fillStyle=p.glow;ctx.globalAlpha=.45+.25*Math.sin(t/420+x);ctx.fillRect(x+104,395,48,3);ctx.fillRect(x+177,395,48,3);ctx.globalAlpha=1;
        ctx.strokeStyle='#314d5e';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+115,448);ctx.lineTo(x+106,468);ctx.moveTo(x+221,448);ctx.lineTo(x+230,468);ctx.stroke();
      }else if(themeName==='permits'){
        box(x+85,205,205,260,4,'#171a36','#796bb2',2);label('ARCHIVIO',x+187,191,8,p.glow);
        for(let y=222;y<445;y+=39){ctx.fillStyle='#24264a';ctx.fillRect(x+100,y,175,28);ctx.fillStyle='#d9d2ff44';for(let q=0;q<7;q++)ctx.fillRect(x+108+q*23,y+7,15,12);}
      }else if(themeName==='site'){
        ctx.strokeStyle='#bb8c43';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x+125,463);ctx.lineTo(x+125,248);ctx.lineTo(x+360,248);ctx.stroke();ctx.fillStyle='#d59a36';ctx.fillRect(x+310,360,128,10);
        ctx.fillStyle='#efbd52';for(let i=0;i<7;i++){ctx.save();ctx.translate(x+95+i*43,445);ctx.rotate(i%2?.2:-.2);ctx.fillRect(-17,-4,34,8);ctx.restore();}
      }else if(themeName==='cons'){
        box(x+90,215,248,132,8,'#071f29','#3ccfc2',2);label('CONTROL ROOM',x+214,232,8,'#a4fff2');
        for(let i=0;i<7;i++){const h=18+(i%4)*16;ctx.fillStyle=i%2?p.edge:'#6caaff';ctx.globalAlpha=.44+.35*Math.sin(t/350+i);ctx.fillRect(x+112+i*29,324-h,18,h);}ctx.globalAlpha=1;
      }else{
        ctx.fillStyle='#2d0c1e';ctx.strokeStyle=p.edge+'77';ctx.lineWidth=2;ctx.fillRect(x+80,170,220,290);ctx.strokeRect(x+80,170,220,290);label('PRIORITÀ MASSIMA',x+190,195,8,'#ffb0bd');
        ctx.strokeStyle='#ff456955';ctx.lineWidth=4;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x+102+i*52,220);ctx.lineTo(x+127+i*52,430);ctx.stroke();}
      }
    }
    ctx.restore();
  };

  const oldPlatform=drawPlatform;
  drawPlatform=function(pl){
    oldPlatform(pl);if(!pl||!game)return;const p=theme(),kind=game.lv.theme;ctx.save();
    ctx.fillStyle=p.edge;ctx.globalAlpha=.8;ctx.fillRect(pl.x,pl.y,pl.w,3);ctx.globalAlpha=1;
    if(kind==='office'){
      ctx.fillStyle='#765b40';ctx.fillRect(pl.x,pl.y+3,pl.w,6);ctx.fillStyle='#172a37';for(let x=pl.x+10;x<pl.x+pl.w-8;x+=48)ctx.fillRect(x,pl.y+10,31,Math.max(4,pl.h-12));
    }else if(kind==='permits'){
      ctx.fillStyle='#252747';for(let x=pl.x+5;x<pl.x+pl.w-5;x+=25){ctx.fillRect(x,pl.y+5,18,pl.h-7);ctx.fillStyle='#d8d0ff50';ctx.fillRect(x+3,pl.y+8,12,2);ctx.fillStyle='#252747';}
    }else if(kind==='site'){
      ctx.fillStyle='#222a30';ctx.fillRect(pl.x,pl.y+4,pl.w,pl.h-4);ctx.strokeStyle='#f0b640';ctx.lineWidth=4;for(let x=pl.x-10;x<pl.x+pl.w;x+=28){ctx.beginPath();ctx.moveTo(x,pl.y+pl.h);ctx.lineTo(x+22,pl.y+3);ctx.stroke();}
    }else if(kind==='cons'){
      ctx.fillStyle='#0a2931';ctx.fillRect(pl.x,pl.y+4,pl.w,pl.h-4);ctx.fillStyle=p.edge;for(let x=pl.x+9;x<pl.x+pl.w-5;x+=32)ctx.fillRect(x,pl.y+8,4,4);
    }else{
      ctx.fillStyle='#2a101f';ctx.fillRect(pl.x,pl.y+4,pl.w,pl.h-4);ctx.strokeStyle=p.edge+'aa';for(let x=pl.x+5;x<pl.x+pl.w;x+=35){ctx.beginPath();ctx.moveTo(x,pl.y+5);ctx.lineTo(x+15,pl.y+pl.h-2);ctx.stroke();}
    }ctx.restore();
  };

  const oldMoving=drawMoving;
  drawMoving=function(pl){oldMoving(pl);if(!pl||!game)return;const p=theme(),t=now();ctx.save();ctx.strokeStyle=p.glow;ctx.globalAlpha=.45+.25*Math.sin(t/120);ctx.lineWidth=2;ctx.strokeRect(pl.x+2,pl.y+2,pl.w-4,pl.h-4);ctx.globalAlpha=1;for(let x=pl.x+10;x<pl.x+pl.w-7;x+=25){ctx.fillStyle=p.edge;ctx.fillRect(x,pl.y+7,4,4);}ctx.restore();};

  function initFx(){if(game&&!game.v15Fx)game.v15Fx=[];}
  function burst(x,y,color,count=9){initFx();if(!game)return;for(let i=0;i<count;i++){const a=Math.PI+(Math.random()*Math.PI),s=35+Math.random()*95;game.v15Fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.35-25,life:420+Math.random()*260,max:680,size:2+Math.random()*4,color});}}
  const oldUpdate=update;
  update=function(dt,t){
    const was=game?.p?.onGround,vy=game?.p?.vy||0,x=game?.p?.x||0,y=game?.p?.y||0;oldUpdate(dt,t);if(!game)return;initFx();
    if(!was&&game.p.onGround&&vy>360)burst(game.p.x+game.p.w/2,game.p.y+game.p.h-2,theme().edge,Math.min(14,6+Math.floor(vy/140)));
    for(const q of game.v15Fx){q.life-=dt;q.x+=q.vx*dt/1000;q.y+=q.vy*dt/1000;q.vy+=150*dt/1000;}
    game.v15Fx=game.v15Fx.filter(q=>q.life>0);
  };

  function drawFx(){if(!game?.v15Fx?.length)return;ctx.save();ctx.translate(-game.camera,0);for(const q of game.v15Fx){ctx.globalAlpha=Math.max(0,q.life/q.max)*.65;ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,q.size,0,Math.PI*2);ctx.fill();}ctx.restore();}
  function foreground(){
    if(!game)return;const p=theme(),t=now();ctx.save();
    const beam=ctx.createLinearGradient(0,0,0,330);beam.addColorStop(0,p.glow+'18');beam.addColorStop(1,p.glow+'00');ctx.fillStyle=beam;
    for(let i=0;i<4;i++){const x=((i*290-game.camera*.31)%1160)-80+Math.sin(t/1400+i)*12;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+85,0);ctx.lineTo(x+170,360);ctx.lineTo(x+35,360);ctx.closePath();ctx.fill();}
    ctx.globalAlpha=.18;ctx.fillStyle=p.glow;for(let i=0;i<18;i++){const x=(i*173+game.camera*.06)%980,y=(i*89+t*.012*(1+i%3))%470;ctx.fillRect(x,y,1+(i%2),1+(i%2));}
    const vignette=ctx.createRadialGradient(480,250,170,480,250,590);vignette.addColorStop(0,'#0000');vignette.addColorStop(.68,'#0000');vignette.addColorStop(1,'#000000aa');ctx.globalAlpha=1;ctx.fillStyle=vignette;ctx.fillRect(0,0,960,540);
    ctx.globalAlpha=.035;ctx.fillStyle='#dff7ff';for(let y=2;y<540;y+=4)ctx.fillRect(0,y,960,1);ctx.restore();
  }
  const oldDraw=draw;
  draw=function(){oldDraw();if(!game)return;drawFx();};

  const oldBegin=beginCutscene;
  beginCutscene=function(){oldBegin();document.body.classList.add('bossIncoming');if(game){const title=$('#cutTitle');if(title)title.textContent=(game.lv.boss==='Doppio'?'SCONTRO FINALE':game.lv.boss||'BOSS')+' • IN ARRIVO';}};
  $('#cutGo')?.addEventListener('click',()=>document.body.classList.remove('bossIncoming'));

  const hudIcons=['◆','♥','€','×','⬡','▣','◷',''];
  function enhanceHud(){
    document.querySelectorAll('.hud .hb').forEach((box,i)=>{if(box.querySelector('.v15HudIcon'))return;const s=document.createElement('span');s.className='v15HudIcon';s.textContent=hudIcons[i]||'●';box.prepend(s);if(i===1)box.classList.add('v15LifeBox');});
    const hero=$('#charhud')?.closest('.hb');if(hero&&!hero.querySelector('.v15HudPortrait')){hero.classList.add('v15HeroBox');const im=document.createElement('img');im.className='v15HudPortrait';im.alt='';hero.prepend(im);}
  }
  const oldHud=updateHUD;
  updateHUD=function(){oldHud();enhanceHud();if(!game)return;const portrait=document.querySelector('.v15HudPortrait');if(portrait&&FACE_DATA?.[game.ch.n]&&portrait.src!==FACE_DATA[game.ch.n])portrait.src=FACE_DATA[game.ch.n];const left=Math.max(0,(game.abilityReady-now())/1000),pct=Math.max(0,Math.min(100,100-(left/(game.ch.cd||1))*100));document.querySelector('#ability')?.style.setProperty('--ability-charge',pct+'%');};
  enhanceHud();

  document.body.classList.add('v15Graphics');
  document.title='Back Office Adventure DX v15';
  const logo=document.querySelector('.header .logo span');if(logo)logo.textContent='ADVENTURE DX v15';
  const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Cinematic Graphics: scenari più profondi, illuminazione dinamica, superfici tematiche, impatti e HUD completamente rifiniti.';
  const credits=document.querySelector('#credits h2');if(credits)credits.textContent='BACK OFFICE ADVENTURE DX v15';
})();
