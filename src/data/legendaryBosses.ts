import { Trainer, Pokemon, GameState } from '../types/game';
import { fetchPokemonData } from '../lib/pokeapi';

export interface LegendaryBoss {
  id: string;
  name: string;
  title: string;
  region: string;
  quote: string;
  winQuote: string;
  moneyReward: number;
  sprite: string;
  avatar: string;
  buffName: string;
  buffDescription: string;
  buffType: 
    | 'rosso_aura' 
    | 'camilla_presence' 
    | 'rocco_steel' 
    | 'lance_dragon' 
    | 'dandel_gigamax' 
    | 'blu_arrogance' 
    | 'giovanni_mafia' 
    | 'n_harmony'
    | 'baldo_fortress'
    | 'nardo_spirit'
    | 'perla_origins'
    | 'iridio_synthesis'
    | 'oak_wisdom'
    | 'nemona_passion'
    | 'palmer_tower'
    | 'volo_shadow';
  teamPokemon: {
    id: number;
    name: string;
    level: number; // Always 100
    customMoves?: string[];
  }[];
  rewardPokemon: {
    id: number;
    name: string;
    level: number;
    isShiny: boolean;
    nickname: string;
    moves: string[];
    description: string;
  };
}

export const LEGENDARY_BOSSES: LegendaryBoss[] = [
  {
    id: 'boss-rosso',
    name: 'Rosso',
    title: 'Leggenda del Monte Argento',
    region: 'Kanto / Monte Argento',
    quote: '...',
    winQuote: '... ... !',
    moneyReward: 50000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/red.png',
    avatar: '⚡',
    buffName: 'Aura del Monte Argento',
    buffDescription: 'Attacco e Attacco Speciale aumentati del +12%. La bufera gelida paralizza il Pokémon del giocatore all\'inizio della battaglia.',
    buffType: 'rosso_aura',
    teamPokemon: [
      { id: 25, name: 'Pikachu', level: 100, customMoves: ['Locomovolt', 'Fulmine', 'Cozzata Furia', 'Coda di Ferro'] },
      { id: 6, name: 'Charizard', level: 100, customMoves: ['Lanciafiamme', 'Eterelama', 'Focalcolpo', 'Dragopulsar'] },
      { id: 9, name: 'Blastoise', level: 100, customMoves: ['Idropompa', 'Gelaraggio', 'Luminomossa', 'Girofango'] },
      { id: 3, name: 'Venusaur', level: 100, customMoves: ['Mazzabrutta', 'Gigassorbimento', 'Fangobomba', 'Sintesi'] },
      { id: 143, name: 'Snorlax', level: 100, customMoves: ['Ritorno', 'Terremoto', 'Sgranocchio', 'Riposo'] },
      { id: 131, name: 'Lapras', level: 100, customMoves: ['Ultravampa', 'Surf', 'Gelaraggio', 'Psichico'] }
    ],
    rewardPokemon: {
      id: 25,
      name: 'Pikachu',
      level: 70,
      isShiny: true,
      nickname: 'Pikachu "Capitano"',
      moves: ['Locomovolt', 'Volo', 'Fulmine', 'Cozzata Furia'],
      description: 'Speciale Pikachu Cromatico di Rosso con IV perfetti (31/31/31/31/31/31) e la mossa speciale Volo!'
    }
  },
  {
    id: 'boss-camilla',
    name: 'Campionessa Camilla',
    title: 'La Campionessa Insuperabile di Sinnoh',
    region: 'Sinnoh',
    quote: 'Quale allenatore incredibile che sei... Ma per superarmi dovrai dare il 1000%!',
    winQuote: 'Splendido! La tua passione e la tua intesa con i tuoi Pokémon mi hanno davvero commossa.',
    moneyReward: 50000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png',
    avatar: '🐉',
    buffName: 'Sguardo Insuperabile',
    buffDescription: 'Difesa e Difesa Speciale aumentate del +12%. La sua presenza regale intimidisce l\'avversario all\'ingresso.',
    buffType: 'camilla_presence',
    teamPokemon: [
      { id: 445, name: 'Garchomp', level: 100, customMoves: ['Terremoto', 'Oltraggio', 'Pietrataglio', 'Danzaspada'] },
      { id: 448, name: 'Lucario', level: 100, customMoves: ['Zuffa', 'Pulsarforza', 'Geleripiego', 'Danzaspada'] },
      { id: 468, name: 'Togekiss', level: 100, customMoves: ['Eterelama', 'Magibrillio', 'Lanciafiamme', 'Forzasfera'] },
      { id: 350, name: 'Milotic', level: 100, customMoves: ['Surf', 'Gelaraggio', 'Ripresa', 'Tossina'] },
      { id: 442, name: 'Spiritomb', level: 100, customMoves: ['Palla Ombra', 'Neropulsar', 'Focalcolpo', 'Fuocofatuo'] },
      { id: 407, name: 'Roserade', level: 100, customMoves: ['Gigassorbimento', 'Fangobomba', 'Palla Ombra', 'Sintesi'] }
    ],
    rewardPokemon: {
      id: 445,
      name: 'Garchomp',
      level: 70,
      isShiny: false,
      nickname: 'Garchomp "Titanico"',
      moves: ['Terremoto', 'Oltraggio', 'Pietrataglio', 'Danzaspada'],
      description: 'Garchomp da Competizione di Camilla con IV perfetti al 100% (31 in tutte le statistiche).'
    }
  },
  {
    id: 'boss-rocco',
    name: 'Rocco Petri',
    title: 'Maestro dell\'Acciaio e delle Pietre Rare',
    region: 'Hoenn',
    quote: 'In fin dei conti, io e te cerchiamo la stessa cosa: la vera forza e le pietre più lucenti!',
    winQuote: 'Straordinario! Brilli più di un Metagross cromatico sotto il sole!',
    moneyReward: 50000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/steven.png',
    avatar: '💎',
    buffName: 'Fortezza d\'Acciaio',
    buffDescription: 'Difesa aumentata del +15%. I suoi Pokémon sono immuni ai brutti colpi.',
    buffType: 'rocco_steel',
    teamPokemon: [
      { id: 376, name: 'Metagross', level: 100, customMoves: ['Meteorpugno', 'Cozzata Zen', 'Terremoto', 'Agilità'] },
      { id: 306, name: 'Aggron', level: 100, customMoves: ['Zuccata', 'Terremoto', 'Pesobomba', 'Pietrataglio'] },
      { id: 227, name: 'Skarmory', level: 100, customMoves: ['Balia', 'Punte', 'Raffica', 'Tossina'] },
      { id: 346, name: 'Cradily', level: 100, customMoves: ['Radicamento', 'Gigassorbimento', 'Pietrataglio', 'Fangobomba'] },
      { id: 348, name: 'Armaldo', level: 100, customMoves: ['Pietrataglio', 'Forzaforbice', 'Terremoto', 'Acquajet'] },
      { id: 530, name: 'Excadrill', level: 100, customMoves: ['Terremoto', 'Frana', 'Forzaforbice', 'Danzaspada'] }
    ],
    rewardPokemon: {
      id: 376,
      name: 'Metagross',
      level: 70,
      isShiny: true,
      nickname: 'Metagross "Cromatico"',
      moves: ['Meteorpugno', 'Cozzata Zen', 'Terremoto', 'Agilità'],
      description: 'Il famosissimo Metagross Cromatico d\'Argento di Rocco con IV al massimo!'
    }
  },
  {
    id: 'boss-lance',
    name: 'Domadraghi Lance',
    title: 'Campione Supremo dell\'Altopiano Blu',
    region: 'Johto / Kanto',
    quote: 'I miei Pokémon Drago sono leggende viventi! Pensi che la tua squadra possa resistere alla loro furia?',
    winQuote: 'Incredibile... Hai domato la furia dei draghi con pura maestria!',
    moneyReward: 50000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/lance.png',
    avatar: '🔥',
    buffName: 'Furia Draconica',
    buffDescription: 'Attacco +12%. I suoi Pokémon subiscono il 10% in meno di danno dalle mosse Super Efficaci.',
    buffType: 'lance_dragon',
    teamPokemon: [
      { id: 149, name: 'Dragonite', level: 100, customMoves: ['Extrarapido', 'Oltraggio', 'Tifone', 'Dragodanza'] },
      { id: 130, name: 'Gyarados', level: 100, customMoves: ['Cascata', 'Pietrataglio', 'Sgranocchio', 'Dragodanza'] },
      { id: 142, name: 'Aerodactyl', level: 100, customMoves: ['Pietrataglio', 'Eterelama', 'Terremoto', 'Forzaforbice'] },
      { id: 6, name: 'Charizard', level: 100, customMoves: ['Fuocobomba', 'Eterelama', 'Dragopulsar', 'Solarraggio'] },
      { id: 230, name: 'Kingdra', level: 100, customMoves: ['Idropompa', 'Dragopulsar', 'Gelaraggio', 'Pulsarforza'] },
      { id: 373, name: 'Salamence', level: 100, customMoves: ['Oltraggio', 'Eterelama', 'Terremoto', 'Dragodanza'] }
    ],
    rewardPokemon: {
      id: 149,
      name: 'Dragonite',
      level: 70,
      isShiny: false,
      nickname: 'Dragonite "Ancestrale"',
      moves: ['Extrarapido', 'Oltraggio', 'Tifone', 'Dragodanza'],
      description: 'Dragonite di Lance con la potentissima mossa Extrarapido ed IV 31/31/31/31/31/31.'
    }
  },
  {
    id: 'boss-dandel',
    name: 'Campione Dandel',
    title: 'L\'Imbattibile Re di Galar',
    region: 'Galar',
    quote: 'È ora di regalare a tutti un combattimento davvero IMBATTIBILE!',
    winQuote: 'Sbalorditivo! È stata la sfida più emozionante della mia vita!',
    moneyReward: 50000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/leon.png',
    avatar: '👑',
    buffName: 'Ritmo Gigamax',
    buffDescription: 'Velocità +10% e +10% di potenza su ogni attacco eseguito dai suoi Pokémon.',
    buffType: 'dandel_gigamax',
    teamPokemon: [
      { id: 6, name: 'Charizard', level: 100, customMoves: ['Fuocobomba', 'Eterelama', 'Solarraggio', 'Focalcolpo'] },
      { id: 887, name: 'Dragapult', level: 100, customMoves: ['Palla Ombra', 'Dragopulsar', 'Fulmine', 'Lanciafiamme'] },
      { id: 612, name: 'Haxorus', level: 100, customMoves: ['Oltraggio', 'Terremoto', 'Pietrataglio', 'Danzaspada'] },
      { id: 681, name: 'Aegislash', level: 100, customMoves: ['Spada Reale', 'Palla Ombra', 'Sacraforza', 'Danzaspada'] },
      { id: 812, name: 'Rillaboom', level: 100, customMoves: ['Mazzabrutta', 'Privazione', 'Terremoto', 'Martellata'] },
      { id: 122, name: 'Mr. Mime (Galar)', level: 100, customMoves: ['Gelaraggio', 'Psichico', 'Pulsarforza', 'Geleripiego'] }
    ],
    rewardPokemon: {
      id: 6,
      name: 'Charizard',
      level: 70,
      isShiny: true,
      nickname: 'Charizard "Gigamax"',
      moves: ['Fuocobomba', 'Eterelama', 'Solarraggio', 'Focalcolpo'],
      description: 'Charizard Cromatico con IV al massimo dell\'imbattibile Campione Dandel.'
    }
  },
  {
    id: 'boss-blu',
    name: 'Eterno Rivale Blu',
    title: 'Il Prodigio di Biancavilla',
    region: 'Kanto',
    quote: 'Ehi! Pensavi davvero di poter battere il più grande allenatore del mondo?',
    winQuote: 'C-Cosa?! Come è possibile?! Ho studiato ogni singola mossa...',
    moneyReward: 50000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/blue.png',
    avatar: '🏆',
    buffName: 'Presunzione Assoluta',
    buffDescription: 'Tutte le statistiche aumentate del +10%. Riduce la precisione delle mosse nemiche dell\'8%.',
    buffType: 'blu_arrogance',
    teamPokemon: [
      { id: 18, name: 'Pidgeot', level: 100, customMoves: ['Tifone', 'Eterelama', 'Elettropalla', 'Balia'] },
      { id: 65, name: 'Alakazam', level: 100, customMoves: ['Psichico', 'Palla Ombra', 'Focalcolpo', 'Calmamente'] },
      { id: 112, name: 'Rhydon', level: 100, customMoves: ['Terremoto', 'Pietrataglio', 'Megacorno', 'Martellata'] },
      { id: 59, name: 'Arcanine', level: 100, customMoves: ['Fuococarica', 'Zuffa', 'Extrarapido', 'Sgranocchio'] },
      { id: 103, name: 'Exeggutor', level: 100, customMoves: ['Gigassorbimento', 'Psichico', 'Sonnifero', 'Paralizzante'] },
      { id: 248, name: 'Tyranitar', level: 100, customMoves: ['Pietrataglio', 'Sgranocchio', 'Terremoto', 'Danzadrago'] }
    ],
    rewardPokemon: {
      id: 59,
      name: 'Arcanine',
      level: 70,
      isShiny: false,
      nickname: 'Arcanine "Imperiale"',
      moves: ['Fuococarica', 'Zuffa', 'Extrarapido', 'Sgranocchio'],
      description: 'L\'Arcanine leggendario di Blu con IV 31/31/31/31/31/31 e mossa Extrarapido.'
    }
  },
  {
    id: 'boss-giovanni',
    name: 'Capo Giovanni',
    title: 'Il Boss Incontrastato del Team Rocket',
    region: 'Kanto / Giovanni HQ',
    quote: 'Tutti i Pokémon esistono unicamente per servire le ambizioni del Team Rocket!',
    winQuote: 'Impossibile... Nemmeno con Mewtwo sotto il mio totale controllo?!',
    moneyReward: 60000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png',
    avatar: '🚀',
    buffName: 'Morsa della Malavita',
    buffDescription: 'Immunità totale ai cali di statistiche. I suoi colpi fisici hanno una piccola possibilità di avvelenare l\'avversario (15%).',
    buffType: 'giovanni_mafia',
    teamPokemon: [
      { id: 150, name: 'Mewtwo', level: 100, customMoves: ['Psicostroncatura', 'Palla Ombra', 'Baffo d\'Aura', 'Ripresa'] },
      { id: 34, name: 'Nidoking', level: 100, customMoves: ['Terremoto', 'Velenocolpo', 'Pietrataglio', 'Sgranocchio'] },
      { id: 31, name: 'Nidoqueen', level: 100, customMoves: ['Terremoto', 'Fangobomba', 'Gelaraggio', 'Fulmine'] },
      { id: 464, name: 'Rhyperior', level: 100, customMoves: ['Terremoto', 'Devastoroccia', 'Megacorno', 'Pietrataglio'] },
      { id: 68, name: 'Machamp', level: 100, customMoves: ['Dinamipugno', 'Pietrataglio', 'Privazione', 'Pugnoscarica'] },
      { id: 430, name: 'Honchkrow', level: 100, customMoves: ['Eterelama', 'Neropulsar', 'Onda Calda', 'Tossina'] }
    ],
    rewardPokemon: {
      id: 150,
      name: 'Mewtwo',
      level: 70,
      isShiny: true,
      nickname: 'Mewtwo "Purificato"',
      moves: ['Psicostroncatura', 'Palla Ombra', 'Baffo d\'Aura', 'Ripresa'],
      description: 'Il mitico Mewtwo Cromatico strappato al Team Rocket con IV perfetti!'
    }
  },
  {
    id: 'boss-n',
    name: 'Re N',
    title: 'L\'Eroe degli Ideali e della Verità',
    region: 'Unima',
    quote: 'Io posso sentire le voci e le anime di tutti i Pokémon... Mostrami il legame che hai con i tuoi!',
    winQuote: 'Sento che il tuo cuore ama i Pokémon sinceramente. La tua vittoria è pura e giusta.',
    moneyReward: 50000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/n.png',
    avatar: '🕊️',
    buffName: 'Armonia Filosofica',
    buffDescription: 'Rigenera il 5% dei PS massimi alla fine di ogni turno. Immunità alle trappole di campo.',
    buffType: 'n_harmony',
    teamPokemon: [
      { id: 643, name: 'Reshiram', level: 100, customMoves: ['Fiammabrdata', 'Dragopulsar', 'Focalcolpo', 'Geoforza'] },
      { id: 644, name: 'Zekrom', level: 100, customMoves: ['Generatore Volt', 'Oltraggio', 'Pietrataglio', 'Terremoto'] },
      { id: 571, name: 'Zoroark', level: 100, customMoves: ['UrtoOscuro', 'Focalcolpo', 'Lanciafiamme', 'Congiura'] },
      { id: 567, name: 'Archeops', level: 100, customMoves: ['Pietrataglio', 'Eterelama', 'Terremoto', 'Acquajet'] },
      { id: 565, name: 'Carracosta', level: 100, customMoves: ['Cascata', 'Gelaraggio', 'Pietrataglio', 'Guscioforza'] },
      { id: 601, name: 'Klinklang', level: 100, customMoves: ['Scintilla', 'Pesobomba', 'Sgranocchio', 'Agilità'] }
    ],
    rewardPokemon: {
      id: 571,
      name: 'Zoroark',
      level: 70,
      isShiny: true,
      nickname: 'Zoroark "Cromatico"',
      moves: ['UrtoOscuro', 'Focalcolpo', 'Lanciafiamme', 'Congiura'],
      description: 'Zoroark Cromatico d\'Inestimabile Valore donato da N con IV 31/31/31/31/31/31.'
    }
  },
  {
    id: 'boss-baldo',
    name: 'Baldo (Re del Piramide)',
    title: 'Asso del Parco Lotta di Hoenn',
    region: 'Parco Lotta / Hoenn',
    quote: 'Chiunque osi profanare il tempio dei Giganti dovrà affrontare la mia invincibile squadra!',
    winQuote: 'Sbalorditivo... La tua tenacia supera perfino la roccia ed il ferro delle mie leggende!',
    moneyReward: 55000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/brandon.png',
    avatar: '🗿',
    buffName: 'Fortezza Gigante',
    buffDescription: 'I suoi Pokémon subiscono il 10% in meno di danno ed hanno immunità ai brutti colpi.',
    buffType: 'baldo_fortress',
    teamPokemon: [
      { id: 377, name: 'Regirock', level: 100, customMoves: ['Pietrataglio', 'Terremoto', 'Pesobomba', 'Tossina'] },
      { id: 378, name: 'Regice', level: 100, customMoves: ['Gelaraggio', 'Focalcolpo', 'Pulsarforza', 'Sgranocchio'] },
      { id: 379, name: 'Registeel', level: 100, customMoves: ['Meteorpugno', 'Terremoto', 'Punte', 'Tossina'] },
      { id: 145, name: 'Zapdos', level: 100, customMoves: ['Fulmine', 'Tifone', 'Onda Calda', 'Balzo'] },
      { id: 146, name: 'Moltres', level: 100, customMoves: ['Fuocobomba', 'Eterelama', 'Solarraggio', 'Tossina'] },
      { id: 144, name: 'Articuno', level: 100, customMoves: ['Gelaraggio', 'Tifone', 'Pulsarforza', 'Agilità'] }
    ],
    rewardPokemon: {
      id: 486,
      name: 'Regigigas',
      level: 70,
      isShiny: true,
      nickname: 'Regigigas "Titano Primordiale"',
      moves: ['Giga Impatto', 'Terremoto', 'Pietrataglio', 'Sgranocchio'],
      description: 'Regigigas Cromatico del Re del Piramide Baldo con IV perfetti al 100%!'
    }
  },
  {
    id: 'boss-nardo',
    name: 'Campione Nardo',
    title: 'Il Vagabondo Leggendario di Unima',
    region: 'Unima',
    quote: 'I Pokémon ed gli umani imparano e crescono insieme viaggiando affiancati.',
    winQuote: 'Che meraviglioso calore emana la tua squadra! Sei un vero campione nel cuore.',
    moneyReward: 50000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/alder.png',
    avatar: '🦋',
    buffName: 'Spirito della Natura',
    buffDescription: '+12% Attacco Fisico e +10% Velocità a tutti i Pokémon della sua squadra.',
    buffType: 'nardo_spirit',
    teamPokemon: [
      { id: 637, name: 'Volcarona', level: 100, customMoves: ['Eterelama', 'Vampata', 'Gigassorbimento', 'Elettrotela'] },
      { id: 626, name: 'Bouffalant', level: 100, customMoves: ['Capocciata', 'Terremoto', 'Zuffa', 'Pietrataglio'] },
      { id: 589, name: 'Escavalier', level: 100, customMoves: ['Meteorpugno', 'Forzaforbice', 'Privazione', 'Pugnoscarica'] },
      { id: 617, name: 'Accelgor', level: 100, customMoves: ['Ondafango', 'Gigassorbimento', 'Palla Ombra', 'Tossina'] },
      { id: 621, name: 'Druddigon', level: 100, customMoves: ['Oltraggio', 'Terremoto', 'Pietrataglio', 'Sgranocchio'] },
      { id: 584, name: 'Vanilluxe', level: 100, customMoves: ['Gelaraggio', 'Pulsarforza', 'Luminomossa', 'Palla Ombra'] }
    ],
    rewardPokemon: {
      id: 637,
      name: 'Volcarona',
      level: 70,
      isShiny: true,
      nickname: 'Volcarona "Sole Solare"',
      moves: ['Eterelama', 'Vampata', 'Gigassorbimento', 'Elettrotela'],
      description: 'Volcarona Cromatico di Nardo con IV perfetti 31/31/31/31/31/31.'
    }
  },
  {
    id: 'boss-perla',
    name: 'Perla & Eredi di Hisui',
    title: 'I Guardiani del Tempo e dello Spazio',
    region: 'Hisui Ancestrale',
    quote: 'Nel grande e sterminato cielo di Hisui, il nostro legame risplende come neve al sole!',
    winQuote: 'La tua forza risuona con la melodia stessa di Arceus!',
    moneyReward: 50000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/irida.png',
    avatar: '❄️',
    buffName: 'Benedizione delle Origini',
    buffDescription: '+10% Attacco Speciale ed aumento del 10% della probabilità di sferrare Brutti Colpi.',
    buffType: 'perla_origins',
    teamPokemon: [
      { id: 571, name: 'Zoroark Hisui', level: 100, customMoves: ['UrtoOscuro', 'Palla Ombra', 'Focalcolpo', 'Lanciafiamme'] },
      { id: 706, name: 'Goodra Hisui', level: 100, customMoves: ['Dragopulsar', 'Meteorpugno', 'Gelaraggio', 'Ripresa'] },
      { id: 59, name: 'Arcanine Hisui', level: 100, customMoves: ['Fuococarica', 'Pietrataglio', 'Zuffa', 'Extrarapido'] },
      { id: 157, name: 'Typhlosion Hisui', level: 100, customMoves: ['Fuocobomba', 'Palla Ombra', 'Focalcolpo', 'Eterelama'] },
      { id: 471, name: 'Glaceon', level: 100, customMoves: ['Gelaraggio', 'Pulsarforza', 'Palla Ombra', 'Luminomossa'] },
      { id: 484, name: 'Palkia', level: 100, customMoves: ['Fendispazio', 'Idropompa', 'Gelaraggio', 'Pulsarforza'] }
    ],
    rewardPokemon: {
      id: 571,
      name: 'Zoroark Hisui',
      level: 70,
      isShiny: true,
      nickname: 'Zoroark Hisui "Ancestrale"',
      moves: ['UrtoOscuro', 'Palla Ombra', 'Focalcolpo', 'Lanciafiamme'],
      description: 'Zoroark di Hisui Cromatico (Spettro/Normale) dalle leggende antiche con IV 100%!'
    }
  },
  {
    id: 'boss-iridio',
    name: 'Iridio',
    title: 'L\'Alleato d\'Argento della Fondazione Aether',
    region: 'Alola',
    quote: 'Io ed il mio Silvally abbiamo spezzato ogni catena! Niente fermerà il nostro cammino!',
    winQuote: 'Sei forte... Molto più forte di quanto immaginassi. È stato un onore.',
    moneyReward: 50000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/gladion.png',
    avatar: '⚙️',
    buffName: 'Sintesi Alchemica',
    buffDescription: '+10% Attacco e +10% Difesa a tutti i suoi Pokémon.',
    buffType: 'iridio_synthesis',
    teamPokemon: [
      { id: 773, name: 'Silvally', level: 100, customMoves: ['Multiattacco', 'Sgranocchio', 'Terremoto', 'Danzaspada'] },
      { id: 448, name: 'Lucario', level: 100, customMoves: ['Zuffa', 'Pulsarforza', 'Geleripiego', 'Danzaspada'] },
      { id: 169, name: 'Crobat', level: 100, customMoves: ['Eterelama', 'Velenocolpo', 'Privazione', 'Tossina'] },
      { id: 745, name: 'Lycanroc Notte', level: 100, customMoves: ['Pietrataglio', 'Sgranocchio', 'Zuffa', 'Controfuoco'] },
      { id: 474, name: 'Porygon-Z', level: 100, customMoves: ['Triplo Attacco', 'Palla Ombra', 'Fulmine', 'Gelaraggio'] },
      { id: 94, name: 'Gengar', level: 100, customMoves: ['Palla Ombra', 'Fangobomba', 'Focalcolpo', 'Fuocofatuo'] }
    ],
    rewardPokemon: {
      id: 773,
      name: 'Silvally',
      level: 70,
      isShiny: true,
      nickname: 'Silvally "Multiattacco"',
      moves: ['Multiattacco', 'Sgranocchio', 'Terremoto', 'Danzaspada'],
      description: 'Silvally Cromatico di Iridio con IV perfetti in tutte le statistiche!'
    }
  },
  {
    id: 'boss-oak',
    name: 'Prof. Oak',
    title: 'Il Grande Maestro Pokémon',
    region: 'Kanto / Pallet Town',
    quote: 'Benvenuto nel mondo dei Pokémon! Dimmi, fino a dove si spinge la tua conoscenza?',
    winQuote: 'Sbalorditivo! Hai superato persino la mia esperienza di un\'intera vita!',
    moneyReward: 60000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/oak.png',
    avatar: '📜',
    buffName: 'Sapienza Suprema',
    buffDescription: '+10% Attacco Speciale e +12% Difesa Speciale. Immunità ai problemi di stato.',
    buffType: 'oak_wisdom',
    teamPokemon: [
      { id: 128, name: 'Tauros', level: 100, customMoves: ['Capocciata', 'Terremoto', 'Pietrataglio', 'Zuffa'] },
      { id: 103, name: 'Exeggutor', level: 100, customMoves: ['Gigassorbimento', 'Psichico', 'Sonnifero', 'Mazzabrutta'] },
      { id: 59, name: 'Arcanine', level: 100, customMoves: ['Fuococarica', 'Zuffa', 'Extrarapido', 'Sgranocchio'] },
      { id: 130, name: 'Gyarados', level: 100, customMoves: ['Cascata', 'Pietrataglio', 'Sgranocchio', 'Dragodanza'] },
      { id: 6, name: 'Charizard', level: 100, customMoves: ['Lanciafiamme', 'Eterelama', 'Focalcolpo', 'Dragopulsar'] },
      { id: 149, name: 'Dragonite', level: 100, customMoves: ['Oltraggio', 'Extrarapido', 'Tifone', 'Dragodanza'] }
    ],
    rewardPokemon: {
      id: 128,
      name: 'Tauros',
      level: 70,
      isShiny: true,
      nickname: 'Tauros "Capobranco"',
      moves: ['Capocciata', 'Terremoto', 'Pietrataglio', 'Zuffa'],
      description: 'Il leggendario Tauros Cromatico del Prof. Oak con IV 31/31/31/31/31/31.'
    }
  },
  {
    id: 'boss-nemona',
    name: 'Campionessa Nemona',
    title: 'La Rivelazione di Paldea',
    region: 'Paldea / Accademia Uva',
    quote: 'Lottiamo! Lottiamo ancora e ancora! Non vedevo l\'ora di affrontare un vero avversario!',
    winQuote: 'EVVIVA! Che lotta epica! Devo assolutamente allenarmi di più per la prossima volta!',
    moneyReward: 55000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/nemona-masters.png',
    avatar: '⚡',
    buffName: 'Entusiasmo Inesauribile',
    buffDescription: '+12% Velocità e +10% Attacco Fisico a tutti i suoi Pokémon.',
    buffType: 'nemona_passion',
    teamPokemon: [
      { id: 908, name: 'Meowscarada', level: 100, customMoves: ['Prestigiatore', 'Forzaforbice', 'Zuffa', 'Acquajet'] },
      { id: 923, name: 'Pawmot', level: 100, customMoves: ['Pugnoscarica', 'Elettropugno', 'Zuffa', 'Preghiera'] },
      { id: 706, name: 'Goodra Hisui', level: 100, customMoves: ['Dragopulsar', 'Meteorpugno', 'Gelaraggio', 'Ripresa'] },
      { id: 745, name: 'Lycanroc', level: 100, customMoves: ['Pietrataglio', 'Zuffa', 'Sgranocchio', 'Controfuoco'] },
      { id: 968, name: 'Orthworm', level: 100, customMoves: ['Pesobomba', 'Terremoto', 'Pietrataglio', 'Tossina'] },
      { id: 998, name: 'Baxcalibur', level: 100, customMoves: ['Sciabola di Ghiaccio', 'Oltraggio', 'Terremoto', 'Danzadrago'] }
    ],
    rewardPokemon: {
      id: 998,
      name: 'Baxcalibur',
      level: 70,
      isShiny: true,
      nickname: 'Baxcalibur "Ghiaccio Nero"',
      moves: ['Sciabola di Ghiaccio', 'Oltraggio', 'Terremoto', 'Danzadrago'],
      description: 'Baxcalibur Cromatico della Campionessa Nemona con IV perfetti 100%!'
    }
  },
  {
    id: 'boss-palmer',
    name: 'Asso Palmer',
    title: 'Il Re del Parco Lotta di Sinnoh',
    region: 'Sinnoh / Torre Lotta',
    quote: 'Orgoglioso padre ed Asso della Torre Lotta. Metti alla prova la tua squadra contro la mia!',
    winQuote: 'Meraviglioso! Risplendi dello stesso spirito dei più grandi maestri Pokémon!',
    moneyReward: 50000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/palmer.png',
    avatar: '🏰',
    buffName: 'Determinazione Infrangibile',
    buffDescription: '+12% Difesa e Difesa Speciale. Immunità ai cali di precisione.',
    buffType: 'palmer_tower',
    teamPokemon: [
      { id: 464, name: 'Rhyperior', level: 100, customMoves: ['Devastoroccia', 'Terremoto', 'Megacorno', 'Pietrataglio'] },
      { id: 149, name: 'Dragonite', level: 100, customMoves: ['Extrarapido', 'Oltraggio', 'Tifone', 'Dragodanza'] },
      { id: 350, name: 'Milotic', level: 100, customMoves: ['Surf', 'Gelaraggio', 'Ripresa', 'Tossina'] },
      { id: 486, name: 'Regigigas', level: 100, customMoves: ['Giga Impatto', 'Terremoto', 'Pietrataglio', 'Sgranocchio'] },
      { id: 488, name: 'Cresselia', level: 100, customMoves: ['Psichico', 'Palla Ombra', 'Luminomossa', 'Ripresa'] },
      { id: 485, name: 'Heatran', level: 100, customMoves: ['Magmastroncatura', 'Geoforza', 'Lanciafiamme', 'Pulsarforza'] }
    ],
    rewardPokemon: {
      id: 485,
      name: 'Heatran',
      level: 70,
      isShiny: true,
      nickname: 'Heatran "Vulcano"',
      moves: ['Magmastroncatura', 'Geoforza', 'Lanciafiamme', 'Pulsarforza'],
      description: 'Heatran Cromatico dell\'Asso Palmer con IV al massimo 31/31/31/31/31/31.'
    }
  },
  {
    id: 'boss-volo',
    name: 'Volo',
    title: 'Il Mercante della Ginkgo Guild',
    region: 'Hisui / Tempio di Sinnoh',
    quote: 'Invocherò il potere primordiale del Creatore per forgiare un nuovo mondo di pura armonia!',
    winQuote: 'Come... come può la mia volontà crollare dinanzi alla tua luce?!',
    moneyReward: 65000,
    sprite: 'https://play.pokemonshowdown.com/sprites/trainers/volo.png',
    avatar: '👻',
    buffName: 'Ombra del Destino',
    buffDescription: '+10% Attacco e +10% Attacco Speciale. Potenza di mosse Spettro e Buio +15%.',
    buffType: 'volo_shadow',
    teamPokemon: [
      { id: 442, name: 'Spiritomb', level: 100, customMoves: ['Neropulsar', 'Palla Ombra', 'Fuocofatuo', 'Psichico'] },
      { id: 407, name: 'Roserade', level: 100, customMoves: ['Gigassorbimento', 'Fangobomba', 'Palla Ombra', 'Sintesi'] },
      { id: 468, name: 'Togekiss', level: 100, customMoves: ['Eterelama', 'Magibrillio', 'Lanciafiamme', 'Forzasfera'] },
      { id: 448, name: 'Lucario', level: 100, customMoves: ['Zuffa', 'Pulsarforza', 'Geleripiego', 'Danzaspada'] },
      { id: 59, name: 'Arcanine Hisui', level: 100, customMoves: ['Fuococarica', 'Pietrataglio', 'Zuffa', 'Extrarapido'] },
      { id: 487, name: 'Giratina', level: 100, customMoves: ['Oscurotuffo', 'Dragopulsar', 'Palla Ombra', 'Geoforza'] }
    ],
    rewardPokemon: {
      id: 487,
      name: 'Giratina',
      level: 70,
      isShiny: true,
      nickname: 'Giratina "Forma Cromatico"',
      moves: ['Oscurotuffo', 'Dragopulsar', 'Palla Ombra', 'Geoforza'],
      description: 'Giratina Cromatico di Volo in Forma Originale con IV perfetti 100%!'
    }
  }
];

