import { Pokemon, Trainer } from '../types/game';
import { fetchPokemonData, calculateStats } from './pokeapi';

export interface TowerCard {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'cursed';
  icon: string;
  description: string;
  attackMultiplier?: number;
  defenseMultiplier?: number;
  speedMultiplier?: number;
  healAfterKoPercent?: number;
  critChanceBonus?: number;
  lifeStealPercent?: number;
  lowHpBonus?: number;
  dodgeChance?: number;
  bonusMoney?: number;
  shieldHp?: number;
  incomingDamageMultiplier?: number;
  startHpSelfDamagePercent?: number;
  accuracyPenaltyPercent?: number;
}

export type BossMutationType = 'corazzato' | 'overclocked' | 'vampirico' | 'corrotto';

export interface BossMutationInfo {
  type: BossMutationType;
  name: string;
  description: string;
  icon: string;
}

export const BOSS_MUTATIONS: Record<BossMutationType, BossMutationInfo> = {
  corazzato: {
    type: 'corazzato',
    name: 'Boss Corazzato',
    description: 'Subisce il -15% di danni da tutti gli attacchi.',
    icon: '🛡️'
  },
  overclocked: {
    type: 'overclocked',
    name: 'Boss Overclocked',
    description: '+15% Velocità e +10% Danno inflitto.',
    icon: '⚡'
  },
  vampirico: {
    type: 'vampirico',
    name: 'Boss Vampirico',
    description: 'Ruba il 10% dei danni inflitti per rigenerare PS.',
    icon: '🩸'
  },
  corrotto: {
    type: 'corrotto',
    name: 'Boss Corrotto',
    description: 'Applica l\'effetto Tossina al tuo Pokémon all\'inizio della sfida.',
    icon: '☣️'
  }
};

