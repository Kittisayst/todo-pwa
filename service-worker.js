// Service Worker for Modern Task Management App
const CACHE_NAME = 'task-manager-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install Event - Cache files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch Event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // ກັ່ນຕອງພຽງແຕ່ HTTP/HTTPS requests ເທົ່ານັ້ນ
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then((fetchResponse) => {
                        // ກວດວ່າ response ຖືກຕ້ອງກ່ອນ cache
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type === 'error') {
                            return fetchResponse;
                        }

                        // Cache ພຽງແຕ່ requests ຈາກ origin ດຽວກັນ ແລະ ຟອນ
                        if (event.request.url.startsWith(self.location.origin) ||
                            event.request.url.includes('googleapis.com') ||
                            event.request.url.includes('gstatic.com')) {
                            const responseToCache = fetchResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                })
                                .catch((err) => {
                                    console.log('Service Worker: Cache put error:', err);
                                });
                        }

                        return fetchResponse;
                    });
            })
            .catch((error) => {
                console.log('Service Worker: Fetch failed:', error);
                // ສາມາດເພີ່ມ fallback page ຫຼື offline message ໄດ້ທີ່ນີ້
            })
    );
});