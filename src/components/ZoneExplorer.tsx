import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { ZONES } from '../constants/game';
import { fetchPokemonData } from '../lib/pokeapi';
import { getTrainer, TRAINERS_DATA } from '../data/trainers';
import { Pokemon, Trainer, Item } from '../types/game';
import { ChevronLeft, Footprints, Sword, Gift, MessageCircle, Heart, Moon } from 'lucide-react';
import { isAreaUnlocked, getBadgeForBoss } from '../lib/badges';
import { ZONE_EVENTS, GameEvent } from '../data/events';
import { useDayNight } from '../hooks/useDayNight';
import { NIGHT_EXCLUSIVE_POKEMON } from '../lib/dayNight';

interface ZoneExplorerProps {
  onEncounter: (pokemon: Pokemon, trainer?: Trainer) => void;
}

export const ZoneExplorer: React.FC<ZoneExplorerProps> = ({ onEncounter }) => {
  const { state, setState } = useGame();
  const { isNight, isSunset, formattedTime } = useDayNight();
  const zone = ZONES.find(z => z.id === state.player.location)!;
  
  // Security check: if somehow user enters a locked zone, kick them out
  React.useEffect(() => {
    if (!isAreaUnlocked(state.player.location, state.player.badges, state.player.leagueVictories || 0)) {
      setState(prev => ({ ...prev, player: { ...prev.player, location: 'villaggio' } }));
    }
  }, [state.player.location, state.player.badges, state.player.leagueVictories, setState]);

  // Asynchronous background prefetching for the current zone to warm up cache
  React.useEffect(() => {
    if (!zone) return;
    
    const prefetchZoneData = async () => {
      // 1. Prefetch Pokemon Spawns
      if (Array.isArray(zone.spawnTable)) {
        for (const spawn of zone.spawnTable) {
          try {
            // fetchPokemonData handles caching internally, filling memory and CacheStorage
            fetchPokemonData(spawn.pokemonId, spawn.minLevel, zone.name);
          } catch {
            // Silent catch to prevent background network glitches from affecting UI
          }
        }
      }
      
      // 2. Prefetch Trainers
      if (Array.isArray(zone.trainerTable)) {
        for (const t of zone.trainerTable) {
          try {
            getTrainer(t.trainerId as any, (t as any).isGymLeader);
          } catch {
            // Silent catch
          }
        }
      }
    };

    // Run after a short delay so it doesn't block the initial mount/transition animation
    const timer = setTimeout(prefetchZoneData, 500);
    return () => clearTimeout(timer);
  }, [zone]);
  const [isExploring, setIsExploring] = useState(false);
  const [encounter, setEncounter] = useState<Pokemon | null>(null);
  const [isNocturnal, setIsNocturnal] = useState(false);
  const [trainerEncounter, setTrainerEncounter] = useState<Trainer | null>(null);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);

  const explore = async () => {
    setIsExploring(true);
    setEncounter(null);
    setIsNocturnal(false);
    setTrainerEncounter(null);
    setActiveEvent(null);

    try {
      // Simulate walking
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check for random events first
      const events = ZONE_EVENTS[state.player.location] || [];
      const rollEvent = Math.random();
      const triggeredEvent = events.find(e => rollEvent <= e.triggerChance);

      if (triggeredEvent) {
        setActiveEvent(triggeredEvent);
        
        // Update Quest Progress if applicable
        const firstStepsQuest = state.player.quests.find(q => q.id === 'first-steps' && q.status === 'active');
        
        if (triggeredEvent.type === 'battle' && triggeredEvent.trainerId) {
          const trainer = await getTrainer(triggeredEvent.trainerId as any, (triggeredEvent as any).isGymLeader);
          setTrainerEncounter(trainer);
          return;
        }

        if (triggeredEvent.type === 'item' && triggeredEvent.item) {
          setState(prev => {
            const inventory = [...prev.player.inventory];
            // Case-insensitive merge by name
            const searchName = triggeredEvent.item!.name?.toLowerCase();
            const existingItemIndex = inventory.findIndex(i => i.name.toLowerCase() === searchName);

            if (existingItemIndex > -1) {
              inventory[existingItemIndex] = {
                ...inventory[existingItemIndex],
                count: inventory[existingItemIndex].count + 1
              };
            } else {
              inventory.push({
                id: `found-${Date.now()}`,
                name: triggeredEvent.item!.name!,
                type: triggeredEvent.item!.type!,
                count: 1,
                effectValue: triggeredEvent.item!.effectValue,
                description: 'Trovato durante l\'esplorazione.'
              } as Item);
            }

            const newState = {
              ...prev,
              player: {
                ...prev.player,
                inventory
              }
            };
            
            if (firstStepsQuest) {
              newState.player.quests = newState.player.quests.map(q => 
                q.id === 'first-steps' ? { ...q, status: 'completed' as const } : q
              );
            }
            
            return newState;
          });
        } else if (triggeredEvent.type === 'heal') {
          setState(prev => {
            const newState = {
              ...prev,
              player: {
                ...prev.player,
                team: prev.player.team.map(p => ({ ...p, hp: p.maxHp }))
              }
            };
            
            if (firstStepsQuest) {
              newState.player.quests = newState.player.quests.map(q => 
                q.id === 'first-steps' ? { ...q, status: 'completed' as const } : q
              );
            }
            
            return newState;
          });
        }
        return;
      }

      // Update Quest Progress for exploration
      const firstStepsQuest = state.player.quests.find(q => q.id === 'first-steps' && q.status === 'active');
      if (firstStepsQuest) {
        setState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            quests: prev.player.quests.map(q => 
              q.id === 'first-steps' ? { ...q, status: 'completed' as const } : q
            )
          }
        }));
      }

      // Random roll for Trainer vs Wild Pokemon (20% trainer if in zones)
      const currentZone = ZONES.find(z => z.id === state.player.location);
      const encounterTypeRoll = Math.random();
      
      if (encounterTypeRoll < 0.20 && currentZone?.trainerTable && currentZone.trainerTable.length > 0) {
         // Filter and weight trainers by zone table
         const table = currentZone.trainerTable.map(t => {
           let rarity = t.rarity;
           // INCREASE Gym Leader rarity if badge is not yet owned (Pity system)
           if (t.isGymLeader) {
             const bossName = TRAINERS_DATA[t.trainerId as keyof typeof TRAINERS_DATA]?.name;
             const badge = bossName ? getBadgeForBoss(bossName) : null;
             if (badge && !state.player.badges.includes(badge.id)) {
               rarity = rarity * 12; // 12x more likely to find him the first time
             }
           }
           return { ...t, rarity };
         });
         
         const totalRarity = table.reduce((sum, t) => sum + t.rarity, 0);
         let roll = Math.random() * totalRarity;
         let selectedTrainerId = table[0].trainerId;
         
         for (const t of table) {
           if (roll <= t.rarity) {
             selectedTrainerId = t.trainerId;
             break;
           }
           roll -= t.rarity;
         }

         const trainer = await getTrainer(selectedTrainerId as any, table.find(t => t.trainerId === selectedTrainerId)?.isGymLeader);
         setTrainerEncounter(trainer);
         return;
      }

      // Check for nocturnal exclusive pokemon during Night or Sunset (35% chance)
      if ((isNight || isSunset) && Math.random() < 0.35) {
        const nightPoke = NIGHT_EXCLUSIVE_POKEMON[Math.floor(Math.random() * NIGHT_EXCLUSIVE_POKEMON.length)];
        const level = Math.floor(Math.random() * (nightPoke.maxLevel - nightPoke.minLevel + 1)) + nightPoke.minLevel;
        const pokemon = await fetchPokemonData(nightPoke.id, level);
        setIsNocturnal(true);
        setEncounter(pokemon);
        return;
      }

      // Random encounter logic
      const roll = Math.random() * 100;
      let currentProb = 0;
      const found = zone.spawnTable.find(s => {
        currentProb += s.rarity;
        return roll <= currentProb;
      });

      if (found) {
        const level = Math.floor(Math.random() * (found.maxLevel - found.minLevel + 1)) + found.minLevel;
        const pokemon = await fetchPokemonData(found.pokemonId, level);
        setEncounter(pokemon);
      } else {
        // If no spawn table match, give a default proportional encounter so it doesn't feel empty
        if (Math.random() > 0.5 && zone.spawnTable.length > 0) {
          // Weighted random selection from the spawn table to avoid single-species fallback spam
          const totalRaritySum = zone.spawnTable.reduce((sum, s) => sum + s.rarity, 0);
          const fallbackRoll = Math.random() * totalRaritySum;
          let tempSum = 0;
          const fallbackPoke = zone.spawnTable.find(s => {
            tempSum += s.rarity;
            return fallbackRoll <= tempSum;
          }) || zone.spawnTable[0];

          const level = Math.floor(Math.random() * (fallbackPoke.maxLevel - fallbackPoke.minLevel + 1)) + fallbackPoke.minLevel;
          const pokemon = await fetchPokemonData(fallbackPoke.pokemonId, level);
          setEncounter(pokemon);
        }
      }
    } catch (e) {
      console.error('Error during exploration:', e);
    } finally {
      setIsExploring(false);
    }
  };

  const startBattle = () => {
    if (trainerEncounter) {
      onEncounter(trainerEncounter.team[0], trainerEncounter);
      setTrainerEncounter(null);
    } else if (encounter) {
      onEncounter(encounter);
      setEncounter(null);
    }
  };

  return (
    <div className={`h-full flex flex-col transition-colors duration-500 ${
      isNight 
        ? 'bg-slate-950 text-white' 
        : isSunset 
          ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 text-white' 
          : 'bg-white text-gray-900'
    }`}>
      {/* Header */}
      <div className={`p-4 flex items-center justify-between border-b transition-colors ${
        isNight || isSunset ? 'border-white/10 bg-slate-900/60 text-white' : 'border-gray-100 bg-white/60 text-slate-900'
      } backdrop-blur-md sticky top-0 z-20`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setState(prev => ({ ...prev, player: { ...prev.player, location: 'villaggio' } }))}
            className={`p-2 rounded-full cursor-pointer transition-all active:scale-95 ${
              isNight || isSunset ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <ChevronLeft />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold">{zone.name}</h2>
              {zone.id === 'area-zero' && (
                <span className="text-[9px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Post-Game
                </span>
              )}
            </div>
            <p className={`text-xs ${isNight || isSunset ? 'text-white/60' : 'text-slate-500'}`}>{zone.description}</p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
          isNight 
            ? 'bg-purple-950 border border-purple-500/40 text-purple-300' 
            : isSunset 
              ? 'bg-amber-950 border border-amber-500/40 text-amber-300' 
              : 'bg-blue-50 border border-blue-200 text-blue-600'
        }`}>
          {isNight ? '🌙' : isSunset ? '🌇' : '☀️'}
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Exploration View */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="relative w-64 h-64 rounded-full bg-black/5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isExploring ? (
              <motion.div
                key="walking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  animate={{ y: [0, -10, 0], x: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <Footprints className="w-16 h-16 text-blue-500" />
                </motion.div>
                <span className="font-bold text-blue-500 animate-pulse">Esplorando...</span>
              </motion.div>
            ) : activeEvent ? (
              <motion.div
                key="event"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4 max-w-xs text-center"
              >
                {activeEvent.sprite ? (
                  <img src={activeEvent.sprite} alt="event" className="w-32 h-32 object-contain mb-2" />
                ) : activeEvent.type === 'item' ? (
                  <Gift className="w-20 h-20 text-yellow-500 mb-2" />
                ) : activeEvent.type === 'heal' ? (
                  <Heart className="w-20 h-20 text-red-500 mb-2 animate-pulse" />
                ) : (
                  <MessageCircle className="w-20 h-20 text-purple-500 mb-2" />
                )}
                
                {activeEvent.speaker && (
                  <h4 className="font-black uppercase text-purple-600">{activeEvent.speaker}</h4>
                )}
                
                <p className={`font-bold italic ${isNight || isSunset ? 'text-white' : 'text-gray-700'}`}>"{activeEvent.message}"</p>
                
                <button 
                  onClick={() => setActiveEvent(null)}
                  className={`mt-4 font-black px-6 py-2 rounded-full active:scale-95 transition-transform ${
                    isNight || isSunset ? 'bg-white/10 text-white border border-white/20' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  OK!
                </button>
              </motion.div>
            ) : trainerEncounter ? (
              <motion.div
                key="trainer"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: [0, 360] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute inset-0 bg-red-500 blur-3xl opacity-20"
                  />
                  <img src={trainerEncounter.sprite} alt="trainer" className="w-48 h-48 relative z-10 drop-shadow-2xl" />
                </div>
                <div className="text-center">
                  <h3 className={`font-black text-xl uppercase italic ${isNight || isSunset ? 'text-white' : 'text-slate-900'}`}>L'allenatore {trainerEncounter.name} ti sfida!</h3>
                  <p className={`text-xs font-bold italic ${isNight || isSunset ? 'text-white/60' : 'text-gray-500'}`}>"{trainerEncounter.quote}"</p>
                </div>
                <button 
                  onClick={startBattle}
                  className="bg-black text-white font-black px-8 py-3 rounded-full shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <Sword className="w-4 h-4" />
                  ACCETTA!
                </button>
              </motion.div>
            ) : encounter ? (
              <motion.div
                key="encounter"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20"
                  />
                  <img src={encounter?.sprites?.artwork || encounter?.sprites?.front || (encounter as any)?.spriteUrl} alt={encounter.name} className="w-48 h-48 relative z-10" />
                </div>
                <div className="text-center">
                  {isNocturnal && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/80 border border-purple-400 text-purple-200 text-xs font-black uppercase tracking-wider mb-1 animate-pulse">
                      <Moon className="w-3.5 h-3.5 text-purple-300" />
                      <span>Creatura della Notte</span>
                    </div>
                  )}
                  <h3 className={`font-black text-2xl uppercase italic ${isNight || isSunset ? 'text-white' : 'text-slate-900'}`}>Un {encounter.name} selvatico!</h3>
                  <p className={`text-sm font-bold ${isNight || isSunset ? 'text-white/60' : 'text-gray-500'}`}>Livello {encounter.level}</p>
                </div>
                <button 
                  onClick={startBattle}
                  className="bg-red-500 text-white font-black px-8 py-3 rounded-full shadow-lg active:scale-95 transition-transform"
                >
                  LOTTA!
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center ${isNight || isSunset ? 'text-white/40' : 'text-gray-400'}`}
              >
                <p>Tutto tranquillo...</p>
                <p className="text-xs">Tocca il tasto sotto per cercare Pokémon</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Explore Button */}
        {!encounter && !trainerEncounter && !activeEvent && !isExploring && (
          <button
            onClick={explore}
            className={`w-full max-w-xs py-6 rounded-3xl border-b-8 shadow-xl flex flex-col items-center gap-2 active:translate-y-1 active:border-b-4 transition-all ${
              isNight 
                ? 'bg-slate-800 border-slate-950 text-white' 
                : isSunset 
                  ? 'bg-orange-900 border-orange-950 text-white' 
                  : 'bg-white border-gray-200 text-slate-900'
            }`}
          >
            <Footprints className={`w-10 h-10 ${isNight || isSunset ? 'text-white' : 'text-gray-700'}`} />
            <span className="font-black text-xl uppercase tracking-tighter">Cammina</span>
          </button>
        )}
        
        {(encounter || trainerEncounter || activeEvent) && !isExploring && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => {
              setEncounter(null);
              setTrainerEncounter(null);
              setActiveEvent(null);
            }}
            className={`mt-12 font-bold text-sm underline transition-colors ${
              isNight || isSunset ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Scappa via correndo
          </motion.button>
        )}
      </div>
    </div>
  );
};
