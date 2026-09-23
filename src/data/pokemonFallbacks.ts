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

  // Area Zero Exclusives & Legends
  59: { name: 'Arcanine', types: ['fire'], baseStats: { hp: 90, attack: 110, defense: 80, spAtk: 100, spDef: 80, speed: 95 }, moves: ['flamethrower', 'extreme-speed', 'bite', 'flare-blitz'] },
  68: { name: 'Machamp', types: ['fighting'], baseStats: { hp: 90, attack: 130, defense: 80, spAtk: 65, spDef: 85, speed: 55 }, moves: ['cross-chop', 'dynamic-punch', 'earthquake', 'bulk-up'] },
  212: { name: 'Scizor', types: ['bug', 'steel'], baseStats: { hp: 70, attack: 130, defense: 100, spAtk: 55, spDef: 80, speed: 65 }, moves: ['bullet-punch', 'x-scissor', 'swords-dance', 'iron-head'] },
  386: { name: 'Deoxys', types: ['psychic'], baseStats: { hp: 50, attack: 150, defense: 50, spAtk: 150, spDef: 50, speed: 150 }, moves: ['psycho-boost', 'hyper-beam', 'extreme-speed', 'recover'] },
  448: { name: 'Lucario', types: ['fighting', 'steel'], baseStats: { hp: 70, attack: 110, defense: 70, spAtk: 115, spDef: 70, speed: 90 }, moves: ['aura-sphere', 'close-combat', 'flash-cannon', 'extreme-speed'] },
  468: { name: 'Togekiss', types: ['fairy', 'flying'], baseStats: { hp: 85, attack: 50, defense: 95, spAtk: 120, spDef: 115, speed: 80 }, moves: ['air-slash', 'dazzling-gleam', 'aura-sphere', 'roost'] },
  474: { name: 'Porygon-Z', types: ['normal'], baseStats: { hp: 85, attack: 80, defense: 70, spAtk: 135, spDef: 75, speed: 90 }, moves: ['tri-attack', 'thunderbolt', 'ice-beam', 'nasty-plot'] },
  491: { name: 'Darkrai', types: ['dark'], baseStats: { hp: 70, attack: 90, defense: 90, spAtk: 135, spDef: 90, speed: 125 }, moves: ['dark-pulse', 'hypnosis', 'dream-eater', 'nasty-plot'] },
  493: { name: 'Arceus', types: ['normal'], baseStats: { hp: 120, attack: 120, defense: 120, spAtk: 120, spDef: 120, speed: 120 }, moves: ['judgment', 'recover', 'hyper-beam', 'cosmic-power'] },
  643: { name: 'Reshiram', types: ['dragon', 'fire'], baseStats: { hp: 100, attack: 120, defense: 100, spAtk: 150, spDef: 120, speed: 90 }, moves: ['blue-flare', 'dragon-pulse', 'fusion-flare', 'roost'] },
  644: { name: 'Zekrom', types: ['dragon', 'electric'], baseStats: { hp: 100, attack: 150, defense: 120, spAtk: 120, spDef: 100, speed: 90 }, moves: ['bolt-strike', 'outrage', 'fusion-bolt', 'dragon-claw'] },
  646: { name: 'Kyurem', types: ['dragon', 'ice'], baseStats: { hp: 125, attack: 130, defense: 90, spAtk: 130, spDef: 90, speed: 95 }, moves: ['ice-beam', 'dragon-pulse', 'blizzard', 'draco-meteor'] },
  658: { name: 'Greninja', types: ['water', 'dark'], baseStats: { hp: 72, attack: 95, defense: 67, spAtk: 103, spDef: 71, speed: 122 }, moves: ['water-shuriken', 'hydro-pump', 'dark-pulse', 'ice-beam'] },
  716: { name: 'Xerneas', types: ['fairy'], baseStats: { hp: 126, attack: 131, defense: 95, spAtk: 131, spDef: 98, speed: 99 }, moves: ['geomancy', 'moonblast', 'megahorn', 'focus-blast'] },
  717: { name: 'Yveltal', types: ['dark', 'flying'], baseStats: { hp: 126, attack: 131, defense: 95, spAtk: 131, spDef: 98, speed: 99 }, moves: ['oblivion-wing', 'dark-pulse', 'sucker-punch', 'psychic'] },
  718: { name: 'Zygarde', types: ['dragon', 'ground'], baseStats: { hp: 108, attack: 100, defense: 121, spAtk: 81, spDef: 95, speed: 95 }, moves: ['thousand-arrows', 'outrage', 'earthquake', 'dragon-dance'] },
  791: { name: 'Solgaleo', types: ['psychic', 'steel'], baseStats: { hp: 137, attack: 137, defense: 107, spAtk: 113, spDef: 89, speed: 97 }, moves: ['sunsteel-strike', 'zen-headbutt', 'earthquake', 'morning-sun'] },
  792: { name: 'Lunala', types: ['psychic', 'ghost'], baseStats: { hp: 137, attack: 113, defense: 89, spAtk: 137, spDef: 107, speed: 97 }, moves: ['phantom-force', 'psychic', 'moonblast', 'shadow-ball'] },
  800: { name: 'Necrozma', types: ['psychic'], baseStats: { hp: 97, attack: 107, defense: 101, spAtk: 127, spDef: 89, speed: 79 }, moves: ['prismatic-laser', 'photon-geyser', 'psychic', 'calm-mind'] },
  807: { name: 'Zeraora', types: ['electric'], baseStats: { hp: 88, attack: 112, defense: 75, spAtk: 102, spDef: 80, speed: 143 }, moves: ['plasma-fists', 'close-combat', 'thunderbolt', 'volt-switch'] },
  888: { name: 'Zacian', types: ['fairy', 'steel'], baseStats: { hp: 92, attack: 130, defense: 115, spAtk: 80, spDef: 115, speed: 138 }, moves: ['behemoth-blade', 'play-rough', 'swords-dance', 'close-combat'] },
  889: { name: 'Zamazenta', types: ['fighting', 'steel'], baseStats: { hp: 92, attack: 130, defense: 145, spAtk: 80, spDef: 145, speed: 128 }, moves: ['behemoth-bash', 'close-combat', 'iron-defense', 'crunch'] },
  890: { name: 'Eternatus', types: ['poison', 'dragon'], baseStats: { hp: 140, attack: 85, defense: 95, spAtk: 145, spDef: 95, speed: 130 }, moves: ['dynamax-cannon', 'sludge-bomb', 'dragon-pulse', 'recover'] },
  892: { name: 'Urshifu', types: ['fighting', 'dark'], baseStats: { hp: 100, attack: 130, defense: 100, spAtk: 63, spDef: 60, speed: 97 }, moves: ['wicked-blow', 'close-combat', 'iron-head', 'bulk-up'] },
  998: { name: 'Baxcalibur', types: ['dragon', 'ice'], baseStats: { hp: 115, attack: 145, defense: 92, spAtk: 75, spDef: 86, speed: 87 }, moves: ['glaive-rush', 'icicle-crash', 'earthquake', 'dragon-dance'] },
  1000: { name: 'Gholdengo', types: ['steel', 'ghost'], baseStats: { hp: 87, attack: 60, defense: 95, spAtk: 133, spDef: 91, speed: 84 }, moves: ['make-it-rain', 'shadow-ball', 'nasty-plot', 'recover'] },
  1007: { name: 'Koraidon', types: ['fighting', 'dragon'], baseStats: { hp: 100, attack: 135, defense: 115, spAtk: 85, spDef: 100, speed: 135 }, moves: ['collision-course', 'outrage', 'flare-blitz', 'bulk-up'] },
  1008: { name: 'Miraidon', types: ['electric', 'dragon'], baseStats: { hp: 100, attack: 85, defense: 100, spAtk: 135, spDef: 115, speed: 135 }, moves: ['electro-drift', 'draco-meteor', 'volt-switch', 'calm-mind'] },
  1024: { name: 'Terapagos', types: ['normal'], baseStats: { hp: 95, attack: 65, defense: 85, spAtk: 105, spDef: 85, speed: 60 }, moves: ['tera-starstorm', 'earth-power', 'ancient-power', 'tri-attack'] },

  // Forme Paradosso dell'Area Zero
  984: { name: 'Denteferrino', types: ['ground', 'fighting'], baseStats: { hp: 115, attack: 131, defense: 131, spAtk: 53, spDef: 53, speed: 87 }, moves: ['headlong-rush', 'close-combat', 'earthquake', 'knock-off'] },
  985: { name: 'Codaurlante', types: ['fairy', 'psychic'], baseStats: { hp: 115, attack: 65, defense: 99, spAtk: 65, spDef: 115, speed: 111 }, moves: ['play-rough', 'psychic', 'wish', 'stealth-rock'] },
  986: { name: 'Fungofurioso', types: ['grass', 'dark'], baseStats: { hp: 111, attack: 127, defense: 99, spAtk: 79, spDef: 99, speed: 55 }, moves: ['spore', 'sucker-punch', 'seed-bomb', 'close-combat'] },
  987: { name: 'Crinealato', types: ['ghost', 'fairy'], baseStats: { hp: 55, attack: 55, defense: 55, spAtk: 135, spDef: 135, speed: 135 }, moves: ['shadow-ball', 'moonblast', 'mystical-fire', 'power-gem'] },
  988: { name: 'Alirasenti', types: ['bug', 'fighting'], baseStats: { hp: 85, attack: 135, defense: 79, spAtk: 85, spDef: 105, speed: 81 }, moves: ['first-impression', 'close-combat', 'flare-blitz', 'u-turn'] },
  989: { name: 'Peldisabbia', types: ['electric', 'ground'], baseStats: { hp: 85, attack: 81, defense: 97, spAtk: 121, spDef: 85, speed: 101 }, moves: ['thunderbolt', 'earth-power', 'volt-switch', 'stealth-rock'] },
  990: { name: 'Solcoferreo', types: ['ground', 'steel'], baseStats: { hp: 90, attack: 112, defense: 120, spAtk: 72, spDef: 70, speed: 106 }, moves: ['earthquake', 'iron-head', 'rapid-spin', 'volt-switch'] },
  991: { name: 'Saccoferreo', types: ['ice', 'water'], baseStats: { hp: 56, attack: 80, defense: 114, spAtk: 124, spDef: 60, speed: 136 }, moves: ['freeze-dry', 'hydro-pump', 'ice-beam', 'flip-turn'] },
  992: { name: 'Manoferrea', types: ['fighting', 'electric'], baseStats: { hp: 154, attack: 140, defense: 108, spAtk: 50, spDef: 68, speed: 50 }, moves: ['drain-punch', 'thunder-punch', 'wild-charge', 'swords-dance'] },
  993: { name: 'Colloferreo', types: ['dark', 'flying'], baseStats: { hp: 94, attack: 80, defense: 86, spAtk: 122, spDef: 80, speed: 108 }, moves: ['dark-pulse', 'air-slash', 'hurricane', 'flash-cannon'] },
  994: { name: 'Falenaferrea', types: ['fire', 'poison'], baseStats: { hp: 80, attack: 70, defense: 60, spAtk: 140, spDef: 110, speed: 110 }, moves: ['fiery-dance', 'sludge-wave', 'energy-ball', 'discharge'] },
  995: { name: 'Spinaferrea', types: ['rock', 'electric'], baseStats: { hp: 100, attack: 134, defense: 110, spAtk: 70, spDef: 84, speed: 72 }, moves: ['stone-edge', 'wild-charge', 'earthquake', 'dragon-dance'] },
  1005: { name: 'Lunarugente', types: ['dragon', 'dark'], baseStats: { hp: 105, attack: 139, defense: 71, spAtk: 55, spDef: 101, speed: 119 }, moves: ['dragon-dance', 'crunch', 'dragon-claw', 'earthquake'] },
  1006: { name: 'Eroeferreo', types: ['fairy', 'fighting'], baseStats: { hp: 74, attack: 130, defense: 90, spAtk: 120, spDef: 60, speed: 116 }, moves: ['spirit-break', 'close-combat', 'moonblast', 'swords-dance'] },
  1009: { name: 'Acquacrespa', types: ['water', 'dragon'], baseStats: { hp: 99, attack: 83, defense: 91, spAtk: 125, spDef: 83, speed: 109 }, moves: ['hydro-steam', 'dragon-pulse', 'flamethrower', 'draco-meteor'] },
  1010: { name: 'Fogliaferrea', types: ['grass', 'psychic'], baseStats: { hp: 90, attack: 130, defense: 88, spAtk: 70, spDef: 108, speed: 104 }, moves: ['psyblade', 'leaf-blade', 'close-combat', 'swords-dance'] },
  1020: { name: 'Vampaferina', types: ['fire', 'dragon'], baseStats: { hp: 105, attack: 115, defense: 121, spAtk: 65, spDef: 93, speed: 91 }, moves: ['burning-bulwark', 'flare-blitz', 'dragon-claw', 'dragon-dance'] },
  1021: { name: 'Furiapulente', types: ['electric', 'dragon'], baseStats: { hp: 125, attack: 73, defense: 91, spAtk: 137, spDef: 89, speed: 75 }, moves: ['thunderclap', 'draco-meteor', 'thunderbolt', 'calm-mind'] },
  1022: { name: 'Massoferreo', types: ['rock', 'psychic'], baseStats: { hp: 90, attack: 120, defense: 80, spAtk: 68, spDef: 108, speed: 124 }, moves: ['mighty-cleave', 'zen-headbutt', 'close-combat', 'swords-dance'] },
  1023: { name: 'Capoferreo', types: ['steel', 'psychic'], baseStats: { hp: 90, attack: 72, defense: 100, spAtk: 122, spDef: 108, speed: 98 }, moves: ['tachyon-cutter', 'psychic', 'volt-switch', 'calm-mind'] },

  // Forme Regionali - Alola
  10091: { name: 'Rattata di Alola', types: ['dark', 'normal'], baseStats: { hp: 30, attack: 56, defense: 35, spAtk: 25, spDef: 35, speed: 72 }, moves: ['tackle', 'bite', 'quick-attack', 'crunch'] },
  10092: { name: 'Raticate di Alola', types: ['dark', 'normal'], baseStats: { hp: 75, attack: 71, defense: 70, spAtk: 40, spDef: 80, speed: 77 }, moves: ['crunch', 'hyper-fang', 'double-edge', 'sucker-punch'] },
  10100: { name: 'Raichu di Alola', types: ['electric', 'psychic'], baseStats: { hp: 60, attack: 85, defense: 50, spAtk: 95, spDef: 85, speed: 110 }, moves: ['thunderbolt', 'psychic', 'volt-switch', 'calm-mind'] },
  10101: { name: 'Sandshrew di Alola', types: ['ice', 'steel'], baseStats: { hp: 50, attack: 75, defense: 90, spAtk: 10, spDef: 35, speed: 40 }, moves: ['scratch', 'icicle-spear', 'metal-claw', 'iron-defense'] },
  10102: { name: 'Sandslash di Alola', types: ['ice', 'steel'], baseStats: { hp: 75, attack: 100, defense: 120, spAtk: 25, spDef: 65, speed: 65 }, moves: ['icicle-crash', 'iron-head', 'slash', 'swords-dance'] },
  10103: { name: 'Vulpix di Alola', types: ['ice'], baseStats: { hp: 38, attack: 41, defense: 40, spAtk: 50, spDef: 65, speed: 65 }, moves: ['powder-snow', 'ice-beam', 'quick-attack', 'mist'] },
  10104: { name: 'Ninetales di Alola', types: ['ice', 'fairy'], baseStats: { hp: 73, attack: 67, defense: 75, spAtk: 81, spDef: 100, speed: 109 }, moves: ['blizzard', 'moonblast', 'dazzling-gleam', 'aurora-veil'] },
  10105: { name: 'Diglett di Alola', types: ['ground', 'steel'], baseStats: { hp: 10, attack: 55, defense: 30, spAtk: 35, spDef: 45, speed: 90 }, moves: ['scratch', 'mud-slap', 'metal-claw', 'sucker-punch'] },
  10106: { name: 'Dugtrio di Alola', types: ['ground', 'steel'], baseStats: { hp: 35, attack: 100, defense: 60, spAtk: 50, spDef: 70, speed: 110 }, moves: ['earthquake', 'iron-head', 'slash', 'sucker-punch'] },
  10107: { name: 'Meowth di Alola', types: ['dark'], baseStats: { hp: 40, attack: 35, defense: 35, spAtk: 50, spDef: 40, speed: 90 }, moves: ['scratch', 'bite', 'fake-out', 'dark-pulse'] },
  10108: { name: 'Persian di Alola', types: ['dark'], baseStats: { hp: 65, attack: 60, defense: 60, spAtk: 75, spDef: 65, speed: 115 }, moves: ['dark-pulse', 'power-gem', 'nasty-plot', 'hyper-voice'] },
  10109: { name: 'Geodude di Alola', types: ['rock', 'electric'], baseStats: { hp: 40, attack: 80, defense: 100, spAtk: 30, spDef: 30, speed: 20 }, moves: ['tackle', 'rock-throw', 'thunder-shock', 'charge'] },
  10110: { name: 'Graveler di Alola', types: ['rock', 'electric'], baseStats: { hp: 55, attack: 95, defense: 115, spAtk: 45, spDef: 45, speed: 35 }, moves: ['rock-slide', 'spark', 'stealth-rock', 'double-edge'] },
  10111: { name: 'Golem di Alola', types: ['rock', 'electric'], baseStats: { hp: 80, attack: 120, defense: 130, spAtk: 55, spDef: 65, speed: 45 }, moves: ['stone-edge', 'wild-charge', 'earthquake', 'heavy-slam'] },
  10112: { name: 'Grimer di Alola', types: ['poison', 'dark'], baseStats: { hp: 80, attack: 80, defense: 50, spAtk: 40, spDef: 50, speed: 25 }, moves: ['pound', 'poison-gas', 'bite', 'acid-armor'] },
  10113: { name: 'Muk di Alola', types: ['poison', 'dark'], baseStats: { hp: 105, attack: 105, defense: 75, spAtk: 65, spDef: 100, speed: 50 }, moves: ['gunk-shot', 'knock-off', 'crunch', 'minimize'] },
  10114: { name: 'Exeggutor di Alola', types: ['grass', 'dragon'], baseStats: { hp: 95, attack: 105, defense: 85, spAtk: 125, spDef: 75, speed: 45 }, moves: ['dragon-hammer', 'seed-bomb', 'psychic', 'giga-drain'] },
  10115: { name: 'Marowak di Alola', types: ['fire', 'ghost'], baseStats: { hp: 60, attack: 80, defense: 110, spAtk: 50, spDef: 80, speed: 45 }, moves: ['shadow-bone', 'flare-blitz', 'bonemerang', 'will-o-wisp'] },

  // Forme Regionali - Galar
  10161: { name: 'Meowth di Galar', types: ['steel'], baseStats: { hp: 50, attack: 65, defense: 55, spAtk: 40, spDef: 40, speed: 40 }, moves: ['fake-out', 'metal-claw', 'scratch', 'hone-claws'] },
  863: { name: 'Perrserker', types: ['steel'], baseStats: { hp: 70, attack: 110, defense: 100, spAtk: 50, spDef: 60, speed: 50 }, moves: ['iron-head', 'close-combat', 'seed-bomb', 'swords-dance'] },
  10162: { name: 'Ponyta di Galar', types: ['psychic'], baseStats: { hp: 50, attack: 85, defense: 55, spAtk: 65, spDef: 65, speed: 90 }, moves: ['tackle', 'confusion', 'fairy-wind', 'agility'] },
  10163: { name: 'Rapidash di Galar', types: ['psychic', 'fairy'], baseStats: { hp: 65, attack: 100, defense: 70, spAtk: 80, spDef: 80, speed: 105 }, moves: ['psycho-cut', 'play-rough', 'megahorn', 'swords-dance'] },
  10164: { name: 'Slowpoke di Galar', types: ['psychic'], baseStats: { hp: 90, attack: 65, defense: 65, spAtk: 40, spDef: 40, speed: 15 }, moves: ['tackle', 'confusion', 'yawn', 'water-gun'] },
  10165: { name: 'Slowbro di Galar', types: ['poison', 'psychic'], baseStats: { hp: 95, attack: 100, defense: 95, spAtk: 100, spDef: 70, speed: 30 }, moves: ['shell-side-arm', 'psychic', 'sludge-bomb', 'nasty-plot'] },
  10166: { name: "Farfetch'd di Galar", types: ['fighting'], baseStats: { hp: 52, attack: 95, defense: 55, spAtk: 58, spDef: 62, speed: 55 }, moves: ['peck', 'rock-smash', 'brick-break', 'detect'] },
  865: { name: "Sirfetch'd", types: ['fighting'], baseStats: { hp: 62, attack: 135, defense: 95, spAtk: 68, spDef: 82, speed: 65 }, moves: ['meteor-assault', 'close-combat', 'leaf-blade', 'brave-bird'] },
  10174: { name: 'Zigzagoon di Galar', types: ['dark', 'normal'], baseStats: { hp: 38, attack: 30, defense: 41, spAtk: 30, spDef: 41, speed: 60 }, moves: ['tackle', 'headbutt', 'snarl', 'scary-face'] },
  10175: { name: 'Linoone di Galar', types: ['dark', 'normal'], baseStats: { hp: 78, attack: 70, defense: 61, spAtk: 50, spDef: 61, speed: 100 }, moves: ['night-slash', 'headbutt', 'take-down', 'hone-claws'] },
  862: { name: 'Obstagoon', types: ['dark', 'normal'], baseStats: { hp: 93, attack: 90, defense: 101, spAtk: 60, spDef: 81, speed: 95 }, moves: ['obstruct', 'night-slash', 'double-edge', 'close-combat'] },
  10173: { name: 'Corsola di Galar', types: ['ghost'], baseStats: { hp: 60, attack: 55, defense: 100, spAtk: 65, spDef: 100, speed: 30 }, moves: ['tackle', 'night-shade', 'will-o-wisp', 'strength-sap'] },
  864: { name: 'Cursola', types: ['ghost'], baseStats: { hp: 60, attack: 95, defense: 50, spAtk: 145, spDef: 130, speed: 30 }, moves: ['shadow-ball', 'power-gem', 'giga-drain', 'strength-sap'] },
  10176: { name: 'Darumaka di Galar', types: ['ice'], baseStats: { hp: 70, attack: 90, defense: 45, spAtk: 15, spDef: 45, speed: 50 }, moves: ['powder-snow', 'tackle', 'icicle-spear', 'bite'] },
  10177: { name: 'Darmanitan di Galar', types: ['ice'], baseStats: { hp: 105, attack: 140, defense: 55, spAtk: 30, spDef: 55, speed: 95 }, moves: ['icicle-crash', 'flare-blitz', 'earthquake', 'u-turn'] },
  10179: { name: 'Yamask di Galar', types: ['ground', 'ghost'], baseStats: { hp: 38, attack: 55, defense: 85, spAtk: 30, spDef: 65, speed: 30 }, moves: ['astonish', 'night-shade', 'bulldoze', 'haze'] },
  867: { name: 'Runerigus', types: ['ground', 'ghost'], baseStats: { hp: 58, attack: 95, defense: 145, spAtk: 50, spDef: 105, speed: 30 }, moves: ['shadow-claw', 'earthquake', 'rock-slide', 'iron-defense'] },
  10167: { name: 'Weezing di Galar', types: ['poison', 'fairy'], baseStats: { hp: 65, attack: 90, defense: 120, spAtk: 85, spDef: 70, speed: 60 }, moves: ['sludge-bomb', 'strange-steam', 'will-o-wisp', 'defog'] },
  10180: { name: 'Stunfisk di Galar', types: ['ground', 'steel'], baseStats: { hp: 109, attack: 81, defense: 99, spAtk: 66, spDef: 84, speed: 32 }, moves: ['snap-trap', 'mud-shot', 'iron-defense', 'foul-play'] },

  // Forme Regionali - Hisui
  10229: { name: 'Growlithe di Hisui', types: ['fire', 'rock'], baseStats: { hp: 60, attack: 75, defense: 45, spAtk: 65, spDef: 50, speed: 55 }, moves: ['ember', 'rock-throw', 'bite', 'roar'] },
  10230: { name: 'Arcanine di Hisui', types: ['fire', 'rock'], baseStats: { hp: 95, attack: 115, defense: 80, spAtk: 95, spDef: 80, speed: 90 }, moves: ['raging-fury', 'rock-slide', 'flare-blitz', 'extreme-speed'] },
  10231: { name: 'Voltorb di Hisui', types: ['electric', 'grass'], baseStats: { hp: 40, attack: 30, defense: 50, spAtk: 55, spDef: 55, speed: 100 }, moves: ['thunder-shock', 'bullet-seed', 'tackle', 'screech'] },
  10232: { name: 'Electrode di Hisui', types: ['electric', 'grass'], baseStats: { hp: 60, attack: 50, defense: 70, spAtk: 80, spDef: 80, speed: 150 }, moves: ['chloroblast', 'thunderbolt', 'energy-ball', 'volt-switch'] },
  10234: { name: 'Qwilfish di Hisui', types: ['dark', 'poison'], baseStats: { hp: 65, attack: 95, defense: 85, spAtk: 55, spDef: 55, speed: 85 }, moves: ['poison-jab', 'bite', 'toxic-spikes', 'water-pulse'] },
  904: { name: 'Overqwil', types: ['dark', 'poison'], baseStats: { hp: 85, attack: 115, defense: 95, spAtk: 65, spDef: 65, speed: 85 }, moves: ['barb-barrage', 'crunch', 'poison-jab', 'waterfall'] },
  10235: { name: 'Sneasel di Hisui', types: ['fighting', 'poison'], baseStats: { hp: 55, attack: 95, defense: 55, spAtk: 35, spDef: 75, speed: 115 }, moves: ['poison-jab', 'brick-break', 'quick-attack', 'taunt'] },
  903: { name: 'Sneasler', types: ['fighting', 'poison'], baseStats: { hp: 80, attack: 130, defense: 60, spAtk: 40, spDef: 80, speed: 120 }, moves: ['dire-claw', 'close-combat', 'drain-punch', 'swords-dance'] },
  10238: { name: 'Zorua di Hisui', types: ['normal', 'ghost'], baseStats: { hp: 35, attack: 60, defense: 40, spAtk: 85, spDef: 40, speed: 70 }, moves: ['scratch', 'shadow-sneak', 'swift', 'nasty-plot'] },
  10239: { name: 'Zoroark di Hisui', types: ['normal', 'ghost'], baseStats: { hp: 55, attack: 100, defense: 60, spAtk: 125, spDef: 60, speed: 110 }, moves: ['bitter-malice', 'hyper-voice', 'shadow-ball', 'nasty-plot'] },
  10240: { name: 'Braviary di Hisui', types: ['psychic', 'flying'], baseStats: { hp: 110, attack: 83, defense: 70, spAtk: 112, spDef: 70, speed: 65 }, moves: ['esper-wing', 'hurricane', 'psychic', 'roost'] },
  10241: { name: 'Sliggoo di Hisui', types: ['steel', 'dragon'], baseStats: { hp: 58, attack: 75, defense: 83, spAtk: 83, spDef: 113, speed: 40 }, moves: ['dragon-breath', 'iron-head', 'water-pulse', 'acid-armor'] },
  10242: { name: 'Goodra di Hisui', types: ['steel', 'dragon'], baseStats: { hp: 80, attack: 100, defense: 100, spAtk: 110, spDef: 150, speed: 60 }, moves: ['shelter', 'flash-cannon', 'dragon-pulse', 'hydro-pump'] },
  10243: { name: 'Avalugg di Hisui', types: ['ice', 'rock'], baseStats: { hp: 95, attack: 127, defense: 184, spAtk: 34, spDef: 36, speed: 38 }, moves: ['mountain-gale', 'rock-slide', 'avalanche', 'iron-defense'] },

  // Forme Regionali - Paldea
  10253: { name: 'Wooper di Paldea', types: ['poison', 'ground'], baseStats: { hp: 55, attack: 45, defense: 45, spAtk: 25, spDef: 25, speed: 15 }, moves: ['poison-tail', 'mud-shot', 'tackle', 'yawn'] },
  980: { name: 'Clodsire', types: ['poison', 'ground'], baseStats: { hp: 130, attack: 75, defense: 60, spAtk: 45, spDef: 100, speed: 20 }, moves: ['earthquake', 'poison-jab', 'toxic', 'recover'] },
  10250: { name: 'Tauros di Paldea', types: ['fighting'], baseStats: { hp: 75, attack: 110, defense: 105, spAtk: 30, spDef: 70, speed: 100 }, moves: ['raging-bull', 'close-combat', 'iron-head', 'bulk-up'] },
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
