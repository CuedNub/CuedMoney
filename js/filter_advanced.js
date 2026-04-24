/* FILE: js/filter_advanced.js
   FUNGSI: Komponen Filter Dropdown Canggih & Pencarian
*/

const FilterAdvanced = {
    render() {
        const container = document.getElementById('filter-area');
        if (!container) return;

        // Ambil status filter saat ini dari Mandor (Core)
        const f = Core.state.filters;

        let html = `
            <div class="filter-box">
                <div style="font-size: 0.75rem; font-weight: 800; color: var(--txt-muted); letter-spacing: 1px; margin-bottom: 8px;">
                    CARI & SARING TRANSAKSI
                </div>
                
                <div style="position: relative; margin-bottom: 10px;">
                    <input type="text" id="search-input" placeholder="Cari nama orang, toko, atau catatan..." 
                        value="${f.search}" 
                        oninput="FilterAdvanced.updateSearch(this.value)"
                        style="width: 100%; padding: 14px 15px 14px 40px; border-radius: 12px; border: 1px solid #333; background: var(--bg-card); color: white; font-size: 0.85rem; outline: none; box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);">
                    <span style="position: absolute; left: 14px; top: 14px; opacity: 0.5;">🔍</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    
                    <select class="select-custom" onchange="FilterAdvanced.updateCategory(this.value)">
                        <option value="all" ${f.category === 'all' ? 'selected' : ''}>Semua Kategori</option>
                        <option value="liquid" ${f.category === 'liquid' ? 'selected' : ''}>Bank & Dompet Saku</option>
                        <option value="debt" ${f.category === 'debt' ? 'selected' : ''}>Hutang & Piutang Uang</option>
                        <option value="tanggungan" ${f.category === 'tanggungan' ? 'selected' : ''}>Tanggungan Barang</option>
                    </select>

                    <select class="select-custom" onchange="FilterAdvanced.updateFlow(this.value)">
                        <option value="all" ${f.flow === 'all' ? 'selected' : ''}>Semua Arus (+/-)</option>
                        <option value="in" ${f.flow === 'in' ? 'selected' : ''}>Uang Masuk (+)</option>
                        <option value="out" ${f.flow === 'out' ? 'selected' : ''}>Uang Keluar (-)</option>
                    </select>

                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    // Fungsi-fungsi untuk memperbarui state dan me-refresh layar
    updateSearch(val) {
        Core.state.filters.search = val.toLowerCase();
        // Hanya render List Item agar kotak ketikan tidak hilang fokus saat mengetik
        if (window.ListItem) ListItem.render(); 
    },

    updateCategory(val) {
        Core.state.filters.category = val;
        Core.refreshUI();
    },

    updateFlow(val) {
        Core.state.filters.flow = val;
        Core.refreshUI();
    }
};

window.FilterAdvanced = FilterAdvanced;
