import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { 
  ChevronLeft, Copy, Download, Upload, Sparkles, Shuffle, 
  Share2, CheckCircle2, Globe, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { encodePokemon, decodePokemon } from '../lib/utils';
import { fetchPokemonData } from '../lib/pokeapi';
import { Pokemon } from '../types/game';

// Curated Wonder Trade Mystery Pool (Generations 1 - 9)
const WONDER_TRADE_POOL: number[] = [
  // Starters
  1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653, 656, 722, 725, 728, 810, 813, 816, 906, 909, 912,
  // Eeveelutions & Iconics
  25, 26, 133, 134, 135, 136, 196, 197, 470, 471, 700, 131, 143, 175, 447, 448, 570, 571, 778,
  // Dragons & Pseudo-Legendaries
  147, 148, 149, 246, 247, 248, 371, 372, 373, 374, 375, 376, 443, 444, 445, 633, 634, 635, 704, 705, 706, 782, 783, 784, 885, 886, 887, 996, 997, 998,
  // Tech, Steel, Ghost & Competitives
  81, 82, 92, 93, 94, 123, 137, 212, 233, 462, 466, 474, 479, 607, 609, 679, 680, 681, 821, 823, 848, 849, 935, 936, 937, 957, 959, 999,
  // Diverse fan-favorites
  37, 58, 63, 64, 65, 66, 77, 79, 125, 129, 130, 215, 228, 280, 282, 309, 328, 330, 349, 350, 359, 403, 405, 427, 461, 468, 472, 475, 546, 610, 663, 892, 921, 926
];

// Original Trainer (OT) Pool from various regions
const WONDER_TRAINERS: { name: string; region: string }[] = [
  { name: 'Red', region: 'Kanto' },
  { name: 'Leaf', region: 'Kanto' },
  { name: 'Blu', region: 'Kanto' },
  { name: 'Ethan', region: 'Johto' },
  { name: 'Lyra', region: 'Johto' },
  { name: 'Brendan', region: 'Hoenn' },
  { name: 'May', region: 'Hoenn' },
  { name: 'Lucas', region: 'Sinnoh' },
  { name: 'Camilla', region: 'Sinnoh' },
  { name: 'Hilbert', region: 'Unima' },
  { name: 'N', region: 'Unima' },
  { name: 'Serena', region: 'Kalos' },
  { name: 'Calem', region: 'Kalos' },
  { name: 'Elio', region: 'Alola' },
  { name: 'Selene', region: 'Alola' },
  { name: 'Gloria', region: 'Galar' },
  { name: 'Victor', region: 'Galar' },
  { name: 'Florian', region: 'Paldea' },
  { name: 'Juliana', region: 'Paldea' },
  { name: 'Nemona', region: 'Paldea' },
  { name: 'Arven', region: 'Paldea' },
  { name: 'Penny', region: 'Paldea' },
  { name: 'Hacker Neo', region: 'Cyberspazio' },
  { name: 'Ace Trainer Rick', region: 'Torre Lotta' }
];

type TradeTab = 'wonder' | 'direct';
type WonderStage = 'select' | 'connecting' | 'flying' | 'revealed';

export const Trade: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, setState } = useGame();
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState<TradeTab>('wonder');
  
  // Wonder Trade State
  const [wonderSource, setWonderSource] = useState<'team' | 'box'>('team');
  const [selectedOffer, setSelectedOffer] = useState<Pokemon | null>(null);
  const [wonderStage, setWonderStage] = useState<WonderStage>('select');
  const [partnerTrainer, setPartnerTrainer] = useState<{ name: string; region: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [receivedPokemon, setReceivedPokemon] = useState<Pokemon | null>(null);
  const [isShinyReceived, setIsShinyReceived] = useState<boolean>(false);

  // Direct Code Trade State
  const [selectedToExport, setSelectedToExport] = useState<Pokemon | null>(null);
  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Default offer selection to first team Pokémon if none selected
  useEffect(() => {
    if (!selectedOffer && state.player.team.length > 0) {
      setSelectedOffer(state.player.team[0]);
    }
  }, [state.player.team, selectedOffer]);

  // Handle direct export
  const handleExport = (p: Pokemon) => {
    const code = encodePokemon(p);
    setExportCode(code);
    setSelectedToExport(p);
    setCopiedSuccess(false);
  };

  // Direct code copy
  const handleCopyCode = () => {
    if (!exportCode) return;
    navigator.clipboard.writeText(exportCode);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Share via WhatsApp / Native Share
  const handleShareCode = async () => {
    if (!exportCode || !selectedToExport) return;
    const shareText = `🎮 Ti ho inviato ${selectedToExport.name} (Lv. ${selectedToExport.level}) su PokéPWA!\n\nCopia questo codice e incollalo nella schermata Scambio:\n${exportCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Scambio Pokémon: ${selectedToExport.name}`,
          text: shareText
        });
        return;
      } catch {
        // Fallback to whatsapp if canceled or unsupported
      }
    }
    
    // WhatsApp Fallback
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  // Handle direct import
  const handleImport = () => {
    const pokemon = decodePokemon(importCode);
    if (!pokemon) {
      alert("Codice non valido o corrotto! Verifica che la stringa sia completa.");
      return;
    }
    
    const importedPokemon: Pokemon = {
      ...pokemon,
      instanceId: `${pokemon.id}_${Math.random().toString(36).substring(2, 11)}_${Date.now()}_${Math.floor(Math.random() * 10000)}`
    };

    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        box: [...prev.player.box, importedPokemon],
        pokedex: { ...prev.player.pokedex, [importedPokemon.id]: 'caught' }
      }
    }));
    
    alert(`🎉 Hai ricevuto ${pokemon.name} (Lv. ${pokemon.level})! È stato aggiunto al tuo Box PC.`);
    setImportCode('');
  };

  // ==========================================
  // WONDER TRADE (SCAMBIO A SORPRESA) LOGIC
  // ==========================================
  const startWonderTrade = async () => {
    if (!selectedOffer) return;

    // Safety check: Cannot trade away if team only has 1 pokemon and offering from team
    if (wonderSource === 'team' && state.player.team.length <= 1) {
      alert("Non puoi scambiare il tuo unico Pokémon della squadra!");
      return;
    }

    // Choose partner trainer
    const trainer = WONDER_TRAINERS[Math.floor(Math.random() * WONDER_TRAINERS.length)];
    setPartnerTrainer(trainer);
    setWonderStage('connecting');
    setStatusMessage('Connessione al Wonder Network globale...');

    // Calculate level based on offered pokemon
    const baseLevel = selectedOffer.level || 5;
    const levelVariation = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const incomingLevel = Math.max(5, Math.min(100, baseLevel + levelVariation));

    // Choose mystery pokemon from pool
    const mysteryId = WONDER_TRADE_POOL[Math.floor(Math.random() * WONDER_TRADE_POOL.length)];
    // 1% Shiny chance on Wonder Trade
    const rollShiny = Math.random() < 0.01;
    setIsShinyReceived(rollShiny);

    try {
      // Step 1: Connecting sequence (1.2s)
      await new Promise(r => setTimeout(r, 1200));
      setStatusMessage(`Trovato! Allenatore ${trainer.name} (${trainer.region}) pronto allo scambio!`);
      
      // Step 2: Flying Pokeball sequence (1.4s)
      await new Promise(r => setTimeout(r, 1000));
      setWonderStage('flying');
      setStatusMessage(`Invio di ${selectedOffer.name}... Ricezione capsula in arrivo!`);

      // Fetch the actual Pokemon data in background
      let incomingPoke = await fetchPokemonData(mysteryId, incomingLevel);

      // Apply Shiny & OT Metadata
      if (rollShiny) {
        const shinySprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${mysteryId}.png`;
        incomingPoke = {
          ...incomingPoke,
          isShiny: true,
          sprites: {
            ...incomingPoke.sprites,
            front: shinySprite,
            artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${mysteryId}.png` || shinySprite
          }
        };
      }

      const finalizedPokemon: Pokemon = {
        ...incomingPoke,
        instanceId: `wt_${mysteryId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        originalTrainer: `${trainer.name} (${trainer.region})`,
        caughtLocation: 'Scambio Prodigioso'
      };

      await new Promise(r => setTimeout(r, 1400));

      // Update Game State: swap out offered pokemon, insert new pokemon
      const offeredId = selectedOffer.instanceId || selectedOffer.id;
      setState(prev => {
        let newTeam = [...prev.player.team];
        let newBox = [...prev.player.box];

        if (wonderSource === 'team') {
          const idx = newTeam.findIndex(p => (p.instanceId || p.id) === offeredId);
          if (idx !== -1) {
            newTeam[idx] = finalizedPokemon;
          } else {
            newTeam.push(finalizedPokemon);
          }
        } else {
          newBox = newBox.filter(p => (p.instanceId || p.id) !== offeredId);
          newBox.push(finalizedPokemon);
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            team: newTeam,
            box: newBox,
            pokedex: {
              ...prev.player.pokedex,
              [finalizedPokemon.id]: 'caught'
            }
          }
        };
      });

      setReceivedPokemon(finalizedPokemon);
      setWonderStage('revealed');
    } catch (e) {
      console.error("Wonder Trade error:", e);
      alert("Errore di connessione durante lo scambio a sorpresa. Riprova tra poco.");
      setWonderStage('select');
    }
  };

  const handleResetWonderTrade = () => {
    setWonderStage('select');
    setReceivedPokemon(null);
    setPartnerTrainer(null);
    if (state.player.team.length > 0) {
      setSelectedOffer(state.player.team[0]);
    }
  };

  // Available Pokémon list based on wonderSource selection
  const availablePokemons = useMemo(() => {
    return wonderSource === 'team' ? state.player.team : state.player.box;
  }, [wonderSource, state.player.team, state.player.box]);

  return (
    <div className="h-full bg-slate-950 text-white flex flex-col relative overflow-hidden font-sans select-none">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Header */}
      <div className="shrink-0 p-3 sm:p-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md flex items-center justify-between z-10 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={onBack} 
            className="p-1.5 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white rounded-full transition-all cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="font-black text-sm sm:text-base uppercase tracking-wider text-white flex items-center gap-1.5 truncate">
              <Shuffle className="w-4 h-4 text-cyan-400 shrink-0" />
              Centro Scambi
            </h2>
            <p className="text-[10px] text-slate-400 truncate hidden xs:block">
              Wonder Trade & Scambio Codice Amico
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => { setActiveTab('wonder'); handleResetWonderTrade(); }}
            className={`px-2.5 py-1 rounded-lg font-black text-[11px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'wonder' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>A Sorpresa</span>
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-2.5 py-1 rounded-lg font-black text-[11px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'direct' 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3 h-3" />
            <span>Codice Amico</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 z-10 space-y-4 pb-28">
        
        {/* ========================================================================= */}
        {/* TAB 1: WONDER TRADE (SCAMBIO A SORPRESA) */}
        {/* ========================================================================= */}
        {activeTab === 'wonder' && (
          <div className="max-w-lg w-full mx-auto space-y-4">
            
            {/* STAGE: SELECT POKÉMON */}
            {wonderStage === 'select' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3.5"
              >
                {/* Info Card */}
                <div className="bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border border-cyan-500/30 rounded-2xl p-3 flex items-center gap-3 shadow-md">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl border border-cyan-500/30 flex items-center justify-center shrink-0 text-xl">
                    🎲
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-cyan-300 tracking-wider">
                      Wonder Trade Globale
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      Scegli un Pokémon: riceverai subito un Pokémon a sorpresa con livello bilanciato!
                    </p>
                  </div>
                </div>

                {/* Source Picker: Squadra vs Box */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Scegli Pokémon da:
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setWonderSource('team');
                        if (state.player.team.length > 0) setSelectedOffer(state.player.team[0]);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        wonderSource === 'team'
                          ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Squadra ({state.player.team.length})
                    </button>
                    <button
                      onClick={() => {
                        setWonderSource('box');
                        if (state.player.box.length > 0) setSelectedOffer(state.player.box[0]);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        wonderSource === 'box'
                          ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Box PC ({state.player.box.length})
                    </button>
                  </div>
                </div>

                {/* Horizontal Pokemon Selector List */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5">
                  {availablePokemons.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-xs">
                      Nessun Pokémon disponibile in questa sezione.
                    </div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
                      {availablePokemons.map((p, i) => {
                        const isSelected = (selectedOffer?.instanceId || selectedOffer?.id) === (p.instanceId || p.id);
                        return (
                          <button
                            key={`wt-offer-${p.instanceId || p.id}-${i}`}
                            onClick={() => setSelectedOffer(p)}
                            className={`relative flex-shrink-0 w-16 h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-between p-1 cursor-pointer ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-950/80 shadow-md shadow-cyan-500/20 scale-105'
                                : 'border-slate-800 bg-slate-950 hover:border-slate-700 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <span className="text-[9px] font-black text-slate-300">
                              Lv.{p.level}
                            </span>
                            <img
                              src={p?.sprites?.front || (p as any)?.spriteUrl}
                              alt={p.name}
                              className="w-9 h-9 object-contain drop-shadow"
                            />
                            <span className="text-[8px] font-bold text-white truncate max-w-[56px] uppercase">
                              {p.nickname || p.name}
                            </span>
                            {p.isShiny && (
                              <span className="absolute top-0.5 right-0.5 text-[9px]">✨</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected Pokémon Highlight Card */}
                {selectedOffer && (
                  <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-14 h-14 bg-slate-950 rounded-xl border border-cyan-500/30 flex items-center justify-center p-1 shrink-0">
                        <img
                          src={selectedOffer?.sprites?.front || (selectedOffer as any)?.spriteUrl}
                          alt={selectedOffer.name}
                          className="w-full h-full object-contain"
                        />
                        {selectedOffer.isShiny && (
                          <span className="absolute -top-1 -right-1 text-[10px]">✨</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <h4 className="font-black text-sm uppercase text-white truncate">
                            {selectedOffer.nickname || selectedOffer.name}
                          </h4>
                          <span className="text-[11px] font-bold text-cyan-400 shrink-0">
                            Lv.{selectedOffer.level}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {selectedOffer.types.map(t => (
                            <span
                              key={t}
                              className="text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase bg-slate-800 text-slate-300 border border-slate-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          Natura: <span className="text-slate-200 font-bold">{selectedOffer.nature || 'Docile'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                        Pronto per
                      </span>
                      <span className="text-[11px] font-black uppercase text-cyan-400">
                        Lo Scambio
                      </span>
                    </div>
                  </div>
                )}

                {/* Action CTA Button */}
                <button
                  onClick={startWonderTrade}
                  disabled={!selectedOffer}
                  className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-slate-950 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Avvia Scambio a Sorpresa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STAGE: CONNECTING & ANIMATION */}
            {(wonderStage === 'connecting' || wonderStage === 'flying') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 text-center space-y-5 shadow-2xl relative overflow-hidden"
              >
                {/* Animated Radar */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/50"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-2 rounded-full bg-cyan-500/20 blur-md"
                  />

                  {wonderStage === 'connecting' ? (
                    <motion.div
                      animate={{ scale: [0.9, 1.1, 0.9] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="text-3xl"
                    >
                      🌐
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ y: [-10, 10, -10], rotate: [0, 180, 360] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="text-3xl"
                    >
                      🔮
                    </motion.div>
                  )}
                </div>

                {/* Partner Trainer Badge if found */}
                {partnerTrainer && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-1.5 bg-slate-950 border border-cyan-500/40 px-3 py-1 rounded-full text-[11px] font-bold text-cyan-300 shadow-inner"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Partner: <strong className="text-white">{partnerTrainer.name}</strong> ({partnerTrainer.region})</span>
                  </motion.div>
                )}

                {/* Animated Status Message */}
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-black text-white tracking-wide animate-pulse">
                    {statusMessage}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Sincronizzazione della capsula in corso...
                  </p>
                </div>
              </motion.div>
            )}

            {/* STAGE: REVEALED NEW POKÉMON */}
            {wonderStage === 'revealed' && receivedPokemon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-amber-400/40 rounded-2xl overflow-hidden shadow-2xl space-y-3.5"
              >
                {/* Header Ribbon */}
                <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 py-2 px-3 text-center shadow-xs">
                  <div className="flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-100 animate-spin" style={{ animationDuration: '6s' }} />
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-950">
                      Scambio Riuscito!
                    </h3>
                    <Sparkles className="w-4 h-4 text-yellow-100 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-950/90">
                    Hai ricevuto un nuovo Pokémon da {receivedPokemon.originalTrainer || 'un Allenatore Misterioso'}!
                  </p>
                </div>

                {/* Pokémon Presentation Card */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-inner">
                    <div className="relative w-20 h-20 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl border border-amber-400/30 flex items-center justify-center p-1 shrink-0">
                      <img
                        src={receivedPokemon.sprites?.artwork || receivedPokemon.sprites?.front || (receivedPokemon as any)?.spriteUrl}
                        alt={receivedPokemon.name}
                        className="w-full h-full object-contain drop-shadow"
                      />
                      {isShinyReceived && (
                        <span className="absolute top-1 right-1 bg-yellow-400 text-slate-950 text-[8px] font-black px-1 py-0.2 rounded-full uppercase">
                          ✨ SHINY!
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-black uppercase text-white truncate">
                          {receivedPokemon.name}
                        </h4>
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                          Lv.{receivedPokemon.level}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        {receivedPokemon.types.map(t => (
                          <span
                            key={t}
                            className="text-[8px] font-black px-2 py-0.2 rounded-full uppercase bg-slate-800 text-slate-200 border border-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="text-[10px] text-slate-400 space-y-0.2 pt-0.5">
                        <p className="truncate">AO: <span className="text-cyan-300 font-bold">{receivedPokemon.originalTrainer || 'Wonder Network'}</span></p>
                        <p>Natura: <span className="text-white font-bold">{receivedPokemon.nature || 'Docile'}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Moves Grid */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                      Mosse Conosciute:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {receivedPokemon.moves.slice(0, 4).map((m, idx) => (
                        <div
                          key={`rec-move-${m.name}-${idx}`}
                          className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 flex items-center justify-between"
                        >
                          <span className="text-[10px] font-black uppercase text-white truncate">
                            {m.name}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase shrink-0 ml-1">
                            {m.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Complete & Repeat Buttons */}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handleResetWonderTrade}
                      className="flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                      Altro Scambio
                    </button>
                    <button
                      onClick={onBack}
                      className="flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                      Chiudi
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DIRECT PEER-TO-PEER CODE TRADE (AMICI / WHATSAPP) */}
        {/* ========================================================================= */}
        {activeTab === 'direct' && (
          <div className="max-w-lg w-full mx-auto space-y-4">
            
            {/* Export Code Section */}
            <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <h3 className="font-black text-xs uppercase text-purple-300 tracking-wider">
                  1. Genera Codice da Inviare
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Seleziona un Pokémon della tua squadra per generare il codice o inviarlo via WhatsApp.
              </p>

              {/* Horizontal Team Picker */}
              <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                {state.player.team.map((p, i) => {
                  const isSelected = selectedToExport?.instanceId === p.instanceId;
                  return (
                    <button
                      key={`direct-exp-${p.instanceId || p.id}-${i}`}
                      onClick={() => handleExport(p)}
                      className={`flex-shrink-0 w-16 h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-between p-1 cursor-pointer ${
                        isSelected
                          ? 'border-purple-400 bg-purple-950/70 shadow-md shadow-purple-500/20 scale-105'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-slate-400">Lv.{p.level}</span>
                      <img
                        src={p?.sprites?.front || (p as any)?.spriteUrl}
                        alt={p.name}
                        className="w-9 h-9 object-contain"
                      />
                      <span className="text-[8px] font-bold text-white truncate max-w-[52px] uppercase">
                        {p.nickname || p.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Generated Code Display & Sharing Action */}
              {exportCode && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-950 border border-dashed border-purple-500/40 rounded-xl p-3 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-300 uppercase truncate">
                      Codice per: <strong className="text-white">{selectedToExport?.name}</strong>
                    </span>
                    {copiedSuccess && (
                      <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 animate-pulse shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Copiato!
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg text-[9px] break-all font-mono text-slate-300 border border-slate-800 max-h-16 overflow-y-auto select-all">
                    {exportCode}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      onClick={handleCopyCode}
                      className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-[11px] uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Copy className="w-3 h-3 text-purple-400" />
                      Copia Codice
                    </button>
                    <button
                      onClick={handleShareCode}
                      className="py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-[11px] uppercase flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <Share2 className="w-3 h-3 text-slate-950" />
                      Condividi / WhatsApp
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Import Code Section */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-lg">
              <div className="flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <h3 className="font-black text-xs uppercase text-emerald-300 tracking-wider">
                  2. Riscatta Codice Ricevuto
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Incolla qui il codice Base64 per aggiungere il Pokémon direttamente al tuo Box PC.
              </p>

              <textarea
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Incolla qui il codice di scambio..."
                className="w-full bg-slate-950 rounded-xl p-2.5 text-[11px] font-mono text-slate-200 border border-slate-800 focus:border-emerald-500 focus:outline-none min-h-[70px] resize-none"
              />

              <button
                onClick={handleImport}
                disabled={!importCode.trim()}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider disabled:opacity-40 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Importa Pokémon nel Box
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
