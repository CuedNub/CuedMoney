/* FILE: js/list_item.js
   FUNGSI: Mencetak baris riwayat transaksi dengan warna dan filter
*/

const ListItem = {
    render() {
        const container = document.getElementById('transaction-list-area');
        if (!container) return;

        const transactions = Core.state.data.transactions || [];
        const filters = Core.state.filters;
        const accounts = Core.state.data.accounts || [];

        // 1. TERAPKAN FILTER CANGGIH
        let filtered = transactions.filter(tx => {
            // A. Filter Pencarian Teks
            if (filters.search) {
                const searchStr = `${tx.relation} ${tx.note} ${tx.category}`.toLowerCase();
                if (!searchStr.includes(filters.search)) return false;
            }

            // B. Filter Kategori (Dropdown 1)
            if (filters.category !== 'all') {
                if (filters.category === 'liquid' && ['hutang', 'piutang', 'tanggungan'].includes(tx.category)) return false;
                if (filters.category === 'debt' && !['hutang', 'piutang'].includes(tx.category)) return false;
                if (filters.category === 'tanggungan' && tx.category !== 'tanggungan') return false;
            }

            // C. Filter Arus Kas (Dropdown 2)
            if (filters.flow !== 'all') {
                let effectiveFlow = tx.type;

                // Logika khusus tanggungan barang:
                // - Ambil barang baru = bukan arus kas langsung
                // - Bayar cicilan barang = uang keluar
                if (tx.category === 'tanggungan') {
                    effectiveFlow = tx.type === 'in' ? 'out' : 'neutral';
                }

                if (effectiveFlow !== filters.flow) return false;
            }

            return true;
        });

        // 2. JIKA DATA KOSONG
        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--txt-muted); background: var(--bg-card); border-radius: 15px; border: 1px dashed #444; box-shadow: var(--shadow);">
                    Belum ada catatan transaksi yang sesuai.
                </div>
            `;
            return;
        }

        // 3. RAKIT HTML BARIS PER BARIS
        let html = `<div style="font-size: 0.75rem; font-weight: 800; color: var(--txt-muted); letter-spacing: 1px; margin-bottom: 12px; margin-top: 10px;">RIWAYAT TRANSAKSI (${filtered.length})</div>`;

        filtered.forEach(tx => {
            // Cari nama sumber dana (Dompet Saku / BCA / dll)
            let accName = "Kas Sistem";
            if (tx.accountId) {
                const acc = accounts.find(a => a.id === tx.accountId);
                if (acc) accName = acc.name;
            }

            // Tentukan Warna, Tanda Plus/Minus, dan Label
            let sign = '';
            let colorClass = '';
            let borderClass = '';
            let badgeText = '';
            
            if (tx.category === 'tanggungan') {
                borderClass = 'border-item';

                if (tx.type === 'out') {
                    colorClass = 'txt-item';
                    sign = '';
                    badgeText = '📦 AMBIL BARANG';
                } else {
                    colorClass = 'txt-out';
                    sign = '-';
                    badgeText = `💸 BAYAR CICILAN (${accName})`;
                }
            } else if (tx.type === 'in') {
                colorClass = 'txt-in';
                borderClass = 'border-in';
                sign = '+';

                if (tx.category === 'hutang') {
                    badgeText = `⚠️ HUTANG Masuk ke ${accName}`;
                } else if (tx.category === 'piutang') {
                    badgeText = `🤝 TERIMA CICILAN ke ${accName}`;
                } else if (tx.category === 'pemasukan') {
                    badgeText = `💵 PEMASUKAN ke ${accName}`;
                } else {
                    badgeText = `⬇️ Masuk ke ${accName}`;
                }
            } else {
                colorClass = 'txt-out';
                borderClass = 'border-out';
                sign = '-';

                if (tx.category === 'piutang') {
                    badgeText = `🤝 PIUTANG dari ${accName}`;
                } else if (tx.category === 'hutang') {
                    badgeText = `⚠️ BAYAR HUTANG dari ${accName}`;
                } else if (tx.category === 'belanja') {
                    badgeText = `🛒 BELANJA dari ${accName}`;
                } else {
                    badgeText = `⬆️ Keluar dari ${accName}`;
                }
            }

            if (tx.category === 'transfer') {
                badgeText = `🔄 TRANSFER (${accName})`;
            }

            // Susun baris kartu
            html += `
            <div class="list-item ${borderClass}">
                <div class="item-info">
                    <div class="item-cat">${badgeText}</div>
                    <div class="item-desc" style="font-size: 0.95rem;">${tx.relation}</div>
                    <div class="item-date">📅 ${tx.date}</div>
                </div>
                <div class="item-right">
                    <div class="item-amt ${colorClass}">${sign} Rp ${tx.amount.toLocaleString('id-ID')}</div>
                    <div class="item-actions">
                        <button onclick="ReceiptDigital.show(${tx.id})" style="background: none; border: none; font-size: 1.15rem; cursor: pointer; opacity: 0.8;">👁️</button>
                        <button onclick="FormUniversal.openEdit(${tx.id})" style="background: none; border: none; font-size: 1.15rem; cursor: pointer; opacity: 0.8;">✏️</button>
                        <button onclick="FormUniversal.openDelete(${tx.id})" style="background: none; border: none; font-size: 1.15rem; cursor: pointer; opacity: 0.8;">🗑️</button>
                    </div>
                </div>
            </div>
            `;
        });

        // 4. Cetak ke Layar
        container.innerHTML = html;
    }
};

window.ListItem = ListItem;
