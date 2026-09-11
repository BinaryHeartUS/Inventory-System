/*
 * BinaryHeart Inventory — service worker.
 *
 * Scope: "installable + app-shell cache only". Data (the /api and /tables
 * endpoints) is ALWAYS fetched from the network — nothing dynamic is cached,
 * so users never see stale inventory. The service worker only makes the app
 * itself installable and fast to launch by caching the static app shell
 * (HTML, hashed JS/CSS bundles, fonts, icons).
 */

const VERSION = "v1";
const SHELL_CACHE = `bh-shell-${VERSION}`;
const ASSET_CACHE = `bh-assets-${VERSION}`;

// Minimal shell precached on install so the app can boot offline.
const SHELL_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon.png",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Allow the page to trigger an immediate activation after an update.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isApiRequest(url) {
  return url.pathname.startsWith("/api") || url.pathname.startsWith("/tables");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin GET requests. Everything else (POST/PUT/DELETE,
  // cross-origin, API/data calls) goes straight to the network untouched.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isApiRequest(url)) return;

  // App navigations: network-first so a fresh index.html is used when online,
  // falling back to the cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html").then((r) => r || caches.match("/")))
    );
    return;
  }

  // Static assets (Vite emits content-hashed, immutable files): cache-first,
  // then populate the cache on first fetch. Handles hashed filenames naturally.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
