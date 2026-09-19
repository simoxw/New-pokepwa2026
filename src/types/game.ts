export type StatusCondition = 'paralyzed' | 'poisoned' | 'sleep' | 'frozen' | 'burned';

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
  status?: StatusCondition;
  statusDuration?: number;
  evolutionInfo?: {
    nextId: number;
    level: number;
    name: string;
    branches?: { nextId: number; name: string; level: number }[];
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
  isGymLeader?: boolean;
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
      },
      {
        id: 'champion-of-code',
        title: 'Campione dei Crash di Sistema',
        description: 'La prova regina: sconfiggi i Superquattro dei Crash di Sistema e il Campione al Datacenter della Lega!',
        objective: 'Batti la Lega Pokémon e conquista il titolo di Campione.',
        rewardText: '50.000 PokéDollari e 3 Master Ball',
        reward: { money: 50000, items: [{ id: 'master-ball', count: 3 }] },
        status: 'available',
        category: 'battle',
        giver: 'Lega Pokémon'
      },
      {
        id: 'post-game-explorer',
        title: 'I Segreti dell\'Area Zero',
        description: 'Un portale verso l\'Area Zero Digitale è apparso dopo la vittoria alla Lega. Esplora questa dimensione post-game!',
        objective: 'Entra ed esplora l\'Area Zero Digitale.',
        rewardText: '25.000 PokéDollari e 5 Caramelle Rare',
        reward: { money: 25000, items: [{ id: 'caramella-rara', count: 5 }] },
        status: 'available',
        category: 'exploration',
        giver: 'Admin Root'
      },
      {
        id: 'paradox-catcher',
        title: 'Creature del Multiverso Digitale',
        description: 'Nell\'Area Zero sono state rilevate entità straordinarie come Koraidon, Miraidon, Arceus e Deoxys!',
        objective: 'Cattura una creatura leggendaria o paradossale esclusiva dell\'Area Zero.',
        rewardText: '2 Master Ball e 3 Revitalizzanti Max',
        reward: { items: [{ id: 'master-ball', count: 2 }, { id: 'revitalizzante-max', count: 3 }] },
        status: 'available',
        category: 'collection',
        giver: 'Scienziato Filippo'
      },
      {
        id: 'dragon-tamer',
        title: 'Il Signore dei Draghi',
        description: 'I Pokémon di tipo Drago possiedono una potenza ancestrale. Dimostra di saperne domare uno.',
        objective: 'Cattura un Pokémon di tipo Drago (es. Dragonite, Salamence, Garchomp, Baxcalibur, Giratina, ecc.).',
        rewardText: '15.000 PokéDollari e 5 Ultra Ball',
        reward: { money: 15000, items: [{ id: 'ultra-ball', count: 5 }] },
        status: 'available',
        category: 'collection',
        giver: 'Domadraghi Lance'
      },
      {
        id: 'team-powerhouse',
        title: 'Squadra dei Titani (Livello 70)',
        description: 'Le battaglie del post-game e i Pokémon dell\'Area Zero non perdonano chi trascura l\'allenamento.',
        objective: 'Porta almeno un Pokémon della tua squadra al Livello 70 o superiore.',
        rewardText: '20.000 PokéDollari e 5 Caramelle Rare',
        reward: { money: 20000, items: [{ id: 'caramella-rara', count: 5 }] },
        status: 'available',
        category: 'battle',
        giver: 'Gino il Bullo'
      },
      {
        id: 'tower-challenger',
        title: 'Scalatore della Torre Lotta',
        description: 'La Torre Lotta è una prova continua di abilità tattica e resistenza.',
        objective: 'Raggiungi almeno il Piano 10 della Torre Lotta.',
        rewardText: '30.000 PokéDollari e 10 Caramelle Rare',
        reward: { money: 30000, items: [{ id: 'caramella-rara', count: 10 }] },
        status: 'available',
        category: 'battle',
        giver: 'Maestro della Torre'
      },
      {
        id: 'pokedex-pinnacle',
        title: 'Maestro del Pokédex (100 Specie)',
        description: 'Raccogliere dati su 100 specie differenti è il sogno di ogni vero ricercatore.',
        objective: 'Cattura almeno 100 Pokémon differenti e registrali nel Pokédex.',
        rewardText: '100.000 PokéDollari e 5 Master Ball',
        reward: { money: 100000, items: [{ id: 'master-ball', count: 5 }] },
        status: 'available',
        category: 'collection',
        giver: 'Prof. Scordarello'
      },
      {
        id: 'healer-zen',
        title: 'Pronto Soccorso Tascabile',
        description: 'Un vero allenatore non abbandona mai i propri Pokémon quando cadono esausti sul campo.',
        objective: 'Cura completamente la tua squadra o usa uno strumento di rianimazione.',
        rewardText: '5 Iper Pozioni e 3 Revitalizzanti Max',
        reward: { items: [{ id: 'iper-pozione', count: 5 }, { id: 'revitalizzante-max', count: 3 }] },
        status: 'available',
        category: 'social',
        giver: 'Infermiera Joy'
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

export const TYPE_TRANSLATIONS: Record<string, string> = {
  normal: 'NORMALE',
  fire: 'FUOCO',
  water: 'ACQUA',
  electric: 'ELETTRO',
  grass: 'ERBA',
  ice: 'GHIACCIO',
  fighting: 'LOTTA',
  poison: 'VELENO',
  ground: 'TERRA',
  flying: 'VOLANTE',
  psychic: 'PSICO',
  bug: 'COLEOTT.',
  rock: 'ROCCIA',
  ghost: 'SPETTRO',
  dragon: 'DRAGO',
  steel: 'ACCIAIO',
  fairy: 'FOLLETTO',
  dark: 'BUIO',
};
