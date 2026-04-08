// API Endpoints (Pointing to local server which acts as bridge to Google Sheets)
const API_WARGA = `/warga`;
const API_KAS = `/data`;

// FORMAT RUPIAH
function formatRupiah(angka) {
    return 'Rp ' + Number(angka || 0).toLocaleString('id-ID');
}

const DashboardController = {

    async init() {
        await this.loadData();
    },

    async loadData() {
        try {
            const [wargaRes, kasRes] = await Promise.all([
                fetch(API_WARGA),
                fetch(API_KAS)
            ]);

            const warga = await wargaRes.json();
            const kas = await kasRes.json();

            this.renderStats(warga, kas);
            this.renderCharts(warga);

        } catch (err) {
            console.error("Gagal load data:", err);
        }
    },

    // ============================
    // STATS
    // ============================
    renderStats(warga, kas) {

        const totalWarga = warga.length;

        const totalKK = new Set(
            warga.map(w => w.no_kk).filter(x => x)
        ).size;

        const totalMasuk = kas
            .filter(k => k.type === "Masuk")
            .reduce((a, b) => a + Number(b.amount || 0), 0);

        const totalKeluar = kas
            .filter(k => k.type === "Keluar")
            .reduce((a, b) => a + Number(b.amount || 0), 0);

        const saldo = totalMasuk - totalKeluar;

        document.getElementById('total-warga-count').innerText = totalWarga;
        document.getElementById('total-kk-count').innerText = totalKK;
        document.getElementById('total-saldo').innerText = formatRupiah(saldo);
    },

    // ============================
    // CHARTS
    // ============================
    renderCharts(warga) {

        this.renderGender(warga);
        this.renderUsia(warga);
        this.renderWilayah(warga);
    },

    // ============================
    // GENDER
    // ============================
    renderGender(warga) {
        let laki = 0, perempuan = 0;

        warga.forEach(w => {
            if (w.jenis_kelamin === "Laki-laki") laki++;
            if (w.jenis_kelamin === "Perempuan") perempuan++;
        });

        const total = laki + perempuan;

        const container = document.getElementById("gender-chart-container");

        container.innerHTML = `
            ${this.bar("Laki-laki", laki, total)}
            ${this.bar("Perempuan", perempuan, total)}
        `;
    },

    // ============================
    // USIA
    // ============================
    renderUsia(warga) {
        const umurGroup = {
            "0-17": 0,
            "18-40": 0,
            "41-60": 0,
            "60+": 0
        };

        const now = new Date();

        warga.forEach(w => {
            if (!w.tanggal_lahir) return;

            const birthDate = new Date(w.tanggal_lahir);
            let umur = now.getFullYear() - birthDate.getFullYear();
            const m = now.getMonth() - birthDate.getMonth();
            // Cek jika belum melewati hari ulang tahun di tahun berjalan
            if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
                umur--;
            }

            if (umur <= 17) umurGroup["0-17"]++;
            else if (umur <= 40) umurGroup["18-40"]++;
            else if (umur <= 60) umurGroup["41-60"]++;
            else umurGroup["60+"]++;
        });

        const total = Object.values(umurGroup).reduce((a, b) => a + b, 0);

        const container = document.getElementById("age-chart-container");

        container.innerHTML = Object.entries(umurGroup)
            .map(([k, v]) => this.bar(k, v, total))
            .join('');
    },

    // ============================
    // WILAYAH
    // ============================
    renderWilayah(warga) {
        const wilayah = {};

        warga.forEach(w => {
            const key = w.kelurahan || "Tidak diketahui";
            wilayah[key] = (wilayah[key] || 0) + 1;
        });

        const total = Object.values(wilayah).reduce((a, b) => a + b, 0);

        const container = document.getElementById("kelurahan-chart-container");

        container.innerHTML = Object.entries(wilayah)
            .map(([k, v]) => this.bar(k, v, total))
            .join('');
    },

    // ============================
    // COMPONENT BAR
    // ============================
    bar(label, value, total) {
        const percent = total ? (value / total) * 100 : 0;

        return `
            <div class="chart-row">
                <div class="chart-label">${label}</div>
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" style="width:${percent}%">
                        ${value}
                    </div>
                </div>
            </div>
        `;
    }
};

// INIT
document.addEventListener('DOMContentLoaded', () => {
    DashboardController.init();
});