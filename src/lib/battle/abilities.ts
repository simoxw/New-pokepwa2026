import { Pokemon, Move } from '../../types/game';

export interface AbilityEffect {
  type: 'damage_mult' | 'stat_mult' | 'status_immune' | 'hp_regen' | 'other';
  value?: number;
  msg?: string;
}

/**
 * Checks if an ability triggers for a given context.
 */
export function checkAbility(
  pokemon: Pokemon, 
  context: 'on_hit' | 'on_turn_start' | 'on_turn_end' | 'on_move_use' | 'static',
  options?: { move?: Move, target?: Pokemon }
): AbilityEffect | null {
  const abilityName = pokemon.ability?.name.toLowerCase();

  switch (abilityName) {
    case 'erbaiuto': // Overgrow
      if (context === 'on_move_use' && options?.move?.type === 'grass' && pokemon.hp <= pokemon.maxHp / 3) {
        return { type: 'damage_mult', value: 1.5, msg: `${pokemon.name} attiva Erbaiuto! Le mosse Erba sono più potenti!` };
      }
      break;
    case 'aiutofuoco': // Blaze
      if (context === 'on_move_use' && options?.move?.type === 'fire' && pokemon.hp <= pokemon.maxHp / 3) {
        return { type: 'damage_mult', value: 1.5, msg: `${pokemon.name} attiva Aiutofuoco! Le mosse Fuoco sono più potenti!` };
      }
      break;
    case 'acquaiuto': // Torrent
      if (context === 'on_move_use' && options?.move?.type === 'water' && pokemon.hp <= pokemon.maxHp / 3) {
        return { type: 'damage_mult', value: 1.5, msg: `${pokemon.name} attiva Acquaiuto! Le mosse Acqua sono più potenti!` };
      }
      break;
    case 'statica': // Static
      if (context === 'on_hit' && options?.move?.category === 'physical' && Math.random() < 0.3) {
        return { type: 'other', msg: `La Statica di ${pokemon.name} ha paralizzato l'avversario!` };
      }
      break;
    case 'levitazione': // Levitate
      if (context === 'on_hit' && options?.move?.type === 'ground') {
        return { type: 'damage_mult', value: 0, msg: `${pokemon.name} evita l'attacco Terra grazie a Levitazione!` };
      }
      break;
  }

  return null;
}
