import React from 'react';
import { Move, TYPE_COLORS } from '../../types/game';
import { getEffectiveness } from '../../lib/battle/typeChart';
import { STRUGGLE_MOVE } from '../../lib/pokeapi';

interface BattleControlsProps {
  moves: Move[];
  onMove: (move: Move) => void;
  onBag: () => void;
  onEscape: () => void;
  onSwitch: () => void;
  disabled?: boolean;
  enemyTypes?: string[];
  encryptedMoveIndex?: number | null;
  onEncryptedMoveClick?: () => void;
}

export const BattleControls: React.FC<BattleControlsProps> = ({ 
  moves, 
  onMove, 
  onBag, 
  onEscape, 
  onSwitch, 
  disabled, 
  enemyTypes,
  encryptedMoveIndex,
  onEncryptedMoveClick
}) => {
  // Check if all moves have 0 PP
  const allPpDepleted = moves.length > 0 && moves.every(m => typeof m.pp === 'number' ? m.pp <= 0 : false);

  const renderEffectiveness = (move: Move) => {
    if (move.category === 'status' || !move.power || move.power === 0) return null;
    if (!enemyTypes || enemyTypes.length === 0) return null;
    
    const effectiveness = getEffectiveness(move.type, enemyTypes);
    
    if (effectiveness > 1) {
      return (
        <span className="bg-emerald-500 text-[8px] px-1.5 rounded-full text-white mt-0.5 border border-white/30 animate-pulse font-bold">
          Super efficace
        </span>
      );
    }
    if (effectiveness < 1 && effectiveness > 0) {
      return (
        <span className="bg-amber-500 text-[8px] px-1.5 rounded-full text-white mt-0.5 border border-white/30 font-bold">
          Poco efficace
        </span>
      );
    }
    if (effectiveness === 0) {
      return (
        <span className="bg-purple-700 text-[8px] px-1.5 rounded-full text-white mt-0.5 border border-white/30 font-bold">
          Nessun effetto
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex-shrink-0 bg-white rounded-3xl p-3 shadow-2xl flex flex-col gap-2 mt-2">
      {allPpDepleted ? (
        <div className="flex flex-col gap-1.5">
          <div className="text-[11px] font-bold text-red-600 text-center uppercase tracking-wide">
            Tutti i PP sono esauriti! Rimane solo Scontro!
          </div>
          <button
            disabled={disabled}
            onClick={() => onMove(STRUGGLE_MOVE)}
            className="w-full rounded-2xl font-black text-sm uppercase active:scale-95 disabled:opacity-50 transition-all border-b-4 border-red-800 active:border-b-0 bg-red-600 text-white shadow-md flex flex-col items-center justify-center py-2.5 px-3"
          >
            <span className="text-base tracking-wide flex items-center gap-1.5">
              ⚠️ {STRUGGLE_MOVE.name} (Struggle)
            </span>
            <span className="text-[10px] font-bold opacity-90 mt-0.5">
              NORMALE | Pot: 50 | Rinculo: 1/4 PS max
            </span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {moves.map((move, index) => {
            const isEncrypted = encryptedMoveIndex === index;
            const currentPp = typeof move.pp === 'number' ? move.pp : (move.maxPp ?? 35);
            const maxPp = move.maxPp ?? 35;
            const isOutOfPp = currentPp <= 0;
            const isMoveDisabled = disabled || (isOutOfPp && !isEncrypted);

            if (isEncrypted) {
              return (
                <button
                  key={`${move.name}-${index}`}
                  disabled={disabled}
                  onClick={onEncryptedMoveClick}
                  className="rounded-xl font-black text-xs uppercase active:scale-95 transition-all border-2 border-red-500 bg-red-950 text-red-300 shadow-sm flex flex-col items-center justify-center py-2 px-1 animate-pulse cursor-pointer"
                  title="Mossa crittografata da Ransomware! Clicca per decrittare!"
                >
                  <div className="flex items-center gap-1">
                    <span>🔒</span>
                    <span className="text-[11px] text-red-200">BLOCCATA (RSA)</span>
                  </div>
                  <span className="text-[8px] text-red-400 font-bold mt-0.5">
                    Clicca per sbloccare
                  </span>
                </button>
              );
            }

            return (
              <button
                key={`${move.name}-${index}`}
                disabled={isMoveDisabled}
                onClick={() => onMove(move)}
                className={`rounded-xl font-bold text-sm uppercase active:scale-95 disabled:opacity-40 transition-all border-b-4 border-black/20 active:border-b-0 text-white shadow-sm flex flex-col items-center justify-center py-1.5 px-1 ${
                  isOutOfPp 
                    ? 'bg-slate-600 border-slate-700 cursor-not-allowed' 
                    : (TYPE_COLORS[move.type.toLowerCase()] || 'bg-gray-400')
                }`}
              >
                <div className="flex items-center justify-between w-full px-2">
                  <span className="leading-tight truncate text-left">{move.name}</span>
                  <span className={`text-[9px] font-black px-1 rounded ${isOutOfPp ? 'bg-red-800/80 text-red-200' : 'bg-black/30 text-white'}`}>
                    {currentPp}/{maxPp}
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] opacity-95 uppercase font-black tracking-tight mt-0.5">
                  {move.type} | {move.category === 'status' || !move.power ? 'STAT' : `P:${move.power}`} A:{move.accuracy}%
                  {move.priority ? ` [Prio +${move.priority}]` : ''}
                </span>
                {renderEffectiveness(move)}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 shrink-0 pt-1">
        <button 
          disabled={disabled}
          onClick={onSwitch}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 font-black uppercase text-xs sm:text-sm border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer disabled:opacity-50"
        >
          Cambia
        </button>
        <button 
          disabled={disabled}
          onClick={onBag}
          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl py-2 font-black uppercase text-xs sm:text-sm border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all cursor-pointer disabled:opacity-50"
        >
          Borsa
        </button>
        <button 
          disabled={disabled}
          onClick={onEscape}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl py-2 font-black uppercase text-xs sm:text-sm border-b-4 border-gray-400 active:border-b-0 active:translate-y-1 transition-all cursor-pointer disabled:opacity-50"
        >
          Fuga
        </button>
      </div>
    </div>
  );
};

