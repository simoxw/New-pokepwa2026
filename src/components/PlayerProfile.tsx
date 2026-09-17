import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { motion } from 'motion/react';
import { ChevronLeft, User, Palette, BarChart3, Award, Wallet, Smartphone, Sparkles, Check, Crown } from 'lucide-react';

interface AvatarOption {
  id: string;
  name: string;
  url: string;
}

interface HatOption {
  id: string;
  name: string;
  emoji: string;
}

interface TitleDef {
  id: string;
  name: string;
  description: string;
  isUnlocked: (state: any) => boolean;
  unlockHint: string;
}

const AVATARS: AvatarOption[] = [
  { id: 'red', name: 'Rosso (Classico)', url: 'https://play.pokemonshowdown.com/sprites/trainers/red.png' },
  { id: 'leaf', name: 'Foglia (Avventuriera)', url: 'https://play.pokemonshowdown.com/sprites/trainers/leaf.png' },
  { id: 'ethan', name: 'Oro (Retro Cap)', url: 'https://play.pokemonshowdown.com/sprites/trainers/ethan.png' },
  { id: 'lyra', name: 'Lyra (Trendy)', url: 'https://play.pokemonshowdown.com/sprites/trainers/lyra.png' },
  { id: 'lucas', name: 'Lucas (Berretto)', url: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png' },
  { id: 'dawn', name: 'Lucinda (Platino)', url: 'https://play.pokemonshowdown.com/sprites/trainers/dawn.png' },
  { id: 'colress', name: 'Cyber Hacker', url: 'https://play.pokemonshowdown.com/sprites/trainers/colress.png' },
  { id: 'guitarist', name: 'Gamer Punk', url: 'https://play.pokemonshowdown.com/sprites/trainers/guitarist.png' },
  { id: 'steven', name: 'Campione Supremo', url: 'https://play.pokemonshowdown.com/sprites/trainers/steven.png' },
  { id: 'scientist', name: 'Dev Full-Stack', url: 'https://play.pokemonshowdown.com/sprites/trainers/scientist.png' },
];

const HATS: HatOption[] = [
  { id: 'none', name: 'Nessuno', emoji: '' },
  { id: 'cap', name: 'Cappellino', emoji: '🧢' },
  { id: 'crown', name: 'Corona d\'Oro', emoji: '👑' },
  { id: 'tophat', name: 'Cilindro Tech', emoji: '🎩' },
  { id: 'headphones', name: 'Cuffie RGB', emoji: '🎧' },
  { id: 'goggles', name: 'Visore VR', emoji: '🥽' },
  { id: 'detective', name: 'Detective Bug', emoji: '🔍' },
  { id: 'helmet', name: 'Elmetto Cantiere', emoji: '🪖' },
  { id: 'bow', name: 'Fiocco Kawaii', emoji: '🎀' },
  { id: 'sunglasses', name: 'Occhiali Pixel', emoji: '🕶️' },
];

const TITLES: TitleDef[] = [
  {
    id: 'cacciatore-bug',
    name: '🐛 Cacciatore di Bug',
    description: 'Sempre a caccia di glitch nel codice di gioco.',
    isUnlocked: () => true,
    unlockHint: 'Disponibile per tutti i tester.'
  },
  {
    id: 're-lag',
    name: '⏳ Re del Lag',
    description: 'Gioca anche con 999ms di ping senza battere ciglio.',
    isUnlocked: () => true,
    unlockHint: 'Disponibile per tutti i giocatori.'
  },
  {
    id: 'maestro-save',
    name: '💾 Maestro del Salvataggio',
    description: 'Salva la partita 4 volte consecutive per sicurezza.',
    isUnlocked: () => true,
    unlockHint: 'Disponibile di default.'
  },
  {
    id: 'collezionista-ball',
    name: '⚪ Collezionista di Master Ball',
    description: 'Non sprecherà mai la Master Ball, nemmeno su Mewtwo.',
    isUnlocked: (s) => s.player.inventory.some((i: any) => i.id === 'master-ball' && i.count > 0) || (s.player.badges && s.player.badges.includes('reward-50')),
    unlockHint: 'Ottieni almeno 1 Master Ball (Premio Pokédex 50 o Lega).'
  },
  {
    id: 'eroe-fps',
    name: '🚀 Eroe dei 60 FPS',
    description: 'Ottimizza ogni singolo frame per un gameplay fluido.',
    isUnlocked: (s) => s.player.team.some((p: any) => p.level >= 40),
    unlockHint: 'Porta almeno un Pokémon della squadra al livello 40.'
  },
  {
    id: 'dev-caffeina',
    name: '☕ Dev a Caffeina',
    description: 'Alimentato esclusivamente da caffè e push git notturni.',
    isUnlocked: (s) => s.player.money >= 5000,
    unlockHint: 'Accumula almeno 5.000 PokéDollari nel portafoglio.'
  },
  {
    id: 'sterminatore-glitch',
    name: '💥 Sterminatore di Glitch',
    description: 'Ha ripulito le palestre dai crash di sistema.',
    isUnlocked: (s) => s.player.badges.filter((b: string) => !b.startsWith('reward')).length >= 5,
    unlockHint: 'Conquista almeno 5 Medaglie delle Palestre.'
  },
  {
    id: 'firewall-vivente',
    name: '🛡️ Firewall Vivente',
    description: 'Nessun attacco hacker può penetrare le sue difese.',
    isUnlocked: (s) => s.player.badges.filter((b: string) => !b.startsWith('reward')).length >= 8,
    unlockHint: 'Conquista almeno 8 Medaglie delle Palestre.'
  },
  {
    id: 'scalatore-infinito',
    name: '🗼 Scalatore del Server',
    description: 'Ha dominato i piani procedurali della Torre Lotta.',
    isUnlocked: (s) => (s.player.towerHighFloor || 0) >= 5,
    unlockHint: 'Supera almeno il Piano 5 della Torre Lotta Roguelike.'
  },
  {
    id: 'lead-architect',
    name: '👑 Lead Architect di PokePWA',
    description: 'Ha completato il rilascio in produzione battendo la Lega!',
    isUnlocked: (s) => (s.player.leagueVictories || 0) >= 1,
    unlockHint: 'Sconfiggi i Superquattro e il Campione al Datacenter.'
  }
];

export const PlayerProfile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, setState } = useGame();
  const [name, setName] = useState(state.player.name);
  const [selectedColor, setSelectedColor] = useState(state.player.spriteColor);
  const [selectedAvatar, setSelectedAvatar] = useState(state.player.avatarUrl || AVATARS[0].url);
  const [selectedHat, setSelectedHat] = useState(state.player.hatEmoji || '');
  const [selectedTitle, setSelectedTitle] = useState(state.player.title || TITLES[0].name);

  const colors = [
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Red', class: 'bg-red-500' },
    { name: 'Green', class: 'bg-emerald-500' },
    { name: 'Purple', class: 'bg-purple-500' },
    { name: 'Yellow', class: 'bg-yellow-500' },
    { name: 'Orange', class: 'bg-orange-500' },
    { name: 'Pink', class: 'bg-pink-500' },
    { name: 'Dark', class: 'bg-gray-800' },
  ];

  const handleSave = () => {
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        name: name.trim() || 'Allenatore',
        spriteColor: selectedColor,
        avatarUrl: selectedAvatar,
        hatEmoji: selectedHat,
        title: selectedTitle
      }
    }));
    onBack();
  };

  const pokedexValues = Object.values(state.player.pokedex);
  const seenCount = pokedexValues.length;
  const caughtCount = pokedexValues.filter(v => v === 'caught').length;

  return (
    <div className="h-full bg-slate-900 text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer text-gray-300 hover:text-white"
          >
            <ChevronLeft />
          </button>
          <div>
            <h2 className="font-black text-lg uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300">
              Scheda Allenatore
            </h2>
            <span className="text-[10px] text-gray-400 font-mono">Personalizzazione & Titoli</span>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 rounded-full font-black uppercase text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
        >
          Salva Scheda
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-28 max-w-xl mx-auto w-full">
        
        {/* Profile Trainer Card Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-white/10 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          
          {/* Avatar preview with hat overlay */}
          <div className="relative mb-3">
            <div className={`w-28 h-28 rounded-full ${selectedColor} flex items-center justify-center p-2 shadow-xl border-4 border-white/20 relative overflow-hidden`}>
              <img 
                src={selectedAvatar} 
                alt="Trainer Avatar" 
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            {selectedHat && (
              <span className="absolute -top-3 -right-2 text-3xl filter drop-shadow-lg animate-bounce">
                {selectedHat}
              </span>
            )}
          </div>

          <div className="w-full space-y-2">
            <div className="inline-block bg-purple-500/20 border border-purple-500/40 px-3 py-1 rounded-full mb-1">
              <span className="text-xs font-black text-purple-300 tracking-wider uppercase">
                {selectedTitle}
              </span>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">
                Nome Allenatore
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Inserisci nome..."
                maxLength={14}
                className="w-full max-w-xs bg-slate-950 border-2 border-white/10 rounded-2xl px-4 py-2.5 text-center font-black text-lg text-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Sprite / Avatar Selector */}
        <div className="space-y-3">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2 px-1">
            <User className="w-3.5 h-3.5 text-blue-400" /> Sprite Allenatore
          </h3>
          <div className="grid grid-cols-5 gap-2.5">
            {AVATARS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.url;
              return (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={`p-2 rounded-2xl border transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400 shadow-lg scale-105' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 opacity-70 hover:opacity-100'
                  }`}
                  title={avatar.name}
                >
                  <img src={avatar.url} alt={avatar.name} className="w-12 h-12 object-contain" />
                  <span className="text-[8px] font-bold text-gray-300 truncate w-full text-center mt-1">
                    {avatar.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hats / Accessories */}
        <div className="space-y-3">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2 px-1">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Accessori & Cappelli
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {HATS.map((hat) => {
              const isSelected = selectedHat === hat.emoji;
              return (
                <button
                  key={hat.id}
                  onClick={() => setSelectedHat(hat.emoji)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-500/30 border-amber-400 ring-2 ring-amber-400 scale-105 shadow-md' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl block">{hat.emoji || '❌'}</span>
                  <span className="text-[9px] font-bold text-gray-300 block truncate mt-1">
                    {hat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comical Titles Picker */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Titoli Comici dell'Allenatore
            </h3>
            <span className="text-[10px] text-purple-400 font-mono font-bold">
              {TITLES.filter(t => t.isUnlocked(state)).length} / {TITLES.length} Sbloccati
            </span>
          </div>

          <div className="space-y-2">
            {TITLES.map((title) => {
              const unlocked = title.isUnlocked(state);
              const isSelected = selectedTitle === title.name;

              return (
                <div
                  key={title.id}
                  onClick={() => {
                    if (unlocked) setSelectedTitle(title.name);
                  }}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    !unlocked
                      ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-purple-900/40 border-purple-400 ring-2 ring-purple-400 cursor-pointer shadow-lg'
                        : 'bg-slate-800/60 border-white/10 hover:bg-slate-800 hover:border-purple-500/40 cursor-pointer'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-white truncate">
                        {title.name}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] bg-purple-500 text-white font-bold px-1.5 py-0.2 rounded-full uppercase">
                          Equipaggiato
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                      {title.description}
                    </p>
                    {!unlocked && (
                      <p className="text-[10px] text-amber-400 font-mono mt-1">
                        🔒 Requisito: {title.unlockHint}
                      </p>
                    )}
                  </div>

                  {unlocked && (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-purple-500 border-purple-400 text-white' : 'border-white/20 text-transparent'
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2 px-1">
            <Palette className="w-3.5 h-3.5 text-pink-400" /> Sfondo Badge
          </h3>
          <div className="grid grid-cols-4 gap-2.5">
            {colors.map((color) => (
              <button
                key={color.class}
                onClick={() => setSelectedColor(color.class)}
                className={`h-10 rounded-xl transition-all relative cursor-pointer ${color.class} ${
                  selectedColor === color.class ? 'ring-4 ring-white/40 scale-105 shadow-lg' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {selectedColor === color.class && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Check className="w-4 h-4 drop-shadow" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Section */}
        <div className="space-y-3">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2 px-1">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> Statistiche di Carriera
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            <StatRow icon={<Wallet className="w-4 h-4 text-yellow-400" />} label="Saldo PokéDollari" value={`$${state.player.money.toLocaleString()}`} />
            <StatRow icon={<Smartphone className="w-4 h-4 text-indigo-400" />} label="Pokédex Catturati" value={`${caughtCount} specie`} />
            <StatRow icon={<Smartphone className="w-4 h-4 text-blue-400" />} label="Pokédex Visti" value={`${seenCount} specie`} />
            <StatRow icon={<Award className="w-4 h-4 text-emerald-400" />} label="Medaglie Palestra" value={`${state.player.badges.filter(b => !b.startsWith('reward')).length} / 10`} />
            <StatRow icon={<Crown className="w-4 h-4 text-amber-400" />} label="Vittorie alla Lega" value={`${state.player.leagueVictories || 0} titoli`} />
            <StatRow icon={<Sparkles className="w-4 h-4 text-purple-400" />} label="Record Torre Infinita" value={`Piano ${state.player.towerHighFloor || 0}`} />
            <StatRow icon={<User className="w-4 h-4 text-purple-400" />} label="Squadra Attiva" value={`${state.player.team.length} / 6`} />
          </div>
        </div>

      </div>
    </div>
  );
};

const StatRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-slate-800/80 p-3 rounded-2xl shadow-sm border border-white/10 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/5 rounded-xl border border-white/10">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{label}</span>
    </div>
    <span className="font-mono font-bold text-white text-xs sm:text-sm">{value}</span>
  </div>
);
