import React from 'react';
import { motion } from 'motion/react';
import { Pokemon, TYPE_COLORS } from '../types/game';
import { Shield, Sword, Zap, Heart, Star, MapPin } from 'lucide-react';

interface PokemonDetailsProps {
  pokemon: Pokemon;
  onClose: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onBox?: () => void;
  onWithdraw?: () => void;
}

export const PokemonDetails: React.FC<PokemonDetailsProps> = ({ 
  pokemon, onClose, onMoveUp, onMoveDown, onBox, onWithdraw 
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header with high-quality Artwork */}
        <div className={`p-8 relative overflow-hidden flex-shrink-0 ${TYPE_COLORS[pokemon.types[0]] || 'bg-blue-500'}`}>
          <div className="absolute top-0 right-0 p-4">
            <button onClick={onClose} className="text-white/80 text-2xl p-2">✕</button>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 relative">
              <motion.img 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                src={pokemon.sprites.artwork} 
                alt={pokemon.name} 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]" 
              />
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-75" />
            </div>
            <h2 className="text-white text-3xl font-black uppercase italic mt-4 flex items-center gap-2">
              {pokemon.name}
              {pokemon.isShiny && <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />}
            </h2>
            <div className="flex gap-2 mt-2">
              {pokemon.types.map(t => (
                <span key={t} className={`bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${TYPE_COLORS[t] || ''}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={<Star className="text-yellow-500" />} label="Livello" value={pokemon.level} />
            <InfoItem icon={<MapPin className="text-red-500" />} label="Catturato" value={pokemon.caughtLocation} />
            <InfoItem icon={<Heart className="text-emerald-500" />} label="Natura" value={pokemon.nature} />
            <InfoItem icon={<Zap className="text-blue-500" />} label="Shiny" value={pokemon.isShiny ? 'Sì' : 'No'} />
          </div>

          {/* Experience Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
              <span>Esperienza</span>
              <span>{pokemon.experience} / {pokemon.nextLevelExp}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${(pokemon.experience / pokemon.nextLevelExp) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Stats */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-3xl">
              <h4 className="font-black text-xs uppercase text-gray-400 tracking-widest">Statistiche</h4>
              <StatBar label="HP" current={pokemon.hp} max={pokemon.maxHp} color="bg-emerald-500" />
              <StatBar label="ATT" current={pokemon.stats?.attack || 0} max={250} color="bg-red-500" />
              <StatBar label="DIF" current={pokemon.stats?.defense || 0} max={250} color="bg-blue-500" />
              <StatBar label="S.ATT" current={pokemon.stats?.spAtk || 0} max={250} color="bg-purple-500" />
              <StatBar label="S.DIF" current={pokemon.stats?.spDef || 0} max={250} color="bg-teal-500" />
              <StatBar label="VEL" current={pokemon.stats?.speed || 0} max={250} color="bg-yellow-500" />
            </div>

            {/* IVs & EVs */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-3xl">
              <h4 className="font-black text-xs uppercase text-gray-400 tracking-widest">IV / EV</h4>
              <div className="space-y-3 text-[10px] font-black">
                <div className="flex items-center gap-4">
                  <span className="w-8">HP</span>
                  <div className="flex-1 text-right text-emerald-600">{pokemon.ivs?.hp} / {pokemon.evs?.hp || 0}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-8">ATT</span>
                  <div className="flex-1 text-right text-red-600">{pokemon.ivs?.attack} / {pokemon.evs?.attack || 0}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-8">DIF</span>
                  <div className="flex-1 text-right text-blue-600">{pokemon.ivs?.defense} / {pokemon.evs?.defense || 0}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-8">S.ATT</span>
                  <div className="flex-1 text-right text-purple-600">{pokemon.ivs?.spAtk || 0} / {pokemon.evs?.spAtk || 0}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-8">S.DIF</span>
                  <div className="flex-1 text-right text-teal-600">{pokemon.ivs?.spDef || 0} / {pokemon.evs?.spDef || 0}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-8">VEL</span>
                  <div className="flex-1 text-right text-yellow-600">{pokemon.ivs?.speed || 0} / {pokemon.evs?.speed || 0}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
             <h4 className="font-black text-xs uppercase text-gray-400 tracking-widest">Mosse</h4>
             <div className="grid grid-cols-2 gap-2">
                {pokemon.moves.map((m, index) => (
                  <div key={`${m.name}-${index}`} className={`p-3 rounded-2xl flex flex-col text-white shadow-sm border-b-4 border-black/10 ${TYPE_COLORS[m.type] || 'bg-gray-400'}`}>
                    <span className="font-black text-[10px] uppercase truncate">{m.name}</span>
                    <span className="text-[8px] opacity-90 font-bold uppercase">{m.type} | P: {m.power} | ACC: {m.accuracy}%</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              {onMoveUp && <ActionButton onClick={onMoveUp} label="Sposta Su" color="bg-gray-100" />}
              {onMoveDown && <ActionButton onClick={onMoveDown} label="Sposta Giù" color="bg-gray-100" />}
            </div>
            <div className="flex gap-2">
              {onBox && <ActionButton onClick={onBox} label="Metti nel Box" color="bg-yellow-500 text-white" />}
              {onWithdraw && <ActionButton onClick={onWithdraw} label="Ritira in Squadra" color="bg-emerald-500 text-white" />}
            </div>
            <button 
              onClick={onClose}
              className="w-full bg-gray-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs mt-2 active:scale-95 transition-transform"
            >
              Torna Indietro
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-sm">
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">{label}</p>
      <p className="text-xs font-black uppercase">{value}</p>
    </div>
  </div>
);

const StatBar = ({ label, current, max, color }: { label: string, current: number, max: number, color: string }) => (
  <div className="flex items-center gap-4">
    <span className="text-[10px] font-black w-8">{label}</span>
    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color}`} 
        style={{ width: `${Math.min(100, (current / max) * 100)}%` }}
      />
    </div>
    <span className="text-[10px] font-black w-8 text-right">{current}</span>
  </div>
);

const ActionButton = ({ onClick, label, color }: { onClick: () => void, label: string, color: string }) => (
  <button 
    onClick={onClick}
    className={`flex-1 ${color} py-3 rounded-2xl font-black uppercase text-[10px] shadow-sm active:scale-95 transition-transform`}
  >
    {label}
  </button>
);
