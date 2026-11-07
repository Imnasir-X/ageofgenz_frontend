// Retired service worker. The previous worker cached every GET (API JSON and index.html
// included) under a fixed cache name, which could pin readers to stale news and old bundles.
// This version clears those caches and unregisters itself.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
