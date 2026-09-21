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
  },

  // Regional Evolutions
  10091: { nextId: 10092, level: 20, name: 'Raticate di Alola', branches: [] },
  10101: { nextId: 10102, level: 22, name: 'Sandslash di Alola', branches: [] },
  10103: { nextId: 10104, level: 22, name: 'Ninetales di Alola', branches: [] },
  10105: { nextId: 10106, level: 26, name: 'Dugtrio di Alola', branches: [] },
  10107: { nextId: 10108, level: 28, name: 'Persian di Alola', branches: [] },
  10109: { nextId: 10110, level: 25, name: 'Graveler di Alola', branches: [] },
  10110: { nextId: 10111, level: 36, name: 'Golem di Alola', branches: [] },
  10112: { nextId: 10113, level: 38, name: 'Muk di Alola', branches: [] },
  10161: { nextId: 863, level: 28, name: 'Perrserker', branches: [] },
  10162: { nextId: 10163, level: 40, name: 'Rapidash di Galar', branches: [] },
  10164: { nextId: 10165, level: 37, name: 'Slowbro di Galar', branches: [] },
  10166: { nextId: 865, level: 28, name: "Sirfetch'd", branches: [] },
  10174: { nextId: 10175, level: 20, name: 'Linoone di Galar', branches: [] },
  10175: { nextId: 862, level: 35, name: 'Obstagoon', branches: [] },
  10173: { nextId: 864, level: 38, name: 'Cursola', branches: [] },
  10176: { nextId: 10177, level: 35, name: 'Darmanitan di Galar', branches: [] },
  10179: { nextId: 867, level: 34, name: 'Runerigus', branches: [] },
  10229: { nextId: 10230, level: 22, name: 'Arcanine di Hisui', branches: [] },
  10231: { nextId: 10232, level: 22, name: 'Electrode di Hisui', branches: [] },
  10234: { nextId: 904, level: 28, name: 'Overqwil', branches: [] },
  10235: { nextId: 903, level: 32, name: 'Sneasler', branches: [] },
  10238: { nextId: 10239, level: 30, name: 'Zoroark di Hisui', branches: [] },
  10241: { nextId: 10242, level: 50, name: 'Goodra di Hisui', branches: [] },
  10253: { nextId: 980, level: 20, name: 'Clodsire', branches: [] }
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
