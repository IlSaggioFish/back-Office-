const CACHE='bo-adventure-dx-v4-live-1';
const ASSETS=['./app.html','./style.css?v=4','./bootstrap.js?v=4','./core.js?v=4','./menu.js?v=4','./gameplay.js?v=4','./render.js?v=4','./main.js?v=4','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window'});
    for(const client of clients){
      try{await client.navigate(client.url);}catch(e){}
    }
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;

  if(event.request.mode==='navigate'){
    event.respondWith(
      caches.match('./app.html')
        .then(cached=>cached||fetch('./app.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached=>cached||fetch(event.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      }))
  );
});
