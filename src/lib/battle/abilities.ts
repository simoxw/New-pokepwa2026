import { Pokemon, Move, Ability, BattleStages, StatusCondition } from '../../types/game';
import { WeatherType } from './fieldEffects';
import { isImmuneToStatus } from './statusEffects';

export type CoreAbilityKey =
  | 'erbaiuto'
  | 'aiutofuoco'
  | 'acquaiuto'
  | 'statica'
  | 'levitazione'
  | 'prepotenza'
  | 'vigore'
  | 'assorbacqua'
  | 'fuocardore'
  | 'parafulmine'
  | 'siccita'
  | 'piovischio'
  | 'sabbiafiume'
  | 'scendineve'
  | 'tecnico'
  | 'corpodifuoco'
  | 'velenopunto'
  | 'cartavetro';

export const CORE_ABILITIES: Record<CoreAbilityKey, Ability> = {
  erbaiuto: {
    name: 'Erbaiuto',
    description: 'Potenzia del 50% le mosse di tipo Erba quando i PS sono sotto 1/3.',
    effect: 'pinch_grass'
  },
  aiutofuoco: {
    name: 'Aiutofuoco',
    description: 'Potenzia del 50% le mosse di tipo Fuoco quando i PS sono sotto 1/3.',
    effect: 'pinch_fire'
  },
  acquaiuto: {
    name: 'Acquaiuto',
    description: 'Potenzia del 50% le mosse di tipo Acqua quando i PS sono sotto 1/3.',
    effect: 'pinch_water'
  },
  statica: {
    name: 'Statica',
    description: '30% di probabilità di paralizzare chi colpisce con una mossa fisica.',
    effect: 'contact_paralyze'
  },
  levitazione: {
    name: 'Levitazione',
    description: 'Rende il Pokémon completamente immune alle mosse di tipo Terra.',
    effect: 'ground_immune'
  },
  prepotenza: {
    name: 'Prepotenza',
    description: 'All\'ingresso in campo riduce di 1 livello l\'Attacco dell\'avversario.',
    effect: 'switch_intimidate'
  },
  vigore: {
    name: 'Vigore',
    description: 'Se ha PS pieni, resiste a un attacco letale rimanendo con 1 PS.',
    effect: 'sturdy'
  },
  assorbacqua: {
    name: 'Assorbacqua',
    description: 'Immune alle mosse Acqua e recupera il 25% dei PS massimi se colpito.',
    effect: 'water_absorb'
  },
  fuocardore: {
    name: 'Fuocardore',
    description: 'Immune alle mosse Fuoco e potenzia del 50% le proprie mosse Fuoco.',
    effect: 'flash_fire'
  },
  parafulmine: {
    name: 'Parafulmine',
    description: 'Immune alle mosse Elettro e aumenta di 1 livello l\'Attacco Speciale.',
    effect: 'lightning_rod'
  },
  siccita: {
    name: 'Siccità',
    description: 'Evoca luce solare intensa (5 turni) all\'ingresso in campo.',
    effect: 'weather_sun'
  },
  piovischio: {
    name: 'Piovischio',
    description: 'Evoca pioggia battente (5 turni) all\'ingresso in campo.',
    effect: 'weather_rain'
  },
  sabbiafiume: {
    name: 'Sabbiafiume',
    description: 'Evoca tempesta di sabbia (5 turni) all\'ingresso in campo.',
    effect: 'weather_sandstorm'
  },
  scendineve: {
    name: 'Scendineve',
    description: 'Evoca bufera di grandine (5 turni) all\'ingresso in campo.',
    effect: 'weather_hail'
  },
  tecnico: {
    name: 'Tecnico',
    description: 'Potenzia del 50% le mosse offensive con potenza base di 60 o inferiore.',
    effect: 'technician'
  },
  corpodifuoco: {
    name: 'Corpodifuoco',
    description: '30% di probabilità di scottare chi colpisce con una mossa fisica.',
    effect: 'contact_burn'
  },
  velenopunto: {
    name: 'Velenopunto',
    description: '30% di probabilità di avvelenare chi colpisce con una mossa fisica.',
    effect: 'contact_poison'
  },
  cartavetro: {
    name: 'Cartavetro',
    description: 'Infligge 1/8 dei PS massimi di danno a chi colpisce con una mossa fisica.',
    effect: 'contact_recoil'
  }
};

