import { Pokemon } from '../types/game';
import { canEvolve } from './evolution';

/**
 * Calculates experience gained from a battle.
 */
export function calculateExpGain(winner: Pokemon, loser: Pokemon): number {
  // Official-ish formula: (a * b * L) / (7 * s)
  // a: 1 for wild, b: base exp, L: level of loser, s: number of pkmn sharing exp
  // We'll use a simplified version based on level since we don't store base_exp
  const a = 1; // wild
  const b = 100; // Average base exp
  const L = loser.level;
  
  // Bonus if winner is much lower level than loser
  const levelBonus = Math.max(1, (2 * L + 10) / (L + winner.level + 10));
  
  return Math.floor(((a * b * L) / 7) * levelBonus);
}

/**
 * Checks if a pokemon should level up and returns the new level if it does.
 */
export function checkLevelUp(pokemon: Pokemon): { 
  leveledUp: boolean; 
  newPokemon: Pokemon; 
  canEvolve: boolean;
  newMoves: { name: string; url: string }[];
} {
  let currentPokemon = { ...pokemon };
  let leveledUp = false;
  const newMoves: { name: string; url: string }[] = [];

  // Official Medium Fast curve: n^3
  const getNextLevelExp = (lvl: number) => {
    // We calculate the difference between (lvl+1)^3 and lvl^3
    // to get the experience needed to progress to the next level.
    const currentTotal = Math.pow(lvl, 3);
    const nextTotal = Math.pow(lvl + 1, 3);
    return Math.floor(nextTotal - currentTotal);
  };

  while (currentPokemon.experience >= currentPokemon.nextLevelExp) {
    leveledUp = true;
    currentPokemon.level += 1;
    currentPokemon.experience -= currentPokemon.nextLevelExp;
    
    // Check for new moves
    if (currentPokemon.learnableMoves) {
      const movesAtThisLevel = currentPokemon.learnableMoves.filter(m => m.level === currentPokemon.level);
      movesAtThisLevel.forEach(m => {
        // Only if we don't already know the move
        if (!currentPokemon.moves.find(existing => existing.name.toLowerCase() === m.name.toLowerCase())) {
          newMoves.push({ name: m.name, url: m.url });
        }
      });
    }

    // Official stats recalculation
    currentPokemon = recalculateStats(currentPokemon);
    
    // Heal slightly on level up
    currentPokemon.hp = Math.min(currentPokemon.hp + 5, currentPokemon.maxHp);
    
    currentPokemon.nextLevelExp = getNextLevelExp(currentPokemon.level);
  }

  return { leveledUp, newPokemon: currentPokemon, canEvolve: canEvolve(currentPokemon), newMoves };
}

/**
 * Adds Effort Values to a pokemon, respecting the 510 total and 252 per stat limits.
 */
export function applyEvs(pokemon: Pokemon, yieldEvs?: Pokemon['evYield']): Pokemon {
  if (!yieldEvs) return pokemon;
  
  const currentPokemon = { ...pokemon, evs: { ...pokemon.evs } };
  const totalEvs = Object.values(currentPokemon.evs).reduce((a, b) => a + b, 0);
  
  if (totalEvs >= 510) return pokemon;

  const stats = ['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'] as const;
  
  let remainingTotal = 510 - totalEvs;
  
  stats.forEach(stat => {
    const gain = yieldEvs[stat] || 0;
    if (gain > 0 && remainingTotal > 0) {
      const currentStatEv = currentPokemon.evs[stat];
      const maxGain = Math.min(gain, 252 - currentStatEv, remainingTotal);
      if (maxGain > 0) {
        currentPokemon.evs[stat] += maxGain;
        remainingTotal -= maxGain;
      }
    }
  });

  return recalculateStats(currentPokemon);
}

/**
 * Recalculates stats based on current level, base stats, IVs and EVs.
 */
export function recalculateStats(pokemon: Pokemon): Pokemon {
  const { baseStats, ivs, evs, level } = pokemon;
  if (!baseStats) return pokemon;

  const stats = {
    attack: Math.floor(((2 * baseStats.attack + (ivs?.attack || 0) + Math.floor((evs?.attack || 0) / 4)) * level) / 100 + 5),
    defense: Math.floor(((2 * baseStats.defense + (ivs?.defense || 0) + Math.floor((evs?.defense || 0) / 4)) * level) / 100 + 5),
    spAtk: Math.floor(((2 * baseStats.spAtk + (ivs?.spAtk || 0) + Math.floor((evs?.spAtk || 0) / 4)) * level) / 100 + 5),
    spDef: Math.floor(((2 * baseStats.spDef + (ivs?.spDef || 0) + Math.floor((evs?.spDef || 0) / 4)) * level) / 100 + 5),
    speed: Math.floor(((2 * baseStats.speed + (ivs?.speed || 0) + Math.floor((evs?.speed || 0) / 4)) * level) / 100 + 5),
  };

  const maxHp = Math.floor(((2 * baseStats.hp + (ivs?.hp || 0) + Math.floor((evs?.hp || 0) / 4)) * level) / 100 + level + 10);
  
  return {
    ...pokemon,
    stats,
    maxHp,
    hp: Math.min(pokemon.hp, maxHp) // Don't heal on EV gain, just cap
  };
}
