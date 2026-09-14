/* DX v9 - rifiniture meter e missioni */
'use strict';
const v9UpdateMeterBase=update;
update=function(dt,now){
  if(!game)return v9UpdateMeterBase(dt,now);
  const before=game.w.tasks.filter(t=>t.dead&&t.cat!=='PERM').length;
  v9UpdateMeterBase(dt,now);
  if(!game)return;
  const after=game.w.tasks.filter(t=>t.dead&&t.cat!=='PERM').length;
  if(after>before)addSuper((after-before)*7);
};
const v9UseSuperBase=useSuper;
useSuper=function(){
  const before=game?.w?.tasks?.filter(t=>t.dead&&t.cat==='PERM').length||0;
  v9UseSuperBase();
  const after=game?.w?.tasks?.filter(t=>t.dead&&t.cat==='PERM').length||0;
  if(after>before)progressMission('dalila',after-before);
};
const sb=document.querySelector('#superBtn');if(sb)sb.onclick=useSuper;
