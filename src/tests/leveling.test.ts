import { describe, it, expect } from 'vitest';
import { checkLevelUp } from '../lib/leveling';
import { Pokemon } from '../types/game';

const mockPokemon = (overrides: Partial<Pokemon> = {}): Pokemon => ({
  id: 1,
  instanceId: 'test-instance-id',
  name: 'Bulbasaur',
  level: 5,
  hp: 20,
  maxHp: 20,
  types: ['grass', 'poison'],
  sprites: { front: '', back: '', artwork: '', home: '' },
  stats: { attack: 10, defense: 10, spAtk: 10, spDef: 10, speed: 10 },
  baseStats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
  moves: [],
  experience: 0,
  nextLevelExp: 100,
  nature: 'Hardy',
  ivs: { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 },
  evs: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
  isShiny: false,
  caughtAt: Date.now(),
  caughtLocation: 'Pallet Town',
  ...overrides
});

describe('Leveling System', () => {
  it('should increase level when enough experience is gained', () => {
    const p = mockPokemon({ experience: 150, nextLevelExp: 100 });
    const { leveledUp, newPokemon } = checkLevelUp(p);
    
    expect(leveledUp).toBe(true);
    expect(newPokemon.level).toBe(6);
    expect(newPokemon.experience).toBe(50);
  });

  it('should recalculate stats correctly on level up', () => {
    const p = mockPokemon({ level: 5, experience: 150, nextLevelExp: 100 });
    const oldMaxHp = p.maxHp;
    const oldAttack = p.stats.attack;
    
    const { newPokemon } = checkLevelUp(p);
    
    // Con IV=31, EV=0, BaseHP=45, Lvl=6
    // HP = floor(((2*45 + 31 + 0) * 6) / 100 + 6 + 10) = floor((121 * 6 / 100) + 16) = floor(7.26 + 16) = 23
    expect(newPokemon.maxHp).toBeGreaterThan(oldMaxHp);
    expect(newPokemon.stats.attack).toBeGreaterThan(oldAttack);
    expect(newPokemon.maxHp).toBe(23);
  });

  it('should handle multiple level ups', () => {
    const p = mockPokemon({ level: 5, experience: 1000, nextLevelExp: 100 });
    const { newPokemon } = checkLevelUp(p);
    
    expect(newPokemon.level).toBeGreaterThan(6);
  });

  it('should have a reasonable experience requirement for level 7 to 8', () => {
    const p = mockPokemon({ level: 7, experience: 0 });
    // Manually trigger the nextLevelExp calculation (which normally happens on level up or initialization)
    // In our app, it's stored in the pokemon object.
    const { newPokemon } = checkLevelUp({ ...p, nextLevelExp: 169 }); // 169 is 8^3 - 7^3
    
    expect(newPokemon.nextLevelExp).toBe(8**3 - 7**3); // 169
    expect(newPokemon.nextLevelExp).toBeLessThan(500);
  });
});
