/* FILE: js/item_db.js
   FUNGSI: Manajemen Library Barang (Master Data)
*/

const ItemDB = {
    init() {
        if (!Core.state.data.items_library) {
            Core.state.data.items_library = [];
            Core.saveData();
        }
    },

    openManager() {
        this.init();
        const items = Core.state.data.items_library;
        let listHtml = items.map((item, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #333;">
                <div>
                    <div style="font-weight: bold;">${item.name}</div>
                    <div style="color: var(--clr-in); font-size: 0.85rem;">Rp ${item.price.toLocaleString('id-ID')}</div>
                </div>
                <div>
                    <button onclick="ItemDB.editItem(${index})" style="background: none; border: none; color: var(--clr-bank);">✏️</button>
                    <button onclick="ItemDB.deleteItem(${index})" style="background: none; border: none; color: var(--clr-out);">🗑️</button>
                </div>
            </div>
        `).join('');

        const html = `
            <h3>📦 Database Barang</h3>
            <div style="margin-bottom: 15px; background: #222; padding: 10px; border-radius: 8px;">
                <input type="text" id="db-item-name" class="form-input" placeholder="Nama Barang Baru..." style="margin-bottom: 5px;">
                <input type="number" id="db-item-price" class="form-input" placeholder="Harga Default (Rp)...">
                <button class="btn-submit" onclick="ItemDB.addItem()" style="margin-top: 10px;">+ TAMBAH BARANG</button>
            </div>
            <div style="max-height: 250px; overflow-y: auto;">
                ${listHtml || '<p style="text-align: center; color: #666;">Belum ada barang tersimpan.</p>'}
            </div>
        `;
        Core.openModal(html);
    },

    addItem() {
        const name = document.getElementById('db-item-name').value;
        const price = parseFloat(document.getElementById('db-item-price').value) || 0;
        if (!name || price <= 0) return alert("Isi nama dan harga!");

        Core.state.data.items_library.push({
            id: Date.now(),
            name: name,
            price: price
        });
        Core.saveData();
        this.openManager();
    },

    deleteItem(index) {
        if (confirm("Hapus barang ini dari database?")) {
            Core.state.data.items_library.splice(index, 1);
            Core.saveData();
            this.openManager();
        }
    },

    editItem(index) {
        const item = Core.state.data.items_library[index];
        const newPrice = prompt(`Ubah harga untuk ${item.name}:`, item.price);
        if (newPrice !== null) {
            Core.state.data.items_library[index].price = parseFloat(newPrice) || 0;
            Core.saveData();
            this.openManager();
        }
    }
};

window.ItemDB = ItemDB;
