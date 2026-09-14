/* BACK OFFICE ADVENTURE DX v11 - MAP OVERHAUL */
'use strict';

const V11_KEY='boAdventureDXv11Maps';
let v11={mini:true,regionsSeen:{},secretsSeen:{}};
try{Object.assign(v11,JSON.parse(localStorage.getItem(V11_KEY)||'{}'));}catch(e){}
v11.regionsSeen||={};v11.secretsSeen||={};
function persistV11(){try{localStorage.setItem(V11_KEY,JSON.stringify(v11));}catch(e){}}

const V11_MAPS=[
  {
    title:'Open Space • Piano Operativo',color:'#78d9ff',platform:'desk',alt:'cabinet',
    regions:[['Ingresso',0,.15],['Open Space',.15,.38],['Sala Riunioni',.38,.58],['Archivio',.58,.80],['Area Tecnica',.80,1]],
    landmarks:[[.10,'RECEPTION'],[.31,'OPEN SPACE'],[.49,'SALA RIUNIONI'],[.70,'ARCHIVIO'],[.88,'AREA TECNICA']]
  },
  {
    title:'Permessi • Labirinto Procedurale',color:'#b99dff',platform:'folder',alt:'shelf',
    regions:[['Sportelli',0,.16],['Protocollo',.16,.36],['Archivio Verticale',.36,.60],['Portali',.60,.82],['Direzione',.82,1]],
    landmarks:[[.10,'SPORTELLI'],[.28,'PROTOCOLLO'],[.49,'ARCHIVIO'],[.70,'PORTALI'],[.90,'DIREZIONE']]
  },
  {
    title:'Cantiere • Area Operativa',color:'#f2bd53',platform:'scaffold',alt:'pipe',
    regions:[['Accesso',0,.14],['Scavo',.14,.38],['Ponteggi',.38,.61],['Container',.61,.82],['Riconsegna',.82,1]],
    landmarks:[[.09,'ACCESSO'],[.27,'SCAVO'],[.50,'PONTEGGI'],[.71,'CONTAINER'],[.91,'RICONSEGNA']]
  },
  {
    title:'Consuntivazione • Centro Dati',color:'#68dfd1',platform:'dashboard',alt:'server',
    regions:[['Input',0,.15],['Dashboard',.15,.38],['Server',.38,.60],['Chiusura NTW',.60,.82],['Output',.82,1]],
    landmarks:[[.09,'INPUT'],[.29,'DASHBOARD'],[.50,'SERVER'],[.71,'CHIUSURA NTW'],[.91,'OUTPUT']]
  },
  {
    title:'Fine Mese • Zona di Collasso',color:'#ff6c8e',platform:'brokenDesk',alt:'glitch',
    regions:[['Ufficio',0,.16],['Collasso',.16,.38],['Frattura',.38,.60],['Pre-Arena',.60,.79],['MENGASI',.79,1]],
    landmarks:[[.09,'UFFICIO'],[.28,'COLLASSO'],[.49,'FRATTURA'],[.69,'PRE-ARENA'],[.90,'MENGASI']]
  }
];

(function initV11UI(){
  document.title='Back Office Adventure DX v11';
  const logo=document.querySelector('.header .logo span');if(logo)logo.textContent='ADVENTURE DX v11';
  const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Mappe completamente ridisegnate: aree riconoscibili, percorsi multipli, verticalità, scorciatoie, segreti e mini-mappa dinamica.';
  const credits=document.querySelector('#credits h2');if(credits)credits.textContent='BACK OFFICE ADVENTURE DX v11';

  const shell=document.querySelector('.shell');
  if(shell&&!document.querySelector('#v11Minimap')){
    const wrap=document.createElement('div');wrap.id='v11Minimap';wrap.className='v11Minimap';
    wrap.innerHTML='<div class="v11MapTitle">MAPPA</div><canvas id="v11MinimapCanvas" width="320" height="84"></canvas><div id="v11RegionName" class="v11RegionName">—</div>';
    shell.appendChild(wrap);
  }
  const ga=document.querySelector('#game .ga');
  if(ga&&!document.querySelector('#mapBtn')){
    const b=document.createElement('button');b.id='mapBtn';b.className='secondary';b.textContent='🗺️ Mappa';b.onclick=toggleV11Map;ga.appendChild(b);
  }
  syncV11MapVisibility();
})();

