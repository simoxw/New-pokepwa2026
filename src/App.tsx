import { GameProvider, useGame } from './contexts/GameContext';
import { Layout } from './components/Layout';
import { Hub } from './components/Hub';
import { ZoneExplorer } from './components/ZoneExplorer';
import { PWAInstallButton } from './components/PWAInstallButton';
import { DialogueOverlay } from './components/DialogueOverlay';
import { BattleScreen } from './components/BattleScreen';
import { CatchOverlay } from './components/CatchOverlay';
import { Pokedex } from './components/Pokedex';
import { Inventory } from './components/Inventory';
import { Team } from './components/Team';
import { Box } from './components/Box';
import { Trade } from './components/Trade';
import { LocalBattle } from './components/LocalBattle';
import { Settings } from './components/Settings';
import { EvolutionOverlay } from './components/EvolutionOverlay';
import { MoveLearningOverlay } from './components/MoveLearningOverlay';
import { BadgeCase } from './components/BadgeCase';
import { Shop } from './components/Shop';
import { PlayerProfile } from './components/PlayerProfile';
import { QuestLog } from './components/QuestLog';
import { useState, useEffect, useCallback } from 'react';
import { CHARACTERS } from './constants/game';
import { fetchPokemonData } from './lib/pokeapi';
import { Pokemon, Move, Trainer, Item } from './types/game';

import { StarterSelection } from './components/StarterSelection';

