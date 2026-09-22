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

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStorageReady, setIsStorageReady] = useState(false);

  // Fast initial sync state from localStorage (if any) to prevent initial render lag
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('pokepwa_save');
      if (!saved) return INITIAL_STATE;
      const parsed = JSON.parse(saved);
      return normalizeLoadedState(parsed);
    } catch {
      return INITIAL_STATE;
    }
  });

  // Asynchronous IndexedDB verification & load
  useEffect(() => {
    let isMounted = true;

    async function loadFromIndexedDB() {
      try {
        const idbData = await getStorageItem<any>('pokepwa_save');
        if (idbData && isMounted) {
          const normalized = normalizeLoadedState(idbData);
          setState(normalized);
        }
      } catch (err) {
        console.warn('[GameProvider] Error reading from IndexedDB:', err);
      } finally {
        if (isMounted) {
          setIsStorageReady(true);
        }
      }
    }

    loadFromIndexedDB();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveGame = useCallback(() => {
    // Saves directly to IndexedDB (asynchronous with safe localStorage mirroring)
    setStorageItem('pokepwa_save', state).catch(err => {
      console.error('[GameProvider] Save failed:', err);
    });
  }, [state]);

  useEffect(() => {
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
