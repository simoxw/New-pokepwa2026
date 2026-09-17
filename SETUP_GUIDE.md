# 🛠️ PokePWA: Guida all'Installazione, Sviluppo e Deploy

Questa guida passo-passo illustra come configurare l'ambiente di sviluppo in locale, testare l'applicazione, compilarla per la produzione e pubblicarla online tramite **GitHub Pages** con funzionalità **Progressive Web App (PWA)** attiva.

---

## 💻 1. Sviluppo Locale (VS Code / Terminale)

### Prerequisiti
1. **Node.js**: versione 18.0.0 o successiva (raccomandata versione 20 LTS o 22). Verifica la tua versione con:
   ```bash
   node -v
   ```
2. **npm**: versione 9 o superiore (inclusa con Node.js).
3. **Git**: installato per clonare il repository.

### Installazione dei Pacchetti
Apri il terminale nella cartella del progetto ed esegui:
```bash
npm install
```
Questo installerà tutte le librerie del progetto (`react`, `react-dom`, `motion`, `lucide-react`, `vite`, `vite-plugin-pwa`, `vitest`, `tailwindcss`, ecc.).

### Avvio del Server di Sviluppo
```bash
npm run dev
```
Il server locale si avvierà su `http://localhost:3000` (o sulla porta visualizzata nel terminale). Apri il browser a quell'indirizzo per interagire con l'applicazione.

---

## 🧪 2. Esecuzione dei Test Automatici

La codebase include una suite di test unitari con **Vitest** che verifica:
- Il calcolo matematico del danno ufficiale (STAB, colpi critici, debolezze, resistenze).
- Le formule di calcolo delle statistiche e curve XP per l'aumento di livello.
- Gli stati alterati (Sonno, Paralisi, Bruciatura, Avvelenamento).
- Le mosse a più turni (Volo, Fossa, Solarraggio, Iper Raggio).
- Le abilità passive e il meteo.

Per eseguire l'intera suite di 53 test:
```bash
npm test
```

Per eseguire il linter di controllo tipi TypeScript:
```bash
npm run lint
```

---

## 🏗️ 3. Compilazione per la Produzione

Per generare i file statici ottimizzati e minificati per il rilascio:
```bash
npm run build
```
I file pronti per il web verranno generati nella cartella `/dist`, includendo:
- `index.html` compilato.
- Bundle JavaScript e CSS ottimizzati e divisi per chunk.
- Service Worker generato da `vite-plugin-pwa` per la navigazione e caching offline.
- Manifest PWA con icone ad alta risoluzione.

Per visualizzare in anteprima locale la build di produzione:
```bash
npm run preview
```

---

## 🌐 4. Deploy Automatico su GitHub Pages

Il repository include già la configurazione per pubblicare automaticamente il gioco su **GitHub Pages** tramite **GitHub Actions**:
- `vite.config.ts` ha impostato `base: './'`, consentendo all'applicazione di funzionare correttamente in qualsiasi sottocartella di GitHub Pages (es. `https://<tuo-utente>.github.io/<tuo-repo>/`).
- Il workflow `.github/workflows/deploy.yml` gestisce compilazione e deploy automatico a ogni push su `main`.

### Istruzioni di Attivazione su GitHub:

1. **Invia il codice al repository GitHub**:
   ```bash
   git add .
   git commit -m "Aggiornamento PokePWA con Pokédex Completo e Box avanzato"
   git push origin main
   ```

2. **Abilita GitHub Pages**:
   - Apri il tuo repository su [GitHub.com](https://github.com).
   - Clicca sulla scheda **Settings** (in alto a destra).
   - Nel menu laterale di sinistra, seleziona **Pages**.
   - Sotto **Build and deployment**:
     - Accanto a **Source**, seleziona **GitHub Actions** dal menu a tendina.

3. **Verifica il Deploy**:
   - Clicca sulla scheda **Actions** del repository per seguire l'avanzamento del workflow.
   - Al termine (circa 1-2 minuti), GitHub Pages mostrerà l'indirizzo pubblico del tuo gioco online!

---

## 📱 5. Installazione come PWA (Progressive Web App)

PokePWA può essere installata come applicazione nativa a schermo intero su qualsiasi dispositivo:

### Su Smartphone Android (Chrome / Edge):
1. Visita l'URL del gioco.
2. Comparirà in basso il banner o il pulsante verde **"Installa PokePWA"**.
3. In alternativa, tocca i tre puntini in alto a destra nel browser e seleziona **"Aggiungi a schermata Home"** o **"Installa app"**.
4. L'icona del gioco apparirà tra le app del tuo telefono, con supporto a schermo intero e orientamento responsive.

### Su iPhone / iPad (Safari):
1. Visita l'URL del gioco tramite Safari.
2. Tocca l'icona di **Condivisione** (il quadrato con la freccia rivolta verso l'alto nella barra inferiore).
3. Scorri verso il basso e tocca **"Aggiungi alla schermata Home"**.
4. Tocca **Aggiungi** in alto a destra.

### Su PC / Mac (Chrome / Brave / Edge):
1. Visita l'URL del gioco.
2. Clicca sull'icona di installazione nella barra degli indirizzi del browser (a destra dell'URL).
3. L'app si aprirà in una finestra dedicata senza le barre degli strumenti del browser.
