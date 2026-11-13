import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pokemon, Move, Trainer, Item, BattleStages } from '../types/game';
import { useGame } from '../contexts/GameContext';
import { calculateExpGain, checkLevelUp, applyEvs } from '../lib/leveling';
import { canEvolve } from '../lib/evolution';
import { normalizePokemon } from '../lib/utils';
import { fetchMoveData, STRUGGLE_MOVE } from '../lib/pokeapi';
import { BattleHUD } from './battle/BattleHUD';
import { BattleControls } from './battle/BattleControls';
import { PostBattleScreen, PostBattleData } from './battle/PostBattleScreen';
import { calculateDamage, getAccuracyMultiplier, getStageMultiplier } from '../lib/battle/battleMath';
import { executeMoveAction } from '../lib/battle/battleActionRunner';
import { selectEnemyMove, shouldEnemyUseFullRestore } from '../lib/battle/battleAi';
import { SideHazards, defaultSideHazards, processEntryHazards } from '../lib/battle/hazards';
import { 
  canMove, 
  getStatusEffect, 
  StatusCondition, 
  isImmuneToStatus, 
  checkConfusion, 
  checkFlinch, 
  processYawnEndTurn,
  VolatileStatus 
} from '../lib/battle/statusEffects';
import { determineTurnOrder } from '../lib/battle/turnOrder';
import { calculateEscape } from '../lib/battle/escapeFormula';
import { checkAbility, resolvePokemonAbility, processSwitchInAbility } from '../lib/battle/abilities';
import { useItemInBattle } from '../lib/battle/items';
import { BattleBag } from './battle/BattleBag';
import { getBadgeForBoss } from '../lib/badges';
import { CatchOverlay } from './CatchOverlay';
import { ZONES } from '../constants/game';
import { LEGENDARY_BOSSES, generateBossRewardPokemon } from '../data/legendaryBosses';
import { getMoveByName } from '../data/movesData';
import { BattleFXLayer, BattleFXData } from './BattleFXLayer';
import { 
  FieldWeather, 
  SideScreens, 
  defaultFieldWeather, 
  defaultSideScreens, 
  processWeatherTurnEnd, 
  tickWeather, 
  tickScreens, 
  WeatherType 
} from '../lib/battle/fieldEffects';
import { 
  playHit, 
  playFaint, 
  playProtect, 
  playCharge, 
  playLevelUp, 
  playEscape, 
  playMenuClick,
  playBgm,
  playPokemonCry
} from '../lib/sound';

  // Helper to safely enrich a move for battle without overriding existing valid types, powers, or categories
const resolveBattleMove = (m: any): Move => {
  if (!m) return getMoveByName('Azione');
  if (typeof m === 'string') return getMoveByName(m);
  const baseMove = getMoveByName(m.name || (m as any).title || 'Azione');
  
  const effectiveType = (m.type && typeof m.type === 'string' && m.type !== 'normal')
    ? m.type
    : (baseMove.type && baseMove.type !== 'normal' ? baseMove.type : (m.type || baseMove.type || 'normal'));

  const effectiveCategory = m.category || baseMove.category || (m.power || baseMove.power ? 'physical' : 'status');

  let effectivePower = 0;
  if (effectiveCategory !== 'status') {
    if (typeof m.power === 'number' && m.power > 0) {
      effectivePower = m.power;
    } else if (typeof baseMove.power === 'number' && baseMove.power > 0) {
      effectivePower = baseMove.power;
    } else {
      effectivePower = 40;
    }
  }

  const maxPp = m.maxPp || m.pp || baseMove.maxPp || baseMove.pp || 35;
  const currentPp = typeof m.pp === 'number' ? Math.min(Math.max(0, m.pp), maxPp) : maxPp;

  return {
    ...baseMove,
    ...m,
    name: m.name || baseMove.name,
    type: effectiveType,
    category: effectiveCategory,
    power: effectivePower,
    accuracy: typeof m.accuracy === 'number' ? m.accuracy : (baseMove.accuracy || 100),
    pp: currentPp,
    maxPp: maxPp,
    priority: typeof m.priority === 'number' ? m.priority : (baseMove.priority || 0),
    stat_changes: (m.stat_changes && m.stat_changes.length > 0) ? m.stat_changes : baseMove.stat_changes,
    stat_changes_target: m.stat_changes_target || (baseMove as any).stat_changes_target,
    description: m.description || (baseMove as any).description,
    statusEffect: m.statusEffect || baseMove.statusEffect,
    effectChance: m.effectChance !== undefined ? m.effectChance : baseMove.effectChance,
    drain: m.drain !== undefined ? m.drain : baseMove.drain,
    healing: m.healing !== undefined ? m.healing : baseMove.healing,
    recoil: m.recoil !== undefined ? m.recoil : baseMove.recoil,
    recoilMaxHp: m.recoilMaxHp !== undefined ? m.recoilMaxHp : baseMove.recoilMaxHp,
    flinchChance: m.flinchChance !== undefined ? m.flinchChance : baseMove.flinchChance,
    confusionChance: m.confusionChance !== undefined ? m.confusionChance : baseMove.confusionChance,
    multiTurn: m.multiTurn || baseMove.multiTurn,
    target: m.target || baseMove.target
  };
};

