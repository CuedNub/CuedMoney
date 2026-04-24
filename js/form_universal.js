/* FILE: js/form_universal.js
   VERSI: 4.0 (EDISI SMART FORM)
   FITUR: ID Otomatis, DateTime Otomatis, Datalist Nama, & Multiline Note
*/

const FormUniversal = {

    // =========================================================
    // ★ AWAL CUSTOM FUNCTIONS FormUniversal
    // Total: 16 custom functions
    // Kelompok: Helper, Debt, Bank, Transfer, Cash, Edit, Menu
    // =========================================================



    // ---------------------------------------------------------
    // HELPER / UTILITY
    // Fungsi bantu yang dipakai oleh function lain
    // ---------------------------------------------------------

    // Membuat datalist nama orang/toko dari data transaksi lama
    getRelationDatalist() {
        const transactions = Core.state.data.transactions || [];
        const uniqueNames = [...new Set(transactions.map(t => t.relation))].filter(n => n && n !== '-');
        let options = '';
        uniqueNames.forEach(name => {
            options += `<option value="${name}">`;
        });
        return `<datalist id="list-orang">${options}</datalist>`;
    },

    // Membuat option daftar rekening untuk elemen <select>
    // Parameter excludeId: ID rekening yang ingin disembunyikan dari daftar
    getAccountOptions(excludeId = null) {
        let options = '';
        const accounts = Core.state.data.accounts || [];
        accounts.forEach(acc => {
            if (acc.id !== excludeId) {
                const icon = acc.type === 'wallet' ? '💰' : '🏦';
                options += `<option value="${acc.id}">${icon} ${acc.name} (Rp ${acc.balance.toLocaleString('id-ID')})</option>`;
            }
        });
        return options;
    },



    // ---------------------------------------------------------
    // DEBT / HUTANG / PIUTANG / TANGGUNGAN
    // Form untuk input dan simpan data hutang, piutang, barang
    // ---------------------------------------------------------

    // Membuka form hutang/piutang/tanggungan
    openDebt() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        // Format untuk input datetime-local: YYYY-MM-DDTHH:mm
        const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        const autoID = `TX-${Date.now()}`;

        const html = `
            <h3 style="margin-bottom: 15px;">Hutang / Piutang / Barang</h3>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <label class="form-label">ID TRANSAKSI</label>
                    <input type="text" id="f-debt-id" class="form-input" value="${autoID}" readonly style="background: #222; color: var(--clr-bank); font-family: monospace;">
                </div>
                <div style="flex: 1;">
                    <label class="form-label">TANGGAL & WAKTU</label>
                    <input type="datetime-local" id="f-debt-date" class="form-input" value="${currentDateTime}">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">JENIS MUTASI</label>
                <select id="f-debt-type" class="form-input" onchange="FormUniversal.updateDebtUI()">
                    <option value="piutang">🤝 Piutang (Uang Saya di Orang)</option>
                    <option value="hutang">⚠️ Hutang (Uang Orang di Saya)</option>
                    <option value="tanggungan">📦 Tanggungan Barang</option>
                </select>
            </div>
            
            <div class="form-group" id="f-debt-action-group">
                <label class="form-label">AKSI / SUB-TIPE</label>
                <select id="f-debt-action" class="form-input" onchange="FormUniversal.updateDebtUI()">
                    <option value="out">MEMBERI / AMBIL BARANG (Beban -)</option>
                    <option value="in">MENERIMA / BAYAR CICILAN (Beban +)</option>
                </select>
            </div>

            <div class="form-group" id="f-debt-acc-group">
                <label class="form-label" id="f-debt-acc-label">REKENING TERKAIT</label>
                <select id="f-debt-acc" class="form-input">
                    <option value="">-- Tanpa Rekening (Non-Tunai) --</option>
                    ${this.getAccountOptions()}
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">NAMA ORANG / TOKO</label>
                <input type="text" id="f-debt-person" class="form-input" placeholder="Ketik atau pilih nama..." list="list-orang">
                ${this.getRelationDatalist()}
            </div>

            <div class="form-group">
                <label class="form-label">NOMINAL (Rp)</label>
                <input type="number" id="f-debt-amt" class="form-input" placeholder="0">
            </div>

            <div class="form-group">
                <label class="form-label">CATATAN</label>
                <textarea id="f-debt-note" class="form-input" style="height: 80px; resize: vertical;" placeholder="Tulis rincian... (bisa pindah baris)"></textarea>
            </div>

            <button class="btn-submit" onclick="FormUniversal.saveDebt()">SIMPAN DATA</button>
        `;
        Core.openModal(html);
        this.updateDebtUI();
    },

    // Mengubah tampilan form hutang sesuai jenis dan aksi yang dipilih
    updateDebtUI() {
        const type = document.getElementById('f-debt-type').value;
        const action = document.getElementById('f-debt-action').value;
        const actionGroup = document.getElementById('f-debt-action-group');
        const accGroup = document.getElementById('f-debt-acc-group');
        const accLabel = document.getElementById('f-debt-acc-label');
        const actionSelect = document.getElementById('f-debt-action');

        actionGroup.style.display = 'block';

        if (type === 'tanggungan') {
            actionSelect.options[0].text = "Ambil Barang Baru (Hutang Bertambah)";
            actionSelect.options[1].text = "Bayar Cicilan Barang (Uang Keluar -)";
            accGroup.style.display = (action === 'in') ? 'block' : 'none';
            accLabel.innerText = "BAYAR PAKAI REKENING";
        } else {
            accGroup.style.display = 'block';
            accLabel.innerText = (action === 'out') ? 'GUNAKAN SALDO DARI' : 'SIMPAN KE SALDO';

            if (type === 'piutang') {
                actionSelect.options[0].text = "Memberi Pinjaman (Keluar -)";
                actionSelect.options[1].text = "Terima Cicilan (Masuk +)";
            } else {
                actionSelect.options[0].text = "Membayar Hutang (Keluar -)";
                actionSelect.options[1].text = "Terima Pinjaman (Masuk +)";
            }
        }
    },

    // Menyimpan data hutang/piutang/tanggungan ke Engine
    saveDebt() {
        const type = document.getElementById('f-debt-type').value;
        const action = document.getElementById('f-debt-action').value;
        const accId = document.getElementById('f-debt-acc').value;
        const person = document.getElementById('f-debt-person').value;
        const amt = document.getElementById('f-debt-amt').value;
        const note = document.getElementById('f-debt-note').value;
        const customDate = document.getElementById('f-debt-date').value;

        if (!person || !amt || amt <= 0) return alert("Data tidak lengkap!");

        const success = Engine.processTransaction({
            type: action,
            accountId: accId || null,
            amount: amt,
            category: type,
            relation: person,
            note: note,
            customDate: customDate ? new Date(customDate).toLocaleString('id-ID') : null
        });

        if (success) Core.closeModal();
    },



    // ---------------------------------------------------------
    // ACCOUNT / REKENING
    // Form untuk menambah rekening baru
    // ---------------------------------------------------------

    // Membuka form tambah rekening
    openAddBank() {
        const html = `
            <h3>Tambah Rekening</h3>
            <div class="form-group">
                <label class="form-label">NAMA BANK / E-WALLET</label>
                <input type="text" id="f-bank-name" class="form-input" placeholder="Contoh: BCA, OVO...">
            </div>
            <div class="form-group">
                <label class="form-label">SALDO AWAL (Rp)</label>
                <input type="number" id="f-bank-bal" class="form-input" placeholder="0">
            </div>
            <button class="btn-submit" onclick="FormUniversal.saveBank()">SIMPAN REKENING</button>
        `;
        Core.openModal(html);
    },

    // Menyimpan rekening baru ke Engine
    saveBank() {
        const name = document.getElementById('f-bank-name').value;
        const bal = document.getElementById('f-bank-bal').value;
        if (!name) return alert("Nama Bank harus diisi!");
        Engine.addAccount(name, bal);
        Core.closeModal();
    },



    // ---------------------------------------------------------
    // TRANSFER ANTAR REKENING
    // Form untuk transfer saldo dari satu rekening ke rekening lain
    // ---------------------------------------------------------

    // Membuka form transfer
    openTransfer() {
        const html = `
            <h3>Transfer Antar Bank</h3>
            <div class="form-group">
                <label class="form-label">DARI REKENING</label>
                <select id="f-tf-src" class="form-input">${this.getAccountOptions()}</select>
            </div>
            <div class="form-group">
                <label class="form-label">KE REKENING</label>
                <select id="f-tf-dst" class="form-input">${this.getAccountOptions()}</select>
            </div>
            <div class="form-group">
                <label class="form-label">NOMINAL (Rp)</label>
                <input type="number" id="f-tf-amt" class="form-input" placeholder="0">
            </div>
            <button class="btn-submit" style="background: var(--clr-bank); color: white;" onclick="FormUniversal.saveTransfer()">KIRIM UANG</button>
        `;
        Core.openModal(html);
    },

    // Menjalankan proses transfer antar rekening
    saveTransfer() {
        const src = document.getElementById('f-tf-src').value;
        const dst = document.getElementById('f-tf-dst').value;
        const amt = document.getElementById('f-tf-amt').value;
        if (src === dst) return alert("Rekening tidak boleh sama!");
        if (Engine.processTransfer(src, dst, amt)) Core.closeModal();
    },



    // ---------------------------------------------------------
    // CASH MOVEMENT / TARIK TUNAI & SETOR TUNAI
    // Form untuk memindahkan saldo antara rekening dan dompet cash
    // ---------------------------------------------------------

    // Membuka form tarik tunai (dari rekening ke dompet cash)
    openTarik() {
        const html = `
            <h3>Tarik Tunai</h3>
            <div class="form-group">
                <label class="form-label">DARI REKENING</label>
                <select id="f-tarik-src" class="form-input">${this.getAccountOptions('wallet_cash')}</select>
            </div>
            <div class="form-group">
                <label class="form-label">NOMINAL (Rp)</label>
                <input type="number" id="f-tarik-amt" class="form-input" placeholder="0">
            </div>
            <button class="btn-submit" style="background: #ff9800; color: white;" onclick="FormUniversal.saveTarik()">TARIK</button>
        `;
        Core.openModal(html);
    },

    // Menjalankan proses tarik tunai
    saveTarik() {
        const src = document.getElementById('f-tarik-src').value;
        const amt = document.getElementById('f-tarik-amt').value;
        if (Engine.processTransfer(src, 'wallet_cash', amt)) Core.closeModal();
    },

    // Membuka form setor tunai (dari dompet cash ke rekening)
    openSetor() {
        const html = `
            <h3>Setor Tunai</h3>
            <div class="form-group">
                <label class="form-label">KE REKENING</label>
                <select id="f-setor-dst" class="form-input">${this.getAccountOptions('wallet_cash')}</select>
            </div>
            <div class="form-group">
                <label class="form-label">NOMINAL (Rp)</label>
                <input type="number" id="f-setor-amt" class="form-input" placeholder="0">
            </div>
            <button class="btn-submit" style="background: var(--clr-in); color: black;" onclick="FormUniversal.saveSetor()">SETOR</button>
        `;
        Core.openModal(html);
    },

    // Menjalankan proses setor tunai
    saveSetor() {
        const dst = document.getElementById('f-setor-dst').value;
        const amt = document.getElementById('f-setor-amt').value;
        if (Engine.processTransfer('wallet_cash', dst, amt)) Core.closeModal();
    },



    // ---------------------------------------------------------
    // EDIT TRANSACTION (CANGGIH)
    // Form lengkap untuk mengedit semua field transaksi
    // ---------------------------------------------------------

    // Membuka form edit — redirect ke form yang sesuai dengan kategori
    openEdit(id) {
        const tx = Core.state.data.transactions.find(t => t.id === id);
        if (!tx) return alert('Transaksi tidak ditemukan!');

        // Redirect berdasarkan kategori
        if (tx.category === 'belanja' || tx.category === 'pemasukan') {
            Core.closeModal();
            setTimeout(() => FormShopping.openEdit(id), 350);
            return;
        }

        if (tx.category === 'hutang' || tx.category === 'piutang' || tx.category === 'tanggungan') {
            Core.closeModal();
            setTimeout(() => FormUniversal.openDebtEdit(id), 350);
            return;
        }

        // Untuk transfer dan lainnya: form edit sederhana
        let dateValue = '';
        if (tx.timestamp) {
            const d = new Date(tx.timestamp);
            dateValue = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + 'T' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
        }

        const html = `
            <h3 style="margin-bottom: 15px; color: var(--clr-bank);">✏️ Edit Transaksi</h3>
            <div style="background: #222; padding: 12px; border-radius: 10px; margin-bottom: 15px; font-size: 0.7rem; color: #666;">REF: TX-$` + tx.id + `</div>
            <div class="form-group">
                <label class="form-label">TANGGAL & WAKTU</label>
                <input type="datetime-local" id="f-edit-date" class="form-input" value="$` + dateValue + `">
            </div>
            <div class="form-group">
                <label class="form-label">NAMA / RELASI</label>
                <input type="text" id="f-edit-person" class="form-input" value="$` + tx.relation + `" list="list-orang">
                $` + this.getRelationDatalist() + `
            </div>
            <div class="form-group">
                <label class="form-label">CATATAN</label>
                <textarea id="f-edit-note" class="form-input" style="height: 80px; resize: vertical;">$` + (tx.note || '') + `</textarea>
            </div>
            <button class="btn-submit" style="background: var(--clr-bank); color: white;" onclick="FormUniversal.saveEditSimple($` + tx.id + `)">💾 SIMPAN</button>
            <button onclick="FormUniversal.openDelete($` + tx.id + `)" style="width: 100%; background: none; color: var(--clr-out); border: 1px solid var(--clr-out); padding: 14px; border-radius: 15px; font-weight: 800; margin-top: 10px;">🗑️ HAPUS</button>
        `;
        Core.openModal(html);
    },

    // Menyimpan hasil edit lengkap
    saveEdit(id) {
        const tx = Core.state.data.transactions.find(t => t.id === id);
        if (!tx) return alert('Transaksi tidak ditemukan!');

        const newDate = document.getElementById('f-edit-date').value;
        const newType = document.getElementById('f-edit-type').value;
        const newCategory = document.getElementById('f-edit-category').value;
        const newAccId = document.getElementById('f-edit-acc').value;
        const newPerson = document.getElementById('f-edit-person').value;
        const newAmt = parseFloat(document.getElementById('f-edit-amt').value) || 0;
        const newNote = document.getElementById('f-edit-note').value;

        if (newAmt <= 0) return alert('Nominal harus lebih dari 0!');

        // STEP 1: Kembalikan saldo lama
        if (tx.accountId) {
            const oldAcc = Core.state.data.accounts.find(a => a.id === tx.accountId);
            if (oldAcc) {
                if (tx.category === 'tanggungan') {
                    if (tx.type === 'in') oldAcc.balance += tx.amount;
                } else {
                    if (tx.type === 'in') oldAcc.balance -= tx.amount;
                    if (tx.type === 'out') oldAcc.balance += tx.amount;
                }
            }
        }

        // STEP 2: Terapkan saldo baru
        if (newAccId) {
            const newAcc = Core.state.data.accounts.find(a => a.id === newAccId);
            if (newAcc) {
                if (newCategory === 'tanggungan') {
                    if (newType === 'in') newAcc.balance -= newAmt;
                } else {
                    if (newType === 'in') newAcc.balance += newAmt;
                    if (newType === 'out') newAcc.balance -= newAmt;
                }
            }
        }

        // STEP 3: Update data transaksi
        const txTime = newDate ? new Date(newDate) : new Date(tx.timestamp);
        tx.date = txTime.toLocaleString('id-ID');
        tx.timestamp = txTime.getTime();
        tx.type = newType;
        tx.category = newCategory;
        tx.accountId = newAccId || null;
        tx.relation = newPerson || '-';
        tx.amount = newAmt;
        tx.note = newNote || '-';

        Core.saveData();
        Core.refreshUI();
        Core.closeModal();
        alert('✅ Transaksi berhasil diperbarui!');
    },

    // ---------------------------------------------------------
    // DELETE TRANSACTION (CANGGIH)
    // Modal konfirmasi hapus dengan detail transaksi
    // ---------------------------------------------------------

    // Membuka modal konfirmasi hapus
    openDelete(id) {
        const tx = Core.state.data.transactions.find(t => t.id === id);
        if (!tx) return alert('Transaksi tidak ditemukan!');

        const sign = tx.type === 'in' ? '+' : '-';
        const color = tx.type === 'in' ? 'var(--clr-in)' : 'var(--clr-out)';

        const html = `
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 3rem; margin-bottom: 10px;">⚠️</div>
                <h3 style="color: var(--clr-out); margin-bottom: 20px;">Hapus Transaksi?</h3>

                <div style="background: #222; padding: 15px; border-radius: 12px; margin-bottom: 20px; text-align: left; border: 1px solid #333;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem;">
                        <span style="color: var(--txt-muted);">Ref. ID</span>
                        <span style="font-family: monospace; color: var(--clr-bank);">TX-${tx.id}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem;">
                        <span style="color: var(--txt-muted);">Tanggal</span>
                        <span>${tx.date}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem;">
                        <span style="color: var(--txt-muted);">Kategori</span>
                        <span style="text-transform: uppercase; font-weight: 700;">${tx.category || 'umum'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem;">
                        <span style="color: var(--txt-muted);">Relasi</span>
                        <span style="font-weight: 700;">${tx.relation}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem;">
                        <span style="color: var(--txt-muted);">Catatan</span>
                        <span style="max-width: 60%; text-align: right; font-size: 0.75rem;">${tx.note || '-'}</span>
                    </div>
                    <div style="border-top: 1px solid #444; padding-top: 10px; margin-top: 5px; display: flex; justify-content: space-between;">
                        <span style="color: var(--txt-muted); font-weight: 800;">Nominal</span>
                        <span style="font-weight: 900; font-size: 1.1rem; color: ${color};">${sign} Rp ${tx.amount.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <p style="font-size: 0.75rem; color: var(--txt-muted); margin-bottom: 20px;">
                    Saldo rekening terkait akan dikembalikan secara otomatis.
                    <br>Tindakan ini <strong style="color: var(--clr-out);">tidak bisa dibatalkan</strong>.
                </p>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button onclick="Core.closeModal()" style="padding: 14px; background: #333; color: white; border: 1px solid #444; border-radius: 12px; font-weight: 800;">BATAL</button>
                    <button onclick="FormUniversal.confirmDelete(${tx.id})" style="padding: 14px; background: var(--clr-out); color: white; border: none; border-radius: 12px; font-weight: 800;">🗑️ YA, HAPUS</button>
                </div>
            </div>
        `;
        Core.openModal(html);
    },

    // Konfirmasi dan jalankan hapus
    confirmDelete(id) {
        Engine.deleteTransaction(id);
        Core.closeModal();
        alert('✅ Transaksi berhasil dihapus dan saldo dikembalikan.');
    },

    // Simpan edit sederhana (transfer dll)
    saveEditSimple(id) {
        const tx = Core.state.data.transactions.find(t => t.id === id);
        if (!tx) return;

        const newDate = document.getElementById('f-edit-date').value;
        const newPerson = document.getElementById('f-edit-person').value;
        const newNote = document.getElementById('f-edit-note').value;

        if (newDate) {
            const txTime = new Date(newDate);
            tx.date = txTime.toLocaleString('id-ID');
            tx.timestamp = txTime.getTime();
        }
        tx.relation = newPerson || '-';
        tx.note = newNote || '-';

        Core.saveData();
        Core.refreshUI();
        Core.closeModal();
        alert('✅ Transaksi berhasil diperbarui!');
    },

    // Form edit khusus hutang/piutang/tanggungan
    openDebtEdit(id) {
        const tx = Core.state.data.transactions.find(t => t.id === id);
        if (!tx) return alert('Transaksi tidak ditemukan!');

        let dateValue = '';
        if (tx.timestamp) {
            const d = new Date(tx.timestamp);
            dateValue = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + 'T' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
        }

        const actionOut = tx.type === 'out' ? 'selected' : '';
        const actionIn = tx.type === 'in' ? 'selected' : '';

        const html = `
            <h3 style="margin-bottom: 15px; color: var(--clr-item);">✏️ Edit Hutang/Piutang</h3>
            <div style="background: #222; padding: 12px; border-radius: 10px; margin-bottom: 15px; font-size: 0.7rem; color: #666;">REF: TX-` + tx.id + `</div>

            <div class="form-group">
                <label class="form-label">TANGGAL & WAKTU</label>
                <input type="datetime-local" id="f-debt-edit-date" class="form-input" value="` + dateValue + `">
            </div>
            <div class="form-group">
                <label class="form-label">JENIS MUTASI</label>
                <select id="f-debt-edit-type" class="form-input">
                    <option value="piutang" ` + (tx.category === 'piutang' ? 'selected' : '') + `>🤝 Piutang</option>
                    <option value="hutang" ` + (tx.category === 'hutang' ? 'selected' : '') + `>⚠️ Hutang</option>
                    <option value="tanggungan" ` + (tx.category === 'tanggungan' ? 'selected' : '') + `>📦 Tanggungan</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">AKSI / SUB-TIPE</label>
                <select id="f-debt-edit-action" class="form-input">
                    <option value="out" ` + actionOut + `>Keluar (-)</option>
                    <option value="in" ` + actionIn + `>Masuk (+)</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">REKENING</label>
                <select id="f-debt-edit-acc" class="form-input">
                    <option value="">-- Tanpa Rekening --</option>
                    ` + this.getAccountOptions() + `
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">NAMA ORANG / TOKO</label>
                <input type="text" id="f-debt-edit-person" class="form-input" value="` + tx.relation + `" list="list-orang">
                ` + this.getRelationDatalist() + `
            </div>
            <div class="form-group">
                <label class="form-label">NOMINAL (Rp)</label>
                <input type="number" id="f-debt-edit-amt" class="form-input" value="` + tx.amount + `">
            </div>
            <div class="form-group">
                <label class="form-label">CATATAN</label>
                <textarea id="f-debt-edit-note" class="form-input" style="height: 80px; resize: vertical;">` + (tx.note || '') + `</textarea>
            </div>
            <button class="btn-submit" style="background: var(--clr-bank); color: white;" onclick="FormUniversal.saveDebtEdit(` + tx.id + `)">💾 SIMPAN PERUBAHAN</button>
            <button onclick="FormUniversal.openDelete(` + tx.id + `)" style="width: 100%; background: none; color: var(--clr-out); border: 1px solid var(--clr-out); padding: 14px; border-radius: 15px; font-weight: 800; margin-top: 10px;">🗑️ HAPUS</button>
        `;

        Core.openModal(html);

        // Set akun yang dipilih
        setTimeout(() => {
            const accSelect = document.getElementById('f-debt-edit-acc');
            if (accSelect && tx.accountId) accSelect.value = tx.accountId;
        }, 50);
    },

    // Simpan edit hutang/piutang/tanggungan
    saveDebtEdit(id) {
        const tx = Core.state.data.transactions.find(t => t.id === id);
        if (!tx) return alert('Transaksi tidak ditemukan!');

        const newDate = document.getElementById('f-debt-edit-date').value;
        const newCategory = document.getElementById('f-debt-edit-type').value;
        const newType = document.getElementById('f-debt-edit-action').value;
        const newAccId = document.getElementById('f-debt-edit-acc').value;
        const newPerson = document.getElementById('f-debt-edit-person').value;
        const newAmt = parseFloat(document.getElementById('f-debt-edit-amt').value) || 0;
        const newNote = document.getElementById('f-debt-edit-note').value;

        if (newAmt <= 0) return alert('Nominal harus lebih dari 0!');

        // Kembalikan saldo lama
        if (tx.accountId) {
            const oldAcc = Core.state.data.accounts.find(a => a.id === tx.accountId);
            if (oldAcc) {
                if (tx.category === 'tanggungan') {
                    if (tx.type === 'in') oldAcc.balance += tx.amount;
                } else {
                    if (tx.type === 'in') oldAcc.balance -= tx.amount;
                    if (tx.type === 'out') oldAcc.balance += tx.amount;
                }
            }
        }

        // Terapkan saldo baru
        if (newAccId) {
            const newAcc = Core.state.data.accounts.find(a => a.id === newAccId);
            if (newAcc) {
                if (newCategory === 'tanggungan') {
                    if (newType === 'in') newAcc.balance -= newAmt;
                } else {
                    if (newType === 'in') newAcc.balance += newAmt;
                    if (newType === 'out') newAcc.balance -= newAmt;
                }
            }
        }

        // Update data
        const txTime = newDate ? new Date(newDate) : new Date(tx.timestamp);
        tx.date = txTime.toLocaleString('id-ID');
        tx.timestamp = txTime.getTime();
        tx.type = newType;
        tx.category = newCategory;
        tx.accountId = newAccId || null;
        tx.relation = newPerson || '-';
        tx.amount = newAmt;
        tx.note = newNote || '-';

        Core.saveData();
        Core.refreshUI();
        Core.closeModal();
        alert('✅ Transaksi berhasil diperbarui!');
    },


        // ---------------------------------------------------------
    // MAIN MENU
    // Menu utama untuk memilih jenis transaksi
    // ---------------------------------------------------------

    // Membuka menu utama transaksi (Masuk, Keluar, Transfer, Hutang)
    open() {
        const html = `
            <div style="text-align: center; margin-bottom: 20px;"><h3>Menu Transaksi</h3></div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <button onclick="Core.closeModal(); setTimeout(()=>FormShopping.open('in'), 350)" style="background: var(--bg-card); border: 1px solid var(--clr-in); color: white; padding: 20px; border-radius: 18px;">⬇️ Masuk</button>
                <button onclick="Core.closeModal(); setTimeout(()=>FormShopping.open('out'), 350)" style="background: var(--bg-card); border: 1px solid var(--clr-out); color: white; padding: 20px; border-radius: 18px;">⬆️ Keluar</button>
                <button onclick="FormUniversal.openTransfer()" style="background: var(--bg-card); border: 1px solid var(--clr-bank); color: white; padding: 20px; border-radius: 18px;">🔄 Transfer</button>
                <button onclick="FormUniversal.openDebt()" style="background: var(--bg-card); border: 1px solid var(--clr-item); color: white; padding: 20px; border-radius: 18px;">📝 Hutang</button>
            </div>
        `;
        Core.openModal(html);
    }



    // =========================================================
    // ★ AKHIR CUSTOM FUNCTIONS FormUniversal
    // Total: 16 custom functions
    // =========================================================
};

// Mendaftarkan object ke global agar bisa dipanggil dari HTML
window.FormUniversal = FormUniversal;