import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { GameState, INITIAL_STATE } from '../types/game';
import { getStorageItem, setStorageItem } from '../lib/storage';

interface GameContextType {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  saveGame: () => void;
  isStorageReady: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

function normalizeLoadedState(parsed: any): GameState {
  const migratePokemon = (p: any) => {
    const sprites = p.sprites || {};
    const baseSprites = {
      front: sprites.front || p.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
      back: sprites.back || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${p.id}.png`,
      artwork: sprites.artwork || p.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`,
      home: sprites.home || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${p.id}.png`,
      animated: sprites.animated
    };

    return {
      ...p,
      sprites: baseSprites,
      stats: p.stats || { attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
      ivs: p.ivs || { hp: 15, attack: 15, defense: 15, spAtk: 15, spDef: 15, speed: 15 },
      evs: p.evs || { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 }
    };
  };

  const team = Array.isArray(parsed.player?.team) ? parsed.player.team.map(migratePokemon) : INITIAL_STATE.player.team;
  const box = Array.isArray(parsed.player?.box) ? parsed.player.box.map(migratePokemon) : INITIAL_STATE.player.box;

  const savedInventory = Array.isArray(parsed.player?.inventory) ? parsed.player.inventory : [];
  const inventory = INITIAL_STATE.player.inventory.map(initialItem => {
    const savedItem = savedInventory.find(i => i.id === initialItem.id);
    return savedItem ? { ...initialItem, ...savedItem } : initialItem;
  });

  savedInventory.forEach(savedItem => {
    if (!inventory.find(i => i.id === savedItem.id)) {
      inventory.push(savedItem);
    }
  });

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
      pokedex: parsed.player?.pokedex || INITIAL_STATE.player.pokedex,
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
