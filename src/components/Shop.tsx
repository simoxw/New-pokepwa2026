import React from 'react';
import { useGame } from '../contexts/GameContext';
import { ChevronLeft, ShoppingCart, DollarSign } from 'lucide-react';
import { Item } from '../types/game';

const SHOP_ITEMS = [
  { id: 'poke-ball', name: 'Poké Ball', price: 200, description: 'Per catturare Pokémon selvatici.', type: 'capture' as const, emoji: '🔴' },
  { id: 'mega-ball', name: 'Mega Ball', price: 600, description: 'Alta probabilità di cattura.', type: 'capture' as const, emoji: '🔵' },
  { id: 'ultra-ball', name: 'Ultra Ball', price: 1200, description: 'Altissima probabilità di cattura.', type: 'capture' as const, emoji: '🟡' },
  { id: 'pozione', name: 'Pozione', price: 300, description: 'Ripristina 20 HP.', type: 'healing' as const, effectValue: 20, emoji: '💊' },
  { id: 'super-pozione', name: 'Super Pozione', price: 700, description: 'Ripristina 50 HP.', type: 'healing' as const, effectValue: 50, emoji: '🧪' },
  { id: 'iper-pozione', name: 'Iper Pozione', price: 1500, description: 'Ripristina 200 HP.', type: 'healing' as const, effectValue: 200, emoji: '🍶' },
  { id: 'caramella-rara', name: 'Caramella Rara', price: 5000, description: 'Alza di un livello un Pokémon.', type: 'other' as const, emoji: '🍬' },
  { id: 'tm-universal', name: 'MT Universale', price: 2500, description: 'Scegli e insegna qualsiasi mossa al tuo Pokémon da PokéAPI!', type: 'other' as const, emoji: '💿' },
  { id: 'revitalizzante', name: 'Revitalizzante', price: 1500, description: 'Rianima un Pokémon (50% PS).', type: 'healing' as const, effectValue: 0.5, emoji: '✨' },
  { id: 'revitalizzante-max', name: 'Revitalizzante Max', price: 3000, description: 'Rianima un Pokémon (100% PS).', type: 'healing' as const, effectValue: 1, emoji: '🌟' },
  { id: 'master-ball', name: 'Master Ball', price: 50000, description: 'La Ball definitiva: cattura sempre.', type: 'capture' as const, emoji: '🟣' },
];

export const Shop: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, setState } = useGame();

  const buyItem = (shopItem: typeof SHOP_ITEMS[0]) => {
    if (state.player.money < shopItem.price) {
      alert("Non hai abbastanza soldi!");
      return;
    }

    setState(prev => {
      const inventory = [...prev.player.inventory];
      const searchName = shopItem.name.toLowerCase();
      const itemIndex = inventory.findIndex(i => i.name.toLowerCase() === searchName);

      if (itemIndex > -1) {
        inventory[itemIndex] = { ...inventory[itemIndex], count: inventory[itemIndex].count + 1 };
      } else {
        inventory.push({
          id: shopItem.id,
          name: shopItem.name,
          description: shopItem.description,
          type: shopItem.type,
          effectValue: (shopItem as any).effectValue,
          count: 1
        });
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money - shopItem.price,
          inventory
        }
      };
    });
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
          <h2 className="font-black text-xl uppercase italic tracking-tighter">Poké Market</h2>
        </div>
        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full border-2 border-yellow-400">
          <DollarSign className="w-3 h-3 text-yellow-600" />
          <span className="font-black text-yellow-700">{state.player.money}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {SHOP_ITEMS.map(item => (
          <div key={item.id} className="bg-gray-50 p-4 rounded-3xl flex items-center justify-between border-b-4 border-gray-200 active:translate-y-1 active:border-b-0 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl">
                {item.emoji}
              </div>
              <div>
                <h4 className="font-black text-sm uppercase italic tracking-tight">{item.name}</h4>
                <p className="text-[10px] text-gray-500 font-bold leading-none">{item.description}</p>
                <div className="mt-1 flex items-center text-yellow-600">
                  <DollarSign className="w-3 h-3" />
                  <span className="text-sm font-black">{item.price}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => buyItem(item)}
              className="bg-blue-600 text-white px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-tighter shadow-lg active:scale-90 transition-transform"
            >
              Compra
            </button>
          </div>
        ))}
      </div>
      
      <div className="p-6 text-center">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">Grazie per aver scelto noi!</p>
      </div>
    </div>
  );
};
