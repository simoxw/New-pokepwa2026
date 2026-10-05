import { describe, it, expect } from 'vitest';
import { selectEnemyMove, shouldEnemyUseFullRestore } from '../lib/battle/battleAi';
import { Pokemon, Move, BattleStages } from '../types/game';

describe('Advanced Battle AI and Boss Full Restore Logic', () => {
  const dummyStats = {
    hp: 100,
    attack: 100,
    defense: 100,
    spAtk: 100,
    spDef: 100,
    speed: 100
  };

  const createPokemon = (types: string[], moves: Move[], customHp: number = 200): Pokemon => ({
    id: 1,
    instanceId: 'test-instance',
    name: 'TestMon',
    types,
    level: 50,
    hp: customHp,
    maxHp: customHp,
    stats: { ...dummyStats },
    baseStats: { hp: 50, attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
    sprites: { front: '', back: '', artwork: '', home: '' },
    moves,
    experience: 0,
    nextLevelExp: 1000,
    nature: 'Hardy',
    isShiny: false,
    ivs: { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 },
    evs: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
    caughtAt: Date.now(),
    caughtLocation: 'Test Zone'
  });

  const emptyStages: BattleStages = {
    attack: 0,
    defense: 0,
    spAtk: 0,
    spDef: 0,
    speed: 0,
    accuracy: 0,
    evasion: 0
  };

  it('never uses a 0x immune damaging move when other options exist', () => {
    // Normal & Fighting moves vs Ghost-type player
    const normalMove: Move = {
      name: 'Azione',
      type: 'normal',
      category: 'physical',
      power: 80,
      accuracy: 100,
      pp: 20
    };

    const darkMove: Move = {
      name: 'Morso',
      type: 'dark',
      category: 'physical',
      power: 60,
      accuracy: 100,
      pp: 20
    };

    const enemy = createPokemon(['normal'], [normalMove, darkMove]);
    const ghostPlayer = createPokemon(['ghost'], []);

    const picked = selectEnemyMove(
      [normalMove, darkMove],
      enemy,
      ghostPlayer,
      {},
      {},
      emptyStages,
      emptyStages,
      100,
      100
    );

    expect(picked.name).toBe('Morso'); // Dark hits ghost (super-effective), normal does 0x
  });

  it('favors neutral damaging moves over resisted (eff < 1) moves', () => {
    // Fire move vs Water/Rock player (0.25x or 0.5x)
    const fireMove: Move = {
      name: 'Lanciafiamme',
      type: 'fire',
      category: 'special',
      power: 90,
      accuracy: 100,
      pp: 15
    };

    // Electric move vs Water player (2x)
    const electricMove: Move = {
      name: 'Fulmine',
      type: 'electric',
      category: 'special',
      power: 90,
      accuracy: 100,
      pp: 15
    };

    const enemy = createPokemon(['fire'], [fireMove, electricMove]);
    const waterPlayer = createPokemon(['water'], []);

    const picked = selectEnemyMove(
      [fireMove, electricMove],
      enemy,
      waterPlayer,
      {},
      {},
      emptyStages,
      emptyStages,
      100,
      100
    );

    expect(picked.name).toBe('Fulmine');
  });

  it('does not select a stat-boosting move if stat is already at max +6', () => {
    const swordsDance: Move = {
      name: 'Danzaspada',
      type: 'normal',
      category: 'status',
      power: null,
      accuracy: null,
      pp: 20,
      stat_changes: [{ change: 2, stat: { name: 'attack' } }]
    };

    const slash: Move = {
      name: 'Lacerazione',
      type: 'normal',
      category: 'physical',
      power: 70,
      accuracy: 100,
      pp: 20
    };

    const enemy = createPokemon(['normal'], [swordsDance, slash]);
    const player = createPokemon(['normal'], []);

    // Enemy attack already at +6
    const maxedStages: BattleStages = { ...emptyStages, attack: 6 };

    const picked = selectEnemyMove(
      [swordsDance, slash],
      enemy,
      player,
      {},
      {},
      maxedStages,
      emptyStages,
      100,
      100
    );

    expect(picked.name).toBe('Lacerazione');
  });

  it('does not attempt to inflict a major status on an already afflicted player', () => {
    const thunderWave: Move = {
      name: 'Tuononda',
      type: 'electric',
      category: 'status',
      power: null,
      statusEffect: 'paralyzed',
      accuracy: 100,
      pp: 20
    };

    const spark: Move = {
      name: 'Scintilla',
      type: 'electric',
      category: 'physical',
      power: 65,
      accuracy: 100,
      pp: 20
    };

    const enemy = createPokemon(['electric'], [thunderWave, spark]);
    const player = createPokemon(['water'], []);

    // Player is already burned!
    const picked = selectEnemyMove(
      [thunderWave, spark],
      enemy,
      player,
      {},
      { status: 'burned' },
      emptyStages,
      emptyStages,
      100,
      100
    );

    expect(picked.name).toBe('Scintilla');
  });

  it('shouldEnemyUseFullRestore respects elite status, HP threshold, and heal count', () => {
    // Not elite
    expect(shouldEnemyUseFullRestore(false, 15, 100, 4)).toBe(false);

    // Heals depleted (0 remaining)
    expect(shouldEnemyUseFullRestore(true, 15, 100, 0)).toBe(false);

    // HP too high (e.g. 50% HP)
    expect(shouldEnemyUseFullRestore(true, 50, 100, 4)).toBe(false);

    // HP <= 20% with heals remaining for elite:
    // With 100 trials, should trigger roughly ~30% of the time (between 10% and 55%)
    let triggeredCount = 0;
    const trials = 100;
    for (let i = 0; i < trials; i++) {
      if (shouldEnemyUseFullRestore(true, 18, 100, 4)) {
        triggeredCount++;
      }
    }

    expect(triggeredCount).toBeGreaterThan(10);
    expect(triggeredCount).toBeLessThan(60);
  });
});
