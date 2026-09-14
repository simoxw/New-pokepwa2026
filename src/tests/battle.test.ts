import { describe, it, expect } from 'vitest';
import { calculateDamage, getStageMultiplier, getAccuracyMultiplier } from '../lib/battle/battleMath';
import { isImmuneToStatus } from '../lib/battle/statusEffects';
import { parseMoveObject } from '../lib/pokeapi';
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
    
    expect(result.damage).toBeGreaterThanOrEqual(16);
    expect(result.damage).toBeLessThanOrEqual(20);
  });

  it('should apply STAB correctly', () => {
    const attacker = mockPokemon({ types: ['normal'] });
    const target = mockPokemon();
    const result = calculateDamage(attacker, target, mockMove, { isCrit: false });
    
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
    
    expect(critResult.isCrit).toBe(true);
    expect(critResult.damage).toBeGreaterThan(normalResult.damage);
  });

  it('should deal 0 damage for status moves', () => {
    const attacker = mockPokemon();
    const target = mockPokemon();
    const statusMove: Move = {
      name: 'Ruggito',
      power: 0,
      type: 'normal',
      accuracy: 100,
      category: 'status',
      stat_changes: [{ change: -1, stat: { name: 'attack' } }]
    };
    const result = calculateDamage(attacker, target, statusMove);
    expect(result.damage).toBe(0);
    expect(result.effectiveness).toBe(1);
  });

  it('should calculate stat stages and multipliers correctly', () => {
    expect(getStageMultiplier(0)).toBe(1);
    expect(getStageMultiplier(1)).toBe(1.5);
    expect(getStageMultiplier(2)).toBe(2);
    expect(getStageMultiplier(-1)).toBeCloseTo(2 / 3);
    expect(getStageMultiplier(-2)).toBe(0.5);
    expect(getStageMultiplier(6)).toBe(4);
    expect(getStageMultiplier(-6)).toBe(0.25);

    expect(getAccuracyMultiplier(0)).toBe(1);
    expect(getAccuracyMultiplier(1)).toBe(4 / 3);
    expect(getAccuracyMultiplier(-1)).toBe(0.75);
  });

  it('should increase damage when attacker has attack buff stages', () => {
    const attacker = mockPokemon();
    const target = mockPokemon();
    const unbuffed = calculateDamage(attacker, target, mockMove, { isCrit: false });
    const buffed = calculateDamage(attacker, target, mockMove, {
      isCrit: false,
      attackerStages: { attack: 2 }
    });
    expect(buffed.damage).toBeGreaterThan(unbuffed.damage);
  });

  it('should correctly determine status immunity', () => {
    expect(isImmuneToStatus(['electric'], 'paralyzed')).toBe(true);
    expect(isImmuneToStatus(['fire'], 'burned')).toBe(true);
    expect(isImmuneToStatus(['poison'], 'poisoned')).toBe(true);
    expect(isImmuneToStatus(['steel'], 'poisoned')).toBe(true);
    expect(isImmuneToStatus(['water'], 'paralyzed')).toBe(false);
  });

  it('should correctly parse status moves with parseMoveObject', () => {
    const growl = parseMoveObject({
      name: 'growl',
      names: [{ language: { name: 'it' }, name: 'Ruggito' }],
      damage_class: { name: 'status' },
      power: null,
      accuracy: 100,
      pp: 40,
      stat_changes: [{ change: -1, stat: { name: 'attack' } }]
    });

    expect(growl.name).toBe('Ruggito');
    expect(growl.category).toBe('status');
    expect(growl.power).toBe(0);
    expect(growl.stat_changes?.[0].change).toBe(-1);
    expect(growl.stat_changes?.[0].stat.name).toBe('attack');

    const thunderWave = parseMoveObject({
      name: 'thunder-wave',
      damage_class: { name: 'status' },
      meta: { ailment: { name: 'paralysis' } }
    });

    expect(thunderWave.category).toBe('status');
    expect(thunderWave.statusEffect).toBe('paralyzed');
    expect(thunderWave.power).toBe(0);
  });
});
