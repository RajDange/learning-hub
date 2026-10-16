/* Learning Hub service worker: makes the app installable and usable offline.
 * Strategy: app files and lessons are network-first (so updates arrive as soon as
 * you are online) with the cache as fallback; CDN libraries are cache-first.
 * Bump VERSION when the list of shell files changes. */
const VERSION = "lh-v1";
const SHELL = [
  "./", "index.html", "app.css", "app.js", "logo.svg", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png", "content/manifest.json"
];
const CDN = [
  "https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js",
  "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(SHELL);
    await Promise.allSettled(CDN.map((u) => cache.add(u)));
    // Pre-cache every lesson file so the whole hub works offline.
    try {
      const manifest = await (await fetch("content/manifest.json", { cache: "no-cache" })).json();
      const files = manifest.tracks.flatMap((t) => t.modules.map((m) => m.file));
      await Promise.allSettled(files.map((f) => cache.add(f)));
    } catch (e) { /* offline during install: lessons are cached as they are opened */ }
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(stripSearch(req), res.clone());
        return res;
      } catch (e) {
        const hit = await cache.match(stripSearch(req)) || (req.mode === "navigate" && await cache.match("index.html"));
        return hit || Response.error();
      }
    })());
    return;
  }

  if (CDN.includes(req.url)) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    })());
  }
});

function stripSearch(req) {
  const u = new URL(req.url);
  u.search = "";
  u.hash = "";
  return u.toString();
}
