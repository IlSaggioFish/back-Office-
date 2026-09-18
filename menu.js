function renderMenu(){
  $('#stLevel').textContent=save.maxLevel+'/5';
  $('#stBest').textContent=save.best;
  $('#stStamp').textContent=save.totalStamps;
  $('#stMichele').textContent=save.michele?'👑':'🔒';
  $('#ngplus').classList.toggle('hidden',!save.ngplus);
  $('#ngplus').textContent=ngPlus?'🔥 NG+ ON':'🔥 NG+ OFF';

  const map=$('#map'); map.innerHTML='';
  LEVELS.forEach((lv,i)=>{
    const locked=i+1>save.maxLevel;
    const b=document.createElement('button');
    b.className='node'+(locked?' locked':'');
    b.disabled=locked;
    const st=save.stars[i]||0;
    b.innerHTML=`<span class="orb">${i+1}</span><b>${lv.name}</b><small>${'★'.repeat(st)}${'☆'.repeat(3-st)}${save.cleared[i]?' • ✅':''}</small>`;
    if(!locked)b.onclick=()=>{
      selectedLevel=i;
      [...map.children].forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected'); updateStart();
    };
    map.appendChild(b);
  });

  const pg=$('#progressGrid'); pg.innerHTML='';
  LEVELS.forEach((lv,i)=>{
    const bestRecords=Object.entries(save.records||{})
      .filter(([k])=>k.startsWith(i+'|'))
      .map(([,v])=>v)
      .sort((a,b)=>b.score-a.score);
    const r=bestRecords[0];
    const st=save.stars[i]||0;
    pg.innerHTML += `<div class="prog"><b>L${i+1} • ${lv.name}</b><div class="pstars">${'★'.repeat(st)}${'☆'.repeat(3-st)}</div><div class="record"><span>Record</span><span>${r?r.score:0}</span></div><div class="record"><span>Segreto</span><span class="secretStat">${save.secrets[i]?'📜 trovato':'—'}</span></div></div>`;
  });

  const ro=$('#roster'); ro.innerHTML='';
  CH.forEach((ch,i)=>{
    const locked=ch.op&&!save.michele;
    const b=document.createElement('button');
    b.className='person'+(locked?' locked':''); b.disabled=locked;
    b.innerHTML=`<img class="avatar" src="${FACE_DATA[ch.n]}"><div><div class="pn ${ch.op?'op':''}">${locked?'🔒 ':''}${ch.n}</div><div class="pr">${ch.role}</div><div class="pd">${ch.desc}</div><div class="chips">${ch.skills.map(s=>`<span class="chip ${s.endsWith('*')?'backup':''}">${s.replace('*',' backup')}</span>`).join('')}</div></div>`;
    if(!locked)b.onclick=()=>{
      selectedChar=i;
      [...ro.children].forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected'); updateStart();
    };
    ro.appendChild(b);
  });
  updateStart();
}
function updateStart(){
  const ok=selectedChar>=0&&selectedLevel>=0;
  $('#start').disabled=!ok;
  $('#start').textContent=ok?`Gioca: ${CH[selectedChar].n} • ${LEVELS[selectedLevel].name}${ngPlus?' • NG+':''}`:'Seleziona livello e personaggio';
}

