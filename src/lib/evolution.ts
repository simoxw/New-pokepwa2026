import { Pokemon } from '../types/game';
import { fetchPokemonData } from './pokeapi';

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
export async function evolvePokemon(pokemon: Pokemon): Promise<Pokemon> {
  if (!pokemon.evolutionInfo) return pokemon;

  // Fetch data for the new species
  const evolvedData = await fetchPokemonData(
    pokemon.evolutionInfo.nextId, 
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
