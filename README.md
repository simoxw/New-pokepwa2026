# ⚡ PokePWA - Retro Pokémon Satirical Web RPG

Un'avventura Pokémon completa dal tono ironico, moderno e dissacrante, progettata come **Progressive Web App (PWA)** ottimizzata per smartphone, tablet e desktop. 

Combina la fedeltà delle meccaniche competitive Pokémon ufficiali (formule matematiche di danno, abilità passive, meteo, IV/EV, curve di esperienza, Pokédex Nazionale di 1025 specie) con una narrazione satirica ambientata nel mondo moderno tra lag, social media, intelligenza artificiale e server in fiamme.

---

## 🎮 Caratteristiche Principali del Gioco

### 1. 📖 Pokédex Nazionale Completo (1025 Pokémon)
- **Database Completo di 9 Generazioni**: Da Kanto (Gen 1) a Paldea (Gen 9).
- **Artwork Ufficiale in Alta Definizione**: Visualizzazione di artwork Pokémon Home e Showdown con selettore istantaneo **✨ Shiny / Cromatico**.
- **Riproduzione Verso Audio Originale (*Cry*)**: Ascolta il verso acustico ufficiale di ogni Pokémon direttamente dalla scheda.
- **Scheda Tecnica a 4 Tab**:
  - **Generale**: Descrizione Pokédex in italiano, habitat e zone di cattura del gioco, altezza, peso, categoria, tasso di cattura e abilità speciali.
  - **Statistiche Base & BST**: Barre animate con calcolo del Base Stat Total (BST) e proiezioni dei valori massimi a Livello 50.
  - **Mosse per Livello**: Tabella dettagliata delle mosse apprese salendo di livello (tipo, categoria *Fisico/Speciale/Stato*, potenza, precisione e PP).
  - **Catena Evolutiva Interattiva**: Mappa delle evoluzioni con livelli e pietre necessarie; toccando un'evoluzione si passa direttamente alla sua scheda.
- **🧮 Calcolatore Efficacia Tipi**:
  - *Matrice Difensiva*: Calcola vulnerabilità 4x e 2x, resistenze 0.5x e 0.25x, e immunità 0x per qualsiasi combinazione di tipo singolo o doppio.
  - *Matrice Offensiva*: Mostra istantaneamente l'efficacia di ogni tipo di attacco.
- **🏆 Progressi & Ricompense Pokédex**:
  - Monitoraggio delle percentuali di completamento per ciascuna delle 9 regioni.
  - Riscossione premi nello zaino (Poké Ball speciali, Master Ball, Caramelle Rare, Dollari e titoli onorari).

---

### 2. 📦 Sistema Memoria PC (Box con Ricerca & Filtri Rapidi)
- **Ricerca Istantanea Multi-Parametro**: Cerca per nome, soprannome o `#ID` Pokédex (es. `25` o `#025`).
- **Filtri Rapidi a 1-Tap**:
  - **✨ Solo Shiny**: Isola con un tocco tutti i cromatici catturati.
  - **⚡ Pronti a Evolvere**: Filtra i Pokémon che hanno raggiunto il livello richiesto per l'evoluzione.
  - **❤️ Feriti / KO**: Mostra i membri che necessitano di cure prima di partire.
- **Filtro per 18 Tipi Elementali**: Chip con colori e icone per visualizzare solo Pokémon di un elemento.
- **Filtro per 9 Generazioni**: Filtro rapido da Kanto a Paldea.
- **Ordinamento Intelligente a 6 Vie**: Più Recenti, Livello Max, Livello Min, # Pokédex, Alfabetico (A-Z) e Statistiche Massime.
- **Gestione Sicura**: Spostamento rapido tra squadra attiva (6 slot) e Box tramite identificativi univoci (`instanceId`), immune a disallineamenti da filtri.

---

### 3. ⚔️ Sistema di Battaglia a Turni (Regole Competitive)
- **Formula Matematica Ufficiale del Danno**: STAB (Same-Type Attack Bonus), brutti colpi, efficacia di tipo (da 0x a 4x) e varianza casuale (0.85 - 1.00).
- **Stati Alterati Completi**: Sonno con contatore dinamico di risveglio (1-3 turni), Paralisi con probabilità del 25% di blocco e dimezzamento della Velocità, Bruciatura con danno ricorrente e dimezzamento dell'Attacco fisico, Avvelenamento e Congelamento.
- **Mosse Speciali & Complesse**:
  - Mosse a due turni: *Volo*, *Fossa*, *Solarraggio*.
  - Mosse con ricarica: *Iper Raggio*.
  - Mosse con drain (assorbimento vita) e recoil (contraccolpo).
- **Meteo & Abilità Passive Attive**: Pioggia, Sole Intenso, Tempesta di Sabbia, Grandine; oltre 30 abilità Pokémon native (*Erbaiuto*, *Aiutofuoco*, *Acquaiuto*, *Prepotenza*, *Levitazione*, *Statico*, *Pressione*, ecc.).
- **Genetica & Allenamento**: Valori IV individuali (0-31) e accumulo di EV (Effort Values fino a 252/510).
- **Formula Ufficiale di Fuga**: Calcolo probabilistico basato sui valori di Velocità e sui tentativi effettuati.

