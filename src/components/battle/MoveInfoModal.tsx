import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Move, TYPE_COLORS } from '../../types/game';
import { Sparkles, Swords, Activity, Zap, ShieldAlert } from 'lucide-react';
import { getEffectiveness } from '../../lib/battle/typeChart';

interface MoveInfoModalProps {
  move: Move | null;
  onClose: () => void;
  enemyTypes?: string[];
}

export function getCategoryMeta(category?: 'physical' | 'special' | 'status', type?: string, power?: number) {
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

export const MoveInfoModal: React.FC<MoveInfoModalProps> = ({ move, onClose, enemyTypes }) => {
  if (!move) return null;

  const cat = getCategoryMeta(move.category, move.type, move.power);

  return (
    <AnimatePresence>
      {move && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
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
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-sm ${TYPE_COLORS[move.type.toLowerCase()] || 'bg-slate-600'}`}>
                    {move.type}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-sm ${cat.color}`}>
                    {cat.badge}
                  </span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-1">
                  {move.name}
                </h3>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-black uppercase text-slate-400 block">PP</span>
                <span className="text-base font-mono font-black text-slate-800">
                  {move.pp ?? move.maxPp ?? 35} / {move.maxPp ?? move.pp ?? 35}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block">Potenza</span>
                <span className="text-sm font-black text-slate-800 font-mono">
                  {move.category === 'status' || !move.power || move.power === 0 ? '—' : move.power}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block">Precisione</span>
                <span className="text-sm font-black text-slate-800 font-mono">
                  {move.accuracy ? `${move.accuracy}%` : '—'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block">Priorità</span>
                <span className="text-sm font-black text-slate-800 font-mono">
                  {move.priority ? `+${move.priority}` : 'Normale (0)'}
                </span>
              </div>
            </div>

            {/* Category Explanation */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-start gap-2">
              <span className="text-lg shrink-0 mt-0.5">{cat.icon === Swords ? '💥' : cat.icon === Sparkles ? '✨' : '☯️'}</span>
              <p className="text-[11px] text-slate-600 font-medium leading-snug">
                <strong className="text-slate-900 font-bold uppercase">{cat.label}:</strong> {cat.desc}
              </p>
            </div>

            {/* Type Effectiveness against opponent */}
            {enemyTypes && enemyTypes.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">
                  Efficacia contro avversario ({enemyTypes.join('/')}):
                </span>
                {(() => {
                  const info = getEffectivenessInfo(move, enemyTypes);
                  return (
                    <p className={`text-xs ${info.color}`}>
                      {info.text}
                    </p>
                  );
                })()}
              </div>
            )}

            {/* Move Description */}
            {move.description && (
              <div className="text-xs text-slate-600 italic bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl">
                "{move.description}"
              </div>
            )}

            {/* Specific secondary effects */}
            <div className="space-y-1 text-[11px] font-semibold text-slate-700">
              {move.statusEffect && (
                <div className="flex items-center gap-1.5 text-purple-700">
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Può infliggere <strong>{
                      move.statusEffect === 'poisoned' ? 'Avvelenamento' :
                      move.statusEffect === 'paralyzed' ? 'Paralisi' :
                      move.statusEffect === 'burned' ? 'Scottatura' :
                      move.statusEffect === 'sleep' ? 'Sonno' : 'Congelamento'
                    }</strong>{move.effectChance ? ` (${move.effectChance}%)` : ''}
                  </span>
                </div>
              )}
              {move.flinchChance && (
                <div className="flex items-center gap-1.5 text-blue-700">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Può far tentennare il nemico ({move.flinchChance}%)</span>
                </div>
              )}
              {move.drain && (
                <div className="text-emerald-700">
                  🌿 Ripristina il {Math.round(move.drain * 100)}% del danno inflitto come PS
                </div>
              )}
              {move.healing && (
                <div className="text-emerald-700">
                  💚 Cura il {Math.round(move.healing * 100)}% dei PS massimi dell'utilizzatore
                </div>
              )}
              {move.recoil && (
                <div className="text-red-600">
                  ⚠️ Subisce il {Math.round(move.recoil * 100)}% del danno come contraccolpo
                </div>
              )}
            </div>

            {/* Close button footer */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-black uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer"
              >
                Chiudi Scheda
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
