// --- MODAL ARCHIVIO / STAT / CLASSIFICA / BACKUP ---
function openArchive(){
  const box=$('#archiveGrid');box.innerHTML='';
  LEVELS.forEach((lv,i)=>{const open=!!save.secrets?.[i];const d=document.createElement('div');d.className='archiveItem'+(open?'':' locked');d.innerHTML=`<span class="ai">📜</span><b>Documento L${i+1}</b>${open?lv.name:'Non trovato'}`;box.appendChild(d);});
  RELICS.forEach(r=>{const open=!!v5extra.archive[r.id];const d=document.createElement('div');d.className='archiveItem'+(open?'':' locked');d.innerHTML=`<span class="ai">${r.icon}</span><b>${r.name}</b>${open?'Archiviato':'Da trovare'}`;box.appendChild(d);});$('#archiveModal').classList.remove('hidden');
}
function openStats(){
  const s=v5extra.stats;const fav=Object.entries(s.chars||{}).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';
  const vals=[['Tempo giocato',fmt(s.playTime)],['Partite',s.runs],['Vite perse',s.deaths],['Attività gestite',s.tasks],['Nemici chiusi',s.enemies],['Boss battuti',s.bosses],['Abilità usate',s.abilities],['Caffè',s.coffees],['Personaggio preferito',fav],['Endless record',s.endlessBest||0],['Minigioco record',s.minigameBest||0],['Documenti',save.secrets?.filter(Boolean).length||0]];
  $('#statTable').innerHTML=vals.map(([a,b])=>`<div class="statCell">${a}<b>${b}</b></div>`).join('');$('#statsModal').classList.remove('hidden');
}
function openLeader(){
  const rows=leaders.slice(0,12);$('#leaderTable').innerHTML=`<table class="leaderTable"><thead><tr><th>#</th><th>Profilo</th><th>Modalità</th><th>Punti</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${r.name}<br><small>${r.char}</small></td><td>${r.level}</td><td>${r.score}</td></tr>`).join('')||'<tr><td colspan="4">Nessun record ancora.</td></tr>'}</tbody></table>`;$('#leaderModal').classList.remove('hidden');
}
$('#archiveBtn').onclick=openArchive;$('#statsBtn').onclick=openStats;$('#leaderBtn').onclick=openLeader;$('#backupBtn').onclick=()=>{$('#backupModal').classList.remove('hidden');$('#backupText').value='';};
document.querySelectorAll('.closeModal').forEach(b=>b.onclick=()=>b.closest('.modal').classList.add('hidden'));
$('#exportBackup').onclick=()=>{$('#backupText').value=encodeBackup({v5extra,save,leaders});$('#backupText').select();try{navigator.clipboard?.writeText($('#backupText').value);}catch(e){}};
$('#importBackup').onclick=()=>{try{const data=decodeBackup($('#backupText').value);if(data.v5extra)Object.assign(v5extra,data.v5extra);if(data.save)Object.assign(save,data.save);if(Array.isArray(data.leaders))leaders=data.leaders;persistV5();renderMenu();$('#backupModal').classList.add('hidden');alert('Backup importato. La burocrazia ha, eccezionalmente, collaborato.');}catch(e){alert('Codice backup non valido.');}};

// --- MINIGIOCO ---
let mini=null;
function startMini(){
  $('#miniModal').classList.remove('hidden');$('#miniClose').classList.add('hidden');mini={score:0,end:performance.now()+20000,cat:null,timer:null};
  const choices=$('#miniChoices');choices.innerHTML='';Object.keys(CAT).forEach(c=>{const b=document.createElement('button');b.className='secondary';b.textContent=`${ICON[c]} ${CAT[c]}`;b.onclick=()=>miniPick(c);choices.appendChild(b);});nextMini();
  mini.timer=setInterval(()=>{const left=Math.max(0,Math.ceil((mini.end-performance.now())/1000));$('#miniTimer').textContent=left+' secondi';if(left<=0)endMini();},200);
}
function nextMini(){const cs=Object.keys(CAT);mini.cat=cs[Math.floor(Math.random()*cs.length)];$('#miniTask').textContent=ICON[mini.cat]+' 📄';$('#miniLabel').textContent=mini.score+' punti';}
function miniPick(c){if(!mini||performance.now()>mini.end)return;if(c===mini.cat){mini.score++;sfx('good');}else{mini.score=Math.max(0,mini.score-1);sfx('hurt');}nextMini();}
function endMini(){if(!mini)return;clearInterval(mini.timer);const reward=Math.floor(mini.score/3);save.totalStamps+=reward;v5extra.stats.minigameBest=Math.max(v5extra.stats.minigameBest||0,mini.score);$('#miniTimer').textContent='Fine!';$('#miniLabel').textContent=`${mini.score} punti • +${reward} marche`;$('#miniClose').classList.remove('hidden');document.querySelectorAll('#miniChoices button').forEach(b=>b.disabled=true);mini=null;persistV5();}
$('#minigameBtn').onclick=startMini;$('#miniClose').onclick=()=>{$('#miniModal').classList.add('hidden');renderMenu();};

// --- MOBILE JOYSTICK / POSIZIONE CONTROLLI ---
let joyActive=false,joyJumpLatch=false;
function setJoy(on){v5extra.touchJoy=on;$('#joy').classList.toggle('show',on);persistV5();}
$('#touchMode').onclick=()=>setJoy(!v5extra.touchJoy);
$('#swapCtrl').onclick=()=>{v5extra.swap=!v5extra.swap;$('#controls').classList.toggle('reverse',v5extra.swap);persistV5();};
function joyMove(e){if(!joyActive)return;const r=$('#joy').getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.32,mag=Math.hypot(dx,dy)||1,nx=Math.max(-max,Math.min(max,dx)),ny=Math.max(-max,Math.min(max,dy));$('#joyKnob').style.transform=`translate(${nx}px,${ny}px)`;keys.left=dx<-15;keys.right=dx>15;if(dy<-28&&!joyJumpLatch){joyJumpLatch=true;pressJump();}if(dy>-12){joyJumpLatch=false;releaseJump();}}
$('#joy').addEventListener('pointerdown',e=>{joyActive=true;$('#joy').setPointerCapture?.(e.pointerId);joyMove(e);});$('#joy').addEventListener('pointermove',joyMove);for(const ev of ['pointerup','pointercancel'])$('#joy').addEventListener(ev,e=>{joyActive=false;keys.left=keys.right=false;releaseJump();$('#joyKnob').style.transform='';});
setJoy(!!v5extra.touchJoy);$('#controls').classList.toggle('reverse',!!v5extra.swap);

// --- FINALE / CREDITI ---
$('#creditsBtn').onclick=()=>{$('#clear').classList.add('hidden');$('#creditsFace').src=portraitMengasi();$('#credits').classList.remove('hidden');bossSpeak('Mengasi è stato sconfitto. Il mese è chiuso. Bravi. Però c’è un’altra cosa da fare.');};

// Piccolo fix per il pulsante NG+ e testo start con difficoltà.
const v4UpdateStart=updateStart;
updateStart=function(){v4UpdateStart();if(selectedChar>=0&&selectedLevel>=0)$('#start').textContent+=` • ${DIFFS[difficultyMode].label}`;};

renderMenu();
