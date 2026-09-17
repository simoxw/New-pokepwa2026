import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Move, TYPE_COLORS } from '../../types/game';
import { getEffectiveness } from '../../lib/battle/typeChart';
import { STRUGGLE_MOVE } from '../../lib/pokeapi';
import { Sparkles, Swords, Activity, Zap, ShieldAlert } from 'lucide-react';

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

function getCategoryMeta(category?: 'physical' | 'special' | 'status', type?: string, power?: number) {
  let cat = category;
  if (!cat) {
    if (!power || power === 0) cat = 'status';
    else {
      const physicalTypes = ['normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel'];
      cat = physicalTypes.includes((type || '').toLowerCase()) ? 'physical' : 'special';
    }
  }

  switch (cat) {
    case 'physical':
      return {
        label: 'Fisica',
        icon: Swords,
        color: 'bg-orange-500 text-white',
        border: 'border-orange-600',
        badge: '💥 FISICA',
        desc: 'Calcolata sull\'Attacco di chi attacca e la Difesa del bersaglio.'
      };
    case 'special':
      return {
        label: 'Speciale',
        icon: Sparkles,
        color: 'bg-indigo-500 text-white',
        border: 'border-indigo-600',
        badge: '✨ SPECIALE',
        desc: 'Calcolata sull\'Attacco Speciale di chi attacca e la Difesa Speciale del bersaglio.'
      };
    case 'status':
    default:
      return {
        label: 'Stato',
        icon: Activity,
        color: 'bg-slate-500 text-white',
        border: 'border-slate-600',
        badge: '☯️ STATO',
        desc: 'Non infligge danno diretto. Altera statistiche, infligge problemi di stato o attiva effetti speciali.'
      };
  }
}

