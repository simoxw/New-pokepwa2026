# 📖 Catalogo Completo delle Mosse con Regole Speciali e Meccaniche Dedicate

Questo documento elenca **tutte le mosse** implementate nel gioco che possiedono una logica di codice personalizzata (meccaniche dedicate oltre al semplice calcolo standard del danno), spiegando **cosa fanno in dettaglio** e **in quali file trovare il loro codice**.

---

## 📑 Indice delle Categorie

1. [Mosse Speciali di Nuova Introduzione](#1-mosse-speciali-di-nuova-introduzione)
   - Metronomo (Metronome)
   - Sostituto (Substitute)
   - Falsofinale (False Swipe)
   - Meteo sul Campo (Giornodisole, Pioggiadanza, Terrempesta, Grandine)
   - Schermi Difensivi (Riflesso, Schermoluce)
   - Mosse di Scambio Forzato (Boato, Turbine)
2. [Mosse Tattiche e Difensive](#2-mosse-tattiche-e-difensive)
   - Protezione e Individuazione (Protect, Detect)
   - Riposo (Rest)
3. [Mosse a Più Turni e Ricarica](#3-mosse-a-più-turni-e-ricarica)
   - Mosse con Semi-Invulnerabilità (Volo, Fossa, Sub, Rimbalzo)
   - Mosse con Ricarica Obbligatoria (Iper Raggio, Gigaimpatto)
   - Mosse a Colpi Multipli (2-5 colpi)
4. [Mosse con Assorbimento e Contraccolpo](#4-mosse-con-assorbimento-e-contraccolpo)
   - Drenaggio PS (Assorbimento, Gigassorbimento, Assorbipugno, ecc.)
   - Danno da Contraccolpo (Sdoppiatore, Baldeali, Scontro)
5. [Mosse di Campo e Trappole d'Ingresso](#5-mosse-di-campo-e-trappole-dingresso)
   - Piazzamento Trappole (Levitoroccia, Punte, Fielepunte, Rete Vischiosa)
   - Rimozione Trappole (Rapigiro / Rapid Spin)
6. [Mosse con Variazione Statistiche Garantita sull'Utilizzatore](#6-mosse-con-variazione-statistiche-garantita-sullutilizzatore)
   - Zuffa, Vampata, Troppoforte, Dragometeora, Danzaspada, ecc.

---

## 1. Mosse Speciali di Nuova Introduzione

### 🎲 Metronomo (Metronome)
* **Descrizione**: Agita un dito ed estrae a sorte una mossa qualsiasi tra tutte quelle esistenti nel catalogo del gioco, eseguendola immediatamente come se fosse stata scelta dall'allenatore.
* **Regole & Meccaniche**:
  * Estrae casualmente una mossa dal database `MOVES_DATABASE`.
  * Esclude automaticamente dal sorteggio *Metronomo* stesso e *Scontro* (Struggle).
  * Mostra a schermo il log dedicato: `🎲 Metronomo estrae a sorte [Nome Mossa]!`
  * Esegue la mossa estratta mantenendo tutte le sue regole (tipo, categoria, danno, effetti secondari, meteo, trappole).
* **File di Implementazione**:
  * `src/data/movesData.ts`: funzione `getRandomMetronomeMove()`
  * `src/lib/battle/battleActionRunner.ts`: intercettazione al turno della mossa ed esecuzione ricorsiva.

---

### 🧸 Sostituto (Substitute)
* **Descrizione**: Sacrifica il 25% dei propri PS massimi per creare un'esca pupazzo che incassa i colpi avversari al posto del Pokémon.
* **Regole & Meccaniche**:
  * Richiede almeno il 25% dei PS massimi dell'utilizzatore (`Math.floor(maxHp / 4)`). Se i PS sono insufficienti, fallisce.
  * Fallisce se l'utilizzatore ha già un sostituto attivo sul campo.
  * L'esca assorbe interamente il danno degli attacchi: i PS reali del Pokémon non scendono.
  * Se il danno subito è maggiore o uguale ai PS del sostituto, il sostituto si distrugge (`💥 Il Sostituto di X è andato distrutto!`), ma il danno in eccesso non colpisce il Pokémon (meccanica autentica GBA/Gen 3).
  * **Immunità garantite**: finché il sostituto è in piedi, il Pokémon è **completamente immune** a problemi di stato (veleno, paralisi, sonno, scottatura, congelamento, confusione) e ai cali di statistiche inflitti dalle mosse avversarie (es. Ruggito, Colpo Coda, Stridio).
  * Visualizzazione grafica con badge dedicato nell'HUD (`🧸 SOST: [PS]`).
* **File di Implementazione**:
  * `src/lib/battle/statusEffects.ts`: proprietà `substituteHp?: number` in `VolatileStatus`.
  * `src/lib/battle/battleActionRunner.ts`: logica di creazione del sostituto, assorbimento danni e blocco di status/cali statistiche.
  * `src/components/BattleScreen.tsx`: gestione stato volatile del sostituto.
  * `src/components/battle/BattleHUD.tsx`: badge grafico sul display dei Pokémon.

---

### 🗡️ Falsofinale (False Swipe)
* **Descrizione**: Attacco fisico di tipo Normale con potenza 40 e precisione 100% che calibra il colpo in modo da non mandare mai K.O. il bersaglio.
* **Regole & Meccaniche**:
  * Se il danno calcolato sarebbe letale (ridurrebbe i PS a 0 o meno), i PS del bersaglio vengono fissati esattamente a **1 PS**.
  * Messaggio di conferma in battaglia: `✨ [Pokémon] resiste con 1 PS grazie a Falsofinale!`
  * Fondamentale per indebolire Pokémon selvatici e Boss catturabili senza rischiare di mandarli K.O. per sbaglio con brutti colpi.
* **File di Implementazione**:
  * `src/data/movesData.ts`: definizione mossa e alias.
  * `src/lib/battle/battleActionRunner.ts`: controllo danno minimo vitale.

---

### ☀️🌧️🌪️❄️ Meteo sul Campo (Weather)
* **Mosse**:
  * **Giornodisole (Sunny Day)**: Luce Solare Intensa per 5 turni.
  * **Pioggiadanza / Piovodanza (Rain Dance)**: Pioggia a Dirotto per 5 turni.
  * **Terrempesta (Sandstorm)**: Tempesta di Sabbia per 5 turni.
  * **Grandine (Hail)**: Bufera di Grandine per 5 turni.
* **Regole & Meccaniche**:
  * **Modificatori di Danno**:
    * **Sole**: Mosse Fuoco **+50% danno** (`x1.5`), Mosse Acqua **-50% danno** (`x0.5`).
    * **Pioggia**: Mosse Acqua **+50% danno** (`x1.5`), Mosse Fuoco **-50% danno** (`x0.5`).
  * **Danni Passivi di Fine Turno**:
    * **Tempesta di Sabbia**: infligge `1/16 dei PS massimi` a ogni turno a tutti i Pokémon sul campo, **tranne** quelli di tipo *Roccia*, *Terra* o *Acciaio*.
    * **Grandine**: infligge `1/16 dei PS massimi` a ogni turno a tutti i Pokémon sul campo, **tranne** quelli di tipo *Ghiaccio*.
  * **Contatore & Durata**: dura 5 turni completi; a fine round scala di 1 turno e scade con messaggio atmosferico (`🌤️ Il meteo è tornato alla normalità!`).
  * **Banner Grafico**: banner animato in tempo reale al centro dell'arena di battaglia con icona e turni rimasti.
* **File di Implementazione**:
  * `src/lib/battle/fieldEffects.ts`: modulo centrale con formule moltiplicatori, danno passivo `processWeatherTurnEnd()` e timer `tickWeather()`.
  * `src/lib/battle/battleMath.ts`: applicazione moltiplicatori meteo nella formula del danno `calculateDamage()`.
  * `src/lib/battle/battleActionRunner.ts`: attivazione del meteo all'uso della mossa.
  * `src/components/BattleScreen.tsx`: stato `fieldWeather`, applicazione danni a fine turno e banner UI.

---

### 🛡️🔮 Schermi di Squadra (Reflect & Light Screen)
* **Mosse**:
  * **Riflesso (Reflect)**: Barriera fisica di squadra per 5 turni.
  * **Schermoluce (Light Screen)**: Muro di luce speciale di squadra per 5 turni.
* **Regole & Meccaniche**:
  * **Riflesso**: dimezza il danno subito da tutti gli **attacchi fisici** (`x0.5`).
  * **Schermoluce**: dimezza il danno subito da tutti gli **attacchi speciali** (`x0.5`).
  * **Regola Competitiva Autentica**: i **Brutti Colpi (Critical Hits)** ignorano completamente Riflesso e Schermoluce, penetrando la barriera difensiva!
  * **Contatore & Durata**: dura 5 turni per la parte che l'ha attivata, scalando a ogni fine turno (`🛡️ Il Riflesso di X è svanito!`).
  * **Badge Grafico**: visualizzati nei rispettivi HUD (`🛡️ RIFL (nt)` e `🔮 SCHERM (nt)`).
* **File di Implementazione**:
  * `src/lib/battle/fieldEffects.ts`: funzioni `getScreenDamageMultiplier()` e `tickScreens()`.
  * `src/lib/battle/battleMath.ts`: integrazione nella formula del danno (con eccezione critici).
  * `src/lib/battle/battleActionRunner.ts`: innalzamento schermo all'uso della mossa.
  * `src/components/BattleScreen.tsx`: stati `playerScreens` ed `enemyScreens`.
  * `src/components/battle/BattleHUD.tsx`: badge negli HUD dei contendenti.

---

### 🌪️🦁 Mosse di Scambio Forzato (Boato e Turbine)
* **Mosse**: **Boato (Roar)** e **Turbine (Whirlwind)**
* **Regole & Meccaniche**:
  * Priorità mossa: `-6` (agiscono sempre per ultime nel turno, come nei giochi principali).
  * **Nelle Lotte con Pokémon Selvatici**:
    * Se usate dal giocatore: fanno fuggire il selvatico all'istante, terminando la lotta in modo pulito e sicuro.
    * Se usate dal selvatico: spazzano via il giocatore costringendolo alla fuga dalla lotta.
  * **Nelle Lotte con Allenatori / Boss**:
    * Costringono il Pokémon avversario a lasciare il campo.
    * L'avversario viene rimpiazzato immediatamente con un altro Pokémon casuale in vita della squadra avversaria.
    * Al nuovo Pokémon entrante vengono applicate le trappole sul campo (Levitoroccia, Punte, ecc.).
    * Se l'avversario non possiede altri Pokémon sani in squadra, la mossa fallisce (`Ma è fallita!`).
* **File di Implementazione**:
  * `src/data/movesData.ts`: priorità -6 e definizioni.
  * `src/lib/battle/battleActionRunner.ts`: flag `forceFlee` e `forceSwitchTarget`.
  * `src/components/BattleScreen.tsx`: estrazione ed entrata del Pokémon forzato allo scambio.

---

## 2. Mosse Tattiche e Difensive

### 🛡️ Protezione (Protect) e Individuazione (Detect)
* **Regole**:
  * Annulla qualsiasi danno ed effetto di mosse offensive o di stato nemiche dirette per quel turno.
  * **Formula di fallimento consecutivo**: al 1° turno di utilizzo consecutivo ha il 100% di successo; al 2° consecutivo il 50%; al 3° il 25%; ecc. (`Math.pow(0.5, streak)`).
* **File**: `src/lib/battle/battleActionRunner.ts` (righe ~170-195) e `src/lib/battle/statusEffects.ts` (`isProtected`, `protectStreak`).

### 💤 Riposo (Rest)
* **Regole**:
  * Ripristina istantaneamente il 100% dei PS massimi dell'utilizzatore.
  * Rimuove qualsiasi problema di stato precedente (avvelenamento, paralisi, scottatura, congelamento).
  * Addormenta l'utilizzatore per 2 turni esatti. Fallisce se l'utilizzatore sta già dormendo.
* **File**: `src/lib/battle/battleActionRunner.ts` (righe ~480-515).

---

## 3. Mosse a Più Turni e Ricarica

### 🦅 Mosse di Semi-Invulnerabilità (Volo, Fossa, Sub, Rimbalzo)
* **Mosse**: Volo (Fly), Fossa (Dig), Sub (Dive), Rimbalzo (Bounce).
* **Regole**:
  * **Turno 1**: Il Pokémon sale in cielo / scava sottoterra / si immerge sott'acqua ed entra nello stato di semi-invulnerabilità. Tutti i colpi avversari falliscono automaticamente.
  * **Turno 2**: Il Pokémon sferra l'attacco con piena potenza.
* **File**: `src/lib/battle/battleActionRunner.ts` (controllo `chargingState`) e `src/components/BattleScreen.tsx` (auto-esecuzione del 2° turno).

### ⚡ Mosse a Ricarica (Iper Raggio, Gigaimpatto)
* **Mosse**: Iper Raggio (Hyper Beam), Gigaimpatto (Giga Impact).
* **Regole**:
  * Infliggono ingenti danni (potenza 150), ma se il bersaglio non viene mandato K.O., l'utilizzatore rimane in stato di `recharging` e salta l'azione del turno successivo per riprendere le forze.
* **File**: `src/lib/battle/battleActionRunner.ts` e `src/components/BattleScreen.tsx`.

### 💥 Mosse a Colpi Multipli (Multi-Hit)
* **Mosse**: Furia, Doppiasberla, Semitraglia, Missilspillo, Cadutamassi, ecc.
* **Regole**:
  * Colpiscono da 2 a 5 volte con probabilità ufficiali: 2 colpi (37.5%), 3 colpi (37.5%), 4 colpi (12.5%), 5 colpi (12.5%).
  * Se il bersaglio possiede un Sostituto, ogni colpo intacca il Sostituto fino a romperlo.
* **File**: `src/lib/battle/battleActionRunner.ts` (sezione `multiTurn.type === 'multi-hit'`).

---

## 4. Mosse con Assorbimento e Contraccolpo

### 🩸 Drenaggio di PS (Lifesteal / Drain)
* **Mosse**: Assorbimento (Absorb), Megassorbimento (Mega Drain), Gigassorbimento (Giga Drain), Assorbipugno (Drain Punch), Parassiseme (Leech Life).
* **Regole**: Cura l'utilizzatore di una percentuale pari al 50% del danno netto inflitto al bersaglio (`finalDamage * move.drain`).
* **File**: `src/lib/battle/battleActionRunner.ts` (sezione `move.drain`).

### 💥 Contraccolpo da Rinculo (Recoil)
* **Mosse**: Sdoppiatore (Double-Edge), Baldeali (Brave Bird), Fuococarica (Flare Blitz), Scontro (Struggle).
* **Regole**:
  * Mosse regolari: l'utilizzatore subisce un danno da rinculo pari a un quarto (o un terzo) del danno inflitto (`finalDamage * move.recoil`).
  * Scontro (Struggle): l'utilizzatore subisce sempre il 25% dei propri PS massimi come rinculo fisso.
* **File**: `src/lib/battle/battleActionRunner.ts` (sezione `move.recoil` e `move.recoilMaxHp`).

---

## 5. Mosse di Campo e Trappole d'Ingresso

### 🪨 Trappole (Entry Hazards)
* **Mosse**:
  * **Levitoroccia (Stealth Rock)**: Danno da tipo Roccia all'entrata calcolato sulle debolezze del tipo (da 3.125% fino a 50% dei PS massimi).
  * **Punte (Spikes)**: Danno da terra all'entrata che scala accumulando strati (1 strato = 12.5%, 2 strati = 16.7%, 3 strati = 25%).
  * **Fielepunte (Toxic Spikes)**: Avvelena (1 strato) o Iperavvelena (2 strati) i Pokémon non immuni che toccano terra all'entrata.
  * **Rete Vischiosa (Sticky Web)**: Riduce la Velocità di 1 livello a tutti i Pokémon a terra all'entrata.
* **File**: `src/lib/battle/hazards.ts`, `src/lib/battle/battleActionRunner.ts`, `src/components/BattleScreen.tsx`.

### 🔄 Rimozione Trappole (Rapigiro / Rapid Spin)
* **Regole**: Infligge danno fisico e spazza via completamente tutte le trappole posizionate sulla propria metà campo (Punte, Levitoroccia, Fielepunte, Rete Vischiosa).
* **File**: `src/lib/battle/battleActionRunner.ts` e `src/lib/battle/hazards.ts`.

---

## 6. Mosse con Variazione Statistiche Garantita sull'Utilizzatore

* **Mosse**:
  * **Zuffa (Close Combat)**: -1 Difesa e -1 Difesa Sp. sull'utilizzatore.
  * **Vampata (Overheat)**, **Dragometeora (Draco Meteor)**, **Verdebufera (Leaf Storm)**: -2 Attacco Sp. sull'utilizzatore.
  * **Troppoforte (Superpower)**: -1 Attacco e -1 Difesa sull'utilizzatore.
  * **Danzaspada (Swords Dance)**: +2 Attacco sull'utilizzatore.
  * **Dragodanza (Dragon Dance)**: +1 Attacco e +1 Velocità sull'utilizzatore.
  * **Calmamente (Calm Mind)**: +1 Attacco Sp. e +1 Difesa Sp. sull'utilizzatore.
* **Regole**:
  * La funzione `isSelfStatChange` garantisce che queste modifiche vengano applicate al 100% sull'utilizzatore stesso (anche se il bersaglio va K.O. nello stesso turno o se il bersaglio ha un sostituto).
* **File**: `src/lib/battle/battleActionRunner.ts` (funzione `isSelfStatChange` e loop `applyStatChanges`).

---

## 🧪 Suite di Test Automatici

Tutte queste meccaniche sono coperte da una suite completa di test automatizzati con **Vitest**:
* File test: `src/tests/specialMovesAndMechanics.test.ts` (22 test dedicati a Falsofinale, Sostituto, Meteo, Schermi, Metronomo e Scambio Forzato).
* Esecuzione comandi: `npm test` oppure `npx vitest run src/tests/specialMovesAndMechanics.test.ts`.
