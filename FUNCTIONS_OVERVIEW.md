# ⚙️ PokePWA: Panoramica Dettagliata delle Funzioni

Questo documento descrive le principali funzioni, algoritmi e metodi esportati nei vari moduli di **PokePWA**.

---

## 1. Motore di Lotta (`/src/lib/battle/`)

### `battleMath.ts`
- **`calculateDamage(attacker, defender, move, weather, isCritical)`**:  
  Esegue il calcolo del danno secondo la formula ufficiale Pokémon di sesta/settima generazione:
  $$\text{Danno} = \left(\frac{\left(\frac{2 \times \text{Livello}}{5} + 2\right) \times \text{Potenza} \times \frac{\text{Attacco}}{\text{Difesa}}}{50} + 2\right) \times \text{Modificatori}$$
  Tiene conto di:
  - **STAB**: Moltiplicatore 1.5x se il tipo della mossa coincide con uno dei tipi dell'attaccante (o 2.0x con abilità *Adattabilità*).
  - **Efficacia Elementale**: Calcolo basato sul tipo singolo o doppio del difensore (0x, 0.25x, 0.5x, 1x, 2x, 4x).
  - **Colpo Critico**: Moltiplicatore 1.5x che ignora le riduzioni d'attacco dell'attaccante e gli aumenti di difesa del difensore.
  - **Varianza Casuale**: Numero casuale uniforme tra 0.85 e 1.00.
  - **Meteo**: Incremento del 50% per mosse Fuoco sotto Sole o Acqua sotto Pioggia.
  - **Bruciatura**: Dimezza il danno delle mosse fisiche se l'attaccante è scottato (a meno che non abbia *Dentistretti*).
- **`isCriticalHit(move, attacker)`**:  
  Determina se un attacco è un brutto colpo, basandosi sullo stadio di probabilità della mossa (es. *Foglielama* ha probabilità incrementata).

### `abilities.ts`
- **`checkAbility(pokemon, opponent, trigger, context)`**:  
  Controlla e applica l'effetto dell'abilità passiva del Pokémon in risposta a trigger specifici:
  - `onSwitchIn`: Abilità che si attivano all'ingresso in campo (es. *Prepotenza* riduce l'attacco avversario, *Siccità* o *Piovischio* impostano il meteo).
  - `beforeMove`: Abilità che proteggono dai danni (es. *Levitazione* annulla mosse Terra, *Assorbacqua* cura con mosse Acqua).
  - `onDamageDealt`: Incrementa la potenza a salute bassa (es. *Erbaiuto*, *Aiutofuoco*, *Acquaiuto* potenziano del 50% quando HP < 33%).
  - `onContact`: Effetti di contatto (es. *Statico* paralizza al contatto, *Corpo di Fuoco* brucia).

### `statusEffects.ts`
- **`canMove(pokemon)`**:  
  Valuta se un Pokémon può attaccare durante il turno:
  - **Sonno**: Riduce il contatore dei turni rimanenti; se raggiunge zero, il Pokémon si sveglia e attacca.
  - **Paralisi**: Verifica con probabilità del 25% se il Pokémon è completamente bloccato.
  - **Congelamento**: Concede una probabilità del 20% per turno di scongelamento.
- **`getStatusEffect(pokemon)`**:  
  Calcola i danni da logoramento al termine del turno (1/16 dei PS massimi per Scottatura e Avvelenamento; 1/8 per Tossina progressiva).
- **`applyStatusStatModifiers(stats, status)`**:  
  Ricalcola le statistiche attive (dimezza la Velocità effettiva per la Paralisi).