const ABILITY_ALIASES: Record<string, CoreAbilityKey> = {
  // Italiano
  'erbaiuto': 'erbaiuto',
  'aiutofuoco': 'aiutofuoco',
  'acquaiuto': 'acquaiuto',
  'statica': 'statica',
  'levitazione': 'levitazione',
  'prepotenza': 'prepotenza',
  'vigore': 'vigore',
  'assorbacqua': 'assorbacqua',
  'fuocardore': 'fuocardore',
  'parafulmine': 'parafulmine',
  'siccita': 'siccita',
  'siccità': 'siccita',
  'piovischio': 'piovischio',
  'sabbiafiume': 'sabbiafiume',
  'scendineve': 'scendineve',
  'tecnico': 'tecnico',
  'corpodifuoco': 'corpodifuoco',
  'velenopunto': 'velenopunto',
  'cartavetro': 'cartavetro',
  // English / PokéAPI slugs
  'overgrow': 'erbaiuto',
  'blaze': 'aiutofuoco',
  'torrent': 'acquaiuto',
  'static': 'statica',
  'levitate': 'levitazione',
  'intimidate': 'prepotenza',
  'sturdy': 'vigore',
  'water-absorb': 'assorbacqua',
  'water absorb': 'assorbacqua',
  'flash-fire': 'fuocardore',
  'flash fire': 'fuocardore',
  'lightning-rod': 'parafulmine',
  'lightning rod': 'parafulmine',
  'drought': 'siccita',
  'drizzle': 'piovischio',
  'sand-stream': 'sabbiafiume',
  'sand stream': 'sabbiafiume',
  'snow-warning': 'scendineve',
  'snow warning': 'scendineve',
  'technician': 'tecnico',
  'flame-body': 'corpodifuoco',
  'flame body': 'corpodifuoco',
  'poison-point': 'velenopunto',
  'poison point': 'velenopunto',
  'rough-skin': 'cartavetro',
  'rough skin': 'cartavetro'
};

/**
 * Deterministic fallback mapping by Pokédex species ID.
 * Ensures Pokemon imported from old saves or external Pokedex/game codes without `ability`
 * still receive their signature Core Ability cleanly with zero errors.
 */
