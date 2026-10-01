import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Sparkles, Plus, Check, Trophy, 
  ChevronLeft, Gift, ShieldAlert, Award
} from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { LEGENDARY_BOSSES, generateBossRewardPokemon, LegendaryBoss } from '../data/legendaryBosses';
import { normalizePokemon } from '../lib/utils';
import { playLevelUp, playMenuClick } from '../lib/sound';
import { Pokemon } from '../types/game';

export interface SpecialRewardEntry {
  id: string;
  bossId?: string;
  sourceTitle: string;
  pokemonId: number;
  name: string;
  nickname: string;
  level: number;
  isShiny: boolean;
  moves: string[];
  description: string;
  generatePokemon: () => Promise<Pokemon>;
}

/**
 * Extensible catalog of special Pokemon obtainable from bosses.
 * Additional special/event Pokemon can easily be appended to ADDITIONAL_SPECIAL_POKEMON in the future!
 */
export const ADDITIONAL_SPECIAL_POKEMON: SpecialRewardEntry[] = [
  // Extensible slot for future mythical / event / special cheat Pokémon
];

export const SPECIAL_CHEAT_POKEMON_CATALOG: SpecialRewardEntry[] = [
  ...LEGENDARY_BOSSES.map((boss: LegendaryBoss): SpecialRewardEntry => ({
    id: boss.id,
    bossId: boss.id,
    sourceTitle: `Boss: ${boss.name}`,
    pokemonId: boss.rewardPokemon.id,
    name: boss.rewardPokemon.name,
    nickname: boss.rewardPokemon.nickname,
    level: boss.rewardPokemon.level,
    isShiny: boss.rewardPokemon.isShiny,
    moves: boss.rewardPokemon.moves,
    description: boss.rewardPokemon.description,
    generatePokemon: () => generateBossRewardPokemon(boss)
  })),
  ...ADDITIONAL_SPECIAL_POKEMON
];

interface BossRewardsCheatModalProps {
  onClose: () => void;
}

