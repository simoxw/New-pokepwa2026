# 📂 PokePWA: Struttura Dettagliata del Progetto

Questa guida documenta la suddivisione modulare dell'architettura di **PokePWA**, specificando il ruolo e le responsabilità di ciascun file sorgente.

---

## 🌳 Albero Completo dei File di Progetto

```
poke-pwa/
├── public/                     # Asset statici (icone PWA, manifest, suoni WAV ufficiali)
├── src/
│   ├── assets/                 # Immagini, loghi, audio e icone dell'applet
│   │   ├── audio/              # File WAV nativi per colpi superefficaci e non molto efficaci
│   │   │   ├── not_very_effective.wav
│   │   │   └── super_effective.wav
│   │   ├── audioData.ts        # Helper e costanti audio
│   │   └── images/             # Loghi e icone dell'applet
│   ├── components/             # Componenti UI e Schermate di Gioco
│   │   ├── battle/             # Sottocomponenti dedicati alla schermata di lotta
│   │   │   ├── BattleBag.tsx
│   │   │   ├── BattleControls.tsx
│   │   │   ├── BattleHUD.tsx
│   │   │   ├── MoveInfoModal.tsx
│   │   │   └── PostBattleScreen.tsx
│   │   ├── pokedex/            # Modali e utility visive del Pokédex Nazionale
│   │   │   ├── pokedexConstants.ts
│   │   │   ├── PokedexDetailModal.tsx
│   │   │   ├── PokedexProgressModal.tsx
│   │   │   └── PokedexTypeCalculatorModal.tsx
│   │   ├── BadgeCase.tsx
│   │   ├── BattleFXLayer.tsx   # Layer effetti grafici mosse stile GBA (disattivabile da impostazioni)
│   │   ├── BattleScreen.tsx
│   │   ├── BattleTower.tsx
│   │   ├── BossBattles.tsx     # Schermata di selezione e avvio sfide Boss Iconici post-lega
│   │   ├── BossRewardsCheatModal.tsx # Modale Trucchi: generazione ed evocazione Pokémon speciali/Boss nel Box
│   │   ├── Box.tsx             # PC di Bill con suddivisione a pagine di 40 Pokémon stile giochi originali
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
│   │   ├── Settings.tsx        # Impostazioni, player BGM personalizzato e menu trucchi con PIN
│   │   ├── Sfidofono.tsx
│   │   ├── Shop.tsx
│   │   ├── StarterSelection.tsx
│   │   ├── Team.tsx
│   │   ├── TMSelectionModal.tsx # Modale per l'insegnamento di MT e mosse compatibili
│   │   ├── Trade.tsx
│   │   └── ZoneExplorer.tsx
│   ├── constants/              # Dati costanti e configurazioni del gioco
│   │   ├── game.ts             # Zone, tabelle di incontro selvatici e allenatori
│   │   └── sprites.ts          # Repository di sprite PNG/GIF e avatar
│   ├── contexts/               # Stato globale reattivo e persistenza
│   │   └── GameContext.tsx
│   ├── data/                   # Database statici e fallback offline
│   │   ├── events.ts           # Eventi speciali e dialoghi
│   │   ├── legendaryBosses.ts  # Database dei 20 Boss Leggendari Iconici (buff, team Lvl 100 e premi Shiny)
│   │   ├── movesData.ts        # Database completo di centinaia di mosse con alias e traduzioni in italiano
│   │   ├── pokemonFallbacks.ts # Dati offline di emergenza per specie, statistiche e mosse
│   │   ├── pokemonSpeciesMap.ts # Mappatura rapida ID/specie
│   │   └── trainers.ts         # Allenatori, capipalestra e Superquattro
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useDayNight.ts      # Rilevamento ciclo giorno/tramonto/notte
│   │   └── usePWAInstall.ts    # Gestione prompt installazione PWA
│   ├── lib/                    # Logica di business pura, matematica e servizi
│   │   ├── battle/             # Motore matematico e regole di lotta competitive
│   │   │   ├── abilities.ts    # Abilità passive competitive
│   │   │   ├── battleActionRunner.ts # Esecuzione sequenziale delle azioni di turno
│   │   │   ├── battleAi.ts     # Intelligenza artificiale per selezione mosse avversari
│   │   │   ├── battleMath.ts   # Formula ufficiale del danno, colpi critici, STAB
│   │   │   ├── escapeFormula.ts # Formula ufficiale di fuga
│   │   │   ├── hazards.ts      # Trappole d'ingresso (Levitoroccia, Punte, ecc.)
│   │   │   ├── items.ts        # Calcolo tasso cattura Poké Ball e strumenti curativi
│   │   │   ├── statModifiers.ts # Stadi di statistiche (-6 a +6)
│   │   │   ├── statusEffects.ts # Stati alterati (sonno, paralisi, scottatura, veleno, congelamento)
│   │   │   ├── turnOrder.ts    # Priorità mosse e calcolo ordine di turno
│   │   │   └── typeChart.ts    # Matrice efficacia dei 18 tipi
│   │   ├── badges.ts           # Sblocco sequenziale delle 10 medaglie e delle aree
│   │   ├── battleTower.ts      # Generazione avversari e ricompense Torre Lotta
│   │   ├── dayNight.ts         # Utility orarie per il ciclo giorno/notte
│   │   ├── evolution.ts        # Evoluzioni automatiche e ramificate interattive
│   │   ├── leveling.ts         # Curve di esperienza, calcolo salita di livello ed EV
│   │   ├── pokeapi.ts          # Client PokéAPI con cache in memoria e LocalStorage
│   │   ├── pokedexService.ts   # Indice dei 1025 Pokémon e dettagli di specie
│   │   ├── pokemonHeal.ts      # Funzione di cura completa (Centro Pokémon)
│   │   ├── sound.ts            # Motore sonoro, gestione WAV, SFX e BGM personalizzati
│   │   ├── storage.ts          # Driver di persistenza IndexedDB e LocalStorage
│   │   └── utils.ts            # Normalizzazione Pokémon, serializzazione scambi e riparazione JSON
│   ├── tests/                  # Suite di test automatizzati (Vitest)
│   │   ├── allTrainersAndBossesAudit.test.ts # Audit completo di integrità Pokémon e mosse Boss/Trainer
│   │   ├── battleAdvancedMechanics.test.ts
│   │   ├── battleSystemComplete.test.ts
│   │   ├── battle.test.ts
│   │   ├── bossRewardsCheat.test.ts # Test di generazione Pokémon speciali del menù trucchi
│   │   ├── boxPagination.test.ts    # Test logica paginazione 40 Pokémon per pagina Box
│   │   ├── curaTotale.test.ts
│   │   ├── importPokemon.test.ts
│   │   ├── leveling.test.ts
│   │   ├── multiTurnMoves.test.ts
│   │   ├── selfStatChanges.test.ts
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
- **`Hub.tsx`**: La piazza centrale del villaggio satirico. Permette l'accesso a Centro Pokémon, Poké Market, Esplorazione Zone, Pokédex, Sistema Box, Torre Lotta, Lega Pokémon, Sfide Boss Post-Lega e Sfidofono.
- **`BattleScreen.tsx`**: Il cuore dell'orchestrazione delle battaglie. Coordina le animazioni di attacco, i turni, le abilità attivate, i cambi di Pokémon, il meteo, l'uso degli strumenti, i buff esclusivi dei Boss e la logica di fine scontro.
- **`BattleFXLayer.tsx`**: Layer grafico trasparente dinamico posizionato sopra l'arena di lotta che riproduce animazioni stile GBA in base al tipo e alla categoria della mossa (disattivabile a piacere dalle Impostazioni).
- **`BossBattles.tsx`**: Hub delle sfide post-lega contro i 20 Boss Iconici leggendari (Rosso, Camilla, Rocco, Lance, Dandel, Blu, Giovanni, N, Baldo, Nardo, Perla, Iridio, Prof. Oak, Nemona, Palmer, Volo, Diantea, Cyrus, Ghecis, Silver).
- **`BossRewardsCheatModal.tsx`**: Finestra speciale all'interno del menù trucchi che elenca tutti i Pokémon ottenibili dai Boss (con IV al 100%, Shiny, mosse speciali ed esclusivi) e permette di aggiungerli singolarmente al Box anche più volte senza conflitti di ID.
- **`Box.tsx`**: Sistema Memoria PC (PC di Bill) organizzato in pagine da **40 Pokémon ciascuna** in perfetto stile dei giochi originali (Box 1, Box 2, Box 3...), mantenendo lo scroll fluido responsive, la navigazione avanti/indietro tra i Box, filtri a 1-tap (Preferiti ⭐, Shiny ✨, Evoluzione ⚡, Feriti ❤️, 18 Tipi, 9 Generazioni, Ordinamenti multipli) e selezione multipla per il rilascio di massa.
- **`Pokedex.tsx`**: Interfaccia del Pokédex Nazionale (1025 specie). Supporta ricerca testuale istantanea, paginazione ottimizzata per dispositivi mobili, filtri per generazione (Gen 1-9), e filtri di stato (Catturati, Visti, Da Scoprire).
- **`Team.tsx`**: Interfaccia di gestione della squadra attiva (max 6 Pokémon). Permette di riordinare i membri, ispezionare le statistiche e applicare strumenti.
- **`ZoneExplorer.tsx`**: Mappa di navigazione delle 14 aree del gioco con rendering dell'erba alta per incontri casuali, incontri con allenatori dell'area e sfida finale contro il Capopalestra.
- **`BattleTower.tsx`**: La Torre Lotta. Modalità sfida competitiva con scaling automatico del livello dei Pokémon avversari, calcolo della serie di vittorie e negozio ricompense in Punti Lotta (PL).
- **`LeagueHub.tsx`**: La Lega Pokémon con l'accesso sequenziale alle sfide contro i Superquattro e il Campione finale.
- **`Sfidofono.tsx`**: Menu delle rivincite. Consente di ricombattere in qualsiasi momento contro allenatori o Capipalestra precedentemente sconfitti.
- **`QuestLog.tsx`**: Registro missioni con schede dettagliate (obiettivi, ricompense e stato) e possibilità di riscuotere monete o strumenti rari.
- **`BadgeCase.tsx`**: Bacheca delle 10 medaglie con grafica personalizzata e spiegazione dei poteri passivi sbloccati.
- **`Inventory.tsx`**: Zaino del giocatore organizzato in categorie (Rimedi, Poké Ball, Strumenti Base, Pietre Evolutive, Macchine Tecniche).
- **`TMSelectionModal.tsx`**: Modale per la selezione ed applicazione di MT ai Pokémon del team compatibili.
- **`Shop.tsx`**: Negozio per l'acquisto e la vendita di oggetti utili all'avventura.
- **`Trade.tsx`**: Sistema di scambio per importare o scambiare Pokémon con stringhe di codice serializzate con auto-repair JSON.
- **`PlayerProfile.tsx`**: Profilo dell'allenatore con tempo di gioco, ID allenatore, soldi, vittorie e statistiche.
- **`StarterSelection.tsx`**: Scena introduttiva con il Professor Scordarello per la scelta del Pokémon iniziale.
- **`Settings.tsx`**: Menu delle preferenze (audio, player brani BGM per esplorazione e lotte, velocità testo, backup salvataggio, reset e **Menù Trucchi protetto da PIN `190693`** con fumetto satirico di errore del Prof. Scordarello e pulsante per evocare Pokémon speciali dai Boss).
- **`PokemonDetails.tsx`**: Scheda informativa del Pokémon catturato con gestione dello stato **Preferito ⭐**, statistiche avanzate, mosse e calcolo potenziale della natura.

### Sottocomponenti di Lotta (`/src/components/battle/`)
- **`BattleHUD.tsx`**: Barre dei PS dinamiche con valore numerico reale (es. `48 / 48 HP`) sia per il giocatore che per l'avversario, colore in base alla percentuale residua, badge dei tipi sotto la barra HP, targhetta di livello, chip dello stato alterato (SLP, PAR, BRN, PSN, FRZ) e meteo attivo.
- **`BattleControls.tsx`**: Pannello di comando con i 4 tasti principali (*Lotta*, *Zaino*, *Pokémon*, *Fuga*) e supporto all'ispezione con pressione prolungata (600ms).
- **`MoveInfoModal.tsx`**: Overlay popup per l'ispezione dettagliata della mossa (tipo, potenza, precisione, priorità, classe di danno, descrizione ed efficacia relativa).
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
- **`abilities.ts`**: Implementazione di decine di abilità passive (es. *Erbaiuto*, *Aiutofuoco*, *Acquaiuto*, *Prepotenza*, *Levitazione*, *Statico*, *Pressione*, *Corpo di Fuoco*, *Sincronismo*, ecc.).
- **`battleActionRunner.ts`**: Gestore dell'esecuzione sequenziale delle azioni durante il turno di lotta.
- **`battleAi.ts`**: Routine decisionale di intelligenza artificiale per la selezione della mossa ottimale da parte degli avversari.
- **`hazards.ts`**: Gestione trappole e pericoli sul campo di battaglia.
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
- **`evolution.ts`**: Verifiche per l'evoluzione automatica al raggiungimento del livello richiesto o tramite pietra evolutiva, con modale interattivo per evoluzioni ramificate.
- **`battleTower.ts`**: Generatore procedurale di team avversari competitivi per la Torre Lotta, gestione streak e bilanciamento.
- **`badges.ts`**: Database e verifiche dei requisiti per lo sblocco delle 10 medaglie e dei relativi vantaggi di gioco.
- **`pokemonHeal.ts`**: Funzione per ripristinare completamente PS, PP e rimuovere gli stati alterati di tutta la squadra.
- **`dayNight.ts`**: Calcolatore delle fasce orarie (Giorno, Tramonto, Notte) per la modulazione grafica e gli incontri.
- **`sound.ts`**: Riproduzione SFX, WAV nativi, e riproduzione BGM in loop per mappa e lotte con upload personalizzato salvato in `localStorage`.
- **`storage.ts`**: Driver di persistenza affidabile con fallback LocalStorage / IndexedDB.
- **`utils.ts`**: Funzioni di normalizzazione Pokémon, serializzazione team, decodifica Base64 con riparazione automatica JSON per scambi.

---

## 💾 Gestione dello Stato Globale (`/src/contexts/GameContext.tsx`)

`GameContext.tsx` gestisce l'intero stato del giocatore salvato automaticamente in memoria persistente:
- **Dati Giocatore**: Nome, soldi, medaglie ottenute, oggetti nell'inventario.
- **Squadra & Box**: Pokémon attivi (fino a 6) e Pokémon archiviati nel PC (con gestione paginata a 40 slot per Box).
- **Pokédex**: Tracciamento univoco di ogni specie vista (`seen`) o catturata (`caught`).
- **Missioni**: Stato di attivazione, completamento e riscossione delle missioni.
- **Impostazioni**: Opzioni audio, animazioni mosse GBA attive/disattive, e velocità di gioco.