export const SPECIES_ABILITY_MAP: Record<number, CoreAbilityKey> = {
  // Grass Starters -> Erbaiuto
  1: 'erbaiuto', 2: 'erbaiuto', 3: 'erbaiuto',
  152: 'erbaiuto', 153: 'erbaiuto', 154: 'erbaiuto',
  252: 'erbaiuto', 253: 'erbaiuto', 254: 'erbaiuto',
  387: 'erbaiuto', 388: 'erbaiuto', 389: 'erbaiuto',
  495: 'erbaiuto', 496: 'erbaiuto', 497: 'erbaiuto',
  650: 'erbaiuto', 651: 'erbaiuto', 652: 'erbaiuto',
  722: 'erbaiuto', 723: 'erbaiuto', 724: 'erbaiuto',
  810: 'erbaiuto', 811: 'erbaiuto', 812: 'erbaiuto',
  906: 'erbaiuto', 907: 'erbaiuto', 908: 'erbaiuto',
  // Fire Starters -> Aiutofuoco
  4: 'aiutofuoco', 5: 'aiutofuoco', 6: 'aiutofuoco',
  155: 'aiutofuoco', 156: 'aiutofuoco', 157: 'aiutofuoco',
  255: 'aiutofuoco', 256: 'aiutofuoco', 257: 'aiutofuoco',
  390: 'aiutofuoco', 391: 'aiutofuoco', 392: 'aiutofuoco',
  498: 'aiutofuoco', 499: 'aiutofuoco', 500: 'aiutofuoco',
  653: 'aiutofuoco', 654: 'aiutofuoco', 655: 'aiutofuoco',
  725: 'aiutofuoco', 726: 'aiutofuoco', 727: 'aiutofuoco',
  813: 'aiutofuoco', 814: 'aiutofuoco', 815: 'aiutofuoco',
  909: 'aiutofuoco', 910: 'aiutofuoco', 911: 'aiutofuoco',
  // Water Starters -> Acquaiuto
  7: 'acquaiuto', 8: 'acquaiuto', 9: 'acquaiuto',
  158: 'acquaiuto', 159: 'acquaiuto', 160: 'acquaiuto',
  258: 'acquaiuto', 259: 'acquaiuto', 260: 'acquaiuto',
  393: 'acquaiuto', 394: 'acquaiuto', 395: 'acquaiuto',
  501: 'acquaiuto', 502: 'acquaiuto', 503: 'acquaiuto',
  656: 'acquaiuto', 657: 'acquaiuto', 658: 'acquaiuto',
  728: 'acquaiuto', 729: 'acquaiuto', 730: 'acquaiuto',
  816: 'acquaiuto', 817: 'acquaiuto', 818: 'acquaiuto',
  912: 'acquaiuto', 913: 'acquaiuto', 914: 'acquaiuto',
  // Prepotenza (Intimidate)
  58: 'prepotenza', 59: 'prepotenza',
  128: 'prepotenza', 130: 'prepotenza',
  209: 'prepotenza', 210: 'prepotenza',
  237: 'prepotenza', 261: 'prepotenza', 262: 'prepotenza',
  284: 'prepotenza', 303: 'prepotenza', 373: 'prepotenza',
  397: 'prepotenza', 398: 'prepotenza',
  403: 'prepotenza', 404: 'prepotenza', 405: 'prepotenza',
  551: 'prepotenza', 552: 'prepotenza', 553: 'prepotenza',
  559: 'prepotenza', 560: 'prepotenza', 645: 'prepotenza',
  943: 'prepotenza',
  // Levitazione (Levitate)
  92: 'levitazione', 93: 'levitazione', 94: 'levitazione',
  109: 'levitazione', 110: 'levitazione',
  200: 'levitazione', 201: 'levitazione',
  329: 'levitazione', 330: 'levitazione',
  337: 'levitazione', 338: 'levitazione',
  343: 'levitazione', 344: 'levitazione',
  355: 'levitazione', 358: 'levitazione',
  380: 'levitazione', 381: 'levitazione',
  429: 'levitazione', 436: 'levitazione', 437: 'levitazione',
  455: 'levitazione', 479: 'levitazione',
  480: 'levitazione', 481: 'levitazione', 482: 'levitazione',
  487: 'levitazione', 488: 'levitazione',
  615: 'levitazione', 635: 'levitazione', 738: 'levitazione',
  // Vigore (Sturdy)
  74: 'vigore', 75: 'vigore', 76: 'vigore',
  81: 'vigore', 82: 'vigore', 462: 'vigore',
  95: 'vigore', 185: 'vigore', 204: 'vigore', 205: 'vigore',
  208: 'vigore', 213: 'vigore', 227: 'vigore', 232: 'vigore',
  299: 'vigore', 304: 'vigore', 305: 'vigore', 306: 'vigore',
  411: 'vigore', 476: 'vigore',
  524: 'vigore', 525: 'vigore', 526: 'vigore',
  557: 'vigore', 558: 'vigore', 713: 'vigore', 934: 'vigore',
  // Statica (Static)
  25: 'statica', 26: 'statica', 172: 'statica', 10100: 'statica',
  100: 'statica', 101: 'statica',
  125: 'statica', 145: 'statica', 466: 'statica',
  179: 'statica', 180: 'statica', 181: 'statica',
  587: 'statica', 618: 'statica',
  // Assorbacqua (Water Absorb)
  60: 'assorbacqua', 61: 'assorbacqua', 62: 'assorbacqua', 186: 'assorbacqua',
  131: 'assorbacqua', 134: 'assorbacqua',
  194: 'assorbacqua', 195: 'assorbacqua', 226: 'assorbacqua',
  537: 'assorbacqua', 556: 'assorbacqua', 593: 'assorbacqua',
  721: 'assorbacqua', 980: 'assorbacqua', 10253: 'assorbacqua',
  // Fuocardore (Flash Fire)
  37: 'fuocardore', 38: 'fuocardore',
  77: 'fuocardore', 78: 'fuocardore',
  136: 'fuocardore', 228: 'fuocardore', 229: 'fuocardore',
  485: 'fuocardore', 607: 'fuocardore', 608: 'fuocardore', 609: 'fuocardore',
  936: 'fuocardore', 937: 'fuocardore',
  // Parafulmine (Lightning Rod)
  104: 'parafulmine', 105: 'parafulmine',
  111: 'parafulmine', 112: 'parafulmine', 464: 'parafulmine',
  118: 'parafulmine', 119: 'parafulmine',
  309: 'parafulmine', 310: 'parafulmine', 311: 'parafulmine',
  522: 'parafulmine', 523: 'parafulmine', 777: 'parafulmine', 871: 'parafulmine',
  // Meteo (Siccità / Piovischio / Sabbiafiume / Scendineve)
  324: 'siccita', 383: 'siccita', 1007: 'siccita',
  279: 'piovischio', 382: 'piovischio',
  248: 'sabbiafiume', 450: 'sabbiafiume',
  460: 'scendineve', 699: 'scendineve', 10104: 'scendineve',
  // Tecnico (Technician)
  52: 'tecnico', 53: 'tecnico',
  123: 'tecnico', 212: 'tecnico',
  235: 'tecnico', 286: 'tecnico',
  407: 'tecnico', 424: 'tecnico',
  573: 'tecnico', 925: 'tecnico',
  // Corpodifuoco (Flame Body)
  126: 'corpodifuoco', 146: 'corpodifuoco', 218: 'corpodifuoco', 219: 'corpodifuoco',
  240: 'corpodifuoco', 467: 'corpodifuoco', 631: 'corpodifuoco',
  636: 'corpodifuoco', 637: 'corpodifuoco',
  662: 'corpodifuoco', 663: 'corpodifuoco', 838: 'corpodifuoco', 839: 'corpodifuoco',
  // Velenopunto (Poison Point)
  29: 'velenopunto', 30: 'velenopunto', 31: 'velenopunto',
  32: 'velenopunto', 33: 'velenopunto', 34: 'velenopunto',
  117: 'velenopunto', 211: 'velenopunto', 315: 'velenopunto', 406: 'velenopunto',
  543: 'velenopunto', 544: 'velenopunto', 545: 'velenopunto',
  690: 'velenopunto', 691: 'velenopunto',
  // Cartavetro (Rough Skin)
  318: 'cartavetro', 319: 'cartavetro',
  443: 'cartavetro', 444: 'cartavetro', 445: 'cartavetro',
  621: 'cartavetro'
};

