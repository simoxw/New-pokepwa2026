import { fetchPokemonData } from '../src/lib/pokeapi';
import { REGIONAL_POKEMON_IDS } from '../src/components/pokedex/pokedexConstants';

async function verifyAllRegionals() {
  console.log('🔍 Verifying all 54 Regional Pokémon...\n');
  let passed = 0;
  let failed = 0;

  for (const id of REGIONAL_POKEMON_IDS) {
    try {
      const data = await fetchPokemonData(id, 50, 'Arcipelago Regionale');
      if (!data) {
        console.error(`❌ [FAIL] No data returned for ID ${id}`);
        failed++;
        continue;
      }

      const spriteUrl = data.sprites?.artwork || data.sprites?.front;
      if (!spriteUrl || spriteUrl.includes('undefined')) {
        console.error(`❌ [FAIL] Invalid sprite for ID ${id} (${data.name}): ${spriteUrl}`);
        failed++;
        continue;
      }

      console.log(`✅ ID ${id.toString().padEnd(5)} | Name: ${data.name.padEnd(25)} | Types: ${data.types.join('/')}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ [ERROR] ID ${id}: ${e?.message || e}`);
      failed++;
    }
  }

  console.log(`\n📊 REGIONAL VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED.`);
  process.exit(failed > 0 ? 1 : 0);
}

verifyAllRegionals();
