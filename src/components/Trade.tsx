import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { ChevronLeft, Copy, Download, Upload } from 'lucide-react';
import { encodePokemon, decodePokemon } from '../lib/utils';
import { Pokemon } from '../types/game';

export const Trade: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, setState } = useGame();
  const [importCode, setImportCode] = useState('');
  const [exportCode, setExportCode] = useState('');
  const [selectedToExport, setSelectedToExport] = useState<Pokemon | null>(null);

  const handleExport = (p: Pokemon) => {
    const code = encodePokemon(p);
    setExportCode(code);
    setSelectedToExport(p);
  };

  const handleImport = () => {
    const pokemon = decodePokemon(importCode);
    if (!pokemon) {
      alert("Codice non valido o corrotto!");
      return;
    }
    
    // Assign a unique instanceId so copied/imported Pokemon is completely independent
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
    
    alert(`Hai ricevuto ${pokemon.name}! È stato aggiunto alla tua Box.`);
    setImportCode('');
  };

  const handleWonderTrade = () => {
    const pool = [...(state.player.team || []), ...(state.player.box || [])];
    if (pool.length === 0) return;
    
    const random = pool[Math.floor(Math.random() * pool.length)];
    const code = encodePokemon(random);
    alert(`Il tuo Pokémon a sorpresa è pronto! Invia questo codice a un amico:\n\n${code}`);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
        <h2 className="font-bold text-xl uppercase">Scambio Codice</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Export Section */}
        <div className="space-y-4">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <Download className="w-3 h-3" /> Genera Codice
          </h3>
          <p className="text-xs text-gray-500 italic">Scegli un Pokémon per generare il codice da inviare a un amico.</p>
          
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {state.player.team.map((p, i) => (
              <button 
                key={`trade-${p.instanceId || p.id}-${i}`}
                onClick={() => handleExport(p)}
                className={`flex-shrink-0 w-16 h-16 rounded-2xl border-2 transition-all ${selectedToExport?.instanceId === p.instanceId ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-100 bg-gray-50'}`}
              >
                <img src={p?.sprites?.front || (p as any)?.spriteUrl} alt="p" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>

          {exportCode && (
            <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Copia questo codice:</p>
              <div className="bg-white p-3 rounded-xl text-[8px] break-all font-mono border mb-3 max-h-24 overflow-y-auto">
                {exportCode}
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(exportCode);
                  alert("Codice copiato!");
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2"
              >
                <Copy className="w-3 h-3" /> Copia Codice
              </button>
            </div>
          )}
          
          <button 
            onClick={handleWonderTrade}
            className="w-full bg-orange-400 text-white py-3 rounded-2xl font-black uppercase text-xs shadow-lg active:translate-y-1 transition-all"
          >
            🎲 Scambio a Sorpresa
          </button>
        </div>

        <hr />

        {/* Import Section */}
        <div className="space-y-4">
          <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <Upload className="w-3 h-3" /> Ricevi Pokémon
          </h3>
          <p className="text-xs text-gray-500 italic">Incolla qui il codice ricevuto per aggiungere il Pokémon alla tua Box.</p>
          
          <textarea 
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            placeholder="Incolla il codice Base64 qui..."
            className="w-full bg-gray-50 rounded-2xl p-4 text-[10px] font-mono border-2 border-gray-100 focus:border-blue-500 focus:outline-none min-h-[100px]"
          />

          <button 
            onClick={handleImport}
            disabled={!importCode}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-transform"
          >
            Importa Pokémon
          </button>
        </div>
      </div>
    </div>
  );
};
