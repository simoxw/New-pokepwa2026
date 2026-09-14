import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Pokemon, Badge } from '../../types/game';
import { Award, Coins, Sparkles, TrendingUp, Heart, Swords, Shield, Zap, Wind } from 'lucide-react';

export interface PostBattleData {
  pokemon: Pokemon;
  enemy: Pokemon;
  expGained: number;
  oldLevel: number;
  newLevel: number;
  oldExp: number;
  newExp: number;
  nextLevelExp: number;
  statGains?: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  evsGained?: Record<string, number>;
  badge?: Badge | null;
  moneyEarned: number;
  trainerName?: string;
}

interface PostBattleScreenProps {
  data: PostBattleData;
  onContinue: () => void;
}

export const PostBattleScreen: React.FC<PostBattleScreenProps> = ({ data, onContinue }) => {
  const {
    pokemon,
    enemy,
    expGained,
    oldLevel,
    newLevel,
    oldExp,
    newExp,
    nextLevelExp,
    statGains,
    evsGained,
    badge,
    moneyEarned,
    trainerName
  } = data;

  const didLevelUp = newLevel > oldLevel;
  const [expProgress, setExpProgress] = useState(0);

  useEffect(() => {
    // Animate EXP fill
    const timer = setTimeout(() => {
      const targetPercent = Math.min(100, Math.round((newExp / (nextLevelExp || 1)) * 100));
      setExpProgress(targetPercent);
    }, 200);
    return () => clearTimeout(timer);
  }, [newExp, nextLevelExp]);

  const statLabels = [
    { key: 'hp', label: 'PS', icon: Heart, color: 'text-red-500' },
    { key: 'attack', label: 'Attacco', icon: Swords, color: 'text-orange-500' },
    { key: 'defense', label: 'Difesa', icon: Shield, color: 'text-blue-500' },
    { key: 'spAtk', label: 'Att. Sp.', icon: Zap, color: 'text-amber-500' },
    { key: 'spDef', label: 'Dif. Sp.', icon: Shield, color: 'text-indigo-500' },
    { key: 'speed', label: 'Velocità', icon: Wind, color: 'text-emerald-500' },
  ] as const;

  const evEntries = evsGained ? Object.entries(evsGained).filter(([_, v]) => typeof v === 'number' && v > 0) as [string, number][] : [];

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto text-white"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 p-4 text-center relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-white/10 opacity-30 animate-pulse pointer-events-none" />
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <Sparkles className="w-6 h-6 text-yellow-100 animate-spin" style={{ animationDuration: '6s' }} />
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-slate-950 drop-shadow">
              Vittoria!
            </h1>
            <Sparkles className="w-6 h-6 text-yellow-100 animate-spin" style={{ animationDuration: '6s' }} />
          </motion.div>
          <p className="text-xs sm:text-sm font-bold text-slate-900/90 mt-0.5">
            {trainerName ? `Hai sconfitto ${trainerName}!` : `Hai sconfitto ${enemy.name} selvatico!`}
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Pokemon & Exp Card */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={pokemon.sprites.artwork || pokemon.sprites.front}
                alt={pokemon.name}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
              />
              {didLevelUp && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                  Level Up!
                </span>
              )}
            </div>

            <div className="flex-1 w-full text-left">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-lg font-black uppercase text-amber-400">{pokemon.name}</span>
                <div className="flex items-center gap-1.5 font-bold">
                  {didLevelUp ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">Lv. {oldLevel}</span>
                      <span className="text-xs text-slate-500">➔</span>
                      <span className="text-sm text-emerald-400 font-black">Lv. {newLevel}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">Lv. {pokemon.level}</span>
                  )}
                </div>
              </div>

              {/* Exp Gain */}
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Punti Esperienza</span>
                <span className="text-emerald-400 font-bold">+{expGained} EXP</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-700 relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${expProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Esp. attuale: {newExp}</span>
                <span>Prossimo: {nextLevelExp}</span>
              </div>
            </div>
          </div>

          {/* Level Up Stat Increases */}
          {didLevelUp && statGains && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black uppercase text-emerald-300 tracking-wider">
                  Statistiche Aumentate
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {statLabels.map(({ key, label, icon: Icon, color }) => {
                  const gain = statGains[key] ?? 0;
                  const currentVal = (pokemon.stats as any)?.[key] ?? (pokemon.maxHp && key === 'hp' ? pokemon.maxHp : '-');
                  return (
                    <div
                      key={key}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-inner"
                    >
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Icon className={`w-3 h-3 ${color}`} />
                        <span>{label}</span>
                      </div>
                      <div className="text-sm font-black text-white mt-0.5">
                        {currentVal}
                        {gain > 0 && (
                          <span className="text-[11px] text-emerald-400 font-extrabold ml-1">
                            (+{gain})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* EVs Gained */}
          {evEntries.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Punti Allenamento (EV):</span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {evEntries.map(([stat, val]) => (
                  <span
                    key={stat}
                    className="bg-blue-900/60 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    +{val} {stat.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Badge Won Spotlight */}
          {badge && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-2 border-amber-400/80 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-amber-500/10"
            >
              <div className="relative shrink-0 w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-300/40 flex items-center justify-center p-2">
                <Award className="w-10 h-10 text-amber-400 drop-shadow" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                  Nuova Medaglia Conquistata!
                </span>
                <h3 className="text-lg font-black text-white mt-1">{badge.name}</h3>
                <p className="text-xs text-slate-300 leading-snug mt-0.5">{badge.description}</p>
                {badge.unlockedArea && (
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                    Nuova area sbloccata: <span className="capitalize">{badge.unlockedArea}</span>!
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* Rewards: Money & Items */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ricompensa</span>
                <span className="text-sm font-black text-yellow-400">+{moneyEarned} PokéDollari</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Esito</span>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Trionfo</span>
            </div>
          </div>
        </div>

        {/* Footer with continue button */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800">
          <button
            id="post-battle-continue-btn"
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-white py-3.5 rounded-2xl font-black text-base uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 border-b-4 border-emerald-700 active:border-b-0"
          >
            <span>Continua</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
