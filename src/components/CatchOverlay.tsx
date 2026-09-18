import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pokemon, Item } from '../types/game';
import { playCatchShake, playCatchSuccess } from '../lib/sound';

interface CatchOverlayProps {
  target: Pokemon;
  ball: Item;
  onResult: (success: boolean) => void;
  onCancel: () => void;
}

export const CatchOverlay: React.FC<CatchOverlayProps> = ({ target, ball, onResult, onCancel }) => {
  const [stage, setStage] = useState<'aiming' | 'throwing' | 'result'>('aiming');
  const [ringSize, setRingSize] = useState(100);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [quality, setQuality] = useState<{ text: string, color: string, mult: number } | null>(null);

  useEffect(() => {
    if (stage !== 'aiming') return;
    
    const interval = setInterval(() => {
      setRingSize(prev => (prev <= 10 ? 100 : prev - 1.2));
    }, 20); // Slower for better control
    
    return () => clearInterval(interval);
  }, [stage]);

  const throwBall = () => {
    setStage('throwing');
    
    // Determine throw quality based on ring size
    let q = { text: 'Bene!', color: 'text-green-400', mult: 1.5 }; 
    if (ringSize < 20) {
      q = { text: 'Eccellente!', color: 'text-orange-400', mult: 4.0 }; 
    } else if (ringSize < 50) {
      q = { text: 'Grande!', color: 'text-yellow-400', mult: 2.0 }; 
    } else if (ringSize > 85) {
      q = { text: 'Lancio...', color: 'text-gray-400', mult: 1.0 };
    }
    setQuality(q);

    // Ball modifier
    const ballMult = ball.id === 'master-ball' ? 999 : ball.id === 'ultra-ball' ? 3.5 : ball.id === 'mega-ball' ? 2.2 : 1.5;
    
    // HP factor (the target's HP percentage)
    // Formula refined: at 100% HP factor is 1/3, at low HP it approaches 1.
    const hpFactor = (3 * target.maxHp - 2 * target.hp) / (3 * target.maxHp);
    
    // Final chance calculation
    const baseProb = 0.6; 
    const catchChance = baseProb * ballMult * q.mult * hpFactor;
    
    // Master Ball is always 100%, others max out at 100% too now to avoid "unfair" escapes
    const finalChance = Math.min(1.0, catchChance);
    const roll = Math.random();
    const success = roll < finalChance;

    // Shake audio sequence
    setTimeout(() => playCatchShake(), 500);
    setTimeout(() => playCatchShake(), 1100);
    setTimeout(() => playCatchShake(), 1600);
    
    setTimeout(() => {
      setCaptureSuccess(success);
      setStage('result');
      if (success) {
        playCatchSuccess();
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {stage === 'aiming' && (
          <motion.div 
            key="aiming"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-12"
          >
            <div className="relative">
              {/* Target Pokemon */}
              <div className="relative z-10 w-48 h-48 flex items-center justify-center">
                <img src={target.sprites.artwork} alt={target.name} className="w-full h-full object-contain" />
              </div>

              {/* Aiming Ring Container (fixed size) */}
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                 <div className="w-full h-full border-4 border-white/20 rounded-full" />
              </div>

              {/* Dynamic Ring */}
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <div 
                  style={{ 
                    width: `${ringSize}%`, 
                    height: `${ringSize}%`,
                    borderColor: ringSize < 20 ? '#f97316' : ringSize < 50 ? '#eab308' : '#22c55e'
                  }}
                  className="border-4 rounded-full transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                />
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                 <span className="text-2xl">{ball.id === 'master-ball' ? '🟣' : ball.id === 'ultra-ball' ? '💎' : ball.id === 'mega-ball' ? '🔵' : '🔴'}</span>
                 <h3 className="text-white font-black text-2xl uppercase tracking-tighter">{ball.name}</h3>
              </div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest animate-pulse">Lancia al momento giusto!</p>
            </div>

            <button
              onClick={throwBall}
              className="group relative"
            >
              <div className="absolute -inset-4 bg-white/10 rounded-full blur-xl group-active:bg-white/20 transition-colors" />
              <div className="w-24 h-24 bg-white rounded-full border-8 border-red-500 shadow-2xl relative z-10 active:scale-90 transition-transform flex flex-col items-center justify-center overflow-hidden">
                <div className="w-full h-1/2 bg-red-500 absolute top-0" />
                <div className="w-4 h-4 bg-white border-2 border-gray-800 rounded-full z-20" />
                <div className="w-full h-1 bg-gray-800 absolute top-1/2 -translate-y-1/2 z-10" />
              </div>
            </button>
            
            <button onClick={onCancel} className="text-white/30 hover:text-white/60 underline text-xs font-bold uppercase tracking-widest">Annulla</button>
          </motion.div>
        )}

        {stage === 'throwing' && (
          <motion.div 
            key="throwing"
            className="flex flex-col items-center gap-8"
          >
            {quality && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`text-4xl font-black italic uppercase ${quality.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
              >
                {quality.text}
              </motion.div>
            )}
            <motion.div
              animate={{ 
                rotate: [0, -20, 20, -20, 20, 0],
                y: [0, -30, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className={`w-32 h-32 bg-white rounded-full border-8 relative flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.8)] ${
                ball.id === 'master-ball' ? 'border-purple-600' : 
                ball.id === 'ultra-ball' ? 'border-yellow-500' : 
                ball.id === 'mega-ball' ? 'border-blue-500' : 
                'border-red-500'
              }`}
            >
              <div className={`absolute top-0 w-full h-1/2 ${
                ball.id === 'master-ball' ? 'bg-purple-600' : 
                ball.id === 'ultra-ball' ? 'bg-yellow-500' : 
                ball.id === 'mega-ball' ? 'bg-blue-500' : 
                'bg-red-500'
              }`} />
              <div className="absolute bottom-0 w-full h-1/2 bg-white" />
              <div className="w-8 h-8 bg-white border-4 border-gray-800 rounded-full z-10" />
              <div className="absolute w-full h-2 bg-gray-800 top-1/2 -translate-y-1/2" />
            </motion.div>
            <p className="text-white font-black uppercase italic tracking-widest animate-pulse">Catturando...</p>
          </motion.div>
        )}

        {stage === 'result' && (
          <motion.div 
            key="result"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-8 text-center"
          >
            <div className="text-7xl mb-4">{captureSuccess ? '🎊' : '💨'}</div>
            <h2 className="text-white text-4xl font-black uppercase italic leading-tight">
              {captureSuccess ? `Hai preso ${target.name}!` : `${target.name} è scappato!`}
            </h2>
            <p className="text-gray-400 font-medium max-w-xs mx-auto">
              {captureSuccess 
                ? 'Ottimo lavoro! Un nuovo Pixel si aggiunge alla tua collezione.' 
                : 'Peccato... Forse avevi la connessione lenta? Riprova!'}
            </p>
            <button
              onClick={() => onResult(captureSuccess)}
              className="w-full bg-white text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
            >
              Continua
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