export const BossRewardsCheatModal: React.FC<BossRewardsCheatModalProps> = ({ onClose }) => {
  const { state, setState } = useGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [justAddedMap, setJustAddedMap] = useState<Record<string, number>>({});

  const filteredPokemon = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return SPECIAL_CHEAT_POKEMON_CATALOG;
    return SPECIAL_CHEAT_POKEMON_CATALOG.filter(entry => 
      entry.name.toLowerCase().includes(q) ||
      entry.nickname.toLowerCase().includes(q) ||
      entry.sourceTitle.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.moves.some(m => m.toLowerCase().includes(q))
    );
  }, [searchTerm]);

  const handleAddPokemon = async (entry: SpecialRewardEntry) => {
    if (addingId) return; // prevent spamming simultaneously
    try {
      setAddingId(entry.id);
      playMenuClick();

      // Generate the fresh Pokemon using the authoritative generator
      const rawPokemon = await entry.generatePokemon();
      const cleanPokemon = normalizePokemon(rawPokemon);

      // Assign a unique instance ID so multiple copies never collide
      const uniqueInstanceId = `${cleanPokemon.id}_cheat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      cleanPokemon.instanceId = uniqueInstanceId;

      setState(prev => {
        const nextBox = [...prev.player.box, cleanPokemon];
        const nextPokedex = { 
          ...prev.player.pokedex, 
          [cleanPokemon.id]: 'caught' as const 
        };

        return {
          ...prev,
          player: {
            ...prev.player,
            box: nextBox,
            pokedex: nextPokedex
          }
        };
      });

      playLevelUp();
      const displayName = cleanPokemon.nickname || cleanPokemon.name;
      setSuccessMsg(`✨ ${displayName} è stato aggiunto con successo al Box!`);
      
      // Update quick counter for this entry
      setJustAddedMap(prev => ({
        ...prev,
        [entry.id]: (prev[entry.id] || 0) + 1
      }));

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3500);
    } catch (err) {
      console.error("Failed to add special pokemon to box:", err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex flex-col text-slate-100 animate-in fade-in">
      {/* Top Header */}
      <header className="h-16 px-4 bg-slate-900 border-b border-purple-500/30 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-purple-300 transition-all cursor-pointer border border-purple-500/30 flex items-center gap-1.5 text-xs font-bold"
            title="Torna ai Trucchi"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Indietro</span>
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-pink-300 uppercase tracking-wider flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Ottieni Pokémon Boss & Speciali</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Aggiungi al Box le ricompense dei Boss leggendari con IV al 100%, Shiny e mosse esclusive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-950/90 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-xl font-mono font-bold">
            Nel Box: {state.player.box.length}
          </span>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Floating Success Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 text-center text-xs font-bold shadow-lg flex items-center justify-center gap-2 shrink-0 z-30"
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-spin" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Counter Toolbar */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 shrink-0 flex flex-col sm:flex-row gap-3 items-center justify-between z-10">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Cerca per Pokémon, soprannome, mossa o Boss..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 self-end sm:self-auto">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{filteredPokemon.length} di {SPECIAL_CHEAT_POKEMON_CATALOG.length} Pokémon Speciali</span>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar pb-24">
        {filteredPokemon.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-sm font-bold text-slate-400">Nessun Pokémon speciale trovato per "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-purple-900/50 hover:bg-purple-800/50 text-purple-300 rounded-xl text-xs font-bold transition-all border border-purple-500/40"
            >
              Mostra Tutti
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPokemon.map((entry) => {
              const isAdding = addingId === entry.id;
              const timesAdded = justAddedMap[entry.id] || 0;
              const artworkUrl = entry.isShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${entry.pokemonId}.png`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.pokemonId}.png`;
              const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.isShiny ? 'shiny/' : ''}${entry.pokemonId}.png`;

              return (
                <div 
                  key={entry.id}
                  className="bg-slate-900/90 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all p-4 shadow-md flex flex-col justify-between relative overflow-hidden group"
                >
                  {/* Background Aura */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

                  {/* Card Header & Badges */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>{entry.sourceTitle}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        {entry.isShiny && (
                          <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-400/20 border border-amber-400/50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Shiny</span>
                          </span>
                        )}
                        <span className="text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded-md">
                          Lv. {entry.level}
                        </span>
                      </div>
                    </div>

                    {/* Sprite & Info Header */}
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-950/80 rounded-2xl border border-slate-800 p-1 flex items-center justify-center shrink-0 relative shadow-inner">
                        <img 
                          src={artworkUrl} 
                          alt={entry.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackUrl;
                          }}
                          className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <h3 className="font-black text-sm text-white truncate">
                            {entry.nickname || entry.name}
                          </h3>
                        </div>
                        <p className="text-[10px] font-mono text-purple-300 font-medium">
                          #{entry.pokemonId} • {entry.name}
                        </p>
                        
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            IV 31/31/31 (100%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Moves List */}
                    <div className="space-y-1 mb-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Set Mosse Competitive:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {entry.moves.map((moveName, idx) => (
                          <div 
                            key={idx}
                            className="bg-slate-800/90 text-slate-200 text-[10px] font-bold px-2 py-1 rounded-lg truncate border border-slate-700/60 text-center"
                            title={moveName}
                          >
                            {moveName}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[10px] text-slate-400 leading-snug mb-3 italic">
                      "{entry.description}"
                    </p>
                  </div>

                  {/* Add to Box Action Button */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {timesAdded > 0 ? (
                        <span className="text-emerald-400 font-bold">Aggiunto x{timesAdded}</span>
                      ) : (
                        <span>Non ancora aggiunto</span>
                      )}
                    </span>

                    <button 
                      onClick={() => handleAddPokemon(entry)}
                      disabled={isAdding}
                      className={`px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 ${
                        timesAdded > 0
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                      }`}
                    >
                      {isAdding ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>Aggiunta...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Aggiungi al Box</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
