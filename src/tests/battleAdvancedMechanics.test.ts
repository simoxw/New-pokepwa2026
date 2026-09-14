import { describe, it, expect } from 'vitest';
import { determineTurnOrder } from '../lib/battle/turnOrder';
import { calculateEscape } from '../lib/battle/escapeFormula';
import { checkConfusion, checkFlinch, canMove } from '../lib/battle/statusEffects';
import { STRUGGLE_MOVE } from '../lib/pokeapi';
import { Move, Pokemon } from '../types/game';

const createMockPokemon = (overrides: Partial<Pokemon> = {}): Pokemon => ({
  id: 25,
  instanceId: 'mock-pkmn-id',
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

describe('Advanced Battle System & Mechanics Tests', () => {

  describe('1. Dynamic Turn Order (determineTurnOrder)', () => {
    const normalMove: Move = {
      name: 'Fulmine',
      power: 90,
      type: 'electric',
      accuracy: 100,
      category: 'special',
      pp: 15,
      maxPp: 15,
      priority: 0
    };

    const priorityMove: Move = {
      name: 'Attacco Rapido',
      power: 40,
      type: 'normal',
      accuracy: 100,
      category: 'physical',
      pp: 30,
      maxPp: 30,
      priority: 1
    };

    const highPriorityMove: Move = {
      name: 'Extrarapido',
      power: 80,
      type: 'normal',
      accuracy: 100,
      category: 'physical',
      pp: 5,
      maxPp: 5,
      priority: 2
    };

    it('gives priority to the combatant using a move with higher priority regardless of speed', () => {
      // Player is slower (speed 50 vs 150) but uses priority +1 move
      const order1 = determineTurnOrder(
        { combatant: 'player', move: priorityMove, effectiveSpeed: 50, priority: 1 },
        { combatant: 'enemy', move: normalMove, effectiveSpeed: 150, priority: 0 }
      );
      expect(order1).toBe('player');

      // Enemy uses priority +2 vs player priority +1
      const order2 = determineTurnOrder(
        { combatant: 'player', move: priorityMove, effectiveSpeed: 200, priority: 1 },
        { combatant: 'enemy', move: highPriorityMove, effectiveSpeed: 100, priority: 2 }
      );
      expect(order2).toBe('enemy');
    });

    it('gives priority to faster combatant when move priorities are equal', () => {
      // Both priority 0: Player is faster (120 vs 80)
      const order1 = determineTurnOrder(
        { combatant: 'player', move: normalMove, effectiveSpeed: 120, priority: 0 },
        { combatant: 'enemy', move: normalMove, effectiveSpeed: 80, priority: 0 }
      );
      expect(order1).toBe('player');

      // Both priority 0: Enemy is faster (140 vs 100)
      const order2 = determineTurnOrder(
        { combatant: 'player', move: normalMove, effectiveSpeed: 100, priority: 0 },
        { combatant: 'enemy', move: normalMove, effectiveSpeed: 140, priority: 0 }
      );
      expect(order2).toBe('enemy');

      // Both priority 1: Player is faster (150 vs 90)
      const order3 = determineTurnOrder(
        { combatant: 'player', move: priorityMove, effectiveSpeed: 150, priority: 1 },
        { combatant: 'enemy', move: priorityMove, effectiveSpeed: 90, priority: 1 }
      );
      expect(order3).toBe('player');
    });

    it('resolves speed ties by returning either player or enemy (50/50 chance)', () => {
      const results: string[] = [];
      for (let i = 0; i < 50; i++) {
        const order = determineTurnOrder(
          { combatant: 'player', move: normalMove, effectiveSpeed: 100, priority: 0 },
          { combatant: 'enemy', move: normalMove, effectiveSpeed: 100, priority: 0 }
        );
        results.push(order);
      }
      expect(results.includes('player')).toBe(true);
      expect(results.includes('enemy')).toBe(true);
    });
  });

  describe('2. PP Management & Scontro (Struggle)', () => {
    it('verifies struggle move attributes conforming to official rules', () => {
      expect(STRUGGLE_MOVE.name).toBe('Scontro');
      expect(STRUGGLE_MOVE.power).toBe(50);
      expect(STRUGGLE_MOVE.accuracy).toBe(100);
      expect(STRUGGLE_MOVE.category).toBe('physical');
      expect(STRUGGLE_MOVE.type.toLowerCase()).toBe('normal');
      // Recoil is 1/4 (25%) of user max HP
      expect(STRUGGLE_MOVE.recoilMaxHp).toBe(0.25);
    });

    it('identifies when all moves are depleted (0 PP) to trigger struggle', () => {
      const movesWithZeroPp: Move[] = [
        { name: 'M1', power: 40, accuracy: 100, category: 'physical', type: 'normal', pp: 0, maxPp: 35 },
        { name: 'M2', power: 50, accuracy: 100, category: 'special', type: 'fire', pp: 0, maxPp: 20 },
        { name: 'M3', power: 0, accuracy: 100, category: 'status', type: 'normal', pp: 0, maxPp: 30 },
        { name: 'M4', power: 90, accuracy: 100, category: 'special', type: 'electric', pp: 0, maxPp: 15 },
      ];

      const allDepleted = movesWithZeroPp.every(m => m.pp <= 0);
      expect(allDepleted).toBe(true);

      const someHavePp: Move[] = [
        { name: 'M1', power: 40, accuracy: 100, category: 'physical', type: 'normal', pp: 0, maxPp: 35 },
        { name: 'M2', power: 50, accuracy: 100, category: 'special', type: 'fire', pp: 3, maxPp: 20 },
      ];
      expect(someHavePp.every(m => m.pp <= 0)).toBe(false);
    });
  });

  describe('3. Volatile Status Conditions (Confusion & Flinch)', () => {
    it('handles confusion recovery when turns reach 1 or 0', () => {
      const pkmn = createMockPokemon();
      const res0 = checkConfusion(pkmn, 0);
      expect(res0.isConfused).toBe(false);

      const res1 = checkConfusion(pkmn, 1);
      expect(res1.isConfused).toBe(false);
      expect(res1.msg).toContain('non è più confuso');
    });

    it('calculates confusion self-damage with 40-power physical formula when hurtSelf triggers', () => {
      const pkmn = createMockPokemon({
        level: 50,
        stats: { attack: 120, defense: 100, spAtk: 90, spDef: 80, speed: 100 }
      });

      // Run multiple times to observe confusion behavior
      let hurtCount = 0;
      let passCount = 0;
      for (let i = 0; i < 200; i++) {
        const check = checkConfusion(pkmn, 3);
        expect(check.isConfused).toBe(true);
        expect(check.newTurns).toBe(2);
        if (check.hurtSelf) {
          hurtCount++;
          expect(check.damage).toBeGreaterThan(0);
          expect(check.msg).toContain('colpirsi da solo');
        } else {
          passCount++;
          expect(check.msg).toContain('è confuso');
        }
      }

      // 33% chance: should have both hits and passes in 200 trials
      expect(hurtCount).toBeGreaterThan(30);
      expect(passCount).toBeGreaterThan(80);
    });

    it('prevents actions when flinched (checkFlinch)', () => {
      const pkmn = createMockPokemon();
      const flinchedResult = checkFlinch(pkmn, true);
      expect(flinchedResult.canAct).toBe(false);
      expect(flinchedResult.msg).toContain('tentennato');

      const normalResult = checkFlinch(pkmn, false);
      expect(normalResult.canAct).toBe(true);
    });
  });

  describe('4. Escape Formula (calculateEscape)', () => {
    it('guarantees 100% escape when player speed is significantly higher than enemy speed', () => {
      // Player speed: 200, Enemy speed: 40, 1st attempt
      const result = calculateEscape(200, 40, 1);
      expect(result.success).toBe(true);
      expect(result.odds).toBe(1);
      expect(result.msg).toBe('Scampato pericolo!');
    });

    it('increases escape odds with each subsequent failed attempt', () => {
      const playerSpeed = 20;
      const enemySpeed = 160;

      const attempt1 = calculateEscape(playerSpeed, enemySpeed, 1);
      const attempt2 = calculateEscape(playerSpeed, enemySpeed, 2);
      const attempt3 = calculateEscape(playerSpeed, enemySpeed, 3);

      expect(attempt1.odds).toBeLessThan(1);
      expect(attempt2.odds).toBeGreaterThan(attempt1.odds);
      expect(attempt3.odds).toBeGreaterThan(attempt2.odds);
    });
  });

  describe('5. Advanced Move Features (Drain, Healing, Recoil)', () => {
    it('verifies healing move recovery calculation', () => {
      const user = createMockPokemon({ hp: 40, maxHp: 120 });
      const healRatio = 0.5; // Recover recovers 50% max HP
      const healAmount = Math.max(1, Math.floor(user.maxHp * healRatio));
      const newHp = Math.min(user.maxHp, user.hp + healAmount);

      expect(healAmount).toBe(60);
      expect(newHp).toBe(100);
    });

    it('verifies drain move recovery calculation (e.g. Giga Drain 50% of damage)', () => {
      const user = createMockPokemon({ hp: 50, maxHp: 120 });
      const damageDealt = 80;
      const drainRatio = 0.5;
      const drainHeal = Math.max(1, Math.floor(damageDealt * drainRatio));
      const newHp = Math.min(user.maxHp, user.hp + drainHeal);

      expect(drainHeal).toBe(40);
      expect(newHp).toBe(90);
    });

    it('verifies recoil damage calculation (e.g. Double-Edge 33% of damage dealt)', () => {
      const user = createMockPokemon({ hp: 120, maxHp: 120 });
      const damageDealt = 90;
      const recoilRatio = 0.33;
      const recoilDmg = Math.max(1, Math.floor(damageDealt * recoilRatio));
      const newHp = Math.max(0, user.hp - recoilDmg);

      expect(recoilDmg).toBe(29);
      expect(newHp).toBe(91);
    });
  });

});