export function normalizeAbilityKey(rawName?: string): CoreAbilityKey | null {
  if (!rawName || typeof rawName !== 'string') return null;
  const normalized = rawName.toLowerCase().trim().replace(/[\s_]+/g, '-');
  const direct = ABILITY_ALIASES[normalized] || ABILITY_ALIASES[rawName.toLowerCase().trim()];
  return direct || null;
}

/**
 * Resolves a Pokemon's ability cleanly without ever throwing on missing/legacy/external data.
 * - If `pokemon.ability` matches one of the 15 Core Abilities, returns canonical Italian definition.
 * - If `pokemon.ability` is missing OR is the generic fallback 'Tenacia', resolves from `SPECIES_ABILITY_MAP[pokemon.id]`.
 * - If `pokemon.ability` is a custom/PokéAPI non-core ability string, preserves it for display cleanly.
 * - Returns `null` if no ability is set and species is not in the core map.
 */
export function resolvePokemonAbility(pokemon?: Partial<Pokemon> | null): Ability | null {
  if (!pokemon) return null;

  const rawName = pokemon.ability?.name?.trim();
  const coreFromName = normalizeAbilityKey(rawName);
  if (coreFromName) {
    return CORE_ABILITIES[coreFromName];
  }

  const isPlaceholder = !rawName || rawName.toLowerCase() === 'tenacia';
  if (!isPlaceholder && rawName) {
    return {
      name: rawName,
      description: pokemon.ability?.description || '',
      effect: pokemon.ability?.effect
    };
  }

  if (typeof pokemon.id === 'number' && SPECIES_ABILITY_MAP[pokemon.id]) {
    return CORE_ABILITIES[SPECIES_ABILITY_MAP[pokemon.id]];
  }

  return null;
}

export function getResolvedCoreAbilityKey(pokemon?: Partial<Pokemon> | null): CoreAbilityKey | null {
  const resolved = resolvePokemonAbility(pokemon);
  return resolved ? normalizeAbilityKey(resolved.name) : null;
}

