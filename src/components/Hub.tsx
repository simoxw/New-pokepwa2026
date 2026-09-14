import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { CHARACTERS, ZONES } from '../constants/game';
import { MapPin, MessageCircle, Play, Heart, Award, Lock, ScrollText } from 'lucide-react';
import { isAreaUnlocked } from '../lib/badges';

import { fullyHealPokemon } from '../lib/pokemonHeal';

export const Hub: React.FC = () => {
  const { state, setState } = useGame();
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
    "Cerca di completare il Pokédex. Non che serva a molto, ma almeno avrai qualcosa da fare invece di fissarmi."
  ];

  const goToZone = (zoneId: string) => {
    if (!isAreaUnlocked(zoneId, state.player.badges)) {
      setDialogue("Quella zona è chiusa! Sconfiggi i Capipalestra per ottenere le medaglie necessarie. Non farmi ripetere!");
      return;
    }
    setState(prev => ({
      ...prev,
      player: { ...prev.player, location: zoneId }
    }));
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
    if (totalIvs > 150) potential = "leggendario";
    else if (totalIvs > 120) potential = "eccellente";
    else if (totalIvs > 90) potential = "buono";
    else if (totalIvs > 60) potential = "mediocre";

    const randomMessage = PROF_MESSAGES[Math.floor(Math.random() * PROF_MESSAGES.length)];
    setDialogue(`Vediamo il tuo ${active.name}... Il suo potenziale è ${potential}. Ha accumulato ${totalEvs} EV. ${randomMessage}`);
  };

  const claimPokedexReward = () => {
    const pokedexValues = Object.values(state.player.pokedex) as ('seen' | 'caught')[];
    const caughtCount = pokedexValues.filter(s => s === 'caught').length;
    
    if (caughtCount >= 20 && !state.player.badges.includes('reward-20')) {
      setState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money + 5000,
          badges: [...prev.player.badges, 'reward-20']
        }
      }));
      setDialogue(`Ottimo! Hai catturato ${caughtCount} specie. Ecco 5000 PokéDollari per il tuo disturbo.`);
    } else if (caughtCount >= 10 && !state.player.badges.includes('reward-10')) {
      setState(prev => {
        const newInventory = [...prev.player.inventory];
        const ultraBall = newInventory.find(i => i.id === 'ultra-ball');
        if (ultraBall) {
          ultraBall.count += 5;
        } else {
          newInventory.push({ id: 'ultra-ball', name: 'Ultra Ball', description: 'Una ball molto potente.', count: 5, type: 'capture' } as any);
        }
        return {
          ...prev,
          player: {
            ...prev.player,
            inventory: newInventory,
            badges: [...prev.player.badges, 'reward-10']
          }
        };
      });
      setDialogue(`Notevole! Hai catturato ${caughtCount} specie. Prendi queste 5 Ultra Ball.`);
    } else {
      setDialogue(`Hai catturato ${caughtCount} specie. Torna quando ne avrai almeno 10 (o se ne hai già presi, aspetta che mi ricordi di te).`);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto pb-24">
      {/* Professor Section: Now Interactive */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={evaluateTeam}
        className="bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-500 relative mt-6 cursor-pointer active:scale-[0.98] transition-all hover:shadow-xl group"
      >
        <div className="absolute -top-10 left-4 w-16 h-16 transition-transform group-hover:scale-110">
          <img src={CHARACTERS.PROFESSOR.sprite} alt="Prof" className="w-full h-full object-contain drop-shadow-md" />
        </div>
        <div className="ml-16">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-black text-blue-600 uppercase italic tracking-tighter text-sm">{CHARACTERS.PROFESSOR.name}</h3>
            <div className="flex gap-1">
               <span className="text-[7px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase">Valutatore</span>
               <span className="text-[7px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase">Quest</span>
            </div>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-xs text-gray-700 font-bold leading-tight italic">"{dialogue}"</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-0.5 bg-gray-100 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ x: ["-100%", "100%"] }}
                 transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                 className="w-1/2 h-full bg-blue-400 opacity-30"
               />
            </div>
            <p className="text-[6px] text-gray-400 font-black uppercase tracking-[0.2em]">Interagisci</p>
          </div>
        </div>
      </motion.div>

      {/* Main Actions */}
      <div className="flex-1 grid grid-cols-2 gap-4 content-start">
        <ActionButton 
          icon={<Heart className={`${isHealing ? 'animate-pulse text-red-500' : 'text-red-500'}`} />} 
          label={isHealing ? "Curando..." : "Centro Pokémon"} 
          onClick={healTeam}
          color="border-red-500"
        />
        <ActionButton 
          icon={<MapPin className="text-emerald-500" />} 
          label="Esplora Zone" 
          onClick={() => setShowMap(true)}
          color="border-emerald-500"
        />
        <ActionButton 
          icon={<Award className="text-yellow-500" />} 
          label="Medaglie" 
          onClick={() => (window as any).onNavigate('badgecase')}
          color="border-yellow-500"
        />
        <ActionButton 
          icon={<span className="text-xl">📓</span>} 
          label="Premi Pokédex" 
          onClick={claimPokedexReward}
          color="border-indigo-500"
        />
        <ActionButton 
          icon={<span className="text-xl">🛒</span>} 
          label="Market" 
          onClick={() => (window as any).onNavigate('shop')}
          color="border-purple-500"
        />
        <ActionButton 
          icon={<span className="text-xl">📤</span>} 
          label="Scambio" 
          onClick={() => (window as any).onNavigate('trade')}
          color="border-orange-400"
        />
        <ActionButton 
          icon={<span className="text-xl">⚔️</span>} 
          label="Lotta Locale" 
          onClick={() => (window as any).onNavigate('local-battle')}
          color="border-red-400"
        />
        <ActionButton 
          icon={<span className="text-xl">📦</span>} 
          label="Box" 
          onClick={() => (window as any).onNavigate('box')}
          color="border-cyan-400"
        />
        <ActionButton 
          icon={<span className="text-xl">🎒</span>} 
          label="Zaino" 
          onClick={() => (window as any).onNavigate('inventory')}
          color="border-blue-400"
        />
        <ActionButton 
          icon={<ScrollText className="text-orange-500" />} 
          label="Missioni" 
          onClick={() => (window as any).onNavigate('quests')}
          color="border-orange-500"
        />
        <ActionButton 
          icon={<span className="text-xl">⚙️</span>} 
          label="Impostazioni" 
          onClick={() => (window as any).onNavigate('settings')}
          color="border-gray-400"
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
                const isUnlocked = isAreaUnlocked(zone.id, state.player.badges);
                return (
                  <button
                    key={zone.id}
                    onClick={() => goToZone(zone.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-colors shrink-0 ${
                      isUnlocked ? 'border-gray-100 active:bg-blue-50' : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="text-left">
                      <h4 className="font-bold flex items-center gap-2">
                        {zone.name}
                        {!isUnlocked && <Lock className="w-3 h-3 text-gray-400" />}
                      </h4>
                      <p className="text-xs text-gray-500">{isUnlocked ? zone.description : 'Area bloccata: richiede una medaglia.'}</p>
                    </div>
                    {isUnlocked ? <Play className="w-5 h-5 text-blue-500" /> : <Lock className="w-5 h-5 text-gray-400" />}
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

const ActionButton = ({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) => (
  <button 
    onClick={onClick}
    className={`bg-white py-3 px-4 rounded-3xl border-b-6 ${color} shadow-md active:translate-y-0.5 active:border-b-2 transition-all flex flex-col items-center gap-1.5`}
  >
    <div className="p-2 bg-gray-50 rounded-xl">
      {icon}
    </div>
    <span className="font-bold text-[10px] uppercase text-gray-700 leading-tight">{label}</span>
  </button>
);
