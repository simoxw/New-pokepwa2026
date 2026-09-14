import React from 'react';
import { useGame } from '../contexts/GameContext';
import { ChevronLeft } from 'lucide-react';

export const Pokedex: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state } = useGame();
  
  // Display first 151
  const pokemonIds = Array.from({ length: 151 }, (_, i) => i + 1);

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
        <h2 className="font-bold text-xl uppercase">Pokédex</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
        {pokemonIds.map(id => {
          const status = state.player.pokedex[id];
          return (
            <div 
              key={id}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 ${
                status === 'caught' ? 'bg-blue-50 border-blue-200' : 
                status === 'seen' ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-transparent opacity-20'
              }`}
            >
              <span className="text-[10px] font-bold text-gray-400">#{id.toString().padStart(3, '0')}</span>
              {status ? (
                <img 
                  src={status === 'caught' 
                    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
                    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
                  } 
                  alt="poke" 
                  className={`w-full h-full object-contain ${status === 'seen' ? 'brightness-0' : ''}`}
                />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center text-xl">?</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
