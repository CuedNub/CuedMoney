const CACHE_NAME = 'cuedmoney-v1.2.2';
const BASE = '/CuedMoney/';

const ASSETS = [
    BASE,
    BASE + 'index.html',
    BASE + 'css/style.css',
    BASE + 'js/core.js',
    BASE + 'js/engine.js',
    BASE + 'js/item_db.js',
    BASE + 'js/data_sync.js',
    BASE + 'js/dash_liquid.js',
    BASE + 'js/dash_debt.js',
    BASE + 'js/filter_advanced.js',
    BASE + 'js/list_item.js',
    BASE + 'js/form_universal.js',
    BASE + 'js/form_shopping.js',
    BASE + 'js/receipt_digital.js',
    BASE + 'js/app_update.js',
    BASE + 'js/license.js',
    BASE + 'manifest.json',
    BASE + 'icons/icon-192.png',
    BASE + 'icons/icon-512.png'
];

// Install: simpan semua file ke cache
self.addEventListener('install', function(event) {
    console.log('[SW] Install: ' + CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS);
        })
    );
    // Jangan langsung aktifkan, tunggu user klik update
    // self.skipWaiting() akan dipanggil via pesan
});

// Activate: hapus cache lama
self.addEventListener('activate', function(event) {
    console.log('[SW] Activate: ' + CACHE_NAME);
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) {
                    return key !== CACHE_NAME;
                }).map(function(key) {
                    console.log('[SW] Hapus cache lama: ' + key);
                    return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch: cache first, fallback ke network
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(cached) {
            if (cached) {
                return cached;
            }
            return fetch(event.request).catch(function() {
                return caches.match(BASE + 'index.html');
            });
        })
    );
});

// Terima pesan dari app untuk skipWaiting
self.addEventListener('message', function(event) {
    if (event.data && event.data.action === 'skipWaiting') {
        console.log('[SW] Skip waiting, aktivasi versi baru...');
        self.skipWaiting();
    }
});
