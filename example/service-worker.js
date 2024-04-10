const VERSION = "v11";
const HOST = location.protocol+'//'+location.host
const FILECACHE = [
    HOST+'/PWA/example/css/main.css',
    HOST+'/PWA/example/images/icons/icon48.png'
]
self.addEventListener("install", (e) => {
  self.skipWaiting();
  console.log("Version :", VERSION);

  e.waitUntil(
    (async() =>{
        const cache = await caches.open(VERSION)
        // cache.add('./offline.html')

        //on veut que tous les ajouts soient finis avant de faire la suite, donc on utilise un Promise.all
        await Promise.all(
            [...FILECACHE, './offline.html'].map(
                (path) => { return cache.add(path)
                })
        )
    })()
  )
});


self.addEventListener('activate', (e) => {
    // une fois qu'on active le service worker, on supprime le cache des anciennes versions
    e.waitUntil(
        (async () => {
            //on recup toutes les clés du cache
            const keys = await caches.keys()

            await Promise.all(
                keys.map((k) => {
                    if(!k.includes(VERSION))
                    return caches.delete(k)
                })
            )
        })()
    )
})


self.addEventListener("fetch", (e) => {
  console.log("Fetch :", e.request);
  console.log("Fetch :", e.request.mode);
  console.log("SOMETING")
  // si on lit une page, afficher un truc particulier
  if (e.request.mode === "navigate") {
    e.respondWith(
      (async () => {
        // return new Response("One piece > all");
        try {
          // on charge la page demandée depuis la mémoire
          const preloadedResponse = await e.preloadResponse;

          if (preloadedResponse) return preloadedResponse;

          return await fetch(e.request);
        } catch (error) {
           const cache = await caches.open(VERSION)
           return await cache.match('/PWA/example/offline.html')
        }
      })()
    );
  }
  //pour les chargements qui ne sont pas en navigate
  else if (FILECACHE.includes(e.request.url)){
    //on sort le fichier de la mémoire du cache
    e.respondWith(caches.match(e.request))
  }
});