export async function buildBossTrainer(boss: LegendaryBoss): Promise<Trainer & { bossBuff: string; bossBuffName: string }> {
  const team: Pokemon[] = [];

  for (const entry of boss.teamPokemon) {
    const p = await fetchPokemonData(entry.id, 100, `Sfida Boss - ${boss.name}`);
    
    // Override IVs to perfect 31/31/31/31/31/31
    const maxIvs = { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 };
    const maxEvs = { hp: 252, attack: 252, defense: 4, spAtk: 252, spDef: 4, speed: 252 };

    // Recalculate stats for level 100 with 31 IVs and 252 EVs
    const calcHp = Math.floor(((2 * p.baseStats.hp + 31 + Math.floor(252 / 4)) * 100) / 100) + 100 + 10;
    const calcAtk = Math.floor((((2 * p.baseStats.attack + 31 + Math.floor(252 / 4)) * 100) / 100) + 5);
    const calcDef = Math.floor((((2 * p.baseStats.defense + 31 + Math.floor(4 / 4)) * 100) / 100) + 5);
    const calcSpAtk = Math.floor((((2 * p.baseStats.spAtk + 31 + Math.floor(252 / 4)) * 100) / 100) + 5);
    const calcSpDef = Math.floor((((2 * p.baseStats.spDef + 31 + Math.floor(4 / 4)) * 100) / 100) + 5);
    const calcSpeed = Math.floor((((2 * p.baseStats.speed + 31 + Math.floor(252 / 4)) * 100) / 100) + 5);

    p.ivs = maxIvs;
    p.evs = maxEvs;
    p.maxHp = calcHp;
    p.hp = calcHp;
    p.stats = {
      attack: calcAtk,
      defense: calcDef,
      spAtk: calcSpAtk,
      spDef: calcSpDef,
      speed: calcSpeed
    };

    // If custom moves specified, fetch or keep best moves
    if (entry.customMoves && entry.customMoves.length > 0) {
      // Map moves to custom move names
      const moveObjects = p.moves.map((m, idx) => {
        const customName = entry.customMoves![idx];
        if (customName) {
          return {
            ...m,
            name: customName,
            power: m.power > 0 ? m.power : 90
          };
        }
        return m;
      });
      p.moves = moveObjects;
    }

    team.push(p);
  }

  return {
    id: boss.id,
    name: boss.name,
    type: 'Allenatore Leggendario',
    sprite: boss.sprite,
    team,
    quote: boss.quote,
    winQuote: boss.winQuote,
    moneyReward: boss.moneyReward,
    bossBuff: boss.buffType,
    bossBuffName: boss.buffName
  };
}

