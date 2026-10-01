import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Move, TYPE_COLORS } from '../../types/game';
import { Sparkles, Swords, Activity, Zap, ShieldAlert, ArrowUpCircle, ArrowDownCircle, Info, RefreshCw } from 'lucide-react';
import { getEffectiveness } from '../../lib/battle/typeChart';
import { getMoveByName } from '../../data/movesData';

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

const STAT_LABELS: Record<string, string> = {
  'attack': 'Attacco',
  'atk': 'Attacco',
  'attacco': 'Attacco',
  'defense': 'Difesa',
  'def': 'Difesa',
  'difesa': 'Difesa',
  'special-attack': 'Attacco Sp.',
  'special_attack': 'Attacco Sp.',
  'spatk': 'Attacco Sp.',
  'sp-atk': 'Attacco Sp.',
  'spa': 'Attacco Sp.',
  'attacco-speciale': 'Attacco Sp.',
  'special-defense': 'Difesa Sp.',
  'special_defense': 'Difesa Sp.',
  'spdef': 'Difesa Sp.',
  'sp-def': 'Difesa Sp.',
  'spd': 'Difesa Sp.',
  'difesa-speciale': 'Difesa Sp.',
  'speed': 'Velocità',
  'spe': 'Velocità',
  'vel': 'Velocità',
  'velocita': 'Velocità',
  'accuracy': 'Precisione',
  'acc': 'Precisione',
  'precisione': 'Precisione',
  'evasion': 'Elusione',
  'eva': 'Elusione',
  'elusione': 'Elusione'
};

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

function generateDynamicDescription(move: Move): string {
  const parts: string[] = [];

  if (move.category === 'status' || !move.power || move.power === 0) {
    parts.push(`Mossa di stato di tipo ${move.type.toUpperCase()}.`);
  } else {
    parts.push(`Attacco ${move.category === 'special' ? 'speciale' : 'fisico'} di tipo ${move.type.toUpperCase()} con ${move.power} di potenza.`);
  }

  if (move.stat_changes && move.stat_changes.length > 0) {
    const changesText = move.stat_changes.map(sc => {
      const rawStat = (typeof (sc as any).stat === 'string' ? (sc as any).stat : sc.stat?.name || '').toLowerCase();
      const sName = STAT_LABELS[rawStat] || rawStat;
      const isBuff = sc.change > 0;
      const amt = Math.abs(sc.change);
      const levelWord = amt === 1 ? 'di 1 livello' : `di ${amt} livelli`;
      return `${isBuff ? 'aumenta' : 'riduce'} ${sName} ${levelWord}`;
    }).join(' e ');

    const isSelf = move.stat_changes_target === 'user' || move.target === 'user' || (move.category === 'status' && move.stat_changes.some(sc => sc.change > 0));
    const targetText = isSelf ? "dell'utilizzatore" : "del bersaglio";
    const chanceText = move.effectChance && move.effectChance < 100 ? ` (${move.effectChance}% probabilità)` : '';
    parts.push(`Effetto secondario: ${changesText} ${targetText}${chanceText}.`);
  }

  if (move.statusEffect) {
    if (move.name.toLowerCase().includes('riposo') || move.name.toLowerCase().includes('rest') || move.target === 'user') {
      parts.push(`L'utilizzatore recupera tutti i PS e cade in un sonno profondo per 2 turni, curando ogni problema di stato.`);
    } else {
      const statusMap: Record<string, string> = {
        poisoned: 'avvelenare',
        'badly-poisoned': 'iperavvelenare',
        paralyzed: 'paralizzare',
        burned: 'scottare',
        sleep: 'addormentare',
        frozen: 'congelare'
      };
      const sVerb = statusMap[move.statusEffect] || 'alterare lo stato di';
      const sChance = move.effectChance ? ` (${move.effectChance}% probabilità)` : '';
      parts.push(`Può ${sVerb} il bersaglio${sChance}.`);
    }
  }

  if (move.drain) {
    parts.push(`Ripristina PS pari al ${Math.round(move.drain * 100)}% del danno inflitto.`);
  }
  if (move.healing) {
    parts.push(`Ripristina il ${Math.round(move.healing * 100)}% dei PS massimi dell'utilizzatore.`);
  }
  if (move.recoil) {
    parts.push(`Infligge un contraccolpo pari al ${Math.round(move.recoil * 100)}% del danno inflitto.`);
  }
  if (move.flinchChance) {
    parts.push(`Ha il ${move.flinchChance}% di probabilità di far tentennare il nemico.`);
  }
  if (move.confusionChance) {
    parts.push(`Ha il ${move.confusionChance}% di probabilità di confondere il bersaglio.`);
  }

  return parts.join(' ');
}

