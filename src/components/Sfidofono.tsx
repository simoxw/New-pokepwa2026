import React from 'react';
import { motion } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { TRAINERS_DATA, getTrainer } from '../data/trainers';
import { Trainer } from '../types/game';
import { ChevronLeft, Phone, Swords } from 'lucide-react';

interface SfidofonoProps {
  onBack: () => void;
  onStartBattle: (trainer: Trainer) => void;
}

export const Sfidofono: React.FC<SfidofonoProps> = ({ onBack, onStartBattle }) => {
  const { state } = useGame();
  const [loading, setLoading] = React.useState(false);

  const defeatedIds = state.player.defeatedTrainers || [];
  const badgeIds = state.player.badges || [];
  
  // Map badges to their corresponding trainer IDs
  const gymLeaderMapping: Record<string, string> = {
    'badge-1': 'giovane-pino',
    'badge-2': 'bullo-luca',
    'badge-3': 'pescatore-gianni',
    'badge-4': 'piromane-leo',
    'badge-5': 'scienziato-filippo',
    'badge-6': 'ombretta',
    'badge-7': 'tenente-eclipse-ombra',
    'badge-8': 'alpinista-marco',
    'badge-9': 'ombra-silente',
    'badge-10': 'admin-root',
  };

  // Combine defeated trainers and gym leaders from badges
  const gymLeaderIdsFromBadges = badgeIds.map(bid => gymLeaderMapping[bid]).filter(Boolean);
  const allAvailableTrainers = Array.from(new Set([...defeatedIds, ...gymLeaderIdsFromBadges]));
  
  const handleRematch = async (trainerId: string) => {
    setLoading(true);
    try {
      const isGymLeader = Object.values(gymLeaderMapping).includes(trainerId);
      const trainer = await getTrainer(trainerId as any, isGymLeader);
      onStartBattle(trainer);
    } catch (e) {
      console.error(e);
      alert("Errore nel caricamento del trainer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 text-white p-6">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Phone className="w-6 h-6 text-blue-400" />
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Sfidofono</h1>
        </div>
      </div>

      <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">
        Richiama gli allenatori che hai già sconfitto per una rivincita!
      </p>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {allAvailableTrainers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <Swords className="w-16 h-16 mb-4" />
            <p className="text-sm font-bold uppercase">Non hai ancora sconfitto nessun allenatore degno di nota.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {allAvailableTrainers.map((id) => {
              const data = (TRAINERS_DATA as any)[id];
              if (!data) return null;
              
              return (
                <motion.div
                  key={id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-black/40 rounded-2xl p-1">
                      <img 
                        src={data.sprite} 
                        alt={data.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-black uppercase text-sm">{data.name}</h3>
                      <p className="text-[10px] text-blue-400 font-bold uppercase">
                        {Object.values(gymLeaderMapping).includes(id) ? 'Capopalestra' : data.type}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    disabled={loading}
                    onClick={() => handleRematch(id)}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-lg shadow-blue-900/40 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Swords className="w-4 h-4" />
                    Sfida
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-auto p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-center">
        <p className="text-[10px] font-bold text-blue-400 uppercase leading-relaxed">
          Le rivincite sono un ottimo modo per livellare i tuoi Pokémon e guadagnare soldi extra.
        </p>
      </div>
    </div>
  );
};
