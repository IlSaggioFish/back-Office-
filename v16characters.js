/* BACK OFFICE ADVENTURE DX v16 - CHARACTER OVERHAUL */
'use strict';

(function(){
  const LOOK={
    Eugenio:{accent:'#56caff',shirt:'#f3f7f8',jacket:'#20394b',pants:'#1b2b37',shoe:'#0d161d',skin:'#d39a78',build:1,style:'tie',icon:'◆'},
    Farris:{accent:'#79dba2',shirt:'#edf7f1',jacket:'#294b40',pants:'#20362f',shoe:'#101a16',skin:'#d39a78',build:.96,style:'badge',icon:'▦'},
    Yurii:{accent:'#ffca67',shirt:'#f7f2e5',jacket:'#5a4728',pants:'#362d20',shoe:'#16130e',skin:'#d39a78',build:.93,style:'zip',icon:'➤'},
    Luca:{accent:'#c1a1ff',shirt:'#f2eefb',jacket:'#47386a',pants:'#29243c',shoe:'#13111c',skin:'#d39a78',build:1.02,style:'hood',icon:'↑'},
    Tiziano:{accent:'#ff9a82',shirt:'#f1f3f4',jacket:'#455868',pants:'#26333d',shoe:'#101820',skin:'#d39a78',build:1.01,style:'lead',icon:'★'},
    Daniele:{accent:'#79e0e8',shirt:'#f2f4ed',jacket:'#bfa02d',pants:'#29363e',shoe:'#11191e',skin:'#d39a78',build:1.04,style:'safe',icon:'✚'},
    Dalila:{accent:'#ff9bc4',shirt:'#faf3f7',jacket:'#70435f',pants:'#312a36',shoe:'#171219',skin:'#d39a78',build:.91,style:'perm',icon:'✓'},
    Giada:{accent:'#f5bd6d',shirt:'#fbf4e9',jacket:'#755936',pants:'#352e26',shoe:'#17140e',skin:'#d39a78',build:.92,style:'support',icon:'✦'},
    Michele:{accent:'#ffd34d',shirt:'#f4f1e9',jacket:'#202a35',pants:'#161e27',shoe:'#0a1015',skin:'#d39a78',build:1.08,style:'op',icon:'♛'}
  };
  const cfg=ch=>LOOK[ch?.n]||{accent:ch?.color||'#66dfff',shirt:'#f4f6f7',jacket:'#31424e',pants:'#26333c',shoe:'#101820',skin:'#d39a78',build:1,style:'tie',icon:'◆'};
  const oldPlayer=drawPlayer;

  function line(points,color,width,outline=3){
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    ctx.strokeStyle='#071119';ctx.lineWidth=width+outline;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.stroke();
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.stroke();ctx.restore();
  }
  function circle(x,y,r,fill,stroke='#071119',lw=2){ctx.save();ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();if(stroke)ctx.stroke();ctx.restore();}
  function foot(x,y,facing,color,raised=false){ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.strokeStyle='#061019';ctx.lineWidth=2.5;ctx.beginPath();ctx.roundRect(facing>0?-4:-12,raised?-3:-4,16,8,4);ctx.fill();ctx.stroke();ctx.globalAlpha=.35;ctx.fillStyle='#fff';ctx.fillRect(facing>0?5:-8,-2,5,1.5);ctx.restore();}

  function portrait(im,x,y,r,o,tilt=0,hurt=false){
    ctx.save();ctx.translate(x,y);ctx.rotate(tilt);
    circle(-r+1,2,4.2,o.skin);circle(r-1,2,4.2,o.skin);
    ctx.shadowColor='#000c';ctx.shadowBlur=12;ctx.fillStyle='#061019';ctx.beginPath();ctx.arc(0,0,r+4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.clip();
    if(im&&im.complete&&im.naturalWidth){
      const iw=im.naturalWidth,ih=im.naturalHeight,side=Math.min(iw,ih)*.75,sx=(iw-side)/2,sy=Math.max(0,Math.min(ih-side,(ih-side)*.18));
      ctx.imageSmoothingEnabled=true;ctx.drawImage(im,sx,sy,side,side,-r,-r,r*2,r*2);
    }else{ctx.fillStyle='#697a86';ctx.fillRect(-r,-r,r*2,r*2);}
    const blend=ctx.createLinearGradient(0,r*.32,0,r);blend.addColorStop(0,'#0000');blend.addColorStop(.78,o.skin+'08');blend.addColorStop(1,o.skin+'38');ctx.fillStyle=blend;ctx.fillRect(-r,r*.25,r*2,r*.8);
    const light=ctx.createLinearGradient(-r,-r,r,r);light.addColorStop(0,'#ffffff2b');light.addColorStop(.42,'#ffffff00');light.addColorStop(1,hurt?'#ff294342':'#0000002d');ctx.fillStyle=light;ctx.fillRect(-r,-r,r*2,r*2);ctx.restore();
    ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.strokeStyle='#061019';ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,0,r+1.5,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=hurt?'#ff5870':o.accent;ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(0,0,r+.7,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.65;ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(-2,-2,r-2,Math.PI*1.08,Math.PI*1.66);ctx.stroke();ctx.restore();
  }

  function torso(o,w,h){
    ctx.save();ctx.fillStyle=o.shirt;ctx.strokeStyle='#071119';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-w+3,-8);ctx.quadraticCurveTo(-w-3,3,-w,h-2);ctx.quadraticCurveTo(0,h+4,w,h-2);ctx.quadraticCurveTo(w+3,3,w-3,-8);ctx.quadraticCurveTo(0,-14,-w+3,-8);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=o.jacket;ctx.strokeStyle='#0a151d';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-w+2,-7);ctx.lineTo(-5,-2);ctx.lineTo(-1,h-3);ctx.lineTo(-w+3,h-3);ctx.quadraticCurveTo(-w-2,5,-w+2,-7);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(w-2,-7);ctx.lineTo(5,-2);ctx.lineTo(1,h-3);ctx.lineTo(w-3,h-3);ctx.quadraticCurveTo(w+2,5,w-2,-7);ctx.closePath();ctx.fill();ctx.stroke();
    const shade=ctx.createLinearGradient(-w,0,w,0);shade.addColorStop(0,'#00000031');shade.addColorStop(.48,'#ffffff0d');shade.addColorStop(1,'#0000001c');ctx.fillStyle=shade;ctx.beginPath();ctx.moveTo(-w+3,-7);ctx.lineTo(w-3,-7);ctx.lineTo(w-1,h-2);ctx.lineTo(-w+1,h-2);ctx.closePath();ctx.fill();ctx.restore();
  }

  function detail(ch,o,h){
    ctx.save();
    if(['tie','lead','op'].includes(o.style)){ctx.fillStyle=o.accent;ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(5,4);ctx.lineTo(1,h-4);ctx.lineTo(-4,4);ctx.closePath();ctx.fill();}
    if(o.style==='badge'){ctx.strokeStyle=o.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-7,-4);ctx.lineTo(0,11);ctx.lineTo(7,-4);ctx.stroke();ctx.fillStyle='#e9f7ef';ctx.strokeStyle='#183028';ctx.lineWidth=1;ctx.fillRect(-5,9,10,9);ctx.strokeRect(-5,9,10,9);}
    if(o.style==='zip'){ctx.strokeStyle=o.accent;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(0,h-2);ctx.stroke();circle(0,5,2.3,o.accent,null,0);}
    if(o.style==='hood'){ctx.strokeStyle=o.accent;ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(0,-5,13,.12*Math.PI,.88*Math.PI,true);ctx.stroke();ctx.beginPath();ctx.moveTo(-5,-1);ctx.lineTo(-7,12);ctx.moveTo(5,-1);ctx.lineTo(7,12);ctx.stroke();}
    if(o.style==='safe'){ctx.fillStyle='#262f36';ctx.fillRect(-4,-7,8,h+2);ctx.globalAlpha=.92;ctx.fillStyle='#f6dc55';ctx.fillRect(-16,5,32,4);ctx.fillRect(-16,16,32,4);}
    if(o.style==='perm'){ctx.strokeStyle=o.accent;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-14,-5);ctx.lineTo(-5,6);ctx.lineTo(-2,h-3);ctx.moveTo(14,-5);ctx.lineTo(5,6);ctx.lineTo(2,h-3);ctx.stroke();ctx.fillStyle='#f7e8f0';ctx.fillRect(8,8,7,9);}
    if(o.style==='support'){ctx.strokeStyle=o.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-13,-5);ctx.lineTo(-4,6);ctx.lineTo(-1,h-4);ctx.moveTo(13,-5);ctx.lineTo(4,6);ctx.lineTo(1,h-4);ctx.stroke();ctx.fillStyle=o.accent;ctx.beginPath();ctx.arc(11,5,3,0,Math.PI*2);ctx.fill();}
    if(o.style==='lead'){ctx.fillStyle='#f1e7c9';ctx.strokeStyle='#57482a';ctx.fillRect(9,8,9,7);ctx.strokeRect(9,8,9,7);ctx.fillStyle=o.accent;ctx.fillRect(-19,-6,7,4);}
    if(o.style==='op'){ctx.fillStyle=o.accent;ctx.fillRect(-18,-7,8,4);ctx.fillRect(10,-7,8,4);ctx.globalAlpha=.4;ctx.strokeStyle=o.accent;ctx.strokeRect(-20,-10,40,h+12);}
    ctx.restore();
  }

  drawPlayer=function(p,ch){
    if(!p||!ch){oldPlayer(p,ch);return;}const t=performance.now(),o=cfg(ch),cx=p.x+p.w/2,f=p.facing||1,run=p.onGround&&Math.abs(p.vx)>50,air=!p.onGround,rise=air&&p.vy<0,fall=air&&p.vy>=0,hurt=p.hurt>0,dash=(game?.v7DashUntil||0)>t,ability=(game?.v121AbilityUntil||0)>t;
    const phase=run?Math.sin((p.anim||0)*16.5):0,bob=run?Math.abs(Math.sin((p.anim||0)*16.5))*2.1:Math.sin(t/290)*.8,lean=hurt?-f*.09:air?(rise?-f*.07:f*.08):Math.max(-.08,Math.min(.08,p.vx/3300)),w=18*o.build,h=25*o.build,bodyY=p.y+31+bob;
    ctx.save();if(p.inv>0&&Math.floor(p.inv/78)%2===0)ctx.globalAlpha=.45;
    ctx.save();ctx.globalAlpha*=air?.12:.34;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(cx,p.y+p.h+5,air?17:29,air?3:6,0,0,Math.PI*2);ctx.fill();ctx.restore();
    if(dash){for(let i=5;i>=1;i--){ctx.save();ctx.globalAlpha=.045*i;ctx.translate(-f*i*15,0);ctx.fillStyle=o.accent;ctx.beginPath();ctx.roundRect(cx-15,p.y+18,30,49,11);ctx.fill();ctx.restore();}ctx.save();ctx.strokeStyle=o.accent;ctx.globalAlpha=.48;ctx.lineWidth=3;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(cx-f*(30+i*18),p.y+26+i*9);ctx.lineTo(cx-f*(7+i*7),p.y+26+i*9);ctx.stroke();}ctx.restore();}
    ctx.save();ctx.translate(cx,bodyY);ctx.rotate(lean);
    let lk=[-7,15,-10-phase*8,23,-15-phase*11,31],rk=[7,15,10+phase*8,23,15+phase*11,31];
    if(rise){lk=[-7,15,-15,21,-18,26];rk=[7,15,14,18,20,23];}else if(fall){lk=[-7,15,-11,24,-15,32];rk=[7,15,16,22,21,29];}else if(hurt){lk=[-7,15,-7,23,-10,31];rk=[7,15,7,23,11,31];}
    line([[lk[0],lk[1]],[lk[2],lk[3]],[lk[4],lk[5]]],o.pants,8.5,3);line([[rk[0],rk[1]],[rk[2],rk[3]],[rk[4],rk[5]]],o.pants,8.5,3);foot(lk[4],lk[5],f,o.shoe,air);foot(rk[4],rk[5],f,o.shoe,air);
    torso(o,w,h);detail(ch,o,h);
    let la=[-w+3,0,-24-phase*7,9,-27-phase*10,20],ra=[w-3,0,24+phase*7,9,27+phase*10,20];
    if(rise){la=[-w+3,0,-25,-8,-19,-18];ra=[w-3,0,25,-8,19,-18];}else if(fall){la=[-w+3,0,-27,5,-30,16];ra=[w-3,0,27,5,30,16];}else if(hurt){la=[-w+3,0,-18,-9,-10,-18];ra=[w-3,0,18,-9,10,-18];}else if(ability){la=[-w+3,0,-29,-2,-34,5];ra=[w-3,0,29,-2,34,5];}
    const sleeve=o.jacket||o.shirt;line([[la[0],la[1]],[la[2],la[3]],[la[4],la[5]]],sleeve,7.5,3);line([[ra[0],ra[1]],[ra[2],ra[3]],[ra[4],ra[5]]],sleeve,7.5,3);circle(la[4],la[5],4.5,o.skin);circle(ra[4],ra[5],4.5,o.skin);
    ctx.globalAlpha=.42;ctx.strokeStyle=o.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f*w,-4);ctx.lineTo(f*(w-1),h-3);ctx.stroke();ctx.restore();
    const hx=cx+f*(run?phase*1.3:0),hy=p.y+12+bob*.48+(rise?-1:fall?1:0),hr=23.5*o.build;ctx.save();ctx.fillStyle=o.skin;ctx.strokeStyle='#071119';ctx.lineWidth=2.5;ctx.beginPath();ctx.roundRect(hx-7,hy+17,14,15,5);ctx.fill();ctx.stroke();ctx.restore();portrait(imgs?.[ch.n],hx,hy,hr,o,lean*.3,hurt);
    ctx.save();ctx.strokeStyle=o.shirt;ctx.lineWidth=4.5;ctx.beginPath();ctx.arc(hx,hy+hr-2,9,.12*Math.PI,.88*Math.PI);ctx.stroke();ctx.restore();
    if(hurt){ctx.save();ctx.globalAlpha=.72;ctx.strokeStyle='#ff526c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,p.y+35,43+Math.sin(t/55)*2,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ff2e4b18';ctx.beginPath();ctx.arc(cx,p.y+35,39,0,Math.PI*2);ctx.fill();ctx.restore();}
    if(game?.shield>0||game?.activeUntil>t){ctx.save();ctx.globalAlpha=.68;ctx.strokeStyle='#6cefff';ctx.lineWidth=3;ctx.setLineDash([7,4]);ctx.beginPath();ctx.arc(cx,p.y+p.h/2,43+Math.sin(t/95)*2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.12;ctx.fillStyle='#69efff';ctx.beginPath();ctx.arc(cx,p.y+p.h/2,40,0,Math.PI*2);ctx.fill();ctx.restore();}
    if(ability){ctx.save();ctx.globalAlpha=.78;ctx.strokeStyle=o.accent;ctx.lineWidth=3;for(let r=47;r<=67;r+=10){ctx.beginPath();ctx.arc(cx,p.y+34,r+Math.sin(t/65+r)*2.5,0,Math.PI*2);ctx.stroke();}ctx.restore();}
    if(run&&!air){ctx.save();ctx.globalAlpha=.38;ctx.fillStyle=o.accent;for(let i=0;i<4;i++)ctx.fillRect(cx-f*(24+i*10),p.y+p.h-2-(i%2)*3,5+i,2);ctx.restore();}ctx.restore();
  };

  const roleIcons={Eugenio:'◆',Farris:'▦',Yurii:'➤',Luca:'↑',Tiziano:'★',Daniele:'✚',Dalila:'✓',Giada:'✦',Michele:'♛'};
  const oldMenu=renderMenu;
  renderMenu=function(){
    oldMenu();document.querySelectorAll('#roster .person').forEach((card,i)=>{const ch=CH[i];if(!ch)return;const o=cfg(ch);card.classList.add('v16Person');card.style.setProperty('--char-accent',o.accent);const wrap=card.querySelector('.v14AvatarWrap');if(wrap&&!wrap.querySelector('.v16MiniBody'))wrap.insertAdjacentHTML('beforeend',`<span class="v16MiniBody"></span><span class="v16RoleIcon">${roleIcons[ch.n]||'◆'}</span>`);if(!card.querySelector('.v16Ability')){const pd=card.querySelector('.pd');pd?.insertAdjacentHTML('afterend',`<div class="v16Ability">X · ${ch.ability}</div><div class="v16Meters"><span class="v16Meter">VEL<i style="--meter:${Math.round(ch.spd/3.9)}%"></i></span><span class="v16Meter">SAL<i style="--meter:${Math.round(ch.jump/9.4)}%"></i></span><span class="v16Meter">TEC<i style="--meter:${Math.min(100,ch.skills.length*23)}%"></i></span></div>`);}});
  };
  document.body.classList.add('v16Characters');document.title='Back Office Adventure DX v16';const logo=document.querySelector('.header .logo span');if(logo)logo.textContent='ADVENTURE DX v16';const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Character Overhaul: proporzioni naturali, volti integrati, outfit unici, pose articolate e animazioni dedicate a ogni stato.';const credits=document.querySelector('#credits h2');if(credits)credits.textContent='BACK OFFICE ADVENTURE DX v16';try{renderMenu();}catch(e){console.warn('v16 characters',e);}
})();
