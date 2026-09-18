# 📂 PokePWA: Struttura Dettagliata del Progetto

Questa guida documenta la suddivisione modulare dell'architettura di **PokePWA**, specificando il ruolo e le responsabilità di ciascun file sorgente.

---

## 🌳 Albero dei File di Progetto

```
poke-pwa/
├── public/                     # Asset statici (icone PWA, manifest, suoni)
├── src/
│   ├── assets/                 # Immagini, loghi e icone dell'applet
│   ├── components/             # Componenti UI e Schermate di Gioco
│   │   ├── battle/             # Sottocomponenti dedicati alla schermata di lotta
│   │   │   ├── BattleBag.tsx
│   │   │   ├── BattleControls.tsx
│   │   │   ├── BattleHUD.tsx
│   │   │   └── PostBattleScreen.tsx
│   │   ├── pokedex/            # Modali e utility visive del Pokédex Nazionale
│   │   │   ├── pokedexConstants.ts
│   │   │   ├── PokedexDetailModal.tsx
│   │   │   ├── PokedexProgressModal.tsx
│   │   │   └── PokedexTypeCalculatorModal.tsx
│   │   ├── BadgeCase.tsx
│   │   ├── BattleScreen.tsx
│   │   ├── BattleTower.tsx
│   │   ├── Box.tsx
│   │   ├── CatchOverlay.tsx
│   │   ├── DialogueOverlay.tsx
│   │   ├── EvolutionOverlay.tsx
│   │   ├── Hub.tsx
│   │   ├── Inventory.tsx
│   │   ├── Layout.tsx
│   │   ├── LeagueHub.tsx
│   │   ├── LocalBattle.tsx
│   │   ├── MoveLearningOverlay.tsx
│   │   ├── PlayerProfile.tsx
│   │   ├── Pokedex.tsx
│   │   ├── PokemonDetails.tsx
│   │   ├── PWAInstallButton.tsx
│   │   ├── QuestLog.tsx
│   │   ├── Settings.tsx
│   │   ├── Sfidofono.tsx
│   │   ├── Shop.tsx
│   │   ├── StarterSelection.tsx
│   │   ├── Team.tsx
│   │   ├── Trade.tsx
│   │   └── ZoneExplorer.tsx
│   ├── constants/              # Dati costanti e configurazioni del gioco
│   │   ├── game.ts
│   │   └── sprites.ts
│   ├── contexts/               # Stato globale reattivo e persistenza
│   │   └── GameContext.tsx
│   ├── data/                   # Database statici e fallback offline
│   │   ├── events.ts
│   │   ├── movesData.ts
│   │   ├── pokemonFallbacks.ts
│   │   └── trainers.ts
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useDayNight.ts
│   │   └── usePWAInstall.ts
│   ├── lib/                    # Logica di business pura, matematica e servizi
│   │   ├── battle/             # Motore matematico e regole di lotta competitive
│   │   │   ├── abilities.ts
│   │   │   ├── battleMath.ts
│   │   │   ├── escapeFormula.ts
│   │   │   ├── items.ts
│   │   │   ├── statModifiers.ts
│   │   │   ├── statusEffects.ts
│   │   │   ├── turnOrder.ts
│   │   │   └── typeChart.ts
│   │   ├── badges.ts
│   │   ├── battleTower.ts
│   │   ├── dayNight.ts
│   │   ├── evolution.ts        # Gestione evoluzioni regolari e ramificate (con scelta interattiva)
│   │   ├── leveling.ts
│   │   ├── pokeapi.ts
│   │   ├── pokedexService.ts
│   │   ├── pokemonHeal.ts
│   │   ├── sound.ts            # Motore audio, gestione brani BGM (esplorazione/lotta) e file WAV
│   │   └── utils.ts
│   ├── tests/                  # Suite di test automatizzati (Vitest)
│   │   ├── battleAdvancedMechanics.test.ts
│   │   ├── battleSystemComplete.test.ts
│   │   ├── battle.test.ts
│   │   ├── leveling.test.ts
│   │   ├── multiTurnMoves.test.ts
│   │   └── status.test.ts
│   ├── types/                  # Definizioni dei tipi TypeScript del gioco
│   │   └── game.ts
│   ├── App.tsx                 # Router principale e commutatore schermate
│   ├── index.css               # Stili globali Tailwind CSS v4
│   └── main.tsx                # Entry point di React con GameProvider
├── .github/workflows/          # CI/CD per il deploy su GitHub Pages
├── package.json                # Dipendenze e script npm
├── tsconfig.json               # Configurazione TypeScript
└── vite.config.ts              # Configurazione del bundler Vite e PWA
```

---

## 🧩 Dettaglio dei Componenti UI (`/src/components/`)

