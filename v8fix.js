/* DX v8 - piccoli fix runtime */
'use strict';

// Poll gamepad anche dentro l'Hub e gestisce correttamente il rilascio del salto.
pollGamepad=function(){
  const gp=[...(navigator.getGamepads?.()||[])].find(Boolean);
  if(!gp){
    if(padState.active){keys.left=keyboardState.left;keys.right=keyboardState.right;releaseJump();}
    padState.active=false;padState.buttons=[];return;
  }
  padState.active=true;
  const prev=padState.buttons.slice(),pressed=i=>!!gp.buttons?.[i]?.pressed,edge=i=>pressed(i)&&!prev[i];
  const ax=gp.axes?.[0]||0,left=ax<-.22||pressed(14),right=ax>.22||pressed(15);
  keys.left=keyboardState.left||left;keys.right=keyboardState.right||right;

  if(hub.open){
    if(left){hub.vx=-230;hub.facing=-1}else if(right){hub.vx=230;hub.facing=1}else if(!hubKeys.left&&!hubKeys.right)hub.vx=0;
    if(edge(0))hubInteract();if(edge(1))closeHub();
  }else if(game?.running){
    if(edge(0))pressJump();
    if(!pressed(0)&&prev[0])releaseJump();
    if(edge(1)&&typeof doDash==='function')doDash();
    if(edge(2))useAbility();
    if(edge(9)&&typeof togglePause==='function')togglePause();
  }
  padState.buttons=gp.buttons.map(b=>b.pressed);
};

const v8HubLoopBase=hubLoop;
hubLoop=function(now){if(hub.open)pollGamepad();return v8HubLoopBase(now);};
