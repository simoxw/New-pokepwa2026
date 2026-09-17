# ⚡ PokePWA - Retro Pokémon Satirical Web RPG

Un'avventura in stile Pokémon dal tono ironico e dissacrante, progettata specificamente per dispositivi mobile e browser moderni sotto forma di **Progressive Web App (PWA)**.

---

## 🎮 Caratteristiche Principali

- **Sistema di Battaglia a Turni Completo**:
  - Calcolo accurato di debolezze, resistenze, brutti colpi e precisione.
  - Mosse con effetti di stato (Paralisi, Sonno, Bruciatura, Avvelenamento, Confusione).
  - Meccaniche meteo (Pioggia, Sole, Tempesta di sabbia, Grandine) e abilità speciali.
  - Mosse a due turni (Volo, Fossa, Solarraggio) e ricarica (Iper Raggio).
  - Statistiche competitive: IV genetici individuali e calcolo degli EV in allenamento.
  - Pokémon Cromatici (Shiny) con animazioni stellari.

- **10 Zone Esplorabili & 10 Medaglie Ufficiali**:
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

- **Hub Centrale & Servizi del Villaggio**:
  - 👨‍🏫 **Laboratorio del Prof. Scordarello**: valutazione genetica degli IV/EV della squadra e traguardi premi Pokédex.
  - 📞 **Sfidofono**: rivincita istantanea contro qualsiasi allenatore o Capopalestra precedentemente sconfitto per allenamento e farming di monete.
  - 📜 **Registro Missioni**: missioni selezionabili e attivabili con tracciamento automatico di obiettivi e ricompense (es. Pepite, Caramelle Rare, Master Ball).
  - 🏪 **Poké Market**: acquisto di Poké Ball, Pozioni, Revitalizzanti e strumenti curativi.
  - 📦 **Sistema Box & Squadra**: deposito, ritiro e riorganizzazione fluida fino a 6 Pokémon in squadra e decine nel box PC.
  - 🎖️ **Portamedaglie**: bacheca interattiva con sprite ufficiali e requisiti di sblocco delle aree.
  - 📱 **Supporto PWA Offline**: installabile come app nativa a schermo intero su smartphone iOS e Android.

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

# 3. Avvia il server di sviluppo locale
npm run dev
```
L'applicazione sarà accessibile su `http://localhost:3000` (o sulla porta indicata da Vite).

### Compilazione per Produzione
```bash
npm run build
```
I file pronti per la distribuzione verranno generati nella cartella `dist/`.

---

## 🌐 Deploy su GitHub Pages (Funzionamento e Configurazione)

> **Buona notizia**: La configurazione di Vite è già stata impostata con `base: './'` e il file di workflow per **GitHub Actions** è già incluso (`.github/workflows/deploy.yml`). Non dovrai modificare nulla manualmente a livello di codice!

### Procedura di Attivazione (Consigliata tramite GitHub Actions):

1. Fai il push del progetto sul tuo repository GitHub (es. branch `main`).
2. Vai su GitHub nella pagina del tuo repository.
3. Clicca sulla scheda **Settings** (Impostazioni) in alto a destra.
4. Nel menu laterale sinistro, clicca su **Pages**.
5. Sotto la sezione **Build and deployment**:
   - Accanto a **Source**, seleziona **GitHub Actions** (invece di "Deploy from a branch").
6. Fatto! GitHub avvierà automaticamente il workflow di compilazione. Dopo 1 o 2 minuti, troverai il link pubblico del tuo gioco funzionante (es. `https://<tuo-utente>.github.io/<tuo-repo>/`).

### Perché prima i progetti Vite non funzionavano su GitHub Pages?
Di default, Vite compila con percorsi assoluti (`/assets/...`). Poiché GitHub Pages ospita i repository in una sottocartella (`https://<username>.github.io/<repository-name>/`), il browser cercava i file alla radice del dominio anziché nella cartella del repository, causando schermate bianche o errori 404. 
Con l'aggiunta di `base: './'` in `vite.config.ts`, tutti i percorsi degli asset sono ora relativi e funzionano sia in locale che su qualsiasi sottocartella di GitHub Pages!

---

## 🛠️ Stack Tecnologico

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Stile & Design**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animazioni**: [Motion](https://motion.dev/)
- **Icone**: [Lucide React](https://lucide.dev/)
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Dati & Grafiche**: API ufficiali [PokéAPI](https://pokeapi.co/) e sprite battle da [Pokémon Showdown](https://play.pokemonshowdown.com/)
