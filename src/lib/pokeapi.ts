import { Pokemon, Move } from '../types/game';

const CACHE_NAME = 'poke-api-cache';

const NATURES = ['Decisa', 'Audace', 'Scaltra', 'Placida', 'Modesta', 'Mite', 'Calma', 'Vivace', 'Timida', 'Allegra'];

export function parseMoveObject(moveData: any, fallbackName?: string): Move {
  const itMoveName = moveData.names?.find((n: any) => n.language.name === 'it')?.name || 
                     (moveData.name ? MOVE_TRANSLATIONS[moveData.name] : undefined) || 
                     moveData.name || 
                     fallbackName || 
                     'Mossa';

  const category = (moveData.damage_class?.name as 'physical' | 'special' | 'status') || 
                   (moveData.power ? 'physical' : 'status');

  // Status moves must NEVER have power > 0
  const power = category === 'status' ? 0 : (typeof moveData.power === 'number' ? moveData.power : 40);
  const accuracy = typeof moveData.accuracy === 'number' ? moveData.accuracy : 100;
  const pp = typeof moveData.pp === 'number' ? moveData.pp : 35;
  const moveType = moveData.type?.name || 'normal';

  // Stat changes extraction
  let stat_changes = Array.isArray(moveData.stat_changes) 
    ? moveData.stat_changes.map((sc: any) => ({
        change: sc.change,
        stat: { name: sc.stat?.name || sc.stat }
      }))
    : [];

  const rawNameLower = (moveData.name || fallbackName || itMoveName || '').toLowerCase().replace(/[\s_]+/g, '-');

  // Fallback stat changes for iconic moves if PokéAPI meta is empty
  if (stat_changes.length === 0) {
    if (rawNameLower.includes('growl') || rawNameLower.includes('ruggito')) {
      stat_changes = [{ change: -1, stat: { name: 'attack' } }];
    } else if (rawNameLower.includes('tail-whip') || rawNameLower.includes('colpo-di-coda') || rawNameLower.includes('colpo-coda')) {
      stat_changes = [{ change: -1, stat: { name: 'defense' } }];
    } else if (rawNameLower.includes('leer') || rawNameLower.includes('fulmisguardo')) {
      stat_changes = [{ change: -1, stat: { name: 'defense' } }];
    } else if (rawNameLower.includes('sand-attack') || rawNameLower.includes('turbosabbia')) {
      stat_changes = [{ change: -1, stat: { name: 'accuracy' } }];
    } else if (rawNameLower.includes('string-shot') || rawNameLower.includes('millebave')) {
      stat_changes = [{ change: -1, stat: { name: 'speed' } }];
    } else if (rawNameLower.includes('screech') || rawNameLower.includes('stridio')) {
      stat_changes = [{ change: -2, stat: { name: 'defense' } }];
    } else if (rawNameLower.includes('smokescreen') || rawNameLower.includes('muro-di-fumo')) {
      stat_changes = [{ change: -1, stat: { name: 'accuracy' } }];
    } else if (rawNameLower.includes('swords-dance') || rawNameLower.includes('danzaspada') || rawNameLower.includes('danza-spada')) {
      stat_changes = [{ change: 2, stat: { name: 'attack' } }];
    } else if (rawNameLower.includes('agility') || rawNameLower.includes('agilit')) {
      stat_changes = [{ change: 2, stat: { name: 'speed' } }];
    } else if (rawNameLower.includes('harden') || rawNameLower.includes('rafforzamento') || rawNameLower.includes('rafforzatore') || rawNameLower.includes('withdraw')) {
      stat_changes = [{ change: 1, stat: { name: 'defense' } }];
    } else if (rawNameLower.includes('growth') || rawNameLower.includes('crescita')) {
      stat_changes = [{ change: 1, stat: { name: 'attack' } }, { change: 1, stat: { name: 'special-attack' } }];
    } else if (rawNameLower.includes('defense-curl') || rawNameLower.includes('ricciolscudo')) {
      stat_changes = [{ change: 1, stat: { name: 'defense' } }];
    } else if (rawNameLower.includes('double-team') || rawNameLower.includes('doppioteam')) {
      stat_changes = [{ change: 1, stat: { name: 'evasion' } }];
    } else if (rawNameLower.includes('minimize') || rawNameLower.includes('minimizzato')) {
      stat_changes = [{ change: 2, stat: { name: 'evasion' } }];
    } else if (rawNameLower.includes('scary-face') || rawNameLower.includes('visotruce')) {
      stat_changes = [{ change: -2, stat: { name: 'speed' } }];
    } else if (rawNameLower.includes('charm') || rawNameLower.includes('fascino')) {
      stat_changes = [{ change: -2, stat: { name: 'attack' } }];
    } else if (rawNameLower.includes('iron-defense') || rawNameLower.includes('ferroscudo')) {
      stat_changes = [{ change: 2, stat: { name: 'defense' } }];
    } else if (rawNameLower.includes('calm-mind') || rawNameLower.includes('calmamene') || rawNameLower.includes('calmamente')) {
      stat_changes = [{ change: 1, stat: { name: 'special-attack' } }, { change: 1, stat: { name: 'special-defense' } }];
    } else if (rawNameLower.includes('dragon-dance') || rawNameLower.includes('dragodanza')) {
      stat_changes = [{ change: 1, stat: { name: 'attack' } }, { change: 1, stat: { name: 'speed' } }];
    }
  }

  // Status condition extraction
  let statusEffect: 'paralyzed' | 'poisoned' | 'sleep' | 'frozen' | 'burned' | undefined = undefined;
  const ailment = moveData.meta?.ailment?.name;
  if (ailment === 'paralysis') statusEffect = 'paralyzed';
  else if (ailment === 'poison' || ailment === 'bad-poison') statusEffect = 'poisoned';
  else if (ailment === 'burn') statusEffect = 'burned';
  else if (ailment === 'sleep') statusEffect = 'sleep';
  else if (ailment === 'freeze') statusEffect = 'frozen';

  // Fallback by name if meta ailment is missing
  if (!statusEffect) {
    if (rawNameLower.includes('thunder-wave') || rawNameLower.includes('tuononda') || rawNameLower.includes('stun-spore') || rawNameLower.includes('paralizzante') || rawNameLower.includes('glare')) {
      statusEffect = 'paralyzed';
    } else if (rawNameLower.includes('toxic') || rawNameLower.includes('tossina') || rawNameLower.includes('poison-powder') || rawNameLower.includes('velenopolvere') || rawNameLower.includes('poison-gas')) {
      statusEffect = 'poisoned';
    } else if (rawNameLower.includes('hypnosis') || rawNameLower.includes('ipnosi') || rawNameLower.includes('sleep-powder') || rawNameLower.includes('sonnifero') || rawNameLower.includes('spore') || rawNameLower.includes('spora') || rawNameLower.includes('sing') || rawNameLower.includes('canto')) {
      statusEffect = 'sleep';
    } else if (rawNameLower.includes('will-o-wisp') || rawNameLower.includes('fuocofatuo')) {
      statusEffect = 'burned';
    }
  }

  // Effect chance
  let effectChance = moveData.meta?.ailment_chance > 0 
    ? moveData.meta.ailment_chance 
    : (typeof moveData.effect_chance === 'number' && moveData.effect_chance > 0 
        ? moveData.effect_chance 
        : (category === 'status' ? 100 : undefined));

  // Secondary status for attacking moves (e.g. Ember 10% burn, Thunder Shock 10% paralysis)
  if (!statusEffect && category !== 'status') {
    if (rawNameLower.includes('ember') || rawNameLower.includes('flamethrower') || rawNameLower.includes('braciere') || rawNameLower.includes('lanciafiamme') || rawNameLower.includes('fuocobomba')) {
      statusEffect = 'burned';
      effectChance = effectChance || 10;
    } else if (rawNameLower.includes('thunder-shock') || rawNameLower.includes('thunderbolt') || rawNameLower.includes('tuonoshock') || rawNameLower.includes('fulmine') || rawNameLower.includes('tuono')) {
      statusEffect = 'paralyzed';
      effectChance = effectChance || 10;
    } else if (rawNameLower.includes('poison-sting') || rawNameLower.includes('sludge') || rawNameLower.includes('velenospina') || rawNameLower.includes('fango')) {
      statusEffect = 'poisoned';
      effectChance = effectChance || 30;
    } else if (rawNameLower.includes('ice-beam') || rawNameLower.includes('geloraggio') || rawNameLower.includes('blizzard')) {
      statusEffect = 'frozen';
      effectChance = effectChance || 10;
    }
  }

  // Target
  const target = moveData.target?.name || (category === 'status' && stat_changes.some(sc => sc.change > 0) ? 'user' : 'selected-pokemon');

  return {
    name: itMoveName,
    power,
    type: moveType,
    accuracy,
    category,
    pp,
    maxPp: pp,
    stat_changes: stat_changes.length > 0 ? stat_changes : undefined,
    statusEffect,
    effectChance,
    target
  };
}

export async function fetchMoveData(url: string): Promise<Move> {
  const moveData = await fetchWithCache(url);
  return parseMoveObject(moveData);
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
        return parseMoveObject(moveData, m.move.name);
      } catch (e) {
        return parseMoveObject({ name: m.move.name }, m.move.name);
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
