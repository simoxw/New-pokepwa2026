import { GameProvider, useGame } from './contexts/GameContext';
import { Layout } from './components/Layout';
import { Hub } from './components/Hub';
import { ZoneExplorer } from './components/ZoneExplorer';
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
import { fullyHealPokemon } from './lib/pokemonHeal';

import { Sfidofono } from './components/Sfidofono';
import { StarterSelection } from './components/StarterSelection';
import { LeagueHub } from './components/LeagueHub';
import { BattleTower } from './components/BattleTower';

function GameContent() {
  const { state, setState } = useGame();
  // Quest Progress Checker
  useEffect(() => {
    const caughtCount = Object.values(state.player.pokedex).filter(s => s === 'caught').length;
    const badgeCount = state.player.badges.length;
    const money = state.player.money;
    const leagueVictories = state.player.leagueVictories || 0;
    const towerHighFloor = state.player.towerHighFloor || 0;
    const teamMaxLvl = state.player.team.reduce((max, p) => Math.max(max, p.level), 0);
    const defeatedCount = state.player.defeatedTrainers?.length || 0;

    setState(prev => {
      let changed = false;
      const newQuests = prev.player.quests.map(q => {
        if (q.status !== 'active') return q;

        let completed = false;
        if (q.id === 'first-steps' && prev.player.location !== 'villaggio') completed = true;
        if (q.id === 'money-maker' && money >= 50000) completed = true;
        if (q.id === 'badge-collector-pro' && badgeCount >= 10) completed = true;
        if (q.id === 'area-conqueror' && badgeCount >= 8) completed = true;
        if (q.id === 'champion-of-code' && leagueVictories >= 1) completed = true;
        if (q.id === 'post-game-explorer' && prev.player.location === 'area-zero') completed = true;
        if (q.id === 'tower-challenger' && towerHighFloor >= 10) completed = true;
        if (q.id === 'pokedex-pinnacle' && caughtCount >= 100) completed = true;
        if (q.id === 'team-powerhouse' && teamMaxLvl >= 70) completed = true;
        if (q.id === 'trainer-slayer' && defeatedCount >= 50) completed = true;

        if (q.id === 'legend-collector') {
          const legendIds = [144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 480, 481, 482, 483, 484, 485, 486, 487, 488, 491, 492, 493, 643, 644, 646, 716, 717, 718, 791, 792, 800, 888, 889, 890, 1007, 1008, 1024];
          const caughtLegends = legendIds.filter(id => prev.player.pokedex[id] === 'caught').length;
          if (caughtLegends >= 3) completed = true;
        }

        if (q.id === 'healer-zen') {
          if (prev.player.team.length > 0 && prev.player.team.every(p => p.hp >= p.maxHp)) {
            completed = true;
          }
        }
        
        if (completed) {
          changed = true;
          return { ...q, status: 'completed' as const };
        }
        return q;
      });

      if (!changed) return prev;
      return { ...prev, player: { ...prev.player, quests: newQuests } };
    });
  }, [
    state.player.location, 
    state.player.money, 
    state.player.badges.length, 
    state.player.pokedex, 
    state.player.leagueVictories, 
    state.player.towerHighFloor, 
    state.player.team, 
    state.player.defeatedTrainers?.length
  ]);
  const [showStarterSelect, setShowStarterSelect] = useState(false);
  const [activeBattle, setActiveBattle] = useState<Pokemon | null>(null);
  const [activeTrainer, setActiveTrainer] = useState<Trainer | undefined>();
  const [showEvolution, setShowEvolution] = useState<Pokemon | null>(null);
  const [showMoveLearning, setShowMoveLearning] = useState<{ pokemon: Pokemon, move: Move } | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'game' | 'pokedex' | 'inventory' | 'team' | 'box' | 'trade' | 'local-battle' | 'settings' | 'badgecase' | 'shop' | 'profile' | 'quests' | 'sfidofono' | 'league' | 'tower'>('game');
  const [lastTowerBattleResult, setLastTowerBattleResult] = useState<'win' | 'lose' | null>(null);

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
    const isLeagueBattle = activeTrainer?.id?.startsWith('superquattro-') || activeTrainer?.id === 'campione-pm';
    const isTowerBattle = activeTrainer?.id?.startsWith('tower-bot-');

    if (result === 'catch' && ballUsed && activeBattle) {
      // Save caught pokemon
      setState(prev => {
        const newMember = { ...activeBattle, caughtAt: Date.now() };
        
        // Quest Check: Magikarp Fan
        let newQuests = [...prev.player.quests];
        if (activeBattle.name.toLowerCase() === 'magikarp') {
          newQuests = newQuests.map(q => 
            q.id === 'magikarp-fan' && q.status === 'active' ? { ...q, status: 'completed' as const } : q
          );
        }
        
        // Quest Check: Shiny Hunter
        if (activeBattle.isShiny) {
          newQuests = newQuests.map(q => 
            q.id === 'shiny-hunter' && q.status === 'active' ? { ...q, status: 'completed' as const } : q
          );
        }

        // Quest Check: Rare Spawn Hunter
        const spawnTable = prev.player.location !== 'villaggio' ? (prev as any).ZONES?.find((z: any) => z.id === prev.player.location)?.spawnTable : [];
        const spawnInfo = spawnTable?.find((s: any) => s.pokemonId === activeBattle.id);
        if (spawnInfo && spawnInfo.rarity < 1) {
          newQuests = newQuests.map(q => 
            q.id === 'rare-spawn-hunter' && q.status === 'active' ? { ...q, status: 'completed' as const } : q
          );
        }

        // Quest Check: Dragon Tamer
        if (activeBattle.types?.includes('dragon')) {
          newQuests = newQuests.map(q => 
            q.id === 'dragon-tamer' && q.status === 'active' ? { ...q, status: 'completed' as const } : q
          );
        }

        // Quest Check: Paradox Catcher (Area Zero legendaries & 20 paradox forms)
        const areaZeroLegendaryIds = [
          1007, 1008, 493, 386, 491, 643, 644, 646, 716, 717, 718, 791, 800, 888, 889, 890, 1024, 807, 892,
          984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1005, 1006, 1009, 1010, 1020, 1021, 1022, 1023
        ];
        if (areaZeroLegendaryIds.includes(activeBattle.id) || prev.player.location === 'area-zero') {
          newQuests = newQuests.map(q => 
            q.id === 'paradox-catcher' && q.status === 'active' ? { ...q, status: 'completed' as const } : q
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
    } else if (result === 'lose') {
      if (isTowerBattle) {
        setLastTowerBattleResult('lose');
        setCurrentScreen('tower');
        setActiveBattle(null);
        setActiveTrainer(undefined);
      } else {
        setState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            location: 'villaggio',
            team: prev.player.team.map(p => fullyHealPokemon(p))
          }
        }));
        setActiveBattle(null);
        setActiveTrainer(undefined);
        setCurrentScreen('game');
      }
      if (evoCandidate) setShowEvolution(evoCandidate);
      if (moveCandidate) setShowMoveLearning(moveCandidate);
    } else {
      setActiveBattle(null);
      setActiveTrainer(undefined);
      if (isLeagueBattle) {
        setCurrentScreen('league');
      } else if (isTowerBattle) {
        setLastTowerBattleResult('win');
        setCurrentScreen('tower');
      }
      if (evoCandidate) {
        setShowEvolution(evoCandidate);
      }
      if (moveCandidate) {
        setShowMoveLearning(moveCandidate);
      }
    }
  }, [activeBattle, activeTrainer, setState]);

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
      {currentScreen === 'sfidofono' && (
        <Sfidofono 
          key="sfidofono-screen"
          onBack={() => setCurrentScreen('game')} 
          onStartBattle={(trainer) => {
            setActiveTrainer(trainer);
            setActiveBattle(trainer.team[0]);
            setCurrentScreen('game');
          }}
        />
      )}
      {currentScreen === 'league' && (
        <LeagueHub 
          key="league-screen"
          onBack={() => setCurrentScreen('game')} 
          onOpenInventory={() => setCurrentScreen('inventory')}
          onStartBattle={(trainer) => {
            setActiveTrainer(trainer);
            setActiveBattle(trainer.team[0]);
          }}
        />
      )}
      {currentScreen === 'tower' && (
        <BattleTower 
          key="tower-screen"
          onBack={() => setCurrentScreen('game')} 
          lastBattleResult={lastTowerBattleResult}
          onClearBattleResult={() => setLastTowerBattleResult(null)}
          onStartBattle={(trainer) => {
            setActiveTrainer(trainer);
            setActiveBattle(trainer.team[0]);
          }}
        />
      )}

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
