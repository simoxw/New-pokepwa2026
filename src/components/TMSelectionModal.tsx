import React, { useState, useEffect } from 'react';
import { Pokemon, Move, TYPE_TRANSLATIONS, TYPE_COLORS } from '../types/game';
import { fetchAllSpeciesMoves, fetchMoveData } from '../lib/pokeapi';
import { getItalianMoveName, getMoveByName } from '../data/movesData';
import { Search, Disc, X, Loader2, Sparkles, Check } from 'lucide-react';

interface TMSelectionModalProps {
  pokemon: Pokemon;
  onClose: () => void;
  onSelectMove: (move: Move) => void;
}

export const TMSelectionModal: React.FC<TMSelectionModalProps> = ({
  pokemon,
  onClose,
  onSelectMove,
}) => {
  const [loading, setLoading] = useState(true);
  const [fetchingMove, setFetchingMove] = useState<string | null>(null);
  const [moves, setMoves] = useState<{ name: string; url: string; displayName?: string; moveDetails?: Move }[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadMoves() {
      setLoading(true);
      const rawMoves = await fetchAllSpeciesMoves(pokemon.id);
      if (!isMounted) return;

      // Translate move names to Italian and extract details for type badges
      const formatted = rawMoves.map(m => {
        const italianName = getItalianMoveName(m.name);
        const details = getMoveByName(m.name);
        return {
          ...m,
          displayName: italianName,
          moveDetails: details
        };
      });

      setMoves(formatted);
      setLoading(false);

      // Async background enrichment: Fetch official PokéAPI Italian names and types for all moves
      const enrichBatch = async () => {
        const BATCH_SIZE = 6;
        for (let i = 0; i < rawMoves.length; i += BATCH_SIZE) {
          if (!isMounted) break;
          const chunk = rawMoves.slice(i, i + BATCH_SIZE);
          const results = await Promise.all(
            chunk.map(async (m) => {
              try {
                const moveDetails = await fetchMoveData(m.url || m.name);
                return { name: m.name, displayName: moveDetails.name, moveDetails };
              } catch {
                return null;
              }
            })
          );

          if (!isMounted) break;
          setMoves((prevMoves) => {
            const nextMoves = [...prevMoves];
            results.forEach((res) => {
              if (res) {
                const index = nextMoves.findIndex((item) => item.name === res.name);
                if (index !== -1) {
                  nextMoves[index] = {
                    ...nextMoves[index],
                    displayName: res.displayName,
                    moveDetails: res.moveDetails,
                  };
                }
              }
            });
            return nextMoves;
          });
        }
      };

      enrichBatch();
    }
    loadMoves();
    return () => { isMounted = false; };
  }, [pokemon.id]);

  const filteredMoves = moves.filter(m => {
    const q = search.toLowerCase();
    const moveType = (m.moveDetails?.type || 'normal').toLowerCase();
    const typeLabel = (TYPE_TRANSLATIONS[moveType] || moveType).toLowerCase();
    return (
      (m.displayName || m.name).toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      typeLabel.includes(q)
    );
  });

  const handleChooseMove = async (moveInfo: { name: string; url: string }) => {
    try {
      setFetchingMove(moveInfo.name);
      const fullMove = await fetchMoveData(moveInfo.url || moveInfo.name);
      onSelectMove(fullMove);
    } catch (e) {
      console.error("Failed to load move details", e);
      alert("Errore nel caricamento della mossa. Riprova!");
    } finally {
      setFetchingMove(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-4 border-purple-500 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner">
              <Disc className="w-7 h-7 text-yellow-300 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight uppercase italic flex items-center gap-2">
                <span>MT Universale</span>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </h3>
              <p className="text-xs font-semibold text-purple-200 flex items-center gap-1.5 flex-wrap">
                Insegna una mossa a <span className="text-white font-bold">{pokemon.nickname || pokemon.name}</span>
                <span className="flex gap-1 flex-wrap">
                  {pokemon.types.map(t => {
                    const typeLower = t.toLowerCase();
                    const colorClass = TYPE_COLORS[typeLower] || 'bg-slate-500';
                    const typeLabel = TYPE_TRANSLATIONS[typeLower] || typeLower.toUpperCase();
                    return (
                      <span key={t} className={`${colorClass} text-[9px] font-bold text-white px-2 py-0.5 rounded-full shadow-sm uppercase tracking-tight border border-white/20`}>
                        {typeLabel}
                      </span>
                    );
                  })}
                </span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Cerca mossa per nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="text-xs font-black text-gray-500 bg-white px-3 py-2 rounded-xl border">
            {filteredMoves.length} mosse
          </div>
        </div>

        {/* Moves List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-purple-600 gap-3">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-bold text-sm text-gray-600">Caricamento parco mosse da PokéAPI...</p>
            </div>
          ) : filteredMoves.length === 0 ? (
            <div className="py-12 text-center text-gray-400 font-bold text-sm">
              Nessuna mossa trovata.
            </div>
          ) : (
            filteredMoves.map((m) => {
              const alreadyLearned = pokemon.moves.some(
                existing => existing.name.toLowerCase() === (m.displayName || m.name).toLowerCase() ||
                            existing.name.toLowerCase() === m.name.toLowerCase()
              );
              const isSelected = fetchingMove === m.name;

              const moveType = (m.moveDetails?.type || 'normal').toLowerCase();
              const typeColorClass = TYPE_COLORS[moveType] || 'bg-slate-500';
              const typeLabel = TYPE_TRANSLATIONS[moveType] || moveType.toUpperCase();

              return (
                <div 
                  key={m.name}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-2 transition-all ${
                    alreadyLearned 
                      ? 'bg-gray-100 border-gray-200 opacity-60' 
                      : 'bg-white border-gray-200 hover:border-purple-400 hover:shadow-md cursor-pointer'
                  }`}
                  onClick={() => !alreadyLearned && !isSelected && handleChooseMove(m)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center uppercase shrink-0 shadow-xs">
                      MT
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Move Name & Type Badge */}
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-black text-sm text-gray-800 capitalize leading-tight">
                          {m.displayName || m.name}
                        </span>
                        <span className={`${typeColorClass} text-[9px] font-black text-white px-2 py-0.5 rounded-md shadow-2xs uppercase tracking-wider`}>
                          {typeLabel}
                        </span>
                      </div>

                      {/* Move Stats & Already Learned indicator */}
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold flex-wrap">
                        {m.moveDetails?.power ? (
                          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200/80">
                            Pot. {m.moveDetails.power}
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200/80">
                            Stato
                          </span>
                        )}
                        {m.moveDetails?.pp && (
                          <span className="text-gray-400">
                            PP {m.moveDetails.pp}
                          </span>
                        )}
                        {alreadyLearned && (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5 ml-1">
                            <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
                            Già conosciuta
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!alreadyLearned && (
                    <button 
                      disabled={isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChooseMove(m);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md active:scale-95 transition-transform flex items-center gap-1"
                    >
                      {isSelected ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Imparo...</span>
                        </>
                      ) : (
                        <span>Insegna</span>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 font-black text-xs text-gray-700 rounded-xl transition-colors"
          >
            Annulla
          </button>
        </div>

      </div>
    </div>
  );
};
