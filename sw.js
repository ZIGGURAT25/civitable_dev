const CACHE_NAME = 'civi-table-cache-v2';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/data.js'
];

// 1. Install the service worker and cache core assets
self.addEventListener('install', event => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// 2. Activate the service worker and clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Take control of all clients
    );
});

// 3. Intercept fetch requests
self.addEventListener('fetch', event => {
    const { request } = event;

    // For data.js, use a stale-while-revalidate strategy
    if (request.url.endsWith('/data.js')) {
        event.respondWith(staleWhileRevalidate(request));
    } else {
        // For all other requests, use a cache-first strategy
        event.respondWith(
            caches.match(request)
                .then(response => {
                    return response || fetch(request);
                })
        );
    }
});

function staleWhileRevalidate(request) {
    const networkFetch = fetch(request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
            // We need to clone the response to use it twice (cache and check)
            const responseCloneForCache = networkResponse.clone();
            const responseCloneForCheck = networkResponse.clone();

            // Check if the data has been updated before caching
            checkForUpdates(request, responseCloneForCheck);

            // Cache the new response
            cache.put(request, responseCloneForCache);
            return networkResponse;
        });
    }).catch(err => {
        console.error('Network fetch for data.js failed:', err);
        // If network fails, we've already served from cache, so it's okay
    });

    return caches.match(request).then(cachedResponse => {
        // Return cached response immediately, while the network request runs in the background
        return cachedResponse || networkFetch;
    });
}

async function checkForUpdates(request, networkResponse) {
    try {
        const cachedResponse = await caches.match(request);
        if (!cachedResponse || !networkResponse) return;

        const [newText, oldText] = await Promise.all([
            networkResponse.text(),
            cachedResponse.text()
        ]);

        const getTimestamp = (text) => {
            const match = text.match(/window\.lastUpdatedDate\s*=\s*['"](.*?)['"]/);
            return match ? new Date(match[1]).getTime() : null;
        };

        const newTimestamp = getTimestamp(newText);
        const oldTimestamp = getTimestamp(oldText);

        if (newTimestamp && oldTimestamp && newTimestamp > oldTimestamp) {
            console.log('New data found. Sending reload message to clients.');
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({ type: 'RELOAD_PAGE' });
            });
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
    }
}


// Suppress all Workbox logs in production
workbox.setConfig({ debug: false });

// Precache all app assets for full offline support
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || [
  { url: 'index.html', revision: null },
  { url: 'manifest.json', revision: null },

  { url: 'images/icon-192x192.png', revision: null },
  { url: 'images/icon-512x512.png', revision: null },
  { url: 'images/org.png', revision: null },
  // Add more assets as needed
]);

// Cache all static assets (CSS, JS, images, fonts, sounds)
workbox.routing.registerRoute(
  ({ request }) => [
    'style', 'script', 'image', 'font', 'audio'
  ].includes(request.destination),
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets-v1',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache Google Fonts
workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://fonts.gstatic.com',
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
        maxEntries: 30,
      }),
    ],
  })
);

// Use StaleWhileRevalidate for navigation requests for a fast, offline-first experience.
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'pages-v1',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// --- BACKGROUND SYNC EVENT ---
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingActions() {
  // Try to get the queue from IndexedDB or fallback to localStorage (for demo, using localStorage)
  let pending = [];
  try {
    const data = await self.clients.matchAll({type: 'window'}).then(windows => {
      if (windows.length > 0) {
        // Communicate with the first client to get localStorage data
        return new Promise(resolve => {
          const channel = new MessageChannel();
          channel.port1.onmessage = (event) => resolve(event.data);
          windows[0].postMessage({type: 'GET_PENDING_ACTIONS'}, [channel.port2]);
        });
      }
      return [];
    });
    pending = data || [];
  } catch (e) { /* fallback empty */ }

  if (pending && pending.length > 0) {
    for (const action of pending) {
      try {
        await fetch('/sync', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(action)
        });
      } catch (e) {
        // If failed, keep in queue
        return;
      }
    }
    // Notify clients to clear the queue
    const windows = await self.clients.matchAll({type: 'window'});
    for (const client of windows) {
      client.postMessage({type: 'CLEAR_PENDING_ACTIONS'});
    }
  }
}

// Suppress all unhandled promise rejections and errors in the SW
self.addEventListener('unhandledrejection', event => {
  event.preventDefault();
});
self.addEventListener('error', event => {
  event.preventDefault();
});

// Fallback to index.html for navigation requests when offline
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('index.html'))
    );
  }
});
