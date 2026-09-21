import { fetchWithCache } from './pokeapi';
import { ZONES } from '../constants/game';
import { getMoveByName } from '../data/movesData';
import { getStorageItem, setStorageItem } from './storage';

export interface PokedexDetail {
  id: number;
  formattedId: string;
  name: string;
  genus: string;
  flavorText: string;
  types: string[];
  heightM: number;
  weightKg: number;
  captureRate: number;
  baseHappiness: number;
  growthRate: string;
  generation: string;
  sprites: {
    artwork: string;
    shinyArtwork: string;
    front: string;
    shinyFront: string;
    animatedFront?: string;
  };
  abilities: Array<{
    name: string;
    description: string;
    isHidden: boolean;
  }>;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
    total: number;
  };
  moves: Array<{
    level: number;
    name: string;
    type: string;
    category: 'physical' | 'special' | 'status';
    power: number;
    accuracy: number;
  }>;
  evolutionChain: Array<{
    id: number;
    name: string;
    minLevel?: number;
    trigger?: string;
    item?: string;
    sprite: string;
  }>;
  locations: Array<{
    zoneId: string;
    zoneName: string;
    minLevel: number;
    maxLevel: number;
    rarity: number;
  }>;
}

const DETAIL_CACHE = new Map<number, PokedexDetail>();

const GROWTH_RATE_MAP: Record<string, string> = {
  'slow': 'Lenta (1.250.000 EXP)',
  'medium': 'Media Veloce (1.000.000 EXP)',
  'fast': 'Veloce (800.000 EXP)',
  'medium-slow': 'Media Lenta (1.059.860 EXP)',
  'slow-then-very-fast': 'Fluttuante (1.640.000 EXP)',
  'fast-then-very-slow': 'Parabolica (600.000 EXP)'
};

