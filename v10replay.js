/* BACK OFFICE ADVENTURE DX v10 - REPLAY, GHOST CONDIVISIBILE, HUB DIALOGHI */
'use strict';

v10.replays ||= {};
v10.importedReplay ||= null;
v10.replayEnabled = v10.replayEnabled !== false;
v10.hubChats ||= {};

const V10_REPLAY_SAMPLE = 140;
const V10_REPLAY_MAX_POINTS = 1700;
const V10_REPLAY_DIALOGS = {
  Farris:[
    'Farris: “Se i dati tornano al primo colpo, controlla di nuovo. È sospetto.”',
    'Farris: “Consuntivazione tranquilla. Frase pronunciata da nessuno, mai.”'
  ],
  Yurii:[
    'Yurii: “Io prenderei la strada veloce. Che cosa potrebbe andare storto?”',
    'Yurii: “Il dash risolve molti problemi. Non quelli amministrativi, purtroppo.”'
  ],
  Luca:[
    'Luca: “Hai visto il percorso alto? Lì hanno nascosto qualcosa.”',
    'Luca: “Il problema non è saltare. È dove atterri.”'
  ],
  Tiziano:[
    'Tiziano: “Prima guardi il percorso. Poi corri. In quest’ordine, possibilmente.”',
    'Tiziano: “Fine mese: quando anche il cronometro ti giudica.”'
  ],
  Giada:[
    'Giada: “Se trovi un allegato disperso, non chiederti come ci sia arrivato lassù.”',
    'Giada: “Supporto rapido sì. Miracoli, previa autorizzazione.”'
  ]
};

(function initV10ReplayUI(){
  const buttons=document.querySelector('#v7CareerBox .v7buttons');
  if(buttons&&!document.querySelector('#replayBtn')){
    const b=document.createElement('button');
    b.id='replayBtn';b.className='secondary';b.textContent='🎬 Replay';
    const hubBtn=document.querySelector('#hubBtn');
    if(hubBtn?.nextSibling)buttons.insertBefore(b,hubBtn.nextSibling);else buttons.prepend(b);
    b.onclick=openReplayModal;
  }
  const shell=document.querySelector('.shell');
  if(shell&&!document.querySelector('#v10GhostDelta')){
    const g=document.createElement('div');g.id='v10GhostDelta';g.className='v10GhostDelta hidden';g.textContent='👻 Ghost';shell.appendChild(g);
  }
  ensureReplayModal();
})();

function ensureReplayModal(){
  let m=document.querySelector('#v10ReplayModal');if(m)return m;
  m=document.createElement('div');m.id='v10ReplayModal';m.className='modal hidden';
  m.innerHTML=`<div class="mcard v10ReplayCard">
    <h2>🎬 Replay & Ghost</h2>
    <p>Salva la tua corsa migliore, trasformala in un codice e falla inseguire a un collega. Finalmente una forma di concorrenza interna senza Excel.</p>
    <div id="v10ReplayList" class="v10ReplayList"></div>
    <div class="v10ReplayTools">
      <textarea id="v10ReplayCode" placeholder="Codice replay"></textarea>
      <div class="v10ReplayActions">
        <button id="v10ReplayImport" class="primary">Importa codice</button>
        <button id="v10ReplayToggle" class="secondary">Ghost ON</button>
        <button id="v10ReplayClearImport" class="secondary">Rimuovi importato</button>
      </div>
      <div id="v10ReplayStatus" class="note"></div>
    </div>
    <button id="v10ReplayClose" class="secondary">Chiudi</button>
  </div>`;
  document.body.appendChild(m);
  $('#v10ReplayClose').onclick=()=>m.classList.add('hidden');
  $('#v10ReplayImport').onclick=importReplayCode;
  $('#v10ReplayToggle').onclick=()=>{v10.replayEnabled=!v10.replayEnabled;persistV10();renderReplayModal();};
  $('#v10ReplayClearImport').onclick=()=>{v10.importedReplay=null;persistV10();renderReplayModal('Replay importato rimosso.');};
  return m;
}

