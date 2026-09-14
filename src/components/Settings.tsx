import React from 'react';
import { useGame } from '../contexts/GameContext';
import { ChevronLeft, Save, Trash2, RotateCcw, FileJson, Zap, User } from 'lucide-react';
import { exportGameState, validateGameState } from '../lib/utils';
import { INITIAL_STATE, Pokemon } from '../types/game';
import { BADGES } from '../lib/badges';
import { calculateStats } from '../lib/pokeapi';

export const Settings: React.FC<{ onBack: () => void, onProfile: () => void }> = ({ onBack, onProfile }) => {
  const { state, setState } = useGame();

  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showCheats, setShowCheats] = React.useState(false);

  const applyCheat = (type: string) => {
    setState(prev => {
      const newState = { 
        ...prev,
        player: {
          ...prev.player,
          inventory: [...prev.player.inventory],
          team: [...prev.player.team]
        }
      };

      switch (type) {
        case 'money':
          newState.player.money = 999999;
          break;
        case 'masterball': {
          const itemIndex = newState.player.inventory.findIndex(item => item.id === 'master-ball');
          if (itemIndex > -1) {
            const item = { ...newState.player.inventory[itemIndex] };
            item.count += 50;
            newState.player.inventory[itemIndex] = item;
          } else {
            newState.player.inventory.push({ id: 'master-ball', name: 'Master Ball', description: 'La Ball definitiva: cattura senza mai fallire.', count: 50, type: 'capture' });
          }
          break;
        }
        case 'rare-candy': {
          const itemIndex = newState.player.inventory.findIndex(item => item.id === 'caramella-rara');
          if (itemIndex > -1) {
            const item = { ...newState.player.inventory[itemIndex] };
            item.count += 99;
            newState.player.inventory[itemIndex] = item;
          } else {
            newState.player.inventory.push({ id: 'caramella-rara', name: 'Caramella Rara', description: 'Alza di un livello un Pokémon.', count: 99, type: 'other' });
          }
          break;
        }
        case 'heal':
          newState.player.team = newState.player.team.map(p => ({ ...p, hp: p.maxHp }));
          break;
        case 'badges':
          newState.player.badges = BADGES.map(b => b.id);
          break;
        case 'lvl100':
          if (newState.player.team.length > 0) {
            const p = newState.player.team[0];
            const newLevel = 100;
            const stats = calculateStats(p.baseStats, newLevel, p.ivs, p.evs, p.nature);
            newState.player.team[0] = { 
              ...p, 
              level: newLevel,
              hp: stats.hp,
              maxHp: stats.hp,
              stats: {
                attack: stats.attack,
                defense: stats.defense,
                spAtk: stats.spAtk,
                spDef: stats.spDef,
                speed: stats.speed
              }
            };
          }
          break;
      }
      return newState;
    });
    alert("Trucco attivato!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (validateGameState(json)) {
          setState(json);
          alert("Salvataggio ripristinato con successo!");
        } else {
          alert("File di salvataggio non valido!");
        }
      } catch (err) {
        alert("Errore nel caricamento del file!");
      }
    };
    reader.readAsText(file);
  };

  const resetGame = () => {
    localStorage.clear();
    localStorage.removeItem('pokepwa_save');
    window.location.reload();
  };

  return (
    <div className="h-full bg-white flex flex-col relative">
      <div className="p-4 border-b flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
        <h2 className="font-bold text-xl uppercase">Impostazioni</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <User className="w-3 h-3" /> Personalizzazione
          </h3>
          
          <button 
            onClick={onProfile}
            className="w-full bg-blue-50 text-blue-700 border-2 border-blue-100 py-4 rounded-2xl font-black uppercase text-xs active:bg-blue-600 active:text-white transition-all flex items-center justify-center gap-2"
          >
            Modifica Profilo e Nome
          </button>
        </div>

        <hr />

        <div className="space-y-4">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <Save className="w-3 h-3" /> Backup e Ripristino
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => exportGameState(state)}
              className="bg-blue-50 border-2 border-blue-100 p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <FileJson className="text-blue-500" />
              <span className="text-[10px] font-black uppercase text-blue-700">Esporta JSON</span>
            </button>
            
            <label className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition-transform cursor-pointer">
              <RotateCcw className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase text-emerald-700">Importa JSON</span>
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </div>

        <hr />

        {/* Cheat Menu Trigger */}
        <div className="space-y-4">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <Zap className="w-3 h-3 text-yellow-500" /> Sviluppatore
          </h3>
          
          <button 
            onClick={() => setShowCheats(true)}
            className="w-full bg-yellow-50 text-yellow-700 border-2 border-yellow-100 py-4 rounded-2xl font-black uppercase text-xs active:bg-yellow-500 active:text-white transition-all flex items-center justify-center gap-2"
          >
            Menù Trucchi
          </button>
        </div>

        <hr />

        {/* Data Management */}
        <div className="space-y-4">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <Trash2 className="w-3 h-3 text-red-400" /> Zona Pericolo
          </h3>
          
          <button 
            onClick={() => setShowConfirm(true)}
            className="w-full bg-red-50 text-red-600 border-2 border-red-100 py-4 rounded-2xl font-black uppercase text-xs active:bg-red-600 active:text-white transition-all"
          >
            Cancella tutti i dati
          </button>
        </div>

        <div className="pt-8 text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase">PokePWA v1.2.0</p>
          <p className="text-[8px] text-gray-400 mt-1">Made with humor between friends</p>
        </div>
      </div>

      {/* Cheat Menu Modal */}
      {showCheats && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col">
          <div className="p-4 border-b flex items-center gap-4">
            <button onClick={() => setShowCheats(false)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
            <h2 className="font-bold text-xl uppercase">Trucchi</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {[
              { id: 'money', label: 'Soldi Infiniti', icon: '💰' },
              { id: 'masterball', label: '50 Master Ball', icon: '💎' },
              { id: 'rare-candy', label: '99 Caramelle Rare', icon: '💊' },
              { id: 'heal', label: 'Cura Totale Team', icon: '🏥' },
              { id: 'badges', label: 'Sblocca Tutte Zone', icon: '🎖️' },
              { id: 'lvl100', label: 'Livello 100 (1° Pkmn)', icon: '⚡' },
            ].map(cheat => (
              <button
                key={cheat.id}
                onClick={() => applyCheat(cheat.id)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 active:bg-yellow-50 active:border-yellow-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{cheat.icon}</span>
                  <span className="font-bold text-sm uppercase">{cheat.label}</span>
                </div>
                <Zap className="w-4 h-4 text-yellow-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      {showConfirm && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-8 text-center">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
              <Trash2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black uppercase italic">Sei assolutamente sicuro?</h3>
            <p className="text-gray-500 font-bold leading-tight">
              Questa azione è irreversibile. Perderai tutti i tuoi Pokémon, strumenti e progressi fatti finora.
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={resetGame}
                className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
              >
                Sì, Cancella Tutto
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                No, Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
