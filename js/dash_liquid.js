/* FILE: js/dash_liquid.js
   FUNGSI: Menampilkan Dashboard 1 (Uang Cair: Dompet Saku & Rekening Bank)
*/

const DashLiquid = {
    render() {
        // 1. Ambil perhitungan akurat dari Mesin (Engine)
        const stats = Engine.getLiquidStats();
        const container = document.getElementById('dash-liquid-area');
        
        if (!container) return; // Keamanan agar tidak error jika HTML belum siap

        // 2. Saring hanya akun bank untuk ditampilkan rinciannya
        const bankAccounts = stats.accounts.filter(a => a.type === 'bank');

        // 3. Rakit tampilan HTML
        let html = `
            <div class="dash-container">
                <div class="card-summary card-full">
                    <div class="label-small">TOTAL SALDO CAIR (DOMPET + BANK)</div>
                    <div class="val-big" style="font-size: 1.6rem; color: var(--clr-in);">
                        Rp ${stats.total.toLocaleString('id-ID')}
                    </div>
                </div>

                <div class="card-summary" style="border-bottom: 4px solid var(--clr-in);">
                    <div class="label-small" style="color: var(--clr-in);">UANG SAKU (TUNAI)</div>
                    <div class="val-big">Rp ${stats.wallet.toLocaleString('id-ID')}</div>
                </div>

                <div class="card-summary" style="border-bottom: 4px solid var(--clr-bank);">
                    <div class="label-small" style="color: var(--clr-bank);">TOTAL DI BANK</div>
                    <div class="val-big">Rp ${stats.bank.toLocaleString('id-ID')}</div>
                </div>
            </div>

            <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.75rem; font-weight: 800; color: var(--txt-muted); letter-spacing: 1px;">RINCIAN REKENING DIGITAL</div>
                <button onclick="FormUniversal.openAddBank()" class="btn-icon" style="background: #444;">+ Tambah</button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                ${bankAccounts.length === 0 ? 
                    `<div style="grid-column: span 2; text-align: center; font-size: 0.8rem; color: #666; padding: 10px; background: var(--bg-card); border-radius: 12px; border: 1px dashed #444;">Belum ada rekening bank yang ditambahkan.</div>` 
                    : 
                    bankAccounts.map(b => `
                    <div class="card-summary" style="padding: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="font-weight: 800; font-size: 0.75rem; color: #ddd;">${b.name}</div>
                            <button onclick="Engine.deleteAccount('${b.id}')" style="background:none; border:none; color:var(--clr-out); font-size:1rem; cursor:pointer;">✕</button>
                        </div>
                        <div style="color: var(--clr-bank); font-weight: 900; font-size: 0.95rem; margin-top: 8px;">
                            Rp ${b.balance.toLocaleString('id-ID')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 25px; border-bottom: 1px solid #333; padding-bottom: 25px;">
                <button onclick="FormUniversal.openTransfer()" style="background: var(--clr-bank); color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 800; font-size: 0.75rem; box-shadow: 0 4px 10px rgba(41, 121, 255, 0.2);">Transfer</button>
                <button onclick="FormUniversal.openTarik()" style="background: #ff9800; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 800; font-size: 0.75rem; box-shadow: 0 4px 10px rgba(255, 152, 0, 0.2);">Tarik Tunai</button>
                <button onclick="FormUniversal.openSetor()" style="background: var(--clr-in); color: black; border: none; padding: 12px; border-radius: 12px; font-weight: 900; font-size: 0.75rem; box-shadow: 0 4px 10px rgba(0, 230, 118, 0.2);">Setor Tunai</button>
            </div>
        `;

        // 4. Tembakkan HTML ke dalam layar
        container.innerHTML = html;
    }
};

// Daftarkan komponen ini ke sistem utama
window.DashLiquid = DashLiquid;
