/* FILE: js/core.js
   FUNGSI: Mandor Utama, Manajemen State, dan Pengendali UI
*/

const Core = {
    APP_VERSION: '1.0.1',
    // STATE: Ingatan Aplikasi
    isFormOpen: false,

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
            
            // Inisialisasi sistem update
            if (window.AppUpdate) AppUpdate.init();

            // Tampilkan versi di header
            const verEl = document.getElementById('app-version');
            if (verEl) verEl.textContent = 'v' + Core.APP_VERSION;
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
