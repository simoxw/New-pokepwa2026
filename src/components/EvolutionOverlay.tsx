import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pokemon } from '../types/game';
import { evolvePokemon } from '../lib/evolution';

interface EvolutionOverlayProps {
  pokemon: Pokemon;
  onComplete: (evolvedPokemon: Pokemon) => void;
  onCancel: () => void;
}

export const EvolutionOverlay: React.FC<EvolutionOverlayProps> = ({ pokemon, onComplete, onCancel }) => {
  const [phase, setPhase] = useState<'ask' | 'evolving' | 'complete'>('ask');
  const [evolvedPokemon, setEvolvedPokemon] = useState<Pokemon | null>(null);

  const startEvolution = async () => {
    setPhase('evolving');
    // Actual evolution logic (fetching new data)
    const result = await evolvePokemon(pokemon);
    
    // Artificial delay for animation
    await new Promise(r => setTimeout(r, 4000));
    
    setEvolvedPokemon(result);
    setPhase('complete');
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-center p-6 text-white text-center">
      <AnimatePresence mode="wait">
        {phase === 'ask' && (
          <motion.div 
            key="ask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-black italic uppercase italic">Cosa?!</h2>
            <div className="w-48 h-48 mx-auto">
              <img src={pokemon.sprites.artwork} alt={pokemon.name} className="w-full h-full object-contain" />
            </div>
            <p className="text-xl font-bold italic">Sembra che {pokemon.name} stia per evolversi!</p>
            <div className="flex gap-4">
              <button 
                onClick={onCancel}
                className="flex-1 bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs"
              >
                Ferma B
              </button>
              <button 
                onClick={startEvolution}
                className="flex-1 bg-blue-500 hover:bg-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20"
              >
                Evolvi!
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'evolving' && (
          <motion.div 
            key="evolving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 0.8, 1.1, 0.9, 1],
                filter: ["brightness(1)", "brightness(5)", "brightness(1)", "brightness(10)", "brightness(1)"],
              }}
              transition={{ duration: 4, times: [0, 0.2, 0.4, 0.6, 0.8, 1], repeat: 0 }}
              className="w-64 h-64"
            >
               <img src={pokemon.sprites.artwork} alt="evolving" className="w-full h-full object-contain grayscale brightness-200" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [0, 2], opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: 8 }}
                className="w-32 h-32 bg-white rounded-full blur-2xl"
              />
            </div>
          </motion.div>
        )}

        {phase === 'complete' && evolvedPokemon && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150"
              />
              <div className="w-56 h-56 mx-auto relative z-10">
                <img src={evolvedPokemon.sprites.artwork} alt={evolvedPokemon.name} className="w-full h-full object-contain" />
              </div>
            </div>
            <h2 className="text-3xl font-black italic uppercase italic">Evviva!</h2>
            <p className="text-xl font-bold italic italic">Il tuo {pokemon.name} si è evoluto in {evolvedPokemon.name}!</p>
            <button 
              onClick={() => onComplete(evolvedPokemon)}
              className="w-full bg-blue-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs mt-8"
            >
              Fantastico!
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
