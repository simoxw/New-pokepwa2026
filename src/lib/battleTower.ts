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
    description: '+12% Danno di Attacco, ma perdi il 5% di Difesa.',
    attackMultiplier: 1.12,
    defenseMultiplier: 0.95
  },
  {
    id: 'garbage-collection',
    name: 'Garbage Collection',
    rarity: 'rare',
    icon: '💊',
    description: 'Cura il 15% dei PS massimi di tutta la squadra dopo ogni vittoria.',
    healAfterKoPercent: 15
  },
  {
    id: 'fibra-10g',
    name: 'Banda Larga 10Gbps',
    rarity: 'common',
    icon: '🚀',
    description: '+12% Velocità per il tuo Pokémon.',
    speedMultiplier: 1.12
  },
  {
    id: 'firewall-rigido',
    name: 'Firewall Rigido v4',
    rarity: 'rare',
    icon: '🛡️',
    description: 'Subisci il 10% in meno di danno da tutte le mosse.',
    defenseMultiplier: 1.10
  },
  {
    id: 'pacchetti-vampiro',
    name: 'Drenaggio di Pacchetti',
    rarity: 'epic',
    icon: '🩸',
    description: 'Ruba l\'8% dei danni inflitti per curare il tuo Pokémon attivo.',
    lifeStealPercent: 8
  },
  {
    id: 'algoritmo-euristico',
    name: 'Algoritmo Euristico',
    rarity: 'rare',
    icon: '🎯',
    description: '+10% probabilità di Brutto Colpo (Critico) su ogni mossa.',
    critChanceBonus: 10
  },
  {
    id: 'buffer-overflow',
    name: 'Buffer Overflow',
    rarity: 'epic',
    icon: '💥',
    description: '+20% Danno se i tuoi PS scendono sotto il 35%.',
    lowHpBonus: 1.20
  },
  {
    id: 'schivata-quantica',
    name: 'Schivata Quantica (RNG)',
    rarity: 'epic',
    icon: '🎲',
    description: '8% di probabilità di schivare completamente un attacco subito.',
    dodgeChance: 8
  },
  {
    id: 'crypto-miner',
    name: 'Background Miner',
    rarity: 'common',
    icon: '💰',
    description: '+1.500 PokéDollari extra ad ogni piano superato.',
    bonusMoney: 1500
  },
  {
    id: 'power-shield',
    name: 'Scudo Energetico UPS',
    rarity: 'legendary',
    icon: '🔋',
    description: 'Inizi ogni round con 15 PS di Barriera protettiva extra.',
    shieldHp: 15
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
    description: '+3.000 PokéDollari a piano, ma il tuo Pokémon in campo perde il 5% di PS ad inizio scontro.',
    bonusMoney: 3000,
    startHpSelfDamagePercent: 5
  },
  {
    id: 'critical-bug-cursed',
    name: 'Bug Critico [Corrotto]',
    rarity: 'cursed',
    icon: '🎯',
    description: '+25% Probabilità di Brutto Colpo, ma la precisione delle tue mosse scende del 10%.',
    critChanceBonus: 25,
    accuracyPenaltyPercent: 10
  }
];

export function getRandomTowerCards(count: number = 3, existingCardIds: string[] = []): TowerCard[] {
  const available = TOWER_CARDS_POOL.filter(c => !existingCardIds.includes(c.id));
  const pool = available.length >= count ? available : TOWER_CARDS_POOL;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const TOWER_POKEMON_POOL = [
  // Fast & tech
  135, 137, 233, 474, 479, 81, 82, 462, 100, 101, 125, 466, 25, 26, 311, 312,
  // Tough & ghost/cyber
  94, 200, 429, 302, 354, 442, 609, 374, 375, 376, 227, 306, 212, 448, 658
];

const BOT_NAMES = [
  'Daemon di Rete', 'Thread #404', 'Garbage Collector', 'Script Kiddie',
  'Zombie Process', 'Algoritmo Ricorsivo', 'SysAdmin Insonne', 'Bug Vivente',
  'Processo Orfano', 'AI Senza Filtri', 'Compilatore Furioso', 'Data Miner'
];

const BOSS_NAMES = [
  { name: 'Boss: Super-Daemon Kernel', quote: 'KERNEL PANIC IMMINENTE. I tuoi processi verranno terminati.' },
  { name: 'Boss: Deadlock Guardiano', quote: 'Risorse bloccate a tempo indeterminato. Nessun thread passerà!' },
  { name: 'Boss: Rootkit Mutante', quote: 'Controllo totale dei tuoi permessi di root acquisito.' },
  { name: 'Boss: Singolarità Neurale', quote: 'Ho simulato un miliardo di scontri. Hai perso in tutti.' },
  { name: 'Boss: Architetto del Mainframe', quote: 'La memoria è infinita, ma la tua resistenza no.' }
];

export async function generateTowerOpponent(floor: number): Promise<Trainer & { bossMutation?: BossMutationInfo }> {
  const isBoss = floor % 5 === 0;
  const teamSize = Math.min(6, Math.max(1, Math.floor(1 + floor / 4) + (isBoss ? 1 : 0)));
  const baseLevel = Math.min(100, Math.max(30, Math.floor(30 + floor * 3.2)));

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
    do {
      pokeId = TOWER_POKEMON_POOL[Math.floor(Math.random() * TOWER_POKEMON_POOL.length)];
    } while (usedPokes.has(pokeId) && usedPokes.size < TOWER_POKEMON_POOL.length);
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
      const poke = await fetchPokemonData(137, Math.max(1, level));
      team.push(poke);
    }
  }

  const bossIdx = (Math.floor(floor / 5) - 1) % BOSS_NAMES.length;
  const bossData = BOSS_NAMES[bossIdx >= 0 ? bossIdx : 0];

  const name = isBoss ? bossData.name : `${BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]} [P.${floor}]`;
  const dialogue = isBoss 
    ? bossData.quote 
    : `Floor ${floor} verificato. Preparati all'esecuzione del benchmark!`;

  return {
    id: `tower-bot-floor-${floor}-${Date.now()}`,
    name,
    type: isBoss ? 'Guardiano del Mainframe' : 'Processo Procedurale',
    sprite: isBoss 
      ? 'https://play.pokemonshowdown.com/sprites/trainers/colress.png' 
      : 'https://play.pokemonshowdown.com/sprites/trainers/scientist.png',
    team,
    moneyReward: 1000 + floor * 500,
    quote: dialogue,
    winQuote: 'Exception: Processo sconfitto! Rilascio risorse in corso...',
    bossMutation
  };
}

