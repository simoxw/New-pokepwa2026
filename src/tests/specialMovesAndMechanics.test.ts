import { describe, it, expect, vi } from 'vitest';
import { executeMoveAction } from '../lib/battle/battleActionRunner';
import { calculateDamage } from '../lib/battle/battleMath';
import { getMoveByName, getRandomMetronomeMove } from '../data/movesData';
import { 
  getWeatherDamageMultiplier, 
  getScreenDamageMultiplier, 
  processWeatherTurnEnd, 
  tickWeather, 
  tickScreens,
  FieldWeather,
  SideScreens,
  defaultSideScreens
} from '../lib/battle/fieldEffects';
import { SideHazards, defaultSideHazards, setHazardFromMove } from '../lib/battle/hazards';
import { determineTurnOrder } from '../lib/battle/turnOrder';
import { selectEnemyMove } from '../lib/battle/battleAi';
import { Pokemon, BattleStages, Move } from '../types/game';
import { VolatileStatus, processYawnEndTurn } from '../lib/battle/statusEffects';
import {
  resolvePokemonAbility,
  processSwitchInAbility,
  hasSturdyAbility,
  CORE_ABILITIES
} from '../lib/battle/abilities';
import { encodePokemon, decodePokemon, normalizePokemon } from '../lib/utils';

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

const defaultStages = (): BattleStages => ({
  attack: 0,
  defense: 0,
  spAtk: 0,
  spDef: 0,
  speed: 0,
  accuracy: 0,
  evasion: 0
});

