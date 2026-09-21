import { fetchPokemonData } from '../src/lib/pokeapi';
import { canEvolve, evolvePokemon } from '../src/lib/evolution';

async function runEvolutionTests() {
  console.log('🧪 Starting Evolution Test Suite...\n');

  let passed = 0;
  let failed = 0;

  async function testCase(
    description: string,
    initialId: number,
    level: number,
    expectedNextId: number,
    expectedEvolvedNamePartial: string,
    targetBranchId?: number
  ) {
    try {
      // 1. Fetch initial pokemon
      const original = await fetchPokemonData(initialId, level, 'Test Zone');
      
      // Check if evolution info exists
      if (!original.evolutionInfo) {
        console.error(`❌ [FAIL] ${description}: Missing evolutionInfo for ID ${initialId} (${original.name})`);
        failed++;
        return;
      }

      // Check level requirement
      const evoLevel = targetBranchId && original.evolutionInfo.branches
        ? (original.evolutionInfo.branches.find(b => b.nextId === targetBranchId)?.level || original.evolutionInfo.level)
        : original.evolutionInfo.level;

      if (level < evoLevel) {
        console.error(`❌ [FAIL] ${description}: Level ${level} is below evolution level ${evoLevel}`);
        failed++;
        return;
      }

      // 2. Test canEvolve
      if (!canEvolve(original)) {
        console.error(`❌ [FAIL] ${description}: canEvolve returned false for ${original.name} at level ${level}`);
        failed++;
        return;
      }

      // 3. Evolve pokemon
      const evolved = await evolvePokemon(original, targetBranchId);

      // 4. Validate evolved pokemon properties
      if (evolved.id !== expectedNextId) {
        console.error(`❌ [FAIL] ${description}: Expected ID ${expectedNextId}, got ${evolved.id}`);
        failed++;
        return;
      }

      if (!evolved.name.toLowerCase().replace(/['’]/g, "'").includes(expectedEvolvedNamePartial.toLowerCase().replace(/['’]/g, "'"))) {
        console.error(`❌ [FAIL] ${description}: Expected name to contain "${expectedEvolvedNamePartial}", got "${evolved.name}"`);
        failed++;
        return;
      }

      // Verify IVs/EVs/Shiny preservation
      if (
        evolved.ivs.hp !== original.ivs.hp ||
        evolved.ivs.attack !== original.ivs.attack ||
        evolved.isShiny !== original.isShiny
      ) {
        console.error(`❌ [FAIL] ${description}: Individual stats (IVs/Shiny) were not preserved correctly!`);
        failed++;
        return;
      }

      console.log(`✅ [PASS] ${description}: ${original.name} (ID ${original.id}) ➔ ${evolved.name} (ID ${evolved.id})`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [ERROR] ${description}: Exception thrown -> ${err?.message || err}`);
      failed++;
    }
  }

  console.log('--- 1. STANDARD NON-REGIONAL POKÉMON EVOLUTIONS ---');
  await testCase('Bulbasaur ➔ Ivysaur', 1, 16, 2, 'Ivysaur');
  await testCase('Charmander ➔ Charmeleon', 4, 16, 5, 'Charmeleon');
  await testCase('Squirtle ➔ Wartortle', 7, 16, 8, 'Wartortle');
  await testCase('Pidgey ➔ Pidgeotto', 16, 18, 17, 'Pidgeotto');
  await testCase('Pikachu ➔ Raichu', 25, 20, 26, 'Raichu');
  await testCase('Eevee ➔ Vaporeon (Branch 134)', 133, 16, 134, 'Vaporeon', 134);
  await testCase('Eevee ➔ Jolteon (Branch 135)', 133, 16, 135, 'Jolteon', 135);
  await testCase('Gloom ➔ Vileplume (Branch 45)', 44, 21, 45, 'Vileplume', 45);
  await testCase('Gloom ➔ Bellossom (Branch 182)', 44, 21, 182, 'Bellossom', 182);

  console.log('\n--- 2. REGIONAL FORMS EVOLUTIONS (ALOLA, GALAR, HISUI, PALDEA) ---');
  await testCase('Rattata di Alola ➔ Raticate di Alola', 10091, 20, 10092, 'Raticate di Alola');
  await testCase('Sandshrew di Alola ➔ Sandslash di Alola', 10101, 22, 10102, 'Sandslash di Alola');
  await testCase('Vulpix di Alola ➔ Ninetales di Alola', 10103, 22, 10104, 'Ninetales di Alola');
  await testCase('Diglett di Alola ➔ Dugtrio di Alola', 10105, 26, 10106, 'Dugtrio di Alola');
  await testCase('Meowth di Alola ➔ Persian di Alola', 10107, 28, 10108, 'Persian di Alola');
  await testCase('Geodude di Alola ➔ Graveler di Alola', 10109, 25, 10110, 'Graveler di Alola');
  await testCase('Graveler di Alola ➔ Golem di Alola', 10110, 36, 10111, 'Golem di Alola');
  await testCase('Grimer di Alola ➔ Muk di Alola', 10112, 38, 10113, 'Muk di Alola');
  await testCase('Meowth di Galar ➔ Perrserker', 10161, 28, 863, 'Perrserker');
  await testCase('Ponyta di Galar ➔ Rapidash di Galar', 10162, 40, 10163, 'Rapidash di Galar');
  await testCase('Slowpoke di Galar ➔ Slowbro di Galar', 10164, 37, 10165, 'Slowbro di Galar');
  await testCase("Farfetch'd di Galar ➔ Sirfetch'd", 10166, 28, 865, "Sirfetch'd");
  await testCase('Zigzagoon di Galar ➔ Linoone di Galar', 10174, 20, 10175, 'Linoone di Galar');
  await testCase('Linoone di Galar ➔ Obstagoon', 10175, 35, 862, 'Obstagoon');
  await testCase('Corsola di Galar ➔ Cursola', 10173, 38, 864, 'Cursola');
  await testCase('Darumaka di Galar ➔ Darmanitan di Galar', 10176, 35, 10177, 'Darmanitan di Galar');
  await testCase('Yamask di Galar ➔ Runerigus', 10179, 34, 867, 'Runerigus');
  await testCase('Growlithe di Hisui ➔ Arcanine di Hisui', 10229, 22, 10230, 'Arcanine di Hisui');
  await testCase('Voltorb di Hisui ➔ Electrode di Hisui', 10231, 22, 10232, 'Electrode di Hisui');
  await testCase('Qwilfish di Hisui ➔ Overqwil', 10234, 28, 904, 'Overqwil');
  await testCase('Sneasel di Hisui ➔ Sneasler', 10235, 32, 903, 'Sneasler');
  await testCase('Zorua di Hisui ➔ Zoroark di Hisui', 10238, 30, 10239, 'Zoroark di Hisui');
  await testCase('Sliggoo di Hisui ➔ Goodra di Hisui', 10241, 50, 10242, 'Goodra di Hisui');
  await testCase('Wooper di Paldea ➔ Clodsire', 10253, 20, 980, 'Clodsire');

  console.log(`\n📊 EVOLUTION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED.`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runEvolutionTests();
