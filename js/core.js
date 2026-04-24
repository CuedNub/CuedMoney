/* FILE: js/core.js
   FUNGSI: Mandor Utama, Manajemen State, dan Pengendali UI
*/

const Core = {
    APP_VERSION: '1.4.0',
    // STATE: Ingatan Aplikasi
    isFormOpen: false,
    lastDataChange: null,
    lastBackupDate: null,

    state: {
        data: {
            transactions: [], // Buku Besar Utama (Semua mutasi kumpul di sini)
            accounts: [
                // Akun default (Dompet Saku) tidak bisa dihapus
                { id: 'wallet_cash', name: 'Dompet Saku', type: 'wallet', balance: 0 }
            ],
            price_memory: {} // Memori harga untuk form belanja / kasir
        },
        filters: {
            category: 'all', // all, liquid (bank/dompet), debt (hutang)
            flow: 'all',     // all, in (+), out (-)
            search: ''       // Kata kunci pencarian
        }
    },

    init() {
        this.loadData();
        
        // Memberi sedikit jeda agar semua file js lain (engine, dashboard, dll)
        // selesai dimuat oleh browser sebelum kita menyuruh mereka menggambar tampilan.
        setTimeout(() => {
            this.refreshUI();
            console.log("CuedMoney v" + Core.APP_VERSION + " Ready!");
            
            // Cek status backup saat app dibuka
            this.checkBackupStatus();

            // Inisialisasi sistem lisensi
            if (window.License) {
                var licenseOK = License.init();
                if (!licenseOK) {
                    console.log('CuedMoney: Lisensi tidak aktif');
                    return; // Stop init, app terkunci
                }
            }

            // Inisialisasi sistem update
            if (window.AppUpdate) AppUpdate.init();

            // Tampilkan versi di header (hanya jika License tidak handle)
            if (!window.License) {
                const verEl = document.getElementById('app-version');
                if (verEl) verEl.textContent = 'v' + Core.APP_VERSION;
            }
        }, 100);
    },

    loadData() {
        const saved = localStorage.getItem('cued_money_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Digabung dengan aman agar struktur data tidak pecah
            this.state.data.transactions = parsed.transactions || [];
            this.state.data.accounts = parsed.accounts || [{ id: 'wallet_cash', name: 'Dompet Saku', type: 'wallet', balance: 0 }];
            this.state.data.price_memory = parsed.price_memory || {};
        }
    },

    saveData() {
        // Simpan seluruh data state ke memori HP
        localStorage.setItem('cued_money_data', JSON.stringify(this.state.data));

        // Catat waktu perubahan data terakhir
        var now = new Date().toISOString();
        localStorage.setItem('cued_money_last_change', now);
        this.lastDataChange = now;

        // Cek apakah perlu tampilkan pengingat backup
        this.checkBackupStatus();
    },

    // FUNGSI SINKRONISASI: Memperbarui semua tampilan serentak
    refreshUI() {
        if (window.DashLiquid) DashLiquid.render();
        if (window.DashDebt) DashDebt.render();
        if (window.FilterAdvanced) FilterAdvanced.render();
        if (window.ListItem) ListItem.render();
    },

    // FUNGSI MODAL: Untuk memunculkan formulir atau struk melayang
    openModal(htmlContent) {
        const body = document.getElementById('modal-body');
        const container = document.getElementById('modal-container');
        const overlay = document.getElementById('modal-overlay');

        if (body && container && overlay) {
            body.innerHTML = htmlContent;
            overlay.style.display = 'block';
            this.isFormOpen = true;
            
            // Jeda 10ms agar animasi CSS slide-up berjalan mulus
            setTimeout(() => {
                container.classList.add('show');
            }, 10);
        }
    },

    // ---------------------------------------------------------
    // BACKUP REMINDER
    // Fungsi pengingat backup data
    // ---------------------------------------------------------

    // Cek apakah perlu tampilkan pengingat backup
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

    // Tampilkan banner pengingat backup
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

    // Sembunyikan banner backup
    hideBackupBanner() {
        var banner = document.getElementById('backup-banner');
        if (banner) banner.classList.remove('show');
    },

    // Catat bahwa backup sudah dilakukan
    markBackupDone() {
        var now = new Date().toISOString();
        localStorage.setItem('cued_money_last_backup', now);
        this.lastBackupDate = now;
        this.hideBackupBanner();
    },

    closeModal() {
        const container = document.getElementById('modal-container');
        const overlay = document.getElementById('modal-overlay');

        if (container && overlay) {
            container.classList.remove('show');
            this.isFormOpen = false;
            
            // Tunggu animasi turun selesai (300ms) baru hilangkan overlay
            setTimeout(() => {
                overlay.style.display = 'none';
                document.getElementById('modal-body').innerHTML = ''; // Bersihkan memori tampilan modal
            }, 300); 
        }
    }
};

// Perlindungan: Pesan konfirmasi saat refresh/tutup halaman saat form terbuka
window.addEventListener('beforeunload', function(e) {
    if (Core.isFormOpen) {
        e.preventDefault();
        e.returnValue = 'Kamu sedang mengisi formulir. Yakin ingin meninggalkan halaman?';
        return e.returnValue;
    }
});

// Perlindungan: Tombol back di HP
window.addEventListener('popstate', function(e) {
    if (Core.isFormOpen) {
        // Dorong state baru agar back tidak keluar
        history.pushState(null, '', location.href);
        // Tutup modal sebagai gantinya
        Core.closeModal();
    }
});

// Jalankan Mandor saat halaman HTML sudah siap sepenuhnya
document.addEventListener('DOMContentLoaded', () => {
    Core.init();
    // Siapkan history state untuk tangkap tombol back
    history.pushState(null, '', location.href);
});
