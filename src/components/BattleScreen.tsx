import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pokemon, Move, Trainer, Item, BattleStages } from '../types/game';
import { useGame } from '../contexts/GameContext';
import { calculateExpGain, checkLevelUp, applyEvs } from '../lib/leveling';
import { canEvolve } from '../lib/evolution';
import { fetchMoveData, STRUGGLE_MOVE } from '../lib/pokeapi';
import { BattleHUD } from './battle/BattleHUD';
import { BattleControls } from './battle/BattleControls';
import { PostBattleScreen, PostBattleData } from './battle/PostBattleScreen';
import { calculateDamage, getAccuracyMultiplier, getStageMultiplier } from '../lib/battle/battleMath';
import { 
  canMove, 
  getStatusEffect, 
  StatusCondition, 
  isImmuneToStatus, 
  checkConfusion, 
  checkFlinch, 
  VolatileStatus 
} from '../lib/battle/statusEffects';
import { determineTurnOrder } from '../lib/battle/turnOrder';
import { calculateEscape } from '../lib/battle/escapeFormula';
import { checkAbility } from '../lib/battle/abilities';
import { useItemInBattle } from '../lib/battle/items';
import { BattleBag } from './battle/BattleBag';
import { getBadgeForBoss } from '../lib/badges';
import { CatchOverlay } from './CatchOverlay';

