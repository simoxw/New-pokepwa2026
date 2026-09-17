import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../contexts/GameContext';
import { Item, StatusCondition } from '../../types/game';
import { ChevronLeft } from 'lucide-react';

interface BattleBagProps {
  onUseItem: (item: Item, targetIndex?: number) => void;
  onClose: () => void;
  currentActiveHp: number;
  activeStatus?: StatusCondition;
}

export const BattleBag: React.FC<BattleBagProps> = ({ 
  onUseItem, 
  onClose,
  currentActiveHp,
  activeStatus 
}) => {
  const { state } = useGame();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const bagItems = state.player.inventory.filter(item => item.count > 0);

  const handleItemClick = (item: Item) => {
    // Capture balls are thrown directly at the wild enemy
    if (item.type === 'capture') {
      onUseItem(item);
      return;
    }

    // Rare candy cannot be used in battle
    if (item.id === 'caramella-rara') {
      return;
    }

    // If player has only 1 Pokemon, use directly on active
    if (state.player.team.length <= 1) {
      onUseItem(item, 0);
      return;
    }

    // Otherwise show Pokemon selection
    setSelectedItem(item);
  };

  const getPokemonEligibility = (item: Item, pokemonHp: number, maxHp: number, status?: StatusCondition) => {
    const isRevive = item.id.includes('revitalizzante');
    if (isRevive) {
      if (pokemonHp > 0) return { canUse: false, reason: 'Non esausto' };
      return { canUse: true, reason: 'Rianima' };
    }

    if (item.id.includes('pozione')) {
      if (pokemonHp <= 0) return { canUse: false, reason: 'Esausto' };
      if (pokemonHp >= maxHp) return { canUse: false, reason: 'PS al massimo' };
      return { canUse: true, reason: `Cura ${item.effectValue || 20} PS` };
    }

    if (item.id === 'antidoto') {
      if (status !== 'poisoned') return { canUse: false, reason: 'Non avvelenato' };
      return { canUse: true, reason: 'Cura Veleno' };
    }

    if (item.id === 'antiparalisi') {
      if (status !== 'paralyzed') return { canUse: false, reason: 'Non paralizzato' };
      return { canUse: true, reason: 'Cura Paralisi' };
    }

    if (item.id === 'antiscotto') {
      if (status !== 'burned') return { canUse: false, reason: 'Non scottato' };
      return { canUse: true, reason: 'Cura Scottatura' };
    }

    if (item.id === 'sveglia') {
      if (status !== 'sleep') return { canUse: false, reason: 'Non addormentato' };
      return { canUse: true, reason: 'Sveglia' };
    }

    if (item.id === 'cura-totale' || item.id === 'full-heal') {
      if (!status) return { canUse: false, reason: 'Nessun problema' };
      return { canUse: true, reason: 'Cura tutto' };
    }

    return { canUse: true, reason: 'Usa' };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-[100] bg-black/85 flex flex-col p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {selectedItem && (
            <button 
              onClick={() => setSelectedItem(null)} 
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-black italic uppercase text-white">
              {selectedItem ? `Usa ${selectedItem.name}` : 'Borsa'}
            </h2>
            {selectedItem && (
              <p className="text-xs text-white/70">Seleziona un Pokémon della tua squadra</p>
            )}
          </div>
        </div>
        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white cursor-pointer">
          <span className="text-xl font-bold">✕</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        <AnimatePresence mode="wait">
          {!selectedItem ? (
            /* Items List */
            <motion.div 
              key="items-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              {bagItems.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-bold italic">
                  La borsa è vuota...
                </div>
              ) : (
                bagItems.map((item) => {
                  const isBall = item.type === 'capture';
                  const isCandy = item.id === 'caramella-rara';

                  return (
                    <button
                      key={item.id}
                      disabled={isCandy}
                      onClick={() => handleItemClick(item)}
                      className={`w-full flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border-2 border-transparent transition-all text-left select-none ${
                        isCandy 
                          ? 'opacity-40 cursor-not-allowed' 
                          : 'hover:border-blue-500 active:scale-[0.98] cursor-pointer'
                      }`}
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner">
                        {isBall ? (
                          item.id === 'master-ball' ? '🟣' : 
                          item.id === 'ultra-ball' ? '💎' : 
                          item.id === 'mega-ball' ? '🔵' : '🔴'
                        ) : isCandy ? (
                          '🍬'
                        ) : item.id.includes('revitalizzante') ? (
                          '✨'
                        ) : (
                          '💊'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-black uppercase text-sm text-slate-800 truncate">{item.name}</span>
                          <span className="text-xs font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-full shrink-0">
                            x{item.count}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                          {isCandy ? 'Non utilizzabile durante la lotta.' : item.description}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </motion.div>
          ) : (
            /* Pokemon Party Selection */
            <motion.div 
              key="pokemon-target-list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-2.5"
            >
              {state.player.team.map((pokemon, index) => {
                const isActive = index === 0;
                // Live battle HP for active pokemon, party HP for bench
                const currentHp = isActive ? currentActiveHp : (typeof pokemon.hp === 'number' ? pokemon.hp : pokemon.maxHp);
                const currentStatus = isActive ? activeStatus : pokemon.status;
                const hpPercent = Math.max(0, Math.min(100, Math.round((currentHp / pokemon.maxHp) * 100)));
                const eligibility = getPokemonEligibility(selectedItem, currentHp, pokemon.maxHp, currentStatus);

                return (
                  <button
                    key={`${pokemon.id}-${index}`}
                    disabled={!eligibility.canUse}
                    onClick={() => onUseItem(selectedItem, index)}
                    className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all text-left select-none ${
                      eligibility.canUse
                        ? 'bg-white hover:border-emerald-500 active:scale-[0.98] border-white shadow-md cursor-pointer'
                        : 'bg-slate-800/80 border-slate-700/50 opacity-60 cursor-not-allowed text-white'
                    }`}
                  >
                    <img 
                      src={pokemon.sprites.front} 
                      alt={pokemon.name} 
                      className={`w-14 h-14 object-contain shrink-0 ${currentHp <= 0 ? 'grayscale opacity-50' : ''}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`font-black uppercase text-sm truncate ${eligibility.canUse ? 'text-slate-900' : 'text-slate-300'}`}>
                            {pokemon.name}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-black bg-blue-500 text-white px-1.5 py-0.2 rounded uppercase">
                              In Campo
                            </span>
                          )}
                          {currentStatus && (
                            <span className="text-[9px] font-black bg-purple-600 text-white px-1.5 py-0.2 rounded uppercase">
                              {currentStatus}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-mono font-bold shrink-0 ${eligibility.canUse ? 'text-slate-600' : 'text-slate-400'}`}>
                          Lv.{pokemon.level}
                        </span>
                      </div>

                      {/* HP Bar */}
                      <div className="mt-2">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-1">
                          <span className={eligibility.canUse ? 'text-slate-500' : 'text-slate-400'}>PS</span>
                          <span className={eligibility.canUse ? 'text-slate-800' : 'text-slate-300'}>
                            {currentHp} / {pokemon.maxHp}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-1.5 flex justify-end">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                          eligibility.canUse 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {eligibility.reason}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