function openReplayModal(){ensureReplayModal();renderReplayModal();$('#v10ReplayModal').classList.remove('hidden');}
function replayLevelName(i){return LEVELS?.[i]?.name||`Livello ${i+1}`;}
function renderReplayModal(status=''){
  const list=$('#v10ReplayList');if(!list)return;
  const imported=v10.importedReplay;
  list.innerHTML=[0,1,2,3,4].map(i=>{
    const r=v10.replays?.[i];
    return `<div class="v10ReplayRow ${r?'has':'empty'}">
      <div><b>${i+1}. ${replayLevelName(i)}</b><span>${r?`${r.char} • ${v10FmtTime(r.time)} • ${r.points.length} campioni`:'Nessun replay completato'}</span></div>
      <button class="secondary" data-export="${i}" ${r?'':'disabled'}>Copia codice</button>
    </div>`;
  }).join('')+(imported?`<div class="v10ReplayImported"><b>📥 Ghost importato</b><span>${replayLevelName(imported.level)} • ${imported.char} • ${v10FmtTime(imported.time)}</span></div>`:'');
  list.querySelectorAll('[data-export]').forEach(b=>b.onclick=()=>exportReplay(Number(b.dataset.export)));
  const toggle=$('#v10ReplayToggle');if(toggle)toggle.textContent=v10.replayEnabled?'👻 Ghost ON':'👻 Ghost OFF';
  if($('#v10ReplayStatus'))$('#v10ReplayStatus').textContent=status||'Il ghost importato ha priorità sul tuo record locale nello stesso livello.';
}
function v10FmtTime(t){const s=Math.max(0,Number(t)||0);const m=Math.floor(s/60),r=s-m*60;return `${m}:${r.toFixed(2).padStart(5,'0')}`;}
function v10EncodeReplay(obj){
  const bytes=new TextEncoder().encode(JSON.stringify(obj));let bin='';
  for(let i=0;i<bytes.length;i+=0x6000)bin+=String.fromCharCode(...bytes.subarray(i,i+0x6000));
  return btoa(bin);
}
function v10DecodeReplay(code){
  const bin=atob(code.trim());const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}
function validateReplay(r){
  if(!r||r.v!==10||!Number.isInteger(r.level)||r.level<0||r.level>4||!Array.isArray(r.points)||r.points.length<5||r.points.length>V10_REPLAY_MAX_POINTS)return false;
  if(typeof r.char!=='string'||!Number.isFinite(Number(r.time)))return false;
  return r.points.every(p=>Array.isArray(p)&&p.length>=4&&p.slice(0,4).every(Number.isFinite));
}
function exportReplay(level){
  const r=v10.replays?.[level];if(!r)return;
  const code=v10EncodeReplay({v:10,level:r.level,char:r.char,time:r.time,points:r.points});
  const ta=$('#v10ReplayCode');if(ta){ta.value=code;ta.focus();ta.select();}
  navigator.clipboard?.writeText(code).catch(()=>{});
  renderReplayModal(`Codice di ${replayLevelName(level)} pronto e copiato, se il browser lo consente.`);
  if(ta){ta.value=code;ta.focus();ta.select();}
}
function importReplayCode(){
  const ta=$('#v10ReplayCode');try{
    const r=v10DecodeReplay(ta?.value||'');if(!validateReplay(r))throw new Error('formato non valido');
    v10.importedReplay={v:10,level:r.level,char:r.char,time:Number(r.time),points:r.points.map(p=>[Math.round(p[0]),Math.round(p[1]),Math.round(p[2]),p[3]<0?-1:1])};
    v10.replayEnabled=true;persistV10();renderReplayModal(`Ghost importato: ${replayLevelName(r.level)} • ${r.char}.`);
  }catch(e){renderReplayModal('Codice non valido. La burocrazia digitale ha respinto la pratica.');}
}

