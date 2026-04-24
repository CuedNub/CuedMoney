/* SERVICE WORKER - CuedMoney PWA
   Fungsi: Cache semua file agar bisa offline
*/

const CACHE_NAME = 'cuedmoney-v1';

// Semua file yang akan disimpan offline
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/core.js',
    '/js/item_db.js',
    '/js/engine.js',
    '/js/data_sync.js',
    '/js/dash_liquid.js',
    '/js/dash_debt.js',
    '/js/filter_advanced.js',
    '/js/list_item.js',
    '/js/form_universal.js',
    '/js/form_shopping.js',
    '/js/receipt_digital.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Install: simpan semua file ke cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('CuedMoney: Menyimpan file ke cache...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                console.log('CuedMoney: Semua file tersimpan, siap offline!');
                return self.skipWaiting();
            })
    );
});

// Activate: hapus cache lama
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    console.log('CuedMoney: Hapus cache lama:', key);
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});

// Fetch: ambil dari cache dulu, baru internet
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseClone));
                        return response;
                    })
                    .catch(() => {
                        return caches.match('/index.html');
                    });
            })
    );
});
