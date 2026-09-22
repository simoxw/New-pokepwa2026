import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { ChevronLeft, Shield, Zap, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { PokemonDetails } from './PokemonDetails';
import { Pokemon, TYPE_COLORS, TYPE_TRANSLATIONS } from '../types/game';

export const Team: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, setState } = useGame();
  const [selected, setSelected] = useState<{ pokemon: Pokemon, index: number } | null>(null);
  const [swapSourceIndex, setSwapSourceIndex] = useState<number | null>(null);

  const moveMember = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= state.player.team.length) return;

    const newTeam = [...state.player.team];
    const [removed] = newTeam.splice(index, 1);
    newTeam.splice(newIndex, 0, removed);

    setState(prev => ({
      ...prev,
      player: { ...prev.player, team: newTeam }
    }));
    
    if (selected) {
       setSelected({ pokemon: removed, index: newIndex });
    }
  };

  const handleSwapClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (swapSourceIndex === null) {
      setSwapSourceIndex(index);
    } else {
      if (swapSourceIndex !== index) {
        const newTeam = [...state.player.team];
        const temp = newTeam[swapSourceIndex];
        newTeam[swapSourceIndex] = newTeam[index];
        newTeam[index] = temp;

        setState(prev => ({
          ...prev,
          player: { ...prev.player, team: newTeam }
        }));
      }
      setSwapSourceIndex(null);
    }
  };

  const depositInBox = (index: number) => {
    if (state.player.team.length <= 1) {
      alert("Non puoi depositare il tuo ultimo Pokémon!");
      return;
    }

    const pokemon = state.player.team[index];
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        team: prev.player.team.filter((_, i) => i !== index),
        box: [...prev.player.box, pokemon]
      }
    }));
    setSelected(null);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
        <h2 className="font-bold text-xl uppercase">Squadra</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.player.team.map((pokemon, i) => (
          <motion.div
            key={`team-member-${pokemon.instanceId || pokemon.id}-${i}`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelected({ pokemon, index: i })}
            className={`p-4 rounded-3xl border-4 shadow-sm flex items-center gap-4 relative overflow-hidden active:scale-[0.98] transition-all ${
              swapSourceIndex === i ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400' : 'bg-white border-gray-100'
            }`}
          >
            {/* Swapping Handle */}
            <button
              onClick={(e) => handleSwapClick(e, i)}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-sm transition-all z-20 shrink-0 ${
                swapSourceIndex === i 
                  ? 'bg-blue-600 text-white scale-110' 
                  : swapSourceIndex !== null 
                    ? 'bg-emerald-500 text-white animate-pulse' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>

            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center p-2 relative z-10">
              <img src={pokemon?.sprites?.artwork || pokemon?.sprites?.front || (pokemon as any)?.spriteUrl} alt={pokemon.name} className="w-full h-full object-contain" />
            </div>
            
            <div className="flex-1 relative z-10">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-lg uppercase leading-none flex items-center gap-1">
                      <span>{pokemon.nickname || pokemon.name}</span>
                      {pokemon.isFavorite && (
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 inline" />
                      )}
                    </h3>
                    <div className="flex gap-1">
                      {pokemon.types.map(t => {
                        const typeLower = t.toLowerCase();
                        const colorClass = TYPE_COLORS[typeLower] || 'bg-slate-500';
                        const typeLabel = TYPE_TRANSLATIONS[typeLower] || typeLower.toUpperCase();
                        return (
                          <span key={t} className={`${colorClass} text-[7px] font-black text-white px-1 py-0.5 rounded shadow-xs uppercase tracking-wider`}>
                            {typeLabel}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-400">Lv. {pokemon.level}</span>
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1 mb-2">
                <div className="flex justify-between text-[8px] font-bold uppercase text-gray-400">
                  <span>HP</span>
                  <span>{pokemon.hp}/{pokemon.maxHp}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(pokemon.hp / pokemon.maxHp) * 100}%` }}
                  />
                </div>
              </div>

              {/* EXP Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-bold uppercase text-gray-400">
                  <span>ESP</span>
                  <span>{pokemon.experience}/{pokemon.nextLevelExp}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(pokemon.experience / pokemon.nextLevelExp) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-50 rotate-12">
              <Zap className="w-24 h-24" />
            </div>
          </motion.div>
        ))}

        {Array.from({ length: Math.max(0, 6 - state.player.team.length) }).map((_, i) => (
          <div 
            key={`team-empty-slot-${i}`}
            className="h-24 rounded-3xl border-4 border-dashed border-gray-100 flex items-center justify-center text-gray-200"
          >
            <span className="font-bold uppercase tracking-widest text-xs">Slot Vuoto</span>
          </div>
        ))}
      </div>

      {selected && (
        <PokemonDetails 
          pokemon={selected.pokemon}
          onClose={() => setSelected(null)}
          onMoveUp={selected.index > 0 ? () => moveMember(selected.index, 'up') : undefined}
          onMoveDown={selected.index < state.player.team.length - 1 ? () => moveMember(selected.index, 'down') : undefined}
          onBox={() => depositInBox(selected.index)}
        />
      )}
    </div>
  );
};
