'use strict';

// BACK OFFICE ADVENTURE DX v5 - layer di espansione sopra il motore v4.
// Tiene il gioco statico su GitHub Pages: niente token o credenziali nel browser.

LEVELS[4].name='Fine Mese: Fusione';
LEVELS[4].desc='Mengozzi e Gervasi superano ogni procedura e si fondono in MENGASI.';
LEVELS[4].boss='Mengasi';
LEVELS[4].par=155;

const V5_KEY='boAdventureDXv5Extras';
const LEADER_KEY='boAdventureDXv5Leaders';
const DIFFS={
  normal:{label:'Normale',difficulty:1,score:1},
  urgent:{label:'Urgente',difficulty:1.16,score:1.25},
  monthend:{label:'Fine Mese',difficulty:1.34,score:1.60}
};
const COSTUMES=[
  {id:'office',name:'Ufficio',icon:'👔',unlock:()=>true},
  {id:'site',name:'Cantiere',icon:'⛑️',unlock:()=>!!save.cleared?.[2]},
  {id:'smart',name:'Smart Working',icon:'🏠',unlock:()=>save.totalStamps>=50},
  {id:'legend',name:'Anti-Mengasi',icon:'👑',unlock:()=>!!save.cleared?.[4]}
];
const RELICS=[
  {id:'badge',name:'Badge leggendario',icon:'🪪'},
  {id:'manuale',name:'Manuale operativo',icon:'📘'},
  {id:'chiave',name:'Chiave archivio',icon:'🗝️'}
];
const OBJECTIVES=[
  [
    {id:'clean',txt:'Completa senza perdere vite',test:g=>g.hitsTaken===0},
    {id:'stamps',txt:'Raccogli almeno 8 marche',test:g=>g.stamps>=8},
    {id:'combo',txt:'Raggiungi combo x4',test:g=>g.maxCombo>=4}
  ],
  [
    {id:'fast',txt:'Chiudi il livello entro 105 secondi',test:(g,t)=>t<=105},
    {id:'secret',txt:'Trova il documento segreto',test:g=>g.secretFound},
    {id:'clean',txt:'Perdi al massimo una vita',test:g=>g.lives>=2}
  ],
  [
    {id:'clean',txt:'Nessun danno da cantiere',test:g=>g.hitsTaken===0},
    {id:'enemy',txt:'Schiaccia almeno 3 nemici',test:g=>(g.v5EnemyKills||0)>=3},
    {id:'relic',txt:'Trova il reperto del livello',test:g=>(g.v5Relics||0)>=1}
  ],
  [
    {id:'combo',txt:'Raggiungi combo x5',test:g=>g.maxCombo>=5},
    {id:'secret',txt:'Trova il documento segreto',test:g=>g.secretFound},
    {id:'ability',txt:'Usa almeno 3 abilità',test:g=>(g.v5Abilities||0)>=3}
  ],
  [
    {id:'mengasi',txt:'Sconfiggi Mengasi',test:g=>g.bossDone},
    {id:'survive',txt:'Termina con almeno 2 vite',test:g=>g.lives>=2},
    {id:'master',txt:'Combo x5 contro la fusione',test:g=>g.maxCombo>=5}
  ]
];
const UPGRADES=[
  {id:'speed',icon:'⚡',name:'Fibra dedicata',desc:'+12% velocità',apply:g=>g.ch.spd*=1.12},
  {id:'jump',icon:'🪽',name:'Scala gerarchica',desc:'+10% salto',apply:g=>g.ch.jump*=1.10},
  {id:'cool',icon:'⏱️',name:'Procedura snella',desc:'-20% cooldown abilità',apply:g=>g.ch.cd*=.80},
  {id:'shield',icon:'🛡️',name:'Copertura operativa',desc:'+1 scudo',apply:g=>g.shield++},
  {id:'score',icon:'📈',name:'Consuntivo perfetto',desc:'+15% punti',apply:g=>g.scoreMult*=1.15},
  {id:'life',icon:'❤️',name:'Permesso straordinario',desc:'+1 vita, massimo 3',apply:g=>g.lives=Math.min(3,g.lives+1)},
  {id:'ability',icon:'✨',name:'Priorità autorizzata',desc:'abilità subito pronta',apply:g=>g.abilityReady=0}
];
const EVENTS=[
  {id:'maintenance',icon:'🖥️',name:'Portale in manutenzione',desc:'Sistema lento: nemici -20%',dur:8500},
  {id:'urgent',icon:'🚨',name:'Urgenza improvvisa',desc:'Più velocità, punti x2',dur:8000},
  {id:'meeting',icon:'👥',name:'Riunione non prevista',desc:'Velocità ridotta',dur:7000},
  {id:'smart',icon:'🏠',name:'Smart Working',desc:'+1 scudo immediato',dur:5500},
  {id:'slow',icon:'🐌',name:'Sistema lento',desc:'Fisica rallentata, finalmente respiri',dur:7500}
];

