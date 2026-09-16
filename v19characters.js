/* Cartoon cast: rendering only; character stats, collision boxes and saves stay in core. */
'use strict';
(function(){
  const atlases=window.BO_CHARACTER_ATLASES;
  const loaded=new Map();
  const previousPlayer=drawPlayer;
  const labels=['ATTESA','CORSA','SALTO','CADUTA','COLPO','ABILITÀ'];
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let previewStarted=performance.now(),previewHero='';

  function frameFor(p,atlas){
    if(p.hurt>0)return atlas.hurt;
    if(!p.onGround)return p.vy<0?3:atlas.fall;
    if((game?.v121AbilityUntil||0)>performance.now())return atlas.ability;
    return Math.abs(p.vx)>50?1+(Math.floor((p.anim||0)*8)%2):0;
  }
  function paint(target,name,index,x,y,height,flip=false){
    const item=loaded.get(name);if(!item)return;
    const [sx,sy,sw,sh]=item.atlas.frames[index];
    // One scale per character keeps head/body size stable across animation frames.
    const scale=height/item.atlas.frames[0][3];
    target.save();target.translate(x,y);target.scale(flip?-1:1,1);
    target.drawImage(item.image,sx,sy,sw,sh,-sw*scale/2,-sh*scale,sw*scale,sh*scale);
    target.restore();
  }
  function makePreview(parent,name,large){
    if(!parent||!loaded.has(name))return null;
    let canvas=parent.querySelector('canvas.v19-art');
    if(canvas?.dataset.hero===name)return canvas;
    canvas=document.createElement('canvas');canvas.className='v19-art';canvas.dataset.hero=name;
    canvas.width=large?420:160;canvas.height=large?430:220;
    canvas.setAttribute('role','img');canvas.setAttribute('aria-label',name+' cartoon');
    parent.replaceChildren(canvas);parent.classList.add('v19-ready');
    paint(canvas.getContext('2d'),name,0,canvas.width/2,canvas.height-8,large?350:198);
    return canvas;
  }
  function refresh(){
    document.querySelectorAll('#roster [data-hero]').forEach(card=>{
      const name=card.dataset.hero;
      if(!makePreview(card.querySelector('.v14AvatarWrap'),name,false))return;
      const tag=card.querySelector('.v17-state');
      if(tag&&tag.textContent!=='CARTOON')tag.textContent='CARTOON';
    });
    const box=document.querySelector('.v17-showcase');
    const name=box?.querySelector('.v17-name')?.textContent;
    if(!name||!loaded.has(name))return;
    const stage=box.querySelector('.v17-stage');
    const fresh=!stage.querySelector('canvas.v19-art');
    makePreview(stage,name,true);
    clearInterval(box._poseTimer);
    if(fresh||previewHero!==name){previewHero=name;previewStarted=performance.now();}
    const poses=box.querySelectorAll('.v17-pose');
    poses.forEach((el,i)=>{const text=String(i+1).padStart(2,'0')+' · '+labels[i];if(el.textContent!==text)el.textContent=text;});
  }
  const oldMenu=renderMenu;
  renderMenu=function(){oldMenu();refresh();};
  // v17 rebuilds its showcase on hover/click. Observe children, never canvas paints.
  new MutationObserver(refresh).observe(document.querySelector('#menu'),{childList:true,subtree:true});
  setInterval(()=>{
    if(document.hidden||document.querySelector('#menu').classList.contains('hidden'))return;
    const box=document.querySelector('.v17-showcase'),canvas=box?.querySelector('canvas.v19-art');
    if(!canvas)return;
    const name=canvas.dataset.hero,item=loaded.get(name),elapsed=performance.now()-previewStarted;
    const state=reducedMotion.matches?0:Math.floor(elapsed/1100)%6;
    const indices=[0,1+Math.floor(elapsed/130)%2,3,item.atlas.fall,item.atlas.hurt,item.atlas.ability];
    const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);
    const bob=state===1?Math.sin(elapsed/65)*3:0;
    paint(c,name,indices[state],210,422+bob,350);
    if(state===5){c.strokeStyle=CH.find(ch=>ch.n===name).color;c.lineWidth=4;c.beginPath();c.ellipse(210,235,130,175,0,0,Math.PI*2);c.stroke();}
    box.querySelectorAll('.v17-pose').forEach((el,i)=>el.classList.toggle('active',i===state));
  },100);

  drawPlayer=function(p,ch){
    if(!p||!ch||!loaded.has(ch.n))return previousPlayer(p,ch);
    const atlas=loaded.get(ch.n).atlas,t=performance.now(),ability=(game?.v121AbilityUntil||0)>t;
    const run=p.onGround&&Math.abs(p.vx)>50,height=p.h+14;
    const bob=p.onGround?(run?Math.sin((p.anim||0)*16)*1.5:Math.sin(t/340)*.6):0;
    ctx.save();ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(p.x+p.w/2,p.y+p.h+3,19,4,0,0,Math.PI*2);ctx.fill();
    if(p.inv>0&&Math.floor(p.inv/78)%2===0)ctx.globalAlpha=.45;
    paint(ctx,ch.n,frameFor(p,atlas),p.x+p.w/2,p.y+p.h+bob,height,p.facing<0);
    if(game?.shield>0||game?.activeUntil>t||ability){
      ctx.strokeStyle=ability?ch.color:'#6cefff';ctx.lineWidth=2;ctx.globalAlpha=.7;
      ctx.beginPath();ctx.ellipse(p.x+p.w/2,p.y+p.h/2,38,height*.58,0,0,Math.PI*2);ctx.stroke();
    }
    if(ability){ctx.globalAlpha=1;ctx.fillStyle=ch.color;ctx.font='900 9px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText(ch.ability,p.x+p.w/2,p.y-22);}
    ctx.restore();
  };
  for(const [name,atlas] of Object.entries(atlases)){
    const image=new Image();
    image.onload=()=>{loaded.set(name,{image,atlas});refresh();};
    image.onerror=()=>console.warn('Illustrazione non disponibile:',name);
    image.src=atlas.src;
  }
  document.body.classList.add('v19Characters');
  document.title='Back Office Adventure DX v19';
  document.querySelector('.header .logo span').textContent='ADVENTURE DX v19';
  document.querySelector('.header .sub').textContent='La squadra al completo: 9 personaggi cartoon, dalla selezione alla partita.';
  document.querySelector('#credits h2').textContent='BACK OFFICE ADVENTURE DX v19';
  refresh();
})();