export interface AbilityEffect {
  type: 'damage_mult' | 'stat_mult' | 'status_immune' | 'hp_regen' | 'other';
  value?: number;
  msg?: string;
  inflictStatus?: StatusCondition;
  contactDamage?: number;
  healHp?: number;
  boostStat?: keyof BattleStages;
  boostAmount?: number;
  flashFireBoost?: boolean;
}

/**
 * Checks if an ability triggers for a given move-use / on-hit context.
 */
export function checkAbility(
  pokemon: Pokemon,
  context: 'on_hit' | 'on_turn_start' | 'on_turn_end' | 'on_move_use' | 'static',
  options?: { move?: Move; target?: Pokemon; currentHp?: number; flashFireBoosted?: boolean }
): AbilityEffect | null {
  const abilityKey = getResolvedCoreAbilityKey(pokemon);
  if (!abilityKey) return null;

  const currentHp = typeof options?.currentHp === 'number' ? options.currentHp : pokemon.hp;
  const moveType = options?.move?.type?.toLowerCase();

  switch (abilityKey) {
    case 'erbaiuto':
      if (context === 'on_move_use' && moveType === 'grass' && currentHp <= pokemon.maxHp / 3) {
        return { type: 'damage_mult', value: 1.5, msg: `${pokemon.name} attiva Erbaiuto! Le mosse Erba sono più potenti!` };
      }
      break;
    case 'aiutofuoco':
      if (context === 'on_move_use' && moveType === 'fire' && currentHp <= pokemon.maxHp / 3) {
        return { type: 'damage_mult', value: 1.5, msg: `${pokemon.name} attiva Aiutofuoco! Le mosse Fuoco sono più potenti!` };
      }
      break;
    case 'acquaiuto':
      if (context === 'on_move_use' && moveType === 'water' && currentHp <= pokemon.maxHp / 3) {
        return { type: 'damage_mult', value: 1.5, msg: `${pokemon.name} attiva Acquaiuto! Le mosse Acqua sono più potenti!` };
      }
      break;
    case 'tecnico':
      if (
        context === 'on_move_use' &&
        options?.move &&
        options.move.category !== 'status' &&
        options.move.power > 0 &&
        options.move.power <= 60
      ) {
        return {
          type: 'damage_mult',
          value: 1.5,
          msg: `⚙️ Tecnico di ${pokemon.name} potenzia ${options.move.name}!`
        };
      }
      break;
    case 'fuocardore':
      if (context === 'on_move_use' && moveType === 'fire' && options?.flashFireBoosted) {
        return {
          type: 'damage_mult',
          value: 1.5,
          msg: `🔥 Fuocardore potenziato amplifica l'attacco Fuoco di ${pokemon.name}!`
        };
      }
      if (context === 'on_hit' && moveType === 'fire') {
        return {
          type: 'damage_mult',
          value: 0,
          flashFireBoost: true,
          msg: `🔥 Fuocardore di ${pokemon.name} assorbe il fuoco e potenzia le sue mosse Fuoco!`
        };
      }
      break;
    case 'levitazione':
      if (context === 'on_hit' && moveType === 'ground') {
        return {
          type: 'damage_mult',
          value: 0,
          msg: `${pokemon.name} evita l'attacco Terra grazie a Levitazione!`
        };
      }
      break;
    case 'assorbacqua':
      if (context === 'on_hit' && moveType === 'water') {
        const healHp = Math.max(1, Math.floor(pokemon.maxHp * 0.25));
        return {
          type: 'damage_mult',
          value: 0,
          healHp,
          msg: `💧 Assorbacqua di ${pokemon.name} assorbe la mossa Acqua e rigenera PS!`
        };
      }
      break;
    case 'parafulmine':
      if (context === 'on_hit' && moveType === 'electric') {
        return {
          type: 'damage_mult',
          value: 0,
          boostStat: 'spAtk',
          boostAmount: 1,
          msg: `⚡ Parafulmine di ${pokemon.name} assorbe l'elettricità e aumenta Attacco Sp.!`
        };
      }
      break;
    case 'statica':
      if (context === 'on_hit' && options?.move?.category === 'physical' && Math.random() < 0.3) {
        const attacker = options.target;
        if (attacker && !isImmuneToStatus(attacker.types, 'paralyzed')) {
          return {
            type: 'other',
            inflictStatus: 'paralyzed',
            msg: `⚡ La Statica di ${pokemon.name} ha paralizzato ${attacker.name}!`
          };
        }
      }
      break;
    case 'corpodifuoco':
      if (context === 'on_hit' && options?.move?.category === 'physical' && Math.random() < 0.3) {
        const attacker = options.target;
        if (attacker && !isImmuneToStatus(attacker.types, 'burned')) {
          return {
            type: 'other',
            inflictStatus: 'burned',
            msg: `🔥 Corpodifuoco di ${pokemon.name} ha scottato ${attacker.name}!`
          };
        }
      }
      break;
    case 'velenopunto':
      if (context === 'on_hit' && options?.move?.category === 'physical' && Math.random() < 0.3) {
        const attacker = options.target;
        if (attacker && !isImmuneToStatus(attacker.types, 'poisoned')) {
          return {
            type: 'other',
            inflictStatus: 'poisoned',
            msg: `☠️ Velenopunto di ${pokemon.name} ha avvelenato ${attacker.name}!`
          };
        }
      }
      break;
    case 'cartavetro':
      if (context === 'on_hit' && options?.move?.category === 'physical') {
        const attacker = options.target;
        if (attacker) {
          const contactDamage = Math.max(1, Math.floor(attacker.maxHp / 8));
          return {
            type: 'other',
            contactDamage,
            msg: `🪨 Cartavetro di ${pokemon.name} ferisce ${attacker.name}! (-${contactDamage} PS)`
          };
        }
      }
      break;
  }

  return null;
}

