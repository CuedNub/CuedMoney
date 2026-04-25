/* FILE: js/dash_liquid.js
   VERSI: 1.4.1
   FUNGSI: Dashboard Uang Cair (Dompet Saku & Rekening Bank)
           - renderMain()    → halaman utama (saldo + tombol aksi)
           - renderSidebar() → sidebar kiri (rincian rekening)
*/

const DashLiquid = {

    // =========================================================
    // AWAL CUSTOM FUNCTIONS DashLiquid
    // =========================================================

    // ---------------------------------------------------------
    // RENDER MAIN — Tampil di halaman utama
    // Menampilkan: Total Saldo, Uang Saku, Total Bank, Tombol Aksi
    // ---------------------------------------------------------
    renderMain() {
        const stats = Engine.getLiquidStats();
        const container = document.getElementById('dash-liquid-area');

        if (!container) return;

        let html = '<div class="dash-container">'
            + '<div class="card-summary card-full">'
            + '<div class="label-small">TOTAL SALDO CAIR (DOMPET + BANK)</div>'
            + '<div class="val-big" style="font-size: 1.6rem; color: var(--clr-in);">'
            + 'Rp ' + stats.total.toLocaleString('id-ID')
            + '</div>'
            + '</div>'

            + '<div class="card-summary" style="border-bottom: 4px solid var(--clr-in);">'
            + '<div class="label-small" style="color: var(--clr-in);">UANG SAKU (TUNAI)</div>'
            + '<div class="val-big">Rp ' + stats.wallet.toLocaleString('id-ID') + '</div>'
            + '</div>'

            + '<div class="card-summary" style="border-bottom: 4px solid var(--clr-bank);">'
            + '<div class="label-small" style="color: var(--clr-bank);">TOTAL DI BANK</div>'
            + '<div class="val-big">Rp ' + stats.bank.toLocaleString('id-ID') + '</div>'
            + '</div>'
            + '</div>'

            + '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 25px; border-bottom: 1px solid #333; padding-bottom: 25px;">'
            + '<button onclick="FormUniversal.openTransfer()" style="background: var(--clr-bank); color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 800; font-size: 0.75rem; box-shadow: 0 4px 10px rgba(41, 121, 255, 0.2);">Transfer</button>'
            + '<button onclick="FormUniversal.openTarik()" style="background: #ff9800; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 800; font-size: 0.75rem; box-shadow: 0 4px 10px rgba(255, 152, 0, 0.2);">Tarik Tunai</button>'
            + '<button onclick="FormUniversal.openSetor()" style="background: var(--clr-in); color: black; border: none; padding: 12px; border-radius: 12px; font-weight: 900; font-size: 0.75rem; box-shadow: 0 4px 10px rgba(0, 230, 118, 0.2);">Setor Tunai</button>'
            + '</div>';

        container.innerHTML = html;
    },

    // ---------------------------------------------------------
    // RENDER SIDEBAR — Tampil di sidebar kiri
    // Menampilkan: Rincian rekening digital + tombol Tambah
    // ---------------------------------------------------------
    renderSidebar() {
        const stats = Engine.getLiquidStats();
        const container = document.getElementById('sidebar-rekening-area');

        if (!container) return;

        var bankAccounts = stats.accounts.filter(function(a) {
            return a.type === 'bank';
        });

        var html = '<div class="sidebar-section-header">'
            + '<span class="sidebar-section-title">RINCIAN REKENING DIGITAL</span>'
            + '<button onclick="FormUniversal.openAddBank()" class="sidebar-btn-add">+ Tambah</button>'
            + '</div>';

        if (bankAccounts.length === 0) {
            html += '<div class="sidebar-empty">'
                + 'Belum ada rekening bank.'
                + '</div>';
        } else {
            html += '<div class="sidebar-account-list">';
            for (var i = 0; i < bankAccounts.length; i++) {
                var b = bankAccounts[i];
                html += '<div class="sidebar-account-card">'
                    + '<div class="sidebar-account-top">'
                    + '<span class="sidebar-account-name">' + b.name + '</span>'
                    + '<button onclick="Engine.deleteAccount(\'' + b.id + '\')" class="sidebar-account-del">✕</button>'
                    + '</div>'
                    + '<div class="sidebar-account-balance">'
                    + 'Rp ' + b.balance.toLocaleString('id-ID')
                    + '</div>'
                    + '</div>';
            }
            html += '</div>';

            // Total rekening
            html += '<div class="sidebar-account-total">'
                + '<span>Total Rekening</span>'
                + '<span style="color: var(--clr-bank); font-weight: 900;">'
                + 'Rp ' + stats.bank.toLocaleString('id-ID')
                + '</span>'
                + '</div>';
        }

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
    // AKHIR CUSTOM FUNCTIONS DashLiquid
    // =========================================================
};

// Daftarkan komponen ini ke sistem utama
window.DashLiquid = DashLiquid;