function toggleV11Map(){v11.mini=!v11.mini;persistV11();syncV11MapVisibility();}
function syncV11MapVisibility(){
  const el=document.querySelector('#v11Minimap');if(el)el.classList.toggle('hidden',!v11.mini);
  const b=document.querySelector('#mapBtn');if(b)b.classList.toggle('active',!!v11.mini);
}
document.addEventListener('keydown',e=>{if((e.key==='m'||e.key==='M')&&game?.running){toggleV11Map();e.preventDefault();}});

function v11AddPlatforms(w,idx,limit){
  const cfg=V11_MAPS[idx],end=Math.max(1200,limit||w.w-260);
  const clusters=idx===4?[.25,.50]:[.23,.52,.72];
  clusters.forEach((f,ci)=>{
    const x0=Math.min(end-850,Math.max(620,end*f));
    const ys=ci%2?[360,300,242,188,242,300]:[382,322,264,206,150,208];
    ys.forEach((y,i)=>{
      const x=x0+i*145,wid=i===ys.length-1?155:126;
      if(x+wid>=end)return;
      w.platforms.push({x,y,w:wid,h:16,v6Type:i%2?cfg.alt:cfg.platform,v11Route:true,v11Cluster:ci});
    });
    const rewardX=x0+145*(ys.length-1)+56;
    if(rewardX<end)w.collect.push({x:rewardX,y:Math.max(72,ys[ys.length-1]-48),type:ci%2?'ntw':'stamp',taken:false,bob:Math.random()*6.28,v11Route:true});
  });

  const sx=Math.min(end-660,Math.max(900,end*.41));
  const secretPlatforms=[
    {x:sx,y:130,w:140,h:14},{x:sx+160,y:105,w:120,h:14},{x:sx+305,y:132,w:125,h:14},{x:sx+455,y:95,w:145,h:14}
  ];
  secretPlatforms.forEach((p,i)=>{if(p.x+p.w<end)w.platforms.push({...p,v6Type:i%2?cfg.alt:cfg.platform,v11SecretRoute:true});});
  const secretX=Math.min(end-80,sx+520);
  w.secrets.push({x:secretX,y:58,taken:false,v11:true});
  w.collect.push({x:secretX+18,y:74,type:'ntw',taken:false,bob:Math.random()*6.28,v11SecretRoute:true});
}

const v10MakeLevelV11=makeLevel;
makeLevel=function(idx){
  const res=v10MakeLevelV11(idx),w=res.w,cfg=V11_MAPS[idx];
  const bossLimit=w.v6Arena?.x?Math.max(1400,w.v6Arena.x-170):w.w-260;
  w.v11={
    cfg,
    regions:cfg.regions.map(r=>({name:r[0],from:r[1]*w.w,to:r[2]*w.w})),
    landmarks:cfg.landmarks.map(l=>({x:l[0]*w.w,label:l[1]})),
    discovered:{},
    routeLabels:[]
  };
  v11AddPlatforms(w,idx,bossLimit);
  const labels=idx===0?['PERCORSO SCRIVANIE','ARCHIVIO ALTO','SCORCIATOIA TECNICA']:
    idx===1?['SPORTELLI RAPIDI','ARCHIVIO VERTICALE','PORTALE DI SERVIZIO']:
    idx===2?['PASSERELLA','PONTEGGIO ALTO','VIA CONTAINER']:
    idx===3?['FLUSSO RAPIDO','SERVER ALTO','CORSIA NTW']:
    ['UFFICI INSTABILI','FRATTURA ALTA','VARCO FUSIONE'];
  const routeEnd=bossLimit;
  [0.23,0.52,0.72].forEach((f,i)=>{if(idx===4&&i===2)return;w.v11.routeLabels.push({x:Math.min(routeEnd-300,routeEnd*f),label:labels[i]});});
  return res;
};

