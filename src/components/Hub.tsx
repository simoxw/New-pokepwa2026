import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { CHARACTERS, ZONES } from '../constants/game';
import { MapPin, MessageCircle, Play, Heart, Award, Lock, ScrollText, Phone, Moon, Sun, Sunset, Sparkles } from 'lucide-react';
import { isAreaUnlocked } from '../lib/badges';
import { useDayNight } from '../hooks/useDayNight';

import { fullyHealPokemon } from '../lib/pokemonHeal';

export const Hub: React.FC = () => {
  const { state, setState } = useGame();
  const { isNight, isSunset, formattedTime, override, toggleOverride } = useDayNight();
  const [showMap, setShowMap] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [dialogue, setDialogue] = useState<string>("Ah, sei ancora qui? Pensavo ti fossi perso nel caricamento. Vai a farti un giro nel Bosco dei Selfie!");

  const PROF_MESSAGES = [
    "Sapevi che alcuni Pokémon leggendari si nascondono nelle zone più pericolose? Io però preferisco stare qui a guardare il muro.",
    "Gino il Bullo mi ha detto che sei un disastro. Gli ho risposto che almeno tu non usi solo 'Colpo Coda'.",
    "Hai visto la Spiaggia del Refresh? Pare che Magikarp lì sia convinto di essere un drago. Povero illuso.",
    "Il Cimitero dei Pixel è spaventoso... dicono che vi vaghino i file corrotti dei salvataggi perduti.",
    "Se trovi un Pokémon cromatico, catturalo! O lascialo scappare, tanto io non guadagno nulla comunque.",
    "Nel Vulcano fa un caldo pazzesco. Ottimo per cuocere le uova, pessimo per la mia pressione.",
    "La Grotta del Debug è un labirinto. Molti sono entrati, pochi ne sono usciti senza un errore di sistema.",
    "Cerca di completare il Pokédex. Non che serva a molto, ma almeno avrai qualcosa da fare invece di fissarmi.",
    "Ho sentito che il Team Eclipse sta tramando qualcosa... Ma finché non mi staccano l'ADSL, non mi interessa.",
    "Tuo padre era un grande allenatore. Oppure era un postino, non ricordo bene, i miei file sono un po' frammentati.",
    "I Pokémon multi-colpo sono utili contro i Sostituti. Peccato che non abbiamo ancora implementato 'Sostituto'.",
    "Se un Pokémon deve ricaricarsi, è vulnerabile. È come quando il mio PC decide di fare gli aggiornamenti di Windows."
  ];

  const goToZone = (zoneId: string) => {
    if (zoneId === 'datacenter-lega') {
      openLeague();
      setShowMap(false);
      return;
    }

    if (zoneId === 'area-zero' && (state.player.leagueVictories || 0) < 1) {
      setDialogue("⚠️ ACCESSO NEGATO: L'Area Zero Digitale è protetta da crittografia quantistica! Solo chi ha sconfitto la Lega Pokémon e conquistato il titolo di Campione può entrarvi.");
      return;
    }

    if (!isAreaUnlocked(zoneId, state.player.badges, state.player.leagueVictories || 0)) {
      setDialogue("Quella zona è chiusa! Sconfiggi i Capipalestra per ottenere le medaglie necessarie. Non farmi ripetere!");
      return;
    }
    setState(prev => ({
      ...prev,
      player: { ...prev.player, location: zoneId }
    }));
  };

  const openLeague = () => {
    if (state.player.badges.length < 10) {
      setDialogue(`Accesso Negato al Datacenter della Lega! Hai ${state.player.badges.length}/10 Medaglie. Devi prima battere tutti i 10 Capipalestra (fino ad Admin Root all'Isola del Server) per ottenere i permessi di Root!`);
      return;
    }
    (window as any).onNavigate('league');
  };

  const healTeam = async () => {
    if (isHealing) return;
    setIsHealing(true);
    setDialogue("Sto curando i tuoi Pokémon... spero che tu li tratti meglio di come tratti la tua connessione internet.");
    
    await new Promise(r => setTimeout(r, 2000));
    
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        team: prev.player.team.map(p => fullyHealPokemon(p))
      }
    }));
    
    setIsHealing(false);
    setDialogue("Fatto! Ora sparisci, ho delle ricerche importanti da ignorare.");
  };

  const evaluateTeam = () => {
    const active = state.player.team[0];
    if (!active) {
      setDialogue("Ma non hai Pokémon! Sei più smemorato di me.");
      return;
    }

    const totalIvs = (Object.values(active.ivs) as number[]).reduce((a, b) => a + b, 0);
    const totalEvs = (Object.values(active.evs) as number[]).reduce((a, b) => a + b, 0);
    
    let potential = "scandaloso";
    let color = "text-red-500";
    if (totalIvs > 160) { potential = "ECCELSO (DIVINO)"; color = "text-purple-600"; }
    else if (totalIvs > 140) { potential = "LEGGENDARIO"; color = "text-orange-500"; }
    else if (totalIvs > 120) { potential = "ECCELLENTE"; color = "text-emerald-500"; }
    else if (totalIvs > 90) { potential = "BUONO"; color = "text-blue-500"; }
    else if (totalIvs > 60) { potential = "MEDIOCRE"; color = "text-yellow-600"; }

    const randomMessage = PROF_MESSAGES[Math.floor(Math.random() * PROF_MESSAGES.length)];
    setDialogue(`Analisi del tuo ${active.name}: il potenziale genetico è ${potential}. IV totali: ${totalIvs}/186. EV accumulate: ${totalEvs}. ${randomMessage}`);
  };

  const claimPokedexReward = () => {
    const pokedexValues = Object.values(state.player.pokedex) as ('seen' | 'caught')[];
    const caughtCount = pokedexValues.filter(s => s === 'caught').length;
    
    const rewards = [
      { threshold: 100, id: 'reward-100', msg: "INCREDIBILE! Hai completato quasi tutto! Ecco 50.000 PokéDollari e il Diploma di Eccellenza.", money: 50000 },
      { threshold: 75, id: 'reward-75', msg: "75 specie! Sei un vero esperto. Prendi questi 20.000 PokéDollari.", money: 20000 },
      { threshold: 50, id: 'reward-50', msg: "Metà strada! 50 specie catturate. Ti affido questa Master Ball e 10.000 PokéDollari.", money: 10000, items: [{ id: 'master-ball', count: 1 }] },
      { threshold: 40, id: 'reward-40', msg: "40 specie? Non male. Ecco 3 Caramelle Rare per i tuoi sforzi.", items: [{ id: 'caramella-rara', count: 3 }] },
      { threshold: 30, id: 'reward-30', msg: "30 specie catturate. Ecco 10 Ultra Ball per continuare la ricerca.", items: [{ id: 'ultra-ball', count: 10 }] },
      { threshold: 20, id: 'reward-20', msg: "20 specie. Ecco 5.000 PokéDollari per il tuo disturbo.", money: 5000 },
      { threshold: 10, id: 'reward-10', msg: "10 specie catturate. Iniziamo a ragionare. Ecco 5 Ultra Ball.", items: [{ id: 'ultra-ball', count: 5 }] },
    ];

    const availableReward = rewards.find(r => caughtCount >= r.threshold && !state.player.badges.includes(r.id));

    if (availableReward) {
      setState(prev => {
        let newInventory = [...prev.player.inventory];
        let newMoney = prev.player.money + (availableReward.money || 0);

        if (availableReward.items) {
          availableReward.items.forEach(rewardItem => {
            const itemInInv = newInventory.find(i => i.id === rewardItem.id);
            if (itemInInv) {
              itemInInv.count += rewardItem.count;
            } else {
              // Should find existing item template or create one
              // For simplicity, we assume common items exist or we add them
              const names: Record<string, string> = { 'master-ball': 'Master Ball', 'caramella-rara': 'Caramella Rara', 'ultra-ball': 'Ultra Ball' };
              newInventory.push({ 
                id: rewardItem.id, 
                name: names[rewardItem.id] || rewardItem.id, 
                description: 'Premio del Professore.', 
                count: rewardItem.count, 
                type: rewardItem.id.includes('ball') ? 'capture' : 'other' 
              } as any);
            }
          });
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            money: newMoney,
            inventory: newInventory,
            badges: [...prev.player.badges, availableReward.id]
          }
        };
      });
      setDialogue(availableReward.msg);
    } else {
      setDialogue(`Hai catturato ${caughtCount} specie. ${caughtCount < 10 ? 'Torna quando ne avrai almeno 10.' : 'Al momento non ho nuovi premi per te, continua così!'}`);
    }
  };

  return (
    <div className={`p-4 sm:p-6 h-full flex flex-col gap-4 sm:gap-6 overflow-y-auto pb-24 transition-colors duration-700 ${
      isNight 
        ? 'bg-slate-950 text-white' 
        : isSunset 
          ? 'bg-gradient-to-b from-amber-950/20 to-slate-900/10 text-slate-900' 
          : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Real-time Day/Night & Atmosphere Bar */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between backdrop-blur-md transition-all ${
        isNight 
          ? 'bg-slate-900/80 border-purple-500/40 shadow-lg shadow-purple-950/50' 
          : isSunset 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900' 
            : 'bg-white/80 border-black/5 shadow-xs'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl text-lg ${
            isNight ? 'bg-purple-950 text-purple-300 shadow-inner' : isSunset ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-500'
          }`}>
            {isNight ? <Moon className="w-4 h-4 text-purple-300 animate-pulse" /> : isSunset ? <Sunset className="w-4 h-4 text-amber-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">
                {isNight ? 'Villaggio Setup • Luci al Neon Attive' : isSunset ? 'Villaggio Setup • Ora Dorata' : 'Villaggio Setup • Luce Diurna'}
              </span>
              {isNight && (
                <span className="text-[9px] bg-pink-500/20 text-pink-300 border border-pink-500/40 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                  NEON 24/7
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              Orario Reale Dispositivo: {formattedTime} {override ? `(Anteprima forzata: ${override})` : '(Sincronizzato)'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleOverride}
          className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer bg-white/5 hover:bg-white/10 active:scale-95 text-gray-400 hover:text-white border-white/10"
          title="Alterna modalità Giorno/Notte/Auto"
        >
          {override ? `Reset Auto` : `Simula`}
        </button>
      </div>

      {/* Professor Section: Now Interactive */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={evaluateTeam}
        className={`rounded-2xl p-4 shadow-lg border-2 relative mt-4 cursor-pointer active:scale-[0.98] transition-all hover:shadow-xl group ${
          isNight 
            ? 'bg-slate-900 border-purple-500/60 shadow-purple-950/40' 
            : 'bg-white border-blue-500'
        }`}
      >
        <div className="absolute -top-10 left-4 w-16 h-16 transition-transform group-hover:scale-110 pointer-events-none">
          <img src={CHARACTERS.PROFESSOR.sprite} alt="Prof" className="w-full h-full object-contain drop-shadow-md" />
        </div>

        {/* Top bar with Name & Badges */}
        <div className="flex justify-between items-center pl-16 min-h-[32px] mb-2.5">
          <h3 className={`font-black uppercase italic tracking-tighter text-sm ${
            isNight ? 'text-purple-300' : 'text-blue-600'
          }`}>{CHARACTERS.PROFESSOR.name}</h3>
          <div className="flex gap-1">
             <span className={`text-[7px] px-2 py-0.5 rounded-full font-black uppercase ${
               isNight ? 'bg-purple-950 text-purple-300' : 'bg-blue-100 text-blue-600'
             }`}>Valutatore</span>
             <span className={`text-[7px] px-2 py-0.5 rounded-full font-black uppercase ${
               isNight ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-600'
             }`}>Quest</span>
          </div>
        </div>

        {/* Full-width dialogue box */}
        <div className="w-full">
          <div className={`p-3 rounded-xl border-2 border-dashed ${
            isNight ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-xs font-bold leading-relaxed italic ${
              isNight ? 'text-gray-200' : 'text-gray-700'
            }`}>"{dialogue}"</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-0.5 bg-gray-500/20 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ x: ["-100%", "100%"] }}
                 transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                 className={`w-1/2 h-full ${isNight ? 'bg-purple-400' : 'bg-blue-400'} opacity-30`}
               />
            </div>
            <p className="text-[7px] text-gray-400 font-black uppercase tracking-[0.2em]">Tocca per interagire</p>
          </div>
        </div>
      </motion.div>

      {/* Main Actions */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 content-start">
        <ActionButton 
          icon={<Heart className={`${isHealing ? 'animate-pulse text-red-500' : 'text-red-500'}`} />} 
          label={isHealing ? "Curando..." : isNight ? "Centro Pokémon [24/7]" : "Centro Pokémon"} 
          onClick={healTeam}
          color="border-red-500"
          isNight={isNight}
          badge={isNight ? "NEON" : undefined}
        />
        <ActionButton 
          icon={<MapPin className="text-emerald-500" />} 
          label="Esplora Zone" 
          onClick={() => setShowMap(true)}
          color="border-emerald-500"
          isNight={isNight}
        />
        <ActionButton 
          icon={<span className="text-xl">🗼</span>} 
          label={(state.player.towerHighFloor || 0) > 0 ? `Torre (P.${state.player.towerHighFloor})` : "Torre Lotta"} 
          onClick={() => (window as any).onNavigate('tower')}
          color="border-emerald-400"
          isNight={isNight}
          badge="ROGUELIKE"
        />
        <ActionButton 
          icon={<span className="text-xl">👑</span>} 
          label={state.player.badges.length >= 10 ? "Lega Pokémon" : "Lega (10 Med.)"} 
          onClick={openLeague}
          color="border-purple-600"
          isNight={isNight}
        />
        <ActionButton 
          icon={<span className="text-xl">📦</span>} 
          label="Box" 
          onClick={() => (window as any).onNavigate('box')}
          color="border-cyan-400"
          isNight={isNight}
        />
        <ActionButton 
          icon={<Phone className="text-blue-400" />} 
          label="Sfidofono" 
          onClick={() => (window as any).onNavigate('sfidofono')}
          color="border-blue-400"
          isNight={isNight}
        />
        <ActionButton 
          icon={<span className="text-xl">📓</span>} 
          label="Premi Pokédex" 
          onClick={claimPokedexReward}
          color="border-indigo-500"
          isNight={isNight}
        />
        <ActionButton 
          icon={<span className="text-xl">🛒</span>} 
          label="Market" 
          onClick={() => (window as any).onNavigate('shop')}
          color="border-purple-500"
          isNight={isNight}
        />
        <ActionButton 
          icon={<span className="text-xl">📤</span>} 
          label="Scambio" 
          onClick={() => (window as any).onNavigate('trade')}
          color="border-orange-400"
          isNight={isNight}
        />
        <ActionButton 
          icon={<span className="text-xl">⚔️</span>} 
          label="Lotta Locale" 
          onClick={() => (window as any).onNavigate('local-battle')}
          color="border-red-400"
          isNight={isNight}
        />
        <ActionButton 
          icon={<Award className="text-yellow-500" />} 
          label="Medaglie" 
          onClick={() => (window as any).onNavigate('badgecase')}
          color="border-yellow-500"
          isNight={isNight}
        />
        <ActionButton 
          icon={<span className="text-xl">🎒</span>} 
          label="Zaino" 
          onClick={() => (window as any).onNavigate('inventory')}
          color="border-blue-400"
          isNight={isNight}
        />
        <ActionButton 
          icon={<ScrollText className="text-orange-500" />} 
          label="Missioni" 
          onClick={() => (window as any).onNavigate('quests')}
          color="border-orange-500"
          isNight={isNight}
        />
        <ActionButton 
          icon={<span className="text-xl">⚙️</span>} 
          label="Impostazioni" 
          onClick={() => (window as any).onNavigate('settings')}
          color="border-gray-400"
          isNight={isNight}
        />
      </div>

      {/* Zone Selector Overlay */}
      {showMap && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end">
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="w-full bg-white rounded-t-3xl p-6 pb-12"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Mappa delle Zone</h2>
              <button onClick={() => setShowMap(false)} className="p-2 bg-gray-100 rounded-full">✕</button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {ZONES.filter(z => z.id !== 'villaggio').map(zone => {
                const isAreaZero = zone.id === 'area-zero';
                const isUnlocked = isAreaUnlocked(zone.id, state.player.badges, state.player.leagueVictories || 0);
                const lockReason = isAreaZero 
                  ? 'Accesso riservato: sconfiggi la Lega Pokémon per sbloccare!' 
                  : (zone.id === 'datacenter-lega' ? 'Richiede 10 Medaglie per entrare.' : 'Area bloccata: richiede una medaglia.');
                
                return (
                  <button
                    key={zone.id}
                    onClick={() => goToZone(zone.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all shrink-0 text-left ${
                      isAreaZero && isUnlocked
                        ? 'border-purple-300 bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 shadow-md shadow-purple-100'
                        : isUnlocked 
                          ? 'border-gray-100 active:bg-blue-50' 
                          : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="text-left pr-2">
                      <h4 className="font-bold flex items-center gap-2">
                        <span>{zone.name}</span>
                        {isAreaZero && isUnlocked && (
                          <span className="text-[10px] bg-purple-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Post-Game
                          </span>
                        )}
                        {!isUnlocked && <Lock className="w-3 h-3 text-gray-400 shrink-0" />}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{isUnlocked ? zone.description : lockReason}</p>
                    </div>
                    {isUnlocked ? (
                      <div className={`p-2 rounded-xl shrink-0 ${isAreaZero ? 'bg-purple-600 text-white' : 'bg-blue-500 text-white'}`}>
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-gray-200 text-gray-400 shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ 
  icon, 
  label, 
  onClick, 
  color, 
  isNight, 
  badge 
}: { 
  icon: React.ReactNode, 
  label: string, 
  onClick: () => void, 
  color: string, 
  isNight?: boolean, 
  badge?: string 
}) => (
  <button 
    onClick={onClick}
    className={`py-3 px-3.5 sm:px-4 rounded-3xl border-b-6 ${color} shadow-md active:translate-y-0.5 active:border-b-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer relative overflow-hidden ${
      isNight 
        ? 'bg-slate-900 border-white/10 hover:border-white/30 text-white shadow-black/50' 
        : 'bg-white text-gray-800'
    }`}
  >
    {badge && (
      <span className="absolute top-1.5 right-1.5 text-[8px] font-black font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
        {badge}
      </span>
    )}
    <div className={`p-2 rounded-xl ${isNight ? 'bg-white/5' : 'bg-gray-50'}`}>
      {icon}
    </div>
    <span className={`font-bold text-[10px] uppercase leading-tight text-center ${
      isNight ? 'text-gray-200' : 'text-gray-700'
    }`}>
      {label}
    </span>
  </button>
);
