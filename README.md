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

### 2. 📦 Sistema Memoria PC (Box con Paginazione a 40 Pokémon & Filtri Rapidi)
- **Paginazione a 40 Pokémon Stile Giochi Originali**:
  - Suddivisione dell'archivio in comodi Box da **massimo 40 Pokémon ciascuno** (Box 1, Box 2, Box 3...), come nei grandi classici della saga.
  - Selettore con pulsanti `< Prec.` e `Succ. >`, indicatori rapidi e pillole per saltare velocemente a qualsiasi Box.
  - Barra di navigazione inferiore per passare al Box successivo subito dopo aver scorso i 40 Pokémon.
  - Perfetta integrazione con i filtri: la ricerca o il filtro per tipo ricalcola le pagine istantaneamente tornando alla prima pagina senza rompere gli indici.
- **Ricerca Istantanea Multi-Parametro**: Cerca per nome, soprannome o `#ID` Pokédex (es. `25` o `#025`).
- **Filtri Rapidi a 1-Tap**:
  - **⭐ Preferiti**: Isola istantaneamente tutti i Pokémon contrassegnati con la stella.
  - **✨ Solo Shiny**: Isola con un tocco tutti i cromatici catturati.
  - **⚡ Pronti a Evolvere**: Filtra i Pokémon che hanno raggiunto il livello richiesto per l'evoluzione.
  - **❤️ Feriti / KO**: Mostra i membri che necessitano di cure prima di partire.
- **Filtro per 18 Tipi Elementali**: Chip con colori e icone per visualizzare solo Pokémon di un elemento.
- **Filtro per 9 Generazioni**: Filtro rapido da Kanto a Paldea.
- **Ordinamento Intelligente a 8 Vie**: Più Recenti, Livello Max, Livello Min, # Pokédex, Alfabetico (A-Z), Statistiche Massime e Valori IV.
- **Selezione Multipla e Rilascio di Massa**: Rilascia più Pokémon contemporaneamente con selezione del Box corrente o di tutti i Box filtrati, con sistemi di protezione per Shiny o Pokémon rari.
- **Gestione Sicura**: Spostamento rapido tra squadra attiva (6 slot) e Box tramite identificativi univoci (`instanceId`), totalmente immune a disallineamenti.

---

### 3. ⚔️ Sistema di Battaglia a Turni & Interfaccia (Regole Competitive)
- **Formula Matematica Ufficiale del Danno**: STAB (Same-Type Attack Bonus), brutti colpi, efficacia di tipo (da 0x a 4x) e varianza casuale (0.85 - 1.00).
- **Interfaccia HUD Avanzata**:
  - Display trasparente con **badge dei tipi elementali** posizionati sotto la barra della salute (supporto nativo ai doppi tipi come Fuoco/Volante, Erba/Veleno, ecc.).
  - **HP Numerici in Tempo Reale** sia per il proprio Pokémon sia per il Pokémon avversario/selvatico.
- **Sistema Audio e Colonna Sonora BGM**:
  - File audio ufficiali integrati direttamente nel progetto (`/public/audio/super_effective.wav` e `public/audio/not_very_effective.wav`) per un feedback sonoro immediato sui colpi.
  - **Player BGM nelle Impostazioni**: Caricamento facoltativo di file MP3/WAV personalizzati per la musica della mappa/esplorazione e della battaglia salvati in `localStorage`.
  - Effetti sonori reattivi per salita di livello, cattura Pokéball, fuga e K.O.
- **Evoluzioni Ramificate e Identità Univoca**:
  - Finestra di scelta interattiva per Pokémon con evoluzioni multiple (es. Eevee, Tyrogue, Slowpoke, Oddish).
  - Gestione tramite `instanceId` univoco: le copie di uno stesso Pokémon evolvono e salgono di livello in modo del tutto indipendente.
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
- **14 Zone Esplorabili con tutti i 1025 Pokémon catturabili**:
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
  11. ✨ **Area Zero Digitale** (Post-Game - Creature Paradossali)
  12. 🌌 **Santuario dei Glitch** (Post-Game - Ultra Creature & Mitici)
  13. 🌑 **Abisso del Codice** (Post-Game - Leggendari Abissali)
  14. 🏆 **Datacenter della Lega** (Sfida Finale)
- **Ciclo Giorno / Tramonto / Notte in Tempo Reale**: Atmosfera visiva dinamica sincronizzata con l'orario reale o simulato.
- **Pokedex Completo**: Consulta `POKEMON_ZONES.md` per la guida completa alla cattura.
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

### 6. ⚙️ Impostazioni, Personalizzazione BGM & Menù Trucchi Avanzato
- **🔑 Menù Trucchi Protetto da PIN (`190693`)**:
  - Accesso riservato al menù sviluppatore tramite codice PIN segreto. In caso di errore, compare il fumetto ironico del Prof. Scordarello.
  - **🎁 Ottieni Pokémon Boss & Speciali**: Nuova funzione per evocare nel Box qualsiasi ricompensa dei 20 Boss Iconici (con IV al 100%, Shiny, mosse speciali ed esclusivi) tutte le volte che si desidera, ideale per recuperare Pokémon trasferiti per sbaglio o collezionarne copie multiple senza bug.
  - Cheat per PokéDollari, Master Ball, Caramelle Rare, Cura Totale, sblocco medaglie e completamento Pokédex.
