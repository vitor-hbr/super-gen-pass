const CACHE_VERSION = "super-gen-pass-v1";
const DOCUMENT_CACHE = `${CACHE_VERSION}-documents`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const PRECACHE_URLS = ["/offline", "/manifest.webmanifest", "/favicon.ico", "/key.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(DOCUMENT_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![DOCUMENT_CACHE, ASSET_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isNavigationalRequest(request) {
  return request.mode === "navigate";
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:css|js|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf)$/i.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/auth/callback")) {
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }

        const response = await fetch(request);
        if (response.ok) {
          cache.put(request, response.clone());
        }

        return response;
      }),
    );
    return;
  }

  if (isNavigationalRequest(request)) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(DOCUMENT_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(DOCUMENT_CACHE);
          return (
            (await cache.match(request)) ||
            (await cache.match("/offline")) ||
            Response.error()
          );
        }),
    );
  }
});
