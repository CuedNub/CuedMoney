/* FILE: js/form_shopping.js - VERSI 2.7 (SUPPORT MULTI-PRICE) */

const FormShopping = {
    items: [],

    // Menampilkan Nama + Harga di daftar saran
    getItemLibraryHTML() {
        const libs = Core.state.data.items_library || [];
        return `<datalist id="lib-barang">
            ${libs.map(it => `<option value="${it.name} | Rp ${it.price.toLocaleString('id-ID')}">`).join('')}
        </datalist>`;
    },

    // Logika Otomatis saat barang dipilih
    autoFillPrice(val) {
        // Jika user memilih dari dropdown (format: "Nama | Rp Harga")
        if (val.includes(" | Rp ")) {
            const parts = val.split(" | Rp ");
            const pureName = parts[0];
            const purePrice = parts[1].replace(/\./g, ''); // Hilangkan titik ribuan

            // Set Nama (bersihkan dari embel-embel harga)
            const nameInput = document.getElementById('f-c-name') || document.getElementById('f-q-name');
            if (nameInput) nameInput.value = pureName;

            // Set Harga
            const priceInput = document.getElementById('f-c-price') || document.getElementById('f-q-price');
            if (priceInput) {
                priceInput.value = purePrice;
                if (document.getElementById('f-q-price')) this.syncQuickTotal();
            }
        }
    },

    open(type = 'out') {
        this.items = [];
        const now = new Date();
        const currentDateTime = now.toISOString().slice(0, 16);

        const html = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-right: 40px;">
                <h3 style="color: ${type === 'in' ? 'var(--clr-in)' : 'var(--clr-out)'}; margin: 0;">
                    ${type === 'in' ? '⬇️ Masuk' : '⬆️ Belanja'}
                </h3>
                <button onclick="ItemDB.openManager()" style="background: rgba(255,255,255,0.05); border: 1px solid #444; color: #888; font-size: 0.65rem; border-radius: 6px; padding: 4px 8px;">
                    📦 DB BARANG
                </button>
            </div>

            <div class="form-group">
                <label class="form-label">TANGGAL & WAKTU</label>
                <input type="datetime-local" id="f-shop-date" class="form-input" value="${currentDateTime}">
            </div>

            <div class="form-group">
                <label class="form-label">SUMBER SALDO</label>
                <select id="f-shop-acc" class="form-input">${FormUniversal.getAccountOptions()}</select>
            </div>

            <div class="form-group">
                <label class="form-label">MODE PENCATATAN</label>
                <select id="f-shop-mode" class="form-input" onchange="FormShopping.renderUI()">
                    <option value="cashier">Mode Kasir (Banyak Barang)</option>
                    <option value="quick">Mode Cepat (1 Barang)</option>
                </select>
            </div>

            <div id="shop-dynamic-area"></div>
            ${this.getItemLibraryHTML()}

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #444;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #aaa; font-weight: bold;">TOTAL:</span>
                    <span id="shop-total-label" style="font-size: 1.2rem; font-weight: bold; color: var(--clr-out);">Rp 0</span>
                </div>
                
                <div id="cashier-calc-area">
                    <div class="form-group">
                        <label class="form-label" style="color: var(--clr-bank);">NOMINAL BAYAR (Rp)</label>
                        <input type="number" id="f-shop-pay" class="form-input" placeholder="0" oninput="FormShopping.updateChange()">
                    </div>
                    <div class="form-group">
                        <label class="form-label">KEMBALIAN</label>
                        <input type="text" id="f-shop-change" class="form-input" value="Rp 0" readonly style="background: #111; color: var(--clr-in);">
                    </div>
                </div>
            </div>

            <button class="btn-submit" style="background: ${type === 'in' ? 'var(--clr-in)' : 'var(--clr-out)'};" onclick="FormShopping.save('${type}')">
                SIMPAN TRANSAKSI
            </button>
        `;
        Core.openModal(html);
        this.renderUI();
    },

    renderUI() {
        const mode = document.getElementById('f-shop-mode').value;
        const area = document.getElementById('shop-dynamic-area');
        const calcArea = document.getElementById('cashier-calc-area');

        if (mode === 'quick') {
            calcArea.style.display = 'none';
            area.innerHTML = `
                <div class="form-group">
                    <label class="form-label">NAMA BARANG</label>
                    <input type="text" id="f-q-name" class="form-input" list="lib-barang" oninput="FormShopping.autoFillPrice(this.value)">
                </div>
                <div class="form-group">
                    <label class="form-label">HARGA (Rp)</label>
                    <input type="number" id="f-q-price" class="form-input" oninput="FormShopping.syncQuickTotal()">
                </div>
            `;
        } else {
            calcArea.style.display = 'block';
            area.innerHTML = `
                <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; border: 1px solid #333;">
                    <label class="form-label" style="color: var(--clr-item); font-size: 0.7rem;">INPUT BARANG</label>
                    <input type="text" id="f-c-name" class="form-input" placeholder="Ketik nama..." list="lib-barang" oninput="FormShopping.autoFillPrice(this.value)" style="margin-bottom: 8px;">
                    <div style="display: flex; gap: 8px;">
                        <input type="number" id="f-c-price" class="form-input" placeholder="Harga" style="flex: 2;">
                        <input type="number" id="f-c-qty" class="form-input" value="1" style="flex: 1;">
                        <button onclick="FormShopping.addItem()" style="background: var(--clr-bank); border: none; border-radius: 8px; width: 40px; color: white;">+</button>
                    </div>
                    <div id="cart-list" style="margin-top: 10px; max-height: 120px; overflow-y: auto;"></div>
                </div>
            `;
            this.updateCartUI();
        }
    },

    addItem() {
        const name = document.getElementById('f-c-name').value;
        const price = parseFloat(document.getElementById('f-c-price').value) || 0;
        const qty = parseInt(document.getElementById('f-c-qty').value) || 1;
        if (!name || price <= 0) return;
        this.items.push({ name, price, qty, total: price * qty });
        document.getElementById('f-c-name').value = '';
        document.getElementById('f-c-price').value = '';
        document.getElementById('f-c-qty').value = '1';
        this.updateCartUI();
    },

    removeItem(index) {
        this.items.splice(index, 1);
        this.updateCartUI();
    },

    updateCartUI() {
        const list = document.getElementById('cart-list');
        let total = 0;
        list.innerHTML = this.items.map((it, i) => {
            total += it.total;
            return `<div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px; border-bottom: 1px solid #222;">
                <span>${it.name} <small>(x${it.qty})</small></span>
                <span>Rp ${it.total.toLocaleString('id-ID')} <span onclick="FormShopping.removeItem(${i})" style="color:var(--clr-out); margin-left:8px;">✕</span></span>
            </div>`;
        }).join('') || '<div style="color:#444; font-size:0.8rem; text-align:center;">Kosong</div>';
        
        document.getElementById('shop-total-label').innerText = `Rp ${total.toLocaleString('id-ID')}`;
        this.updateChange();
    },

    syncQuickTotal() {
        const p = parseFloat(document.getElementById('f-q-price').value) || 0;
        document.getElementById('shop-total-label').innerText = `Rp ${p.toLocaleString('id-ID')}`;
    },

    updateChange() {
        const total = parseFloat(document.getElementById('shop-total-label').innerText.replace(/[^0-9]/g,'')) || 0;
        const pay = parseFloat(document.getElementById('f-shop-pay')?.value) || 0;
        const change = pay - total;
        const el = document.getElementById('f-shop-change');
        if (el) el.value = change >= 0 ? `Rp ${change.toLocaleString('id-ID')}` : "Kurang!";
    },

    save(type) {
        const mode = document.getElementById('f-shop-mode').value;
        const accId = document.getElementById('f-shop-acc').value;
        const cDate = document.getElementById('f-shop-date').value;
        let amt = 0, note = "";

        if (mode === 'quick') {
            amt = parseFloat(document.getElementById('f-q-price').value) || 0;
            note = document.getElementById('f-q-name').value;
        } else {
            if (this.items.length === 0) return;
            amt = this.items.reduce((s, i) => s + i.total, 0);
            note = 'Belanja: ' + this.items.map(i => `${i.name} (${i.qty}x@${i.price})`).join(", ");
        }

        if (Engine.processTransaction({
            type: type, accountId: accId, amount: amt, category: type === 'in' ? 'pemasukan' : 'belanja', relation: '-', note: note,
            customDate: new Date(cDate).toLocaleString('id-ID')
        })) Core.closeModal();
    }
,

    // Membuka form edit untuk transaksi belanja/pemasukan
    openEdit(id) {
        const tx = Core.state.data.transactions.find(t => t.id === id);
        if (!tx) return alert('Transaksi tidak ditemukan!');

        const type = tx.type;

        // Parse items dari note jika ada
        this.items = [];
        if (tx.note && tx.note.startsWith('Belanja: ')) {
            const itemsPart = tx.note.replace('Belanja: ', '');
            const parts = itemsPart.split(', ');
            parts.forEach(p => {
                const matchNew = p.match(/(.+?)\s*\((\d+)x@(\d+)\)/);
                const matchOld = p.match(/(.+?)\s*\((\d+)x\)/);
                if (matchNew) {
                    const name = matchNew[1].trim();
                    const qty = parseInt(matchNew[2]);
                    const price = parseInt(matchNew[3]);
                    this.items.push({ name, price, qty, total: price * qty });
                } else if (matchOld) {
                    const name = matchOld[1].trim();
                    const qty = parseInt(matchOld[2]);
                    this.items.push({ name, price: 0, qty, total: 0 });
                }
            });
        }

        // Konversi tanggal
        let dateValue = '';
        if (tx.timestamp) {
            const d = new Date(tx.timestamp);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            dateValue = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
        }

        const isQuickMode = this.items.length <= 1 && !tx.note.startsWith('Belanja: ');

        const html = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-right: 40px;">
                <h3 style="color: ${type === 'in' ? 'var(--clr-in)' : 'var(--clr-out)'}; margin: 0;">
                    ✏️ Edit ${type === 'in' ? 'Pemasukan' : 'Belanja'}
                </h3>
                <div style="font-size: 0.6rem; color: #666; font-family: monospace;">TX-${tx.id}</div>
            </div>

            <div class="form-group">
                <label class="form-label">TANGGAL & WAKTU</label>
                <input type="datetime-local" id="f-shop-date" class="form-input" value="${dateValue}">
            </div>

            <div class="form-group">
                <label class="form-label">SUMBER SALDO</label>
                <select id="f-shop-acc" class="form-input">${FormUniversal.getAccountOptions()}</select>
            </div>

            <div class="form-group">
                <label class="form-label">MODE PENCATATAN</label>
                <select id="f-shop-mode" class="form-input" onchange="FormShopping.renderUI()">
                    <option value="cashier" ${!isQuickMode ? 'selected' : ''}>Mode Kasir (Banyak Barang)</option>
                    <option value="quick" ${isQuickMode ? 'selected' : ''}>Mode Cepat (1 Barang)</option>
                </select>
            </div>

            <div id="shop-dynamic-area"></div>
            ${this.getItemLibraryHTML()}

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #444;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #aaa; font-weight: bold;">TOTAL:</span>
                    <span id="shop-total-label" style="font-size: 1.2rem; font-weight: bold; color: var(--clr-out);">Rp ${tx.amount.toLocaleString('id-ID')}</span>
                </div>
                <div id="cashier-calc-area">
                    <div class="form-group">
                        <label class="form-label" style="color: var(--clr-bank);">NOMINAL BAYAR (Rp)</label>
                        <input type="number" id="f-shop-pay" class="form-input" placeholder="0" oninput="FormShopping.updateChange()">
                    </div>
                    <div class="form-group">
                        <label class="form-label">KEMBALIAN</label>
                        <input type="text" id="f-shop-change" class="form-input" value="Rp 0" readonly style="background: #111; color: var(--clr-in);">
                    </div>
                </div>
            </div>

            <button class="btn-submit" style="background: var(--clr-bank); color: white;" onclick="FormShopping.saveEdit('${type}', ${tx.id})">
                💾 SIMPAN PERUBAHAN
            </button>

            <button onclick="FormUniversal.openDelete(${tx.id})" style="width: 100%; background: none; color: var(--clr-out); border: 1px solid var(--clr-out); padding: 14px; border-radius: 15px; font-weight: 800; margin-top: 10px; font-size: 0.85rem;">🗑️ HAPUS TRANSAKSI INI</button>
        `;

        Core.openModal(html);

        // Set akun yang dipilih
        if (tx.accountId) {
            const accSelect = document.getElementById('f-shop-acc');
            if (accSelect) accSelect.value = tx.accountId;
        }

        this.renderUI();

        // Jika mode cepat, isi nama dan harga
        if (isQuickMode) {
            setTimeout(() => {
                const nameEl = document.getElementById('f-q-name');
                const priceEl = document.getElementById('f-q-price');
                if (nameEl) nameEl.value = tx.note || '';
                if (priceEl) priceEl.value = tx.amount;
                this.syncQuickTotal();
            }, 100);
        }
    },

    // Simpan hasil edit belanja/pemasukan
    saveEdit(type, id) {
        const tx = Core.state.data.transactions.find(t => t.id === id);
        if (!tx) return alert('Transaksi tidak ditemukan!');

        const mode = document.getElementById('f-shop-mode').value;
        const accId = document.getElementById('f-shop-acc').value;
        const cDate = document.getElementById('f-shop-date').value;
        let amt = 0;
        let note = '';

        if (mode === 'quick') {
            amt = parseFloat(document.getElementById('f-q-price').value) || 0;
            note = document.getElementById('f-q-name').value;
        } else {
            if (this.items.length === 0) return alert('Tambahkan minimal 1 barang!');
            amt = this.items.reduce((s, i) => s + i.total, 0);
            note = 'Belanja: ' + this.items.map(i => `${i.name} (${i.qty}x@${i.price})`).join(', ');
        }

        if (amt <= 0) return alert('Nominal harus lebih dari 0!');

        // Kembalikan saldo lama
        if (tx.accountId) {
            const oldAcc = Core.state.data.accounts.find(a => a.id === tx.accountId);
            if (oldAcc) {
                if (tx.type === 'in') oldAcc.balance -= tx.amount;
                if (tx.type === 'out') oldAcc.balance += tx.amount;
            }
        }

        // Terapkan saldo baru
        if (accId) {
            const newAcc = Core.state.data.accounts.find(a => a.id === accId);
            if (newAcc) {
                if (type === 'in') newAcc.balance += amt;
                if (type === 'out') newAcc.balance -= amt;
            }
        }

        // Update data transaksi
        const txTime = cDate ? new Date(cDate) : new Date(tx.timestamp);
        tx.date = txTime.toLocaleString('id-ID');
        tx.timestamp = txTime.getTime();
        tx.type = type;
        tx.category = type === 'in' ? 'pemasukan' : 'belanja';
        tx.accountId = accId || null;
        tx.amount = amt;
        tx.note = note || '-';

        Core.saveData();
        Core.refreshUI();
        Core.closeModal();
        alert('✅ Transaksi berhasil diperbarui!');
    }

};

window.FormShopping = FormShopping;
