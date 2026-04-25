/* FILE: js/core.js
   VERSI: 1.4.1
   FUNGSI: Mandor Utama, Manajemen State, dan Pengendali UI
*/

const Core = {
    APP_VERSION: '1.4.1',

    // STATE: Ingatan Aplikasi
    isFormOpen: false,
    isSidebarOpen: false,
    lastDataChange: null,
    lastBackupDate: null,

    state: {
        data: {
            transactions: [],
            accounts: [
                { id: 'wallet_cash', name: 'Dompet Saku', type: 'wallet', balance: 0 }
            ],
            price_memory: {}
        },
        filters: {
            category: 'all',
            flow: 'all',
            search: ''
        }
    },

    // =========================================================
    // AWAL CUSTOM FUNCTIONS Core
    // =========================================================

    // ---------------------------------------------------------
    // INIT & LOAD
    // Inisialisasi aplikasi saat halaman siap
    // ---------------------------------------------------------

    init() {
        this.loadData();

        setTimeout(() => {
            this.refreshUI();
            console.log("CuedMoney v" + Core.APP_VERSION + " Ready!");

            this.checkBackupStatus();

            if (window.License) {
                var licenseOK = License.init();
                if (!licenseOK) {
                    console.log('CuedMoney: Lisensi tidak aktif');
                    return;
                }
            }

            if (window.AppUpdate) AppUpdate.init();

            if (!window.License) {
                const verEl = document.getElementById('app-version');
                if (verEl) verEl.textContent = 'v' + Core.APP_VERSION;
            }
        }, 100);
    },

    // Muat data dari localStorage
    loadData() {
        const saved = localStorage.getItem('cued_money_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state.data.transactions = parsed.transactions || [];
            this.state.data.accounts = parsed.accounts || [{ id: 'wallet_cash', name: 'Dompet Saku', type: 'wallet', balance: 0 }];
            this.state.data.price_memory = parsed.price_memory || {};
        }
    },

    // Simpan data ke localStorage
    saveData() {
        localStorage.setItem('cued_money_data', JSON.stringify(this.state.data));

        var now = new Date().toISOString();
        localStorage.setItem('cued_money_last_change', now);
        this.lastDataChange = now;

        this.checkBackupStatus();
    },

    // ---------------------------------------------------------
    // REFRESH UI
    // Memperbarui semua tampilan serentak
    // ---------------------------------------------------------

    refreshUI() {
        if (window.DashLiquid) DashLiquid.renderMain();
        if (window.DashDebt) DashDebt.renderMain();
        if (window.FilterAdvanced) FilterAdvanced.render();
        if (window.ListItem) ListItem.render();
    },

    // ---------------------------------------------------------
    // SIDEBAR
    // Buka dan tutup sidebar kiri
    // ---------------------------------------------------------

    // Buka sidebar kiri
    openSidebar() {
        var sidebar = document.getElementById('sidebar-panel');
        var overlay = document.getElementById('sidebar-overlay');

        if (!sidebar || !overlay) return;

        // Render isi sidebar sebelum dibuka
        if (window.DashLiquid) DashLiquid.renderSidebar();
        if (window.DashDebt) DashDebt.renderSidebar();

        // Tampilkan overlay dan sidebar
        overlay.classList.add('show');
        sidebar.classList.add('show');

        // Tandai sidebar sedang terbuka
        this.isSidebarOpen = true;

        // Simpan history agar tombol back bisa tutup sidebar
        history.pushState({ sidebar: true }, '', location.href);
    },

    // Tutup sidebar kiri
    closeSidebar() {
        var sidebar = document.getElementById('sidebar-panel');
        var overlay = document.getElementById('sidebar-overlay');

        if (!sidebar || !overlay) return;

        overlay.classList.remove('show');
        sidebar.classList.remove('show');

        this.isSidebarOpen = false;
    },

    // ---------------------------------------------------------
    // TENTANG
    // Tampilkan popup informasi aplikasi dan lisensi
    // ---------------------------------------------------------

    showTentang() {
        // Tutup sidebar dulu
        this.closeSidebar();

        // Ambil info lisensi
        var licenseStatus = 'Belum Aktivasi';
        var remainingDays = 0;
        var licenseColor = '#666';

        if (window.License) {
            remainingDays = License.getRemainingDays ? License.getRemainingDays() : 0;
            if (remainingDays > 7) {
                licenseStatus = 'Aktif';
                licenseColor = 'var(--clr-in)';
            } else if (remainingDays > 0) {
                licenseStatus = 'Hampir Habis';
                licenseColor = '#ff9800';
            } else {
                licenseStatus = 'Habis';
                licenseColor = 'var(--clr-out)';
            }
        }

        // Ambil info backup terakhir
        var lastBackup = localStorage.getItem('cued_money_last_backup');
        var backupStr = 'Belum pernah backup';
        if (lastBackup) {
            var d = new Date(lastBackup);
            backupStr = d.toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }

        // Rakit HTML popup Tentang
        var html = '<div class="tentang-container">'

            // Header
            + '<div class="tentang-header">'
            + '<div class="tentang-logo">💰</div>'
            + '<div class="tentang-app-name">CuedMoney</div>'
            + '<div class="tentang-tagline">Aplikasi Pencatat Keuangan Pribadi</div>'
            + '</div>'

            // Informasi Aplikasi
            + '<div class="tentang-section">'
            + '<div class="tentang-section-title">Informasi Aplikasi</div>'
            + '<div class="tentang-row">'
            + '<span class="tentang-key">Nama Aplikasi</span>'
            + '<span class="tentang-val">CuedMoney</span>'
            + '</div>'
            + '<div class="tentang-row">'
            + '<span class="tentang-key">Versi</span>'
            + '<span class="tentang-val">v' + Core.APP_VERSION + '</span>'
            + '</div>'
            + '<div class="tentang-row">'
            + '<span class="tentang-key">Mode</span>'
            + '<span class="tentang-val">PWA / Offline</span>'
            + '</div>'
            + '<div class="tentang-row">'
            + '<span class="tentang-key">Developer</span>'
            + '<span class="tentang-val">CuedNub</span>'
            + '</div>'
            + '</div>'

            // Informasi Lisensi
            + '<div class="tentang-section">'
            + '<div class="tentang-section-title">Informasi Lisensi</div>'
            + '<div class="tentang-row">'
            + '<span class="tentang-key">Status</span>'
            + '<span class="tentang-val" style="color: ' + licenseColor + '; font-weight: 900;">' + licenseStatus + '</span>'
            + '</div>'
            + '<div class="tentang-row">'
            + '<span class="tentang-key">Sisa Hari</span>'
            + '<span class="tentang-val" style="color: ' + licenseColor + '; font-weight: 900;">' + remainingDays + ' hari</span>'
            + '</div>'
            + '<div class="tentang-row">'
            + '<span class="tentang-key">Aktivasi</span>'
            + '<span class="tentang-val">Perlu internet</span>'
            + '</div>'
            + '<div class="tentang-row">'
            + '<span class="tentang-key">Pemakaian</span>'
            + '<span class="tentang-val">Bisa offline</span>'
            + '</div>'
            + '</div>'

            // Informasi Data
            + '<div class="tentang-section">'
            + '<div class="tentang-section-title">Informasi Data</div>'
            + '<div class="tentang-row">'
            + '<span class="tentang-key">Penyimpanan</span>'
            + '<span class="tentang-val">Lokal di perangkat</span>'
            + '</div>'
            + '<div class="tentang-row">'
            + '<span class="tentang-key">Backup Terakhir</span>'
            + '<span class="tentang-val">' + backupStr + '</span>'
            + '</div>'
            + '</div>'

            // Catatan Penting
            + '<div class="tentang-section">'
            + '<div class="tentang-section-title">Catatan Penting</div>'
            + '<div class="tentang-notes">'
            + '<div class="tentang-note-item">⚠️ Data disimpan lokal di perangkat ini saja.</div>'
            + '<div class="tentang-note-item">💾 Lakukan export JSON secara berkala.</div>'
            + '<div class="tentang-note-item">🌐 Aktivasi lisensi memerlukan koneksi internet.</div>'
            + '<div class="tentang-note-item">📴 Pemakaian harian dapat dilakukan secara offline.</div>'
            + '</div>'
            + '</div>'

            + '</div>';

        Core.openModal(html);
    },

    // ---------------------------------------------------------
    // MODAL
    // Untuk memunculkan formulir atau struk melayang
    // ---------------------------------------------------------

    openModal(htmlContent) {
        const body = document.getElementById('modal-body');
        const container = document.getElementById('modal-container');
        const overlay = document.getElementById('modal-overlay');

        if (body && container && overlay) {
            body.innerHTML = htmlContent;
            overlay.style.display = 'block';
            this.isFormOpen = true;

            setTimeout(() => {
                container.classList.add('show');
            }, 10);
        }
    },

    closeModal() {
        const container = document.getElementById('modal-container');
        const overlay = document.getElementById('modal-overlay');

        if (container && overlay) {
            container.classList.remove('show');
            this.isFormOpen = false;

            setTimeout(() => {
                overlay.style.display = 'none';
                document.getElementById('modal-body').innerHTML = '';
            }, 300);
        }
    },

    // ---------------------------------------------------------
    // BACKUP REMINDER
    // Fungsi pengingat backup data
    // ---------------------------------------------------------

    checkBackupStatus() {
        var lastChange = localStorage.getItem('cued_money_last_change');
        var lastBackup = localStorage.getItem('cued_money_last_backup');

        if (!lastChange) {
            this.hideBackupBanner();
            return;
        }

        if (!lastBackup || new Date(lastBackup) < new Date(lastChange)) {
            this.showBackupBanner(lastChange);
        } else {
            this.hideBackupBanner();
        }
    },

    showBackupBanner(lastChange) {
        var banner = document.getElementById('backup-banner');
        if (!banner) return;

        var changeDate = new Date(lastChange);
        var now = new Date();
        var diffTime = now.getTime() - changeDate.getTime();
        var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        var dateStr = changeDate.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        var infoEl = document.getElementById('backup-info-text');
        if (infoEl) {
            if (diffDays === 0) {
                infoEl.textContent = 'Perubahan hari ini belum disimpan. Simpan sekarang!';
            } else if (diffDays === 1) {
                infoEl.textContent = 'Data belum disimpan sejak kemarin (' + dateStr + ')';
            } else {
                infoEl.textContent = 'Data belum disimpan sejak ' + diffDays + ' hari lalu (' + dateStr + ')';
            }
        }

        banner.classList.add('show');
    },

    hideBackupBanner() {
        var banner = document.getElementById('backup-banner');
        if (banner) banner.classList.remove('show');
    },

    markBackupDone() {
        var now = new Date().toISOString();
        localStorage.setItem('cued_money_last_backup', now);
        this.lastBackupDate = now;
        this.hideBackupBanner();
    }

    // =========================================================
    // AKHIR CUSTOM FUNCTIONS Core
    // =========================================================
};

// ---------------------------------------------------------
// PROTEKSI NAVIGASI
// Cegah refresh dan back saat form atau sidebar terbuka
// ---------------------------------------------------------

window.addEventListener('beforeunload', function(e) {
    if (Core.isFormOpen) {
        e.preventDefault();
        e.returnValue = 'Kamu sedang mengisi formulir. Yakin ingin meninggalkan halaman?';
        return e.returnValue;
    }
});

window.addEventListener('popstate', function(e) {
    // Jika sidebar terbuka, tutup sidebar dulu
    if (Core.isSidebarOpen) {
        Core.closeSidebar();
        return;
    }
    // Jika modal terbuka, tutup modal
    if (Core.isFormOpen) {
        history.pushState(null, '', location.href);
        Core.closeModal();
    }
});

// Jalankan saat halaman siap
document.addEventListener('DOMContentLoaded', () => {
    Core.init();
    history.pushState(null, '', location.href);
});

// Daftarkan ke window
window.Core = Core;
