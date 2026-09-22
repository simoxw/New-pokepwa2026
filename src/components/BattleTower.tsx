import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { Trainer, Pokemon } from '../types/game';
import { TowerCard, getRandomTowerCards, generateTowerOpponent } from '../lib/battleTower';
import { fullyHealPokemon } from '../lib/pokemonHeal';
import { ArrowLeft, Sparkles, Zap, Shield, Heart, Trophy, RefreshCw, Layers, Skull, CheckCircle2 } from 'lucide-react';

interface BattleTowerProps {
  onBack: () => void;
  onStartBattle: (trainer: Trainer, modifiers?: any) => void;
  lastBattleResult?: 'win' | 'lose' | null;
  onClearBattleResult?: () => void;
}

export const BattleTower: React.FC<BattleTowerProps> = ({ 
  onBack, 
  onStartBattle, 
  lastBattleResult,
  onClearBattleResult 
}) => {
  const { state, setState } = useGame();

  // Run state persisted in sessionStorage for seamless return from BattleScreen
  const [currentFloor, setCurrentFloor] = useState<number>(() => {
    const saved = sessionStorage.getItem('pokepwa_tower_floor');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [activeCards, setActiveCards] = useState<TowerCard[]>(() => {
    const saved = sessionStorage.getItem('pokepwa_tower_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [accumulatedMoney, setAccumulatedMoney] = useState<number>(() => {
    const saved = sessionStorage.getItem('pokepwa_tower_money');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [nextOpponent, setNextOpponent] = useState<Trainer | null>(null);
  const [cardChoices, setCardChoices] = useState<TowerCard[] | null>(null);
  const [showRestNode, setShowRestNode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Sync to session storage
  useEffect(() => {
    sessionStorage.setItem('pokepwa_tower_floor', currentFloor.toString());
    sessionStorage.setItem('pokepwa_tower_cards', JSON.stringify(activeCards));
    sessionStorage.setItem('pokepwa_tower_money', accumulatedMoney.toString());
  }, [currentFloor, activeCards, accumulatedMoney]);

  // Handle battle results returning from BattleScreen
  useEffect(() => {
    if (lastBattleResult === 'win') {
      // Player won current floor!
      const floorReward = 1000 + currentFloor * 400;
      const bonusMoneyCard = activeCards.find(c => c.bonusMoney);
      const extraMoney = bonusMoneyCard?.bonusMoney || 0;
      const totalFloorMoney = floorReward + extraMoney;

      setAccumulatedMoney(prev => prev + totalFloorMoney);

      // Apply card healing (e.g. Garbage Collection)
      const garbageCard = activeCards.find(c => c.healAfterKoPercent);
      if (garbageCard && garbageCard.healAfterKoPercent) {
        const percent = garbageCard.healAfterKoPercent;
        setState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            team: prev.player.team.map(p => {
              if (p.hp <= 0) return p;
              const healAmount = Math.floor((p.maxHp * percent) / 100);
              return { ...p, hp: Math.min(p.maxHp, p.hp + healAmount) };
            })
          }
        }));
      }

      // Update Tower High Floor Record
      if (currentFloor > (state.player.towerHighFloor || 0)) {
        setState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            towerHighFloor: currentFloor
          }
        }));
      }

      // If boss floor (multiple of 5), show Mainframe Rest Node first!
      if (currentFloor % 5 === 0) {
        setShowRestNode(true);
      } else {
        // Offer 3 cards for next floor
        const choices = getRandomTowerCards(3, activeCards.map(c => c.id));
        setCardChoices(choices);
      }
      onClearBattleResult?.();

    } else if (lastBattleResult === 'lose') {
      // Player lost the run!
      setIsGameOver(true);
      onClearBattleResult?.();
    }
  }, [lastBattleResult]);

  // Load next opponent when floor changes and no card choices pending
  useEffect(() => {
    if (!cardChoices && !isGameOver) {
      let isCancelled = false;
      setIsGenerating(true);
      generateTowerOpponent(currentFloor).then(opp => {
        if (!isCancelled) {
          setNextOpponent(opp);
          setIsGenerating(false);
        }
      });
      return () => {
        isCancelled = true;
      };
    }
  }, [currentFloor, cardChoices, isGameOver]);

  const handleSelectCard = (card: TowerCard) => {
    setActiveCards(prev => [...prev, card]);
    setCardChoices(null);
    setCurrentFloor(prev => prev + 1);
  };

  const handleStartCurrentFloor = () => {
    if (!nextOpponent) return;

    // Apply modifiers to battle
    onStartBattle(nextOpponent, {
      activeCards
    });
  };

  const handleRestartRun = () => {
    // Fully heal team after run ends
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        team: prev.player.team.map(p => fullyHealPokemon(p))
      }
    }));
    sessionStorage.removeItem('pokepwa_tower_floor');
    sessionStorage.removeItem('pokepwa_tower_cards');
    sessionStorage.removeItem('pokepwa_tower_money');
    setCurrentFloor(1);
    setActiveCards([]);
    setAccumulatedMoney(0);
    setIsGameOver(false);
    setCardChoices(null);
  };

  const handleCashOutAndLeave = () => {
    // Reward accumulated money
    if (accumulatedMoney > 0) {
      setState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money + accumulatedMoney
        }
      }));
    }
    handleRestartRun();
    onBack();
  };

  const isBossFloor = currentFloor % 5 === 0;
  const highFloor = state.player.towerHighFloor || 0;
  const teamAllFainted = state.player.team.length > 0 && state.player.team.every(p => p.hp <= 0);

  return (
    <div className="flex-1 bg-slate-950 text-white flex flex-col h-full overflow-hidden relative selection:bg-emerald-500 selection:text-white">
      {/* Background Matrix/Server Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

      {/* Header */}
      <header className="px-4 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all border border-white/10 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Villaggio</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-base">🗼</span>
            <h2 className="font-black uppercase tracking-wider text-sm text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
              Server a Piani Infiniti
            </h2>
          </div>
          <span className="text-[10px] text-gray-400 font-mono font-bold">
            Torre Lotta Roguelike
          </span>
        </div>

        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
          <Trophy className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-black text-emerald-300 font-mono">
            Max: P.{highFloor}
          </span>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 pb-24 max-w-xl mx-auto w-full">
        
        {/* Floor Indicator Card */}
        <div className={`rounded-3xl p-5 border-2 shadow-2xl relative overflow-hidden transition-all ${
          isBossFloor 
            ? 'bg-gradient-to-br from-red-950/80 via-slate-900 to-amber-950/80 border-amber-500/60 shadow-amber-950/50' 
            : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/60 border-emerald-500/30'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-[11px] font-black uppercase tracking-widest font-mono ${
                isBossFloor ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
              }`}>
                {isBossFloor ? '⚠️ PIANO BOSS DEL SERVER' : 'PIANO IN CORSO'}
              </span>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-0.5">
                Piano {currentFloor}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Montepremi Run
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                +${accumulatedMoney.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Active Cards Bar */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                Carte Modificatori Attive ({activeCards.length})
              </span>
            </div>

            {activeCards.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                Nessuna carta ancora equipaggiata. Sconfiggi il primo piano per scegliere la tua prima abilità!
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {activeCards.map((card, idx) => (
                  <div 
                    key={`${card.id}-${idx}`}
                    className="bg-black/60 border border-emerald-500/40 rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-xs text-emerald-200"
                    title={card.description}
                  >
                    <span>{card.icon}</span>
                    <span className="font-bold text-[11px]">{card.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modulo Ristoro Mainframe Overlay (Post Boss Floor) */}
        <AnimatePresence>
          {showRestNode && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900/98 border-2 border-amber-500/80 rounded-3xl p-5 shadow-2xl text-center backdrop-blur-md"
            >
              <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-400 mb-2">
                <Heart className="w-7 h-7 animate-pulse" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                Modulo Ristoro Mainframe (Piano {currentFloor})
              </h3>
              <p className="text-xs text-amber-300 font-mono mb-4">
                Hai sconfitto il Boss! Scegli la tua ricompensa speciale di stazione:
              </p>

              <div className="grid grid-cols-1 gap-3 text-left mb-4">
                {/* Option 1: Ripristino Squadra */}
                <button
                  onClick={() => {
                    setState(prev => ({
                      ...prev,
                      player: {
                        ...prev.player,
                        team: prev.player.team.map(p => fullyHealPokemon(p))
                      }
                    }));
                    setShowRestNode(false);
                    const choices = getRandomTowerCards(3, activeCards.map(c => c.id));
                    setCardChoices(choices);
                  }}
                  className="bg-emerald-950/60 hover:bg-emerald-900/80 border-2 border-emerald-500/50 hover:border-emerald-400 rounded-2xl p-3.5 transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <div className="text-3xl p-2 bg-emerald-500/20 rounded-xl shrink-0">
                    💊
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-black text-sm text-emerald-300 block">
                      Modulo Ripristino Squadra
                    </span>
                    <p className="text-xs text-emerald-100 mt-0.5 leading-snug">
                      Ripristina la salute di tutti i Pokémon al 100% e rianima gli esausti.
                    </p>
                  </div>
                </button>

                {/* Option 2: Potenziamento Avanzato */}
                <button
                  onClick={() => {
                    setShowRestNode(false);
                    const highTierChoices = getRandomTowerCards(3, activeCards.map(c => c.id)).map(c => ({
                      ...c,
                      rarity: c.rarity === 'common' ? 'rare' as const : c.rarity
                    }));
                    setCardChoices(highTierChoices);
                  }}
                  className="bg-cyan-950/60 hover:bg-cyan-900/80 border-2 border-cyan-500/50 hover:border-cyan-400 rounded-2xl p-3.5 transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <div className="text-3xl p-2 bg-cyan-500/20 rounded-xl shrink-0">
                    🎴
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-black text-sm text-cyan-300 block">
                      Modifica di Grado Avanzato
                    </span>
                    <p className="text-xs text-cyan-100 mt-0.5 leading-snug">
                      Ricevi una selezione di Carte Modificatori di alto grado per la tua run.
                    </p>
                  </div>
                </button>

                {/* Option 3: Taglia Mainframe */}
                <button
                  onClick={() => {
                    setAccumulatedMoney(prev => prev + 5000);
                    setShowRestNode(false);
                    const choices = getRandomTowerCards(3, activeCards.map(c => c.id));
                    setCardChoices(choices);
                  }}
                  className="bg-amber-950/60 hover:bg-amber-900/80 border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl p-3.5 transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <div className="text-3xl p-2 bg-amber-500/20 rounded-xl shrink-0">
                    💰
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-black text-sm text-amber-300 block">
                      Bonus Taglia Mainframe
                    </span>
                    <p className="text-xs text-amber-100 mt-0.5 leading-snug">
                      Incassa immediatamente +$5.000 PokéDollari nel montepremi della tua run.
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Upgrade Choice Overlay (Roguelike Draft) */}
        <AnimatePresence>
          {!showRestNode && cardChoices && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900/95 border-2 border-cyan-400/80 rounded-3xl p-5 shadow-2xl text-center backdrop-blur-md"
            >
              <div className="inline-flex p-2 rounded-full bg-cyan-500/20 text-cyan-300 mb-2">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                Piano {currentFloor} Conquistato!
              </h3>
              <p className="text-xs text-cyan-300 font-mono mb-4">
                Scegli 1 Carta di Potenziamento per i prossimi piani:
              </p>

              <div className="grid grid-cols-1 gap-3 text-left mb-4">
                {cardChoices.map((card) => {
                  const isCursed = card.rarity === 'cursed';
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleSelectCard(card)}
                      className={`border-2 rounded-2xl p-3.5 transition-all active:scale-98 cursor-pointer flex items-center gap-3.5 group ${
                        isCursed 
                          ? 'bg-purple-950/70 hover:bg-purple-900/80 border-purple-500/80 hover:border-red-500' 
                          : 'bg-slate-800/90 hover:bg-slate-700/90 border-white/10 hover:border-cyan-400'
                      }`}
                    >
                      <div className="text-3xl p-2 bg-white/5 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                        {card.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-black text-sm transition-colors ${
                            isCursed ? 'text-purple-300 group-hover:text-red-400' : 'text-white group-hover:text-cyan-300'
                          }`}>
                            {card.name}
                          </span>
                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                            isCursed ? 'bg-purple-900/80 text-purple-200 border border-purple-500/50' : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {card.rarity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1 leading-snug">
                          {card.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Opponent Card */}
        {!showRestNode && !cardChoices && !isGameOver && nextOpponent && (
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={nextOpponent.sprite} 
                alt={nextOpponent.name} 
                className="w-14 h-14 object-contain rounded-2xl bg-white/5 p-1 border border-white/10" 
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                  Avversario Prossimo
                </span>
                <h4 className="font-black text-base text-white truncate">
                  {nextOpponent.name}
                </h4>
                <p className="text-xs text-emerald-400 font-mono">
                  Squadra: {nextOpponent.team.length} Pokémon • Livelli ~{nextOpponent.team[0]?.level || 30}
                </p>
              </div>
            </div>

            {/* Boss Mutation Card Banner if present */}
            {(nextOpponent as any).bossMutation && (
              <div className="bg-gradient-to-r from-red-950/80 to-amber-950/80 border border-amber-500/50 rounded-2xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">⚠️</span>
                  <span className="font-black text-xs uppercase text-amber-300 font-mono">
                    MUTAZIONE BOSS: {(nextOpponent as any).bossMutation.name}
                  </span>
                </div>
                <p className="text-[11px] text-amber-100/90 leading-tight">
                  {(nextOpponent as any).bossMutation.description}
                </p>
              </div>
            )}

            <div className="bg-black/40 border border-white/5 rounded-2xl p-3 mb-4">
              <p className="text-xs text-gray-300 italic font-mono">
                "{nextOpponent.quote || 'Preparati alla sfida del piano!'}"
              </p>
            </div>

            <button
              onClick={handleStartCurrentFloor}
              disabled={isGenerating || teamAllFainted}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-xl active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                teamAllFainted
                  ? 'bg-red-950 text-red-400 border border-red-800 cursor-not-allowed'
                  : isBossFloor 
                    ? 'bg-gradient-to-r from-amber-500 via-red-500 to-amber-600 hover:brightness-110 text-white shadow-red-500/25'
                    : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-500/25'
              }`}
            >
              {teamAllFainted ? (
                <span>⚠️ Tutti i tuoi Pokémon sono esausti!</span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Affronta Piano {currentFloor}</span>
                </>
              )}
            </button>

            {currentFloor > 1 && (
              <button
                onClick={handleCashOutAndLeave}
                className="w-full mt-2.5 py-2.5 rounded-xl font-bold uppercase text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5 cursor-pointer text-center"
              >
                Ritiro Strategico (+${accumulatedMoney} nel portafoglio)
              </button>
            )}
          </div>
        )}

        {/* Team State preview in tower */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-black uppercase text-gray-300 tracking-wider">
              Stato Squadra Torre ({state.player.team.length} Pokémon)
            </h4>
            <span className="text-[10px] text-gray-400 font-mono">
              La vita persiste tra i piani!
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {state.player.team.map((poke, idx) => {
              const hpPercent = Math.max(0, Math.min(100, (poke.hp / poke.maxHp) * 100));
              const isFainted = poke.hp <= 0;
              return (
                <div 
                  key={`tower-poke-${poke.instanceId || poke.id}-${idx}`}
                  className={`rounded-2xl p-2.5 border flex items-center gap-2 ${
                    isFainted 
                      ? 'bg-red-950/30 border-red-900/50 opacity-60' 
                      : 'bg-black/40 border-white/10'
                  }`}
                >
                  <img src={poke.sprites.front} alt={poke.name} className="w-10 h-10 object-contain shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-black uppercase text-white truncate">
                        {poke.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        Lv.{poke.level}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full ${
                          hpPercent > 50 ? 'bg-emerald-400' : hpPercent > 20 ? 'bg-amber-400' : 'bg-red-500'
                        }`}
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 font-mono mt-0.5 block">
                      {poke.hp}/{poke.maxHp} PS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Over Modal */}
        <AnimatePresence>
          {isGameOver && (
            <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-slate-900 border-2 border-red-500/80 rounded-3xl p-6 shadow-2xl text-center"
              >
                <div className="inline-flex p-3 rounded-full bg-red-500/20 text-red-400 mb-3">
                  <Skull className="w-10 h-10 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  Connessione Interrotta!
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-1 mb-4">
                  Il tuo team è stato terminato dal Server al Piano {currentFloor}.
                </p>

                <div className="bg-black/50 rounded-2xl p-4 border border-white/10 mb-5 space-y-2 text-left text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Piani Superati:</span>
                    <span className="text-emerald-400 font-bold">{currentFloor - 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Carte Raccolte:</span>
                    <span className="text-cyan-400 font-bold">{activeCards.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Record Personale:</span>
                    <span className="text-amber-400 font-bold">Piano {Math.max(highFloor, currentFloor - 1)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleRestartRun}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black uppercase py-3 rounded-2xl text-xs tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    Riprova Scalata
                  </button>
                  <button
                    onClick={() => {
                      handleRestartRun();
                      onBack();
                    }}
                    className="px-4 py-3 rounded-2xl border border-white/20 text-gray-300 font-bold text-xs uppercase hover:bg-white/10 cursor-pointer"
                  >
                    Esci
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
