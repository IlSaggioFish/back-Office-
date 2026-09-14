(async()=>{
  const FACE_CACHE='boAdventureFacesV1';
  const LEGACY='https://raw.githubusercontent.com/IlSaggioFish/back-Office-/907720dd7e2f6016af519c4eaaceecdf0666413f/index.html';
  const fail=(msg)=>{
    document.body.innerHTML=`<div style="max-width:680px;margin:60px auto;padding:20px;background:#0f2336;color:white;border-radius:16px;font-family:system-ui"><h2>Errore di avvio</h2><p>${msg}</p><p>Ricarica la pagina con una connessione attiva. I volti vengono salvati nel browser dopo il primo avvio, perché evidentemente anche una fusione come Mengasi ha bisogno di una procedura.</p></div>`;
  };
  const load=src=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Impossibile caricare '+src));document.body.appendChild(s);
  });
  try{
    for(const href of ['./v7.css?v=7','./v8.css?v=8','./v9.css?v=9','./v10.css?v=10.2','./mobile.css?v=10.3','./v11.css?v=11']){const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l);}
    let faces=null;
    try{faces=JSON.parse(localStorage.getItem(FACE_CACHE)||'null');}catch(e){}
    if(!faces){
      const legacy=await fetch(LEGACY,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('archivio volti non disponibile');return r.text();});
      const m=legacy.match(/const FACE_DATA = (\{.*?\});\s*\n\n\(\(\) =>/s);
      if(!m)throw new Error('Volti non trovati nell’archivio legacy');
      faces=JSON.parse(m[1]);
      try{localStorage.setItem(FACE_CACHE,JSON.stringify(faces));}catch(e){}
    }
    window.FACE_DATA=faces;
    for(const src of [
      './core.js?v=5','./menu.js?v=5','./gameplay.js?v=5','./render.js?v=5','./main.js?v=5',
      './v5a.js?v=5','./v5b.js?v=5','./v5c.js?v=5','./v5d.js?v=5',
      './v6a.js?v=6','./v6b.js?v=6','./v6c.js?v=6','./v6ui.js?v=6',
      './v7.js?v=7','./v8.js?v=8','./v8fix.js?v=8','./v9.js?v=9','./v9fix.js?v=9','./v10.js?v=10','./v10replay.js?v=10.2','./mobile.js?v=10.3','./v11maps.js?v=11','./v11mengasi.js?v=11.1'
    ])await load(src);
  }catch(err){console.error(err);fail(err.message||String(err));}
})();