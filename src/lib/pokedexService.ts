import { fetchWithCache } from './pokeapi';
import { ZONES } from '../constants/game';
import { getMoveByName } from '../data/movesData';

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

let INDEX_CACHE: PokedexIndexItem[] | null = null;

export async function fetchPokedexIndex(): Promise<PokedexIndexItem[]> {
  if (INDEX_CACHE && INDEX_CACHE.length > 0) {
    return INDEX_CACHE;
  }

  // Try localStorage first
  try {
    const saved = localStorage.getItem('pokepwa_pokedex_index_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 1000) {
        INDEX_CACHE = parsed;
        return parsed;
      }
    }
  } catch {}

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

        INDEX_CACHE = items;
        try {
          localStorage.setItem('pokepwa_pokedex_index_v1', JSON.stringify(items));
        } catch {}
        return items;
      }
    }
  } catch (e) {
    console.warn('PokéAPI index fetch failed, generating fallback list', e);
  }

  // Fallback generation of 1025 entries
  const fallbackList: PokedexIndexItem[] = Array.from({ length: 1025 }, (_, i) => {
    const id = i + 1;
    return {
      id,
      name: `Pokémon #${id}`,
      formattedId: `#${id.toString().padStart(3, '0')}`
    };
  });
  INDEX_CACHE = fallbackList;
  return fallbackList;
}

