import { Pokemon } from '../types/game';

/**
 * Fully restores a Pokemon:
 * - Restores HP to maxHp
 * - Cures all status conditions (burn, poison, paralysis, sleep, freeze)
 * - Resets statusDuration
 * - Fully restores all move PP to maxPp (or 35 default)
 */
export function fullyHealPokemon(pokemon: Pokemon): Pokemon {
  return {
    ...pokemon,
    hp: pokemon.maxHp,
    status: undefined,
    statusDuration: undefined,
    moves: (pokemon.moves || []).map(m => {
      const maxPp = typeof m.maxPp === 'number' && m.maxPp > 0 
        ? m.maxPp 
        : (typeof m.pp === 'number' && m.pp > 0 ? m.pp : 35);
      return {
        ...m,
        maxPp,
        pp: maxPp
      };
    })
  };
}
