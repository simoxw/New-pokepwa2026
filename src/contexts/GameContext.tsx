import React, { createContext, useContext, useEffect, useState } from 'react';
import { GameState, INITIAL_STATE } from '../types/game';

interface GameContextType {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  saveGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('pokepwa_save');
    if (!saved) return INITIAL_STATE;
    try {
      const parsed = JSON.parse(saved);
      const migratePokemon = (p: any) => {
        // Ensure sprites exist and are complete
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

      // Also add any items that are in savedInventory but NOT in INITIAL_STATE (if any)
      savedInventory.forEach(savedItem => {
        if (!inventory.find(i => i.id === savedItem.id)) {
          inventory.push(savedItem);
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
          badges: Array.isArray(parsed.player?.badges) ? parsed.player.badges : INITIAL_STATE.player.badges,
        }
      };
    } catch (e) {
      return INITIAL_STATE;
    }
  });

  const saveGame = React.useCallback(() => {
    localStorage.setItem('pokepwa_save', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    saveGame();
  }, [state, saveGame]);

  const value = React.useMemo(() => ({ state, setState, saveGame }), [state, saveGame]);

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
