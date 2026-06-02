SET NAMES 'utf8mb4';

DROP DATABASE IF EXISTS eobrazovanje_demo;
CREATE DATABASE eobrazovanje_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eobrazovanje_demo;

CREATE TABLE korisnici (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ime VARCHAR(50),
    prezime VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    lozinka VARCHAR(255),
    uloga ENUM('UCENIK', 'PROFESOR', 'KANDIDAT')
);

CREATE TABLE predmeti ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    naziv VARCHAR(100) 
);

CREATE TABLE konkursi ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    pozicija VARCHAR(200), 
    opis TEXT 
);

CREATE TABLE maturski_ispiti ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    naziv_predmeta VARCHAR(100), 
    skolska_godina VARCHAR(20) 
);

CREATE TABLE ankete ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    naslov VARCHAR(200), 
    aktivna BOOLEAN 
);

CREATE TABLE ocjene (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ucenik_id INT,
    predmet_id INT,
    vrijednost INT,
    datum_upisa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ucenik_id) REFERENCES korisnici(id) ON DELETE CASCADE,
    FOREIGN KEY (predmet_id) REFERENCES predmeti(id) ON DELETE CASCADE
);

CREATE TABLE maturske_prijave (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ucenik_id INT,
    ispit_id INT,
    anonimni_kod VARCHAR(50) UNIQUE,
    osvojeni_bodovi DECIMAL(5,2) NULL,
    FOREIGN KEY (ucenik_id) REFERENCES korisnici(id),
    FOREIGN KEY (ispit_id) REFERENCES maturski_ispiti(id)
);

CREATE TABLE prijave_na_konkurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kandidat_id INT,
    konkurs_id INT,
    prosjek_ocjena DECIMAL(4,2),
    status VARCHAR(50),
    razlog_odbijanja TEXT NULL,
    FOREIGN KEY (kandidat_id) REFERENCES korisnici(id),
    FOREIGN KEY (konkurs_id) REFERENCES konkursi(id)
);

CREATE TABLE odgovori_na_ankete (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anketa_id INT,
    anonimni_token VARCHAR(50) UNIQUE,
    ocjena_skole INT,
    komentar TEXT,
    FOREIGN KEY (anketa_id) REFERENCES ankete(id)
);

INSERT INTO korisnici (id, ime, prezime, email, lozinka, uloga) VALUES 
(1, 'Amar', 'Amarić', 'amar@skola.ba', '123456', 'UCENIK'),
(2, 'Haris', 'Harisić', 'haris@skola.ba', '123456', 'UCENIK'),
(3, 'Nejra', 'Nejrić', 'nejra@skola.ba', '123456', 'UCENIK'),
(4, 'Tarik', 'Tarić', 'tarik@skola.ba', '123456', 'UCENIK'),
(5, 'Lejla', 'Lejlić', 'lejla@skola.ba', '123456', 'UCENIK'),
(6, 'Nedim', 'Nedimić', 'nedim@skola.ba', '123456', 'PROFESOR'),
(7, 'Jasmina', 'Jasminić', 'jasmina@skola.ba', '123456', 'PROFESOR'),
(8, 'Amina', 'Aminić', 'amina@posao.ba', '123456', 'KANDIDAT'),
(9, 'Belma', 'Belmić', 'belma@posao.ba', '123456', 'KANDIDAT'),
(10, 'Denis', 'Denisić', 'denis@posao.ba', '123456', 'KANDIDAT');

INSERT INTO predmeti (id, naziv) VALUES 
(1, 'Matematika'), 
(2, 'Programiranje'), 
(3, 'Baze Podataka');

INSERT INTO konkursi (id, pozicija, opis) VALUES 
(1, 'Profesor Softverskog Inženjerstva', 'Traži se profesor za glavne stručne predmete...'),
(2, 'Asistent na Računarskim Mrežama', 'Rad u laboratoriju za računarske mreže...'),
(3, 'Demonstrator na Programiranju', 'Pomoć studentima prve godine na vježbama...');

INSERT INTO maturski_ispiti (id, naziv_predmeta, skolska_godina) VALUES (1, 'Eksterna Matura - Matematika', '2025/2026');
INSERT INTO ankete (id, naslov, aktivna) VALUES (1, 'Anketa za 2026. godinu', TRUE);