function v11CurrentRegion(){
  if(!game?.w?.v11)return null;
  const x=game.p.x;return game.w.v11.regions.find(r=>x>=r.from&&x<r.to)||game.w.v11.regions.at(-1);
}

const v10UpdateV11=update;
update=function(dt,now){
  v10UpdateV11(dt,now);if(!game?.running||!game.w?.v11)return;
  const region=v11CurrentRegion();
  if(region&&game.v11Region!==region.name){
    game.v11Region=region.name;
    const key=`${game.idx}:${region.name}`;game.w.v11.discovered[region.name]=true;
    if(!v11.regionsSeen[key]){v11.regionsSeen[key]=true;persistV11();showMsg(`🗺️ ${region.name.toUpperCase()}`,900);}
  }
  for(const s of game.w.secrets||[]){
    if(!s.v11||s.taken)continue;
    if(Math.abs(game.p.x-s.x)<105&&Math.abs(game.p.y-s.y)<120){
      const key=`${game.idx}:${Math.round(s.x)}`;
      if(!v11.secretsSeen[key]){v11.secretsSeen[key]=true;persistV11();showMsg('🔎 PERCORSO SEGRETO SCOPERTO',1100);}
    }
  }
  if(now-(game.v11MapPaint||0)>90){game.v11MapPaint=now;drawV11Minimap();}
};

function drawV11Minimap(){
  const can=document.querySelector('#v11MinimapCanvas');if(!can||!game?.w?.v11||!v11.mini)return;
  const m=can.getContext('2d'),W=can.width,H=can.height,cfg=game.w.v11.cfg,world=game.w.w||1;
  m.clearRect(0,0,W,H);m.fillStyle='rgba(5,15,24,.88)';m.fillRect(0,0,W,H);
  const pad=10,y=40,trackW=W-pad*2;
  game.w.v11.regions.forEach((r,i)=>{
    const x=pad+(r.from/world)*trackW,w=Math.max(2,((r.to-r.from)/world)*trackW);
    m.globalAlpha=.28+(i%2)*.07;m.fillStyle=cfg.color;m.fillRect(x,25,w,30);
    m.globalAlpha=.8;m.fillStyle='#dbeaf4';m.font='bold 6px system-ui';m.textAlign='center';m.fillText(r.name.toUpperCase(),x+w/2,20);
  });
  m.globalAlpha=.7;m.strokeStyle='#7fa6bd';m.lineWidth=2;m.beginPath();m.moveTo(pad,y);m.lineTo(W-pad,y);m.stroke();
  for(const l of game.w.v11.landmarks){const x=pad+(l.x/world)*trackW;m.fillStyle='#d7e6ef';m.fillRect(x-1,34,2,12);}
  const cp=game.checkpoint?.x;if(Number.isFinite(cp)){const x=pad+(cp/world)*trackW;m.fillStyle='#72e5a7';m.beginPath();m.arc(x,y,4,0,Math.PI*2);m.fill();}
  const side=game.w.v10Side;if(side&&!side.done){const x=pad+(side.x/world)*trackW;m.fillStyle='#ffd65a';m.font='12px system-ui';m.fillText('◆',x,66);}
  if(game.bossZone){const x=pad+(game.bossZone/world)*trackW;m.fillStyle='#ff6b87';m.font='bold 9px system-ui';m.fillText('BOSS',x,69);}
  for(const s of game.w.secrets||[]){if(!s.v11)continue;const key=`${game.idx}:${Math.round(s.x)}`;if(!v11.secretsSeen[key])continue;const x=pad+(s.x/world)*trackW;m.fillStyle='#ffe27a';m.font='10px system-ui';m.fillText('★',x,30);}
  const px=pad+(Math.max(0,Math.min(world,game.p.x))/world)*trackW;
  m.globalAlpha=1;m.fillStyle='#fff';m.beginPath();m.moveTo(px,y-8);m.lineTo(px-5,y+4);m.lineTo(px+5,y+4);m.closePath();m.fill();
  const rn=document.querySelector('#v11RegionName');if(rn)rn.textContent=v11CurrentRegion()?.name||cfg.title;
}

