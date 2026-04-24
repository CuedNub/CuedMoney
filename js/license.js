/* FILE: js/license.js
   VERSI: 1.0
   FUNGSI: Sistem Lisensi Berbasis Durasi Hari
*/

const License = {

    // =========================================================
    // ★ AWAL CUSTOM FUNCTIONS License
    // Kelompok: Config, Encode/Decode, Validasi, UI, Admin
    // =========================================================

    // ---------------------------------------------------------
    // CONFIG
    // ---------------------------------------------------------

    ADMIN_PASSWORD: 'cuedmoney2025',
    SECRET_KEY: 'CM-SECRET-2025-CUED',
    LICENSE_STORAGE_KEY: 'cued_money_license',
    USED_CODES_KEY: 'cued_money_used_codes',
    WARNING_DAYS: 7,

    // ---------------------------------------------------------
    // ENCODE / DECODE LISENSI
    // ---------------------------------------------------------

    // Encode angka durasi menjadi kode lisensi unik
    generateCode(days) {
        var timestamp = Date.now();
        var raw = days + '-' + timestamp + '-' + this.SECRET_KEY;

        // Simple hash
        var hash = 0;
        for (var i = 0; i < raw.length; i++) {
            var ch = raw.charCodeAt(i);
            hash = ((hash << 5) - hash) + ch;
            hash = hash & hash;
        }
        hash = Math.abs(hash);

        // Encode durasi ke huruf
        var daysMap = { 30: 'A', 60: 'B', 90: 'C', 180: 'D', 365: 'E' };
        var daysCode = daysMap[days] || 'X';

        // Buat kode 4 bagian
        var part1 = 'CM';
        var part2 = daysCode + hash.toString(36).toUpperCase().substring(0, 3);
        var part3 = timestamp.toString(36).toUpperCase().substring(0, 4);
        var part4 = this.checksum(daysCode + hash.toString(36) + timestamp.toString(36));

        return part1 + '-' + part2 + '-' + part3 + '-' + part4;
    },

    // Buat checksum sederhana untuk validasi
    checksum(str) {
        var sum = 0;
        for (var i = 0; i < str.length; i++) {
            sum += str.charCodeAt(i);
        }
        return (sum % 9000 + 1000).toString();
    },

    // Decode kode lisensi, return jumlah hari atau null jika invalid
    decodeCode(code) {
        if (!code) return null;

        var parts = code.trim().toUpperCase().split('-');
        if (parts.length !== 4) return null;
        if (parts[0] !== 'CM') return null;

        // Ambil kode durasi dari part2 karakter pertama
        var daysCode = parts[1].charAt(0);
        var daysMap = { 'A': 30, 'B': 60, 'C': 90, 'D': 180, 'E': 365 };
        var days = daysMap[daysCode];

        if (!days) return null;

        // Validasi checksum
        var part2lower = parts[1].toLowerCase();
        var part3lower = parts[2].toLowerCase();
        var expectedChecksum = this.checksum(daysCode + part2lower.substring(1) + part3lower);

        if (parts[3] !== expectedChecksum) return null;

        return days;
    },

    // ---------------------------------------------------------
    // PENYIMPANAN & VALIDASI
    // ---------------------------------------------------------

    // Ambil data lisensi dari localStorage
    getLicenseData() {
        var saved = localStorage.getItem(this.LICENSE_STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    // Simpan data lisensi ke localStorage
    saveLicenseData(data) {
        localStorage.setItem(this.LICENSE_STORAGE_KEY, JSON.stringify(data));
    },

    // Ambil daftar kode yang sudah dipakai
    getUsedCodes() {
        var saved = localStorage.getItem(this.USED_CODES_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    },

    // Simpan kode ke daftar sudah dipakai
    addUsedCode(code) {
        var used = this.getUsedCodes();
        used.push(code.toUpperCase());
        localStorage.setItem(this.USED_CODES_KEY, JSON.stringify(used));
    },

    // Cek apakah kode sudah pernah dipakai
    isCodeUsed(code) {
        var used = this.getUsedCodes();
        return used.indexOf(code.toUpperCase()) !== -1;
    },

    // Hitung sisa hari
    getRemainingDays() {
        var data = this.getLicenseData();
        if (!data || !data.expireDate) return -1;

        var now = new Date();
        var expire = new Date(data.expireDate);
        var diff = expire.getTime() - now.getTime();
        var days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        return days;
    },

    // Aktivasi lisensi baru
    activateLicense(code) {
        // Cek format
        var days = this.decodeCode(code);
        if (!days) {
            alert('❌ Kode lisensi tidak valid!\n\nPastikan kode yang dimasukkan benar.');
            return false;
        }

        // Cek apakah sudah dipakai
        if (this.isCodeUsed(code)) {
            alert('❌ Kode lisensi ini sudah pernah digunakan!\n\nHubungi admin untuk kode baru.');
            return false;
        }

        // Hitung tanggal kadaluarsa
        var data = this.getLicenseData();
        var startDate = new Date();

        // Jika masih ada sisa hari, tambahkan dari tanggal expire lama
        if (data && data.expireDate) {
            var oldExpire = new Date(data.expireDate);
            if (oldExpire > startDate) {
                startDate = oldExpire;
            }
        }

        var expireDate = new Date(startDate);
        expireDate.setDate(expireDate.getDate() + days);

        // Simpan
        this.saveLicenseData({
            activatedAt: new Date().toISOString(),
            expireDate: expireDate.toISOString(),
            lastCode: code.toUpperCase(),
            totalDays: days
        });

        this.addUsedCode(code);

        var remaining = this.getRemainingDays();
        alert('✅ Lisensi berhasil diaktifkan!\n\nDurasi: ' + days + ' hari\nMasa aktif sampai: ' + expireDate.toLocaleDateString('id-ID') + '\nSisa hari: ' + remaining + ' hari');

        return true;
    },

    // ---------------------------------------------------------
    // UI — LOCKSCREEN & FORM INPUT LISENSI
    // ---------------------------------------------------------

    // Inisialisasi: cek lisensi saat app dibuka
    init() {
        var remaining = this.getRemainingDays();
        var data = this.getLicenseData();

        // Belum pernah aktivasi
        if (!data) {
            this.showLockscreen('firsttime');
            return false;
        }

        // Masa aktif habis
        if (remaining <= 0) {
            this.showLockscreen('expired');
            return false;
        }

        // Peringatan sisa hari
        if (remaining <= this.WARNING_DAYS) {
            this.showWarning(remaining);
        }

        // Tampilkan sisa hari di header
        this.showRemainingInHeader(remaining);

        return true;
    },

    // Tampilkan sisa hari di header
    showRemainingInHeader(days) {
        var el = document.getElementById('app-version');
        if (el) {
            var color = days <= 7 ? '#ff1744' : '#555';
            el.innerHTML = 'v' + Core.APP_VERSION + ' <span style="color:' + color + ';font-size:0.45rem;margin-left:4px;">(' + days + ' hari)</span>';
        }
    },

    // Tampilkan peringatan sisa hari (tidak mengunci app)
    showWarning(days) {
        setTimeout(function() {
            var html = '<div style="text-align:center;padding:20px 0;">'
                + '<div style="font-size:2.5rem;margin-bottom:10px;">⚠️</div>'
                + '<h3 style="color:var(--clr-item);margin-bottom:15px;">Masa Aktif Hampir Habis</h3>'
                + '<p style="color:var(--txt-muted);font-size:0.85rem;margin-bottom:20px;">'
                + 'Sisa masa aktif CuedMoney: <strong style="color:var(--clr-out);">' + days + ' hari</strong>.<br>'
                + 'Hubungi admin untuk memperpanjang.</p>'
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
                + '<button onclick="License.openInputForm()" style="padding:14px;background:var(--clr-bank);color:white;border:none;border-radius:12px;font-weight:800;font-size:0.8rem;">🔑 Input Lisensi</button>'
                + '<button onclick="Core.closeModal()" style="padding:14px;background:#333;color:white;border:1px solid #444;border-radius:12px;font-weight:800;font-size:0.8rem;">Nanti</button>'
                + '</div></div>';
            Core.openModal(html);
        }, 500);
    },

    // Tampilkan lockscreen (app terkunci)
    showLockscreen(reason) {
        var lockEl = document.getElementById('license-lockscreen');
        var appContent = document.getElementById('app-content');
        var fab = document.querySelector('.fab');

        if (lockEl) lockEl.style.display = 'flex';
        if (appContent) appContent.style.display = 'none';
        if (fab) fab.style.display = 'none';

        var titleEl = document.getElementById('lock-title');
        var descEl = document.getElementById('lock-desc');

        if (reason === 'firsttime') {
            if (titleEl) titleEl.textContent = 'Selamat Datang di CuedMoney!';
            if (descEl) descEl.textContent = 'Masukkan kode lisensi dari admin untuk mulai menggunakan aplikasi.';
        } else {
            if (titleEl) titleEl.textContent = 'Masa Aktif Telah Berakhir';
            if (descEl) descEl.textContent = 'Hubungi admin untuk mendapatkan kode lisensi baru. Data kamu tetap aman.';
        }
    },

    // Sembunyikan lockscreen
    hideLockscreen() {
        var lockEl = document.getElementById('license-lockscreen');
        var appContent = document.getElementById('app-content');
        var fab = document.querySelector('.fab');

        if (lockEl) lockEl.style.display = 'none';
        if (appContent) appContent.style.display = 'block';
        if (fab) fab.style.display = 'block';
    },

    // Form input lisensi (untuk user)
    openInputForm() {
        var html = '<div style="text-align:center;padding:10px 0;">'
            + '<div style="font-size:2rem;margin-bottom:10px;">🔑</div>'
            + '<h3 style="margin-bottom:20px;">Input Kode Lisensi</h3>'
            + '<div class="form-group">'
            + '<label class="form-label">KODE LISENSI</label>'
            + '<input type="text" id="f-license-code" class="form-input" placeholder="Contoh: CM-A7X9-K2M4-2025" style="text-align:center;font-family:monospace;font-size:1rem;letter-spacing:2px;text-transform:uppercase;">'
            + '</div>'
            + '<button class="btn-submit" style="background:var(--clr-bank);color:white;" onclick="License.submitLicense()">✅ AKTIVASI LISENSI</button>'
            + '<div style="margin-top:15px;font-size:0.7rem;color:#555;">Hubungi admin untuk mendapatkan kode lisensi.</div>'
            + '</div>';
        Core.openModal(html);
    },

    // Submit lisensi dari form input
    submitLicense() {
        var code = document.getElementById('f-license-code').value;
        if (!code || code.trim().length === 0) {
            alert('Masukkan kode lisensi!');
            return;
        }

        var success = this.activateLicense(code.trim());
        if (success) {
            Core.closeModal();
            this.hideLockscreen();
            Core.refreshUI();

            // Update tampilan header
            var remaining = this.getRemainingDays();
            this.showRemainingInHeader(remaining);
        }
    },

    // Tombol input lisensi dari lockscreen
    lockscreenInput() {
        // Tutup lockscreen sementara untuk buka modal
        var lockEl = document.getElementById('license-lockscreen');
        if (lockEl) lockEl.style.display = 'none';

        this.openInputForm();
    },

    // Tombol export dari lockscreen
    lockscreenExport() {
        if (window.SyncModule) {
            SyncModule.exportData();
        }
    },

    // ---------------------------------------------------------
    // ADMIN — GENERATE LISENSI (TERSEMBUNYI)
    // ---------------------------------------------------------

    adminClickCount: 0,
    adminClickTimer: null,

    // Easter egg: klik logo 5x untuk buka admin panel
    handleLogoClick() {
        this.adminClickCount++;

        if (this.adminClickTimer) {
            clearTimeout(this.adminClickTimer);
        }

        // Reset setelah 3 detik tidak diklik
        this.adminClickTimer = setTimeout(function() {
            License.adminClickCount = 0;
        }, 3000);

        if (this.adminClickCount >= 5) {
            this.adminClickCount = 0;
            this.openAdminLogin();
        }
    },

    // Form login admin
    openAdminLogin() {
        var html = '<div style="text-align:center;padding:10px 0;">'
            + '<div style="font-size:2rem;margin-bottom:10px;">🔐</div>'
            + '<h3 style="margin-bottom:20px;">Admin Panel</h3>'
            + '<div class="form-group">'
            + '<label class="form-label">PASSWORD ADMIN</label>'
            + '<input type="password" id="f-admin-pass" class="form-input" placeholder="Masukkan password..." style="text-align:center;">'
            + '</div>'
            + '<button class="btn-submit" onclick="License.verifyAdmin()">MASUK</button>'
            + '</div>';
        Core.openModal(html);
    },

    // Verifikasi password admin
    verifyAdmin() {
        var pass = document.getElementById('f-admin-pass').value;
        if (pass === this.ADMIN_PASSWORD) {
            Core.closeModal();
            setTimeout(function() {
                License.openGenerateForm();
            }, 350);
        } else {
            alert('❌ Password salah!');
        }
    },

    // Form generate lisensi (admin only)
    openGenerateForm() {
        var html = '<div style="padding:10px 0;">'
            + '<div style="text-align:center;margin-bottom:20px;">'
            + '<div style="font-size:2rem;margin-bottom:5px;">🔐</div>'
            + '<h3 style="color:var(--clr-bank);">Generate Lisensi</h3>'
            + '</div>'
            + '<div class="form-group">'
            + '<label class="form-label">PILIH DURASI</label>'
            + '<select id="f-gen-days" class="form-input">'
            + '<option value="30">30 Hari (1 Bulan)</option>'
            + '<option value="60">60 Hari (2 Bulan)</option>'
            + '<option value="90">90 Hari (3 Bulan)</option>'
            + '<option value="180">180 Hari (6 Bulan)</option>'
            + '<option value="365">365 Hari (1 Tahun)</option>'
            + '</select>'
            + '</div>'
            + '<button class="btn-submit" style="background:var(--clr-bank);color:white;" onclick="License.doGenerate()">🔑 GENERATE KODE</button>'
            + '<div id="gen-result" style="margin-top:20px;display:none;">'
            + '<div style="background:#222;padding:20px;border-radius:12px;text-align:center;border:1px solid var(--clr-bank);">'
            + '<div style="font-size:0.7rem;color:var(--txt-muted);margin-bottom:8px;">KODE LISENSI:</div>'
            + '<div id="gen-code" style="font-size:1.3rem;font-weight:900;color:var(--clr-bank);font-family:monospace;letter-spacing:3px;margin-bottom:15px;"></div>'
            + '<div id="gen-info" style="font-size:0.7rem;color:var(--txt-muted);margin-bottom:15px;"></div>'
            + '<button onclick="License.copyGeneratedCode()" style="width:100%;padding:12px;background:var(--clr-in);color:black;border:none;border-radius:10px;font-weight:800;font-size:0.8rem;">📋 SALIN KODE</button>'
            + '</div>'
            + '</div>'
            + '<div style="margin-top:15px;padding-top:15px;border-top:1px solid #333;">'
            + '<div style="font-size:0.7rem;font-weight:800;color:var(--txt-muted);margin-bottom:8px;">RIWAYAT KODE TERPAKAI:</div>'
            + '<div style="max-height:150px;overflow-y:auto;background:#1a1a1a;border-radius:10px;padding:10px;">'
            + License.getUsedCodesHTML()
            + '</div>'
            + '</div>'
            + '</div>';
        Core.openModal(html);
    },

    // Generate kode
    doGenerate() {
        var days = parseInt(document.getElementById('f-gen-days').value);
        var code = this.generateCode(days);

        document.getElementById('gen-code').textContent = code;
        document.getElementById('gen-info').textContent = 'Durasi: ' + days + ' hari | Dibuat: ' + new Date().toLocaleDateString('id-ID');
        document.getElementById('gen-result').style.display = 'block';

        this.lastGeneratedCode = code;
    },

    lastGeneratedCode: '',

    // Salin kode yang baru digenerate
    copyGeneratedCode() {
        var code = this.lastGeneratedCode;
        if (!code) return;

        var text = '*🔑 KODE LISENSI CUEDMONEY*\n'
            + '━━━━━━━━━━━━━━━━━━━━━━━━\n'
            + 'Kode: ' + code + '\n'
            + 'Dibuat: ' + new Date().toLocaleDateString('id-ID') + '\n'
            + '━━━━━━━━━━━━━━━━━━━━━━━━\n'
            + 'Cara pakai:\n'
            + '1. Buka app CuedMoney\n'
            + '2. Klik "Input Lisensi"\n'
            + '3. Masukkan kode di atas\n'
            + '4. Klik "Aktivasi"\n'
            + '━━━━━━━━━━━━━━━━━━━━━━━━\n'
            + '_CuedMoney Digital_';

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                alert('✅ Kode lisensi berhasil disalin!\n\nSilakan kirim ke user via WhatsApp.');
            }).catch(function() {
                prompt('Salin kode ini:', code);
            });
        } else {
            prompt('Salin kode ini:', code);
        }
    },

    // HTML daftar kode yang sudah dipakai
    getUsedCodesHTML() {
        var used = this.getUsedCodes();
        if (used.length === 0) {
            return '<div style="text-align:center;color:#555;font-size:0.75rem;">Belum ada kode terpakai</div>';
        }
        var html = '';
        for (var i = used.length - 1; i >= 0; i--) {
            html += '<div style="font-family:monospace;font-size:0.75rem;color:#888;padding:4px 0;border-bottom:1px solid #222;">' + used[i] + '</div>';
        }
        return html;
    }

    // =========================================================
    // ★ AKHIR CUSTOM FUNCTIONS License
    // =========================================================
};

window.License = License;
