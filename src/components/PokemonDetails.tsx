import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pokemon, Move, TYPE_COLORS } from '../types/game';
import { Shield, Sword, Zap, Heart, Star, MapPin } from 'lucide-react';
import { MoveInfoModal } from './battle/MoveInfoModal';
import { getNatureDetails } from '../lib/pokeapi';
import { useGame } from '../contexts/GameContext';
import { playMenuClick } from '../lib/sound';

interface PokemonDetailsProps {
  pokemon: Pokemon;
  onClose: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onBox?: () => void;
  onWithdraw?: () => void;
  onRelease?: () => void;
}

export const PokemonDetails: React.FC<PokemonDetailsProps> = ({ 
  pokemon, onClose, onMoveUp, onMoveDown, onBox, onWithdraw, onRelease 
}) => {
  const { setState } = useGame();
  const [isFavorite, setIsFavorite] = useState<boolean>(!!pokemon.isFavorite);
  const [inspectingMove, setInspectingMove] = useState<Move | null>(null);
  const [holdingMoveName, setHoldingMoveName] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActiveRef = useRef<boolean>(false);
  const pressStartTimeRef = useRef<number>(0);

  const handleToggleFavorite = () => {
    try { playMenuClick(); } catch { /* ignore */ }
    const nextVal = !isFavorite;
    setIsFavorite(nextVal);
    pokemon.isFavorite = nextVal;

    setState(prev => {
      const matchTarget = (p: Pokemon) => 
        p.instanceId 
          ? p.instanceId === pokemon.instanceId 
          : (p.id === pokemon.id && p.level === pokemon.level && p.caughtAt === pokemon.caughtAt);
      return {
        ...prev,
        player: {
          ...prev.player,
          team: prev.player.team.map(p => matchTarget(p) ? { ...p, isFavorite: nextVal } : p),
          box: prev.player.box.map(p => matchTarget(p) ? { ...p, isFavorite: nextVal } : p)
        }
      };
    });
  };

  const startPress = (move: Move) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    isLongPressActiveRef.current = false;
    pressStartTimeRef.current = Date.now();
    setHoldingMoveName(move.name);

    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      setInspectingMove(move);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(35); } catch { /* ignore */ }
      }
    }, 600);
  };

  const endPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setHoldingMoveName(null);
  };

  const cancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setHoldingMoveName(null);
    isLongPressActiveRef.current = false;
  };

  const totalIv = (pokemon.ivs?.hp ?? 0) + (pokemon.ivs?.attack ?? 0) + (pokemon.ivs?.defense ?? 0) + (pokemon.ivs?.spAtk ?? 0) + (pokemon.ivs?.spDef ?? 0) + (pokemon.ivs?.speed ?? 0);
  const totalEv = (pokemon.evs?.hp || 0) + (pokemon.evs?.attack || 0) + (pokemon.evs?.defense || 0) + (pokemon.evs?.spAtk || 0) + (pokemon.evs?.spDef || 0) + (pokemon.evs?.speed || 0);
  const natureDetails = getNatureDetails(pokemon.nature);

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <MoveInfoModal 
        move={inspectingMove} 
        onClose={() => setInspectingMove(null)} 
      />
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white text-slate-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header with high-quality Artwork */}
        <div className={`p-8 relative overflow-hidden flex-shrink-0 ${TYPE_COLORS[pokemon.types[0]] || 'bg-blue-500'}`}>
          {/* Favorite Star Button (Top-Left) */}
          <div className="absolute top-0 left-0 p-4 z-20">
            <button 
              onClick={handleToggleFavorite} 
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-black/15 transition-all cursor-pointer group flex items-center justify-center"
              title={isFavorite ? "Rimuovi dai Preferiti" : "Aggiungi ai Preferiti"}
            >
              <Star 
                className={`w-7 h-7 transition-all group-active:scale-125 ${
                  isFavorite 
                    ? "text-amber-300 fill-amber-300 drop-shadow-[0_2px_10px_rgba(252,211,77,0.8)]" 
                    : "text-white/80 hover:text-amber-300"
                }`} 
              />
            </button>
          </div>

          <div className="absolute top-0 right-0 p-4 z-20">
            <button 
              onClick={onClose} 
              className="text-white/80 hover:text-white text-2xl p-2 rounded-full hover:bg-black/15 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 relative">
              <motion.img 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                src={pokemon?.sprites?.artwork || pokemon?.sprites?.front || (pokemon as any)?.spriteUrl} 
                alt={pokemon.name} 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]" 
              />
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-75 pointer-events-none" />
            </div>
            <h2 className="text-white text-3xl font-black uppercase italic mt-4 flex items-center gap-2 drop-shadow-sm">
              {pokemon.nickname || pokemon.name}
              {pokemon.isShiny && <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />}
            </h2>
            <div className="flex gap-2 mt-2">
              {pokemon.types.map(t => (
                <span key={t} className={`bg-white/25 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-white/30 shadow-sm ${TYPE_COLORS[t] || ''}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={<Star className="text-yellow-500" />} label="Livello" value={pokemon.level} />
            <InfoItem icon={<MapPin className="text-red-500" />} label="Catturato" value={pokemon.caughtLocation || 'Erba Alta'} />
            <InfoItem icon={<Heart className="text-emerald-500" />} label="Natura" value={natureDetails.name} subValue={natureDetails.mod} />
            <InfoItem icon={<Zap className="text-blue-500" />} label="Shiny" value={pokemon.isShiny ? '✨ Sì' : 'No'} />
          </div>

          {/* Experience Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
              <span>Esperienza</span>
              <span className="font-mono">{pokemon.experience} / {pokemon.nextLevelExp}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${Math.min(100, Math.max(0, (pokemon.experience / pokemon.nextLevelExp) * 100))}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Stats */}
            <div className="space-y-3 bg-slate-50 border border-slate-100 p-4 rounded-3xl shadow-sm">
              <div className="flex items-center h-5">
                <h4 className="font-black text-xs uppercase text-slate-500 tracking-widest whitespace-nowrap">Statistiche</h4>
              </div>
              <StatBar label="HP" current={pokemon.hp} max={pokemon.maxHp} color="bg-emerald-500" isHp />
              <StatBar label="ATT" current={pokemon.stats?.attack || 0} max={200} color="bg-red-500" />
              <StatBar label="DIF" current={pokemon.stats?.defense || 0} max={200} color="bg-blue-500" />
              <StatBar label="S.ATT" current={pokemon.stats?.spAtk || 0} max={200} color="bg-purple-500" />
              <StatBar label="S.DIF" current={pokemon.stats?.spDef || 0} max={200} color="bg-teal-500" />
              <StatBar label="VEL" current={pokemon.stats?.speed || 0} max={200} color="bg-yellow-500" />
            </div>

            {/* IVs & EVs */}
            <div className="space-y-3 bg-slate-50 border border-slate-100 p-4 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between h-5 gap-1 whitespace-nowrap overflow-hidden">
                <h4 className="font-black text-xs uppercase text-slate-500 tracking-widest whitespace-nowrap shrink-0">IV / EV</h4>
                <span className="whitespace-nowrap shrink-0 text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/80">
                  {totalIv} / {totalEv}
                </span>
              </div>
              <div className="space-y-3 text-[10px] font-black">
                {[
                  { label: 'HP', iv: pokemon.ivs?.hp ?? 0, ev: pokemon.evs?.hp || 0, color: 'text-emerald-600' },
                  { label: 'ATT', iv: pokemon.ivs?.attack ?? 0, ev: pokemon.evs?.attack || 0, color: 'text-red-600' },
                  { label: 'DIF', iv: pokemon.ivs?.defense ?? 0, ev: pokemon.evs?.defense || 0, color: 'text-blue-600' },
                  { label: 'S.ATT', iv: pokemon.ivs?.spAtk ?? 0, ev: pokemon.evs?.spAtk || 0, color: 'text-purple-600' },
                  { label: 'S.DIF', iv: pokemon.ivs?.spDef ?? 0, ev: pokemon.evs?.spDef || 0, color: 'text-teal-600' },
                  { label: 'VEL', iv: pokemon.ivs?.speed ?? 0, ev: pokemon.evs?.speed || 0, color: 'text-amber-600' },
                ].map(({ label, iv, ev, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-[50px]">
                      <span className="text-slate-700">{label}</span>
                      {iv === 31 && (
                        <span 
                          className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] inline-block shrink-0 animate-pulse" 
                          title="IV Massimo (31 Perfetto)"
                        />
                      )}
                    </div>
                    <div className={`text-right font-mono ${color}`}>
                      <span className={iv === 31 ? 'font-black text-emerald-600' : ''}>{iv}</span>
                      <span className="text-slate-400 font-normal"> / </span>
                      <span>{ev}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 select-none">
             <h4 className="font-black text-xs uppercase text-slate-500 tracking-widest">Mosse</h4>
             <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">(Tieni premuto per info)</p>
             <div className="grid grid-cols-2 gap-2">
                {pokemon.moves.map((m, index) => (
                  <button 
                    key={`${m.name}-${index}`} 
                    onMouseDown={() => startPress(m)}
                    onMouseUp={endPress}
                    onMouseLeave={cancelPress}
                    onTouchStart={() => startPress(m)}
                    onTouchEnd={endPress}
                    onTouchCancel={cancelPress}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`p-3 rounded-2xl flex flex-col text-white shadow-sm border-b-4 border-black/10 relative overflow-hidden transition-transform active:scale-95 text-left ${TYPE_COLORS[m.type.toLowerCase()] || 'bg-slate-500'}`}
                  >
                    {holdingMoveName === m.name && (
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.6, ease: 'linear' }}
                        className="absolute bottom-0 left-0 h-1 bg-white/75 pointer-events-none"
                      />
                    )}
                    <span className="font-black text-[10px] uppercase truncate">{m.name}</span>
                    <span className="text-[8px] opacity-90 font-bold uppercase">{m.type} | P: {m.power || '—'} | ACC: {m.accuracy || '—'}%</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              {onMoveUp && <ActionButton onClick={onMoveUp} label="Sposta Su" color="bg-slate-100 text-slate-800 hover:bg-slate-200" />}
              {onMoveDown && <ActionButton onClick={onMoveDown} label="Sposta Giù" color="bg-slate-100 text-slate-800 hover:bg-slate-200" />}
            </div>
            <div className="flex gap-2">
              {onBox && <ActionButton onClick={onBox} label="Metti nel Box" color="bg-amber-500 text-white hover:bg-amber-600" />}
              {onWithdraw && <ActionButton onClick={onWithdraw} label="Ritira in Squadra" color="bg-emerald-500 text-white hover:bg-emerald-600" />}
              {onRelease && <ActionButton onClick={onRelease} label="Rilascia" color="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-200" />}
            </div>
            <button 
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs mt-2 active:scale-95 transition-all shadow-md"
            >
              Torna Indietro
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InfoItem = ({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string | number, subValue?: string }) => (
  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-sm shrink-0 border border-slate-100">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-slate-500 font-bold uppercase leading-none">{label}</p>
      <p className="text-xs font-black uppercase text-slate-800 truncate mt-0.5">{value}</p>
      {subValue && (
        <p className="text-[9px] font-bold text-emerald-600 font-mono leading-none mt-0.5">{subValue}</p>
      )}
    </div>
  </div>
);

interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
  isHp?: boolean;
}

const StatBar = ({ label, current, max, color }: StatBarProps) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] font-black w-9 text-slate-700 uppercase tracking-tight">{label}</span>
    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} rounded-full transition-all`} 
        style={{ width: `${Math.min(100, Math.max(5, (current / max) * 100))}%` }}
      />
    </div>
    <span className="text-[10px] font-black w-8 text-right text-slate-900 font-mono">{current}</span>
  </div>
);

const ActionButton = ({ onClick, label, color }: { onClick: () => void, label: string, color: string }) => (
  <button 
    onClick={onClick}
    className={`flex-1 ${color} py-3 rounded-2xl font-black uppercase text-[10px] shadow-sm active:scale-95 transition-all border border-black/5`}
  >
    {label}
  </button>
);