### `items.ts`
- **`useItemInBattle(item, targetPokemon, opponentPokemon, isWild)`**:  
  Gestisce la logica di consumo degli strumenti in lotta:
  - **Strumenti Curativi**: Ripristina PS fissi (Pozione, Superpozione, Iperpozione) o percentuali, o rimuove gli stati con Cura Totale.
  - **Poké Ball**: Applica il moltiplicatore base bilanciato per la cattura:
    - **Probabilità Base Generale**: 0.42
    - **Poké Ball**: 1.0x
    - **Mega Ball**: 1.6x
    - **Ultra Ball**: 2.4x
    - **Master Ball**: 100% (cattura sempre garantita)
    $$a = \frac{3 \times \text{HP}_{\max} - 2 \times \text{HP}_{\text{corr}}}{3 \times \text{HP}_{\max}} \times \text{CatchRate} \times \text{BallMultiplier} \times \text{StatusMultiplier}$$
    Se $a \ge 255$, la cattura è garantita al 100%. Altrimenti, calcola le 4 scosse della Poké Ball.

### `turnOrder.ts`
- **`getTurnOrder(playerPokemon, opponentPokemon, playerAction, opponentAction)`**:  
  Determina chi agisce per primo nel turno confrontando:
  1. Priorità delle azioni (usare uno strumento ha priorità massima +6; mosse prioritarie come *Attacco Rapido* hanno priorità +1).
  2. Velocità effettiva dei due Pokémon (modificata da stadi e paralisi).
  3. Spareggio casuale 50/50 in caso di perfetta parità di velocità.

### `battleAi.ts`
- **`selectEnemyMove(enemyMoves, enemy, playerActive, enemyStatus, playerStatus, enemyStages, playerStages, enemyHp, playerHp)`**:  
  Algoritmo di decisione tattica dell'avversario:
  - **Filtro Assoluto Immunità (`eff === 0`)**: Assegna punteggio `-9999` ad attacchi a danno zero (es. Elettro su Terra, Normale/Lotta su Spettro, Terra su Volante).
  - **Priorità Mosse Neutre e Superefficaci**: Penalizza severamente le mosse poco efficaci (`eff < 1`) se l'avversario possiede alternative offensive con `eff >= 1`.
  - **Anti-Spam Setup e Debuff**: Assegna punteggio `-9999` a mosse di potenziamento se la statistica del Pokémon è già a +6, o a debuff se la statistica del giocatore è già a -6.
  - **Anti-Spam Status Alterati**: Punteggio `-9999` a mosse di stato se il bersaglio ha già una condizione primaria attiva o è immune per tipo elementale.
  - **Priorità K.O. e Mosse Rapide**: Massima priorità se il colpo manda K.O. il giocatore o con mosse ad alta priorità se la salute è critica.
- **`shouldEnemyUseFullRestore(isEliteOrBoss, enemyHp, enemyMaxHp, enemyHealsRemaining)`**:  
  Determina se Superquattro, Campione o Boss Iconico utilizzano una Ricarica Totale:
  - Condizione: Salute nemica $\le 20\%$ dei PS massimi, 30% di probabilità, con un tetto massimo di **4 cure per combattimento**.
  - Flusso di turno fedele ai giochi originali: consuma il turno del Boss per curare PS al 100% e rimuovere status, consentendo al giocatore di sferrare subito dopo il proprio attacco.

### `escapeFormula.ts`
- **`canEscapeFromBattle(playerPokemon, opponentPokemon, escapeAttempts)`**:  
  Esegue la formula ufficiale di fuga dalle lotte con Pokémon selvatici:
  $$F = \frac{\text{Velocità}_{\text{giocatore}} \times 128}{\text{Velocità}_{\text{selvatico}}} + 30 \times \text{Tentativi}$$
  Se $F > 255$ o un numero casuale mod 256 è inferiore a $F$, la fuga ha successo; altrimenti fallisce e si consuma il turno.

---

## 2. Servizi Pokédex e Dati (`/src/lib/` & `/src/data/`)