export const TOWER_CARDS_POOL: TowerCard[] = [
  {
    id: 'overclock-cpu',
    name: 'Overclock della CPU',
    rarity: 'common',
    icon: '⚡',
    description: '+8% Danno di Attacco, ma perdi il-5% di Difesa.',
    attackMultiplier: 1.08,
    defenseMultiplier: 0.95
  },
  {
    id: 'garbage-collection',
    name: 'Garbage Collection',
    rarity: 'rare',
    icon: '💊',
    description: 'Cura il 10% dei PS massimi di tutta la squadra dopo ogni vittoria.',
    healAfterKoPercent: 10
  },
  {
    id: 'fibra-10g',
    name: 'Banda Larga 10Gbps',
    rarity: 'common',
    icon: '🚀',
    description: '+8% Velocità per il tuo Pokémon.',
    speedMultiplier: 1.08
  },
  {
    id: 'firewall-rigido',
    name: 'Firewall Rigido v4',
    rarity: 'rare',
    icon: '🛡️',
    description: 'Subisci il 6% in meno di danno da tutte le mosse.',
    defenseMultiplier: 1.06
  },
  {
    id: 'pacchetti-vampiro',
    name: 'Drenaggio di Pacchetti',
    rarity: 'epic',
    icon: '🩸',
    description: 'Ruba il 5% dei danni inflitti per curare il tuo Pokémon attivo.',
    lifeStealPercent: 5
  },
  {
    id: 'algoritmo-euristico',
    name: 'Algoritmo Euristico',
    rarity: 'rare',
    icon: '🎯',
    description: '+6% probabilità di Brutto Colpo (Critico) su ogni mossa.',
    critChanceBonus: 6
  },
  {
    id: 'buffer-overflow',
    name: 'Buffer Overflow',
    rarity: 'epic',
    icon: '💥',
    description: '+12% Danno se i tuoi PS scendono sotto il 35%.',
    lowHpBonus: 1.12
  },
  {
    id: 'schivata-quantica',
    name: 'Schivata Quantica (RNG)',
    rarity: 'epic',
    icon: '🎲',
    description: '5% di probabilità di schivare completamente un attacco subito.',
    dodgeChance: 5
  },
  {
    id: 'crypto-miner',
    name: 'Background Miner',
    rarity: 'common',
    icon: '💰',
    description: '+800 PokéDollari extra ad ogni piano superato.',
    bonusMoney: 800
  },
  {
    id: 'power-shield',
    name: 'Scudo Energetico UPS',
    rarity: 'legendary',
    icon: '🔋',
    description: 'Inizi ogni round con 8 PS di Barriera protettiva extra.',
    shieldHp: 8
  },
  // 4 NEW BUFF CARDS
  {
    id: 'jit-compiler',
    name: 'Compilatore JIT',
    rarity: 'common',
    icon: '⚙️',
    description: '+4% di Attacco e +4% di Velocità.',
    attackMultiplier: 1.04,
    speedMultiplier: 1.04
  },
  {
    id: 'antivirus-scan',
    name: 'Scansione Antivirus',
    rarity: 'rare',
    icon: '🛡️',
    description: 'Subisci il 6% in meno di danno, ma perdi il 3% di Velocità.',
    defenseMultiplier: 1.06,
    speedMultiplier: 0.97
  },
  {
    id: 'registry-optimizer',
    name: 'Ottimizzazione Registro',
    rarity: 'rare',
    icon: '🧹',
    description: '+4% Velocità e +4% Probabilità di Brutto Colpo.',
    speedMultiplier: 1.04,
    critChanceBonus: 4
  },
  {
    id: 'predictive-algorithm',
    name: 'Algoritmo Predittivo',
    rarity: 'epic',
    icon: '👁️',
    description: '5% Probabilità di Schivata.',
    dodgeChance: 5
  },

  // CARTE CORROTTE / MALEDETTE (Risk vs Reward)
  {
    id: 'kernel-overclock-cursed',
    name: 'Kernel Overclock [Corrotto]',
    rarity: 'cursed',
    icon: '💀',
    description: '+25% Danno inflitto, ma subisci il +15% di danno da ogni mossa avversaria.',
    attackMultiplier: 1.25,
    incomingDamageMultiplier: 1.15
  },
  {
    id: 'memory-leak-cursed',
    name: 'Fuga di Memoria [Corrotto]',
    rarity: 'cursed',
    icon: '☣️',
    description: '+2.200 PokéDollari a piano, ma il tuo Pokémon in campo perde il 5% di PS ad inizio scontro.',
    bonusMoney: 2200,
    startHpSelfDamagePercent: 5
  },
  {
    id: 'critical-bug-cursed',
    name: 'Bug Critico [Corrotto]',
    rarity: 'cursed',
    icon: '🎯',
    description: '+20% Probabilità di Brutto Colpo, ma la precisione delle tue mosse scende del 10%.',
    critChanceBonus: 20,
    accuracyPenaltyPercent: 10
  }
];

// ==========================================
// POOL DI POKÉMON A FASCE / TIERS
// ==========================================

// Fascia 1 (Piani 1 - 10): Processi Base, prime evoluzioni e forme agili
const TIER_1_POKEMON = [
  // Elettro / Cyber / Tech
  25, 26, 81, 82, 100, 101, 125, 137, 179, 180, 239, 311, 312, 479, 921,
  // Spettro / Psico / Acciaio
  63, 64, 92, 93, 123, 304, 305, 353, 354, 355, 356, 374, 375, 447, 599, 600
];

// Fascia 2 (Piani 11 - 25): Forme evolute competitive, minacce di rete e difensive
const TIER_2_POKEMON = [
  // Grandi evoluzioni Elettro & Acciaio
  135, 212, 227, 233, 306, 376, 448, 462, 466, 530, 596, 598, 601, 738, 823, 849, 884,
  // Spettro / Buio / Lotta
  94, 257, 260, 282, 302, 392, 429, 437, 442, 461, 468, 472, 475, 571, 609, 658, 663, 681, 979, 983,
  // Draghi & Pseudo classici
  149, 248, 373, 445, 635, 637
];

// Fascia 3 (Piani 26 - 40): Pseudo-leggendari, Forme Paradox e Pokémon S-Tier
const TIER_3_POKEMON = [
  // Pseudo-leggendari & S-Tier
  248, 373, 376, 445, 474, 485, 635, 706, 773, 784, 809, 887, 901, 908, 911, 914, 936, 937, 959, 964, 983, 998, 1000, 1018,
  // Forme Paradox (Cybernetici & Ancestrali)
  892, 894, 895, 984, 987, 990, 991, 1003, 1004, 1005, 1006
];

