import { Pokemon } from '../../types/game';

export type StatusCondition = 'paralyzed' | 'poisoned' | 'sleep' | 'frozen' | 'burned';

export function canMove(pokemon: Pokemon): { canMove: boolean; msg?: string; newStatus?: StatusCondition; newDuration?: number } {
  if (!pokemon.status) return { canMove: true };

  switch (pokemon.status) {
    case 'paralyzed':
      if (Math.random() < 0.25) {
        return { canMove: false, msg: `${pokemon.name} è paralizzato! Non riesce a muoversi!` };
      }
      break;
    case 'sleep':
      const duration = pokemon.statusDuration || 0;
      if (duration <= 0) {
        return { canMove: true, msg: `${pokemon.name} si è svegliato!`, newStatus: undefined, newDuration: 0 };
      }
      return { canMove: false, msg: `${pokemon.name} sta dormendo profondamente...`, newDuration: duration - 1 };
    case 'frozen':
      if (Math.random() < 0.20) {
        return { canMove: true, msg: `${pokemon.name} si è liberato dal ghiaccio!`, newStatus: undefined, newDuration: 0 };
      }
      return { canMove: false, msg: `${pokemon.name} è congelato!` };
    default:
      break;
  }

  return { canMove: true };
}

export function getStatusEffect(pokemon: Pokemon): { damage?: number; msg?: string } {
  if (!pokemon.status) return {};

  switch (pokemon.status) {
    case 'poisoned':
      return { 
        damage: Math.max(1, Math.floor(pokemon.maxHp / 8)), 
        msg: `${pokemon.name} soffre per il veleno!` 
      };
    case 'burned':
      return { 
        damage: Math.max(1, Math.floor(pokemon.maxHp / 16)), 
        msg: `${pokemon.name} soffre per la scottatura!` 
      };
    default:
      return {};
  }
}

/**
 * Applica modificatori alle statistiche basati sugli effetti di stato.
 */
export function applyStatusStatModifiers(stats: Pokemon['stats'], status?: StatusCondition) {
  const modifiedStats = { ...stats };
  if (!status) return modifiedStats;

  if (status === 'paralyzed') {
    modifiedStats.speed = Math.floor(modifiedStats.speed * 0.5);
  } else if (status === 'burned') {
    // In realtà la scottatura dimezza l'attacco, non la statistica direttamente,
    // ma per semplicità qui modifichiamo la statistica se usata nel calcolo danno.
    modifiedStats.attack = Math.floor(modifiedStats.attack * 0.5);
  }

  return modifiedStats;
}