interface BattleScreenProps {
  enemy: Pokemon;
  trainer?: Trainer & { bossMutation?: any; bossBuff?: string; bossBuffName?: string; bossBuffDescription?: string };
  modifiers?: {
    activeCards?: any[];
    bossMutation?: any;
    bossBuff?: string;
    bossBuffName?: string;
    bossBuffDescription?: string;
  };
  onEnd: (
    result: 'win' | 'lose' | 'escape' | 'catch', 
    evolutionCandidate?: Pokemon, 
    moveCandidate?: { pokemon: Pokemon, move: Move }, 
    ballUsed?: Item
  ) => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ enemy: initialEnemy, trainer, modifiers, onEnd }) => {
  const { state, setState } = useGame();
  const playerActive = state.player.team[0];

  const activeCards: any[] = modifiers?.activeCards || [];
  const bossMutation = (trainer as any)?.bossMutation || modifiers?.bossMutation;
  const bossBuff = modifiers?.bossBuff || (trainer as any)?.bossBuff;
  const bossBuffName = modifiers?.bossBuffName || (trainer as any)?.bossBuffName;
  const bossBuffDescription = modifiers?.bossBuffDescription || (trainer as any)?.bossBuffDescription;

  // Tower Card Multipliers
  const towerAttackMult = activeCards.reduce((acc, c) => acc * (c.attackMultiplier || 1), 1);
  const towerDefMult = activeCards.reduce((acc, c) => acc * (c.defenseMultiplier || 1), 1);
  const towerSpeedMult = activeCards.reduce((acc, c) => acc * (c.speedMultiplier || 1), 1);
  const towerIncomingDmgMult = activeCards.reduce((acc, c) => acc * (c.incomingDamageMultiplier || 1), 1);
  const towerCritChanceBonus = activeCards.reduce((acc, c) => acc + (c.critChanceBonus || 0), 0);
  const towerLifeStealPercent = activeCards.reduce((acc, c) => acc + (c.lifeStealPercent || 0), 0);
  const towerDodgeChance = activeCards.reduce((acc, c) => acc + (c.dodgeChance || 0), 0);
  const towerAccuracyPenalty = activeCards.reduce((acc, c) => acc + (c.accuracyPenaltyPercent || 0), 0);
  const towerStartSelfDmgPercent = activeCards.reduce((acc, c) => acc + (c.startHpSelfDamagePercent || 0), 0);
  const towerLowHpBonusCard = activeCards.find(c => c.lowHpBonus);
  const towerLowHpBonus = towerLowHpBonusCard?.lowHpBonus || 1;
  
  // Guard against missing active pokemon
  if (!playerActive) {
    return null;
  }

  const [enemy, setEnemy] = useState<Pokemon>(initialEnemy);
  const [playerHp, setPlayerHp] = useState(playerActive.hp);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [enemyTeam, setEnemyTeam] = useState<Pokemon[]>(trainer ? trainer.team : []);
  const [enemyHealsRemaining, setEnemyHealsRemaining] = useState<number>(4);

  useEffect(() => {
    playBgm('battle');
    if (playerActive) playPokemonCry(playerActive.id);
    if (initialEnemy) setTimeout(() => playPokemonCry(initialEnemy.id), 500);

    // Initial battle start notifications for Tower Modifiers & Boss Mutations & Legendary Buffs
    if (bossBuff) {
      addLog(`👑 BUFF BOSS [${(bossBuffName || bossBuff).toUpperCase()}]: ${bossBuffDescription || 'Buff Attivo'}`);
      if (bossBuff === 'rosso_aura') {
        setPlayerStatus({ status: 'paralyzed', duration: undefined });
        addLog(`⚡ L'Aura del Monte Argento paralizza il tuo Pokémon all'inizio del combattimento!`);
      } else if (bossBuff === 'camilla_presence') {
        setPlayerStages(s => ({ ...s, attack: Math.max(-6, s.attack - 1) }));
        addLog(`👑 Lo Sguardo Insuperabile di Camilla riduce l'Attacco del tuo Pokémon (-1)!`);
      } else if (bossBuff === 'blu_arrogance') {
        addLog(`🏆 La Presunzione di Blu riduce la precisione delle tue mosse!`);
      } else if (bossBuff === 'oak_wisdom') {
        addLog(`📜 La Sapienza Suprema del Prof. Oak dona immunità di stato ed elevata resistenza!`);
      } else if (bossBuff === 'nemona_passion') {
        addLog(`⚡ L'Entusiasmo Inesauribile di Nemona aumenta l'Attacco e la Velocità del suo team!`);
      } else if (bossBuff === 'palmer_tower') {
        addLog(`🏰 La Determinazione Infrangibile di Palmer aumenta le Difese della sua squadra!`);
      } else if (bossBuff === 'volo_shadow') {
        addLog(`👻 L'Ombra del Destino di Volo potenzia la forza del suo team e delle mosse oscure!`);
      } else if (bossBuff === 'diantea_grace') {
        addLog(`✨ La Grazia Splendente di Diantea esalta le difese speciali e la potenza delle sue mosse!`);
      } else if (bossBuff === 'cyrus_void') {
        setPlayerStages(s => ({ ...s, spDef: Math.max(-6, (s.spDef ?? 0) - 1) }));
        addLog(`🌌 Il Vuoto Cosmico di Cyrus distorce lo spazio e riduce la Difesa Speciale del tuo Pokémon (-1)!`);
      } else if (bossBuff === 'ghetsis_tyranny') {
        addLog(`👁️ La Furia Tirannica di Ghecis amplifica la ferocia offensiva dei suoi Pokémon!`);
      } else if (bossBuff === 'silver_instinct') {
        addLog(`🐺 L'Istinto Ribelle di Silver accresce la rapidità e l'aggressività della sua squadra!`);
      }
    }

    if (bossMutation) {
      addLog(`⚠️ MUTAZIONE BOSS [${bossMutation.name.toUpperCase()}]: ${bossMutation.description}`);
      if (bossMutation.type === 'corrotto') {
        setPlayerStatus({ status: 'poisoned', duration: undefined });
        addLog(`☣️ Boss Corrotto intossica il tuo Pokémon all'inizio del combattimento!`);
      }
    }

    if (towerStartSelfDmgPercent > 0) {
      const selfDmg = Math.max(1, Math.floor((playerActive.maxHp * towerStartSelfDmgPercent) / 100));
      setPlayerHp(prev => {
        const next = Math.max(1, prev - selfDmg);
        addLog(`☣️ Fuga di Memoria infligge ${selfDmg} PS di danno al tuo Pokémon!`);
        return next;
      });
    }

    // Initial Switch-In Core Abilities (Prepotenza / Meteo) in Speed order
    const pStartSpeed = playerActive.stats?.speed ?? 0;
    const eStartSpeed = initialEnemy.stats?.speed ?? 0;
    const startOrder: Array<'player' | 'enemy'> = pStartSpeed >= eStartSpeed ? ['player', 'enemy'] : ['enemy', 'player'];
    let initWeather: WeatherType = 'none';
    let initPlayerAtk = 0;
    let initEnemyAtk = 0;

    for (const side of startOrder) {
      const incoming = side === 'player' ? playerActive : initialEnemy;
      const opponent = side === 'player' ? initialEnemy : playerActive;
      const oppStagesSnapshot: BattleStages = {
        attack: side === 'player' ? initEnemyAtk : initPlayerAtk,
        defense: 0,
        spAtk: 0,
        spDef: 0,
        speed: 0,
        accuracy: 0,
        evasion: 0
      };
      const abilityRes = processSwitchInAbility(incoming, opponent, oppStagesSnapshot, initWeather, false);
      if (abilityRes.triggered) {
        if (abilityRes.msg) addLog(abilityRes.msg);
        if (abilityRes.nextWeather) {
          initWeather = abilityRes.nextWeather;
          setFieldWeather({ type: abilityRes.nextWeather, turns: 5 });
        }
        if (abilityRes.nextOpponentStages) {
          const atkDelta = (abilityRes.nextOpponentStages.attack ?? 0) - (oppStagesSnapshot.attack ?? 0);
          if (atkDelta !== 0) {
            if (side === 'player') {
              initEnemyAtk += atkDelta;
              setEnemyStages(prev => ({ ...prev, attack: Math.max(-6, Math.min(6, (prev.attack ?? 0) + atkDelta)) }));
            } else {
              initPlayerAtk += atkDelta;
              setPlayerStages(prev => ({ ...prev, attack: Math.max(-6, Math.min(6, (prev.attack ?? 0) + atkDelta)) }));
            }
          }
        }
      }
    }

    return () => {
      playBgm('overworld');
    };
  }, []);

  // Moves with PP tracking
  const [playerMoves, setPlayerMoves] = useState<Move[]>(() => {
    return playerActive.moves.map(resolveBattleMove);
  });

  const [enemyMoves, setEnemyMoves] = useState<Move[]>(() => {
    return enemy.moves.map(resolveBattleMove);
  });

  // Primary Status
  const [playerStatus, setPlayerStatus] = useState<{ status?: StatusCondition, duration?: number }>({ 
    status: playerActive.status, 
    duration: playerActive.statusDuration 
  });
  const [enemyStatus, setEnemyStatus] = useState<{ status?: StatusCondition, duration?: number }>({ 
    status: enemy.status, 
    duration: enemy.statusDuration 
  });

  // Volatile Status (Confusion, Flinch)
  const [playerVolatile, setPlayerVolatile] = useState<VolatileStatus>({});
  const [enemyVolatile, setEnemyVolatile] = useState<VolatileStatus>({});

  // Side Hazards
  const [playerSideHazards, setPlayerSideHazards] = useState<SideHazards>(defaultSideHazards());
  const [enemySideHazards, setEnemySideHazards] = useState<SideHazards>(defaultSideHazards());

  // Field Weather & Defensive Screens
  const [fieldWeather, setFieldWeather] = useState<FieldWeather>(defaultFieldWeather());
  const [playerScreens, setPlayerScreens] = useState<SideScreens>(defaultSideScreens());
  const [enemyScreens, setEnemyScreens] = useState<SideScreens>(defaultSideScreens());

  // Stat Stages (-6 to +6)
  const [playerStages, setPlayerStages] = useState<BattleStages>({
    attack: 0,
    defense: 0,
    spAtk: 0,
    spDef: 0,
    speed: 0,
    accuracy: 0,
    evasion: 0
  });
  const [enemyStages, setEnemyStages] = useState<BattleStages>({
    attack: 0,
    defense: 0,
    spAtk: 0,
    spDef: 0,
    speed: 0,
    accuracy: 0,
    evasion: 0
  });

  // Logs & UI
  const [logs, setLogs] = useState<string[]>(() => {
    const initialLogs = trainer 
      ? [`${trainer.isGymLeader ? 'IL CAPOPALESTRA' : 'L\'allenatore'} ${trainer.name} ti sfida!`, `Inizia la battaglia!`] 
      : ['Inizia la battaglia!'];
    if (initialEnemy.isShiny) {
      initialLogs.unshift(`✨ Un Pokémon cromatico è apparso! ✨`);
    }
    if (trainer?.id === 'superquattro-ransomware') {
      initialLogs.unshift(`🔒 ALERT! Superquattro Ransomware ha cifrato la tua prima mossa! Cliccala per inserire il codice di sblocco.`);
    }
    return initialLogs;
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [fxData, setFxData] = useState<BattleFXData | null>(null);

  // Ransomware Superquattro Mini-Game
  const [encryptedMoveIndex, setEncryptedMoveIndex] = useState<number | null>(() => {
    return trainer?.id === 'superquattro-ransomware' ? 0 : null;
  });
  const [showRansomModal, setShowRansomModal] = useState<boolean>(false);
  const [ransomCode] = useState<string>(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [ransomInput, setRansomInput] = useState<string>('');

  // Escape attempts
  const [escapeAttempts, setEscapeAttempts] = useState(0);

  // Overlays
  const [showSwitch, setShowSwitch] = useState(false);
  const [isPivotSwitch, setIsPivotSwitch] = useState(false);
  const pendingPivotRef = useRef<((
    switchedIn: Pokemon,
    switchedHp: number,
    switchedStatus: { status?: StatusCondition; duration?: number },
    switchedStages: BattleStages,
    updatedWeather: FieldWeather
  ) => Promise<void>) | null>(null);
  const [showBag, setShowBag] = useState(false);
  const [catchBall, setCatchBall] = useState<Item | null>(null);
  const [postBattleData, setPostBattleData] = useState<PostBattleData | null>(null);

  const [battleResult, setBattleResult] = useState<{ 
    type: 'win' | 'lose' | 'escape' | 'catch', 
    evo?: Pokemon,
    newMove?: { pokemon: Pokemon, move: Move },
    ball?: Item
  } | null>(null);

  // Safely trigger onEnd via effect
  useEffect(() => {
    if (battleResult) {
      onEnd(battleResult.type, battleResult.evo, battleResult.newMove, battleResult.ball);
    }
  }, [battleResult, onEnd]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 6));
  }, []);

  // Compute effective speed for initiative and flee checks
  const getEffectiveSpeed = useCallback((
    baseSpeed: number, 
    stage: number, 
    status?: StatusCondition
  ) => {
    const stageMult = getStageMultiplier(stage);
    const parMult = status === 'paralyzed' ? 0.5 : 1.0;
    return Math.max(1, Math.floor(baseSpeed * stageMult * parMult));
  }, []);

  // Decrement PP and persist to state
  const deductPlayerPp = useCallback((moveName: string) => {
    if (moveName === STRUGGLE_MOVE.name) return;

    // Update local battle moves state purely
    setPlayerMoves(prevMoves => 
      prevMoves.map(m => {
        if (m.name.toLowerCase() === moveName.toLowerCase()) {
          const current = typeof m.pp === 'number' ? m.pp : (m.maxPp ?? 35);
          return { ...m, pp: Math.max(0, current - 1) };
        }
        return m;
      })
    );

    // Synchronize PP to active pokemon in global context safely outside of setPlayerMoves updater
    setState(prevState => {
      const team = [...prevState.player.team];
      if (team[0] && team[0].moves) {
        team[0] = {
          ...team[0],
          moves: team[0].moves.map(m => {
            if (m.name.toLowerCase() === moveName.toLowerCase()) {
              const current = typeof m.pp === 'number' ? m.pp : (m.maxPp ?? 35);
              return { ...m, pp: Math.max(0, current - 1) };
            }
            return m;
          })
        };
      }
      return {
        ...prevState,
        player: {
          ...prevState.player,
          team
        }
      };
    });
  }, [setState]);

  const deductEnemyPp = useCallback((moveName: string) => {
    if (moveName === STRUGGLE_MOVE.name) return;

    setEnemyMoves(prev => prev.map(m => {
      if (m.name.toLowerCase() === moveName.toLowerCase()) {
        const current = typeof m.pp === 'number' ? m.pp : (m.maxPp ?? 35);
        return { ...m, pp: Math.max(0, current - 1) };
      }
      return m;
    }));
  }, []);

  const curePlayerTeamStatus = useCallback(() => {
    setPlayerStatus({ status: undefined, duration: undefined });
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        team: prev.player.team.map(p => ({ ...p, status: undefined, statusDuration: undefined }))
      }
    }));
  }, [setState]);

  const cureEnemyTeamStatus = useCallback(() => {
    setEnemyStatus({ status: undefined, duration: undefined });
    setEnemy(prev => ({ ...prev, status: undefined, statusDuration: undefined }));
    setEnemyTeam(prev => prev.map(p => ({ ...p, status: undefined, statusDuration: undefined })));
  }, []);

  // End-of-turn status tick (Burn, Poison, Bad Poison)
  const handleStatusEndTurn = useCallback(async (
    target: Pokemon, 
    currentHp: number, 
    setHp: (val: number) => void,
    status: StatusCondition | undefined,
    setStatusState?: React.Dispatch<React.SetStateAction<{ status?: StatusCondition; duration?: number }>>
  ) => {
    if (!status || currentHp <= 0) return currentHp;
    const effect = getStatusEffect({ ...target, status });
    if (effect.damage) {
      addLog(effect.msg!);
      const newHp = Math.max(0, currentHp - effect.damage);
      setHp(newHp);
      if (effect.nextDuration !== undefined && setStatusState) {
        setStatusState(prev => ({ ...prev, duration: effect.nextDuration }));
      }
      await new Promise(r => setTimeout(r, 800));
      return newHp;
    }
    return currentHp;
  }, [addLog]);

  // Handle battle victory
  const handleWin = useCallback(async (finalPlayerHp: number) => {
    playFaint();
    addLog(`${enemy.name} è esausto!`);
    
    const exp = calculateExpGain(playerActive, enemy);
    addLog(`${playerActive.name} ottiene ${exp} punti ESP!`);
    
    await new Promise(r => setTimeout(r, 1000));

    const oldLevel = playerActive.level;
    const oldExp = playerActive.experience;
    const oldStats = {
      hp: playerActive.maxHp,
      attack: playerActive.stats.attack,
      defense: playerActive.stats.defense,
      spAtk: playerActive.stats.spAtk,
      spDef: playerActive.stats.spDef,
      speed: playerActive.stats.speed
    };

    // Clone active pokemon with updated HP, status, and experience
    let activeClone = { 
      ...playerActive, 
      experience: playerActive.level >= 100 ? 0 : playerActive.experience + exp,
      hp: finalPlayerHp,
      status: playerStatus.status,
      statusDuration: playerStatus.duration,
      moves: playerMoves
    };

    // Apply EVs from defeated enemy
    const evsGained: Record<string, number> = {};
    if (enemy.evYield) {
      Object.entries(enemy.evYield).forEach(([k, v]) => {
        if (typeof v === 'number' && v > 0) {
          evsGained[k] = v;
        }
      });
      activeClone = applyEvs(activeClone, enemy.evYield);
    }
    
    const { leveledUp, newPokemon, canEvolve: evoPossible, newMoves } = checkLevelUp(activeClone);
    if (leveledUp) {
      playLevelUp();
    }
    
    const statGains = leveledUp ? {
      hp: Math.max(0, newPokemon.maxHp - oldStats.hp),
      attack: Math.max(0, newPokemon.stats.attack - oldStats.attack),
      defense: Math.max(0, newPokemon.stats.defense - oldStats.defense),
      spAtk: Math.max(0, newPokemon.stats.spAtk - oldStats.spAtk),
      spDef: Math.max(0, newPokemon.stats.spDef - oldStats.spDef),
      speed: Math.max(0, newPokemon.stats.speed - oldStats.speed),
    } : undefined;

    let moveCandidate: { pokemon: Pokemon, move: Move } | undefined;
    if (newMoves.length > 0) {
      for (const moveInfo of newMoves) {
        if (newPokemon.moves.find(m => m.name.toLowerCase() === moveInfo.name.toLowerCase())) continue;

        try {
          const fullMove = await fetchMoveData(moveInfo.url);
          if (newPokemon.moves.length < 4) {
            addLog(`${newPokemon.name} impara ${fullMove.name}!`);
            newPokemon.moves.push(fullMove);
          } else {
            moveCandidate = { pokemon: newPokemon, move: fullMove };
          }
        } catch (e) {
          console.error("Failed to fetch new move data", e);
        }
      }
    }

    // Exp Share calculation (Unlocks at >= 6 badges, enabled by default)
    const isExpShareUnlocked = state.player.badges.length >= 6;
    const isExpShareActive = isExpShareUnlocked && (state.player.expShareEnabled !== false);
    const teamExpGains: Array<{
      pokemon: Pokemon;
      oldLevel: number;
      newLevel: number;
      oldExp: number;
      newExp: number;
      nextLevelExp: number;
      expGained: number;
      leveledUp: boolean;
    }> = [];

    const updatedTeam = [...state.player.team];
    updatedTeam[0] = newPokemon;

    if (isExpShareActive && updatedTeam.length > 1) {
      const benchExp = Math.max(1, Math.floor(exp * 0.5));
      for (let i = 1; i < updatedTeam.length; i++) {
        const member = updatedTeam[i];
        if (member && member.hp > 0 && member.level < 100) {
          const oldMemberLevel = member.level;
          const oldMemberExp = member.experience;
          let memberClone = {
            ...member,
            experience: member.experience + benchExp
          };
          if (enemy.evYield) {
            memberClone = applyEvs(memberClone, enemy.evYield);
          }
          const memberCheck = checkLevelUp(memberClone);
          const newMemberPkmn = memberCheck.newPokemon;
          if (memberCheck.leveledUp) {
            if (memberCheck.newMoves.length > 0) {
              for (const mInfo of memberCheck.newMoves) {
                if (newMemberPkmn.moves.find(m => m.name.toLowerCase() === mInfo.name.toLowerCase())) continue;
                if (newMemberPkmn.moves.length < 4) {
                  try {
                    const fMove = await fetchMoveData(mInfo.url);
                    newMemberPkmn.moves.push(fMove);
                  } catch (e) {
                    console.error("Failed to fetch bench move", e);
                  }
                }
              }
            }
          }
          updatedTeam[i] = newMemberPkmn;
          teamExpGains.push({
            pokemon: newMemberPkmn,
            oldLevel: oldMemberLevel,
            newLevel: newMemberPkmn.level,
            oldExp: oldMemberExp,
            newExp: newMemberPkmn.experience,
            nextLevelExp: newMemberPkmn.nextLevelExp,
            expGained: benchExp,
            leveledUp: memberCheck.leveledUp
          });
        }
      }
    }

    // Update player state with progress from this pokemon and bench
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        team: updatedTeam
      }
    }));

    // Trainer logic: check if they have more Pokemon
    if (trainer) {
      const updatedEnemyTeam = [...enemyTeam];
      const defeatedIdx = updatedEnemyTeam.findIndex(p =>
        (p.instanceId ? p.instanceId === enemy.instanceId : p.id === enemy.id) && p.hp > 0
      );
      if (defeatedIdx !== -1) {
        updatedEnemyTeam[defeatedIdx] = { ...updatedEnemyTeam[defeatedIdx], hp: 0 };
        setEnemyTeam(updatedEnemyTeam);
      }

      const nextEnemy = updatedEnemyTeam.find(p => p.hp > 0);
      if (nextEnemy) {
        addLog(`${trainer.name} sta per mandare in campo ${nextEnemy.name}!`);
        await new Promise(r => setTimeout(r, 1500));
        
        const enemyHazardRes = processEntryHazards(nextEnemy, nextEnemy.hp, enemySideHazards, nextEnemy.status);
        let nextEnemyHpVal = enemyHazardRes.nextHp;
        let nextEnemyStatusVal = enemyHazardRes.nextStatus;
        if (enemyHazardRes.logs.length > 0) {
          enemyHazardRes.logs.forEach(msg => addLog(msg));
        }
        setEnemySideHazards(enemyHazardRes.updatedSideHazards);

        setEnemy(nextEnemy);
        setEnemyHp(nextEnemyHpVal);
        setEnemyMoves(nextEnemy.moves.map(resolveBattleMove));
        setEnemyStatus({ status: nextEnemyStatusVal, duration: enemyHazardRes.nextStatusDuration ?? nextEnemy.statusDuration });
        const newEnemyStages = { attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 };
        if (enemyHazardRes.nextSpeedStageDelta) {
          newEnemyStages.speed = Math.max(-6, Math.min(6, enemyHazardRes.nextSpeedStageDelta));
        }
        setEnemyStages(newEnemyStages);
        setEnemyVolatile({});

        if (nextEnemyHpVal <= 0) {
          addLog(`${nextEnemy.name} è k.o. a causa delle trappole sul campo!`);
          await handleWin(finalPlayerHp);
          return;
        }

        // Trigger switch-in Core Ability for next enemy
        const enemySwitchInAbility = processSwitchInAbility(
          nextEnemy,
          playerActive,
          playerStages,
          fieldWeather.type,
          Boolean(playerVolatile.substituteHp && playerVolatile.substituteHp > 0)
        );
        if (enemySwitchInAbility.triggered) {
          if (enemySwitchInAbility.msg) addLog(enemySwitchInAbility.msg);
          if (enemySwitchInAbility.nextWeather) {
            setFieldWeather({ type: enemySwitchInAbility.nextWeather, turns: 5 });
          }
          if (enemySwitchInAbility.nextOpponentStages) {
            setPlayerStages(enemySwitchInAbility.nextOpponentStages);
          }
        }

        // Apply end-turn status tick to active player Pokemon and next enemy if affected
        let currentLivePlayerHp = finalPlayerHp;
        let currentLivePlayerStatus = { status: playerStatus.status, duration: playerStatus.duration };
        if (currentLivePlayerHp > 0 && currentLivePlayerStatus.status) {
          currentLivePlayerHp = await handleStatusEndTurn(
            playerActive, 
            currentLivePlayerHp, 
            setPlayerHp, 
            currentLivePlayerStatus.status, 
            setPlayerStatus
          );
          if (currentLivePlayerHp <= 0) {
            await handlePlayerFaint();
            return;
          }
        }

        if (currentLivePlayerHp > 0 && playerVolatile.yawnTurns) {
          const yawnP = processYawnEndTurn(
            playerActive,
            playerVolatile,
            currentLivePlayerStatus.status,
            currentLivePlayerStatus.duration
          );
          if (yawnP.msg) addLog(yawnP.msg);
          setPlayerVolatile(yawnP.nextVolatile);
          if (yawnP.fellAsleep) {
            currentLivePlayerStatus = { status: yawnP.nextStatus, duration: yawnP.nextDuration };
            setPlayerStatus(currentLivePlayerStatus);
          }
        }

        if (nextEnemyStatusVal) {
          nextEnemyHpVal = await handleStatusEndTurn(
            nextEnemy,
            nextEnemyHpVal,
            setEnemyHp,
            nextEnemyStatusVal,
            setEnemyStatus
          );
          if (nextEnemyHpVal <= 0) {
            await handleWin(currentLivePlayerHp);
            return;
          }
        }

        setIsAnimating(false);
        return;
      }

      // End of trainer battle: rewards & badge
      const moneyReward = trainer.moneyReward;
      const badge = getBadgeForBoss(trainer.name);

      // Check for Legendary Boss First Victory Reward
      if (trainer.id?.startsWith('boss-')) {
        const bossSpec = LEGENDARY_BOSSES.find(b => b.id === trainer.id);
        if (bossSpec) {
          const isFirstVictory = !state.player.defeatedBosses?.includes(bossSpec.id);
          if (isFirstVictory) {
            generateBossRewardPokemon(bossSpec).then(rewardPkmn => {
              const cleanReward = normalizePokemon(rewardPkmn);
              setState(prev => {
                const defeatedBosses = [...(prev.player.defeatedBosses || []), bossSpec.id];
                const teamFull = prev.player.team.length >= 6;
                return {
                  ...prev,
                  player: {
                    ...prev.player,
                    defeatedBosses,
                    team: teamFull ? prev.player.team : [...prev.player.team, cleanReward],
                    box: teamFull ? [...prev.player.box, cleanReward] : prev.player.box,
                    pokedex: { ...prev.player.pokedex, [cleanReward.id]: 'caught' }
                  }
                };
              });
              addLog(`🎁 PRIMA VITTORIA! Pokémon Speciale sbloccato: ${cleanReward.nickname}!`);
            });
          }
        }
      }
      
      setState(prev => {
        let badges = [...prev.player.badges];
        if (badge && !badges.includes(badge.id)) {
          badges.push(badge.id);
        }
        const defeatedTrainers = [...(prev.player.defeatedTrainers || [])];
        if (trainer.id && !defeatedTrainers.includes(trainer.id)) {
          defeatedTrainers.push(trainer.id);
        }
        const defeatedBosses = [...(prev.player.defeatedBosses || [])];
        if (trainer.id?.startsWith('boss-') && !defeatedBosses.includes(trainer.id)) {
          defeatedBosses.push(trainer.id);
        }
        return {
          ...prev,
          player: {
            ...prev.player,
            money: prev.player.money + moneyReward,
            badges,
            defeatedTrainers,
            defeatedBosses
          }
        };
      });

      // Show the Post-Battle Summary Screen!
      setPostBattleData({
        pokemon: newPokemon,
        enemy,
        expGained: exp,
        oldLevel,
        newLevel: newPokemon.level,
        oldExp,
        newExp: newPokemon.experience,
        nextLevelExp: newPokemon.nextLevelExp,
        statGains,
        evsGained,
        teamExpGains: teamExpGains.length > 0 ? teamExpGains : undefined,
        badge: badge && !state.player.badges.includes(badge.id) ? badge : null,
        moneyEarned: moneyReward,
        trainerName: trainer.name
      });
    } else {
      // Wild battle end
      const wildReward = 50;
      setState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money + wildReward
        }
      }));

      // Show the Post-Battle Summary Screen!
      setPostBattleData({
        pokemon: newPokemon,
        enemy,
        expGained: exp,
        oldLevel,
        newLevel: newPokemon.level,
        oldExp,
        newExp: newPokemon.experience,
        nextLevelExp: newPokemon.nextLevelExp,
        statGains,
        evsGained,
        teamExpGains: teamExpGains.length > 0 ? teamExpGains : undefined,
        moneyEarned: wildReward
      });
    }
  }, [enemy, playerActive, playerStatus, playerMoves, setState, addLog, trainer, enemyTeam, state.player.badges, state.player.team, state.player.expShareEnabled]);

  // When player clicks continue in PostBattleScreen
  const handlePostBattleContinue = useCallback(() => {
    if (!postBattleData) {
      setBattleResult({ type: 'win' });
      return;
    }
    const currentPkmn = postBattleData.pokemon;
    const allParty = [currentPkmn, ...(postBattleData.teamExpGains?.map(g => g.pokemon) || [])];
    const evo = allParty.find(p => canEvolve(p));
    setPostBattleData(null);
    setBattleResult({
      type: 'win',
      evo
    });
  }, [postBattleData]);

  // Handle player fainted
  const handlePlayerFaint = useCallback(async () => {
    playFaint();
    addLog(`${playerActive.name} è k.o.!`);
    await new Promise(r => setTimeout(r, 1000));
    
    setState(prev => {
      const team = [...prev.player.team];
      team[0] = { ...team[0], hp: 0, status: undefined, statusDuration: undefined };
      return { ...prev, player: { ...prev.player, team } };
    });

    const hasAvailable = state.player.team.some((p, i) => i !== 0 && p.hp > 0);
    if (hasAvailable) {
      addLog("Scegli un altro Pokémon!");
      setIsAnimating(false);
      setShowSwitch(true);
    } else {
      addLog("Non hai più Pokémon utilizzabili! Sei fuori combattimento.");
      await new Promise(r => setTimeout(r, 1500));
      setBattleResult({ type: 'lose' });
    }
  }, [addLog, playerActive.name, setState, state.player.team]);

  // Single enemy turn execution (used after item, switch, or failed flee)
  const triggerEnemySingleTurn = useCallback(async (
    curPlayerHp: number,
    curEnemyHp: number,
    playerJustSwitched: boolean = false,
    overrides?: {
      playerPokemon?: Pokemon;
      playerStatus?: { status?: StatusCondition; duration?: number };
      playerStages?: BattleStages;
      playerVolatile?: VolatileStatus;
      enemyStages?: BattleStages;
      weather?: FieldWeather;
    }
  ) => {
    setIsAnimating(true);
    await new Promise(r => setTimeout(r, 800));

    let liveEnemy = enemy;
    let liveEnemyMoves = enemyMoves;
    let liveEnemyTeam = [...enemyTeam];
    let liveEnemyStatus = { ...enemyStatus };
    let liveEnemyStages = { ...(overrides?.enemyStages || enemyStages) };
    let liveEnemyVolatile = { ...enemyVolatile };
    let livePlayer = overrides?.playerPokemon || playerActive;
    let livePlayerStatus = { ...(overrides?.playerStatus || playerStatus) };
    let livePlayerStages = { ...(overrides?.playerStages || playerStages) };
    let livePlayerVolatile = { ...(overrides?.playerVolatile || playerVolatile) };
    let liveWeather = { ...(overrides?.weather || fieldWeather) };

    // 1. Flinch check
    const flinchCheck = checkFlinch(liveEnemy, liveEnemyVolatile.isFlinched);
    if (!flinchCheck.canAct) {
      addLog(flinchCheck.msg!);
      setEnemyVolatile(prev => ({ ...prev, isFlinched: false }));
      setIsAnimating(false);
      return;
    }

    // 2. Primary Status check
    const moveCheck = canMove({ ...liveEnemy, status: liveEnemyStatus.status, statusDuration: liveEnemyStatus.duration });
    if (moveCheck.statusChanged) {
      liveEnemyStatus = { status: moveCheck.newStatus, duration: moveCheck.newDuration };
      setEnemyStatus(liveEnemyStatus);
    }
    if (!moveCheck.canMove) {
      if (moveCheck.msg) addLog(moveCheck.msg);
      setIsAnimating(false);
      return;
    }

    // 3. Confusion check
    if (liveEnemyVolatile.confusionTurns && liveEnemyVolatile.confusionTurns > 0) {
      const conf = checkConfusion(liveEnemy, liveEnemyVolatile.confusionTurns);
      liveEnemyVolatile = { ...liveEnemyVolatile, confusionTurns: conf.newTurns };
      setEnemyVolatile(prev => ({ ...prev, confusionTurns: conf.newTurns }));
      if (conf.msg) addLog(conf.msg);
      if (conf.hurtSelf && conf.damage) {
        const nextE = Math.max(0, curEnemyHp - conf.damage);
        setEnemyHp(nextE);
        if (nextE <= 0) {
          await handleWin(curPlayerHp);
          return;
        }
        setIsAnimating(false);
        return;
      }
    }

    // 4. Move Selection & PP
    const validMoves = liveEnemyMoves.filter(m => (m.pp ?? m.maxPp ?? 35) > 0);
    const chosenMove = validMoves.length > 0
      ? validMoves[Math.floor(Math.random() * validMoves.length)]
      : STRUGGLE_MOVE;

    deductEnemyPp(chosenMove.name);

    const canEnemyPivot = Boolean(
      trainer &&
      liveEnemyTeam.some(p => (p.instanceId ? p.instanceId !== liveEnemy.instanceId : p.id !== liveEnemy.id) && p.hp > 0)
    );

    // 5. Execute
    const res = executeMoveAction(
      chosenMove,
      liveEnemy,
      livePlayer,
      liveEnemyStages,
      (updater) => {
        liveEnemyStages = typeof updater === 'function' ? updater(liveEnemyStages) : updater;
        setEnemyStages(liveEnemyStages);
      },
      livePlayerStages,
      (updater) => {
        livePlayerStages = typeof updater === 'function' ? updater(livePlayerStages) : updater;
        setPlayerStages(livePlayerStages);
      },
      liveEnemyStatus,
      (updater) => {
        liveEnemyStatus = typeof updater === 'function' ? updater(liveEnemyStatus) : updater;
        setEnemyStatus(liveEnemyStatus);
      },
      livePlayerStatus,
      (updater) => {
        livePlayerStatus = typeof updater === 'function' ? updater(livePlayerStatus) : updater;
        setPlayerStatus(livePlayerStatus);
      },
      liveEnemyVolatile,
      (updater) => {
        liveEnemyVolatile = typeof updater === 'function' ? updater(liveEnemyVolatile) : updater;
        setEnemyVolatile(liveEnemyVolatile);
      },
      livePlayerVolatile,
      (updater) => {
        livePlayerVolatile = typeof updater === 'function' ? updater(livePlayerVolatile) : updater;
        setPlayerVolatile(livePlayerVolatile);
      },
      curEnemyHp,
      setEnemyHp,
      curPlayerHp,
      setPlayerHp,
      false,
      true,
      addLog,
      {
        userSideHazards: enemySideHazards,
        setUserSideHazards: setEnemySideHazards,
        targetSideHazards: playerSideHazards,
        setTargetSideHazards: setPlayerSideHazards,
        weather: liveWeather.type,
        setWeather: (w) => {
          liveWeather = { type: w, turns: 5 };
          setFieldWeather(liveWeather);
        },
        userScreens: enemyScreens,
        setUserScreens: setEnemyScreens,
        targetScreens: playerScreens,
        setTargetScreens: setPlayerScreens,
        isWildBattle: !trainer,
        canUserPivotSwitch: canEnemyPivot,
        onCureTeamStatus: cureEnemyTeamStatus
      }
    );

    if (res.forceFlee) {
      await new Promise(r => setTimeout(r, 600));
      setBattleResult({ type: 'escape' });
      return;
    }

    if (res.forceSwitchTarget) {
      const availablePlayerIndices = state.player.team
        .map((p, idx) => ({ p, idx }))
        .filter(({ p, idx }) => idx !== 0 && p.hp > 0);
      if (availablePlayerIndices.length > 0) {
        const chosen = availablePlayerIndices[Math.floor(Math.random() * availablePlayerIndices.length)];
        handleSwitch(chosen.idx);
        return;
      } else {
        addLog("Ma è fallita! Non ci sono altri Pokémon pronti a lottare!");
      }
    }

    if (res.userFainted) {
      await handleWin(res.nextTargetHp);
      return;
    }
    if (res.targetFainted) {
      await handlePlayerFaint();
      return;
    }

    let nextPlayerHp = res.nextTargetHp;
    let nextEnemyHp = res.nextUserHp;
    if (res.nextTargetStatus) livePlayerStatus = res.nextTargetStatus;
    if (res.nextUserStatus) liveEnemyStatus = res.nextUserStatus;

    // Handle Enemy Pivot Switch (e.g. U-turn / Volt Switch / Flip Turn)
    if (res.pivotSwitchRequired && trainer) {
      const currentEnemyId = liveEnemy.instanceId || liveEnemy.id;
      liveEnemyTeam = liveEnemyTeam.map(p =>
        (p.instanceId ? p.instanceId === currentEnemyId : p.id === liveEnemy.id)
          ? { ...p, hp: nextEnemyHp, status: liveEnemyStatus.status, statusDuration: liveEnemyStatus.duration }
          : p
      );
      const availableEnemies = liveEnemyTeam.filter(p => (p.instanceId || p.id) !== currentEnemyId && p.hp > 0);
      if (availableEnemies.length > 0) {
        const nextChosenEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        addLog(`🔄 ${liveEnemy.name} rientra! ${trainer.name} manda in campo ${nextChosenEnemy.name}!`);
        await new Promise(r => setTimeout(r, 700));
        const enemyHazardRes = processEntryHazards(nextChosenEnemy, nextChosenEnemy.hp, enemySideHazards, nextChosenEnemy.status);
        if (enemyHazardRes.logs.length > 0) enemyHazardRes.logs.forEach(msg => addLog(msg));
        setEnemySideHazards(enemyHazardRes.updatedSideHazards);
        liveEnemy = nextChosenEnemy;
        nextEnemyHp = enemyHazardRes.nextHp;
        liveEnemyMoves = nextChosenEnemy.moves.map(resolveBattleMove);
        liveEnemyStatus = { status: enemyHazardRes.nextStatus, duration: enemyHazardRes.nextStatusDuration ?? nextChosenEnemy.statusDuration };
        liveEnemyStages = {
          attack: 0,
          defense: 0,
          spAtk: 0,
          spDef: 0,
          speed: enemyHazardRes.nextSpeedStageDelta ? Math.max(-6, Math.min(6, enemyHazardRes.nextSpeedStageDelta)) : 0,
          accuracy: 0,
          evasion: 0
        };
        liveEnemyVolatile = {};
        setEnemy(liveEnemy);
        setEnemyTeam(liveEnemyTeam);
        setEnemyHp(nextEnemyHp);
        setEnemyMoves(liveEnemyMoves);
        setEnemyStatus(liveEnemyStatus);
        setEnemyStages(liveEnemyStages);
        setEnemyVolatile({});
        if (nextEnemyHp <= 0) {
          addLog(`${liveEnemy.name} è k.o. a causa delle trappole sul campo!`);
          await handleWin(nextPlayerHp);
          return;
        }
        const switchAbility = processSwitchInAbility(
          liveEnemy,
          livePlayer,
          livePlayerStages,
          liveWeather.type,
          Boolean(livePlayerVolatile.substituteHp && livePlayerVolatile.substituteHp > 0)
        );
        if (switchAbility.triggered) {
          if (switchAbility.msg) addLog(switchAbility.msg);
          if (switchAbility.nextWeather) {
            liveWeather = { type: switchAbility.nextWeather, turns: 5 };
            setFieldWeather(liveWeather);
          }
          if (switchAbility.nextOpponentStages) {
            livePlayerStages = switchAbility.nextOpponentStages;
            setPlayerStages(livePlayerStages);
          }
        }
      }
    }

    // End-of-turn status damage (Poison / Burn) for both player and enemy
    nextPlayerHp = await handleStatusEndTurn(livePlayer, nextPlayerHp, setPlayerHp, livePlayerStatus.status, setPlayerStatus);
    if (nextPlayerHp <= 0) {
      await handlePlayerFaint();
      return;
    }

    nextEnemyHp = await handleStatusEndTurn(liveEnemy, nextEnemyHp, setEnemyHp, liveEnemyStatus.status, setEnemyStatus);
    if (nextEnemyHp <= 0) {
      await handleWin(nextPlayerHp);
      return;
    }

    // Yawn end-of-turn check
    if (livePlayerVolatile.yawnTurns) {
      const yawnP = processYawnEndTurn(livePlayer, livePlayerVolatile, livePlayerStatus.status, livePlayerStatus.duration);
      if (yawnP.msg) addLog(yawnP.msg);
      livePlayerVolatile = yawnP.nextVolatile;
      setPlayerVolatile(livePlayerVolatile);
      if (yawnP.fellAsleep) {
        livePlayerStatus = { status: yawnP.nextStatus, duration: yawnP.nextDuration };
        setPlayerStatus(livePlayerStatus);
      }
    }
    if (liveEnemyVolatile.yawnTurns) {
      const yawnE = processYawnEndTurn(liveEnemy, liveEnemyVolatile, liveEnemyStatus.status, liveEnemyStatus.duration);
      if (yawnE.msg) addLog(yawnE.msg);
      liveEnemyVolatile = yawnE.nextVolatile;
      setEnemyVolatile(liveEnemyVolatile);
      if (yawnE.fellAsleep) {
        liveEnemyStatus = { status: yawnE.nextStatus, duration: yawnE.nextDuration };
        setEnemyStatus(liveEnemyStatus);
      }
    }

    // Weather end-of-turn damage
    if (liveWeather.type === 'sandstorm' || liveWeather.type === 'hail') {
      const weatherP = processWeatherTurnEnd(livePlayer, nextPlayerHp, liveWeather.type);
      if (weatherP.damage > 0) {
        addLog(weatherP.msg!);
        nextPlayerHp = weatherP.nextHp;
        setPlayerHp(nextPlayerHp);
        if (nextPlayerHp <= 0) {
          await handlePlayerFaint();
          return;
        }
      }

      const weatherE = processWeatherTurnEnd(liveEnemy, nextEnemyHp, liveWeather.type);
      if (weatherE.damage > 0) {
        addLog(weatherE.msg!);
        nextEnemyHp = weatherE.nextHp;
        setEnemyHp(nextEnemyHp);
        if (nextEnemyHp <= 0) {
          await handleWin(nextPlayerHp);
          return;
        }
      }
    }

    if (bossBuff === 'n_harmony' && nextEnemyHp > 0 && nextEnemyHp < liveEnemy.maxHp) {
      const healAmount = Math.max(1, Math.floor(liveEnemy.maxHp * 0.07));
      nextEnemyHp = Math.min(liveEnemy.maxHp, nextEnemyHp + healAmount);
      setEnemyHp(nextEnemyHp);
      addLog(`🕊️ Armonia Filosofica rigenera ${healAmount} PS a ${liveEnemy.name}!`);
    }

    setEnemyVolatile(prev => ({ ...prev, isFlinched: false, isProtected: false, turnsOnField: Math.max(1, prev.turnsOnField ?? 0) }));
    if (!playerJustSwitched) {
      setPlayerVolatile(prev => ({ ...prev, isFlinched: false, isProtected: false, turnsOnField: Math.max(1, prev.turnsOnField ?? 0) }));
    }
    setIsAnimating(false);
  }, [
    enemy, enemyTeam, enemyVolatile, enemyStatus, enemyMoves, enemyStages, playerActive, 
    playerStages, playerStatus, playerVolatile, deductEnemyPp, cureEnemyTeamStatus,
    handleWin, handlePlayerFaint, handleStatusEndTurn, addLog,
    fieldWeather, playerScreens, enemyScreens, playerSideHazards, enemySideHazards,
    bossBuff, trainer, state.player.team
  ]);

  // Main turn execution: Dynamic Turn Order based on Priority & Effective Speed
  const handleMove = useCallback(async (selectedMove: Move) => {
    if (isAnimating || isPivotSwitch) return;

    // Check if player is locked into a move
    const actualPlayerMove = playerVolatile.lockedMove || selectedMove;

    setIsAnimating(true);

    // If player move has 0 PP and is not Struggle, fallback to Struggle
    const activePlayerMove = (typeof actualPlayerMove.pp === 'number' && actualPlayerMove.pp <= 0 && actualPlayerMove.name !== STRUGGLE_MOVE.name)
      ? STRUGGLE_MOVE
      : actualPlayerMove;

    // Pick enemy move (pass playerVolatile so AI knows yawnTurns / substitute / protect)
    const enemyMove = enemyVolatile.lockedMove || selectEnemyMove(
      enemyMoves, 
      enemy, 
      playerActive, 
      enemyStatus, 
      playerStatus, 
      enemyStages, 
      playerStages, 
      enemyHp, 
      playerHp,
      enemyVolatile,
      playerVolatile
    );

    // Calculate effective speeds
    const bossSpeedBonus = (bossBuff === 'dandel_gigamax' || bossBuff === 'nardo_spirit' || bossBuff === 'nemona_passion' || bossBuff === 'cyrus_void' || bossBuff === 'silver_instinct') ? 1.12 : 1.0;
    const effPlayerSpeed = getEffectiveSpeed(playerActive.stats.speed, playerStages.speed ?? 0, playerStatus.status) * towerSpeedMult;
    const effEnemySpeed = getEffectiveSpeed(enemy.stats.speed, enemyStages.speed ?? 0, enemyStatus.status) * (bossMutation?.type === 'overclocked' ? 1.20 : 1) * bossSpeedBonus;

    // Determine Turn Order
    const turnWinner = determineTurnOrder(
      {
        combatant: 'player',
        move: activePlayerMove,
        effectiveSpeed: effPlayerSpeed,
        priority: activePlayerMove.priority || 0
      },
      {
        combatant: 'enemy',
        move: enemyMove,
        effectiveSpeed: effEnemySpeed,
        priority: enemyMove.priority || 0
      }
    );

    const playerFirst = turnWinner === 'player';

    // Mutable turn context so pivot switches mid-turn never read stale closures
    const ctx = {
      player: playerActive,
      enemy,
      enemyTeam: [...enemyTeam],
      playerHp,
      enemyHp,
      playerStatus: { ...playerStatus } as { status?: StatusCondition; duration?: number },
      enemyStatus: { ...enemyStatus } as { status?: StatusCondition; duration?: number },
      playerVolatile: { ...playerVolatile } as VolatileStatus,
      enemyVolatile: { ...enemyVolatile } as VolatileStatus,
      playerStages: { ...playerStages } as BattleStages,
      enemyStages: { ...enemyStages } as BattleStages,
      fieldWeather: { ...fieldWeather } as FieldWeather,
      playerScreens: { ...playerScreens } as SideScreens,
      enemyScreens: { ...enemyScreens } as SideScreens,
      playerHazards: { ...playerSideHazards } as SideHazards,
      enemyHazards: { ...enemySideHazards } as SideHazards
    };

    const runEndOfTurnPhase = async () => {
      // Clear flinch & protect, preserve yawnTurns/flashFireBoosted, and mark turn spent on field
      ctx.playerVolatile = {
        ...ctx.playerVolatile,
        isFlinched: false,
        isProtected: false,
        turnsOnField: Math.max(1, ctx.playerVolatile.turnsOnField ?? 0)
      };
      ctx.enemyVolatile = {
        ...ctx.enemyVolatile,
        isFlinched: false,
        isProtected: false,
        turnsOnField: Math.max(1, ctx.enemyVolatile.turnsOnField ?? 0)
      };
      setPlayerVolatile(ctx.playerVolatile);
      setEnemyVolatile(ctx.enemyVolatile);

      // Player status damage (Poison / Burn)
      ctx.playerHp = await handleStatusEndTurn(ctx.player, ctx.playerHp, setPlayerHp, ctx.playerStatus.status, setPlayerStatus);
      if (ctx.playerHp <= 0) {
        await handlePlayerFaint();
        return;
      }

      // Enemy status damage (Poison / Burn)
      ctx.enemyHp = await handleStatusEndTurn(ctx.enemy, ctx.enemyHp, setEnemyHp, ctx.enemyStatus.status, setEnemyStatus);
      if (ctx.enemyHp <= 0) {
        await handleWin(ctx.playerHp);
        return;
      }

      // Yawn end-of-turn drowsiness countdown / sleep affliction
      if (ctx.playerVolatile.yawnTurns) {
        const yawnP = processYawnEndTurn(ctx.player, ctx.playerVolatile, ctx.playerStatus.status, ctx.playerStatus.duration);
        if (yawnP.msg) addLog(yawnP.msg);
        ctx.playerVolatile = yawnP.nextVolatile;
        setPlayerVolatile(ctx.playerVolatile);
        if (yawnP.fellAsleep) {
          ctx.playerStatus = { status: yawnP.nextStatus, duration: yawnP.nextDuration };
          setPlayerStatus(ctx.playerStatus);
        }
      }

      if (ctx.enemyVolatile.yawnTurns) {
        const yawnE = processYawnEndTurn(ctx.enemy, ctx.enemyVolatile, ctx.enemyStatus.status, ctx.enemyStatus.duration);
        if (yawnE.msg) addLog(yawnE.msg);
        ctx.enemyVolatile = yawnE.nextVolatile;
        setEnemyVolatile(ctx.enemyVolatile);
        if (yawnE.fellAsleep) {
          ctx.enemyStatus = { status: yawnE.nextStatus, duration: yawnE.nextDuration };
          setEnemyStatus(ctx.enemyStatus);
        }
      }

      // Weather end-of-turn damage (Sandstorm / Hail)
      if (ctx.fieldWeather.type === 'sandstorm' || ctx.fieldWeather.type === 'hail') {
        const weatherP = processWeatherTurnEnd(ctx.player, ctx.playerHp, ctx.fieldWeather.type);
        if (weatherP.damage > 0) {
          addLog(weatherP.msg!);
          ctx.playerHp = weatherP.nextHp;
          setPlayerHp(ctx.playerHp);
          await new Promise(r => setTimeout(r, 600));
          if (ctx.playerHp <= 0) {
            await handlePlayerFaint();
            return;
          }
        }

        const weatherE = processWeatherTurnEnd(ctx.enemy, ctx.enemyHp, ctx.fieldWeather.type);
        if (weatherE.damage > 0) {
          addLog(weatherE.msg!);
          ctx.enemyHp = weatherE.nextHp;
          setEnemyHp(ctx.enemyHp);
          await new Promise(r => setTimeout(r, 600));
          if (ctx.enemyHp <= 0) {
            await handleWin(ctx.playerHp);
            return;
          }
        }
      }

      // Tick Weather
      const tw = tickWeather(ctx.fieldWeather);
      ctx.fieldWeather = tw.nextWeather;
      setFieldWeather(tw.nextWeather);
      if (tw.expiredMsg) {
        addLog(tw.expiredMsg);
      }

      // Tick Screens
      const sp = tickScreens(ctx.playerScreens, ctx.player.name);
      ctx.playerScreens = sp.nextScreens;
      setPlayerScreens(sp.nextScreens);
      sp.expiredMsgs.forEach(m => addLog(m));

      const se = tickScreens(ctx.enemyScreens, ctx.enemy.name);
      ctx.enemyScreens = se.nextScreens;
      setEnemyScreens(se.nextScreens);
      se.expiredMsgs.forEach(m => addLog(m));

      setIsAnimating(false);
    };

    // Helper for executing an individual combatant's attack within this turn
    const runCombatantAttack = async (
      attackerIsPlayer: boolean,
      isFirst: boolean
    ): Promise<{ 
      stopped: boolean;
      pivotSwitchRequired?: boolean;
    }> => {
      const attacker = attackerIsPlayer ? ctx.player : ctx.enemy;
      const target = attackerIsPlayer ? ctx.enemy : ctx.player;
      const move = attackerIsPlayer ? activePlayerMove : enemyMove;
      
      const attackerVolatile = attackerIsPlayer ? ctx.playerVolatile : ctx.enemyVolatile;
      const defenderVolatile = attackerIsPlayer ? ctx.enemyVolatile : ctx.playerVolatile;

      const setAttackerVolatile = (updater: React.SetStateAction<VolatileStatus>) => {
        if (attackerIsPlayer) {
          ctx.playerVolatile = typeof updater === 'function' ? updater(ctx.playerVolatile) : updater;
          setPlayerVolatile(ctx.playerVolatile);
        } else {
          ctx.enemyVolatile = typeof updater === 'function' ? updater(ctx.enemyVolatile) : updater;
          setEnemyVolatile(ctx.enemyVolatile);
        }
      };

      const setDefenderVolatile = (updater: React.SetStateAction<VolatileStatus>) => {
        if (attackerIsPlayer) {
          ctx.enemyVolatile = typeof updater === 'function' ? updater(ctx.enemyVolatile) : updater;
          setEnemyVolatile(ctx.enemyVolatile);
        } else {
          ctx.playerVolatile = typeof updater === 'function' ? updater(ctx.playerVolatile) : updater;
          setPlayerVolatile(ctx.playerVolatile);
        }
      };

      const attackerStatus = attackerIsPlayer ? ctx.playerStatus : ctx.enemyStatus;
      const setAttackerStatus = (updater: React.SetStateAction<{ status?: StatusCondition; duration?: number }>) => {
        if (attackerIsPlayer) {
          ctx.playerStatus = typeof updater === 'function' ? updater(ctx.playerStatus) : updater;
          setPlayerStatus(ctx.playerStatus);
        } else {
          ctx.enemyStatus = typeof updater === 'function' ? updater(ctx.enemyStatus) : updater;
          setEnemyStatus(ctx.enemyStatus);
        }
      };

      const defenderStatus = attackerIsPlayer ? ctx.enemyStatus : ctx.playerStatus;
      const setDefenderStatus = (updater: React.SetStateAction<{ status?: StatusCondition; duration?: number }>) => {
        if (attackerIsPlayer) {
          ctx.enemyStatus = typeof updater === 'function' ? updater(ctx.enemyStatus) : updater;
          setEnemyStatus(ctx.enemyStatus);
        } else {
          ctx.playerStatus = typeof updater === 'function' ? updater(ctx.playerStatus) : updater;
          setPlayerStatus(ctx.playerStatus);
        }
      };
      
      const attackerStages = attackerIsPlayer ? ctx.playerStages : ctx.enemyStages;
      const setAttackerStages = (updater: React.SetStateAction<BattleStages>) => {
        if (attackerIsPlayer) {
          ctx.playerStages = typeof updater === 'function' ? updater(ctx.playerStages) : updater;
          setPlayerStages(ctx.playerStages);
        } else {
          ctx.enemyStages = typeof updater === 'function' ? updater(ctx.enemyStages) : updater;
          setEnemyStages(ctx.enemyStages);
        }
      };

      const defenderStages = attackerIsPlayer ? ctx.enemyStages : ctx.playerStages;
      const setDefenderStages = (updater: React.SetStateAction<BattleStages>) => {
        if (attackerIsPlayer) {
          ctx.enemyStages = typeof updater === 'function' ? updater(ctx.enemyStages) : updater;
          setEnemyStages(ctx.enemyStages);
        } else {
          ctx.playerStages = typeof updater === 'function' ? updater(ctx.playerStages) : updater;
          setPlayerStages(ctx.playerStages);
        }
      };

      const userHp = attackerIsPlayer ? ctx.playerHp : ctx.enemyHp;
      const setUserHp = attackerIsPlayer ? setPlayerHp : setEnemyHp;
      const targetHp = attackerIsPlayer ? ctx.enemyHp : ctx.playerHp;
      const setTargetHp = attackerIsPlayer ? setEnemyHp : setPlayerHp;

      // 1. Flinch Check (if opponent moved first and flinch occurred)
      const flinch = checkFlinch(attacker, attackerVolatile.isFlinched);
      if (!flinch.canAct) {
        addLog(flinch.msg!);
        setAttackerVolatile(prev => ({ 
          ...prev, 
          isFlinched: false, 
          charging: false, 
          chargingState: undefined, 
          lockedMove: undefined 
        }));
        await new Promise(r => setTimeout(r, 700));
        return { stopped: false };
      }

      // 1a. Recharge Check
      if (attackerVolatile.recharging) {
        addLog(`${attacker.name} deve ricaricarsi!`);
        setAttackerVolatile(prev => ({ ...prev, recharging: false, lockedMove: undefined }));
        await new Promise(r => setTimeout(r, 700));
        return { stopped: false };
      }

      // 2. Primary Status Check (Sleep, Frozen, Paralysis)
      const moveCheck = canMove({ ...attacker, status: attackerStatus.status, statusDuration: attackerStatus.duration });
      if (moveCheck.statusChanged) {
        setAttackerStatus({ status: moveCheck.newStatus, duration: moveCheck.newDuration });
      }
      if (!moveCheck.canMove) {
        if (moveCheck.msg) addLog(moveCheck.msg);
        setAttackerVolatile(prev => ({ 
          ...prev, 
          charging: false, 
          chargingState: undefined, 
          lockedMove: undefined 
        }));
        await new Promise(r => setTimeout(r, 700));
        return { stopped: false };
      }
      if (moveCheck.msg) {
        addLog(moveCheck.msg);
      }

      // 3. Confusion Check
      if (attackerVolatile.confusionTurns && attackerVolatile.confusionTurns > 0) {
        const conf = checkConfusion(attacker, attackerVolatile.confusionTurns);
        setAttackerVolatile(prev => ({ 
          ...prev, 
          confusionTurns: conf.newTurns,
          ...(conf.hurtSelf ? { charging: false, chargingState: undefined, lockedMove: undefined } : {})
        }));
        if (conf.msg) addLog(conf.msg);

        if (conf.hurtSelf && conf.damage) {
          const nextUserHp = Math.max(0, userHp - conf.damage);
          if (attackerIsPlayer) ctx.playerHp = nextUserHp;
          else ctx.enemyHp = nextUserHp;
          setUserHp(nextUserHp);
          await new Promise(r => setTimeout(r, 800));

          if (nextUserHp <= 0) {
            if (attackerIsPlayer) {
              await handlePlayerFaint();
            } else {
              await handleWin(ctx.playerHp);
            }
            return { stopped: true };
          }
          return { stopped: false };
        }
      }

      // 4. Deduct PP (only if not currently executing a locked move)
      if (!attackerVolatile.lockedMove) {
        if (attackerIsPlayer) {
          deductPlayerPp(move.name);
        } else {
          deductEnemyPp(move.name);
        }
      }

      // 5. Multi-turn Charge Check
      if (move.multiTurn?.type === 'charge' && !attackerVolatile.charging) {
        let chargeMsg = move.multiTurn.chargeMessage;
        let cState: 'fly' | 'dig' | 'dive' | 'bounce' | 'charge' = 'charge';
        const mLower = move.name.toLowerCase();
        if (mLower.includes('volo') || mLower.includes('fly')) {
          cState = 'fly';
          chargeMsg = chargeMsg || 'è volato alto nel cielo!';
        } else if (mLower.includes('fossa') || mLower.includes('dig')) {
          cState = 'dig';
          chargeMsg = chargeMsg || 'si è rintanato sottoterra!';
        } else if (mLower.includes('sub') || mLower.includes('dive') || mLower.includes('immersione')) {
          cState = 'dive';
          chargeMsg = chargeMsg || 'si è immerso negli abissi!';
        } else if (mLower.includes('rimbalzo') || mLower.includes('bounce')) {
          cState = 'bounce';
          chargeMsg = chargeMsg || 'rimbalza altissimo nel cielo!';
        } else {
          chargeMsg = chargeMsg || 'assorbe energia!';
        }

        playCharge();
        addLog(`${attacker.name} ${chargeMsg}`);
        setAttackerVolatile(prev => ({ 
          ...prev, 
          charging: true, 
          chargingState: cState,
          lockedMove: move 
        }));
        await new Promise(r => setTimeout(r, 700));
        return { stopped: false };
      }

      // If we were charging, clear it as we are now attacking
      if (attackerVolatile.charging) {
        setAttackerVolatile(prev => ({ 
          ...prev, 
          charging: false, 
          chargingState: undefined, 
          lockedMove: undefined 
        }));
      }

      // Trigger GBA Move Animation
      if (state.settings?.moveAnimationsEnabled !== false) {
        setFxData({
          moveName: move.name,
          moveType: move.type || 'normal',
          category: move.category,
          targetSide: attackerIsPlayer ? 'opponent' : 'player'
        });
        await new Promise(r => setTimeout(r, 650));
      }

      // 6. Execute Move Action
      const currentLowHpBonus = (ctx.playerHp / ctx.player.maxHp) < 0.35 ? towerLowHpBonus : 1;
      
      let bossAtkMult = 1;
      let bossDefMult = 1;
      if (!attackerIsPlayer && bossBuff) {
        if (bossBuff === 'ghetsis_tyranny') bossAtkMult = 1.16;
        if (bossBuff === 'rosso_aura' || bossBuff === 'lance_dragon' || bossBuff === 'nardo_spirit' || bossBuff === 'nemona_passion' || bossBuff === 'cyrus_void' || bossBuff === 'silver_instinct') bossAtkMult = 1.14;
        if (bossBuff === 'dandel_gigamax' || bossBuff === 'perla_origins' || bossBuff === 'iridio_synthesis' || bossBuff === 'oak_wisdom' || bossBuff === 'volo_shadow' || bossBuff === 'diantea_grace') bossAtkMult = 1.12;
        if (bossBuff === 'blu_arrogance') bossAtkMult = 1.12;

        if (bossBuff === 'camilla_presence' || bossBuff === 'oak_wisdom' || bossBuff === 'palmer_tower' || bossBuff === 'diantea_grace') bossDefMult = 1.14;
        if (bossBuff === 'rocco_steel' || bossBuff === 'baldo_fortress') bossDefMult = 1.17;
        if (bossBuff === 'blu_arrogance' || bossBuff === 'iridio_synthesis') bossDefMult = 1.12;
      }

      const canPlayerPivot = state.player.team.some((p, idx) => idx !== 0 && p.hp > 0);
      const canEnemyPivot = Boolean(
        trainer &&
        ctx.enemyTeam.some(p => (p.instanceId ? p.instanceId !== ctx.enemy.instanceId : p.id !== ctx.enemy.id) && p.hp > 0)
      );

      const combatOptions = attackerIsPlayer ? {
        attackMultiplier: towerAttackMult * currentLowHpBonus,
        critChanceBonus: towerCritChanceBonus,
        lifestealPercent: towerLifeStealPercent,
        accuracyPenalty: towerAccuracyPenalty + (bossBuff === 'blu_arrogance' ? 8 : 0),
        bossMutationType: bossMutation?.type,
        userSideHazards: ctx.playerHazards,
        setUserSideHazards: (updater: React.SetStateAction<SideHazards>) => {
          ctx.playerHazards = typeof updater === 'function' ? updater(ctx.playerHazards) : updater;
          setPlayerSideHazards(ctx.playerHazards);
        },
        targetSideHazards: ctx.enemyHazards,
        setTargetSideHazards: (updater: React.SetStateAction<SideHazards>) => {
          ctx.enemyHazards = typeof updater === 'function' ? updater(ctx.enemyHazards) : updater;
          setEnemySideHazards(ctx.enemyHazards);
        },
        weather: ctx.fieldWeather.type,
        setWeather: (w: WeatherType) => {
          ctx.fieldWeather = { type: w, turns: 5 };
          setFieldWeather(ctx.fieldWeather);
        },
        userScreens: ctx.playerScreens,
        setUserScreens: (updater: React.SetStateAction<SideScreens>) => {
          ctx.playerScreens = typeof updater === 'function' ? updater(ctx.playerScreens) : updater;
          setPlayerScreens(ctx.playerScreens);
        },
        targetScreens: ctx.enemyScreens,
        setTargetScreens: (updater: React.SetStateAction<SideScreens>) => {
          ctx.enemyScreens = typeof updater === 'function' ? updater(ctx.enemyScreens) : updater;
          setEnemyScreens(ctx.enemyScreens);
        },
        isWildBattle: !trainer,
        canUserPivotSwitch: canPlayerPivot,
        onCureTeamStatus: curePlayerTeamStatus
      } : {
        attackMultiplier: bossAtkMult,
        defenseMultiplier: towerDefMult * bossDefMult,
        incomingDamageMultiplier: towerIncomingDmgMult,
        dodgeChance: towerDodgeChance,
        bossMutationType: bossMutation?.type,
        userSideHazards: ctx.enemyHazards,
        setUserSideHazards: (updater: React.SetStateAction<SideHazards>) => {
          ctx.enemyHazards = typeof updater === 'function' ? updater(ctx.enemyHazards) : updater;
          setEnemySideHazards(ctx.enemyHazards);
        },
        targetSideHazards: ctx.playerHazards,
        setTargetSideHazards: (updater: React.SetStateAction<SideHazards>) => {
          ctx.playerHazards = typeof updater === 'function' ? updater(ctx.playerHazards) : updater;
          setPlayerSideHazards(ctx.playerHazards);
        },
        weather: ctx.fieldWeather.type,
        setWeather: (w: WeatherType) => {
          ctx.fieldWeather = { type: w, turns: 5 };
          setFieldWeather(ctx.fieldWeather);
        },
        userScreens: ctx.enemyScreens,
        setUserScreens: (updater: React.SetStateAction<SideScreens>) => {
          ctx.enemyScreens = typeof updater === 'function' ? updater(ctx.enemyScreens) : updater;
          setEnemyScreens(ctx.enemyScreens);
        },
        targetScreens: ctx.playerScreens,
        setTargetScreens: (updater: React.SetStateAction<SideScreens>) => {
          ctx.playerScreens = typeof updater === 'function' ? updater(ctx.playerScreens) : updater;
          setPlayerScreens(ctx.playerScreens);
        },
        isWildBattle: !trainer,
        canUserPivotSwitch: canEnemyPivot,
        onCureTeamStatus: cureEnemyTeamStatus
      };

      const actionRes = executeMoveAction(
        move,
        attacker,
        target,
        attackerStages,
        setAttackerStages,
        defenderStages,
        setDefenderStages,
        attackerStatus,
        setAttackerStatus,
        defenderStatus,
        setDefenderStatus,
        attackerVolatile,
        setAttackerVolatile,
        defenderVolatile,
        setDefenderVolatile,
        userHp,
        setUserHp,
        targetHp,
        setTargetHp,
        attackerIsPlayer,
        isFirst,
        addLog,
        combatOptions
      );

      // 7. Handle Recharge
      if (move.multiTurn?.type === 'recharge' && !actionRes.targetFainted) {
        setAttackerVolatile(prev => ({ ...prev, recharging: true, lockedMove: move }));
      }

      await new Promise(r => setTimeout(r, 800));

      ctx.playerHp = attackerIsPlayer ? actionRes.nextUserHp : actionRes.nextTargetHp;
      ctx.enemyHp = attackerIsPlayer ? actionRes.nextTargetHp : actionRes.nextUserHp;
      if (attackerIsPlayer) {
        if (actionRes.nextUserStatus) ctx.playerStatus = actionRes.nextUserStatus;
        if (actionRes.nextTargetStatus) ctx.enemyStatus = actionRes.nextTargetStatus;
      } else {
        if (actionRes.nextUserStatus) ctx.enemyStatus = actionRes.nextUserStatus;
        if (actionRes.nextTargetStatus) ctx.playerStatus = actionRes.nextTargetStatus;
      }

      if (actionRes.forceFlee) {
        await new Promise(r => setTimeout(r, 600));
        setBattleResult({ type: 'escape' });
        return { stopped: true };
      }

      if (actionRes.forceSwitchTarget) {
        await new Promise(r => setTimeout(r, 600));
        if (attackerIsPlayer) {
          const currentEnemyId = ctx.enemy.instanceId || ctx.enemy.id;
          const availableEnemies = ctx.enemyTeam.filter(p => (p.instanceId || p.id) !== currentEnemyId && p.hp > 0);
          if (availableEnemies.length > 0) {
            const nextChosenEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
            addLog(`🔄 ${trainer?.name || 'L\'avversario'} manda in campo ${nextChosenEnemy.name}!`);
            const enemyHazardRes = processEntryHazards(nextChosenEnemy, nextChosenEnemy.hp, ctx.enemyHazards, nextChosenEnemy.status);
            if (enemyHazardRes.logs.length > 0) enemyHazardRes.logs.forEach(m => addLog(m));
            ctx.enemyHazards = enemyHazardRes.updatedSideHazards;
            ctx.enemy = nextChosenEnemy;
            ctx.enemyHp = enemyHazardRes.nextHp;
            ctx.enemyStatus = { status: enemyHazardRes.nextStatus, duration: enemyHazardRes.nextStatusDuration ?? nextChosenEnemy.statusDuration };
            ctx.enemyStages = {
              attack: 0,
              defense: 0,
              spAtk: 0,
              spDef: 0,
              speed: enemyHazardRes.nextSpeedStageDelta ? Math.max(-6, Math.min(6, enemyHazardRes.nextSpeedStageDelta)) : 0,
              accuracy: 0,
              evasion: 0
            };
            ctx.enemyVolatile = {};
            setEnemySideHazards(ctx.enemyHazards);
            setEnemy(ctx.enemy);
            setEnemyHp(ctx.enemyHp);
            setEnemyMoves(nextChosenEnemy.moves.map(resolveBattleMove));
            setEnemyStatus(ctx.enemyStatus);
            setEnemyStages(ctx.enemyStages);
            setEnemyVolatile({});
            const swAbility = processSwitchInAbility(
              ctx.enemy,
              ctx.player,
              ctx.playerStages,
              ctx.fieldWeather.type,
              Boolean(ctx.playerVolatile.substituteHp && ctx.playerVolatile.substituteHp > 0)
            );
            if (swAbility.triggered) {
              if (swAbility.msg) addLog(swAbility.msg);
              if (swAbility.nextWeather) {
                ctx.fieldWeather = { type: swAbility.nextWeather, turns: 5 };
                setFieldWeather(ctx.fieldWeather);
              }
              if (swAbility.nextOpponentStages) {
                ctx.playerStages = swAbility.nextOpponentStages;
                setPlayerStages(ctx.playerStages);
              }
            }
            return { stopped: true };
          } else {
            addLog("Ma è fallita! Non ci sono altri Pokémon nella squadra avversaria!");
          }
        } else {
          const availablePlayerIndices = state.player.team
            .map((p, idx) => ({ p, idx }))
            .filter(({ p, idx }) => idx !== 0 && p.hp > 0);
          if (availablePlayerIndices.length > 0) {
            const chosen = availablePlayerIndices[Math.floor(Math.random() * availablePlayerIndices.length)];
            handleSwitch(chosen.idx);
            return { stopped: true };
          } else {
            addLog("Ma è fallita! Non ci sono altri Pokémon pronti a lottare!");
          }
        }
      }

      if (actionRes.targetFainted) {
        if (attackerIsPlayer) {
          await handleWin(ctx.playerHp);
        } else {
          await handlePlayerFaint();
        }
        return { stopped: true };
      }

      if (actionRes.userFainted) {
        if (attackerIsPlayer) {
          await handlePlayerFaint();
        } else {
          await handleWin(ctx.playerHp);
        }
        return { stopped: true };
      }

      // Enemy Pivot Switch (Retromarcia / Invertivolt / Virata)
      if (!attackerIsPlayer && actionRes.pivotSwitchRequired && trainer) {
        const currentEnemyId = ctx.enemy.instanceId || ctx.enemy.id;
        ctx.enemyTeam = ctx.enemyTeam.map(p =>
          (p.instanceId ? p.instanceId === currentEnemyId : p.id === ctx.enemy.id)
            ? { ...p, hp: ctx.enemyHp, status: ctx.enemyStatus.status, statusDuration: ctx.enemyStatus.duration }
            : p
        );
        const availableEnemies = ctx.enemyTeam.filter(p => (p.instanceId || p.id) !== currentEnemyId && p.hp > 0);
        if (availableEnemies.length > 0) {
          const nextChosenEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
          addLog(`🔄 ${ctx.enemy.name} rientra! ${trainer.name} manda in campo ${nextChosenEnemy.name}!`);
          await new Promise(r => setTimeout(r, 700));
          const enemyHazardRes = processEntryHazards(nextChosenEnemy, nextChosenEnemy.hp, ctx.enemyHazards, nextChosenEnemy.status);
          if (enemyHazardRes.logs.length > 0) enemyHazardRes.logs.forEach(msg => addLog(msg));
          ctx.enemyHazards = enemyHazardRes.updatedSideHazards;
          ctx.enemy = nextChosenEnemy;
          ctx.enemyHp = enemyHazardRes.nextHp;
          ctx.enemyStatus = { status: enemyHazardRes.nextStatus, duration: enemyHazardRes.nextStatusDuration ?? nextChosenEnemy.statusDuration };
          ctx.enemyStages = {
            attack: 0,
            defense: 0,
            spAtk: 0,
            spDef: 0,
            speed: enemyHazardRes.nextSpeedStageDelta ? Math.max(-6, Math.min(6, enemyHazardRes.nextSpeedStageDelta)) : 0,
            accuracy: 0,
            evasion: 0
          };
          ctx.enemyVolatile = {};
          setEnemySideHazards(ctx.enemyHazards);
          setEnemyTeam(ctx.enemyTeam);
          setEnemy(ctx.enemy);
          setEnemyHp(ctx.enemyHp);
          setEnemyMoves(nextChosenEnemy.moves.map(resolveBattleMove));
          setEnemyStatus(ctx.enemyStatus);
          setEnemyStages(ctx.enemyStages);
          setEnemyVolatile({});
          if (ctx.enemyHp <= 0) {
            addLog(`${ctx.enemy.name} è k.o. a causa delle trappole sul campo!`);
            await handleWin(ctx.playerHp);
            return { stopped: true };
          }
          const swAbility = processSwitchInAbility(
            ctx.enemy,
            ctx.player,
            ctx.playerStages,
            ctx.fieldWeather.type,
            Boolean(ctx.playerVolatile.substituteHp && ctx.playerVolatile.substituteHp > 0)
          );
          if (swAbility.triggered) {
            if (swAbility.msg) addLog(swAbility.msg);
            if (swAbility.nextWeather) {
              ctx.fieldWeather = { type: swAbility.nextWeather, turns: 5 };
              setFieldWeather(ctx.fieldWeather);
            }
            if (swAbility.nextOpponentStages) {
              ctx.playerStages = swAbility.nextOpponentStages;
              setPlayerStages(ctx.playerStages);
            }
          }
        }
      }

      return { 
        stopped: false,
        pivotSwitchRequired: attackerIsPlayer ? actionRes.pivotSwitchRequired : false
      };
    };

    // --- CHECK ELITE / BOSS FULL RESTORE USAGE ---
    const isEliteOrBoss = Boolean(bossBuff) || Boolean(trainer?.id && (
      trainer.id.startsWith('superquattro-') || 
      trainer.id.startsWith('campione-') || 
      trainer.id === 'campione-pm' ||
      trainer.id.startsWith('boss-')
    ));

    const enemyUsesHeal = shouldEnemyUseFullRestore(
      isEliteOrBoss,
      enemyHp,
      enemy.maxHp,
      enemyHealsRemaining
    );

    if (enemyUsesHeal) {
      setEnemyHealsRemaining(prev => Math.max(0, prev - 1));
      const trainerTitle = trainer?.name ? trainer.name : 'Il Boss';
      addLog(`👑 ${trainerTitle} usa una Ricarica Totale su ${enemy.name}!`);
      try { playLevelUp(); } catch { /* ignore */ }

      const healedHp = enemy.maxHp;
      ctx.enemyHp = healedHp;
      ctx.enemyStatus = { status: undefined, duration: undefined };
      setEnemyHp(healedHp);
      setEnemyStatus({ status: undefined, duration: undefined });
      addLog(`✨ I PS di ${enemy.name} tornano al massimo e ogni problema di stato è stato curato! (${enemyHealsRemaining - 1} rimaste)`);
      await new Promise(r => setTimeout(r, 900));

      const playerResult = await runCombatantAttack(true, true);
      if (playerResult.stopped) return;

      if (playerResult.pivotSwitchRequired && state.player.team.some((p, i) => i !== 0 && p.hp > 0)) {
        pendingPivotRef.current = async (switchedIn, switchedHp, switchedStatus, switchedStages, updatedWeather) => {
          ctx.player = switchedIn;
          ctx.playerHp = switchedHp;
          ctx.playerStatus = switchedStatus;
          ctx.playerStages = switchedStages;
          ctx.playerVolatile = {};
          ctx.fieldWeather = updatedWeather;
          await new Promise(r => setTimeout(r, 400));
          await runEndOfTurnPhase();
        };
        setIsPivotSwitch(true);
        setShowSwitch(true);
        setIsAnimating(false);
        return;
      }

      await new Promise(r => setTimeout(r, 500));
      await runEndOfTurnPhase();
      return;
    }

    // --- EXECUTION PHASE 1: FIRST COMBATANT ---
    const firstResult = await runCombatantAttack(playerFirst, true);
    if (firstResult.stopped) {
      return;
    }

    if (playerFirst && firstResult.pivotSwitchRequired && state.player.team.some((p, i) => i !== 0 && p.hp > 0)) {
      pendingPivotRef.current = async (switchedIn, switchedHp, switchedStatus, switchedStages, updatedWeather) => {
        ctx.player = switchedIn;
        ctx.playerHp = switchedHp;
        ctx.playerStatus = switchedStatus;
        ctx.playerStages = switchedStages;
        ctx.playerVolatile = {};
        ctx.fieldWeather = updatedWeather;
        await new Promise(r => setTimeout(r, 500));
        const secondResAfterPivot = await runCombatantAttack(false, false);
        if (secondResAfterPivot.stopped) return;
        await runEndOfTurnPhase();
      };
      setIsPivotSwitch(true);
      setShowSwitch(true);
      setIsAnimating(false);
      return;
    }

    await new Promise(r => setTimeout(r, 500));

    // --- EXECUTION PHASE 2: SECOND COMBATANT ---
    const secondResult = await runCombatantAttack(!playerFirst, false);
    if (secondResult.stopped) {
      return;
    }

    if (!playerFirst && secondResult.pivotSwitchRequired && state.player.team.some((p, i) => i !== 0 && p.hp > 0)) {
      pendingPivotRef.current = async (switchedIn, switchedHp, switchedStatus, switchedStages, updatedWeather) => {
        ctx.player = switchedIn;
        ctx.playerHp = switchedHp;
        ctx.playerStatus = switchedStatus;
        ctx.playerStages = switchedStages;
        ctx.playerVolatile = {};
        ctx.fieldWeather = updatedWeather;
        await new Promise(r => setTimeout(r, 400));
        await runEndOfTurnPhase();
      };
      setIsPivotSwitch(true);
      setShowSwitch(true);
      setIsAnimating(false);
      return;
    }

    // --- EXECUTION PHASE 3: END OF TURN ---
    await runEndOfTurnPhase();
  }, [
    isAnimating, isPivotSwitch, playerMoves, enemyMoves, getEffectiveSpeed, playerActive, 
    playerStages, playerStatus, enemy, enemyTeam, enemyStages, enemyStatus, playerVolatile, 
    enemyVolatile, deductPlayerPp, deductEnemyPp, curePlayerTeamStatus, cureEnemyTeamStatus,
    handleWin, handlePlayerFaint, handleStatusEndTurn, addLog, playerHp, enemyHp,
    fieldWeather, playerScreens, enemyScreens, playerSideHazards, enemySideHazards,
    bossBuff, bossMutation, trainer, state.player.team, state.settings?.moveAnimationsEnabled,
    enemyHealsRemaining, towerSpeedMult, towerLowHpBonus, towerAttackMult, towerCritChanceBonus,
    towerLifeStealPercent, towerAccuracyPenalty, towerDefMult, towerIncomingDmgMult, towerDodgeChance
  ]);

  // Auto-trigger locked / multi-turn moves on Turn 2 (e.g. Volo, Fossa, Sub, Solarraggio, Iper Raggio ricarica)
  useEffect(() => {
    if (
      !isAnimating &&
      !battleResult &&
      !postBattleData &&
      !catchBall &&
      !showSwitch &&
      !showBag &&
      !showRansomModal &&
      playerHp > 0 &&
      enemyHp > 0 &&
      Boolean(playerVolatile.lockedMove || playerVolatile.charging || playerVolatile.recharging)
    ) {
      const timer = setTimeout(() => {
        const moveToRun = playerVolatile.lockedMove || playerMoves[0] || STRUGGLE_MOVE;
        handleMove(moveToRun);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [
    isAnimating,
    battleResult,
    postBattleData,
    catchBall,
    showSwitch,
    showBag,
    showRansomModal,
    playerHp,
    enemyHp,
    playerVolatile.lockedMove,
    playerVolatile.charging,
    playerVolatile.recharging,
    handleMove,
    playerMoves
  ]);

  const syncActivePokemonState = useCallback(() => {
    setState(prev => {
      const team = [...prev.player.team];
      if (team[0]) {
        team[0] = {
          ...team[0],
          hp: playerHp,
          status: playerStatus.status,
          statusDuration: playerStatus.duration,
          moves: playerMoves
        };
      }
      return {
        ...prev,
        player: {
          ...prev.player,
          team
        }
      };
    });
  }, [playerHp, playerStatus, playerMoves, setState]);

  // Escape Handler (Formula-based for wild encounters; blocked for trainers)
  const handleEscape = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);

    if (trainer) {
      addLog("Non puoi fuggire da una lotta contro un Allenatore!");
      await new Promise(r => setTimeout(r, 1000));
      setIsAnimating(false);
      return;
    }

    const effPlayerSpeed = getEffectiveSpeed(playerActive.stats.speed, playerStages.speed ?? 0, playerStatus.status);
    const effEnemySpeed = getEffectiveSpeed(enemy.stats.speed, enemyStages.speed ?? 0, enemyStatus.status);

    const nextAttempts = escapeAttempts + 1;
    setEscapeAttempts(nextAttempts);

    addLog(`${playerActive.name} tenta la fuga...`);
    await new Promise(r => setTimeout(r, 800));

    const result = calculateEscape(effPlayerSpeed, effEnemySpeed, nextAttempts);
    addLog(result.msg);

    if (result.success) {
      playEscape();
      await new Promise(r => setTimeout(r, 1200));
      syncActivePokemonState();
      setBattleResult({ type: 'escape' });
    } else {
      await new Promise(r => setTimeout(r, 1000));
      // Enemy gets free turn upon failed escape
      await triggerEnemySingleTurn(playerHp, enemyHp);
    }
  }, [
    isAnimating, trainer, getEffectiveSpeed, playerActive.stats.speed, 
    playerStages.speed, playerStatus.status, enemy.stats.speed, 
    enemyStages.speed, enemyStatus.status, escapeAttempts, addLog, 
    triggerEnemySingleTurn, playerHp, enemyHp, syncActivePokemonState
  ]);

  // Switch Pokemon handler
  const handleSwitch = useCallback(async (index: number) => {
    const wasPivot = isPivotSwitch;
    if (index === 0 || (isAnimating && playerHp > 0 && !wasPivot)) return;
    const nextPkmn = state.player.team[index];
    if (!nextPkmn || nextPkmn.hp <= 0) return;

    if (wasPivot) {
      setIsAnimating(true);
    }

    const wasFainted = playerHp <= 0;
    addLog(`Torna, ${playerActive.name}! Vai, ${nextPkmn.name}!`);
    
    // Reset volatile states and stages on switch
    setPlayerVolatile({});
    let incomingStages: BattleStages = { attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 };
    setPlayerStages(incomingStages);

    setState(prev => {
      const team = [...prev.player.team];
      team[0] = { 
        ...team[0], 
        hp: playerHp, 
        status: playerStatus.status, 
        statusDuration: playerStatus.status === 'badly-poisoned' ? 1 : playerStatus.duration,
        moves: playerMoves 
      };
      const [removed] = team.splice(index, 1);
      team.unshift(removed);
      return { ...prev, player: { ...prev.player, team } };
    });

    // Process Entry Hazards on incoming Pokemon
    const hazardRes = processEntryHazards(nextPkmn, nextPkmn.hp, playerSideHazards, nextPkmn.status);
    let switchedHp = hazardRes.nextHp;
    let switchedStatus = hazardRes.nextStatus;
    const switchedDuration = hazardRes.nextStatusDuration ?? nextPkmn.statusDuration;
    
    if (hazardRes.logs.length > 0) {
      hazardRes.logs.forEach(msg => addLog(msg));
    }
    setPlayerSideHazards(hazardRes.updatedSideHazards);
    setPlayerHp(switchedHp);
    setPlayerMoves(nextPkmn.moves.map(resolveBattleMove));
    const switchedStatusObj = { 
      status: switchedStatus, 
      duration: switchedDuration 
    };
    setPlayerStatus(switchedStatusObj);
    if (hazardRes.nextSpeedStageDelta) {
      incomingStages = {
        ...incomingStages,
        speed: Math.max(-6, Math.min(6, incomingStages.speed + hazardRes.nextSpeedStageDelta))
      };
      setPlayerStages(incomingStages);
    }
    setShowSwitch(false);
    setIsPivotSwitch(false);
    
    if (switchedHp <= 0) {
      pendingPivotRef.current = null;
      await handlePlayerFaint();
      return;
    }

    // Trigger incoming player's Switch-In Core Ability (Prepotenza / Meteo)
    let updatedEnemyStages = { ...enemyStages };
    let updatedWeather: FieldWeather = { ...fieldWeather };
    const switchInAbility = processSwitchInAbility(
      nextPkmn,
      enemy,
      updatedEnemyStages,
      updatedWeather.type,
      Boolean(enemyVolatile.substituteHp && enemyVolatile.substituteHp > 0)
    );
    if (switchInAbility.triggered) {
      if (switchInAbility.msg) addLog(switchInAbility.msg);
      if (switchInAbility.nextWeather) {
        updatedWeather = { type: switchInAbility.nextWeather, turns: 5 };
        setFieldWeather(updatedWeather);
      }
      if (switchInAbility.nextOpponentStages) {
        updatedEnemyStages = switchInAbility.nextOpponentStages;
        setEnemyStages(updatedEnemyStages);
      }
    }

    if (wasPivot && pendingPivotRef.current) {
      const continuation = pendingPivotRef.current;
      pendingPivotRef.current = null;
      await continuation(nextPkmn, switchedHp, switchedStatusObj, incomingStages, updatedWeather);
      return;
    }

    if (!wasFainted) {
      await triggerEnemySingleTurn(switchedHp, enemyHp, true, {
        playerPokemon: nextPkmn,
        playerStatus: switchedStatusObj,
        playerStages: incomingStages,
        playerVolatile: {},
        enemyStages: updatedEnemyStages,
        weather: updatedWeather
      });
    } else {
      if (enemyHp > 0 && enemyStatus.status) {
        const nextE = await handleStatusEndTurn(
          enemy, 
          enemyHp, 
          setEnemyHp, 
          enemyStatus.status, 
          setEnemyStatus
        );
        if (nextE <= 0) {
          await handleWin(switchedHp);
          return;
        }
      }
      setIsAnimating(false);
    }
  }, [
    isAnimating, isPivotSwitch, playerHp, state.player.team, addLog, playerActive.name, 
    setState, playerStatus, playerMoves, playerSideHazards, triggerEnemySingleTurn, enemy,
    enemyHp, enemyStatus, enemyStages, enemyVolatile.substituteHp, fieldWeather,
    handlePlayerFaint, handleStatusEndTurn, handleWin
  ]);

  // Item Use in Battle
  const handleUseItem = useCallback(async (item: Item, targetIndex: number = 0) => {
    setShowBag(false);
    setIsAnimating(true);
    
    const isTargetActive = targetIndex === 0;
    const targetPokemon = isTargetActive
      ? { ...playerActive, hp: playerHp, status: playerStatus.status, statusDuration: playerStatus.duration }
      : (state.player.team[targetIndex] || playerActive);

    const result = useItemInBattle(item, targetPokemon);
    
    if (result.success) {
      if (item.type !== 'capture') {
        addLog(`Usi ${item.name} su ${targetPokemon.name}!`);
        await new Promise(r => setTimeout(r, 600));
      }
      addLog(result.msg);
      
      // Consume item from inventory
      setState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          inventory: prev.player.inventory.map(i => i.id === item.id ? { ...i, count: i.count - 1 } : i)
        }
      }));

      if (['antidoto', 'antiparalisi', 'antiscotto', 'sveglia', 'cura-totale', 'full-heal'].includes(item.id)) {
        if (isTargetActive) {
          setPlayerStatus({ status: undefined, duration: undefined });
          setState(prev => {
            const team = [...prev.player.team];
            team[0] = { ...team[0], status: undefined, statusDuration: undefined };
            return { ...prev, player: { ...prev.player, team } };
          });
        } else {
          setState(prev => {
            const team = [...prev.player.team];
            team[targetIndex] = { ...team[targetIndex], status: undefined, statusDuration: undefined };
            return { ...prev, player: { ...prev.player, team } };
          });
        }

        await new Promise(r => setTimeout(r, 1000));
        await triggerEnemySingleTurn(playerHp, enemyHp);
      } else if (item.type === 'healing') {
        const isRevive = item.id.includes('revitalizzante');
        let nextHp = targetPokemon.hp;

        if (isRevive) {
          const ratio = item.id === 'revitalizzante-max' ? 1 : 0.5;
          nextHp = Math.floor(targetPokemon.maxHp * ratio);
        } else if (item.id === 'pozione-max') {
          nextHp = targetPokemon.maxHp;
        } else {
          const healAmount = item.effectValue || (item.id === 'iper-pozione' ? 200 : item.id === 'super-pozione' ? 50 : 20);
          nextHp = Math.min(targetPokemon.maxHp, targetPokemon.hp + healAmount);
        }

        if (isTargetActive) {
          setPlayerHp(nextHp);
          setState(prev => {
            const team = [...prev.player.team];
            team[0] = { ...team[0], hp: nextHp };
            return { ...prev, player: { ...prev.player, team } };
          });
        } else {
          setState(prev => {
            const team = [...prev.player.team];
            team[targetIndex] = { ...team[targetIndex], hp: nextHp };
            return { ...prev, player: { ...prev.player, team } };
          });
        }

        await new Promise(r => setTimeout(r, 1000));
        await triggerEnemySingleTurn(isTargetActive ? nextHp : playerHp, enemyHp);
      } else if (item.type === 'capture') {
        if (trainer) {
          addLog("Non puoi rubare i Pokémon degli altri allenatori!");
          await new Promise(r => setTimeout(r, 1000));
          await triggerEnemySingleTurn(playerHp, enemyHp);
          return;
        }

        // Trigger Catch Overlay
        setCatchBall(item);
      }
    } else {
      addLog(result.msg);
      setIsAnimating(false);
    }
  }, [playerActive, playerHp, enemyHp, playerStatus, addLog, setState, triggerEnemySingleTurn, trainer, state.player.team]);

  // Capture result
  const handleCatchResult = async (success: boolean) => {
    if (success && catchBall) {
      syncActivePokemonState();
      setBattleResult({ type: 'catch', ball: catchBall });
    } else {
      setCatchBall(null);
      setIsAnimating(false);
      addLog(`Oh no! ${enemy.name} si è liberato!`);
      await triggerEnemySingleTurn(playerHp, enemyHp);
    }
  };

  const zone = ZONES.find(z => z.id === state.player.location);
  const battleBg = zone?.background || 'bg-gradient-to-b from-blue-400 to-emerald-400';

  return (
    <div className={`fixed inset-0 z-[80] ${battleBg} overflow-y-auto`}>
      <BattleFXLayer fxData={fxData} onComplete={() => setFxData(null)} />
      <div className="min-h-full flex flex-col p-3 pb-6 max-w-4xl mx-auto">
        {/* Enemy Side */}
        <div className="flex-1 flex flex-col items-end justify-start pt-8 pr-2 min-h-[140px]">
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={isAnimating ? { x: [0, -8, 8, 0], opacity: 1 } : { x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <BattleHUD 
              current={enemyHp} 
              max={enemy.maxHp} 
              label={enemy.name} 
              level={enemy.level} 
              types={enemy.types}
              isCaught={Boolean(
                state.player?.pokedex?.[enemy.id] === 'caught' ||
                state.player?.pokedex?.[Number(enemy.id)] === 'caught' ||
                state.player?.team?.some(p => p.id === enemy.id) ||
                state.player?.box?.some(p => p.id === enemy.id)
              )}
              status={enemyStatus.status} 
              isDrowsy={Boolean(enemyVolatile.yawnTurns && enemyVolatile.yawnTurns > 0)}
              isConfused={Boolean(enemyVolatile.confusionTurns && enemyVolatile.confusionTurns > 0)}
              isShiny={enemy.isShiny}
              team={trainer ? enemyTeam.map(p => (p.instanceId ? p.instanceId === enemy.instanceId : p.id === enemy.id) ? { ...p, hp: enemyHp } : p) : [{ hp: enemyHp }]}
              stages={enemyStages}
              substituteHp={enemyVolatile.substituteHp}
              screens={enemyScreens}
              abilityName={resolvePokemonAbility(enemy)?.name}
            />
            <img 
              src={enemy?.sprites?.artwork || enemy?.sprites?.front || (enemy as any)?.spriteUrl} 
              alt={enemy.name} 
              className={`w-32 h-32 sm:w-44 sm:h-44 drop-shadow-2xl object-contain ml-auto ${enemy.isShiny ? 'relative' : ''}`} 
            />
            {enemy.isShiny && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={`enemy-shiny-sparkle-${i}`}
                    className="absolute animate-shiny text-yellow-300 text-xl"
                    style={{ 
                      top: `${Math.random() * 100}%`, 
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.3}s`
                    }}
                  >
                    ✦
                  </div>
                ))}
              </div>
            )}
            {trainer && (
              <div className="absolute -bottom-16 -right-2 flex flex-col items-end pointer-events-none">
                <img 
                  src={trainer.sprite} 
                  alt="trainer" 
                  className="w-14 h-14 object-contain opacity-80 drop-shadow-lg" 
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
                />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-white bg-blue-600/80 px-2 py-0.5 rounded-full border border-blue-400 shadow-sm leading-none">{trainer.name}</span>
                  {trainer.isGymLeader && (
                    <span className="text-[7px] font-black uppercase text-yellow-300 bg-black/80 px-1.5 py-0.5 rounded-full border border-yellow-500/50 mt-0.5 animate-pulse shadow-lg shadow-yellow-500/20">Capopalestra</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Weather Indicator Banner */}
        {fieldWeather.type !== 'none' && (
          <div className="flex justify-center -my-1 z-10">
            <div className="bg-black/80 backdrop-blur-xs text-white px-3.5 py-1 rounded-full text-xs font-black shadow-lg border border-white/20 flex items-center gap-1.5 animate-pulse">
              {fieldWeather.type === 'sun' && <span>☀️ Luce Solare Intensa ({fieldWeather.turns} turni)</span>}
              {fieldWeather.type === 'rain' && <span>🌧️ Pioggia a Dirotto ({fieldWeather.turns} turni)</span>}
              {fieldWeather.type === 'sandstorm' && <span>🌪️ Tempesta di Sabbia ({fieldWeather.turns} turni)</span>}
              {fieldWeather.type === 'hail' && <span>❄️ Bufera di Grandine ({fieldWeather.turns} turni)</span>}
            </div>
          </div>
        )}

        {/* Player Side */}
        <div className="flex-1 flex flex-col items-start justify-center py-2 pl-2 min-h-[160px]">
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={isAnimating ? { x: [0, 8, -8, 0], opacity: 1 } : { x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <img 
              src={playerActive?.sprites?.artwork || playerActive?.sprites?.front || (playerActive as any)?.spriteUrl} 
              alt={playerActive.name} 
              className={`w-40 h-40 sm:w-52 sm:h-52 drop-shadow-2xl scale-x-[-1] object-contain ${playerActive.isShiny ? 'relative' : ''}`} 
            />
            {playerActive.isShiny && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={`player-shiny-sparkle-${i}`}
                    className="absolute animate-shiny text-yellow-300 text-xl"
                    style={{ 
                      top: `${Math.random() * 100}%`, 
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.3}s`
                    }}
                  >
                    ✦
                  </div>
                ))}
              </div>
            )}
            <BattleHUD 
              current={playerHp} 
              max={playerActive.maxHp} 
              label={playerActive.name} 
              level={playerActive.level} 
              types={playerActive.types}
              isPlayer 
              status={playerStatus.status}
              isDrowsy={Boolean(playerVolatile.yawnTurns && playerVolatile.yawnTurns > 0)}
              isConfused={Boolean(playerVolatile.confusionTurns && playerVolatile.confusionTurns > 0)}
              isShiny={playerActive.isShiny}
              team={state.player.team.map((p, i) => i === 0 ? { ...p, hp: playerHp } : p)}
              stages={playerStages}
              substituteHp={playerVolatile.substituteHp}
              screens={playerScreens}
              abilityName={resolvePokemonAbility(playerActive)?.name}
            />
          </motion.div>
        </div>

        {/* Controls */}
        <BattleControls 
          moves={playerMoves} 
          onMove={handleMove} 
          onBag={() => setShowBag(true)} 
          onEscape={handleEscape}
          onSwitch={() => setShowSwitch(true)}
          disabled={isAnimating || isPivotSwitch || Boolean(playerVolatile.lockedMove || playerVolatile.charging || playerVolatile.recharging)}
          enemyTypes={enemy.types}
          encryptedMoveIndex={encryptedMoveIndex}
          onEncryptedMoveClick={() => setShowRansomModal(true)}
        />
      </div>

      {/* Ransomware Decrypt Modal */}
      {showRansomModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-red-950 border-2 border-red-500 rounded-3xl p-6 shadow-2xl text-white">
            <div className="flex items-center gap-2 mb-3 text-red-400">
              <span className="text-2xl">🔒</span>
              <h3 className="text-lg font-black uppercase tracking-wider">Ransomware Payload</h3>
            </div>
            <p className="text-xs text-red-200 mb-4 leading-relaxed">
              Superquattro Ransomware ha cifrato la tua mossa con chiave RSA-4096! Completa il mini-obiettivo per ripristinare il file eseguibile:
            </p>

            <div className="bg-black/60 rounded-xl p-3 border border-red-500/40 mb-4 text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Codice di Decrittazione</span>
              <span className="text-2xl font-mono font-black text-amber-400 tracking-widest">{ransomCode}</span>
            </div>

            <div className="space-y-3">
              <input 
                type="text"
                value={ransomInput}
                onChange={(e) => setRansomInput(e.target.value)}
                placeholder="Digita il codice qui..."
                className="w-full bg-black/70 border-2 border-red-500/50 rounded-xl px-4 py-2.5 text-center font-mono text-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-red-400"
              />

              <button
                onClick={() => {
                  if (ransomInput.trim() === ransomCode) {
                    setEncryptedMoveIndex(null);
                    setShowRansomModal(false);
                    setLogs(prev => [`🔓 DECRITTAZIONE RIUSCITA! La mossa è di nuovo utilizzabile!`, ...prev]);
                  } else {
                    alert('Codice errato! Riprova o paga 1 PokéDollaro per sbloccarla.');
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black py-2.5 rounded-xl uppercase text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-red-600/30"
              >
                Inietta Chiave di Decrittazione
              </button>

              <button
                onClick={() => {
                  setEncryptedMoveIndex(null);
                  setShowRansomModal(false);
                  setLogs(prev => [`🔓 RISCATTO PAGATO! Mossa sbloccata d'urgenza.`, ...prev]);
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-gray-300 font-bold py-2 rounded-xl text-xs uppercase transition-all cursor-pointer"
              >
                Bypassa Firewall (Paga 1 PokéDollaro)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bag Overlay */}
      {showBag && (
        <BattleBag 
          onUseItem={handleUseItem}
          onClose={() => setShowBag(false)}
          currentActiveHp={playerHp}
          activeStatus={playerStatus.status}
        />
      )}

      {/* Switch Overlay */}
      {showSwitch && (
        <div className="fixed inset-0 z-[90] bg-black/80 p-8 flex flex-col gap-4">
          <div className="flex justify-between items-center text-white mb-4">
            <h2 className="text-xl font-black uppercase italic">
              {isPivotSwitch ? 'Cambio Tattico — Scegli Pokémon' : 'Scegli Pokémon'}
            </h2>
            {playerHp > 0 && !isPivotSwitch && (
              <button onClick={() => setShowSwitch(false)} className="text-2xl hover:text-red-400">✕</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {state.player.team.map((p, i) => (
              <button
                key={`battle-switch-${p.instanceId || p.id}-${i}`}
                disabled={i === 0 || p.hp <= 0}
                onClick={() => handleSwitch(i)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-4 transition-all ${i === 0 ? 'border-blue-500 bg-blue-500/20' : p.hp <= 0 ? 'opacity-50 border-gray-500 grayscale' : 'border-white bg-white active:scale-95'}`}
              >
                <img src={p?.sprites?.front || (p as any)?.spriteUrl} alt="p" className="w-12 h-12 object-contain" />
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className={`font-black uppercase text-sm ${i === 0 ? 'text-white' : 'text-gray-800'}`}>{p.name}</span>
                    <span className={`text-xs font-bold ${i === 0 ? 'text-white/70' : 'text-gray-500'}`}>Lv. {p.level}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(p.hp / p.maxHp) * 100}%` }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Catch Overlay */}
      {catchBall && (
        <CatchOverlay 
          target={enemy}
          ball={catchBall}
          onResult={handleCatchResult}
          onCancel={() => {
            setCatchBall(null);
            setIsAnimating(false);
          }}
        />
      )}

      {/* Post-Battle Summary Screen */}
      {postBattleData && (
        <PostBattleScreen
          data={postBattleData}
          onContinue={handlePostBattleContinue}
        />
      )}

      {/* Battle Event Logs */}
      <div className="absolute top-4 left-4 right-4 pointer-events-none flex flex-col items-start">
        {logs.map((log, i) => {
          if (!log) return null;
          const lower = log.toLowerCase();
          const isSuper = lower.includes('superefficace') || lower.includes('super efficace');
          const isNotVery = lower.includes('non è molto efficace') || lower.includes('poco efficace');
          const isNoEffect = lower.includes('non ha effetto') || lower.includes('non ha effetti') || lower.includes('non ha avuto effetto') || lower.includes('nessun effetto');

          let badgeStyle = 'bg-black/75 border border-white/10 text-white shadow-md';
          if (isSuper) {
            badgeStyle = 'bg-emerald-950/90 border border-emerald-500/60 shadow-lg shadow-emerald-950/50';
          } else if (isNotVery) {
            badgeStyle = 'bg-amber-950/90 border border-amber-500/60 shadow-lg shadow-amber-950/50';
          } else if (isNoEffect) {
            badgeStyle = 'bg-purple-950/90 border border-purple-500/60 shadow-lg shadow-purple-950/50';
          } else if (lower.includes('brutto colpo')) {
            badgeStyle = 'bg-rose-950/90 border border-rose-500/50 shadow-rose-950/50 text-rose-300';
          } else if (lower.includes('cromatico') || lower.includes('✨')) {
            badgeStyle = 'bg-yellow-950/90 border border-yellow-400/50 shadow-yellow-950/50 text-yellow-300';
          }

          return (
            <motion.div
              key={`${log}-${i}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: Math.max(0.15, 1 - i * 0.16), y: 0 }}
              className={`text-[10px] sm:text-xs px-3 py-1 rounded-full mb-1 w-fit backdrop-blur-sm font-bold transition-all ${badgeStyle}`}
            >
              {isSuper ? (
                <span>
                  {log.split(/(superefficace|super efficace)/i).map((part, idx) =>
                    /(superefficace|super efficace)/i.test(part) ? (
                      <span key={idx} className="text-emerald-400 font-black">{part}</span>
                    ) : (
                      <span key={idx} className="text-emerald-200">{part}</span>
                    )
                  )}
                </span>
              ) : isNotVery ? (
                <span>
                  {log.split(/(non è molto efficace|poco efficace)/i).map((part, idx) =>
                    /(non è molto efficace|poco efficace)/i.test(part) ? (
                      <span key={idx} className="text-amber-400 font-black">{part}</span>
                    ) : (
                      <span key={idx} className="text-amber-200">{part}</span>
                    )
                  )}
                </span>
              ) : isNoEffect ? (
                <span>
                  {log.split(/(non ha effetto|non ha effetti|non ha avuto effetto|nessun effetto)/i).map((part, idx) =>
                    /(non ha effetto|non ha effetti|non ha avuto effetto|nessun effetto)/i.test(part) ? (
                      <span key={idx} className="text-purple-400 font-black">{part}</span>
                    ) : (
                      <span key={idx} className="text-purple-200">{part}</span>
                    )
                  )}
                </span>
              ) : (
                log
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
