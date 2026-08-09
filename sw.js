const CACHE_PREFIX = 'nextuber-github-';
const CACHE_NAME = CACHE_PREFIX + 'v6-nextuber-live-news-final';
const APP_SHELL = [
  './',
  './index.html',
  './formaplus_2_0.html',
  './manifest.json',
  './assets/css/app.css?v=nextuber_v6_live',
  './assets/js/security.js?v=1',
  './assets/js/app.js?v=nextuber_v6_live',
  './assets/js/pwa.js?v=pwa5',
  './pwa-icons/icon-192x192.png',
  './pwa-icons/icon-512x512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key.indexOf(CACHE_PREFIX) === 0 && key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  var url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request, { cache: 'no-store' }).then(function (response) {
      var cacheControl = response.headers.get('cache-control') || '';
      if (response.ok && response.type === 'basic' && !/(?:no-store|private)/i.test(cacheControl)) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, copy);
        });
      }
      return response;
    }).catch(function () {
      return caches.match(request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
