import React from 'react';
import { Move, TYPE_COLORS } from '../../types/game';
import { getEffectiveness } from '../../lib/battle/typeChart';

interface BattleControlsProps {
  moves: Move[];
  onMove: (move: Move) => void;
  onBag: () => void;
  onEscape: () => void;
  onSwitch: () => void;
  disabled?: boolean;
  enemyTypes?: string[];
}

export const BattleControls: React.FC<BattleControlsProps> = ({ moves, onMove, onBag, onEscape, onSwitch, disabled, enemyTypes }) => {
  const renderEffectiveness = (move: Move) => {
    if (!enemyTypes || enemyTypes.length === 0) return null;
    
    const effectiveness = getEffectiveness(move.type, enemyTypes);
    
    if (effectiveness > 1) {
      return (
        <span className="bg-emerald-500 text-[8px] px-1.5 rounded-full text-white mt-1 border border-white/30 animate-pulse">
          Super efficace
        </span>
      );
    }
    if (effectiveness < 1 && effectiveness > 0) {
      return (
        <span className="bg-yellow-600 text-[8px] px-1.5 rounded-full text-white mt-1 border border-white/30">
          Poco efficace
        </span>
      );
    }
    if (effectiveness === 0) {
      return (
        <span className="bg-gray-800 text-[8px] px-1.5 rounded-full text-white mt-1 border border-white/30">
          Nessun effetto
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex-shrink-0 bg-white rounded-3xl p-3 shadow-2xl flex flex-col gap-2 mt-2">
      <div className="grid grid-cols-2 gap-2">
        {moves.map((move, index) => (
          <button
            key={`${move.name}-${index}`}
            disabled={disabled}
            onClick={() => onMove(move)}
            className={`rounded-xl font-bold text-sm uppercase active:scale-95 disabled:opacity-50 transition-all border-b-4 border-black/20 active:border-b-0 text-white shadow-sm flex flex-col items-center justify-center py-1.5 px-1 ${TYPE_COLORS[move.type.toLowerCase()] || 'bg-gray-400'}`}
          >
            <span className="leading-tight text-center">{move.name}</span>
            <span className="text-[8px] sm:text-[9px] opacity-100 uppercase font-black tracking-tight mt-0.5">
              {move.type} | P:{move.power} A:{move.accuracy}%
            </span>
            {renderEffectiveness(move)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 shrink-0 pt-1">
        <button 
          disabled={disabled}
          onClick={onSwitch}
          className="flex-1 bg-blue-500 text-white rounded-xl py-2 font-black uppercase text-xs sm:text-sm border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all"
        >
          Cambia
        </button>
        <button 
          disabled={disabled}
          onClick={onBag}
          className="flex-1 bg-yellow-400 rounded-xl py-2 font-black uppercase text-xs sm:text-sm border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all"
        >
          Borsa
        </button>
        <button 
          disabled={disabled}
          onClick={onEscape}
          className="flex-1 bg-gray-200 rounded-xl py-2 font-black uppercase text-xs sm:text-sm border-b-4 border-gray-400 active:border-b-0 active:translate-y-1 transition-all"
        >
          Fuga
        </button>
      </div>
    </div>
  );
};
