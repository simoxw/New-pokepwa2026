/**
 * Comprehensive Name-to-Pokedex-ID resolver for Italian and English Pokemon names.
 * Ensures that imported, traded, or evolved Pokemon always resolve to their correct
 * canonical species ID and official assets.
 */

// Common name aliases and canonical species names mapping to official PokeAPI ID
export const POKEMON_SPECIES_TO_ID: Record<string, number> = {
  // Gen 1 (1-151)
  'bulbasaur': 1, 'ivysaur': 2, 'venusaur': 3,
  'charmander': 4, 'charmeleon': 5, 'charizard': 6,
  'squirtle': 7, 'wartortle': 8, 'blastoise': 9,
  'caterpie': 10, 'metapod': 11, 'butterfree': 12,
  'weedle': 13, 'kakuna': 14, 'beedrill': 15,
  'pidgey': 16, 'pidgeotto': 17, 'pidgeot': 18,
  'rattata': 19, 'raticate': 20,
  'spearow': 21, 'fearow': 22,
  'ekans': 23, 'arbok': 24,
  'pikachu': 25, 'raichu': 26,
  'sandshrew': 27, 'sandslash': 28,
  'nidoran♀': 29, 'nidoran-f': 29, 'nidoranf': 29, 'nidorina': 30, 'nidoqueen': 31,
  'nidoran♂': 32, 'nidoran-m': 32, 'nidoranm': 32, 'nidorino': 33, 'nidoking': 34,
  'clefairy': 35, 'clefable': 36,
  'vulpix': 37, 'ninetales': 38,
  'jigglypuff': 39, 'wigglytuff': 40,
  'zubat': 41, 'golbat': 42,
  'oddish': 43, 'gloom': 44, 'vileplume': 45,
  'paras': 46, 'parasect': 47,
  'venonat': 48, 'venomoth': 49,
  'diglett': 50, 'dugtrio': 51,
  'meowth': 52, 'persian': 53,
  'psyduck': 54, 'golduck': 55,
  'mankey': 56, 'primeape': 57,
  'growlithe': 58, 'arcanine': 59,
  'poliwag': 60, 'poliwhirl': 61, 'poliwrath': 62,
  'abra': 63, 'kadabra': 64, 'alakazam': 65,
  'machop': 66, 'machoke': 67, 'machamp': 68,
  'bellsprout': 69, 'weepinbell': 70, 'victreebel': 71,
  'tentacool': 72, 'tentacruel': 73,
  'geodude': 74, 'graveler': 75, 'golem': 76,
  'ponyta': 77, 'rapidash': 78,
  'slowpoke': 79, 'slowbro': 80,
  'magnemite': 81, 'magneton': 82,
  'farfetch\'d': 83, 'farfetchd': 83,
  'doduo': 84, 'dodrio': 85,
  'seel': 86, 'dewgong': 87,
  'grimer': 88, 'muk': 89,
  'shellder': 90, 'cloyster': 91,
  'gastly': 92, 'haunter': 93, 'gengar': 94,
  'onix': 95,
  'drowzee': 96, 'hypno': 97,
  'krabby': 98, 'kingler': 99,
  'voltorb': 100, 'electrode': 101,
  'exeggcute': 102, 'exeggutor': 103,
  'cubone': 104, 'marowak': 105,
  'hitmonlee': 106, 'hitmonchan': 107,
  'lickitung': 108,
  'koffing': 109, 'weezing': 110,
  'rhyhorn': 111, 'rhydon': 112,
  'chansey': 113,
  'tangela': 114,
  'kangaskhan': 115,
  'horsea': 116, 'seadra': 117,
  'goldeen': 118, 'seaking': 119,
  'staryu': 120, 'starmie': 121,
  'mr. mime': 122, 'mr-mime': 122, 'mrmime': 122,
  'scyther': 123,
  'jynx': 124,
  'electabuzz': 125,
  'magmar': 126,
  'pinsir': 127,
  'tauros': 128,
  'magikarp': 129, 'gyarados': 130,
  'lapras': 131,
  'ditto': 132,
  'eevee': 133, 'vaporeon': 134, 'jolteon': 135, 'flareon': 136,
  'porygon': 137,
  'omanyte': 138, 'omastar': 139,
  'kabuto': 140, 'kabutops': 141,
  'aerodactyl': 142,
  'snorlax': 143,
  'articuno': 144, 'zapdos': 145, 'moltres': 146,
  'dratini': 147, 'dragonair': 148, 'dragonite': 149,
  'mewtwo': 150, 'mew': 151,

  // Gen 2 (152-251)
  'chikorita': 152, 'bayleef': 153, 'meganium': 154,
  'cyndaquil': 155, 'quilava': 156, 'typhlosion': 157,
  'totodile': 158, 'croconaw': 159, 'feraligatr': 160,
  'sentret': 161, 'furret': 162,
  'hoothoot': 163, 'noctowl': 164,
  'ledyba': 165, 'ledian': 166,
  'spinarak': 167, 'ariados': 168,
  'crobat': 169,
  'chinchou': 170, 'lanturn': 171,
  'pichu': 172, 'cleffa': 173, 'igglybuff': 174, 'togepi': 175, 'togetic': 176,
  'natu': 177, 'xatu': 178,
  'mareep': 179, 'flaaffy': 180, 'ampharos': 181,
  'bellossom': 182,
  'marill': 183, 'azumarill': 184,
  'sudowoodo': 185,
  'politoed': 186,
  'hoppip': 187, 'skiploom': 188, 'jumpluff': 189,
  'aipom': 190,
  'sunkern': 191, 'sunflora': 192,
  'yanma': 193,
  'wooper': 194, 'quagsire': 195,
  'espeon': 196, 'umbreon': 197,
  'murkrow': 198,
  'slowking': 199,
  'misdreavus': 200,
  'unown': 201,
  'wobbuffet': 202,
  'girafarig': 203,
  'pineco': 204, 'forretress': 205,
  'dunsparce': 206,
  'gligar': 207,
  'steelix': 208,
  'snubbull': 209, 'granbull': 210,
  'qwilfish': 211,
  'scizor': 212,
  'shuckle': 213,
  'heracross': 214,
  'sneasel': 215,
  'teddiursa': 216, 'ursaring': 217,
  'slugma': 218, 'magcargo': 219,
  'swinub': 220, 'piloswine': 221,
  'corsola': 222,
  'remoraid': 223, 'octillery': 224,
  'delibird': 225,
  'mantine': 226,
  'skarmory': 227,
  'houndour': 228, 'houndoom': 229,
  'kingdra': 230,
  'phanpy': 231, 'donphan': 232,
  'porygon2': 233,
  'stantler': 234,
  'smeargle': 235,
  'tyrogue': 236, 'hitmontop': 237,
  'smoochum': 238, 'elekid': 239, 'magby': 240,
  'miltank': 241,
  'blissey': 242,
  'raikou': 243, 'entei': 244, 'suicune': 245,
  'larvitar': 246, 'pupitar': 247, 'tyranitar': 248,
  'lugia': 249, 'ho-oh': 250, 'celebi': 251,

  // Gen 3 Key & Popular
  'treecko': 252, 'grovyle': 253, 'sceptile': 254,
  'torchic': 255, 'combusken': 256, 'blaziken': 257,
  'mudkip': 258, 'marshtomp': 259, 'swampert': 260,
  'gardevoir': 282, 'slaking': 289, 'mawile': 303, 'aggron': 306,
  'flygon': 330, 'altaria': 334, 'milotic': 350, 'salamence': 373, 'metagross': 376,
  'kyogre': 382, 'groudon': 383, 'rayquaza': 384, 'deoxys': 386,

  // Gen 4 Key & Popular
  'turtwig': 387, 'grotle': 388, 'torterra': 389,
  'chimchar': 390, 'monferno': 391, 'infernape': 392,
  'piplup': 393, 'prinplup': 394, 'empoleon': 395,
  'staraptor': 398, 'luxray': 405, 'roserade': 407, 'garchomp': 445,
  'lucario': 448, 'abomasnow': 460, 'weavile': 461, 'magnezone': 462,
  'rhyperior': 464, 'electivire': 466, 'magmortar': 467, 'togekiss': 468,
  'leafeon': 470, 'glaceon': 471, 'gliscor': 472, 'mamoswine': 473, 'porygon-z': 474, 'gallade': 475,
  'dusknoir': 477, 'froslass': 478, 'rotom': 479, 'dialga': 483, 'palkia': 484, 'giratina': 487,
  'darkrai': 491, 'shaymin': 492, 'arceus': 493,

  // Gen 5 Key & Popular
  'victini': 494, 'snivy': 495, 'tepig': 498, 'oshawott': 501,
  'excadrill': 530, 'zoroark': 571, 'chandelure': 609, 'haxorus': 612, 'hydreigon': 635, 'volcarona': 637,
  'reshiram': 643, 'zekrom': 644, 'kyurem': 646,

  // Gen 6 Key & Popular
  'froakie': 656, 'frogadier': 657, 'greninja': 658,
  'sylveon': 700, 'goodra': 706, 'sliggoo': 705, 'goomy': 704,
  'xerneas': 716, 'yveltal': 717, 'zygarde': 718,

  // Gen 7 Key & Popular
  'decidueye': 724, 'incineroar': 727, 'primarina': 730,
  'mimikyu': 778, 'solgaleo': 791, 'lunala': 792, 'necrozma': 800, 'zeraora': 807,

  // Gen 8 Key & Popular
  'corviknight': 823, 'dragapult': 887, 'zacian': 888, 'zamazenta': 889, 'eternatus': 890, 'urshifu': 892,
  'perrserker': 863, 'sirfetch\'d': 865, 'sirfetchd': 865, 'mr. rime': 866, 'mr-rime': 866,
  'runerigus': 867, 'cursola': 864, 'obstagoon': 862, 'kleavor': 900, 'overqwil': 904, 'sneasler': 903,

  // Gen 9 Key & Popular
  'meowscarada': 908, 'skeledirge': 911, 'quaquaval': 914, 'clodsire': 980, 'kingambit': 983,
  'denteferrino': 984, 'codaurlante': 985, 'fungofurioso': 986, 'crinealato': 987,
  'alirasenti': 988, 'peldisabbia': 989, 'solcoferreo': 990, 'colloferreo': 991,
  'manoferrea': 992, 'colofurioso': 993, 'spineferree': 994, 'capoferreo': 995,
  'baxcalibur': 998, 'gholdengo': 1000, 'koraidon': 1007, 'miraidon': 1008, 'terapagos': 1024,

  // Regional forms
  'raichu di alola': 10100, 'exeggutor di alola': 10114, 'marowak di alola': 10115,
  'meowth di alola': 10107, 'persian di alola': 10108, 'vulpix di alola': 10103, 'ninetales di alola': 10104,
  'meowth di galar': 10161, 'ponyta di galar': 10162, 'rapidash di galar': 10163, 'slowpoke di galar': 10164,
  'slowbro di galar': 10165, 'farfetch\'d di galar': 10166, 'weezing di galar': 10167, 'mr. mime di galar': 10168,
  'articuno di galar': 10169, 'zapdos di galar': 10170, 'moltres di galar': 10171, 'slowking di galar': 10172,
  'corsola di galar': 10173, 'zigzagoon di galar': 10174, 'linoone di galar': 10175, 'darumaka di galar': 10176,
  'yamask di galar': 10179, 'stunfisk di galar': 10180,
  'growlithe di hisui': 10229, 'arcanine di hisui': 10230, 'voltorb di hisui': 10231, 'electrode di hisui': 10232,
  'qwilfish di hisui': 10234, 'sneasel di hisui': 10235, 'samurott di hisui': 10236, 'lilligant di hisui': 10237,
  'zorua di hisui': 10238, 'zoroark di hisui': 10239, 'braviary di hisui': 10240, 'sliggoo di hisui': 10241,
  'goodra di hisui': 10242, 'avalugg di hisui': 10243, 'decidueye di hisui': 10244,
  'wooper di paldea': 10253, 'tauros di paldea': 10250
};

/**
 * Normalizes a name string for dictionary matching.
 */
function sanitizePokemonName(name: string): string {
  return name.toLowerCase().trim().replace(/[_]+/g, '-');
}

/**
 * Resolves the canonical Pokemon ID based on species name, nickname, or existing ID.
 */
export function resolveCanonicalPokemonId(name?: string, currentId?: number | string): number {
  const fallbackNum = typeof currentId === 'number' && currentId > 0 
    ? currentId 
    : (typeof currentId === 'string' ? parseInt(currentId, 10) || 1 : 1);

  if (!name || typeof name !== 'string') {
    return fallbackNum;
  }

  const cleanName = sanitizePokemonName(name);

  // Exact match
  if (POKEMON_SPECIES_TO_ID[cleanName]) {
    return POKEMON_SPECIES_TO_ID[cleanName];
  }

  // Check without hyphens / special characters
  const simpleName = cleanName.replace(/[^a-z0-9]/g, '');
  for (const [key, id] of Object.entries(POKEMON_SPECIES_TO_ID)) {
    if (key.replace(/[^a-z0-9]/g, '') === simpleName) {
      return id;
    }
  }

  return fallbackNum;
}
