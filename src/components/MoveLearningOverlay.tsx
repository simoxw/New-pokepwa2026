import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Pokemon, Move, TYPE_COLORS, TYPE_TRANSLATIONS } from '../types/game';

interface MoveLearningOverlayProps {
  pokemon: Pokemon;
  newMove: Move;
  onComplete: (updatedPokemon: Pokemon) => void;
  onCancel: () => void;
}

// Category helper: Physical (Fisica), Special (Speciale), Status (Stato)
const getCategoryBadge = (category?: string, power?: number) => {
  const cat = (category || (power && power > 0 ? 'physical' : 'status')).toLowerCase();
  if (cat === 'special' || cat === 'speciale') {
    return {
      label: 'Speciale',
      icon: '🔮',
      className: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
    };
  }
  if (cat === 'physical' || cat === 'fisica') {
    return {
      label: 'Fisica',
      icon: '⚔️',
      className: 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
    };
  }
  return {
    label: 'Stato',
    icon: '🛡️',
    className: 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
  };
};

export const MoveLearningOverlay: React.FC<MoveLearningOverlayProps> = ({ pokemon, newMove, onComplete, onCancel }) => {
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedMoveIndex === null) return;
    
    const updatedMoves = [...pokemon.moves];
    updatedMoves[selectedMoveIndex] = newMove;
    
    onComplete({
      ...pokemon,
      moves: updatedMoves
    });
  };

  const newMoveCat = getCategoryBadge(newMove.category, newMove.power);
  const newMoveTypeKey = newMove.type.toLowerCase();
  const newMoveTypeLabel = TYPE_TRANSLATIONS[newMoveTypeKey] || newMove.type.toUpperCase();

  return (
    <div className="fixed inset-0 z-[130] bg-black/90 p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl my-auto max-h-[90vh] flex flex-col text-white text-center"
      >
        <div className="flex-shrink-0 mb-3">
          <div className="inline-block bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-black text-cyan-300 uppercase tracking-wider mb-2">
            Nuova Mossa Appresa!
          </div>
          <h2 className="text-xl sm:text-2xl font-black italic uppercase text-white mb-1">
            {pokemon.nickname || pokemon.name}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-300">
            Vuole imparare <span className="text-yellow-400 uppercase">{newMove.name}</span>, ma ha già 4 mosse. 
            Scegli quale mossa sostituire:
          </p>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1.5 my-2 custom-scrollbar text-left">
          <div className="text-[11px] uppercase font-black text-slate-400 px-1">
            Mosse attuali (tocca per selezionare da dimenticare):
          </div>

          <div className="space-y-2">
            {pokemon.moves.map((move, i) => {
              const isSelected = selectedMoveIndex === i;
              const typeKey = move.type.toLowerCase();
              const typeLabel = TYPE_TRANSLATIONS[typeKey] || move.type.toUpperCase();
              const catBadge = getCategoryBadge(move.category, move.power);

              return (
                <button
                  key={`${move.name}-${i}`}
                  onClick={() => setSelectedMoveIndex(i)}
                  className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-red-400 bg-red-950/40 scale-[1.01] shadow-lg shadow-red-500/20 ring-2 ring-red-400/40' 
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="text-left min-w-0 flex-1 mr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black uppercase text-xs sm:text-sm text-white truncate">
                        {move.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-black uppercase bg-red-500 text-white px-1.5 py-0.2 rounded-md shrink-0 animate-pulse">
                          Sostituisci
                        </span>
                      )}
                    </div>
                    
                    {/* Type Badge & Category Badge (Fisica / Speciale / Stato) */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-white shadow-xs ${TYPE_COLORS[typeKey] || 'bg-slate-600'}`}>
                        {typeLabel}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase flex items-center gap-1 ${catBadge.className}`}>
                        <span>{catBadge.icon}</span>
                        <span>{catBadge.label}</span>
                      </span>
                      {move.pp !== undefined && (
                        <span className="text-[10px] font-bold text-slate-400">
                          PP {move.pp}/{move.maxPp || move.pp}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-slate-200">
                      Pot: <span className="font-mono text-cyan-300">{move.power ? move.power : '-'}</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-400">
                      Acc: <span className="font-mono">{move.accuracy ? `${move.accuracy}%` : '-'}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* New Incoming Move Display */}
          <div className="p-3.5 bg-gradient-to-br from-cyan-950/60 to-blue-950/60 rounded-2xl border-2 border-dashed border-cyan-400/60 mt-3 shadow-lg">
            <div className="text-[10px] uppercase font-black text-cyan-300 mb-1.5 flex items-center justify-between">
              <span>✨ Nuova Mossa in arrivo:</span>
              <span className="text-yellow-400 font-bold">Insegnamento</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-left min-w-0 flex-1 mr-2">
                <div className="font-black uppercase text-base sm:text-lg text-yellow-400 truncate">
                  {newMove.name}
                </div>
                {/* Type & Category Badge for New Move */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase text-white shadow-xs ${TYPE_COLORS[newMoveTypeKey] || 'bg-slate-600'}`}>
                    {newMoveTypeLabel}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 ${newMoveCat.className}`}>
                    <span>{newMoveCat.icon}</span>
                    <span>{newMoveCat.label}</span>
                  </span>
                  {newMove.pp !== undefined && (
                    <span className="text-[10px] font-bold text-cyan-200">
                      PP {newMove.pp}/{newMove.maxPp || newMove.pp}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-black text-white">
                  Pot: <span className="font-mono text-yellow-300">{newMove.power ? newMove.power : '-'}</span>
                </div>
                <div className="text-xs font-bold text-slate-300">
                  Acc: <span className="font-mono">{newMove.accuracy ? `${newMove.accuracy}%` : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 mt-2">
          <button 
            onClick={onCancel}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 py-3 rounded-2xl font-black uppercase tracking-wider text-xs text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
          >
            Rinuncia
          </button>
          <button 
            onClick={handleConfirm}
            disabled={selectedMoveIndex === null}
            className={`py-3 rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg transition-all ${
              selectedMoveIndex === null 
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 active:scale-95 text-white shadow-red-500/30 cursor-pointer'
            }`}
          >
            {selectedMoveIndex === null ? 'Seleziona Mossa' : 'Dimentica e Impara!'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
