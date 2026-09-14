import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { ZONES } from '../constants/game';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (screen: 'game' | 'pokedex' | 'inventory' | 'team' | 'box' | 'trade' | 'local-battle' | 'settings' | 'profile' | 'quests') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate }) => {
  const { state } = useGame();
  const currentZone = ZONES.find(z => z.id === state.player.location);

  // Expose onNavigate globally for Hub.tsx (hacky but quick for this architecture)
  React.useEffect(() => {
    (window as any).onNavigate = onNavigate;
  }, [onNavigate]);

  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 7;
  const isEvening = hour >= 18 && hour < 20;

  return (
    <div className={`fixed inset-0 flex flex-col overflow-hidden selection:bg-blue-200 ${currentZone?.background || 'bg-white'} transition-colors duration-1000`}>
      {/* Day/Night Overlay */}
      <div className={`fixed inset-0 pointer-events-none z-[1000] mix-blend-multiply transition-opacity duration-1000 ${
        isNight ? 'bg-[#1a1a3a] opacity-40' : isEvening ? 'bg-[#f4a460] opacity-20' : 'opacity-0'
      }`} />
      
      {/* Top Bar */}
      <header className="h-14 border-b border-black/10 flex items-center justify-between px-4 bg-white/80 backdrop-blur-sm z-10">
        <h1 className="font-bold text-lg text-blue-600">PokePWA</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
            ${state.player.money}
          </span>
          <button 
            onClick={() => onNavigate('profile')}
            className={`w-8 h-8 rounded-full ${state.player.spriteColor || 'bg-blue-500'} flex items-center justify-center text-white text-xs font-bold shadow-sm active:scale-90 transition-all`}
          >
            {state.player.name[0]}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {children}
      </main>

      {/* Global Navigation - Only visible in Hub */}
      {state.player.location === 'villaggio' && (
        <nav className="h-20 border-t border-black/10 bg-white grid grid-cols-4 items-center px-2 pb-safe z-10">
          <NavItem label="Squadra" icon="🐉" onClick={() => onNavigate('team')} />
          <NavItem label="Zaino" icon="🎒" onClick={() => onNavigate('inventory')} />
          <NavItem label="Pokedex" icon="📱" onClick={() => onNavigate('pokedex')} />
          <NavItem label="Mappa" icon="🗺️" onClick={() => onNavigate('game')} />
        </nav>
      )}
    </div>
  );
};

const NavItem = ({ label, icon, onClick }: { label: string, icon: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
  </button>
);
