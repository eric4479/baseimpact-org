// Service Worker for Base Impact — offline resource directory
const CACHE_NAME = 'baseimpact-v3';
const OFFLINE_URLS = [
  '/',
  '/directory',
  '/directory/',
  '/about',
  '/contact',
  '/guide',
  '/programs',
  '/impact',
  '/partners',
  '/volunteer',
  '/how-to-help',
  '/purpose',
  '/join',
  '/donate',
  '/financials',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-same-origin requests
  if (url.origin !== self.location.origin) return;

  // Cache CSS, JS, fonts, and images (cache-first)
  if (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/fonts/') ||
      url.pathname.endsWith('.css') || url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.svg') || url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') || url.pathname.endsWith('.ico')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for HTML pages (always try fresh, fall back to cache)
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => {
      return caches.match(event.request).then((cached) => {
        if (cached) return cached;
        // Fallback to directory page for offline navigation
        return caches.match('/directory/');
      });
    })
  );
});