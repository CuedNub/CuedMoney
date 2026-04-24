/* FILE: js/receipt_digital.js
   VERSI: 4.1 (FIX WARNA TANGGUNGAN BARANG)
   FUNGSI: Struk Digital, Screenshot, Rekapitulasi Hutang Modern, & Clipboard Lengkap
*/

const ReceiptDigital = {

    // =========================================================
    // ★ AWAL CUSTOM FUNCTIONS ReceiptDigital
    // Total: 9 custom functions
    // Kelompok: Helper, Render, Aksi
    // =========================================================



    // ---------------------------------------------------------
    // HELPER / UTILITY
    // Fungsi bantu format angka dan data
    // ---------------------------------------------------------

    // Format angka jadi Rupiah
    formatRp(amount) {
        return 'Rp ' + Number(amount).toLocaleString('id-ID');
    },

    // Mendapatkan nama akun berdasarkan ID
    getAccountName(accountId) {
        if (!accountId) return 'Kas / Non-Tunai';
        const accounts = Core.state.data.accounts || [];
        const acc = accounts.find(a => a.id === accountId);
        return acc ? acc.name : 'Kas Sistem';
    },

    // Mendapatkan label dan warna berdasarkan data transaksi
    getTypeInfo(tx) {
        let typeLabel = 'TRANSAKSI';
        let colorTheme = 'var(--txt-white)';
        let isDebt = false;
        let isShopping = tx.category === 'belanja' && tx.note && tx.note.startsWith('Belanja: ');

        if (tx.category === 'tanggungan') {
            typeLabel = tx.type === 'out' ? 'AMBIL BARANG (TANGGUNGAN)' : 'BAYAR CICILAN BARANG';
            colorTheme = tx.type === 'out' ? 'var(--clr-item)' : 'var(--clr-out)';
            isDebt = true;
        } else if (tx.category === 'pemasukan') {
            typeLabel = 'UANG MASUK';
            colorTheme = 'var(--clr-in)';
            isDebt = false;
        } else if (tx.category === 'belanja') {
            typeLabel = 'UANG KELUAR (BELANJA)';
            colorTheme = 'var(--clr-out)';
            isDebt = false;
        } else if (tx.category === 'piutang') {
            isDebt = true;
            typeLabel = tx.type === 'out' ? 'MEMBERI PINJAMAN (PIUTANG)' : 'TERIMA CICILAN PIUTANG';
            colorTheme = tx.type === 'out' ? 'var(--clr-out)' : 'var(--clr-in)';
        } else if (tx.category === 'hutang') {
            isDebt = true;
            typeLabel = tx.type === 'in' ? 'TERIMA PINJAMAN (HUTANG)' : 'BAYAR CICILAN HUTANG';
            colorTheme = tx.type === 'in' ? 'var(--clr-out)' : 'var(--clr-in)';
        } else if (tx.category === 'transfer') {
            typeLabel = 'TRANSFER SALDO';
            colorTheme = 'var(--clr-bank)';
        } else {
            typeLabel = tx.type === 'in' ? 'UANG MASUK' : 'UANG KELUAR';
            colorTheme = tx.type === 'in' ? 'var(--clr-in)' : 'var(--clr-out)';
        }

        return { typeLabel, colorTheme, isDebt, isShopping };
    },



    // ---------------------------------------------------------
    // RENDER / TAMPILAN
    // Fungsi untuk merakit komponen HTML struk
    // ---------------------------------------------------------

    // Fungsi Utama: Menampilkan Struk Digital
    show(id) {
        const transactions = Core.state.data.transactions || [];
        const tx = transactions.find(t => t.id === id);

        if (!tx) return alert('Data transaksi tidak ditemukan!');

        const accName = this.getAccountName(tx.accountId);
        const info = this.getTypeInfo(tx);

        let html = `
            <div id="printable-receipt" style="background: #1a1a1a; padding: 25px 20px; border-radius: 15px; border: 1px solid #333; position: relative; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                
                <!-- HEADER STRUK -->
                <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #444; padding-bottom: 15px;">
                    <div style="font-size: 1.4rem; font-weight: 900; letter-spacing: 1px; color: white;">💰 CuedMoney 💰</div>
                    <div style="font-size: 0.6rem; color: var(--txt-muted); letter-spacing: 2px; text-transform: uppercase;">Smart Financial Ledger</div>
                </div>

                <!-- TIPE TRANSAKSI -->
                <div style="text-align: center; color: ${info.colorTheme}; font-weight: 900; font-size: 0.85rem; letter-spacing: 1px; margin-bottom: 20px; text-transform: uppercase; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 10px; border: 1px solid #333;">
                    ${info.typeLabel}
                </div>

                <!-- INFO UTAMA -->
                <div style="font-size: 0.8rem; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; border-bottom: 1px solid #222;">
                        <span style="color: var(--txt-muted);">📌 Ref. ID</span>
                        <span style="font-family: monospace; font-weight: 700; color: var(--clr-bank);">TX-${tx.id}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; border-bottom: 1px solid #222;">
                        <span style="color: var(--txt-muted);">📅 Waktu</span>
                        <span style="font-weight: 700;">${tx.date}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; border-bottom: 1px solid #222;">
                        <span style="color: var(--txt-muted);">🏦 Akun</span>
                        <span style="font-weight: 700; color: var(--clr-bank);">${accName}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; border-bottom: 1px solid #222;">
                        <span style="color: var(--txt-muted);">👤 Relasi</span>
                        <span style="font-weight: 700;">${tx.relation}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                        <span style="color: var(--txt-muted);">📂 Kategori</span>
                        <span style="font-weight: 700; color: ${info.colorTheme}; text-transform: uppercase;">${tx.category || 'umum'}</span>
                    </div>
                </div>

                <!-- RINCIAN BELANJA / CATATAN -->
                ${info.isShopping ? this.renderShoppingList(tx.note) : `
                    <div style="border-top: 2px dashed #444; padding-top: 15px; margin-bottom: 20px;">
                        <div style="font-size: 0.7rem; color: var(--txt-muted); margin-bottom: 5px;">📝 CATATAN:</div>
                        <div style="font-size: 0.85rem; font-weight: 600; background: #222; padding: 12px; border-radius: 10px; white-space: pre-wrap; line-height: 1.6;">${tx.note || '-'}</div>
                    </div>
                `}

                <!-- NOMINAL -->
                <div style="border-top: 2px dashed #444; padding: 20px 0; text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--txt-muted); margin-bottom: 5px;">NOMINAL TRANSAKSI</div>
                    <div style="font-size: 2.2rem; font-weight: 900; color: ${info.colorTheme};">
                        ${tx.category === 'tanggungan' && tx.type === 'out' ? '' : (tx.type === 'in' ? '+' : '-')} ${this.formatRp(tx.amount)}
                    </div>
                    ${tx.category === 'tanggungan' && tx.type === 'out' ? '<div style="font-size: 0.6rem; color: var(--txt-muted); margin-top: 3px;">Saldo tidak terpengaruh (catat barang)</div>' : ''}
                </div>

                <!-- REKAPITULASI HUTANG -->
                ${info.isDebt ? this.renderDebtSummary(tx.relation, tx.category) : ''}

                <!-- FOOTER STRUK -->
                <div style="text-align: center; border-top: 2px dashed #444; padding-top: 15px; margin-top: 10px;">
                    <div style="font-size: 0.55rem; color: #555; font-weight: 800; letter-spacing: 1px;">━━━ STRUK SAH & TERVERIFIKASI ━━━</div>
                    <div style="font-size: 0.5rem; color: #333; margin-top: 3px;">Powered by CuedMoney Digital</div>
                </div>
            </div>

            <!-- TOMBOL AKSI -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 15px;">
                <button onclick="ReceiptDigital.screenshotReceipt()" style="padding: 14px 8px; background: var(--bg-card); color: var(--clr-in); border: 1px solid var(--clr-in); border-radius: 12px; font-weight: 800; font-size: 0.7rem;">📸 FOTO</button>
                <button onclick="ReceiptDigital.copyToClipboard(${tx.id})" style="padding: 14px 8px; background: var(--bg-card); color: var(--clr-bank); border: 1px solid var(--clr-bank); border-radius: 12px; font-weight: 800; font-size: 0.7rem;">📋 SALIN</button>
                <button onclick="Core.closeModal()" style="padding: 14px 8px; background: #333; color: white; border: 1px solid #444; border-radius: 12px; font-weight: 800; font-size: 0.7rem;">✕ TUTUP</button>
            </div>
        `;

        Core.openModal(html);
    },

    // Merender daftar belanja dari parsing note
    renderShoppingList(note) {
        var itemsPart = note.indexOf('Belanja: ') === 0 ? note.replace('Belanja: ', '') : note;
        var items = itemsPart ? itemsPart.split(', ') : [];
        var libs = (Core.state.data && Core.state.data.items_library) || [];
        var grandTotal = 0;
        var rows = '';

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var num = i + 1;

            // Format baru: Nama (2x@10000)
            var matchNew = item.match(/(.+?)\s*\((\d+)x@(\d+)\)/);

            // Format lama: Nama (2x)
            var matchOld = item.match(/(.+?)\s*\((\d+)x\)/);

            if (matchNew) {
                var name = matchNew[1].trim();
                var qty = parseInt(matchNew[2], 10);
                var price = parseInt(matchNew[3], 10);
                var subtotal = qty * price;
                grandTotal += subtotal;

                rows += '<div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:0.8rem;padding:8px 0;border-bottom:1px solid #2a2a2a;">';
                rows += '<div style="flex:1;">';
                rows += '<div><span style="color:#555;font-size:0.7rem;">' + num + '.</span> <span style="color:#ccc;">' + name + '</span></div>';
                rows += '<div style="font-size:0.65rem;color:#666;margin-top:2px;">x' + qty + ' @ Rp ' + price.toLocaleString('id-ID') + '</div>';
                rows += '</div>';
                rows += '<div style="text-align:right;font-weight:700;color:var(--clr-bank);min-width:90px;">Rp ' + subtotal.toLocaleString('id-ID') + '</div>';
                rows += '</div>';

            } else if (matchOld) {
                var name2 = matchOld[1].trim();
                var qty2 = parseInt(matchOld[2], 10);

                var libItem = libs.find(function(it) {
                    return (it.name || '').toLowerCase() === name2.toLowerCase();
                });

                if (libItem && libItem.price > 0) {
                    var price2 = parseInt(libItem.price, 10);
                    var subtotal2 = qty2 * price2;
                    grandTotal += subtotal2;

                    rows += '<div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:0.8rem;padding:8px 0;border-bottom:1px solid #2a2a2a;">';
                    rows += '<div style="flex:1;">';
                    rows += '<div><span style="color:#555;font-size:0.7rem;">' + num + '.</span> <span style="color:#ccc;">' + name2 + '</span></div>';
                    rows += '<div style="font-size:0.65rem;color:#666;margin-top:2px;">x' + qty2 + ' @ Rp ' + price2.toLocaleString('id-ID') + ' <span style="color:#555;">(DB)</span></div>';
                    rows += '</div>';
                    rows += '<div style="text-align:right;font-weight:700;color:var(--clr-bank);min-width:90px;">Rp ' + subtotal2.toLocaleString('id-ID') + '</div>';
                    rows += '</div>';
                } else {
                    rows += '<div style="display:flex;justify-content:space-between;font-size:0.8rem;padding:6px 0;border-bottom:1px solid #2a2a2a;">';
                    rows += '<span style="color:#ccc;"><span style="color:#555;font-size:0.7rem;">' + num + '.</span> ' + name2 + '</span>';
                    rows += '<span style="font-weight:700;color:var(--clr-bank);">x' + qty2 + '</span>';
                    rows += '</div>';
                }

            } else {
                rows += '<div style="font-size:0.8rem;padding:6px 0;border-bottom:1px solid #2a2a2a;color:#ccc;">';
                rows += '<span style="color:#555;font-size:0.7rem;">' + num + '.</span> ' + item;
                rows += '</div>';
            }
        }

        var totalRow = '';
        if (grandTotal > 0) {
            totalRow += '<div style="display:flex;justify-content:space-between;padding:10px 0 0;margin-top:5px;border-top:1px dashed #444;font-size:0.85rem;">';
            totalRow += '<span style="color:var(--txt-muted);font-weight:800;">TOTAL</span>';
            totalRow += '<span style="font-weight:900;color:var(--clr-in);">Rp ' + grandTotal.toLocaleString('id-ID') + '</span>';
            totalRow += '</div>';
        }

        var result = '<div style="border-top:2px dashed #444;padding-top:15px;margin-bottom:20px;">';
        result += '<div style="font-size:0.7rem;color:var(--txt-muted);margin-bottom:8px;">🛒 RINCIAN BELANJA (' + items.length + ' item):</div>';
        result += '<div style="background:#222;padding:12px;border-radius:10px;">' + rows + totalRow + '</div>';
        result += '</div>';
        return result;
    },

    // Merender Rekapitulasi Hutang/Piutang/Tanggungan Modern
    renderDebtSummary(name, category) {
        const transactions = Core.state.data.transactions || [];

        // Ambil semua transaksi terkait nama dan kategori ini
        const history = transactions
            .filter(t => t.relation === name && t.category === category)
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        if (history.length === 0) return '';

        // Hitung total berdasarkan arah transaksi
        let totalKeluar = 0;
        let totalMasuk = 0;

        history.forEach(t => {
            if (t.type === 'out') totalKeluar += t.amount;
            else totalMasuk += t.amount;
        });

        // Tentukan label dan warna sesuai kategori
        let labelPinjam = '';
        let labelBayar = '';
        let totalPinjam = 0;
        let totalBayar = 0;
        let sisa = 0;
        let categoryLabel = '';
        let colorPinjam = 'var(--clr-out)';
        let colorBayar = 'var(--clr-in)';
        let signPinjam = '';
        let signBayar = '';

        if (category === 'piutang') {
            categoryLabel = '🤝 PIUTANG';
            labelPinjam = 'Total Saya Pinjamkan';
            labelBayar = 'Total Dibayar Kembali';
            totalPinjam = totalKeluar;
            totalBayar = totalMasuk;
            sisa = totalKeluar - totalMasuk;
            colorPinjam = 'var(--clr-out)';
            colorBayar = 'var(--clr-in)';
            signPinjam = '-';
            signBayar = '+';
        } else if (category === 'hutang') {
            categoryLabel = '⚠️ HUTANG';
            labelPinjam = 'Total Saya Pinjam';
            labelBayar = 'Total Saya Bayar';
            totalPinjam = totalMasuk;
            totalBayar = totalKeluar;
            sisa = totalMasuk - totalKeluar;
            colorPinjam = 'var(--clr-out)';
            colorBayar = 'var(--clr-in)';
            signPinjam = '+';
            signBayar = '-';
        } else if (category === 'tanggungan') {
            categoryLabel = '📦 TANGGUNGAN';
            labelPinjam = 'Total Ambil Barang';
            labelBayar = 'Total Bayar Cicilan';
            totalPinjam = totalKeluar;
            totalBayar = totalMasuk;
            sisa = totalKeluar - totalMasuk;
            // KHUSUS TANGGUNGAN:
            // Ambil Barang = kuning, tanpa tanda
            // Bayar Cicilan = merah, dengan tanda -
            colorPinjam = 'var(--clr-item)';
            colorBayar = 'var(--clr-out)';
            signPinjam = '';
            signBayar = '-';
        }

        const isLunas = sisa <= 0;
        const progressPersen = totalPinjam > 0 ? Math.min(100, Math.round((totalBayar / totalPinjam) * 100)) : 0;

        // Rakit riwayat transaksi berurutan dengan running balance
        let runningBalance = 0;
        let riwayatHTML = history.map((h, index) => {
            let label = '';
            let amountColor = '';
            let icon = '';
            let sign = '';

            if (category === 'piutang') {
                if (h.type === 'out') {
                    label = 'Memberi Pinjaman';
                    icon = '🔴';
                    amountColor = 'var(--clr-out)';
                    sign = '-';
                    runningBalance += h.amount;
                } else {
                    label = 'Terima Cicilan';
                    icon = '🟢';
                    amountColor = 'var(--clr-in)';
                    sign = '+';
                    runningBalance -= h.amount;
                }
            } else if (category === 'hutang') {
                if (h.type === 'in') {
                    label = 'Terima Pinjaman';
                    icon = '🔴';
                    amountColor = 'var(--clr-out)';
                    sign = '+';
                    runningBalance += h.amount;
                } else {
                    label = 'Bayar Cicilan';
                    icon = '🟢';
                    amountColor = 'var(--clr-in)';
                    sign = '-';
                    runningBalance -= h.amount;
                }
            } else if (category === 'tanggungan') {
                if (h.type === 'out') {
                    // AMBIL BARANG: kuning, tanpa tanda +/-
                    label = 'Ambil Barang';
                    icon = '📦';
                    amountColor = 'var(--clr-item)';
                    sign = '';
                    runningBalance += h.amount;
                } else {
                    // BAYAR CICILAN: merah, dengan tanda -
                    label = 'Bayar Cicilan';
                    icon = '💸';
                    amountColor = 'var(--clr-out)';
                    sign = '-';
                    runningBalance -= h.amount;
                }
            }

            if (runningBalance < 0) runningBalance = 0;

            return `
                <div style="padding: 10px 12px; border-bottom: 1px solid #2a2a2a; ${index === history.length - 1 ? 'border-bottom: none;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="font-size: 0.75rem; font-weight: 700; color: #ddd;">
                                ${icon} ${label}
                            </div>
                            <div style="font-size: 0.6rem; color: #666; margin-top: 2px;">
                                📅 ${h.date}
                            </div>
                            <div style="font-size: 0.6rem; color: #555; margin-top: 1px; font-style: italic;">
                                ${h.note || '-'}
                            </div>
                        </div>
                        <div style="text-align: right; min-width: 100px;">
                            <div style="font-weight: 900; font-size: 0.8rem; color: ${amountColor};">
                                ${sign}${sign ? ' ' : ''}${this.formatRp(h.amount)}
                            </div>
                            <div style="font-size: 0.55rem; color: #666; margin-top: 2px;">
                                Sisa: ${this.formatRp(runningBalance)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <!-- REKAPITULASI MODERN -->
            <div style="background: linear-gradient(180deg, #1e1e1e 0%, #151515 100%); padding: 20px; border-radius: 15px; margin-bottom: 20px; border: 1px solid #333; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                
                <!-- HEADER REKAP -->
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 0.65rem; font-weight: 800; color: var(--txt-muted); letter-spacing: 2px;">REKAPITULASI ${categoryLabel}</div>
                    <div style="font-size: 1rem; font-weight: 900; color: white; margin-top: 3px;">👤 ${name}</div>
                </div>

                <!-- PROGRESS BAR -->
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.6rem; color: var(--txt-muted); margin-bottom: 5px;">
                        <span>Progress Pembayaran</span>
                        <span style="font-weight: 800; color: ${isLunas ? 'var(--clr-in)' : 'var(--clr-item)'};">${progressPersen}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #333; border-radius: 10px; overflow: hidden;">
                        <div style="width: ${progressPersen}%; height: 100%; background: ${isLunas ? 'var(--clr-in)' : 'linear-gradient(90deg, var(--clr-item), var(--clr-out))'}; border-radius: 10px; transition: width 0.5s;"></div>
                    </div>
                </div>

                <!-- RINGKASAN ANGKA -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div style="background: #222; padding: 12px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 0.55rem; color: var(--txt-muted); font-weight: 800; letter-spacing: 1px;">${labelPinjam.toUpperCase()}</div>
                        <div style="font-size: 1rem; font-weight: 900; color: ${colorPinjam}; margin-top: 4px;">${signPinjam}${signPinjam ? ' ' : ''}${this.formatRp(totalPinjam)}</div>
                    </div>
                    <div style="background: #222; padding: 12px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 0.55rem; color: var(--txt-muted); font-weight: 800; letter-spacing: 1px;">${labelBayar.toUpperCase()}</div>
                        <div style="font-size: 1rem; font-weight: 900; color: ${colorBayar}; margin-top: 4px;">${signBayar}${signBayar ? ' ' : ''}${this.formatRp(totalBayar)}</div>
                    </div>
                </div>

                <!-- SISA TAGIHAN -->
                <div style="background: ${isLunas ? 'rgba(0,230,118,0.1)' : 'rgba(255,23,68,0.1)'}; padding: 15px; border-radius: 12px; text-align: center; border: 1px solid ${isLunas ? 'rgba(0,230,118,0.3)' : 'rgba(255,23,68,0.3)'}; margin-bottom: 15px;">
                    <div style="font-size: 0.6rem; color: var(--txt-muted); font-weight: 800; letter-spacing: 1px;">SISA TAGIHAN</div>
                    <div style="font-size: 1.5rem; font-weight: 900; color: ${isLunas ? 'var(--clr-in)' : 'var(--clr-out)'}; margin-top: 5px;">
                        ${isLunas ? '✅ LUNAS' : this.formatRp(sisa)}
                    </div>
                    ${isLunas ? '<div style="font-size: 0.6rem; color: var(--clr-in); margin-top: 3px;">Semua pembayaran telah selesai</div>' : ''}
                </div>

                <!-- RIWAYAT TRANSAKSI -->
                <div>
                    <div style="font-size: 0.65rem; font-weight: 800; color: var(--txt-muted); letter-spacing: 1px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <span>📋 RIWAYAT LENGKAP</span>
                        <span style="color: #555;">${history.length} transaksi</span>
                    </div>
                    <div id="debt-history-scroll" style="max-height: 250px; overflow-y: auto; background: #1a1a1a; border-radius: 12px; border: 1px solid #2a2a2a;">
                        ${riwayatHTML}
                    </div>
                </div>
            </div>
        `;
    },



    // ---------------------------------------------------------
    // AKSI / ACTION
    // Fungsi untuk screenshot dan salin teks struk
    // ---------------------------------------------------------

    // Screenshot struk dan download sebagai gambar
    screenshotReceipt() {
        const receiptEl = document.getElementById('printable-receipt');
        if (!receiptEl) return alert('Elemen struk tidak ditemukan!');

        // Cek apakah html2canvas tersedia
        if (typeof html2canvas === 'undefined') {
            alert('Library screenshot belum dimuat. Pastikan koneksi internet aktif.');
            return;
        }

        // Tampilkan loading
        const btnFoto = event.target;
        const originalText = btnFoto.innerHTML;
        btnFoto.innerHTML = '⏳ PROSES...';
        btnFoto.disabled = true;

        // EXPAND riwayat agar tidak terpotong saat screenshot
        const scrollBox = document.getElementById('debt-history-scroll');
        let originalMaxHeight = '';
        let originalOverflow = '';

        if (scrollBox) {
            originalMaxHeight = scrollBox.style.maxHeight;
            originalOverflow = scrollBox.style.overflowY;
            scrollBox.style.maxHeight = 'none';
            scrollBox.style.overflowY = 'visible';
        }

        // Tunggu sebentar agar DOM update dulu
        setTimeout(() => {
            html2canvas(receiptEl, {
                backgroundColor: '#1a1a1a',
                scale: 2,
                useCORS: true,
                logging: false,
                scrollY: -window.scrollY,
                windowHeight: receiptEl.scrollHeight
            }).then(canvas => {
                // Buat link download
                const link = document.createElement('a');
                const timestamp = Date.now();
                link.download = `CuedMoney_Struk_${timestamp}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();

                btnFoto.innerHTML = '✅ TERSIMPAN!';
                setTimeout(() => {
                    btnFoto.innerHTML = originalText;
                    btnFoto.disabled = false;
                }, 2000);
            }).catch(err => {
                console.error('Screenshot gagal:', err);
                alert('Gagal mengambil screenshot. Coba lagi.');
                btnFoto.innerHTML = originalText;
                btnFoto.disabled = false;
            }).finally(() => {
                // KEMBALIKAN max-height seperti semula
                if (scrollBox) {
                    scrollBox.style.maxHeight = originalMaxHeight;
                    scrollBox.style.overflowY = originalOverflow;
                }
            });
        }, 100);
    },

    // Salin teks struk ke clipboard (WhatsApp Friendly)
    copyToClipboard(id) {
        const transactions = Core.state.data.transactions || [];
        const tx = transactions.find(t => t.id === id);
        if (!tx) return alert('Transaksi tidak ditemukan!');

        const info = this.getTypeInfo(tx);
        const accName = this.getAccountName(tx.accountId);

        // Rakit teks utama
        let text = '';
        text += `*💰 BUKTI TRANSAKSI CUEDMONEY 💰*\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        text += `📌 Ref     : TX-${tx.id}\n`;
        text += `📅 Waktu   : ${tx.date}\n`;
        text += `🏦 Akun    : ${accName}\n`;
        text += `👤 Relasi  : ${tx.relation}\n`;
        text += `📂 Kategori: ${(tx.category || 'umum').toUpperCase()}\n`;
        text += `📝 Tipe    : ${info.typeLabel}\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        // Jika belanja, tambahkan rincian item
        if (info.isShopping) {
            const itemsPart = tx.note.replace('Belanja: ', '');
            const items = itemsPart.split(', ');
            text += `🛒 *RINCIAN BELANJA (${items.length} item):*\n`;
            items.forEach((item, i) => {
                text += `   ${i + 1}. ${item}\n`;
            });
            text += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        } else {
            text += `📝 Catatan : ${tx.note || '-'}\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        }

        // Nominal - khusus tanggungan ambil barang tanpa tanda
        let nominalSign = tx.type === 'in' ? '+' : '-';
        if (tx.category === 'tanggungan' && tx.type === 'out') {
            nominalSign = '';
        }
        text += `💵 *NOMINAL: ${nominalSign}${this.formatRp(tx.amount)}*\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        // Jika hutang/piutang/tanggungan, tambahkan rekapitulasi
        if (info.isDebt) {
            const history = transactions
                .filter(t => t.relation === tx.relation && t.category === tx.category)
                .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

            let totalPinjam = 0;
            let totalBayar = 0;
            let labelPinjam = '';
            let labelBayar = '';
            let signPinjamText = '';
            let signBayarText = '-';

            if (tx.category === 'piutang') {
                labelPinjam = 'Total Dipinjamkan';
                labelBayar = 'Total Dibayar';
                signPinjamText = '-';
                signBayarText = '+';
                history.forEach(t => {
                    if (t.type === 'out') totalPinjam += t.amount;
                    else totalBayar += t.amount;
                });
            } else if (tx.category === 'hutang') {
                labelPinjam = 'Total Dipinjam';
                labelBayar = 'Total Dibayar';
                signPinjamText = '+';
                signBayarText = '-';
                history.forEach(t => {
                    if (t.type === 'in') totalPinjam += t.amount;
                    else totalBayar += t.amount;
                });
            } else if (tx.category === 'tanggungan') {
                labelPinjam = 'Total Ambil Barang';
                labelBayar = 'Total Bayar Cicilan';
                signPinjamText = '';
                signBayarText = '-';
                history.forEach(t => {
                    if (t.type === 'out') totalPinjam += t.amount;
                    else totalBayar += t.amount;
                });
            }

            const sisa = totalPinjam - totalBayar;
            const isLunas = sisa <= 0;

            text += `\n📊 *REKAPITULASI ${(tx.category || '').toUpperCase()} - ${tx.relation}:*\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            text += `${labelPinjam} : ${signPinjamText}${this.formatRp(totalPinjam)}\n`;
            text += `${labelBayar}  : ${signBayarText}${this.formatRp(totalBayar)}\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            text += `*SISA TAGIHAN : ${isLunas ? '✅ LUNAS' : this.formatRp(sisa)}*\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;

            // Riwayat singkat
            text += `\n📋 *RIWAYAT (${history.length} transaksi):*\n`;
            let runBal = 0;
            history.forEach((h, i) => {
                let label = '';
                let rSign = '';

                if (tx.category === 'piutang') {
                    if (h.type === 'out') {
                        label = 'Pinjamkan';
                        rSign = '-';
                        runBal += h.amount;
                    } else {
                        label = 'Cicilan';
                        rSign = '+';
                        runBal -= h.amount;
                    }
                } else if (tx.category === 'hutang') {
                    if (h.type === 'in') {
                        label = 'Pinjam';
                        rSign = '+';
                        runBal += h.amount;
                    } else {
                        label = 'Bayar';
                        rSign = '-';
                        runBal -= h.amount;
                    }
                } else if (tx.category === 'tanggungan') {
                    if (h.type === 'out') {
                        label = 'Ambil';
                        rSign = '';
                        runBal += h.amount;
                    } else {
                        label = 'Bayar';
                        rSign = '-';
                        runBal -= h.amount;
                    }
                }

                if (runBal < 0) runBal = 0;
                text += `${i + 1}. ${h.date} | ${label} ${rSign}${this.formatRp(h.amount)} | Sisa: ${this.formatRp(runBal)}\n`;
            });
            text += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        }

        text += `\n_Powered by CuedMoney Digital 💰_`;

        // Salin ke clipboard dengan error handling
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ Teks struk berhasil disalin ke clipboard!\n\nSilakan paste ke WhatsApp atau aplikasi lain.');
            }).catch(err => {
                console.error('Clipboard gagal:', err);
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    },

    // Fallback jika clipboard API tidak tersedia
    fallbackCopy(text) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('✅ Teks struk berhasil disalin! (mode fallback)');
        } catch (err) {
            console.error('Fallback copy gagal:', err);
            alert('❌ Gagal menyalin. Silakan salin manual dari struk.');
        }
    }



    // =========================================================
    // ★ AKHIR CUSTOM FUNCTIONS ReceiptDigital
    // Total: 9 custom functions
    // =========================================================
};

// Mendaftarkan object ke global agar bisa dipanggil dari file lain
window.ReceiptDigital = ReceiptDigital;
