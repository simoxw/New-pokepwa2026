import { Pokemon, GameState } from '../types/game';
import { getMoveByName } from '../data/movesData';
import { resolveCanonicalPokemonId } from '../data/pokemonSpeciesMap';
import { POKEMON_FALLBACKS } from '../data/pokemonFallbacks';
import { recalculateStats } from './leveling';

/**
 * Normalizes any raw Pokemon object (from storage or N64/Base64 import)
 * to ensure all sprite properties and required fields are guaranteed present and canonical.
 */
export function normalizePokemon(raw: any): Pokemon {
  const rawId = typeof raw.pokemonId === 'number' && raw.pokemonId > 0
    ? raw.pokemonId 
    : (typeof raw.baseSpeciesId === 'number' && raw.baseSpeciesId > 0
        ? raw.baseSpeciesId 
        : (typeof raw.id === 'number' && raw.id > 0 ? raw.id : (parseInt(raw.id, 10) || 1)));

  // Resolve canonical ID (e.g. if name is 'Poliwrath' but id was 61, resolves to 62)
  const pokemonId = resolveCanonicalPokemonId(raw.name || raw.species || raw.speciesName, rawId);

  const sprites = raw.sprites || {};
  const isShiny = Boolean(raw.isShiny);
  
  // Official PokeAPI Image URLs
  const officialArtworkUrl = isShiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  const frontSpriteUrl = isShiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  const backSpriteUrl = isShiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${pokemonId}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonId}.png`;
  const homeSpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonId}.png`;
  const showdownSpriteUrl = isShiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${pokemonId}.gif`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${pokemonId}.gif`;

  const customImg = typeof raw.spriteUrl === 'string' ? raw.spriteUrl : (typeof raw.sprite === 'string' ? raw.sprite : (typeof raw.image === 'string' ? raw.image : undefined));

  const rawArtwork = typeof sprites.artwork === 'string' ? sprites.artwork : (typeof sprites.artwork?.front_default === 'string' ? sprites.artwork.front_default : undefined);
  const rawFront = typeof sprites.front === 'string' ? sprites.front : (typeof sprites.front_default === 'string' ? sprites.front_default : undefined);
  const rawBack = typeof sprites.back === 'string' ? sprites.back : (typeof sprites.back_default === 'string' ? sprites.back_default : undefined);
  const rawAnimated = typeof sprites.animated === 'string' ? sprites.animated : (typeof sprites.animated?.front_default === 'string' ? sprites.animated.front_default : undefined);
  const rawHome = typeof sprites.home === 'string' ? sprites.home : undefined;

  // Artwork: Official high-resolution artwork
  let artwork = officialArtworkUrl;
  if (rawArtwork && !rawArtwork.includes('PokeAPI') && !rawArtwork.includes('raw.githubusercontent.com')) {
    artwork = rawArtwork;
  } else if (customImg && !customImg.includes('PokeAPI') && !customImg.includes('raw.githubusercontent.com')) {
    artwork = customImg;
  }

  // Front sprite (pixel sprite for box, team icons, grid):
  let front = frontSpriteUrl;
  if (rawFront && !rawFront.includes('PokeAPI') && !rawFront.includes('raw.githubusercontent.com')) {
    front = rawFront;
  } else if (customImg && !customImg.includes('PokeAPI') && !customImg.includes('raw.githubusercontent.com')) {
    front = customImg;
  }

  const back = (rawBack && !rawBack.includes('PokeAPI') && !rawBack.includes('raw.githubusercontent.com')) ? rawBack : backSpriteUrl;
  const home = rawHome || homeSpriteUrl;
  const animated = (rawAnimated && !rawAnimated.includes('PokeAPI') && !rawAnimated.includes('raw.githubusercontent.com')) ? rawAnimated : showdownSpriteUrl;

  // Moves normalization using getMoveByName
  const rawMoves = Array.isArray(raw.moves) ? raw.moves : [];
  const normalizedMoves = rawMoves.map((m: any) => {
    if (typeof m === 'string') {
      return getMoveByName(m);
    }
    const moveName = m.name || m.title || 'Azione';
    const baseMove = getMoveByName(moveName);
    
    // Authoritative stats (Power, Category, Type, MaxPP, Effects)
    const effectiveType = (baseMove.type && baseMove.type !== 'normal') 
      ? baseMove.type 
      : (m.type && typeof m.type === 'string' && m.type !== 'normal' ? m.type : (baseMove.type || 'normal'));

    const maxPp = baseMove.maxPp || baseMove.pp || m.maxPp || 35;
    const currentPp = typeof m.pp === 'number' ? Math.min(Math.max(0, m.pp), maxPp) : maxPp;

    let moveDrain = baseMove.drain !== undefined ? baseMove.drain : m.drain;
    if (typeof moveDrain === 'number' && moveDrain > 1) {
      moveDrain = moveDrain / 100;
    }

    return {
      ...baseMove,
      name: baseMove.name || moveName,
      type: effectiveType,
      category: baseMove.category || m.category || (baseMove.power ? 'physical' : 'status'),
      power: (typeof baseMove.power === 'number' && (baseMove.power > 0 || baseMove.category === 'status')) ? baseMove.power : (typeof m.power === 'number' ? m.power : 40),
      accuracy: baseMove.accuracy !== undefined ? baseMove.accuracy : (m.accuracy || 100),
      pp: currentPp,
      maxPp: maxPp,
      priority: baseMove.priority !== undefined ? baseMove.priority : (m.priority || 0),
      statusEffect: baseMove.statusEffect || (baseMove.category !== 'status' && m.statusEffect ? m.statusEffect : undefined),
      effectChance: baseMove.effectChance !== undefined ? baseMove.effectChance : (baseMove.stat_changes_target === 'user' ? 100 : m.effectChance),
      drain: moveDrain,
      healing: baseMove.healing,
      recoil: baseMove.recoil,
      recoilMaxHp: baseMove.recoilMaxHp,
      stat_changes: (baseMove.stat_changes && baseMove.stat_changes.length > 0) ? baseMove.stat_changes : m.stat_changes,
      stat_changes_target: (baseMove as any).stat_changes_target || m.stat_changes_target,
      flinchChance: baseMove.flinchChance,
      confusionChance: baseMove.confusionChance,
      multiTurn: baseMove.multiTurn || m.multiTurn,
      target: baseMove.target || m.target
    };
  });

  // Experience & Level normalization (strictly capped between 1 and 100)
  const rawLevel = typeof raw.level === 'number' && raw.level > 0 ? raw.level : 5;
  const level = Math.max(1, Math.min(100, rawLevel));
  const getNextLevelExpNeeded = (lvl: number) => {
    if (lvl >= 100) return 0;
    const currentTotal = Math.pow(lvl, 3);
    const nextTotal = Math.pow(lvl + 1, 3);
    return Math.floor(nextTotal - currentTotal);
  };

  const nextLevelExp = level >= 100 
    ? 0 
    : (typeof raw.nextLevelExp === 'number' && raw.nextLevelExp > 0
        ? raw.nextLevelExp
        : getNextLevelExpNeeded(level));

  let experience = 0;
  if (level < 100) {
    if (typeof raw.experience === 'number' && !isNaN(raw.experience)) {
      experience = raw.experience;
    } else if (typeof raw.exp === 'number' && !isNaN(raw.exp)) {
      const baseTotalForLevel = Math.pow(level, 3);
      if (raw.exp >= baseTotalForLevel) {
        experience = raw.exp - baseTotalForLevel;
      } else {
        experience = raw.exp;
      }
    }
  }

  let finalPokemon: Pokemon = {
    ...raw,
    id: pokemonId,
    instanceId: raw.instanceId || (typeof raw.id === 'string' && raw.id.length > 3 ? raw.id : `${pokemonId}_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`),
    name: raw.name || 'Pokémon',
    level,
    experience,
    nextLevelExp,
    hp: typeof raw.hp === 'number' ? raw.hp : (raw.stats?.hp || raw.currentHp || 20),
    maxHp: typeof raw.maxHp === 'number' ? raw.maxHp : (raw.stats?.hp || raw.currentHp || 20),
    types: Array.isArray(raw.types) && raw.types.length > 0 ? raw.types : ['normal'],
    moves: normalizedMoves,
    sprites: {
      front,
      back,
      artwork,
      home,
      animated
    },
    stats: raw.stats || { attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
    ivs: raw.ivs || { hp: 15, attack: 15, defense: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: raw.evs || { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 }
  };

  if (rawLevel > 100 || finalPokemon.level >= 100) {
    finalPokemon = recalculateStats(finalPokemon);
  }

  return finalPokemon;
}

/**
 * Encodes a Pokemon object to a Base64 string with all full data intact.
 */
export function encodePokemon(pokemon: Pokemon): string {
  try {
    const json = JSON.stringify(pokemon);
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error('Failed to encode pokemon', e);
    return '';
  }
}

/**
 * Decodes a Base64 string to a Pokemon object (supports standard base64, URL-encoded json, and legacy formats).
 */
export function decodePokemon(base64: string): Pokemon | null {
  try {
    const trimmed = base64.trim();
    if (!trimmed) return null;

    let json: string = '';
    
    // Check if directly URL-encoded JSON or raw JSON
    if (trimmed.startsWith('%7B') || trimmed.startsWith('{') || trimmed.startsWith('%7b')) {
      try {
        json = decodeURIComponent(trimmed);
      } catch {
        json = trimmed;
      }
    } else {
      let padded = trimmed;
      while (padded.length % 4 !== 0) {
        padded += '=';
      }
      const rawDecoded = atob(padded);
      try {
        json = decodeURIComponent(rawDecoded);
      } catch {
        json = rawDecoded;
      }
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(json);
    } catch {
      // Fallback for truncated/cut-off JSON
      const idMatch = json.match(/"pokemonId":\s*(\d+)/) || json.match(/"id":\s*(\d+)/);
      const nameMatch = json.match(/"name":\s*"([^"]+)"/);
      const levelMatch = json.match(/"level":\s*(\d+)/);
      const typesMatch = json.match(/"types":\s*\[([^\]]+)\]/);

      if (idMatch || nameMatch) {
        const extractedId = idMatch ? parseInt(idMatch[1], 10) : 1;
        const extractedName = nameMatch ? nameMatch[1] : 'Pokémon';
        const extractedLevel = levelMatch ? parseInt(levelMatch[1], 10) : 5;
        let extractedTypes = ['normal'];
        if (typesMatch) {
          extractedTypes = typesMatch[1].replace(/"/g, '').split(',').map(t => t.trim());
        }

        parsed = {
          id: extractedId,
          pokemonId: extractedId,
          name: extractedName,
          level: extractedLevel,
          types: extractedTypes
        };
      }
    }

    if (!parsed) return null;
    return normalizePokemon(parsed);
  } catch (e) {
    console.error('Failed to decode pokemon', e);
    return null;
  }
}

/**
 * Encodes the entire team for local battle.
 */
export function encodeTeam(team: Pokemon[]): string {
  try {
    const json = JSON.stringify(team);
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error('Failed to encode team', e);
    return '';
  }
}

/**
 * Decodes a team from Base64.
 */
export function decodeTeam(base64: string): Pokemon[] | null {
  try {
    const trimmed = base64.trim();
    if (!trimmed) return null;

    let json: string;
    const rawDecoded = atob(trimmed);
    try {
      json = decodeURIComponent(rawDecoded);
    } catch {
      json = rawDecoded;
    }

    const team = JSON.parse(json);
    if (!Array.isArray(team) || team.length === 0) {
      return null;
    }

    return team.map(normalizePokemon);
  } catch (e) {
    console.error('Failed to decode team', e);
    return null;
  }
}

/**
 * Exports the game state to a JSON file.
 */
export function exportGameState(state: GameState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pokepwa_save_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Validates a loaded game state.
 */
export function validateGameState(data: any): data is GameState {
  return (
    data &&
    data.player &&
    Array.isArray(data.player.team) &&
    Array.isArray(data.player.box) &&
    typeof data.player.money === 'number'
  );
}
