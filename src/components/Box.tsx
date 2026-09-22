import React, { useState, useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { 
  ChevronLeft, Search, X, Sparkles, Zap, Heart, Star,
  ArrowUpDown, SlidersHorizontal, RotateCcw, ShieldAlert,
  CheckSquare, Square, Trash2, Check, AlertTriangle
} from 'lucide-react';
import { Pokemon } from '../types/game';
import { PokemonDetails } from './PokemonDetails';
import { ALL_TYPES, GENERATIONS, getTypeVisual, isRegionalPokemon } from './pokedex/pokedexConstants';
import { playMenuClick, playFaint } from '../lib/sound';

type SortKey = 'recent' | 'level_desc' | 'level_asc' | 'pokedex' | 'name' | 'stats' | 'iv_desc' | 'iv_asc';

export const Box: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, setState } = useGame();
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedGen, setSelectedGen] = useState<number>(0);
  const [onlyFavorite, setOnlyFavorite] = useState<boolean>(false);
  const [onlyShiny, setOnlyShiny] = useState<boolean>(false);
  const [onlyCanEvolve, setOnlyCanEvolve] = useState<boolean>(false);
  const [onlyInjured, setOnlyInjured] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortKey>('recent');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Multi-Select & Mass Release State
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedInstanceKeys, setSelectedInstanceKeys] = useState<Set<string>>(new Set());
  const [showMassReleaseModal, setShowMassReleaseModal] = useState<boolean>(false);
  const [singleReleaseTarget, setSingleReleaseTarget] = useState<Pokemon | null>(null);

  // Selected Pokemon modal
  const [selectedPokemon, setSelectedPokemon] = useState<{ 
    pokemon: Pokemon; 
    source: 'team' | 'box';
  } | null>(null);

  const getPkmnKey = (p: Pokemon, idx?: number) => 
    p.instanceId ? (idx !== undefined ? `${p.instanceId}-${idx}` : p.instanceId) : `${p.id}-${p.caughtAt || ''}-${p.level}-${p.nickname || ''}-${idx !== undefined ? idx : ''}`;

  // Helper to calculate total stats (BST or current stats)
  const calculateTotalStats = (p: Pokemon) => {
    return (p.stats.attack || 0) + 
           (p.stats.defense || 0) + 
           (p.stats.spAtk || 0) + 
           (p.stats.spDef || 0) + 
           (p.stats.speed || 0) + 
           (p.maxHp || 0);
  };

  // Helper to calculate total IVs sum
  const calculateTotalIvs = (p: Pokemon) => {
    return (p.ivs?.hp ?? 0) + 
           (p.ivs?.attack ?? 0) + 
           (p.ivs?.defense ?? 0) + 
           (p.ivs?.spAtk ?? 0) + 
           (p.ivs?.spDef ?? 0) + 
           (p.ivs?.speed ?? 0);
  };

  // Count active filters
  const activeFiltersCount = (search ? 1 : 0) +
    (selectedType ? 1 : 0) +
    (selectedGen > 0 ? 1 : 0) +
    (onlyFavorite ? 1 : 0) +
    (onlyShiny ? 1 : 0) +
    (onlyCanEvolve ? 1 : 0) +
    (onlyInjured ? 1 : 0) +
    (sortBy !== 'recent' ? 1 : 0);

  const resetFilters = () => {
    playMenuClick();
    setSearch('');
    setSelectedType(null);
    setSelectedGen(0);
    setOnlyFavorite(false);
    setOnlyShiny(false);
    setOnlyCanEvolve(false);
    setOnlyInjured(false);
    setSortBy('recent');
  };

  // Filtered & Sorted Box
  const filteredBox = useMemo(() => {
    let result = [...state.player.box];

    // 1. Text Search (name, nickname, or #id)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchNickname = p.nickname?.toLowerCase().includes(q);
        const matchId = p.id.toString() === q || `#${p.id}`.includes(q);
        return matchName || matchNickname || matchId;
      });
    }

    // 2. Type Filter
    if (selectedType) {
      result = result.filter(p => 
        p.types.some(t => t.toLowerCase() === selectedType.toLowerCase())
      );
    }

    // 3. Generation Filter
    if (selectedGen > 0) {
      if (selectedGen === 10) {
        result = result.filter(p => isRegionalPokemon(p.id, p.name));
      } else {
        const genObj = GENERATIONS.find(g => g.id === selectedGen);
        if (genObj) {
          const [start, end] = genObj.range;
          result = result.filter(p => p.id >= start && p.id <= end && !isRegionalPokemon(p.id, p.name));
        }
      }
    }

    // 4. Favorites Only
    if (onlyFavorite) {
      result = result.filter(p => p.isFavorite);
    }

    // 5. Shiny Only
    if (onlyShiny) {
      result = result.filter(p => p.isShiny);
    }

    // 6. Can Evolve
    if (onlyCanEvolve) {
      result = result.filter(p => p.evolutionInfo && p.level >= p.evolutionInfo.level);
    }

    // 7. Injured / Low HP
    if (onlyInjured) {
      result = result.filter(p => p.hp < p.maxHp || p.status);
    }

    // 8. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'level_desc':
          return b.level - a.level;
        case 'level_asc':
          return a.level - b.level;
        case 'pokedex':
          return a.id - b.id;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stats':
          return calculateTotalStats(b) - calculateTotalStats(a);
        case 'iv_desc':
          return calculateTotalIvs(b) - calculateTotalIvs(a);
        case 'iv_asc':
          return calculateTotalIvs(a) - calculateTotalIvs(b);
        case 'recent':
        default:
          return (b.caughtAt || 0) - (a.caughtAt || 0);
      }
    });

    return result;
  }, [state.player.box, search, selectedType, selectedGen, onlyFavorite, onlyShiny, onlyCanEvolve, onlyInjured, sortBy]);

  // Safe Withdraw using unique instanceId
  const withdraw = (target: Pokemon) => {
    if (state.player.team.length >= 6) {
      alert("Squadra piena! Sposta prima qualcuno nel Box.");
      return;
    }
    playMenuClick();
    setState(prev => {
      const boxIdx = prev.player.box.findIndex(p => 
        p.instanceId ? p.instanceId === target.instanceId : p.id === target.id && p.level === target.level && p.caughtAt === target.caughtAt
      );
      if (boxIdx === -1) return prev;
      const pokemon = prev.player.box[boxIdx];
      return {
        ...prev,
        player: {
          ...prev.player,
          box: prev.player.box.filter((_, i) => i !== boxIdx),
          team: [...prev.player.team, pokemon]
        }
      };
    });
    setSelectedPokemon(null);
  };

  // Safe Deposit using unique instanceId
  const deposit = (target: Pokemon) => {
    if (state.player.team.length <= 1) {
      alert("Devi avere almeno un Pokémon in squadra!");
      return;
    }
    playMenuClick();
    setState(prev => {
      const teamIdx = prev.player.team.findIndex(p => 
        p.instanceId ? p.instanceId === target.instanceId : p.id === target.id && p.level === target.level && p.caughtAt === target.caughtAt
      );
      if (teamIdx === -1) return prev;
      const pokemon = prev.player.team[teamIdx];
      return {
        ...prev,
        player: {
          ...prev.player,
          team: prev.player.team.filter((_, i) => i !== teamIdx),
          box: [...prev.player.box, pokemon]
        }
      };
    });
    setSelectedPokemon(null);
  };

  // Toggle selection in multi-select mode
  const toggleSelect = (p: Pokemon) => {
    playMenuClick();
    const key = getPkmnKey(p);
    setSelectedInstanceKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Select all currently filtered pokemon in box
  const selectAllFiltered = () => {
    playMenuClick();
    const next = new Set<string>();
    filteredBox.forEach(p => next.add(getPkmnKey(p)));
    setSelectedInstanceKeys(next);
  };

  // Deselect all
  const deselectAll = () => {
    playMenuClick();
    setSelectedInstanceKeys(new Set());
  };

  // Execute mass release
  const executeMassRelease = () => {
    if (selectedInstanceKeys.size === 0) return;
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        box: prev.player.box.filter(p => !selectedInstanceKeys.has(getPkmnKey(p)))
      }
    }));
    playFaint();
    setSelectedInstanceKeys(new Set());
    setShowMassReleaseModal(false);
    setIsMultiSelectMode(false);
  };

  // Execute single release
  const executeSingleRelease = (target: Pokemon) => {
    const targetKey = getPkmnKey(target);
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        box: prev.player.box.filter(p => getPkmnKey(p) !== targetKey)
      }
    }));
    playFaint();
    setSelectedPokemon(null);
    setSingleReleaseTarget(null);
  };

  // List of selected pokemon objects for preview & safety warnings
  const selectedPokemonList = useMemo(() => {
    return state.player.box.filter(p => selectedInstanceKeys.has(getPkmnKey(p)));
  }, [state.player.box, selectedInstanceKeys]);

  const hasShinyInSelection = useMemo(() => {
    return selectedPokemonList.some(p => p.isShiny);
  }, [selectedPokemonList]);

  const hasHighLevelInSelection = useMemo(() => {
    return selectedPokemonList.some(p => p.level >= 30);
  }, [selectedPokemonList]);

  // Shiny & Favorites counts in box
  const shinyCountInBox = useMemo(() => {
    return state.player.box.filter(p => p.isShiny).length;
  }, [state.player.box]);

  const favoriteCountInBox = useMemo(() => {
    return state.player.box.filter(p => p.isFavorite).length;
  }, [state.player.box]);

  const evolvableCountInBox = useMemo(() => {
    return state.player.box.filter(p => p.evolutionInfo && p.level >= p.evolutionInfo.level).length;
  }, [state.player.box]);

  return (
    <div className="h-full bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden">
      
      {/* TOP BAR */}
      <header className="px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Torna all'Hub"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white uppercase">
                Sistema Memoria
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PC Box
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
              <span>👥 Squadra: <strong className="text-emerald-400">{state.player.team.length}/6</strong></span>
              <span>💻 Box: <strong className="text-indigo-400">{state.player.box.length}</strong></span>
              {shinyCountInBox > 0 && (
                <span className="text-amber-400 font-bold">✨ {shinyCountInBox} Shiny</span>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Multi-Select Toggle */}
          <button
            onClick={() => {
              playMenuClick();
              setIsMultiSelectMode(prev => !prev);
              if (isMultiSelectMode) {
                setSelectedInstanceKeys(new Set());
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isMultiSelectMode
                ? 'bg-amber-600 text-white border-amber-400 shadow-md ring-2 ring-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Attiva / Disattiva selezione multipla"
          >
            {isMultiSelectMode ? <CheckSquare className="w-4 h-4 text-amber-200" /> : <Square className="w-4 h-4" />}
            <span className="hidden sm:inline">Selezione Multipla</span>
          </button>

          {/* Action Toggle Filters */}
          <button
            onClick={() => {
              playMenuClick();
              setShowAdvancedFilters(prev => !prev);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Mostra / Nascondi filtri avanzati"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtri</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-indigo-700 text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* MULTI-SELECT SUB-BAR */}
      {isMultiSelectMode && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-amber-950/40 border-b border-amber-800/40 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllFiltered}
              className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-600/40 font-bold transition-colors text-[11px]"
            >
              Seleziona Visibili ({filteredBox.length})
            </button>
            {selectedInstanceKeys.size > 0 && (
              <button
                onClick={deselectAll}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors text-[11px]"
              >
                Deseleziona
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-black text-xs">
              {selectedInstanceKeys.size} selezionati
            </span>
            {selectedInstanceKeys.size > 0 && (
              <button
                onClick={() => {
                  playMenuClick();
                  setShowMassReleaseModal(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] shadow-sm transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Rilascia</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SEARCH AND QUICK FILTER CONTROLS */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-3.5 py-2.5 space-y-2 shrink-0">
        
        {/* Search Input Row & Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Cerca per nome, soprannome o #ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-medium"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Sort Selector */}
          <div className="relative flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl pl-7 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="recent">🕒 Recenti</option>
              <option value="iv_desc">🌟 IV più alte</option>
              <option value="iv_asc">📉 IV più basse</option>
              <option value="level_desc">⬆️ Livello (Max)</option>
              <option value="level_asc">⬇️ Livello (Min)</option>
              <option value="pokedex">🔢 # Pokédex</option>
              <option value="name">🔤 Nome (A-Z)</option>
              <option value="stats">🛡️ Statistiche Max</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
          </div>
        </div>

        {/* 1-Tap Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {/* All */}
          <button
            onClick={() => {
              setSelectedType(null);
              setOnlyFavorite(false);
              setOnlyShiny(false);
              setOnlyCanEvolve(false);
              setOnlyInjured(false);
              setSelectedGen(0);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              !selectedType && !onlyFavorite && !onlyShiny && !onlyCanEvolve && !onlyInjured && selectedGen === 0
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            Tutti ({state.player.box.length})
          </button>

          {/* Favorite Pill */}
          <button
            onClick={() => setOnlyFavorite(prev => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              onlyFavorite
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black'
                : 'bg-slate-800/80 text-amber-300/90 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorite ? 'fill-slate-950' : 'fill-amber-300'}`} />
            <span>Preferiti</span>
            {favoriteCountInBox > 0 && <span className="text-[10px] opacity-80">({favoriteCountInBox})</span>}
          </button>

          {/* Shiny Pill */}
          <button
            onClick={() => setOnlyShiny(prev => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              onlyShiny
                ? 'bg-amber-500 text-black border-amber-300 shadow-sm font-black'
                : 'bg-slate-800/80 text-amber-300/80 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Shiny</span>
            {shinyCountInBox > 0 && <span className="text-[10px] opacity-80">({shinyCountInBox})</span>}
          </button>

          {/* Evolvable Pill */}
          <button
            onClick={() => setOnlyCanEvolve(prev => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              onlyCanEvolve
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                : 'bg-slate-800/80 text-emerald-400/90 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Pronti a Evolvere</span>
            {evolvableCountInBox > 0 && <span className="text-[10px] opacity-80">({evolvableCountInBox})</span>}
          </button>

          {/* Injured Pill */}
          <button
            onClick={() => setOnlyInjured(prev => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              onlyInjured
                ? 'bg-rose-600 text-white border-rose-400 shadow-sm'
                : 'bg-slate-800/80 text-rose-400/90 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>Feriti / KO</span>
          </button>

          {/* Regionali Pill */}
          <button
            onClick={() => setSelectedGen(prev => (prev === 10 ? 0 : 10))}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              selectedGen === 10
                ? 'bg-teal-600 text-white border-teal-400 shadow-sm'
                : 'bg-slate-800/80 text-teal-300/90 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span>🌴</span>
            <span>Regionali</span>
          </button>
        </div>

        {/* ADVANCED FILTERS PANEL: Element Types & Generations */}
        {showAdvancedFilters && (
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            {/* Elemental Types Filter */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Filtra per Tipo Elementale:
                </span>
                {selectedType && (
                  <button
                    onClick={() => setSelectedType(null)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    Deseleziona tipo
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {ALL_TYPES.map(typeKey => {
                  const visual = getTypeVisual(typeKey);
                  const isSelected = selectedType === typeKey;
                  return (
                    <button
                      key={typeKey}
                      onClick={() => setSelectedType(isSelected ? null : typeKey)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                        isSelected
                          ? `${visual.badge} text-white border-white/60 shadow-md scale-105`
                          : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <span>{visual.icon}</span>
                      <span>{visual.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generations Filter */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Filtra per Generazione / Regione:
                </span>
                {selectedGen > 0 && (
                  <button
                    onClick={() => setSelectedGen(0)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    Tutte le Gen
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {GENERATIONS.map(gen => {
                  const isSelected = selectedGen === gen.id;
                  return (
                    <button
                      key={gen.id}
                      onClick={() => setSelectedGen(gen.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
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
          </div>
        )}

        {/* Active Filters Summary & Reset Button */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400 text-[11px]">
              Trovati <strong className="text-white">{filteredBox.length}</strong> su <strong className="text-slate-300">{state.player.box.length}</strong> Pokémon nel Box
            </span>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-bold transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Azzera filtri</span>
            </button>
          </div>
        )}

      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
        
        {/* TEAM SECTION (Always easily accessible to swap) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <span>In Squadra</span>
              <span className="text-emerald-400">({state.player.team.length}/6)</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">Tocca per depositare nel Box</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {state.player.team.map((pokemon, idx) => (
              <BoxPokemonCard 
                key={`box-team-${pokemon.instanceId || pokemon.id}-${idx}`}
                pokemon={pokemon}
                isTeamMember
                onClick={() => {
                  playMenuClick();
                  setSelectedPokemon({ pokemon, source: 'team' });
                }}
              />
            ))}
            {/* Empty team slots placeholders */}
            {Array.from({ length: Math.max(0, 6 - state.player.team.length) }).map((_, i) => (
              <div 
                key={`empty-team-${i}`}
                className="aspect-square rounded-2xl border-2 border-dashed border-slate-800/70 bg-slate-900/30 flex flex-col items-center justify-center p-2 text-slate-700"
              >
                <span className="text-xl opacity-40">+</span>
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Vuoto</span>
              </div>
            ))}
          </div>
        </div>

        {/* BOX SECTION */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <span>Nel Box</span>
              <span className="text-indigo-400">
                ({filteredBox.length} {filteredBox.length !== state.player.box.length ? `/ ${state.player.box.length}` : ''})
              </span>
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">Tocca per ritirare in Squadra</span>
          </div>

          {filteredBox.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <ShieldAlert className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm font-bold text-slate-300">
                {state.player.box.length === 0 
                  ? "Il tuo Box è vuoto!" 
                  : "Nessun Pokémon corrisponde ai filtri selezionati."}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {state.player.box.length === 0
                  ? "Cattura nuovi Pokémon durante le tue avventure nell'erba alta per archiviarli qui."
                  : "Prova a modificare i termini di ricerca o togliere alcuni filtri attivi."}
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="mt-3 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Reimposta Filtri
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 pb-16">
              {filteredBox.map((pokemon) => {
                const key = getPkmnKey(pokemon);
                const isSelected = selectedInstanceKeys.has(key);
                return (
                  <BoxPokemonCard 
                    key={key}
                    pokemon={pokemon}
                    isMultiSelect={isMultiSelectMode}
                    isSelected={isSelected}
                    onClick={() => {
                      if (isMultiSelectMode) {
                        toggleSelect(pokemon);
                      } else {
                        playMenuClick();
                        setSelectedPokemon({ pokemon, source: 'box' });
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* FLOATING ACTION BAR FOR MULTI-SELECT */}
      {isMultiSelectMode && selectedInstanceKeys.size > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 bg-slate-900/95 border border-slate-700 backdrop-blur-md p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div>
            <span className="text-xs font-black text-white block">
              {selectedInstanceKeys.size} Pokémon selezionati
            </span>
            <span className="text-[10px] text-slate-400">
              Pronti per il rilascio di massa
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playMenuClick();
                setShowMassReleaseModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Rilascia ({selectedInstanceKeys.size})</span>
            </button>
            <button
              onClick={deselectAll}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-colors"
              title="Deseleziona tutti"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MASS RELEASE CONFIRMATION MODAL */}
      {showMassReleaseModal && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase">Conferma Rilascio di Massa</h3>
                <p className="text-xs text-slate-400">Questa operazione non può essere annullata</p>
              </div>
            </div>

            {hasShinyInSelection && (
              <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center gap-2.5 text-amber-300 text-xs font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Attenzione! Hai selezionato almeno un Pokémon Shiny cromatico!</span>
              </div>
            )}

            {hasHighLevelInSelection && (
              <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl flex items-center gap-2.5 text-indigo-300 text-xs font-bold">
                <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Attenzione! Nella selezione sono presenti Pokémon di livello 30 o superiore!</span>
              </div>
            )}

            <div className="max-h-44 overflow-y-auto space-y-1.5 p-2 bg-slate-950 rounded-2xl border border-slate-800">
              <p className="text-[10px] text-slate-500 font-bold uppercase px-1">
                Stai per liberare {selectedPokemonList.length} Pokémon:
              </p>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {selectedPokemonList.map((p, idx) => (
                  <div 
                    key={`mass-${p.instanceId || p.id}-${idx}`} 
                    className="p-1.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center text-center"
                  >
                    <img src={p?.sprites?.front || (p as any)?.spriteUrl} alt={p.name} className="w-10 h-10 object-contain" />
                    <span className="text-[9px] font-bold text-slate-200 truncate w-full">{p.nickname || p.name}</span>
                    <span className="text-[8px] font-mono text-slate-400">L.{p.level}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowMassReleaseModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-black uppercase text-xs transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={executeMassRelease}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Rilascia ({selectedPokemonList.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE RELEASE CONFIRMATION MODAL */}
      {singleReleaseTarget && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <Trash2 className="w-7 h-7 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase">Liberare {singleReleaseTarget.nickname || singleReleaseTarget.name}?</h3>
              <p className="text-xs text-slate-400 mt-1">Dirai addio per sempre a questo Pokémon.</p>
            </div>
            {singleReleaseTarget.isShiny && (
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold">
                ⚠️ Questo Pokémon è Shiny cromatico!
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSingleReleaseTarget(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-black uppercase text-xs transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => executeSingleRelease(singleReleaseTarget)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase text-xs transition-all shadow-md active:scale-95"
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POKEMON DETAILS MODAL (Withdraw / Deposit / Stats / Release) */}
      {selectedPokemon && (
        <PokemonDetails 
          pokemon={selectedPokemon.pokemon}
          onClose={() => setSelectedPokemon(null)}
          onBox={selectedPokemon.source === 'team' ? () => deposit(selectedPokemon.pokemon) : undefined}
          onWithdraw={selectedPokemon.source === 'box' ? () => withdraw(selectedPokemon.pokemon) : undefined}
          onRelease={selectedPokemon.source === 'box' ? () => setSingleReleaseTarget(selectedPokemon.pokemon) : undefined}
        />
      )}

    </div>
  );
};

// SUBCOMPONENT: ENHANCED POKEMON CARD IN BOX / TEAM
interface BoxPokemonCardProps {
  pokemon: Pokemon;
  isTeamMember?: boolean;
  isMultiSelect?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

const BoxPokemonCard: React.FC<BoxPokemonCardProps> = ({ 
  pokemon, isTeamMember, isMultiSelect, isSelected, onClick 
}) => {
  const primaryType = pokemon.types[0]?.toLowerCase() || 'normal';
  const typeVisual = getTypeVisual(primaryType);
  const hpPercent = Math.max(0, Math.min(100, Math.round((pokemon.hp / pokemon.maxHp) * 100)));
  const canEvolve = pokemon.evolutionInfo && pokemon.level >= pokemon.evolutionInfo.level;

  return (
    <button 
      onClick={onClick}
      className={`aspect-square rounded-2xl border p-2 flex flex-col items-center justify-between relative transition-all duration-200 hover:scale-[1.03] active:scale-95 text-left group overflow-hidden ${
        isTeamMember
          ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-emerald-500/40 shadow-sm'
          : isSelected
          ? 'bg-indigo-950/70 border-indigo-400 shadow-md ring-2 ring-indigo-500/60'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 shadow'
      }`}
    >
      {/* Multi-select check indicator */}
      {isMultiSelect && !isTeamMember && (
        <div className={`absolute top-1.5 left-1.5 z-20 w-4 h-4 rounded flex items-center justify-center transition-all ${
          isSelected 
            ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-white' 
            : 'bg-slate-800/90 border border-slate-600 text-transparent'
        }`}>
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      )}
      {/* Top Indicators: Level & Badges */}
      <div className="w-full flex items-center justify-between z-10">
        <span className="text-[10px] font-black text-slate-300 font-mono">
          L.{pokemon.level}
        </span>
        
        <div className="flex items-center gap-1">
          {pokemon.isFavorite && (
            <span className="text-amber-300" title="Preferito!">
              <Star className="w-3 h-3 fill-amber-300" />
            </span>
          )}
          {canEvolve && (
            <span className="text-emerald-400" title="Pronto a Evolversi!">
              <Zap className="w-3 h-3 fill-emerald-400" />
            </span>
          )}
          {pokemon.isShiny && (
            <span className="text-amber-400" title="Pokémon Shiny Cromatico!">
              <Sparkles className="w-3 h-3 fill-amber-400" />
            </span>
          )}
          <span 
            className={`w-2 h-2 rounded-full ${typeVisual.badge}`} 
            title={`Tipo ${typeVisual.label}`} 
          />
        </div>
      </div>

      {/* Centered Sprite */}
      <div className="w-full flex-1 flex items-center justify-center my-0.5 relative">
        <img 
          src={pokemon?.sprites?.front || (pokemon as any)?.spriteUrl} 
          alt={pokemon.name} 
          className="w-full h-full object-contain drop-shadow"
          loading="lazy" 
        />
        {/* Subtle glowing halo for shiny */}
        {pokemon.isShiny && (
          <div className="absolute inset-0 bg-amber-400/10 rounded-full blur-md pointer-events-none" />
        )}
      </div>

      {/* Bottom Info: HP Bar (if hurt) and Name */}
      <div className="w-full z-10">
        {pokemon.hp < pokemon.maxHp && (
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-1">
            <div 
              className={`h-full ${
                hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        )}
        <span className="text-[10px] font-bold text-slate-200 truncate block text-center uppercase tracking-tight">
          {pokemon.nickname || pokemon.name}
        </span>
      </div>
    </button>
  );
};
