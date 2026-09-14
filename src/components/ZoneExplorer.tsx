import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { ZONES } from '../constants/game';
import { fetchPokemonData } from '../lib/pokeapi';
import { getTrainer, TRAINERS_DATA } from '../data/trainers';
import { Pokemon, Trainer, Item } from '../types/game';
import { ChevronLeft, Footprints, Sword, Gift, MessageCircle, Heart } from 'lucide-react';
import { isAreaUnlocked } from '../lib/badges';
import { ZONE_EVENTS, GameEvent } from '../data/events';

interface ZoneExplorerProps {
  onEncounter: (pokemon: Pokemon, trainer?: Trainer) => void;
}

export const ZoneExplorer: React.FC<ZoneExplorerProps> = ({ onEncounter }) => {
  const { state, setState } = useGame();
  const zone = ZONES.find(z => z.id === state.player.location)!;
  
  // Security check: if somehow user enters a locked zone, kick them out
  React.useEffect(() => {
    if (!isAreaUnlocked(state.player.location, state.player.badges)) {
      setState(prev => ({ ...prev, player: { ...prev.player, location: 'villaggio' } }));
    }
  }, [state.player.location, state.player.badges, setState]);
  const [isExploring, setIsExploring] = useState(false);
  const [encounter, setEncounter] = useState<Pokemon | null>(null);
  const [trainerEncounter, setTrainerEncounter] = useState<Trainer | null>(null);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);

  const explore = async () => {
    setIsExploring(true);
    setEncounter(null);
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
        
        if (triggeredEvent.type === 'item' && triggeredEvent.item) {
          setState(prev => {
            const newState = {
              ...prev,
              player: {
                ...prev.player,
                inventory: [...prev.player.inventory, { 
                  id: `found-${Date.now()}`,
                  name: triggeredEvent.item!.name!,
                  type: triggeredEvent.item!.type!,
                  count: 1,
                  effectValue: triggeredEvent.item!.effectValue,
                  description: 'Trovato durante l\'esplorazione.'
                } as Item]
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
      const encounterTypeRoll = Math.random();
      if (encounterTypeRoll < 0.20 && state.player.location !== 'percorso-1') {
         // Trainer encounter
         const trainerIds = Object.keys(TRAINERS_DATA) as (keyof typeof TRAINERS_DATA)[];
         const randomTrainerId = trainerIds[Math.floor(Math.random() * trainerIds.length)];
         const trainer = await getTrainer(randomTrainerId);
         setTrainerEncounter(trainer);
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
        // If no spawn table match, give a default low-rarity common encounter so it doesn't feel empty
        if (Math.random() > 0.5 && zone.spawnTable.length > 0) {
          const common = zone.spawnTable[0];
          const level = Math.floor(Math.random() * (common.maxLevel - common.minLevel + 1)) + common.minLevel;
          const pokemon = await fetchPokemonData(common.pokemonId, level);
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
    <div className="h-full flex flex-col">
      {/* ... header ... */}
      <div className="p-4 flex items-center gap-4">
        <button 
          onClick={() => setState(prev => ({ ...prev, player: { ...prev.player, location: 'villaggio' } }))}
          className="p-2 bg-white/50 rounded-full"
        >
          <ChevronLeft />
        </button>
        <div>
          <h2 className="font-bold">{zone.name}</h2>
          <p className="text-xs opacity-70">{zone.description}</p>
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
                
                <p className="font-bold text-gray-700 italic">"{activeEvent.message}"</p>
                
                <button 
                  onClick={() => setActiveEvent(null)}
                  className="mt-4 bg-gray-200 text-gray-700 font-black px-6 py-2 rounded-full active:scale-95 transition-transform"
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
                  <h3 className="font-black text-xl uppercase italic">L'allenatore {trainerEncounter.name} ti sfida!</h3>
                  <p className="text-xs font-bold text-gray-500 italic">"{trainerEncounter.quote}"</p>
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
                  <img src={encounter.sprites.artwork} alt={encounter.name} className="w-48 h-48 relative z-10" />
                </div>
                <div className="text-center">
                  <h3 className="font-black text-2xl uppercase italic">Un {encounter.name} selvatico!</h3>
                  <p className="text-sm font-bold text-gray-500">Livello {encounter.level}</p>
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
                className="text-center text-gray-400"
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
            className="w-full max-w-xs bg-white py-6 rounded-3xl border-b-8 border-gray-200 shadow-xl flex flex-col items-center gap-2 active:translate-y-1 active:border-b-4 transition-all"
          >
            <Footprints className="w-10 h-10 text-gray-700" />
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
            className="mt-12 text-gray-500 font-bold text-sm underline hover:text-gray-700 transition-colors"
          >
            Scappa via correndo
          </motion.button>
        )}
      </div>
    </div>
  );
};
