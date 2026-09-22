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

  const branches = pokemon.evolutionInfo?.branches;
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(
    branches && branches.length > 0 ? branches[0].nextId : undefined
  );

  const startEvolution = async (targetId?: number) => {
    setPhase('evolving');
    const result = await evolvePokemon(pokemon, targetId || selectedBranchId);
    
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
            className="space-y-6 max-w-sm w-full"
          >
            <h2 className="text-2xl font-black italic uppercase">Cosa?!</h2>
            <div className="w-44 h-44 mx-auto">
              <img src={pokemon?.sprites?.artwork || pokemon?.sprites?.front || (pokemon as any)?.spriteUrl} alt={pokemon.name} className="w-full h-full object-contain" />
            </div>
            <p className="text-lg font-bold italic">Sembra che {pokemon.name} stia per evolversi!</p>

            {branches && branches.length > 1 && (
              <div className="space-y-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 text-left">
                <span className="text-xs uppercase font-black text-amber-400 tracking-wider flex items-center gap-1.5">
                  ✨ Scegli l'Evoluzione desiderata:
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {branches.map(branch => {
                    const isSelected = selectedBranchId === branch.nextId;
                    const cleanName = branch.name.charAt(0).toUpperCase() + branch.name.slice(1);
                    return (
                      <button
                        key={branch.nextId}
                        type="button"
                        onClick={() => setSelectedBranchId(branch.nextId)}
                        className={`p-3 rounded-xl border-2 font-black uppercase text-xs transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'bg-blue-600 border-white text-white shadow-lg shadow-blue-500/30 scale-105 ring-2 ring-blue-400' 
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span>{cleanName}</span>
                        {isSelected && <span className="text-amber-300 text-sm">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={onCancel}
                className="flex-1 bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs cursor-pointer"
              >
                Ferma B
              </button>
              <button 
                onClick={() => startEvolution(selectedBranchId)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 cursor-pointer"
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
               <img src={pokemon?.sprites?.artwork || pokemon?.sprites?.front || (pokemon as any)?.spriteUrl} alt="evolving" className="w-full h-full object-contain grayscale brightness-200" />
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
                <img src={evolvedPokemon?.sprites?.artwork || evolvedPokemon?.sprites?.front || (evolvedPokemon as any)?.spriteUrl} alt={evolvedPokemon.name} className="w-full h-full object-contain" />
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
