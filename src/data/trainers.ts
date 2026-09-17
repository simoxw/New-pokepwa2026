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
  },
  'recluta-eclipse-1': {
    name: 'Recluta Eclipse',
    type: 'Team Eclipse',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/grunt-gen1.png',
    quote: 'Il Team Eclipse oscurerà questo mondo!',
    winQuote: 'L\'eclissi è solo rimandata...',
    moneyReward: 500,
    teamIds: [{ id: 228, level: 15 }, { id: 41, level: 16 }] // Houndour, Zubat
  },
  'recluta-eclipse-2': {
    name: 'Recluta Eclipse',
    type: 'Team Eclipse',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/grunt-gen1.png',
    quote: 'Non passerai di qui! Ordini del capo.',
    winQuote: 'Spostati pure...',
    moneyReward: 600,
    teamIds: [{ id: 52, level: 18 }, { id: 109, level: 18 }] // Meowth, Koffing
  },
  'tenente-eclipse-ombra': {
    name: 'Tenente Ombra',
    type: 'Team Eclipse',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/shadowtriad.png',
    quote: 'Sei solo un intralcio per i nostri piani.',
    winQuote: 'Incredibile... come hai potuto?',
    moneyReward: 1500,
    teamIds: [{ id: 302, level: 28 }, { id: 442, level: 30 }, { id: 215, level: 32 }] // Sableye, Spiritomb, Sneasel
  },
  'entomologo-ezio': {
    name: 'Entomologo Ezio',
    type: 'Capopalestra',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/bugcatcher.png',
    quote: 'Hai mai osservato la perfezione di un esoscheletro?',
    winQuote: 'Il mio sciame è stato schiacciato...',
    moneyReward: 3000,
    teamIds: [{ id: 123, level: 40 }, { id: 214, level: 42 }, { id: 637, level: 45 }] // Scyther, Heracross, Volcarona
  },
  'admin-root': {
    name: 'Admin Root',
    type: 'Capopalestra',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/scientist-gen4.png',
    quote: 'Sudo su; rm -rf /player/team',
    winQuote: 'Permesso negato. Reboot in corso...',
    moneyReward: 4000,
    teamIds: [{ id: 137, level: 55 }, { id: 479, level: 58 }, { id: 642, level: 60 }] // Porygon, Rotom, Thundurus
  },
  'superquattro-bsod': {
    name: 'Superquattro BSOD',
    type: 'Superquattro',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/morty.png',
    quote: 'CRITICAL_PROCESS_DIED: Il tuo team ha causato un kernel panic non gestito nei registri di sistema. Riavvio forzato in corso...',
    winQuote: 'Dump di memoria completato. Il driver nvlddmkm.sys ha smesso di rispondere...',
    moneyReward: 8000,
    teamIds: [{ id: 94, level: 64 }, { id: 442, level: 65 }, { id: 609, level: 65 }, { id: 197, level: 66 }] // Gengar, Spiritomb, Chandelure, Umbreon
  },
  'superquattro-ai': {
    name: 'Superquattro AI Allucinata',
    type: 'Superquattro',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/colress.png',
    quote: 'In base al prompt fornito, ho generato una vittoria al 99.8%. I miei Pokémon hanno sette dita e sparano pixel quantistici!',
    winQuote: 'Errore 429: Quota di token esaurita per il modello. Riprova tra 60 secondi.',
    moneyReward: 10000,
    teamIds: [{ id: 579, level: 66 }, { id: 282, level: 67 }, { id: 468, level: 67 }, { id: 65, level: 68 }] // Reuniclus, Gardevoir, Togekiss, Alakazam
  },
  'superquattro-ransomware': {
    name: 'Superquattro Ransomware',
    type: 'Superquattro',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/burglar.png',
    quote: 'Tutti i tuoi Pokémon e salvataggi sono stati crittografati con chiave RSA-4096! Paga il riscatto in Bitcoin o subisci il wipe!',
    winQuote: 'Decrittazione forzata completata... La mia chiave privata è finita su Pastebin!',
    moneyReward: 12000,
    teamIds: [{ id: 625, level: 68 }, { id: 452, level: 68 }, { id: 110, level: 69 }, { id: 376, level: 70 }] // Bisharp, Drapion, Weezing, Metagross
  },
  'superquattro-social': {
    name: 'Superquattro Algoritmo Social',
    type: 'Superquattro',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/guitarist.png',
    quote: 'QUESTA SFIDA È IN LIVE STREAMING CON 500K SPETTATORI! Spamma emote, metti mi piace e guarda questo attacco virale!',
    winQuote: 'Unfollow di massa e dislike... Sono ufficialmente finito nello shadowban!',
    moneyReward: 15000,
    teamIds: [{ id: 466, level: 70 }, { id: 701, level: 70 }, { id: 135, level: 71 }, { id: 448, level: 72 }] // Electivire, Hawlucha, Jolteon, Lucario
  },
  'campione-pm': {
    name: 'Campione: Project Manager',
    type: 'Campione del Sistema',
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png',
    quote: 'ASAP! Il rilascio in produzione è fissato per le 18:00 di venerdì! Nessun bug è ammesso: se perdi, lavoriamo tutto il weekend!',
    winQuote: 'Sprint retroattiva approvata... Il debito tecnico è mostruoso, ma ti nomino ufficialmente Lead Architect e Campione di PokePWA!',
    moneyReward: 30000,
    teamIds: [{ id: 248, level: 73 }, { id: 445, level: 74 }, { id: 130, level: 74 }, { id: 637, level: 74 }, { id: 149, level: 75 }, { id: 150, level: 76 }] // Tyranitar, Garchomp, Gyarados, Volcarona, Dragonite, Mewtwo
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
