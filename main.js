function loop(now){
  if(!game||!game.running)return;
  const dt=Math.min(34,now-last);last=now;
  if(!game.paused)update(dt,now);
  draw();raf=requestAnimationFrame(loop);
}

function clearLevel(){
  if(!game||!game.running)return;
  game.running=false;cancelAnimationFrame(raf);stopMusic();sfx('clear');
  const idx=game.idx,time=(performance.now()-game.start)/1000;
  let stars=1;if(game.lives>=2)stars++;if(game.secretFound||time<=game.lv.par)stars++;
  save.stars[idx]=Math.max(save.stars[idx]||0,stars);
  if(game.secretFound)save.secrets[idx]=1;
  save.cleared[idx]=1;save.best=Math.max(save.best,game.score);save.totalStamps+=game.stamps;
  if(idx+2<=5)save.maxLevel=Math.max(save.maxLevel,idx+2);
  let newM=false,newNG=false;
  if(idx===4&&!save.michele){save.michele=true;newM=true;}
  if(idx===4&&!save.ngplus){save.ngplus=true;newNG=true;}
  const key=recKey(idx,game.ch.n),old=save.records[key];
  if(!old||game.score>old.score||time<old.time)save.records[key]={score:Math.max(game.score,old?.score||0),time:Math.min(time,old?.time||99999),stars};
  persist();

  $('#stars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);
  $('#clearTitle').textContent=idx===4?'FINE MESE SOPRAVVISSUTO!':'Livello completato!';
  $('#results').innerHTML=`<div>Tempo<b>${fmt(time)}</b></div><div>Punti<b>${game.score}</b></div><div>Marche<b>${game.stamps}</b></div><div>Combo max<b>x${game.maxCombo}</b></div>`;
  $('#unlock').classList.toggle('hidden',!newM);$('#ngUnlock').classList.toggle('hidden',!newNG);
  $('#next').classList.toggle('hidden',idx===4);$('#creditsBtn').classList.toggle('hidden',idx!==4);
  $('#clear').classList.remove('hidden');
}
function gameOver(){
  if(!game||!game.running)return;
  game.running=false;cancelAnimationFrame(raf);stopMusic();
  save.best=Math.max(save.best,game.score);save.totalStamps+=game.stamps;persist();sfx('over');
  $('#goText').textContent=`${game.ch.n} • ${game.lv.name} • ${game.score} punti • ${game.stamps} marche`;
  $('#gameover').classList.remove('hidden');
}
function backMenu(){
  if(game){game.running=false;cancelAnimationFrame(raf);}stopMusic();game=null;
  $('#game').classList.add('hidden');$('#menu').classList.remove('hidden');$('#gameover').classList.add('hidden');$('#clear').classList.add('hidden');$('#credits').classList.add('hidden');
  selectedLevel=-1;selectedChar=-1;renderMenu();window.scrollTo({top:0,behavior:'smooth'});
}

function pressJump(){keys.jump=true;jumpPressedAt=performance.now();jumpReleased=true;}
function releaseJump(){keys.jump=false;}
function bindHold(el,key){
  el.addEventListener('pointerdown',e=>{e.preventDefault();keys[key]=true;audioReady();});
  for(const ev of ['pointerup','pointercancel','pointerleave'])el.addEventListener(ev,e=>{e.preventDefault();keys[key]=false;});
}
bindHold($('#left'),'left');bindHold($('#right'),'right');
$('#jump').addEventListener('pointerdown',e=>{e.preventDefault();pressJump();});
for(const ev of ['pointerup','pointercancel','pointerleave'])$('#jump').addEventListener(ev,e=>{e.preventDefault();releaseJump();});
$('#ability').addEventListener('click',useAbility);
document.addEventListener('keydown',e=>{
  if(['ArrowLeft','a','A'].includes(e.key))keys.left=true;
  if(['ArrowRight','d','D'].includes(e.key))keys.right=true;
  if(['ArrowUp','w','W',' '].includes(e.key)&&!keys.jump){pressJump();e.preventDefault();}
  if(['x','X'].includes(e.key)){useAbility();e.preventDefault();}
  if(e.key==='Escape'&&game)togglePause();
});
document.addEventListener('keyup',e=>{
  if(['ArrowLeft','a','A'].includes(e.key))keys.left=false;
  if(['ArrowRight','d','D'].includes(e.key))keys.right=false;
  if(['ArrowUp','w','W',' '].includes(e.key))releaseJump();
});

function togglePause(){
  if(!game||!game.running)return;
  game.paused=!game.paused;$('#pause').textContent=game.paused?'▶ Riprendi':'☕ Pausa';
  $('#status').textContent=game.paused?'Pausa caffè. Il motore fisico approva.':'Si ricomincia.';
}

$('#start').onclick=startGame;
$('#audio').onclick=e=>{
  audioOn=!audioOn;e.currentTarget.textContent=audioOn?'🔊 Audio':'🔇 Audio';
  if(audioOn){audioReady();sfx('coin');if(game?.running)startMusic(game.lv.theme);}else stopMusic();
};
$('#ngplus').onclick=e=>{ngPlus=!ngPlus;e.currentTarget.textContent=ngPlus?'🔥 NG+ ON':'🔥 NG+ OFF';updateStart();};
$('#pause').onclick=togglePause;
$('#restart').onclick=()=>{if(!game)return;const idx=game.idx;selectedLevel=idx;game.running=false;cancelAnimationFrame(raf);stopMusic();startGame();};
$('#full').onclick=async()=>{try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else if(document.exitFullscreen)await document.exitFullscreen();}catch(e){showMsg('⛶ Fullscreen non disponibile su questo browser',1200);}};
$('#back').onclick=backMenu;
$('#retry').onclick=()=>{$('#gameover').classList.add('hidden');startGame();};
$('#gomenu').onclick=backMenu;$('#cmenu').onclick=backMenu;
$('#next').onclick=()=>{const n=Math.min(4,game.idx+1);$('#clear').classList.add('hidden');selectedLevel=n;startGame();};
$('#creditsBtn').onclick=()=>{$('#clear').classList.add('hidden');$('#credits').classList.remove('hidden');};
$('#creditsMenu').onclick=backMenu;

renderMenu();
