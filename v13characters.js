/* BACK OFFICE ADVENTURE DX v13 - CHARACTER GRAPHICS OVERHAUL */
'use strict';

(function(){
  const v13Now=()=>performance.now();

  const LOOKS={
    Eugenio:{shirt:'#f4f7f8',jacket:'#24394a',pants:'#1d2b36',accent:'#56caff',skin:'#d39a78',shoe:'#101820',style:'tie'},
    Farris:{shirt:'#eef5f1',jacket:'#29483f',pants:'#21342f',accent:'#79dba2',skin:'#d39a78',shoe:'#111a19',style:'lanyard'},
    Yurii:{shirt:'#f7f3e8',jacket:'#574626',pants:'#332b20',accent:'#ffca67',skin:'#d39a78',shoe:'#15130f',style:'zip'},
    Luca:{shirt:'#f3f0fa',jacket:'#443761',pants:'#28243a',accent:'#c1a1ff',skin:'#d39a78',shoe:'#14121c',style:'hood'},
    Tiziano:{shirt:'#f1f3f4',jacket:'#465665',pants:'#26323c',accent:'#ff9a82',skin:'#d39a78',shoe:'#111922',style:'tie'},
    Daniele:{shirt:'#f3f4ec',jacket:'#c7a633',pants:'#28333b',accent:'#79e0e8',skin:'#d39a78',shoe:'#12191e',style:'safety'},
    Dalila:{shirt:'#f8f2f6',jacket:'#6b405b',pants:'#302934',accent:'#ff9bc4',skin:'#d39a78',shoe:'#17131a',style:'lapel'},
    Giada:{shirt:'#fbf3e8',jacket:'#705837',pants:'#342e27',accent:'#f5bd6d',skin:'#d39a78',shoe:'#17140f',style:'lapel'},
    Michele:{shirt:'#f4f1e9',jacket:'#202833',pants:'#171e27',accent:'#ffd34d',skin:'#d39a78',shoe:'#0c1117',style:'boss'}
  };

  function look(ch){
    return LOOKS[ch?.n]||{shirt:'#f4f6f7',jacket:'#31404b',pants:'#25323b',accent:ch?.color||'#65dfff',skin:'#d39a78',shoe:'#111820',style:'tie'};
  }

  function line(x1,y1,x2,y2,color,w,cap='round'){
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap=cap;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
  }

  function v13Portrait(im,cx,cy,r,border,tilt=0){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt);
    ctx.shadowColor='#000b';ctx.shadowBlur=8;ctx.fillStyle='#07121a';ctx.beginPath();ctx.arc(0,0,r+4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.clip();
    if(im&&im.complete&&im.naturalWidth){
      const iw=im.naturalWidth,ih=im.naturalHeight;
      const side=Math.min(iw,ih)*.76;
      const sx=(iw-side)/2;
      const sy=Math.max(0,Math.min(ih-side,(ih-side)*.20));
      ctx.imageSmoothingEnabled=true;
      ctx.drawImage(im,sx,sy,side,side,-r,-r,r*2,r*2);
    }else{
      ctx.fillStyle='#6d7d88';ctx.fillRect(-r,-r,r*2,r*2);
    }
    const light=ctx.createLinearGradient(-r,-r,r,r);
    light.addColorStop(0,'#ffffff24');light.addColorStop(.5,'#ffffff00');light.addColorStop(1,'#00000024');
    ctx.fillStyle=light;ctx.fillRect(-r,-r,r*2,r*2);
    ctx.restore();

    ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt);
    ctx.strokeStyle='#07111a';ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,0,r+1.7,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle=border;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,r+.8,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=.55;ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(-2,-2,r-2,Math.PI*1.08,Math.PI*1.68);ctx.stroke();
    ctx.restore();
  }

  function torsoPath(w=18,h=31){
    ctx.beginPath();ctx.moveTo(-w+2,-9);ctx.quadraticCurveTo(-w-4,5,-w+1,h-2);ctx.quadraticCurveTo(0,h+3,w-1,h-2);ctx.quadraticCurveTo(w+4,5,w-2,-9);ctx.quadraticCurveTo(0,-14,-w+2,-9);ctx.closePath();
  }

  function drawJacket(o){
    if(!o.jacket)return;
    ctx.save();ctx.fillStyle=o.jacket;ctx.strokeStyle='#0b151e';ctx.lineWidth=1.7;
    ctx.beginPath();ctx.moveTo(-17,-7);ctx.lineTo(-4,-2);ctx.lineTo(-1,24);ctx.lineTo(-14,24);ctx.quadraticCurveTo(-20,7,-17,-7);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(17,-7);ctx.lineTo(4,-2);ctx.lineTo(1,24);ctx.lineTo(14,24);ctx.quadraticCurveTo(20,7,17,-7);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.globalAlpha=.28;ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-15,-5);ctx.lineTo(-6,0);ctx.lineTo(-5,11);ctx.lineTo(-12,7);ctx.closePath();ctx.fill();ctx.restore();
  }

  function drawRoleDetail(ch,o){
    ctx.save();
    if(o.style==='tie'||o.style==='boss'){
      ctx.fillStyle=o.accent;ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(5,4);ctx.lineTo(1,20);ctx.lineTo(-4,4);ctx.closePath();ctx.fill();
    }
    if(o.style==='lanyard'){
      ctx.strokeStyle=o.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-6,-3);ctx.lineTo(0,11);ctx.lineTo(6,-3);ctx.stroke();ctx.fillStyle='#e7f7ef';ctx.fillRect(-5,9,10,8);
    }
    if(o.style==='zip'){
      ctx.strokeStyle=o.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(0,22);ctx.stroke();ctx.fillStyle=o.accent;ctx.fillRect(-2,4,4,4);
    }
    if(o.style==='hood'){
      ctx.strokeStyle=o.accent;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-5,12,0.15*Math.PI,.85*Math.PI,true);ctx.stroke();
    }
    if(o.style==='safety'){
      ctx.globalAlpha=.72;ctx.fillStyle='#f5dd60';ctx.fillRect(-14,5,28,4);ctx.fillRect(-14,15,28,4);ctx.globalAlpha=1;ctx.fillStyle='#30383e';ctx.fillRect(-4,-6,8,30);
    }
    if(o.style==='lapel'){
      ctx.strokeStyle=o.accent;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-13,-5);ctx.lineTo(-4,5);ctx.lineTo(-1,21);ctx.moveTo(13,-5);ctx.lineTo(4,5);ctx.lineTo(1,21);ctx.stroke();
    }
    if(o.style==='boss'){
      ctx.fillStyle=o.accent;ctx.fillRect(-16,-7,7,4);ctx.fillRect(9,-7,7,4);ctx.strokeStyle=o.accent;ctx.globalAlpha=.45;ctx.strokeRect(-18,-10,36,36);ctx.globalAlpha=1;
    }
    ctx.restore();
  }

  drawPlayer=function(p,ch){
    if(!p||!ch)return;
    const t=v13Now(),cx=p.x+p.w/2,o=look(ch),run=p.onGround&&Math.abs(p.vx)>55,air=!p.onGround,dash=(game?.v7DashUntil||0)>t,hurt=p.hurt>0;
    const phase=run?Math.sin((p.anim||0)*15.5):0;
    const breathe=!run&&!air?Math.sin(t/260)*1.15:0;
    const bob=run?Math.abs(Math.sin((p.anim||0)*15.5))*2.2:breathe;
    const facing=p.facing||1;
    const lean=air?(p.vy<0?-0.09:0.09):Math.max(-0.07,Math.min(0.07,p.vx/3600));
    const legSwing=run?phase*12:0;
    const armSwing=run?phase*10:0;
    const jumpUp=air&&p.vy<0;
    const bodyY=p.y+35+bob;

    ctx.save();
    if(p.inv>0&&Math.floor(p.inv/80)%2===0)ctx.globalAlpha=.48;

    ctx.save();ctx.globalAlpha*=air?.13:.28;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(cx,p.y+p.h+5,air?18:27,air?3.5:6,0,0,Math.PI*2);ctx.fill();ctx.restore();

    if(dash){
      for(let i=4;i>=1;i--){ctx.save();ctx.globalAlpha=.07*i;ctx.translate(-facing*i*15,0);ctx.fillStyle=o.accent;ctx.beginPath();ctx.roundRect(cx-14,p.y+24,28,34,8);ctx.fill();ctx.restore();}
      ctx.save();ctx.globalAlpha=.42;ctx.strokeStyle=o.accent;ctx.lineWidth=3;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(cx-facing*(28+i*16),p.y+30+i*6);ctx.lineTo(cx-facing*(8+i*7),p.y+30+i*6);ctx.stroke();}ctx.restore();
    }

    ctx.save();ctx.translate(cx,bodyY);ctx.rotate(lean);

    // gambe con pose distinte per corsa e salto
    let l1x=-10-legSwing,l2x=10+legSwing,l1y=43,l2y=43;
    if(air){
      if(jumpUp){l1x=-17;l2x=15;l1y=35;l2y=31;}else{l1x=-13;l2x=18;l1y=45;l2y=39;}
    }
    line(-6,18,l1x,l1y,o.pants,10);
    line(6,18,l2x,l2y,o.pants,10);
    line(l1x-7,l1y+1,l1x+6,l1y+1,o.shoe,5,'round');
    line(l2x-6,l2y+1,l2x+8,l2y+1,o.shoe,5,'round');

    // torso più pieno e leggibile
    ctx.save();ctx.fillStyle=o.shirt;ctx.strokeStyle='#09141d';ctx.lineWidth=3;torsoPath(18,29);ctx.fill();ctx.stroke();ctx.restore();
    drawJacket(o);drawRoleDetail(ch,o);

    // braccia: corsa alternata, salto aperto, danno più contratto
    let lax=-25-armSwing,rax=25+armSwing,lay=16,ray=16;
    if(air){lax=-24;rax=24;lay=jumpUp?5:14;ray=jumpUp?5:14;}
    if(hurt){lax=-18;rax=18;lay=-1;ray=-1;}
    const sleeve=o.jacket||o.shirt;
    line(-14,0,lax,lay,sleeve,9);
    line(14,0,rax,ray,sleeve,9);
    ctx.fillStyle=o.skin;ctx.beginPath();ctx.arc(lax,lay,4.6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(rax,ray,4.6,0,Math.PI*2);ctx.fill();

    // piccolo bordo luce dalla parte del movimento
    ctx.globalAlpha=.33;ctx.strokeStyle=o.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(facing*17,-3);ctx.lineTo(facing*15,19);ctx.stroke();ctx.globalAlpha=1;
    ctx.restore();

    const headX=cx+facing*(run?phase*1.1:0);
    const headY=p.y+18+bob*.55+(air?(jumpUp?-1:1):0);
    v13Portrait(imgs?.[ch.n],headX,headY,25.8,o.accent,lean*.28);

    // colletto per fondere meglio foto e corpo
    ctx.save();ctx.strokeStyle=o.shirt;ctx.lineWidth=4;ctx.beginPath();ctx.arc(headX,headY+24,8,.15*Math.PI,.85*Math.PI);ctx.stroke();ctx.restore();

    if(hurt){ctx.save();ctx.globalAlpha=.68;ctx.strokeStyle='#ff536d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,p.y+34,40+Math.sin(t/55)*2,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ff536d22';ctx.beginPath();ctx.arc(cx,p.y+34,35,0,Math.PI*2);ctx.fill();ctx.restore();}
    if(game?.shield>0||game?.activeUntil>t){ctx.save();ctx.globalAlpha=.68;ctx.strokeStyle='#6cefff';ctx.lineWidth=3;ctx.setLineDash([7,4]);ctx.beginPath();ctx.arc(cx,p.y+p.h/2,41+Math.sin(t/100)*2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.16;ctx.fillStyle='#6cefff';ctx.beginPath();ctx.arc(cx,p.y+p.h/2,38,0,Math.PI*2);ctx.fill();ctx.restore();}
    if((game?.v121AbilityUntil||0)>t){const colors={JOLLY:'#66dfff',DATA:'#6ef0bb',DASH:'#67e7ff',UP:'#bba4ff',SCUDO:'#75ecff',SAFE:'#7ff1c2',PERM:'#ff9fd0',SUPPORT:'#ffd57c',OP:'#ffd64f'},col=colors[game.v121AbilityKind]||o.accent;ctx.save();ctx.globalAlpha=.74;ctx.strokeStyle=col;ctx.lineWidth=3;for(let r=45;r<=63;r+=9){ctx.beginPath();ctx.arc(cx,p.y+33,r+Math.sin(t/68+r)*2.5,0,Math.PI*2);ctx.stroke();}ctx.restore();}
    if(run&&!air){ctx.save();ctx.globalAlpha=.35;ctx.fillStyle='#d8e8ef';for(let i=0;i<3;i++){const dx=-facing*(20+i*10);ctx.fillRect(cx+dx,p.y+p.h-2-(i%2)*3,5+i,2);}ctx.restore();}
    ctx.restore();
  };

  // Roster: stessi volti, ma presentati come veri character card e non come elenco HR.
  const oldRenderMenu=renderMenu;
  renderMenu=function(){
    oldRenderMenu();
    const cards=[...document.querySelectorAll('#roster .person')];
    cards.forEach((card,i)=>{
      const ch=CH[i];if(!ch)return;
      card.classList.add('v13Person');card.style.setProperty('--char-accent',ch.color||'#65dfff');
      const avatar=card.querySelector('.avatar');
      if(avatar&&!avatar.parentElement?.classList.contains('v13AvatarWrap')){
        const wrap=document.createElement('span');wrap.className='v13AvatarWrap';avatar.parentNode.insertBefore(wrap,avatar);wrap.appendChild(avatar);
        const body=document.createElement('span');body.className='v13MiniBody';wrap.appendChild(body);
      }
      const name=card.querySelector('.pn');if(name&&!name.querySelector('.v13Class')){const tag=document.createElement('span');tag.className='v13Class';tag.textContent=ch.op?'OP':'PLAY';name.appendChild(tag);}
    });
  };

  const style=document.createElement('style');style.id='v13CharacterStyles';style.textContent=`
    body.v13Characters #roster{gap:12px}
    body.v13Characters #roster .person.v13Person{position:relative;overflow:hidden;border:1px solid color-mix(in srgb,var(--char-accent) 42%,#294356);background:linear-gradient(115deg,color-mix(in srgb,var(--char-accent) 11%,#0d1b27),#0b1721 58%);box-shadow:inset 0 1px #ffffff0c,0 8px 20px #0002;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
    body.v13Characters #roster .person.v13Person:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--char-accent);box-shadow:0 0 14px var(--char-accent)}
    body.v13Characters #roster .person.v13Person:hover{transform:translateY(-2px);border-color:var(--char-accent);box-shadow:0 10px 24px #0005,0 0 0 1px color-mix(in srgb,var(--char-accent) 28%,transparent)}
    body.v13Characters #roster .person.v13Person.selected{border-color:var(--char-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--char-accent) 52%,transparent),0 12px 25px #0006}
    .v13AvatarWrap{position:relative;display:block;flex:0 0 72px;width:72px;height:82px;align-self:center}
    .v13AvatarWrap .avatar{position:absolute;z-index:3;left:15px;top:2px;width:44px!important;height:44px!important;border-radius:50%!important;object-fit:cover;border:3px solid var(--char-accent)!important;box-shadow:0 0 0 4px #07121b,0 5px 11px #0007}
    .v13MiniBody{position:absolute;z-index:1;left:18px;top:42px;width:38px;height:34px;border-radius:11px 11px 7px 7px;background:linear-gradient(90deg,#253442 0 25%,#eef3f5 25% 75%,#253442 75%);border:3px solid #07121b;box-shadow:inset 0 5px color-mix(in srgb,var(--char-accent) 30%,transparent)}
    .v13MiniBody:after{content:'';position:absolute;left:15px;top:3px;width:6px;height:23px;background:var(--char-accent);clip-path:polygon(50% 0,100% 20%,65% 100%,35% 100%,0 20%)}
    .v13Class{display:inline-block;margin-left:7px;padding:2px 5px;border-radius:5px;background:color-mix(in srgb,var(--char-accent) 18%,#102330);color:var(--char-accent);border:1px solid color-mix(in srgb,var(--char-accent) 46%,#19303f);font-size:7px;letter-spacing:.08em;vertical-align:2px}
    body.v13Characters #roster .pn{font-size:15px;letter-spacing:.01em}
    body.v13Characters #roster .pr{color:#d3e1e9}
    @media(max-width:700px){.v13AvatarWrap{flex-basis:62px;width:62px;height:74px}.v13AvatarWrap .avatar{left:10px}.v13MiniBody{left:13px}}
  `;document.head.appendChild(style);

  document.body.classList.add('v13Characters');
  document.title='Back Office Adventure DX v13';
  const logo=document.querySelector('.header .logo span');if(logo)logo.textContent='ADVENTURE DX v13';
  const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Character Overhaul: animazioni più fluide, corpi più naturali, outfit distinti e character card ridisegnate.';
  try{renderMenu();}catch(e){console.warn('v13 roster refresh',e);}
})();