// Fascia 4 (Piani 41+): Ultra Creature, Singolarità e Leggendari Cibernetici
const TIER_4_POKEMON = [
  150, 384, 386, 483, 484, 487, 491, 493, 643, 644, 646, 649, 773, 791, 792, 793, 796, 797, 798, 800, 801, 803, 804, 805, 806, 807, 888, 889, 890, 898, 1007, 1008, 1010, 1022, 1023
];

// ==========================================
// ARCHETIPI ALLENATORI NPC PER FASCIA
// ==========================================

interface TowerNpcTemplate {
  name: string;
  type: string;
  sprite: string;
  quotes: string[];
}

const TIER_1_NPCS: TowerNpcTemplate[] = [
  {
    name: 'Hacker Novizio',
    type: 'Script Kiddie',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/supernerd-gen1.png',
    quotes: [
      'Ho compilato il mio primo script di combattimento. Vediamo se regge!',
      'Un semplice ciclo while() basterà a mandare KO la tua squadra!'
    ]
  },
  {
    name: 'Tester di Byte',
    type: 'Quality Assurance',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/youngster.png',
    quotes: [
      'Eseguo unit test su ogni turno. Non troverai falle nel mio codice!',
      'Nessun bug può sfuggire al mio piano di collaudo!'
    ]
  },
  {
    name: 'Cyber Punk',
    type: 'Ribelle Digitale',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/guitarist.png',
    quotes: [
      'Le onde radio della torre sono la mia musica. Balliamo!',
      'Sento il ritmo dei megahertz che pulsa nei miei Pokémon!'
    ]
  },
  {
    name: 'Dev Junior',
    type: 'Programmatore Front-End',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/scientist.png',
    quotes: [
      'I miei Pokémon sono ottimizzati con le ultime librerie open-source!',
      'Ho appena fatto il merge sul branch principale, sei pronto?'
    ]
  }
];

const TIER_2_NPCS: TowerNpcTemplate[] = [
  {
    name: 'Ace Trainer Digitale',
    type: 'Agente della Rete',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/acetrainer.png',
    quotes: [
      'La mia squadra è programmata per il gioco competitivo d\'élite.',
      'Calcolo il danno medio a mente prima ancora che tu scelga la mossa!'
    ]
  },
  {
    name: 'Cyber Hacker F',
    type: 'Specialista Crittografia',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/acetrainerf.png',
    quotes: [
      'Ho violato i parametri di velocità. Riuscirai a starmi dietro?',
      'La tua chiave di cifratura è troppo debole per resistere ai miei attacchi.'
    ]
  },
  {
    name: 'Data Analyst',
    type: 'Scienziato dei Big Data',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/scientist-gen4.png',
    quotes: [
      'I grafici predittivi mostrano il 98.7% di probabilità di vittoria per me.',
      'Ogni tua debolezza è stata memorizzata nel database.'
    ]
  },
  {
    name: 'Ghost in the Shell',
    type: 'Presenza nel Server',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/hexmaniac-gen6.png',
    quotes: [
      'I dati non muoiono mai... vagano per l\'etere in cerca di vendetta.',
      'Senti questo brivido glaciale? È il ping della sconfitta...'
    ]
  },
  {
    name: 'Infiltrato Shadow',
    type: 'Black Hat Ops',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/shadowtriad.png',
    quotes: [
      'Operazione furtiva nel mainframe... elimina ogni testimone!',
      'Un attacco a sorpresa dal buio dei pacchetti criptati!'
    ]
  }
];