function GameContent() {
  const { state, setState } = useGame();
  const [showStarterSelect, setShowStarterSelect] = useState(false);
  const [activeBattle, setActiveBattle] = useState<Pokemon | null>(null);
  const [activeTrainer, setActiveTrainer] = useState<Trainer | undefined>();
  const [showEvolution, setShowEvolution] = useState<Pokemon | null>(null);
  const [showMoveLearning, setShowMoveLearning] = useState<{ pokemon: Pokemon, move: Move } | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'game' | 'pokedex' | 'inventory' | 'team' | 'box' | 'trade' | 'local-battle' | 'settings' | 'badgecase' | 'shop' | 'profile' | 'quests'>('game');

  useEffect(() => {
    if (state.player.team.length === 0) {
      setShowStarterSelect(true);
    }
  }, [state.player.team.length]);

  const handleBattleEnd = useCallback((
    result: 'win' | 'lose' | 'escape' | 'catch', 
    evoCandidate?: Pokemon,
    moveCandidate?: { pokemon: Pokemon, move: Move },
    ballUsed?: Item
  ) => {
    if (result === 'catch' && ballUsed && activeBattle) {
      // Save caught pokemon
      setState(prev => {
        const newMember = { ...activeBattle, caughtAt: Date.now() };
        
        // Quest Check: Magikarp Fan
        let newQuests = [...prev.player.quests];
        if (activeBattle.name.toLowerCase() === 'magikarp') {
          newQuests = newQuests.map(q => 
            q.id === 'magikarp-fan' && q.status === 'available' ? { ...q, status: 'completed' as const } : q
          );
        }
        
        // Quest Check: Shiny Hunter
        if (activeBattle.isShiny) {
          newQuests = newQuests.map(q => 
            q.id === 'shiny-hunter' && q.status === 'available' ? { ...q, status: 'completed' as const } : q
          );
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            team: prev.player.team.length < 6 ? [...prev.player.team, newMember] : prev.player.team,
            box: prev.player.team.length >= 6 ? [...prev.player.box, newMember] : prev.player.box,
            pokedex: { ...prev.player.pokedex, [activeBattle.id]: 'caught' },
            quests: newQuests
          }
        };
      });
      setActiveBattle(null);
      setActiveTrainer(undefined);
      if (evoCandidate) setShowEvolution(evoCandidate);
      if (moveCandidate) setShowMoveLearning(moveCandidate);
    } else {
      setActiveBattle(null);
      setActiveTrainer(undefined);
      if (evoCandidate) {
        setShowEvolution(evoCandidate);
      }
      if (moveCandidate) {
        setShowMoveLearning(moveCandidate);
      }
    }
  }, [activeBattle, setState]);

  const handleEncounter = (pokemon: Pokemon, trainer?: Trainer) => {
    setActiveBattle(pokemon);
    setActiveTrainer(trainer);
  };

  const handleMoveLearningComplete = (updatedPokemon: Pokemon) => {
    setState(prev => {
      const team = prev.player.team.map(p => 
        p.instanceId === updatedPokemon.instanceId ? updatedPokemon : p
      );
      return {
        ...prev,
        player: { ...prev.player, team }
      };
    });
    setShowMoveLearning(null);
  };

  const handleEvolutionComplete = (evolvedPokemon: Pokemon) => {
    setState(prev => {
      const team = prev.player.team.map(p => 
        p.instanceId === evolvedPokemon.instanceId ? evolvedPokemon : p
      );
      return {
        ...prev,
        player: { ...prev.player, team }
      };
    });
    setShowEvolution(null);
  };

  return (
    <Layout onNavigate={setCurrentScreen}>
      <div className="absolute top-16 right-4 z-[20]">
        <PWAInstallButton />
      </div>
      
      {currentScreen === 'game' && (
        state.player.location === 'villaggio' ? (
          <Hub />
        ) : (
          <ZoneExplorer onEncounter={handleEncounter} />
        )
      )}

      {currentScreen === 'pokedex' && <Pokedex key="pokedex-screen" onBack={() => setCurrentScreen('game')} />}
      {currentScreen === 'inventory' && (
        <Inventory 
          key="inventory-screen" 
          onBack={() => setCurrentScreen('game')} 
          onEvolution={(p) => {
            setShowEvolution(p);
            setCurrentScreen('game'); // Close inventory to show evolution
          }}
          onMoveLearning={(p, m) => {
            setShowMoveLearning({ pokemon: p, move: m });
            setCurrentScreen('game'); // Close inventory to show move learning
          }}
        />
      )}
      {currentScreen === 'team' && <Team key="team-screen" onBack={() => setCurrentScreen('game')} />}
      {currentScreen === 'box' && <Box key="box-screen" onBack={() => setCurrentScreen('game')} />}
      {currentScreen === 'trade' && <Trade key="trade-screen" onBack={() => setCurrentScreen('game')} />}
      {currentScreen === 'local-battle' && <LocalBattle key="local-battle-screen" onBack={() => setCurrentScreen('game')} />}
      {currentScreen === 'settings' && <Settings key="settings-screen" onBack={() => setCurrentScreen('game')} onProfile={() => setCurrentScreen('profile')} />}
      {currentScreen === 'badgecase' && <BadgeCase key="badgecase-screen" onBack={() => setCurrentScreen('game')} />}
      {currentScreen === 'shop' && <Shop key="shop-screen" onBack={() => setCurrentScreen('game')} />}
      {currentScreen === 'profile' && <PlayerProfile key="profile-screen" onBack={() => setCurrentScreen('game')} />}
      {currentScreen === 'quests' && <QuestLog key="quests-screen" onBack={() => setCurrentScreen('game')} />}

      {activeBattle && (
        <BattleScreen 
          enemy={activeBattle} 
          trainer={activeTrainer}
          onEnd={handleBattleEnd} 
        />
      )}

      {showStarterSelect && (
        <StarterSelection onComplete={() => setShowStarterSelect(false)} />
      )}

      {showEvolution && (
        <EvolutionOverlay 
          pokemon={showEvolution} 
          onComplete={handleEvolutionComplete} 
          onCancel={() => setShowEvolution(null)} 
        />
      )}

      {showMoveLearning && (
        <MoveLearningOverlay
          pokemon={showMoveLearning.pokemon}
          newMove={showMoveLearning.move}
          onComplete={handleMoveLearningComplete}
          onCancel={() => setShowMoveLearning(null)}
        />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
