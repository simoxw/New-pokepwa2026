import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { Trainer, Pokemon } from '../types/game';
import { getTrainer } from '../data/trainers';
import { fullyHealPokemon } from '../lib/pokemonHeal';
import { ShieldAlert, Cpu, Lock, Radio, Award, ArrowLeft, Heart, Backpack, Sparkles, CheckCircle2 } from 'lucide-react';

interface LeagueHubProps {
  onBack: () => void;
  onOpenInventory: () => void;
  onStartBattle: (trainer: Trainer) => void;
}

interface LeagueBossInfo {
  id: string;
  name: string;
  role: string;
  specialty: string;
  icon: string;
  accentColor: string;
  bgGradient: string;
  borderColor: string;
  quote: string;
  quirk: string;
}

const LEAGUE_STAGES: LeagueBossInfo[] = [
  {
    id: 'superquattro-bsod',
    name: 'Superquattro BSOD',
    role: 'Schermata Blu',
    specialty: 'Spettro & Buio (Lv. 64-66)',
    icon: '🟦',
    accentColor: 'text-blue-400',
    bgGradient: 'from-blue-950/80 to-slate-900/90',
    borderColor: 'border-blue-500/50',
    quote: 'CRITICAL_PROCESS_DIED: Il tuo team ha causato un kernel panic non gestito. Riavvio in corso...',
    quirk: 'Si lamenta continuamente dei driver video obsoleti e dei dump di memoria corrotti.'
  },
  {
    id: 'superquattro-ai',
    name: 'Superquattro AI Allucinata',
    role: 'Modello Generativo',
    specialty: 'Psico & Folletto (Lv. 66-68)',
    icon: '🔮',
    accentColor: 'text-pink-400',
    bgGradient: 'from-fuchsia-950/80 to-purple-950/90',
    borderColor: 'border-pink-500/50',
    quote: 'In base al prompt fornito, ho generato una vittoria al 99.8%. I miei Pokémon hanno sette dita!',
    quirk: 'Genera dialoghi surreali e combatte convinto di aver già previsto ogni tuo singolo frame.'
  },
  {
    id: 'superquattro-ransomware',
    name: 'Superquattro Ransomware',
    role: 'Cripto-Minaccia',
    specialty: 'Acciaio & Veleno (Lv. 68-70)',
    icon: '🔒',
    accentColor: 'text-red-400',
    bgGradient: 'from-red-950/80 to-stone-900/90',
    borderColor: 'border-red-500/50',
    quote: 'Tutti i tuoi file e salvataggi sono stati cifrati con chiave RSA-4096! Paga o subisci il wipe!',
    quirk: 'Blocca a tradimento l\'uso di una tua mossa con un payload crittografico finché non la decritti!'
  },
  {
    id: 'superquattro-social',
    name: 'Superquattro Algoritmo Social',
    role: 'Viral Hype Engine',
    specialty: 'Elettro & Lotta (Lv. 70-72)',
    icon: '⚡',
    accentColor: 'text-yellow-400',
    bgGradient: 'from-amber-950/80 to-yellow-950/90',
    borderColor: 'border-yellow-500/50',
    quote: 'SIAMO IN DIRETTA STREAMING CON 500K SPETTATORI! Spamma like e guarda questo attacco virale!',
    quirk: 'Offensiva frenetica basata su engagement rate, boost di velocità e hype alle stelle.'
  },
  {
    id: 'campione-pm',
    name: 'Campione: Project Manager',
    role: 'Campione del Sistema',
    specialty: 'Team Bilanciato Competitivo (Lv. 73-76)',
    icon: '👑',
    accentColor: 'text-amber-300',
    bgGradient: 'from-emerald-950/80 via-slate-900 to-amber-950/80',
    borderColor: 'border-amber-400',
    quote: 'ASAP! Il deploy in produzione è fissato per venerdì alle 18:00! Se perdi, lavoriamo tutto il weekend!',
    quirk: 'Squadra competitiva definitiva, battute su deadline impossibili e refactoring forzati.'
  }
];