### `movesData.ts`
- **`STATIC_MOVES_DATABASE` & `ALIAS_MAP`**:  
  Database delle mosse competitive contenente informazioni dettagliate su tipo elementale, categoria (*physical*, *special*, *status*), potenza, precisione e PP.  
  Include mappatura bilingue rigorosa (inglese e italiano). In particolare, mosse come **`flash-cannon`** (*Cannonflash* / *Cannonlampo*, tipo Acciaio speciale, potenza 80), **`roar-of-time`** (*Fragortempo*, Drago speciale, potenza 150), **`sucker-punch`** (*Sbigoattacco*), **`freeze-dry`** (*Liofilizzazione*), **`icicle-crash`** (*Scagliagelo*) sono registrate sia con chiavi canoniche che con alias italiani per una risoluzione senza fallback generici.
- **`getMoveByName(name)`**:  
  Funzione di risoluzione che normalizza la chiave tramite `normalizeMoveKey` e garantisce che ogni mossa ritorni il tipo, la potenza e la categoria corretti.

### `pokedexService.ts`
- **`fetchPokedexIndex()`**:  
  Restituisce l'indice compatto dei 1025 Pokémon nazionali con id, nome, e id formattato (es. `#0025`) per un rendering fluido a 60fps su dispositivi mobili.
- **`fetchPokedexDetail(pokemonId)`**:  
  Scarica o recupera dalla cache i dati completi di una singola specie: descrizione in italiano, artwork ufficiale, sprite shiny, statistiche base con BST, mosse per livello con relative descrizioni tradotte, catena evolutiva e verso audio originale (*cry*).

### `pokeapi.ts`
- **`fetchPokemonData(idOrName)`**:  
  Scarica le statistiche, i tipi e le mosse base di un Pokémon da PokéAPI, con cache persistente in memoria e LocalStorage.
- **`fetchMoveData(moveNameOrUrl)`**:  
  Recupera le proprietà competitive della mossa con traduzione automatica in italiano.

### `BattleFXLayer.tsx` (Animazioni Mosse GBA)
- **`BattleFXLayer`**:
  - Renderizza un overlay grafico trasparente dinamico posizionato sopra l'arena di lotta.
  - Genera effetti grafici tematici in base al tipo e alla categoria della mossa usata.
  - Disattivabile all'istante dalle Impostazioni (`state.settings.moveAnimationsEnabled`).

### `utils.ts` & Scambio Codici (`Trade.tsx`)
- **`normalizePokemon(raw)`**:
  Normalizza qualsiasi oggetto Pokémon proveniente da LocalStorage, N64 o Pokedesk. Sincronizza sprite, curve di esperienza $N^3$, mosse e genera `instanceId` univoci.
- **`decodePokemon(base64)`**:
  Decodifica stringhe Base64 esterne con tolleranza avanzata agli errori, gestione del padding, auto-riparazione JSON e fallback Regex.

---

## 3. Crescita, Statistiche ed Evoluzione (`/src/lib/`)

### `leveling.ts`
- **`calculateExpGain(winner, faintedEnemy, isWild)`**:  
  Calcola i punti XP guadagnati al termine dello scontro in base al livello e alla specie del nemico sconfitto.
- **`checkLevelUp(pokemon)`**:  
  Verifica se il Pokémon ha superato la soglia di esperienza per salire di livello e ricalcola le statistiche massime secondo le formule ufficiali con IV ed EV.
- **`applyEvs(pokemon, yieldEvs)`**:  
  Aggiunge i punti Effort Values (EV) guadagnati, rispettando il cap di 252 EV per statistica e 510 totali.

### `evolution.ts`
- **`checkEvolution(pokemon, itemUsed?)`**:  
  Determina se un Pokémon possiede i requisiti per evolversi (livello o pietra). Per specie con evoluzioni ramificate (Eevee, Tyrogue, Slowpoke, Oddish, Poliwag), restituisce la lista di tutte le opzioni per la scelta interattiva del giocatore.

### `sound.ts`
- **`playBgm(type, forceReload?)`**: Gestisce la riproduzione musicale loopata per mappa e lotte con supporto a upload di brani personalizzati salvati in `localStorage`.
- **`playHit(type)`**: Riproduce istantaneamente i file WAV ufficiali per i colpi superefficaci e non molto efficaci.

---

