const VERSION = "v5";
const HOST = location.protocol + '//' + location.host;
const FILECACHE = [
  HOST + '/PWA/exo1/css/main.css',
  HOST + '/PWA/exo1/images/icons/icon48.png',
  HOST + '/PWA/exo1/game.html',
  HOST + '/PWA/exo1/index.html',
  HOST + '/PWA/exo1/offline.html',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  console.log("Version :", VERSION);

  e.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      await Promise.all(
        [...FILECACHE].map(
          (path) => {
            return cache.add(path);
          })
      );
    })()
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((k) => {
          if (!k.includes(VERSION))
            return caches.delete(k);
        })
      );
    })()
  );
});

self.addEventListener("fetch", (e) => {
  console.log("url :", e.request.url);
  console.log("mode :", e.request.mode);
  console.log("destination :", e.request.destination);
  console.log("Fetch :", e.request);
  console.log("FIN--------------------------");

  if (e.request.mode === "navigate") {
    e.respondWith(
      (async () => {
        try {
          const preloadedResponse = await e.preloadResponse;

          if (preloadedResponse) return preloadedResponse;

          if (e.request.url === HOST + '/PWA/exo1/game.html') {
            return await fetch(HOST + '/PWA/exo1/online.html');
          }

          return await fetch(e.request);
        } catch (error) {
          const cache = await caches.open(VERSION);

          if (!FILECACHE.includes(e.request.url)) {

            return await cache.match('/PWA/exo1/offline.html');
          }

          return await cache.match(e.request);
        }
      })()
    );
  } else if (e.request.url.includes('/search/shows')) {
    e.respondWith(
      (async () => {
        const cache = await caches.open(VERSION);
        const cachedResponse = await cache.match(e.request);

        if (cachedResponse) return cachedResponse;

        try {
          const fetchResponse = await fetch(e.request);
          if (fetchResponse.ok) {
            await cache.put(e.request, fetchResponse.clone());
            return fetchResponse;
          }
        } catch (error) {
          console.error('Fetch failed:', error);
        }

        return new Response('Failed to fetch', { status: 404, statusText: 'Not Found' });
      })()
    );
  } else if (e.request.destination === 'image') {
    // Gérer les requêtes d'images
    e.respondWith(
      (async () => {
        const cache = await caches.open(VERSION);

        const preloadedResponse = await e.preloadResponse;

          if (preloadedResponse) return preloadedResponse;

        const cachedResponse = await cache.match(e.request);

        if (cachedResponse) return cachedResponse;
       
        try {
          const fetchResponse = await fetch(e.request);
          if (fetchResponse.ok) {
            console.log("HERE-----------------------------ssss----F")

            await cache.add(e.request);
            return fetchResponse;
          }
        } catch (error) {
          console.error('Fetch failed:', error);
        }

        return new Response('Failed to fetch', { status: 404, statusText: 'Not Found' });
      })()
    );
  } else if (FILECACHE.includes(e.request.url)) {
    e.respondWith(caches.match(e.request));
  }
  
});
