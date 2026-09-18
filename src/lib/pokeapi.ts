import { Pokemon, Move } from '../types/game';
import { getFallbackPokemonData } from '../data/pokemonFallbacks';
import { getMoveByName } from '../data/movesData';

const CACHE_NAME = 'poke-api-cache';
const MEMORY_CACHE = new Map<string, any>();

const NATURES = ['Decisa', 'Audace', 'Scaltra', 'Placida', 'Modesta', 'Mite', 'Calma', 'Vivace', 'Timida', 'Allegra'];

export function parseMoveObject(moveData: any, fallbackName?: string): Move {
  const moveKey = fallbackName || moveData?.name || '';
  const defaultMove = getMoveByName(moveKey);

  // If moveData is just a name/stub without detailed API fields, return the robust move from database
  const hasDetailedApiData = moveData && (
    moveData.damage_class || 
    typeof moveData.power === 'number' || 
    (Array.isArray(moveData.names) && moveData.names.length > 0) ||
    (Array.isArray(moveData.stat_changes) && moveData.stat_changes.length > 0) ||
    moveData.meta
  );

  if (!hasDetailedApiData && defaultMove) {
    return { ...defaultMove };
  }

  const itMoveName = moveData.names?.find((n: any) => n.language.name === 'it')?.name || 
                     (moveData.name ? MOVE_TRANSLATIONS[moveData.name] : undefined) || 
                     defaultMove.name ||
                     moveData.name || 
                     fallbackName || 
                     'Mossa';

  // Category determination
  let category: 'physical' | 'special' | 'status' = defaultMove.category;
  if (moveData.damage_class?.name) {
    category = moveData.damage_class.name;
  } else if (typeof moveData.power === 'number' && moveData.power > 0) {
    category = defaultMove.category !== 'status' ? defaultMove.category : 'physical';
  }

  // Power determination: never allow 0 power on non-status moves!
  let power = 0;
  if (category !== 'status') {
    if (typeof moveData.power === 'number' && moveData.power > 0) {
      power = moveData.power;
    } else {
      power = defaultMove.power > 0 ? defaultMove.power : 40;
    }
  }

  const accuracy = typeof moveData.accuracy === 'number' ? moveData.accuracy : (defaultMove.accuracy || 100);
  const maxPp = typeof moveData.pp === 'number' && moveData.pp > 0 ? moveData.pp : (defaultMove.maxPp || 35);
  const pp = typeof moveData.pp === 'number' && moveData.pp >= 0 ? moveData.pp : (defaultMove.pp ?? maxPp);
  const moveType = moveData.type?.name || defaultMove.type || 'normal';

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

  // Move priority (e.g. Quick Attack = +1, Extreme Speed = +2)
  let priority = typeof moveData.priority === 'number' ? moveData.priority : 0;
  if (priority === 0) {
    if (rawNameLower.includes('extreme-speed') || rawNameLower.includes('extrarapido')) {
      priority = 2;
    } else if (
      rawNameLower.includes('quick-attack') || rawNameLower.includes('attacco-rapido') ||
      rawNameLower.includes('aqua-jet') || rawNameLower.includes('acquagetto') ||
      rawNameLower.includes('bullet-punch') || rawNameLower.includes('pugnoscarica') ||
      rawNameLower.includes('shadow-sneak') || rawNameLower.includes('furtivombra') ||
      rawNameLower.includes('ice-shard') || rawNameLower.includes('geloscheggia') ||
      rawNameLower.includes('vacuum-wave') || rawNameLower.includes('vuotonda') ||
      rawNameLower.includes('sucker-punch') || rawNameLower.includes('sbigoattacco') ||
      rawNameLower.includes('mach-punch')
    ) {
      priority = 1;
    }
  }

  // Drain effects (restores HP proportional to damage dealt)
  let drain: number | undefined = undefined;
  if (typeof moveData.meta?.drain === 'number' && moveData.meta.drain > 0) {
    drain = moveData.meta.drain / 100;
  } else if (
    rawNameLower.includes('giga-drain') || rawNameLower.includes('gigassorbimento') ||
    rawNameLower.includes('mega-drain') || rawNameLower.includes('megassorbimento') ||
    rawNameLower.includes('absorb') || rawNameLower.includes('assorbimento') ||
    rawNameLower.includes('drain-punch') || rawNameLower.includes('assorbipugno') ||
    rawNameLower.includes('leech-life') || rawNameLower.includes('sanguisuga') || rawNameLower.includes('succhiasangue') ||
    rawNameLower.includes('horn-leech') || rawNameLower.includes('legnocrno') ||
    rawNameLower.includes('parabolic-charge') || rawNameLower.includes('caricaparabola')
  ) {
    drain = 0.5;
  } else if (
    rawNameLower.includes('draining-kiss') || rawNameLower.includes('bacio-drenante') || rawNameLower.includes('baciodrenante') ||
    rawNameLower.includes('oblivion-wing') || rawNameLower.includes('ali-del-fato') || rawNameLower.includes('alidelfato')
  ) {
    drain = 0.75;
  }

  // Healing moves (recovers user's HP)
  let healing: number | undefined = undefined;
  if (category === 'status') {
    if (
      rawNameLower.includes('recover') || rawNameLower.includes('ripresa') ||
      rawNameLower.includes('synthesis') || rawNameLower.includes('sintesi') ||
      rawNameLower.includes('soft-boiled') || rawNameLower.includes('uovo-morbido') || rawNameLower.includes('covauova') ||
      rawNameLower.includes('roost') || rawNameLower.includes('trespolo') ||
      rawNameLower.includes('slack-off') || rawNameLower.includes('pigro') ||
      rawNameLower.includes('milk-drink') || rawNameLower.includes('buonlatte') ||
      rawNameLower.includes('morning-sun') || rawNameLower.includes('mattindoro') ||
      rawNameLower.includes('moonlight') || rawNameLower.includes('lucelunare')
    ) {
      healing = 0.5;
    } else if (rawNameLower.includes('rest') || rawNameLower.includes('riposo')) {
      healing = 1.0;
    }
  }

  // Recoil effects
  let recoil: number | undefined = undefined;
  if (typeof moveData.meta?.drain === 'number' && moveData.meta.drain < 0) {
    recoil = -moveData.meta.drain / 100;
  } else if (
    rawNameLower.includes('double-edge') || rawNameLower.includes('sdoppiatore') ||
    rawNameLower.includes('brave-bird') || rawNameLower.includes('baldeali') ||
    rawNameLower.includes('flare-blitz') || rawNameLower.includes('fuococarica') ||
    rawNameLower.includes('head-smash') || rawNameLower.includes('zuccata')
  ) {
    recoil = 0.33;
  } else if (
    rawNameLower.includes('take-down') || rawNameLower.includes('riduttore') ||
    rawNameLower.includes('submission') || rawNameLower.includes('sottomissione') ||
    rawNameLower.includes('wild-charge') || rawNameLower.includes('sprizzalampo')
  ) {
    recoil = 0.25;
  }

  // Flinch chance
  let flinchChance: number | undefined = undefined;
  if (typeof moveData.meta?.flinch_chance === 'number' && moveData.meta.flinch_chance > 0) {
    flinchChance = moveData.meta.flinch_chance;
  } else if (
    rawNameLower.includes('bite') || rawNameLower.includes('morso') ||
    rawNameLower.includes('headbutt') || rawNameLower.includes('bottintesta') ||
    rawNameLower.includes('rock-slide') || rawNameLower.includes('frana') ||
    rawNameLower.includes('waterfall') || rawNameLower.includes('cascata') ||
    rawNameLower.includes('iron-head') || rawNameLower.includes('ferrotesta') ||
    rawNameLower.includes('dark-pulse') || rawNameLower.includes('neropulsar') ||
    rawNameLower.includes('air-slash') || rawNameLower.includes('eterelama') ||
    rawNameLower.includes('astonish') || rawNameLower.includes('sgomento')
  ) {
    flinchChance = 30;
  }

  // Confusion chance
  let confusionChance: number | undefined = undefined;
  if (moveData.meta?.ailment?.name === 'confusion') {
    confusionChance = moveData.meta.ailment_chance > 0 ? moveData.meta.ailment_chance : 100;
  } else if (
    rawNameLower.includes('confuse-ray') || rawNameLower.includes('stordiraggio') ||
    rawNameLower.includes('supersonic') || rawNameLower.includes('supersuono') ||
    rawNameLower.includes('teeter-dance')
  ) {
    confusionChance = 100;
  } else if (rawNameLower.includes('confusion') || rawNameLower.includes('confusione') || rawNameLower.includes('psybeam') || rawNameLower.includes('psicoraggio')) {
    confusionChance = 10;
  } else if (rawNameLower.includes('water-pulse') || rawNameLower.includes('idropulsar')) {
    confusionChance = 20;
  } else if (rawNameLower.includes('dynamic-punch') || rawNameLower.includes('dinamipugno')) {
    confusionChance = 100;
  } else if (rawNameLower.includes('hurricane') || rawNameLower.includes('tifone')) {
    confusionChance = 30;
  }

  // Target
  const target = moveData.target?.name || (category === 'status' && (stat_changes.some(sc => sc.change > 0) || healing) ? 'user' : 'selected-pokemon');

  return {
    name: itMoveName,
    power,
    type: moveType,
    accuracy,
    category,
    pp,
    maxPp: pp,
    priority,
    drain,
    healing,
    recoil,
    flinchChance,
    confusionChance,
    stat_changes: stat_changes.length > 0 ? stat_changes : undefined,
    statusEffect,
    effectChance,
    target
  };
}

