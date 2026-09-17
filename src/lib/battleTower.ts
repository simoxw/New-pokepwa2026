import { Pokemon, Trainer } from '../types/game';
import { fetchPokemonData } from './pokeapi';

export interface TowerCard {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
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
}

export const TOWER_CARDS_POOL: TowerCard[] = [
  {
    id: 'overclock-cpu',
    name: 'Overclock della CPU',
    rarity: 'common',
    icon: '⚡',
    description: '+25% Danno di Attacco, ma perdi il 10% di Difesa.',
    attackMultiplier: 1.25,
    defenseMultiplier: 0.90
  },
  {
    id: 'garbage-collection',
    name: 'Garbage Collection',
    rarity: 'rare',
    icon: '💊',
    description: 'Cura il 30% dei PS massimi di tutta la squadra dopo ogni vittoria.',
    healAfterKoPercent: 30
  },
  {
    id: 'fibra-10g',
    name: 'Banda Larga 10Gbps',
    rarity: 'common',
    icon: '🚀',
    description: '+30% Velocità, agisci quasi sempre per primo!',
    speedMultiplier: 1.30
  },
  {
    id: 'firewall-rigido',
    name: 'Firewall Rigido v4',
    rarity: 'rare',
    icon: '🛡️',
    description: 'Subisci il 20% in meno di danno da tutte le mosse.',
    defenseMultiplier: 1.25
  },
  {
    id: 'pacchetti-vampiro',
    name: 'Drenaggio di Pacchetti',
    rarity: 'epic',
    icon: '🩸',
    description: 'Ruba il 20% dei danni inflitti per curare il tuo Pokémon attivo.',
    lifeStealPercent: 20
  },
  {
    id: 'algoritmo-euristico',
    name: 'Algoritmo Euristico',
    rarity: 'rare',
    icon: '🎯',
    description: '+25% probabilità di Brutto Colpo (Critico) su ogni mossa.',
    critChanceBonus: 25
  },
  {
    id: 'buffer-overflow',
    name: 'Buffer Overflow',
    rarity: 'epic',
    icon: '💥',
    description: '+45% Danno se i tuoi PS scendono sotto il 40%.',
    lowHpBonus: 1.45
  },
  {
    id: 'schivata-quantica',
    name: 'Schivata Quantica (RNG)',
    rarity: 'epic',
    icon: '🎲',
    description: '15% di probabilità di schivare completamente un attacco subito.',
    dodgeChance: 15
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
    description: 'Inizi ogni round con 30 PS di Barriera protettiva extra.',
    shieldHp: 30
  }
];

export function getRandomTowerCards(count: number = 3, existingCardIds: string[] = []): TowerCard[] {
  const available = TOWER_CARDS_POOL.filter(c => !existingCardIds.includes(c.id));
  const shuffled = [...(available.length >= count ? available : TOWER_CARDS_POOL)].sort(() => Math.random() - 0.5);
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

export async function generateTowerOpponent(floor: number): Promise<Trainer> {
  const isBoss = floor % 5 === 0;
  const teamSize = Math.min(6, Math.max(1, Math.floor(1 + floor / 4) + (isBoss ? 1 : 0)));
  const baseLevel = Math.min(95, Math.max(25, 28 + Math.floor(floor * 2.5)));

  const team: Pokemon[] = [];
  const usedPokes = new Set<number>();

  for (let i = 0; i < teamSize; i++) {
    let pokeId: number;
    do {
      pokeId = TOWER_POKEMON_POOL[Math.floor(Math.random() * TOWER_POKEMON_POOL.length)];
    } while (usedPokes.has(pokeId) && usedPokes.size < TOWER_POKEMON_POOL.length);
    usedPokes.add(pokeId);

    const level = isBoss ? baseLevel + 2 : baseLevel + Math.floor(Math.random() * 3) - 1;
    try {
      const poke = await fetchPokemonData(pokeId, Math.max(1, level));
      team.push(poke);
    } catch (e) {
      // Fallback in case of fetch error
      const poke = await fetchPokemonData(137, Math.max(1, level)); // Porygon
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
    winQuote: 'Exception: Processo sconfitto! Rilascio risorse in corso...'
  };
}
