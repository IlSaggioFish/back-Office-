/* v23: identifiable bosses, readable attacks and operational decisions. */
'use strict';
(function(){
  const bosses={
    Mengozzi:{color:'#bb98ff',dark:'#34304e',title:'IL DIRETTORE DELLE URGENZE',tool:'TIMBRO',phases:['Protocollo urgente','Doppia integrazione','Chiusura tassativa'],hint:'PERM rallenta le raffiche · BD prolunga il preavviso'},
    Gervasi:{color:'#ffc76a',dark:'#37434b',title:'IL CAPOCANTIERE',tool:'CANTIERE',phases:['Sopralluogo','Area interdetta','Emergenza cantiere'],hint:'SIC rallenta le cadute · BD prolunga il preavviso'}
  };
  // Native canvas characters retain the established face references.
  function character(g,name,x,y,scale=1,pose='idle',now=0){
    const c=bosses[name];if(!c)return;
    const bob=pose==='stun'?Math.sin(now/45)*2:Math.sin(now/300)*2;
    g.save();g.translate(x,y+bob);g.scale(scale,scale);
    const box=(x,y,w,h,color,r=5)=>{g.fillStyle=color;g.strokeStyle='#101c29';g.lineWidth=3;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();g.stroke();};
    g.fillStyle='#050a1255';g.beginPath();g.ellipse(0,113,56,10,0,0,Math.PI*2);g.fill();
    box(-29,67,24,39,c.dark);box(6,67,24,39,c.dark);
    box(-35,100,32,14,'#15202b');box(5,100,34,14,'#15202b');
    box(-37,7,74,70,c.dark,12);
    if(name==='Mengozzi'){
      g.fillStyle='#f3efe4';g.beginPath();g.moveTo(-19,9);g.lineTo(20,9);g.lineTo(0,65);g.fill();
      g.fillStyle=c.color;g.beginPath();g.moveTo(0,18);g.lineTo(8,31);g.lineTo(2,58);g.lineTo(-6,31);g.closePath();g.fill();
      g.strokeStyle='#6c6687';g.lineWidth=3;g.beginPath();g.moveTo(-28,14);g.lineTo(-14,39);g.lineTo(-25,46);g.moveTo(28,14);g.lineTo(14,39);g.lineTo(25,46);g.stroke();
    }else{
      box(-36,12,25,54,'#f4aa37');box(11,12,25,54,'#f4aa37');
      g.fillStyle='#eeead0';g.fillRect(-35,43,70,7);g.fillRect(-27,13,7,52);g.fillRect(21,13,7,52);
      box(-6,20,12,23,'#203d4d',2);
    }
    box(-53,16,20,47,c.dark,9);box(-52,54,19,17,'#d9a986',6);
    const lift=pose==='attack'?-25:pose==='windup'?-14:0;
    g.save();g.translate(0,lift);box(32,16,21,45,c.dark,8);box(34,51,19,18,'#d9a986',6);
    if(name==='Mengozzi'){box(38,34,16,21,'#83524a',4);box(29,53,36,14,'#c96672',3);g.fillStyle='#fff';g.font='bold 6px sans-serif';g.textAlign='center';g.fillText('URGENTE',47,62);}
    else {box(31,35,34,44,'#1a2b39',5);box(36,40,24,28,'#72b9bd',2);g.strokeStyle='#23515d';g.lineWidth=2;g.beginPath();g.moveTo(40,50);g.lineTo(45,55);g.lineTo(56,45);g.stroke();}
    g.restore();
    box(-10,-5,20,18,'#d9a986',5);
    g.fillStyle='#dfb494';g.strokeStyle='#132131';g.lineWidth=4;g.beginPath();g.ellipse(0,-24,31,35,0,0,Math.PI*2);g.fill();g.stroke();
    const im=imgs[name];if(im?.complete&&im.naturalWidth){g.save();g.beginPath();g.ellipse(0,-24,28,32,0,0,Math.PI*2);g.clip();const side=Math.min(im.naturalWidth,im.naturalHeight);g.drawImage(im,(im.naturalWidth-side)/2,(im.naturalHeight-side)/2,side,side,-31,-57,62,66);g.restore();}
    else {g.fillStyle='#3b302d';g.beginPath();g.arc(0,-35,26,Math.PI,Math.PI*2);g.fill();g.fillRect(-16,-26,7,3);g.fillRect(9,-26,7,3);g.fillRect(-7,-8,14,2);}
    if(name==='Gervasi'){g.fillStyle='#f5b448';g.strokeStyle='#67461f';g.lineWidth=3;g.beginPath();g.ellipse(0,-48,34,18,0,Math.PI,Math.PI*2);g.fill();g.stroke();box(-38,-50,76,7,'#ffce67',3);g.fillStyle='#e7e8c9';g.fillRect(-4,-65,8,13);}
    if(pose==='stun'){g.fillStyle='#ffe691';g.font='bold 19px sans-serif';g.textAlign='center';g.fillText('✦  ✦',0,-79);}
    g.restore();
  }
  const oldDrawBoss=drawBoss;
  drawBoss=function(b){
    if(!bosses[b?.name])return oldDrawBoss(b);
    const now=performance.now(),pose=now<(b.v10StunUntil||0)?'stun':now<(b.v23WindupUntil||0)?'windup':now<(b.v23AttackUntil||0)?'attack':'idle';
    ctx.save();if(now<(b.hitFlash||0))ctx.globalAlpha=.55;
    character(ctx,b.name,b.x,b.y,1,pose,now);ctx.restore();
    if(pose==='windup'){ctx.save();ctx.fillStyle=bosses[b.name].color;ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText(b.v23Cue||'ATTENZIONE',b.x,b.y-82);ctx.restore();}
  };
  const oldPattern=spawnBossPattern;
  spawnBossPattern=function(b,now){
    if(!bosses[b.name])return oldPattern(b,now);
    const phase=b.phase||1,intel=game.roleDone?.BD?240:0;
    b.v23WindupUntil=now+650+intel;b.v23AttackUntil=b.v23WindupUntil+300;
    b.v23Cue=b.name==='Mengozzi'?'RAFFICA IN ARRIVO':'CADUTA SEGNALATA';
    const mitigated=game.roleDone?.[b.name==='Mengozzi'?'PERM':'SIC']>0;
    const speed=(mitigated?.75:1)*game.difficulty;
    if(b.name==='Mengozzi'){
      const lanes=phase===1?[390]:phase===2?[280,400]:[255,330,410];
      for(const [i,y] of lanes.entries())game.projectiles.push({kind:'straight',x:b.x-62,y,w:56,h:36,vx:-(290+phase*30)*speed,cat:i%2?'BD':'PERM',urgent:phase===3,dead:false,telegraphUntil:b.v23WindupUntil+i*110});
    }else{
      const offsets=phase===1?[0]:phase===2?[-85,85]:[-135,0,135];
      for(const [i,dx] of offsets.entries())game.projectiles.push({kind:'drop',x:Math.max(game.bossZone+15,Math.min(game.w.w-100,game.p.x+dx)),y:90,w:54,h:36,vy:(230+phase*35)*speed,cat:i%2?'CONS':'SIC',urgent:phase===3,dead:false,telegraphUntil:b.v23WindupUntil+i*170});
    }
  };
  const oldBossHUD=drawBossHUD;
  drawBossHUD=function(b){oldBossHUD(b);if(!bosses[b?.name])return;ctx.save();ctx.fillStyle='#0a172ee8';ctx.fillRect(205,73,550,24);ctx.fillStyle=bosses[b.name].color;ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText(bosses[b.name].phases[Math.min(2,(b.phase||1)-1)]+' · '+bosses[b.name].hint,480,89);ctx.restore();};
  const oldCutscene=beginCutscene;
  beginCutscene=function(){oldCutscene();const name=game?.lv?.boss;if(!bosses[name])return;const c=document.createElement('canvas');c.width=240;c.height=250;character(c.getContext('2d'),name,120,88,1.25);$('#cutFace').src=c.toDataURL();$('#cutFace').classList.add('v23-boss-portrait');$('#cutTitle').textContent=name.toUpperCase()+' · '+bosses[name].title;$('#cutLine').textContent=bosses[name].hint;};

  const questions={
    BD:[{q:'Il civico in banca dati non coincide con il rilievo. Cosa fai?',a:['Verifico il rilievo e aggiorno il record','Copio il civico del lavoro vicino','Chiudo senza modifiche'],ok:0},{q:'Trovi due schede dello stesso impianto. Qual è il primo passo?',a:['Le cancello entrambe','Confronto gli identificativi e verifico il duplicato','Creo una terza scheda'],ok:1}],
    PERM:[{q:'La pratica deve essere inviata. Quale controllo viene prima?',a:['Cambio il nome del file','Invio subito la PEC','Verifico ente, allegati e firme richieste'],ok:2},{q:'È arrivata una richiesta di integrazione. Come procedi?',a:['Raccolgo gli allegati mancanti e rispondo con il riferimento','Apro una pratica senza collegamenti','Segno il permesso come acquisito'],ok:0}],
    SIC:[{q:'Il percorso attraversa una zona di lavoro non delimitata.',a:['Passo velocemente','Segnalo il rischio e faccio mettere in sicurezza l’area','Rimuovo la segnaletica restante'],ok:1},{q:'Prima di riaprire il passaggio, quale verifica serve?',a:['Il punteggio della squadra','Il numero delle email','L’area è ripristinata e il percorso è sicuro'],ok:2}],
    CONS:[{q:'Le quantità del report non coincidono con il lavoro eseguito.',a:['Riconcilio misure e documenti prima della chiusura','Confermo il valore più alto','Copio il mese precedente'],ok:0},{q:'Una voce è presente due volte nel consuntivo.',a:['La fatturo due volte','Verifico il riferimento ed elimino il duplicato confermato','Cancello tutto il report'],ok:1}]
  };
  const modal=document.createElement('div');modal.id='v23Decision';modal.className='modal hidden';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','v23Question');modal.innerHTML='<div class="mcard"><div id="v23Category" class="sec"></div><h2 id="v23Question"></h2><p id="v23Support"></p><div id="v23Answers"></div><p id="v23Feedback" aria-live="polite"></p><button id="v23Cancel" class="secondary">Torna alla missione</button></div>';document.body.appendChild(modal);
  let pending=null,returnFocus=null;
  function close(){modal.classList.add('hidden');if(game)game.paused=false;workHeld=false;pending=null;returnFocus?.focus();}
  $('#v23Cancel').onclick=close;
  modal.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}if(e.key==='Tab'){const buttons=[...modal.querySelectorAll('button:not(:disabled)')];const i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}});
  window.v23ValidateTask=function(t){
    if(t.v23Approved)return true;
    if(pending)return false;
    const list=questions[t.cat],q=list[(game.workDone||0)%list.length];pending=t;returnFocus=document.activeElement;game.paused=true;workHeld=false;
    keys.left=keys.right=keys.jump=false;
    $('#v23Category').textContent=ICON[t.cat]+' '+CAT[t.cat]+' · VERIFICA OPERATIVA';$('#v23Question').textContent=q.q;
    const specialist=hasSkill(game.ch,t.cat);
    $('#v23Support').textContent=specialist?'Competenza attiva: una risposta errata è esclusa.':'Supporto di '+WORK[t.cat].owner+': scegli la procedura corretta.';
    $('#v23Feedback').textContent='';const answers=$('#v23Answers');answers.replaceChildren();let excluded=false;
    q.a.forEach((a,i)=>{const btn=document.createElement('button');btn.type='button';btn.className='secondary';btn.textContent=a;if(specialist&&i!==q.ok&&!excluded){btn.disabled=true;excluded=true;}btn.onclick=()=>{if(i!==q.ok){$('#v23Feedback').textContent='Ricontrolla: la pratica deve essere verificata prima della chiusura.';btn.disabled=true;return;}t.v23Approved=true;t.workProgress=workProfile(game.ch,t.cat).time;close();showMsg('✓ VERIFICA SUPERATA · tieni E / GESTISCI per concludere',1900);};answers.appendChild(btn);});
    modal.classList.remove('hidden');answers.querySelector('button:not(:disabled)').focus();return false;
  };
  // Keep approved progress until the operator resumes the interaction.
  const oldTasks=updateWorkTasks;
  updateWorkTasks=function(dt,now){for(const t of game?.w?.tasks||[])if(t.v23Approved&&!t.dead&&workHeld)t.workProgress=workProfile(game.ch,t.cat).time;oldTasks(dt,now);};
  const oldStart=startGame;startGame=function(){if(pending)close();oldStart();};
  const panel=document.createElement('section');panel.className='v23-bosses';panel.innerHTML='<div class="sec">V23 · I responsabili scendono in campo</div><div class="v23-boss-grid"></div>';
  for(const name of Object.keys(bosses)){const card=document.createElement('article');card.innerHTML='<canvas width="200" height="200" aria-label="'+name+'"></canvas><div><h3>'+name+'</h3><small>'+bosses[name].title+'</small><p>'+bosses[name].hint+'</p></div>';const c=card.querySelector('canvas');const paint=()=>{const g=c.getContext('2d');g.clearRect(0,0,200,200);character(g,name,100,68,1.05);};paint();if(imgs[name]&&!imgs[name].complete)imgs[name].addEventListener('load',paint,{once:true});panel.querySelector('.v23-boss-grid').appendChild(card);}
  $('#menu .actions').before(panel);
  document.title='Back Office Adventure DX v23';$('.header .logo span').textContent='ADVENTURE DX v23';$('.header .sub').textContent='Mengozzi e Gervasi · Boss animati, attacchi segnalati e verifiche operative.';$('#credits h2').textContent='BACK OFFICE ADVENTURE DX v23';
})();
