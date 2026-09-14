/* DX v8 - piccoli fix runtime */
'use strict';
const v8HubLoopBase=hubLoop;
hubLoop=function(now){if(hub.open)pollGamepad();return v8HubLoopBase(now);};