const TIER_3_NPCS: TowerNpcTemplate[] = [
  {
    name: 'SysAdmin Supremo',
    type: 'Ingegnere di Sistema',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/colress.png',
    quotes: [
      'Ho il controllo di tutti i cluster. Nessuna eccezione non gestita passerà!',
      'Riconfigurazione dei registri in corso. Preparati alla disconnessione forzata!'
    ]
  },
  {
    name: 'Ingegnere Quantistico',
    type: 'Architetto dei Dati',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/steven.png',
    quotes: [
      'La potenza di calcolo della mia squadra supera la velocità della luce.',
      'I qubit dei miei Pokémon collassano sempre nello stato vincente.'
    ]
  },
  {
    name: 'Entità Glitch',
    type: 'Anomalia di Sistema',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/cyrus.png',
    quotes: [
      'Un mondo privo di errori... generato dalla riscrittura totale del codice sorgente.',
      'Cancellerò la tua partizione di memoria in un solo turno.'
    ]
  },
  {
    name: 'Master Hacker',
    type: 'Guardiano del Codice',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/n.png',
    quotes: [
      'I Pokémon digitali hanno un\'anima. Ascolto le loro frequenze.',
      'La vera forza risiede nell\'armonia tra algoritmo e istinto!'
    ]
  }
];

const TIER_4_NPCS: TowerNpcTemplate[] = [
  {
    name: 'Campione dell\'Ologramma',
    type: 'Matrice Suprema',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png',
    quotes: [
      'Hai raggiunto i confini della memoria virtuale. Mostrami la tua massima perfezione!',
      'Non esistono limiti che la determinazione non possa superare.'
    ]
  },
  {
    name: 'Super-Amministratore Root',
    type: 'Autorità Assoluta',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png',
    quotes: [
      'Tutti i nodi della torre rispondono ai miei comandi. Arrenditi.',
      'Il potere assoluto si misura in petabyte di puro dominio.'
    ]
  },
  {
    name: 'Lord del Mainframe',
    type: 'Leggenda del Terminale',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/red.png',
    quotes: [
      '......',
      '...!'
    ]
  }
];

// Boss Floor Data con sprite e citazioni dedicate
interface TowerBossInfo {
  name: string;
  type: string;
  sprite: string;
  quote: string;
}

const TOWER_BOSSES: TowerBossInfo[] = [
  {
    name: 'Boss: Firewall Sentinella',
    type: 'Protocollo di Sicurezza',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/scientist-gen4.png',
    quote: 'ATTIVAZIONE FIREWALL DI LIVELLO 1. Accesso non autorizzato rilevato!'
  },
  {
    name: 'Boss: Deadlock Guardiano',
    type: 'Blocco Critico',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/shadowtriad.png',
    quote: 'Risorse bloccate a tempo indeterminato. Nessun thread passerà!'
  },
  {
    name: 'Boss: Rootkit Mutante',
    type: 'Minaccia Zero-Day',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/supernerd-gen1.png',
    quote: 'Controllo totale dei tuoi permessi di root acquisito. Sei isolato!'
  },
  {
    name: 'Boss: Super-Daemon Kernel',
    type: 'Processo Primario',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/colress.png',
    quote: 'KERNEL PANIC IMMINENTE. I tuoi processi verranno terminati all\'istante.'
  },
  {
    name: 'Boss: Singolarità Neurale',
    type: 'Intelligenza Artificiale Evoluta',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/cyrus.png',
    quote: 'Ho simulato un miliardo di scontri. Hai perso in tutti.'
  },
  {
    name: 'Boss: Architetto del Mainframe',
    type: 'Creatore della Matrice',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/steven.png',
    quote: 'La memoria è infinita, ma la tua resistenza è giunta al termine.'
  },
  {
    name: 'Boss: Algoritmo Omega',
    type: 'Singolarità Quantica',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png',
    quote: 'L\'equazione della vittoria è completa. Il tuo destino è stato calcolato.'
  },
  {
    name: 'Boss: Avatar di Root',
    type: 'Dio del Sistema',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png',
    quote: 'Io sono il codice che governa questa torre. Chinatevi alla radice.'
  }
];

