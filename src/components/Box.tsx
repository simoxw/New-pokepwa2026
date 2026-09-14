import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { ChevronLeft, Search } from 'lucide-react';
import { Pokemon } from '../types/game';
import { PokemonDetails } from './PokemonDetails';

export const Box: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, setState } = useGame();
  const [search, setSearch] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<{ pokemon: Pokemon, source: 'team' | 'box', index: number } | null>(null);

  const filteredBox = state.player.box.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const withdraw = (index: number) => {
    if (state.player.team.length >= 6) {
      alert("Squadra piena! Sposta prima qualcuno nel Box.");
      return;
    }
    const pokemon = state.player.box[index];
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        box: prev.player.box.filter((_, i) => i !== index),
        team: [...prev.player.team, pokemon]
      }
    }));
    setSelectedPokemon(null);
  };

  const deposit = (index: number) => {
    if (state.player.team.length <= 1) {
      alert("Devi avere almeno un Pokémon in squadra!");
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
    setSelectedPokemon(null);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b flex flex-col gap-4 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
          <h2 className="font-bold text-xl uppercase">Sistema Memoria</h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cerca nel box..." 
            className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="text-xs font-black uppercase text-gray-400 mb-3 tracking-widest">In Squadra ({state.player.team.length}/6)</h3>
          <div className="grid grid-cols-4 gap-2">
            {state.player.team.map((p, i) => (
              <BoxItem key={p.instanceId || `box-team-${i}`} pokemon={p} onClick={() => setSelectedPokemon({ pokemon: p, source: 'team', index: i })} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase text-gray-400 mb-3 tracking-widest">Nel Box ({filteredBox.length})</h3>
          {filteredBox.length === 0 ? (
            <div className="text-center py-12 text-gray-300 font-bold italic uppercase text-xs">Nessun Pokémon</div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {filteredBox.map((p, i) => (
                <BoxItem key={p.instanceId || `box-item-${i}`} pokemon={p} onClick={() => setSelectedPokemon({ pokemon: p, source: 'box', index: i })} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPokemon && (
        <PokemonDetails 
          pokemon={selectedPokemon.pokemon}
          onClose={() => setSelectedPokemon(null)}
          onBox={selectedPokemon.source === 'team' ? () => deposit(selectedPokemon.index) : undefined}
          onWithdraw={selectedPokemon.source === 'box' ? () => withdraw(selectedPokemon.index) : undefined}
        />
      )}
    </div>
  );
};

const BoxItem: React.FC<{ pokemon: Pokemon, onClick: () => void }> = ({ pokemon, onClick }) => (
  <button 
    onClick={onClick}
    className="aspect-square bg-gray-50 border-2 border-gray-100 rounded-2xl p-2 flex flex-col items-center justify-center active:scale-90 transition-transform"
  >
    <img src={pokemon.sprites.front} alt="p" className="w-full h-full object-contain" />
    <span className="text-[8px] font-black uppercase text-gray-400 truncate w-full text-center">{pokemon.name}</span>
  </button>
);