---

### 4. 🗺️ Esplorazione, Aree & Ciclo Giorno/Notte
- **10 Zone Esplorabili con 452 Specie Catturabili in Natura**:
  1. 🌲 **Bosco dei Selfie** (Capopalestra *Giovane Pino* → **Medaglia Selfie**)
  2. 🌾 **Prateria del Lag** (Capopalestra *Bullo Luca* → **Medaglia Lag**)
  3. ⚡ **Laboratorio Glitch** (Capopalestra *Scienziato Filippo* → **Medaglia Volt**)
  4. 🌊 **Spiaggia 404** (Capopalestra *Pescatore Gianni* → **Medaglia Nettuno**)
  5. 👻 **Cimitero dei Pixel** (Capopalestra *Ombretta* → **Medaglia Spettro**)
  6. 🌋 **Vulcano Overheat** (Capopalestra *Piromane Leo* → **Medaglia Calore**)
  7. ❄️ **Picco del Buffering** (Capopalestra *Alpinista Marco* → **Medaglia Glaciale**)
  8. 🏛️ **Rovina dei Frame** (Capopalestra *Ombra Silente* → **Medaglia Spettrale**)
  9. 🦗 **Palude del Bug** (Capopalestra *Entomologo Ezio* → **Medaglia Palude**)
  10. 🔌 **Isola del Server** (Capopalestra *Admin Root* → **Medaglia Server**)
- **Ciclo Giorno / Tramonto / Notte in Tempo Reale**: Atmosfera visiva dinamica sincronizzata con l'orario reale o simulato.
- **Torre Lotta (Battle Tower)**: Modalità infinita competitiva con avversari a difficoltà scalare, serie di vittorie e Punti Lotta (PL).
- **Lega Pokémon**: Sfida i leggendari Superquattro e il Campione per entrare nella Sala d'Onore.

---

### 5. 🏛️ Servizi dell'Hub Centrale
- 👨‍🏫 **Laboratorio del Prof. Scordarello**: Giudice IV/EV per valutare il potenziale della squadra e riscuotere ricompense Pokédex.
- 📞 **Sfidofono**: Rigioca istantaneamente le battaglie contro qualsiasi allenatore o Capopalestra per allenare i Pokémon ed accumulare denaro.
- 📜 **Registro Missioni**: Tracciamento di missioni primarie e secondarie con ricompense automatiche.
- 🏪 **Poké Market**: Acquisto e vendita di rimedi, Poké Ball di ogni grado e strumenti evolutivi.
- 🎖️ **Portamedaglie**: Bacheca interattiva con effetti passivi e requisiti delle 10 medaglie ufficiali.

---

## 🚀 Come Avviare il Progetto in Locale

### Prerequisiti
- [Node.js](https://nodejs.org/) (versione 18 o superiore raccomandata)
- `npm` (incluso con Node.js)

### Installazione e Avvio
```bash
# 1. Clona il repository o scarica i file
git clone https://github.com/<tuo-utente>/<tuo-repo>.git
cd <tuo-repo>

# 2. Installa le dipendenze
npm install

# 3. Avvia il server di sviluppo
npm run dev
```
L'applicazione sarà accessibile su `http://localhost:3000`.

### Esecuzione dei Test Automatici
La codebase dispone di una suite di **53 test unitari e di integrazione** con Vitest:
```bash
npm test
```

### Compilazione per Produzione
```bash
npm run build
```
I file compilati e ottimizzati per la distribuzione statica verranno generati nella cartella `dist/`.

---

## 🌐 Deploy su GitHub Pages (Configurazione Automatica)

Il progetto è preconfigurato per il deploy su GitHub Pages:
1. In `vite.config.ts`, il parametro `base: './'` garantisce il caricamento corretto degli asset relativi in qualsiasi sottocartella di GitHub Pages.
2. Il workflow GitHub Actions è configurato in `.github/workflows/deploy.yml`.

### Attivazione in 3 Passi:
1. Effettua il push del codice sul tuo repository GitHub (`git push origin main`).
2. Vai su **Settings > Pages** del tuo repository.
3. Sotto **Build and deployment > Source**, seleziona **GitHub Actions**.

---

## 🛠️ Stack Tecnologico

- **Frontend**: [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/)
- **Bundler & Build Tool**: [Vite](https://vitejs.dev/)
- **Stile & Design**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animazioni**: [Motion](https://motion.dev/)
- **Icone**: [Lucide React](https://lucide.dev/)
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Test Runner**: [Vitest](https://vitest.dev/)
- **Asset & Dati**: [PokéAPI v2](https://pokeapi.co/), [Pokémon Showdown Sprites](https://play.pokemonshowdown.com/)