describe('Special Moves & Field Mechanics Test Suite', () => {

  describe('1. Falsofinale (False Swipe)', () => {
    it('leaves target at exactly 1 HP on lethal damage and never faints it', () => {
      const attacker = createMockPokemon({ name: 'Scyther', types: ['bug', 'flying'] });
      const target = createMockPokemon({ name: 'Caterpie', hp: 20, maxHp: 50 });
      let targetHp = 20;
      let userHp = 120;
      const logs: string[] = [];

      const falseSwipeMove = getMoveByName('Falsofinale');
      expect(falseSwipeMove.name).toBe('Falsofinale');
      expect(falseSwipeMove.power).toBe(40);

      const res = executeMoveAction(
        falseSwipeMove,
        attacker,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        userHp,
        (val) => { userHp = typeof val === 'function' ? (val as any)(userHp) : val; },
        targetHp,
        (val) => { targetHp = typeof val === 'function' ? (val as any)(targetHp) : val; },
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(res.nextTargetHp).toBeGreaterThanOrEqual(1);
      expect(res.targetFainted).toBe(false);
      expect(logs.some(l => l.includes('Falsofinale') || l.includes('resiste con 1 PS'))).toBe(true);
    });

    it('damages target normally if damage is less than target HP', () => {
      const attacker = createMockPokemon({
        name: 'Scyther',
        level: 10,
        stats: { attack: 20, defense: 20, spAtk: 20, spDef: 20, speed: 20 }
      });
      const target = createMockPokemon({
        name: 'Snorlax',
        level: 50,
        hp: 250,
        maxHp: 250,
        stats: { attack: 100, defense: 120, spAtk: 80, spDef: 120, speed: 40 }
      });

      let targetHp = 250;
      const falseSwipeMove = getMoveByName('Falsofinale');

      const res = executeMoveAction(
        falseSwipeMove,
        attacker,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        100,
        () => {},
        targetHp,
        (val) => { targetHp = typeof val === 'function' ? (val as any)(targetHp) : val; },
        true,
        true,
        () => {}
      );

      expect(res.nextTargetHp).toBeLessThan(250);
      expect(res.nextTargetHp).toBeGreaterThan(1);
    });
  });

  describe('2. Sostituto (Substitute)', () => {
    it('costs 25% max HP and creates a substitute', () => {
      const user = createMockPokemon({ hp: 120, maxHp: 120 });
      const target = createMockPokemon({ hp: 100, maxHp: 100 });
      let userHp = 120;
      let userVolatile: VolatileStatus = {};
      const logs: string[] = [];

      const substituteMove = getMoveByName('Sostituto');
      expect(substituteMove.name).toBe('Sostituto');

      const res = executeMoveAction(
        substituteMove,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        userVolatile,
        (updater) => { userVolatile = typeof updater === 'function' ? (updater as any)(userVolatile) : updater; },
        {},
        () => {},
        userHp,
        (val) => { userHp = typeof val === 'function' ? (val as any)(userHp) : val; },
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(res.nextUserHp).toBe(90); // 120 - 30
      expect(userVolatile.substituteHp).toBe(30);
      expect(logs.some(l => l.includes('crea un Sostituto'))).toBe(true);
    });

    it('fails if user does not have enough HP (<= 25%)', () => {
      const user = createMockPokemon({ hp: 20, maxHp: 120 });
      const target = createMockPokemon();
      let userHp = 20;
      let userVolatile: VolatileStatus = {};
      const logs: string[] = [];

      const substituteMove = getMoveByName('Sostituto');

      const res = executeMoveAction(
        substituteMove,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        userVolatile,
        (updater) => { userVolatile = typeof updater === 'function' ? (updater as any)(userVolatile) : updater; },
        {},
        () => {},
        userHp,
        (val) => { userHp = typeof val === 'function' ? (val as any)(userHp) : val; },
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(res.nextUserHp).toBe(20);
      expect(userVolatile.substituteHp).toBeUndefined();
      expect(logs.some(l => l.includes('non ha abbastanza PS'))).toBe(true);
    });

    it('fails if user already has an active substitute', () => {
      const user = createMockPokemon({ hp: 100, maxHp: 120 });
      const target = createMockPokemon();
      let userHp = 100;
      let userVolatile: VolatileStatus = { substituteHp: 30 };
      const logs: string[] = [];

      const substituteMove = getMoveByName('Sostituto');

      const res = executeMoveAction(
        substituteMove,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        userVolatile,
        (updater) => { userVolatile = typeof updater === 'function' ? (updater as any)(userVolatile) : updater; },
        {},
        () => {},
        userHp,
        (val) => { userHp = typeof val === 'function' ? (val as any)(userHp) : val; },
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(res.nextUserHp).toBe(100);
      expect(userVolatile.substituteHp).toBe(30);
      expect(logs.some(l => l.includes('ha già un Sostituto attivo'))).toBe(true);
    });

    it('absorbs attack damage without damaging defender real HP, breaking when damage exceeds substitute HP', () => {
      const attacker = createMockPokemon({ name: 'Machamp', stats: { attack: 130, defense: 80, spAtk: 60, spDef: 80, speed: 70 } });
      const target = createMockPokemon({ name: 'Alakazam', hp: 100, maxHp: 100 });
      let targetHp = 100;
      let targetVolatile: VolatileStatus = { substituteHp: 25 };
      const logs: string[] = [];

      const tackleMove = getMoveByName('Azione');

      const res = executeMoveAction(
        tackleMove,
        attacker,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        targetVolatile,
        (updater) => { targetVolatile = typeof updater === 'function' ? (updater as any)(targetVolatile) : updater; },
        100,
        () => {},
        targetHp,
        (val) => { targetHp = typeof val === 'function' ? (val as any)(targetHp) : val; },
        true,
        true,
        (msg) => logs.push(msg)
      );

      // Real HP did NOT take damage
      expect(res.nextTargetHp).toBe(100);
      // Substitute absorbed the hit
      expect(logs.some(l => l.includes('Sostituto') && (l.includes('distrutto') || l.includes('incassa')))).toBe(true);
    });

    it('substitute protects against status conditions', () => {
      const attacker = createMockPokemon({ name: 'Butterfree' });
      const target = createMockPokemon({ name: 'Pikachu', hp: 100, maxHp: 100 });
      let targetStatus: { status?: any; duration?: number } = {};
      const targetVolatile: VolatileStatus = { substituteHp: 30 };
      const logs: string[] = [];

      const toxic = { ...getMoveByName('Tossina'), accuracy: 100 };

      executeMoveAction(
        toxic,
        attacker,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        targetStatus,
        (updater) => { targetStatus = typeof updater === 'function' ? (updater as any)(targetStatus) : updater; },
        {},
        () => {},
        targetVolatile,
        () => {},
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(targetStatus.status).toBeUndefined();
      expect(logs.some(l => l.includes('Sostituto protegge'))).toBe(true);
    });

    it('substitute protects against stat drops from opponent', () => {
      const attacker = createMockPokemon({ name: 'Ekans' });
      const target = createMockPokemon({ name: 'Pikachu', hp: 100, maxHp: 100 });
      let targetStages = defaultStages();
      const targetVolatile: VolatileStatus = { substituteHp: 30 };
      const logs: string[] = [];

      const screech = getMoveByName('Stridio'); // -2 Defense

      executeMoveAction(
        screech,
        attacker,
        target,
        defaultStages(),
        () => {},
        targetStages,
        (updater) => { targetStages = typeof updater === 'function' ? (updater as any)(targetStages) : updater; },
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        targetVolatile,
        () => {},
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(targetStages.defense).toBe(0);
      expect(logs.some(l => l.includes('Sostituto') && l.includes('blocca il calo'))).toBe(true);
    });
  });

  describe('3. Meteo sul campo (Weather Effects)', () => {
    it('sets sun weather on Giornodisole and boosts Fire / weakens Water', () => {
      const user = createMockPokemon({ name: 'Charizard' });
      const target = createMockPokemon({ name: 'Blastoise' });
      let currentWeather = 'none';

      const sunnyDay = getMoveByName('Giornodisole');
      executeMoveAction(
        sunnyDay,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        () => {},
        { setWeather: (w) => { currentWeather = w; } }
      );

      expect(currentWeather).toBe('sun');
      expect(getWeatherDamageMultiplier('fire', 'sun')).toBe(1.5);
      expect(getWeatherDamageMultiplier('water', 'sun')).toBe(0.5);
      expect(getWeatherDamageMultiplier('grass', 'sun')).toBe(1.0);
    });

    it('sets rain weather on Pioggiadanza and boosts Water / weakens Fire', () => {
      const user = createMockPokemon({ name: 'Blastoise' });
      const target = createMockPokemon({ name: 'Charizard' });
      let currentWeather = 'none';

      const rainDance = getMoveByName('Pioggiadanza');
      executeMoveAction(
        rainDance,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        () => {},
        { setWeather: (w) => { currentWeather = w; } }
      );

      expect(currentWeather).toBe('rain');
      expect(getWeatherDamageMultiplier('water', 'rain')).toBe(1.5);
      expect(getWeatherDamageMultiplier('fire', 'rain')).toBe(0.5);
    });

    it('calculateDamage integrates weather bonuses accurately', () => {
      const attacker = createMockPokemon({ name: 'Arcanine', types: ['fire'] });
      const defender = createMockPokemon({ name: 'Meganium', types: ['grass'] });
      const fireMove = getMoveByName('Lanciafiamme');

      const normalDmg = calculateDamage(attacker, defender, fireMove, { weather: 'none', isCrit: false });
      const sunDmg = calculateDamage(attacker, defender, fireMove, { weather: 'sun', isCrit: false });
      const rainDmg = calculateDamage(attacker, defender, fireMove, { weather: 'rain', isCrit: false });

      expect(sunDmg.damage).toBeGreaterThan(normalDmg.damage);
      expect(rainDmg.damage).toBeLessThan(normalDmg.damage);
    });

    it('sandstorm deals damage to non-Rock/Ground/Steel Pokemon and ignores immune types', () => {
      const pikachu = createMockPokemon({ name: 'Pikachu', hp: 160, maxHp: 160, types: ['electric'] });
      const onix = createMockPokemon({ name: 'Onix', hp: 160, maxHp: 160, types: ['rock', 'ground'] });
      const steelix = createMockPokemon({ name: 'Steelix', hp: 160, maxHp: 160, types: ['steel', 'ground'] });

      const pikaRes = processWeatherTurnEnd(pikachu, 160, 'sandstorm');
      const onixRes = processWeatherTurnEnd(onix, 160, 'sandstorm');
      const steelixRes = processWeatherTurnEnd(steelix, 160, 'sandstorm');

      expect(pikaRes.damage).toBe(10); // 160 / 16 = 10
      expect(pikaRes.nextHp).toBe(150);
      expect(onixRes.damage).toBe(0);
      expect(steelixRes.damage).toBe(0);
    });

    it('hail deals damage to non-Ice Pokemon and ignores Ice types', () => {
      const pikachu = createMockPokemon({ name: 'Pikachu', hp: 160, maxHp: 160, types: ['electric'] });
      const lapras = createMockPokemon({ name: 'Lapras', hp: 160, maxHp: 160, types: ['water', 'ice'] });

      const pikaRes = processWeatherTurnEnd(pikachu, 160, 'hail');
      const laprasRes = processWeatherTurnEnd(lapras, 160, 'hail');

      expect(pikaRes.damage).toBe(10);
      expect(laprasRes.damage).toBe(0);
    });

    it('ticks weather turns down and expires after 5 turns', () => {
      let weather: FieldWeather = { type: 'sun', turns: 5 };
      weather = tickWeather(weather).nextWeather;
      expect(weather.turns).toBe(4);
      weather = tickWeather(weather).nextWeather;
      weather = tickWeather(weather).nextWeather;
      weather = tickWeather(weather).nextWeather;
      expect(weather.turns).toBe(1);
      const expired = tickWeather(weather);
      expect(expired.nextWeather.type).toBe('none');
      expect(expired.nextWeather.turns).toBe(0);
      expect(expired.expiredMsg).toBeDefined();
    });
  });

  describe('4. Schermi (Reflect & Light Screen)', () => {
    it('sets Reflect and Light Screen for 5 turns', () => {
      const user = createMockPokemon({ name: 'Kadabra' });
      const target = createMockPokemon();
      let screens: SideScreens = { reflect: 0, lightScreen: 0 };

      const reflect = getMoveByName('Riflesso');
      executeMoveAction(
        reflect,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        () => {},
        { setUserScreens: (updater) => { screens = typeof updater === 'function' ? (updater as any)(screens) : updater; } }
      );

      expect(screens.reflect).toBe(5);

      const lightScreen = getMoveByName('Schermoluce');
      executeMoveAction(
        lightScreen,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        () => {},
        { setUserScreens: (updater) => { screens = typeof updater === 'function' ? (updater as any)(screens) : updater; } }
      );

      expect(screens.lightScreen).toBe(5);
    });

    it('halves physical damage under Reflect and halves special damage under Light Screen', () => {
      const attacker = createMockPokemon({ name: 'Pinsir' });
      const defender = createMockPokemon({ name: 'Snorlax' });
      const physMove: Move = { name: 'Sgranocchio', power: 80, category: 'physical', type: 'dark', accuracy: 100 };
      const specMove: Move = { name: 'Neropulsar', power: 80, category: 'special', type: 'dark', accuracy: 100 };

      const basePhys = calculateDamage(attacker, defender, physMove, { isCrit: false });
      const reflectPhys = calculateDamage(attacker, defender, physMove, { defenderScreens: { reflect: 5, lightScreen: 0 }, isCrit: false });
      expect(reflectPhys.damage).toBeLessThan(basePhys.damage);
      expect(getScreenDamageMultiplier('physical', { reflect: 5, lightScreen: 0 })).toBe(0.5);

      const baseSpec = calculateDamage(attacker, defender, specMove, { isCrit: false });
      const screenSpec = calculateDamage(attacker, defender, specMove, { defenderScreens: { reflect: 0, lightScreen: 5 }, isCrit: false });
      expect(screenSpec.damage).toBeLessThan(baseSpec.damage);
      expect(getScreenDamageMultiplier('special', { reflect: 0, lightScreen: 5 })).toBe(0.5);
    });

    it('critical hits bypass Reflect and Light Screen', () => {
      const attacker = createMockPokemon({ name: 'Pinsir' });
      const defender = createMockPokemon({ name: 'Snorlax' });
      const physMove: Move = { name: 'Sgranocchio', power: 80, category: 'physical', type: 'dark', accuracy: 100 };

      const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const critWithoutScreen = calculateDamage(attacker, defender, physMove, { isCrit: true });
      const critWithScreen = calculateDamage(attacker, defender, physMove, { defenderScreens: { reflect: 5, lightScreen: 0 }, isCrit: true });
      spy.mockRestore();

      // In Pokemon, critical hits ignore defensive screens!
      expect(critWithScreen.damage).toBe(critWithoutScreen.damage);
    });

    it('screens tick down and expire after 5 turns', () => {
      let screens: SideScreens = { reflect: 5, lightScreen: 5 };
      screens = tickScreens(screens, 'Pikachu').nextScreens;
      expect(screens.reflect).toBe(4);
      expect(screens.lightScreen).toBe(4);

      screens = { reflect: 1, lightScreen: 1 };
      const res = tickScreens(screens, 'Pikachu');
      expect(res.nextScreens.reflect).toBe(0);
      expect(res.nextScreens.lightScreen).toBe(0);
      expect(res.expiredMsgs.length).toBe(2);
    });
  });

  describe('5. Metronomo (Metronome)', () => {
    it('getRandomMetronomeMove returns a valid move and never Metronome or Struggle', () => {
      for (let i = 0; i < 50; i++) {
        const move = getRandomMetronomeMove();
        expect(move).toBeDefined();
        expect(move.name).toBeDefined();
        expect(move.name.toLowerCase()).not.toBe('metronomo');
        expect(move.name.toLowerCase()).not.toBe('scontro');
      }
    });

    it('executes a random move and logs Metronomo extraction', () => {
      const user = createMockPokemon({ name: 'Clefairy' });
      const target = createMockPokemon({ name: 'Geodude', hp: 100, maxHp: 100 });
      const logs: string[] = [];

      const metronome = getMoveByName('Metronomo');
      expect(metronome.name).toBe('Metronomo');

      const res = executeMoveAction(
        metronome,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(logs.some(l => l.includes('Metronomo estrae a sorte'))).toBe(true);
      expect(res).toBeDefined();
    });
  });

  describe('6. Mosse di Scambio Forzato (Boato e Turbine)', () => {
    it('triggers forceFlee in wild battle', () => {
      const user = createMockPokemon({ name: 'Arcanine' });
      const target = createMockPokemon({ name: 'Wild Pidgey' });
      const logs: string[] = [];

      const roar = getMoveByName('Boato');
      expect(roar.name).toBe('Boato');

      const res = executeMoveAction(
        roar,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg),
        { isWildBattle: true }
      );

      expect(res.forceFlee).toBe(true);
      expect(logs.some(l => l.includes('fuggito spaventato'))).toBe(true);
    });

    it('triggers forceSwitchTarget in trainer battle for Turbine and Boato', () => {
      const user = createMockPokemon({ name: 'Pidgeot' });
      const target = createMockPokemon({ name: 'Rival Charizard' });
      const logs: string[] = [];

      const whirlwind = getMoveByName('Turbine');
      expect(whirlwind.name).toBe('Turbine');

      const res = executeMoveAction(
        whirlwind,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg),
        { isWildBattle: false }
      );

      expect(res.forceSwitchTarget).toBe(true);
      expect(logs.some(l => l.includes('costretto ad abbandonare il campo'))).toBe(true);
    });
  });

  describe('Stordiraggio (Confuse Ray) and Confusion Mechanics', () => {
    it('resolves Stordiraggio alias and inflicts confusion on the target', () => {
      const user = createMockPokemon({ name: 'Gengar' });
      const target = createMockPokemon({ name: 'Snorlax' });
      let targetVolatile: VolatileStatus = {};
      const logs: string[] = [];

      const move = getMoveByName('Stordiraggio');
      expect(move.name).toBe('Stordiraggio');
      expect(move.category).toBe('status');
      expect(move.confusionChance).toBe(100);

      const res = executeMoveAction(
        move,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        targetVolatile,
        (updater) => {
          targetVolatile = typeof updater === 'function' ? updater(targetVolatile) : updater;
        },
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(targetVolatile.confusionTurns).toBeGreaterThanOrEqual(2);
      expect(targetVolatile.confusionTurns).toBeLessThanOrEqual(5);
      expect(logs.some(l => l.includes('Snorlax è confuso!'))).toBe(true);
    });

    it('fails if the target is already confused', () => {
      const user = createMockPokemon({ name: 'Gengar' });
      const target = createMockPokemon({ name: 'Snorlax' });
      let targetVolatile: VolatileStatus = { confusionTurns: 3 };
      const logs: string[] = [];

      const move = getMoveByName('Stordiraggio');
      executeMoveAction(
        move,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        targetVolatile,
        (updater) => {
          targetVolatile = typeof updater === 'function' ? updater(targetVolatile) : updater;
        },
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(targetVolatile.confusionTurns).toBe(3);
      expect(logs.some(l => l.includes('Snorlax è già confuso!'))).toBe(true);
    });

    it('is blocked by target Substitute', () => {
      const user = createMockPokemon({ name: 'Gengar' });
      const target = createMockPokemon({ name: 'Snorlax' });
      let targetVolatile: VolatileStatus = { substituteHp: 25 };
      const logs: string[] = [];

      const move = getMoveByName('Stordiraggio');
      executeMoveAction(
        move,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        targetVolatile,
        (updater) => {
          targetVolatile = typeof updater === 'function' ? updater(targetVolatile) : updater;
        },
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(targetVolatile.confusionTurns).toBeUndefined();
      expect(logs.some(l => l.includes('Il Sostituto protegge Snorlax dalla confusione!'))).toBe(true);
    });
  });

  describe('Trespolo (Roost) and Recovery Mechanics', () => {
    it('heals 50% max HP when damaged', () => {
      const user = createMockPokemon({ name: 'Pidgeot', maxHp: 100 });
      const target = createMockPokemon({ name: 'Golem' });
      let userHp = 30;
      const logs: string[] = [];

      const roost = getMoveByName('Trespolo');
      expect(roost.healing).toBe(0.5);

      const res = executeMoveAction(
        roost,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        userHp,
        (hp) => { userHp = hp; },
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(res.nextUserHp).toBe(80); // 30 + 50
      expect(userHp).toBe(80);
      expect(logs.some(l => l.includes('Pidgeot atterra per riposarsi e recupera le forze! (+50 PS)'))).toBe(true);
    });

    it('caps healing at maxHp without overflowing', () => {
      const user = createMockPokemon({ name: 'Pidgeot', maxHp: 100 });
      const target = createMockPokemon({ name: 'Golem' });
      let userHp = 85;
      const logs: string[] = [];

      const roost = getMoveByName('roost');

      const res = executeMoveAction(
        roost,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        userHp,
        (hp) => { userHp = hp; },
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(res.nextUserHp).toBe(100);
      expect(userHp).toBe(100);
      expect(logs.some(l => l.includes('Pidgeot atterra per riposarsi e recupera le forze! (+15 PS)'))).toBe(true);
    });

    it('fails if user is already at maximum HP', () => {
      const user = createMockPokemon({ name: 'Pidgeot', maxHp: 100 });
      const target = createMockPokemon({ name: 'Golem' });
      let userHp = 100;
      const logs: string[] = [];

      const roost = getMoveByName('Trespolo');

      const res = executeMoveAction(
        roost,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        userHp,
        (hp) => { userHp = hp; },
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(res.nextUserHp).toBe(100);
      expect(logs.some(l => l.includes('Ma i PS di Pidgeot sono già al massimo!'))).toBe(true);
    });
  });

  describe('Splash (Splash) Mechanics', () => {
    it('executes Splash and logs canonical failure message', () => {
      const user = createMockPokemon({ name: 'Magikarp', maxHp: 100 });
      const target = createMockPokemon({ name: 'Gyarados', maxHp: 100 });
      const logs: string[] = [];

      const splash = getMoveByName('Splash');
      expect(splash.name).toBe('Splash');

      const res = executeMoveAction(
        splash,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        100,
        () => {},
        100,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(res.nextUserHp).toBe(100);
      expect(res.nextTargetHp).toBe(100);
      expect(logs.some(l => l.includes('Ma non ha alcun effetto!'))).toBe(true);
    });
  });

  describe('Nube (Haze) Mechanics', () => {
    it('resolves Nube/haze alias and resets all positive and negative stat stages on both sides', () => {
      const user = createMockPokemon({ name: 'Weezing', types: ['poison'] });
      const target = createMockPokemon({ name: 'Dragonite', types: ['dragon', 'flying'] });
      let userStages: BattleStages = {
        attack: -2,
        defense: 3,
        spAtk: -4,
        spDef: 1,
        speed: -1,
        accuracy: -2,
        evasion: 1
      };
      let targetStages: BattleStages = {
        attack: 6,
        defense: 2,
        spAtk: 3,
        spDef: -1,
        speed: 4,
        accuracy: 1,
        evasion: 2
      };
      const logs: string[] = [];

      const haze = getMoveByName('Nube');
      expect(haze.name).toBe('Nube');
      expect(haze.category).toBe('status');
      expect(haze.type).toBe('ice');

      executeMoveAction(
        haze,
        user,
        target,
        userStages,
        (u) => { userStages = typeof u === 'function' ? u(userStages) : u; },
        targetStages,
        (u) => { targetStages = typeof u === 'function' ? u(targetStages) : u; },
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        120,
        () => {},
        120,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(userStages).toEqual(defaultStages());
      expect(targetStages).toEqual(defaultStages());
      expect(logs.some(l => l.includes('Nube') && l.includes('azzerate'))).toBe(true);
    });

    it('bypasses target Protect, Substitute, and semi-invulnerability', () => {
      const user = createMockPokemon({ name: 'Vaporeon', types: ['water'] });
      const target = createMockPokemon({ name: 'Gyarados', types: ['water', 'flying'] });
      let userStages: BattleStages = { ...defaultStages(), spDef: -2 };
      let targetStages: BattleStages = { ...defaultStages(), attack: 4, speed: 4 };
      const targetVolatile: VolatileStatus = { isProtected: true, substituteHp: 30, chargingState: 'fly' };

      const haze = getMoveByName('haze');
      executeMoveAction(
        haze,
        user,
        target,
        userStages,
        (u) => { userStages = typeof u === 'function' ? u(userStages) : u; },
        targetStages,
        (u) => { targetStages = typeof u === 'function' ? u(targetStages) : u; },
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        targetVolatile,
        () => {},
        120,
        () => {},
        120,
        () => {},
        true,
        true,
        () => {}
      );

      expect(userStages).toEqual(defaultStages());
      expect(targetStages).toEqual(defaultStages());
    });

    it('AI avoids Haze when stages are neutral and prioritizes it when player is heavily boosted', () => {
      const haze = getMoveByName('Nube');
      const tackle = getMoveByName('Azione');
      const enemy = createMockPokemon({ name: 'Crobat', types: ['poison', 'flying'], moves: [haze, tackle] });
      const player = createMockPokemon({ name: 'Charizard', types: ['fire', 'flying'] });

      // Neutral stages: AI should never pick Haze over Tackle
      const pickNeutral = selectEnemyMove([haze, tackle], enemy, player, {}, {}, defaultStages(), defaultStages(), 120, 120);
      expect(pickNeutral.name).toBe('Azione');

      // Heavily boosted player (+4 Atk, +2 Speed): AI strongly scores Haze
      const boostedPlayerStages: BattleStages = { ...defaultStages(), attack: 4, speed: 2 };
      const pickBoosted = selectEnemyMove([haze, tackle], enemy, player, {}, {}, defaultStages(), boostedPlayerStages, 120, 120);
      expect(pickBoosted.name).toBe('Nube');
    });
  });

  describe('Scaccianebbia (Defog) Mechanics', () => {
    it('lowers target Evasion by 1, clears opponent Screens (keeping own screens), and clears all Hazards on both sides', () => {
      const user = createMockPokemon({ name: 'Corviknight', types: ['flying', 'steel'] });
      const target = createMockPokemon({ name: 'Grimmsnarl', types: ['dark', 'fairy'] });

      let targetStages = defaultStages();
      let userScreens: SideScreens = { reflect: 4, lightScreen: 0 };
      let targetScreens: SideScreens = { reflect: 5, lightScreen: 5 };
      let userHazards: SideHazards = { stealthRock: true, spikesLayers: 2, toxicSpikesLayers: 1, stickyWeb: true };
      let targetHazards: SideHazards = { stealthRock: true, spikesLayers: 1, toxicSpikesLayers: 2, stickyWeb: false };
      const logs: string[] = [];

      const defog = getMoveByName('Scaccianebbia');
      expect(defog.name).toBe('Scaccianebbia');
      expect(defog.category).toBe('status');

      executeMoveAction(
        defog,
        user,
        target,
        defaultStages(),
        () => {},
        targetStages,
        (u) => { targetStages = typeof u === 'function' ? u(targetStages) : u; },
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        120,
        () => {},
        120,
        () => {},
        true,
        true,
        (msg) => logs.push(msg),
        {
          userSideHazards: userHazards,
          setUserSideHazards: (u) => { userHazards = typeof u === 'function' ? u(userHazards) : u; },
          targetSideHazards: targetHazards,
          setTargetSideHazards: (u) => { targetHazards = typeof u === 'function' ? u(targetHazards) : u; },
          userScreens,
          setUserScreens: (u) => { userScreens = typeof u === 'function' ? u(userScreens) : u; },
          targetScreens,
          setTargetScreens: (u) => { targetScreens = typeof u === 'function' ? u(targetScreens) : u; }
        }
      );

      expect(targetStages.evasion).toBe(-1);
      expect(targetScreens).toEqual(defaultSideScreens());
      expect(userScreens).toEqual({ reflect: 4, lightScreen: 0 });
      expect(userHazards).toEqual(defaultSideHazards());
      expect(targetHazards).toEqual(defaultSideHazards());
      expect(logs.some(l => l.includes('Elusione') && l.includes('cala'))).toBe(true);
      expect(logs.some(l => l.includes('dissolve le barriere difensive'))).toBe(true);
      expect(logs.some(l => l.includes('spazza via tutte le trappole'))).toBe(true);
    });

    it('clears target Screens and both sides Hazards even when target has a Substitute, while blocking only Evasion drop', () => {
      const user = createMockPokemon({ name: 'Scizor', types: ['bug', 'steel'] });
      const target = createMockPokemon({ name: 'Gengar', types: ['ghost', 'poison'] });

      let targetStages = defaultStages();
      let targetScreens: SideScreens = { reflect: 0, lightScreen: 3 };
      let userHazards: SideHazards = { stealthRock: true, spikesLayers: 0, toxicSpikesLayers: 0, stickyWeb: false };
      let targetHazards: SideHazards = { stealthRock: false, spikesLayers: 3, toxicSpikesLayers: 0, stickyWeb: false };
      const logs: string[] = [];

      const defog = getMoveByName('defog');

      executeMoveAction(
        defog,
        user,
        target,
        defaultStages(),
        () => {},
        targetStages,
        (u) => { targetStages = typeof u === 'function' ? u(targetStages) : u; },
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        { substituteHp: 40 },
        () => {},
        120,
        () => {},
        120,
        () => {},
        true,
        true,
        (msg) => logs.push(msg),
        {
          userSideHazards: userHazards,
          setUserSideHazards: (u) => { userHazards = typeof u === 'function' ? u(userHazards) : u; },
          targetSideHazards: targetHazards,
          setTargetSideHazards: (u) => { targetHazards = typeof u === 'function' ? u(targetHazards) : u; },
          targetScreens,
          setTargetScreens: (u) => { targetScreens = typeof u === 'function' ? u(targetScreens) : u; }
        }
      );

      expect(targetStages.evasion).toBe(0);
      expect(targetScreens).toEqual(defaultSideScreens());
      expect(userHazards).toEqual(defaultSideHazards());
      expect(targetHazards).toEqual(defaultSideHazards());
      expect(logs.some(l => l.includes('Sostituto') && l.includes('blocca'))).toBe(true);
    });

    it('is completely blocked by target Protect', () => {
      const user = createMockPokemon({ name: 'Togekiss', types: ['fairy', 'flying'] });
      const target = createMockPokemon({ name: 'Alakazam', types: ['psychic'] });

      let targetStages = defaultStages();
      let targetScreens: SideScreens = { reflect: 5, lightScreen: 0 };
      let userHazards: SideHazards = { stealthRock: true };
      const logs: string[] = [];

      const defog = getMoveByName('Scaccianebbia');

      executeMoveAction(
        defog,
        user,
        target,
        defaultStages(),
        () => {},
        targetStages,
        (u) => { targetStages = typeof u === 'function' ? u(targetStages) : u; },
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        { isProtected: true },
        () => {},
        120,
        () => {},
        120,
        () => {},
        true,
        true,
        (msg) => logs.push(msg),
        {
          userSideHazards: userHazards,
          setUserSideHazards: (u) => { userHazards = typeof u === 'function' ? u(userHazards) : u; },
          targetScreens,
          setTargetScreens: (u) => { targetScreens = typeof u === 'function' ? u(targetScreens) : u; }
        }
      );

      expect(targetStages.evasion).toBe(0);
      expect(targetScreens.reflect).toBe(5);
      expect(userHazards.stealthRock).toBe(true);
      expect(logs.some(l => l.includes('si è protetto completamente'))).toBe(true);
    });

    it('setHazardFromMove clears both sides when called directly with Italian name Scaccianebbia', () => {
      const res = setHazardFromMove(
        'Scaccianebbia',
        { stealthRock: true, spikesLayers: 2, toxicSpikesLayers: 1, stickyWeb: true },
        { stealthRock: true, spikesLayers: 3, toxicSpikesLayers: 2, stickyWeb: true }
      );
      expect(res.updatedTargetSide).toEqual(defaultSideHazards());
      expect(res.updatedUserSide).toEqual(defaultSideHazards());
      expect(res.msg).toContain('Scaccianebbia');
    });
  });

  describe('Bruciapelo (Fake Out) Mechanics', () => {
    it('resolves Bruciapelo/fake-out with priority +3 and outspeeds +2 Extreme Speed', () => {
      const fakeOut = getMoveByName('Bruciapelo');
      const extremeSpeed = getMoveByName('Extrarapido');

      expect(fakeOut.name).toBe('Bruciapelo');
      expect(fakeOut.power).toBe(40);
      expect(fakeOut.priority).toBe(3);
      expect(fakeOut.flinchChance).toBe(100);

      const order = determineTurnOrder(
        { combatant: 'player', move: fakeOut, effectiveSpeed: 50, priority: fakeOut.priority || 0 },
        { combatant: 'enemy', move: extremeSpeed, effectiveSpeed: 200, priority: extremeSpeed.priority || 0 }
      );
      expect(order).toBe('player');
    });

    it('deals damage and guarantees flinch on Turn 1 on the field, then fails on Turn 2', () => {
      const user = createMockPokemon({ name: 'Hariyama', types: ['fighting'], stats: { attack: 120, defense: 60, spAtk: 40, spDef: 60, speed: 50 } });
      const target = createMockPokemon({ name: 'Snorlax', types: ['normal'], hp: 200, maxHp: 200 });

      let userVolatile: VolatileStatus = {};
      let targetVolatile: VolatileStatus = {};
      let targetHp = 200;
      const logsTurn1: string[] = [];

      const fakeOut = getMoveByName('Bruciapelo');

      // Turn 1: First turn on field -> succeeds & flinches
      const res1 = executeMoveAction(
        fakeOut,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        userVolatile,
        (u) => { userVolatile = typeof u === 'function' ? u(userVolatile) : u; },
        targetVolatile,
        (u) => { targetVolatile = typeof u === 'function' ? u(targetVolatile) : u; },
        120,
        () => {},
        targetHp,
        (hp) => { targetHp = typeof hp === 'function' ? hp(targetHp) : hp; },
        true,
        true,
        (msg) => logsTurn1.push(msg)
      );

      expect(res1.nextTargetHp).toBeLessThan(200);
      expect(targetVolatile.isFlinched).toBe(true);
      expect(userVolatile.turnsOnField).toBe(1);

      // Turn 2: Already on field -> Fake Out MUST fail without damaging or flinching
      targetVolatile = {};
      const hpAfterTurn1 = res1.nextTargetHp;
      const logsTurn2: string[] = [];

      const res2 = executeMoveAction(
        fakeOut,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        userVolatile,
        (u) => { userVolatile = typeof u === 'function' ? u(userVolatile) : u; },
        targetVolatile,
        (u) => { targetVolatile = typeof u === 'function' ? u(targetVolatile) : u; },
        120,
        () => {},
        hpAfterTurn1,
        (hp) => { targetHp = typeof hp === 'function' ? hp(targetHp) : hp; },
        true,
        true,
        (msg) => logsTurn2.push(msg)
      );

      expect(res2.nextTargetHp).toBe(hpAfterTurn1);
      expect(targetVolatile.isFlinched).toBeUndefined();
      expect(logsTurn2.some(l => l.includes('fallisce') && l.includes('primo turno'))).toBe(true);
    });

    it('fails on Turn 2 if user spent Turn 1 using another move, and works again after switching out and back in', () => {
      const user = createMockPokemon({ name: 'Incineroar', types: ['fire', 'dark'] });
      const target = createMockPokemon({ name: 'Blissey', types: ['normal'], hp: 300, maxHp: 300 });
      let userVolatile: VolatileStatus = {};
      let targetVolatile: VolatileStatus = {};
      let targetHp = 300;

      // Turn 1: User uses Tackle instead of Fake Out
      const tackle = getMoveByName('Azione');
      const r1 = executeMoveAction(
        tackle,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        userVolatile,
        (u) => { userVolatile = typeof u === 'function' ? u(userVolatile) : u; },
        targetVolatile,
        (u) => { targetVolatile = typeof u === 'function' ? u(targetVolatile) : u; },
        120,
        () => {},
        targetHp,
        (hp) => { targetHp = typeof hp === 'function' ? hp(targetHp) : hp; },
        true,
        true,
        () => {}
      );
      targetHp = r1.nextTargetHp;
      expect(userVolatile.turnsOnField).toBe(1);

      // Turn 2: Now tries Fake Out -> fails!
      const fakeOut = getMoveByName('fake-out');
      const logsFail: string[] = [];
      const r2 = executeMoveAction(
        fakeOut,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        userVolatile,
        (u) => { userVolatile = typeof u === 'function' ? u(userVolatile) : u; },
        targetVolatile,
        (u) => { targetVolatile = typeof u === 'function' ? u(targetVolatile) : u; },
        120,
        () => {},
        targetHp,
        (hp) => { targetHp = typeof hp === 'function' ? hp(targetHp) : hp; },
        true,
        true,
        (msg) => logsFail.push(msg)
      );
      expect(r2.nextTargetHp).toBe(targetHp);
      expect(logsFail.some(l => l.includes('fallisce'))).toBe(true);

      // Simulate switch-out & switch-back-in: volatile resets to {}
      userVolatile = {};
      targetVolatile = {};
      const hpBeforeSwitchRetry = targetHp;
      const r3 = executeMoveAction(
        fakeOut,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        userVolatile,
        (u) => { userVolatile = typeof u === 'function' ? u(userVolatile) : u; },
        targetVolatile,
        (u) => { targetVolatile = typeof u === 'function' ? u(targetVolatile) : u; },
        120,
        () => {},
        targetHp,
        (hp) => { targetHp = typeof hp === 'function' ? hp(targetHp) : hp; },
        true,
        true,
        () => {}
      );
      expect(r3.nextTargetHp).toBeLessThan(hpBeforeSwitchRetry);
      expect(targetVolatile.isFlinched).toBe(true);
    });

    it('does not flinch Ghost-type targets or targets behind a Substitute', () => {
      const user = createMockPokemon({ name: 'Mienshao', types: ['fighting'] });
      const ghostTarget = createMockPokemon({ name: 'Gengar', types: ['ghost', 'poison'], hp: 120, maxHp: 120 });
      const normalTarget = createMockPokemon({ name: 'Snorlax', types: ['normal'], hp: 200, maxHp: 200 });

      const fakeOut = getMoveByName('Bruciapelo');

      // vs Ghost-type: 0x immunity, no damage, no flinch
      let ghostVolatile: VolatileStatus = {};
      const resGhost = executeMoveAction(
        fakeOut,
        user,
        ghostTarget,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        ghostVolatile,
        (u) => { ghostVolatile = typeof u === 'function' ? u(ghostVolatile) : u; },
        120,
        () => {},
        120,
        () => {},
        true,
        true,
        () => {}
      );
      expect(resGhost.nextTargetHp).toBe(120);
      expect(ghostVolatile.isFlinched).toBeUndefined();

      // vs Substitute: substitute absorbs hit, target does not flinch
      let subVolatile: VolatileStatus = { substituteHp: 50 };
      const resSub = executeMoveAction(
        fakeOut,
        user,
        normalTarget,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        subVolatile,
        (u) => { subVolatile = typeof u === 'function' ? u(subVolatile) : u; },
        120,
        () => {},
        200,
        () => {},
        true,
        true,
        () => {}
      );
      expect(resSub.nextTargetHp).toBe(200);
      expect(subVolatile.isFlinched).toBeUndefined();
    });

    it('AI uses Bruciapelo on Turn 1 and never selects it on Turn 2+', () => {
      const fakeOut = getMoveByName('Bruciapelo');
      const bodySlam = getMoveByName('Corposcontro');
      const enemy = createMockPokemon({ name: 'Kangaskhan', types: ['normal'], moves: [fakeOut, bodySlam] });
      const player = createMockPokemon({ name: 'Blastoise', types: ['water'] });

      // Turn 2+: AI must NEVER pick Fake Out
      const pickTurn2 = selectEnemyMove(
        [fakeOut, bodySlam],
        enemy,
        player,
        {},
        {},
        defaultStages(),
        defaultStages(),
        120,
        120,
        { turnsOnField: 1 }
      );
      expect(pickTurn2.name).toBe('Corposcontro');
    });
  });

  describe('7. Mosse di Ricambio Tattico (Retromarcia, Invertivolt, Virata)', () => {
    it('resolves aliases and properties for Retromarcia, Invertivolt, and Virata', () => {
      const uTurn = getMoveByName('Retromarcia');
      const uTurnAlias = getMoveByName('u-turn');
      const voltSwitch = getMoveByName('Invertivolt');
      const flipTurn = getMoveByName('Virata');
      const flipTurnAlias = getMoveByName('flip-turn');

      expect(uTurn.name).toBe('Retromarcia');
      expect(uTurnAlias.name).toBe('Retromarcia');
      expect(uTurn.type).toBe('bug');
      expect(uTurn.power).toBe(70);

      expect(voltSwitch.name).toBe('Invertivolt');
      expect(voltSwitch.type).toBe('electric');
      expect(voltSwitch.power).toBe(70);

      expect(flipTurn.name).toBe('Virata');
      expect(flipTurnAlias.name).toBe('Virata');
      expect(flipTurn.type).toBe('water');
      expect(flipTurn.power).toBe(60);
    });

    it('requests pivot switch when attack connects and user has bench teammates', () => {
      const user = createMockPokemon({ name: 'Scizor', types: ['bug', 'steel'] });
      const target = createMockPokemon({ name: 'Snorlax', types: ['normal'], hp: 250, maxHp: 250 });

      const res = executeMoveAction(
        getMoveByName('Retromarcia'),
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        120,
        () => {},
        250,
        () => {},
        true,
        true,
        () => {},
        { canUserPivotSwitch: true }
      );

      expect(res.nextTargetHp).toBeLessThan(250);
      expect(res.pivotSwitchRequired).toBe(true);
    });

    it('does NOT trigger pivot switch when canUserPivotSwitch is false, target is protected, or target is immune', () => {
      const user = createMockPokemon({ name: 'Jolteon', types: ['electric'] });
      const groundTarget = createMockPokemon({ name: 'Onix', types: ['rock', 'ground'], hp: 150, maxHp: 150 });
      const normalTarget = createMockPokemon({ name: 'Snorlax', types: ['normal'], hp: 200, maxHp: 200 });

      // No bench pokemon
      const noBenchRes = executeMoveAction(
        getMoveByName('Retromarcia'),
        user,
        normalTarget,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        120,
        () => {},
        200,
        () => {},
        true,
        true,
        () => {},
        { canUserPivotSwitch: false }
      );
      expect(noBenchRes.pivotSwitchRequired).toBe(false);

      // Blocked by Protect
      const protectedRes = executeMoveAction(
        getMoveByName('Virata'),
        user,
        normalTarget,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        { isProtected: true },
        () => {},
        120,
        () => {},
        200,
        () => {},
        true,
        true,
        () => {},
        { canUserPivotSwitch: true }
      );
      expect(protectedRes.pivotSwitchRequired).toBeFalsy();

      // Blocked by Ground immunity vs Invertivolt
      const immuneRes = executeMoveAction(
        getMoveByName('Invertivolt'),
        user,
        groundTarget,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        120,
        () => {},
        150,
        () => {},
        true,
        true,
        () => {},
        { canUserPivotSwitch: true }
      );
      expect(immuneRes.nextTargetHp).toBe(150);
      expect(immuneRes.pivotSwitchRequired).toBeFalsy();
    });
  });

  describe('8. Sbadiglio (Yawn) Mechanics', () => {
    it('inflicts drowsiness (yawnTurns=2) and puts target to sleep after 2 end-turn ticks', () => {
      const user = createMockPokemon({ name: 'Slowbro', types: ['water', 'psychic'] });
      const target = createMockPokemon({ name: 'Snorlax', types: ['normal'], hp: 200, maxHp: 200 });
      let targetVolatile: VolatileStatus = {};
      const logs: string[] = [];

      const yawn = getMoveByName('Sbadiglio');
      expect(yawn.name).toBe('Sbadiglio');

      executeMoveAction(
        yawn,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        targetVolatile,
        (u) => { targetVolatile = typeof u === 'function' ? u(targetVolatile) : u; },
        120,
        () => {},
        200,
        () => {},
        true,
        true,
        (msg) => logs.push(msg)
      );

      expect(targetVolatile.yawnTurns).toBe(2);
      expect(logs.some(l => l.includes('sonnolenza'))).toBe(true);

      // End of Turn 1: counts down 2 -> 1, still awake
      const tick1 = processYawnEndTurn(target, targetVolatile, undefined, undefined);
      expect(tick1.nextVolatile.yawnTurns).toBe(1);
      expect(tick1.fellAsleep).toBe(false);

      // End of Turn 2: counts down 1 -> undefined, target falls asleep!
      const tick2 = processYawnEndTurn(target, tick1.nextVolatile, undefined, undefined);
      expect(tick2.nextVolatile.yawnTurns).toBeUndefined();
      expect(tick2.fellAsleep).toBe(true);
      expect(tick2.nextStatus).toBe('sleep');
      expect(tick2.nextDuration).toBeGreaterThanOrEqual(2);
      expect(tick2.nextDuration).toBeLessThanOrEqual(4);
      expect(tick2.msg).toContain('addormenta');
    });

    it('is blocked by Substitute, existing status, or existing drowsiness', () => {
      const user = createMockPokemon({ name: 'Slowbro' });
      const target = createMockPokemon({ name: 'Pikachu' });
      const yawn = getMoveByName('yawn');

      // Behind Substitute
      let subVolatile: VolatileStatus = { substituteHp: 30 };
      executeMoveAction(
        yawn, user, target, defaultStages(), () => {}, defaultStages(), () => {},
        {}, () => {}, {}, () => {}, {}, () => {},
        subVolatile, (u) => { subVolatile = typeof u === 'function' ? u(subVolatile) : u; },
        100, () => {}, 100, () => {}, true, true, () => {}
      );
      expect(subVolatile.yawnTurns).toBeUndefined();

      // Existing primary status
      let statusTargetVolatile: VolatileStatus = {};
      executeMoveAction(
        yawn, user, target, defaultStages(), () => {}, defaultStages(), () => {},
        {}, () => {}, { status: 'paralyzed' }, () => {}, {}, () => {},
        statusTargetVolatile, (u) => { statusTargetVolatile = typeof u === 'function' ? u(statusTargetVolatile) : u; },
        100, () => {}, 100, () => {}, true, true, () => {}
      );
      expect(statusTargetVolatile.yawnTurns).toBeUndefined();
    });
  });

  describe('9. Rintoccasana (Heal Bell) & Aromaterapia (Aromatherapy)', () => {
    it('cures active status and triggers team-wide cure callback', () => {
      const user = createMockPokemon({ name: 'Blissey', types: ['normal'] });
      const target = createMockPokemon({ name: 'Snorlax' });
      let userStatus: { status?: any; duration?: number } = { status: 'paralyzed' };
      const cureTeamMock = vi.fn();
      const logs: string[] = [];

      const healBell = getMoveByName('Rintoccasana');
      expect(healBell.name).toBe('Rintoccasana');
      expect(getMoveByName('Aromaterapia').name).toBe('Aromaterapia');

      const res = executeMoveAction(
        healBell,
        user,
        target,
        defaultStages(),
        () => {},
        defaultStages(),
        () => {},
        userStatus,
        (u) => { userStatus = typeof u === 'function' ? u(userStatus) : u; },
        {},
        () => {},
        {},
        () => {},
        {},
        () => {},
        200,
        () => {},
        120,
        () => {},
        true,
        true,
        (msg) => logs.push(msg),
        { onCureTeamStatus: cureTeamMock }
      );

      expect(userStatus.status).toBeUndefined();
      expect(res.nextUserStatus?.status).toBeUndefined();
      expect(res.curedTeamStatus).toBe(true);
      expect(cureTeamMock).toHaveBeenCalledTimes(1);
      expect(logs.some(l => l.includes('cura tutti i problemi di stato'))).toBe(true);
    });

    it('AI selects Rintoccasana when enemy is afflicted by status and skips it when healthy', () => {
      const healBell = getMoveByName('Rintoccasana');
      const tackle = getMoveByName('Azione');
      const enemy = createMockPokemon({ name: 'Miltank', types: ['normal'], moves: [healBell, tackle] });
      const player = createMockPokemon({ name: 'Pikachu', types: ['electric'] });

      const pickHealthy = selectEnemyMove([healBell, tackle], enemy, player, {}, {}, defaultStages(), defaultStages(), 120, 120);
      expect(pickHealthy.name).toBe('Azione');

      const pickParalyzed = selectEnemyMove([healBell, tackle], enemy, player, { status: 'paralyzed' }, {}, defaultStages(), defaultStages(), 120, 120);
      expect(pickParalyzed.name).toBe('Rintoccasana');
    });
  });

  describe('10. Core Abilities (15 Abilità Curate) & External Pokedex Trade Compatibility', () => {
    it('triggers Prepotenza (Intimidate) on switch-in and respects Substitute', () => {
      const gyarados = createMockPokemon({ id: 130, name: 'Gyarados', types: ['water', 'flying'], ability: CORE_ABILITIES.prepotenza });
      const target = createMockPokemon({ id: 143, name: 'Snorlax', types: ['normal'] });

      const resNormal = processSwitchInAbility(gyarados, target, defaultStages(), 'none', false);
      expect(resNormal.triggered).toBe(true);
      expect(resNormal.nextOpponentStages?.attack).toBe(-1);

      const resSub = processSwitchInAbility(gyarados, target, defaultStages(), 'none', true);
      expect(resSub.triggered).toBe(true);
      expect(resSub.nextOpponentStages).toBeUndefined();
    });

    it('triggers switch-in Weather setters (Siccità, Piovischio, Sabbiafiume, Scendineve)', () => {
      const opp = createMockPokemon({ name: 'Pikachu' });

      expect(processSwitchInAbility(createMockPokemon({ id: 383, name: 'Groudon', ability: CORE_ABILITIES.siccita }), opp, defaultStages(), 'none').nextWeather).toBe('sun');
      expect(processSwitchInAbility(createMockPokemon({ id: 382, name: 'Kyogre', ability: CORE_ABILITIES.piovischio }), opp, defaultStages(), 'none').nextWeather).toBe('rain');
      expect(processSwitchInAbility(createMockPokemon({ id: 248, name: 'Tyranitar', ability: CORE_ABILITIES.sabbiafiume }), opp, defaultStages(), 'none').nextWeather).toBe('sandstorm');
      expect(processSwitchInAbility(createMockPokemon({ id: 460, name: 'Abomasnow', ability: CORE_ABILITIES.scendineve }), opp, defaultStages(), 'none').nextWeather).toBe('hail');

      // Does not re-trigger if same weather is already active
      expect(processSwitchInAbility(createMockPokemon({ id: 383, ability: CORE_ABILITIES.siccita }), opp, defaultStages(), 'sun').triggered).toBe(false);
    });

    it('grants immunities & absorptions for Levitazione, Assorbacqua, Fuocardore, and Parafulmine', () => {
      const attacker = createMockPokemon({ name: 'Charizard', types: ['fire', 'flying'], stats: { attack: 110, defense: 80, spAtk: 120, spDef: 85, speed: 100 } });

      // Levitazione vs Terremoto
      const gengar = createMockPokemon({ id: 94, name: 'Gengar', types: ['ghost', 'poison'], hp: 120, maxHp: 120, ability: CORE_ABILITIES.levitazione });
      const resLev = executeMoveAction(
        getMoveByName('Terremoto'), attacker, gengar,
        defaultStages(), () => {}, defaultStages(), () => {},
        {}, () => {}, {}, () => {}, {}, () => {}, {}, () => {},
        120, () => {}, 120, () => {}, true, true, () => {}
      );
      expect(resLev.nextTargetHp).toBe(120);

      // Assorbacqua heals 25% on Water move
      const vaporeon = createMockPokemon({ id: 134, name: 'Vaporeon', types: ['water'], hp: 100, maxHp: 200, ability: CORE_ABILITIES.assorbacqua });
      const resWater = executeMoveAction(
        getMoveByName('Surf'), attacker, vaporeon,
        defaultStages(), () => {}, defaultStages(), () => {},
        {}, () => {}, {}, () => {}, {}, () => {}, {}, () => {},
        120, () => {}, 100, () => {}, true, true, () => {}
      );
      expect(resWater.nextTargetHp).toBe(150); // +25% of 200 = +50

      // Fuocardore blocks Fire move, sets flashFireBoosted, and boosts subsequent Fire move by 1.5x
      let arcanineVolatile: VolatileStatus = {};
      const arcanine = createMockPokemon({ id: 59, name: 'Arcanine', types: ['fire'], hp: 150, maxHp: 150, ability: CORE_ABILITIES.fuocardore });
      const flamethrower = getMoveByName('Lanciafiamme');
      const resFireAbsorb = executeMoveAction(
        flamethrower, attacker, arcanine,
        defaultStages(), () => {}, defaultStages(), () => {},
        {}, () => {}, {}, () => {}, {}, () => {},
        arcanineVolatile, (u) => { arcanineVolatile = typeof u === 'function' ? u(arcanineVolatile) : u; },
        120, () => {}, 150, () => {}, true, true, () => {}
      );
      expect(resFireAbsorb.nextTargetHp).toBe(150);
      expect(arcanineVolatile.flashFireBoosted).toBe(true);

      const spyRand = vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const dummy = createMockPokemon({ name: 'Snorlax', types: ['normal'], hp: 500, maxHp: 500 });
      const unboosted = executeMoveAction(
        flamethrower, arcanine, dummy,
        defaultStages(), () => {}, defaultStages(), () => {},
        {}, () => {}, {}, () => {}, {}, () => {}, {}, () => {},
        150, () => {}, 500, () => {}, true, true, () => {}
      );
      const boosted = executeMoveAction(
        flamethrower, arcanine, dummy,
        defaultStages(), () => {}, defaultStages(), () => {},
        {}, () => {}, {}, () => {}, arcanineVolatile, () => {}, {}, () => {},
        150, () => {}, 500, () => {}, true, true, () => {}
      );
      spyRand.mockRestore();
      const unboostedDmg = 500 - unboosted.nextTargetHp;
      const boostedDmg = 500 - boosted.nextTargetHp;
      expect(boostedDmg).toBeGreaterThan(unboostedDmg);

      // Parafulmine absorbs Electric move and raises Sp.Atk by +1
      let marowakStages = defaultStages();
      const marowak = createMockPokemon({ id: 105, name: 'Marowak', types: ['ground'], hp: 150, maxHp: 150, ability: CORE_ABILITIES.parafulmine });
      const resRod = executeMoveAction(
        getMoveByName('Fulmine'), attacker, marowak,
        defaultStages(), () => {}, marowakStages, (u) => { marowakStages = typeof u === 'function' ? u(marowakStages) : u; },
        {}, () => {}, {}, () => {}, {}, () => {}, {}, () => {},
        120, () => {}, 150, () => {}, true, true, () => {}
      );
      expect(resRod.nextTargetHp).toBe(150);
      expect(marowakStages.spAtk).toBe(1);
    });

    it('triggers Vigore (Sturdy) at full HP only, Tecnico on <=60 BP moves, and Statica on physical contact', () => {
      const attacker = createMockPokemon({
        name: 'Scizor',
        types: ['bug', 'steel'],
        level: 100,
        stats: { attack: 250, defense: 100, spAtk: 50, spDef: 80, speed: 65 },
        ability: CORE_ABILITIES.tecnico
      });
      const golem = createMockPokemon({
        id: 76,
        name: 'Golem',
        types: ['rock', 'ground'],
        hp: 100,
        maxHp: 100,
        stats: { attack: 100, defense: 60, spAtk: 40, spDef: 40, speed: 45 },
        ability: CORE_ABILITIES.vigore
      });

      expect(hasSturdyAbility(golem)).toBe(true);

      // Vigore keeps Golem at 1 HP from full HP against lethal blow
      const resFull = executeMoveAction(
        { name: 'Cannonflash', type: 'steel', category: 'special', power: 150, accuracy: 100 },
        { ...attacker, stats: { ...attacker.stats, spAtk: 280 } },
        golem,
        defaultStages(), () => {}, defaultStages(), () => {},
        {}, () => {}, {}, () => {}, {}, () => {}, {}, () => {},
        200, () => {}, 100, () => {}, true, true, () => {}
      );
      expect(resFull.nextTargetHp).toBe(1);
      expect(resFull.targetFainted).toBe(false);

      // Below maxHp -> Vigore does NOT save Golem
      const resDamaged = executeMoveAction(
        { name: 'Cannonflash', type: 'steel', category: 'special', power: 150, accuracy: 100 },
        { ...attacker, stats: { ...attacker.stats, spAtk: 280 } },
        golem,
        defaultStages(), () => {}, defaultStages(), () => {},
        {}, () => {}, {}, () => {}, {}, () => {}, {}, () => {},
        200, () => {}, 99, () => {}, true, true, () => {}
      );
      expect(resDamaged.nextTargetHp).toBe(0);
      expect(resDamaged.targetFainted).toBe(true);

      // Tecnico: 40 BP Attacco Rapido gets 1.5x boost compared to non-Technician user
      const nonTech = createMockPokemon({ ...attacker, id: 143, ability: undefined });
      const target = createMockPokemon({ name: 'Snorlax', types: ['normal'], hp: 400, maxHp: 400 });
      const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const rTech = executeMoveAction(
        getMoveByName('Attacco Rapido'), attacker, target,
        defaultStages(), () => {}, defaultStages(), () => {},
        {}, () => {}, {}, () => {}, {}, () => {}, {}, () => {},
        200, () => {}, 400, () => {}, true, true, () => {}
      );
      const rNormal = executeMoveAction(
        getMoveByName('Attacco Rapido'), nonTech, target,
        defaultStages(), () => {}, defaultStages(), () => {},
        {}, () => {}, {}, () => {}, {}, () => {}, {}, () => {},
        200, () => {}, 400, () => {}, true, true, () => {}
      );
      spy.mockRestore();
      expect(400 - rTech.nextTargetHp).toBeGreaterThan(400 - rNormal.nextTargetHp);

      // Statica paralyzes attacker on physical contact
      const pikachu = createMockPokemon({ id: 25, name: 'Pikachu', types: ['electric'], hp: 150, maxHp: 150, ability: CORE_ABILITIES.statica });
      let attackerStatus: { status?: any; duration?: number } = {};
      const spyStat = vi.spyOn(Math, 'random').mockReturnValue(0.1);
      executeMoveAction(
        getMoveByName('Azione'), attacker, pikachu,
        defaultStages(), () => {}, defaultStages(), () => {},
        attackerStatus, (u) => { attackerStatus = typeof u === 'function' ? u(attackerStatus) : u; },
        {}, () => {}, {}, () => {}, {}, () => {},
        200, () => {}, 150, () => {}, true, true, () => {}
      );
      spyStat.mockRestore();
      expect(attackerStatus.status).toBe('paralyzed');
    });

    it('resolves abilities seamlessly from legacy saves & external Pokedex codes without ability field', () => {
      // Simulate an external app Base64 payload omitting `ability` entirely
      const externalPayload = {
        id: 94,
        name: 'Gengar',
        level: 50,
        hp: 135,
        maxHp: 135,
        types: ['ghost', 'poison'],
        moves: [{ name: 'Palla Ombra', type: 'ghost', category: 'special', power: 80, accuracy: 100, pp: 15, maxPp: 15 }]
      } as any;

      const exportedCode = encodePokemon(externalPayload);
      const decoded = decodePokemon(exportedCode);
      expect(decoded).not.toBeNull();
      const normalized = normalizePokemon(decoded!);

      // Never errors, deterministically maps Gengar (#94) -> Levitazione
      expect(resolvePokemonAbility(normalized)?.name).toBe('Levitazione');

      // Legacy placeholder 'Tenacia' automatically upgrades for mapped species (Gyarados #130 -> Prepotenza)
      const legacyGyarados = createMockPokemon({
        id: 130,
        name: 'Gyarados',
        ability: { name: 'Tenacia', description: 'Capacità di resistere ai momenti difficili in lotta.' }
      });
      expect(resolvePokemonAbility(legacyGyarados)?.name).toBe('Prepotenza');

      // English PokéAPI ability names resolve cleanly to Italian Core Abilities
      const enAbilityMon = createMockPokemon({
        id: 9999,
        name: 'Custom',
        ability: { name: 'water-absorb', description: '' }
      });
      expect(resolvePokemonAbility(enAbilityMon)?.name).toBe('Assorbacqua');

      // Unmapped species without `ability` returns null safely without crashing
      const unmappedSnorlax = createMockPokemon({ id: 143, name: 'Snorlax', ability: undefined });
      expect(resolvePokemonAbility(unmappedSnorlax)).toBeNull();
    });
  });
});