const v10DrawWorldDecorV11=drawWorldDecor;
drawWorldDecor=function(theme,cam){v10DrawWorldDecorV11(theme,cam);drawV11Landmarks(cam);};

function drawV11Landmarks(cam){
  if(!game?.w?.v11)return;const idx=game.idx,t=performance.now()/1000,w=game.w,cfg=w.v11.cfg;
  ctx.save();
  for(const l of w.v11.landmarks){
    if(l.x<cam-360||l.x>cam+1320)continue;
    const x=l.x;ctx.globalAlpha=.15;ctx.fillStyle=cfg.color;ctx.fillRect(x-95,118,190,275);
    ctx.globalAlpha=.42;ctx.strokeStyle=cfg.color;ctx.lineWidth=2;ctx.strokeRect(x-95,118,190,275);
    ctx.globalAlpha=.72;ctx.fillStyle='#eaf7ff';ctx.font='900 9px system-ui';ctx.textAlign='center';ctx.fillText(l.label,x,140);
  }

  if(idx===0){
    for(let x=Math.floor((cam-200)/560)*560;x<cam+1200;x+=560){
      ctx.globalAlpha=.17;ctx.fillStyle='#c6edff';ctx.fillRect(x+100,175,320,190);ctx.strokeStyle='#8ac9e7';ctx.strokeRect(x+100,175,320,190);
      ctx.globalAlpha=.72;ctx.fillStyle='#715a48';ctx.fillRect(x+145,402,190,11);ctx.fillStyle='#243948';ctx.fillRect(x+170,365,55,34);ctx.fillRect(x+255,365,55,34);
      ctx.fillStyle='#62d5ff';ctx.globalAlpha=.35+.15*Math.sin(t*2+x);ctx.fillRect(x+177,371,41,21);ctx.fillRect(x+262,371,41,21);
    }
  }else if(idx===1){
    for(let x=Math.floor((cam-200)/520)*520;x<cam+1200;x+=520){
      ctx.globalAlpha=.22;ctx.fillStyle='#3f395f';ctx.fillRect(x+70,180,135,280);ctx.fillStyle='#6e6395';for(let y=205;y<445;y+=42)ctx.fillRect(x+82,y,110,6);
      ctx.fillStyle='#31294b';ctx.fillRect(x+265,245,150,215);ctx.globalAlpha=.7;ctx.fillStyle=(Math.floor(t*2+x/50)%2)?'#f07eaa':'#8f7fff';ctx.fillRect(x+283,267,114,26);
      ctx.fillStyle='#f0e8ff';ctx.font='bold 8px system-ui';ctx.textAlign='center';ctx.fillText('MANCA ALLEGATO',x+340,284);
    }
  }else if(idx===2){
    const progress=Math.max(0,Math.min(1,game.p.x/(w.w||1)));ctx.globalAlpha=.10;ctx.fillStyle=progress>.68?'#5d4872':progress>.35?'#f2a85f':'#ffd47a';ctx.fillRect(cam,0,1000,540);
    for(let x=Math.floor((cam-250)/700)*700;x<cam+1300;x+=700){
      ctx.globalAlpha=.65;ctx.strokeStyle='#dca62e';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+95,120);ctx.lineTo(x+95,455);ctx.moveTo(x+20,145);ctx.lineTo(x+310,145);ctx.stroke();
      ctx.fillStyle='#d49b24';ctx.globalAlpha=.75;ctx.fillRect(x+360,390,120,48);ctx.fillStyle='#232a2e';ctx.beginPath();ctx.arc(x+388,444,23,0,Math.PI*2);ctx.arc(x+454,444,23,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#bd7f21';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(x+452,398);ctx.lineTo(x+530,325);ctx.lineTo(x+574,352);ctx.stroke();
    }
  }else if(idx===3){
    for(let x=Math.floor((cam-250)/540)*540;x<cam+1200;x+=540){
      ctx.globalAlpha=.7;ctx.fillStyle='#143b43';ctx.fillRect(x+70,175,255,150);ctx.fillStyle='#61d7cd';for(let i=0;i<5;i++)ctx.fillRect(x+92,205+i*20,60+((i*37)%130),5);
      ctx.strokeStyle='#72e7dc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+95,302);ctx.lineTo(x+145,270);ctx.lineTo(x+195,285);ctx.lineTo(x+250,235);ctx.lineTo(x+302,252);ctx.stroke();
      ctx.fillStyle='#202f38';ctx.globalAlpha=.8;ctx.fillRect(x+370,245,95,215);ctx.fillStyle='#58d8cd';for(let y=267;y<440;y+=25)ctx.fillRect(x+386,y,62,7);
    }
  }else if(idx===4){
    const intensity=Math.max(.06,Math.min(.24,game.p.x/(w.w||1)*.25));ctx.globalAlpha=intensity*(.7+.3*Math.sin(t*4));ctx.fillStyle='#ff2455';ctx.fillRect(cam,0,1000,540);
    for(let x=Math.floor((cam-220)/520)*520;x<cam+1200;x+=520){
      ctx.globalAlpha=.72;ctx.fillStyle='#3a1729';ctx.save();ctx.translate(x+160,410);ctx.rotate(-.08-Math.sin(t+x)*.03);ctx.fillRect(-90,-12,180,24);ctx.restore();
      ctx.fillStyle='#2b1321';ctx.fillRect(x+305,300,150,160);ctx.fillStyle=(Math.floor(t*5+x/80)%2)?'#ff305d':'#7b1734';ctx.fillRect(x+325,322,110,48);ctx.fillStyle='#fff';ctx.font='900 11px system-ui';ctx.textAlign='center';ctx.fillText('URGENTE',x+380,351);
    }
  }

  for(const r of w.v11.routeLabels){
    if(r.x<cam-120||r.x>cam+1080)continue;ctx.globalAlpha=.7;ctx.fillStyle='#07131edc';ctx.strokeStyle=cfg.color;ctx.lineWidth=1;ctx.fillRect(r.x,92,150,22);ctx.strokeRect(r.x,92,150,22);ctx.fillStyle='#eaf8ff';ctx.font='bold 7px system-ui';ctx.textAlign='center';ctx.fillText(r.label,r.x+75,107);
  }
  ctx.restore();
}

const v10DrawPlatformV11=drawPlatform;
drawPlatform=function(p){
  v10DrawPlatformV11(p);if(!p?.v11Route&&!p?.v11SecretRoute)return;
  ctx.save();ctx.globalAlpha=p.v11SecretRoute?.42:.28;ctx.strokeStyle=p.v11SecretRoute?'#ffe27a':'#9edfff';ctx.lineWidth=2;ctx.setLineDash(p.v11SecretRoute?[4,4]:[8,6]);ctx.beginPath();ctx.moveTo(p.x+8,p.y-3);ctx.lineTo(p.x+p.w-8,p.y-3);ctx.stroke();ctx.restore();
};

const v10DrawV11=draw;
draw=function(){v10DrawV11();if(game?.running&&v11.mini)drawV11Minimap();};

renderMenu();