/**
 * Resolves switch-in abilities (Intimidate, Drought, Drizzle, Sand Stream, Snow Warning).
 */
export function processSwitchInAbility(
  incoming: Pokemon,
  opponent: Pokemon,
  opponentStages: BattleStages,
  currentWeather: WeatherType,
  opponentHasSubstitute: boolean = false
): {
  triggered: boolean;
  abilityName?: string;
  nextWeather?: WeatherType;
  nextOpponentStages?: BattleStages;
  msg?: string;
} {
  const key = getResolvedCoreAbilityKey(incoming);
  if (!key) return { triggered: false };

  switch (key) {
    case 'prepotenza': {
      if (opponentHasSubstitute) {
        return {
          triggered: true,
          abilityName: 'Prepotenza',
          msg: `😡 Prepotenza di ${incoming.name} viene bloccata dal Sostituto di ${opponent.name}!`
        };
      }
      const curAtk = opponentStages.attack ?? 0;
      if (curAtk <= -6) {
        return {
          triggered: true,
          abilityName: 'Prepotenza',
          msg: `😡 Prepotenza di ${incoming.name} si attiva, ma l'Attacco di ${opponent.name} è già al minimo!`
        };
      }
      return {
        triggered: true,
        abilityName: 'Prepotenza',
        nextOpponentStages: { ...opponentStages, attack: Math.max(-6, curAtk - 1) },
        msg: `😡 Prepotenza di ${incoming.name} riduce l'Attacco di ${opponent.name}!`
      };
    }
    case 'siccita':
      if (currentWeather === 'sun') return { triggered: false };
      return {
        triggered: true,
        abilityName: 'Siccità',
        nextWeather: 'sun',
        msg: `☀️ La Siccità di ${incoming.name} rende la luce solare intensa per 5 turni!`
      };
    case 'piovischio':
      if (currentWeather === 'rain') return { triggered: false };
      return {
        triggered: true,
        abilityName: 'Piovischio',
        nextWeather: 'rain',
        msg: `🌧️ Il Piovischio di ${incoming.name} scatena una pioggia battente per 5 turni!`
      };
    case 'sabbiafiume':
      if (currentWeather === 'sandstorm') return { triggered: false };
      return {
        triggered: true,
        abilityName: 'Sabbiafiume',
        nextWeather: 'sandstorm',
        msg: `🌪️ Sabbiafiume di ${incoming.name} scatena una tempesta di sabbia per 5 turni!`
      };
    case 'scendineve':
      if (currentWeather === 'hail') return { triggered: false };
      return {
        triggered: true,
        abilityName: 'Scendineve',
        nextWeather: 'hail',
        msg: `❄️ Scendineve di ${incoming.name} scatena una bufera di grandine per 5 turni!`
      };
    default:
      return { triggered: false };
  }
}

export function hasSturdyAbility(pokemon: Pokemon): boolean {
  return getResolvedCoreAbilityKey(pokemon) === 'vigore';
}
