import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { ChevronLeft, Swords, Copy, Play } from 'lucide-react';
import { encodeTeam, decodeTeam } from '../lib/utils';
import { Pokemon } from '../types/game';
import { BattleScreen } from './BattleScreen';

export const LocalBattle: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state } = useGame();
  const [opponentCode, setOpponentCode] = useState('');
  const [opponentTeam, setOpponentTeam] = useState<Pokemon[] | null>(null);
  const [isFighting, setIsFighting] = useState(false);

  const generateMyCode = () => {
    const code = encodeTeam(state.player.team);
    navigator.clipboard.writeText(code);
    alert("Codice della tua squadra copiato! Invialo al tuo amico.");
  };

  const startBattle = () => {
    const team = decodeTeam(opponentCode);
    if (!team) {
      alert("Codice squadra non valido!");
      return;
    }
    setOpponentTeam(team);
    setIsFighting(true);
  };

  if (isFighting && opponentTeam) {
    return (
      <BattleScreen 
        enemy={opponentTeam[0]}
        trainer={{
          name: 'Amico Sfidante',
          team: opponentTeam,
          sprite: opponentTeam[0]?.sprites?.front || (opponentTeam[0] as any)?.spriteUrl || ''
        }}
        onEnd={() => {
          setIsFighting(false);
          setOpponentTeam(null);
        }} 
      />
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
        <h2 className="font-bold text-xl uppercase">Lotta Locale</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <Swords className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic">Sfida un amico!</h3>
            <p className="text-sm text-gray-500 px-8">Incolla il codice della squadra del tuo amico per iniziare una battaglia "fotografia".</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <button 
              onClick={generateMyCode}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:translate-y-1 transition-all"
            >
              <Copy className="w-5 h-5" /> Copia Mia Squadra
            </button>
            <p className="text-[10px] text-center text-gray-400 font-bold uppercase">Manda il tuo codice al tuo avversario</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-300"><span className="bg-white px-2">OPPURE</span></div>
          </div>

          <div className="space-y-3">
            <textarea 
              value={opponentCode}
              onChange={(e) => setOpponentCode(e.target.value)}
              placeholder="Incolla il codice del tuo amico..."
              className="w-full bg-gray-50 rounded-2xl p-4 text-[10px] font-mono border-2 border-gray-100 focus:border-red-500 focus:outline-none min-h-[100px]"
            />
            <button 
              onClick={startBattle}
              disabled={!opponentCode}
              className="w-full bg-red-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50 transition-all"
            >
              <Play className="w-5 h-5 fill-current" /> Inizia Lotta!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