function makeLevel(idx){
  const lv=LEVELS[idx];
  const w={w:lv.w,groundY:460,pits:[],platforms:[],tasks:[],collect:[],check:[],hazards:[],moving:[],secrets:[],enemies:[],hints:[]};
  const pits=[
    [[1260,1415],[2440,2590]],
    [[760,910],[1690,1860],[2870,3060]],
    [[660,830],[1460,1620],[2350,2550],[3450,3630]],
    [[930,1080],[1980,2160],[3060,3250],[3890,4070]],
    [[650,820],[1370,1540],[2280,2490],[3240,3440],[4100,4310]]
  ][idx];
  w.pits=pits.map(p=>({x:p[0],w:p[1]-p[0]}));

  const P=[
    [[420,380,210],[760,315,170],[1040,360,170],[1560,350,230],[1940,290,180],[2180,370,150],[2780,330,220],[3050,270,170]],
    [[360,375,190],[990,330,180],[1230,270,150],[1460,350,160],[2070,315,210],[2380,250,160],[3200,340,220],[3520,285,170]],
    [[300,360,170],[930,300,200],[1210,365,150],[1740,320,220],[2090,260,160],[2670,355,180],[2980,295,180],[3710,330,220]],
    [[370,375,210],[710,310,170],[1160,345,230],[1550,285,170],[2290,350,220],[2610,280,170],[3350,340,210],[3690,260,180],[4140,330,200]],
    [[330,370,180],[870,310,180],[1120,255,150],[1620,345,210],[1920,280,170],[2570,360,180],[2860,300,160],[3520,340,220],[3840,275,180],[4450,330,210]]
  ][idx];
  P.forEach(p=>w.platforms.push({x:p[0],y:p[1],w:p[2],h:18}));

  if(idx>=2){
    w.moving.push({x:1180,y:390,w:140,h:16,base:1180,amp:120,phase:0});
    w.moving.push({x:2840,y:350,w:130,h:16,base:2840,amp:150,phase:2});
  }
  [idx===0?1050:1200,idx===0?2250:2500,idx>=3?3600:null].filter(Boolean)
    .forEach(x=>w.check.push({x,y:w.groundY-64,hit:false}));

  for(let x=260;x<lv.w-550;x+=240){
    if(w.pits.some(p=>x>p.x&&x<p.x+p.w))continue;
    const k=(x/240)%11===0?'coffee':(x/240)%9===0?'shield':(x/240)%5===0?'ntw':'stamp';
    w.collect.push({x,y:340-(Math.floor(x/240)%3)*35,type:k,taken:false,bob:Math.random()*6.2});
  }

  const cats=['BD','CONS','PERM','SIC'];
  let x=540,i=0;
  while(x<lv.w-760){
    if(!w.pits.some(p=>x>p.x-80&&x<p.x+p.w+80))
      w.tasks.push({x,y:w.groundY-46,w:52,h:46,cat:cats[(i+idx)%4],base:x,range:70+(idx*8),dead:false});
    x+=idx>=3?290:355;i++;
  }

  if(idx===0||idx===3)[650,1860,2960].forEach(x=>w.hazards.push({x,y:w.groundY-44,w:54,h:44,type:'printer'}));
  if(idx===2||idx===4)[1040,1910,2780,3710].forEach(x=>w.hazards.push({x,y:w.groundY-30,w:60,h:30,type:'cone'}));

  w.secrets.push({x:idx===0?1820:idx===1?2260:idx===2?3100:idx===3?3450:3980,y:180,taken:false});

  if(idx===0 || idx===4){
    [900,2100,3150].forEach((x,j)=>w.enemies.push({type:'pec',x,y:245+j*50,base:x,range:130,w:44,h:32,dead:false,phase:j}));
  }
  if(idx===1 || idx===4){
    [1350,2500,3500].forEach((x,j)=>w.enemies.push({type:'allegato',x,y:250,base:x,w:42,h:42,dead:false,phase:j}));
    [1850,3300].forEach(x=>w.enemies.push({type:'portale',x,y:w.groundY-80,w:64,h:80,dead:false,phase:0}));
  }
  if(idx===2 || idx===4){
    [1180,2050,2980,3890].forEach((x,j)=>w.enemies.push({type:'scaduta',x,y:w.groundY-38,base:x,range:95,w:50,h:38,dead:false,phase:j}));
  }
  if(idx===3){
    [1450,2800,4000].forEach((x,j)=>w.enemies.push({type:'pec',x,y:220+j*45,base:x,range:150,w:44,h:32,dead:false,phase:j}));
    [2250,3550].forEach(x=>w.enemies.push({type:'portale',x,y:w.groundY-80,w:64,h:80,dead:false,phase:0}));
  }

  if(idx===0){
    w.hints=[
      {x:220,text:'← → MUOVITI'},
      {x:560,text:'SPAZIO / SALTO'},
      {x:900,text:'Tieni E vicino alle pratiche per gestirle'},
      {x:1500,text:'☕ Macchinetta = checkpoint'},
      {x:1750,text:'Ci sono aree segrete…'}
    ];
  }
  return {lv,w,bossZone:lv.boss?lv.w-760:null};
}

