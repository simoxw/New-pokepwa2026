import { Pokemon, Move } from '../types/game';

const CACHE_NAME = 'poke-api-cache';

const NATURES = ['Decisa', 'Audace', 'Scaltra', 'Placida', 'Modesta', 'Mite', 'Calma', 'Vivace', 'Timida', 'Allegra'];

export async function fetchMoveData(url: string): Promise<Move> {
  const moveData = await fetchWithCache(url);
  const itMoveName = moveData.names.find((n: any) => n.language.name === 'it')?.name || MOVE_TRANSLATIONS[moveData.name] || moveData.name;
  
  return {
    name: itMoveName,
    power: moveData.power || 40,
    type: moveData.type.name,
    accuracy: moveData.accuracy || 100,
    category: moveData.damage_class.name,
    pp: moveData.pp,
    maxPp: moveData.pp,
  };
}

export async function fetchWithCache(url: string) {
  const cache = await caches.open(CACHE_NAME);
  let response = await cache.match(url);
  
  if (!response) {
    response = await fetch(url);
    if (response.ok) {
      await cache.put(url, response.clone());
    }
  }
  return response.json();
}

const MOVE_TRANSLATIONS: Record<string, string> = {
  'tackle': 'Azione',
  'growl': 'Ruggito',
  'scratch': 'Graffio',
  'tail-whip': 'Colpo di Coda',
  'ember': 'Braciere',
  'water-gun': 'Pistola d\'Acqua',
  'vine-whip': 'Frustata',
  'quick-attack': 'Attacco Rapido',
  'thunder-shock': 'Tuonoshock',
  'confusion': 'Confusione',
  'psybeam': 'Psicoraggio',
  'bubble': 'Bolla',
  'withdraw': 'Rafforzatore',
  'splash': 'Splash',
  'string-shot': 'Millebave',
  'harden': 'Rafforzamento',
  'leech-life': 'Sanguisuga',
  'gust': 'Raffica',
  'poison-sting': 'Velenospina',
  'fury-attack': 'Furia',
  'horn-attack': 'Incornata',
  'double-kick': 'Doppiocalcio',
  'leer': 'Fulmisguardo',
  'bite': 'Morso',
  'roar': 'Boato',
  'disable': 'Inibitore',
  'mist': 'Nebbia',
  'haze': 'Nube',
};