export async function generateBossRewardPokemon(boss: LegendaryBoss): Promise<Pokemon> {
  const spec = boss.rewardPokemon;
  const p = await fetchPokemonData(spec.id, spec.level, `Premio Primo Trionfo: ${boss.name}`);
  
  p.name = spec.nickname || p.name;
  p.nickname = spec.nickname;
  p.isShiny = spec.isShiny;
  p.originalTrainer = boss.name;
  p.caughtLocation = `Sfidante del Boss ${boss.name}`;

  // Set Perfect IVs
  p.ivs = { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 };
  
  // Recalculate Stats for Level 70 with max IVs
  const lvl = spec.level;
  p.maxHp = Math.floor(((2 * p.baseStats.hp + 31 + 16) * lvl) / 100) + lvl + 10;
  p.hp = p.maxHp;
  p.stats = {
    attack: Math.floor((((2 * p.baseStats.attack + 31 + 16) * lvl) / 100) + 5),
    defense: Math.floor((((2 * p.baseStats.defense + 31 + 16) * lvl) / 100) + 5),
    spAtk: Math.floor((((2 * p.baseStats.spAtk + 31 + 16) * lvl) / 100) + 5),
    spDef: Math.floor((((2 * p.baseStats.spDef + 31 + 16) * lvl) / 100) + 5),
    speed: Math.floor((((2 * p.baseStats.speed + 31 + 16) * lvl) / 100) + 5)
  };

  // Custom moves
  if (spec.moves && spec.moves.length > 0) {
    p.moves = p.moves.map((m, idx) => {
      const cName = spec.moves[idx];
      return cName ? { ...m, name: cName, power: m.power || 90 } : m;
    });
  }

  return p;
}