- **⚡ Animazioni Mosse in Stile GBA (Attivabili / Disattivabili)**:
  - Layer grafico isolato (`BattleFXLayer.tsx`) che riproduce fendenti, proiettili di fuoco/acqua, saette elettriche, bagliori e onde d'urto durante i turni di lotta.
  - Opzione toggle **ATTIVE/DISATTIVE** dedicata nelle Impostazioni.
- **🔄 Sistema di Scambio e Import/Export Pokémon (Compatibile N64 & Pokedesk)**:
  - Generazione di codici stringa Base64 per scambiare o esportare qualsiasi Pokémon.
  - **Riparazione Automatica JSON (JSON Auto-Repair & Fallback Regex)** per scambi sempre stabili.
- **🎵 Lettore BGM Personalizzato**: Caricamento di tracce musicali MP3/WAV personalizzate per l'Overworld e la Lotta.
- **💾 Gestione Salvataggi e Export JSON**: Salvataggio automatico continuo in memoria locale, export/import del file di salvataggio in formato JSON.

---

### 7. ⚡ Modalità Sfide Leggendarie (20 Boss Iconici Post-Lega)
- **Sblocco Post-Lega Pokémon**: Pulsante **`⚡ Boss (Post-Lega)`** nell'Hub centrale, accessibile una volta completata la Lega Pokémon (`leagueVictories > 0`).
- **20 Allenatori Iconici di Tutte le 9 Generazioni**:
  1. ⚡ **Rosso** (*Leggenda del Monte Argento*) → Premio: **Pikachu Cromatico con Volo** (Lvl 70, IV 100%)
  2. 🐉 **Campionessa Camilla** (*La Campionessa Insuperabile di Sinnoh*) → Premio: **Garchomp Titanico** (Lvl 70, IV 100%)
  3. 💎 **Rocco Petri** (*Maestro dell'Acciaio e delle Pietre Rare*) → Premio: **Metagross "Argento"** (Lvl 70, IV 100%)
  4. 🔥 **Domadraghi Lance** (*Campione Supremo dell'Altopiano Blu*) → Premio: **Dragonite con Extrarapido** (Lvl 70, IV 100%)
  5. 👑 **Campione Dandel** (*L'Imbattibile Re di Galar*) → Premio: **Charizard "Gigamax"** (Lvl 70, IV 100%)
  6. 🏆 **Eterno Rivale Blu** (*Il Prodigio di Biancavilla*) → Premio: **Arcanine Imperiale** (Lvl 70, IV 100%)
  7. 🚀 **Capo Giovanni** (*Il Boss Incontrastato del Team Rocket*) → Premio: **Mewtwo "Origine"** (Lvl 70, IV 100%)
  8. 🕊️ **Re N** (*L'Eroe degli Ideali e della Verità*) → Premio: **Zoroark "Ideale"** (Lvl 70, IV 100%)
  9. 🗿 **Baldo** (*Asso del Parco Lotta di Hoenn*) → Premio: **Regigigas Antico** (Lvl 70, IV 100%)
  10. 🦋 **Campione Nardo** (*Il Vagabondo Leggendario di Unima*) → Premio: **Volcarona del Sole** (Lvl 70, IV 100%)
  11. ❄️ **Perla & Eredi di Hisui** (*I Guardiani del Tempo e dello Spazio*) → Premio: **Zoroark di Hisui** (Lvl 70, IV 100%)
  12. ⚙️ **Iridio** (*L'Alleato d'Argento della Fondazione Aether*) → Premio: **Silvally "Iride"** (Lvl 70, IV 100%)
  13. 📜 **Prof. Oak** (*Il Grande Maestro Pokémon*) → Premio: **Tauros del Professore** (Lvl 70, IV 100%)
  14. ⚡ **Campionessa Nemona** (*La Rivelazione di Paldea*) → Premio: **Baxcalibur "Furore"** (Lvl 70, IV 100%)
  15. 🏰 **Asso Palmer** (*Il Re della Torre Lotta*) → Premio: **Heatran del Vulcano** (Lvl 70, IV 100%)
  16. 👻 **Volo** (*Il Mercante della Ginkgo Guild*) → Premio: **Giratina "Origine"** (Lvl 70, IV 100%)
  17. 🌟 **Campionessa Diantea** (*La Campionessa Radiosa di Kalos*) → Premio: **Gardevoir "Aura Nobile"** (Lvl 70, IV 100%)
  18. 🌌 **Leader Cyrus** (*Il Dominatore del Mondo Distorto*) → Premio: **Dialga "Spaziotempo"** (Lvl 70, IV 100%)
  19. 👑 **Signore Ghecis** (*La Tirannia del Team Plasma*) → Premio: **Hydreigon "Tiranno"** (Lvl 70, IV 100%)
  20. 🐺 **Rivale Silver** (*L'Erede delle Ombre di Johto*) → Premio: **Feraligatr "Ribelle"** (Lvl 70, IV 100%)
- **Regole delle Sfide**:
  - **Squadre Lvl 100**: 6 Pokémon al Livello 100 con IV 31/31/31/31/31/31 ed EV competitivi.
  - **Buff Passivo Unico**: Ogni Boss attiva un'abilità passiva di campo (modificatori di danno, velocità o statistiche).
  - **Premi della Prima Vittoria**: PokéDollari ed un Pokémon Speciale Cromatico con IV 100% e mosse esclusive.
  - **Risfide Infinite**: I Boss possono essere affrontati nuovamente in qualsiasi momento.

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
La codebase dispone di una suite di **13 suite di test e 84 test automatizzati** con Vitest:
```bash
npm test
```

### Compilazione per Produzione
```bash
npm run build
```
I file compilati e ottimizzati verranno generati nella cartella `dist/`.

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
