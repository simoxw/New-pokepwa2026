import { describe, it, expect } from 'vitest';
import { SPECIAL_CHEAT_POKEMON_CATALOG } from '../components/BossRewardsCheatModal';
import { LEGENDARY_BOSSES } from '../data/legendaryBosses';
import { normalizePokemon } from '../lib/utils';

describe('Boss Rewards Cheat Catalog & Generator', () => {
  it('catalog contains all legendary bosses reward specs', () => {
    expect(SPECIAL_CHEAT_POKEMON_CATALOG.length).toBeGreaterThanOrEqual(LEGENDARY_BOSSES.length);

    for (const boss of LEGENDARY_BOSSES) {
      const match = SPECIAL_CHEAT_POKEMON_CATALOG.find(entry => entry.id === boss.id);
      expect(match, `Missing catalog entry for boss ${boss.name}`).toBeDefined();
      expect(match?.name).toBe(boss.rewardPokemon.name);
      expect(match?.isShiny).toBe(boss.rewardPokemon.isShiny);
      expect(match?.level).toBe(boss.rewardPokemon.level);
    }
  });

  it('generates pristine normalized Pokemon for any entry with unique instanceId and perfect IVs', async () => {
    // Test a sample of entries including Dialga, Pikachu, and Metagross
    const testIds = ['boss-cyrus', 'boss-rosso', 'boss-rocco'];
    
    for (const id of testIds) {
      const entry = SPECIAL_CHEAT_POKEMON_CATALOG.find(e => e.id === id);
      expect(entry).toBeDefined();
      if (!entry) continue;

      const raw = await entry.generatePokemon();
      const clean = normalizePokemon(raw);
      clean.instanceId = `${clean.id}_cheat_test_${Date.now()}`;

      expect(clean.instanceId).toBeDefined();
      expect(clean.isShiny).toBe(true);
      expect(clean.ivs?.hp).toBe(31);
      expect(clean.ivs?.attack).toBe(31);
      expect(clean.ivs?.defense).toBe(31);
      expect(clean.ivs?.spAtk).toBe(31);
      expect(clean.ivs?.spDef).toBe(31);
      expect(clean.ivs?.speed).toBe(31);
      expect(clean.level).toBe(70);
      expect(clean.moves.length).toBeGreaterThanOrEqual(4);

      // Verify Dialga has Cannonflash as steel move
      if (id === 'boss-cyrus') {
        const cf = clean.moves.find(m => m.name.toLowerCase().includes('cannonflash') || m.name.toLowerCase().includes('flash'));
        expect(cf).toBeDefined();
        expect(cf?.type).toBe('steel');
        expect(cf?.power).toBe(80);
      }
    }
  });
});
