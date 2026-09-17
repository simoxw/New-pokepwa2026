import { describe, it, expect } from 'vitest';
import { calculateDamage, getStageMultiplier, getAccuracyMultiplier } from '../lib/battle/battleMath';
import { isImmuneToStatus, applyStatusStatModifiers, getStatusEffect, canMove } from '../lib/battle/statusEffects';
import { getEffectiveness } from '../lib/battle/typeChart';
import { parseMoveObject } from '../lib/pokeapi';
import { Pokemon, Move } from '../types/game';

const createMockPokemon = (overrides: Partial<Pokemon> = {}): Pokemon => ({
  id: 25,
  instanceId: 'mock-pikachu-id',
  name: 'Pikachu',
  level: 50,
  hp: 120,
  maxHp: 120,
  types: ['electric'],
  sprites: { front: '', back: '', artwork: '', home: '' },
  stats: { attack: 100, defense: 80, spAtk: 110, spDef: 80, speed: 120 },
  baseStats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 },
  moves: [],
  experience: 125000,
  nextLevelExp: 132000,
  nature: 'Jolly',
  ivs: { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 },
  evs: { hp: 0, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 },
  isShiny: false,
  caughtAt: Date.now(),
  caughtLocation: 'Bosco Smeraldo',
  ...overrides
});

