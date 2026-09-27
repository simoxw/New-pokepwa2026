import { describe, it, expect } from 'vitest';
import { executeMoveAction } from '../lib/battle/battleActionRunner';
import { getMoveByName } from '../data/movesData';
import { Pokemon, BattleStages } from '../types/game';

const mockPokemon = (name: string, overrides: Partial<Pokemon> = {}): Pokemon => ({
  id: 1,
  instanceId: `${name}-id`,
  name,
  level: 50,
  hp: 200,
  maxHp: 200,
  types: ['fighting'],
  sprites: { front: '', back: '', artwork: '', home: '' },
  stats: { attack: 150, defense: 100, spAtk: 100, spDef: 100, speed: 100 },
  baseStats: { hp: 100, attack: 100, defense: 100, spAtk: 100, spDef: 100, speed: 100 },
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

const defaultStages = (): BattleStages => ({
  attack: 0,
  defense: 0,
  spAtk: 0,
  spDef: 0,
  speed: 0,
  accuracy: 0,
  evasion: 0
});

describe('Moves with user stat drops (e.g. Zuffa / Close Combat)', () => {
  it('should lower the USER Defense and SpDef when using Zuffa', () => {
    const user = mockPokemon('Lucario');
    const target = mockPokemon('Snorlax', { hp: 500, maxHp: 500 });
    const zuffa = getMoveByName('Zuffa');

    let userStages = defaultStages();
    let targetStages = defaultStages();
    const setUserStages = (fn: any) => {
      userStages = typeof fn === 'function' ? fn(userStages) : fn;
    };
    const setTargetStages = (fn: any) => {
      targetStages = typeof fn === 'function' ? fn(targetStages) : fn;
    };

    const logs: string[] = [];
    const addLog = (m: string) => logs.push(m);

    executeMoveAction(
      zuffa,
      user,
      target,
      userStages,
      setUserStages,
      targetStages,
      setTargetStages,
      {},
      () => {},
      {},
      () => {},
      {},
      () => {},
      {},
      () => {},
      200,
      () => {},
      500,
      () => {},
      true,
      true,
      addLog
    );

    // User's defense and spDef should decrease by 1
    expect(userStages.defense).toBe(-1);
    expect(userStages.spDef).toBe(-1);
    // Target's defense and spDef should NOT change
    expect(targetStages.defense).toBe(0);
    expect(targetStages.spDef).toBe(0);

    // Logs should mention user's defense and spDef dropped
    expect(logs.some(l => l.includes('Difesa di Lucario cala'))).toBe(true);
    expect(logs.some(l => l.includes('Difesa Sp. di Lucario cala'))).toBe(true);
  });

  it('should lower user stats even if target faints from Zuffa', () => {
    const user = mockPokemon('Lucario');
    const target = mockPokemon('Pikachu', { hp: 10, maxHp: 100 });
    const zuffa = getMoveByName('Zuffa');

    let userStages = defaultStages();
    let targetStages = defaultStages();
    const setUserStages = (fn: any) => {
      userStages = typeof fn === 'function' ? fn(userStages) : fn;
    };
    const setTargetStages = (fn: any) => {
      targetStages = typeof fn === 'function' ? fn(targetStages) : fn;
    };

    const logs: string[] = [];
    const addLog = (m: string) => logs.push(m);

    const result = executeMoveAction(
      zuffa,
      user,
      target,
      userStages,
      setUserStages,
      targetStages,
      setTargetStages,
      {},
      () => {},
      {},
      () => {},
      {},
      () => {},
      {},
      () => {},
      200,
      () => {},
      10,
      () => {},
      true,
      true,
      addLog
    );

    expect(result.targetFainted).toBe(true);
    expect(userStages.defense).toBe(-1);
    expect(userStages.spDef).toBe(-1);
  });
});