export const MoveInfoModal: React.FC<MoveInfoModalProps> = ({ move: rawMove, onClose, enemyTypes }) => {
  if (!rawMove) return null;

  // Authoritative database resolution
  const dbMove = getMoveByName(rawMove.name || (rawMove as any).title || '');
  const isBaseMoveValid = dbMove.power !== 45 || dbMove.pp !== 35;

  const effectiveCategory = (isBaseMoveValid && dbMove.category)
    ? dbMove.category
    : (rawMove.category || dbMove.category || (rawMove.power || dbMove.power ? 'physical' : 'status'));

  const effectiveType = isBaseMoveValid && dbMove.type
    ? dbMove.type
    : (rawMove.type && typeof rawMove.type === 'string' ? rawMove.type : (dbMove.type || 'normal'));

  const effectivePower = (isBaseMoveValid && typeof dbMove.power === 'number')
    ? dbMove.power
    : (typeof rawMove.power === 'number' && (rawMove.power > 0 || effectiveCategory === 'status')
        ? rawMove.power
        : (typeof dbMove.power === 'number' ? dbMove.power : (effectiveCategory === 'status' ? 0 : 40)));

  const move: Move = {
    ...dbMove,
    ...rawMove,
    name: rawMove.name || dbMove.name,
    category: effectiveCategory,
    type: effectiveType,
    power: effectivePower,
    accuracy: typeof rawMove.accuracy === 'number' ? rawMove.accuracy : (dbMove.accuracy || 100),
    pp: rawMove.pp ?? dbMove.pp,
    maxPp: dbMove.maxPp || rawMove.maxPp,
    priority: dbMove.priority ?? rawMove.priority,
    stat_changes: (dbMove.stat_changes && dbMove.stat_changes.length > 0) ? dbMove.stat_changes : rawMove.stat_changes,
    stat_changes_target: (dbMove as any).stat_changes_target || rawMove.stat_changes_target,
    description: rawMove.description || (dbMove as any).description,
    drain: dbMove.drain !== undefined ? dbMove.drain : rawMove.drain,
    healing: dbMove.healing !== undefined ? dbMove.healing : rawMove.healing,
    recoil: dbMove.recoil !== undefined ? dbMove.recoil : rawMove.recoil,
    statusEffect: dbMove.statusEffect || rawMove.statusEffect,
    effectChance: dbMove.effectChance !== undefined ? dbMove.effectChance : rawMove.effectChance,
    flinchChance: dbMove.flinchChance || rawMove.flinchChance,
    confusionChance: dbMove.confusionChance || rawMove.confusionChance,
    multiTurn: dbMove.multiTurn || rawMove.multiTurn,
  };

  const cat = getCategoryMeta(move.category, move.type, move.power);
  const finalDescription = move.description || generateDynamicDescription(move);

  return (
    <AnimatePresence>
      {rawMove && (
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
            className="bg-white text-slate-900 w-full max-w-md rounded-[2rem] p-5 sm:p-6 shadow-2xl border-4 border-slate-200 pointer-events-auto space-y-4 cursor-default relative max-h-[90vh] overflow-y-auto"
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
            {finalDescription && (
              <div className="text-xs text-slate-700 bg-amber-50/80 border border-amber-200/70 p-3 rounded-xl leading-relaxed">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[10px] uppercase tracking-wider mb-1">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  <span>Descrizione & Effetti:</span>
                </div>
                <p className="italic">"{finalDescription}"</p>
              </div>
            )}

            {/* Specific secondary effects & Stat Changes Section */}
            <div className="space-y-2 text-[11px] font-semibold text-slate-700">
              {/* Stat changes breakdown */}
              {move.stat_changes && move.stat_changes.length > 0 && (
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-200/70 rounded-xl space-y-1.5">
                  <div className="text-[10px] font-black uppercase text-indigo-900 tracking-wider flex items-center justify-between">
                    <span>Modifiche alle Statistiche:</span>
                    <span className="text-[9px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                      {move.effectChance && move.effectChance < 100 ? `${move.effectChance}% probabilità` : '100% garantito'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {move.stat_changes.map((sc, sIdx) => {
                      const rawStat = (typeof (sc as any).stat === 'string' ? (sc as any).stat : sc.stat?.name || '').toLowerCase();
                      const statName = STAT_LABELS[rawStat] || rawStat.toUpperCase();
                      const isBuff = sc.change > 0;
                      const isSelf = sc.target === 'user' || move.stat_changes_target === 'user' || move.target === 'user' || (move.category === 'status' && isBuff);
                      const targetLabel = isSelf ? "All'utilizzatore" : "Al bersaglio";

                      return (
                        <div key={sIdx} className="flex items-center justify-between text-xs bg-white p-1.5 rounded-lg border border-indigo-100">
                          <div className="flex items-center gap-1.5">
                            {isBuff ? (
                              <ArrowUpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <ArrowDownCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <span className="font-bold text-slate-800">{statName}</span>
                            <span className={`font-mono font-black ${isBuff ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {sc.change > 0 ? `+${sc.change}` : `${sc.change}`}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isSelf ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {targetLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status conditions */}
              {move.statusEffect && (
                <div className="flex items-center gap-1.5 text-purple-800 bg-purple-50 p-2 rounded-xl border border-purple-200">
                  <Zap className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>
                    {move.target === 'user' || move.name.toLowerCase().includes('riposo') || move.name.toLowerCase().includes('rest') ? (
                      <>Addormenta l'utilizzatore per 2 turni curando ogni stato alterato</>
                    ) : (
                      <>
                        Infligge <strong>{
                          move.statusEffect === 'poisoned' ? 'Avvelenamento' :
                          move.statusEffect === 'badly-poisoned' ? 'Iperavvelenamento' :
                          move.statusEffect === 'paralyzed' ? 'Paralisi' :
                          move.statusEffect === 'burned' ? 'Scottatura' :
                          move.statusEffect === 'sleep' ? 'Sonno' : 'Congelamento'
                        }</strong>{move.effectChance ? ` (${move.effectChance}% probabilità)` : ''}
                      </>
                    )}
                  </span>
                </div>
              )}

              {/* Flinch */}
              {move.flinchChance && (
                <div className="flex items-center gap-1.5 text-blue-800 bg-blue-50 p-2 rounded-xl border border-blue-200">
                  <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Può far tentennare il nemico se si attacca per primi ({move.flinchChance}%)</span>
                </div>
              )}

              {/* Drain */}
              {move.drain && (
                <div className="text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  🌿 Ripristina il <strong>{Math.round(move.drain * 100)}%</strong> del danno inflitto come PS all'utilizzatore
                </div>
              )}

              {/* Healing */}
              {move.healing && (
                <div className="text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  💚 Ripristina il <strong>{Math.round(move.healing * 100)}%</strong> dei PS massimi dell'utilizzatore
                </div>
              )}

              {/* Recoil */}
              {move.recoil && (
                <div className="text-rose-800 bg-rose-50 p-2 rounded-xl border border-rose-200">
                  ⚠️ L'utilizzatore subisce il <strong>{Math.round(move.recoil * 100)}%</strong> del danno inflitto come contraccolpo
                </div>
              )}

              {/* Multi-turn mechanics */}
              {move.multiTurn && (
                <div className="text-slate-800 bg-slate-100 p-2 rounded-xl border border-slate-200 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>
                    {move.multiTurn.type === 'charge' && `Mossa in due turni: carica l'energia al turno 1 e colpisce al turno 2.`}
                    {move.multiTurn.type === 'recharge' && `Mossa ad alta potenza: richiede 1 turno di ricarica successivo all'attacco.`}
                    {move.multiTurn.type === 'multi-hit' && `Colpisce a raffica da ${move.multiTurn.minHits || 2} a ${move.multiTurn.maxHits || 5} volte nello stesso turno.`}
                  </span>
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
