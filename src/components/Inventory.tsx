import React from 'react';
import { useGame } from '../contexts/GameContext';
import { ChevronLeft, Package, User } from 'lucide-react';
import { Pokemon, Item, Move, TYPE_COLORS, TYPE_TRANSLATIONS } from '../types/game';
import { calculateStats, fetchMoveData } from '../lib/pokeapi';
import { canEvolve } from '../lib/evolution';
import { TMSelectionModal } from './TMSelectionModal';

export const Inventory: React.FC<{ 
  onBack: () => void, 
  onEvolution?: (p: Pokemon) => void,
  onMoveLearning?: (p: Pokemon, m: Move) => void
}> = ({ onBack, onEvolution, onMoveLearning }) => {
  const { state, setState } = useGame();
  const [usingItem, setUsingItem] = React.useState<Item | null>(null);
  const [tmPokemon, setTmPokemon] = React.useState<Pokemon | null>(null);

  const isUsableItem = (item: Item) => {
    const nameLower = item.name.toLowerCase();
    return item.type === 'healing' || 
           nameLower === 'caramella rara' || 
           nameLower === 'mt universale' || 
           item.id === 'caramella-rara' || 
           item.id === 'tm-universal';
  };

  const applyItemToPokemon = async (pokemonInstanceId: string) => {
    if (!usingItem) return;

    if (usingItem.id === 'tm-universal') {
      const target = state.player.team.find(p => p.instanceId === pokemonInstanceId);
      if (target) {
        setTmPokemon(target);
      }
      return;
    }

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

  const handleSellItem = (item: Item) => {
    if (item.count <= 0) return;
    
    const nameLower = item.name.toLowerCase();
    const sellPrice = (nameLower === 'pepita' || item.id === 'pepita') ? 5000 : 100;
    
    setState(prev => {
      // Find the specific item in the current inventory to ensure we have the latest state
      const inventory = [...prev.player.inventory];
      // Match by ID primarily, as it's the unique identifier in the list rendering
      const itemIndex = inventory.findIndex(i => i.id === item.id);
      
      if (itemIndex === -1) return prev;

      const updatedInventory = [...inventory];
      const currentItem = updatedInventory[itemIndex];
      
      if (currentItem.count <= 0) return prev;

      updatedInventory[itemIndex] = {
        ...currentItem,
        count: currentItem.count - 1
      };

      return {
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money + sellPrice,
          inventory: updatedInventory
        }
      };
    });
  };

  const handleTmMoveSelected = (selectedMove: Move) => {
    if (!tmPokemon) return;

    const newInventory = state.player.inventory.map(i =>
      i.id === 'tm-universal' ? { ...i, count: i.count - 1 } : i
    );

    let updatedPokemon = { ...tmPokemon };
    
    if (updatedPokemon.moves.length < 4) {
      updatedPokemon.moves = [...updatedPokemon.moves, selectedMove];

      setState(prev => {
        const teamIndex = prev.player.team.findIndex(p => p.instanceId === updatedPokemon.instanceId);
        if (teamIndex === -1) return prev;
        const newTeam = [...prev.player.team];
        newTeam[teamIndex] = updatedPokemon;
        return {
          ...prev,
          player: {
            ...prev.player,
            inventory: newInventory,
            team: newTeam
          }
        };
      });

      alert(`${updatedPokemon.nickname || updatedPokemon.name} ha imparato ${selectedMove.name}!`);
      setTmPokemon(null);
      setUsingItem(null);
    } else {
      setState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          inventory: newInventory
        }
      }));

      const targetP = { ...tmPokemon };
      setTmPokemon(null);
      setUsingItem(null);

      if (onMoveLearning) {
        onMoveLearning(targetP, selectedMove);
      }
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
          state.player.inventory.filter(i => i.count > 0).map((item) => {
            const isUsable = isUsableItem(item);
            const isNugget = item.name.toLowerCase() === 'pepita' || item.id === 'pepita';
            
            return (
              <div 
                key={item.id} 
                onClick={() => isUsable && setUsingItem(item)}
                className={`bg-gray-50 p-4 rounded-2xl flex items-center justify-between border-2 border-transparent transition-all active:scale-[0.98] ${
                  isUsable ? 'hover:border-blue-500 cursor-pointer' : (isNugget ? 'cursor-default' : 'opacity-60')
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">
                    {(() => {
                      const name = item.name.toLowerCase();
                      if (name.includes('ball')) {
                        if (name.includes('master')) return '🟣';
                        if (name.includes('ultra')) return '💎';
                        if (name.includes('mega')) return '🔵';
                        return '🔴';
                      }
                      if (name === 'pepita') return '💰';
                      if (name === 'caramella rara') return '🍬';
                      if (name === 'mt universale') return '💿';
                      if (name.includes('revitalizzante max')) return '🌟';
                      if (name.includes('revitalizzante')) return '✨';
                      return '💊';
                    })()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase">{item.name}</h4>
                    <p className="text-[10px] text-gray-500">{item.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full font-black text-xs">
                    x{item.count}
                  </div>
                  {isNugget && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSellItem(item);
                      }}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[11px] uppercase hover:bg-emerald-600 active:scale-90 shadow-md transition-all cursor-pointer"
                    >
                      Vendi
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Item Usage Selection */}
      {usingItem && !tmPokemon && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col">
          <div className="p-4 border-b flex items-center gap-4">
            <button onClick={() => setUsingItem(null)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
            <h2 className="font-bold text-lg uppercase">Usa {usingItem.name}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Seleziona un Pokémon</p>
            {state.player.team.map((pokemon, i) => (
              <button
                key={`item-target-${pokemon.instanceId || pokemon.id}-${i}`}
                onClick={() => applyItemToPokemon(pokemon.instanceId)}
                className="w-full bg-gray-50 p-4 rounded-3xl border-2 border-transparent active:border-blue-500 flex items-center gap-4 text-left transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <img src={pokemon.sprites.front} alt={pokemon.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-black text-sm uppercase leading-none">{pokemon.name}</h4>
                    <div className="flex gap-1 flex-wrap">
                      {pokemon.types.map(t => {
                        const typeLower = t.toLowerCase();
                        const colorClass = TYPE_COLORS[typeLower] || 'bg-slate-500';
                        const typeLabel = TYPE_TRANSLATIONS[typeLower] || typeLower.toUpperCase();
                        return (
                          <span key={t} className={`${colorClass} text-[9px] font-bold text-white px-2 py-0.5 rounded-full shadow-sm uppercase tracking-tight`}>
                            {typeLabel}
                          </span>
                        );
                      })}
                    </div>
                  </div>
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

      {/* TM Selection Modal */}
      {tmPokemon && (
        <TMSelectionModal 
          pokemon={tmPokemon}
          onClose={() => setTmPokemon(null)}
          onSelectMove={handleTmMoveSelected}
        />
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