### Schermate Principali
- **`App.tsx`**: Controlla lo stato di navigazione `currentScreen` ('game', 'hub', 'battle', 'pokedex', 'box', 'team', 'inventory', 'shop', 'badges', 'quests', 'sfidofono', 'tower', 'league', 'settings', 'trade', 'profile') gestendo le transizioni fluide e i modali sovrapposti.
- **`Hub.tsx`**: La piazza centrale del villaggio satirico. Permette l'accesso a Centro Pokémon, Poké Market, Esplorazione Zone, Pokédex, Sistema Box, Torre Lotta, Lega Pokémon e Sfidofono.
- **`BattleScreen.tsx`**: Il cuore dell'orchestrazione delle battaglie. Coordina le animazioni di attacco, i turni, le abilità attivate, i cambi di Pokémon, il meteo, l'uso degli strumenti e la logica di fine scontro.
- **`Pokedex.tsx`**: Interfaccia del Pokédex Nazionale (1025 specie). Supporta ricerca testuale istantanea, paginazione ottimizzata per dispositivi mobili, filtri per generazione (Gen 1-9), e filtri di stato (Catturati, Visti, Da Scoprire).
- **`Box.tsx`**: Sistema Memoria PC evoluto per la gestione dei Pokémon archiviati. Include filtri rapidi per Pokémon Shiny ✨, pronti all'evoluzione ⚡, feriti/KO ❤️, filtri per i 18 tipi elementali, 9 generazioni e 6 modalità di ordinamento.
- **`Team.tsx`**: Interfaccia di gestione della squadra attiva (max 6 Pokémon). Permette di riordinare i membri, ispezionare le statistiche e applicare strumenti.
- **`ZoneExplorer.tsx`**: Mappa di navigazione delle 10 aree del gioco con rendering dell'erba alta per incontri casuali, incontri con allenatori dell'area e sfida finale contro il Capopalestra.
- **`BattleTower.tsx`**: La Torre Lotta. Modalità sfida competitiva con scaling automatico del livello dei Pokémon avversari, calcolo della serie di vittorie e negozio ricompense in Punti Lotta (PL).
- **`LeagueHub.tsx`**: La Lega Pokémon con l'accesso sequenziale alle sfide contro i Superquattro e il Campione finale.
- **`Sfidofono.tsx`**: Menu delle rivincite. Consente di ricombattere in qualsiasi momento contro allenatori o Capipalestra precedentemente sconfitti.
- **`QuestLog.tsx`**: Registro missioni con schede dettagliate (obiettivi, ricompense e stato) e possibilità di riscuotere monete o strumenti rari.
- **`BadgeCase.tsx`**: Bacheca delle 10 medaglie con grafica personalizzata e spiegazione dei poteri passivi sbloccati.
- **`Inventory.tsx`**: Zaino del giocatore organizzato in categorie (Rimedi, Poké Ball, Strumenti Base, Pietre Evolutive).
- **`Shop.tsx`**: Negozio per l'acquisto e la vendita di oggetti utili all'avventura.
- **`Trade.tsx`**: Sistema di scambio per importare o scambiare Pokémon con stringhe di codice serializzate.
- **`PlayerProfile.tsx`**: Profilo dell'allenatore con tempo di gioco, ID allenatore, soldi, vittorie e statistiche.
- **`StarterSelection.tsx`**: Scena introduttiva con il Professor Scordarello per la scelta del Pokémon iniziale.
- **`Settings.tsx`**: Menu delle preferenze (audio, player brani BGM per esplorazione e lotte, velocità testo, backup salvataggio e reset).

### Sottocomponenti di Lotta (`/src/components/battle/`)
- **`BattleHUD.tsx`**: Barre dei PS dinamiche con valore numerico reale (es. `48 / 48 HP`) sia per il giocatore che per l'avversario, colore in base alla percentuale residua, badge dei tipi sotto la barra HP, targhetta di livello, chip dello stato alterato (SLP, PAR, BRN, PSN, FRZ) e meteo attivo.
- **`BattleControls.tsx`**: Pannello di comando con i 4 tasti principali: *Lotta* (con selezione delle 4 mosse e visualizzazione di tipo/PP), *Zaino*, *Pokémon* e *Fuga*.
- **`BattleBag.tsx`**: Menu rapido degli strumenti utilizzabili durante la lotta (Pozioni, Cura Totale e Poké Ball).
- **`PostBattleScreen.tsx`**: Schermata riassuntiva post-vittoria con barre progressive di avanzamento XP, punti EV assegnati, salite di livello e premi in denaro.

