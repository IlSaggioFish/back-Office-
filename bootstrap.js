(async()=>{
  const fail=(msg)=>{
    document.body.innerHTML=`<div style="max-width:680px;margin:60px auto;padding:20px;background:#0f2336;color:white;border-radius:16px;font-family:system-ui"><h2>Errore di avvio</h2><p>${msg}</p><p>Ricarica la pagina. Se persiste, il reparto IT verrà informato contro la sua volontà.</p></div>`;
  };
  const load=src=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;
    s.onload=resolve;
    s.onerror=()=>reject(new Error('Impossibile caricare '+src));
    document.body.appendChild(s);
  });
  try{
    const legacy=await fetch('./index.html?faces=1',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('index legacy non disponibile');return r.text();});
    const m=legacy.match(/const FACE_DATA = (\{.*?\});\s*\n\n\(\(\) =>/s);
    if(!m)throw new Error('Volti non trovati nel file legacy');
    window.FACE_DATA=JSON.parse(m[1]);
    for(const src of ['./core.js?v=4','./menu.js?v=4','./gameplay.js?v=4','./render.js?v=4','./main.js?v=4']){
      await load(src);
    }
  }catch(err){
    console.error(err);
    fail(err.message||String(err));
  }
})();
