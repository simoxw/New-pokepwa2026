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
    maxPp: 10
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

/**
 * Retrieves a battle-ready Move object with reliable power, category, type, and PP.
 * Never returns a 0-power status move unless it is genuinely a status move!
 */
export function getMoveByName(rawName: string): Move {
  const key = normalizeMoveKey(rawName);

  // 1. Direct database match
  if (MOVES_DATABASE[key]) {
    const found = MOVES_DATABASE[key];
    return {
      name: found.name,
      power: found.power,
      type: found.type,
      category: found.category,
      accuracy: found.accuracy,
      pp: found.pp,
      maxPp: found.maxPp,
      priority: found.priority,
      target: found.target,
      stat_changes: found.stat_changes,
      statusEffect: found.statusEffect,
      effectChance: found.effectChance,
      drain: found.drain,
      healing: found.healing,
      recoil: found.recoil,
      recoilMaxHp: found.recoilMaxHp,
      flinchChance: found.flinchChance,
      confusionChance: found.confusionChance
    };
  }

  // 2. Check if name matches an Italian translation or partial key
  for (const [dbKey, move] of Object.entries(MOVES_DATABASE)) {
    const normalizedItName = normalizeMoveKey(move.name);
    if (normalizedItName === key || dbKey.includes(key) || key.includes(dbKey)) {
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
        statusEffect: move.statusEffect,
        effectChance: move.effectChance,
        drain: move.drain,
        healing: move.healing,
        recoil: move.recoil,
        recoilMaxHp: move.recoilMaxHp,
        flinchChance: move.flinchChance,
        confusionChance: move.confusionChance
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
  if (key.includes('fire') || key.includes('fuoco') || key.includes('flame') || key.includes('braciere')) inferredType = 'fire';
  else if (key.includes('water') || key.includes('acqua') || key.includes('hydro') || key.includes('bolla')) inferredType = 'water';
  else if (key.includes('grass') || key.includes('erba') || key.includes('foglia') || key.includes('vine')) inferredType = 'grass';
  else if (key.includes('electric') || key.includes('elettro') || key.includes('tuono') || key.includes('shock')) inferredType = 'electric';
  else if (key.includes('ice') || key.includes('ghiaccio') || key.includes('gelo')) inferredType = 'ice';
  else if (key.includes('psy') || key.includes('psico')) inferredType = 'psychic';
  else if (key.includes('dark') || key.includes('buio') || key.includes('ombra')) inferredType = 'dark';
  else if (key.includes('flying') || key.includes('ala') || key.includes('becc')) inferredType = 'flying';
  else if (key.includes('poison') || key.includes('veleno')) inferredType = 'poison';

  const specialTypes = ['fire', 'water', 'grass', 'electric', 'ice', 'psychic', 'dark'];
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
