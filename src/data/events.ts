import { Item } from '../types/game';

export interface GameEvent {
  id: string;
  type: 'dialogue' | 'item' | 'battle' | 'heal';
  triggerChance: number;
  message: string;
  speaker?: string;
  sprite?: string;
  item?: Partial<Item>;
  money?: number;
}

export const ZONE_EVENTS: Record<string, GameEvent[]> = {
  'bosco': [
    {
      id: 'event-bosco-1',
      type: 'dialogue',
      triggerChance: 0.1,
      message: 'Hai visto il mio Caterpie? È scappato perché voleva farsi un selfie con un Weedle selvatico!',
      speaker: 'Pupo Marco',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/10.png'
    },
    {
      id: 'event-bosco-2',
      type: 'item',
      triggerChance: 0.05,
      message: 'Hai trovato una Pozione smarrita tra i cespugli!',
      item: { name: 'Pozione', type: 'healing', effectValue: 20 }
    },
    {
      id: 'event-bosco-3',
      type: 'dialogue',
      triggerChance: 0.08,
      message: 'Si dice che nelle notti di luna piena, uno spirito rosa voli tra le chiome degli alberi...',
      speaker: 'Anziano saggio',
    }
  ],
  'prateria': [
    {
      id: 'event-prateria-1',
      type: 'dialogue',
      triggerChance: 0.1,
      message: 'Attento al lag! Ieri sono rimasto bloccato in un frame per tre ore.',
      speaker: 'Corridore Fabio',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/15.png'
    },
    {
      id: 'event-prateria-2',
      type: 'heal',
      triggerChance: 0.08,
      message: 'Ti riposi un po\' sull\'erba alta. I tuoi Pokémon si sentono meglio!',
    },
    {
      id: 'event-prateria-3',
      type: 'item',
      triggerChance: 0.06,
      message: 'Hai trovato una Mega Ball abbandonata!',
      item: { name: 'Mega Ball', type: 'capture', effectValue: 1.5 }
    }
  ],
  'vulcano': [
    {
      id: 'event-vulcano-1',
      type: 'dialogue',
      triggerChance: 0.15,
      message: 'Fa caldo qui, vero? È tutta colpa del flame dei commenti!',
      speaker: 'Montanaro Rocco',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/20.png'
    },
    {
      id: 'event-vulcano-2',
      type: 'dialogue',
      triggerChance: 0.07,
      message: 'Dicono che il leggendario Entei sia stato avvistato vicino a quella colata lavica...',
      speaker: 'Cercatore di Hype',
    }
  ],
  'spiaggia': [
    {
      id: 'event-spiaggia-1',
      type: 'item',
      triggerChance: 0.1,
      message: 'Un\'onda ha portato a riva una Mega Ball!',
      item: { name: 'Mega Ball', type: 'capture', effectValue: 1.5 }
    },
    {
      id: 'event-spiaggia-2',
      type: 'dialogue',
      triggerChance: 0.1,
      message: 'I Pokémon d\'acqua qui sono molto felici, l\'acqua è sempre fresca!',
      speaker: 'Bagnina Sara',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/30.png'
    }
  ],
  'grotta': [
    {
      id: 'event-grotta-1',
      type: 'dialogue',
      triggerChance: 0.12,
      message: 'Il buio qui dentro è così profondo che sembra di essere in un file .json mal formato.',
      speaker: 'Speleologo Glitch',
    },
    {
      id: 'event-grotta-2',
      type: 'item',
      triggerChance: 0.08,
      message: 'Hai trovato una Corda di Fuga! Potrebbe servire per uscire da questo loop.',
      item: { name: 'Fune di Fuga', type: 'other', description: 'Permette di tornare subito al villaggio.' }
    }
  ],
  'cimitero': [
    {
      id: 'event-cimitero-1',
      type: 'dialogue',
      triggerChance: 0.1,
      message: 'Sento le voci dei Pokémon che non sono stati catturati... "Perché hai usato una Poké Ball normale?!" sussurrano.',
      speaker: 'Medium Pixel',
    },
    {
      id: 'event-cimitero-2',
      type: 'heal',
      triggerChance: 0.05,
      message: 'Una strana nebbia viola avvolge i tuoi Pokémon. Si sentono stranamente... rinvigoriti.',
    }
  ],
  'laboratorio': [
    {
      id: 'event-laboratorio-1',
      type: 'dialogue',
      triggerChance: 0.1,
      message: 'Stiamo cercando di caricare un Pokémon leggendario, ma la barra è ferma al 99% da tre giorni.',
      speaker: 'Scienziato Stuck',
    },
    {
      id: 'event-laboratorio-2',
      type: 'item',
      triggerChance: 0.1,
      message: 'Hai trovato una Caramella Rara caduta sotto un banco di prova!',
      item: { name: 'Caramella Rara', type: 'other', effectValue: 1 }
    }
  ],
  'montagna': [
    {
      id: 'event-montagna-1',
      type: 'dialogue',
      triggerChance: 0.1,
      message: 'Più sali, più la risoluzione cala. Guarda quelle nuvole a 8-bit!',
      speaker: 'Scalatore Low-Res',
    },
    {
      id: 'event-montagna-2',
      type: 'item',
      triggerChance: 0.08,
      message: 'Hai trovato una Ultra Ball ghiacciata nel permafrost!',
      item: { name: 'Ultra Ball', type: 'capture', effectValue: 2.0 }
    }
  ],
  'rovina': [
    {
      id: 'event-rovina-1',
      type: 'dialogue',
      triggerChance: 0.1,
      message: 'Qui riposano le versioni beta del gioco mai pubblicate.',
      speaker: 'Archeologo Beta',
    },
    {
      id: 'event-rovina-2',
      type: 'dialogue',
      triggerChance: 0.05,
      message: 'Un antico murale raffigura tre creature leggendarie che controllano il tempo, lo spazio e i glitch.',
    }
  ]
};