let v5extra={profile:'Eugenio',difficulty:'normal',costume:'office',touchJoy:false,swap:false,dailyDone:{},archive:{},objectives:{},ghost:{},stats:{playTime:0,runs:0,deaths:0,tasks:0,enemies:0,bosses:0,abilities:0,coffees:0,chars:{},endlessBest:0,minigameBest:0}};
try{Object.assign(v5extra,JSON.parse(localStorage.getItem(V5_KEY)||'{}'));}catch(e){}
v5extra.dailyDone ||= {}; v5extra.archive ||= {}; v5extra.objectives ||= {}; v5extra.ghost ||= {};
v5extra.stats ||= {playTime:0,runs:0,deaths:0,tasks:0,enemies:0,bosses:0,abilities:0,coffees:0,chars:{},endlessBest:0,minigameBest:0};
v5extra.stats.chars ||= {};
let leaders=[];try{leaders=JSON.parse(localStorage.getItem(LEADER_KEY)||'[]');if(!Array.isArray(leaders))leaders=[];}catch(e){leaders=[];}
let difficultyMode=DIFFS[v5extra.difficulty]?v5extra.difficulty:'normal';
let selectedCostume=COSTUMES.some(c=>c.id===v5extra.costume)?v5extra.costume:'office';

function persistV5(){
  v5extra.profile=($('#profileName')?.value||v5extra.profile||'Giocatore').trim().slice(0,18)||'Giocatore';
  v5extra.difficulty=difficultyMode;v5extra.costume=selectedCostume;
  try{localStorage.setItem(V5_KEY,JSON.stringify(v5extra));localStorage.setItem(LEADER_KEY,JSON.stringify(leaders.slice(0,60)));}catch(e){}
  persist();
}

function hashDay(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return Math.abs(h>>>0);}
function dayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function dailyChallenge(){
  const k=dayKey(),n=hashDay(k)%6;
  const arr=[
    {txt:'Completa Open Space con Eugenio',reward:50,test:(g,t)=>g.idx===0&&g.ch.n==='Eugenio'},
    {txt:'Chiudi un livello con combo almeno x5',reward:55,test:g=>g.maxCombo>=5},
    {txt:'Completa un livello senza subire danni',reward:60,test:g=>g.hitsTaken===0},
    {txt:'Raccogli almeno 10 marche in una corsa',reward:45,test:g=>g.stamps>=10},
    {txt:'Trova un documento segreto',reward:50,test:g=>g.secretFound},
    {txt:'Sconfiggi un boss con almeno 2 vite',reward:65,test:g=>g.bossDone&&g.lives>=2}
  ];
  return {key:k,...arr[n]};
}
function updateDailyUI(){
  const d=dailyChallenge(),done=!!v5extra.dailyDone[d.key];
  $('#dailyText').textContent=(done?'✅ ':'')+d.txt;
  $('#dailyReward').textContent=done?'FATTA':'+'+d.reward+' 🟨';
}

function encodeBackup(obj){
  const bytes=new TextEncoder().encode(JSON.stringify(obj));let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s);
}
function decodeBackup(s){
  const raw=atob(s.trim());const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes));
}

function portraitMengasi(){
  try{
    const cv=document.createElement('canvas');cv.width=cv.height=240;const x=cv.getContext('2d');
    const a=imgs.Mengozzi,b=imgs.Gervasi;
    x.fillStyle='#241126';x.fillRect(0,0,240,240);
    x.save();x.beginPath();x.rect(0,0,120,240);x.clip();x.drawImage(a,0,0,240,240);x.restore();
    x.save();x.beginPath();x.rect(120,0,120,240);x.clip();x.drawImage(b,0,0,240,240);x.restore();
    x.strokeStyle='#ffcf62';x.lineWidth=7;x.beginPath();x.moveTo(120,0);x.lineTo(120,240);x.stroke();
    return cv.toDataURL('image/png');
  }catch(e){return FACE_DATA.Mengozzi;}
}