interface BattleScreenProps {
  enemy: Pokemon;
  trainer?: Trainer;
  onEnd: (
    result: 'win' | 'lose' | 'escape' | 'catch', 
    evolutionCandidate?: Pokemon, 
    moveCandidate?: { pokemon: Pokemon, move: Move }, 
    ballUsed?: Item
  ) => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ enemy: initialEnemy, trainer, onEnd }) => {
  const { state, setState } = useGame();
  const playerActive = state.player.team[0];
  
  // Guard against missing active pokemon
  if (!playerActive) {
    return null;
  }

  const [enemy, setEnemy] = useState<Pokemon>(initialEnemy);
  const [playerHp, setPlayerHp] = useState(playerActive.hp);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [enemyTeam, setEnemyTeam] = useState<Pokemon[]>(trainer ? trainer.team : []);

  // Moves with PP tracking
  const [playerMoves, setPlayerMoves] = useState<Move[]>(() => {
    return playerActive.moves.map(m => ({
      ...m,
      pp: typeof m.pp === 'number' ? m.pp : (m.maxPp ?? 35),
      maxPp: m.maxPp ?? m.pp ?? 35
    }));
  });

  const [enemyMoves, setEnemyMoves] = useState<Move[]>(() => {
    return enemy.moves.map(m => ({
      ...m,
      pp: typeof m.pp === 'number' ? m.pp : (m.maxPp ?? 35),
      maxPp: m.maxPp ?? m.pp ?? 35
    }));
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
    const initialLogs = trainer ? [`L'allenatore ${trainer.name} ti sfida!`, `Inizia la battaglia!`] : ['Inizia la battaglia!'];
    if (initialEnemy.isShiny) {
      initialLogs.unshift(`✨ Un Pokémon cromatico è apparso! ✨`);
    }
    return initialLogs;
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // Escape attempts
  const [escapeAttempts, setEscapeAttempts] = useState(0);

  // Overlays
  const [showSwitch, setShowSwitch] = useState(false);
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
    setLogs(prev => [msg, ...prev].slice(0, 5));
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

  // End-of-turn status tick (Burn, Poison)
  const handleStatusEndTurn = useCallback(async (
    target: Pokemon, 
    currentHp: number, 
    setHp: (val: number) => void,
    status: StatusCondition | undefined
  ) => {
    if (!status || currentHp <= 0) return currentHp;
    const effect = getStatusEffect({ ...target, status });
    if (effect.damage) {
      addLog(effect.msg!);
      const newHp = Math.max(0, currentHp - effect.damage);
      setHp(newHp);
      await new Promise(r => setTimeout(r, 800));
      return newHp;
    }
    return currentHp;
  }, [addLog]);

  // Execute a single move action
  const executeMoveAction = useCallback((
    move: Move,
    user: Pokemon,
    target: Pokemon,
    userStages: BattleStages,
    setUserStages: React.Dispatch<React.SetStateAction<BattleStages>>,
    targetStages: BattleStages,
    setTargetStages: React.Dispatch<React.SetStateAction<BattleStages>>,
    userStatus: { status?: StatusCondition, duration?: number },
    setUserStatus: React.Dispatch<React.SetStateAction<{ status?: StatusCondition, duration?: number }>>,
    targetStatus: { status?: StatusCondition, duration?: number },
    setTargetStatus: React.Dispatch<React.SetStateAction<{ status?: StatusCondition, duration?: number }>>,
    userVolatile: VolatileStatus,
    setUserVolatile: React.Dispatch<React.SetStateAction<VolatileStatus>>,
    targetVolatile: VolatileStatus,
    setTargetVolatile: React.Dispatch<React.SetStateAction<VolatileStatus>>,
    userHp: number,
    setUserHp: React.Dispatch<React.SetStateAction<number>>,
    targetHp: number,
    setTargetHp: React.Dispatch<React.SetStateAction<number>>,
    isPlayer: boolean,
    isFirstInTurn: boolean
  ): { nextUserHp: number; nextTargetHp: number; targetFainted: boolean; userFainted: boolean } => {
    addLog(`${user.name} usa ${move.name}!`);

    let curUserHp = userHp;
    let curTargetHp = targetHp;

    // 1. Accuracy Check
    if (move.accuracy && move.accuracy < 100) {
      const accStage = (userStages.accuracy ?? 0) - (targetStages.evasion ?? 0);
      const accMultiplier = getAccuracyMultiplier(accStage);
      const finalAccuracy = Math.min(100, Math.floor(move.accuracy * accMultiplier));
      if (Math.random() * 100 >= finalAccuracy) {
        addLog(`Ma il colpo di ${user.name} fallisce!`);
        return { nextUserHp: curUserHp, nextTargetHp: curTargetHp, targetFainted: false, userFainted: false };
      }
    }

    // Helper to apply stat stages
    const applyStatChanges = (changes: typeof move.stat_changes, defaultSelf: boolean) => {
      if (!changes || changes.length === 0) return;
      const STAT_MAP: Record<string, keyof BattleStages> = {
        'attack': 'attack',
        'defense': 'defense',
        'special-attack': 'spAtk',
        'special-defense': 'spDef',
        'speed': 'speed',
        'accuracy': 'accuracy',
        'evasion': 'evasion'
      };
      const STAT_LABELS: Record<string, string> = {
        attack: 'Attacco',
        defense: 'Difesa',
        spAtk: 'Attacco Sp.',
        spDef: 'Difesa Sp.',
        speed: 'Velocità',
        accuracy: 'Precisione',
        evasion: 'Elusione'
      };

      for (const sc of changes) {
        const statKey = STAT_MAP[sc.stat?.name || ''];
        if (!statKey) continue;
        const isSelf = defaultSelf || move.target === 'user' || sc.change > 0;
        const recipient = isSelf ? user : target;
        const setRecipientStages = isSelf ? setUserStages : setTargetStages;
        const recipientStages = isSelf ? userStages : targetStages;
        const currVal = recipientStages[statKey] ?? 0;
        const statLabel = STAT_LABELS[statKey] || statKey;

        if (sc.change > 0 && currVal >= 6) {
          addLog(`${statLabel} di ${recipient.name} non può salire oltre!`);
        } else if (sc.change < 0 && currVal <= -6) {
          addLog(`${statLabel} di ${recipient.name} non può scendere oltre!`);
        } else {
          const nextVal = Math.max(-6, Math.min(6, currVal + sc.change));
          recipientStages[statKey] = nextVal;
          setRecipientStages(prev => ({ ...prev, [statKey]: nextVal }));
          if (sc.change > 0) {
            addLog(`${statLabel} di ${recipient.name} aumenta${sc.change >= 2 ? ' molto' : ''}!`);
          } else {
            addLog(`${statLabel} di ${recipient.name} cala${sc.change <= -2 ? ' molto' : ''}!`);
          }
        }
      }
    };

    // Helper to apply primary status conditions
    const applyStatusCondition = (status: StatusCondition, chance?: number) => {
      if (targetStatus.status) {
        if (move.category === 'status') {
          addLog(`${target.name} ha già un problema di stato!`);
        }
        return;
      }
      if (isImmuneToStatus(target.types, status)) {
        addLog(`${target.name} è immune a questo problema di stato!`);
        return;
      }
      const procChance = chance ?? (move.category === 'status' ? 100 : 100);
      if (Math.random() * 100 < procChance) {
        const duration = status === 'sleep' ? Math.floor(Math.random() * 3) + 2 : undefined;
        setTargetStatus({ status, duration });
        const STATUS_MESSAGES: Record<StatusCondition, string> = {
          paralyzed: `${target.name} è rimasto paralizzato! Potrebbe non riuscire a muoversi!`,
          poisoned: `${target.name} è stato avvelenato!`,
          sleep: `${target.name} si è addormentato!`,
          burned: `${target.name} si è scottato!`,
          frozen: `${target.name} è stato congelato!`
        };
        addLog(STATUS_MESSAGES[status]);
      } else if (move.category === 'status') {
        addLog("Ma non ha avuto effetto!");
      }
    };

    // 2. HEALING / RECOVERY MOVES (e.g. Recover, Synthesis, Rest)
    if (move.healing && move.healing > 0) {
      const healAmount = Math.max(1, Math.floor(user.maxHp * move.healing));
      curUserHp = Math.min(user.maxHp, curUserHp + healAmount);
      setUserHp(curUserHp);
      addLog(`${user.name} ha recuperato le forze! (+${healAmount} PS)`);

      // Special case: Rest (Riposo) cures status and induces 2 turns of sleep
      if (move.name.toLowerCase().includes('riposo') || move.name.toLowerCase().includes('rest')) {
        setUserStatus({ status: 'sleep', duration: 2 });
        addLog(`${user.name} cade in un sonno profondo e guarisce da ogni problema di stato!`);
      }
    }

    // 3. STATUS MOVES (Deal NO damage directly)
    if (move.category === 'status' || !move.power || move.power === 0) {
      if (move.stat_changes && move.stat_changes.length > 0) {
        applyStatChanges(move.stat_changes, move.target === 'user');
      }
      if (move.statusEffect) {
        applyStatusCondition(move.statusEffect, move.effectChance);
      }
      // Confusion status move (e.g. Supersonic, Confuse Ray)
      if (move.confusionChance) {
        if (!targetVolatile.confusionTurns || targetVolatile.confusionTurns <= 0) {
          const chance = move.confusionChance;
          if (Math.random() * 100 < chance) {
            const cTurns = Math.floor(Math.random() * 4) + 1;
            setTargetVolatile(prev => ({ ...prev, confusionTurns: cTurns }));
            addLog(`${target.name} è confuso!`);
          } else {
            addLog("Ma non ha avuto effetto!");
          }
        } else {
          addLog(`${target.name} è già confuso!`);
        }
      }
      return { nextUserHp: curUserHp, nextTargetHp: curTargetHp, targetFainted: false, userFainted: false };
    }

    // 4. ATTACKING MOVES (Physical / Special)
    const abilityEffect = isPlayer ? checkAbility(user, 'on_move_use', { move, target }) : null;
    if (abilityEffect?.msg) addLog(abilityEffect.msg);
    const damageMult = abilityEffect?.type === 'damage_mult' ? abilityEffect.value || 1 : 1;

    const result = calculateDamage(
      { ...user, status: userStatus.status },
      { ...target, status: targetStatus.status },
      move,
      { attackerStages: userStages, targetStages }
    );
    const finalDamage = Math.floor(result.damage * damageMult);

    if (result.effectiveness > 1) addLog("È superefficace!");
    if (result.effectiveness < 1 && result.effectiveness > 0) addLog("Non è molto efficace...");
    if (result.effectiveness === 0) {
      addLog("Non ha effetto...");
      return { nextUserHp: curUserHp, nextTargetHp: curTargetHp, targetFainted: false, userFainted: false };
    }
    if (result.isCrit) addLog("Brutto colpo!");

    addLog(`${user.name} infligge ${finalDamage} danni!`);

    // Subtract damage from defender
    curTargetHp = Math.max(0, curTargetHp - finalDamage);
    setTargetHp(curTargetHp);

    // Ability check on target hit
    const onHitEffect = checkAbility(target, 'on_hit', { move, target: user });
    if (onHitEffect?.msg) addLog(onHitEffect.msg);

    // 4a. DRAIN MOVES (e.g. Giga Drain, Absorb, Leech Life)
    if (move.drain && move.drain > 0 && curUserHp > 0) {
      const drainHeal = Math.max(1, Math.floor(finalDamage * move.drain));
      curUserHp = Math.min(user.maxHp, curUserHp + drainHeal);
      setUserHp(curUserHp);
      addLog(`${user.name} ha assorbito l'energia dell'avversario! (+${drainHeal} PS)`);
    }

    // 4b. RECOIL MOVES (e.g. Double-Edge, Brave Bird, Struggle)
    if (move.recoilMaxHp && move.recoilMaxHp > 0) {
      // Struggle: recoil is 1/4 of user's MAX HP
      const recoilDmg = Math.max(1, Math.floor(user.maxHp * move.recoilMaxHp));
      curUserHp = Math.max(0, curUserHp - recoilDmg);
      setUserHp(curUserHp);
      addLog(`${user.name} subisce il contraccolpo di Scontro! (-${recoilDmg} PS)`);
    } else if (move.recoil && move.recoil > 0) {
      const recoilDmg = Math.max(1, Math.floor(finalDamage * move.recoil));
      curUserHp = Math.max(0, curUserHp - recoilDmg);
      setUserHp(curUserHp);
      addLog(`${user.name} risente del contraccolpo! (-${recoilDmg} PS)`);
    }

    // 4c. SECONDARY EFFECTS (Status, Stat Changes, Confusion, Flinch)
    if (curTargetHp > 0) {
      // Status condition proc
      if (move.statusEffect && !targetStatus.status) {
        const chance = move.effectChance ?? 10;
        applyStatusCondition(move.statusEffect, chance);
      }
      // Stat changes proc
      if (move.stat_changes && move.stat_changes.length > 0) {
        const chance = move.effectChance ?? 100;
        if (Math.random() * 100 < chance) {
          applyStatChanges(move.stat_changes, move.target === 'user');
        }
      }
      // Confusion proc
      if (move.confusionChance && (!targetVolatile.confusionTurns || targetVolatile.confusionTurns <= 0)) {
        if (Math.random() * 100 < move.confusionChance) {
          const cTurns = Math.floor(Math.random() * 4) + 1;
          setTargetVolatile(prev => ({ ...prev, confusionTurns: cTurns }));
          addLog(`${target.name} è confuso!`);
        }
      }
      // Flinch proc (Only applies if the attacker is acting first in this turn!)
      if (move.flinchChance && isFirstInTurn) {
        if (Math.random() * 100 < move.flinchChance) {
          setTargetVolatile(prev => ({ ...prev, isFlinched: true }));
        }
      }
    }

    return {
      nextUserHp: curUserHp,
      nextTargetHp: curTargetHp,
      targetFainted: curTargetHp <= 0,
      userFainted: curUserHp <= 0
    };
  }, [addLog]);

  // Handle battle victory
  const handleWin = useCallback(async (finalPlayerHp: number) => {
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
      experience: playerActive.experience + exp,
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

    // Update player state with progress from this pokemon
    setState(prev => {
      const team = [...prev.player.team];
      team[0] = newPokemon;
      return {
        ...prev,
        player: {
          ...prev.player,
          team
        }
      };
    });

    // Trainer logic: check if they have more Pokemon
    if (trainer) {
      const updatedEnemyTeam = [...enemyTeam];
      const defeatedIdx = updatedEnemyTeam.findIndex(p => p.id === enemy.id && p.hp > 0);
      if (defeatedIdx !== -1) {
        updatedEnemyTeam[defeatedIdx] = { ...updatedEnemyTeam[defeatedIdx], hp: 0 };
        setEnemyTeam(updatedEnemyTeam);
      }

      const nextEnemy = updatedEnemyTeam.find(p => p.hp > 0);
      if (nextEnemy) {
        addLog(`${trainer.name} sta per mandare in campo ${nextEnemy.name}!`);
        await new Promise(r => setTimeout(r, 1500));
        
        setEnemy(nextEnemy);
        setEnemyHp(nextEnemy.hp);
        setEnemyMoves(nextEnemy.moves.map(m => ({
          ...m,
          pp: typeof m.pp === 'number' ? m.pp : (m.maxPp ?? 35),
          maxPp: m.maxPp ?? m.pp ?? 35
        })));
        setEnemyStatus({ status: nextEnemy.status, duration: nextEnemy.statusDuration });
        setEnemyStages({ attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 });
        setEnemyVolatile({});
        setIsAnimating(false);
        return;
      }

      // End of trainer battle: rewards & badge
      const moneyReward = trainer.moneyReward;
      const badge = getBadgeForBoss(trainer.name);
      
      setState(prev => {
        let badges = [...prev.player.badges];
        if (badge && !badges.includes(badge.id)) {
          badges.push(badge.id);
        }
        return {
          ...prev,
          player: {
            ...prev.player,
            money: prev.player.money + moneyReward,
            badges
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
        moneyEarned: wildReward
      });
    }
  }, [enemy, playerActive, playerStatus, playerMoves, setState, addLog, trainer, enemyTeam, state.player.badges]);

  // When player clicks continue in PostBattleScreen
  const handlePostBattleContinue = useCallback(() => {
    if (!postBattleData) {
      setBattleResult({ type: 'win' });
      return;
    }
    const currentPkmn = postBattleData.pokemon;
    const evo = canEvolve(currentPkmn) ? currentPkmn : undefined;
    setPostBattleData(null);
    setBattleResult({
      type: 'win',
      evo
    });
  }, [postBattleData]);

  // Handle player fainted
  const handlePlayerFaint = useCallback(async () => {
    addLog(`${playerActive.name} è k.o.!`);
    await new Promise(r => setTimeout(r, 1000));
    
    setState(prev => {
      const team = [...prev.player.team];
      team[0] = { ...team[0], hp: 0 };
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

  // Single enemy turn execution (used after item or failed flee)
  const triggerEnemySingleTurn = useCallback(async (curPlayerHp: number, curEnemyHp: number) => {
    setIsAnimating(true);
    await new Promise(r => setTimeout(r, 800));

    // 1. Flinch check
    const flinchCheck = checkFlinch(enemy, enemyVolatile.isFlinched);
    if (!flinchCheck.canAct) {
      addLog(flinchCheck.msg!);
      setEnemyVolatile(prev => ({ ...prev, isFlinched: false }));
      setIsAnimating(false);
      return;
    }

    // 2. Primary Status check
    const moveCheck = canMove({ ...enemy, status: enemyStatus.status, statusDuration: enemyStatus.duration });
    if (moveCheck.newStatus !== enemyStatus.status || moveCheck.newDuration !== enemyStatus.duration) {
      setEnemyStatus({ status: moveCheck.newStatus, duration: moveCheck.newDuration });
    }
    if (!moveCheck.canMove) {
      if (moveCheck.msg) addLog(moveCheck.msg);
      setIsAnimating(false);
      return;
    }

    // 3. Confusion check
    if (enemyVolatile.confusionTurns && enemyVolatile.confusionTurns > 0) {
      const conf = checkConfusion(enemy, enemyVolatile.confusionTurns);
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
    const validMoves = enemyMoves.filter(m => (m.pp ?? m.maxPp ?? 35) > 0);
    const chosenMove = validMoves.length > 0
      ? validMoves[Math.floor(Math.random() * validMoves.length)]
      : STRUGGLE_MOVE;

    deductEnemyPp(chosenMove.name);

    // 5. Execute
    const res = executeMoveAction(
      chosenMove,
      enemy,
      playerActive,
      enemyStages,
      setEnemyStages,
      playerStages,
      setPlayerStages,
      enemyStatus,
      setEnemyStatus,
      playerStatus,
      setPlayerStatus,
      enemyVolatile,
      setEnemyVolatile,
      playerVolatile,
      setPlayerVolatile,
      curEnemyHp,
      setEnemyHp,
      curPlayerHp,
      setPlayerHp,
      false,
      true
    );

    if (res.userFainted) {
      await handleWin(res.nextTargetHp);
      return;
    }
    if (res.targetFainted) {
      await handlePlayerFaint();
      return;
    }

    // End-of-turn status damage
    await handleStatusEndTurn(enemy, res.nextUserHp, setEnemyHp, enemyStatus.status);

    setIsAnimating(false);
  }, [
    enemy, enemyVolatile, enemyStatus, enemyMoves, enemyStages, playerActive, 
    playerStages, playerStatus, playerVolatile, deductEnemyPp, executeMoveAction, 
    handleWin, handlePlayerFaint, handleStatusEndTurn, addLog
  ]);

  // Main turn execution: Dynamic Turn Order based on Priority & Effective Speed
  const handleMove = useCallback(async (selectedMove: Move) => {
    if (isAnimating) return;
    setIsAnimating(true);

    // If player move has 0 PP and is not Struggle, fallback to Struggle
    const activePlayerMove = (typeof selectedMove.pp === 'number' && selectedMove.pp <= 0 && selectedMove.name !== STRUGGLE_MOVE.name)
      ? STRUGGLE_MOVE
      : selectedMove;

    // Pick enemy move
    const validEnemyMoves = enemyMoves.filter(m => (m.pp ?? m.maxPp ?? 35) > 0);
    const enemyMove = validEnemyMoves.length > 0
      ? validEnemyMoves[Math.floor(Math.random() * validEnemyMoves.length)]
      : STRUGGLE_MOVE;

    // Calculate effective speeds
    const effPlayerSpeed = getEffectiveSpeed(playerActive.stats.speed, playerStages.speed ?? 0, playerStatus.status);
    const effEnemySpeed = getEffectiveSpeed(enemy.stats.speed, enemyStages.speed ?? 0, enemyStatus.status);

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

    // Helper for executing an individual combatant's attack within this turn
    const runCombatantAttack = async (
      attackerIsPlayer: boolean,
      isFirst: boolean,
      cPlayerHp: number,
      cEnemyHp: number
    ): Promise<{ nextPlayerHp: number; nextEnemyHp: number; stopped: boolean }> => {
      const attacker = attackerIsPlayer ? playerActive : enemy;
      const move = attackerIsPlayer ? activePlayerMove : enemyMove;
      const attackerVolatile = attackerIsPlayer ? playerVolatile : enemyVolatile;
      const setAttackerVolatile = attackerIsPlayer ? setPlayerVolatile : setEnemyVolatile;
      const defenderVolatile = attackerIsPlayer ? enemyVolatile : playerVolatile;
      const setDefenderVolatile = attackerIsPlayer ? setEnemyVolatile : setPlayerVolatile;
      const attackerStatus = attackerIsPlayer ? playerStatus : enemyStatus;
      const setAttackerStatus = attackerIsPlayer ? setPlayerStatus : setEnemyStatus;
      const defenderStatus = attackerIsPlayer ? enemyStatus : playerStatus;
      const setDefenderStatus = attackerIsPlayer ? setEnemyStatus : setPlayerStatus;
      const attackerStages = attackerIsPlayer ? playerStages : enemyStages;
      const setAttackerStages = attackerIsPlayer ? setPlayerStages : setEnemyStages;
      const defenderStages = attackerIsPlayer ? enemyStages : playerStages;
      const setDefenderStages = attackerIsPlayer ? setEnemyStages : setPlayerStages;

      const userHp = attackerIsPlayer ? cPlayerHp : cEnemyHp;
      const setUserHp = attackerIsPlayer ? setPlayerHp : setEnemyHp;
      const targetHp = attackerIsPlayer ? cEnemyHp : cPlayerHp;
      const setTargetHp = attackerIsPlayer ? setEnemyHp : setPlayerHp;
      const target = attackerIsPlayer ? enemy : playerActive;

      // 1. Flinch Check (if opponent moved first and flinch occurred)
      const flinch = checkFlinch(attacker, attackerVolatile.isFlinched);
      if (!flinch.canAct) {
        addLog(flinch.msg!);
        setAttackerVolatile(prev => ({ ...prev, isFlinched: false }));
        await new Promise(r => setTimeout(r, 700));
        return { nextPlayerHp: cPlayerHp, nextEnemyHp: cEnemyHp, stopped: false };
      }

      // 2. Primary Status Check (Sleep, Frozen, Paralysis)
      const moveCheck = canMove({ ...attacker, status: attackerStatus.status, statusDuration: attackerStatus.duration });
      if (moveCheck.newStatus !== attackerStatus.status || moveCheck.newDuration !== attackerStatus.duration) {
        setAttackerStatus({ status: moveCheck.newStatus, duration: moveCheck.newDuration });
      }
      if (!moveCheck.canMove) {
        if (moveCheck.msg) addLog(moveCheck.msg);
        await new Promise(r => setTimeout(r, 700));
        return { nextPlayerHp: cPlayerHp, nextEnemyHp: cEnemyHp, stopped: false };
      }
      if (moveCheck.msg) {
        addLog(moveCheck.msg);
      }

      // 3. Confusion Check
      if (attackerVolatile.confusionTurns && attackerVolatile.confusionTurns > 0) {
        const conf = checkConfusion(attacker, attackerVolatile.confusionTurns);
        setAttackerVolatile(prev => ({ ...prev, confusionTurns: conf.newTurns }));
        if (conf.msg) addLog(conf.msg);

        if (conf.hurtSelf && conf.damage) {
          const nextUserHp = Math.max(0, userHp - conf.damage);
          setUserHp(nextUserHp);
          await new Promise(r => setTimeout(r, 800));

          const updatedPlayerHp = attackerIsPlayer ? nextUserHp : cPlayerHp;
          const updatedEnemyHp = attackerIsPlayer ? cEnemyHp : nextUserHp;

          if (nextUserHp <= 0) {
            if (attackerIsPlayer) {
              await handlePlayerFaint();
            } else {
              await handleWin(updatedPlayerHp);
            }
            return { nextPlayerHp: updatedPlayerHp, nextEnemyHp: updatedEnemyHp, stopped: true };
          }
          return { nextPlayerHp: updatedPlayerHp, nextEnemyHp: updatedEnemyHp, stopped: false };
        }
      }

      // 4. Deduct PP
      if (attackerIsPlayer) {
        deductPlayerPp(move.name);
      } else {
        deductEnemyPp(move.name);
      }

      // 5. Execute Move Action
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
        isFirst
      );

      await new Promise(r => setTimeout(r, 800));

      const finalPlayerHp = attackerIsPlayer ? actionRes.nextUserHp : actionRes.nextTargetHp;
      const finalEnemyHp = attackerIsPlayer ? actionRes.nextTargetHp : actionRes.nextUserHp;

      if (actionRes.targetFainted) {
        if (attackerIsPlayer) {
          await handleWin(finalPlayerHp);
        } else {
          await handlePlayerFaint();
        }
        return { nextPlayerHp: finalPlayerHp, nextEnemyHp: finalEnemyHp, stopped: true };
      }

      if (actionRes.userFainted) {
        if (attackerIsPlayer) {
          await handlePlayerFaint();
        } else {
          await handleWin(finalPlayerHp);
        }
        return { nextPlayerHp: finalPlayerHp, nextEnemyHp: finalEnemyHp, stopped: true };
      }

      return { nextPlayerHp: finalPlayerHp, nextEnemyHp: finalEnemyHp, stopped: false };
    };

    // --- EXECUTION PHASE 1: FIRST COMBATANT ---
    let curPlayerHp = playerHp;
    let curEnemyHp = enemyHp;

    const firstResult = await runCombatantAttack(playerFirst, true, curPlayerHp, curEnemyHp);
    curPlayerHp = firstResult.nextPlayerHp;
    curEnemyHp = firstResult.nextEnemyHp;

    if (firstResult.stopped) {
      return;
    }

    await new Promise(r => setTimeout(r, 500));

    // --- EXECUTION PHASE 2: SECOND COMBATANT ---
    const secondResult = await runCombatantAttack(!playerFirst, false, curPlayerHp, curEnemyHp);
    curPlayerHp = secondResult.nextPlayerHp;
    curEnemyHp = secondResult.nextEnemyHp;

    if (secondResult.stopped) {
      return;
    }

    // --- EXECUTION PHASE 3: END OF TURN (Clear flinch, status tick damage) ---
    // Clear flinch
    setPlayerVolatile(prev => ({ ...prev, isFlinched: false }));
    setEnemyVolatile(prev => ({ ...prev, isFlinched: false }));

    // Player status damage (Poison / Burn)
    curPlayerHp = await handleStatusEndTurn(playerActive, curPlayerHp, setPlayerHp, playerStatus.status);
    if (curPlayerHp <= 0) {
      await handlePlayerFaint();
      return;
    }

    // Enemy status damage (Poison / Burn)
    curEnemyHp = await handleStatusEndTurn(enemy, curEnemyHp, setEnemyHp, enemyStatus.status);
    if (curEnemyHp <= 0) {
      await handleWin(curPlayerHp);
      return;
    }

    setIsAnimating(false);
  }, [
    isAnimating, playerMoves, enemyMoves, getEffectiveSpeed, playerActive, 
    playerStages, playerStatus, enemy, enemyStages, enemyStatus, playerVolatile, 
    enemyVolatile, deductPlayerPp, deductEnemyPp, executeMoveAction, handleWin, 
    handlePlayerFaint, handleStatusEndTurn, addLog, playerHp, enemyHp
  ]);

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
      await new Promise(r => setTimeout(r, 1200));
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
    triggerEnemySingleTurn, playerHp, enemyHp
  ]);

  // Switch Pokemon handler
  const handleSwitch = useCallback(async (index: number) => {
    if (index === 0 || (isAnimating && playerHp > 0)) return;
    const nextPkmn = state.player.team[index];
    if (nextPkmn.hp <= 0) return;

    const wasFainted = playerHp <= 0;
    addLog(`Torna, ${playerActive.name}! Vai, ${nextPkmn.name}!`);
    
    // Reset volatile states and stages on switch
    setPlayerVolatile({});
    setPlayerStages({ attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 });

    setState(prev => {
      const team = [...prev.player.team];
      team[0] = { 
        ...team[0], 
        hp: playerHp, 
        status: playerStatus.status, 
        statusDuration: playerStatus.duration,
        moves: playerMoves 
      };
      const [removed] = team.splice(index, 1);
      team.unshift(removed);
      return { ...prev, player: { ...prev.player, team } };
    });

    setPlayerHp(nextPkmn.hp);
    setPlayerMoves(nextPkmn.moves.map(m => ({
      ...m,
      pp: typeof m.pp === 'number' ? m.pp : (m.maxPp ?? 35),
      maxPp: m.maxPp ?? m.pp ?? 35
    })));
    setPlayerStatus({ status: nextPkmn.status, duration: nextPkmn.statusDuration });
    setShowSwitch(false);
    
    if (!wasFainted) {
      await triggerEnemySingleTurn(nextPkmn.hp, enemyHp);
    } else {
      setIsAnimating(false);
    }
  }, [
    isAnimating, playerHp, state.player.team, addLog, playerActive.name, 
    setState, playerStatus, playerMoves, triggerEnemySingleTurn, enemyHp
  ]);

  // Item Use in Battle
  const handleUseItem = useCallback(async (item: Item) => {
    setShowBag(false);
    setIsAnimating(true);
    
    const result = useItemInBattle(item, playerActive);
    addLog(`Usi ${item.name}!`);
    await new Promise(r => setTimeout(r, 800));
    
    if (result.success) {
      addLog(result.msg);
      
      // Consume item from inventory
      setState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          inventory: prev.player.inventory.map(i => i.id === item.id ? { ...i, count: i.count - 1 } : i)
        }
      }));

      if (item.type === 'healing') {
        const isRevive = item.id.includes('revitalizzante');
        let healAmount = item.effectValue || 20;
        let nextHp = playerHp;

        if (isRevive) {
          healAmount = Math.floor(playerActive.maxHp * (item.effectValue || 0.5));
          nextHp = healAmount;
        } else {
          nextHp = Math.min(playerActive.maxHp, playerHp + healAmount);
        }

        setPlayerHp(nextHp);
        
        setState(prev => {
          const team = [...prev.player.team];
          team[0] = { ...team[0], hp: nextHp };
          return { ...prev, player: { ...prev.player, team } };
        });

        await new Promise(r => setTimeout(r, 1000));
        await triggerEnemySingleTurn(nextHp, enemyHp);
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
  }, [playerActive, playerHp, enemyHp, addLog, setState, triggerEnemySingleTurn, trainer]);

  // Capture result
  const handleCatchResult = async (success: boolean) => {
    if (success && catchBall) {
      setBattleResult({ type: 'catch', ball: catchBall });
    } else {
      setCatchBall(null);
      setIsAnimating(false);
      addLog(`Oh no! ${enemy.name} si è liberato!`);
      await triggerEnemySingleTurn(playerHp, enemyHp);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-gradient-to-b from-blue-400 to-emerald-400 overflow-y-auto">
      <div className="min-h-full flex flex-col p-3 pb-6 max-w-4xl mx-auto">
        {/* Enemy Side */}
        <div className="flex-1 flex flex-col items-end justify-start pt-8 pr-2 min-h-[140px]">
          <motion.div 
            animate={isAnimating ? { x: [0, -8, 8, 0] } : {}}
            className={`relative ${trainer ? 'pt-16' : ''}`}
          >
            <BattleHUD 
              current={enemyHp} 
              max={enemy.maxHp} 
              label={enemy.name} 
              level={enemy.level} 
              status={enemyStatus.status} 
              isConfused={Boolean(enemyVolatile.confusionTurns && enemyVolatile.confusionTurns > 0)}
              isShiny={enemy.isShiny}
              team={trainer ? enemyTeam.map(p => p.id === enemy.id ? { ...p, hp: enemyHp } : p) : [{ hp: enemyHp }]}
              stages={enemyStages}
            />
            <img 
              src={enemy.sprites.artwork} 
              alt={enemy.name} 
              className={`w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl object-contain ml-auto ${enemy.isShiny ? 'relative' : ''}`} 
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
              <div className="absolute -top-12 -right-2 flex flex-col items-end">
                <img src={trainer.sprite} alt="trainer" className="w-12 h-12 object-contain grayscale opacity-60" />
                <span className="text-[9px] font-black uppercase text-white bg-black/40 px-2 py-0.5 rounded-full">{trainer.name}</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Player Side */}
        <div className="flex-1 flex flex-col items-start justify-center py-2 pl-2 min-h-[160px]">
          <motion.div 
            animate={isAnimating ? { x: [0, 8, -8, 0] } : {}}
            className="relative"
          >
            <img 
              src={playerActive.sprites.artwork} 
              alt={playerActive.name} 
              className={`w-32 h-32 sm:w-40 sm:h-40 drop-shadow-2xl scale-x-[-1] object-contain ${playerActive.isShiny ? 'relative' : ''}`} 
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
              isPlayer 
              status={playerStatus.status}
              isConfused={Boolean(playerVolatile.confusionTurns && playerVolatile.confusionTurns > 0)}
              isShiny={playerActive.isShiny}
              team={state.player.team.map((p, i) => i === 0 ? { ...p, hp: playerHp } : p)}
              stages={playerStages}
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
          disabled={isAnimating}
          enemyTypes={enemy.types}
        />
      </div>

      {/* Bag Overlay */}
      {showBag && (
        <BattleBag 
          onUseItem={handleUseItem}
          onClose={() => setShowBag(false)}
        />
      )}

      {/* Switch Overlay */}
      {showSwitch && (
        <div className="fixed inset-0 z-[90] bg-black/80 p-8 flex flex-col gap-4">
          <div className="flex justify-between items-center text-white mb-4">
            <h2 className="text-xl font-black uppercase italic">Scegli Pokémon</h2>
            {playerHp > 0 && (
              <button onClick={() => setShowSwitch(false)} className="text-2xl hover:text-red-400">✕</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {state.player.team.map((p, i) => (
              <button
                key={p.instanceId || `battle-switch-${i}`}
                disabled={i === 0 || p.hp <= 0}
                onClick={() => handleSwitch(i)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-4 transition-all ${i === 0 ? 'border-blue-500 bg-blue-500/20' : p.hp <= 0 ? 'opacity-50 border-gray-500 grayscale' : 'border-white bg-white active:scale-95'}`}
              >
                <img src={p.sprites.front} alt="p" className="w-12 h-12 object-contain" />
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
      <div className="absolute top-4 left-4 right-4 pointer-events-none">
        {logs.map((log, i) => (
          <motion.div
            key={`${log}-${i}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1 - i * 0.2, y: 0 }}
            className="bg-black/75 text-white text-[10px] sm:text-xs px-3 py-1 rounded-full mb-1 w-fit backdrop-blur-sm font-bold shadow-md"
          >
            {log}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
