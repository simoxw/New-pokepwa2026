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
import { executeMoveAction } from '../lib/battle/battleActionRunner';
import { selectEnemyMove } from '../lib/battle/battleAi';
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
import { ZONES } from '../constants/game';
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

  useEffect(() => {
    playBgm('battle');
    if (playerActive) playPokemonCry(playerActive.id);
    if (initialEnemy) setTimeout(() => playPokemonCry(initialEnemy.id), 500);
    return () => {
      playBgm('overworld');
    };
  }, []);

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
        const defeatedTrainers = [...(prev.player.defeatedTrainers || [])];
        if (trainer.id && !defeatedTrainers.includes(trainer.id)) {
          defeatedTrainers.push(trainer.id);
        }
        return {
          ...prev,
          player: {
            ...prev.player,
            money: prev.player.money + moneyReward,
            badges,
            defeatedTrainers
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
    playFaint();
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
    if (moveCheck.statusChanged) {
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
      true,
      addLog
    );

    if (res.userFainted) {
      await handleWin(res.nextTargetHp);
      return;
    }
    if (res.targetFainted) {
      await handlePlayerFaint();
      return;
    }

    // End-of-turn status damage (Poison / Burn) for both player and enemy
    const livePlayerStatus = res.nextTargetStatus || playerStatus;
    const liveEnemyStatus = res.nextUserStatus || enemyStatus;

    let nextPlayerHp = res.nextTargetHp;
    nextPlayerHp = await handleStatusEndTurn(playerActive, nextPlayerHp, setPlayerHp, livePlayerStatus.status);
    if (nextPlayerHp <= 0) {
      await handlePlayerFaint();
      return;
    }

    let nextEnemyHp = res.nextUserHp;
    nextEnemyHp = await handleStatusEndTurn(enemy, nextEnemyHp, setEnemyHp, liveEnemyStatus.status);
    if (nextEnemyHp <= 0) {
      await handleWin(nextPlayerHp);
      return;
    }

    setIsAnimating(false);
  }, [
    enemy, enemyVolatile, enemyStatus, enemyMoves, enemyStages, playerActive, 
    playerStages, playerStatus, playerVolatile, deductEnemyPp,
    handleWin, handlePlayerFaint, handleStatusEndTurn, addLog
  ]);

  // Main turn execution: Dynamic Turn Order based on Priority & Effective Speed
  const handleMove = useCallback(async (selectedMove: Move) => {
    if (isAnimating) return;

    // Check if player is locked into a move
    const actualPlayerMove = playerVolatile.lockedMove || selectedMove;

    setIsAnimating(true);

    // If player move has 0 PP and is not Struggle, fallback to Struggle
    const activePlayerMove = (typeof actualPlayerMove.pp === 'number' && actualPlayerMove.pp <= 0 && actualPlayerMove.name !== STRUGGLE_MOVE.name)
      ? STRUGGLE_MOVE
      : actualPlayerMove;

    // Pick enemy move
    const enemyMove = enemyVolatile.lockedMove || selectEnemyMove(
      enemyMoves, 
      enemy, 
      playerActive, 
      enemyStatus, 
      playerStatus, 
      enemyStages, 
      playerStages, 
      enemyHp, 
      playerHp
    );

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
    ): Promise<{ 
      nextPlayerHp: number; 
      nextEnemyHp: number; 
      stopped: boolean;
      nextUserStatus?: { status?: StatusCondition, duration?: number };
      nextTargetStatus?: { status?: StatusCondition, duration?: number };
    }> => {
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

      // 1a. Recharge Check
      if (attackerVolatile.recharging) {
        addLog(`${attacker.name} deve ricaricarsi!`);
        setAttackerVolatile(prev => ({ ...prev, recharging: false, lockedMove: undefined }));
        await new Promise(r => setTimeout(r, 700));
        return { nextPlayerHp: cPlayerHp, nextEnemyHp: cEnemyHp, stopped: false };
      }

      // 2. Primary Status Check (Sleep, Frozen, Paralysis)
      const moveCheck = canMove({ ...attacker, status: attackerStatus.status, statusDuration: attackerStatus.duration });
      if (moveCheck.statusChanged) {
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
        return { nextPlayerHp: cPlayerHp, nextEnemyHp: cEnemyHp, stopped: false };
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

      // 6. Execute Move Action
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
        addLog
      );

      // 7. Handle Recharge
      if (move.multiTurn?.type === 'recharge' && !actionRes.targetFainted) {
        setAttackerVolatile(prev => ({ ...prev, recharging: true, lockedMove: move }));
      }

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

      return { 
        nextPlayerHp: finalPlayerHp, 
        nextEnemyHp: finalEnemyHp, 
        stopped: false,
        nextUserStatus: actionRes.nextUserStatus,
        nextTargetStatus: actionRes.nextTargetStatus
      };
    };

    // --- EXECUTION PHASE 1: FIRST COMBATANT ---
    let curPlayerHp = playerHp;
    let curEnemyHp = enemyHp;
    let livePlayerStatus = { ...playerStatus };
    let liveEnemyStatus = { ...enemyStatus };

    const firstResult = await runCombatantAttack(playerFirst, true, curPlayerHp, curEnemyHp);
    curPlayerHp = firstResult.nextPlayerHp;
    curEnemyHp = firstResult.nextEnemyHp;
    if (playerFirst) {
      if (firstResult.nextUserStatus) livePlayerStatus = firstResult.nextUserStatus;
      if (firstResult.nextTargetStatus) liveEnemyStatus = firstResult.nextTargetStatus;
    } else {
      if (firstResult.nextUserStatus) liveEnemyStatus = firstResult.nextUserStatus;
      if (firstResult.nextTargetStatus) livePlayerStatus = firstResult.nextTargetStatus;
    }

    if (firstResult.stopped) {
      return;
    }

    await new Promise(r => setTimeout(r, 500));

    // --- EXECUTION PHASE 2: SECOND COMBATANT ---
    const secondResult = await runCombatantAttack(!playerFirst, false, curPlayerHp, curEnemyHp);
    curPlayerHp = secondResult.nextPlayerHp;
    curEnemyHp = secondResult.nextEnemyHp;
    if (!playerFirst) {
      if (secondResult.nextUserStatus) livePlayerStatus = secondResult.nextUserStatus;
      if (secondResult.nextTargetStatus) liveEnemyStatus = secondResult.nextTargetStatus;
    } else {
      if (secondResult.nextUserStatus) liveEnemyStatus = secondResult.nextUserStatus;
      if (secondResult.nextTargetStatus) livePlayerStatus = secondResult.nextTargetStatus;
    }

    if (secondResult.stopped) {
      return;
    }

    // --- EXECUTION PHASE 3: END OF TURN (Clear flinch, status tick damage) ---
    // Clear flinch & protect
    setPlayerVolatile(prev => ({ ...prev, isFlinched: false, isProtected: false }));
    setEnemyVolatile(prev => ({ ...prev, isFlinched: false, isProtected: false }));

    // Player status damage (Poison / Burn)
    curPlayerHp = await handleStatusEndTurn(playerActive, curPlayerHp, setPlayerHp, livePlayerStatus.status);
    if (curPlayerHp <= 0) {
      await handlePlayerFaint();
      return;
    }

    // Enemy status damage (Poison / Burn)
    curEnemyHp = await handleStatusEndTurn(enemy, curEnemyHp, setEnemyHp, liveEnemyStatus.status);
    if (curEnemyHp <= 0) {
      await handleWin(curPlayerHp);
      return;
    }

    setIsAnimating(false);
  }, [
    isAnimating, playerMoves, enemyMoves, getEffectiveSpeed, playerActive, 
    playerStages, playerStatus, enemy, enemyStages, enemyStatus, playerVolatile, 
    enemyVolatile, deductPlayerPp, deductEnemyPp, handleWin, 
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
      playEscape();
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

      if (item.type === 'healing') {
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
      } else if (['antidoto', 'antiparalisi', 'antiscotto', 'sveglia', 'cura-totale', 'full-heal'].includes(item.id)) {
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
              status={enemyStatus.status} 
              isConfused={Boolean(enemyVolatile.confusionTurns && enemyVolatile.confusionTurns > 0)}
              isShiny={enemy.isShiny}
              team={trainer ? enemyTeam.map(p => p.id === enemy.id ? { ...p, hp: enemyHp } : p) : [{ hp: enemyHp }]}
              stages={enemyStages}
            />
            <img 
              src={enemy.sprites.artwork} 
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
                <img src={trainer.sprite} alt="trainer" className="w-14 h-14 object-contain opacity-80 drop-shadow-lg" />
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

        {/* Player Side */}
        <div className="flex-1 flex flex-col items-start justify-center py-2 pl-2 min-h-[160px]">
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={isAnimating ? { x: [0, 8, -8, 0], opacity: 1 } : { x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <img 
              src={playerActive.sprites.artwork} 
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
                key={`battle-switch-${p.instanceId || p.id}-${i}`}
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
      <div className="absolute top-4 left-4 right-4 pointer-events-none flex flex-col items-start">
        {logs.map((log, i) => {
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
              animate={{ opacity: 1 - i * 0.2, y: 0 }}
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
