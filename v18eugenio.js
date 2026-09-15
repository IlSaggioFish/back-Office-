/* Approved cartoon artwork: Eugenio only. Physics and saved data are untouched. */
'use strict';
(function(){
  const sheet=new Image(), frames=[];
  const previous=drawPlayer;
  sheet.src='./assets/characters/eugenio-v18.png';
  sheet.onload=()=>{
    const scan=document.createElement('canvas');scan.width=sheet.width;scan.height=sheet.height;
    const s=scan.getContext('2d',{willReadFrequently:true});s.drawImage(sheet,0,0);
    const pixels=s.getImageData(0,0,scan.width,scan.height).data;
    const cw=sheet.width/3,ch=sheet.height/2;
    for(let i=0;i<6;i++){
      const ox=(i%3)*cw,oy=Math.floor(i/3)*ch;let x0=cw,y0=ch,x1=0,y1=0;
      for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(pixels[((oy+y)*scan.width+ox+x)*4+3]>32){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
      frames.push({x:ox+x0,y:oy+y0,w:x1-x0+1,h:y1-y0+1});
    }
    refresh();
  };
  function paint(target,index,x,y,height,flip=false){
    const f=frames[index];if(!f)return;
    const width=f.w/f.h*height;
    target.save();target.translate(x,y);target.scale(flip?-1:1,1);
    target.drawImage(sheet,f.x,f.y,f.w,f.h,-width/2,-height,width,height);target.restore();
  }
  function preview(parent,height){
    if(!frames.length||parent.querySelector('.v18-art'))return;
    const c=document.createElement('canvas');c.className='v18-art';c.width=240;c.height=400;
    c.setAttribute('aria-label','Eugenio cartoon');c.style.cssText=`width:${height*.6}px;height:${height}px;object-fit:contain;position:relative;z-index:6;max-width:100%`;
    parent.replaceChildren(c);paint(c.getContext('2d'),0,120,394,380);
  }
  function refresh(){
    const card=document.querySelector('[data-hero="Eugenio"]');
    if(card){const wrap=card.querySelector('.v14AvatarWrap');if(wrap)preview(wrap,106);const tag=card.querySelector('.v17-state');if(tag&&tag.textContent!=='CARTOON')tag.textContent='CARTOON';}
    const box=document.querySelector('.v17-showcase');
    if(box?.querySelector('.v17-name')?.textContent==='Eugenio'){
      preview(box.querySelector('.v17-stage'),202);
      const poses=box.querySelector('.v17-poses');if(poses)poses.style.display='none';
    }
  }
  const oldMenu=renderMenu;renderMenu=function(){oldMenu();refresh();};
  const observer=new MutationObserver(refresh);observer.observe(document.querySelector('#menu'),{childList:true,subtree:true});
  drawPlayer=function(p,ch){
    if(ch?.n!=='Eugenio'||frames.length!==6)return previous(p,ch);
    const t=performance.now(),ability=(game?.v121AbilityUntil||0)>t;
    const run=p.onGround&&Math.abs(p.vx)>50;
    const frame=p.hurt>0?4:ability?5:!p.onGround?3:run?1+(Math.floor((p.anim||0)*8)%2):0;
    const height=p.h+14, bob=p.onGround?(run?Math.sin((p.anim||0)*16)*1.5:Math.sin(t/340)*.6):0;
    ctx.save();
    ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(p.x+p.w/2,p.y+p.h+3,19,4,0,0,Math.PI*2);ctx.fill();
    if(p.inv>0&&Math.floor(p.inv/78)%2===0)ctx.globalAlpha=.45;
    paint(ctx,frame,p.x+p.w/2,p.y+p.h+bob,height,p.facing<0);
    if(game?.shield>0||game?.activeUntil>t||ability){ctx.strokeStyle=ability?'#56caff':'#6cefff';ctx.lineWidth=2;ctx.globalAlpha=.7;ctx.beginPath();ctx.ellipse(p.x+p.w/2,p.y+p.h/2,38,height*.58,0,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  };
  document.title='Back Office Adventure DX v18';
  document.querySelector('.header .logo span').textContent='ADVENTURE DX v18';
  document.querySelector('.header .sub').textContent='Eugenio cartoon: il primo personaggio interamente illustrato, dalla selezione alla partita.';
  document.querySelector('#credits h2').textContent='BACK OFFICE ADVENTURE DX v18';
})();
