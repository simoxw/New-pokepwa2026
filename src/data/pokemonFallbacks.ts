export interface FallbackPokemonInfo {
  name: string;
  types: string[];
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  moves: string[];
}

export const POKEMON_FALLBACKS: Record<number, FallbackPokemonInfo> = {
  // Starters Gen 1
  1: { name: 'Bulbasaur', types: ['grass', 'poison'], baseStats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 }, moves: ['tackle', 'growl', 'vine-whip', 'leech-life'] },
  2: { name: 'Ivysaur', types: ['grass', 'poison'], baseStats: { hp: 60, attack: 62, defense: 63, spAtk: 80, spDef: 80, speed: 60 }, moves: ['tackle', 'vine-whip', 'poison-sting'] },
  3: { name: 'Venusaur', types: ['grass', 'poison'], baseStats: { hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 }, moves: ['vine-whip', 'growth', 'double-edge'] },
  4: { name: 'Charmander', types: ['fire'], baseStats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 }, moves: ['scratch', 'growl', 'ember', 'bite'] },
  5: { name: 'Charmeleon', types: ['fire'], baseStats: { hp: 58, attack: 64, defense: 58, spAtk: 80, spDef: 65, speed: 80 }, moves: ['scratch', 'ember', 'dragon-dance', 'bite'] },
  6: { name: 'Charizard', types: ['fire', 'flying'], baseStats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 }, moves: ['flamethrower', 'air-slash', 'slash', 'dragon-dance'] },
  7: { name: 'Squirtle', types: ['water'], baseStats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 }, moves: ['tackle', 'tail-whip', 'water-gun', 'withdraw'] },
  8: { name: 'Wartortle', types: ['water'], baseStats: { hp: 59, attack: 63, defense: 80, spAtk: 65, spDef: 80, speed: 58 }, moves: ['tackle', 'water-gun', 'bite', 'withdraw'] },
  9: { name: 'Blastoise', types: ['water'], baseStats: { hp: 79, attack: 83, defense: 100, spAtk: 85, spDef: 105, speed: 78 }, moves: ['waterfall', 'iron-defense', 'bite', 'water-gun'] },

  // Caterpie & Weedle line
  10: { name: 'Caterpie', types: ['bug'], baseStats: { hp: 45, attack: 30, defense: 35, spAtk: 20, spDef: 20, speed: 45 }, moves: ['tackle', 'string-shot'] },
  11: { name: 'Metapod', types: ['bug'], baseStats: { hp: 50, attack: 25, defense: 55, spAtk: 25, spDef: 25, speed: 30 }, moves: ['harden', 'tackle'] },
  12: { name: 'Butterfree', types: ['bug', 'flying'], baseStats: { hp: 60, attack: 45, defense: 50, spAtk: 90, spDef: 80, speed: 70 }, moves: ['confusion', 'gust', 'supersonic'] },
  13: { name: 'Weedle', types: ['bug', 'poison'], baseStats: { hp: 40, attack: 35, defense: 30, spAtk: 20, spDef: 20, speed: 50 }, moves: ['poison-sting', 'string-shot'] },
  14: { name: 'Kakuna', types: ['bug', 'poison'], baseStats: { hp: 45, attack: 25, defense: 50, spAtk: 25, spDef: 25, speed: 35 }, moves: ['harden', 'poison-sting'] },
  15: { name: 'Beedrill', types: ['bug', 'poison'], baseStats: { hp: 65, attack: 90, defense: 40, spAtk: 45, spDef: 80, speed: 75 }, moves: ['fury-attack', 'poison-sting', 'agility'] },

  // Early route Gen 1
  16: { name: 'Pidgey', types: ['normal', 'flying'], baseStats: { hp: 40, attack: 45, defense: 40, spAtk: 35, spDef: 35, speed: 56 }, moves: ['tackle', 'gust', 'quick-attack'] },
  17: { name: 'Pidgeotto', types: ['normal', 'flying'], baseStats: { hp: 63, attack: 60, defense: 55, spAtk: 50, spDef: 50, speed: 71 }, moves: ['tackle', 'gust', 'quick-attack', 'agility'] },
  18: { name: 'Pidgeot', types: ['normal', 'flying'], baseStats: { hp: 83, attack: 80, defense: 75, spAtk: 70, spDef: 70, speed: 101 }, moves: ['air-slash', 'quick-attack', 'agility', 'double-edge'] },
  19: { name: 'Rattata', types: ['normal'], baseStats: { hp: 30, attack: 56, defense: 35, spAtk: 25, spDef: 35, speed: 72 }, moves: ['tackle', 'tail-whip', 'quick-attack', 'bite'] },
  20: { name: 'Raticate', types: ['normal'], baseStats: { hp: 55, attack: 81, defense: 60, spAtk: 50, spDef: 70, speed: 97 }, moves: ['bite', 'quick-attack', 'double-edge', 'scary-face'] },
  21: { name: 'Spearow', types: ['normal', 'flying'], baseStats: { hp: 40, attack: 60, defense: 30, spAtk: 31, spDef: 31, speed: 70 }, moves: ['peck', 'leer', 'fury-attack'] },
  22: { name: 'Fearow', types: ['normal', 'flying'], baseStats: { hp: 65, attack: 90, defense: 65, spAtk: 61, spDef: 61, speed: 100 }, moves: ['drill-peck', 'fury-attack', 'agility'] },

  // Pikachu & Raichu
  25: { name: 'Pikachu', types: ['electric'], baseStats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 }, moves: ['thunder-shock', 'growl', 'quick-attack', 'thunderbolt'] },
  26: { name: 'Raichu', types: ['electric'], baseStats: { hp: 60, attack: 90, defense: 55, spAtk: 90, spDef: 80, speed: 110 }, moves: ['thunderbolt', 'quick-attack', 'agility', 'thunder-wave'] },

  // Nidoran & Fairy
  29: { name: 'Nidoran♀', types: ['poison'], baseStats: { hp: 55, attack: 47, defense: 52, spAtk: 40, spDef: 40, speed: 41 }, moves: ['growl', 'scratch', 'tail-whip', 'poison-sting'] },
  32: { name: 'Nidoran♂', types: ['poison'], baseStats: { hp: 46, attack: 57, defense: 40, spAtk: 40, spDef: 40, speed: 50 }, moves: ['leer', 'tackle', 'horn-attack', 'poison-sting'] },
  35: { name: 'Clefairy', types: ['fairy'], baseStats: { hp: 70, attack: 45, defense: 48, spAtk: 60, spDef: 65, speed: 35 }, moves: ['pound', 'growl', 'sing', 'defense-curl'] },
  39: { name: 'Jigglypuff', types: ['normal', 'fairy'], baseStats: { hp: 115, attack: 45, defense: 20, spAtk: 45, spDef: 25, speed: 20 }, moves: ['sing', 'pound', 'defense-curl', 'disable'] },

  // Cave & iconic
  41: { name: 'Zubat', types: ['poison', 'flying'], baseStats: { hp: 40, attack: 45, defense: 35, spAtk: 30, spDef: 40, speed: 55 }, moves: ['leech-life', 'supersonic', 'bite'] },
  43: { name: 'Oddish', types: ['grass', 'poison'], baseStats: { hp: 45, attack: 50, defense: 55, spAtk: 75, spDef: 65, speed: 30 }, moves: ['absorb', 'sweet-scent', 'poison-powder'] },
  52: { name: 'Meowth', types: ['normal'], baseStats: { hp: 40, attack: 45, defense: 35, spAtk: 40, spDef: 40, speed: 90 }, moves: ['scratch', 'growl', 'bite', 'screech'] },
  54: { name: 'Psyduck', types: ['water'], baseStats: { hp: 50, attack: 52, defense: 48, spAtk: 65, spDef: 50, speed: 55 }, moves: ['water-gun', 'confusion', 'scratch', 'disable'] },
  60: { name: 'Poliwag', types: ['water'], baseStats: { hp: 40, attack: 50, defense: 40, spAtk: 40, spDef: 40, speed: 90 }, moves: ['bubble', 'water-gun', 'hypnosis'] },
  63: { name: 'Abra', types: ['psychic'], baseStats: { hp: 25, attack: 20, defense: 15, spAtk: 105, spDef: 55, speed: 90 }, moves: ['teleport', 'confusion'] },
  66: { name: 'Machop', types: ['fighting'], baseStats: { hp: 70, attack: 80, defense: 50, spAtk: 35, spDef: 35, speed: 35 }, moves: ['low-kick', 'leer', 'karate-chop'] },
  74: { name: 'Geodude', types: ['rock', 'ground'], baseStats: { hp: 40, attack: 80, defense: 100, spAtk: 30, spDef: 30, speed: 20 }, moves: ['tackle', 'defense-curl', 'rock-throw'] },
  77: { name: 'Ponyta', types: ['fire'], baseStats: { hp: 50, attack: 85, defense: 55, spAtk: 65, spDef: 65, speed: 90 }, moves: ['ember', 'tail-whip', 'tackle', 'agility'] },
  81: { name: 'Magnemite', types: ['electric', 'steel'], baseStats: { hp: 25, attack: 35, defense: 70, spAtk: 95, spDef: 55, speed: 45 }, moves: ['thunder-shock', 'tackle', 'supersonic'] },
  84: { name: 'Doduo', types: ['normal', 'flying'], baseStats: { hp: 35, attack: 85, defense: 45, spAtk: 35, spDef: 35, speed: 75 }, moves: ['peck', 'growl', 'quick-attack', 'fury-attack'] },
  92: { name: 'Gastly', types: ['ghost', 'poison'], baseStats: { hp: 30, attack: 35, defense: 30, spAtk: 100, spDef: 35, speed: 80 }, moves: ['lick', 'hypnosis', 'spite', 'confuse-ray'] },
  94: { name: 'Gengar', types: ['ghost', 'poison'], baseStats: { hp: 60, attack: 65, defense: 60, spAtk: 130, spDef: 75, speed: 110 }, moves: ['shadow-ball', 'dark-pulse', 'hypnosis', 'confuse-ray'] },
  95: { name: 'Onix', types: ['rock', 'ground'], baseStats: { hp: 35, attack: 45, defense: 160, spAtk: 30, spDef: 45, speed: 70 }, moves: ['tackle', 'screech', 'rock-throw', 'harden'] },
  100: { name: 'Voltorb', types: ['electric'], baseStats: { hp: 40, attack: 30, defense: 50, spAtk: 55, spDef: 55, speed: 100 }, moves: ['tackle', 'thunder-shock', 'screech'] },
  128: { name: 'Tauros', types: ['normal'], baseStats: { hp: 75, attack: 100, defense: 95, spAtk: 40, spDef: 70, speed: 110 }, moves: ['tackle', 'tail-whip', 'horn-attack', 'scary-face'] },
  129: { name: 'Magikarp', types: ['water'], baseStats: { hp: 20, attack: 10, defense: 55, spAtk: 15, spDef: 20, speed: 80 }, moves: ['splash', 'tackle'] },
  130: { name: 'Gyarados', types: ['water', 'flying'], baseStats: { hp: 95, attack: 125, defense: 79, spAtk: 60, spDef: 100, speed: 81 }, moves: ['bite', 'waterfall', 'dragon-dance', 'leer'] },
  133: { name: 'Eevee', types: ['normal'], baseStats: { hp: 55, attack: 55, defense: 50, spAtk: 45, spDef: 65, speed: 55 }, moves: ['tackle', 'tail-whip', 'quick-attack', 'bite'] },
  143: { name: 'Snorlax', types: ['normal'], baseStats: { hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 }, moves: ['tackle', 'rest', 'snore', 'body-slam'] },
  147: { name: 'Dratini', types: ['dragon'], baseStats: { hp: 41, attack: 64, defense: 45, spAtk: 50, spDef: 50, speed: 50 }, moves: ['wrap', 'leer', 'thunder-wave', 'twister'] },
  149: { name: 'Dragonite', types: ['dragon', 'flying'], baseStats: { hp: 91, attack: 134, defense: 95, spAtk: 100, spDef: 100, speed: 80 }, moves: ['dragon-dance', 'wing-attack', 'extreme-speed', 'outrage'] },
  150: { name: 'Mewtwo', types: ['psychic'], baseStats: { hp: 106, attack: 110, defense: 90, spAtk: 154, spDef: 90, speed: 130 }, moves: ['psychic', 'swift', 'recover', 'calm-mind'] },
  151: { name: 'Mew', types: ['psychic'], baseStats: { hp: 100, attack: 100, defense: 100, spAtk: 100, spDef: 100, speed: 100 }, moves: ['pound', 'transform', 'psychic', 'ancient-power'] },

  // Starters Gen 2
  152: { name: 'Chikorita', types: ['grass'], baseStats: { hp: 45, attack: 49, defense: 65, spAtk: 49, spDef: 65, speed: 45 }, moves: ['tackle', 'growl', 'razor-leaf', 'poison-powder'] },
  155: { name: 'Cyndaquil', types: ['fire'], baseStats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 }, moves: ['tackle', 'leer', 'ember', 'smokescreen'] },
  158: { name: 'Totodile', types: ['water'], baseStats: { hp: 50, attack: 65, defense: 64, spAtk: 44, spDef: 48, speed: 43 }, moves: ['scratch', 'leer', 'water-gun', 'bite'] },

  // Gen 2 & 3 icons
  161: { name: 'Sentret', types: ['normal'], baseStats: { hp: 35, attack: 46, defense: 34, spAtk: 35, spDef: 45, speed: 20 }, moves: ['tackle', 'defense-curl', 'quick-attack'] },
  179: { name: 'Mareep', types: ['electric'], baseStats: { hp: 55, attack: 40, defense: 40, spAtk: 65, spDef: 45, speed: 35 }, moves: ['tackle', 'growl', 'thunder-shock', 'thunder-wave'] },
  197: { name: 'Umbreon', types: ['dark'], baseStats: { hp: 95, attack: 65, defense: 110, spAtk: 60, spDef: 130, speed: 65 }, moves: ['dark-pulse', 'confuse-ray', 'screech', 'quick-attack'] },
  251: { name: 'Celebi', types: ['psychic', 'grass'], baseStats: { hp: 100, attack: 100, defense: 100, spAtk: 100, spDef: 100, speed: 100 }, moves: ['confusion', 'recover', 'heal-bell', 'magical-leaf'] },
  252: { name: 'Treecko', types: ['grass'], baseStats: { hp: 40, attack: 45, defense: 35, spAtk: 65, spDef: 55, speed: 70 }, moves: ['pound', 'leer', 'absorb', 'quick-attack'] },
  255: { name: 'Torchic', types: ['fire'], baseStats: { hp: 45, attack: 60, defense: 40, spAtk: 70, spDef: 50, speed: 45 }, moves: ['scratch', 'growl', 'ember', 'quick-attack'] },
  258: { name: 'Mudkip', types: ['water'], baseStats: { hp: 50, attack: 70, defense: 50, spAtk: 50, spDef: 50, speed: 40 }, moves: ['tackle', 'growl', 'water-gun', 'mud-slap'] },
  263: { name: 'Zigzagoon', types: ['normal'], baseStats: { hp: 38, attack: 30, defense: 41, spAtk: 30, spDef: 41, speed: 60 }, moves: ['tackle', 'tail-whip', 'growl', 'headbutt'] },
  355: { name: 'Duskull', types: ['ghost'], baseStats: { hp: 20, attack: 40, defense: 90, spAtk: 30, spDef: 90, speed: 25 }, moves: ['astonish', 'leer', 'disable', 'shadow-sneak'] },

  // Gen 4
  387: { name: 'Turtwig', types: ['grass'], baseStats: { hp: 55, attack: 68, defense: 64, spAtk: 45, spDef: 55, speed: 31 }, moves: ['tackle', 'withdraw', 'absorb', 'razor-leaf'] },
  390: { name: 'Chimchar', types: ['fire'], baseStats: { hp: 44, attack: 58, defense: 44, spAtk: 58, spDef: 44, speed: 61 }, moves: ['scratch', 'leer', 'ember', 'taunt'] },
  393: { name: 'Piplup', types: ['water'], baseStats: { hp: 53, attack: 51, defense: 53, spAtk: 61, spDef: 56, speed: 40 }, moves: ['pound', 'growl', 'water-gun', 'bubble'] },
  396: { name: 'Starly', types: ['normal', 'flying'], baseStats: { hp: 40, attack: 55, defense: 30, spAtk: 30, spDef: 30, speed: 60 }, moves: ['tackle', 'growl', 'quick-attack', 'wing-attack'] },
  399: { name: 'Bidoof', types: ['normal'], baseStats: { hp: 59, attack: 45, defense: 40, spAtk: 35, spDef: 40, speed: 31 }, moves: ['tackle', 'growl', 'defense-curl', 'headbutt'] },
  403: { name: 'Shinx', types: ['electric'], baseStats: { hp: 45, attack: 65, defense: 34, spAtk: 40, spDef: 34, speed: 45 }, moves: ['tackle', 'leer', 'thunder-shock', 'bite'] },
  609: { name: 'Chandelure', types: ['ghost', 'fire'], baseStats: { hp: 60, attack: 55, defense: 90, spAtk: 145, spDef: 90, speed: 80 }, moves: ['flamethrower', 'shadow-ball', 'confuse-ray', 'will-o-wisp'] },
};

export function getFallbackPokemonData(id: number): FallbackPokemonInfo {
  if (POKEMON_FALLBACKS[id]) {
    return POKEMON_FALLBACKS[id];
  }
  return {
    name: `Pokémon #${id}`,
    types: ['normal'],
    baseStats: { hp: 48, attack: 52, defense: 48, spAtk: 50, spDef: 50, speed: 50 },
    moves: ['tackle', 'quick-attack', 'growl']
  };
}