// ---------- REGISTRAZIONE RUN ----------
const v10StartGameReplay=startGame;
startGame=function(){
  v10StartGameReplay();if(!game)return;
  game.v10ReplayClock=0;game.v10ReplayLastSample=-V10_REPLAY_SAMPLE;game.v10ReplayPoints=[];
  const ghost=v10ActiveReplay();
  const tag=$('#v10GhostDelta');if(tag){tag.classList.toggle('hidden',!ghost||!v10.replayEnabled);if(ghost)tag.textContent=`👻 ${ghost.char} • ${v10FmtTime(ghost.time)}`;}
};

const v10UpdateReplay=update;
update=function(dt,now){
  v10UpdateReplay(dt,now);if(!game||!game.running||game.paused)return;
  game.v10ReplayClock=(game.v10ReplayClock||0)+dt;
  const mode=game.mode||'story';
  if(mode!=='bossrush'&&mode!=='endless'&&game.v10ReplayPoints&&game.v10ReplayPoints.length<V10_REPLAY_MAX_POINTS&&game.v10ReplayClock-(game.v10ReplayLastSample||0)>=V10_REPLAY_SAMPLE){
    game.v10ReplayLastSample=game.v10ReplayClock;
    game.v10ReplayPoints.push([Math.round(game.v10ReplayClock),Math.round(game.p.x),Math.round(game.p.y),game.p.facing<0?-1:1]);
  }
  updateReplayDelta();
};

function saveRunReplay(g){
  if(!g?.v10ReplayPoints||g.v10ReplayPoints.length<8)return;
  const mode=g.mode||'story';if(mode==='bossrush'||mode==='endless')return;
  const time=(g.v10ReplayClock||0)/1000,idx=g.idx;
  const old=v10.replays?.[idx];
  const data={v:10,level:idx,char:g.ch?.n||'Eugenio',time,points:g.v10ReplayPoints.slice(0,V10_REPLAY_MAX_POINTS)};
  if(!old||time<old.time){v10.replays[idx]=data;persistV10();}
}
const v10ClearReplay=clearLevel;
clearLevel=function(){if(game)saveRunReplay(game);return v10ClearReplay();};

