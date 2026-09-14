const FACE_DATA = window.FACE_DATA;

'use strict';

const $ = s => document.querySelector(s);
const C = $('#canvas');
const ctx = C.getContext('2d');
const imgs = {};
for (const [k,v] of Object.entries(FACE_DATA)) {
  const im = new Image();
  im.src = v;
  imgs[k] = im;
}
$('#delFace').src = FACE_DATA.DelVecchio;
$('#creditsFace').src = FACE_DATA.DelVecchio;

const CAT = {BD:'Banca Dati', CONS:'Consuntivazione', PERM:'Permessi', SIC:'Sicurezza'};
const ICON = {BD:'🗄️', CONS:'📊', PERM:'📝', SIC:'🦺'};

const CH = [
 {n:'Eugenio',skills:['BD','CONS','PERM*','SIC*'],spd:310,jump:790,role:'Versatile',desc:'X: Jolly. Archivia la pratica incompatibile più vicina.',ability:'JOLLY',cd:11,color:'#56caff'},
 {n:'Farris',skills:['BD','CONS'],spd:320,jump:760,role:'Banca Dati / Consuntivazione',desc:'X: Data Burst. Chiude BD e CONS nell’area.',ability:'DATA BURST',cd:12,color:'#79dba2'},
 {n:'Yurii',skills:['BD','CONS'],spd:355,jump:790,role:'Agile',desc:'X: Dash operativo in avanti.',ability:'DASH',cd:7,color:'#ffca67'},
 {n:'Luca',skills:['BD','CONS'],spd:305,jump:855,role:'Saltatore',desc:'X: Super salto anche in aria.',ability:'SUPER SALTO',cd:8,color:'#c1a1ff'},
 {n:'Tiziano',skills:['BD','CONS'],spd:315,jump:770,role:'Riferimento operativo',desc:'X: Scudo operativo.',ability:'SCUDO',cd:14,color:'#ff9a82'},
 {n:'Daniele',skills:['CONS','SIC'],spd:300,jump:755,role:'Safety',desc:'X: Safety Field, 4 secondi invulnerabile.',ability:'SAFETY FIELD',cd:15,color:'#79e0e8'},
 {n:'Dalila',skills:['PERM'],spd:305,jump:785,role:'Permessi',desc:'X: Permesso Express. Chiude i PERM vicini.',ability:'PERMESSO EXPRESS',cd:11,color:'#ff9bc4'},
 {n:'Giada',skills:['PERM'],spd:325,jump:785,role:'Supporto Permessi',desc:'X: Supporto, ottiene 1 scudo.',ability:'SUPPORTO',cd:16,color:'#f5bd6d'},
 {n:'Michele',skills:['BD','CONS','PERM','SIC'],spd:370,jump:890,role:'OP • Responsabile',desc:'X: Modalità OP, turbo + invulnerabilità.',ability:'MODALITÀ OP',cd:10,color:'#ffd34d',op:true}
];

const LEVELS = [
 {name:'Open Space',desc:'Scrivanie, stampanti, PEC volanti e tutorial.',theme:'office',w:3600,boss:null,par:85},
 {name:'Permessi & Autorizzazioni',desc:'Portali offline, allegati mancanti e Mengozzi.',theme:'permits',w:4250,boss:'Mengozzi',par:105},
 {name:'Il Cantiere',desc:'Transenne, pratiche scadute e Gervasi.',theme:'site',w:4500,boss:'Gervasi',par:115},
 {name:'La Consuntivazione',desc:'NTW, report, portali e Mengozzi fase avanzata.',theme:'cons',w:4700,boss:'Mengozzi',par:120},
 {name:'Fine Mese',desc:'Tutto insieme. Mengozzi + Gervasi.',theme:'final',w:5150,boss:'Doppio',par:145}
];

