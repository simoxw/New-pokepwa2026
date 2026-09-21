export interface GenerationInfo {
  id: number;
  name: string;
  label: string;
  range: [number, number];
  flag: string;
}

export const GENERATIONS: GenerationInfo[] = [
  { id: 0, name: 'TUTTE', label: 'Tutte', range: [1, 1025], flag: '🌐' },
  { id: 1, name: 'Gen 1', label: 'Kanto', range: [1, 151], flag: '🗾' },
  { id: 2, name: 'Gen 2', label: 'Johto', range: [152, 251], flag: '🌸' },
  { id: 3, name: 'Gen 3', label: 'Hoenn', range: [252, 386], flag: '🌊' },
  { id: 4, name: 'Gen 4', label: 'Sinnoh', range: [387, 493], flag: '❄️' },
  { id: 5, name: 'Gen 5', label: 'Unova', range: [494, 649], flag: '🗽' },
  { id: 6, name: 'Gen 6', label: 'Kalos', range: [650, 721], flag: '🗼' },
  { id: 7, name: 'Gen 7', label: 'Alola', range: [722, 809], flag: '🌺' },
  { id: 8, name: 'Gen 8', label: 'Galar / Hisui', range: [810, 905], flag: '⚔️' },
  { id: 9, name: 'Gen 9', label: 'Paldea', range: [906, 1025], flag: '🔴' },
  { id: 10, name: 'Regionali', label: 'Forme Regionali', range: [10000, 20000], flag: '🌴' },
];

export const REGIONAL_POKEMON_IDS = [
  // Alola (18)
  10091, 10092, 10100, 10101, 10102, 10103, 10104, 10105, 10106, 10107, 10108, 10109, 10110, 10111, 10112, 10113, 10114, 10115,
  // Galar (19)
  10161, 863, 10162, 10163, 10164, 10165, 10166, 865, 10174, 10175, 862, 10173, 864, 10176, 10177, 10179, 867, 10167, 10180,
  // Hisui (14)
  10229, 10230, 10231, 10232, 10234, 904, 10235, 903, 10238, 10239, 10240, 10241, 10242, 10243,
  // Paldea (3)
  10253, 980, 10250
];

export function isRegionalPokemon(id: number, name?: string): boolean {
  if (id > 10000) return true;
  if (REGIONAL_POKEMON_IDS.includes(id)) return true;
  if (name) {
    const n = name.toLowerCase();
    if (n.includes('di alola') || n.includes('di galar') || n.includes('di hisui') || n.includes('di paldea')) return true;
    if (['perrserker', "sirfetch'd", 'obstagoon', 'cursola', 'runerigus', 'overqwil', 'sneasler', 'clodsire'].includes(n)) return true;
  }
  return false;
}

export interface TypeVisual {
  bg: string;
  badge: string;
  text: string;
  border: string;
  label: string;
  icon: string;
}

export const ALL_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export const TYPE_VISUALS: Record<string, TypeVisual> = {
  normal: { bg: 'bg-stone-100', badge: 'bg-stone-500', text: 'text-stone-700', border: 'border-stone-300', label: 'Normale', icon: '⚪' },
  fire: { bg: 'bg-orange-50', badge: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-300', label: 'Fuoco', icon: '🔥' },
  water: { bg: 'bg-blue-50', badge: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-300', label: 'Acqua', icon: '💧' },
  grass: { bg: 'bg-emerald-50', badge: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-300', label: 'Erba', icon: '🍃' },
  electric: { bg: 'bg-amber-50', badge: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-300', label: 'Elettro', icon: '⚡' },
  ice: { bg: 'bg-cyan-50', badge: 'bg-cyan-500', text: 'text-cyan-700', border: 'border-cyan-300', label: 'Ghiaccio', icon: '❄️' },
  fighting: { bg: 'bg-red-50', badge: 'bg-red-600', text: 'text-red-700', border: 'border-red-300', label: 'Lotta', icon: '🥊' },
  poison: { bg: 'bg-purple-50', badge: 'bg-purple-600', text: 'text-purple-700', border: 'border-purple-300', label: 'Veleno', icon: '☠️' },
  ground: { bg: 'bg-yellow-50', badge: 'bg-yellow-600', text: 'text-yellow-800', border: 'border-yellow-300', label: 'Terra', icon: '🏜️' },
  flying: { bg: 'bg-indigo-50', badge: 'bg-indigo-500', text: 'text-indigo-700', border: 'border-indigo-300', label: 'Volante', icon: '🪶' },
  psychic: { bg: 'bg-pink-50', badge: 'bg-pink-500', text: 'text-pink-700', border: 'border-pink-300', label: 'Psico', icon: '🔮' },
  bug: { bg: 'bg-lime-50', badge: 'bg-lime-600', text: 'text-lime-800', border: 'border-lime-300', label: 'Coleottero', icon: '🐛' },
  rock: { bg: 'bg-stone-100', badge: 'bg-amber-700', text: 'text-amber-900', border: 'border-amber-300', label: 'Roccia', icon: '🪨' },
  ghost: { bg: 'bg-purple-100', badge: 'bg-purple-800', text: 'text-purple-900', border: 'border-purple-400', label: 'Spettro', icon: '👻' },
  dragon: { bg: 'bg-indigo-100', badge: 'bg-indigo-700', text: 'text-indigo-900', border: 'border-indigo-400', label: 'Drago', icon: '🐉' },
  dark: { bg: 'bg-neutral-100', badge: 'bg-neutral-800', text: 'text-neutral-800', border: 'border-neutral-400', label: 'Buio', icon: '🌑' },
  steel: { bg: 'bg-slate-100', badge: 'bg-slate-500', text: 'text-slate-700', border: 'border-slate-300', label: 'Acciaio', icon: '⚙️' },
  fairy: { bg: 'bg-rose-50', badge: 'bg-rose-400', text: 'text-rose-700', border: 'border-rose-300', label: 'Folletto', icon: '✨' },
};

export function getTypeVisual(type: string): TypeVisual {
  return TYPE_VISUALS[type?.toLowerCase()] || TYPE_VISUALS.normal;
}
