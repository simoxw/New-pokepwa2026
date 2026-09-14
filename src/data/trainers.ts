import { Trainer, Pokemon } from '../types/game';
import { fetchPokemonData } from '../lib/pokeapi';
import { SPRITES } from '../constants/sprites';

export async function generateTrainerTeam(pokemonIds: {id: number, level: number}[]): Promise<Pokemon[]> {
  const team: Pokemon[] = [];
  for (const p of pokemonIds) {
    const pokemon = await fetchPokemonData(p.id, p.level, 'Sfida Allenatore');
    team.push(pokemon);
  }
  return team;
}

export const TRAINERS_DATA = {
  'giovane-pino': {
    name: 'Giovane Pino',
    type: 'Allenatore',
    sprite: SPRITES.TRAINERS.YOUNGSTER,
    quote: 'Ti piacciono i miei pantaloncini? Sono comodi e facili da indossare!',
    winQuote: 'Accidenti! I miei pantaloncini non mi hanno aiutato...',
    moneyReward: 200,
    teamIds: [{ id: 19, level: 4 }, { id: 16, level: 5 }] // Rattata, Pidgey
  },
  'bullo-luca': {
    name: 'Bullo Luca',
    type: 'Allenatore',
    sprite: SPRITES.TRAINERS.YOUNGSTER,
    quote: 'Non puoi battere i miei Pokémon Coleottero!',
    winQuote: 'Il mio sciame è stato spazzato via...',
    moneyReward: 350,
    teamIds: [{ id: 10, level: 7 }, { id: 13, level: 7 }, { id: 11, level: 8 }] // Caterpie, Weedle, Metapod
  },
  'scienziato-filippo': {
    name: 'Scienziato Filippo',
    type: 'Ricercatore',
    sprite: SPRITES.TRAINERS.SCIENTIST,
    quote: 'La scienza è la chiave della vittoria!',
    winQuote: 'I miei calcoli erano errati...',
    moneyReward: 800,
    teamIds: [{ id: 100, level: 12 }, { id: 81, level: 12 }] // Voltorb, Magnemite
  },
  'pescatore-gianni': {
    name: 'Pescatore Gianni',
    type: 'Pescatore',
    sprite: SPRITES.TRAINERS.FISHERMAN,
    quote: 'Ho pescato un Pokémon gigante! Guarda!',
    winQuote: 'Mi è scappata la preda...',
    moneyReward: 400,
    teamIds: [{ id: 129, level: 15 }, { id: 129, level: 15 }, { id: 129, level: 18 }] // 3 Magikarp
  },
  'ombretta': {
    name: 'Ombretta',
    type: 'Misteriosa',
    sprite: SPRITES.TRAINERS.HEX_MANIAC,
    quote: 'Il buio ti avvolge...',
    winQuote: 'La luce è tornata...',
    moneyReward: 900,
    teamIds: [{ id: 92, level: 25 }, { id: 355, level: 25 }] // Gastly, Duskull
  },
  'piromane-leo': {
    name: 'Piromane Leo',
    type: 'Fuocobastardo',
    sprite: SPRITES.TRAINERS.FIRE_BREATHER,
    quote: 'Brucia tutto! Senti il calore?',
    winQuote: 'Mi sono scottato...',
    moneyReward: 600,
    teamIds: [{ id: 4, level: 20 }, { id: 218, level: 20 }] // Charmander, Slugma
  },
  'alpinista-marco': {
    name: 'Alpinista Marco',
    type: 'Escursionista',
    sprite: SPRITES.TRAINERS.HIKER,
    quote: 'La mia connessione è gelata quassù!',
    winQuote: 'Sono scivolato sul ghiaccio...',
    moneyReward: 1200,
    teamIds: [{ id: 220, level: 32 }, { id: 215, level: 35 }] // Swinub, Sneasel
  },
  'ombra-silente': {
    name: 'Ombra Silente',
    type: 'Glitch',
    sprite: SPRITES.TRAINERS.HEX_MANIAC,
    quote: '01001111 01101101 01100010 01110010 01100001...',
    winQuote: 'System Shutdown...',
    moneyReward: 2500,
    teamIds: [{ id: 94, level: 50 }, { id: 609, level: 52 }, { id: 197, level: 55 }] // Gengar, Chandelure, Umbreon
  }
};

export async function getTrainer(id: keyof typeof TRAINERS_DATA): Promise<Trainer> {
  const data = TRAINERS_DATA[id] as any;
  const team = await generateTrainerTeam(data.teamIds);
  
  return {
    id,
    name: data.name,
    type: data.type,
    sprite: data.sprite || SPRITES.TRAINERS.COOLTRAINER,
    team,
    quote: data.quote,
    winQuote: data.winQuote,
    moneyReward: data.moneyReward
  };
}
