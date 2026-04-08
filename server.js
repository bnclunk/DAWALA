require('dotenv').config();
console.log("🚀 DAWALA SERVER: PROD MODE 🚀");
const express = require('express');
const cors = require('cors');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// VALIDASI ENV (Poin 1: Keamanan)
const REQUIRED_ENVS = ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SHEET_ID'];
REQUIRED_ENVS.forEach(env => {
    if (!process.env[env]) {
        console.error(`❌ Error: Variabel lingkungan ${env} tidak ditemukan!`);
        process.exit(1);
    }
});

const app = express();
// Poin 2: Port Dinamis
const PORT = process.env.PORT || 5500;

// CONFIGURATION
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // Mengatasi masalah karakter newline pada private key di beberapa platform hosting
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
let loadPromise = null; // Poin 3: Optimasi (Singleton Pattern)

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Helper untuk mendapatkan Sheet berdasarkan Judul
async function getSheet(title) {
    if (!loadPromise) {
        loadPromise = doc.loadInfo().then(() => {
            console.log(`✅ Terhubung ke Spreadsheet: ${doc.title}`);
            return true;
        });
    }
    await loadPromise;
    return doc.sheetsByTitle[title];
}

// Helper untuk konversi Row ke JSON biasa
const rowsToJSON = (rows) => rows.map(row => row.toObject());

const recordLog = async (user, action, details) => {
    try {
        const sheet = await getSheet('Log');
        if (sheet) {
            await sheet.addRow({
                timestamp: new Date().toLocaleString('id-ID'),
                user: user || 'Unknown',
                action,
                details
            });
        }
    } catch (e) { console.error("Gagal mencatat log ke Sheets:", e); }
};

// ===== API: KAS =====
app.get('/data', async (req, res) => {
    const sheet = await getSheet('Kas');
    const rows = await sheet.getRows();
    res.json(rowsToJSON(rows));
});

app.post('/tambah', async (req, res) => {
    const { operator, ...newData } = req.body;
    const sheet = await getSheet('Kas');
    await sheet.addRow(newData);
    await recordLog(operator, 'Tambah Kas', `${newData.type}: ${newData.description}`);
    res.json({ status: 'ok' });
});

app.post('/edit', async (req, res) => {
    const { operator, ...updatedData } = req.body;
    const sheet = await getSheet('Kas');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === updatedData.id);
    if (row) {
        Object.assign(row, updatedData);
        await row.save();
        await recordLog(operator, 'Edit Kas', `ID: ${updatedData.id}`);
        res.json({ status: 'updated' });
    } else {
        res.status(404).json({ error: 'Data tidak ditemukan' });
    }
});

app.post('/delete', async (req, res) => {
    const { id, operator } = req.body;
    const sheet = await getSheet('Kas');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);
    if (row) {
        await row.delete();
        await recordLog(operator, 'Hapus Kas', `ID: ${id}`);
        res.json({ status: 'deleted' });
    } else {
        res.status(404).json({ error: 'Data tidak ditemukan' });
    }
});

// ===== API: WARGA =====
app.get('/warga', async (req, res) => {
    const sheet = await getSheet('Warga');
    const rows = await sheet.getRows();
    res.json(rowsToJSON(rows));
});

app.post('/tambah-warga', async (req, res) => {
    const { operator, ...newData } = req.body;
    const sheet = await getSheet('Warga');
    await sheet.addRow(newData);
    await recordLog(operator, 'Tambah Warga', `${newData.nama} (${newData.nik})`);
    res.json({ status: 'ok' });
});

app.post('/hapus-warga', async (req, res) => {
    const { nik, operator } = req.body;
    const sheet = await getSheet('Warga');
    const rows = await sheet.getRows();
    const row = rows.find(r => String(r.get('nik')) === String(nik));
    if (row) {
        await row.delete();
        await recordLog(operator, 'Hapus Warga', `NIK: ${nik}`);
        res.json({ status: 'deleted' });
    } else {
        res.status(404).json({ error: 'Warga tidak ditemukan' });
    }
});

// ===== API: PENGGUNA =====
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const sheet = await getSheet('Pengguna');
    const rows = await sheet.getRows();
    const users = rowsToJSON(rows);
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ status: 'ok', user: { username: user.username, role: user.role, rt: user.rt } });
    } else {
        res.status(401).json({ error: 'Username atau password salah' });
    }
});

// ===== API: DOWNLOAD =====
app.get('/download-warga', async (req, res) => {
    const rtFilter = req.query.rt ? String(req.query.rt).trim().toUpperCase() : "";
    const sheet = await getSheet('Warga');
    const rows = await sheet.getRows();
    let data = rowsToJSON(rows);

    if (rtFilter && rtFilter !== 'RW') {
        data = data.filter(w => String(w.rt || '').trim().toUpperCase() === rtFilter);
    }

    const newWb = XLSX.utils.book_new();
    const newWs = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(newWb, newWs, 'Data Warga');
    const buffer = XLSX.write(newWb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', `attachment; filename="Data_Warga_${rtFilter.replace(/\s+/g, '_')}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

// ===== API: LOGS =====
app.get('/logs', async (req, res) => {
    const sheet = await getSheet('Log');
    const rows = await sheet.getRows();
    res.json(rowsToJSON(rows).reverse());
});

app.listen(PORT, () => {
    console.log(`🚀 DAWALA Server berjalan di http://localhost:${PORT}/`);
});