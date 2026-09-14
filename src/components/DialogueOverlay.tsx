import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface DialogueLine {
  speaker: string;
  text: string;
  sprite?: string;
  onComplete?: () => void;
}

interface DialogueOverlayProps {
  lines: DialogueLine[];
  onFinish: () => void;
}

export const DialogueOverlay: React.FC<DialogueOverlayProps> = ({ lines, onFinish }) => {
  const [index, setIndex] = useState(0);
  const current = lines[index];

  const next = () => {
    if (index < lines.length - 1) {
      setIndex(index + 1);
    } else {
      onFinish();
      current.onComplete?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end p-4 bg-black/20" onClick={next}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-blue-500 min-h-[160px] relative"
        >
          {current.sprite && (
            <div className="absolute -top-24 left-4 w-32 h-32">
              <img src={current.sprite} alt={current.speaker} className="w-full h-full object-contain drop-shadow-xl" />
            </div>
          )}
          
          <div className="mt-4">
            <h4 className="font-black text-blue-600 uppercase tracking-tighter text-lg">{current.speaker}</h4>
            <p className="text-gray-700 font-medium leading-tight mt-1">{current.text}</p>
          </div>

          <div className="absolute bottom-4 right-4 animate-bounce">
            <div className="w-3 h-3 bg-blue-500 rotate-45" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
