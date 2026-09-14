import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pokemon, Move, Trainer, Item } from '../types/game';
import { useGame } from '../contexts/GameContext';
import { calculateExpGain, checkLevelUp, applyEvs } from '../lib/leveling';
import { fetchMoveData } from '../lib/pokeapi';
import { BattleHUD } from './battle/BattleHUD';
import { BattleControls } from './battle/BattleControls';
import { calculateDamage } from '../lib/battle/battleMath';
import { canMove, getStatusEffect, StatusCondition } from '../lib/battle/statusEffects';
import { checkAbility } from '../lib/battle/abilities';
import { useItemInBattle } from '../lib/battle/items';
import { BattleBag } from './battle/BattleBag';
import { getBadgeForBoss } from '../lib/badges';
import { CatchOverlay } from './CatchOverlay';

interface BattleScreenProps {
  enemy: Pokemon;
  trainer?: Trainer;
  onEnd: (result: 'win' | 'lose' | 'escape' | 'catch', evolutionCandidate?: Pokemon, moveCandidate?: { pokemon: Pokemon, move: Move }, ballUsed?: Item) => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ enemy: initialEnemy, trainer, onEnd }) => {
  const { state, setState } = useGame();
  const playerActive = state.player.team[0];
  
  // Guard against missing active pokemon
  if (!playerActive) {
    return null;
  }

  const [enemy, setEnemy] = useState(initialEnemy);
  const [playerHp, setPlayerHp] = useState(playerActive.hp);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [enemyTeam, setEnemyTeam] = useState<Pokemon[]>(trainer ? trainer.team : []);
  const [playerStatus, setPlayerStatus] = useState<{ status?: StatusCondition, duration?: number }>({ 
    status: playerActive.status, 
    duration: playerActive.statusDuration 
  });
  const [enemyStatus, setEnemyStatus] = useState<{ status?: StatusCondition, duration?: number }>({ 
    status: enemy.status, 
    duration: enemy.statusDuration 
  });
  const [logs, setLogs] = useState<string[]>(() => {
    const initialLogs = trainer ? [`L'allenatore ${trainer.name} ti sfida!`, `Inizia la battaglia!`] : ['Inizia la battaglia!'];
    if (initialEnemy.isShiny) {
      initialLogs.unshift(`✨ Un Pokémon cromatico è apparso! ✨`);
    }
    return initialLogs;
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const [showSwitch, setShowSwitch] = useState(false);
  const [showBag, setShowBag] = useState(false);
  const [catchBall, setCatchBall] = useState<Item | null>(null);
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

  const addLog = React.useCallback((msg: string) => setLogs(prev => [msg, ...prev].slice(0, 5)), []);

  const handleStatusEndTurn = React.useCallback(async (
    target: Pokemon, 
    currentHp: number, 
    setHp: (val: number) => void,
    status: StatusCondition | undefined
  ) => {
    if (!status) return currentHp;
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

  const triggerEnemyTurn = React.useCallback(async (currentPlayerHp: number, currentEnemyHp: number) => {
    setIsAnimating(true);
    await new Promise(r => setTimeout(r, 800));
    
    // Status check
    const moveCheck = canMove({ ...enemy, status: enemyStatus.status, statusDuration: enemyStatus.duration });
    if (moveCheck.newStatus !== enemyStatus.status || moveCheck.newDuration !== enemyStatus.duration) {
      setEnemyStatus({ status: moveCheck.newStatus, duration: moveCheck.newDuration });
    }

    if (!moveCheck.canMove) {
      if (moveCheck.msg) addLog(moveCheck.msg);
    } else {
      if (moveCheck.msg) addLog(moveCheck.msg);
      const enemyMove = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
      addLog(`${enemy.name} usa ${enemyMove.name}!`);
      
      const result = calculateDamage({ ...enemy, status: enemyStatus.status }, { ...playerActive, status: playerStatus.status }, enemyMove);
      addLog(`${enemy.name} infligge ${result.damage} danni!`);
      
      if (result.effectiveness > 1) addLog("È superefficace!");
      if (result.effectiveness < 1 && result.effectiveness > 0) addLog("Non è molto efficace...");
      if (result.effectiveness === 0) addLog("Non ha effetto...");
      if (result.isCrit) addLog("Brutto colpo!");

      const nextPlayerHp = Math.max(0, currentPlayerHp - result.damage);
      setPlayerHp(nextPlayerHp);
      currentPlayerHp = nextPlayerHp;

      if (nextPlayerHp <= 0) {
        addLog(`${playerActive.name} è k.o.!`);
        await new Promise(r => setTimeout(r, 1000));
        
        setState(prev => {
          const team = [...prev.player.team];
          team[0] = { ...team[0], hp: 0 };
          return { ...prev, player: { ...prev.player, team } };
        });

        // Check if there are other pokemon available
        const hasAvailable = state.player.team.some((p, i) => i !== 0 && p.hp > 0);
        if (hasAvailable) {
          addLog("Scegli un altro Pokémon!");
          setIsAnimating(false); // Allow switching
          setShowSwitch(true);
        } else {
          addLog("Non hai più Pokémon utilizzabili! Prof. Scordarello ti trascina via.");
          await new Promise(r => setTimeout(r, 1500));
          setBattleResult({ type: 'lose' });
        }
        return;
      }
    }

    // End of turn status damage for enemy
    await handleStatusEndTurn(enemy, currentEnemyHp, setEnemyHp, enemyStatus.status);

    setIsAnimating(false);
  }, [enemy, playerActive, enemyStatus, playerStatus, addLog, setState, handleStatusEndTurn]);

  const handleSwitch = React.useCallback(async (index: number) => {
    if (index === 0 || (isAnimating && playerHp > 0)) return;
    const nextPkmn = state.player.team[index];
    if (nextPkmn.hp <= 0) return;

    const wasFainted = playerHp <= 0;
    addLog(`Torna, ${playerActive.name}! Vai, ${nextPkmn.name}!`);
    
    setState(prev => {
      const team = [...prev.player.team];
      team[0] = { ...team[0], hp: playerHp, status: playerStatus.status, statusDuration: playerStatus.duration };
      const [removed] = team.splice(index, 1);
      team.unshift(removed);
      return { ...prev, player: { ...prev.player, team } };
    });

    setPlayerHp(nextPkmn.hp);
    setPlayerStatus({ status: nextPkmn.status, duration: nextPkmn.statusDuration });
    setShowSwitch(false);
    
    if (!wasFainted) {
      await triggerEnemyTurn(nextPkmn.hp, enemyHp);
    } else {
      setIsAnimating(false);
    }
  }, [isAnimating, playerActive, playerHp, playerStatus, state.player.team, setState, addLog, triggerEnemyTurn, enemyHp]);

  const handleWin = React.useCallback(async (finalPlayerHp: number) => {
    addLog(`${enemy.name} è esausto!`);
    
    const exp = calculateExpGain(playerActive, enemy);
    addLog(`${playerActive.name} ottiene ${exp} punti ESP!`);
    
    await new Promise(r => setTimeout(r, 1500));

    // Calculate EV gain and level up before updating state to avoid side effects in updater
    let activeClone = { 
      ...playerActive, 
      experience: playerActive.experience + exp,
      hp: finalPlayerHp,
      status: playerStatus.status,
      statusDuration: playerStatus.duration
    };

    // Apply EVs from defeated enemy
    activeClone = applyEvs(activeClone, enemy.evYield);
    
    const { leveledUp, newPokemon, canEvolve, newMoves } = checkLevelUp(activeClone);
    
    if (leveledUp) {
      addLog(`${newPokemon.name} è salito al livello ${newPokemon.level}!`);
    }

    let moveCandidate: { pokemon: Pokemon, move: Move } | undefined;

    // Basic move learning: auto-learn if space available, otherwise queue for overlay
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

    // Update player state with progress from THIS pokemon
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

    if (leveledUp) {
      await new Promise(r => setTimeout(r, 1000));
    }

    // Trainer logic: check if they have more Pokemon
    if (trainer) {
      // Mark current enemy as defeated in local team state
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
        setEnemyStatus({ status: nextEnemy.status, duration: nextEnemy.statusDuration });
        setIsAnimating(false);
        return;
      }

      // End of trainer battle
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

      if (badge && !state.player.badges.includes(badge.id)) {
        addLog(`Hai ottenuto la ${badge.name}!`);
      }
    } else {
      // Wild battle end
      setState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money + 50
        }
      }));
    }

    setBattleResult({ 
      type: 'win', 
      evo: canEvolve ? newPokemon : undefined,
      newMove: moveCandidate
    });
  }, [enemy, playerActive, playerStatus, setState, addLog, trainer, enemyTeam]);

  const handleMove = React.useCallback(async (move: Move) => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Player Turn status check
    const moveCheck = canMove({ ...playerActive, status: playerStatus.status, statusDuration: playerStatus.duration });
    if (moveCheck.newStatus !== playerStatus.status || moveCheck.newDuration !== playerStatus.duration) {
      setPlayerStatus({ status: moveCheck.newStatus, duration: moveCheck.newDuration });
    }

    let currentEnemyHp = enemyHp;
    let currentPlayerHp = playerHp;

    if (!moveCheck.canMove) {
      if (moveCheck.msg) addLog(moveCheck.msg);
    } else {
      if (moveCheck.msg) addLog(moveCheck.msg);
      addLog(`${playerActive.name} usa ${move.name}!`);

      // Ability check on move use
      const abilityEffect = checkAbility(playerActive, 'on_move_use', { move, target: enemy });
      if (abilityEffect?.msg) addLog(abilityEffect.msg);
      
      let damageMult = abilityEffect?.type === 'damage_mult' ? abilityEffect.value || 1 : 1;
      
      const result = calculateDamage({ ...playerActive, status: playerStatus.status }, { ...enemy, status: enemyStatus.status }, move);
      const finalDamage = Math.floor(result.damage * damageMult);
      
      addLog(`${playerActive.name} infligge ${finalDamage} danni!`);
      
      if (result.effectiveness > 1) addLog("È superefficace!");
      if (result.effectiveness < 1 && result.effectiveness > 0) addLog("Non è molto efficace...");
      if (result.effectiveness === 0) addLog("Non ha effetto...");
      if (result.isCrit) addLog("Brutto colpo!");

      currentEnemyHp = Math.max(0, enemyHp - finalDamage);
      setEnemyHp(currentEnemyHp);

      // Ability check on hit (e.g. Static)
      const onHitEffect = checkAbility(enemy, 'on_hit', { move, target: playerActive });
      if (onHitEffect?.msg) addLog(onHitEffect.msg);
    }
    
    await new Promise(r => setTimeout(r, 1000));

    if (currentEnemyHp <= 0) {
      await handleWin(currentPlayerHp);
      return;
    }

    // End of turn status damage for player
    currentPlayerHp = await handleStatusEndTurn(playerActive, currentPlayerHp, setPlayerHp, playerStatus.status);

    if (currentPlayerHp <= 0) {
      addLog(`${playerActive.name} è k.o. per via del suo stato!`);
      await new Promise(r => setTimeout(r, 1000));
      
      setState(prev => {
        const team = [...prev.player.team];
        team[0] = { ...team[0], hp: 0 };
        return { ...prev, player: { ...prev.player, team } };
      });

      // Check if there are other pokemon available
      const hasAvailable = state.player.team.some((p, i) => i !== 0 && p.hp > 0);
      if (hasAvailable) {
        addLog("Scegli un altro Pokémon!");
        setIsAnimating(false); // Allow switching
        setShowSwitch(true);
      } else {
        addLog("Non hai più Pokémon utilizzabili! Prof. Scordarello ti trascina via.");
        await new Promise(r => setTimeout(r, 1500));
        setBattleResult({ type: 'lose' });
      }
      return;
    }

    await triggerEnemyTurn(currentPlayerHp, currentEnemyHp);
  }, [isAnimating, playerActive, enemy, enemyHp, playerHp, playerStatus, enemyStatus, handleWin, triggerEnemyTurn, addLog, handleStatusEndTurn]);

  const handleCatchResult = async (success: boolean) => {
    if (success && catchBall) {
      setBattleResult({ type: 'catch', ball: catchBall });
    } else {
      setCatchBall(null);
      setIsAnimating(false);
      addLog(`Oh no! ${enemy.name} si è liberato!`);
      await triggerEnemyTurn(playerHp, enemyHp);
    }
  };

  const handleUseItem = React.useCallback(async (item: Item) => {
    setShowBag(false);
    setIsAnimating(true);
    
    const result = useItemInBattle(item, playerActive);
    addLog(`Usi ${item.name}!`);
    await new Promise(r => setTimeout(r, 800));
    
    if (result.success) {
      addLog(result.msg);
      
      // Consume item
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
        
        // Synchronize with global state immediately to ensure other components (and potential switch/win logic) have correct HP
        setState(prev => {
          const team = [...prev.player.team];
          team[0] = { ...team[0], hp: nextHp };
          return { ...prev, player: { ...prev.player, team } };
        });

        await new Promise(r => setTimeout(r, 1000));
        await triggerEnemyTurn(nextHp, enemyHp);
      } else if (item.type === 'capture') {
        if (trainer) {
          addLog("Non puoi rubare i Pokémon degli altri allenatori!");
          await new Promise(r => setTimeout(r, 1000));
          await triggerEnemyTurn(playerHp, enemyHp);
          return;
        }

        // Trigger Catch Overlay internally
        setCatchBall(item);
      }
    } else {
      addLog(result.msg);
      setIsAnimating(false);
    }
  }, [playerActive, playerHp, enemyHp, addLog, setState, triggerEnemyTurn, trainer]);

  return (
    <div className="fixed inset-0 z-[80] bg-gradient-to-b from-blue-400 to-emerald-400 overflow-y-auto">
      <div className="min-h-full flex flex-col p-3 pb-6">
        {/* Enemy Side */}
        <div className="flex-1 flex flex-col items-end justify-start pt-8 pr-2 min-h-[140px]">
          <motion.div 
            animate={isAnimating ? { x: [0, -10, 10, 0] } : {}}
            className={`relative ${trainer ? 'pt-20' : ''}`}
          >
            <BattleHUD 
              current={enemyHp} 
              max={enemy.maxHp} 
              label={enemy.name} 
              level={enemy.level} 
              status={enemyStatus.status} 
              isShiny={enemy.isShiny}
              team={trainer ? enemyTeam.map(p => p.id === enemy.id ? { ...p, hp: enemyHp } : p) : [{ hp: enemyHp }]}
            />
            <img 
              src={enemy.sprites.artwork} 
              alt={enemy.name} 
              className={`w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl object-contain ${enemy.isShiny ? 'relative' : ''}`} 
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
                 <img src={trainer.sprite} alt="trainer" className="w-14 h-14 object-contain grayscale opacity-50" />
                 <span className="text-[9px] font-black uppercase text-white bg-black/40 px-2 py-0.5 rounded-full">{trainer.name}</span>
               </div>
            )}
          </motion.div>
        </div>

        {/* Player Side */}
        <div className="flex-1 flex flex-col items-start justify-center py-2 pl-2 min-h-[160px]">
          <motion.div 
            animate={isAnimating ? { x: [0, 10, -10, 0] } : {}}
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
              isShiny={playerActive.isShiny}
              team={state.player.team.map((p, i) => i === 0 ? { ...p, hp: playerHp } : p)}
            />
          </motion.div>
        </div>

        {/* Controls */}
        <BattleControls 
          moves={playerActive.moves} 
          onMove={handleMove} 
          onBag={() => setShowBag(true)} 
          onEscape={() => setBattleResult({ type: 'escape' })}
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
              <button onClick={() => setShowSwitch(false)} className="text-2xl">✕</button>
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

      {/* Logs Overlay */}
      <div className="absolute top-4 left-4 right-4 pointer-events-none">
        {logs.map((log, i) => (
          <motion.div
            key={`${log}-${i}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1 - i * 0.2, y: 0 }}
            className="bg-black/60 text-white text-[10px] px-3 py-1 rounded-full mb-1 w-fit backdrop-blur-sm font-bold"
          >
            {log}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