export const STRUGGLE_MOVE: Move = {
  name: 'Scontro',
  power: 50,
  type: 'normal',
  accuracy: 100,
  category: 'physical',
  pp: 1,
  maxPp: 1,
  recoilMaxHp: 0.25,
  description: 'Usata quando tutti i PP sono esauriti. Infligge danni ma fa subire un forte contraccolpo.'
};

export async function fetchMoveData(url: string, fallbackName?: string): Promise<Move> {
  const isUrl = typeof url === 'string' && url.startsWith('http');
  const moveName = fallbackName || (isUrl ? url.split('/').filter(Boolean).pop() || '' : url);
  const defaultMove = getMoveByName(moveName);

  if (isUrl) {
    try {
      const moveData = await fetchWithCache(url);
      if (moveData) {
        return parseMoveObject(moveData, moveName);
      }
    } catch {
      // Return defaultMove on failure
    }
  }

  return defaultMove;
}

export async function fetchWithCache(url: string) {
  if (MEMORY_CACHE.has(url)) {
    return MEMORY_CACHE.get(url);
  }

  let cache: Cache | null = null;
  try {
    if (typeof caches !== 'undefined' && caches.open) {
      cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        const data = await cachedResponse.json();
        MEMORY_CACHE.set(url, data);
        return data;
      }
    }
  } catch (e) {
    // CacheStorage might be restricted in iframe/cross-origin environments
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch ${url}`);
  }

  const data = await response.json();
  MEMORY_CACHE.set(url, data);

  if (cache) {
    try {
      await cache.put(url, new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      }));
    } catch {
      // Ignore cache storage errors
    }
  }

  return data;
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
  try {
    const data = await fetchWithCache(`https://pokeapi.co/api/v2/pokemon/${id}`);
    return {
      hp: data.stats.find((s: any) => s.stat.name === 'hp').base_stat,
      attack: data.stats.find((s: any) => s.stat.name === 'attack').base_stat,
      defense: data.stats.find((s: any) => s.stat.name === 'defense').base_stat,
      spAtk: data.stats.find((s: any) => s.stat.name === 'special-attack').base_stat,
      spDef: data.stats.find((s: any) => s.stat.name === 'special-defense').base_stat,
      speed: data.stats.find((s: any) => s.stat.name === 'speed').base_stat,
    };
  } catch {
    const fallback = getFallbackPokemonData(id);
    return fallback.baseStats;
  }
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

