/* FILE: js/app_update.js
   VERSI: 1.0
   FUNGSI: Deteksi update PWA dan tampilkan banner ke user
*/

const AppUpdate = {

    // =========================================================
    // ★ AWAL CUSTOM FUNCTIONS AppUpdate
    // =========================================================

    newWorker: null,

    // Inisialisasi: register service worker dan deteksi update
    init() {
        if (!('serviceWorker' in navigator)) {
            console.log('[Update] Service Worker tidak didukung');
            return;
        }

        navigator.serviceWorker.register('./sw.js').then(function(reg) {
            console.log('[Update] SW registered');

            // Cek apakah ada SW baru yang menunggu
            if (reg.waiting) {
                AppUpdate.showBanner(reg.waiting);
                return;
            }

            // Dengarkan jika ada SW baru yang sedang install
            reg.addEventListener('updatefound', function() {
                var newWorker = reg.installing;
                console.log('[Update] SW baru ditemukan, status: ' + newWorker.state);

                newWorker.addEventListener('statechange', function() {
                    console.log('[Update] SW state berubah: ' + newWorker.state);
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // Ada versi baru yang siap
                            AppUpdate.showBanner(newWorker);
                        }
                    }
                });
            });
        }).catch(function(err) {
            console.log('[Update] SW registration gagal: ' + err);
        });

        // Saat SW baru mengambil alih, reload halaman
        var refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', function() {
            if (!refreshing) {
                refreshing = true;
                console.log('[Update] Controller berubah, reload...');
                window.location.reload();
            }
        });
    },

    // Tampilkan banner update
    showBanner(worker) {
        AppUpdate.newWorker = worker;
        var banner = document.getElementById('update-banner');
        var versionInfo = document.getElementById('update-version-info');

        if (banner) {
            banner.classList.add('show');
        }
        if (versionInfo) {
            versionInfo.textContent = 'Versi baru siap dipasang. Klik UPDATE untuk memperbarui.';
        }

        console.log('[Update] Banner update ditampilkan');
    },

    // User klik tombol UPDATE
    doUpdate() {
        if (AppUpdate.newWorker) {
            // Kirim pesan ke SW baru untuk skipWaiting
            AppUpdate.newWorker.postMessage({ action: 'skipWaiting' });
        }

        var banner = document.getElementById('update-banner');
        if (banner) {
            banner.classList.remove('show');
        }
    },

    // User klik tombol dismiss (✕)
    dismissUpdate() {
        var banner = document.getElementById('update-banner');
        if (banner) {
            banner.classList.remove('show');
        }
    }

    // =========================================================
    // ★ AKHIR CUSTOM FUNCTIONS AppUpdate
    // =========================================================
};

window.AppUpdate = AppUpdate;
