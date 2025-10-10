const CACHE_NAME = 'aoz-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/logo.png',
  '/logo192.png',
  '/favicon.ico',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS)).then(self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))))
  );
  self.clients.claim();
});

// Stale-while-revalidate for GETs (articles and images)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          // Clone and store successful responses
          if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
            cache.put(req, networkRes.clone());
          }
          return networkRes;
        })
        .catch(() => cached);
      // Return cached first (if any), then update in background
      return cached || fetchPromise;
    })()
  );
});

