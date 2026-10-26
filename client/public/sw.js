const CACHE_NAME = 'aura-music-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Do not cache API or audio streaming requests in generic service worker cache
  // Audio downloads are handled directly via IndexedDB in downloadManager
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/socket.io/') ||
    event.request.url.includes('.mp4') ||
    event.request.url.includes('.mp3') ||
    event.request.url.includes('saavncdn') ||
    event.request.url.includes('audius')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        // Cache static client assets
        if (event.request.method === 'GET' && fetchRes.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const clone = fetchRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return fetchRes;
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});
