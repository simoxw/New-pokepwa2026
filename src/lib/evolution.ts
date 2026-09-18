import { Pokemon } from '../types/game';
import { fetchPokemonData } from './pokeapi';

export const SPECIAL_EVOLUTIONS: Record<number, { nextId: number; level: number; name: string; branches: { nextId: number; level: number; name: string }[] }> = {
  // Eevee (133)
  133: {
    nextId: 134,
    level: 16,
    name: 'Vaporeon',
    branches: [
      { nextId: 134, level: 16, name: 'Vaporeon' },
      { nextId: 135, level: 16, name: 'Jolteon' },
      { nextId: 136, level: 16, name: 'Flareon' },
      { nextId: 196, level: 16, name: 'Espeon' },
      { nextId: 197, level: 16, name: 'Umbreon' },
      { nextId: 470, level: 16, name: 'Leafeon' },
      { nextId: 471, level: 16, name: 'Glaceon' },
      { nextId: 700, level: 16, name: 'Sylveon' }
    ]
  },
  // Gloom (44)
  44: {
    nextId: 45,
    level: 21,
    name: 'Vileplume',
    branches: [
      { nextId: 45, level: 21, name: 'Vileplume' },
      { nextId: 182, level: 21, name: 'Bellossom' }
    ]
  },
  // Poliwhirl (61)
  61: {
    nextId: 62,
    level: 25,
    name: 'Poliwrath',
    branches: [
      { nextId: 62, level: 25, name: 'Poliwrath' },
      { nextId: 186, level: 25, name: 'Politoed' }
    ]
  },
  // Slowpoke (79)
  79: {
    nextId: 80,
    level: 25,
    name: 'Slowbro',
    branches: [
      { nextId: 80, level: 25, name: 'Slowbro' },
      { nextId: 199, level: 25, name: 'Slowking' }
    ]
  },
  // Tyrogue (236)
  236: {
    nextId: 106,
    level: 20,
    name: 'Hitmonlee',
    branches: [
      { nextId: 106, level: 20, name: 'Hitmonlee' },
      { nextId: 107, level: 20, name: 'Hitmonchan' },
      { nextId: 237, level: 20, name: 'Hitmontop' }
    ]
  },
  // Wurmple (265)
  265: {
    nextId: 266,
    level: 7,
    name: 'Silcoon',
    branches: [
      { nextId: 266, level: 7, name: 'Silcoon' },
      { nextId: 268, level: 7, name: 'Cascoon' }
    ]
  },
  // Kirlia (281)
  281: {
    nextId: 282,
    level: 30,
    name: 'Gardevoir',
    branches: [
      { nextId: 282, level: 30, name: 'Gardevoir' },
      { nextId: 475, level: 30, name: 'Gallade' }
    ]
  },
  // Snorunt (361)
  361: {
    nextId: 362,
    level: 42,
    name: 'Glalie',
    branches: [
      { nextId: 362, level: 42, name: 'Glalie' },
      { nextId: 478, level: 42, name: 'Froslass' }
    ]
  },
  // Clamperl (366)
  366: {
    nextId: 367,
    level: 20,
    name: 'Huntail',
    branches: [
      { nextId: 367, level: 20, name: 'Huntail' },
      { nextId: 368, level: 20, name: 'Gorebyss' }
    ]
  }
};

/**
 * Checks if a pokemon is ready to evolve based on its level.
 */
export function canEvolve(pokemon: Pokemon): boolean {
  if (!pokemon.evolutionInfo) return false;
  return pokemon.level >= pokemon.evolutionInfo.level;
}

/**
 * Performs the evolution of a pokemon, preserving its individual data 
 * (IVs, EVs, nickname, caught location) while updating species data.
 */
export async function evolvePokemon(pokemon: Pokemon, targetId?: number): Promise<Pokemon> {
  if (!pokemon.evolutionInfo) return pokemon;

  const nextId = targetId || pokemon.evolutionInfo.nextId;

  // Fetch data for the new species
  const evolvedData = await fetchPokemonData(
    nextId, 
    pokemon.level, 
    pokemon.caughtLocation
  );

  // Merge individual data from old pokemon to new pokemon
  const mergedPokemon = {
    ...evolvedData,
    instanceId: pokemon.instanceId,
    nickname: pokemon.nickname,
    ivs: pokemon.ivs,
    evs: pokemon.evs,
    isShiny: pokemon.isShiny, // Keep shiny status
    experience: pokemon.experience,
    nextLevelExp: pokemon.nextLevelExp,
    caughtAt: pokemon.caughtAt,
    caughtLocation: pokemon.caughtLocation,
    moves: pokemon.moves // Preserve moves from previous evolution phase
  };

  // Recalculate stats based on new base stats but same IVs/EVs
  const { calculateStats } = await import('./pokeapi');
  const finalStats = calculateStats(
    mergedPokemon.baseStats,
    mergedPokemon.level,
    mergedPokemon.ivs,
    mergedPokemon.evs,
    mergedPokemon.nature
  );

  return {
    ...mergedPokemon,
    hp: finalStats.hp,
    maxHp: finalStats.hp,
    stats: {
      attack: finalStats.attack,
      defense: finalStats.defense,
      spAtk: finalStats.spAtk,
      spDef: finalStats.spDef,
      speed: finalStats.speed
    }
  };
}
