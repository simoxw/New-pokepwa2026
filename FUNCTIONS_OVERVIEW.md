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

### `escapeFormula.ts`
- **`canEscapeFromBattle(playerPokemon, opponentPokemon, escapeAttempts)`**:  
  Esegue la formula ufficiale di fuga dalle lotte con Pokémon selvatici:
  $$F = \frac{\text{Velocità}_{\text{giocatore}} \times 128}{\text{Velocità}_{\text{selvatico}}} + 30 \times \text{Tentativi}$$
  Se $F > 255$ o un numero casuale mod 256 è inferiore a $F$, la fuga ha successo; altrimenti fallisce e si consuma il turno.

---

## 2. Servizi Pokédex e Dati (`/src/lib/`)

### `pokedexService.ts`
- **`fetchPokedexIndex()`**:  
  Restituisce l'indice compatto dei 1025 Pokémon nazionali con id, nome, e id formattato (es. `#0025`) per un rendering fluido a 60fps su dispositivi mobili.
- **`fetchPokedexDetail(pokemonId)`**:  
  Scarica o recupera dalla cache i dati completi di una singola specie: descrizione in italiano, artwork ufficiale, sprite shiny, statistiche base con BST, mosse per livello con relative descrizioni tradotte, catena evolutiva e verso audio originale (*cry*).
- **`getPokemonHabitatInGame(pokemonId)`**:  
  Mappa l'ID di qualsiasi Pokémon alle 14 zone esplorabili del gioco in cui è possibile trovarlo selvatico.

### `pokeapi.ts`
- **`fetchPokemonData(idOrName)`**:  
  Scarica le statistiche, i tipi e le mosse base di un Pokémon da PokéAPI, con cache persistente in memoria e LocalStorage.
- **`fetchMoveData(moveNameOrUrl)`**:  
  Recupera le proprietà competitive della mossa (potenza, precisione, tipo, PP, classe di danno) con traduzione automatica in italiano.

---

## 3. Crescita, Statistiche ed Evoluzione (`/src/lib/`)

### `leveling.ts`
- **`calculateExpGain(winner, faintedEnemy, isWild)`**:  
  Calcola i punti XP guadagnati al termine dello scontro in base al livello e alla specie del nemico sconfitto (con bonus 1.5x per le lotte contro allenatori).
- **`checkLevelUp(pokemon)`**:  
  Verifica se il Pokémon ha superato la soglia di esperienza per salire di livello (secondo la curva di crescita assegnata) e ricalcola le statistiche massime:
  $$\text{HP} = \left\lfloor \frac{(2 \times \text{Base} + \text{IV} + \lfloor \text{EV}/4 \rfloor) \times \text{Livello}}{100} \right\rfloor + \text{Livello} + 10$$
  $$\text{Stat} = \left\lfloor \left( \left\lfloor \frac{(2 \times \text{Base} + \text{IV} + \lfloor \text{EV}/4 \rfloor) \times \text{Livello}}{100} \right\rfloor + 5 \right) \times \text{Natura} \right\rfloor$$
- **`applyEvs(pokemon, yieldEvs)`**:  
  Aggiunge i punti Effort Values (EV) guadagnati dallo sconfitto, rispettando il tetto di 252 EV per singola statistica e 510 EV totali.

### `evolution.ts`
- **`checkEvolution(pokemon, itemUsed?)`**:  
  Determina se un Pokémon possiede i requisiti per evolversi (raggiungimento del livello minimo o esposizione a una specifica pietra evolutiva). Per specie con evoluzioni ramificate (es. Eevee, Tyrogue, Slowpoke, Oddish, Poliwag), restituisce la lista di tutte le opzioni evolutive disponibili da mostrare nel modale di scelta dell'utente.

### `sound.ts`
- **`playBgm(type, forceReload?)`**:  
  Gestisce la riproduzione in loop della colonna sonora BGM ('overworld' o 'battle'). Recupera la traccia audio salvata in `localStorage` o interrompe l'audio se si imposta `'stop'`.
- **`getCustomBgm(type)` / `setCustomBgm(type, base64Audio)`**:  
  Legge e aggiorna la musica di sottofondo personalizzata salvata in `localStorage` (`pokepwa_custom_bgm_overworld` e `pokepwa_custom_bgm_battle`), in modo del tutto indipendente dalla struttura dei dati di salvataggio del gioco.
- **`playHit(type)`**:  
  Riproduce istantaneamente i file audio WAV ufficiali per i colpi superefficaci (`/public/audio/super_effective.wav`) e non molto efficaci (`/public/audio/not_very_effective.wav`).

---

## 4. Torre Lotta & Competizione (`/src/lib/battleTower.ts`)

- **`generateTowerOpponent(currentStreak)`**:  
  Genera proceduralmente un allenatore rivale con Pokémon competitivi di livello pari a quello massimo della squadra del giocatore, assegnando mosse strategiche e bilanciate.
- **`calculateTowerRewards(streak)`**:  
  Calcola i Punti Lotta (PL) guadagnati in base alla serie di vittorie consecutive.

---

## 6. Sistema di Progressione e Zone (`/src/lib/badges.ts` & `/src/constants/game.ts`)

