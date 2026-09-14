import React from 'react';
import { motion } from 'motion/react';
import { useGame } from '../../contexts/GameContext';
import { Item } from '../../types/game';

interface BattleBagProps {
  onUseItem: (item: Item) => void;
  onClose: () => void;
}

export const BattleBag: React.FC<BattleBagProps> = ({ onUseItem, onClose }) => {
  const { state } = useGame();
  const bagItems = state.player.inventory.filter(item => item.count > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 flex flex-col p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black italic uppercase text-white">Borsa</h2>
        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white">
          <span className="text-xl">✕</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {bagItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-bold italic">
            La borsa è vuota...
          </div>
        ) : (
          bagItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onUseItem(item)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-4 border-transparent hover:border-blue-500 transition-all active:scale-95"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                {item.id.includes('ball') ? (
                  item.id === 'master-ball' ? '🟣' : 
                  item.id === 'ultra-ball' ? '💎' : 
                  item.id === 'mega-ball' ? '🔵' : '🔴'
                ) : (
                  item.id === 'caramella-rara' ? '🍬' : '💊'
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex justify-between items-center">
                  <span className="font-black uppercase text-sm text-gray-800">{item.name}</span>
                  <span className="text-xs font-black bg-blue-500 text-white px-2 py-0.5 rounded-full">x{item.count}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-bold leading-tight mt-1">{item.description}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
};