const SAVE_KEY = 'boAdventureDXv3';
const OLD_KEY = 'boAdventureDXv2';
let save = {
  maxLevel:1,best:0,totalStamps:0,michele:false,cleared:[0,0,0,0,0],
  stars:[0,0,0,0,0],secrets:[0,0,0,0,0],records:{},ngplus:false
};
try {
  const old = JSON.parse(localStorage.getItem(OLD_KEY) || '{}');
  if (old && Object.keys(old).length) {
    save.maxLevel = old.maxLevel || save.maxLevel;
    save.best = old.best || 0;
    save.totalStamps = old.totalStamps || 0;
    save.michele = !!old.michele;
    save.cleared = old.cleared || save.cleared;
  }
  Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'));
} catch(e) {}
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch(e){} };

let selectedLevel = -1, selectedChar = -1, ngPlus = false;
let game = null, raf = 0, last = 0;
let keys = {left:false,right:false,jump:false};
let jumpPressedAt = -9999, jumpReleased = true;
let audioOn = true, audioCtx = null, deferredInstall = null;
let musicTimer = null, musicStep = 0;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstall = e;
  $('#install').classList.remove('hidden');
});
$('#install').addEventListener('click', async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  $('#install').classList.add('hidden');
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}

function audioReady(){
  if (!audioOn) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch(e){}
}
function tone(f,d=.07,type='sine',v=.035,delay=0){
  if (!audioOn || !audioCtx) return;
  const o=audioCtx.createOscillator(), g=audioCtx.createGain(), t=audioCtx.currentTime+delay;
  o.type=type; o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t+d);
}
function sfx(k){
  audioReady(); if(!audioCtx) return;
  if(k==='jump'){tone(430,.05);tone(620,.07,'sine',.025,.04)}
  if(k==='coin'){tone(900,.04);tone(1280,.06,'sine',.03,.04)}
  if(k==='good'){tone(630,.05);tone(850,.07,'sine',.03,.04)}
  if(k==='hurt'){tone(170,.17,'sawtooth',.05);tone(110,.2,'square',.025,.04)}
  if(k==='ability'){[500,710,920].forEach((f,i)=>tone(f,.1,'sine',.035,i*.045))}
  if(k==='boss'){tone(130,.15,'sawtooth',.05);tone(190,.15,'square',.035,.1)}
  if(k==='clear'){[523,659,784,1047].forEach((f,i)=>tone(f,.18,'sine',.04,i*.08))}
  if(k==='over'){[330,247,196,147].forEach((f,i)=>tone(f,.22,'sawtooth',.04,i*.13))}
}
function startMusic(theme){
  stopMusic(); if(!audioOn) return; audioReady();
  const scales = {
    office:[220,277,330,440], permits:[196,247,294,392], site:[174,220,261,349],
    cons:[207,261,311,415], final:[146,196,233,293]
  };
  const notes = scales[theme] || scales.office;
  musicStep = 0;
  musicTimer = setInterval(() => {
    if(!game || !game.running || game.paused || !audioOn) return;
    const n = notes[musicStep++ % notes.length];
    tone(n,.18,'triangle',.009);
    if(musicStep%4===0) tone(n/2,.25,'sine',.006);
  }, 430);
}
function stopMusic(){ if(musicTimer){clearInterval(musicTimer);musicTimer=null;} }

function skillBase(x){ return x.replace('*',''); }
function hasSkill(ch,c){ return ch.skills.some(s=>skillBase(s)===c); }
function isBackup(ch,c){ return ch.skills.includes(c+'*'); }
function mult(ch,c){
  let m=1;
  if(ch.n==='Farris'&&(c==='BD'||c==='CONS'))m*=1.25;
  if(ch.n==='Daniele'&&c==='SIC')m*=1.5;
  if(ch.n==='Dalila'&&c==='PERM')m*=1.5;
  if(ch.n==='Michele')m*=1.5;
  if(ngPlus)m*=1.25;
  return m;
}
function recKey(level,ch){ return level+'|'+ch; }

