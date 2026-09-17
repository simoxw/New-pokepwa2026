import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GENERATIONS } from './pokedexConstants';
import { X, Trophy, Gift, Check, CheckCircle2, Award } from 'lucide-react';

interface PokedexProgressModalProps {
  onClose: () => void;
  onSelectGeneration: (genId: number) => void;
}

interface Milestone {
  id: string;
  requiredCount: number;
  title: string;
  description: string;
  rewardMoney: number;
  rewardItems: Array<{ id: string; name: string; count: number }>;
  rewardTitle?: string;
}

const MILESTONES: Milestone[] = [
  {
    id: 'm-10',
    requiredCount: 10,
    title: 'Apprendista Ricercatore',
    description: 'Registra e cattura i tuoi primi 10 Pokémon.',
    rewardMoney: 1000,
    rewardItems: [{ id: 'poke-ball', name: 'Poké Ball', count: 5 }]
  },
  {
    id: 'm-25',
    requiredCount: 25,
    title: 'Esploratore Curioso',
    description: 'Raggiungi 25 Pokémon catturati nel database.',
    rewardMoney: 2500,
    rewardItems: [
      { id: 'mega-ball', name: 'Mega Ball', count: 5 },
      { id: 'pozione', name: 'Pozione', count: 3 }
    ]
  },
  {
    id: 'm-50',
    requiredCount: 50,
    title: 'Collezionista Esperto',
    description: '50 esemplari registrati nel Pokédex.',
    rewardMoney: 5000,
    rewardItems: [
      { id: 'ultra-ball', name: 'Ultra Ball', count: 5 },
      { id: 'caramella-rara', name: 'Caramella Rara', count: 2 }
    ]
  },
  {
    id: 'm-100',
    requiredCount: 100,
    title: 'Veterano di Kanto e Oltre',
    description: '100 Pokémon catturati nel National Pokédex!',
    rewardMoney: 10000,
    rewardItems: [
      { id: 'master-ball', name: 'Master Ball', count: 1 },
      { id: 'caramella-rara', name: 'Caramella Rara', count: 5 }
    ],
    rewardTitle: 'Archivista del Web'
  },
  {
    id: 'm-150',
    requiredCount: 150,
    title: 'Signore degli Esemplari',
    description: '150 Pokémon catturati!',
    rewardMoney: 20000,
    rewardItems: [
      { id: 'ultra-ball', name: 'Ultra Ball', count: 10 },
      { id: 'revitalizzante-max', name: 'Revitalizzante Max', count: 5 }
    ],
    rewardTitle: 'Professore del Codice'
  },
  {
    id: 'm-250',
    requiredCount: 250,
    title: 'Maestro Assoluto del Pokédex',
    description: 'Un quarto dell\'intero Pokédex Nazionale conquistato!',
    rewardMoney: 50000,
    rewardItems: [
      { id: 'master-ball', name: 'Master Ball', count: 2 },
      { id: 'pepita', name: 'Pepita', count: 5 }
    ],
    rewardTitle: 'Maestro del Pokédex'
  }
];

