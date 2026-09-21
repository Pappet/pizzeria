// Nach jeder Änderung hochzählen, sonst liefert der Service Worker die alte Version aus.
const VERSION = 'v13';
const CACHE = `pizzeria-${VERSION}`;
const SHELL = ['./', './index.html', './manifest.webmanifest', './fonts/fredoka-latin.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-512-maskable.png',
  './icons/icon-180.png', './icons/favicon-32.png'];

self.addEventListener('install', e => {
  // cache:'reload' umgeht den HTTP-Cache, sonst landet nach einem Update die alte index.html im neuen Cache
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(f => c.add(new Request(f, {cache:'reload'}))))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Cache zuerst (Spiel läuft offline), Netz ergänzt den Cache.
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: req.mode === 'navigate' });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') (await caches.open(CACHE)).put(req, res.clone());
      return res;
    } catch (err) {
      if (req.mode === 'navigate') return (await caches.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});
