const CACHE='bo-adventure-dx-v22-missions';
const ASSETS=['./v20.js?v=20','./v20.css?v=20','./v21.js?v=21','./v21.css?v=21','./v22.js?v=22','./v22.css?v=22','./','./index.html','./app.html','./style.css?v=5','./v6.css?v=6','./v7.css?v=7','./v8.css?v=8','./v9.css?v=9','./v10.css?v=10.2','./mobile.css?v=10.3','./v11.css?v=11','./v12.css?v=12','./v12.1.css?v=12.1','./v15.css?v=15','./v16.css?v=16','./v17.css?v=17','./bootstrap.js?v=22','./core.js?v=5','./menu.js?v=20','./gameplay.js?v=20','./render.js?v=5','./main.js?v=5','./v5a.js?v=5','./v5b.js?v=5','./v5c.js?v=5','./v5d.js?v=5','./v6a.js?v=6','./v6b.js?v=6','./v6c.js?v=6','./v6ui.js?v=6','./v7.js?v=7','./v8.js?v=8','./v8fix.js?v=8','./v9.js?v=9','./v9fix.js?v=9','./v10.js?v=10','./v10replay.js?v=10.2','./mobile.js?v=10.3','./v11maps.js?v=11','./v11mengasi.js?v=11.1','./v11clarity.js?v=11.2','./v12graphics.js?v=20','./v12.1.js?v=12.1','./v13characters.js?v=13','./v14characters.js?v=14','./v15graphics.js?v=20','./v16characters.js?v=16','./v17characters.js?v=17','./characters-v19.js?v=19.1','./v19characters.js?v=19','./v19.css?v=19','./assets/characters/eugenio-v19.webp?v=19.1','./assets/characters/farris-v19.webp?v=19.1','./assets/characters/yurii-v19.webp?v=19.1','./assets/characters/luca-v19.webp?v=19.1','./assets/characters/tiziano-v19.webp?v=19.1','./assets/characters/daniele-v19.webp?v=19.1','./assets/characters/dalila-v19.webp?v=19.1','./assets/characters/giada-v19.webp?v=19.1','./assets/characters/michele-v19.webp?v=19.1','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:'window'});
  for(const client of clients){try{await client.navigate(client.url);}catch(err){}}
})()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.pathname.endsWith('/bootstrap.js')){
    e.respondWith(caches.match('./bootstrap.js?v=22').then(r=>r||fetch('./bootstrap.js?v=22',{cache:'no-store'})));
    return;
  }
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match('./app.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;})));
});
