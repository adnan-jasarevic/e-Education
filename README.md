# 🎓 eObrazovanje - Full-Stack Web Aplikacija

Sveobuhvatna web platforma za upravljanje školskim procesima, selekciju kandidata za posao i prikupljanje anonimnog feedbacka. Sistem je podijeljen na nezavisne podsisteme i oslanja se na relaciju sa bazom podataka u realnom vremenu.

## 🚀 Tehnološki Stack

- **Frontend:** React.js, Axios
- **Backend:** Node.js (Express.js)
- **Baza podataka:** MySQL v8.0+

---

## 📊 Pregled Modula i Podsistema

1. **Podaci i Ocjene (E-Dnevnik):** Evidencija učenika, predmeta i ocjena sa proračunom prosjeka.
2. **Eksterna Matura:** Prijava učenika na maturske ispite pod jedinstvenim, automatski generisanim anonimnim kodovima.
3. **Konkursi za Posao:** Napredni sistem za selekciju kandidata (Profesor, Asistent, Demonstrator) uz praćenje stanja prijave (`U_OBRADI`, `PRIHVACENA`, `ODBIJENA`).
4. **Anonimne Ankete:** Modul za feedback o radu ustanove sa zaštitom identiteta glasača kroz hash-ovane tokene i podrškom za predugačke komentare (bez lomljenja dizajna).

---

## 💻 Instrukcije za Pokretanje (Lokalno okruženje)

Pratite ove korake kako biste podigli aplikaciju na svom računaru od nule.

### 1. Kloniranje Repozitorija
```bash
git clone [https://github.com/TVOJ_USERNAME/IME_REPOZITORIJA.git](https://github.com/TVOJ_USERNAME/IME_REPOZITORIJA.git)
cd IME_REPOZITORIJA
