import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 active:scale-95 px-2.5 py-1 text-[11px] sm:text-xs font-black uppercase tracking-tight transition-all cursor-pointer whitespace-nowrap shadow-xs"
        title="Installa PokePWA sul tuo dispositivo"
      >
        <Download className="w-3.5 h-3.5 shrink-0 text-blue-600" />
        <span>{isIOS ? 'Installa iOS' : 'Installa App'}</span>
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showGuide && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-sm my-auto rounded-3xl bg-gray-900 border-2 border-blue-500/40 p-6 shadow-2xl text-white text-left relative"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{isIOS ? '🍏' : '📱'}</span>
                    <h3 className="text-lg font-black uppercase text-blue-400">
                      {isIOS ? 'Installa su iPhone/iPad' : 'Installa sul Telefono'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowGuide(false)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isIOS ? (
                  <div className="text-xs sm:text-sm text-gray-300 space-y-3 leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <span className="bg-blue-500/20 text-blue-400 font-black rounded-lg px-2 py-0.5 text-xs">1</span>
                      <span>Apri il link in <strong>Safari</strong> e tocca l'icona <strong>Condividi</strong> (il quadratino con la freccia verso l'alto in basso).</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="bg-blue-500/20 text-blue-400 font-black rounded-lg px-2 py-0.5 text-xs">2</span>
                      <span>Scorri l'elenco e tocca <strong>Aggiungi alla schermata Home</strong>.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="bg-blue-500/20 text-blue-400 font-black rounded-lg px-2 py-0.5 text-xs">3</span>
                      <span>Conferma premendo <strong>Aggiungi</strong> in alto a destra!</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-gray-300 space-y-3 leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <span className="bg-blue-500/20 text-blue-400 font-black rounded-lg px-2 py-0.5 text-xs">1</span>
                      <span>Tocca i <strong>tre puntini ⋮</strong> in alto a destra nel browser Chrome/Edge.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="bg-blue-500/20 text-blue-400 font-black rounded-lg px-2 py-0.5 text-xs">2</span>
                      <span>Seleziona <strong>Installa app</strong> oppure <strong>Aggiungi a schermata Home</strong>.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="bg-blue-500/20 text-blue-400 font-black rounded-lg px-2 py-0.5 text-xs">3</span>
                      <span>Troverai l'icona di PokePWA tra le tue app a schermo intero!</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowGuide(false)}
                  className="mt-6 w-full rounded-2xl bg-blue-600 hover:bg-blue-500 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-all cursor-pointer"
                >
                  Ho Capito!
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
