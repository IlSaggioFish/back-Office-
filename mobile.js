/* SMARTPHONE ORIENTATION / FULLSCREEN */
'use strict';

(function initMobileOrientation(){
  const isTouch=()=>matchMedia?.('(pointer:coarse)')?.matches||navigator.maxTouchPoints>0;
  const isPortrait=()=>innerHeight>innerWidth;
  const gameVisible=()=>{const g=document.querySelector('#game');return !!g&&!g.classList.contains('hidden');};

  const makeRotateHint=()=>{
    let el=document.querySelector('#rotateHint');if(el)return el;
    el=document.createElement('div');el.id='rotateHint';el.className='rotateHint';
    el.innerHTML=`<div class="rotateCard"><span class="rotatePhone">📱</span><h2>Ruota il telefono</h2><p>Per giocare meglio usa lo schermo in orizzontale. In landscape il gioco passa alla modalità smartphone a tutto schermo con HUD e comandi compatti.</p><button id="rotateGo" class="primary">⛶ Gioca in orizzontale</button><button id="rotateSkip" class="secondary">Continua in verticale</button><div class="rotateNote">Su alcuni iPhone il browser non può ruotare lo schermo da solo: dopo il tap basta girare fisicamente il telefono.</div></div>`;
    document.body.appendChild(el);
    el.querySelector('#rotateGo').onclick=requestLandscape;
    el.querySelector('#rotateSkip').onclick=()=>{sessionStorage.setItem('boPortraitSkip','1');el.classList.remove('show');};
    return el;
  };

  const ensureLandscapeButton=()=>{
    const ga=document.querySelector('#game .ga');if(!ga||document.querySelector('#landscapeBtn'))return;
    const b=document.createElement('button');b.id='landscapeBtn';b.className='secondary mobileLandscapeBtn';b.textContent='📱 Orizzontale';b.title='Schermo intero / orientamento orizzontale';b.onclick=requestLandscape;ga.appendChild(b);
  };

  async function requestLandscape(){
    sessionStorage.removeItem('boPortraitSkip');
    try{
      const root=document.documentElement;
      if(!document.fullscreenElement){
        if(root.requestFullscreen)await root.requestFullscreen({navigationUI:'hide'});
        else if(root.webkitRequestFullscreen)root.webkitRequestFullscreen();
      }
    }catch(e){}
    try{
      if(screen.orientation?.lock)await screen.orientation.lock('landscape');
    }catch(e){}
    syncMobileLayout();
  }

  function syncMobileLayout(){
    ensureLandscapeButton();makeRotateHint();
    const active=isTouch()&&gameVisible();
    document.body.classList.toggle('bo-mobile-game',active);
    document.body.classList.toggle('bo-mobile-landscape',active&&!isPortrait());
    const hint=document.querySelector('#rotateHint');
    const skipped=sessionStorage.getItem('boPortraitSkip')==='1';
    hint?.classList.toggle('show',active&&isPortrait()&&!skipped);
    if(active&&!isPortrait())sessionStorage.removeItem('boPortraitSkip');
    if(active&&!isPortrait()){
      setTimeout(()=>document.querySelector('#canvas')?.focus?.(),30);
    }
  }

  // Segui i cambi menu/partita senza toccare il motore di gioco.
  const game=document.querySelector('#game');
  if(game)new MutationObserver(syncMobileLayout).observe(game,{attributes:true,attributeFilter:['class']});
  addEventListener('resize',()=>setTimeout(syncMobileLayout,50),{passive:true});
  addEventListener('orientationchange',()=>setTimeout(syncMobileLayout,180),{passive:true});
  document.addEventListener('fullscreenchange',syncMobileLayout);
  document.addEventListener('webkitfullscreenchange',syncMobileLayout);

  // Previene zoom accidentale sui doppi tap dei controlli touch senza bloccare i menu.
  document.addEventListener('touchend',e=>{
    if(!document.body.classList.contains('bo-mobile-game'))return;
    if(e.target.closest?.('.controls button,.ga button,#joy'))e.preventDefault();
  },{passive:false});

  syncMobileLayout();
})();