export function generateFallbackPokemon(id: number, level: number, location: string = 'Sconosciuta'): Pokemon {
  const local = getFallbackPokemonData(id);

  const ivs = {
    hp: Math.floor(Math.random() * 32),
    attack: Math.floor(Math.random() * 32),
    defense: Math.floor(Math.random() * 32),
    spAtk: Math.floor(Math.random() * 32),
    spDef: Math.floor(Math.random() * 32),
    speed: Math.floor(Math.random() * 32),
  };

  const evs = { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 };
  const nature = NATURES[Math.floor(Math.random() * NATURES.length)];
  const stats = calculateStats(local.baseStats, level, ivs, evs, nature);
  const moves: Move[] = local.moves.map(mName => getMoveByName(mName));

  const isShiny = Math.random() < 1/128;
  const sprites = {
    front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`,
    artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    home: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    animated: {
      front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`,
      back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${id}.gif`
    }
  };

  return {
    id,
    instanceId: Math.random().toString(36).substring(2, 11),
    name: local.name,
    level,
    hp: stats.hp,
    maxHp: stats.hp,
    types: local.types,
    ability: { name: 'Tenacia', description: 'Pronto alla lotta in qualsiasi condizione.' },
    stats: {
      attack: stats.attack,
      defense: stats.defense,
      spAtk: stats.spAtk,
      spDef: stats.spDef,
      speed: stats.speed
    },
    baseStats: local.baseStats,
    evYield: { hp: 1, attack: 1, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
    learnableMoves: local.moves.map((m, idx) => ({ level: idx * 5 + 1, name: m, url: '' })),
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

export async function fetchPokemonData(id: number, level: number, location: string = 'Sconosciuta'): Promise<Pokemon> {
  try {
    const data = await fetchWithCache(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!data || !data.stats || !data.types) {
      return generateFallbackPokemon(id, level, location);
    }

    // Italian species name if available, without breaking if throttled
    let italianName = data.name ? data.name.charAt(0).toUpperCase() + data.name.slice(1) : `Pokémon #${id}`;
    let speciesData: any = null;
    if (data.species?.url) {
      try {
        speciesData = await fetchWithCache(data.species.url);
        const itName = speciesData.names?.find((n: any) => n.language.name === 'it')?.name;
        if (itName) italianName = itName;
      } catch {
        const local = getFallbackPokemonData(id);
        if (local && !local.name.startsWith('Pokémon #')) {
          italianName = local.name;
        }
      }
    }

    // Ability
    let ability: { name: string; description: string } | undefined;
    try {
      const abilityData = data.abilities?.find((a: any) => !a.is_hidden) || data.abilities?.[0];
      if (abilityData?.ability) {
        let abilityName = abilityData.ability.name;
        let abilityDesc = '';
        try {
          const abilityInfo = await fetchWithCache(abilityData.ability.url);
          abilityName = abilityInfo.names?.find((n: any) => n.language.name === 'it')?.name || abilityName;
          abilityDesc = abilityInfo.flavor_text_entries?.find((f: any) => f.language.name === 'it')?.flavor_text || 
                        abilityInfo.flavor_text_entries?.find((f: any) => f.language.name === 'en')?.flavor_text || '';
        } catch {
          // Keep default ability name
        }
        ability = { name: abilityName, description: abilityDesc };
      }
    } catch {
      // Ability optional
    }

    // Select appropriate moves learned by the Pokemon up to its current level
    let chosenMoveNames: string[] = [];
    if (Array.isArray(data.moves) && data.moves.length > 0) {
      const levelUpMoves = data.moves
        .map((m: any) => ({
          level: m.version_group_details?.find((v: any) => v.move_learn_method?.name === 'level-up')?.level_learned_at || 0,
          name: m.move?.name || ''
        }))
        .filter((m: any) => m.level > 0 && m.level <= level)
        .sort((a: any, b: any) => a.level - b.level);

      if (levelUpMoves.length > 0) {
        chosenMoveNames = levelUpMoves.slice(-4).map(m => m.name);
      } else {
        chosenMoveNames = data.moves.slice(0, 4).map((m: any) => m.move?.name || '');
      }
    }

    if (chosenMoveNames.length === 0) {
      const local = getFallbackPokemonData(id);
      chosenMoveNames = local ? local.moves : ['tackle'];
    }

    const moves: Move[] = chosenMoveNames.map(mName => {
      const cached = MEMORY_CACHE.get(mName);
      if (cached) {
        return parseMoveObject(cached, mName);
      }
      return getMoveByName(mName);
    });

    if (moves.length === 0) {
      moves.push(getMoveByName('tackle'));
    }

    const ivs = {
      hp: Math.floor(Math.random() * 32),
      attack: Math.floor(Math.random() * 32),
      defense: Math.floor(Math.random() * 32),
      spAtk: Math.floor(Math.random() * 32),
      spDef: Math.floor(Math.random() * 32),
      speed: Math.floor(Math.random() * 32),
    };

    const evs = { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 };

    const getStat = (name: string, fallback: number) => {
      const found = data.stats?.find((s: any) => s.stat?.name === name);
      return typeof found?.base_stat === 'number' ? found.base_stat : fallback;
    };

    const baseStats = {
      hp: getStat('hp', 45),
      attack: getStat('attack', 49),
      defense: getStat('defense', 49),
      spAtk: getStat('special-attack', 65),
      spDef: getStat('special-defense', 65),
      speed: getStat('speed', 45),
    };

    const nature = NATURES[Math.floor(Math.random() * NATURES.length)];
    const stats = calculateStats(baseStats, level, ivs, evs, nature);

    const getEffort = (name: string) => {
      const found = data.stats?.find((s: any) => s.stat?.name === name);
      return typeof found?.effort === 'number' ? found.effort : 0;
    };

    const evYield = {
      hp: getEffort('hp'),
      attack: getEffort('attack'),
      defense: getEffort('defense'),
      spAtk: getEffort('special-attack'),
      spDef: getEffort('special-defense'),
      speed: getEffort('speed'),
    };

    const learnableMoves = (data.moves || [])
      .map((m: any) => ({
        level: m.version_group_details?.find((v: any) => v.move_learn_method?.name === 'level-up')?.level_learned_at || 0,
        name: m.move?.name || '',
        url: m.move?.url || ''
      }))
      .filter((m: any) => m.level > 0)
      .sort((a: any, b: any) => a.level - b.level);

    // Evolution Data
    let evolutionInfo;
    if (speciesData?.evolution_chain?.url) {
      try {
        const evolutionChainData = await fetchWithCache(speciesData.evolution_chain.url);
        let current = evolutionChainData?.chain;
        const findEvolutionNode = (node: any): any => {
          if (node?.species?.name === data.name) {
            return node;
          }
          if (Array.isArray(node?.evolves_to)) {
            for (const next of node.evolves_to) {
              const found = findEvolutionNode(next);
              if (found) return found;
            }
          }
          return null;
        };

        const myEvoNode = findEvolutionNode(current);
        if (myEvoNode && Array.isArray(myEvoNode.evolves_to) && myEvoNode.evolves_to.length > 0) {
          const branches = myEvoNode.evolves_to.map((evo: any) => {
            const parts = evo.species.url.split('/').filter(Boolean);
            const nextId = parseInt(parts[parts.length - 1], 10);
            const minLevel = evo.evolution_details?.[0]?.min_level || 16;
            return {
              nextId,
              level: minLevel,
              name: evo.species.name
            };
          }).filter((b: any) => !isNaN(b.nextId));

          if (branches.length > 0) {
            evolutionInfo = {
              nextId: branches[0].nextId,
              level: branches[0].level,
              name: branches[0].name,
              branches: branches.length > 1 ? branches : undefined
            };
          }
        }
      } catch {
        // Evolution chain optional
      }
    }

    const isShiny = Math.random() < 1/128;
    const defaultFront = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    const defaultBack = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`;
    const defaultArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

    const sprites = {
      front: isShiny ? (data.sprites?.front_shiny || defaultFront) : (data.sprites?.front_default || defaultFront),
      back: isShiny ? (data.sprites?.back_shiny || defaultBack) : (data.sprites?.back_default || defaultBack),
      artwork: isShiny ? (data.sprites?.other?.['official-artwork']?.front_shiny || defaultArtwork) : (data.sprites?.other?.['official-artwork']?.front_default || defaultArtwork),
      home: isShiny ? (data.sprites?.other?.home?.front_shiny || defaultArtwork) : (data.sprites?.other?.home?.front_default || defaultArtwork),
      animated: data.sprites?.other?.showdown?.front_default ? {
        front: isShiny ? (data.sprites.other.showdown.front_shiny || data.sprites.other.showdown.front_default) : data.sprites.other.showdown.front_default,
        back: isShiny ? (data.sprites.other.showdown.back_shiny || data.sprites.other.showdown.back_default) : data.sprites.other.showdown.back_default,
      } : {
        front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`,
        back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${id}.gif`
      }
    };

    return {
      id: data.id || id,
      instanceId: Math.random().toString(36).substring(2, 11),
      name: italianName,
      level,
      hp: stats.hp,
      maxHp: stats.hp,
      types: Array.isArray(data.types) ? data.types.map((t: any) => t.type?.name || 'normal') : ['normal'],
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
  } catch (err) {
    console.warn(`PokéAPI network throttled or failed for #${id}, falling back safely`, err);
    return generateFallbackPokemon(id, level, location);
  }
}
