import React from 'react';
import { useGame } from '../contexts/GameContext';
import { ChevronLeft, Package, User } from 'lucide-react';
import { Pokemon, Item, Move } from '../types/game';
import { calculateStats, fetchMoveData } from '../lib/pokeapi';
import { canEvolve } from '../lib/evolution';

export const Inventory: React.FC<{ 
  onBack: () => void, 
  onEvolution?: (p: Pokemon) => void,
  onMoveLearning?: (p: Pokemon, m: Move) => void
}> = ({ onBack, onEvolution, onMoveLearning }) => {
  const { state, setState } = useGame();
  const [usingItem, setUsingItem] = React.useState<Item | null>(null);

  const applyItemToPokemon = async (pokemonInstanceId: string) => {
    if (!usingItem) return;

    let evolutionCandidate: Pokemon | null = null;
    let moveCandidate: { pokemon: Pokemon, move: Move } | null = null;

    const teamIndex = state.player.team.findIndex(p => p.instanceId === pokemonInstanceId);
    if (teamIndex === -1) return;
    
    let pokemon = { ...state.player.team[teamIndex] };
    let newInventory = [...state.player.inventory];

    if (usingItem.type === 'healing') {
      const isRevive = usingItem.id.includes('revitalizzante');
      
      if (isRevive) {
        if (pokemon.hp > 0) {
          alert("Questo Pokémon non ha bisogno di un revitalizzante!");
          return;
        }
        const healPercent = usingItem.effectValue || 0.5;
        pokemon.hp = Math.floor(pokemon.maxHp * healPercent);
      } else {
        if (pokemon.hp === 0) {
          alert("Usa un revitalizzante per questo Pokémon!");
          return;
        }
        if (pokemon.hp === pokemon.maxHp) {
          alert("I PS sono già al massimo!");
          return;
        }
        pokemon.hp = Math.min(pokemon.maxHp, pokemon.hp + (usingItem.effectValue || 0));
      }
    } else if (usingItem.id === 'caramella-rara') {
      if (pokemon.level >= 100) {
        alert("Livello massimo raggiunto!");
        return;
      }
      
      pokemon.level += 1;
      
      const newStats = calculateStats(pokemon.baseStats, pokemon.level, pokemon.ivs, pokemon.evs, pokemon.nature);
      const hpDiff = newStats.hp - pokemon.maxHp;
      pokemon.maxHp = newStats.hp;
      pokemon.hp = Math.min(pokemon.maxHp, pokemon.hp + hpDiff); 
      
      pokemon.attack = newStats.attack;
      pokemon.defense = newStats.defense;
      pokemon.spAtk = newStats.spAtk;
      pokemon.spDef = newStats.spDef;
      pokemon.speed = newStats.speed;
      
      if (pokemon.stats) {
        pokemon.stats = {
          attack: newStats.attack,
          defense: newStats.defense,
          spAtk: newStats.spAtk,
          spDef: newStats.spDef,
          speed: newStats.speed
        };
      }
      
      pokemon.hp = Math.max(0, Math.min(pokemon.maxHp, pokemon.hp));

      // Check for new moves
      if (pokemon.learnableMoves) {
        const movesAtThisLevel = pokemon.learnableMoves.filter(m => m.level === pokemon.level);
        for (const moveInfo of movesAtThisLevel) {
          if (!pokemon.moves.find(existing => existing.name.toLowerCase() === moveInfo.name.toLowerCase())) {
            try {
              const fullMove = await fetchMoveData(moveInfo.url);
              if (pokemon.moves.length < 4) {
                pokemon.moves.push(fullMove);
              } else {
                moveCandidate = { pokemon, move: fullMove };
              }
            } catch (e) {
              console.error("Failed to fetch move data", e);
            }
          }
        }
      }

      // Check for evolution
      if (canEvolve(pokemon)) {
        evolutionCandidate = pokemon;
      }
    } else {
      alert("Questo strumento non può essere usato ora.");
      return;
    }

    // Consume item immutably
    newInventory = newInventory.map(i => 
      i.id === usingItem.id ? { ...i, count: i.count - 1 } : i
    );

    setState(prev => {
      const newTeam = [...prev.player.team];
      newTeam[teamIndex] = pokemon;
      return {
        ...prev,
        player: {
          ...prev.player,
          inventory: newInventory,
          team: newTeam
        }
      };
    });

    setUsingItem(null);
    
    // Trigger evolution and/or move learning after state update
    if (evolutionCandidate && onEvolution) {
      onEvolution(evolutionCandidate);
    }
    if (moveCandidate && onMoveLearning) {
      onMoveLearning(moveCandidate.pokemon, moveCandidate.move);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col relative">
      <div className="p-4 border-b flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
        <h2 className="font-bold text-xl uppercase">Zaino</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {state.player.inventory.filter(i => i.count > 0).length === 0 ? (
          <div key="empty-inventory" className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <Package className="w-12 h-12" />
            <p>Lo zaino è vuoto.</p>
          </div>
        ) : (
          state.player.inventory.filter(i => i.count > 0).map((item) => (
            <div 
              key={item.id} 
              onClick={() => (item.type === 'healing' || item.id === 'caramella-rara') && setUsingItem(item)}
              className={`bg-gray-50 p-4 rounded-2xl flex items-center justify-between border-2 border-transparent transition-all active:scale-[0.98] ${
                (item.type === 'healing' || item.id === 'caramella-rara') ? 'hover:border-blue-500 cursor-pointer' : 'opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">
                  {item.id.includes('ball') ? (
                    item.id === 'master-ball' ? '🟣' : 
                    item.id === 'ultra-ball' ? '💎' : 
                    item.id === 'mega-ball' ? '🔵' : '🔴'
                  ) : (
                    item.id === 'caramella-rara' ? '🍬' : 
                    item.id === 'revitalizzante' ? '✨' :
                    item.id === 'revitalizzante-max' ? '🌟' : '💊'
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase">{item.name}</h4>
                  <p className="text-[10px] text-gray-500">{item.description}</p>
                </div>
              </div>
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full font-black text-xs">
                x{item.count}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Item Usage Selection */}
      {usingItem && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col">
          <div className="p-4 border-b flex items-center gap-4">
            <button onClick={() => setUsingItem(null)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
            <h2 className="font-bold text-lg uppercase">Usa {usingItem.name}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Seleziona un Pokémon</p>
            {state.player.team.map((pokemon, i) => (
              <button
                key={pokemon.instanceId || `team-usage-${i}`}
                onClick={() => applyItemToPokemon(pokemon.instanceId)}
                className="w-full bg-gray-50 p-4 rounded-3xl border-2 border-transparent active:border-blue-500 flex items-center gap-4 text-left transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <img src={pokemon.sprites.front} alt={pokemon.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase">{pokemon.name}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-gray-400">Liv. {pokemon.level}</span>
                    <span className="text-[10px] font-black text-gray-800">{pokemon.hp}/{pokemon.maxHp} PS</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        (pokemon.hp / pokemon.maxHp) > 0.5 ? 'bg-emerald-500' : (pokemon.hp / pokemon.maxHp) > 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(pokemon.hp / pokemon.maxHp) * 100}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 bg-blue-50">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-blue-800">Saldo Attuale:</span>
          <span className="text-xl font-black text-blue-600">${state.player.money}</span>
        </div>
      </div>
    </div>
  );
};
