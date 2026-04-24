/* FILE: js/engine.js
   VERSI: 3.5 (SPECIAL REVERSE LOGIC)
   FUNGSI: Mesin Kalkulator & Universal Ledger
   UPDATE: Mendukung pemotongan saldo otomatis saat bayar cicilan barang.
*/

const Engine = {
    processTransaction({ type, accountId, amount, category, relation, note, customDate }) {
        const amt = parseFloat(amount) || 0;
        if (amt <= 0) {
            alert("Nominal tidak valid!");
            return false;
        }

        const tx = {
            id: Date.now(),
            date: new Date().toLocaleString('id-ID'),
            timestamp: new Date().getTime(),
            type: type,         
            accountId: accountId, 
            amount: amt,
            category: category, 
            relation: relation || '-', 
            note: note || '-'
        };

        // 1. Simpan ke Buku Besar
        Core.state.data.transactions.unshift(tx);

        // 2. LOGIKA SALDO BANK/DOMPET (LOGIKA PINTAR)
        if (accountId) {
            const acc = Core.state.data.accounts.find(a => a.id === accountId);
            if (acc) {
                // KONDISI KHUSUS: Tanggungan Barang
                // Jika Bayar Cicilan (in), maka saldo bank harus BERKURANG (-)
                if (category === 'tanggungan') {
                    if (type === 'in') {
                        if (acc.balance < amt) {
                            if (!confirm('Saldo ' + acc.name + ' tidak cukup (Rp ' + acc.balance.toLocaleString('id-ID') + '). Saldo akan minus. Lanjutkan?')) {
                                Core.state.data.transactions.shift();
                                return false;
                            }
                        }
                        acc.balance -= amt; // Bayar cicilan = uang keluar dari bank
                    } else {
                        // Jika ambil barang baru tapi iseng pilih bank (sangat jarang)
                        // kita biarkan saja atau tidak lakukan apa-apa.
                    }
                } 
                // KONDISI NORMAL: (Bank, Dompet, Hutang Uang, Piutang Uang)
                else {
                    if (type === 'in') acc.balance += amt;
                    if (type === 'out') {
                        if (acc.balance < amt) {
                            if (!confirm('Saldo ' + acc.name + ' tidak cukup (Rp ' + acc.balance.toLocaleString('id-ID') + '). Saldo akan minus. Lanjutkan?')) {
                                Core.state.data.transactions.shift();
                                return false;
                            }
                        }
                        acc.balance -= amt;
                    }
                }
            }
        }

        Core.saveData();
        Core.refreshUI();
        return true;
    },

    processTransfer(fromId, toId, amount, adminFee = 0) {
        const amt = parseFloat(amount) || 0;
        const adm = parseFloat(adminFee) || 0;
        if (amt <= 0) return false;

        const fromAcc = Core.state.data.accounts.find(a => a.id === fromId);
        const toAcc = Core.state.data.accounts.find(a => a.id === toId);

        if (!fromAcc || !toAcc) return false;
        if (fromAcc.balance < (amt + adm)) {
            alert("Saldo tidak cukup!");
            return false;
        }

        fromAcc.balance -= (amt + adm);
        toAcc.balance += amt;

        const ts = new Date().getTime();
        const dateStr = new Date().toLocaleString('id-ID');

        Core.state.data.transactions.unshift({
            id: ts, date: dateStr, timestamp: ts,
            type: 'out', accountId: fromId, amount: amt + adm,
            category: 'transfer', relation: `Ke ${toAcc.name}`, note: 'Transfer Keluar'
        });

        Core.state.data.transactions.unshift({
            id: ts + 1, date: dateStr, timestamp: ts + 1,
            type: 'in', accountId: toId, amount: amt,
            category: 'transfer', relation: `Dari ${fromAcc.name}`, note: 'Transfer Masuk'
        });

        Core.saveData();
        Core.refreshUI();
        return true;
    },

    deleteTransaction(id) {
        const txIndex = Core.state.data.transactions.findIndex(t => t.id === id);
        if (txIndex === -1) return;
        const tx = Core.state.data.transactions[txIndex];

        if (tx.accountId) {
            const acc = Core.state.data.accounts.find(a => a.id === tx.accountId);
            if (acc) {
                // Kembalikan saldo sesuai logika terbalik tadi
                if (tx.category === 'tanggungan') {
                    if (tx.type === 'in') acc.balance += tx.amount;
                } else {
                    if (tx.type === 'in') acc.balance -= tx.amount;
                    if (tx.type === 'out') acc.balance += tx.amount;
                }
            }
        }

        Core.state.data.transactions.splice(txIndex, 1);
        Core.saveData();
        Core.refreshUI();
    },

    getLiquidStats() {
        let totalWallet = 0; let totalBank = 0;
        Core.state.data.accounts.forEach(acc => {
            if (acc.type === 'wallet') totalWallet += acc.balance;
            if (acc.type === 'bank') totalBank += acc.balance;
        });
        return { wallet: totalWallet, bank: totalBank, total: totalWallet + totalBank, accounts: Core.state.data.accounts };
    },

    getDebtStats() {
        let sisaPiutang = 0; let sisaHutang = 0; let sisaBarang = 0;
        Core.state.data.transactions.forEach(tx => {
            if (tx.category === 'piutang') {
                if (tx.type === 'out') sisaPiutang += tx.amount;
                if (tx.type === 'in') sisaPiutang -= tx.amount;
            }
            if (tx.category === 'hutang') {
                if (tx.type === 'in') sisaHutang += tx.amount;
                if (tx.type === 'out') sisaHutang -= tx.amount;
            }
            if (tx.category === 'tanggungan') {
                if (tx.type === 'out') sisaBarang += tx.amount; // Tambah Beban
                if (tx.type === 'in') sisaBarang -= tx.amount;  // Kurangi Beban (Cicilan)
            }
        });
        return { piutang: sisaPiutang, hutang: sisaHutang, barang: sisaBarang };
    },

    addAccount(name, initialBalance) {
        Core.state.data.accounts.push({ id: 'bank_' + Date.now(), name: name, type: 'bank', balance: parseFloat(initialBalance) || 0 });
        Core.saveData(); Core.refreshUI();
    },

    deleteAccount(id) {
        if (id === 'wallet_cash') return;
        Core.state.data.accounts = Core.state.data.accounts.filter(a => a.id !== id);
        Core.saveData(); Core.refreshUI();
    }
};

window.Engine = Engine;
