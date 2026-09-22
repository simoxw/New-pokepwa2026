import { Pokemon, GameState } from '../types/game';
import { getMoveByName } from '../data/movesData';

/**
 * Normalizes any raw Pokemon object (from storage or N64/Base64 import)
 * to ensure all sprite properties and required fields are guaranteed present.
 */
export function normalizePokemon(raw: any): Pokemon {
  const pokemonId = typeof raw.pokemonId === 'number' && raw.pokemonId > 0
    ? raw.pokemonId 
    : (typeof raw.baseSpeciesId === 'number' && raw.baseSpeciesId > 0
        ? raw.baseSpeciesId 
        : (typeof raw.id === 'number' && raw.id > 0 ? raw.id : (parseInt(raw.id, 10) || 1)));

  const sprites = raw.sprites || {};
  
  // Official PokeAPI Image URLs
  const officialArtworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  const frontSpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  const backSpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonId}.png`;
  const homeSpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonId}.png`;
  const showdownSpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${pokemonId}.gif`;

  const customImg = raw.spriteUrl || raw.sprite || raw.image;

  const artwork = sprites.artwork || customImg || officialArtworkUrl;
  const front = sprites.front || customImg || frontSpriteUrl || officialArtworkUrl;
  const back = sprites.back || backSpriteUrl;
  const home = sprites.home || homeSpriteUrl;
  const animated = sprites.animated || showdownSpriteUrl;

  // Moves normalization using getMoveByName
  const rawMoves = Array.isArray(raw.moves) ? raw.moves : [];
  const normalizedMoves = rawMoves.map((m: any) => {
    if (typeof m === 'string') {
      return getMoveByName(m);
    }
    const moveName = m.name || m.title || 'Azione';
    const baseMove = getMoveByName(moveName);
    
    // Retroactive Fix: If the saved move has type 'normal' but the baseMove has a specific type, 
    // or if the name is in English but we found the Italian counterpart, correct them retroactively.
    return {
      ...baseMove,
      ...m,
      name: baseMove.name || moveName,
      type: (baseMove.type && baseMove.type !== 'normal') ? baseMove.type : (m.type || baseMove.type || 'normal'),
      category: baseMove.category || m.category || 'physical',
      power: baseMove.power || m.power || 40,
      accuracy: baseMove.accuracy || m.accuracy || 100,
      pp: typeof m.pp === 'number' ? m.pp : (baseMove.pp || 35),
      maxPp: baseMove.maxPp || m.maxPp || 35
    };
  });

  // Experience & Level normalization (handles Pokedesk 'exp' vs native 'experience' & 'nextLevelExp')
  const level = typeof raw.level === 'number' && raw.level > 0 ? raw.level : 5;
  const getNextLevelExpNeeded = (lvl: number) => {
    const currentTotal = Math.pow(lvl, 3);
    const nextTotal = Math.pow(lvl + 1, 3);
    return Math.floor(nextTotal - currentTotal);
  };

  const nextLevelExp = typeof raw.nextLevelExp === 'number' && raw.nextLevelExp > 0
    ? raw.nextLevelExp
    : getNextLevelExpNeeded(level);

  let experience = 0;
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

  return {
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
}

/**
 * Encodes a Pokemon object to a Base64 string.
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
 * Decodes a Base64 string to a Pokemon object.
 */
export function decodePokemon(base64: string): Pokemon | null {
  try {
    const trimmed = base64.trim();
    if (!trimmed) return null;

    let json: string = '';
    
    // Try standard base64 decoding with padding fix if needed
    try {
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
    } catch {
      return null;
    }

    let parsed: any = null;
    
    // 1. Standard parse
    try {
      parsed = JSON.parse(json);
    } catch {
      // 2. Truncated JSON repair
      const repairAttempts = [
        json + '}',
        json + '}]}',
        json + '"}]}',
        json + '"]}',
        json + '"}}',
        json + '"}'
      ];
      for (const attempt of repairAttempts) {
        try {
          parsed = JSON.parse(attempt);
          break;
        } catch {
          // continue
        }
      }

      // 3. Regex fallback if JSON was cut off mid-payload
      if (!parsed) {
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
            pokemonId: extractedId,
            name: extractedName,
            level: extractedLevel,
            types: extractedTypes
          };
        }
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

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
