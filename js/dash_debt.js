/* FILE: js/dash_debt.js
   FUNGSI: Menampilkan Dashboard 2 (Ringkasan Hutang, Piutang, dan Tanggungan Barang)
*/

const DashDebt = {
    render() {
        // 1. Minta perhitungan akurat dari Mesin (Engine)
        const stats = Engine.getDebtStats();
        const container = document.getElementById('dash-debt-area');
        
        if (!container) return; // Keamanan jika HTML belum siap

        // 2. Rakit tampilan HTML
        let html = `
            <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.75rem; font-weight: 800; color: var(--txt-muted); letter-spacing: 1px;">RINGKASAN HUTANG & PIUTANG</div>
            </div>

            <div class="dash-container">
                <div class="card-summary" style="border-bottom: 4px solid var(--clr-in); background: linear-gradient(180deg, var(--bg-card) 0%, rgba(0, 230, 118, 0.05) 100%);">
                    <div class="label-small" style="color: var(--clr-in);">PIUTANG SAYA</div>
                    <div class="val-big">Rp ${stats.piutang.toLocaleString('id-ID')}</div>
                </div>

                <div class="card-summary" style="border-bottom: 4px solid var(--clr-out); background: linear-gradient(180deg, var(--bg-card) 0%, rgba(255, 23, 68, 0.05) 100%);">
                    <div class="label-small" style="color: var(--clr-out);">HUTANG SAYA</div>
                    <div class="val-big">Rp ${stats.hutang.toLocaleString('id-ID')}</div>
                </div>

                <div class="card-summary card-full" style="border-bottom: 4px solid var(--clr-item); background: linear-gradient(180deg, var(--bg-card) 0%, rgba(255, 145, 0, 0.05) 100%);">
                    <div class="label-small" style="color: var(--clr-item);">TOTAL TANGGUNGAN BARANG</div>
                    <div class="val-big">Rp ${stats.barang.toLocaleString('id-ID')}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 25px; border-bottom: 1px solid #333; padding-bottom: 25px;">
                <button onclick="FormUniversal.openDebt()" style="width: 100%; background: #2a2a2a; color: white; border: 1px solid #444; padding: 16px; border-radius: 15px; font-weight: 800; font-size: 0.85rem; box-shadow: 0 4px 15px rgba(0,0,0,0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                    + Catat Hutang / Piutang / Barang
                </button>
            </div>
        `;

        // 3. Tembakkan ke layar HTML
        container.innerHTML = html;
    }
};

// Daftarkan komponen ini ke sistem utama
window.DashDebt = DashDebt;
