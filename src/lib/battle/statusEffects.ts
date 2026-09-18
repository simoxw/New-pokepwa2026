import { Pokemon, Move } from '../../types/game';

export type StatusCondition = 'paralyzed' | 'poisoned' | 'sleep' | 'frozen' | 'burned';

export interface VolatileStatus {
  confusionTurns?: number;
  isFlinched?: boolean;
  lockedMove?: Move;
  lockedTurns?: number;
  charging?: boolean;
  chargingState?: 'fly' | 'dig' | 'dive' | 'bounce' | 'charge';
  recharging?: boolean;
  trapTurns?: number;
  isProtected?: boolean;
  protectStreak?: number;
}

export function checkConfusion(pokemon: Pokemon, confusionTurns: number = 0): {
  isConfused: boolean;
  hurtSelf: boolean;
  damage?: number;
  newTurns: number;
  msg: string;
} {
  if (confusionTurns <= 0) {
    return { isConfused: false, hurtSelf: false, newTurns: 0, msg: '' };
  }

  if (confusionTurns === 1) {
    return {
      isConfused: false,
      hurtSelf: false,
      newTurns: 0,
      msg: `${pokemon.name} non è più confuso!`
    };
  }

  const nextTurns = confusionTurns - 1;
  // 33% chance to hurt self in confusion
  const hurtSelf = Math.random() < 0.33;

  if (hurtSelf) {
    // Standard Pokemon confusion self-hit: 40 power physical, using attacker's own attack and defense
    const atk = Math.max(1, pokemon.stats.attack);
    const def = Math.max(1, pokemon.stats.defense);
    const selfDmg = Math.max(1, Math.floor((Math.floor((2 * pokemon.level / 5 + 2) * 40 * atk / def) / 50) + 2));

    return {
      isConfused: true,
      hurtSelf: true,
      damage: selfDmg,
      newTurns: nextTurns,
      msg: `${pokemon.name} è così confuso da colpirsi da solo!`
    };
  }

  return {
    isConfused: true,
    hurtSelf: false,
    newTurns: nextTurns,
    msg: `${pokemon.name} è confuso!`
  };
}

export function checkFlinch(pokemon: Pokemon, isFlinched?: boolean): { canAct: boolean; msg?: string } {
  if (isFlinched) {
    return {
      canAct: false,
      msg: `${pokemon.name} ha tentennato e non riesce a muoversi!`
    };
  }
  return { canAct: true };
}

export function canMove(pokemon: Pokemon): { 
  canMove: boolean; 
  msg?: string; 
  newStatus?: StatusCondition; 
  newDuration?: number;
  statusChanged?: boolean;
} {
  if (!pokemon.status) return { canMove: true };

  switch (pokemon.status) {
    case 'paralyzed':
      if (Math.random() < 0.25) {
        return { 
          canMove: false, 
          msg: `${pokemon.name} è paralizzato! Non riesce a muoversi!`,
          newStatus: 'paralyzed',
          newDuration: pokemon.statusDuration
        };
      }
      return { 
        canMove: true, 
        newStatus: 'paralyzed', 
        newDuration: pokemon.statusDuration 
      };

    case 'sleep': {
      const duration = pokemon.statusDuration || 0;
      if (duration <= 0) {
        return { 
          canMove: true, 
          msg: `${pokemon.name} si è svegliato!`, 
          newStatus: undefined, 
          newDuration: 0,
          statusChanged: true
        };
      }
      return { 
        canMove: false, 
        msg: `${pokemon.name} sta dormendo profondamente...`, 
        newStatus: 'sleep',
        newDuration: duration - 1,
        statusChanged: true
      };
    }

    case 'frozen':
      if (Math.random() < 0.20) {
        return { 
          canMove: true, 
          msg: `${pokemon.name} si è liberato dal ghiaccio!`, 
          newStatus: undefined, 
          newDuration: 0,
          statusChanged: true
        };
      }
      return { 
        canMove: false, 
        msg: `${pokemon.name} è congelato!`,
        newStatus: 'frozen',
        newDuration: pokemon.statusDuration
      };

    case 'poisoned':
      return { 
        canMove: true, 
        newStatus: 'poisoned', 
        newDuration: pokemon.statusDuration 
      };

    case 'burned':
      return { 
        canMove: true, 
        newStatus: 'burned', 
        newDuration: pokemon.statusDuration 
      };

    default:
      return { 
        canMove: true, 
        newStatus: pokemon.status, 
        newDuration: pokemon.statusDuration 
      };
  }
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

export function isImmuneToStatus(types: string[], status: StatusCondition): boolean {
  const lowerTypes = types.map(t => t.toLowerCase());
  switch (status) {
    case 'paralyzed':
      return lowerTypes.includes('electric');
    case 'burned':
      return lowerTypes.includes('fire');
    case 'poisoned':
      return lowerTypes.includes('poison') || lowerTypes.includes('steel');
    case 'frozen':
      return lowerTypes.includes('ice');
    case 'sleep':
      return false;
    default:
      return false;
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
