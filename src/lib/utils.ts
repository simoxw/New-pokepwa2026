import { Pokemon, GameState } from '../types/game';

/**
 * Encodes a Pokemon object to a Base64 string.
 */
export function encodePokemon(pokemon: Pokemon): string {
  try {
    const json = JSON.stringify(pokemon);
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error('Failed to encode pokemon', e);
    return '';
  }
}

/**
 * Decodes a Base64 string to a Pokemon object.
 */
export function decodePokemon(base64: string): Pokemon | null {
  try {
    const json = decodeURIComponent(atob(base64));
    const pokemon = JSON.parse(json) as Pokemon;
    
    // Basic validation
    if (!pokemon.id || !pokemon.name || !pokemon.moves) {
      throw new Error('Invalid pokemon data structure');
    }
    
    return pokemon;
  } catch (e) {
    console.error('Failed to decode pokemon', e);
    return null;
  }
}

/**
 * Encodes the entire team for local battle.
 */
export function encodeTeam(team: Pokemon[]): string {
  try {
    const json = JSON.stringify(team);
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error('Failed to encode team', e);
    return '';
  }
}

/**
 * Decodes a team from Base64.
 */
export function decodeTeam(base64: string): Pokemon[] | null {
  try {
    const json = decodeURIComponent(atob(base64));
    const team = JSON.parse(json) as Pokemon[];
    
    if (!Array.isArray(team) || team.length === 0) {
      throw new Error('Invalid team data');
    }
    
    return team;
  } catch (e) {
    console.error('Failed to decode team', e);
    return null;
  }
}

/**
 * Exports the game state to a JSON file.
 */
export function exportGameState(state: GameState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pokepwa_save_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Validates a loaded game state.
 */
export function validateGameState(data: any): data is GameState {
  return (
    data &&
    data.player &&
    Array.isArray(data.player.team) &&
    Array.isArray(data.player.box) &&
    typeof data.player.money === 'number'
  );
}
