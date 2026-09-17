export interface Pokemon {
  id: number;
  instanceId: string; // Unique ID for this specific Pokemon instance
  name: string;
  nickname?: string;
  level: number;
  hp: number;
  maxHp: number;
  types: string[];
  ability?: Ability;
  sprites: {
    front: string;
    back: string;
    artwork: string;
    home: string;
    animated?: {
      front: string;
      back: string;
    };
  };
  stats: {
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  evYield?: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  moves: Move[];
  experience: number;
  nextLevelExp: number;
  nature: string;
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  evs: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  isShiny: boolean;
  status?: 'paralyzed' | 'poisoned' | 'sleep' | 'frozen' | 'burned';
  statusDuration?: number;
  evolutionInfo?: {
    nextId: number;
    level: number;
    name: string;
  };
  learnableMoves?: {
    level: number;
    name: string;
    url: string;
  }[];
  caughtAt: number;
  caughtLocation: string;
}

export interface Ability {
  name: string;
  description: string;
  effect?: string;
}

export interface BattleStages {
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  accuracy: number;
  evasion: number;
}

export interface StatChange {
  change: number;
  stat: {
    name: string;
  };
}

export interface Move {
  name: string;
  power: number;
  type: string;
  accuracy: number;
  category?: 'physical' | 'special' | 'status';
  pp?: number;
  maxPp?: number;
  priority?: number;
  drain?: number; // ratio of damage dealt restored as HP (e.g. 0.5)
  healing?: number; // ratio of maxHp restored (e.g. 0.5)
  recoil?: number; // ratio of damage taken as recoil (e.g. 0.25)
  recoilMaxHp?: number; // ratio of maxHp taken as recoil (e.g. 0.25 for struggle)
  flinchChance?: number; // chance 0-100 to flinch target
  confusionChance?: number; // chance 0-100 to confuse target
  stat_changes?: StatChange[];
  statusEffect?: 'paralyzed' | 'poisoned' | 'sleep' | 'frozen' | 'burned';
  effectChance?: number;
  target?: string;
  description?: string;
  multiTurn?: {
    type: 'charge' | 'recharge' | 'multi-hit' | 'trap' | 'locked-turns';
    turns?: number;
    message?: string;
    chargeMessage?: string;
  };
}

export interface Trainer {
  id: string;
  name: string;
  type: string;
  sprite: string;
  team: Pokemon[];
  quote: string;
  winQuote: string;
  moneyReward: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  count: number;
  type: 'healing' | 'capture' | 'other';
  effectValue?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objective: string;
  rewardText: string;
  reward?: {
    money?: number;
    items?: { id: string; count: number }[];
  };
  status: 'available' | 'active' | 'completed' | 'claimed';
  category: 'exploration' | 'battle' | 'collection' | 'social';
  giver: string;
}

export interface GameState {
  player: {
    name: string;
    spriteColor: string;
    team: Pokemon[];
    box: Pokemon[];
    pokedex: Record<number, 'seen' | 'caught'>;
    inventory: Item[];
    money: number;
    location: string;
    badges: string[];
    quests: Quest[];
    defeatedTrainers: string[];
    leagueVictories?: number;
    avatarUrl?: string;
    hatEmoji?: string;
    title?: string;
    unlockedTitles?: string[];
    towerHighFloor?: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  unlockedArea?: string;
  bossName: string;
}

export const INITIAL_STATE: GameState = {
  player: {
    name: 'Allenatore',
    spriteColor: 'bg-blue-500',
    team: [],
    box: [],
    pokedex: {},
    inventory: [
      { id: 'poke-ball', name: 'Poké Ball', description: 'Uno strumento per catturare Pokémon selvatici.', count: 10, type: 'capture' },
      { id: 'mega-ball', name: 'Mega Ball', description: 'Una Ball con alto tasso di cattura.', count: 0, type: 'capture' },
      { id: 'ultra-ball', name: 'Ultra Ball', description: 'La migliore Ball in commercio.', count: 0, type: 'capture' },
      { id: 'master-ball', name: 'Master Ball', description: 'La Ball definitiva: cattura senza mai fallire.', count: 0, type: 'capture' },
      { id: 'pozione', name: 'Pozione', description: 'Ripristina 20 HP di un Pokémon.', count: 5, type: 'healing', effectValue: 20 },
      { id: 'super-pozione', name: 'Super Pozione', description: 'Ripristina 50 HP di un Pokémon.', count: 0, type: 'healing', effectValue: 50 },
      { id: 'iper-pozione', name: 'Iper Pozione', description: 'Ripristina 200 HP di un Pokémon.', count: 0, type: 'healing', effectValue: 200 },
      { id: 'caramella-rara', name: 'Caramella Rara', description: 'Alza di un livello un Pokémon.', count: 0, type: 'other' },
      { id: 'revitalizzante', name: 'Revitalizzante', description: 'Rianima un Pokémon esausto con metà PS.', count: 0, type: 'healing', effectValue: 0.5 },
      { id: 'revitalizzante-max', name: 'Revitalizzante Max', description: 'Rianima un Pokémon esausto con tutti i PS.', count: 0, type: 'healing', effectValue: 1 },
      { id: 'pepita', name: 'Pepita', description: 'Una pepita d\'oro puro. Può essere venduta a caro prezzo.', count: 0, type: 'other' },
    ],
    money: 1000,
    location: 'villaggio',
    badges: [],
    defeatedTrainers: [],
    quests: [
      {
        id: 'first-steps',
        title: 'Primi Passi Digitali',
        description: 'Il Prof. Scordarello vuole assicurarsi che tu non inciampi sui tuoi stessi pixel.',
        objective: 'Esplora il Bosco dei Selfie per la prima volta.',
        rewardText: '5 Poké Ball e 200 PokéDollari',
        reward: { money: 200, items: [{ id: 'poke-ball', count: 5 }] },
        status: 'active',
        category: 'exploration',
        giver: 'Prof. Scordarello'
      },
      {
        id: 'magikarp-fan',
        title: 'Il Fan di Magikarp',
        description: 'Un pescatore nella Spiaggia del Refresh è convinto che i Magikarp siano la chiave per dominare il mondo.',
        objective: 'Cattura un Magikarp e mostralo al pescatore.',
        rewardText: '1 Caramella Rara',
        reward: { items: [{ id: 'caramella-rara', count: 1 }] },
        status: 'available',
        category: 'collection',
        giver: 'Pescatore Ginetto'
      },
      {
        id: 'shiny-hunter',
        title: 'Cacciatore di Bagliori',
        description: 'Dicono che esistano Pokémon di colori diversi. Lo Speleologo Glitch ne è ossessionato.',
        objective: 'Trova e cattura un Pokémon Cromatico (Shiny).',
        rewardText: '1 Master Ball (Sì, davvero!)',
        reward: { items: [{ id: 'master-ball', count: 1 }] },
        status: 'available',
        category: 'collection',
        giver: 'Speleologo Glitch'
      },
      {
        id: 'eclipse-hunter',
        title: 'Cacciatore di Eclissi',
        description: 'Il Team Eclipse sta diventando troppo audace. Dobbiamo ridimensionarli.',
        objective: 'Sconfiggi 5 Reclute del Team Eclipse.',
        rewardText: '5000 PokéDollari e 3 Iper Pozioni',
        reward: { money: 5000, items: [{ id: 'iper-pozione', count: 3 }] },
        status: 'available',
        category: 'battle',
        giver: 'Agente Jenny'
      },
      {
        id: 'legend-collector',
        title: 'Collezionista di Leggende',
        description: 'Le leggende non sono solo favole. Sono dati rari nel sistema.',
        objective: 'Cattura almeno 3 Pokémon Leggendari.',
        rewardText: 'Diploma di Maestro e 10.000 PokéDollari',
        reward: { money: 10000 },
        status: 'available',
        category: 'collection',
        giver: 'Prof. Scordarello'
      },
      {
        id: 'evolution-expert',
        title: 'Esperto di Evoluzioni',
        description: 'Vedere un Pokémon cambiare forma è la gioia di ogni scienziato.',
        objective: 'Fai evolvere 10 Pokémon.',
        rewardText: '5 Caramelle Rare',
        reward: { items: [{ id: 'caramella-rara', count: 5 }] },
        status: 'available',
        category: 'collection',
        giver: 'Scienziato Stuck'
      },
      {
        id: 'money-maker',
        title: 'Capitalismo Digitale',
        description: 'Il mondo gira intorno ai soldi, anche quello dei Pokémon.',
        objective: 'Accumula 50.000 PokéDollari.',
        rewardText: '10 Pepite (Vendibili per molti soldi!)',
        reward: { items: [{ id: 'pepita', count: 10 }] },
        status: 'available',
        category: 'social',
        giver: 'Mercante Errante'
      },
      {
        id: 'move-master',
        title: 'Maestro delle Mosse',
        description: 'Le mosse giuste possono ribaltare qualsiasi battaglia.',
        objective: 'Insegna 5 nuove mosse ai tuoi Pokémon tramite l\'Aumento di Livello.',
        rewardText: '3 MT Casuali (Dati di sistema)',
        reward: { money: 1000 },
        status: 'available',
        category: 'battle',
        giver: 'Cerca-Mosse'
      },
      {
        id: 'area-conqueror',
        title: 'Conquistatore di Aree',
        description: 'Ogni zona ha il suo segreto. Scoprili tutti.',
        objective: 'Sblocca e visita tutte le aree disponibili nel gioco.',
        rewardText: '20.000 PokéDollari',
        reward: { money: 20000 },
        status: 'available',
        category: 'exploration',
        giver: 'Esploratore Ignoto'
      },
      {
        id: 'badge-collector-pro',
        title: 'Collezionista Pro',
        description: 'Le medaglie sono il simbolo della tua forza.',
        objective: 'Ottieni tutte le 10 medaglie dei Capipalestra.',
        rewardText: 'Accesso alla Lega dei Glitch e 50.000 PokéDollari',
        reward: { money: 50000 },
        status: 'available',
        category: 'battle',
        giver: 'Lega Pokémon'
      },
      {
        id: 'rare-spawn-hunter',
        title: 'Cacciatore di Rari',
        description: 'Ci sono Pokémon che appaiono solo una volta ogni mille cicli di clock.',
        objective: 'Cattura un Pokémon con rarità inferiore all\'1%.',
        rewardText: '5 Master Ball',
        reward: { items: [{ id: 'master-ball', count: 5 }] },
        status: 'available',
        category: 'collection',
        giver: 'Prof. Scordarello'
      },
      {
        id: 'trainer-slayer',
        title: 'Sterminatore di Allenatori',
        description: 'Nessuno può resistere alla tua squadra.',
        objective: 'Sconfiggi 50 allenatori (inclusi i rematch).',
        rewardText: 'Statua d\'Oro e 100.000 PokéDollari',
        reward: { money: 100000 },
        status: 'available',
        category: 'battle',
        giver: 'Sfidofono'
      }
    ],
  },
};

export const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-[#A8A77A]',
  fire: 'bg-[#EE8130]',
  water: 'bg-[#6390F0]',
  electric: 'bg-[#F7D02C]',
  grass: 'bg-[#7AC74C]',
  ice: 'bg-[#96D9D6]',
  fighting: 'bg-[#C22E28]',
  poison: 'bg-[#A33EA1]',
  ground: 'bg-[#E2BF65]',
  flying: 'bg-[#A98FF3]',
  psychic: 'bg-[#F95587]',
  bug: 'bg-[#A6B91A]',
  rock: 'bg-[#B6A136]',
  ghost: 'bg-[#735797]',
  dragon: 'bg-[#6F35FC]',
  steel: 'bg-[#B7B7CE]',
  fairy: 'bg-[#D685AD]',
  dark: 'bg-[#705746]',
};