### Sottocomponenti Pokédex (`/src/components/pokedex/`)
- **`PokedexDetailModal.tsx`**: Scheda approfondita del singolo Pokémon con artwork ufficiale HD, selettore Shiny ✨, verso audio Cry originale, tab Generale, Statistiche Base/BST, Mosse apprese per livello e catena evolutiva cliccabile.
- **`PokedexTypeCalculatorModal.tsx`**: Calcolatore di efficacia interattivo con matrice difensiva (4x, 2x, resistenze, immunità) per singoli e doppi tipi, e matrice offensiva.
- **`PokedexProgressModal.tsx`**: Quadro riassuntivo dei progressi per ciascuna regione e riscossione delle ricompense del Prof. Scordarello.
- **`pokedexConstants.ts`**: Dizionari dei 18 tipi elementali con colori Tailwind, icone grafiche, e dati delle 9 generazioni (range di ID e bandiere).

### Overlay e Dialoghi
- **`CatchOverlay.tsx`**: Animazione della Poké Ball che oscilla da 1 a 3 volte con stelle di cattura avvenuta o rottura della sfera.
- **`EvolutionOverlay.tsx`**: Sequenza animata di evoluzione del Pokémon con grafica luminosa e aggiornamento statistiche.
- **`MoveLearningOverlay.tsx`**: Interfaccia per decidere se dimenticare una delle 4 mosse attuali per imparare una nuova mossa.
- **`DialogueOverlay.tsx`**: Box di testo animato per le conversazioni satiriche con i PNG della storia.

---

## ⚙️ Logica Core e Servizi (`/src/lib/`)

### Motore di Lotta (`/src/lib/battle/`)
- **`battleMath.ts`**: Calcolo del danno secondo la formula ufficiale Pokémon, tenendo conto di Livello, Statistiche Attaccante/Difensore, Potenza mossa, STAB (1.5x), colpi critici (1.5x), fattore di casualità (0.85-1.00), e interazioni di tipo.
- **`abilities.ts`**: Implementazione di oltre 30 abilità passive (es. *Erbaiuto*, *Aiutofuoco*, *Acquaiuto*, *Prepotenza*, *Levitazione*, *Statico*, *Pressione*, *Corpo di Fuoco*, *Sincronismo*, ecc.).
- **`statusEffects.ts`**: Gestione del ciclo di vita degli stati alterati (calcolo del danno ricorrente a fine turno, sveglia dal sonno con contatore 1-3 turni, blocco paralisi al 25%, scongelamento).
- **`statModifiers.ts`**: Gestione delle variazioni di livello delle statistiche in lotta (da -6 a +6 turn-based) e moltiplicatori percentuali.
- **`turnOrder.ts`**: Algoritmo di ordinamento delle mosse per priorità e velocità dei Pokémon.
- **`typeChart.ts`**: Matrice bidimensionale completa dell'efficacia elementale Pokémon (18 tipi con calcolo dei doppi tipi difensivi).
- **`escapeFormula.ts`**: Formula ufficiale di successo della fuga basata sul rapporto di velocità e tentativi effettuati.
- **`items.ts`**: Logica di calcolo del tasso di cattura delle Poké Ball (inclusi modificatori HP, status e ball multiplier) e uso degli oggetti di cura.

### Servizi e Utility del Gioco
- **`pokedexService.ts`**: Servizio per il recupero dei dati completi dei 1025 Pokémon tramite PokéAPI, con fallback integrato e supporto ai versi audio ufficiali.
- **`pokeapi.ts`**: Client HTTP con cache integrata per dettagli Pokémon, mosse, sprite e traduzioni in italiano.
- **`leveling.ts`**: Curve di crescita dell'esperienza ufficiali (Medium Fast, Medium Slow, Fast, Slow), calcolo XP guadagnati da avversari e assegnazione EV.
- **`evolution.ts`**: Verifiche per l'evoluzione automatica al raggiungimento del livello richiesto o tramite pietra evolutiva.
- **`battleTower.ts`**: Generatore procedurale di team avversari competitivi per la Torre Lotta, gestione streak e bilanciamento.
- **`badges.ts`**: Database e verifiche dei requisiti per lo sblocco delle 10 medaglie e dei relativi vantaggi di gioco.
- **`pokemonHeal.ts`**: Funzione per ripristinare completamente PS, PP e rimuovere gli stati alterati di tutta la squadra.
- **`dayNight.ts`**: Calcolatore delle fasce orarie (Giorno, Tramonto, Notte) per la modulazione grafica e gli incontri.

---

## 💾 Gestione dello Stato Globale (`/src/contexts/GameContext.tsx`)

`GameContext.tsx` gestisce l'intero stato del giocatore salvato automaticamente in `localStorage`:
- **Dati Giocatore**: Nome, soldi, medaglie ottenute, oggetti nell'inventario.
- **Squadra & Box**: Pokémon attivi (fino a 6) e Pokémon archiviati nel PC.
- **Pokédex**: Tracciamento univoco di ogni specie vista (`seen`) o catturata (`caught`).
- **Missioni**: Stato di attivazione, completamento e riscossione delle missioni.
- **Impostazioni**: Opzioni audio, velocità di gioco e flag narrativi.
