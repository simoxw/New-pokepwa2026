import { describe, it, expect } from 'vitest';
import { canMove, getStatusEffect, applyStatusStatModifiers } from '../lib/battle/statusEffects';
import { Pokemon } from '../types/game';

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

describe('Status Effects', () => {
  describe('canMove', () => {
    it('should allow movement when no status', () => {
      const p = mockPokemon();
      expect(canMove(p).canMove).toBe(true);
    });

    it('should block movement when asleep', () => {
      const p = mockPokemon({ status: 'sleep', statusDuration: 2 });
      const result = canMove(p);
      expect(result.canMove).toBe(false);
      expect(result.newDuration).toBe(1);
    });

    it('should wake up when sleep duration reaches 0', () => {
      const p = mockPokemon({ status: 'sleep', statusDuration: 0 });
      const result = canMove(p);
      expect(result.canMove).toBe(true);
      expect(result.newStatus).toBeUndefined();
    });
  });

  describe('getStatusEffect', () => {
    it('should calculate poison damage correctly', () => {
      const p = mockPokemon({ status: 'poisoned', maxHp: 100 });
      const result = getStatusEffect(p);
      expect(result.damage).toBe(12); // 100 / 8 = 12.5 -> 12
    });

    it('should calculate burn damage correctly', () => {
      const p = mockPokemon({ status: 'burned', maxHp: 100 });
      const result = getStatusEffect(p);
      expect(result.damage).toBe(6); // 100 / 16 = 6.25 -> 6
    });
  });

  describe('applyStatusStatModifiers', () => {
    it('should halve speed when paralyzed', () => {
      const stats = { attack: 100, defense: 100, spAtk: 100, spDef: 100, speed: 100 };
      const result = applyStatusStatModifiers(stats, 'paralyzed');
      expect(result.speed).toBe(50);
    });

    it('should halve attack when burned', () => {
      const stats = { attack: 100, defense: 100, spAtk: 100, spDef: 100, speed: 100 };
      const result = applyStatusStatModifiers(stats, 'burned');
      expect(result.attack).toBe(50);
    });
  });
});
