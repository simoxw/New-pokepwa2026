import React from 'react';
import { useGame } from '../contexts/GameContext';
import { motion } from 'motion/react';
import { ChevronLeft, ScrollText, CheckCircle2, Circle, Gift, User, MapPin, Target } from 'lucide-react';
import { Quest } from '../types/game';

export const QuestLog: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, setState } = useGame();

  const claimReward = (questId: string) => {
    const quest = state.player.quests.find(q => q.id === questId);
    if (!quest || quest.status !== 'completed') return;

    setState(prev => {
      const newQuests = prev.player.quests.map(q => 
        q.id === questId ? { ...q, status: 'claimed' as const } : q
      );

      let newMoney = prev.player.money;
      const newInventory = [...prev.player.inventory];

      if (quest.reward) {
        if (quest.reward.money) newMoney += quest.reward.money;
        if (quest.reward.items) {
          quest.reward.items.forEach(rewardItem => {
            const itemIndex = newInventory.findIndex(i => i.id === rewardItem.id);
            if (itemIndex > -1) {
              newInventory[itemIndex] = { 
                ...newInventory[itemIndex], 
                count: newInventory[itemIndex].count + rewardItem.count 
              };
            } else {
              // Fallback for missing item definitions, in a real app we'd have a registry
              newInventory.push({ 
                id: rewardItem.id, 
                name: rewardItem.id.replace(/-/g, ' '), 
                description: 'Ricompensa missione.', 
                count: rewardItem.count, 
                type: 'other' 
              });
            }
          });
        }
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          money: newMoney,
          inventory: newInventory,
          quests: newQuests
        }
      };
    });
  };

  const activeQuests = state.player.quests.filter(q => q.status === 'active' || q.status === 'completed');
  const availableQuests = state.player.quests.filter(q => q.status === 'available');
  const completedQuests = state.player.quests.filter(q => q.status === 'claimed');

  return (
    <div className="h-full bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white border-b flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft />
        </button>
        <h2 className="font-black text-xl uppercase italic tracking-tighter flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-orange-500" /> Registro Missioni
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        {/* Active Quests */}
        <section className="space-y-4">
          <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest flex items-center gap-2 px-2">
            <Target className="w-3 h-3 text-red-500" /> In Corso
          </h3>
          {activeQuests.length > 0 ? (
            activeQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} onClaim={() => claimReward(quest.id)} />
            ))
          ) : (
            <p className="text-center py-8 text-xs font-bold text-slate-400 italic">Nessuna missione attiva. Parla con gli NPC nel villaggio!</p>
          )}
        </section>

        {/* Available Quests */}
        {availableQuests.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest flex items-center gap-2 px-2">
              <Circle className="w-3 h-3 text-blue-500" /> Nuove Disponibili
            </h3>
            {availableQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </section>
        )}

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest flex items-center gap-2 px-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Completate
            </h3>
            {completedQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

interface QuestCardProps {
  quest: Quest;
  onClaim?: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onClaim }) => {
  const isCompleted = quest.status === 'completed';
  const isClaimed = quest.status === 'claimed';
  const isAvailable = quest.status === 'available';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white rounded-3xl p-5 shadow-md border-2 transition-all ${
        isCompleted ? 'border-emerald-500 bg-emerald-50/30' : 
        isClaimed ? 'border-gray-100 opacity-70' :
        isAvailable ? 'border-dashed border-blue-200' : 'border-orange-100 shadow-orange-100/50'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-black text-sm uppercase tracking-tight text-slate-800">{quest.title}</h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[8px] font-black uppercase text-slate-400">
              <User className="w-2 h-2" /> {quest.giver}
            </span>
            <span className="flex items-center gap-1 text-[8px] font-black uppercase text-blue-400">
              <MapPin className="w-2 h-2" /> {quest.category}
            </span>
          </div>
        </div>
        {isCompleted && (
          <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase animate-pulse">Pronta!</span>
        )}
      </div>

      <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed italic">
        "{quest.description}"
      </p>

      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 mb-4">
        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Obiettivo:</p>
        <p className="text-xs font-bold text-slate-700">{quest.objective}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 rounded-lg">
            <Gift className="w-3 h-3 text-orange-500" />
          </div>
          <span className="text-[9px] font-black uppercase text-orange-600 tracking-tight">{quest.rewardText}</span>
        </div>

        {isCompleted && onClaim && (
          <button 
            onClick={onClaim}
            className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] shadow-lg shadow-emerald-200 active:scale-95 transition-all"
          >
            Riscatta
          </button>
        )}
        {isClaimed && (
          <span className="text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        )}
        {isAvailable && (
          <span className="text-[8px] font-black uppercase text-blue-400 italic">Da attivare</span>
        )}
      </div>
    </motion.div>
  );
};