export const PokedexProgressModal: React.FC<PokedexProgressModalProps> = ({
  onClose,
  onSelectGeneration
}) => {
  const { state, setState, saveGame } = useGame();
  const pokedex = state.player.pokedex || {};

  const [claimed, setClaimed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pokepwa_claimed_pokedex_milestones');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate totals
  const totalCaught = Object.values(pokedex).filter(s => s === 'caught').length;
  const totalSeen = Object.values(pokedex).filter(s => s === 'seen' || s === 'caught').length;
  const totalNational = 1025;
  const completionPercent = ((totalCaught / totalNational) * 100).toFixed(1);

  // Claim handler
  const handleClaim = (milestone: Milestone) => {
    if (claimed.includes(milestone.id) || totalCaught < milestone.requiredCount) return;

    const newClaimed = [...claimed, milestone.id];
    setClaimed(newClaimed);
    try {
      localStorage.setItem('pokepwa_claimed_pokedex_milestones', JSON.stringify(newClaimed));
    } catch {}

    setState(prev => {
      // Add money
      const newMoney = prev.player.money + milestone.rewardMoney;

      // Add items
      const updatedInventory = [...prev.player.inventory];
      for (const rewItem of milestone.rewardItems) {
        const existing = updatedInventory.find(i => i.id === rewItem.id);
        if (existing) {
          existing.count += rewItem.count;
        } else {
          updatedInventory.push({
            id: rewItem.id,
            name: rewItem.name,
            description: 'Ricompensa Pokédex.',
            count: rewItem.count,
            type: 'other'
          });
        }
      }

      // Add title if present
      const unlockedTitles = prev.player.unlockedTitles ? [...prev.player.unlockedTitles] : [];
      if (milestone.rewardTitle && !unlockedTitles.includes(milestone.rewardTitle)) {
        unlockedTitles.push(milestone.rewardTitle);
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          money: newMoney,
          inventory: updatedInventory,
          unlockedTitles
        }
      };
    });

    saveGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Progressi & Ricompense Pokédex</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* Global Progress Card */}
          <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 p-4 rounded-xl border border-indigo-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Completamento Nazionale
                </span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {completionPercent}%
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Catturati</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {totalCaught} <span className="text-xs text-slate-400">/ {totalNational}</span>
                </span>
              </div>
            </div>

            {/* Global Progress Bar */}
            <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-indigo-900/50 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(1, (totalCaught / totalNational) * 100))}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
              <span>Visti: <strong className="text-slate-200">{totalSeen}</strong></span>
              <span>Mancanti: <strong className="text-slate-200">{totalNational - totalCaught}</strong></span>
            </div>
          </div>

          {/* Generation Progress List */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              Suddivisione per Generazione:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GENERATIONS.filter(g => g.id > 0).map(gen => {
                const [start, end] = gen.range;
                const genTotal = end - start + 1;
                let genCaught = 0;
                for (let i = start; i <= end; i++) {
                  if (pokedex[i] === 'caught') genCaught++;
                }
                const genPct = Math.round((genCaught / genTotal) * 100);

                return (
                  <button
                    key={gen.id}
                    onClick={() => {
                      onSelectGeneration(gen.id);
                      onClose();
                    }}
                    className="p-3 bg-slate-800/40 hover:bg-slate-800/80 rounded-xl border border-slate-700/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 flex items-center gap-1.5">
                        <span>{gen.flag}</span>
                        <span>{gen.name} ({gen.label})</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-300">
                        {genCaught}/{genTotal}
                      </span>
                    </div>

                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${genPct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Milestone Rewards Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Gift className="w-4 h-4" />
              <span>Ricompense Ricerca Prof. Scordarello</span>
            </div>

            <div className="space-y-2">
              {MILESTONES.map(m => {
                const isClaimed = claimed.includes(m.id);
                const canClaim = totalCaught >= m.requiredCount && !isClaimed;

                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isClaimed
                        ? 'bg-slate-900/50 border-slate-800 opacity-60'
                        : canClaim
                        ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30'
                        : 'bg-slate-800/40 border-slate-700/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white truncate">
                          {m.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono font-bold">
                          {m.requiredCount} catturati
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {m.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-semibold text-amber-300">
                        <span>💰 {m.rewardMoney.toLocaleString()} P$</span>
                        {m.rewardItems.map(it => (
                          <span key={it.id} className="text-slate-300">
                            • {it.count}x {it.name}
                          </span>
                        ))}
                        {m.rewardTitle && (
                          <span className="text-purple-300 flex items-center gap-0.5">
                            <Award className="w-3 h-3" /> Titolo: "{m.rewardTitle}"
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaim(m)}
                      disabled={!canClaim}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 ${
                        isClaimed
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : canClaim
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 animate-bounce'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Riscattato</span>
                        </>
                      ) : canClaim ? (
                        <>
                          <Gift className="w-3.5 h-3.5" />
                          <span>Riscatta!</span>
                        </>
                      ) : (
                        <span>Bloccato</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
