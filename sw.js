// Service worker voor de legotheek: houdt foto's, pagina's en data in de cache,
// zodat ze niet elke keer opnieuw gedownload hoeven te worden.
const CACHE = "legotheek-v1";

const CORE = [
  "index.html",
  "sets.html",
  "set.html",
  "reserveren.html",
  "over-ons.html",
  "huisregels.html",
  "blog.html",
  "post.html",
  "css/style.css",
  "js/config.js",
  "js/sets.js",
  "js/set.js",
  "js/form.js",
  "js/over-ons.js",
  "js/huisregels.js",
  "js/blog.js",
  "js/facebook.js",
  "js/register-sw.js",
  "data/sets.json",
  "data/posts.json",
  "data/over-ons.json",
  "data/huisregels.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Foto's: eerst uit de cache, daarna in de achtergrond bijwerken
  if (url.pathname.startsWith("/img/")) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const bijwerken = fetch(req)
          .then((res) => {
            if (res.ok) caches.open(CACHE).then((c) => c.put(req, res));
            return res;
          })
          .catch(() => hit);
        return hit || bijwerken;
      })
    );
    return;
  }

  // Pagina's en data: eerst het netwerk, cache als reserve
  if (req.mode === "navigate" || url.pathname.startsWith("/data/")) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const kopie = res.clone();
            caches.open(CACHE).then((c) => c.put(req, kopie));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || Response.error()))
    );
    return;
  }

  // CSS en JS: uit de cache, tegelijk in de achtergrond bijwerken
  e.respondWith(
    caches.match(req).then((hit) => {
      const bijwerken = fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res));
          return res;
        })
        .catch(() => hit);
      return hit || bijwerken;
    })
  );
});