export async function fetchPokedexDetail(id: number): Promise<PokedexDetail> {
  if (DETAIL_CACHE.has(id)) {
    return DETAIL_CACHE.get(id)!;
  }

  try {
    const pokeData = await fetchWithCache(`https://pokeapi.co/api/v2/pokemon/${id}`);
    let speciesData: any = null;
    if (pokeData.species?.url) {
      try {
        speciesData = await fetchWithCache(pokeData.species.url);
      } catch (e) {
        console.warn(`Could not load species for #${id}`, e);
      }
    }

    // Italian Name
    let itName = pokeData.name.charAt(0).toUpperCase() + pokeData.name.slice(1);
    if (speciesData?.names) {
      const itEntry = speciesData.names.find((n: any) => n.language.name === 'it');
      if (itEntry?.name) itName = itEntry.name;
    }

    // Genus
    let genus = 'Pokémon';
    if (speciesData?.genera) {
      const itGen = speciesData.genera.find((g: any) => g.language.name === 'it') ||
                    speciesData.genera.find((g: any) => g.language.name === 'en');
      if (itGen?.genus) genus = itGen.genus;
    }

    // Flavor Text
    let flavorText = 'Nessuna voce del Pokédex registrata per questo esemplare.';
    if (speciesData?.flavor_text_entries) {
      const itEntry = speciesData.flavor_text_entries.find((f: any) => f.language.name === 'it');
      if (itEntry?.flavor_text) {
        flavorText = itEntry.flavor_text.replace(/[\n\f\r]/g, ' ');
      } else {
        const enEntry = speciesData.flavor_text_entries.find((f: any) => f.language.name === 'en');
        if (enEntry?.flavor_text) {
          flavorText = enEntry.flavor_text.replace(/[\n\f\r]/g, ' ');
        }
      }
    }

    // Types
    const types: string[] = Array.isArray(pokeData.types)
      ? pokeData.types.map((t: any) => t.type?.name || 'normal')
      : ['normal'];

    // Stats
    const getStat = (name: string) => {
      const s = pokeData.stats?.find((item: any) => item.stat?.name === name);
      return s?.base_stat ?? 50;
    };
    const hp = getStat('hp');
    const attack = getStat('attack');
    const defense = getStat('defense');
    const spAtk = getStat('special-attack');
    const spDef = getStat('special-defense');
    const speed = getStat('speed');
    const total = hp + attack + defense + spAtk + spDef + speed;

    // Abilities with description
    const abilities: Array<{ name: string; description: string; isHidden: boolean }> = [];
    if (Array.isArray(pokeData.abilities)) {
      for (const a of pokeData.abilities) {
        let abName = a.ability.name;
        let abDesc = '';
        try {
          if (a.ability.url) {
            const abInfo = await fetchWithCache(a.ability.url);
            abName = abInfo.names?.find((n: any) => n.language.name === 'it')?.name || abName;
            abDesc = abInfo.flavor_text_entries?.find((f: any) => f.language.name === 'it')?.flavor_text ||
                     abInfo.flavor_text_entries?.find((f: any) => f.language.name === 'en')?.flavor_text || '';
          }
        } catch {}
        abilities.push({
          name: abName.charAt(0).toUpperCase() + abName.slice(1),
          description: abDesc.replace(/[\n\f\r]/g, ' '),
          isHidden: !!a.is_hidden
        });
      }
    }

    // Learnable moves via level-up
    const moves: Array<{
      level: number;
      name: string;
      type: string;
      category: 'physical' | 'special' | 'status';
      power: number;
      accuracy: number;
    }> = [];

    if (Array.isArray(pokeData.moves)) {
      const levelMoves = pokeData.moves
        .map((m: any) => {
          const detail = m.version_group_details?.find((v: any) => v.move_learn_method?.name === 'level-up');
          return {
            level: detail?.level_learned_at ?? 0,
            name: m.move?.name || ''
          };
        })
        .filter((m: any) => m.level > 0)
        .sort((a: any, b: any) => a.level - b.level);

      for (const lm of levelMoves) {
        const moveObj = getMoveByName(lm.name);
        moves.push({
          level: lm.level,
          name: moveObj.name,
          type: moveObj.type,
          category: moveObj.category,
          power: moveObj.power,
          accuracy: moveObj.accuracy
        });
      }
    }

    // Evolution chain
    const evolutionChain: Array<{
      id: number;
      name: string;
      minLevel?: number;
      trigger?: string;
      item?: string;
      sprite: string;
    }> = [];

    if (speciesData?.evolution_chain?.url) {
      try {
        const evoData = await fetchWithCache(speciesData.evolution_chain.url);
        const parseChain = (node: any) => {
          if (!node || !node.species) return;
          const parts = node.species.url.split('/').filter(Boolean);
          const evoId = parseInt(parts[parts.length - 1], 10);
          const evoDetail = node.evolution_details?.[0];
          
          evolutionChain.push({
            id: evoId,
            name: node.species.name.charAt(0).toUpperCase() + node.species.name.slice(1),
            minLevel: evoDetail?.min_level || undefined,
            trigger: evoDetail?.trigger?.name || undefined,
            item: evoDetail?.item?.name || undefined,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evoId}.png`
          });

          if (Array.isArray(node.evolves_to)) {
            for (const next of node.evolves_to) {
              parseChain(next);
            }
          }
        };

        parseChain(evoData.chain);
      } catch (e) {
        console.warn('Could not parse evolution chain', e);
      }
    }

    // Locations in game zones
    const locations: Array<{
      zoneId: string;
      zoneName: string;
      minLevel: number;
      maxLevel: number;
      rarity: number;
    }> = [];

    for (const zone of ZONES) {
      const match = zone.spawnTable.find(s => s.pokemonId === id);
      if (match) {
        locations.push({
          zoneId: zone.id,
          zoneName: zone.name,
          minLevel: match.minLevel,
          maxLevel: match.maxLevel,
          rarity: match.rarity
        });
      }
    }

    const defaultArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    const shinyArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
    const frontDefault = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    const frontShiny = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;

    const detail: PokedexDetail = {
      id,
      formattedId: `#${id.toString().padStart(3, '0')}`,
      name: itName,
      genus,
      flavorText,
      types,
      heightM: (pokeData.height || 10) / 10,
      weightKg: (pokeData.weight || 100) / 10,
      captureRate: speciesData?.capture_rate ?? 45,
      baseHappiness: speciesData?.base_happiness ?? 70,
      growthRate: GROWTH_RATE_MAP[speciesData?.growth_rate?.name || 'medium'] || (speciesData?.growth_rate?.name || 'Media'),
      generation: speciesData?.generation?.name?.replace('generation-', 'Gen. ')?.toUpperCase() || 'Gen. ?',
      sprites: {
        artwork: pokeData.sprites?.other?.['official-artwork']?.front_default || defaultArtwork,
        shinyArtwork: pokeData.sprites?.other?.['official-artwork']?.front_shiny || shinyArtwork,
        front: pokeData.sprites?.front_default || frontDefault,
        shinyFront: pokeData.sprites?.front_shiny || frontShiny,
        animatedFront: pokeData.sprites?.other?.showdown?.front_default || undefined
      },
      abilities,
      baseStats: {
        hp,
        attack,
        defense,
        spAtk,
        spDef,
        speed,
        total
      },
      moves,
      evolutionChain,
      locations
    };

    DETAIL_CACHE.set(id, detail);
    return detail;
  } catch (err) {
    console.error(`Error loading Pokédex detail for #${id}`, err);
    throw err;
  }
}

export interface PokedexIndexItem {
  id: number;
  name: string;
  formattedId: string;
}

export const REGIONAL_INDEX_ITEMS: PokedexIndexItem[] = [
  // Alola (18)
  { id: 10091, name: 'Rattata di Alola', formattedId: '#10091' },
  { id: 10092, name: 'Raticate di Alola', formattedId: '#10092' },
  { id: 10100, name: 'Raichu di Alola', formattedId: '#10100' },
  { id: 10101, name: 'Sandshrew di Alola', formattedId: '#10101' },
  { id: 10102, name: 'Sandslash di Alola', formattedId: '#10102' },
  { id: 10103, name: 'Vulpix di Alola', formattedId: '#10103' },
  { id: 10104, name: 'Ninetales di Alola', formattedId: '#10104' },
  { id: 10105, name: 'Diglett di Alola', formattedId: '#10105' },
  { id: 10106, name: 'Dugtrio di Alola', formattedId: '#10106' },
  { id: 10107, name: 'Meowth di Alola', formattedId: '#10107' },
  { id: 10108, name: 'Persian di Alola', formattedId: '#10108' },
  { id: 10109, name: 'Geodude di Alola', formattedId: '#10109' },
  { id: 10110, name: 'Graveler di Alola', formattedId: '#10110' },
  { id: 10111, name: 'Golem di Alola', formattedId: '#10111' },
  { id: 10112, name: 'Grimer di Alola', formattedId: '#10112' },
  { id: 10113, name: 'Muk di Alola', formattedId: '#10113' },
  { id: 10114, name: 'Exeggutor di Alola', formattedId: '#10114' },
  { id: 10115, name: 'Marowak di Alola', formattedId: '#10115' },
  // Galar (19)
  { id: 10161, name: 'Meowth di Galar', formattedId: '#10161' },
  { id: 863, name: 'Perrserker', formattedId: '#0863' },
  { id: 10163, name: 'Ponyta di Galar', formattedId: '#10163' },
  { id: 10164, name: 'Rapidash di Galar', formattedId: '#10164' },
  { id: 10165, name: 'Slowpoke di Galar', formattedId: '#10165' },
  { id: 10166, name: 'Slowbro di Galar', formattedId: '#10166' },
  { id: 10167, name: "Farfetch'd di Galar", formattedId: '#10167' },
  { id: 865, name: "Sirfetch'd", formattedId: '#0865' },
  { id: 10171, name: 'Zigzagoon di Galar', formattedId: '#10171' },
  { id: 10172, name: 'Linoone di Galar', formattedId: '#10172' },
  { id: 862, name: 'Obstagoon', formattedId: '#0862' },
  { id: 10173, name: 'Corsola di Galar', formattedId: '#10173' },
  { id: 864, name: 'Cursola', formattedId: '#0864' },
  { id: 10174, name: 'Darumaka di Galar', formattedId: '#10174' },
  { id: 10175, name: 'Darmanitan di Galar', formattedId: '#10175' },
  { id: 10176, name: 'Yamask di Galar', formattedId: '#10176' },
  { id: 867, name: 'Runerigus', formattedId: '#0867' },
  { id: 10178, name: 'Weezing di Galar', formattedId: '#10178' },
  { id: 10179, name: 'Stunfisk di Galar', formattedId: '#10179' },
  // Hisui (14)
  { id: 10229, name: 'Growlithe di Hisui', formattedId: '#10229' },
  { id: 10230, name: 'Arcanine di Hisui', formattedId: '#10230' },
  { id: 10231, name: 'Voltorb di Hisui', formattedId: '#10231' },
  { id: 10232, name: 'Electrode di Hisui', formattedId: '#10232' },
  { id: 10234, name: 'Qwilfish di Hisui', formattedId: '#10234' },
  { id: 904, name: 'Overqwil', formattedId: '#0904' },
  { id: 10235, name: 'Sneasel di Hisui', formattedId: '#10235' },
  { id: 903, name: 'Sneasler', formattedId: '#0903' },
  { id: 10238, name: 'Zorua di Hisui', formattedId: '#10238' },
  { id: 10239, name: 'Zoroark di Hisui', formattedId: '#10239' },
  { id: 10240, name: 'Braviary di Hisui', formattedId: '#10240' },
  { id: 10241, name: 'Sliggoo di Hisui', formattedId: '#10241' },
  { id: 10242, name: 'Goodra di Hisui', formattedId: '#10242' },
  { id: 10243, name: 'Avalugg di Hisui', formattedId: '#10243' },
  // Paldea (3)
  { id: 10253, name: 'Wooper di Paldea', formattedId: '#10253' },
  { id: 980, name: 'Clodsire', formattedId: '#0980' },
  { id: 10250, name: 'Tauros di Paldea', formattedId: '#10250' }
];

let INDEX_CACHE: PokedexIndexItem[] | null = null;

export async function fetchPokedexIndex(): Promise<PokedexIndexItem[]> {
  if (INDEX_CACHE && INDEX_CACHE.length > 0) {
    return INDEX_CACHE;
  }

  // Try IndexedDB (with localStorage migration) first
  try {
    const saved = await getStorageItem<PokedexIndexItem[]>('pokepwa_pokedex_index_v4');
    if (saved && Array.isArray(saved) && saved.length >= 1000) {
      INDEX_CACHE = saved;
      return saved;
    }
  } catch {}

  const deduplicateIndex = (list: PokedexIndexItem[]): PokedexIndexItem[] => {
    const seen = new Set<number>();
    return list.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        const items: PokedexIndexItem[] = data.results.map((r: any, idx: number) => {
          const id = idx + 1;
          const cleanName = r.name
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          return {
            id,
            name: cleanName,
            formattedId: `#${id.toString().padStart(3, '0')}`
          };
        });

        const fullItems = deduplicateIndex([...items, ...REGIONAL_INDEX_ITEMS]);
        INDEX_CACHE = fullItems;
        setStorageItem('pokepwa_pokedex_index_v4', fullItems).catch(() => {});
        return fullItems;
      }
    }
  } catch (e) {
    console.warn('PokéAPI index fetch failed, generating fallback list', e);
  }

  // Fallback generation of 1025 entries + regional items
  const fallbackList: PokedexIndexItem[] = Array.from({ length: 1025 }, (_, i) => {
    const id = i + 1;
    return {
      id,
      name: `Pokémon #${id}`,
      formattedId: `#${id.toString().padStart(3, '0')}`
    };
  });
  const fullList = deduplicateIndex([...fallbackList, ...REGIONAL_INDEX_ITEMS]);
  INDEX_CACHE = fullList;
  return fullList;
}