function getEffectivenessInfo(move: Move, enemyTypes?: string[]) {
  if (move.category === 'status' || !move.power || move.power === 0) {
    return { text: 'Mossa di stato (nessun calcolo moltiplicatore)', color: 'text-slate-500', badge: null };
  }
  if (!enemyTypes || enemyTypes.length === 0) {
    return { text: 'Efficacia standard', color: 'text-slate-600', badge: null };
  }
  
  const effectiveness = getEffectiveness(move.type, enemyTypes);
  if (effectiveness >= 4) {
    return {
      text: 'Super efficace (4x)! Danno quadruplicato',
      color: 'text-emerald-700 font-black',
      badge: 'Super efficace (4x)'
    };
  }
  if (effectiveness > 1) {
    return {
      text: `Super efficace (${effectiveness}x)! Danno raddoppiato`,
      color: 'text-emerald-600 font-black',
      badge: 'Super efficace'
    };
  }
  if (effectiveness === 0) {
    return {
      text: 'Nessun effetto (0x)! Il nemico è immune a questa mossa',
      color: 'text-purple-700 font-black',
      badge: 'Nessun effetto'
    };
  }
  if (effectiveness < 1 && effectiveness > 0) {
    return {
      text: `Poco efficace (${effectiveness}x)! Danno ridotto`,
      color: 'text-amber-600 font-bold',
      badge: 'Poco efficace'
    };
  }
  return {
    text: 'Efficacia normale (1x)',
    color: 'text-slate-700',
    badge: null
  };
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
  const [inspectingMove, setInspectingMove] = useState<Move | null>(null);
  const [holdingMoveName, setHoldingMoveName] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActiveRef = useRef<boolean>(false);
  const pressStartTimeRef = useRef<number>(0);

  // Check if all moves have 0 PP
  const allPpDepleted = moves.length > 0 && moves.every(m => typeof m.pp === 'number' ? m.pp <= 0 : false);

  const startPress = (move: Move, isMoveDisabled: boolean) => {
    if (isMoveDisabled) return;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    isLongPressActiveRef.current = false;
    pressStartTimeRef.current = Date.now();
    setHoldingMoveName(move.name);

    // 600ms long-press threshold
    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      setInspectingMove(move);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(35); } catch { /* ignore */ }
      }
    }, 600);
  };

  const endPress = (move: Move, isMoveDisabled: boolean) => {
    if (isMoveDisabled) return;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setHoldingMoveName(null);

    // If long-press was triggered, KEEP the inspect sheet open
    if (isLongPressActiveRef.current) {
      isLongPressActiveRef.current = false;
      return;
    }

    // Released before 600ms -> standard quick tap to execute move
    const elapsed = Date.now() - pressStartTimeRef.current;
    if (elapsed < 600) {
      onMove(move);
    }
  };

  const cancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setHoldingMoveName(null);
    isLongPressActiveRef.current = false;
  };

  const renderEffectivenessBadge = (move: Move) => {
    const info = getEffectivenessInfo(move, enemyTypes);
    if (!info.badge) return null;

    if (info.badge.includes('Super')) {
      return (
        <span className="bg-emerald-500 text-[8px] px-1.5 rounded-full text-white mt-0.5 border border-white/30 animate-pulse font-bold">
          {info.badge}
        </span>
      );
    }
    if (info.badge.includes('Poco')) {
      return (
        <span className="bg-amber-500 text-[8px] px-1.5 rounded-full text-white mt-0.5 border border-white/30 font-bold">
          Poco efficace
        </span>
      );
    }
    if (info.badge.includes('Nessun')) {
      return (
        <span className="bg-purple-700 text-[8px] px-1.5 rounded-full text-white mt-0.5 border border-white/30 font-bold">
          Nessun effetto
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex-shrink-0 bg-white rounded-3xl p-3 shadow-2xl flex flex-col gap-2 mt-2 relative select-none">
      {/* Detailed Move Inspection Overlay (Triggered by 600ms hold) */}
      <AnimatePresence>
        {inspectingMove && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            onClick={() => setInspectingMove(null)}
            className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-slate-900 w-full max-w-sm rounded-[2rem] p-5 shadow-2xl border-4 border-slate-200 pointer-events-auto space-y-3.5 cursor-default relative"
            >
              {/* Header with Type & Category */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-sm ${TYPE_COLORS[inspectingMove.type.toLowerCase()] || 'bg-slate-600'}`}>
                      {inspectingMove.type}
                    </span>
                    {(() => {
                      const cat = getCategoryMeta(inspectingMove.category, inspectingMove.type, inspectingMove.power);
                      return (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-sm ${cat.color}`}>
                          {cat.badge}
                        </span>
                      );
                    })()}
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-1">
                    {inspectingMove.name}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">PP</span>
                  <span className="text-base font-mono font-black text-slate-800">
                    {inspectingMove.pp ?? inspectingMove.maxPp ?? 35} / {inspectingMove.maxPp ?? inspectingMove.pp ?? 35}
                  </span>
                </div>
              </div>

              {/* Stats Grid: Potenza, Precisione, Priorità */}
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Potenza</span>
                  <span className="text-sm font-black text-slate-800 font-mono">
                    {inspectingMove.category === 'status' || !inspectingMove.power || inspectingMove.power === 0 
                      ? '—' 
                      : inspectingMove.power}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Precisione</span>
                  <span className="text-sm font-black text-slate-800 font-mono">
                    {inspectingMove.accuracy ? `${inspectingMove.accuracy}%` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Priorità</span>
                  <span className="text-sm font-black text-slate-800 font-mono">
                    {inspectingMove.priority ? `+${inspectingMove.priority}` : 'Normale (0)'}
                  </span>
                </div>
              </div>

              {/* Category Explanation */}
              {(() => {
                const cat = getCategoryMeta(inspectingMove.category, inspectingMove.type, inspectingMove.power);
                return (
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-start gap-2">
                    <span className="text-lg shrink-0 mt-0.5">{cat.icon === Swords ? '💥' : cat.icon === Sparkles ? '✨' : '☯️'}</span>
                    <p className="text-[11px] text-slate-600 font-medium leading-snug">
                      <strong className="text-slate-900 font-bold uppercase">{cat.label}:</strong> {cat.desc}
                    </p>
                  </div>
                );
              })()}

              {/* Type Effectiveness against opponent */}
              {enemyTypes && enemyTypes.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">
                    Efficacia contro avversario ({enemyTypes.join('/')}):
                  </span>
                  {(() => {
                    const info = getEffectivenessInfo(inspectingMove, enemyTypes);
                    return (
                      <p className={`text-xs ${info.color}`}>
                        {info.text}
                      </p>
                    );
                  })()}
                </div>
              )}

              {/* Move Description or Additional Effects */}
              {inspectingMove.description && (
                <div className="text-xs text-slate-600 italic bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl">
                  "{inspectingMove.description}"
                </div>
              )}

              {/* Specific secondary effects */}
              <div className="space-y-1 text-[11px] font-semibold text-slate-700">
                {inspectingMove.statusEffect && (
                  <div className="flex items-center gap-1.5 text-purple-700">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Può infliggere <strong>{
                        inspectingMove.statusEffect === 'poisoned' ? 'Avvelenamento' :
                        inspectingMove.statusEffect === 'paralyzed' ? 'Paralisi' :
                        inspectingMove.statusEffect === 'burned' ? 'Scottatura' :
                        inspectingMove.statusEffect === 'sleep' ? 'Sonno' : 'Congelamento'
                      }</strong>{inspectingMove.effectChance ? ` (${inspectingMove.effectChance}%)` : ''}
                    </span>
                  </div>
                )}
                {inspectingMove.flinchChance && (
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Può far tentennare il nemico ({inspectingMove.flinchChance}%)</span>
                  </div>
                )}
                {inspectingMove.drain && (
                  <div className="text-emerald-700">
                    🌿 Ripristina il {Math.round(inspectingMove.drain * 100)}% del danno inflitto come PS
                  </div>
                )}
                {inspectingMove.healing && (
                  <div className="text-emerald-700">
                    💚 Cura il {Math.round(inspectingMove.healing * 100)}% dei PS massimi dell'utilizzatore
                  </div>
                )}
                {inspectingMove.recoil && (
                  <div className="text-red-600">
                    ⚠️ Subisce il {Math.round(inspectingMove.recoil * 100)}% del danno come contraccolpo
                  </div>
                )}
              </div>

              {/* Close button footer */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInspectingMove(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-black uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer"
                >
                  Chiudi Scheda
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                onMouseDown={() => startPress(move, isMoveDisabled)}
                onMouseUp={() => endPress(move, isMoveDisabled)}
                onMouseLeave={cancelPress}
                onTouchStart={() => startPress(move, isMoveDisabled)}
                onTouchEnd={() => endPress(move, isMoveDisabled)}
                onTouchCancel={cancelPress}
                onContextMenu={(e) => e.preventDefault()}
                style={{ touchAction: 'manipulation' }}
                className={`relative overflow-hidden rounded-xl active:scale-95 disabled:opacity-40 transition-all border-b-4 border-black/20 active:border-b-0 text-white shadow-sm flex flex-col items-center justify-center py-1.5 px-1 cursor-pointer select-none ${
                  isOutOfPp 
                    ? 'bg-slate-600 border-slate-700 cursor-not-allowed' 
                    : (TYPE_COLORS[move.type.toLowerCase()] || 'bg-gray-400')
                }`}
              >
                {/* Visual hold charging indicator */}
                {holdingMoveName === move.name && !isMoveDisabled && (
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.6, ease: 'linear' }}
                    className="absolute bottom-0 left-0 h-1 bg-white/75 pointer-events-none"
                  />
                )}

                <div className="flex items-center justify-between w-full px-2">
                  {/* Dedicated smaller font size for move name only */}
                  <span className="text-[11px] sm:text-xs font-bold leading-tight truncate text-left">
                    {move.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[9px] font-black px-1 rounded ${isOutOfPp ? 'bg-red-800/80 text-red-200' : 'bg-black/30 text-white'}`}>
                      {currentPp}/{maxPp}
                    </span>
                  </div>
                </div>

                <span className="text-[8px] sm:text-[9px] opacity-95 uppercase font-black tracking-tight mt-0.5">
                  {move.type} | {move.category === 'status' || !move.power ? 'STAT' : `P:${move.power}`} A:{move.accuracy}%
                  {move.priority ? ` [Prio +${move.priority}]` : ''}
                </span>

                {renderEffectivenessBadge(move)}
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
