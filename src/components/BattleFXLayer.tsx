import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface BattleFXData {
  moveName: string;
  moveType: string;
  category?: 'physical' | 'special' | 'status';
  targetSide: 'player' | 'opponent';
}

interface BattleFXLayerProps {
  fxData: BattleFXData | null;
  onComplete?: () => void;
}

export const BattleFXLayer: React.FC<BattleFXLayerProps> = ({ fxData, onComplete }) => {
  useEffect(() => {
    if (fxData) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 750); // 750ms total animation lifecycle
      return () => clearTimeout(timer);
    }
  }, [fxData, onComplete]);

  if (!fxData) return null;

  const { moveName, moveType, category, targetSide } = fxData;
  const isTargetOpponent = targetSide === 'opponent';

  // Target coordinates relative to the arena overlay
  // Opponent is top-right, Player is bottom-left
  const targetX = isTargetOpponent ? '68%' : '28%';
  const targetY = isTargetOpponent ? '28%' : '65%';

  const attackerX = isTargetOpponent ? '28%' : '68%';
  const attackerY = isTargetOpponent ? '65%' : '28%';

  const lowerMove = moveName.toLowerCase();
  const lowerType = moveType.toLowerCase();

  // Determine animation style archetype
  let fxStyle: 'slash' | 'fire' | 'water' | 'electric' | 'grass' | 'psychic' | 'impact' | 'status' = 'impact';

  if (category === 'status' || lowerMove.includes('ruggito') || lowerMove.includes('coda') || lowerMove.includes('crescita')) {
    fxStyle = 'status';
  } else if (lowerType === 'fire' || lowerMove.includes('fuoco') || lowerMove.includes('flame') || lowerMove.includes('braciere')) {
    fxStyle = 'fire';
  } else if (lowerType === 'water' || lowerType === 'ice' || lowerMove.includes('acqua') || lowerMove.includes('ghiaccio') || lowerMove.includes('bolla')) {
    fxStyle = 'water';
  } else if (lowerType === 'electric' || lowerMove.includes('tuono') || lowerMove.includes('fulmine') || lowerMove.includes('shock')) {
    fxStyle = 'electric';
  } else if (lowerType === 'grass' || lowerType === 'poison' || lowerMove.includes('fogli') || lowerMove.includes('erba') || lowerMove.includes('veleno')) {
    fxStyle = 'grass';
  } else if (lowerType === 'psychic' || lowerType === 'ghost' || lowerType === 'dark' || lowerType === 'dragon' || lowerMove.includes('psico') || lowerMove.includes('ombra')) {
    fxStyle = 'psychic';
  } else if (lowerMove.includes('taglio') || lowerMove.includes('graffio') || lowerMove.includes('fendente') || lowerMove.includes('schiacciata') || lowerMove.includes('slash') || lowerMove.includes('scratch') || lowerType === 'steel' || lowerType === 'flying') {
    fxStyle = 'slash';
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      <AnimatePresence>
        {/* 1. SLASH / CUT EFFECT */}
        {fxStyle === 'slash' && (
          <motion.div
            key="fx-slash"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ left: targetX, top: targetY }}
          >
            {/* White Red Flash background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.3 }}
              className="absolute w-44 h-44 bg-red-500/30 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2"
            />

            {/* Diagonal Slash Line 1 */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0, rotate: -45 }}
              animate={{ scaleX: [0, 1.4, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute w-36 h-2 bg-gradient-to-r from-transparent via-white to-yellow-300 shadow-[0_0_15px_#fef08a] -translate-x-1/2 -translate-y-1/2 rounded-full"
            />

            {/* Diagonal Slash Line 2 */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0, rotate: -25 }}
              animate={{ scaleX: [0, 1.2, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
              className="absolute w-32 h-1.5 bg-gradient-to-r from-transparent via-red-200 to-white shadow-[0_0_12px_#ffffff] -translate-x-1/2 -translate-y-1/2 rounded-full"
            />

            {/* Sparkle particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`spark-${i}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: (i % 2 === 0 ? 1 : -1) * (15 + i * 12),
                  y: (i < 3 ? -1 : 1) * (15 + i * 10),
                  opacity: 0,
                  scale: 0.2
                }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="absolute w-2.5 h-2.5 bg-yellow-300 rounded-full shadow-[0_0_8px_#fef08a] -translate-x-1/2 -translate-y-1/2"
              />
            ))}
          </motion.div>
        )}

        {/* 2. FIRE PROJECTILE / FLAME BURST */}
        {fxStyle === 'fire' && (
          <React.Fragment key="fx-fire">
            {/* Travelling Fireball */}
            <motion.div
              initial={{ left: attackerX, top: attackerY, scale: 0.6, opacity: 0.8 }}
              animate={{ left: targetX, top: targetY, scale: 1.3, opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeIn' }}
              className="absolute w-12 h-12 bg-gradient-to-r from-orange-500 via-amber-400 to-red-600 rounded-full blur-xs shadow-[0_0_20px_#f97316] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            >
              <div className="w-6 h-6 bg-yellow-200 rounded-full animate-ping" />
            </motion.div>

            {/* Impact Flame Burst on Target */}
            <motion.div
              initial={{ left: targetX, top: targetY, scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.8, 2.2, 0], opacity: [0, 1, 0.8, 0] }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute w-32 h-32 bg-radial from-yellow-300 via-orange-500 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
            >
              <div className="text-3xl animate-bounce">🔥</div>
            </motion.div>
          </React.Fragment>
        )}

        {/* 3. WATER / ICE STREAM */}
        {fxStyle === 'water' && (
          <React.Fragment key="fx-water">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`water-bubble-${i}`}
                initial={{ left: attackerX, top: attackerY, scale: 0.5, opacity: 0.9 }}
                animate={{ left: targetX, top: targetY, scale: 1.2, opacity: 1 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeInOut' }}
                className="absolute w-8 h-8 bg-cyan-400/80 border-2 border-white rounded-full shadow-[0_0_12px_#38bdf8] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs text-white font-bold"
              >
                💧
              </motion.div>
            ))}

            {/* Splash ring */}
            <motion.div
              initial={{ left: targetX, top: targetY, scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.6, 0], opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="absolute w-36 h-36 border-4 border-cyan-300 rounded-full blur-xs -translate-x-1/2 -translate-y-1/2"
            />
          </React.Fragment>
        )}

        {/* 4. ELECTRIC LIGHTNING */}
        {fxStyle === 'electric' && (
          <motion.div
            key="fx-electric"
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ left: targetX, top: targetY }}
          >
            {/* Screen Yellow Flash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0, 0.8, 0] }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 bg-yellow-300/25 pointer-events-none"
            />

            {/* Lightning bolt SVG overlay */}
            <motion.svg
              initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
              animate={{ scale: [0.5, 1.4, 1.1, 0], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.45 }}
              className="w-40 h-40 text-yellow-300 drop-shadow-[0_0_20px_#facc15] -translate-x-1/2 -translate-y-1/2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </motion.svg>
          </motion.div>
        )}

        {/* 5. GRASS / POISON SWIRL */}
        {fxStyle === 'grass' && (
          <motion.div
            key="fx-grass"
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ left: targetX, top: targetY }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`leaf-${i}`}
                initial={{ rotate: i * 45, x: 0, y: 0, opacity: 0 }}
                animate={{
                  rotate: i * 45 + 180,
                  x: Math.cos((i * Math.PI) / 4) * 45,
                  y: Math.sin((i * Math.PI) / 4) * 45,
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="absolute text-xl -translate-x-1/2 -translate-y-1/2"
              >
                {lowerType === 'poison' ? '🔮' : '🍃'}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 6. PSYCHIC / GHOST / DARK */}
        {fxStyle === 'psychic' && (
          <motion.div
            key="fx-psychic"
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ left: targetX, top: targetY }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.8, 2.4, 0], opacity: [0, 0.8, 0.5, 0] }}
              transition={{ duration: 0.55 }}
              className="absolute w-36 h-36 border-4 border-purple-500 bg-purple-900/30 rounded-full blur-xs shadow-[0_0_25px_#a855f7] -translate-x-1/2 -translate-y-1/2"
            />
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotate: 0 }}
              animate={{ scale: [0.3, 1.2, 0], opacity: [0, 1, 0], rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="absolute text-4xl -translate-x-1/2 -translate-y-1/2"
            >
              🌀
            </motion.div>
          </motion.div>
        )}

        {/* 7. PHYSICAL IMPACT (Tackle, Punch, Kick) */}
        {fxStyle === 'impact' && (
          <motion.div
            key="fx-impact"
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ left: targetX, top: targetY }}
          >
            {/* Impact Starburst Ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.35 }}
              className="absolute w-28 h-28 border-4 border-amber-300 bg-yellow-400/20 rounded-full shadow-[0_0_20px_#fde047] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            >
              <div className="text-3xl">💥</div>
            </motion.div>
          </motion.div>
        )}

        {/* 8. STATUS / BUFF WAVE */}
        {fxStyle === 'status' && (
          <motion.div
            key="fx-status"
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ left: attackerX, top: attackerY }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`status-ring-${i}`}
                initial={{ scale: 0.4, opacity: 0, y: 0 }}
                animate={{ scale: [0.4, 1.6, 2], opacity: [0, 0.8, 0], y: -20 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="absolute w-28 h-28 border-2 border-emerald-400 bg-emerald-300/10 rounded-full shadow-[0_0_15px_#34d399] -translate-x-1/2 -translate-y-1/2"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