## 4. Torre Lotta & Competizione (`/src/lib/battleTower.ts`)

- **`generateTowerOpponent(currentStreak)`**:  
  Genera proceduralmente un allenatore rivale con Pokémon competitivi di livello pari a quello massimo della squadra del giocatore.
- **`calculateTowerRewards(streak)`**:  
  Calcola i Punti Lotta (PL) guadagnati in base alla serie di vittorie consecutive.

---

## 5. Sfide Leggendarie - I 20 Boss Iconici (`/src/data/legendaryBosses.ts` & `/src/components/BossBattles.tsx`)

### `LEGENDARY_BOSSES` (20 Boss delle 9 Regioni)
Configurazione dei **20 Boss Iconici**:
1. ⚡ **Rosso** (*Monte Argento*) → Premio: **Pikachu Cromatico con Volo** (Lvl 70, IV 100%)
2. 🐉 **Campionessa Camilla** (*Sinnoh*) → Premio: **Garchomp Titanico** (Lvl 70, IV 100%)
3. 💎 **Rocco Petri** (*Hoenn*) → Premio: **Metagross "Argento"** (Lvl 70, IV 100%)
4. 🔥 **Domadraghi Lance** (*Kanto/Johto*) → Premio: **Dragonite con Extrarapido** (Lvl 70, IV 100%)
5. 👑 **Campione Dandel** (*Galar*) → Premio: **Charizard "Gigamax"** (Lvl 70, IV 100%)
6. 🏆 **Eterno Rivale Blu** (*Kanto*) → Premio: **Arcanine Imperiale** (Lvl 70, IV 100%)
7. 🚀 **Capo Giovanni** (*Team Rocket*) → Premio: **Mewtwo "Origine"** (Lvl 70, IV 100%)
8. 🕊️ **Re N** (*Unima*) → Premio: **Zoroark "Ideale"** (Lvl 70, IV 100%)
9. 🗿 **Baldo** (*Parco Lotta*) → Premio: **Regigigas Antico** (Lvl 70, IV 100%)
10. 🦋 **Campione Nardo** (*Unima*) → Premio: **Volcarona del Sole** (Lvl 70, IV 100%)
11. ❄️ **Perla & Eredi di Hisui** (*Hisui*) → Premio: **Zoroark di Hisui** (Lvl 70, IV 100%)
12. ⚙️ **Iridio** (*Alola*) → Premio: **Silvally "Iride"** (Lvl 70, IV 100%)
13. 📜 **Prof. Oak** (*Kanto*) → Premio: **Tauros del Professore** (Lvl 70, IV 100%)
14. ⚡ **Campionessa Nemona** (*Paldea*) → Premio: **Baxcalibur "Furore"** (Lvl 70, IV 100%)
15. 🏰 **Asso Palmer** (*Torre Lotta*) → Premio: **Heatran del Vulcano** (Lvl 70, IV 100%)
16. 👻 **Volo** (*Ginkgo Guild*) → Premio: **Giratina "Origine"** (Lvl 70, IV 100%)
17. 🌟 **Campionessa Diantea** (*Kalos*) → Premio: **Gardevoir "Aura Nobile"** (Lvl 70, IV 100%)
18. 🌌 **Leader Cyrus** (*Mondo Distorto*) → Premio: **Dialga "Spaziotempo"** (Lvl 70, IV 100%)
19. 👑 **Signore Ghecis** (*Team Plasma*) → Premio: **Hydreigon "Tiranno"** (Lvl 70, IV 100%)
20. 🐺 **Rivale Silver** (*Johto*) → Premio: **Feraligatr "Ribelle"** (Lvl 70, IV 100%)

### `buildBossTrainer(boss)` & `generateBossRewardPokemon(boss)`
- Costruisce squadre Lvl 100 con IV a 31 ed EV max distribuiti.
- Genera i premi con `isShiny: true`, IV perfetti (31/31/31/31/31/31) e soprannomi puliti ed evocativi.

---

