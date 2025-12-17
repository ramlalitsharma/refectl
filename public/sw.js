// Service Worker for PWA offline support
const VERSION = 'v2';
const STATIC_CACHE = `adaptiq-static-${VERSION}`;
const RUNTIME_CACHE = `adaptiq-runtime-${VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.svg',
  '/adaptiq.svg',
  '/icon-192.png',
  '/og-image.png',
];

const isSameOrigin = (url) => {
  try {
    const u = new URL(url);
    return u.origin === self.location.origin;
  } catch {
    return false;
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(STATIC_ASSETS);
      try {
        const offlineRes = await fetch('/offline', { cache: 'reload' });
        if (offlineRes && offlineRes.ok) {
          await cache.put('/offline', offlineRes.clone());
        }
      } catch {}
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => ![STATIC_CACHE, RUNTIME_CACHE].includes(name))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

// Messaging: allow clients to trigger skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (!isSameOrigin(request.url)) return;

  const dest = request.destination;

  // Navigation: network-first, fallback to offline page
  if (request.mode === 'navigate' || dest === 'document') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match('/offline');
          return offline || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Static assets: stale-while-revalidate
  if (['style', 'script', 'font', 'image'].includes(dest)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((res) => {
            if (res && res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => undefined);
        return cached || networkPromise || new Response('', { status: 404 });
      })()
    );
    return;
  }

  // API and other: network-first with cache fallback
  event.respondWith(
    (async () => {
      try {
        const res = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        if (res && res.ok) cache.put(request, res.clone());
        return res;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response('', { status: 504 });
      }
    })()
  );
});

