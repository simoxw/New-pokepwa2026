import React, { useState } from 'react';
import { ALL_TYPES, getTypeVisual } from './pokedexConstants';
import { TYPE_CHART, getEffectiveness } from '../../lib/battle/typeChart';
import { X, Swords, Shield, Info } from 'lucide-react';

interface PokedexTypeCalculatorModalProps {
  onClose: () => void;
}

export const PokedexTypeCalculatorModal: React.FC<PokedexTypeCalculatorModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'attack' | 'defense'>('defense');
  const [selectedAttackType, setSelectedAttackType] = useState<string>('fire');
  const [defenseType1, setDefenseType1] = useState<string>('water');
  const [defenseType2, setDefenseType2] = useState<string>('ground');

  // Compute attack matchups
  const attackMatchups = React.useMemo(() => {
    const superEffective: string[] = [];
    const notVeryEffective: string[] = [];
    const noEffect: string[] = [];
    const normal: string[] = [];

    const chartRow = TYPE_CHART[selectedAttackType] || {};

    for (const defType of ALL_TYPES) {
      const mult = chartRow[defType] !== undefined ? chartRow[defType] : 1;
      if (mult > 1) superEffective.push(defType);
      else if (mult === 0) noEffect.push(defType);
      else if (mult < 1) notVeryEffective.push(defType);
      else normal.push(defType);
    }

    return { superEffective, notVeryEffective, noEffect, normal };
  }, [selectedAttackType]);

  // Compute defensive multipliers
  const defenseMatchups = React.useMemo(() => {
    const activeDefenseTypes = defenseType2 === 'none' ? [defenseType1] : [defenseType1, defenseType2];

    const quadWeakness: string[] = []; // 4x
    const doubleWeakness: string[] = []; // 2x
    const normal: string[] = []; // 1x
    const resistance: string[] = []; // 0.5x
    const quadResistance: string[] = []; // 0.25x
    const immune: string[] = []; // 0x

    for (const atkType of ALL_TYPES) {
      const mult = getEffectiveness(atkType, activeDefenseTypes);
      if (mult >= 4) quadWeakness.push(atkType);
      else if (mult > 1) doubleWeakness.push(atkType);
      else if (mult === 0) immune.push(atkType);
      else if (mult <= 0.25) quadResistance.push(atkType);
      else if (mult < 1) resistance.push(atkType);
      else normal.push(atkType);
    }

    return { quadWeakness, doubleWeakness, normal, resistance, quadResistance, immune };
  }, [defenseType1, defenseType2]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧮</span>
            <h3 className="font-bold text-base text-white">Calcolatore Efficacia Tipi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
          <button
            onClick={() => setMode('defense')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'defense'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Difesa (Debolezze & Resistenze)</span>
          </button>
          <button
            onClick={() => setMode('attack')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'attack'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Attacco (Copertura Offensiva)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* DEFENSE MODE */}
          {mode === 'defense' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Seleziona i tipi del Pokémon difensore:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {/* Type 1 */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Tipo Primario</label>
                    <select
                      value={defenseType1}
                      onChange={(e) => setDefenseType1(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                    >
                      {ALL_TYPES.map(t => (
                        <option key={t} value={t}>
                          {getTypeVisual(t).icon} {getTypeVisual(t).label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type 2 */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Tipo Secondario</label>
                    <select
                      value={defenseType2}
                      onChange={(e) => setDefenseType2(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="none">-- Nessuno (Monotipo) --</option>
                      {ALL_TYPES.filter(t => t !== defenseType1).map(t => (
                        <option key={t} value={t}>
                          {getTypeVisual(t).icon} {getTypeVisual(t).label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Visual Representation */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-700/60">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow flex items-center gap-1 ${getTypeVisual(defenseType1).badge}`}>
                    <span>{getTypeVisual(defenseType1).icon}</span>
                    <span>{getTypeVisual(defenseType1).label}</span>
                  </span>
                  {defenseType2 !== 'none' && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow flex items-center gap-1 ${getTypeVisual(defenseType2).badge}`}>
                      <span>{getTypeVisual(defenseType2).icon}</span>
                      <span>{getTypeVisual(defenseType2).label}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Matchups Breakdown */}
              <div className="space-y-3">
                {/* 4x Quad Weakness */}
                {defenseMatchups.quadWeakness.length > 0 && (
                  <div className="bg-rose-950/30 border border-rose-800/60 p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-rose-400 flex items-center gap-1">
                        <span>💥💥 Debolezza Quadrupla (x4 Danni)</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-rose-300">
                        {defenseMatchups.quadWeakness.length} tipi
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {defenseMatchups.quadWeakness.map(t => {
                        const v = getTypeVisual(t);
                        return (
                          <span key={t} className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${v.badge}`}>
                            {v.icon} {v.label} (4x)
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2x Double Weakness */}
                {defenseMatchups.doubleWeakness.length > 0 && (
                  <div className="bg-amber-950/20 border border-amber-800/50 p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-amber-400">
                        💥 Debolezza (x2 Danni)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-300">
                        {defenseMatchups.doubleWeakness.length} tipi
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {defenseMatchups.doubleWeakness.map(t => {
                        const v = getTypeVisual(t);
                        return (
                          <span key={t} className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${v.badge}`}>
                            {v.icon} {v.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 0.5x Resistance */}
                {defenseMatchups.resistance.length > 0 && (
                  <div className="bg-emerald-950/20 border border-emerald-800/50 p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-emerald-400">
                        🛡️ Resistenza (x0.5 Danni)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-300">
                        {defenseMatchups.resistance.length} tipi
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {defenseMatchups.resistance.map(t => {
                        const v = getTypeVisual(t);
                        return (
                          <span key={t} className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${v.badge}`}>
                            {v.icon} {v.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 0.25x Quad Resistance */}
                {defenseMatchups.quadResistance.length > 0 && (
                  <div className="bg-teal-950/30 border border-teal-800/60 p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-teal-400">
                        🛡️🛡️ Doppia Resistenza (x0.25 Danni)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-teal-300">
                        {defenseMatchups.quadResistance.length} tipi
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {defenseMatchups.quadResistance.map(t => {
                        const v = getTypeVisual(t);
                        return (
                          <span key={t} className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${v.badge}`}>
                            {v.icon} {v.label} (0.25x)
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 0x Immunity */}
                {defenseMatchups.immune.length > 0 && (
                  <div className="bg-indigo-950/30 border border-indigo-800/60 p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-indigo-400">
                        🚫 Immunità Totale (x0 Danni)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-indigo-300">
                        {defenseMatchups.immune.length} tipi
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {defenseMatchups.immune.map(t => {
                        const v = getTypeVisual(t);
                        return (
                          <span key={t} className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${v.badge}`}>
                            {v.icon} {v.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ATTACK MODE */}
          {mode === 'attack' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Seleziona il tipo della tua mossa di attacco:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {ALL_TYPES.map(t => {
                    const v = getTypeVisual(t);
                    const isSelected = selectedAttackType === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setSelectedAttackType(t)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isSelected
                            ? `${v.badge} text-white border-white ring-2 ring-indigo-400 shadow-md`
                            : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <span>{v.icon}</span>
                        <span className="truncate">{v.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attack Matchups Results */}
              <div className="space-y-3">
                {/* Super Effective */}
                <div className="bg-emerald-950/20 border border-emerald-800/50 p-3 rounded-xl">
                  <span className="text-xs font-extrabold text-emerald-400 block mb-2">
                    💥 Superefficace su (x2 Danni):
                  </span>
                  {attackMatchups.superEffective.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {attackMatchups.superEffective.map(t => {
                        const v = getTypeVisual(t);
                        return (
                          <span key={t} className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${v.badge}`}>
                            {v.icon} {v.label}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Nessun tipo</span>
                  )}
                </div>

                {/* Not Very Effective */}
                <div className="bg-amber-950/20 border border-amber-800/50 p-3 rounded-xl">
                  <span className="text-xs font-extrabold text-amber-400 block mb-2">
                    🛡️ Poco efficace su (x0.5 Danni):
                  </span>
                  {attackMatchups.notVeryEffective.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {attackMatchups.notVeryEffective.map(t => {
                        const v = getTypeVisual(t);
                        return (
                          <span key={t} className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${v.badge}`}>
                            {v.icon} {v.label}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Nessun tipo</span>
                  )}
                </div>

                {/* No Effect */}
                {attackMatchups.noEffect.length > 0 && (
                  <div className="bg-slate-800/60 border border-slate-700 p-3 rounded-xl">
                    <span className="text-xs font-extrabold text-slate-400 block mb-2">
                      🚫 Nessun effetto su (x0 Danni):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {attackMatchups.noEffect.map(t => {
                        const v = getTypeVisual(t);
                        return (
                          <span key={t} className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${v.badge}`}>
                            {v.icon} {v.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
