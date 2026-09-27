import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { LEGENDARY_BOSSES, LegendaryBoss, buildBossTrainer, generateBossRewardPokemon } from '../data/legendaryBosses';
import { Trainer, Pokemon } from '../types/game';
import { Trophy, ShieldAlert, Sparkles, Award, ArrowLeft, Swords, Gift, CheckCircle2, Zap } from 'lucide-react';

interface BossBattlesProps {
  onBack: () => void;
  onStartBattle: (trainer: Trainer, modifiers?: any) => void;
}

export const BossBattles: React.FC<BossBattlesProps> = ({ onBack, onStartBattle }) => {
  const { state, setState } = useGame();
  const [loadingBossId, setLoadingBossId] = useState<string | null>(null);
  const [selectedBossDetail, setSelectedBossDetail] = useState<LegendaryBoss | null>(null);

  const defeatedBosses: string[] = state.player.defeatedBosses || [];

  const handleChallenge = async (boss: LegendaryBoss) => {
    try {
      setLoadingBossId(boss.id);
      const bossTrainer = await buildBossTrainer(boss);
      
      // Pass the passive buff modifier to BattleScreen
      onStartBattle(bossTrainer, {
        bossBuff: boss.buffType,
        bossBuffName: boss.buffName,
        bossBuffDescription: boss.buffDescription
      });
    } catch (e) {
      console.error("Error launching boss battle:", e);
    } finally {
      setLoadingBossId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white overflow-hidden selection:bg-purple-500">
      {/* Top Header */}
      <header className="h-16 border-b border-purple-500/20 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-purple-300 transition-all cursor-pointer border border-purple-500/30"
            title="Torna al Villaggio"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span>Sfide Leggendarie</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-mono">
                LVL 100
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Sconfiggi gli allenatori iconici ed ottieni Pokémon esclusivi con IV perfetti!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-purple-950/80 border border-purple-500/40 px-3 py-1 rounded-xl text-xs font-bold text-purple-200 flex items-center gap-1.5 shadow-inner">
            <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{defeatedBosses.length}/{LEGENDARY_BOSSES.length} Sconfitti</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar pb-24">
        {/* Banner Explainer */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900 border border-purple-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3 relative z-10">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 shrink-0">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-200 flex items-center gap-2">
                <span>Regole del Duello Boss</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                • <strong>Squadre Nemiche al Lvl 100:</strong> IV 31/31/31/31/31/31 ed EV distribuiti con mosse competitive.<br />
                • <strong>Livelli attuali dei tuoi Pokémon:</strong> I tuoi Pokémon mantengono il loro vero livello e guadagnano ESP massiccia!<br />
                • <strong>Buff Passivo Unico:</strong> Ogni Boss possiede un'abilità passiva speciale che altera il combattimento.<br />
                • <strong>Premio Prima Vittoria:</strong> Sconfiggi un Boss per la 1ª volta per sbloccare un Pokémon Speciale con IV perfetti (al 100%) diretto nel tuo Box o Squadra!
              </p>
            </div>
          </div>
        </div>

        {/* Boss Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEGENDARY_BOSSES.map((boss) => {
            const isDefeated = defeatedBosses.includes(boss.id);
            const isLoading = loadingBossId === boss.id;

            return (
              <motion.div
                key={boss.id}
                whileHover={{ y: -2 }}
                className={`rounded-2xl border p-4 sm:p-5 transition-all relative overflow-hidden flex flex-col justify-between ${
                  isDefeated
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-md shadow-emerald-950/20'
                    : 'bg-slate-900/80 border-purple-500/30 hover:border-purple-500/60 shadow-lg shadow-purple-950/30'
                }`}
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{boss.avatar}</span>
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                        {boss.name}
                        {isDefeated && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            VITTORIA!
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] font-bold text-purple-300 italic">{boss.title} • {boss.region}</p>
                    </div>
                  </div>

                  <span className="text-xs font-black font-mono px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    +${boss.moneyReward.toLocaleString()}
                  </span>
                </div>

                {/* Boss Sprite & Buff Info */}
                <div className="flex gap-4 items-center bg-black/40 p-3 rounded-xl border border-white/5 my-2">
                  <div className="w-16 h-16 shrink-0 relative flex items-center justify-center bg-purple-950/40 rounded-xl border border-purple-500/20">
                    <img 
                      src={boss.sprite} 
                      alt={boss.name} 
                      className="w-14 h-14 object-contain filter drop-shadow" 
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="text-xs font-bold text-pink-300 uppercase tracking-wider truncate">
                        {boss.buffName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight line-clamp-2">
                      {boss.buffDescription}
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-[11px] italic text-slate-400 my-1 px-1 border-l-2 border-purple-500/40 pl-2.5">
                  "{boss.quote}"
                </p>

                {/* Reward Preview */}
                <div className="mt-2 p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                        Premio 1ª Vittoria:
                      </p>
                      <p className="text-[11px] font-semibold text-white truncate">
                        {boss.rewardPokemon.nickname} (Lv {boss.rewardPokemon.level}, IV 100%)
                      </p>
                    </div>
                  </div>
                  {isDefeated ? (
                    <span className="text-[10px] text-emerald-400 font-bold shrink-0 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/30">
                      Riscattato
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-bold shrink-0 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/30">
                      In Palio
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleChallenge(boss)}
                    disabled={isLoading}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isLoading
                        ? 'bg-purple-900 text-purple-300 opacity-70 cursor-wait'
                        : isDefeated
                          ? 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 active:scale-95'
                          : 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white active:scale-95 shadow-purple-900/50'
                    }`}
                  >
                    {isLoading ? (
                      <span>Caricamento Squadra...</span>
                    ) : (
                      <>
                        <Swords className="w-4 h-4" />
                        <span>{isDefeated ? 'Risfida Allenatore' : 'Sfida al Lvl 100'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedBossDetail(boss)}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-white/10 active:scale-95 cursor-pointer text-xs font-bold"
                    title="Dettagli Boss"
                  >
                    ℹ️
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedBossDetail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white relative"
            >
              <button 
                onClick={() => setSelectedBossDetail(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800"
              >
                ✕
              </button>

              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedBossDetail.avatar}</span>
                <div>
                  <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-300">
                    {selectedBossDetail.name}
                  </h2>
                  <p className="text-xs text-purple-300">{selectedBossDetail.title}</p>
                </div>
              </div>

              <div className="p-3 bg-black/50 rounded-2xl border border-purple-500/20 space-y-2">
                <h4 className="text-xs font-black uppercase text-pink-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Buff Passivo: {selectedBossDetail.buffName}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedBossDetail.buffDescription}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">Squadra al Lvl 100 (6 Pokémon):</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedBossDetail.teamPokemon.map((tp, idx) => (
                    <div key={idx} className="p-2 bg-slate-800/80 rounded-xl border border-white/5 flex items-center gap-2">
                      <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${tp.id}.png`} 
                        alt={tp.name}
                        className="w-7 h-7 object-contain shrink-0" 
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-200 truncate">{tp.name}</p>
                        <p className="text-[10px] font-mono font-semibold text-amber-400">Lv 100</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Gift className="w-4 h-4" />
                  <span>Premio Prima Vittoria:</span>
                </p>
                <p className="text-slate-200">
                  {selectedBossDetail.rewardPokemon.description}
                </p>
              </div>

              <button
                onClick={() => {
                  const b = selectedBossDetail;
                  setSelectedBossDetail(null);
                  handleChallenge(b);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-black text-xs uppercase tracking-wider text-white shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>Inizia la Battaglia Ora</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
