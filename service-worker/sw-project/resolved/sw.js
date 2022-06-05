const VERSION = 50;
const CACHE_PREFIX = "web";
const CACHE_NAME = `${CACHE_PREFIX}-${VERSION}`;

const precacheManifest = [
  {
    url: "/",
  },
  {
    url: "/main.js",
  },
  {
    url: "/images/perrito.jpg",
  },
];

self.addEventListener("message", onMessage);
self.addEventListener("install", onInstall);
self.addEventListener("activate", onActivate);
self.addEventListener("fetch", onFetch);

async function onMessage({ data, ports }) {
  if (data.type === "GET_VERSION") {
    ports[0].postMessage(VERSION);
  } else if (data.type === "ACTIVATE") {
    self.skipWaiting();
  }
}

async function postMessageToClients(data) {
  const allClients = await clients.matchAll({ includeUncontrolled: true });

  allClients.forEach((client) => client.postMessage(data));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function deleteOutdatedCaches() {
  const cacheNames = await caches.keys();
  const outdatedCacheNames = cacheNames.filter((name) => {
    return name !== CACHE_NAME;
  });

  return Promise.all(outdatedCacheNames.map((name) => caches.delete(name)));
}

function precache() {
  return Promise.all(
    precacheManifest.map(({ url }) => {
      return fetchAndCachePut({ request: new Request(url) }, CACHE_NAME);
    })
  );
}

async function handleActivation(event) {
  console.log(
    "%c%s%cv%s",
    "background: #1a1a1a; color: white; padding: 4px; border-radius: 4px; margin-right: 4px;",
    "Service Worker",
    "background: #1a1a1a; color: white; padding: 4px; border-radius: 4px; margin-right: 4px;",
    VERSION,
    "Activating..."
  );

  await deleteOutdatedCaches();
  await precache();
  await postMessageToClients("RELOAD");
}

function onInstall(event) {
  console.log(
    "%c%s%cv%s",
    "background: #1a1a1a; color: white; padding: 4px; border-radius: 4px; margin-right: 4px;",
    "Service Worker",
    "background: #1a1a1a; color: white; padding: 4px; border-radius: 4px; margin-right: 4px;",
    VERSION,
    "Installing..."
  );
}

function onActivate(event) {
  event.waitUntil(handleActivation(event));
}

const routes = [];

function registerRoute(route) {
  routes.push(route);
}

class Route {
  constructor(url, strategy) {
    this.url = url;
    this.strategy = strategy;
  }
}

class CacheFirst {
  constructor(options = {}) {
    this.cacheName = options.cacheName || CACHE_NAME;
  }

  async handler(event) {
    const cache = await caches.open(this.cacheName);
    const cacheResponse = await cache.match(event.request);

    return cacheResponse || fetchAndCachePut(event, this.cacheName);
  }
}

class NetworkFirst {
  constructor(options = {}) {
    this.cacheName = options.cacheName || CACHE_NAME;
  }

  async handler(event) {
    try {
      const response = await fetchAndCachePut(event, this.cacheName);

      return response;
    } catch {
      const cache = await caches.open(this.cacheName);
      const cacheResponse = await cache.match(event.request);

      return cacheResponse;
    }
  }
}

class StaleWhileRevalidate {
  constructor(options = {}) {
    this.cacheName = options.cacheName || CACHE_NAME;
  }

  async handler(event) {
    const cache = await caches.open(this.cacheName);
    const cacheResponse = await cache.match(event.request);
    const networkResponse = fetchAndCachePut(event, this.cacheName).catch(() => {});

    return cacheResponse || networkResponse;
  }
}

class NetworkFastOrCache {
  constructor(options = {}) {
    this.cacheName = options.cacheName || CACHE_NAME;
  }

  async handler(event) {
    const cache = await caches.open(this.cacheName);
    const cacheResponse = await cache.match(event.request);
    const networkResponse = fetchAndCachePut(event, this.cacheName).catch(() => {});

    if (!cacheResponse) {
      return networkResponse;
    }

    const response = await Promise.race([networkResponse, delay(200)]);

    return response || cacheResponse;
  }
}

function findMatchingRoute(event) {
  const route = routes.find((route) => {
    if (route.url instanceof RegExp) {
      return route.url.test(event.request.url);
    } else if (route.url instanceof Function) {
      return route.url(event);
    }
    return event.request.url === route.url;
  });

  if (route) {
    return route.strategy.handler(event);
  }

  return fetch(event.request);
}

function onFetch(event) {
  return event.respondWith(findMatchingRoute(event));
}

registerRoute(
  new Route("http://localhost:52498/images/perrito.jpg", {
    handler(event) {
      const response = Response.redirect(
        "https://www.purina-latam.com/sites/g/files/auxxlc391/files/styles/kraken_generic_max_width_960/public/Purina%C2%AE%20La%20llegada%20del%20gatito%20a%20casa.jpg?itok=-tX3EMqT",
        307
      );

      return response;
    },
  })
);

registerRoute(
  new Route(
    ({ request }) => {
      const url = new URL(request.url);
      return url.host === "random.imagecdn.app";
    },
    {
      async handler(event) {
        // NetworkFastOrPerrito
        const networkResponse = fetchAndCachePut(event, CACHE_NAME).catch(() => {});
        const perritoResponse = new Response(
          JSON.stringify({
            url: "/images/perrito.jpg",
          })
        );
        const response = await Promise.race([networkResponse, delay(200)]);

        return response || perritoResponse;
      },
    }
  )
);

registerRoute(
  new Route(
    ({ request }) => {
      const url = new URL(request.url);
      return url.host === "images.unsplash.com";
    },
    {
      async handler(event) {
        const customRequest = new Request("/randomImage.jpg");
        const cache = await caches.open(CACHE_NAME);
        const cacheResponse = await cache.match(customRequest);
        const networkResponse = fetch(event.request)
          .then((response) => {
            cache.put(customRequest, response.clone());

            return response;
          })
          .catch(() => {});

        return cacheResponse || networkResponse;
      },
    }
  )
);
registerRoute(new Route(({ request }) => !request.url.endsWith("sw.js"), new StaleWhileRevalidate()));

async function fetchAndCachePut({ request }, cacheName) {
  const response = await fetch(request);
  const cache = await caches.open(cacheName);

  if (request.method === "GET" && response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}
