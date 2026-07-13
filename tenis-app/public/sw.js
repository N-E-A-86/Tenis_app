const CACHE = "tenisclub-v1";

const PRECACHE_URLS = [
  "/",
  "/canchas",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

// Install: precache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch: stale-while-revalidate (fresh data, but offline works)
self.addEventListener("fetch", (event) => {
  // Only GET requests
  if (event.request.method !== "GET") return;

  // Skip non-http(s)
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.open(CACHE).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          return cache.match(event.request).then((cached) => {
            return cached || caches.match("/") || new Response("Offline", { status: 503 });
          });
        });
    })
  );
});
