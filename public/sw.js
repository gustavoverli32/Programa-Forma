const CACHE_PREFIX = "nextuber-next-";
const CACHE_NAME = `${CACHE_PREFIX}v2-security-pwa`;
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/legacy/security.js",
  "/legacy/app.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

function isCacheable(response) {
  if (!response || !response.ok || response.type !== "basic") return false;
  const cacheControl = response.headers.get("cache-control") || "";
  return !/(?:no-store|private)/i.test(cacheControl);
}

async function saveResponse(request, response) {
  if (!isCacheable(response)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    await saveResponse(request, response);
    return response;
  } catch {
    return (
      (await caches.match(request, { ignoreSearch: true })) ||
      (fallbackUrl ? await caches.match(fallbackUrl, { ignoreSearch: true }) : undefined) ||
      Response.error()
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  await saveResponse(request, response);
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: "reload" })))),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/"));
    return;
  }

  const isImmutableAsset =
    url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");
  event.respondWith(isImmutableAsset ? cacheFirst(request) : networkFirst(request));
});
