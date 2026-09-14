import { Badge } from '../types/game';

export const BADGES: Badge[] = [
  {
    id: 'badge-1',
    name: 'Medaglia Selfie',
    description: 'Ottenuta sconfiggendo il Capopalestra nel Bosco dei Selfie.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/badge-1.png', // Placeholder
    unlockedArea: 'prateria',
    bossName: 'Giovane Pino'
  },
  {
    id: 'badge-2',
    name: 'Medaglia Lag',
    description: 'Ottenuta sconfiggendo il Capopalestra nella Prateria del Lag.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/badge-2.png', // Placeholder
    unlockedArea: 'vulcano',
    bossName: 'Bullo Luca'
  },
  {
    id: 'badge-3',
    name: 'Medaglia Volt',
    description: 'Ottenuta sconfiggendo il ricercatore folle.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/badge-3.png', // Placeholder
    unlockedArea: 'laboratorio',
    bossName: 'Scienziato Filippo'
  },
  {
    id: 'badge-4',
    name: 'Medaglia Nettuno',
    description: 'Sconfiggi il pescatore leggendario.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/badge-4.png',
    unlockedArea: 'spiaggia',
    bossName: 'Pescatore Gianni'
  },
  {
    id: 'badge-5',
    name: 'Medaglia Spettro',
    description: 'Sconfiggi l\'entità misteriosa nel cimitero.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/badge-5.png',
    unlockedArea: 'cimitero',
    bossName: 'Ombretta'
  },
  {
    id: 'badge-6',
    name: 'Medaglia Calore',
    description: 'Sconfiggi il piromane del vulcano.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/badge-6.png',
    unlockedArea: 'grotta',
    bossName: 'Piromane Leo'
  },
  {
    id: 'badge-7',
    name: 'Medaglia Glaciale',
    description: 'Sconfiggi l\'alpinista del Picco del Buffering.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/badge-7.png',
    unlockedArea: 'montagna',
    bossName: 'Alpinista Marco'
  },
  {
    id: 'badge-8',
    name: 'Medaglia Spettrale',
    description: 'Sconfiggi l\'entità della Rovina dei Frame.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/badge-8.png',
    unlockedArea: 'rovina',
    bossName: 'Ombra Silente'
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