export async function getBaseStats(id: number) {
  const data = await fetchWithCache(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return {
    hp: data.stats.find((s: any) => s.stat.name === 'hp').base_stat,
    attack: data.stats.find((s: any) => s.stat.name === 'attack').base_stat,
    defense: data.stats.find((s: any) => s.stat.name === 'defense').base_stat,
    spAtk: data.stats.find((s: any) => s.stat.name === 'special-attack').base_stat,
    spDef: data.stats.find((s: any) => s.stat.name === 'special-defense').base_stat,
    speed: data.stats.find((s: any) => s.stat.name === 'speed').base_stat,
  };
}

const NATURE_EFFECTS: Record<string, { plus?: string, minus?: string }> = {
  'Decisa': { plus: 'attack', minus: 'spAtk' },
  'Audace': { plus: 'attack', minus: 'speed' },
  'Scaltra': { plus: 'defense', minus: 'spAtk' },
  'Placida': { plus: 'defense', minus: 'speed' },
  'Modesta': { plus: 'spAtk', minus: 'attack' },
  'Mite': { plus: 'spAtk', minus: 'defense' },
  'Calma': { plus: 'spDef', minus: 'attack' },
  'Vivace': { plus: 'spDef', minus: 'speed' },
  'Timida': { plus: 'speed', minus: 'attack' },
  'Allegra': { plus: 'speed', minus: 'spAtk' },
};

export function calculateStats(
  baseStats: { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number },
  level: number,
  ivs: { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number },
  evs: { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number },
  nature: string = 'Neutrale'
) {
  const stats: any = {
    hp: Math.floor(((2 * baseStats.hp + ivs.hp + Math.floor(evs.hp / 4)) * level) / 100 + level + 10),
  };

  const statNames = ['attack', 'defense', 'spAtk', 'spDef', 'speed'];
  const effects = NATURE_EFFECTS[nature];

  statNames.forEach(stat => {
    let base = Math.floor(((2 * (baseStats as any)[stat] + (ivs as any)[stat] + Math.floor((evs as any)[stat] / 4)) * level) / 100 + 5);
    
    if (effects) {
      if (effects.plus === stat) base = Math.floor(base * 1.1);
      if (effects.minus === stat) base = Math.floor(base * 0.9);
    }
    
    stats[stat] = base;
  });

  return stats;
}

export async function fetchPokemonData(id: number, level: number, location: string = 'Sconosciuta'): Promise<Pokemon> {
  const data = await fetchWithCache(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const species = await fetchWithCache(data.species.url);

  // Get Italian Name
  const italianName = species.names.find((n: any) => n.language.name === 'it')?.name || data.name;

  // Get Abilities
  let ability;
  try {
    const abilityData = data.abilities.find((a: any) => !a.is_hidden) || data.abilities[0];
    const abilityInfo = await fetchWithCache(abilityData.ability.url);
    ability = {
      name: abilityInfo.names.find((n: any) => n.language.name === 'it')?.name || abilityData.ability.name,
      description: abilityInfo.flavor_text_entries.find((f: any) => f.language.name === 'it')?.flavor_text || 
                   abilityInfo.flavor_text_entries.find((f: any) => f.language.name === 'en')?.flavor_text || ""
    };
  } catch (e) {
    console.error("Failed to fetch ability", e);
  }

  // Get first 4 moves
  const moves: Move[] = await Promise.all(
    data.moves.slice(0, 4).map(async (m: any) => {
      try {
        const moveData = await fetchWithCache(m.move.url);
        const itMoveName = moveData.names.find((n: any) => n.language.name === 'it')?.name || MOVE_TRANSLATIONS[m.move.name] || m.move.name;
        return {
          name: itMoveName,
          power: moveData.power || 40,
          type: moveData.type.name,
          accuracy: moveData.accuracy || 100,
          category: moveData.damage_class.name,
          pp: moveData.pp,
          maxPp: moveData.pp,
        };
      } catch (e) {
        return {
          name: MOVE_TRANSLATIONS[m.move.name] || m.move.name,
          power: 40,
          type: 'normal',
          accuracy: 100,
          category: 'physical' as const,
          pp: 35,
          maxPp: 35
        };
      }
    })
  );

  const ivs = {
    hp: Math.floor(Math.random() * 32),
    attack: Math.floor(Math.random() * 32),
    defense: Math.floor(Math.random() * 32),
    spAtk: Math.floor(Math.random() * 32),
    spDef: Math.floor(Math.random() * 32),
    speed: Math.floor(Math.random() * 32),
  };

  const evs = {
    hp: 0,
    attack: 0,
    defense: 0,
    spAtk: 0,
    spDef: 0,
    speed: 0,
  };

  const baseStats = {
    hp: data.stats.find((s: any) => s.stat.name === 'hp').base_stat,
    attack: data.stats.find((s: any) => s.stat.name === 'attack').base_stat,
    defense: data.stats.find((s: any) => s.stat.name === 'defense').base_stat,
    spAtk: data.stats.find((s: any) => s.stat.name === 'special-attack').base_stat,
    spDef: data.stats.find((s: any) => s.stat.name === 'special-defense').base_stat,
    speed: data.stats.find((s: any) => s.stat.name === 'speed').base_stat,
  };

  const nature = NATURES[Math.floor(Math.random() * NATURES.length)];
  const stats = calculateStats(baseStats, level, ivs, evs, nature);

  const evYield = {
    hp: data.stats.find((s: any) => s.stat.name === 'hp').effort,
    attack: data.stats.find((s: any) => s.stat.name === 'attack').effort,
    defense: data.stats.find((s: any) => s.stat.name === 'defense').effort,
    spAtk: data.stats.find((s: any) => s.stat.name === 'special-attack').effort,
    spDef: data.stats.find((s: any) => s.stat.name === 'special-defense').effort,
    speed: data.stats.find((s: any) => s.stat.name === 'speed').effort,
  };

  const learnableMoves = data.moves
    .map((m: any) => ({
      level: m.version_group_details.find((v: any) => v.move_learn_method.name === 'level-up')?.level_learned_at || 0,
      name: m.move.name,
      url: m.move.url
    }))
    .filter((m: any) => m.level > 0)
    .sort((a: any, b: any) => a.level - b.level);

  // Evolution Data
  let evolutionInfo;
  try {
    const evolutionChainData = await fetchWithCache(species.evolution_chain.url);
    
    // Find current species in the chain
    let current = evolutionChainData.chain;
    const findNextEvolution = (node: any): any => {
      if (node.species.name === data.name) {
        return node.evolves_to[0]; // Take the first evolution branch for now
      }
      for (const next of node.evolves_to) {
        const found = findNextEvolution(next);
        if (found) return found;
      }
      return null;
    };

    const nextEvoNode = findNextEvolution(current);
    if (nextEvoNode) {
      const nextId = parseInt(nextEvoNode.species.url.split('/').filter(Boolean).pop());
      const minLevel = nextEvoNode.evolution_details[0]?.min_level || 16;
      evolutionInfo = {
        nextId,
        level: minLevel,
        name: nextEvoNode.species.name // We'll translate this during evolution or pre-fetch
      };
    }
  } catch (e) {
    console.error("Failed to fetch evolution chain", e);
  }

  // Sprite selection
  const isShiny = Math.random() < 1/128;
  
  const sprites = {
    front: isShiny ? data.sprites.front_shiny : data.sprites.front_default,
    back: isShiny ? data.sprites.back_shiny : data.sprites.back_default,
    artwork: isShiny ? (data.sprites.other['official-artwork'].front_shiny || data.sprites.other['official-artwork'].front_default) : (data.sprites.other['official-artwork'].front_default || data.sprites.front_default),
    home: isShiny ? (data.sprites.other.home?.front_shiny || data.sprites.other['official-artwork'].front_shiny || data.sprites.front_shiny) : (data.sprites.other.home?.front_default || data.sprites.other['official-artwork'].front_default || data.sprites.front_default),
    animated: data.sprites.other.showdown?.front_default ? {
      front: isShiny ? (data.sprites.other.showdown.front_shiny || data.sprites.other.showdown.front_default) : data.sprites.other.showdown.front_default,
      back: isShiny ? (data.sprites.other.showdown.back_shiny || data.sprites.other.showdown.back_default) : data.sprites.other.showdown.back_default,
    } : (data.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default ? {
      front: isShiny ? (data.sprites.versions['generation-v']['black-white'].animated.front_shiny || data.sprites.versions['generation-v']['black-white'].animated.front_default) : data.sprites.versions['generation-v']['black-white'].animated.front_default,
      back: isShiny ? (data.sprites.versions['generation-v']['black-white'].animated.back_shiny || data.sprites.versions['generation-v']['black-white'].animated.back_default) : data.sprites.versions['generation-v']['black-white'].animated.back_default,
    } : undefined)
  };

  return {
    id: data.id,
    instanceId: Math.random().toString(36).substring(2, 11),
    name: italianName,
    level,
    hp: stats.hp,
    maxHp: stats.hp,
    types: data.types.map((t: any) => t.type.name),
    ability,
    stats: { 
      attack: stats.attack, 
      defense: stats.defense, 
      spAtk: stats.spAtk, 
      spDef: stats.spDef, 
      speed: stats.speed 
    },
    baseStats,
    evYield,
    learnableMoves,
    evolutionInfo,
    sprites,
    moves,
    experience: 0,
    nextLevelExp: Math.pow(level + 1, 3) - Math.pow(level, 3),
    nature,
    ivs,
    evs,
    isShiny,
    caughtAt: Date.now(),
    caughtLocation: location
  };
}
