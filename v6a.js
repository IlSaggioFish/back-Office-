/* BACK OFFICE ADVENTURE DX v6 - SCENARI */
'use strict';

const V6_SCENARIOS = [
  {name:'Open Space Operativo',tag:'Ufficio',accent:'#83d8ff'},
  {name:'Labirinto Permessi',tag:'Burocrazia',accent:'#b69aff'},
  {name:'Cantiere Urbano',tag:'Esterno',accent:'#f0bd59'},
  {name:'Sala Consuntivazione',tag:'Dati',accent:'#72ded0'},
  {name:'Fine Mese: Regno di Mengasi',tag:'Caos',accent:'#ff6f8f'}
];

LEVELS[0].name='Open Space Operativo';
LEVELS[0].desc='Ufficio vivo: scrivanie, sale riunioni, monitor, archivio e percorsi alti.';
LEVELS[1].name='Labirinto Permessi';
LEVELS[1].desc='Corridoi burocratici, sportelli, archivi, timbri e portali intermittenti.';
LEVELS[2].name='Cantiere Urbano';
LEVELS[2].desc='Strada aperta, ponteggi, bobine, tubazioni, mezzi e container.';
LEVELS[3].name='Sala Consuntivazione';
LEVELS[3].desc='Dashboard, nastri pratiche, server, report e NTW ovunque.';
LEVELS[4].name='Fine Mese: Regno di Mengasi';
LEVELS[4].desc='Ufficio collassato, allarmi, portali instabili e arena finale dedicata.';
LEVELS[4].boss='Mengasi';

function v6CullRange(spacing,cam=game?.camera||0){
  const start=Math.floor((cam-500)/spacing)*spacing;
  return [start,cam+1500];
}
function v6Line(x1,y1,x2,y2,color,width=2,alpha=1){
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
}
function v6Label(text,x,y,bg='#0c2335',fg='#fff',w=null){
  ctx.save();ctx.font='bold 9px system-ui';const tw=w||Math.max(70,ctx.measureText(text).width+18);ctx.fillStyle=bg;rr(x,y,tw,22,6,1,0);ctx.fillStyle=fg;ctx.textAlign='center';ctx.fillText(text,x+tw/2,y+15);ctx.restore();
}
function v6ScreenX(worldX,speed,spacing){
  return ((worldX-(game?.camera||0)*speed)%spacing+spacing)%spacing;
}

const v5MakeLevel=makeLevel;
makeLevel=function(idx){
  const res=v5MakeLevel(idx),w=res.w;
  w.v6={scenario:idx,ambientSeed:Math.random()*99};

  const platformTypes=[
    ['desk','cabinet','archive','printerDesk'],
    ['folder','shelf','counter','stamp'],
    ['scaffold','cable','pipe','pallet'],
    ['dashboard','conveyor','server','ntwBlock'],
    ['brokenDesk','glitch','folderStack','portalSlab']
  ][idx];
  w.platforms.forEach((p,i)=>p.v6Type=platformTypes[i%platformTypes.length]);
  w.moving.forEach((p,i)=>p.v6Type=platformTypes[(i+1)%platformTypes.length]);

  const extra=[
    [[1440,300,150,'desk'],[1640,245,145,'cabinet'],[1840,205,130,'archive'],[2015,265,145,'desk']],
    [[1950,300,150,'folder'],[2160,245,150,'shelf'],[2370,205,135,'stamp'],[2570,275,150,'counter']],
    [[2730,300,160,'scaffold'],[2940,245,150,'cable'],[3150,210,150,'pallet'],[3340,280,160,'pipe']],
    [[3020,300,160,'dashboard'],[3240,245,150,'server'],[3450,205,150,'ntwBlock'],[3650,275,160,'conveyor']],
    [[3500,300,160,'brokenDesk'],[3710,240,150,'glitch'],[3920,205,150,'folderStack']]
  ][idx];
  extra.forEach(e=>w.platforms.push({x:e[0],y:e[1],w:e[2],h:18,v6Type:e[3],v6Bonus:true}));

  const bonusXs=[[1640,1840],[2160,2370],[2940,3150],[3240,3450],[3710,3920]][idx];
  bonusXs.forEach((x,j)=>w.collect.push({x:x+55,y:150-j*18,type:j?'ntw':'stamp',taken:false,bob:Math.random()*6.2}));

  w.v6Zones=[];
  if(idx===0)w.v6Zones.push({type:'meeting',x:520,w:430},{type:'archiveRoom',x:1510,w:620});
  if(idx===1)w.v6Zones.push({type:'protocol',x:700,w:520},{type:'deepArchive',x:2000,w:760});
  if(idx===2)w.v6Zones.push({type:'excavation',x:720,w:760},{type:'container',x:2760,w:560});
  if(idx===3)w.v6Zones.push({type:'controlRoom',x:650,w:720},{type:'closingRoom',x:3000,w:760});
  if(idx===4)w.v6Zones.push({type:'collapse',x:700,w:1200},{type:'rift',x:2600,w:1050});

  if(idx===4){
    const ax=w.w-1020;
    w.v6Arena={x:ax,w:940,phase:1,pulse:0};
    w.pits=w.pits.filter(p=>p.x+p.w<ax-40);
    w.hazards=w.hazards.filter(h=>h.x<ax-90);
    w.enemies=w.enemies.filter(e=>e.x<ax-110);
    w.tasks=w.tasks.filter(t=>t.base<ax-100);
    w.platforms=w.platforms.filter(p=>p.x<ax-80);
    w.moving=w.moving.filter(p=>p.x<ax-80);
    w.platforms.push(
      {x:ax+90,y:390,w:180,h:18,v6Type:'mengasiLeft'},
      {x:ax+660,y:390,w:180,h:18,v6Type:'mengasiRight'}
    );
    w.moving.push(
      {x:ax+320,y:330,w:135,h:16,base:ax+320,amp:45,phase:0,v6Type:'mengasiCore',v6Arena:true},
      {x:ax+505,y:265,w:135,h:16,base:ax+505,amp:45,phase:2,v6Type:'mengasiCore',v6Arena:true}
    );
    res.bossZone=ax+80;
  }
  return res;
};
