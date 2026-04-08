const XLSX = require('xlsx');

const FILE_KAS = 'data_kas.xlsx';
const FILE_WARGA = 'data_warga.xlsx';
const FILE_PENGGUNA = 'data_pengguna.xlsx';

const createExcel = (filename, sheetName, initialData) => {
    const worksheet = XLSX.utils.json_to_sheet(initialData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
    console.log(`Sukses: File ${filename} telah dibuat.`);
};

// Struktur data awal untuk Kas Lingkungan
const dataKas = [
    { id: '1', date: '2026-01-01', type: 'Masuk', amount: 0, rt: 'RT 01', description: 'Saldo Awal Sistem' }
];

// Struktur data awal untuk Data Warga
const dataWarga = [
    { 
        nama: 'Contoh Warga', 
        nik: '1234567890', 
        tempat_lahir: 'Jakarta',
        tanggal_lahir: '1990-01-01',
        jenis_kelamin: 'Laki-laki',
        alamat: 'Jl. Contoh No. 1',
        rt: 'RT 01',
        kelurahan: 'Kemang Jaya',
        kecamatan: 'Mampang Prapatan',
        agama: 'Islam',
        status_perkawinan: 'Kawin',
        pekerjaan: 'Karyawan',
        kewarganegaraan: 'WNI',
        status_hunian: 'Tetap',
        kondisi: 'Umum'
    }
];

// Struktur data awal untuk Pengguna
const dataPengguna = [
    { username: 'admin', password: 'admin123', role: 'Administrator', rt: 'RW' }
];

createExcel(FILE_KAS, 'Kas', dataKas);
createExcel(FILE_WARGA, 'Warga', dataWarga);
createExcel(FILE_PENGGUNA, 'Pengguna', dataPengguna);