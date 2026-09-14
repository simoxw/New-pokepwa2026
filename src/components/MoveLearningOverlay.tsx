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
    <div className="fixed inset-0 z-[130] bg-black/90 flex flex-col items-center justify-center p-6 text-white text-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-gray-900 border-4 border-blue-500 rounded-3xl p-6 shadow-2xl"
      >
        <h2 className="text-2xl font-black italic uppercase italic text-blue-400 mb-2">Nuova Mossa!</h2>
        <p className="text-sm font-bold mb-6">
          {pokemon.name} vuole imparare <span className="text-yellow-400 uppercase">{newMove.name}</span>, ma ha già 4 mosse. 
          Scegli una mossa da dimenticare.
        </p>

        <div className="space-y-3 mb-8">
          <div className="text-xs uppercase font-black text-gray-500 text-left px-2">Mosse Attuali:</div>
          {pokemon.moves.map((move, i) => (
            <button
              key={`${move.name}-${i}`}
              onClick={() => setSelectedMoveIndex(i)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                selectedMoveIndex === i 
                  ? 'border-yellow-400 bg-yellow-400/10 scale-[1.02]' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-left">
                <div className="font-bold uppercase text-sm">{move.name}</div>
                <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase mt-1 ${TYPE_COLORS[move.type.toLowerCase()] || 'bg-gray-500'}`}>
                  {move.type}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-400">Pot: {move.power}</div>
                <div className="text-xs font-bold text-gray-400">Acc: {move.accuracy}%</div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 bg-blue-500/10 rounded-2xl border-2 border-dashed border-blue-500/30 mb-8">
          <div className="text-xs uppercase font-black text-blue-400 mb-1">Nuova Mossa:</div>
          <div className="flex justify-between items-center">
             <div className="text-left">
                <div className="font-bold uppercase text-lg text-yellow-400">{newMove.name}</div>
                <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase mt-1 ${TYPE_COLORS[newMove.type.toLowerCase()] || 'bg-gray-500'}`}>
                  {newMove.type}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">Pot: {newMove.power}</div>
                <div className="text-sm font-bold">Acc: {newMove.accuracy}%</div>
              </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onCancel}
            className="bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs"
          >
            Rinuncia
          </button>
          <button 
            onClick={handleConfirm}
            disabled={selectedMoveIndex === null}
            className={`py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all ${
              selectedMoveIndex === null 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
            }`}
          >
            Dimentica!
          </button>
        </div>
      </motion.div>
    </div>
  );
};
