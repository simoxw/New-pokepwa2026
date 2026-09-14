import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { motion } from 'motion/react';
import { ChevronLeft, User, Palette, BarChart3, Award, Wallet, Smartphone } from 'lucide-react';

export const PlayerProfile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, setState } = useGame();
  const [name, setName] = useState(state.player.name);
  const [selectedColor, setSelectedColor] = useState(state.player.spriteColor);

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
        spriteColor: selectedColor
      }
    }));
    onBack();
  };

  const pokedexValues = Object.values(state.player.pokedex);
  const seenCount = pokedexValues.length;
  const caughtCount = pokedexValues.filter(v => v === 'caught').length;

  return (
    <div className="h-full bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white border-b flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft />
          </button>
          <h2 className="font-black text-xl uppercase italic tracking-tighter">Profilo Allenatore</h2>
        </div>
        <button 
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-black uppercase text-xs shadow-lg active:scale-95 transition-all"
        >
          Salva
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 flex flex-col items-center text-center"
        >
          <div className={`w-24 h-24 rounded-full ${selectedColor} flex items-center justify-center text-white text-4xl font-black shadow-inner mb-4 border-4 border-white`}>
            {name[0]?.toUpperCase() || '?'}
          </div>
          <div className="w-full space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nome Allenatore</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Inserisci nome..."
              maxLength={12}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-center font-bold text-xl focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </motion.div>

        {/* Color Selection */}
        <div className="space-y-3">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2 px-2">
            <Palette className="w-3 h-3" /> Colore Preferito
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {colors.map((color) => (
              <button
                key={color.class}
                onClick={() => setSelectedColor(color.class)}
                className={`h-12 rounded-2xl transition-all relative ${color.class} ${
                  selectedColor === color.class ? 'ring-4 ring-blue-500/30 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {selectedColor === color.class && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Section */}
        <div className="space-y-3">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2 px-2">
            <BarChart3 className="w-3 h-3" /> Statistiche Personali
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <StatRow icon={<Wallet className="w-4 h-4 text-yellow-500" />} label="Saldo Attuale" value={`$${state.player.money}`} />
            <StatRow icon={<Smartphone className="w-4 h-4 text-indigo-500" />} label="Pokédex (Catturati)" value={`${caughtCount} specie`} />
            <StatRow icon={<Smartphone className="w-4 h-4 text-blue-400" />} label="Pokédex (Visti)" value={`${seenCount} specie`} />
            <StatRow icon={<Award className="w-4 h-4 text-emerald-500" />} label="Medaglie Ottenute" value={`${state.player.badges.filter(b => !b.startsWith('reward')).length} medaglie`} />
            <StatRow icon={<User className="w-4 h-4 text-purple-500" />} label="Pokémon in Squadra" value={`${state.player.team.length} / 6`} />
          </div>
        </div>

        {/* Adventure Summary */}
        <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <h4 className="font-black uppercase italic tracking-tighter mb-2">Resoconto Avventura</h4>
          <p className="text-xs font-bold opacity-90 leading-relaxed">
            Stai viaggiando con {state.player.team.length > 0 ? state.player.team[0].name : 'nessun Pokémon'} come compagno principale. 
            Il tuo viaggio è iniziato nel Villaggio del Setup e hai già esplorato diverse zone del mondo PokePWA.
          </p>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gray-50 rounded-lg">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{label}</span>
    </div>
    <span className="font-bold text-gray-700">{value}</span>
  </div>
);