### `isAreaUnlocked(areaId, playerBadges, leagueVictories)`
- **Progressione Lineare**: Implementa un sistema di sblocco sequenziale per le 10 zone principali del gioco. Ogni zona (tranne la prima) richiede il possesso della medaglia ottenuta nella zona precedente.
- **Accesso alla Lega**: Il Datacenter della Lega Pokémon richiede obbligatoriamente il possesso di tutte le **10 Medaglie** dei Capipalestra.
- **Post-Game (Area Zero & Arcipelago Regionale)**: Le aree speciali (Area Zero, Santuario dei Glitch, Abisso del Codice, Arcipelago Regionale) vengono sbloccate solo dopo aver ottenuto almeno una vittoria nella Lega Pokémon (`leagueVictories > 0`).

### Sistema di Incontri (`/src/components/ZoneExplorer.tsx`)
- **Pity System Capopalestra**: Se un giocatore si trova in una zona di cui non possiede ancora la medaglia, la probabilità di incontrare il Capopalestra aumenta di **8 volte** rispetto al normale, facilitando la progressione iniziale.
- **Tabelle Allenatori Locali**: Ogni zona attinge a una `trainerTable` specifica definita in `game.ts`, garantendo che gli NPC incontrati siano tematicamente coerenti con l'ambiente (es. Pescatori in Spiaggia, Alpinisti in Montagna).
- **Spawn Dinamico**: Il livello dei Pokémon selvatici e degli allenatori scala progressivamente tra le zone, partendo dal livello 2 nel Bosco dei Selfie fino al livello 100 nelle zone più profonde del Post-Game.

### `PokemonDetails.tsx` & `Pokemon` Model
- **`handleToggleFavorite()`**:  
  Attiva/disattiva la proprietà reattiva `isFavorite` sul Pokémon selezionato sia nella squadra (`state.player.team`) sia nel box (`state.player.box`) tramite confronto univoco `instanceId`. Mostra una stella dorata con glow sia nella scheda dettagliata, sia nel Box PC che nella lista Squadra.

### `Settings.tsx`
- **`handleVerifyPasscode(passcode)`**:  
  Valida l'immissione del codice PIN segreto (`190693`) per l'accesso al Menù Trucchi. In caso di PIN errato, riproduce un suono di KO e scatena il fumetto di errore comico del **Prof. Scordarello** con il suo avatar e battute personalizzate.

### `Box.tsx`
- **`filteredBox` (useMemo)**:  
  Filtra e ordina l'array dei Pokémon archiviati applicando contemporaneamente ricerca testuale (nome, nickname, #ID), filtro elementale sui 18 tipi, filtro generazioni (Gen 1-9), toggle per **Preferiti ⭐**, **Shiny ✨**, **Pronti a evolvere ⚡**, **Feriti ❤️**, e ordinamento a 8 vie (recenti, livello, nome, pokedex, statistiche, IV).
- **`isMultiSelectMode` & Mass Release**:  
  Consente la selezione multipla di Pokémon archiviati per la liberazione di massa, con riassunto delle specie selezionate, blocco di sicurezza automatica per Pokémon Shiny o di livello >= 30, e ripristino istantaneo dello spazio di memoria.
- **`withdraw(targetPokemon)`**:  
  Sposta in modo sicuro un Pokémon dal Box alla squadra attiva tramite confronto di `instanceId` univoco (`Crypto.randomUUID()`), garantendo che eventuali copie identiche della stessa specie mantengano statistiche e livelli indipendenti.
- **`deposit(targetPokemon)`**:  
  Sposta un Pokémon dalla squadra al Box tramite `instanceId`, verificando che rimanga almeno un Pokémon attivo in squadra.

### `Pokedex.tsx` & `PokedexDetailModal.tsx`
- **`calculateTypeEffectiveness(types)`**:  
  Esegue l'algoritmo di moltiplicazione incrociata delle debolezze per doppi tipi (es. tipo Fuoco/Volante riceve danno 4x da Roccia, 0.25x da Erba, 0x da Terra).
- **`playPokemonCry(cryUrl)`**:  
  Inizializza e riproduce l'audio nativo HTML5 del verso del Pokémon.

### `BattleControls.tsx` & `BattleScreen.tsx`
- **Long-Press Move Inspection (600ms)**:  
  Tenendo premuto il pulsante di una mossa per almeno 600ms si apre la scheda dettagliata della mossa (categoria Fisica/Speciale/Stato, potenza, precisione, priorità, moltiplicatore di efficacia sul nemico e descrizioni/effetti secondari). Non appena il pulsante viene rilasciato, l'overlay scompare senza eseguire la mossa. Il rilascio prima di 600ms invece attiva la mossa.
- **Tipografia Ottimizzata Mosse**:  
  Il nome della mossa è reso in corpo più compatto (`text-[11px] sm:text-xs`) per evitare troncamenti antiestetici, lasciando inalterati tutti gli altri indicatori (PP, Tipo, Potenza, Precisione).
- **Ciclo Persistenza Status (Avvelenamento e Scottatura)**:  
  Corretto il controllo di stato turn-by-turn in `canMove` e `executeMoveAction`, assicurando che l'avvelenamento e la scottatura rimangano attivi per tutta la durata dello scontro infliggendo danno alla fine di ogni turno (rispettivamente 1/8 e 1/16 dei PS max), e che non vengano rimossi prematuramente.

