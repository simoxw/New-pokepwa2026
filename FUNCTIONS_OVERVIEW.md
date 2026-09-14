# PokePWA: Functions Overview

## /src/lib/battle/
- `calculateDamage(attacker, target, move)`: Calcola il danno seguendo la formula ufficiale di Pokémon, includendo STAB, critici, efficacia dei tipi e modificatori di stato.
- `canMove(pokemon)`: Determina se un Pokémon può agire in base al suo stato (es. Sonno, Paralisi). Gestisce anche i contatori per il risveglio.
- `getStatusEffect(pokemon)`: Calcola i danni ricorrenti (Veleno, Bruciatura) alla fine del turno.
- `applyStatusStatModifiers(stats, status)`: Applica riduzioni permanenti alle statistiche (es. Velocità dimezzata per Paralisi, Attacco dimezzato per Bruciatura).
- `checkAbility(pokemon, context)`: Gestisce le abilità passive (es. Erbaiuto, Aiutofuoco) che si attivano in risposta a eventi di gioco.
- `useItemInBattle(item, target)`: Gestisce l'uso di strumenti in lotta, incluse Pozioni e Poké Ball con logiche di cattura basate su HP.

## /src/lib/leveling.ts
- `calculateExpGain(winner, loser)`: Calcola i punti XP guadagnati basandosi sui livelli relativi.
- `checkLevelUp(pokemon)`: Gestisce l'aumento di livello, la curva di esperienza ufficiale e l'apprendimento di nuove mosse.
- `applyEvs(pokemon, yieldEvs)`: Applica i punti EV guadagnati sconfiggendo i Pokémon, rispettando i limiti di 252/510.

## /src/data/trainers.ts
- `getTrainer(id)`: Recupera i dati di un allenatore, generando una squadra di Pokémon completa per la sfida.
- `TRAINERS_DATA`: Database degli allenatori disponibili per le sfide.

## /src/components/BattleScreen.tsx
- `handleMove(move)`: Logica principale del turno di lotta, integrata con il sistema di abilità.
- `handleUseItem(item)`: Gestisce l'azione di usare uno strumento consumandolo dall'inventario.
- `handleWin()`: Gestisce XP, EV, ricompense in denaro e il passaggio al Pokémon successivo dell'allenatore avversario.

## /src/lib/pokeapi.ts
- `fetchPokemonData(id)`: Recupera dati completi del Pokémon, inclusi tipi, statistiche e mosse.
- `fetchMoveData(url)`: Recupera i dettagli della mossa con traduzione automatica dei nomi in italiano tramite PokeAPI.
- `MOVE_TRANSLATIONS`: Dizionario di fallback per la localizzazione istantanea delle mosse comuni.

## /src/components/QuestLog.tsx
- `claimReward(questId)`: Gestisce il riscatto delle ricompense per le missioni completate, aggiornando denaro e inventario.
- `QuestCard`: Visualizza i dettagli della missione (obiettivo, categoria, datore) e lo stato attuale.

## /src/components/Inventory.tsx
- `applyItemToPokemon(instanceId)`: Gestisce l'uso di strumenti curativi o caramelle rare. Ora include il trigger per l'apprendimento mosse su aumento di livello.

## /src/components/Shop.tsx
- `buyItem(item, quantity)`: Gestisce l'acquisto di strumenti verificando la disponibilità di PokéDollari.

## /src/components/Trade.tsx
- `executeTrade(pokemonId)`: Sistema di scambio che permette di ottenere Pokémon rari o esclusivi in cambio di altri.

## /src/components/Box.tsx
- `depositPokemon / withdrawPokemon`: Logica per spostare Pokémon tra la squadra attiva e il sistema di archiviazione PC.