## 6. Sistema Trucchi & Catalogo Pokémon Speciali (`/src/components/BossRewardsCheatModal.tsx`)

- **`BossRewardsCheatModal`**:  
  Pannello all'interno della sezione Trucchi protetta da PIN (`190693`).  
  Permette al giocatore di visualizzare l'intero catalogo dei Pokémon premio dei Boss e di aggiungerli singolarmente al Box con un singolo tocco.
- **`SPECIAL_CHEAT_POKEMON_CATALOG` & `ADDITIONAL_SPECIAL_POKEMON`**:  
  Array estensibile progettato per ospitare in futuro qualsiasi Pokémon mitico, evento o speciale oltre alle ricompense dei Boss attuali.
- **Garanzia di Unicità & Sicurezza**:  
  Ogni Pokémon generato riceve un `instanceId` crittografico unico (`<id>_cheat_<timestamp>_<random>`), consentendo di ottenerne copie multiple nel Box senza alcun rischio di collisione, sovrascrittura o bug durante il ritiro o il deposito.

---

## 7. Sistema Memoria PC Box: Paginazione da 40 Pokémon (`/src/components/Box.tsx`)

- **Paginazione da 40 Slot Stile Giochi Originali**:  
  I Pokémon archiviati nel Box sono organizzati in pagine da **massimo 40 Pokémon** ciascuna (`BOX_PAGE_SIZE = 40`), simulando i classici "Box 1", "Box 2", "Box 3"... dei titoli Pokémon per console.
- **Scroll e Navigazione Fluida**:  
  Lo scorrimento verticale rimane fluido come sempre, consentendo di visualizzare chiaramente la griglia dei 40 Pokémon del Box selezionato.
- **Intestazione e Navigazione Rapida**:  
  Intestazione in stile PC di Bill con pulsanti `< Prec.` e `Succ. >`, contatore `BOX X / Y` con riassunto dei Pokémon visualizzati (es. `1 - 40 di 120`), e pillole interattive per saltare istantaneamente a qualsiasi Box.
- **Barra di Navigazione Inferiore**:  
  Pannello di navigazione a fondo pagina che consente di passare al Box successivo non appena si scorre fino al 40° Pokémon.
- **Integrazione con Filtri e Ricerca**:  
  Quando vengono applicati filtri per tipo, generazione, ricerca testuale o categorie (Preferiti, Shiny, Feriti, Pronti a Evolvere), la paginazione ricalcola istantaneamente il numero di pagine e riporta la vista in modo sicuro alla pagina 1, prevenendo pagine vuote o indici disallineati.
- **Selezione Multipla Multibox**:  
  In modalità selezione multipla è possibile selezionare con un tocco tutti i Pokémon del Box corrente oppure tutti i Pokémon filtrati nell'intero archivio, procedendo al rilascio sicuro con barriera di conferma per esemplari Shiny o di livello elevato.

---

## 8. Test Automatici & Audit di Integrità (`/src/tests/`)

La codebase è coperta da **13 suite di test** e **84 test unitari e di integrazione** eseguiti con Vitest:
- **`battleAiAdvanced.test.ts`**: Verifica le decisioni dell'IA competitiva (esclusione immunità 0x, priorità mosse neutre, prevenzione spam boost/status e trigger della Ricarica Totale).
- **`allTrainersAndBossesAudit.test.ts`**: Verifica che tutte le specie e mosse di ogni Boss e Allenatore siano censite e non generino fallback o errori di tipo.
- **`bossRewardsCheat.test.ts`**: Valida la generazione conforme e con IV perfetti dei Pokémon del menù trucchi.
- **`boxPagination.test.ts`**: Verifica le formule di calcolo delle pagine, il ritaglio esatto dei 40 Pokémon per pagina e la resilienza ai filtri.
- **`battleSystemComplete.test.ts`**, **`battleAdvancedMechanics.test.ts`**, **`multiTurnMoves.test.ts`**: Validazione rigorosa delle formule di danno, meteo, abilità e mosse multi-turno.