// ---------- GHOST VISIVO ----------
function v10ActiveReplay(){
  if(!game||!v10.replayEnabled)return null;
  const imp=v10.importedReplay;if(imp&&imp.level===game.idx)return imp;
  const local=v10.replays?.[game.idx];return local||null;
}
function replayPointAt(r,t){
  const a=r?.points;if(!a?.length)return null;
  let lo=0,hi=a.length-1;while(lo<hi){const mid=(lo+hi+1)>>1;if(a[mid][0]<=t)lo=mid;else hi=mid-1;}
  const p=a[lo],n=a[Math.min(a.length-1,lo+1)];if(!n||n===p)return p;
  const span=Math.max(1,n[0]-p[0]),k=Math.max(0,Math.min(1,(t-p[0])/span));
  return [t,p[1]+(n[1]-p[1])*k,p[2]+(n[2]-p[2])*k,k<.5?p[3]:n[3]];
}
function drawReplayGhost(){
  const r=v10ActiveReplay();if(!r||!game?.running)return;
  const p=replayPointAt(r,game.v10ReplayClock||0);if(!p)return;
  const gx=p[1]-game.camera,gy=p[2],f=p[3]||1;if(gx<-90||gx>C.width+90)return;
  const im=imgs?.[r.char];ctx.save();ctx.globalAlpha=.32;ctx.fillStyle='#74ecff';ctx.strokeStyle='#9df4ff';ctx.lineWidth=3;
  ctx.beginPath();ctx.ellipse(gx+22,gy+game.p.h+4,23,6,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.38;ctx.strokeStyle='#8cecff';ctx.lineWidth=7;ctx.lineCap='round';const run=Math.sin((game.v10ReplayClock||0)/70)*8;
  ctx.beginPath();ctx.moveTo(gx+17,gy+42);ctx.lineTo(gx+10-run,gy+game.p.h-5);ctx.moveTo(gx+27,gy+42);ctx.lineTo(gx+34+run,gy+game.p.h-5);ctx.stroke();
  ctx.fillStyle='#55d9ff';ctx.fillRect(gx+8,gy+23,28,35);
  ctx.beginPath();ctx.arc(gx+22,gy+18,20,0,Math.PI*2);ctx.clip();if(im?.complete)ctx.drawImage(im,gx+2,gy-2,40,40);else{ctx.fillStyle='#d7f7ff';ctx.fillRect(gx+2,gy-2,40,40);}ctx.restore();
  ctx.save();ctx.globalAlpha=.55;ctx.fillStyle='#c7f8ff';ctx.font='bold 7px system-ui';ctx.textAlign='center';ctx.fillText(`GHOST • ${r.char}`,gx+22,gy-12);ctx.restore();
}
function updateReplayDelta(){
  const el=$('#v10GhostDelta'),r=v10ActiveReplay();if(!el||!r||!game?.running){el?.classList.add('hidden');return;}
  const p=replayPointAt(r,game.v10ReplayClock||0);if(!p)return;
  const gap=game.p.x-p[1],sec=Math.min(9.9,Math.abs(gap)/300);el.classList.remove('hidden','ahead','behind');
  if(Math.abs(gap)<18){el.textContent='👻 Ghost • PARI';return;}
  if(gap>0){el.classList.add('ahead');el.textContent=`👻 AVANTI ~${sec.toFixed(1)}s`;}
  else{el.classList.add('behind');el.textContent=`👻 DIETRO ~${sec.toFixed(1)}s`;}
}
const v10DrawReplay=draw;
draw=function(){v10DrawReplay();if(!game)return;drawReplayGhost();};

// ---------- HUB: COLLEGHI INTERATTIVI ----------
function v10WalkerAt(name,now=performance.now()){
  const n=V10_HUB_WALKERS?.find?.(x=>x.name===name);if(!n)return null;const t=now/1000,wave=(Math.sin(t*n.speed+n.phase)+1)/2;return n.from+(n.to-n.from)*wave;
}
function v10NearbyWalker(){
  if(!hub?.open)return null;let best=null,d=999;
  for(const n of V10_HUB_WALKERS||[]){const x=v10WalkerAt(n.name),dd=Math.abs(hub.x-x);if(dd<d){d=dd;best=n;}}
  return d<34?best:null;
}
function v10HubBubble(text){
  const card=document.querySelector('#hubModal .hubCard');if(!card)return;
  let b=$('#v10HubBubble');if(!b){b=document.createElement('div');b.id='v10HubBubble';b.className='v10HubBubble';card.appendChild(b);}
  b.textContent=text;b.classList.add('show');clearTimeout(v10HubBubble.t);v10HubBubble.t=setTimeout(()=>b.classList.remove('show'),3000);
}
const v10HubInteractReplay=hubInteract;
hubInteract=function(){
  const n=v10NearbyWalker();if(n){const arr=V10_REPLAY_DIALOGS[n.name]||[`${n.name}: “Tutto sotto controllo.”`];const k=((v10.hubChats[n.name]||0)+1)%arr.length;v10.hubChats[n.name]=k;persistV10();v10HubBubble(arr[k]);return;}
  return v10HubInteractReplay();
};

const v10DrawHubReplay=drawHub;
drawHub=function(now){
  v10DrawHubReplay(now);const n=v10NearbyWalker();if(!n)return;const c=$('#hubCanvas');if(!c)return;const x=c.getContext('2d'),px=v10WalkerAt(n.name,now);x.save();x.globalAlpha=.9;x.strokeStyle='#78e3ff';x.lineWidth=2;x.beginPath();x.arc(px,254,20+Math.sin(now/120)*2,0,Math.PI*2);x.stroke();x.fillStyle='#e9fbff';x.font='bold 8px system-ui';x.textAlign='center';x.fillText('E / A • PARLA',px,224);x.restore();
};

// ---------- MENU ----------
const v10RenderMenuReplay=renderMenu;
renderMenu=function(){v10RenderMenuReplay();const b=$('#replayBtn');if(b){const n=Object.keys(v10.replays||{}).length;b.textContent=`🎬 Replay${n?` (${n})`:''}`;}};
renderMenu();