function startGame(){
  if(selectedLevel<0||selectedChar<0)return;
  audioReady();
  const ch=CH[selectedChar],L=makeLevel(selectedLevel);
  const difficulty=ngPlus?1.22:1;
  game={
    idx:selectedLevel,ch,lv:L.lv,w:L.w,bossZone:L.bossZone,difficulty,
    score:0,lives:3,stamps:0,shield:(ch.n==='Tiziano'||ch.n==='Daniele'?1:ch.n==='Michele'?2:0),
    camera:0,cameraShake:0,checkpoint:{x:120,y:360},paused:false,running:true,start:performance.now(),
    particles:[],boss:null,bossStarted:false,bossDone:false,projectiles:[],permCount:0,
    abilityReady:0,activeUntil:0,abilityFxUntil:0,secretFound:false,hitsTaken:0,
    combo:1,maxCombo:1,lastGood:0,turboUntil:0,
    p:{x:120,y:360,w:44,h:62,vx:0,vy:0,onGround:false,coyote:0,inv:0,anim:0,facing:1,hurt:0}
  };
  $('#menu').classList.add('hidden'); $('#game').classList.remove('hidden');
  $('#lvhud').textContent=selectedLevel+1; $('#charhud').textContent=ch.n;
  $('#levelPill').textContent=`L${selectedLevel+1} • ${L.lv.name}${ngPlus?' • NG+':''}`;
  $('#status').textContent=selectedLevel===0?'Tutorial: muoviti verso destra e prova i comandi.':'Tieni E / GESTISCI vicino alle pratiche. Fuori ruolo puoi inoltrarle.';
  $('#bossPill').classList.remove('show');
  updateHUD(); last=performance.now(); cancelAnimationFrame(raf);
  startMusic(L.lv.theme);
  raf=requestAnimationFrame(loop); window.scrollTo({top:0,behavior:'smooth'});
}

function fmt(sec){sec=Math.max(0,Math.floor(sec));return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');}
function updateHUD(){
  if(!game)return;
  $('#score').textContent=game.score; $('#stamps').textContent=game.stamps; $('#shield').textContent=game.shield;
  $('#combohud').textContent='x'+game.combo; $('#combohud').classList.toggle('comboHot',game.combo>=3);
  $('#timehud').textContent=fmt((performance.now()-game.start)/1000);
  const life=$('#lifeFaces'); life.innerHTML='';
  for(let i=0;i<3;i++){
    const im=document.createElement('img'); im.src=FACE_DATA[game.ch.n]; if(i>=game.lives)im.classList.add('off'); life.appendChild(im);
  }
  const left=Math.max(0,(game.abilityReady-performance.now())/1000); $('#cd').textContent=left>0?left.toFixed(1)+'s':'PRONTA';
}
function showMsg(t,ms=1300){
  const m=$('#msg'); m.innerHTML=t; m.classList.add('show');
  clearTimeout(showMsg.t); showMsg.t=setTimeout(()=>m.classList.remove('show'),ms);
}
function groundAt(x){return game.w.pits.some(p=>x>p.x&&x<p.x+p.w)?999:game.w.groundY;}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function particle(x,y,text,color='#fff'){game.particles.push({x,y,text,color,life:900,vy:-45});}
function addScore(v,x=game.p.x,y=game.p.y){v=Math.round(v);game.score+=v;particle(x,y,'+'+v,'#ffe06d');updateHUD();}
function comboScore(v,x=game.p.x,y=game.p.y){
  const now=performance.now();
  game.combo=(now-game.lastGood<3800)?Math.min(5,game.combo+1):1;
  game.lastGood=now;game.maxCombo=Math.max(game.maxCombo,game.combo);
  const total=Math.round(v*game.combo);
  if(game.combo>=3)particle(x,y,'COMBO x'+game.combo,'#ffca4d');
  addScore(total,x,y);
}
function resetCombo(){game.combo=1;game.lastGood=0;updateHUD();}

