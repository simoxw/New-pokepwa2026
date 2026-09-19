import React, { useState, useEffect } from 'react';
import { Pokemon, Move, TYPE_TRANSLATIONS, TYPE_COLORS } from '../types/game';
import { fetchAllSpeciesMoves, fetchMoveData } from '../lib/pokeapi';
import { getItalianMoveName } from '../data/movesData';
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
  const [moves, setMoves] = useState<{ name: string; url: string; displayName?: string }[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadMoves() {
      setLoading(true);
      const rawMoves = await fetchAllSpeciesMoves(pokemon.id);
      if (!isMounted) return;

      // Translate move names to Italian
      const formatted = rawMoves.map(m => {
        const italianName = getItalianMoveName(m.name);
        return {
          ...m,
          displayName: italianName
        };
      });

      setMoves(formatted);
      setLoading(false);
    }
    loadMoves();
    return () => { isMounted = false; };
  }, [pokemon.id]);

  const filteredMoves = moves.filter(m => 
    (m.displayName || m.name).toLowerCase().includes(search.toLowerCase()) ||
    m.name.toLowerCase().includes(search.toLowerCase())
  );

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

              return (
                <div 
                  key={m.name}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                    alreadyLearned 
                      ? 'bg-gray-100 border-gray-200 opacity-60' 
                      : 'bg-white border-gray-200 hover:border-purple-400 hover:shadow-md cursor-pointer'
                  }`}
                  onClick={() => !alreadyLearned && !isSelected && handleChooseMove(m)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center uppercase">
                      MT
                    </div>
                    <div>
                      <div className="font-black text-sm text-gray-800 capitalize">
                        {m.displayName || m.name}
                      </div>
                      {alreadyLearned && (
                        <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500" />
                          Già conosciuta
                        </div>
                      )}
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
