import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { 
  ChevronLeft, Save, Trash2, RotateCcw, FileJson, Zap, User, 
  RefreshCw, Smartphone, CheckCircle, Volume2, VolumeX, Database, Sparkles, Upload, Play, X, Music
} from 'lucide-react';
import { exportGameState, validateGameState } from '../lib/utils';
import { INITIAL_STATE, Pokemon } from '../types/game';
import { BADGES } from '../lib/badges';
import { calculateStats } from '../lib/pokeapi';
import { isSoundEnabled, setSoundEnabled, playMenuClick, playLevelUp, getCustomBgm, setCustomBgm, playBgm } from '../lib/sound';
import { getStorageEstimate, removeStorageItem, setStorageItem } from '../lib/storage';

export const Settings: React.FC<{ onBack: () => void, onProfile: () => void }> = ({ onBack, onProfile }) => {
  const { state, setState } = useGame();

  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showCheats, setShowCheats] = React.useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);
  const [audioActive, setAudioActive] = useState(() => isSoundEnabled());
  const [bgmOverworld, setBgmOverworld] = useState<string | null>(() => getCustomBgm('overworld'));
  const [bgmBattle, setBgmBattle] = useState<string | null>(() => getCustomBgm('battle'));

  const [storageInfo, setStorageInfo] = useState<{ usageMB: number; quotaMB: number; isIndexedDB: boolean }>({
    usageMB: 0.5,
    quotaMB: 500,
    isIndexedDB: true
  });

  useEffect(() => {
    getStorageEstimate().then(setStorageInfo);
  }, []);

  const handleBgmUpload = (type: 'overworld' | 'battle', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      setCustomBgm(type, base64);
      if (type === 'overworld') setBgmOverworld(base64);
      if (type === 'battle') setBgmBattle(base64);
      alert(`Musica per ${type === 'overworld' ? 'Esplorazione' : 'Lotta'} salvata con successo!`);
      playBgm(type, true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBgm = (type: 'overworld' | 'battle') => {
    setCustomBgm(type, null);
    if (type === 'overworld') setBgmOverworld(null);
    if (type === 'battle') setBgmBattle(null);
    playBgm('stop');
    alert(`Musica di sottofondo rimossa.`);
  };

  const handleToggleAudio = () => {
    const nextState = !audioActive;
    setAudioActive(nextState);
    setSoundEnabled(nextState);
    if (nextState) {
      playMenuClick();
    }
  };

  const handleTestSound = () => {
    if (audioActive) {
      playLevelUp();
    }
  };

  const handleForcePwaUpdate = async () => {
    setIsUpdating(true);
    setUpdateMsg('Controllo Service Worker e svuotamento cache...');

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.update();
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }

      setUpdateMsg('Cache svuotata! Ricaricamento in corso...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('PWA update error:', err);
      setUpdateMsg('Errore durante l\'aggiornamento, prova a riavviare la pagina.');
      setIsUpdating(false);
    }
  };

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
    reader.onload = async (event) => {
      try {
        const raw = event.target?.result as string;
        const json = JSON.parse(raw);
        if (validateGameState(json)) {
          setState(json);
          await setStorageItem('pokepwa_save', json);
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

  const resetGame = async () => {
    try {
      await removeStorageItem('pokepwa_save');
    } catch (e) {
      console.warn(e);
    }
    localStorage.clear();
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

        {/* Effetti Sonori Retro */}
        <div className="space-y-4">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2">
            {audioActive ? <Volume2 className="w-3.5 h-3.5 text-blue-500" /> : <VolumeX className="w-3.5 h-3.5 text-gray-400" />} Effetti Sonori Retro
          </h3>
          
          <div className="bg-slate-50 border-2 border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-800 uppercase">Audio di Battaglia & Menu</p>
                <p className="text-[11px] text-slate-500 font-medium">Sintetizzatore 8-bit nativo offline</p>
              </div>
              <button
                onClick={handleToggleAudio}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-sm ${
                  audioActive
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20 active:scale-95'
                    : 'bg-slate-200 text-slate-600 active:scale-95'
                }`}
              >
                {audioActive ? 'Attivo' : 'Muto'}
              </button>
            </div>

            {audioActive && (
              <button
                onClick={handleTestSound}
                className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Riproduci suono di prova</span>
              </button>
            )}
          </div>

          {/* Caricamento Musica di Sottofondo (BGM) */}
          <div className="bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl p-4 space-y-4">
            <div>
              <p className="text-xs font-black text-indigo-900 uppercase flex items-center gap-1.5">
                <Music className="w-4 h-4 text-indigo-600" /> Musica di Sottofondo Personalizzata (MP3/WAV)
              </p>
              <p className="text-[11px] text-indigo-700 font-medium leading-relaxed mt-0.5">
                Puoi caricare un brano musicale per l'esplorazione del mondo di gioco e uno dedicato per le lotte!
              </p>
            </div>

            {/* Overworld BGM Upload */}
            <div className="space-y-2 pt-2 border-t border-indigo-200/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-indigo-900 flex items-center gap-1">
                  🗺️ Musica Esplorazione & Mappa
                </span>
                {bgmOverworld ? (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    File Caricato ✓
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-indigo-400">
                    Nessuna
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <label className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{bgmOverworld ? 'Sostituisci Musica Mappa' : 'Carica Musica Esplorazione'}</span>
                  <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={(e) => handleBgmUpload('overworld', e)} 
                  />
                </label>

                {bgmOverworld && (
                  <>
                    <button
                      type="button"
                      onClick={() => playBgm('overworld', true)}
                      className="bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl text-xs hover:bg-emerald-700 flex items-center gap-1"
                      title="Ascolta musica"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveBgm('overworld')}
                      className="bg-red-500 text-white font-bold px-3 py-2 rounded-xl text-xs hover:bg-red-600"
                      title="Rimuovi musica"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Battle BGM Upload */}
            <div className="space-y-2 pt-2 border-t border-indigo-200/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-indigo-900 flex items-center gap-1">
                  ⚔️ Musica di Sottofondo Lotta
                </span>
                {bgmBattle ? (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    File Caricato ✓
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-indigo-400">
                    Nessuna
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <label className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{bgmBattle ? 'Sostituisci Musica Lotta' : 'Carica Musica Lotta'}</span>
                  <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={(e) => handleBgmUpload('battle', e)} 
                  />
                </label>

                {bgmBattle && (
                  <>
                    <button
                      type="button"
                      onClick={() => playBgm('battle', true)}
                      className="bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl text-xs hover:bg-emerald-700 flex items-center gap-1"
                      title="Ascolta musica"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveBgm('battle')}
                      className="bg-red-500 text-white font-bold px-3 py-2 rounded-xl text-xs hover:bg-red-600"
                      title="Rimuovi musica"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <hr />

        {/* Archiviazione & Database */}
        <div className="space-y-4">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-500" /> Archiviazione & Dati
          </h3>
          
          <div className="bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-indigo-900">Motore di Salvataggio</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500 text-white">
                <CheckCircle className="w-3 h-3" /> IndexedDB Attivo
              </span>
            </div>
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              Il gioco usa IndexedDB asincrono ad alta capienza (&gt;500 MB). Puoi catturare e conservare oltre 1.000 Pokémon nei Box senza alcun limite o problema di spazio.
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px] font-bold text-indigo-600">
              <span>Spazio Utilizzato: ~{storageInfo.usageMB} MB</span>
              <span>Capacità Massima: ~{storageInfo.quotaMB} MB</span>
            </div>
          </div>
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

        {/* PWA Updates & Cache Section */}
        <div className="space-y-3">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <Smartphone className="w-3 h-3 text-blue-500" /> Aggiornamenti PWA & Cache
          </h3>
          
          <div className="bg-slate-50 border-2 border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-700">
                Come funzionano gli aggiornamenti su telefono:
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Dopo ogni push su GitHub, il browser del telefono rileva la nuova versione. Se vedi ancora file vecchi a causa della cache ostinata, premi qui sotto per forzare il refresh immediato senza perdere la partita!
              </p>
            </div>

            {updateMsg && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs font-mono font-bold flex items-center gap-2">
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{updateMsg}</span>
              </div>
            )}

            <button
              onClick={handleForcePwaUpdate}
              disabled={isUpdating}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black uppercase text-xs py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Aggiornamento in corso...' : 'Forza Aggiornamento & Svuota Cache'}</span>
            </button>
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
