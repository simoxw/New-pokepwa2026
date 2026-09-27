import { describe, it, expect } from 'vitest';
import { useItemInBattle } from '../lib/battle/items';
import { Pokemon, Item } from '../types/game';

const mockPokemon = (overrides: Partial<Pokemon> = {}): Pokemon => ({
  id: 1,
  instanceId: 'test-instance-id',
  name: 'Bulbasaur',
  level: 50,
  hp: 100,
  maxHp: 100,
  types: ['grass', 'poison'],
  sprites: { front: '', back: '', artwork: '', home: '' },
  stats: { attack: 100, defense: 100, spAtk: 100, spDef: 100, speed: 100 },
  baseStats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
  moves: [],
  experience: 0,
  nextLevelExp: 1000,
  nature: 'Hardy',
  ivs: { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 },
  evs: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
  isShiny: false,
  caughtAt: Date.now(),
  caughtLocation: 'Pallet Town',
  ...overrides
});

describe('Cura Totale (Full Heal) Item Logic', () => {
  it('should successfully cure status in battle', () => {
    const asleepPokemon = mockPokemon({ status: 'sleep' });
    const curaTotaleItem: Item = {
      id: 'cura-totale',
      name: 'Cura Totale',
      description: 'Risolve tutti i problemi di stato di un Pokémon.',
      type: 'healing',
      count: 1
    };

    const result = useItemInBattle(curaTotaleItem, asleepPokemon);
    expect(result.success).toBe(true);
    expect(result.consumed).toBe(true);
  });

  it('should fail to cure if pokemon has no status in battle', () => {
    const healthyPokemon = mockPokemon();
    const curaTotaleItem: Item = {
      id: 'cura-totale',
      name: 'Cura Totale',
      description: 'Risolve tutti i problemi di stato di un Pokémon.',
      type: 'healing',
      count: 1
    };

    const result = useItemInBattle(curaTotaleItem, healthyPokemon);
    expect(result.success).toBe(false);
    expect(result.consumed).toBe(false);
  });
});
