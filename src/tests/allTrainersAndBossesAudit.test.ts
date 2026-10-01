import { describe, it, expect } from 'vitest';
import { LEGENDARY_BOSSES } from '../data/legendaryBosses';
import { TRAINERS_DATA } from '../data/trainers';
import { getFallbackPokemonData } from '../data/pokemonFallbacks';
import { getMoveByName } from '../data/movesData';

describe('Comprehensive Trainers, Bosses, and Moves Audit', () => {
  it('identifies and verifies all missing Pokemon IDs in Bosses and Trainers', () => {
    const missingBossIds = new Set<number>();
    const missingTrainerIds = new Set<number>();

    for (const boss of LEGENDARY_BOSSES) {
      for (const pkmn of boss.teamPokemon) {
        const data = getFallbackPokemonData(pkmn.id);
        if (data.name.includes('Pokémon #')) {
          missingBossIds.add(pkmn.id);
        }
      }
      const reward = getFallbackPokemonData(boss.rewardPokemon.id);
      if (reward.name.includes('Pokémon #')) {
        missingBossIds.add(boss.rewardPokemon.id);
      }
    }

    for (const [trainerKey, trainer] of Object.entries(TRAINERS_DATA)) {
      for (const p of trainer.teamIds) {
        const data = getFallbackPokemonData(p.id);
        if (data.name.includes('Pokémon #')) {
          missingTrainerIds.add(p.id);
        }
      }
    }

    console.log('Missing Boss IDs:', Array.from(missingBossIds));
    console.log('Missing Trainer IDs:', Array.from(missingTrainerIds));

    expect(Array.from(missingBossIds)).toEqual([]);
    expect(Array.from(missingTrainerIds)).toEqual([]);
  });

  it('all regular and Gym/League trainers have valid pokemon fallback data and real types', () => {
    const naturallyNormalPokemonIds = new Set([
      19, 20, 16, 17, 18, 52, 53, 108, 113, 115, 128, 137, 143, 161, 162, 163, 164, 
      206, 216, 217, 231, 232, 233, 234, 235, 241, 242, 263, 264, 287, 288, 289, 293, 294, 295, 
      300, 301, 327, 335, 351, 352, 399, 400, 424, 427, 428, 431, 432, 440, 474, 486, 
      504, 505, 506, 507, 508, 519, 520, 521, 531, 572, 573, 585, 586, 626, 648, 659, 
      660, 676, 731, 732, 734, 735, 759, 760, 765, 771, 773, 775, 819, 820, 915, 916
    ]);

    for (const [trainerKey, trainer] of Object.entries(TRAINERS_DATA)) {
      for (const p of trainer.teamIds) {
        const data = getFallbackPokemonData(p.id);
        expect(data, `Trainer ${trainer.name} has missing fallback for #${p.id}`).toBeDefined();
        expect(data.name).not.toContain('Pokémon #');
        expect(data.types.length).toBeGreaterThan(0);
        if (!naturallyNormalPokemonIds.has(p.id)) {
          expect(data.types, `Trainer ${trainer.name} Pokemon ${data.name} should not be purely normal`).not.toEqual(['normal']);
        }
      }
    }
  });

  it('all custom moves used by Bosses resolve to accurate non-fallback moves', () => {
    const fallbackMoves: string[] = [];
    for (const boss of LEGENDARY_BOSSES) {
      for (const pkmn of boss.teamPokemon) {
        if (pkmn.customMoves) {
          for (const mName of pkmn.customMoves) {
            const move = getMoveByName(mName);
            if (move.pp === 35 && move.power === 45) {
              fallbackMoves.push(`Boss ${boss.name} (${pkmn.name}): "${mName}" -> type: ${move.type}, power: ${move.power}`);
            }
            expect(move, `Boss ${boss.name} Pokemon ${pkmn.name} has invalid move: ${mName}`).toBeDefined();
            expect(move.name.toLowerCase()).not.toBe('azione');
            expect(move.type).toBeDefined();
            expect(move.category).toMatch(/^(physical|special|status)$/);
            if (move.category !== 'status') {
              expect(move.power, `Move ${mName} should have power > 0`).toBeGreaterThan(0);
            }
          }
        }
      }

      // Check reward moves
      for (const mName of boss.rewardPokemon.moves) {
        const move = getMoveByName(mName);
        if (move.pp === 35 && move.power === 45) {
          fallbackMoves.push(`Boss ${boss.name} Reward (${boss.rewardPokemon.name}): "${mName}" -> type: ${move.type}, power: ${move.power}`);
        }
        expect(move, `Boss ${boss.name} Reward Pokemon has invalid move: ${mName}`).toBeDefined();
        expect(move.name.toLowerCase()).not.toBe('azione');
      }
    }
    console.log('Detected Fallback Moves:', fallbackMoves);
    expect(fallbackMoves).toEqual([]);
  });
});
