import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Installa App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-white/20 transition-colors"
        >
          <Download className="w-4 h-4" />
          Installa su iOS
        </button>

        <AnimatePresence>
          {showIOSGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-gray-900"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Installa su iPhone/iPad</h3>
                  <button onClick={() => setShowIOSGuide(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 space-y-2">
                  1. Tocca il tasto <strong>Condividi</strong> nella barra di Safari.<br />
                  2. Scorri verso il basso e tocca <strong>Aggiungi alla schermata Home</strong>.
                </p>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-6 w-full rounded-xl bg-gray-100 py-3 text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  Capito!
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return null;
};