export const LeagueHub: React.FC<LeagueHubProps> = ({ onBack, onOpenInventory, onStartBattle }) => {
  const { state, setState } = useGame();
  
  // Track stage progress in current session (0 = BSOD, 1 = AI, 2 = Ransomware, 3 = Social, 4 = PM)
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(() => {
    const saved = localStorage.getItem('pokepwa_league_stage');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isLoadingTrainer, setIsLoadingTrainer] = useState(false);
  const [healingFeedback, setHealingFeedback] = useState<string | null>(null);
  const [showHallOfFame, setShowHallOfFame] = useState(false);

  // Check if just beaten a boss and sync stage
  useEffect(() => {
    localStorage.setItem('pokepwa_league_stage', currentStageIndex.toString());
  }, [currentStageIndex]);

  // Check if defeated trainers contain the current stage boss
  useEffect(() => {
    const defeated = state.player.defeatedTrainers || [];
    const currentBoss = LEAGUE_STAGES[currentStageIndex];

    if (currentBoss && defeated.includes(currentBoss.id)) {
      if (currentStageIndex === 4) {
        // Just beat the Champion!
        setShowHallOfFame(true);
      } else {
        // Advance to next stage!
        setCurrentStageIndex(prev => Math.min(4, prev + 1));
      }
    }
  }, [state.player.defeatedTrainers, currentStageIndex]);

  const handleHealTeam = () => {
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        team: prev.player.team.map(p => fullyHealPokemon(p))
      }
    }));
    setHealingFeedback('Squadra completamente ristabilita al terminale di emergenza!');
    setTimeout(() => setHealingFeedback(null), 3000);
  };

  const handleChallengeBoss = async (stage: LeagueBossInfo) => {
    if (isLoadingTrainer) return;
    setIsLoadingTrainer(true);

    try {
      const trainer = await getTrainer(stage.id as any);
      onStartBattle(trainer);
    } catch (e) {
      console.error("Error loading league trainer", e);
    } finally {
      setIsLoadingTrainer(false);
    }
  };

  const handleCompleteLeague = () => {
    // Reward player and reset league run so it is fully repeatable
    setState(prev => {
      const currentVictories = prev.player.leagueVictories || 0;
      // Add items
      const inventory = prev.player.inventory.map(item => {
        if (item.id === 'master-ball') return { ...item, count: item.count + 3 };
        if (item.id === 'caramella-rara') return { ...item, count: item.count + 5 };
        return item;
      });

      // Remove league trainer IDs from defeatedTrainers so they can be challenged again!
      const leagueIds = LEAGUE_STAGES.map(s => s.id);
      const filteredDefeated = (prev.player.defeatedTrainers || []).filter(id => !leagueIds.includes(id));

      // Mark Champion quest completed if present
      const quests = prev.player.quests.map(q => 
        q.id === 'champion-of-code' ? { ...q, status: 'completed' as const } : q
      );

      return {
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money + 50000,
          inventory,
          defeatedTrainers: filteredDefeated,
          leagueVictories: currentVictories + 1,
          quests
        }
      };
    });

    localStorage.setItem('pokepwa_league_stage', '0');
    setCurrentStageIndex(0);
    setShowHallOfFame(false);
  };

  const activeStage = LEAGUE_STAGES[currentStageIndex] || LEAGUE_STAGES[0];
  const allTeamFainted = state.player.team.length > 0 && state.player.team.every(p => p.hp <= 0);

  return (
    <div className="flex-1 bg-slate-950 text-white flex flex-col h-full overflow-hidden relative selection:bg-purple-500 selection:text-white">
      {/* Ambient background server rack lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-black pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-pink-500 to-amber-400" />

      {/* Header */}
      <header className="px-4 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all border border-white/10 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Villaggio</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-base">🏆</span>
            <h2 className="font-black uppercase tracking-wider text-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-amber-300">
              Datacenter della Lega
            </h2>
          </div>
          <span className="text-[10px] text-gray-400 font-mono font-bold tracking-tight">
            Lega dei Crash di Sistema • Root Access
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-black text-amber-300">
            {state.player.leagueVictories || 0} Titoli
          </span>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 pb-20 max-w-2xl mx-auto w-full">
        
        {/* Progress Timeline */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
          <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2.5 flex justify-between items-center">
            <span>Sequenza Superquattro & Campione</span>
            <span className="text-purple-400 font-mono">Fase {currentStageIndex + 1} di 5</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {LEAGUE_STAGES.map((stage, idx) => {
              const isBeaten = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div 
                  key={stage.id} 
                  className={`rounded-xl p-2 flex flex-col items-center justify-center border transition-all text-center ${
                    isBeaten 
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400' 
                      : isCurrent 
                        ? 'bg-purple-900/50 border-purple-400 shadow-lg shadow-purple-900/50 text-white scale-105' 
                        : 'bg-white/5 border-white/5 text-gray-600 opacity-60'
                  }`}
                >
                  <span className="text-lg mb-0.5">
                    {isBeaten ? '✅' : stage.icon}
                  </span>
                  <span className="text-[9px] font-black uppercase leading-tight line-clamp-1">
                    {idx === 4 ? 'PM' : stage.role.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Active Challenger Card */}
        <motion.div 
          key={activeStage.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border-2 ${activeStage.borderColor} bg-gradient-to-b ${activeStage.bgGradient} p-5 shadow-2xl relative overflow-hidden`}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeStage.icon}</span>
                <span className={`text-xs font-black uppercase tracking-widest ${activeStage.accentColor}`}>
                  {currentStageIndex === 4 ? 'Sfida Finale • Campione' : `Superquattro #${currentStageIndex + 1}`}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-0.5">
                {activeStage.name}
              </h3>
              <p className="text-xs text-gray-300 font-mono mt-0.5">
                Tipo: {activeStage.specialty}
              </p>
            </div>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 mb-4">
            <p className="text-xs text-gray-200 italic leading-relaxed font-mono">
              "{activeStage.quote}"
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 mb-5 flex items-start gap-2 text-[11px] text-gray-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>Dettaglio tattico:</strong> {activeStage.quirk}</span>
          </div>

          <button
            onClick={() => handleChallengeBoss(activeStage)}
            disabled={isLoadingTrainer || allTeamFainted}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-xl active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
              allTeamFainted
                ? 'bg-red-950 text-red-400 border border-red-800 cursor-not-allowed'
                : currentStageIndex === 4
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 shadow-amber-500/30 hover:brightness-110'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
            }`}
          >
            {allTeamFainted ? (
              <span>⚠️ Cura il tuo team prima di lottare!</span>
            ) : isLoadingTrainer ? (
              <span>Inizializzazione Battaglia...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Affronta {activeStage.name}</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Team Status & Healing Console */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-black uppercase text-gray-300 tracking-wider">
                Stato Squadra ({state.player.team.length}/6)
              </h4>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleHealTeam}
                className="flex items-center gap-1.5 text-xs bg-emerald-600/80 hover:bg-emerald-500 px-3 py-1.5 rounded-xl font-bold text-white transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Terminale di Cura</span>
              </button>

              <button
                onClick={onOpenInventory}
                className="flex items-center gap-1.5 text-xs bg-blue-600/80 hover:bg-blue-500 px-3 py-1.5 rounded-xl font-bold text-white transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Backpack className="w-3.5 h-3.5" />
                <span>Zaino</span>
              </button>
            </div>
          </div>

          {healingFeedback && (
            <div className="mb-3 p-2 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 text-center font-bold animate-pulse">
              {healingFeedback}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {state.player.team.map((poke, i) => {
              const hpPercent = Math.max(0, Math.min(100, (poke.hp / poke.maxHp) * 100));
              const isFainted = poke.hp <= 0;
              return (
                <div 
                  key={`league-team-${poke.instanceId || poke.id}-${i}`}
                  className={`rounded-2xl p-2.5 border flex items-center gap-2 ${
                    isFainted 
                      ? 'bg-red-950/30 border-red-900/50 opacity-60' 
                      : 'bg-black/40 border-white/10'
                  }`}
                >
                  <img 
                    src={poke.sprites.front} 
                    alt={poke.name} 
                    className="w-10 h-10 object-contain shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-black uppercase text-white truncate">
                        {poke.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        Lv.{poke.level}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full ${
                          hpPercent > 50 ? 'bg-emerald-400' : hpPercent > 20 ? 'bg-amber-400' : 'bg-red-500'
                        }`}
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 font-mono mt-0.5 block">
                      {poke.hp}/{poke.maxHp} PS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Hall of Fame Victory Modal */}
      <AnimatePresence>
        {showHallOfFame && (
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl text-center my-auto"
            >
              <div className="inline-flex p-3 rounded-full bg-amber-400/20 text-amber-300 mb-3 border border-amber-400/40">
                <Award className="w-10 h-10 animate-bounce" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                SALA DELLA FAMA PokePWA
              </h2>
              <p className="text-xs text-amber-200/90 font-mono mt-1 mb-4">
                Hai sconfitto i Superquattro dei Crash e il temuto Project Manager!
              </p>

              <div className="bg-black/60 rounded-2xl p-4 border border-amber-500/30 mb-5">
                <div className="text-xs text-gray-300 uppercase font-black tracking-wider mb-3">
                  Lead Architect & Campione: <span className="text-white font-black text-sm">{state.player.name}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {state.player.team.map((poke, i) => (
                    <div key={`hof-${poke.instanceId || poke.id}-${i}`} className="bg-white/5 rounded-xl p-2 flex flex-col items-center border border-white/10">
                      <img src={poke.sprites.front} alt={poke.name} className="w-12 h-12 object-contain" />
                      <span className="text-[10px] font-black uppercase text-amber-300 truncate w-full">
                        {poke.name}
                      </span>
                      <span className="text-[9px] text-gray-400">Lv. {poke.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 mb-6 text-xs text-amber-200 space-y-1 font-bold text-left">
                <div className="flex items-center gap-1.5 text-amber-300 font-black uppercase text-[11px] mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Ricompense di Campione:</span>
                </div>
                <div>💰 +50.000 PokéDollari accreditati</div>
                <div>⚪ 3x Master Ball aggiunte allo zaino</div>
                <div>🍬 5x Caramelle Rare aggiunte allo zaino</div>
                <div>🏆 +1 Titolo nella Sala della Fama (Lega ripetibile a piacimento)</div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCompleteLeague}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:scale-95 text-slate-950 font-black uppercase py-3.5 rounded-2xl text-xs sm:text-sm tracking-wider transition-all shadow-lg shadow-amber-500/30 cursor-pointer"
                >
                  Riscotta Titolo e Ripeti Lega
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
