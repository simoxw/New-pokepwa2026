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
  { id: 'cura-totale', name: 'Cura Totale', price: 600, description: 'Risolve tutti i problemi di stato di un Pokémon.', type: 'healing' as const, emoji: '🟢' },
  { id: 'caramella-rara', name: 'Caramella Rara', price: 5000, description: 'Alza di un livello un Pokémon.', type: 'other' as const, emoji: '🍬' },
  { id: 'tm-universal', name: 'MT Universale', price: 2500, description: 'Scegli e insegna qualsiasi mossa al tuo Pokémon da PokéAPI!', type: 'other' as const, emoji: '💿' },
  { id: 'revitalizzante', name: 'Revitalizzante', price: 1500, description: 'Rianima un Pokémon (50% PS).', type: 'healing' as const, effectValue: 0.5, emoji: '✨' },
  { id: 'revitalizzante-max', name: 'Revitalizzante Max', price: 3000, description: 'Rianima un Pokémon (100% PS).', type: 'healing' as const, effectValue: 1, emoji: '🌟' },
  { id: 'master-ball', name: 'Master Ball', price: 50000, description: 'La Ball definitiva: cattura sempre.', type: 'capture' as const, emoji: '🟣' },
];

export const Shop: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, setState } = useGame();
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  const changeQty = (itemId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[itemId] || 1;
      const next = Math.max(1, Math.min(999, current + delta));
      return { ...prev, [itemId]: next };
    });
  };

  const buyItem = (shopItem: typeof SHOP_ITEMS[0], qty: number = 1) => {
    const totalPrice = shopItem.price * qty;
    if (state.player.money < totalPrice) {
      alert("Non hai abbastanza soldi!");
      return;
    }

    setState(prev => {
      const inventory = [...prev.player.inventory];
      const searchName = shopItem.name.toLowerCase();
      const itemIndex = inventory.findIndex(i => i.name.toLowerCase() === searchName);

      if (itemIndex > -1) {
        inventory[itemIndex] = { ...inventory[itemIndex], count: inventory[itemIndex].count + qty };
      } else {
        inventory.push({
          id: shopItem.id,
          name: shopItem.name,
          description: shopItem.description,
          type: shopItem.type,
          effectValue: (shopItem as any).effectValue,
          count: qty
        });
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money - totalPrice,
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
        {SHOP_ITEMS.map(item => {
          const qty = quantities[item.id] || 1;
          const totalCost = item.price * qty;

          return (
            <div key={item.id} className="bg-gray-50 p-4 rounded-3xl flex items-center justify-between border-b-4 border-gray-200 transition-all gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl shrink-0">
                  {item.emoji}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-sm uppercase italic tracking-tight truncate">{item.name}</h4>
                  <p className="text-[10px] text-gray-500 font-bold leading-normal">{item.description}</p>
                  <div className="mt-1 flex items-center text-yellow-600">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-sm font-black">{item.price} {qty > 1 && <span className="text-gray-400 font-medium text-[11px] ml-1">(tot. ${totalCost})</span>}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 shrink-0">
                {/* Quantity Control Box */}
                <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-2xl p-1 shadow-sm shrink-0">
                  <button 
                    onClick={() => changeQty(item.id, -10)}
                    className="w-7 h-7 flex items-center justify-center font-black text-gray-400 hover:bg-gray-100 rounded-lg text-[10px] hover:text-red-500 transition-colors"
                    title="Diminuisci di 10"
                  >
                    -10
                  </button>
                  <button 
                    onClick={() => changeQty(item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center font-black text-gray-600 hover:bg-gray-100 rounded-lg text-sm hover:text-red-500 transition-colors"
                    title="Diminuisci di 1"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-black text-xs text-gray-800">
                    {qty}
                  </span>
                  <button 
                    onClick={() => changeQty(item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center font-black text-gray-600 hover:bg-gray-100 rounded-lg text-sm hover:text-green-500 transition-colors"
                    title="Aumenta di 1"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => changeQty(item.id, 10)}
                    className="w-7 h-7 flex items-center justify-center font-black text-gray-400 hover:bg-gray-100 rounded-lg text-[10px] hover:text-green-500 transition-colors"
                    title="Aumenta di 10"
                  >
                    +10
                  </button>
                </div>
                
                <button 
                  onClick={() => buyItem(item, qty)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-tighter shadow-lg active:scale-95 transition-transform"
                >
                  Compra
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-6 text-center">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">Grazie per aver scelto noi!</p>
      </div>
    </div>
  );
};
