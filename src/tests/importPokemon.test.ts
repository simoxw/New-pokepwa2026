import { describe, it, expect } from 'vitest';
import { decodePokemon, normalizePokemon } from '../lib/utils';

describe('Pokemon Import & Normalization', () => {
  it('should safely decode external N64 Pokemon base64 payload without missing sprites error', () => {
    // Sample base64 payload without sprites object
    const samplePayload = 'eyJpZCI6Im5mNzVnMDZwYSIsInBva2Vtb25JZCI6ODYsIm5hbWUiOiJTZWVsIiwibGV2ZWwiOjYsImV4cCI6MjE2LCJ0eXBlcyI6WyJ3YXRlciJdLCJiYXNlU3RhdHMiOnsiaHAiOjY1LCJhdHRhY2siOjQ1LCJkZWZlbnNlIjo1NSwic3BBdGsiOjQ1LCJzcERlZiI6NzAsInNwZWVkIjo0NX0sInNwcml0ZVVybCI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9Qb2tlQVBJL3Nwcml0ZXMvbWFzdGVyL3Nwcml0ZXMvcG9rZW1vbi9vdGhlci9vZmZpY2lhbC1hcnR3b3JrLzg2LnBuZyJ9';
    
    const decoded = decodePokemon(samplePayload);
    expect(decoded).not.toBeNull();
    expect(decoded?.name).toBe('Seel');
    expect(decoded?.id).toBe(86);
    expect(decoded?.sprites).toBeDefined();
    expect(decoded?.sprites.front).toContain('86.png');
    expect(decoded?.sprites.artwork).toContain('86.png');
  });

  it('should normalize any raw object lacking sprites object', () => {
    const raw = {
      id: 'custom-id',
      pokemonId: 25,
      name: 'Pikachu',
      spriteUrl: 'https://example.com/pikachu.png'
    };

    const normalized = normalizePokemon(raw);
    expect(normalized.sprites).toBeDefined();
    expect(normalized.sprites.front).toBe('https://example.com/pikachu.png');
    expect(normalized.sprites.artwork).toBe('https://example.com/pikachu.png');
    expect(normalized.id).toBe(25);
  });

  it('should handle truncated base64 payload from user copy-paste', () => {
    // Truncated payload cut off at priority
    const truncatedPayload = 'eyJpZCI6Im5mNzVnMDZwYSIsInBva2Vtb25JZCI6ODYsIm5hbWUiOiJTZWVsIiwibGV2ZWwiOjYsImV4cCI6MjE2LCJ0eXBlcyI6WyJ3YXRlciJdLCJiYXNlU3RhdHMiOnsiaHAiOjY1LCJhdHRhY2siOjQ1LCJkZWZlbnNlIjo1NSwic3BBdGsiOjQ1LCJzcERlZiI6NzAsInNwZWVkIjo0NX0sIml2cyI6eyJocCI6NCwiYXR0YWNrIjoxMiwiZGVmZW5zZSI6MjIsInNwQXRrIjoxLCJzcERlZiI6NSwic3BlZWQiOjZ9LCJldnMiOnsiaHAiOjAsImF0dGFjayI6MCwiZGVmZW5zZSI6MCwic3BBdGsiOjAsInNwRGVmIjowLCJzcGVlZCI6MH0sInN0YXRzIjp7ImhwIjoyNCwiYXR0YWNrIjoxMSwiZGVmZW5zZSI6MTIsInNwQXRrIjoxMSwic3BEZWYiOjExLCJzcGVlZCI6MTB9LCJuYXR1cmUiOiJSYXNoIiwibW92ZXMiOlt7ImlkIjoiNDUiLCJuYW1lIjoiUnVnZ2l0byIsInR5cGUiOiJub3JtYWwiLCJwb3dlciI6MCwiYWNjdXJhY3kiOjEwMCwicHAiOjQwLCJtYXhQcCI6NDAsInByaW9yaXR5Ijo';
    
    const decoded = decodePokemon(truncatedPayload);
    expect(decoded).not.toBeNull();
    expect(decoded?.name).toBe('Seel');
    expect(decoded?.id).toBe(86);
    expect(decoded?.sprites.artwork).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/86.png');
    expect(decoded?.sprites.front).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/86.png');
    expect(decoded?.level).toBe(6);
    expect(decoded?.experience).toBe(0);
    expect(decoded?.nextLevelExp).toBe(127);
  });

  it('should normalize Pokedesk exp field into native experience and nextLevelExp', () => {
    const pokedeskRaw = {
      pokemonId: 86,
      name: 'Seel',
      level: 6,
      exp: 216
    };

    const normalized = normalizePokemon(pokedeskRaw);
    expect(normalized.level).toBe(6);
    expect(normalized.experience).toBe(0);
    expect(normalized.nextLevelExp).toBe(127); // 7^3 - 6^3 = 343 - 216 = 127
  });

  it('should auto-correct mismatched species ID (e.g. name Poliwrath with legacy ID 61 -> resolved to 62)', () => {
    const mismatchedPokemon = {
      id: 61,
      name: 'Poliwrath',
      level: 56,
      types: ['water', 'fighting']
    };

    const normalized = normalizePokemon(mismatchedPokemon);
    expect(normalized.id).toBe(62);
    expect(normalized.sprites.artwork).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/62.png');
    expect(normalized.sprites.front).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/62.png');
  });

  it('should safely normalize Pokemon with object/non-string sprites structures without throwing', () => {
    const rawWithNestedSprites = {
      id: 25,
      name: 'Pikachu',
      level: 10,
      sprites: {
        animated: { front_default: 'https://example.com/pika.gif' },
        artwork: { front_default: 'https://example.com/pika.png' },
        front: null
      }
    };

    expect(() => normalizePokemon(rawWithNestedSprites)).not.toThrow();
    const normalized = normalizePokemon(rawWithNestedSprites);
    expect(normalized.sprites).toBeDefined();
    expect(typeof normalized.sprites.artwork).toBe('string');
    expect(typeof normalized.sprites.animated).toBe('string');
  });
});
