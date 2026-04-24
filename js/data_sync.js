/* FILE: js/data_sync.js
   FUNGSI: Modul Export dan Import Data (Backup Data JSON)
*/

const SyncModule = {
    // Fungsi untuk Mengunduh (Backup) Data ke File JSON
    exportData() {
        // Ambil seluruh data dari memori (Buku Besar)
        const dataToExport = Core.state.data;
        // Ubah menjadi format teks JSON dengan spasi agar rapi
        const dataStr = JSON.stringify(dataToExport, null, 2);
        
        // Buat file (Blob) bertipe JSON
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        // Buat elemen link tersembunyi untuk memicu proses download di browser
        const a = document.createElement('a');
        
        // Buat nama file otomatis dengan tanggal hari ini (contoh: CuedMoney_Backup_2026-04-21.json)
        const dateStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `CuedMoney_Backup_${dateStr}.json`;
        
        // Eksekusi klik otomatis dan bersihkan memori browser
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert("Data berhasil diekspor! Silakan amankan file JSON tersebut.");
    },

    // Fungsi untuk Memuat (Restore) Data dari File JSON
    importData(event) {
        // Ambil file yang dipilih oleh Pak Bos
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        // Saat file selesai dibaca oleh sistem
        reader.onload = function(e) {
            try {
                // Terjemahkan teks di dalam file menjadi objek data
                const importedData = JSON.parse(e.target.result);
                
                // Validasi ringan untuk memastikan ini benar-benar file backup CuedMoney
                if (!importedData.accounts || !importedData.transactions) {
                    throw new Error("Format file tidak sesuai dengan struktur CuedMoney.");
                }

                // Munculkan peringatan sebelum menimpa Buku Besar saat ini
                if (confirm("PERINGATAN: Mengimpor data akan menimpa seluruh data yang ada saat ini! Anda yakin ingin melanjutkan?")) {
                    
                    // Timpa data di Mandor (Core) dengan data dari file
                    Core.state.data.accounts = importedData.accounts;
                    Core.state.data.transactions = importedData.transactions;
                    Core.state.data.price_memory = importedData.price_memory || {}; // Jaga-jaga jika di file lama tidak ada price_memory
                    Core.state.data.items_library = importedData.items_library || []; // Restore database barang
                    
                    // Simpan permanen ke HP dan paksa aplikasi menggambar ulang tampilannya
                    Core.saveData();
                    Core.refreshUI();
                    
                    alert("Data berhasil diimpor! Aplikasi CuedMoney telah diperbarui.");
                }
            } catch (error) {
                alert("Gagal mengimpor data! File mungkin rusak atau format tidak dikenali. Detail Error: " + error.message);
            }
            
            // Reset kolom input file agar tombol import bisa diklik lagi dengan file yang sama jika diperlukan
            event.target.value = '';
        };
        
        // Mulai baca isi file sebagai teks
        reader.readAsText(file);
    }
};

// Daftarkan modul ini ke sistem utama
window.SyncModule = SyncModule;