export function getRandomTowerCards(count: number = 3, existingCardIds: string[] = []): TowerCard[] {
  const available = TOWER_CARDS_POOL.filter(c => !existingCardIds.includes(c.id));
  const pool = available.length >= count ? available : TOWER_CARDS_POOL;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function generateTowerOpponent(floor: number): Promise<Trainer & { bossMutation?: BossMutationInfo }> {
  const isBoss = floor % 5 === 0;
  const teamSize = Math.min(6, Math.max(1, Math.floor(1 + floor / 4) + (isBoss ? 1 : 0)));
  const baseLevel = Math.min(100, Math.max(30, Math.floor(30 + floor * 3.2)));

  // Determina la fascia / tier di appartenenza in base al piano
  let pokemonPool: number[];
  let npcTemplates: TowerNpcTemplate[];

  if (floor <= 10) {
    pokemonPool = TIER_1_POKEMON;
    npcTemplates = TIER_1_NPCS;
  } else if (floor <= 25) {
    pokemonPool = TIER_2_POKEMON;
    npcTemplates = TIER_2_NPCS;
  } else if (floor <= 40) {
    pokemonPool = TIER_3_POKEMON;
    npcTemplates = TIER_3_NPCS;
  } else {
    pokemonPool = TIER_4_POKEMON;
    npcTemplates = TIER_4_NPCS;
  }

  const team: Pokemon[] = [];
  const usedPokes = new Set<number>();

  // Select boss mutation if boss floor
  let bossMutation: BossMutationInfo | undefined = undefined;
  if (isBoss) {
    const mutationKeys: BossMutationType[] = ['corazzato', 'overclocked', 'vampirico', 'corrotto'];
    const chosenType = mutationKeys[Math.floor(Math.random() * mutationKeys.length)];
    bossMutation = BOSS_MUTATIONS[chosenType];
  }

  for (let i = 0; i < teamSize; i++) {
    let pokeId: number;
    let attempts = 0;
    do {
      pokeId = pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
      attempts++;
    } while (usedPokes.has(pokeId) && attempts < 30 && usedPokes.size < pokemonPool.length);
    usedPokes.add(pokeId);

    const level = isBoss ? Math.min(100, baseLevel + 2) : Math.min(100, baseLevel + Math.floor(Math.random() * 3) - 1);
    try {
      let poke = await fetchPokemonData(pokeId, Math.max(1, level));

      // Boss Pokemon optimization: Perfect IVs (31) and Max EVs (252)
      if (isBoss) {
        const perfectIvs = { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 };
        const maxEvs = { hp: 128, attack: 252, defense: 0, spAtk: 252, spDef: 0, speed: 252 };
        const updatedStats = calculateStats(poke.baseStats, level, perfectIvs, maxEvs, poke.nature);
        poke = {
          ...poke,
          ivs: perfectIvs,
          evs: maxEvs,
          hp: updatedStats.hp,
          maxHp: updatedStats.hp,
          stats: {
            attack: updatedStats.attack,
            defense: updatedStats.defense,
            spAtk: updatedStats.spAtk,
            spDef: updatedStats.spDef,
            speed: updatedStats.speed
          }
        };
      }

      team.push(poke);
    } catch (e) {
      const fallbackId = pokemonPool[0] || 137;
      const poke = await fetchPokemonData(fallbackId, Math.max(1, level));
      team.push(poke);
    }
  }

  // Generazione Dati Allenatore (Boss o NPC procedurale della fascia)
  let name: string;
  let trainerType: string;
  let sprite: string;
  let dialogue: string;

  if (isBoss) {
    const bossIdx = Math.max(0, Math.floor(floor / 5) - 1) % TOWER_BOSSES.length;
    const bossData = TOWER_BOSSES[bossIdx];
    name = `${bossData.name} [P.${floor}]`;
    trainerType = bossData.type;
    sprite = bossData.sprite;
    dialogue = bossData.quote;
  } else {
    const chosenTemplate = npcTemplates[Math.floor(Math.random() * npcTemplates.length)];
    const chosenQuote = chosenTemplate.quotes[Math.floor(Math.random() * chosenTemplate.quotes.length)];
    name = `${chosenTemplate.name} [P.${floor}]`;
    trainerType = chosenTemplate.type;
    sprite = chosenTemplate.sprite;
    dialogue = chosenQuote;
  }

  return {
    id: `tower-bot-floor-${floor}-${Date.now()}`,
    name,
    type: trainerType,
    sprite,
    team,
    moneyReward: 1000 + floor * 500,
    quote: dialogue,
    winQuote: 'Exception: Processo sconfitto! Rilascio risorse in corso...',
    bossMutation
  };
}

