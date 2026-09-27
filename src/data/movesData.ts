import { Move } from '../types/game';

export interface MoveDefinition extends Move {
  englishName: string;
}

export const MOVES_DATABASE: Record<string, MoveDefinition> = {
  // --- NORMAL ATTACKS ---
  'tackle': {
    englishName: 'tackle',
    name: 'Azione',
    type: 'normal',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 35,
    maxPp: 35
  },
  'scratch': {
    englishName: 'scratch',
    name: 'Graffio',
    type: 'normal',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 35,
    maxPp: 35
  },
  'pound': {
    englishName: 'pound',
    name: 'Botta',
    type: 'normal',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 35,
    maxPp: 35
  },
  'quick-attack': {
    englishName: 'quick-attack',
    name: 'Attacco Rapido',
    type: 'normal',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 30,
    maxPp: 30,
    priority: 1
  },
  'cut': {
    englishName: 'cut',
    name: 'Taglio',
    type: 'normal',
    category: 'physical',
    power: 50,
    accuracy: 95,
    pp: 30,
    maxPp: 30
  },
  'fury-attack': {
    englishName: 'fury-attack',
    name: 'Furia',
    type: 'normal',
    category: 'physical',
    power: 25,
    accuracy: 85,
    pp: 20,
    maxPp: 20
  },
  'horn-attack': {
    englishName: 'horn-attack',
    name: 'Incornata',
    type: 'normal',
    category: 'physical',
    power: 65,
    accuracy: 100,
    pp: 25,
    maxPp: 25
  },
  'headbutt': {
    englishName: 'headbutt',
    name: 'Bottintesta',
    type: 'normal',
    category: 'physical',
    power: 70,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    flinchChance: 30
  },
  'slash': {
    englishName: 'slash',
    name: 'Lacerazione',
    type: 'normal',
    category: 'physical',
    power: 70,
    accuracy: 100,
    pp: 20,
    maxPp: 20
  },
  'body-slam': {
    englishName: 'body-slam',
    name: 'Corposcontro',
    type: 'normal',
    category: 'physical',
    power: 85,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    statusEffect: 'paralyzed',
    effectChance: 30
  },
  'take-down': {
    englishName: 'take-down',
    name: 'Riduttore',
    type: 'normal',
    category: 'physical',
    power: 90,
    accuracy: 85,
    pp: 20,
    maxPp: 20,
    recoil: 0.25
  },
  'double-edge': {
    englishName: 'double-edge',
    name: 'Sdoppiatore',
    type: 'normal',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    recoil: 0.33
  },
  'hyper-beam': {
    englishName: 'hyper-beam',
    name: 'Iper-Raggio',
    type: 'normal',
    category: 'special',
    power: 150,
    accuracy: 90,
    pp: 5,
    maxPp: 5
  },
  'struggle': {
    englishName: 'struggle',
    name: 'Scontro',
    type: 'normal',
    category: 'physical',
    power: 50,
    accuracy: 100,
    pp: 1,
    maxPp: 1,
    recoilMaxHp: 0.25
  },

  // --- FIRE ATTACKS ---
  'ember': {
    englishName: 'ember',
    name: 'Braciere',
    type: 'fire',
    category: 'special',
    power: 40,
    accuracy: 100,
    pp: 25,
    maxPp: 25,
    statusEffect: 'burned',
    effectChance: 10
  },
  'flame-wheel': {
    englishName: 'flame-wheel',
    name: 'Ruotafuoco',
    type: 'fire',
    category: 'physical',
    power: 60,
    accuracy: 100,
    pp: 25,
    maxPp: 25,
    statusEffect: 'burned',
    effectChance: 10
  },
  'fire-punch': {
    englishName: 'fire-punch',
    name: 'Fuocopugno',
    type: 'fire',
    category: 'physical',
    power: 75,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    statusEffect: 'burned',
    effectChance: 10
  },
  'flamethrower': {
    englishName: 'flamethrower',
    name: 'Lanciafiamme',
    type: 'fire',
    category: 'special',
    power: 90,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    statusEffect: 'burned',
    effectChance: 10
  },
  'fire-blast': {
    englishName: 'fire-blast',
    name: 'Fuocobomba',
    type: 'fire',
    category: 'special',
    power: 110,
    accuracy: 85,
    pp: 5,
    maxPp: 5,
    statusEffect: 'burned',
    effectChance: 10
  },
  'flare-blitz': {
    englishName: 'flare-blitz',
    name: 'Fuococarica',
    type: 'fire',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    recoil: 0.33,
    statusEffect: 'burned',
    effectChance: 10
  },
  'sacred-fire': {
    englishName: 'sacred-fire',
    name: 'Magifuoco',
    type: 'fire',
    category: 'physical',
    power: 100,
    accuracy: 95,
    pp: 5,
    maxPp: 5,
    statusEffect: 'burned',
    effectChance: 50
  },

  // --- WATER ATTACKS ---
  'water-gun': {
    englishName: 'water-gun',
    name: 'Pistola d\'Acqua',
    type: 'water',
    category: 'special',
    power: 40,
    accuracy: 100,
    pp: 25,
    maxPp: 25
  },
  'bubble': {
    englishName: 'bubble',
    name: 'Bolla',
    type: 'water',
    category: 'special',
    power: 40,
    accuracy: 100,
    pp: 30,
    maxPp: 30,
    stat_changes: [{ change: -1, stat: { name: 'speed' } }],
    effectChance: 10
  },
  'aqua-jet': {
    englishName: 'aqua-jet',
    name: 'Acquagetto',
    type: 'water',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    priority: 1
  },
  'water-pulse': {
    englishName: 'water-pulse',
    name: 'Idropulsar',
    type: 'water',
    category: 'special',
    power: 60,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    confusionChance: 20
  },
  'bubble-beam': {
    englishName: 'bubble-beam',
    name: 'Bollaraggio',
    type: 'water',
    category: 'special',
    power: 65,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    stat_changes: [{ change: -1, stat: { name: 'speed' } }],
    effectChance: 10
  },
  'waterfall': {
    englishName: 'waterfall',
    name: 'Cascata',
    type: 'water',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    flinchChance: 20
  },
  'surf': {
    englishName: 'surf',
    name: 'Surf',
    type: 'water',
    category: 'special',
    power: 90,
    accuracy: 100,
    pp: 15,
    maxPp: 15
  },
  'hydro-pump': {
    englishName: 'hydro-pump',
    name: 'Idropompa',
    type: 'water',
    category: 'special',
    power: 110,
    accuracy: 80,
    pp: 5,
    maxPp: 5
  },
  'dive': {
    englishName: 'dive',
    name: 'Sub',
    type: 'water',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    multiTurn: {
      type: 'charge',
      chargeMessage: 'si è immerso negli abissi!'
    }
  },

  // --- GRASS ATTACKS ---
  'vine-whip': {
    englishName: 'vine-whip',
    name: 'Frustata',
    type: 'grass',
    category: 'physical',
    power: 45,
    accuracy: 100,
    pp: 25,
    maxPp: 25
  },
  'absorb': {
    englishName: 'absorb',
    name: 'Assorbimento',
    type: 'grass',
    category: 'special',
    power: 20,
    accuracy: 100,
    pp: 25,
    maxPp: 25,
    drain: 0.5
  },
  'mega-drain': {
    englishName: 'mega-drain',
    name: 'Megassorbimento',
    type: 'grass',
    category: 'special',
    power: 40,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    drain: 0.5
  },
  'razor-leaf': {
    englishName: 'razor-leaf',
    name: 'Foglielama',
    type: 'grass',
    category: 'physical',
    power: 55,
    accuracy: 95,
    pp: 25,
    maxPp: 25
  },
  'giga-drain': {
    englishName: 'giga-drain',
    name: 'Gigassorbimento',
    type: 'grass',
    category: 'special',
    power: 75,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    drain: 0.5
  },
  'horn-leech': {
    englishName: 'horn-leech',
    name: 'Legnocrno',
    type: 'grass',
    category: 'physical',
    power: 75,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    drain: 0.5
  },
  'energy-ball': {
    englishName: 'energy-ball',
    name: 'Energipalla',
    type: 'grass',
    category: 'special',
    power: 90,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    stat_changes: [{ change: -1, stat: { name: 'special-defense' } }],
    effectChance: 10
  },
  'solar-beam': {
    englishName: 'solar-beam',
    name: 'Solarraggio',
    type: 'grass',
    category: 'special',
    power: 120,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    multiTurn: {
      type: 'charge',
      chargeMessage: 'assorbe la luce solare!'
    }
  },

  // --- ELECTRIC ATTACKS ---
  'thunder-shock': {
    englishName: 'thunder-shock',
    name: 'Tuonoshock',
    type: 'electric',
    category: 'special',
    power: 40,
    accuracy: 100,
    pp: 30,
    maxPp: 30,
    statusEffect: 'paralyzed',
    effectChance: 10
  },
  'spark': {
    englishName: 'spark',
    name: 'Scintilla',
    type: 'electric',
    category: 'physical',
    power: 65,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    statusEffect: 'paralyzed',
    effectChance: 30
  },
  'thunder-punch': {
    englishName: 'thunder-punch',
    name: 'Tuonopugno',
    type: 'electric',
    category: 'physical',
    power: 75,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    statusEffect: 'paralyzed',
    effectChance: 10
  },
  'thunderbolt': {
    englishName: 'thunderbolt',
    name: 'Fulmine',
    type: 'electric',
    category: 'special',
    power: 90,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    statusEffect: 'paralyzed',
    effectChance: 10
  },
  'discharge': {
    englishName: 'discharge',
    name: 'Scarica',
    type: 'electric',
    category: 'special',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    statusEffect: 'paralyzed',
    effectChance: 30
  },
  'thunder': {
    englishName: 'thunder',
    name: 'Tuono',
    type: 'electric',
    category: 'special',
    power: 110,
    accuracy: 70,
    pp: 10,
    maxPp: 10,
    statusEffect: 'paralyzed',
    effectChance: 30
  },
  'parabolic-charge': {
    englishName: 'parabolic-charge',
    name: 'Caricaparabola',
    type: 'electric',
    category: 'special',
    power: 65,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    drain: 0.5
  },

  // --- ICE ATTACKS ---
  'powder-snow': {
    englishName: 'powder-snow',
    name: 'Polneve',
    type: 'ice',
    category: 'special',
    power: 40,
    accuracy: 100,
    pp: 25,
    maxPp: 25,
    statusEffect: 'frozen',
    effectChance: 10
  },
  'ice-shard': {
    englishName: 'ice-shard',
    name: 'Geloscheggia',
    type: 'ice',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 30,
    maxPp: 30,
    priority: 1
  },
  'ice-punch': {
    englishName: 'ice-punch',
    name: 'Gelopugno',
    type: 'ice',
    category: 'physical',
    power: 75,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    statusEffect: 'frozen',
    effectChance: 10
  },
  'ice-beam': {
    englishName: 'ice-beam',
    name: 'Geloraggio',
    type: 'ice',
    category: 'special',
    power: 90,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    statusEffect: 'frozen',
    effectChance: 10
  },
  'blizzard': {
    englishName: 'blizzard',
    name: 'Bora',
    type: 'ice',
    category: 'special',
    power: 110,
    accuracy: 70,
    pp: 5,
    maxPp: 5,
    statusEffect: 'frozen',
    effectChance: 10
  },

  // --- FLYING ATTACKS ---
  'peck': {
    englishName: 'peck',
    name: 'Beccata',
    type: 'flying',
    category: 'physical',
    power: 35,
    accuracy: 100,
    pp: 35,
    maxPp: 35
  },
  'gust': {
    englishName: 'gust',
    name: 'Raffica',
    type: 'flying',
    category: 'special',
    power: 40,
    accuracy: 100,
    pp: 35,
    maxPp: 35
  },
  'wing-attack': {
    englishName: 'wing-attack',
    name: 'Attacco d\'Ala',
    type: 'flying',
    category: 'physical',
    power: 60,
    accuracy: 100,
    pp: 35,
    maxPp: 35
  },
  'air-slash': {
    englishName: 'air-slash',
    name: 'Eterelama',
    type: 'flying',
    category: 'special',
    power: 75,
    accuracy: 95,
    pp: 15,
    maxPp: 15,
    flinchChance: 30
  },
  'drill-peck': {
    englishName: 'drill-peck',
    name: 'Perforbecco',
    type: 'flying',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 20,
    maxPp: 20
  },
  'brave-bird': {
    englishName: 'brave-bird',
    name: 'Baldeali',
    type: 'flying',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    recoil: 0.33
  },
  'oblivion-wing': {
    englishName: 'oblivion-wing',
    name: 'Ali del Fato',
    type: 'flying',
    category: 'special',
    power: 80,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    drain: 0.75
  },
  'fly': {
    englishName: 'fly',
    name: 'Volo',
    type: 'flying',
    category: 'physical',
    power: 90,
    accuracy: 95,
    pp: 15,
    maxPp: 15,
    multiTurn: {
      type: 'charge',
      chargeMessage: 'è volato alto nel cielo!'
    }
  },
  'bounce': {
    englishName: 'bounce',
    name: 'Rimbalzo',
    type: 'flying',
    category: 'physical',
    power: 85,
    accuracy: 85,
    pp: 5,
    maxPp: 5,
    statusEffect: 'paralyzed',
    effectChance: 30,
    multiTurn: {
      type: 'charge',
      chargeMessage: 'rimbalza in alto nel cielo!'
    }
  },

  // --- PSYCHIC ATTACKS ---
  'confusion': {
    englishName: 'confusion',
    name: 'Confusione',
    type: 'psychic',
    category: 'special',
    power: 50,
    accuracy: 100,
    pp: 25,
    maxPp: 25,
    confusionChance: 10
  },
  'psybeam': {
    englishName: 'psybeam',
    name: 'Psicoraggio',
    type: 'psychic',
    category: 'special',
    power: 65,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    confusionChance: 10
  },
  'psychic': {
    englishName: 'psychic',
    name: 'Psichico',
    type: 'psychic',
    category: 'special',
    power: 90,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    stat_changes: [{ change: -1, stat: { name: 'special-defense' } }],
    effectChance: 10
  },

  // --- DARK ATTACKS ---
  'bite': {
    englishName: 'bite',
    name: 'Morso',
    type: 'dark',
    category: 'physical',
    power: 60,
    accuracy: 100,
    pp: 25,
    maxPp: 25,
    flinchChance: 30
  },
  'crunch': {
    englishName: 'crunch',
    name: 'Sgranocchio',
    type: 'dark',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    stat_changes: [{ change: -1, stat: { name: 'defense' } }],
    effectChance: 20
  },
  'dark-pulse': {
    englishName: 'dark-pulse',
    name: 'Neropulsar',
    type: 'dark',
    category: 'special',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    flinchChance: 20
  },

  // --- BUG ATTACKS ---
  'leech-life': {
    englishName: 'leech-life',
    name: 'Sanguisuga',
    type: 'bug',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 25,
    maxPp: 25,
    drain: 0.5
  },
  'bug-bite': {
    englishName: 'bug-bite',
    name: 'Coleomorso',
    type: 'bug',
    category: 'physical',
    power: 60,
    accuracy: 100,
    pp: 20,
    maxPp: 20
  },
  'x-scissor': {
    englishName: 'x-scissor',
    name: 'Forbice X',
    type: 'bug',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15
  },

  // --- POISON ATTACKS ---
  'poison-sting': {
    englishName: 'poison-sting',
    name: 'Velenospina',
    type: 'poison',
    category: 'physical',
    power: 30,
    accuracy: 100,
    pp: 35,
    maxPp: 35,
    statusEffect: 'poisoned',
    effectChance: 30
  },
  'sludge': {
    englishName: 'sludge',
    name: 'Fango',
    type: 'poison',
    category: 'special',
    power: 65,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    statusEffect: 'poisoned',
    effectChance: 30
  },
  'sludge-bomb': {
    englishName: 'sludge-bomb',
    name: 'Fangobomba',
    type: 'poison',
    category: 'special',
    power: 90,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    statusEffect: 'poisoned',
    effectChance: 30
  },

  // --- GROUND & ROCK ATTACKS ---
  'mud-slap': {
    englishName: 'mud-slap',
    name: 'Fangosberla',
    type: 'ground',
    category: 'special',
    power: 20,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    stat_changes: [{ change: -1, stat: { name: 'accuracy' } }],
    effectChance: 100
  },
  'earthquake': {
    englishName: 'earthquake',
    name: 'Terremoto',
    type: 'ground',
    category: 'physical',
    power: 100,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'dig': {
    englishName: 'dig',
    name: 'Fossa',
    type: 'ground',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    multiTurn: {
      type: 'charge',
      chargeMessage: 'si è scavato una fossa sottoterra!'
    }
  },
  'rock-throw': {
    englishName: 'rock-throw',
    name: 'Sassata',
    type: 'rock',
    category: 'physical',
    power: 50,
    accuracy: 90,
    pp: 15,
    maxPp: 15
  },
  'rock-slide': {
    englishName: 'rock-slide',
    name: 'Frana',
    type: 'rock',
    category: 'physical',
    power: 75,
    accuracy: 90,
    pp: 10,
    maxPp: 10,
    flinchChance: 30
  },

  // --- FIGHTING ATTACKS ---
  'double-kick': {
    englishName: 'double-kick',
    name: 'Doppiocalcio',
    type: 'fighting',
    category: 'physical',
    power: 60,
    accuracy: 100,
    pp: 30,
    maxPp: 30
  },
  'mach-punch': {
    englishName: 'mach-punch',
    name: 'Pugnorapido',
    type: 'fighting',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 30,
    maxPp: 30,
    priority: 1
  },
  'brick-break': {
    englishName: 'brick-break',
    name: 'Breccia',
    type: 'fighting',
    category: 'physical',
    power: 75,
    accuracy: 100,
    pp: 15,
    maxPp: 15
  },
  'drain-punch': {
    englishName: 'drain-punch',
    name: 'Assorbipugno',
    type: 'fighting',
    category: 'physical',
    power: 75,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    drain: 0.5
  },
  'draining-kiss': {
    englishName: 'draining-kiss',
    name: 'Bacio Drenante',
    type: 'fairy',
    category: 'special',
    power: 50,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    drain: 0.75
  },

  // --- GHOST & DRAGON & STEEL ATTACKS ---
  'shadow-ball': {
    englishName: 'shadow-ball',
    name: 'Palla Ombra',
    type: 'ghost',
    category: 'special',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    stat_changes: [{ change: -1, stat: { name: 'special-defense' } }],
    effectChance: 20
  },
  'dragon-breath': {
    englishName: 'dragon-breath',
    name: 'Dragospiro',
    type: 'dragon',
    category: 'special',
    power: 60,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    statusEffect: 'paralyzed',
    effectChance: 30
  },
  'dragon-claw': {
    englishName: 'dragon-claw',
    name: 'Dragartigli',
    type: 'dragon',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15
  },
  'metal-claw': {
    englishName: 'metal-claw',
    name: 'Ferrartigli',
    type: 'steel',
    category: 'physical',
    power: 50,
    accuracy: 95,
    pp: 35,
    maxPp: 35,
    stat_changes: [{ change: 1, stat: { name: 'attack' } }],
    effectChance: 10
  },
  'iron-head': {
    englishName: 'iron-head',
    name: 'Ferrotesta',
    type: 'steel',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    flinchChance: 30
  },

  // --- STATUS MOVES (category: 'status', power: 0) ---
  'growl': {
    englishName: 'growl',
    name: 'Ruggito',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 40,
    maxPp: 40,
    target: 'selected-pokemon',
    stat_changes: [{ change: -1, stat: { name: 'attack' } }]
  },
  'tail-whip': {
    englishName: 'tail-whip',
    name: 'Colpo di Coda',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 30,
    maxPp: 30,
    target: 'selected-pokemon',
    stat_changes: [{ change: -1, stat: { name: 'defense' } }]
  },
  'leer': {
    englishName: 'leer',
    name: 'Fulmisguardo',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 30,
    maxPp: 30,
    target: 'selected-pokemon',
    stat_changes: [{ change: -1, stat: { name: 'defense' } }]
  },
  'string-shot': {
    englishName: 'string-shot',
    name: 'Millebave',
    type: 'bug',
    category: 'status',
    power: 0,
    accuracy: 95,
    pp: 40,
    maxPp: 40,
    target: 'selected-pokemon',
    stat_changes: [{ change: -1, stat: { name: 'speed' } }]
  },
  'sand-attack': {
    englishName: 'sand-attack',
    name: 'Turbosabbia',
    type: 'ground',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    target: 'selected-pokemon',
    stat_changes: [{ change: -1, stat: { name: 'accuracy' } }]
  },
  'smokescreen': {
    englishName: 'smokescreen',
    name: 'Muro di Fumo',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'selected-pokemon',
    stat_changes: [{ change: -1, stat: { name: 'accuracy' } }]
  },
  'screech': {
    englishName: 'screech',
    name: 'Stridio',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 85,
    pp: 40,
    maxPp: 40,
    target: 'selected-pokemon',
    stat_changes: [{ change: -2, stat: { name: 'defense' } }]
  },
  'scary-face': {
    englishName: 'scary-face',
    name: 'Visotruce',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    target: 'selected-pokemon',
    stat_changes: [{ change: -2, stat: { name: 'speed' } }]
  },
  'harden': {
    englishName: 'harden',
    name: 'Rafforzamento',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 30,
    maxPp: 30,
    target: 'user',
    stat_changes: [{ change: 1, stat: { name: 'defense' } }]
  },
  'withdraw': {
    englishName: 'withdraw',
    name: 'Rafforzatore',
    type: 'water',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 40,
    maxPp: 40,
    target: 'user',
    stat_changes: [{ change: 1, stat: { name: 'defense' } }]
  },
  'defense-curl': {
    englishName: 'defense-curl',
    name: 'Ricciolscudo',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 40,
    maxPp: 40,
    target: 'user',
    stat_changes: [{ change: 1, stat: { name: 'defense' } }]
  },
  'swords-dance': {
    englishName: 'swords-dance',
    name: 'Danzaspada',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'user',
    stat_changes: [{ change: 2, stat: { name: 'attack' } }]
  },
  'dragon-dance': {
    englishName: 'dragon-dance',
    name: 'Dragodanza',
    type: 'dragon',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'user',
    stat_changes: [
      { change: 1, stat: { name: 'attack' } },
      { change: 1, stat: { name: 'speed' } }
    ]
  },
  'agility': {
    englishName: 'agility',
    name: 'Agilità',
    type: 'psychic',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 30,
    maxPp: 30,
    target: 'user',
    stat_changes: [{ change: 2, stat: { name: 'speed' } }]
  },
  'growth': {
    englishName: 'growth',
    name: 'Crescita',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'user',
    stat_changes: [
      { change: 1, stat: { name: 'attack' } },
      { change: 1, stat: { name: 'special-attack' } }
    ]
  },
  'iron-defense': {
    englishName: 'iron-defense',
    name: 'Ferroscudo',
    type: 'steel',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    target: 'user',
    stat_changes: [{ change: 2, stat: { name: 'defense' } }]
  },
  'thunder-wave': {
    englishName: 'thunder-wave',
    name: 'Tuononda',
    type: 'electric',
    category: 'status',
    power: 0,
    accuracy: 90,
    pp: 20,
    maxPp: 20,
    target: 'selected-pokemon',
    statusEffect: 'paralyzed',
    effectChance: 100
  },
  'hypnosis': {
    englishName: 'hypnosis',
    name: 'Ipnosi',
    type: 'psychic',
    category: 'status',
    power: 0,
    accuracy: 60,
    pp: 20,
    maxPp: 20,
    target: 'selected-pokemon',
    statusEffect: 'sleep',
    effectChance: 100
  },
  'sing': {
    englishName: 'sing',
    name: 'Canto',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 55,
    pp: 15,
    maxPp: 15,
    target: 'selected-pokemon',
    statusEffect: 'sleep',
    effectChance: 100
  },
  'supersonic': {
    englishName: 'supersonic',
    name: 'Supersuono',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 55,
    pp: 20,
    maxPp: 20,
    target: 'selected-pokemon',
    confusionChance: 100
  },
  'confuse-ray': {
    englishName: 'confuse-ray',
    name: 'Stordiraggio',
    type: 'ghost',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    target: 'selected-pokemon',
    confusionChance: 100
  },
  'recover': {
    englishName: 'recover',
    name: 'Ripresa',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    target: 'user',
    healing: 0.5
  },
  'splash': {
    englishName: 'splash',
    name: 'Splash',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 40,
    maxPp: 40,
    target: 'user'
  },
  'protect': {
    englishName: 'protect',
    name: 'Protezione',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    priority: 4,
    target: 'user'
  },
  'detect': {
    englishName: 'detect',
    name: 'Individuazione',
    type: 'fighting',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 5,
    maxPp: 5,
    priority: 4,
    target: 'user'
  },
  'toxic': {
    englishName: 'toxic',
    name: 'Tossina',
    type: 'poison',
    category: 'status',
    power: 0,
    accuracy: 90,
    pp: 10,
    maxPp: 10,
    target: 'selected-pokemon',
    statusEffect: 'badly-poisoned',
    effectChance: 100
  },
  'will-o-wisp': {
    englishName: 'will-o-wisp',
    name: 'Fuocofatuo',
    type: 'fire',
    category: 'status',
    power: 0,
    accuracy: 85,
    pp: 15,
    maxPp: 15,
    target: 'selected-pokemon',
    statusEffect: 'burned',
    effectChance: 100
  },
  'calm-mind': {
    englishName: 'calm-mind',
    name: 'Calmamente',
    type: 'psychic',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'user',
    stat_changes: [{ change: 1, stat: { name: 'special-attack' } }, { change: 1, stat: { name: 'special-defense' } }]
  },
  'bulk-up': {
    englishName: 'bulk-up',
    name: 'Granfisico',
    type: 'fighting',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'user',
    stat_changes: [{ change: 1, stat: { name: 'attack' } }, { change: 1, stat: { name: 'defense' } }]
  },
  'nasty-plot': {
    englishName: 'nasty-plot',
    name: 'Congiura',
    type: 'dark',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'user',
    stat_changes: [{ change: 2, stat: { name: 'special-attack' } }]
  },
  'stealth-rock': {
    englishName: 'stealth-rock',
    name: 'Levitoroccia',
    type: 'rock',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'selected-pokemon'
  },
  'spikes': {
    englishName: 'spikes',
    name: 'Punte',
    type: 'ground',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'selected-pokemon'
  },
  'toxic-spikes': {
    englishName: 'toxic-spikes',
    name: 'Fielepunte',
    type: 'poison',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'selected-pokemon'
  },
  'sticky-web': {
    englishName: 'sticky-web',
    name: 'Ragnatela',
    type: 'bug',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'selected-pokemon'
  },
  'rapid-spin': {
    englishName: 'rapid-spin',
    name: 'Rapidsguardo',
    type: 'normal',
    category: 'physical',
    power: 50,
    accuracy: 100,
    pp: 40,
    maxPp: 40
  },
  'defog': {
    englishName: 'defog',
    name: 'Scaccianebbia',
    type: 'flying',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    target: 'selected-pokemon'
  },
  'stone-edge': {
    englishName: 'stone-edge',
    name: 'Pietrataglio',
    type: 'rock',
    category: 'physical',
    power: 100,
    accuracy: 80,
    pp: 5,
    maxPp: 5
  },
  'close-combat': {
    englishName: 'close-combat',
    name: 'Zuffa',
    type: 'fighting',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 5,
    maxPp: 5,
    effectChance: 100,
    stat_changes_target: 'user',
    stat_changes: [{ change: -1, stat: { name: 'defense' } }, { change: -1, stat: { name: 'special-defense' } }]
  },
  'outrage': {
    englishName: 'outrage',
    name: 'Oltraggio',
    type: 'dragon',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'draco-meteor': {
    englishName: 'draco-meteor',
    name: 'Dragometeora',
    type: 'dragon',
    category: 'special',
    power: 130,
    accuracy: 90,
    pp: 5,
    maxPp: 5,
    stat_changes_target: 'user',
    stat_changes: [{ change: -2, stat: { name: 'special-attack' } }]
  },
  'dragon-pulse': {
    englishName: 'dragon-pulse',
    name: 'Dragopulsar',
    type: 'dragon',
    category: 'special',
    power: 85,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'moonblast': {
    englishName: 'moonblast',
    name: 'Forza Lunare',
    type: 'fairy',
    category: 'special',
    power: 95,
    accuracy: 100,
    pp: 15,
    maxPp: 15
  },
  'dazzling-gleam': {
    englishName: 'dazzling-gleam',
    name: 'Magibrillo',
    type: 'fairy',
    category: 'special',
    power: 80,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'play-rough': {
    englishName: 'play-rough',
    name: 'Carineria',
    type: 'fairy',
    category: 'physical',
    power: 90,
    accuracy: 90,
    pp: 10,
    maxPp: 10
  },
  'scald': {
    englishName: 'scald',
    name: 'Idrovampata',
    type: 'water',
    category: 'special',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    statusEffect: 'burned',
    effectChance: 30
  },
  'liquidation': {
    englishName: 'liquidation',
    name: 'Liquidazione',
    type: 'water',
    category: 'physical',
    power: 85,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'leaf-blade': {
    englishName: 'leaf-blade',
    name: 'Lamafoglia',
    type: 'grass',
    category: 'physical',
    power: 90,
    accuracy: 100,
    pp: 15,
    maxPp: 15
  },
  'seed-bomb': {
    englishName: 'seed-bomb',
    name: 'Semebomba',
    type: 'grass',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15
  },
  'wild-charge': {
    englishName: 'wild-charge',
    name: 'Sprizzalampo',
    type: 'electric',
    category: 'physical',
    power: 90,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    recoil: 0.25
  },
  'focus-blast': {
    englishName: 'focus-blast',
    name: 'Focalcolpo',
    type: 'fighting',
    category: 'special',
    power: 120,
    accuracy: 70,
    pp: 5,
    maxPp: 5
  },
  'aura-sphere': {
    englishName: 'aura-sphere',
    name: 'Forzasfera',
    type: 'fighting',
    category: 'special',
    power: 80,
    accuracy: 100,
    pp: 20,
    maxPp: 20
  },
  'flash-cannon': {
    englishName: 'flash-cannon',
    name: 'Cannonlampo',
    type: 'steel',
    category: 'special',
    power: 80,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'iron-tail': {
    englishName: 'iron-tail',
    name: 'Codadacciaio',
    type: 'steel',
    category: 'physical',
    power: 100,
    accuracy: 75,
    pp: 15,
    maxPp: 15
  },
  'zen-headbutt': {
    englishName: 'zen-headbutt',
    name: 'Cozzata Zen',
    type: 'psychic',
    category: 'physical',
    power: 80,
    accuracy: 90,
    pp: 15,
    maxPp: 15,
    flinchChance: 20
  },
  'overheat': {
    englishName: 'overheat',
    name: 'Vampata',
    type: 'fire',
    category: 'special',
    power: 130,
    accuracy: 90,
    pp: 5,
    maxPp: 5,
    stat_changes_target: 'user',
    stat_changes: [{ change: -2, stat: { name: 'special-attack' } }]
  },
  'venoshock': {
    englishName: 'venoshock',
    name: 'Velenoshock',
    type: 'poison',
    category: 'special',
    power: 65,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'bug-buzz': {
    englishName: 'bug-buzz',
    name: 'Ronzio',
    type: 'bug',
    category: 'special',
    power: 90,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'shadow-sneak': {
    englishName: 'shadow-sneak',
    name: 'Furtivombra',
    type: 'ghost',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 30,
    maxPp: 30,
    priority: 1
  },
  'shadow-claw': {
    englishName: 'shadow-claw',
    name: 'Ombragartiglio',
    type: 'ghost',
    category: 'physical',
    power: 70,
    accuracy: 100,
    pp: 15,
    maxPp: 15
  },
  'giga-impact': {
    englishName: 'giga-impact',
    name: 'Giga Impatto',
    type: 'normal',
    category: 'physical',
    power: 150,
    accuracy: 90,
    pp: 5,
    maxPp: 5,
    multiTurn: { type: 'recharge' }
  },
  'tri-attack': {
    englishName: 'tri-attack',
    name: 'Triplo Attacco',
    type: 'normal',
    category: 'special',
    power: 80,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'facade': {
    englishName: 'facade',
    name: 'Facciata',
    type: 'normal',
    category: 'physical',
    power: 70,
    accuracy: 100,
    pp: 20,
    maxPp: 20
  },
  'substitute': {
    englishName: 'substitute',
    name: 'Sostituto',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    target: 'user'
  },
  'rest': {
    englishName: 'rest',
    name: 'Riposo',
    type: 'psychic',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    target: 'user',
    healing: 1.0,
    statusEffect: 'sleep'
  },
  'roost': {
    englishName: 'roost',
    name: 'Trespolo',
    type: 'flying',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    target: 'user',
    healing: 0.5
  },
  'synthesis': {
    englishName: 'synthesis',
    name: 'Sintesi',
    type: 'grass',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 5,
    maxPp: 5,
    target: 'user',
    healing: 0.5
  },
  'earth-power': {
    englishName: 'earth-power',
    name: 'Geoforza',
    type: 'ground',
    category: 'special',
    power: 90,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'rock-tomb': {
    englishName: 'rock-tomb',
    name: 'Rocciatomba',
    type: 'rock',
    category: 'physical',
    power: 60,
    accuracy: 95,
    pp: 15,
    maxPp: 15,
    stat_changes: [{ change: -1, stat: { name: 'speed' } }]
  },
  'bulldoze': {
    englishName: 'bulldoze',
    name: 'Battiterra',
    type: 'ground',
    category: 'physical',
    power: 60,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    stat_changes: [{ change: -1, stat: { name: 'speed' } }]
  },
  'extreme-speed': {
    englishName: 'extreme-speed',
    name: 'Extrarapido',
    type: 'normal',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 5,
    maxPp: 5,
    priority: 2
  },
  'seismic-toss': {
    englishName: 'seismic-toss',
    name: 'Movim. Sismico',
    type: 'fighting',
    category: 'physical',
    power: 45,
    accuracy: 100,
    pp: 20,
    maxPp: 20
  },
  'strength': {
    englishName: 'strength',
    name: 'Forza',
    type: 'normal',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15
  },
  'rock-smash': {
    englishName: 'rock-smash',
    name: 'Spaccaroccia',
    type: 'fighting',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    stat_changes: [{ change: -1, stat: { name: 'defense' } }]
  },
  'counter': {
    englishName: 'counter',
    name: 'Contromossa',
    type: 'fighting',
    category: 'physical',
    power: 50,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    priority: -1
  },
  'submission': {
    englishName: 'submission',
    name: 'Sottomissione',
    type: 'fighting',
    category: 'physical',
    power: 80,
    accuracy: 80,
    pp: 20,
    maxPp: 20,
    recoil: 0.25
  },
  'mega-punch': {
    englishName: 'mega-punch',
    name: 'Megapugno',
    type: 'normal',
    category: 'physical',
    power: 80,
    accuracy: 85,
    pp: 20,
    maxPp: 20
  },
  'mega-kick': {
    englishName: 'mega-kick',
    name: 'Megacalcio',
    type: 'normal',
    category: 'physical',
    power: 120,
    accuracy: 75,
    pp: 5,
    maxPp: 5
  },
  'fire-spin': {
    englishName: 'fire-spin',
    name: 'Turbofuoco',
    type: 'fire',
    category: 'special',
    power: 35,
    accuracy: 85,
    pp: 15,
    maxPp: 15
  },
  'whirlpool': {
    englishName: 'whirlpool',
    name: 'Mulinello',
    type: 'water',
    category: 'special',
    power: 35,
    accuracy: 85,
    pp: 15,
    maxPp: 15
  },
  'rock-climb': {
    englishName: 'rock-climb',
    name: 'Scalata',
    type: 'normal',
    category: 'physical',
    power: 90,
    accuracy: 85,
    pp: 20,
    maxPp: 20
  },
  'flash': {
    englishName: 'flash',
    name: 'Flash',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'selected-pokemon',
    stat_changes: [{ change: -1, stat: { name: 'accuracy' } }]
  },
  'metronome': {
    englishName: 'metronome',
    name: 'Metronomo',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    target: 'user'
  },
  'swift': {
    englishName: 'swift',
    name: 'Cometone',
    type: 'normal',
    category: 'special',
    power: 60,
    accuracy: 100,
    pp: 20,
    maxPp: 20
  },
  'rollout': {
    englishName: 'rollout',
    name: 'Rotolamento',
    type: 'rock',
    category: 'physical',
    power: 30,
    accuracy: 90,
    pp: 20,
    maxPp: 20
  },
  'fury-cutter': {
    englishName: 'fury-cutter',
    name: 'Tagliofuria',
    type: 'bug',
    category: 'physical',
    power: 40,
    accuracy: 95,
    pp: 20,
    maxPp: 20
  },
  'low-kick': {
    englishName: 'low-kick',
    name: 'Colpo Basso',
    type: 'fighting',
    category: 'physical',
    power: 50,
    accuracy: 100,
    pp: 20,
    maxPp: 20
  },
  'superpower': {
    englishName: 'superpower',
    name: 'Troppoforte',
    type: 'fighting',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 5,
    maxPp: 5,
    stat_changes_target: 'user',
    stat_changes: [{ change: -1, stat: { name: 'attack' } }, { change: -1, stat: { name: 'defense' } }]
  },
  'hammer-arm': {
    englishName: 'hammer-arm',
    name: 'Mazzazucca',
    type: 'fighting',
    category: 'physical',
    power: 100,
    accuracy: 90,
    pp: 10,
    maxPp: 10,
    stat_changes_target: 'user',
    stat_changes: [{ change: -1, stat: { name: 'speed' } }]
  },
  'focus-punch': {
    englishName: 'focus-punch',
    name: 'Centropugno',
    type: 'fighting',
    category: 'physical',
    power: 150,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    priority: -3
  },
  'rain-dance': {
    englishName: 'rain-dance',
    name: 'Piovodanza',
    type: 'water',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 5,
    maxPp: 5,
    target: 'user'
  },
  'sunny-day': {
    englishName: 'sunny-day',
    name: 'Giornodisole',
    type: 'fire',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 5,
    maxPp: 5,
    target: 'user'
  },
  'sandstorm': {
    englishName: 'sandstorm',
    name: 'Terrempesta',
    type: 'rock',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    target: 'user'
  },
  'phantom-force': {
    englishName: 'phantom-force',
    name: 'Spettrotuffo',
    type: 'ghost',
    category: 'physical',
    power: 90,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'dream-eater': {
    englishName: 'dream-eater',
    name: 'Mangiasogni',
    type: 'psychic',
    category: 'special',
    power: 100,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    drain: 0.5
  },
  'hex': {
    englishName: 'hex',
    name: 'Sciagura',
    type: 'ghost',
    category: 'special',
    power: 65,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'poltergeist': {
    englishName: 'poltergeist',
    name: 'Poltergeist',
    type: 'ghost',
    category: 'physical',
    power: 110,
    accuracy: 90,
    pp: 5,
    maxPp: 5
  },
  'spirit-shackle': {
    englishName: 'spirit-shackle',
    name: 'Cucitura d\'Ombra',
    type: 'ghost',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'spectral-thief': {
    englishName: 'spectral-thief',
    name: 'Ombratuffo',
    type: 'ghost',
    category: 'physical',
    power: 90,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'meteor-mash': {
    englishName: 'meteor-mash',
    name: 'Meteorpugno',
    type: 'steel',
    category: 'physical',
    power: 90,
    accuracy: 90,
    pp: 10,
    maxPp: 10,
    stat_changes_target: 'user',
    stat_changes: [{ change: 1, stat: { name: 'attack' } }],
    effectChance: 20
  },
  'heavy-slam': {
    englishName: 'heavy-slam',
    name: 'Pesobomba',
    type: 'steel',
    category: 'physical',
    power: 100,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'head-smash': {
    englishName: 'head-smash',
    name: 'Zuccata',
    type: 'rock',
    category: 'physical',
    power: 150,
    accuracy: 80,
    pp: 5,
    maxPp: 5,
    recoil: 0.5
  },
  'rock-wrecker': {
    englishName: 'rock-wrecker',
    name: 'Devastoroccia',
    type: 'rock',
    category: 'physical',
    power: 150,
    accuracy: 90,
    pp: 5,
    maxPp: 5,
    multiTurn: { type: 'recharge' }
  },
  'dynamic-punch': {
    englishName: 'dynamic-punch',
    name: 'Dinamipugno',
    type: 'fighting',
    category: 'physical',
    power: 100,
    accuracy: 50,
    pp: 5,
    maxPp: 5,
    confusionChance: 100
  },
  'bullet-punch': {
    englishName: 'bullet-punch',
    name: 'Pugnoscarica',
    type: 'steel',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 30,
    maxPp: 30,
    priority: 1
  },
  'volt-tackle': {
    englishName: 'volt-tackle',
    name: 'Locomovolt',
    type: 'electric',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    recoil: 0.33,
    statusEffect: 'paralyzed',
    effectChance: 10
  },
  'wood-hammer': {
    englishName: 'wood-hammer',
    name: 'Mazzabrutta',
    type: 'grass',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    recoil: 0.33
  },
  'multi-attack': {
    englishName: 'multi-attack',
    name: 'Multiattacco',
    type: 'normal',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'psystrike': {
    englishName: 'psystrike',
    name: 'Psicostroncatura',
    type: 'psychic',
    category: 'special',
    power: 100,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'shadow-force': {
    englishName: 'shadow-force',
    name: 'Oscurotuffo',
    type: 'ghost',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 5,
    maxPp: 5,
    multiTurn: { type: 'charge', chargeMessage: 'scompare nelle ombre!' }
  },
  'spacial-rend': {
    englishName: 'spacial-rend',
    name: 'Fendispazio',
    type: 'dragon',
    category: 'special',
    power: 100,
    accuracy: 95,
    pp: 5,
    maxPp: 5
  },
  'magma-storm': {
    englishName: 'magma-storm',
    name: 'Magmastroncatura',
    type: 'fire',
    category: 'special',
    power: 100,
    accuracy: 75,
    pp: 5,
    maxPp: 5
  },
  'fusion-flare': {
    englishName: 'fusion-flare',
    name: 'Incrofiamma',
    type: 'fire',
    category: 'special',
    power: 100,
    accuracy: 100,
    pp: 5,
    maxPp: 5
  },
  'fusion-bolt': {
    englishName: 'fusion-bolt',
    name: 'Lucesiluro',
    type: 'electric',
    category: 'physical',
    power: 100,
    accuracy: 100,
    pp: 5,
    maxPp: 5
  },
  'night-daze': {
    englishName: 'night-daze',
    name: 'UrtoOscuro',
    type: 'dark',
    category: 'special',
    power: 85,
    accuracy: 95,
    pp: 10,
    maxPp: 10,
    stat_changes: [{ change: -1, stat: { name: 'accuracy' } }],
    effectChance: 40
  },
  'headlong-rush': {
    englishName: 'headlong-rush',
    name: 'Controfuoco',
    type: 'ground',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 5,
    maxPp: 5,
    stat_changes_target: 'user',
    stat_changes: [{ change: -1, stat: { name: 'defense' } }, { change: -1, stat: { name: 'special-defense' } }]
  },
  'glaive-rush': {
    englishName: 'glaive-rush',
    name: 'Sciabola di Ghiaccio',
    type: 'dragon',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 5,
    maxPp: 5
  },
  'flower-trick': {
    englishName: 'flower-trick',
    name: 'Prestigiatore',
    type: 'grass',
    category: 'physical',
    power: 70,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'revival-blessing': {
    englishName: 'revival-blessing',
    name: 'Preghiera',
    type: 'normal',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 1,
    maxPp: 1,
    target: 'user'
  },
  'kings-shield': {
    englishName: 'kings-shield',
    name: 'Spada Reale',
    type: 'steel',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    target: 'user'
  },
  'sacred-sword': {
    englishName: 'sacred-sword',
    name: 'Sacraforza',
    type: 'fighting',
    category: 'physical',
    power: 90,
    accuracy: 100,
    pp: 15,
    maxPp: 15
  },
  'muddy-water': {
    englishName: 'muddy-water',
    name: 'Girofango',
    type: 'water',
    category: 'special',
    power: 90,
    accuracy: 85,
    pp: 10,
    maxPp: 10,
    stat_changes: [{ change: -1, stat: { name: 'accuracy' } }],
    effectChance: 30
  },
  'return': {
    englishName: 'return',
    name: 'Ritorno',
    type: 'normal',
    category: 'physical',
    power: 102,
    accuracy: 100,
    pp: 20,
    maxPp: 20
  },
  'fury-swipes': {
    englishName: 'fury-swipes',
    name: 'Sfuriata',
    type: 'normal',
    category: 'physical',
    power: 18,
    accuracy: 80,
    pp: 15,
    maxPp: 15,
    multiTurn: { type: 'multi-hit', minHits: 2, maxHits: 5 }
  },
  'electroweb': {
    englishName: 'electroweb',
    name: 'Elettrotela',
    type: 'electric',
    category: 'special',
    power: 55,
    accuracy: 95,
    pp: 15,
    maxPp: 15,
    stat_changes: [{ change: -1, stat: { name: 'speed' } }],
    effectChance: 100
  },
  'sludge-wave': {
    englishName: 'sludge-wave',
    name: 'Ondafango',
    type: 'poison',
    category: 'special',
    power: 95,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    statusEffect: 'poisoned',
    effectChance: 10
  },
  'poison-jab': {
    englishName: 'poison-jab',
    name: 'Velenocolpo',
    type: 'poison',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    statusEffect: 'poisoned',
    effectChance: 30
  },
  'crabhammer': {
    englishName: 'crabhammer',
    name: 'Martellata',
    type: 'water',
    category: 'physical',
    power: 100,
    accuracy: 90,
    pp: 10,
    maxPp: 10
  },
  'knock-off': {
    englishName: 'knock-off',
    name: 'Privazione',
    type: 'dark',
    category: 'physical',
    power: 65,
    accuracy: 100,
    pp: 20,
    maxPp: 20
  },
  'heat-wave': {
    englishName: 'heat-wave',
    name: 'Onda Calda',
    type: 'fire',
    category: 'special',
    power: 95,
    accuracy: 90,
    pp: 10,
    maxPp: 10,
    statusEffect: 'burned',
    effectChance: 10
  },
  'electro-ball': {
    englishName: 'electro-ball',
    name: 'Elettropalla',
    type: 'electric',
    category: 'special',
    power: 80,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'night-slash': {
    englishName: 'night-slash',
    name: 'Nottesferza',
    type: 'dark',
    category: 'physical',
    power: 70,
    accuracy: 100,
    pp: 15,
    maxPp: 15
  },
  'megahorn': {
    englishName: 'megahorn',
    name: 'Megacorno',
    type: 'bug',
    category: 'physical',
    power: 120,
    accuracy: 85,
    pp: 10,
    maxPp: 10
  },
  'ingrain': {
    englishName: 'ingrain',
    name: 'Radicamento',
    type: 'grass',
    category: 'status',
    power: 0,
    accuracy: 100,
    pp: 20,
    maxPp: 20,
    target: 'user',
    healing: 0.1
  },
  'burning-jealousy': {
    englishName: 'burning-jealousy',
    name: 'Rabbia Bruciante',
    type: 'fire',
    category: 'special',
    power: 70,
    accuracy: 100,
    pp: 5,
    maxPp: 5,
    statusEffect: 'burned',
    effectChance: 100
  },
  'raging-fury': {
    englishName: 'raging-fury',
    name: 'Ira Furente',
    type: 'fire',
    category: 'physical',
    power: 120,
    accuracy: 100,
    pp: 10,
    maxPp: 10
  },
  'lava-plume': {
    englishName: 'lava-plume',
    name: 'Lavasbuffo',
    type: 'fire',
    category: 'special',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    statusEffect: 'burned',
    effectChance: 30
  },
  'fire-lash': {
    englishName: 'fire-lash',
    name: 'Fuocofustagno',
    type: 'fire',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    stat_changes: [{ change: -1, stat: { name: 'defense' } }],
    effectChance: 100
  },
  'bitter-blade': {
    englishName: 'bitter-blade',
    name: 'Lama del Rimorso',
    type: 'fire',
    category: 'physical',
    power: 90,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    drain: 0.5
  },
  'armor-cannon': {
    englishName: 'armor-cannon',
    name: 'Corazzaurto',
    type: 'fire',
    category: 'special',
    power: 120,
    accuracy: 100,
    pp: 5,
    maxPp: 5,
    stat_changes_target: 'user',
    stat_changes: [{ change: -1, stat: { name: 'defense' } }, { change: -1, stat: { name: 'special-defense' } }],
    effectChance: 100
  },
  'torch-song': {
    englishName: 'torch-song',
    name: 'Cantoardente',
    type: 'fire',
    category: 'special',
    power: 80,
    accuracy: 100,
    pp: 10,
    maxPp: 10,
    stat_changes_target: 'user',
    stat_changes: [{ change: 1, stat: { name: 'special-attack' } }],
    effectChance: 100
  }
};

/**
 * Normalizes a move name for lookup in the database.
 */
export function normalizeMoveKey(name: string): string {
  return (name || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[\s_]+/g, '-');
}

const ALIAS_MAP: Record<string, string> = {
  'volo': 'fly',
  'fly': 'fly',
  'zuffa': 'close-combat',
  'close-combat': 'close-combat',
  'locomovolt': 'volt-tackle',
  'volt-tackle': 'volt-tackle',
  'coda-di-ferro': 'iron-tail',
  'codadacciaio': 'iron-tail',
  'iron-tail': 'iron-tail',
  'cozzata-furia': 'fury-attack',
  'furia': 'fury-attack',
  'sfuriata': 'fury-swipes',
  'fuococarica': 'flare-blitz',
  'flare-blitz': 'flare-blitz',
  'sgranocchio': 'crunch',
  'crunch': 'crunch',
  'extrarapido': 'extreme-speed',
  'extreme-speed': 'extreme-speed',
  'terremoto': 'earthquake',
  'earthquake': 'earthquake',
  'pietrataglio': 'stone-edge',
  'stone-edge': 'stone-edge',
  'oltraggio': 'outrage',
  'outrage': 'outrage',
  'danzaspada': 'swords-dance',
  'swords-dance': 'swords-dance',
  'dragodanza': 'dragon-dance',
  'danzadrago': 'dragon-dance',
  'dragon-dance': 'dragon-dance',
  'geloraggio': 'ice-beam',
  'ice-beam': 'ice-beam',
  'fulmine': 'thunderbolt',
  'thunderbolt': 'thunderbolt',
  'lanciafiamme': 'flamethrower',
  'flamethrower': 'flamethrower',
  'fuocobomba': 'fire-blast',
  'fire-blast': 'fire-blast',
  'idropompa': 'hydro-pump',
  'hydro-pump': 'hydro-pump',
  'surf': 'surf',
  'cascata': 'waterfall',
  'waterfall': 'waterfall',
  'acquajet': 'aqua-jet',
  'aqua-jet': 'aqua-jet',
  'eterelama': 'air-slash',
  'air-slash': 'air-slash',
  'focalcolpo': 'focus-blast',
  'focus-blast': 'focus-blast',
  'forzasfera': 'aura-sphere',
  'pulsarforza': 'aura-sphere',
  'aura-sphere': 'aura-sphere',
  'dragopulsar': 'dragon-pulse',
  'dragon-pulse': 'dragon-pulse',
  'palla-ombra': 'shadow-ball',
  'shadow-ball': 'shadow-ball',
  'neropulsar': 'dark-pulse',
  'dark-pulse': 'dark-pulse',
  'psichico': 'psychic',
  'psychic': 'psychic',
  'gigassorbimento': 'giga-drain',
  'giga-drain': 'giga-drain',
  'fangobomba': 'sludge-bomb',
  'sludge-bomb': 'sludge-bomb',
  'sintesi': 'synthesis',
  'synthesis': 'synthesis',
  'ripresa': 'recover',
  'recover': 'recover',
  'riposo': 'rest',
  'rest': 'rest',
  'tossina': 'toxic',
  'toxic': 'toxic',
  'fuocofatuo': 'will-o-wisp',
  'will-o-wisp': 'will-o-wisp',
  'meteorpugno': 'meteor-mash',
  'meteor-mash': 'meteor-mash',
  'cozzata-zen': 'zen-headbutt',
  'zen-headbutt': 'zen-headbutt',
  'agilita': 'agility',
  'agilit': 'agility',
  'agility': 'agility',
  'zuccata': 'head-smash',
  'head-smash': 'head-smash',
  'pesobomba': 'heavy-slam',
  'heavy-slam': 'heavy-slam',
  'balia': 'brave-bird',
  'baldeali': 'brave-bird',
  'brave-bird': 'brave-bird',
  'punte': 'spikes',
  'spikes': 'spikes',
  'forzaforbice': 'x-scissor',
  'forbice-x': 'x-scissor',
  'x-scissor': 'x-scissor',
  'frana': 'rock-slide',
  'rock-slide': 'rock-slide',
  'tifone': 'hurricane',
  'hurricane': 'hurricane',
  'solarraggio': 'solar-beam',
  'solar-beam': 'solar-beam',
  'magibrillio': 'dazzling-gleam',
  'magibrillo': 'dazzling-gleam',
  'dazzling-gleam': 'dazzling-gleam',
  'vampata': 'overheat',
  'overheat': 'overheat',
  'troppoforte': 'superpower',
  'superpower': 'superpower',
  'mazzabrutta': 'wood-hammer',
  'wood-hammer': 'wood-hammer',
  'multiattacco': 'multi-attack',
  'multi-attack': 'multi-attack',
  'giga-impatto': 'giga-impact',
  'giga-impact': 'giga-impact',
  'triplo-attacco': 'tri-attack',
  'tri-attack': 'tri-attack',
  'psicostroncatura': 'psystrike',
  'psystrike': 'psystrike',
  'oscurotuffo': 'shadow-force',
  'shadow-force': 'shadow-force',
  'fendispazio': 'spacial-rend',
  'spacial-rend': 'spacial-rend',
  'magmastroncatura': 'magma-storm',
  'magma-storm': 'magma-storm',
  'guscioforza': 'shell-smash',
  'shell-smash': 'shell-smash',
  'fiammabrdata': 'fusion-flare',
  'incrofiamma': 'fusion-flare',
  'fusion-flare': 'fusion-flare',
  'generatore-volt': 'fusion-bolt',
  'lucesiluro': 'fusion-bolt',
  'fusion-bolt': 'fusion-bolt',
  'urtooscuro': 'night-daze',
  'night-daze': 'night-daze',
  'nottesferza': 'night-slash',
  'night-slash': 'night-slash',
  'devastoroccia': 'rock-wrecker',
  'rock-wrecker': 'rock-wrecker',
  'megacorno': 'megahorn',
  'megahorn': 'megahorn',
  'dinamipugno': 'dynamic-punch',
  'dynamic-punch': 'dynamic-punch',
  'privazione': 'knock-off',
  'knock-off': 'knock-off',
  'pugnoscarica': 'bullet-punch',
  'bullet-punch': 'bullet-punch',
  'pugnorapido': 'mach-punch',
  'mach-punch': 'mach-punch',
  'onda-calda': 'heat-wave',
  'heat-wave': 'heat-wave',
  'elettropalla': 'electro-ball',
  'electro-ball': 'electro-ball',
  'elettrotela': 'electroweb',
  'electroweb': 'electroweb',
  'ondafango': 'sludge-wave',
  'sludge-wave': 'sludge-wave',
  'velenocolpo': 'poison-jab',
  'poison-jab': 'poison-jab',
  'martellata': 'crabhammer',
  'crabhammer': 'crabhammer',
  'calmamente': 'calm-mind',
  'calm-mind': 'calm-mind',
  'congiura': 'nasty-plot',
  'nasty-plot': 'nasty-plot',
  'geleripiego': 'ice-punch',
  'gelopugno': 'ice-punch',
  'ice-punch': 'ice-punch',
  'elettropugno': 'thunder-punch',
  'thunder-punch': 'thunder-punch',
  'fuocopugno': 'fire-punch',
  'fire-punch': 'fire-punch',
  'controfuoco': 'headlong-rush',
  'scontro-frontale': 'headlong-rush',
  'headlong-rush': 'headlong-rush',
  'sciabola-di-ghiaccio': 'glaive-rush',
  'gelolancia': 'glaive-rush',
  'glaive-rush': 'glaive-rush',
  'prestigiatore': 'flower-trick',
  'flower-trick': 'flower-trick',
  'preghiera': 'revival-blessing',
  'revival-blessing': 'revival-blessing',
  'geoforza': 'earth-power',
  'earth-power': 'earth-power',
  'cannonlampo': 'flash-cannon',
  'flash-cannon': 'flash-cannon',
  'luminomossa': 'flash-cannon',
  'girofango': 'muddy-water',
  'muddy-water': 'muddy-water',
  'ultravampa': 'overheat',
  'ritorno': 'return',
  'return': 'return',
  'baffo-d-aura': 'aura-sphere',
  'baffodaura': 'aura-sphere',
  'spada-reale': 'kings-shield',
  'kings-shield': 'kings-shield',
  'sacraforza': 'sacred-sword',
  'sacred-sword': 'sacred-sword',
  'capocciata': 'headbutt',
  'headbutt': 'headbutt',
  'radicamento': 'ingrain',
  'ingrain': 'ingrain',
  'scintilla': 'spark',
  'spark': 'spark',
  'balzo': 'bounce',
  'bounce': 'bounce',
  'rabbia-bruciante': 'burning-jealousy',
  'burning-jealousy': 'burning-jealousy',
  'ira-furente': 'raging-fury',
  'raging-fury': 'raging-fury',
  'lavasbuffo': 'lava-plume',
  'lava-plume': 'lava-plume',
  'fuocofustagno': 'fire-lash',
  'fire-lash': 'fire-lash',
  'ruotadifuoco': 'flame-wheel',
  'flame-wheel': 'flame-wheel',
  'lama-del-rimorso': 'bitter-blade',
  'bitter-blade': 'bitter-blade',
  'corazzaurto': 'armor-cannon',
  'armor-cannon': 'armor-cannon',
  'cantoardente': 'torch-song',
  'torch-song': 'torch-song'
};

/**
 * Retrieves a battle-ready Move object with reliable power, category, type, and PP.
 * Never returns a 0-power status move unless it is genuinely a status move!
 */
export function getItalianMoveName(rawName: string): string {
  if (!rawName) return '';
  const key = normalizeMoveKey(rawName);
  const aliasKey = ALIAS_MAP[key] || key;
  const found = MOVES_DATABASE[aliasKey] || MOVES_DATABASE[key];
  if (found) return found.name;

  for (const move of Object.values(MOVES_DATABASE)) {
    if (normalizeMoveKey(move.englishName) === key || normalizeMoveKey(move.name) === key) {
      return move.name;
    }
  }

  const formatted = rawName.replace(/[-_]/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function getMoveByName(rawName: string): Move {
  const key = normalizeMoveKey(rawName);
  const resolvedKey = ALIAS_MAP[key] || key;

  // 1. Direct database match (including alias lookup)
  const foundDirect = MOVES_DATABASE[resolvedKey] || MOVES_DATABASE[key];
  if (foundDirect) {
    return {
      name: foundDirect.name,
      power: foundDirect.power,
      type: foundDirect.type,
      category: foundDirect.category,
      accuracy: foundDirect.accuracy,
      pp: foundDirect.pp,
      maxPp: foundDirect.maxPp,
      priority: foundDirect.priority,
      target: foundDirect.target,
      stat_changes: foundDirect.stat_changes,
      stat_changes_target: (foundDirect as any).stat_changes_target,
      description: (foundDirect as any).description,
      statusEffect: foundDirect.statusEffect,
      effectChance: foundDirect.effectChance,
      drain: foundDirect.drain,
      healing: foundDirect.healing,
      recoil: foundDirect.recoil,
      recoilMaxHp: foundDirect.recoilMaxHp,
      flinchChance: foundDirect.flinchChance,
      confusionChance: foundDirect.confusionChance,
      multiTurn: foundDirect.multiTurn
    };
  }

  // 2. Check if name matches English name or Italian name exactly
  for (const move of Object.values(MOVES_DATABASE)) {
    const normalizedItName = normalizeMoveKey(move.name);
    const normalizedEnName = normalizeMoveKey(move.englishName);
    if (normalizedItName === key || normalizedEnName === key) {
      return {
        name: move.name,
        power: move.power,
        type: move.type,
        category: move.category,
        accuracy: move.accuracy,
        pp: move.pp,
        maxPp: move.maxPp,
        priority: move.priority,
        target: move.target,
        stat_changes: move.stat_changes,
        stat_changes_target: (move as any).stat_changes_target,
        description: (move as any).description,
        statusEffect: move.statusEffect,
        effectChance: move.effectChance,
        drain: move.drain,
        healing: move.healing,
        recoil: move.recoil,
        recoilMaxHp: move.recoilMaxHp,
        flinchChance: move.flinchChance,
        confusionChance: move.confusionChance,
        multiTurn: move.multiTurn
      };
    }
  }

  // 3. Fallback: Intelligent inference
  const isStatus = key.includes('growl') || key.includes('ruggito') ||
                  key.includes('tail-whip') || key.includes('coda') ||
                  key.includes('leer') || key.includes('sguardo') ||
                  key.includes('harden') || key.includes('rafforza') ||
                  key.includes('string-shot') || key.includes('millebave') ||
                  key.includes('dance') || key.includes('danza') ||
                  key.includes('spore') || key.includes('spora') ||
                  key.includes('hypno') || key.includes('ipnosi') ||
                  key.includes('wave') || key.includes('onda') ||
                  key.includes('toxic') || key.includes('tossina') ||
                  key.includes('powder') || key.includes('polvere') ||
                  key.includes('splash') || key.includes('smokescreen') ||
                  key.includes('screech') || key.includes('stridio');

  const prettyName = rawName.charAt(0).toUpperCase() + rawName.slice(1).replace(/[-_]/g, ' ');

  if (isStatus) {
    return {
      name: prettyName,
      power: 0,
      type: 'normal',
      category: 'status',
      accuracy: 100,
      pp: 30,
      maxPp: 30
    };
  }

  // Attacking move fallback: ALWAYS has positive power and physical/special category!
  let inferredType = 'normal';
  if (key.includes('fire') || key.includes('fuoco') || key.includes('flame') || key.includes('braciere') || key.includes('brucia') || key.includes('ardente') || key.includes('furente') || key.includes('vampa') || key.includes('caldo') || key.includes('calore') || key.includes('lava') || key.includes('magma') || key.includes('scott')) inferredType = 'fire';
  else if (key.includes('water') || key.includes('acqua') || key.includes('hydro') || key.includes('bolla') || key.includes('idro') || key.includes('onda') || key.includes('cascata') || key.includes('getto')) inferredType = 'water';
  else if (key.includes('grass') || key.includes('erba') || key.includes('foglia') || key.includes('vine') || key.includes('leaf') || key.includes('seme') || key.includes('flora') || key.includes('solare')) inferredType = 'grass';
  else if (key.includes('electric') || key.includes('elettro') || key.includes('tuono') || key.includes('shock') || key.includes('thunder') || key.includes('spark') || key.includes('fulmine') || key.includes('lampo') || key.includes('scossa')) inferredType = 'electric';
  else if (key.includes('ice') || key.includes('ghiaccio') || key.includes('gelo') || key.includes('frost') || key.includes('freeze') || key.includes('neve') || key.includes('bora') || key.includes('brivido')) inferredType = 'ice';
  else if (key.includes('psy') || key.includes('psico') || key.includes('mind') || key.includes('zen') || key.includes('mente') || key.includes('tele')) inferredType = 'psychic';
  else if (key.includes('dark') || key.includes('buio') || key.includes('ombra') || key.includes('shadow') || key.includes('neropulsar') || key.includes('morso') || key.includes('sgranocchio') || key.includes('notte')) inferredType = 'dark';
  else if (key.includes('flying') || key.includes('ala') || key.includes('becc') || key.includes('volo') || key.includes('aero') || key.includes('gust') || key.includes('vento') || key.includes('aria') || key.includes('balzo') || key.includes('piuma')) inferredType = 'flying';
  else if (key.includes('poison') || key.includes('veleno') || key.includes('tossic') || key.includes('toxic') || key.includes('fango') || key.includes('sludge') || key.includes('fiele') || key.includes('acido')) inferredType = 'poison';
  else if (key.includes('dragon') || key.includes('drago') || key.includes('draco') || key.includes('oltraggio')) inferredType = 'dragon';
  else if (key.includes('steel') || key.includes('acciaio') || key.includes('metal') || key.includes('ferro') || key.includes('iron') || key.includes('lama') || key.includes('scudo')) inferredType = 'steel';
  else if (key.includes('fairy') || key.includes('folletto') || key.includes('pixie') || key.includes('charm') || key.includes('bacio') || key.includes('kiss') || key.includes('magi') || key.includes('luna') || key.includes('fatato')) inferredType = 'fairy';
  else if (key.includes('rock') || key.includes('roccia') || key.includes('pietra') || key.includes('stone') || key.includes('cadutamassi') || key.includes('frana') || key.includes('masso')) inferredType = 'rock';
  else if (key.includes('ground') || key.includes('terra') || key.includes('earth') || key.includes('fossa') || key.includes('sabbia') || key.includes('sand') || key.includes('mud') || key.includes('terremoto') || key.includes('earthquake')) inferredType = 'ground';
  else if (key.includes('bug') || key.includes('coleottero') || key.includes('forbice') || key.includes('insect') || key.includes('insetto') || key.includes('pin-missile') || key.includes('tagliofuria') || key.includes('ronzio')) inferredType = 'bug';
  else if (key.includes('ghost') || key.includes('spettro') || key.includes('pauros') || key.includes('nightmare') || key.includes('fantasma') || key.includes('spirit')) inferredType = 'ghost';
  else if (key.includes('fighting') || key.includes('lotta') || key.includes('pugno') || key.includes('calcio') || key.includes('punch') || key.includes('kick') || key.includes('combatt') || key.includes('zuffa') || key.includes('colpo')) inferredType = 'fighting';

  const specialTypes = ['fire', 'water', 'grass', 'electric', 'ice', 'psychic', 'dark', 'dragon', 'fairy'];
  const category = specialTypes.includes(inferredType) ? 'special' : 'physical';

  return {
    name: prettyName,
    power: 45,
    type: inferredType,
    category,
    accuracy: 100,
    pp: 35,
    maxPp: 35
  };
}