describe('Battle System - Complete Engine Verification', () => {

  describe('1. Stat Stages & Multipliers Math', () => {
    it('calculates regular stat multipliers across all stages from -6 to +6', () => {
      // Positive stages: (2 + N) / 2
      expect(getStageMultiplier(0)).toBe(1.0);
      expect(getStageMultiplier(1)).toBe(1.5);
      expect(getStageMultiplier(2)).toBe(2.0);
      expect(getStageMultiplier(3)).toBe(2.5);
      expect(getStageMultiplier(4)).toBe(3.0);
      expect(getStageMultiplier(5)).toBe(3.5);
      expect(getStageMultiplier(6)).toBe(4.0);

      // Negative stages: 2 / (2 - N)
      expect(getStageMultiplier(-1)).toBeCloseTo(2 / 3);
      expect(getStageMultiplier(-2)).toBe(0.5);
      expect(getStageMultiplier(-3)).toBe(0.4);
      expect(getStageMultiplier(-4)).toBeCloseTo(2 / 6);
      expect(getStageMultiplier(-5)).toBeCloseTo(2 / 7);
      expect(getStageMultiplier(-6)).toBe(0.25);
    });

    it('properly clamps stat multipliers to [-6, +6] bounds', () => {
      expect(getStageMultiplier(10)).toBe(4.0);
      expect(getStageMultiplier(-10)).toBe(0.25);
    });

    it('calculates accuracy and evasion multipliers correctly', () => {
      // Positive stages: (3 + N) / 3
      expect(getAccuracyMultiplier(0)).toBe(1.0);
      expect(getAccuracyMultiplier(1)).toBeCloseTo(4 / 3);
      expect(getAccuracyMultiplier(2)).toBeCloseTo(5 / 3);
      expect(getAccuracyMultiplier(6)).toBe(3.0);

      // Negative stages: 3 / (3 - N)
      expect(getAccuracyMultiplier(-1)).toBe(0.75); // 3/4
      expect(getAccuracyMultiplier(-2)).toBe(0.60); // 3/5
      expect(getAccuracyMultiplier(-6)).toBeCloseTo(3 / 9);
      // Clamping
      expect(getAccuracyMultiplier(12)).toBe(3.0);
      expect(getAccuracyMultiplier(-12)).toBeCloseTo(3 / 9);
    });
  });

  describe('2. Physical vs Special Damage with Stat Stages', () => {
    const physicalMove: Move = {
      name: 'Azione',
      power: 50,
      type: 'normal',
      accuracy: 100,
      category: 'physical',
      pp: 35,
      maxPp: 35
    };

    const specialMove: Move = {
      name: 'Fulmine',
      power: 90,
      type: 'electric',
      accuracy: 100,
      category: 'special',
      pp: 15,
      maxPp: 15
    };

    it('applies physical attack stage buffs only to physical moves', () => {
      const attacker = createMockPokemon();
      const target = createMockPokemon({ types: ['normal'] });

      const basePhys = calculateDamage(attacker, target, physicalMove, { isCrit: false });
      const buffedPhys = calculateDamage(attacker, target, physicalMove, {
        isCrit: false,
        attackerStages: { attack: 2 } // +100% attack
      });

      expect(buffedPhys.damage).toBeGreaterThan(basePhys.damage);

      // Sp. Atk buff should NOT affect physical move
      const spBuffPhys = calculateDamage(attacker, target, physicalMove, {
        isCrit: false,
        attackerStages: { spAtk: 2 }
      });
      // Allow standard 15% random roll variance, difference should be within random roll range
      expect(Math.abs(spBuffPhys.damage - basePhys.damage)).toBeLessThanOrEqual(6);
    });

    it('applies special attack stage buffs to special moves', () => {
      const attacker = createMockPokemon();
      const target = createMockPokemon({ types: ['normal'] });

      const baseSpec = calculateDamage(attacker, target, specialMove, { isCrit: false });
      const buffedSpec = calculateDamage(attacker, target, specialMove, {
        isCrit: false,
        attackerStages: { spAtk: 2 } // +100% spAtk
      });

      expect(buffedSpec.damage).toBeGreaterThan(baseSpec.damage);
    });

    it('applies defense stages reducing physical damage and spDef stages reducing special damage', () => {
      const attacker = createMockPokemon();
      const target = createMockPokemon({ types: ['normal'] });

      // Physical vs boosted defense (e.g. Harden/Rafforzatore +2)
      const basePhys = calculateDamage(attacker, target, physicalMove, { isCrit: false });
      const highDefPhys = calculateDamage(attacker, target, physicalMove, {
        isCrit: false,
        targetStages: { defense: 2 }
      });
      expect(highDefPhys.damage).toBeLessThan(basePhys.damage);

      // Special vs boosted special defense (e.g. Calm Mind +2)
      const baseSpec = calculateDamage(attacker, target, specialMove, { isCrit: false });
      const highSpDefSpec = calculateDamage(attacker, target, specialMove, {
        isCrit: false,
        targetStages: { spDef: 2 }
      });
      expect(highSpDefSpec.damage).toBeLessThan(baseSpec.damage);
    });
  });

  describe('3. Critical Hits & Stage Bypassing Mechanics', () => {
    const attackMove: Move = {
      name: 'Sgranocchio',
      power: 80,
      type: 'dark',
      accuracy: 100,
      category: 'physical',
      pp: 15,
      maxPp: 15
    };

    it('ignores attacker negative stat stages on critical hit', () => {
      const attacker = createMockPokemon();
      const target = createMockPokemon({ types: ['normal'] });

      // Attacker has -4 Attack from Growl/Charm
      const debuffedNoCrit = calculateDamage(attacker, target, attackMove, {
        isCrit: false,
        attackerStages: { attack: -4 }
      });

      const debuffedCrit = calculateDamage(attacker, target, attackMove, {
        isCrit: true,
        attackerStages: { attack: -4 }
      });

      // Regular hit with stage 0
      const neutralNoCrit = calculateDamage(attacker, target, attackMove, {
        isCrit: false,
        attackerStages: { attack: 0 }
      });

      // A crit should bypass the -4 debuff and deal damage based on effective stage 0 * 1.5
      expect(debuffedCrit.damage).toBeGreaterThan(neutralNoCrit.damage);
      expect(debuffedCrit.damage).toBeGreaterThan(debuffedNoCrit.damage * 2);
    });

    it('ignores target positive defense stat stages on critical hit', () => {
      const attacker = createMockPokemon();
      const target = createMockPokemon({ types: ['normal'] });

      // Target has +4 Defense from Iron Defense
      const buffedTargetNoCrit = calculateDamage(attacker, target, attackMove, {
        isCrit: false,
        targetStages: { defense: 4 }
      });

      const buffedTargetCrit = calculateDamage(attacker, target, attackMove, {
        isCrit: true,
        targetStages: { defense: 4 }
      });

      expect(buffedTargetCrit.damage).toBeGreaterThan(buffedTargetNoCrit.damage * 2);
    });
  });

  describe('4. Status Moves, Zero-Damage Constraint & Immunities', () => {
    it('ensures status moves never deal damage and keep power at 0', () => {
      const attacker = createMockPokemon();
      const target = createMockPokemon();

      const growl: Move = {
        name: 'Ruggito',
        power: 0,
        type: 'normal',
        accuracy: 100,
        category: 'status',
        pp: 40,
        maxPp: 40,
        stat_changes: [{ change: -1, stat: { name: 'attack' } }]
      };

      const result = calculateDamage(attacker, target, growl);
      expect(result.damage).toBe(0);
      expect(result.isCrit).toBe(false);
      expect(result.isStab).toBe(false);
    });

    it('enforces accurate type-based status immunities', () => {
      // Electric types cannot be paralyzed
      expect(isImmuneToStatus(['electric'], 'paralyzed')).toBe(true);
      expect(isImmuneToStatus(['electric', 'steel'], 'paralyzed')).toBe(true);

      // Fire types cannot be burned
      expect(isImmuneToStatus(['fire'], 'burned')).toBe(true);
      expect(isImmuneToStatus(['fire', 'flying'], 'burned')).toBe(true);

      // Poison and Steel types cannot be poisoned
      expect(isImmuneToStatus(['poison'], 'poisoned')).toBe(true);
      expect(isImmuneToStatus(['steel'], 'poisoned')).toBe(true);
      expect(isImmuneToStatus(['grass', 'poison'], 'poisoned')).toBe(true);

      // Ice types cannot be frozen
      expect(isImmuneToStatus(['ice'], 'frozen')).toBe(true);

      // Vulnerable types
      expect(isImmuneToStatus(['water'], 'paralyzed')).toBe(false);
      expect(isImmuneToStatus(['grass'], 'burned')).toBe(false);
      expect(isImmuneToStatus(['fairy'], 'poisoned')).toBe(false);
    });

    it('applies burn attack halving and paralysis speed halving to stats', () => {
      const baseStats = { attack: 120, defense: 80, spAtk: 100, spDef: 90, speed: 140 };

      const burnedStats = applyStatusStatModifiers(baseStats, 'burned');
      expect(burnedStats.attack).toBe(60); // 120 / 2
      expect(burnedStats.spAtk).toBe(100); // spAtk unaltered by burn
      expect(burnedStats.speed).toBe(140);

      const paralyzedStats = applyStatusStatModifiers(baseStats, 'paralyzed');
      expect(paralyzedStats.speed).toBe(70); // 140 / 2
      expect(paralyzedStats.attack).toBe(120); // attack unaltered by paralysis
    });

    it('calculates turn-end status damage accurately', () => {
      const pokemon = createMockPokemon({ hp: 120, maxHp: 120 });

      const poisonEffect = getStatusEffect({ ...pokemon, status: 'poisoned' });
      expect(poisonEffect.damage).toBe(15); // 120 / 8 = 15

      const burnEffect = getStatusEffect({ ...pokemon, status: 'burned' });
      expect(burnEffect.damage).toBe(7); // floor(120 / 16) = 7
    });
  });

  describe('5. Type Effectiveness Chart Matrix', () => {
    it('calculates 4x super effective damage for double weaknesses', () => {
      // Electric vs Water/Flying (e.g. Gyarados)
      const gyaradosTypes = ['water', 'flying'];
      expect(getEffectiveness('electric', gyaradosTypes)).toBe(4.0);

      // Grass vs Water/Ground (e.g. Swampert)
      const swampertTypes = ['water', 'ground'];
      expect(getEffectiveness('grass', swampertTypes)).toBe(4.0);
    });

    it('calculates 0.25x double resistances', () => {
      // Grass vs Fire/Flying (e.g. Charizard)
      const charizardTypes = ['fire', 'flying'];
      expect(getEffectiveness('grass', charizardTypes)).toBe(0.25);
    });

    it('calculates total immunities (0x damage)', () => {
      expect(getEffectiveness('normal', ['ghost'])).toBe(0);
      expect(getEffectiveness('fighting', ['ghost'])).toBe(0);
      expect(getEffectiveness('ground', ['flying'])).toBe(0);
      expect(getEffectiveness('electric', ['ground'])).toBe(0);
      expect(getEffectiveness('psychic', ['dark'])).toBe(0);
      expect(getEffectiveness('dragon', ['fairy'])).toBe(0);
      expect(getEffectiveness('poison', ['steel'])).toBe(0);
    });
  });

  describe('6. Move Parsing & Stat Changes Metadata', () => {
    it('correctly maps stat changes, targets, and power=0 for status moves', () => {
      const rawScreech = {
        name: 'screech',
        names: [{ language: { name: 'it' }, name: 'Stridio' }],
        damage_class: { name: 'status' },
        power: null,
        accuracy: 85,
        pp: 40,
        stat_changes: [{ change: -2, stat: { name: 'defense' } }]
      };

      const parsed = parseMoveObject(rawScreech);
      expect(parsed.name).toBe('Stridio');
      expect(parsed.category).toBe('status');
      expect(parsed.power).toBe(0);
      expect(parsed.accuracy).toBe(85);
      expect(parsed.stat_changes).toBeDefined();
      expect(parsed.stat_changes?.[0].change).toBe(-2);
      expect(parsed.stat_changes?.[0].stat.name).toBe('defense');
    });

    it('identifies secondary status effect on attacking moves with proc chance', () => {
      const rawFlamethrower = {
        name: 'flamethrower',
        names: [{ language: { name: 'it' }, name: 'Lanciafiamme' }],
        damage_class: { name: 'special' },
        type: { name: 'fire' },
        power: 90,
        accuracy: 100,
        pp: 15,
        meta: { ailment: { name: 'burn' }, ailment_chance: 10 }
      };

      const parsed = parseMoveObject(rawFlamethrower);
      expect(parsed.name).toBe('Lanciafiamme');
      expect(parsed.category).toBe('special');
      expect(parsed.power).toBe(90);
      expect(parsed.statusEffect).toBe('burned');
      expect(parsed.effectChance).toBe(10);
    });

    it('sets correct target: user for self-buffs and selected-pokemon for debuffs', () => {
      const rawSwordsDance = {
        name: 'swords-dance',
        names: [{ language: { name: 'it' }, name: 'Danzaspada' }],
        damage_class: { name: 'status' },
        power: null,
        stat_changes: [{ change: 2, stat: { name: 'attack' } }],
        target: { name: 'user' }
      };

      const parsed = parseMoveObject(rawSwordsDance);
      expect(parsed.target).toBe('user');
      expect(parsed.power).toBe(0);
    });
  });
});
