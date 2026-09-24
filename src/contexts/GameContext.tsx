import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { GameState, INITIAL_STATE } from '../types/game';
import { getStorageItem, setStorageItem } from '../lib/storage';
import { SPECIAL_EVOLUTIONS } from '../lib/evolution';
import { normalizePokemon } from '../lib/utils';

interface GameContextType {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  saveGame: () => void;
  isStorageReady: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

function normalizeLoadedState(parsed: any): GameState {
  const usedInstanceIds = new Set<string>();

  const migratePokemon = (p: any) => {
    const normalized = normalizePokemon(p);
    
    let instanceId = normalized.instanceId;
    if (!instanceId || usedInstanceIds.has(instanceId)) {
      instanceId = `${normalized.id || 'pkmn'}_${Math.random().toString(36).substring(2, 11)}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    }
    usedInstanceIds.add(instanceId);

    // Fix evolutionInfo if branches missing for multi-branch evolutions (like Eevee)
    let evolutionInfo = normalized.evolutionInfo;
    if (normalized.id && SPECIAL_EVOLUTIONS[normalized.id]) {
      evolutionInfo = SPECIAL_EVOLUTIONS[normalized.id];
    }

    return {
      ...normalized,
      instanceId,
      evolutionInfo: evolutionInfo || normalized.evolutionInfo
    };
  };

  const team = Array.isArray(parsed.player?.team) ? parsed.player.team.map(migratePokemon) : INITIAL_STATE.player.team;
  const box = Array.isArray(parsed.player?.box) ? parsed.player.box.map(migratePokemon) : INITIAL_STATE.player.box;

  // Retroactive Pokedex Fix: ensures all owned Pokemon are marked as caught in the Pokedex
  const pokedex = { ...(parsed.player?.pokedex || INITIAL_STATE.player.pokedex) };
  team.forEach((p: any) => { if (p.id) pokedex[p.id] = 'caught'; });
  box.forEach((p: any) => { if (p.id) pokedex[p.id] = 'caught'; });

  const savedInventory = Array.isArray(parsed.player?.inventory) ? parsed.player.inventory : [];
  const inventoryMap = new Map<string, any>();

  // 1. Initialize with entries from INITIAL_STATE to preserve standard IDs and descriptions
  INITIAL_STATE.player.inventory.forEach(item => {
    inventoryMap.set(item.name.toLowerCase(), { ...item, count: 0 });
  });

  // 2. Merge saved items into the map by name (case-insensitive)
  savedInventory.forEach(savedItem => {
    const nameKey = savedItem.name.toLowerCase();
    const existing = inventoryMap.get(nameKey);
    
    if (existing) {
      existing.count += (savedItem.count || 0);
      // Preserve important properties if missing (like effectValue)
      if (savedItem.effectValue && !existing.effectValue) {
        existing.effectValue = savedItem.effectValue;
      }
    } else {
      inventoryMap.set(nameKey, { ...savedItem });
    }
  });

  // 3. Final inventory list (keep all items, but those with count > 0 will be shown)
  const inventory = Array.from(inventoryMap.values());

  const savedQuests = Array.isArray(parsed.player?.quests) ? parsed.player.quests : [];
  const quests = [...savedQuests];
  INITIAL_STATE.player.quests.forEach(initialQuest => {
    if (!quests.some(q => q.id === initialQuest.id)) {
      quests.push(initialQuest);
    }
  });

  return {
    ...INITIAL_STATE,
    ...parsed,
    player: {
      ...INITIAL_STATE.player,
      ...parsed.player,
      team,
      box,
      pokedex,
      inventory,
      quests,
      badges: Array.isArray(parsed.player?.badges) ? parsed.player.badges : INITIAL_STATE.player.badges,
    }
  };
}

function getInitialGameState(): GameState {
  try {
    // 1. Try primary localStorage
    const saved = localStorage.getItem('pokepwa_save');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.player) {
        return normalizeLoadedState(parsed);
      }
    }

    // 2. Try backup snapshot localStorage
    const backup = localStorage.getItem('pokepwa_save_backup');
    if (backup) {
      const parsedBackup = JSON.parse(backup);
      if (parsedBackup && parsedBackup.player) {
        return normalizeLoadedState(parsedBackup);
      }
    }
  } catch (err) {
    console.error('[GameProvider] Error reading synchronous localStorage:', err);
  }
  return INITIAL_STATE;
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(() => getInitialGameState());
  const [isStorageReady, setIsStorageReady] = useState(true);
  const isFirstMount = React.useRef(true);

  // Background IndexedDB verification & recovery if localStorage was cleared
  useEffect(() => {
    let isMounted = true;

    async function checkIndexedDB() {
      try {
        const idbData = await getStorageItem<any>('pokepwa_save');
        if (idbData && idbData.player && isMounted) {
          setState(current => {
            // If current state in memory has no team but IndexedDB has a valid team, restore it!
            if ((!current.player.team || current.player.team.length === 0) && (idbData.player.team && idbData.player.team.length > 0)) {
              return normalizeLoadedState(idbData);
            }
            return current;
          });
        }
      } catch (err) {
        console.warn('[GameProvider] Error reading from IndexedDB:', err);
      }
    }

    checkIndexedDB();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveGame = useCallback(() => {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem('pokepwa_save', serialized);
      
      // Keep safety backup whenever team has members
      if (state.player && state.player.team && state.player.team.length > 0) {
        localStorage.setItem('pokepwa_save_backup', serialized);
      }
    } catch {
      // LocalStorage quota reached, IndexedDB will handle the full dataset
    }

    // Direct background sync with IndexedDB
    setStorageItem('pokepwa_save', state).catch(err => {
      console.error('[GameProvider] IDB save failed:', err);
    });
  }, [state]);

  // Synchronous autosave on any state changes after the initial mount
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    saveGame();
  }, [state, saveGame]);

  const value = useMemo(() => ({ state, setState, saveGame, isStorageReady }), [state, saveGame, isStorageReady]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
