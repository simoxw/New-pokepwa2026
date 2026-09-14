import { describe, it, expect } from 'vitest';
import { calculateDamage } from '../lib/battle/battleMath';
import { Pokemon, Move } from '../types/game';

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

const mockMove: Move = {
  name: 'Tackle',
  power: 40,
  type: 'normal',
  accuracy: 100
};

describe('Battle Math', () => {
  it('should calculate base damage correctly', () => {
    const attacker = mockPokemon();
    const target = mockPokemon();
    const result = calculateDamage(attacker, target, mockMove, { isCrit: false });
    
    // Con random=1.0, STAB=1.0, effectiveness=1.0
    // L=50, P=40, A=100, D=100
    // Damage = ((((2*50/5)+2) * 40 * 100/100) / 50) + 2 = (((22) * 40) / 50) + 2 = (880 / 50) + 2 = 17 + 2 = 19
    // Ma c'è il fattore random 0.85-1.0
    expect(result.damage).toBeGreaterThanOrEqual(16);
    expect(result.damage).toBeLessThanOrEqual(20);
  });

  it('should apply STAB correctly', () => {
    const attacker = mockPokemon({ types: ['normal'] });
    const target = mockPokemon();
    const result = calculateDamage(attacker, target, mockMove, { isCrit: false });
    
    // 19 * 1.5 = 28.5 -> 28
    expect(result.isStab).toBe(true);
    expect(result.damage).toBeGreaterThanOrEqual(24);
  });

  it('should apply type effectiveness correctly', () => {
    const attacker = mockPokemon();
    const target = mockPokemon({ types: ['rock'] }); // Normal is 0.5 against Rock
    const result = calculateDamage(attacker, target, mockMove, { isCrit: false });
    
    expect(result.effectiveness).toBe(0.5);
    expect(result.damage).toBeLessThan(15);
  });

  it('should apply critical hit correctly', () => {
    const attacker = mockPokemon();
    const target = mockPokemon();
    const normalResult = calculateDamage(attacker, target, mockMove, { isCrit: false });
    const critResult = calculateDamage(attacker, target, mockMove, { isCrit: true });
    
    // Non possiamo testare il valore esatto per via del random, ma il critResult deve essere maggiore del normalResult di circa il 50%
    expect(critResult.isCrit).toBe(true);
    expect(critResult.damage).toBeGreaterThan(normalResult.damage);
  });
});
