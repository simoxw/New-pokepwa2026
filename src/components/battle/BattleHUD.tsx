import React from 'react';
import { motion } from 'motion/react';

interface HpBarProps {
  current: number;
  max: number;
  label: string;
  level: number;
  isPlayer?: boolean;
  status?: string;
  isShiny?: boolean;
  team?: { hp: number }[];
}

export const BattleHUD: React.FC<HpBarProps> = ({ current, max, label, level, isPlayer, status, isShiny, team }) => {
  const percent = Math.max(0, (current / max) * 100);
  const color = percent > 50 ? 'bg-emerald-500' : percent > 20 ? 'bg-yellow-500' : 'bg-red-500';

  const STATUS_COLORS: Record<string, string> = {
    poisoned: 'bg-purple-500',
    paralyzed: 'bg-yellow-400',
    sleep: 'bg-gray-400',
    burned: 'bg-orange-500',
    frozen: 'bg-blue-300'
  };

  const STATUS_LABELS: Record<string, string> = {
    poisoned: 'VEL',
    paralyzed: 'PAR',
    sleep: 'SON',
    burned: 'SCO',
    frozen: 'CON'
  };

  return (
    <div className={`bg-white/90 rounded-2xl p-3 shadow-lg border-2 ${isPlayer ? 'border-blue-500 min-w-[200px]' : 'border-black/10 min-w-[180px]'} mb-4 relative`}>
      {/* Team Indicators */}
      {Array.isArray(team) && team.length > 0 && (
        <div className={`absolute ${isPlayer ? '-bottom-6 left-0' : '-top-6 right-0'} flex gap-1`}>
          {team.map((p, i) => {
            const hasHp = p && typeof p.hp === 'number';
            const isAlive = hasHp && p.hp > 0;
            return (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full border border-black/20 ${isAlive ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-gray-400'}`}
              />
            );
          })}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className={`font-bold text-sm uppercase ${isPlayer ? 'text-blue-600' : ''}`}>{label}</span>
          {isShiny && <span className="text-yellow-500 text-xs">★</span>}
          {status && (
            <span className={`${STATUS_COLORS[status] || 'bg-gray-500'} text-[8px] text-white px-1.5 py-0.5 rounded font-black`}>
              {STATUS_LABELS[status] || status}
            </span>
          )}
        </div>
        <span className="text-xs font-bold text-gray-500">Lv.{level}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color}`}
        />
      </div>
      {isPlayer && (
        <div className="text-[10px] font-bold text-right mt-1 text-gray-500">
          {current} / {max} HP
        </div>
      )}
    </div>
  );
};
