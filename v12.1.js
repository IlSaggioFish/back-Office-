/* BACK OFFICE ADVENTURE DX v12.1 - CHARACTERS, ABILITIES & PRINTER BALANCE */
'use strict';

(function(){
  const now=()=>performance.now();
  const abilityCfg={
    Eugenio:{cd:8.5,desc:'X: Jolly Pro. Chiude fino a 3 pratiche vicine di qualsiasi tipo e può generare uno scudo.'},
    Farris:{cd:9,desc:'X: Data Burst+. Chiude BD/CONS nell’area e neutralizza i relativi lanci.'},
    Yurii:{cd:6,desc:'X: Hyper Dash. Scatto lungo, invulnerabile e travolge gli ostacoli davanti.'},
    Luca:{cd:7,desc:'X: Super Salto+. Balzo enorme, invulnerabilità breve e onda d’urto aerea.'},
    Tiziano:{cd:11,desc:'X: Protocollo Scudo. +2 scudi, breve protezione e cancella i lanci vicini.'},
    Daniele:{cd:12,desc:'X: Safety Lockdown. Invulnerabilità, blocco temporaneo dei nemici e +1 scudo.'},
    Dalila:{cd:8,desc:'X: Permesso Totale. Chiude PERM nell’area e respinge pratiche PERM dei boss.'},
    Giada:{cd:10,desc:'X: Supporto Massivo. Cura, +2 scudi, ricarica Dash e aumenta la SUPER.'},
    Michele:{cd:8,desc:'X: Responsabile Assoluto. Turbo, invulnerabilità, chiusure multiple e danno ai boss.'}
  };
  for(const ch of CH){const c=abilityCfg[ch.n];if(c){ch.cd=c.cd;ch.desc=c.desc;}}

  function closeTasks(cats,r,max=99,score=14){
    if(!game?.w?.tasks)return 0;let n=0;
    const list=game.w.tasks.filter(t=>!t.dead&&Math.abs((t.x+t.w/2)-(game.p.x+game.p.w/2))<=r&&(!cats||cats.includes(t.cat))).sort((a,b)=>Math.abs(a.x-game.p.x)-Math.abs(b.x-game.p.x));
    for(const t of list.slice(0,max)){t.dead=true;n++;addScore(score,t.x,t.y);particle(t.x,t.y,'CHIUSA','#8ff4bd');}
    return n;
  }
  function closeEnemies(r,max=3){
    if(!game?.w?.enemies)return 0;let n=0;
    const list=game.w.enemies.filter(e=>!e.dead&&Math.abs((e.x+(e.w||40)/2)-(game.p.x+game.p.w/2))<r).sort((a,b)=>Math.abs(a.x-game.p.x)-Math.abs(b.x-game.p.x));
    for(const e of list.slice(0,max)){e.dead=true;n++;addScore(18,e.x,e.y);particle(e.x,e.y,'CHIUSO','#7be9ff');}
    return n;
  }
  function clearProjectiles(filter=null,r=9999){
    let n=0;const px=game?.p?.x||0;
    const wipe=arr=>{if(!Array.isArray(arr))return;for(const q of arr){if(q.dead)continue;if(Math.abs((q.x||0)-px)>r)continue;if(filter&&!filter(q))continue;q.dead=true;n++;}};
    wipe(game?.projectiles);wipe(game?.v7MiniProj);wipe(game?.v9MiniFx);return n;
  }
  function hurtBoss(amount){
    const b=game?.boss;if(!b||b.hp<=0)return 0;b.hp=Math.max(0,b.hp-amount);particle(b.x,b.y,`ABILITÀ -${amount}`,'#ffe36b');
    if(b.hp<=0){game.bossDone=true;game.projectiles=[];addScore(220,b.x,b.y);showMsg('💥 BOSS CHIUSO DALL’ABILITÀ • +220',1500);sfx('clear');document.querySelector('#bossPill')?.classList.remove('show');}
    return amount;
  }
  function hurtMini(amount){
    const m=game?.w?.v7Mini;if(!m||m.dead||!m.active)return 0;m.hp=Math.max(0,m.hp-amount);particle(m.x,m.y,`ABILITÀ -${amount}`,'#ffe36b');if(m.hp<=0){m.dead=true;addScore(180,m.x,m.y);showMsg(`✅ ${m.name} CHIUSO DALL’ABILITÀ`,1300);sfx('clear');}return amount;
  }
  function abilityPulse(kind,color){game.v121AbilityKind=kind;game.v121AbilityUntil=now()+950;game.abilityFxUntil=Math.max(game.abilityFxUntil||0,now()+950);for(let i=0;i<5;i++)particle(game.p.x+game.p.w/2+(i-2)*8,game.p.y+20,kind,color);}

  useAbility=function(){
    if(!game||!game.running||game.paused)return;const t=now();if(t<(game.abilityReady||0))return;
    const ch=game.ch,p=game.p,cfg=abilityCfg[ch.n]||{cd:ch.cd||10};game.abilityReady=t+cfg.cd*1000;sfx('ability');
    let msg='⚡ '+ch.ability;
    if(ch.n==='Eugenio'){
      const n=closeTasks(null,650,3,18);if(n>=2)game.shield=Math.min(5,(game.shield||0)+1);clearProjectiles(q=>!hasSkill(ch,q.cat),260);abilityPulse('JOLLY','#66dfff');msg=`🌐 JOLLY PRO • ${n} PRATICHE`;
    }else if(ch.n==='Farris'){
      const n=closeTasks(['BD','CONS'],780,99,17);const q=clearProjectiles(x=>x.cat==='BD'||x.cat==='CONS',500);if(game.boss&&n+q>0)hurtBoss(1);if(game.w?.v7Mini?.active&&n+q>0)hurtMini(1);abilityPulse('DATA','#6ef0bb');msg=`📊 DATA BURST+ • ${n+q} CHIUSURE`;
    }else if(ch.n==='Yurii'){
      p.vx=1250*p.facing;p.inv=Math.max(p.inv||0,1200);game.v7DashUntil=t+520;const n=closeEnemies(235,3);clearProjectiles(null,180);abilityPulse('DASH','#67e7ff');msg=`💨 HYPER DASH • ${n} OSTACOLI`;
    }else if(ch.n==='Luca'){
      p.vy=-1220;p.onGround=false;p.inv=Math.max(p.inv||0,1250);const n=closeEnemies(260,2)+closeTasks(null,230,2,14);game.v7DoubleUsed=false;abilityPulse('UP','#bba4ff');msg=`🪽 SUPER SALTO+ • ${n} IMPATTI`;
    }else if(ch.n==='Tiziano'){
      game.shield=Math.min(5,(game.shield||0)+2);p.inv=Math.max(p.inv||0,1800);const n=clearProjectiles(null,520);abilityPulse('SCUDO','#75ecff');msg=`🛡️ PROTOCOLLO SCUDO • ${n} RESPINTI`;
    }else if(ch.n==='Daniele'){
      game.activeUntil=t+5200;game.v9FreezeUntil=Math.max(game.v9FreezeUntil||0,t+2800);game.shield=Math.min(5,(game.shield||0)+1);clearProjectiles(null,360);abilityPulse('SAFE','#7ff1c2');msg='🦺 SAFETY LOCKDOWN • AREA SICURA';
    }else if(ch.n==='Dalila'){
      const n=closeTasks(['PERM'],900,7,22);const q=clearProjectiles(x=>x.cat==='PERM',850);if(game.boss&&n+q>0)hurtBoss(1);if(game.w?.v7Mini?.active&&n+q>0)hurtMini(1);abilityPulse('PERM','#ff9fd0');msg=`📝 PERMESSO TOTALE • ${n+q} CHIUSURE`;
    }else if(ch.n==='Giada'){
      game.shield=Math.min(5,(game.shield||0)+2);game.lives=Math.min(3,(game.lives||0)+1);game.v7DashReady=0;if(typeof addSuper==='function')addSuper(18);p.inv=Math.max(p.inv||0,1100);abilityPulse('SUPPORT','#ffd57c');msg='✨ SUPPORTO MASSIVO • VITA + SCUDI + SUPER';
    }else if(ch.n==='Michele'){
      game.activeUntil=t+5200;game.turboUntil=t+5200;p.inv=Math.max(p.inv||0,5200);game.shield=Math.min(5,(game.shield||0)+1);const n=closeTasks(null,900,5,20)+closeEnemies(420,4);hurtBoss(2);hurtMini(2);clearProjectiles(null,700);abilityPulse('OP','#ffd64f');msg=`👑 RESPONSABILE ASSOLUTO • ${n} CHIUSURE`;
    }
    showMsg(msg,1450);updateHUD();
  };

  // Stampante Suprema: più leggibile e meno mitragliatrice amministrativa.
  const oldMini=updateMiniBoss;
  updateMiniBoss=function(dt,t){
    const m=game?.w?.v7Mini;const printer=m?.name==='Stampante Suprema';
    if(printer&&!m.dead){
      if(!m.active&&game.p.x>m.x-430){m.last=t;m.v9Init=true;m.v9BaseX=m.x;m.v9BaseY=m.y;m.v9Special=t+3600;m.v121BaseAt=t;m.v121SpecialAt=t;}
      if(m.active){m.v121BaseAt??=t;m.v121SpecialAt??=t;m.last=Math.max(m.last||0,m.v121BaseAt+850);m.v9Special=Math.max(m.v9Special||0,m.v121SpecialAt+3800);}
    }
    const b7=game?.v7MiniProj?.length||0,b9=game?.v9MiniFx?.length||0;oldMini(dt,t);
    if(printer&&m.active&&!m.dead){
      const n7=(game.v7MiniProj||[]).slice(b7);if(n7.length)m.v121BaseAt=t;
      for(const q of n7){if(!q.v121Slow){q.vx*=.68;q.v121Slow=true;}}
      const n9=(game.v9MiniFx||[]).slice(b9);if(n9.length)m.v121SpecialAt=t;
      const papers=n9.filter(q=>q.kind==='paper');papers.forEach(q=>{if(!q.v121Slow){q.vx*=.68;q.v121Slow=true;}});if(papers.length>2)papers.slice(2).forEach(q=>q.dead=true);
      if(papers.length){particle(m.x,m.y-12,'STAMPA IN ARRIVO','#ffe5a1');}
    }
  };

  function portraitCrop(im,cx,cy,r,border){
    ctx.save();ctx.shadowColor='#000a';ctx.shadowBlur=7;ctx.fillStyle='#07131d';ctx.beginPath();ctx.arc(cx,cy,r+4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
    if(im&&im.complete&&im.naturalWidth){const iw=im.naturalWidth,ih=im.naturalHeight,side=Math.min(iw,ih)*.78,sx=(iw-side)/2,sy=Math.max(0,Math.min(ih-side,(ih-side)*.24));ctx.imageSmoothingEnabled=true;ctx.drawImage(im,sx,sy,side,side,cx-r,cy-r,r*2,r*2);}else{ctx.fillStyle='#71808a';ctx.fillRect(cx-r,cy-r,r*2,r*2);}ctx.restore();ctx.save();ctx.strokeStyle='#061019';ctx.lineWidth=6;ctx.beginPath();ctx.arc(cx,cy,r+2,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=border;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(cx,cy,r+1,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  function outfit(ch){
    if(ch.n==='Daniele')return {shirt:'#eef2f3',jacket:'#d6aa37',pants:'#26333d',tie:'#333',skin:'#d19a78'};
    if(ch.n==='Michele')return {shirt:'#f2f1eb',jacket:'#242b35',pants:'#161d26',tie:'#d6a92f',skin:'#d19a78'};
    if(ch.n==='Dalila'||ch.n==='Giada')return {shirt:'#f3f1f3',jacket:ch.color||'#72587f',pants:'#272d38',tie:null,skin:'#d19a78'};
    if(ch.n==='Tiziano')return {shirt:'#eee',jacket:'#445361',pants:'#232d36',tie:ch.color,skin:'#d19a78'};
    return {shirt:'#f2f4f4',jacket:null,pants:'#26313b',tie:ch.color||'#62d7ff',skin:'#d19a78'};
  }
  drawPlayer=function(p,ch){
    if(!p||!ch)return;const t=now(),cx=p.x+p.w/2,run=p.onGround&&Math.abs(p.vx)>55,air=!p.onGround,dash=(game?.v7DashUntil||0)>t,hurt=p.hurt>0,o=outfit(ch),phase=run?Math.sin((p.anim||0)*14):0,leg=run?phase*10:air?(p.vy<0?7:-5):0,arm=run?phase*8:air?7:0;
    ctx.save();if(p.inv>0&&Math.floor(p.inv/85)%2===0)ctx.globalAlpha=.46;ctx.globalAlpha*=1;ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(cx,p.y+p.h+4,25-(air?5:0),5,0,0,Math.PI*2);ctx.fill();
    if(dash){for(let i=1;i<=4;i++){ctx.globalAlpha=.13*(5-i);ctx.fillStyle=ch.color;ctx.fillRect(cx-p.facing*i*13-12,p.y+25,24,32);}ctx.globalAlpha=1;}
    ctx.save();ctx.translate(cx,p.y+34);ctx.rotate(air?(p.vy<0?-.07:.07):Math.max(-.055,Math.min(.055,p.vx/4200)));
    ctx.strokeStyle=o.pants;ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-6,17);ctx.lineTo(-11-leg,42);ctx.moveTo(6,17);ctx.lineTo(11+leg,42);ctx.stroke();ctx.strokeStyle='#111923';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-18-leg,43);ctx.lineTo(-7-leg,43);ctx.moveTo(7+leg,43);ctx.lineTo(18+leg,43);ctx.stroke();
    ctx.fillStyle=o.shirt;ctx.strokeStyle='#0b1720';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-16,-7);ctx.quadraticCurveTo(-22,6,-15,25);ctx.lineTo(15,25);ctx.quadraticCurveTo(22,6,16,-7);ctx.closePath();ctx.fill();ctx.stroke();
    if(o.jacket){ctx.fillStyle=o.jacket;ctx.globalAlpha=.92;ctx.beginPath();ctx.moveTo(-17,-5);ctx.lineTo(-5,0);ctx.lineTo(-1,24);ctx.lineTo(-15,24);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(17,-5);ctx.lineTo(5,0);ctx.lineTo(1,24);ctx.lineTo(15,24);ctx.closePath();ctx.fill();ctx.globalAlpha=1;}
    if(o.tie){ctx.fillStyle=o.tie;ctx.beginPath();ctx.moveTo(0,-1);ctx.lineTo(5,6);ctx.lineTo(1,21);ctx.lineTo(-4,6);ctx.closePath();ctx.fill();}
    ctx.strokeStyle=o.shirt;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-14,1);ctx.lineTo(-25-arm,15);ctx.moveTo(14,1);ctx.lineTo(25+arm,15);ctx.stroke();ctx.fillStyle=o.skin;ctx.beginPath();ctx.arc(-26-arm,16,4.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(26+arm,16,4.5,0,Math.PI*2);ctx.fill();
    if(ch.n==='Daniele'){ctx.fillStyle='#d8b640';ctx.globalAlpha=.65;ctx.fillRect(-15,6,30,5);ctx.globalAlpha=1;}if(ch.n==='Michele'){ctx.fillStyle='#e3bd4b';ctx.fillRect(-17,-5,8,5);ctx.fillRect(9,-5,8,5);}ctx.restore();
    portraitCrop(imgs?.[ch.n],cx,p.y+18,25,ch.color||'#65dfff');
    if(hurt){ctx.strokeStyle='#ff526b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,p.y+34,39,0,Math.PI*2);ctx.stroke();}
    if(game?.shield>0||game?.activeUntil>t){ctx.globalAlpha=.7;ctx.strokeStyle='#6cefff';ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.beginPath();ctx.arc(cx,p.y+p.h/2,41+Math.sin(t/100)*2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;}
    if((game?.v121AbilityUntil||0)>t){const colors={JOLLY:'#66dfff',DATA:'#6ef0bb',DASH:'#67e7ff',UP:'#bba4ff',SCUDO:'#75ecff',SAFE:'#7ff1c2',PERM:'#ff9fd0',SUPPORT:'#ffd57c',OP:'#ffd64f'},col=colors[game.v121AbilityKind]||'#fff';ctx.globalAlpha=.72;ctx.strokeStyle=col;ctx.lineWidth=4;for(let r=43;r<64;r+=9){ctx.beginPath();ctx.arc(cx,p.y+32,r+Math.sin(t/70+r)*3,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;}
    ctx.restore();
  };

  document.body.classList.add('v121Characters');
  document.title='Back Office Adventure DX v12.1';
  const logo=document.querySelector('.header .logo span');if(logo)logo.textContent='ADVENTURE DX v12.1';
  const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Personaggi più riconoscibili, corpi ridisegnati, abilità realmente utili e Stampante Suprema riequilibrata.';
  try{renderMenu();}catch(e){}
})();
