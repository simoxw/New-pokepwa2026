import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { fetchPokedexIndex, PokedexIndexItem } from '../lib/pokedexService';
import { GENERATIONS, ALL_TYPES, getTypeVisual } from './pokedex/pokedexConstants';
import { PokedexDetailModal } from './pokedex/PokedexDetailModal';
import { PokedexTypeCalculatorModal } from './pokedex/PokedexTypeCalculatorModal';
import { PokedexProgressModal, MILESTONES } from './pokedex/PokedexProgressModal';
import { playMenuClick } from '../lib/sound';
import {
  ChevronLeft, Search, Filter, Trophy, Sparkles,
  SlidersHorizontal, Check, Eye, HelpCircle, ArrowUp
} from 'lucide-react';

interface PokedexProps {
  onBack: () => void;
}

export const Pokedex: React.FC<PokedexProps> = ({ onBack }) => {
  const { state } = useGame();
  const pokedex = state.player.pokedex || {};

  const [pokemonList, setPokemonList] = useState<PokedexIndexItem[]>([]);
  const [loadingIndex, setLoadingIndex] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGen, setSelectedGen] = useState<number>(0); // 0 = Tutte
  const [statusFilter, setStatusFilter] = useState<'all' | 'caught' | 'seen' | 'unseen'>('all');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Modals state
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const [showTypeCalculator, setShowTypeCalculator] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Pagination state (for smooth 60fps mobile rendering)
  const [displayLimit, setDisplayLimit] = useState(60);

  // Load index of 1025 items
  useEffect(() => {
    let isMounted = true;
    fetchPokedexIndex()
      .then(items => {
        if (isMounted) {
          setPokemonList(items);
          setLoadingIndex(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadingIndex(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Stats
  const totalCaught = useMemo(() => {
    return Object.values(pokedex).filter(s => s === 'caught').length;
  }, [pokedex]);

  const totalSeen = useMemo(() => {
    return Object.values(pokedex).filter(s => s === 'seen' || s === 'caught').length;
  }, [pokedex]);

  const claimableMilestonesCount = useMemo(() => {
    try {
      const saved = localStorage.getItem('pokepwa_claimed_pokedex_milestones');
      const claimedList: string[] = saved ? JSON.parse(saved) : [];
      return MILESTONES.filter(m => !claimedList.includes(m.id) && totalCaught >= m.requiredCount).length;
    } catch {
      return 0;
    }
  }, [totalCaught, showProgressModal]);

  // Filtering
  const filteredPokemon = useMemo(() => {
    let result = pokemonList;

    // Filter by Generation
    if (selectedGen > 0) {
      const genObj = GENERATIONS.find(g => g.id === selectedGen);
      if (genObj) {
        const [start, end] = genObj.range;
        result = result.filter(p => p.id >= start && p.id <= end);
      }
    }

    // Filter by Status
    if (statusFilter === 'caught') {
      result = result.filter(p => pokedex[p.id] === 'caught');
    } else if (statusFilter === 'seen') {
      result = result.filter(p => pokedex[p.id] === 'seen');
    } else if (statusFilter === 'unseen') {
      result = result.filter(p => !pokedex[p.id]);
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(p => {
        const matchId = p.id.toString() === query || p.formattedId.toLowerCase().includes(query);
        const matchName = p.name.toLowerCase().includes(query);
        return matchId || matchName;
      });
    }

    return result;
  }, [pokemonList, selectedGen, statusFilter, searchQuery, pokedex]);

  // Reset pagination on filter change
  useEffect(() => {
    setDisplayLimit(60);
  }, [selectedGen, statusFilter, searchQuery]);

  const displayedList = useMemo(() => {
    return filteredPokemon.slice(0, displayLimit);
  }, [filteredPokemon, displayLimit]);

  const hasMore = displayLimit < filteredPokemon.length;

  return (
    <div className="h-full bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden">
      
      {/* TOP APP BAR */}
      <header className="px-3 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 z-10 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              playMenuClick();
              onBack();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Torna all'Hub"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white uppercase">
                Pokédex
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Nazionale
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
              <span>🎒 <strong className="text-emerald-400">{totalCaught}</strong> catturati</span>
              <span>👁️ <strong className="text-amber-400">{totalSeen}</strong> visti</span>
            </div>
          </div>
        </div>

        {/* Quick Action Modals Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playMenuClick();
              setShowTypeCalculator(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
            title="Tabella Efficacia Tipi"
          >
            <span>🧮</span>
            <span className="hidden sm:inline">Tipi</span>
          </button>

          <button
            onClick={() => {
              playMenuClick();
              setShowProgressModal(true);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              claimableMilestonesCount > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 animate-pulse'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
            title="Progressi e Ricompense Pokédex"
          >
            <Trophy className={`w-3.5 h-3.5 ${claimableMilestonesCount > 0 ? 'text-slate-950' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">Premi</span>
            {claimableMilestonesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black">
                {claimableMilestonesCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* SEARCH & FILTERS BAR */}
      <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 space-y-2 shrink-0">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca Pokémon per nome o #numero..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Toggle Filter Panel */}
          <button
            onClick={() => setShowFiltersPanel(f => !f)}
            className={`p-1.5 rounded-xl border transition-colors flex items-center gap-1 text-xs font-bold ${
              showFiltersPanel || selectedGen > 0 || statusFilter !== 'all'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Filtri avanzati"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Status Filters Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: 'all', label: 'Tutti', count: pokemonList.length },
            { id: 'caught', label: 'Catturati', count: totalCaught, icon: '🎒' },
            { id: 'seen', label: 'Visti', count: totalSeen, icon: '👁️' },
            { id: 'unseen', label: 'Da Scoprire', count: Math.max(0, 1025 - totalCaught), icon: '❓' }
          ].map(st => {
            const isActive = statusFilter === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                {st.icon && <span>{st.icon}</span>}
                <span>{st.label}</span>
                <span className="text-[10px] opacity-70">({st.count})</span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Filter Panel: Generations */}
        {showFiltersPanel && (
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block px-1">
              Filtra per Generazione:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {GENERATIONS.map(gen => {
                const isSelected = selectedGen === gen.id;
                return (
                  <button
                    key={gen.id}
                    onClick={() => setSelectedGen(gen.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{gen.flag}</span>
                    <span>{gen.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* POKÉMON GRID */}
      <main className="flex-1 overflow-y-auto p-3">
        {loadingIndex ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Caricamento Pokédex Nazionale (1025 Pokémon)...</p>
          </div>
        ) : filteredPokemon.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
            <HelpCircle className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-base font-bold text-slate-300">Nessun Pokémon corrisponde ai filtri</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Prova a reimpostare la ricerca o seleziona un'altra categoria di stato.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGen(0);
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              Reimposta Filtri
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
              {displayedList.map(item => {
                const status = pokedex[item.id];
                const isCaught = status === 'caught';
                const isSeen = status === 'seen';

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playMenuClick();
                      setSelectedPokemonId(item.id);
                    }}
                    className={`aspect-square rounded-2xl border flex flex-col items-center justify-between p-2 relative transition-all duration-200 hover:scale-[1.03] active:scale-95 group ${
                      isCaught
                        ? 'bg-gradient-to-b from-slate-800/90 to-slate-900 border-slate-700 shadow-md hover:border-indigo-500/70 hover:shadow-indigo-500/10'
                        : isSeen
                        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/50 border-slate-900 hover:border-slate-800 opacity-40 hover:opacity-75'
                    }`}
                  >
                    {/* Header Row on Card */}
                    <div className="w-full flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {item.formattedId}
                      </span>
                      {isCaught && (
                        <span className="w-3 h-3 rounded-full bg-red-500 border border-white/80 flex items-center justify-center shadow-sm" title="Catturato">
                          <span className="w-1 h-1 rounded-full bg-white" />
                        </span>
                      )}
                      {isSeen && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" title="Visto" />
                      )}
                    </div>

                    {/* Sprite / Artwork Showcase */}
                    <div className="w-full flex-1 flex items-center justify-center my-1 relative">
                      {isCaught ? (
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-contain drop-shadow"
                          onError={(e) => {
                            // Fallback to basic sprite
                            (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;
                          }}
                        />
                      ) : isSeen ? (
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`}
                          alt="seen"
                          loading="lazy"
                          className="w-full h-full object-contain brightness-0 contrast-200 opacity-60"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-black text-slate-600 text-sm">
                          ?
                        </div>
                      )}
                    </div>

                    {/* Name Label */}
                    <span className={`text-[11px] font-bold truncate w-full text-center ${
                      isCaught ? 'text-slate-200' : isSeen ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {isCaught || isSeen ? item.name : '???'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="py-4 text-center">
                <button
                  onClick={() => setDisplayLimit(curr => curr + 60)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all shadow-md active:scale-95"
                >
                  Carica altri Pokémon ({filteredPokemon.length - displayLimit} rimanenti)
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* DETAIL MODAL */}
      {selectedPokemonId !== null && (
        <PokedexDetailModal
          pokemonId={selectedPokemonId}
          status={pokedex[selectedPokemonId]}
          onClose={() => setSelectedPokemonId(null)}
          onSelectPokemon={(id) => setSelectedPokemonId(id)}
        />
      )}

      {/* TYPE CALCULATOR MODAL */}
      {showTypeCalculator && (
        <PokedexTypeCalculatorModal
          onClose={() => setShowTypeCalculator(false)}
        />
      )}

      {/* PROGRESS MODAL */}
      {showProgressModal && (
        <PokedexProgressModal
          onClose={() => setShowProgressModal(false)}
          onSelectGeneration={(genId) => {
            setSelectedGen(genId);
          }}
        />
      )}

    </div>
  );
};
