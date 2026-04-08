# DAWALA (Data Warga & Layanan Administrasi) - Prototipe UI Statis

Prototipe antarmuka pengguna (UI) statis untuk Sistem Informasi RT/RW modern, dibangun menggunakan HTML dan CSS. Proyek ini bertujuan untuk memberikan gambaran visual tentang bagaimana aplikasi DAWALA akan terlihat dan berfungsi.

## ✨ Fitur Utama

Proyek ini mencakup beberapa halaman statis yang mewakili fitur-fitur inti sistem:

- **Otentikasi**: Halaman `login.html` untuk masuk ke sistem.
- **Dashboard**: Halaman utama yang menampilkan ringkasan informasi penting.
- **Manajemen Data**: Halaman untuk mengelola data warga (`penduduk.html`).
- **Keuangan**: Halaman untuk pencatatan dan pelaporan keuangan RT/RW.
- **Galeri**: Galeri untuk menampilkan foto-foto kegiatan lingkungan.
- **Pengaturan**: Halaman untuk konfigurasi sistem.

## 📂 Struktur Proyek

Struktur folder diatur secara logis untuk memisahkan konten halaman, style, dan aset lainnya.

```
e-neighborhood/
├── index.html              # Titik masuk utama, mengarahkan ke halaman login
├── pages/                  # Berisi semua halaman inti aplikasi
│   ├── login.html
│   └── ...
├── assets/                 # Berisi semua aset pendukung
│   ├── css/style.css       # File styling global
│   ├── js/main.js          # File JavaScript (opsional)
│   └── img/                # Aset gambar
└── README.md
```

## 🚀 Panduan Penggunaan

### Prasyarat
- Web browser modern (contoh: Google Chrome, Firefox, atau Safari).
- Node.js terinstall di komputer Anda.

### Langkah Menjalankan
1.  Clone atau unduh repositori ini ke komputer Anda.
2.  Buka terminal/command prompt di dalam folder proyek.
3.  Jalankan perintah `node generate_excel.js` untuk membuat database awal.
4.  Jalankan perintah `node server.js` untuk memulai backend.
5.  Buka browser dan akses **`http://localhost:5500`**.
6.  Login menggunakan username `admin` dan password `admin123`.

**Catatan:** Pastikan Anda mengakses melalui URL `http`, bukan dengan klik kanan file `index.html` > Open with Browser, karena fitur login memerlukan koneksi ke server.

## 🤝 Kontribusi

Kontribusi dalam bentuk apapun sangat kami hargai. Jika Anda menemukan bug atau memiliki ide untuk perbaikan, jangan ragu untuk membuat *Issue* atau *Pull Request*.