import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Pokemon, Move, TYPE_COLORS } from '../types/game';

interface MoveLearningOverlayProps {
  pokemon: Pokemon;
  newMove: Move;
  onComplete: (updatedPokemon: Pokemon) => void;
  onCancel: () => void;
}

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

  return (
    <div className="fixed inset-0 z-[130] bg-black/90 p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-gray-900 border-4 border-blue-500 rounded-3xl p-5 sm:p-6 shadow-2xl my-auto max-h-[90vh] flex flex-col text-white text-center"
      >
        <div className="flex-shrink-0 mb-3">
          <h2 className="text-xl sm:text-2xl font-black italic uppercase text-blue-400 mb-1">Nuova Mossa!</h2>
          <p className="text-xs sm:text-sm font-bold text-gray-200">
            {pokemon.name} vuole imparare <span className="text-yellow-400 uppercase">{newMove.name}</span>, ma ha già 4 mosse. 
            Scegli una mossa da dimenticare.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1.5 my-2 custom-scrollbar text-left">
          <div className="text-[11px] uppercase font-black text-gray-400 px-1">
            Seleziona la mossa da sostituire:
          </div>

          <div className="space-y-2">
            {pokemon.moves.map((move, i) => (
              <button
                key={`${move.name}-${i}`}
                onClick={() => setSelectedMoveIndex(i)}
                className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedMoveIndex === i 
                    ? 'border-yellow-400 bg-yellow-400/15 scale-[1.01] shadow-md shadow-yellow-500/20' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold uppercase text-xs sm:text-sm text-white">{move.name}</div>
                  <div className={`inline-block px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase mt-1 ${TYPE_COLORS[move.type.toLowerCase()] || 'bg-gray-500'}`}>
                    {move.type}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-300">Pot: {move.power || '-'}</div>
                  <div className="text-xs font-bold text-gray-400">Acc: {move.accuracy ? `${move.accuracy}%` : '-'}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3.5 bg-blue-500/10 rounded-2xl border-2 border-dashed border-blue-500/40 mt-3">
            <div className="text-[11px] uppercase font-black text-blue-400 mb-1">Nuova Mossa in arrivo:</div>
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="font-bold uppercase text-base sm:text-lg text-yellow-400">{newMove.name}</div>
                <div className={`inline-block px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase mt-1 ${TYPE_COLORS[newMove.type.toLowerCase()] || 'bg-gray-500'}`}>
                  {newMove.type}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-white">Pot: {newMove.power || '-'}</div>
                <div className="text-xs sm:text-sm font-bold text-gray-300">Acc: {newMove.accuracy ? `${newMove.accuracy}%` : '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 grid grid-cols-2 gap-3 pt-3 border-t border-white/10 mt-2">
          <button 
            onClick={onCancel}
            className="bg-white/5 hover:bg-white/10 active:scale-95 py-3 sm:py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all cursor-pointer"
          >
            Rinuncia
          </button>
          <button 
            onClick={handleConfirm}
            disabled={selectedMoveIndex === null}
            className={`py-3 sm:py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg transition-all ${
              selectedMoveIndex === null 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 active:scale-95 text-white shadow-blue-500/20 cursor-pointer'
            }`}
          >
            Dimentica!
          </button>
        </div>
      </motion.div>
    </div>
  );
};
