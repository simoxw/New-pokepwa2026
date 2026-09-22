import React, { useState } from 'react';
import { motion } from 'motion/react';
import { fetchPokemonData } from '../lib/pokeapi';
import { useGame } from '../contexts/GameContext';
import { Pokemon } from '../types/game';

const STARTER_IDS = [1, 4, 7, 25, 133, 54];

export const StarterSelection: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { setState } = useGame();
  const [starters, setStarters] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'intro' | 'choice'>('intro');

  const loadStarters = async () => {
    setLoading(true);
    const data = await Promise.all(STARTER_IDS.map(id => fetchPokemonData(id, 5, 'Laboratorio')));
    setStarters(data);
    setLoading(false);
    setStep('choice');
  };

  const selectStarter = (pokemon: Pokemon) => {
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        team: [pokemon],
        pokedex: { ...prev.player.pokedex, [pokemon.id]: 'caught' }
      }
    }));
    onComplete();
  };

  if (step === 'intro') {
    return (
      <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-xs space-y-6"
        >
          <img 
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" 
            alt="p" 
            className="w-32 h-32 mx-auto drop-shadow-xl"
          />
          <h1 className="text-3xl font-black uppercase italic">Benvenuto nel mondo Pokémon!</h1>
          <p className="text-gray-500 font-bold leading-tight">
            Volevo darti un Pokémon leggendario, ma li ho finiti. Scegline uno di questi... sono "abbastanza" decenti.
          </p>
          <button 
            onClick={loadStarters}
            className="w-full bg-blue-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            Vedi Opzioni
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-gray-50 flex flex-col p-6 overflow-y-auto">
      <h2 className="text-2xl font-black uppercase italic mb-6 text-center">Scegli il tuo compagno</h2>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {starters.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => selectStarter(p)}
              className="bg-white p-4 rounded-[2rem] border-4 border-white shadow-lg flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <img src={p?.sprites?.artwork || p?.sprites?.front || (p as any)?.spriteUrl} alt={p.name} className="w-24 h-24 object-contain drop-shadow-lg" />
              <div className="text-center">
                <span className="block font-black uppercase text-xs">{p.name}</span>
                <span className="text-[10px] text-gray-400 font-bold">Liv. 5</span>
              </div>
              <div className="flex gap-1 mt-1">
                {p.types.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 text-[8px] font-black uppercase">{t}</span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};
