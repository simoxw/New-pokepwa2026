import React from 'react';
import { motion } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { BADGES } from '../lib/badges';
import { ChevronLeft } from 'lucide-react';

interface BadgeCaseProps {
  onBack: () => void;
}

export const BadgeCase: React.FC<BadgeCaseProps> = ({ onBack }) => {
  const { state } = useGame();
  const playerBadges = state.player.badges;

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white p-6">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Portamedaglie</h1>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 gap-6 pb-6">
          {BADGES.map((badge) => {
          const isOwned = playerBadges.includes(badge.id);
          return (
            <motion.div
              key={badge.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`relative aspect-square rounded-3xl p-4 flex flex-col items-center justify-center border-4 transition-all ${
                isOwned 
                  ? 'bg-blue-600/20 border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.3)]' 
                  : 'bg-black/40 border-white/5 grayscale'
              }`}
            >
              <div className="relative w-20 h-20 mb-3">
                {isOwned && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full"
                  />
                )}
                <img 
                  src={badge.image} 
                  alt={badge.name} 
                  className={`w-full h-full object-contain relative z-10 ${isOwned ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'opacity-20'}`}
                />
              </div>
              
              <div className="text-center">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isOwned ? 'text-blue-300' : 'text-gray-600'}`}>
                  {isOwned ? 'Conquistata' : 'Bloccata'}
                </span>
                <h3 className={`text-sm font-black uppercase leading-tight mt-1 ${isOwned ? 'text-white' : 'text-gray-700'}`}>
                  {badge.name}
                </h3>
              </div>

              {isOwned && badge.unlockedArea && (
                <div className="absolute -bottom-2 bg-emerald-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg border border-emerald-400 whitespace-nowrap">
                  Sblocca: {badge.unlockedArea}
                </div>
              )}
            </motion.div>
          );
        })}
        </div>
      </div>

      <div className="mt-auto p-6 bg-white/5 rounded-3xl border border-white/10">
        <p className="text-xs font-bold text-gray-400 leading-relaxed text-center">
          Sconfiggi i Capipalestra nelle varie aree per collezionare tutte le medaglie e sbloccare nuovi territori inesplorati.
        </p>
      </div>
    </div>
  );
};
