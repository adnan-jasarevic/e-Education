import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [aktivniTab, setAktivniTab] = useState('ednevnik');
  const [poruka, setPoruka] = useState('');

  
  const [ocjene, setOcjene] = useState([]);
  const [maturskePrijave, setMaturskePrijave] = useState([]);
  const [konkursnePrijave, setKonkursnePrijave] = useState([]);
  const [anketeRezultati, setAnketeRezultati] = useState([]);
  const [sviUcenici, setSviUcenici] = useState([]);
  const [sviPredmeti, setSviPredmeti] = useState([]);
  const [kandidati, setKandidati] = useState([]);
  const [odabraniKandidatId, setOdabraniKandidatId] = useState('');
  const [prosjekInput, setProsjekInput] = useState('9.21');
  const [odabraniKonkursId, setOdabraniKonkursId] = useState('1');
  const [sviKonkursi, setSviKonkursi] = useState([]);

  const [novaOcjena, setNovaOcjena] = useState({ ucenik_id: 1, predmet_id: 1, vrijednost: 5 });
  const [maturaBodovi, setMaturaBodovi] = useState({ anonimni_kod: '', bodovi: '' });
  const [anketaForm, setAnketaForm] = useState({ ocjena_skole: 5, komentar: '' });

  const prikaziPoruku = (txt) => {
    setPoruka(txt);
    setTimeout(() => setPoruka(''), 4000);
  };

  const ucitajSve = () => {
  axios.get(`${API_BASE}/ednevnik/ocjene`).then(res => setOcjene(res.data));
  axios.get(`${API_BASE}/matura/prijave`).then(res => setMaturskePrijave(res.data));
  axios.get(`${API_BASE}/konkursi/prijave`).then(res => setKonkursnePrijave(res.data));
  axios.get(`${API_BASE}/ankete/rezultati`).then(res => setAnketeRezultati(res.data));
  axios.get(`${API_BASE}/ucenici`).then(res => { setSviUcenici(res.data); if(res.data.length) setNovaOcjena(prev => ({...prev, ucenik_id: res.data[0].id})) });
  axios.get(`${API_BASE}/predmeti`).then(res => { setSviPredmeti(res.data); if(res.data.length) setNovaOcjena(prev => ({...prev, predmet_id: res.data[0].id})) });
  axios.get(`${API_BASE}/kandidati`).then(res => { setKandidati(res.data); if(res.data.length) setOdabraniKandidatId(res.data[0].id); });
  axios.get(`${API_BASE}/konkursi`).then(res => { setSviKonkursi(res.data); if(res.data.length) setOdabraniKonkursId(res.data[0].id); });
};

  useEffect(() => { ucitajSve(); }, []);

  const upisiOcjenu = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/ednevnik/ocjene`, novaOcjena).then(res => {
      prikaziPoruku(res.data.message); ucitajSve();
    });
  };

  const prijaviMaturu = () => {
    const randomKod = 'MAT-' + Math.floor(1000 + Math.random() * 9000);
    axios.post(`${API_BASE}/matura/prijavi`, { ucenik_id: 1, ispit_id: 1, anonimni_kod: randomKod }).then(res => {
      prikaziPoruku(res.data.message + " Vaša šifra je: " + randomKod); ucitajSve();
    });
  };

  const unesiBodoveMature = (e) => {
    e.preventDefault();
    axios.put(`${API_BASE}/matura/ocijeni`, maturaBodovi).then(res => {
      prikaziPoruku(res.data.message); ucitajSve();
    });
  };

  const posaljiKonkursnuPrijavu = () => {
  if (!odabraniKandidatId || !odabraniKonkursId) {
    prikaziPoruku("Molimo izaberite i kandidata i poziciju!");
    return;
  }

  axios.post(`${API_BASE}/konkursi/prijavi`, { 
    kandidat_id: parseInt(odabraniKandidatId),   
    konkurs_id: parseInt(odabraniKonkursId),  
    prosjek_ocjena: parseFloat(prosjekInput)    
  }).then(res => {
    prikaziPoruku(res.data.message); 
    ucitajSve();
  }).catch(err => {
    const tekstGreske = err.response?.data?.error || "Greška na serveru (500)";
    prikaziPoruku("Greška: " + tekstGreske);
    console.error(err);
  });
};

  const promijeniStatusKonkursa = (id, noviStatus) => {
    const razlog = noviStatus === 'ODBIJENA' ? 'Dokumentacija nije potpuna.' : null;
    axios.put(`${API_BASE}/konkursi/prijave/${id}/status`, { noviStatus, razlog }).then(res => {
      prikaziPoruku(res.data.message); ucitajSve();
    });
  };

  const posaljiAnketu = (e) => {
  e.preventDefault();
  axios.post(`${API_BASE}/ankete/glasaj`, { ...anketaForm, anketa_id: 1 })
    .then(res => {
      prikaziPoruku(`${res.data.message} Generisani token: ${res.data.token}`); 
      ucitajSve();
      setAnketaForm({ ocjena_skole: 5, komentar: '' }); // Očisti formu nakon slanja
    })
    .catch(err => {
      const errorMsg = err.response?.data?.error || 'Greška pri spajanju na server!';
      prikaziPoruku('❌ ' + errorMsg);
    });
};

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <header style={{ background: '#2c3e50', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
        <h2>eObrazovanje - Arhitekturni Demo (4 Podsistema)</h2>
        <p>Prezentacijski panel za odbranu projekta</p>
      </header>

      {poruka && <div style={{ background: '#2ecc71', color: 'white', padding: '15px', borderRadius: '5px', marginBottom: '20px', fontWeight: 'bold' }}>{poruka}</div>}

      {/* Navigacioni Tabovi */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        {['ednevnik', 'matura', 'konkursi', 'ankete'].map((tab) => (
          <button key={tab} onClick={() => setAktivniTab(tab)} style={{
            padding: '10px 20px', cursor: 'pointer', background: aktivniTab === tab ? '#3498db' : '#ecf0f1',
            color: aktivniTab === tab ? 'white' : 'black', border: 'none', borderRadius: '5px', fontWeight: 'bold', textTransform: 'uppercase'
          }}>{tab}</button>
        ))}
      </nav>

      {/* TAB 1: eDNEVNIK */}
      {aktivniTab === 'ednevnik' && (
        <div>
          <h3>📚 Podsistem 1: eNastavni plan i eDnevnik</h3>
          <form onSubmit={upisiOcjenu} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
  <label>Učenik: </label>
  <select value={novaOcjena.ucenik_id} onChange={e => setNovaOcjena({...novaOcjena, ucenik_id: e.target.value})} style={{padding: '5px'}}>
    {sviUcenici.map(u => <option key={u.id} value={u.id}>{u.ime} {u.prezime}</option>)}
  </select>

  <label>Predmet: </label>
  <select value={novaOcjena.predmet_id} onChange={e => setNovaOcjena({...novaOcjena, predmet_id: e.target.value})} style={{padding: '5px'}}>
    {sviPredmeti.map(p => <option key={p.id} value={p.id}>{p.naziv}</option>)}
  </select>

  <label>Ocjena: </label>
  <input type="number" min="1" max="5" value={novaOcjena.vrijednost} onChange={e => setNovaOcjena({...novaOcjena, vrijednost: e.target.value})} style={{width: '50px', padding: '5px'}} />

  <button type="submit" style={{background: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px'}}>Upiši u Dnevnik</button>
</form>
          <h4>Trenutne ocjene u sistemu:</h4>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead><tr style={{background: '#eee'}}><th>Učenik</th><th>Predmet</th><th>Ocjena</th><th>Datum upisa</th></tr></thead>
            <tbody>
              {ocjene.map(o => <tr key={o.id}><td>{o.ime} {o.prezime}</td><td>{o.predmet}</td><td style={{fontWeight: 'bold', color: '#e74c3c'}}>{o.vrijednost}</td><td>{new Date(o.datum_upisa).toLocaleDateString()}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: EKSTERNA MATURA */}
      {aktivniTab === 'matura' && (
        <div>
          <h3>✍️ Podsistem 2: Eksterna Matura (Dokaz Anonimnosti)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
              <h4>Učenik panel:</h4>
              <button onClick={prijaviMaturu} style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px' }}>Generiši anonimnu prijavu za ispit</button>
            </div>
            <form onSubmit={unesiBodoveMature} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
              <h4>Profesor panel (Vidi samo šifru):</h4>
              <input type="text" placeholder="Unesi anonimni kod" required value={maturaBodovi.anonimni_kod} onChange={e => setMaturaBodovi({...maturaBodovi, anonimni_kod: e.target.value})} style={{padding: '5px', marginRight: '10px'}} />
              <input type="number" step="0.01" placeholder="Bodovi (0-100)" required value={maturaBodovi.bodovi} onChange={e => setMaturaBodovi({...maturaBodovi, bodovi: e.target.value})} style={{padding: '5px', marginRight: '10px', width: '150px'}} />
              <button type="submit" style={{ background: '#e67e22', color: 'white', border: 'none', padding: '6px 15px', cursor: 'pointer', borderRadius: '4px' }}>Spasi bodove</button>
            </form>
          </div>
          <h4>Prijave na maturu (Pregled za komisiju):</h4>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead><tr style={{background: '#eee'}}><th>ID prijave</th><th>Anonimni Kod (Šifra)</th><th>Osvojeni Bodovi</th></tr></thead>
            <tbody>
              {maturskePrijave.map(mp => <tr key={mp.id}><td>{mp.id}</td><td style={{fontFamily: 'monospace', fontWeight: 'bold'}}>{mp.anonimni_kod}</td><td>{mp.osvojeni_bodovi !== null ? mp.osvojeni_bodovi : 'Nije ocijenjeno'}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: eKONKURSI */}
      {aktivniTab === 'konkursi' && (
    <div>
      <h3>💼 Podsistem 3: eKonkursi (State Machine u praksi)</h3>
      
    
<div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '25px', border: '1px solid #ddd', maxWidth: '400px' }}>
  <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>Pošalji novu prijavu na konkurs:</h4>
  
  
  <div style={{ marginBottom: '12px' }}>
    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Izaberi kandidata:</label>
    <select 
      value={odabraniKandidatId} 
      onChange={(e) => setOdabraniKandidatId(e.target.value)}
      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', color: 'black' }}
    >
      
      <option value="">-- Izaberi kandidata sa liste --</option>
      
      {kandidati.map(kand => (
        <option key={kand.id} value={kand.id}>
          {kand.ime} {kand.prezime} (ID: {kand.id})
        </option>
      ))}
    </select>
  </div>

  
  <div style={{ marginBottom: '12px' }}>
  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Izaberi poziciju (Konkurs):</label>
  <select 
    value={odabraniKonkursId} 
    onChange={(e) => setOdabraniKonkursId(e.target.value)}
    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', color: 'black' }}
  >
    <option value="">-- Izaberi poziciju za prijavu --</option>
    
    
    {sviKonkursi.map(konk => (
      <option key={konk.id} value={konk.id}>
        {konk.pozicija} (ID: {konk.id})
      </option>
    ))}
  </select>
</div>

        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Prosjek ocjena:</label>
          <input 
            type="number" 
            step="0.01"
            min="6.00"
            max="10.00"
            value={prosjekInput} 
            onChange={(e) => setProsjekInput(e.target.value)}
            placeholder="Npr. 9.21"
            style={{ width: '95%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

     
        <button 
          onClick={posaljiKonkursnuPrijavu} 
          style={{ background: '#9b59b6', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', width: '100%', fontWeight: 'bold' }}
        >
          🚀 Pošalji prijavu za selektovanog kandidata
        </button>
      </div>

      <h4>Administracija i upravljanje stanjima prijava:</h4>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{background: '#eee'}}>
            <th>Kandidat</th>
            <th>Pozicija</th>
            <th>Prosjek</th>
            <th>Trenutni Status</th>
            <th>Akcije (Promjena Stanja)</th>
          </tr>
        </thead>
        <tbody>
          {konkursnePrijave.map(kp => (
            <tr key={kp.id}>
              <td>{kp.ime} {kp.prezime}</td>
              <td>{kp.pozicija}</td>
              <td>{kp.prosjek_ocjena}</td>
              <td style={{ fontWeight: 'bold', color: kp.status === 'PRIHVACENA' ? '#2ecc71' : kp.status === 'ODBIJENA' ? '#e74c3c' : '#f1c40f' }}>
                {kp.status} {kp.razlog_odbijanja && `(${kp.razlog_odbijanja})`}
              </td>
              <td>
                <button onClick={() => promijeniStatusKonkursa(kp.id, 'U_OBRADI')} style={{marginRight: '5px', padding: '3px 8px'}}>U Obradu</button>
                <button onClick={() => promijeniStatusKonkursa(kp.id, 'PRIHVACENA')} style={{marginRight: '5px', background: '#2ecc71', color: 'white', border: 'none', padding: '3px 8px', cursor: 'pointer'}}>Prihvati</button>
                <button onClick={() => promijeniStatusKonkursa(kp.id, 'ODBIJENA')} style={{background: '#e74c3c', color: 'white', border: 'none', padding: '3px 8px', cursor: 'pointer'}}>Odbij</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}

      {/* TAB 4: ANKETE */}
      {aktivniTab === "ankete" && (
      <div>
  <h3>📊 Podsistem 4: Anonimne Ankete & Feedback</h3>
  <form onSubmit={posaljiAnketu} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '25px' }}>
    <h4>Popuni anketu o zadovoljstvu školom (Anonimno):</h4>
    <div style={{marginBottom: '10px'}}>
      <label>Ocjena škole (1-5): </label>
      <input type="number" min="1" max="5" value={anketaForm.ocjena_skole} onChange={e => setAnketaForm({...anketaForm, ocjena_skole: e.target.value})} style={{padding: '5px', marginLeft: '10px'}} />
    </div>
    <div style={{marginBottom: '10px'}}>
      <textarea placeholder="Vaš komentar..." value={anketaForm.komentar} onChange={e => setAnketaForm({...anketaForm, komentar: e.target.value})} style={{width: '100%', height: '60px', padding: '5px'}} required></textarea>
    </div>
    <button type="submit" style={{ background: '#1abc9c', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px' }}>Pošalji odgovor</button>
  </form>

  <h4>Rezultati ankete (Baza ne čuva podatke o korisniku):</h4>
  
  <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
    <thead>
      <tr style={{background: '#eee'}}>
        <th style={{ width: '40%' }}>Anonimni Token Glasača</th>
        <th style={{ width: '20%' }}>Ocjena ustanove</th>
        <th style={{ width: '40%' }}>Komentar</th>
      </tr>
    </thead>
    <tbody>
      {anketeRezultati.map(ar => (
        <tr key={ar.id}>
          <td style={{ fontFamily: 'monospace', color: '#7f8c8d', wordBreak: 'break-all', fontSize: '13px' }}>
            {ar.anonimni_token}
          </td>
          
          <td style={{ fontWeight: 'bold', textAlign: 'center' }}>
            {ar.ocjena_skole} / 5
          </td>
          
          <td style={{ 
            whiteSpace: 'normal', 
            wordBreak: 'break-word', 
            fontSize: '13px', 
            color: '#ffffff' 
          }}>
            {ar.komentar}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
)}
    </div>
  );
}

export default App;