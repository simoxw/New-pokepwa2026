import { Badge } from '../types/game';

export const BADGES: Badge[] = [
  {
    id: 'badge-1',
    name: 'Medaglia Selfie',
    description: 'Ottenuta sconfiggendo il Capopalestra nel Bosco dei Selfie.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/1.png',
    unlockedArea: 'prateria',
    bossName: 'Giovane Pino'
  },
  {
    id: 'badge-2',
    name: 'Medaglia Lag',
    description: 'Ottenuta sconfiggendo il Capopalestra nella Prateria del Lag.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/9.png',
    unlockedArea: 'vulcano',
    bossName: 'Bullo Luca'
  },
  {
    id: 'badge-3',
    name: 'Medaglia Volt',
    description: 'Ottenuta sconfiggendo il ricercatore folle.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/3.png',
    unlockedArea: 'laboratorio',
    bossName: 'Scienziato Filippo'
  },
  {
    id: 'badge-4',
    name: 'Medaglia Nettuno',
    description: 'Sconfiggi il pescatore leggendario.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/2.png',
    unlockedArea: 'spiaggia',
    bossName: 'Pescatore Gianni'
  },
  {
    id: 'badge-5',
    name: 'Medaglia Spettro',
    description: 'Sconfiggi l\'entità misteriosa nel cimitero.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/12.png',
    unlockedArea: 'cimitero',
    bossName: 'Ombretta'
  },
  {
    id: 'badge-6',
    name: 'Medaglia Calore',
    description: 'Sconfiggi il piromane del vulcano.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/7.png',
    unlockedArea: 'grotta',
    bossName: 'Piromane Leo'
  },
  {
    id: 'badge-7',
    name: 'Medaglia Glaciale',
    description: 'Sconfiggi l\'alpinista del Picco del Buffering.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/15.png',
    unlockedArea: 'montagna',
    bossName: 'Alpinista Marco'
  },
  {
    id: 'badge-8',
    name: 'Medaglia Spettrale',
    description: 'Sconfiggi l\'entità della Rovina dei Frame.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/8.png',
    unlockedArea: 'rovina',
    bossName: 'Ombra Silente'
  },
  {
    id: 'badge-9',
    name: 'Medaglia Palude',
    description: 'Sconfiggi il guardiano della Palude del Bug.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/6.png',
    unlockedArea: 'palude',
    bossName: 'Entomologo Ezio'
  },
  {
    id: 'badge-10',
    name: 'Medaglia Server',
    description: 'Sconfiggi l\'Amministratore di Sistema.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/14.png',
    unlockedArea: 'isola-server',
    bossName: 'Admin Root'
  }
];

export function isAreaUnlocked(areaId: string, playerBadges: string[]): boolean {
  // Areas that are always unlocked
  if (['villaggio', 'bosco'].includes(areaId)) return true;

  // Find badges that unlock this area
  const unlockingBadge = BADGES.find(b => b.unlockedArea === areaId);
  if (!unlockingBadge) return true; // If no badge unlocks it, assume it's open (or managed elsewhere)

  return playerBadges.includes(unlockingBadge.id);
}

export function getBadgeForBoss(bossName: string): Badge | undefined {
  return BADGES.find(b => b.bossName === bossName);
}
