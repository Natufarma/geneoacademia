// Service worker mínimo de Misión Geneo.
// Objetivo: instalabilidad (PWA) + resiliencia básica. NO cachea el JS/CSS de
// Next agresivamente (evita quedar viejo) ni intercepta llamadas a Supabase.
const CACHE = "geneo-v1";
const SHELL = [
  "/",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-icon.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Otros orígenes (Supabase, Google Fonts, etc.): passthrough — no interceptar.
  if (url.origin !== self.location.origin) return;

  // Navegaciones (documentos): network-first con fallback a caché / shell.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Íconos y manifest: cache-first. El resto (chunks de Next): a la red.
  if (SHELL.includes(url.pathname)) {
    event.respondWith(caches.match(req).then((r) => r || fetch(req)));
  }
});
