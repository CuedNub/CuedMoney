/* FILE: js/dash_debt.js
   VERSI: 1.4.1
   FUNGSI: Dashboard Hutang & Piutang
           - renderMain()    → halaman utama (tombol catat)
           - renderSidebar() → sidebar kiri (ringkasan hutang/piutang/barang)
*/

const DashDebt = {

    // =========================================================
    // AWAL CUSTOM FUNCTIONS DashDebt
    // =========================================================

    // ---------------------------------------------------------
    // RENDER MAIN — Tampil di halaman utama
    // Menampilkan: Tombol catat hutang / piutang / barang
    // ---------------------------------------------------------
    renderMain() {
        const stats = Engine.getDebtStats();
        const container = document.getElementById('dash-debt-area');

        if (!container) return;

        var html = '<div style="margin-bottom: 25px; border-bottom: 1px solid #333; padding-bottom: 25px;">'
            + '<button onclick="FormUniversal.openDebt()" style="width: 100%; background: #2a2a2a; color: white; border: 1px solid #444; padding: 16px; border-radius: 15px; font-weight: 800; font-size: 0.85rem; box-shadow: 0 4px 15px rgba(0,0,0,0.4); text-transform: uppercase; letter-spacing: 0.5px;">'
            + '+ Catat Hutang / Piutang / Barang'
            + '</button>'
            + '</div>';

        container.innerHTML = html;
    },

    // ---------------------------------------------------------
    // RENDER SIDEBAR — Tampil di sidebar kiri
    // Menampilkan: Ringkasan piutang, hutang, tanggungan barang
    // ---------------------------------------------------------
    renderSidebar() {
        const stats = Engine.getDebtStats();
        const container = document.getElementById('sidebar-debt-area');

        if (!container) return;

        // Hitung selisih piutang vs hutang
        var selisih = stats.piutang - stats.hutang;
        var selisihColor = selisih >= 0 ? 'var(--clr-in)' : 'var(--clr-out)';
        var selisihLabel = selisih >= 0 ? 'Lebih Banyak Piutang' : 'Lebih Banyak Hutang';

        var html = '<div class="sidebar-section-header">'
            + '<span class="sidebar-section-title">HUTANG &amp; PIUTANG</span>'
            + '</div>'

            + '<div class="sidebar-debt-row">'
            + '<div class="sidebar-debt-card sidebar-debt-piutang">'
            + '<div class="sidebar-debt-label">PIUTANG SAYA</div>'
            + '<div class="sidebar-debt-value" style="color: var(--clr-in);">'
            + 'Rp ' + stats.piutang.toLocaleString('id-ID')
            + '</div>'
            + '</div>'

            + '<div class="sidebar-debt-card sidebar-debt-hutang">'
            + '<div class="sidebar-debt-label">HUTANG SAYA</div>'
            + '<div class="sidebar-debt-value" style="color: var(--clr-out);">'
            + 'Rp ' + stats.hutang.toLocaleString('id-ID')
            + '</div>'
            + '</div>'
            + '</div>'

            + '<div class="sidebar-debt-barang">'
            + '<div class="sidebar-debt-label" style="color: var(--clr-item);">TANGGUNGAN BARANG</div>'
            + '<div class="sidebar-debt-value" style="color: var(--clr-item);">'
            + 'Rp ' + stats.barang.toLocaleString('id-ID')
            + '</div>'
            + '</div>'

            + '<div class="sidebar-debt-selisih">'
            + '<div class="sidebar-debt-label">SELISIH</div>'
            + '<div class="sidebar-debt-value" style="color: ' + selisihColor + ';">'
            + 'Rp ' + Math.abs(selisih).toLocaleString('id-ID')
            + '</div>'
            + '<div class="sidebar-debt-selisih-label" style="color: ' + selisihColor + ';">'
            + selisihLabel
            + '</div>'
            + '</div>';

        container.innerHTML = html;
    },

    // ---------------------------------------------------------
    // RENDER LEGACY — Fungsi lama untuk kompatibilitas
    // Memanggil renderMain saja (sidebar dipanggil terpisah)
    // ---------------------------------------------------------
    render() {
        this.renderMain();
    }

    // =========================================================
    // AKHIR CUSTOM FUNCTIONS DashDebt
    // =========================================================
};

// Daftarkan komponen ini ke sistem utama
window.DashDebt = DashDebt;
