const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
}).promise(); 

app.get('/api/ucenici', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, ime, prezime FROM korisnici WHERE uloga = 'UCENIK'");
        res.json(rows);
    } catch (err) { res.status(500).json(err); }
});

app.get('/api/kandidati', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, ime, prezime FROM korisnici WHERE uloga = 'KANDIDAT'");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/konkursi', async (req, res) => {
  try {
    
    const [rezultat] = await db.query('SELECT id, pozicija FROM konkursi');

    res.json(rezultat);

  } catch (err) {
    
    console.error("!!! GREŠKA NA BACKENDU (GET /api/konkursi) !!! ->", err);
    
    res.status(500).json({ 
      error: "Neuspješno preuzimanje konkursa iz baze.", 
      detalji: err.message 
    });
  }
});

app.get('/api/predmeti', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, naziv FROM predmeti");
        res.json(rows);
    } catch (err) { res.status(500).json(err); }
});

app.get('/api/ednevnik/ocjene', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT o.id, k.ime, k.prezime, p.naziv AS predmet, o.vrijednost, o.datum_upisa 
            FROM ocjene o
            JOIN korisnici k ON o.ucenik_id = k.id
            JOIN predmeti p ON o.predmet_id = p.id
        `);
        res.json(rows);
    } catch (err) { res.status(500).json(err); }
});

app.post('/api/ednevnik/ocjene', async (req, res) => {
    const { ucenik_id, predmet_id, vrijednost } = req.body;
    try {
        await db.query('INSERT INTO ocjene (ucenik_id, predmet_id, vrijednost) VALUES (?, ?, ?)', [ucenik_id, predmet_id, vrijednost]);
        res.json({ message: 'Ocjena uspješno upisana u eDnevnik!' });
    } catch (err) { res.status(500).json(err); }
});

app.get('/api/matura/prijave', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, anonimni_kod, osvojeni_bodovi FROM maturske_prijave');
        res.json(rows);
    } catch (err) { res.status(500).json(err); }
});

app.post('/api/matura/prijavi', async (req, res) => {
    const { ucenik_id, ispit_id, anonimni_kod } = req.body;
    try {
        await db.query('INSERT INTO maturske_prijave (ucenik_id, ispit_id, anonimni_kod) VALUES (?, ?, ?)', [ucenik_id, ispit_id, anonimni_kod]);
        res.json({ message: 'Učenik uspješno prijavljen na maturu pod anonimnim kodom!' });
    } catch (err) { res.status(500).json(err); }
});

app.put('/api/matura/ocijeni', async (req, res) => {
    const { anonimni_kod, bodovi } = req.body;
    try {
        await db.query('UPDATE maturske_prijave SET osvojeni_bodovi = ? WHERE anonimni_kod = ?', [bodovi, anonimni_kod]);
        res.json({ message: `Uspješno uneseni bodovi za šifru: ${anonimni_kod}` });
    } catch (err) { res.status(500).json(err); }
});

app.get('/api/konkursi/prijave', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.id, k.ime, k.prezime, kon.pozicija, p.prosjek_ocjena, p.status, p.razlog_odbijanja 
            FROM prijave_na_konkurs p
            JOIN korisnici k ON p.kandidat_id = k.id
            JOIN konkursi kon ON p.konkurs_id = kon.id
        `);
        res.json(rows);
    } catch (err) { res.status(500).json(err); }
});

app.post('/api/konkursi/prijavi', async (req, res) => {
    const { kandidat_id, konkurs_id, prosjek_ocjena } = req.body;
    try {
        await db.query('INSERT INTO prijave_na_konkurs (kandidat_id, konkurs_id, prosjek_ocjena, status) VALUES (?, ?, ?, "POSLANA")', [kandidat_id, konkurs_id, prosjek_ocjena]);
        res.json({ message: 'Prijava na konkurs uspješno poslana!' });
    } catch (err) { res.status(500).json(err); }
});

app.put('/api/konkursi/prijave/:id/status', async (req, res) => {
    const { id } = req.params;
    const { noviStatus, razlog } = req.body;
    try {
        
        let dodatniTekst = "";
        if (noviStatus === 'PRIHVACENA') {
            dodatniTekst = " -> [ENTRY: Generisan ugovor o radu i poslan email]";
        } else if (noviStatus === 'ODBIJENA') {
            await db.query('UPDATE prijave_na_konkurs SET status = ?, razlog_odbijanja = ? WHERE id = ?', [noviStatus, razlog, id]);
            return res.json({ message: `Status promijenjen u ODBIJENA. Razlog: ${razlog}` });
        }

        await db.query('UPDATE prijave_na_konkurs SET status = ? WHERE id = ?', [noviStatus, id]);
        res.json({ message: `Status uspješno promijenjen u ${noviStatus}${dodatniTekst}` });
    } catch (err) { res.status(500).json(err); }
});

app.post('/api/ankete/glasaj', async (req, res) => {
    const { anketa_id, ocjena_skole, komentar } = req.body;
    const anonimni_token = 'TOKEN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    try {
        await db.query('INSERT INTO odgovori_na_ankete (anketa_id, anonimni_token, ocjena_skole, komentar) VALUES (?, ?, ?, ?)', 
        [anketa_id, anonimni_token, ocjena_skole, komentar]);
        res.json({ message: 'Anketa uspješno spašena! Vaš identitet je zaštićen.', token: anonimni_token });
    } catch (err) { 
        res.status(500).json({ error: 'Već ste glasali ili je unesen nevažeći podatak.' }); 
    }
});

app.get('/api/ankete/rezultati', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, ocjena_skole, komentar, anonimni_token FROM odgovori_na_ankete');
        res.json(rows);
    } catch (err) { res.status(500).json(err); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server aktivan na portu ${PORT}`));