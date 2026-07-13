const CACHE_NAME = "hksi-production-v4-legality-removed";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./project.html",
  "./404.html",
  "./offline.html",
  "./manifest.json",
  "./assets/css/style.css",
  "./assets/js/main.js",
  "./assets/img/hero/hero-main.png",
  "./assets/img/logo/logo-horizontal.png",
  "./assets/img/logo/logo-white.png",
  "./assets/img/logo/logo-icon.png",
  "./assets/img/logo/logo-color.png",
  "./assets/img/services/service-material.png",
  "./assets/img/services/service-laboratory.png",
  "./assets/img/services/service-survey.png",
  "./assets/img/pattern/pattern-engineering.png",
  "./assets/img/projects/project-laboratory-material.png",
  "./assets/img/projects/project-material-supply.png",
  "./assets/img/projects/project-survey-measurement.png",
  "./assets/img/projects/project-field-documentation.png",
  "./assets/img/gallery/field-laboratory.png",
  "./assets/img/gallery/material-support.png",
  "./assets/img/gallery/survey-work.png",
  "./assets/img/gallery/engineering-documentation.png",
  "./content/settings.json",
  "./content/seo.json",
  "./content/hero.json",
  "./content/about.json",
  "./content/vision.json",
  "./content/mission.json",
  "./content/why.json",
  "./content/statistics.json",
  "./content/services.json",
  "./content/projects.json",
  "./content/gallery.json",
  "./content/contact.json",
  "./content/cta.json",
  "./content/errors.json",
  "./content/services/supply-material.json",
  "./content/services/laboratory-testing.json",
  "./content/services/survey-measurement.json",
  "./content/projects/laboratory-material.json",
  "./content/projects/material-supply.json",
  "./content/projects/survey-measurement.json",
  "./content/projects/field-documentation.json",
  "./content/gallery/field-laboratory.json",
  "./content/gallery/material-support.json",
  "./content/gallery/survey-work.json",
  "./content/gallery/engineering-documentation.json",
  "./content/clients/section.json",
  "./content/advantages/section.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match("./offline.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }

          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match("./offline.html"));
    })
  );
});