// --- MENU / PROFILI / DIFFICOLTA / COSTUMI ---
const v4RenderMenu=renderMenu;
renderMenu=function(){
  v4RenderMenu();
  $('#profileName').value=v5extra.profile||'Eugenio';
  document.querySelectorAll('.diffbtn').forEach(b=>b.classList.toggle('selected',b.dataset.diff===difficultyMode));
  updateDailyUI();renderCostumes();
  [...$('#roster').children].forEach((b,i)=>{
    const ch=CH[i];if(!ch)return;
    const old=b.querySelector('.charStats');if(old)old.remove();
    const speed=Math.min(100,Math.round(ch.spd/3.8)),jump=Math.min(100,Math.round(ch.jump/9)),cool=Math.min(100,Math.round((18-ch.cd)*7));
    const d=document.createElement('div');d.className='charStats';d.title='Velocità • Salto • Abilità';
    d.innerHTML=`<span><i style="width:${speed}%"></i></span><span><i style="width:${jump}%"></i></span><span><i style="width:${cool}%"></i></span>`;
    b.querySelector('div>div:last-child')?.appendChild(d);
  });
  [...$('#progressGrid').children].forEach((p,i)=>{
    const done=Object.values(v5extra.objectives[i]||{}).filter(Boolean).length;
    if(!p.querySelector('.v5obj')){const d=document.createElement('div');d.className='record v5obj';d.innerHTML=`<span>Obiettivi</span><span>🎯 ${done}/3</span>`;p.appendChild(d);}
  });
};
function renderCostumes(){
  const box=$('#costumeGrid');box.innerHTML='';
  COSTUMES.forEach(c=>{
    const open=c.unlock();if(!open&&selectedCostume===c.id)selectedCostume='office';
    const b=document.createElement('button');b.className='costume'+(selectedCostume===c.id?' selected':'')+(open?'':' locked');b.disabled=!open;
    b.innerHTML=`<span class="ci">${c.icon}</span>${c.name}`;
    b.onclick=()=>{selectedCostume=c.id;persistV5();renderCostumes();};box.appendChild(b);
  });
}
function setDifficulty(id){if(!DIFFS[id])return;difficultyMode=id;persistV5();document.querySelectorAll('.diffbtn').forEach(b=>b.classList.toggle('selected',b.dataset.diff===id));updateStart();}
document.querySelectorAll('.diffbtn').forEach(b=>b.onclick=()=>setDifficulty(b.dataset.diff));
$('#profileSave').onclick=()=>{persistV5();showMenuToast('💾 Profilo salvato');};
function showMenuToast(t){const old=document.title;document.title=t;setTimeout(()=>document.title=old,900);}

// --- LEVEL DESIGN, NPC, RELIQUIE, STAZIONI UPGRADE ---
const v4MakeLevel=makeLevel;
makeLevel=function(idx){
  const L=v4MakeLevel(idx),w=L.w;
  w.relics=[];w.npcs=[];w.upgradeStations=[];
  const alt=[
    [[1300,250,150],[1480,210,150],[1660,250,150]],
    [[1880,205,150],[2070,170,150],[2260,210,150]],
    [[1500,205,150],[1690,165,150],[1880,210,160]],
    [[3100,200,160],[3300,160,160],[3500,205,160]],
    [[2350,190,160],[2550,150,160],[2750,195,160],[3650,180,170]]
  ][idx];
  alt.forEach(p=>w.platforms.push({x:p[0],y:p[1],w:p[2],h:15,shortcut:true}));
  const rid=RELICS[idx%RELICS.length].id;
  w.relics.push({id:rid,x:alt[Math.floor(alt.length/2)][0]+70,y:alt[Math.floor(alt.length/2)][1]-42,taken:false});
  w.upgradeStations.push({x:Math.round(LEVELS[idx].w*.34),y:w.groundY-55,used:false},{x:Math.round(LEVELS[idx].w*.66),y:w.groundY-55,used:false});
  if(idx===2){w.npcs.push({name:'DelVecchio',x:520,y:w.groundY-66,seen:false,text:'“Casco, transenne e poi ne parliamo.”'});w.npcs.push({name:'DelVecchio',x:3210,y:w.groundY-66,seen:false,text:'“Non mi fate salire in ufficio per questa cosa.”'});}
  else w.npcs.push({name:'DelVecchio',x:idx===0?2320:Math.round(LEVELS[idx].w*.55),y:w.groundY-66,seen:false,text:['“Questa la voglio chiusa.”','“Manca qualcosa. Lo sento.”','“Qui vedo troppe pratiche aperte.”','“Il consuntivo non si fa da solo.”','“Se arrivate a Mengasi, non dite che vi avevo avvisato.”'][idx]});

  const extra=[
    [{type:'foglio',x:1700,y:250},{type:'ticket',x:2900,y:w.groundY-42}],
    [{type:'sollecito',x:1080,y:w.groundY-42},{type:'ticket',x:2780,y:w.groundY-42}],
    [{type:'foglio',x:1850,y:230},{type:'riunione',x:3050,y:w.groundY-50}],
    [{type:'sollecito',x:1700,y:w.groundY-42},{type:'foglio',x:3600,y:230}],
    [{type:'ticket',x:1150,y:w.groundY-42},{type:'riunione',x:2700,y:w.groundY-50},{type:'sollecito',x:3700,y:w.groundY-42}]
  ][idx];
  extra.forEach((e,j)=>w.enemies.push({...e,base:e.x,range:100,w:50,h:42,dead:false,phase:j}));
  return L;
};
