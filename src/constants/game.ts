import { Pokemon } from '../types/game';
import { SPRITES } from './sprites';

export interface Zone {
  id: string;
  name: string;
  description: string;
  background: string;
  spawnTable: {
    pokemonId: number;
    rarity: number; // 0-100
    minLevel: number;
    maxLevel: number;
  }[];
}

export const ZONES: Zone[] = [
  {
    id: 'villaggio',
    name: 'Borgo Sfigato',
    description: 'Il posto più noioso del mondo, ma ci vivi tu.',
    background: 'bg-green-100',
    spawnTable: [],
  },
  {
    id: 'bosco',
    name: 'Bosco dei Selfie',
    description: 'Pieno di Caterpie vanitosi e allenatori distratti.',
    background: 'bg-emerald-200',
    spawnTable: [
      { pokemonId: 10, rarity: 10, minLevel: 2, maxLevel: 5 }, // Caterpie
      { pokemonId: 13, rarity: 10, minLevel: 2, maxLevel: 5 }, // Weedle
      { pokemonId: 11, rarity: 5, minLevel: 4, maxLevel: 6 },  // Metapod
      { pokemonId: 14, rarity: 5, minLevel: 4, maxLevel: 6 },  // Kakuna
      { pokemonId: 56, rarity: 4, minLevel: 6, maxLevel: 10 }, // Mankey
      { pokemonId: 165, rarity: 8, minLevel: 2, maxLevel: 5 }, // Ledyba
      { pokemonId: 167, rarity: 8, minLevel: 2, maxLevel: 5 }, // Spinarak
      { pokemonId: 191, rarity: 6, minLevel: 4, maxLevel: 8 }, // Sunkern
      { pokemonId: 193, rarity: 4, minLevel: 8, maxLevel: 14 }, // Yanma
      { pokemonId: 265, rarity: 8, minLevel: 3, maxLevel: 5 }, // Wurmple
      { pokemonId: 283, rarity: 5, minLevel: 4, maxLevel: 8 }, // Surskit
      { pokemonId: 285, rarity: 6, minLevel: 5, maxLevel: 8 },  // Shroomish
      { pokemonId: 1, rarity: 3, minLevel: 5, maxLevel: 7 },   // Bulbasaur
      { pokemonId: 152, rarity: 3, minLevel: 5, maxLevel: 7 }, // Chikorita
      { pokemonId: 252, rarity: 3, minLevel: 5, maxLevel: 7 }, // Treecko
      { pokemonId: 387, rarity: 3, minLevel: 5, maxLevel: 7 }, // Turtwig
      { pokemonId: 495, rarity: 3, minLevel: 5, maxLevel: 7 }, // Snivy
      { pokemonId: 650, rarity: 3, minLevel: 5, maxLevel: 7 }, // Chespin
      { pokemonId: 722, rarity: 3, minLevel: 5, maxLevel: 7 }, // Rowlet
      { pokemonId: 810, rarity: 3, minLevel: 5, maxLevel: 7 }, // Grookey
      { pokemonId: 906, rarity: 3, minLevel: 5, maxLevel: 7 }, // Sprigatito
      { pokemonId: 43, rarity: 5, minLevel: 4, maxLevel: 8 },  // Oddish
      { pokemonId: 69, rarity: 5, minLevel: 4, maxLevel: 8 },  // Bellsprout
      { pokemonId: 46, rarity: 4, minLevel: 6, maxLevel: 10 }, // Paras
      { pokemonId: 48, rarity: 4, minLevel: 8, maxLevel: 12 }, // Venonat
      { pokemonId: 102, rarity: 4, minLevel: 10, maxLevel: 15 }, // Exeggcute
      { pokemonId: 114, rarity: 3, minLevel: 12, maxLevel: 18 }, // Tangela
      { pokemonId: 123, rarity: 2, minLevel: 15, maxLevel: 20 }, // Scyther
      { pokemonId: 127, rarity: 2, minLevel: 15, maxLevel: 20 }, // Pinsir
      { pokemonId: 163, rarity: 6, minLevel: 3, maxLevel: 7 },  // Hoothoot
      { pokemonId: 204, rarity: 5, minLevel: 8, maxLevel: 12 }, // Pineco
      { pokemonId: 214, rarity: 2, minLevel: 18, maxLevel: 25 }, // Heracross
      { pokemonId: 287, rarity: 4, minLevel: 5, maxLevel: 10 }, // Slakoth
      { pokemonId: 290, rarity: 3, minLevel: 6, maxLevel: 12 }, // Nincada
      { pokemonId: 273, rarity: 5, minLevel: 4, maxLevel: 9 },  // Seedot
      { pokemonId: 313, rarity: 4, minLevel: 8, maxLevel: 14 }, // Volbeat
      { pokemonId: 314, rarity: 4, minLevel: 8, maxLevel: 14 }, // Illumise
      { pokemonId: 315, rarity: 3, minLevel: 12, maxLevel: 18 }, // Roselia
      { pokemonId: 352, rarity: 3, minLevel: 15, maxLevel: 22 }, // Kecleon
      { pokemonId: 357, rarity: 2, minLevel: 18, maxLevel: 25 }, // Tropius
      { pokemonId: 401, rarity: 5, minLevel: 4, maxLevel: 8 },  // Kricketot
      { pokemonId: 406, rarity: 5, minLevel: 4, maxLevel: 8 },  // Budew
      { pokemonId: 412, rarity: 5, minLevel: 5, maxLevel: 10 }, // Burmy
      { pokemonId: 415, rarity: 4, minLevel: 8, maxLevel: 12 }, // Combee
      { pokemonId: 420, rarity: 4, minLevel: 10, maxLevel: 15 }, // Cherubi
      { pokemonId: 455, rarity: 2, minLevel: 18, maxLevel: 24 }, // Carnivine
      { pokemonId: 511, rarity: 4, minLevel: 8, maxLevel: 14 },  // Pansage
      { pokemonId: 540, rarity: 5, minLevel: 6, maxLevel: 11 }, // Sewaddle
      { pokemonId: 543, rarity: 4, minLevel: 8, maxLevel: 14 }, // Venipede
      { pokemonId: 546, rarity: 4, minLevel: 10, maxLevel: 15 }, // Cottonee
      { pokemonId: 548, rarity: 4, minLevel: 10, maxLevel: 15 }, // Petilil
      { pokemonId: 588, rarity: 3, minLevel: 12, maxLevel: 18 }, // Karrablast
      { pokemonId: 590, rarity: 3, minLevel: 12, maxLevel: 20 }, // Foongus
      { pokemonId: 595, rarity: 3, minLevel: 15, maxLevel: 22 }, // Joltik
      { pokemonId: 597, rarity: 3, minLevel: 14, maxLevel: 20 }, // Ferroseed
      { pokemonId: 616, rarity: 3, minLevel: 12, maxLevel: 18 }, // Shelmet
      { pokemonId: 664, rarity: 5, minLevel: 4, maxLevel: 8 },  // Scatterbug
      { pokemonId: 669, rarity: 4, minLevel: 6, maxLevel: 12 }, // Flabébé
      { pokemonId: 672, rarity: 4, minLevel: 10, maxLevel: 16 }, // Skiddo
      { pokemonId: 674, rarity: 3, minLevel: 12, maxLevel: 18 }, // Pancham
      { pokemonId: 708, rarity: 3, minLevel: 18, maxLevel: 25 }, // Phantump
      { pokemonId: 710, rarity: 3, minLevel: 18, maxLevel: 25 }, // Pumpkaboo
      { pokemonId: 736, rarity: 5, minLevel: 5, maxLevel: 10 }, // Grubbin
      { pokemonId: 742, rarity: 4, minLevel: 6, maxLevel: 12 }, // Cutiefly
      { pokemonId: 753, rarity: 4, minLevel: 12, maxLevel: 18 }, // Fomantis
      { pokemonId: 755, rarity: 4, minLevel: 10, maxLevel: 16 }, // Morelull
      { pokemonId: 761, rarity: 4, minLevel: 8, maxLevel: 14 }, // Bounsweet
      { pokemonId: 765, rarity: 2, minLevel: 15, maxLevel: 22 }, // Oranguru
      { pokemonId: 766, rarity: 2, minLevel: 15, maxLevel: 22 }, // Passimian
      { pokemonId: 824, rarity: 5, minLevel: 4, maxLevel: 9 },  // Blipbug
      { pokemonId: 827, rarity: 4, minLevel: 6, maxLevel: 12 }, // Nickit
      { pokemonId: 829, rarity: 4, minLevel: 8, maxLevel: 14 }, // Gossifleur
      { pokemonId: 840, rarity: 3, minLevel: 15, maxLevel: 20 }, // Applin
      { pokemonId: 859, rarity: 3, minLevel: 14, maxLevel: 20 }, // Impidimp
      { pokemonId: 917, rarity: 5, minLevel: 4, maxLevel: 8 },  // Tarountula
      { pokemonId: 919, rarity: 4, minLevel: 5, maxLevel: 10 }, // Nymble
      { pokemonId: 928, rarity: 4, minLevel: 6, maxLevel: 12 }, // Smoliv
      { pokemonId: 944, rarity: 3, minLevel: 12, maxLevel: 18 }, // Shroodle
      { pokemonId: 946, rarity: 3, minLevel: 12, maxLevel: 18 }, // Capsakid
      { pokemonId: 251, rarity: 0.5, minLevel: 30, maxLevel: 30 }, // Celebi (Molto raro!)
      { pokemonId: 151, rarity: 0.5, minLevel: 30, maxLevel: 30 }, // Mew (Molto raro!)
      { pokemonId: 492, rarity: 0.5, minLevel: 30, maxLevel: 30 }, // Shaymin (Molto raro!)
    ],
  },
  {
    id: 'prateria',
    name: 'Prateria del Lag',
    description: 'Qui tutto si muove a scatti, o forse sei tu.',
    background: 'bg-yellow-100',
    spawnTable: [
      { pokemonId: 16, rarity: 8, minLevel: 4, maxLevel: 8 }, // Pidgey
      { pokemonId: 19, rarity: 8, minLevel: 4, maxLevel: 8 }, // Rattata
      { pokemonId: 21, rarity: 6, minLevel: 5, maxLevel: 9 },  // Spearow
      { pokemonId: 161, rarity: 7, minLevel: 4, maxLevel: 8 }, // Sentret
      { pokemonId: 177, rarity: 4, minLevel: 6, maxLevel: 10 }, // Natu
      { pokemonId: 263, rarity: 7, minLevel: 5, maxLevel: 9 }, // Zigzagoon
      { pokemonId: 276, rarity: 6, minLevel: 5, maxLevel: 9 },  // Taillow
      { pokemonId: 396, rarity: 6, minLevel: 4, maxLevel: 8 },  // Starly
      { pokemonId: 25, rarity: 4, minLevel: 7, maxLevel: 12 }, // Pikachu
      { pokemonId: 4, rarity: 3, minLevel: 10, maxLevel: 12 },  // Charmander
      { pokemonId: 155, rarity: 3, minLevel: 10, maxLevel: 12 }, // Cyndaquil
      { pokemonId: 255, rarity: 3, minLevel: 10, maxLevel: 12 }, // Torchic
      { pokemonId: 390, rarity: 3, minLevel: 10, maxLevel: 12 }, // Chimchar
      { pokemonId: 133, rarity: 2, minLevel: 5, maxLevel: 10 }, // Eevee
      { pokemonId: 35, rarity: 3, minLevel: 8, maxLevel: 12 },  // Clefairy
      { pokemonId: 29, rarity: 4, minLevel: 6, maxLevel: 11 },  // Nidoran F
      { pokemonId: 32, rarity: 4, minLevel: 6, maxLevel: 11 },  // Nidoran M
      { pokemonId: 39, rarity: 4, minLevel: 8, maxLevel: 14 },  // Jigglypuff
      { pokemonId: 63, rarity: 3, minLevel: 10, maxLevel: 16 }, // Abra
      { pokemonId: 84, rarity: 4, minLevel: 12, maxLevel: 18 }, // Doduo
      { pokemonId: 77, rarity: 4, minLevel: 14, maxLevel: 20 }, // Ponyta
      { pokemonId: 128, rarity: 2, minLevel: 20, maxLevel: 25 }, // Tauros
      { pokemonId: 179, rarity: 5, minLevel: 8, maxLevel: 13 },  // Mareep
      { pokemonId: 187, rarity: 6, minLevel: 5, maxLevel: 10 },  // Hoppip
      { pokemonId: 190, rarity: 4, minLevel: 10, maxLevel: 15 }, // Aipom
      { pokemonId: 203, rarity: 3, minLevel: 15, maxLevel: 22 }, // Girafarig
      { pokemonId: 209, rarity: 4, minLevel: 12, maxLevel: 18 }, // Snubbull
      { pokemonId: 241, rarity: 2, minLevel: 20, maxLevel: 25 }, // Miltank
      { pokemonId: 261, rarity: 6, minLevel: 6, maxLevel: 11 },  // Poochyena
      { pokemonId: 280, rarity: 3, minLevel: 10, maxLevel: 15 }, // Ralts
      { pokemonId: 300, rarity: 5, minLevel: 8, maxLevel: 14 },  // Skitty
      { pokemonId: 309, rarity: 4, minLevel: 12, maxLevel: 18 }, // Electrike
      { pokemonId: 335, rarity: 2, minLevel: 18, maxLevel: 24 }, // Zangoose
      { pokemonId: 336, rarity: 2, minLevel: 18, maxLevel: 24 }, // Seviper
      { pokemonId: 399, rarity: 6, minLevel: 4, maxLevel: 9 },   // Bidoof
      { pokemonId: 403, rarity: 5, minLevel: 7, maxLevel: 12 },  // Shinx
      { pokemonId: 417, rarity: 4, minLevel: 10, maxLevel: 15 }, // Pachirisu
      { pokemonId: 427, rarity: 4, minLevel: 12, maxLevel: 18 }, // Buneary
      { pokemonId: 504, rarity: 6, minLevel: 5, maxLevel: 10 },  // Patrat
      { pokemonId: 506, rarity: 5, minLevel: 6, maxLevel: 11 },  // Lillipup
      { pokemonId: 509, rarity: 5, minLevel: 8, maxLevel: 13 },  // Purrloin
      { pokemonId: 519, rarity: 6, minLevel: 6, maxLevel: 11 },  // Pidove
      { pokemonId: 522, rarity: 4, minLevel: 10, maxLevel: 16 }, // Blitzle
      { pokemonId: 572, rarity: 4, minLevel: 12, maxLevel: 18 }, // Minccino
      { pokemonId: 585, rarity: 4, minLevel: 10, maxLevel: 15 }, // Deerling
      { pokemonId: 659, rarity: 5, minLevel: 5, maxLevel: 10 },  // Bunnelby
      { pokemonId: 661, rarity: 5, minLevel: 6, maxLevel: 11 },  // Fletchling
      { pokemonId: 667, rarity: 4, minLevel: 12, maxLevel: 18 }, // Litleo
      { pokemonId: 731, rarity: 5, minLevel: 6, maxLevel: 11 },  // Pikipek
      { pokemonId: 734, rarity: 5, minLevel: 8, maxLevel: 13 },  // Yungoos
      { pokemonId: 744, rarity: 4, minLevel: 10, maxLevel: 16 }, // Rockruff
      { pokemonId: 759, rarity: 3, minLevel: 15, maxLevel: 22 }, // Stufful
      { pokemonId: 819, rarity: 6, minLevel: 4, maxLevel: 9 },   // Skwovet
      { pokemonId: 821, rarity: 5, minLevel: 6, maxLevel: 11 },  // Rookidee
      { pokemonId: 831, rarity: 5, minLevel: 8, maxLevel: 13 },  // Wooloo
      { pokemonId: 835, rarity: 4, minLevel: 10, maxLevel: 16 }, // Yamper
      { pokemonId: 441, rarity: 1, minLevel: 15, maxLevel: 25 }, // Chatot
      { pokemonId: 531, rarity: 2, minLevel: 12, maxLevel: 20 }, // Audino
      { pokemonId: 115, rarity: 1, minLevel: 20, maxLevel: 30 }, // Kangaskhan
      { pokemonId: 52, rarity: 5, minLevel: 6, maxLevel: 11 },   // Meowth
      { pokemonId: 54, rarity: 4, minLevel: 8, maxLevel: 13 },   // Psyduck
      { pokemonId: 83, rarity: 3, minLevel: 10, maxLevel: 16 },  // Farfetch'd
      { pokemonId: 96, rarity: 4, minLevel: 10, maxLevel: 15 },  // Drowzee
      { pokemonId: 108, rarity: 3, minLevel: 12, maxLevel: 18 }, // Lickitung
      { pokemonId: 172, rarity: 3, minLevel: 4, maxLevel: 8 },   // Pichu
      { pokemonId: 173, rarity: 3, minLevel: 4, maxLevel: 8 },   // Cleffa
      { pokemonId: 174, rarity: 3, minLevel: 4, maxLevel: 8 },   // Igglybuff
      { pokemonId: 175, rarity: 2, minLevel: 5, maxLevel: 10 },  // Togepi
      { pokemonId: 206, rarity: 4, minLevel: 8, maxLevel: 14 },  // Dunsparce
      { pokemonId: 234, rarity: 3, minLevel: 14, maxLevel: 20 }, // Stantler
      { pokemonId: 235, rarity: 2, minLevel: 12, maxLevel: 18 }, // Smeargle
      { pokemonId: 236, rarity: 3, minLevel: 10, maxLevel: 15 }, // Tyrogue
      { pokemonId: 311, rarity: 4, minLevel: 8, maxLevel: 14 },  // Plusle
      { pokemonId: 312, rarity: 4, minLevel: 8, maxLevel: 14 },  // Minun
      { pokemonId: 316, rarity: 4, minLevel: 8, maxLevel: 13 },  // Gulpin
      { pokemonId: 325, rarity: 4, minLevel: 10, maxLevel: 16 }, // Spoink
      { pokemonId: 327, rarity: 3, minLevel: 10, maxLevel: 16 }, // Spinda
      { pokemonId: 333, rarity: 3, minLevel: 12, maxLevel: 18 }, // Swablu
      { pokemonId: 351, rarity: 2, minLevel: 15, maxLevel: 22 }, // Castform
      { pokemonId: 358, rarity: 2, minLevel: 15, maxLevel: 22 }, // Chimecho
      { pokemonId: 431, rarity: 4, minLevel: 10, maxLevel: 15 }, // Glameow
      { pokemonId: 433, rarity: 3, minLevel: 8, maxLevel: 14 },  // Chingling
      { pokemonId: 438, rarity: 3, minLevel: 8, maxLevel: 14 },  // Bonsly
      { pokemonId: 439, rarity: 3, minLevel: 8, maxLevel: 14 },  // Mime Jr.
      { pokemonId: 440, rarity: 2, minLevel: 8, maxLevel: 14 },  // Happiny
      { pokemonId: 446, rarity: 1, minLevel: 12, maxLevel: 20 }, // Munchlax
      { pokemonId: 517, rarity: 3, minLevel: 10, maxLevel: 16 }, // Munna
      { pokemonId: 626, rarity: 2, minLevel: 18, maxLevel: 25 }, // Bouffalant
      { pokemonId: 627, rarity: 3, minLevel: 15, maxLevel: 22 }, // Rufflet
      { pokemonId: 629, rarity: 3, minLevel: 15, maxLevel: 22 }, // Vullaby
      { pokemonId: 676, rarity: 3, minLevel: 12, maxLevel: 18 }, // Furfrou
      { pokemonId: 677, rarity: 4, minLevel: 10, maxLevel: 16 }, // Espurr
      { pokemonId: 682, rarity: 3, minLevel: 12, maxLevel: 18 }, // Spritzee
      { pokemonId: 684, rarity: 3, minLevel: 12, maxLevel: 18 }, // Swirlix
      { pokemonId: 702, rarity: 3, minLevel: 12, maxLevel: 18 }, // Dedenne
      { pokemonId: 749, rarity: 4, minLevel: 10, maxLevel: 16 }, // Mudbray
      { pokemonId: 764, rarity: 2, minLevel: 14, maxLevel: 20 }, // Comfey
      { pokemonId: 775, rarity: 2, minLevel: 15, maxLevel: 22 }, // Komala
      { pokemonId: 870, rarity: 2, minLevel: 18, maxLevel: 25 }, // Falinks
      { pokemonId: 876, rarity: 2, minLevel: 16, maxLevel: 22 }, // Indeedee
      { pokemonId: 877, rarity: 3, minLevel: 14, maxLevel: 20 }, // Morpeko
      { pokemonId: 915, rarity: 5, minLevel: 4, maxLevel: 9 },   // Lechonk
      { pokemonId: 921, rarity: 4, minLevel: 5, maxLevel: 10 },  // Pawmi
      { pokemonId: 924, rarity: 3, minLevel: 8, maxLevel: 14 },  // Tandemaus
      { pokemonId: 926, rarity: 3, minLevel: 8, maxLevel: 14 },  // Fidough
      { pokemonId: 931, rarity: 3, minLevel: 10, maxLevel: 16 }, // Squawkabilly
      { pokemonId: 942, rarity: 3, minLevel: 10, maxLevel: 16 }, // Maschiff
      { pokemonId: 967, rarity: 2, minLevel: 18, maxLevel: 26 }, // Cyclizar
    ],
  },
  {
    id: 'vulcano',
    name: 'Cratere dell\'Hype',
    description: 'Un vulcano attivo alimentato dai commenti dei follower.',
    background: 'bg-orange-100',
    spawnTable: [
      { pokemonId: 58, rarity: 8, minLevel: 12, maxLevel: 18 }, // Growlithe
      { pokemonId: 37, rarity: 8, minLevel: 12, maxLevel: 18 }, // Vulpix
      { pokemonId: 218, rarity: 10, minLevel: 10, maxLevel: 16 }, // Slugma
      { pokemonId: 322, rarity: 8, minLevel: 12, maxLevel: 18 }, // Numel
      { pokemonId: 126, rarity: 4, minLevel: 18, maxLevel: 25 },  // Magmar
      { pokemonId: 633, rarity: 3, minLevel: 20, maxLevel: 25 },  // Deino
      { pokemonId: 4, rarity: 6, minLevel: 15, maxLevel: 20 },  // Charmander
      { pokemonId: 155, rarity: 4, minLevel: 15, maxLevel: 20 }, // Cyndaquil
      { pokemonId: 255, rarity: 4, minLevel: 15, maxLevel: 20 }, // Torchic
      { pokemonId: 390, rarity: 4, minLevel: 15, maxLevel: 20 }, // Chimchar
      { pokemonId: 498, rarity: 4, minLevel: 15, maxLevel: 20 }, // Tepig
      { pokemonId: 653, rarity: 4, minLevel: 15, maxLevel: 20 }, // Fennekin
      { pokemonId: 725, rarity: 4, minLevel: 15, maxLevel: 20 }, // Litten
      { pokemonId: 813, rarity: 4, minLevel: 15, maxLevel: 20 }, // Scorbunny
      { pokemonId: 909, rarity: 4, minLevel: 15, maxLevel: 20 }, // Fuecoco
      { pokemonId: 935, rarity: 3, minLevel: 16, maxLevel: 24 }, // Charcadet
      { pokemonId: 77, rarity: 8, minLevel: 14, maxLevel: 19 },  // Ponyta
      { pokemonId: 228, rarity: 5, minLevel: 18, maxLevel: 24 },  // Houndour
      { pokemonId: 240, rarity: 4, minLevel: 10, maxLevel: 15 },  // Magby
      { pokemonId: 324, rarity: 6, minLevel: 15, maxLevel: 22 },  // Torkoal
      { pokemonId: 513, rarity: 6, minLevel: 14, maxLevel: 20 },  // Pansear
      { pokemonId: 554, rarity: 5, minLevel: 16, maxLevel: 24 },  // Darumaka
      { pokemonId: 607, rarity: 5, minLevel: 18, maxLevel: 26 },  // Litwick
      { pokemonId: 631, rarity: 3, minLevel: 22, maxLevel: 30 },  // Heatmor
      { pokemonId: 636, rarity: 2, minLevel: 25, maxLevel: 35 },  // Larvesta
      { pokemonId: 757, rarity: 4, minLevel: 18, maxLevel: 24 },  // Salandit
      { pokemonId: 776, rarity: 2, minLevel: 24, maxLevel: 32 },  // Turtonator
      { pokemonId: 838, rarity: 5, minLevel: 16, maxLevel: 22 },  // Sizzlipede
      { pokemonId: 837, rarity: 5, minLevel: 14, maxLevel: 20 },  // Rolycoly
      { pokemonId: 146, rarity: 0.5, minLevel: 50, maxLevel: 50 }, // Moltres (Raro!)
      { pokemonId: 244, rarity: 0.5, minLevel: 50, maxLevel: 50 }, // Entei (Raro!)
    ],
  },
  {
    id: 'spiaggia',
    name: 'Spiaggia del Refresh',
    description: 'Dove i Pokémon si ricaricano tra un\'onda e l\'altra.',
    background: 'bg-cyan-100',
    spawnTable: [
      { pokemonId: 7, rarity: 6, minLevel: 10, maxLevel: 15 },  // Squirtle
      { pokemonId: 54, rarity: 8, minLevel: 8, maxLevel: 14 },   // Psyduck
      { pokemonId: 60, rarity: 8, minLevel: 8, maxLevel: 14 },   // Poliwag
      { pokemonId: 72, rarity: 7, minLevel: 10, maxLevel: 16 },  // Tentacool
      { pokemonId: 90, rarity: 6, minLevel: 12, maxLevel: 18 },  // Shellder
      { pokemonId: 98, rarity: 6, minLevel: 10, maxLevel: 15 },  // Krabby
      { pokemonId: 158, rarity: 5, minLevel: 10, maxLevel: 15 }, // Totodile
      { pokemonId: 129, rarity: 15, minLevel: 5, maxLevel: 20 }, // Magikarp
      { pokemonId: 258, rarity: 5, minLevel: 10, maxLevel: 15 }, // Mudkip
      { pokemonId: 393, rarity: 5, minLevel: 10, maxLevel: 15 }, // Piplup
      { pokemonId: 116, rarity: 6, minLevel: 12, maxLevel: 18 }, // Horsea
      { pokemonId: 118, rarity: 7, minLevel: 10, maxLevel: 16 }, // Goldeen
      { pokemonId: 120, rarity: 6, minLevel: 15, maxLevel: 22 }, // Staryu
      { pokemonId: 131, rarity: 2, minLevel: 25, maxLevel: 35 }, // Lapras
      { pokemonId: 170, rarity: 5, minLevel: 14, maxLevel: 20 }, // Chinchou
      { pokemonId: 183, rarity: 6, minLevel: 8, maxLevel: 14 },  // Marill
      { pokemonId: 194, rarity: 6, minLevel: 10, maxLevel: 16 }, // Wooper
      { pokemonId: 211, rarity: 4, minLevel: 15, maxLevel: 22 }, // Qwilfish
      { pokemonId: 222, rarity: 4, minLevel: 15, maxLevel: 20 }, // Corsola
      { pokemonId: 223, rarity: 5, minLevel: 18, maxLevel: 24 }, // Remoraid
      { pokemonId: 226, rarity: 3, minLevel: 20, maxLevel: 30 }, // Mantine
      { pokemonId: 270, rarity: 6, minLevel: 8, maxLevel: 14 },  // Lotad
      { pokemonId: 318, rarity: 5, minLevel: 15, maxLevel: 22 }, // Carvanha
      { pokemonId: 320, rarity: 4, minLevel: 20, maxLevel: 35 }, // Wailmer
      { pokemonId: 339, rarity: 5, minLevel: 14, maxLevel: 20 }, // Barboach
      { pokemonId: 341, rarity: 5, minLevel: 16, maxLevel: 22 }, // Corphish
      { pokemonId: 349, rarity: 1, minLevel: 10, maxLevel: 15 }, // Feebas
      { pokemonId: 366, rarity: 4, minLevel: 18, maxLevel: 24 }, // Clamperl
      { pokemonId: 370, rarity: 4, minLevel: 15, maxLevel: 20 }, // Luvdisc
      { pokemonId: 422, rarity: 5, minLevel: 12, maxLevel: 18 }, // Shellos
      { pokemonId: 456, rarity: 4, minLevel: 15, maxLevel: 22 }, // Finneon
      { pokemonId: 501, rarity: 5, minLevel: 10, maxLevel: 15 }, // Oshawott
      { pokemonId: 535, rarity: 5, minLevel: 12, maxLevel: 18 }, // Tympole
      { pokemonId: 550, rarity: 5, minLevel: 15, maxLevel: 25 }, // Basculin
      { pokemonId: 564, rarity: 3, minLevel: 20, maxLevel: 28 }, // Tirtouga
      { pokemonId: 580, rarity: 5, minLevel: 14, maxLevel: 20 }, // Ducklett
      { pokemonId: 594, rarity: 3, minLevel: 25, maxLevel: 35 }, // Alomomola
      { pokemonId: 656, rarity: 5, minLevel: 10, maxLevel: 15 }, // Froakie
      { pokemonId: 692, rarity: 4, minLevel: 18, maxLevel: 26 }, // Clauncher
      { pokemonId: 690, rarity: 4, minLevel: 18, maxLevel: 26 }, // Skrelp
      { pokemonId: 728, rarity: 5, minLevel: 10, maxLevel: 15 }, // Popplio
      { pokemonId: 746, rarity: 4, minLevel: 15, maxLevel: 22 }, // Wishiwashi
      { pokemonId: 747, rarity: 4, minLevel: 16, maxLevel: 24 }, // Mareanie
      { pokemonId: 771, rarity: 4, minLevel: 12, maxLevel: 18 }, // Pyukumuku
      { pokemonId: 816, rarity: 5, minLevel: 10, maxLevel: 15 }, // Sobble
      { pokemonId: 846, rarity: 4, minLevel: 15, maxLevel: 22 }, // Arrokuda
      { pokemonId: 138, rarity: 3, minLevel: 18, maxLevel: 25 }, // Omanyte
      { pokemonId: 140, rarity: 3, minLevel: 18, maxLevel: 25 }, // Kabuto
      { pokemonId: 147, rarity: 2, minLevel: 15, maxLevel: 24 }, // Dratini
      { pokemonId: 278, rarity: 5, minLevel: 8, maxLevel: 14 },  // Wingull
      { pokemonId: 458, rarity: 3, minLevel: 14, maxLevel: 20 }, // Mantyke
      { pokemonId: 767, rarity: 4, minLevel: 12, maxLevel: 18 }, // Wimpod
      { pokemonId: 769, rarity: 4, minLevel: 14, maxLevel: 20 }, // Sandygast
      { pokemonId: 833, rarity: 4, minLevel: 10, maxLevel: 16 }, // Chewtle
      { pokemonId: 852, rarity: 3, minLevel: 16, maxLevel: 24 }, // Clobbopus
      { pokemonId: 912, rarity: 4, minLevel: 10, maxLevel: 15 }, // Quaxly
      { pokemonId: 960, rarity: 4, minLevel: 10, maxLevel: 16 }, // Wiglett
      { pokemonId: 963, rarity: 3, minLevel: 14, maxLevel: 20 }, // Finizen
      { pokemonId: 976, rarity: 3, minLevel: 18, maxLevel: 26 }, // Veluza
      { pokemonId: 977, rarity: 2, minLevel: 22, maxLevel: 30 }, // Dondozo
      { pokemonId: 978, rarity: 3, minLevel: 18, maxLevel: 26 }, // Tatsugiri
      { pokemonId: 144, rarity: 0.5, minLevel: 50, maxLevel: 50 }, // Articuno (Raro!)
      { pokemonId: 245, rarity: 0.5, minLevel: 50, maxLevel: 50 }, // Suicune (Raro!)
      { pokemonId: 249, rarity: 0.2, minLevel: 60, maxLevel: 60 }, // Lugia (Legendario!)
    ],
  },
  {
    id: 'grotta',
    name: 'Grotta del Debug',
    description: 'Un labirinto di errori e Pokémon di roccia.',
    background: 'bg-stone-300',
    spawnTable: [
      { pokemonId: 74, rarity: 10, minLevel: 12, maxLevel: 18 }, // Geodude
      { pokemonId: 41, rarity: 12, minLevel: 10, maxLevel: 16 }, // Zubat
      { pokemonId: 27, rarity: 8, minLevel: 12, maxLevel: 18 },  // Sandshrew
      { pokemonId: 66, rarity: 8, minLevel: 12, maxLevel: 18 },  // Machop
      { pokemonId: 95, rarity: 5, minLevel: 15, maxLevel: 22 },  // Onix
      { pokemonId: 111, rarity: 4, minLevel: 18, maxLevel: 25 },  // Rhyhorn
      { pokemonId: 304, rarity: 6, minLevel: 14, maxLevel: 20 }, // Aron
      { pokemonId: 524, rarity: 4, minLevel: 15, maxLevel: 20 },  // Roggenrola
      { pokemonId: 50, rarity: 8, minLevel: 10, maxLevel: 16 },  // Diglett
      { pokemonId: 104, rarity: 6, minLevel: 12, maxLevel: 18 }, // Cubone
      { pokemonId: 142, rarity: 2, minLevel: 30, maxLevel: 40 }, // Aerodactyl
      { pokemonId: 206, rarity: 5, minLevel: 15, maxLevel: 22 }, // Dunsparce
      { pokemonId: 207, rarity: 4, minLevel: 18, maxLevel: 25 }, // Gligar
      { pokemonId: 213, rarity: 3, minLevel: 14, maxLevel: 20 }, // Shuckle
      { pokemonId: 216, rarity: 5, minLevel: 15, maxLevel: 22 }, // Teddiursa
      { pokemonId: 231, rarity: 4, minLevel: 12, maxLevel: 18 }, // Phanpy
      { pokemonId: 246, rarity: 2, minLevel: 20, maxLevel: 30 }, // Larvitar
      { pokemonId: 293, rarity: 7, minLevel: 10, maxLevel: 16 }, // Whismur
      { pokemonId: 296, rarity: 6, minLevel: 14, maxLevel: 20 }, // Makuhita
      { pokemonId: 302, rarity: 4, minLevel: 15, maxLevel: 22 }, // Sableye
      { pokemonId: 303, rarity: 4, minLevel: 15, maxLevel: 22 }, // Mawile
      { pokemonId: 307, rarity: 5, minLevel: 14, maxLevel: 20 }, // Meditite
      { pokemonId: 299, rarity: 5, minLevel: 12, maxLevel: 18 }, // Nosepass
      { pokemonId: 328, rarity: 4, minLevel: 15, maxLevel: 22 }, // Trapinch
      { pokemonId: 331, rarity: 4, minLevel: 14, maxLevel: 20 }, // Cacnea
      { pokemonId: 337, rarity: 4, minLevel: 18, maxLevel: 25 }, // Lunatone
      { pokemonId: 338, rarity: 4, minLevel: 18, maxLevel: 25 }, // Solrock
      { pokemonId: 343, rarity: 4, minLevel: 15, maxLevel: 22 }, // Baltoy
      { pokemonId: 345, rarity: 3, minLevel: 20, maxLevel: 30 }, // Lileep
      { pokemonId: 347, rarity: 3, minLevel: 20, maxLevel: 30 }, // Anorith
      { pokemonId: 371, rarity: 2, minLevel: 20, maxLevel: 30 }, // Bagon
      { pokemonId: 408, rarity: 3, minLevel: 20, maxLevel: 30 }, // Cranidos
      { pokemonId: 410, rarity: 3, minLevel: 20, maxLevel: 30 }, // Shieldon
      { pokemonId: 443, rarity: 2, minLevel: 22, maxLevel: 32 }, // Gible
      { pokemonId: 449, rarity: 4, minLevel: 18, maxLevel: 26 }, // Hippopotas
      { pokemonId: 447, rarity: 3, minLevel: 15, maxLevel: 25 }, // Riolu
      { pokemonId: 529, rarity: 5, minLevel: 15, maxLevel: 22 }, // Drilbur
      { pokemonId: 532, rarity: 5, minLevel: 16, maxLevel: 24 }, // Timburr
      { pokemonId: 527, rarity: 6, minLevel: 12, maxLevel: 18 }, // Woobat
      { pokemonId: 551, rarity: 4, minLevel: 14, maxLevel: 20 }, // Sandile
      { pokemonId: 557, rarity: 5, minLevel: 15, maxLevel: 22 }, // Dwebble
      { pokemonId: 559, rarity: 4, minLevel: 16, maxLevel: 22 }, // Scraggy
      { pokemonId: 562, rarity: 4, minLevel: 18, maxLevel: 26 }, // Yamask
      { pokemonId: 566, rarity: 3, minLevel: 20, maxLevel: 30 }, // Archen
      { pokemonId: 610, rarity: 3, minLevel: 25, maxLevel: 35 }, // Axew
      { pokemonId: 621, rarity: 3, minLevel: 28, maxLevel: 38 }, // Druddigon
      { pokemonId: 686, rarity: 4, minLevel: 15, maxLevel: 22 }, // Inkay
      { pokemonId: 696, rarity: 3, minLevel: 20, maxLevel: 30 }, // Tyrunt
      { pokemonId: 698, rarity: 3, minLevel: 20, maxLevel: 30 }, // Amaura
      { pokemonId: 703, rarity: 4, minLevel: 15, maxLevel: 25 }, // Carbink
      { pokemonId: 704, rarity: 3, minLevel: 18, maxLevel: 26 }, // Goomy
      { pokemonId: 714, rarity: 4, minLevel: 20, maxLevel: 30 }, // Noibat
      { pokemonId: 774, rarity: 3, minLevel: 18, maxLevel: 25 }, // Minior
      { pokemonId: 782, rarity: 2, minLevel: 30, maxLevel: 40 }, // Jangmo-o
      { pokemonId: 843, rarity: 4, minLevel: 14, maxLevel: 20 }, // Silicobra
      { pokemonId: 874, rarity: 3, minLevel: 20, maxLevel: 28 }, // Stonjourner
      { pokemonId: 878, rarity: 3, minLevel: 18, maxLevel: 25 }, // Cufant
      { pokemonId: 932, rarity: 4, minLevel: 12, maxLevel: 18 }, // Nacli
      { pokemonId: 950, rarity: 3, minLevel: 16, maxLevel: 22 }, // Klawf
      { pokemonId: 968, rarity: 3, minLevel: 18, maxLevel: 25 }, // Orthworm
      { pokemonId: 969, rarity: 3, minLevel: 20, maxLevel: 28 }, // Glimmet
      { pokemonId: 996, rarity: 2, minLevel: 25, maxLevel: 35 }, // Frigibax
      { pokemonId: 377, rarity: 0.1, minLevel: 50, maxLevel: 50 }, // Regirock (Legendario!)
    ],
  },
  {
    id: 'cimitero',
    name: 'Cimitero dei Pixel',
    description: 'Luogo spettrale dove vagano le memorie cancellate.',
    background: 'bg-violet-200',
    spawnTable: [
      { pokemonId: 92, rarity: 15, minLevel: 15, maxLevel: 22 }, // Gastly
      { pokemonId: 200, rarity: 10, minLevel: 18, maxLevel: 25 }, // Misdreavus
      { pokemonId: 353, rarity: 10, minLevel: 15, maxLevel: 22 }, // Shuppet
      { pokemonId: 355, rarity: 12, minLevel: 15, maxLevel: 22 }, // Duskull
      { pokemonId: 442, rarity: 4, minLevel: 25, maxLevel: 30 },  // Spiritomb
      { pokemonId: 590, rarity: 8, minLevel: 18, maxLevel: 25 },  // Foongus
      { pokemonId: 607, rarity: 6, minLevel: 20, maxLevel: 28 },  // Litwick
      { pokemonId: 93, rarity: 5, minLevel: 25, maxLevel: 35 },   // Haunter
      { pokemonId: 198, rarity: 8, minLevel: 15, maxLevel: 22 },  // Murkrow
      { pokemonId: 228, rarity: 6, minLevel: 16, maxLevel: 22 },  // Houndour
      { pokemonId: 261, rarity: 6, minLevel: 14, maxLevel: 20 },  // Poochyena
      { pokemonId: 302, rarity: 6, minLevel: 18, maxLevel: 25 },  // Sableye
      { pokemonId: 354, rarity: 4, minLevel: 30, maxLevel: 40 },  // Banette
      { pokemonId: 359, rarity: 3, minLevel: 22, maxLevel: 30 },  // Absol
      { pokemonId: 425, rarity: 8, minLevel: 15, maxLevel: 22 },  // Drifloon
      { pokemonId: 429, rarity: 2, minLevel: 35, maxLevel: 45 },  // Mismagius
      { pokemonId: 434, rarity: 6, minLevel: 16, maxLevel: 22 },  // Stunky
      { pokemonId: 451, rarity: 5, minLevel: 18, maxLevel: 25 },  // Skorupi
      { pokemonId: 562, rarity: 6, minLevel: 20, maxLevel: 28 },  // Yamask
      { pokemonId: 570, rarity: 4, minLevel: 18, maxLevel: 26 },  // Zorua
      { pokemonId: 577, rarity: 5, minLevel: 16, maxLevel: 22 },  // Gothita
      { pokemonId: 579, rarity: 5, minLevel: 16, maxLevel: 22 },  // Solosis
      { pokemonId: 592, rarity: 6, minLevel: 20, maxLevel: 28 },  // Frillish
      { pokemonId: 605, rarity: 4, minLevel: 18, maxLevel: 25 },  // Elgyem
      { pokemonId: 622, rarity: 5, minLevel: 25, maxLevel: 35 },  // Golett
      { pokemonId: 624, rarity: 4, minLevel: 22, maxLevel: 30 },  // Pawniard
      { pokemonId: 679, rarity: 4, minLevel: 20, maxLevel: 28 },  // Honedge
      { pokemonId: 708, rarity: 5, minLevel: 20, maxLevel: 30 },  // Phantump
      { pokemonId: 710, rarity: 5, minLevel: 20, maxLevel: 30 },  // Pumpkaboo
      { pokemonId: 778, rarity: 3, minLevel: 25, maxLevel: 35 },  // Mimikyu
      { pokemonId: 781, rarity: 2, minLevel: 30, maxLevel: 45 },  // Dhelmise
      { pokemonId: 854, rarity: 4, minLevel: 20, maxLevel: 30 },  // Sinistea
      { pokemonId: 856, rarity: 4, minLevel: 18, maxLevel: 26 },  // Hatenna
      { pokemonId: 859, rarity: 4, minLevel: 18, maxLevel: 26 },  // Impidimp
      { pokemonId: 885, rarity: 2, minLevel: 35, maxLevel: 45 },  // Dreepy
      { pokemonId: 948, rarity: 4, minLevel: 16, maxLevel: 22 },  // Rellor
      { pokemonId: 955, rarity: 4, minLevel: 18, maxLevel: 25 },  // Flittle
      { pokemonId: 971, rarity: 4, minLevel: 18, maxLevel: 26 },  // Greavard
      { pokemonId: 487, rarity: 0.1, minLevel: 60, maxLevel: 60 }, // Giratina (Legendario!)
    ],
  },
  {
    id: 'laboratorio',
    name: 'Lab della Scienza Inutile',
    description: 'Esperimenti falliti e Pokémon artificiali.',
    background: 'bg-blue-50',
    spawnTable: [
      { pokemonId: 81, rarity: 15, minLevel: 20, maxLevel: 28 }, // Magnemite
      { pokemonId: 100, rarity: 15, minLevel: 20, maxLevel: 28 }, // Voltorb
      { pokemonId: 88, rarity: 8, minLevel: 18, maxLevel: 25 },   // Grimer
      { pokemonId: 109, rarity: 8, minLevel: 18, maxLevel: 25 },  // Koffing
      { pokemonId: 137, rarity: 8, minLevel: 25, maxLevel: 32 },  // Porygon
      { pokemonId: 479, rarity: 8, minLevel: 25, maxLevel: 35 },  // Rotom
      { pokemonId: 568, rarity: 8, minLevel: 18, maxLevel: 25 },  // Trubbish
      { pokemonId: 632, rarity: 10, minLevel: 22, maxLevel: 30 }, // Durant
      { pokemonId: 599, rarity: 10, minLevel: 20, maxLevel: 28 }, // Klink
      { pokemonId: 82, rarity: 5, minLevel: 30, maxLevel: 40 },   // Magneton
      { pokemonId: 101, rarity: 5, minLevel: 30, maxLevel: 40 },  // Electrode
      { pokemonId: 239, rarity: 6, minLevel: 15, maxLevel: 25 },  // Elekid
      { pokemonId: 227, rarity: 4, minLevel: 25, maxLevel: 35 },  // Skarmory
      { pokemonId: 233, rarity: 3, minLevel: 35, maxLevel: 45 },  // Porygon2
      { pokemonId: 374, rarity: 3, minLevel: 20, maxLevel: 30 },  // Beldum
      { pokemonId: 436, rarity: 6, minLevel: 18, maxLevel: 26 },  // Bronzor
      { pokemonId: 679, rarity: 4, minLevel: 25, maxLevel: 35 },  // Honedge
      { pokemonId: 707, rarity: 4, minLevel: 20, maxLevel: 30 },  // Klefki
      { pokemonId: 772, rarity: 2, minLevel: 30, maxLevel: 40 },  // Type: Null
      { pokemonId: 777, rarity: 4, minLevel: 20, maxLevel: 30 },  // Togedemaru
      { pokemonId: 808, rarity: 1, minLevel: 15, maxLevel: 25 },  // Meltan
      { pokemonId: 871, rarity: 4, minLevel: 20, maxLevel: 28 },  // Pincurchin
      { pokemonId: 878, rarity: 4, minLevel: 25, maxLevel: 35 },  // Cufant
      { pokemonId: 884, rarity: 2, minLevel: 28, maxLevel: 38 },  // Duraludon
      { pokemonId: 938, rarity: 5, minLevel: 16, maxLevel: 24 },  // Tadbulb
      { pokemonId: 940, rarity: 5, minLevel: 16, maxLevel: 24 },  // Wattrel
      { pokemonId: 965, rarity: 4, minLevel: 20, maxLevel: 28 },  // Varoom
      { pokemonId: 649, rarity: 0.1, minLevel: 50, maxLevel: 50 }, // Genesect (Legendario!)
    ],
  },
  {
    id: 'montagna',
    name: 'Picco del Buffering',
    description: 'L\'aria è così rarefatta che i frame calano drasticamente.',
    background: 'bg-slate-200',
    spawnTable: [
      { pokemonId: 215, rarity: 10, minLevel: 25, maxLevel: 35 }, // Sneasel
      { pokemonId: 220, rarity: 12, minLevel: 25, maxLevel: 35 }, // Swinub
      { pokemonId: 361, rarity: 10, minLevel: 25, maxLevel: 35 }, // Snorunt
      { pokemonId: 459, rarity: 10, minLevel: 25, maxLevel: 35 }, // Snover
      { pokemonId: 613, rarity: 8, minLevel: 30, maxLevel: 40 },  // Cubchoo
      { pokemonId: 86, rarity: 8, minLevel: 20, maxLevel: 28 },   // Seel
      { pokemonId: 124, rarity: 5, minLevel: 30, maxLevel: 40 },  // Jynx
      { pokemonId: 225, rarity: 7, minLevel: 25, maxLevel: 35 },  // Delibird
      { pokemonId: 238, rarity: 6, minLevel: 15, maxLevel: 25 },  // Smoochum
      { pokemonId: 363, rarity: 8, minLevel: 20, maxLevel: 30 },  // Spheal
      { pokemonId: 582, rarity: 8, minLevel: 22, maxLevel: 30 },  // Vanillite
      { pokemonId: 615, rarity: 4, minLevel: 35, maxLevel: 45 },  // Cryogonal
      { pokemonId: 712, rarity: 6, minLevel: 28, maxLevel: 38 },  // Bergmite
      { pokemonId: 875, rarity: 3, minLevel: 35, maxLevel: 45 },  // Eiscue
      { pokemonId: 872, rarity: 5, minLevel: 20, maxLevel: 30 },  // Snom
      { pokemonId: 974, rarity: 4, minLevel: 25, maxLevel: 35 },  // Cetoddle
      { pokemonId: 145, rarity: 0.5, minLevel: 50, maxLevel: 50 }, // Zapdos (Raro!)
      { pokemonId: 243, rarity: 0.5, minLevel: 50, maxLevel: 50 }, // Raikou (Raro!)
      { pokemonId: 250, rarity: 0.2, minLevel: 60, maxLevel: 60 }, // Ho-Oh (Legendario!)
    ],
  },
  {
    id: 'rovina',
    name: 'Rovina dei Frame',
    description: 'Un luogo dove il tempo si ferma e i Pokémon sono fatti di glitch.',
    background: 'bg-indigo-900',
    spawnTable: [
      { pokemonId: 94, rarity: 10, minLevel: 35, maxLevel: 45 },  // Gengar
      { pokemonId: 197, rarity: 8, minLevel: 35, maxLevel: 45 },  // Umbreon
      { pokemonId: 282, rarity: 6, minLevel: 40, maxLevel: 50 },  // Gardevoir
      { pokemonId: 475, rarity: 6, minLevel: 40, maxLevel: 50 },  // Gallade
      { pokemonId: 609, rarity: 8, minLevel: 40, maxLevel: 50 },  // Chandelure
      { pokemonId: 150, rarity: 1, minLevel: 70, maxLevel: 70 },  // Mewtwo
      { pokemonId: 132, rarity: 10, minLevel: 30, maxLevel: 40 }, // Ditto
      { pokemonId: 149, rarity: 4, minLevel: 55, maxLevel: 65 },  // Dragonite
      { pokemonId: 248, rarity: 4, minLevel: 55, maxLevel: 65 },  // Tyranitar
      { pokemonId: 376, rarity: 4, minLevel: 55, maxLevel: 65 },  // Metagross
      { pokemonId: 373, rarity: 4, minLevel: 55, maxLevel: 65 },  // Salamence
      { pokemonId: 445, rarity: 4, minLevel: 55, maxLevel: 65 },  // Garchomp
      { pokemonId: 635, rarity: 4, minLevel: 60, maxLevel: 70 },  // Hydreigon
      { pokemonId: 706, rarity: 4, minLevel: 50, maxLevel: 60 },  // Goodra
      { pokemonId: 784, rarity: 4, minLevel: 55, maxLevel: 65 },  // Kommo-o
      { pokemonId: 887, rarity: 4, minLevel: 60, maxLevel: 70 },  // Dragapult
      { pokemonId: 382, rarity: 0.1, minLevel: 70, maxLevel: 70 }, // Kyogre (Legendario!)
      { pokemonId: 383, rarity: 0.1, minLevel: 70, maxLevel: 70 }, // Groudon (Legendario!)
      { pokemonId: 384, rarity: 0.1, minLevel: 80, maxLevel: 80 }, // Rayquaza (Legendario!)
      { pokemonId: 483, rarity: 0.1, minLevel: 70, maxLevel: 70 }, // Dialga (Legendario!)
      { pokemonId: 484, rarity: 0.1, minLevel: 70, maxLevel: 70 }, // Palkia (Legendario!)
    ],
  },
  {
    id: 'palude',
    name: 'Palude del Bug',
    description: 'Un acquitrino pieno di Pokémon Coleottero e Veleno.',
    background: 'bg-green-900',
    spawnTable: [
      { pokemonId: 10, rarity: 15, minLevel: 25, maxLevel: 30 }, // Caterpie
      { pokemonId: 13, rarity: 15, minLevel: 25, maxLevel: 30 }, // Weedle
      { pokemonId: 23, rarity: 8, minLevel: 25, maxLevel: 32 },  // Ekans
      { pokemonId: 46, rarity: 10, minLevel: 28, maxLevel: 35 }, // Paras
      { pokemonId: 48, rarity: 10, minLevel: 30, maxLevel: 38 }, // Venonat
      { pokemonId: 123, rarity: 5, minLevel: 35, maxLevel: 45 },  // Scyther
      { pokemonId: 214, rarity: 5, minLevel: 35, maxLevel: 45 },  // Heracross
      { pokemonId: 453, rarity: 6, minLevel: 28, maxLevel: 36 },  // Croagunk
      { pokemonId: 543, rarity: 8, minLevel: 25, maxLevel: 32 },  // Venipede
      { pokemonId: 540, rarity: 8, minLevel: 25, maxLevel: 32 },  // Sewaddle
      { pokemonId: 595, rarity: 5, minLevel: 30, maxLevel: 38 },  // Joltik
      { pokemonId: 618, rarity: 4, minLevel: 30, maxLevel: 38 },  // Stunfisk
      { pokemonId: 632, rarity: 5, minLevel: 35, maxLevel: 42 },  // Durant
      { pokemonId: 751, rarity: 4, minLevel: 28, maxLevel: 36 },  // Dewpider
      { pokemonId: 848, rarity: 4, minLevel: 26, maxLevel: 35 },  // Toxel
      { pokemonId: 637, rarity: 2, minLevel: 45, maxLevel: 55 },  // Volcarona
      { pokemonId: 344, rarity: 0.1, minLevel: 60, maxLevel: 60 }, // Claydol
    ],
  },
  {
    id: 'isola-server',
    name: 'Isola del Server',
    description: 'Il cuore pulsante del mondo digitale. Alta tensione!',
    background: 'bg-zinc-800',
    spawnTable: [
      { pokemonId: 25, rarity: 10, minLevel: 35, maxLevel: 45 },  // Pikachu
      { pokemonId: 81, rarity: 15, minLevel: 40, maxLevel: 50 },  // Magnemite
      { pokemonId: 100, rarity: 15, minLevel: 40, maxLevel: 50 }, // Voltorb
      { pokemonId: 125, rarity: 8, minLevel: 45, maxLevel: 55 },  // Electabuzz
      { pokemonId: 135, rarity: 5, minLevel: 45, maxLevel: 55 },  // Jolteon
      { pokemonId: 137, rarity: 10, minLevel: 40, maxLevel: 50 }, // Porygon
      { pokemonId: 179, rarity: 6, minLevel: 35, maxLevel: 45 },  // Mareep
      { pokemonId: 309, rarity: 6, minLevel: 35, maxLevel: 45 },  // Electrike
      { pokemonId: 522, rarity: 6, minLevel: 38, maxLevel: 48 },  // Blitzle
      { pokemonId: 587, rarity: 5, minLevel: 38, maxLevel: 48 },  // Emolga
      { pokemonId: 694, rarity: 5, minLevel: 38, maxLevel: 48 },  // Helioptile
      { pokemonId: 736, rarity: 5, minLevel: 35, maxLevel: 45 },  // Grubbin
      { pokemonId: 835, rarity: 5, minLevel: 35, maxLevel: 45 },  // Yamper
      { pokemonId: 921, rarity: 5, minLevel: 35, maxLevel: 45 },  // Pawmi
      { pokemonId: 940, rarity: 5, minLevel: 38, maxLevel: 48 },  // Wattrel
      { pokemonId: 145, rarity: 2, minLevel: 60, maxLevel: 60 },  // Zapdos
      { pokemonId: 466, rarity: 3, minLevel: 50, maxLevel: 60 },  // Electivire
      { pokemonId: 479, rarity: 5, minLevel: 45, maxLevel: 55 },  // Rotom
      { pokemonId: 602, rarity: 8, minLevel: 35, maxLevel: 45 },  // Tynamo
      { pokemonId: 642, rarity: 0.1, minLevel: 70, maxLevel: 70 }, // Thundurus
      { pokemonId: 785, rarity: 0.1, minLevel: 70, maxLevel: 70 }, // Tapu Koko
    ],
  },
  {
    id: 'datacenter-lega',
    name: 'Datacenter della Lega',
    description: 'La roccaforte dei Superquattro dei Crash di Sistema e del Campione. (Richiede 10 Medaglie)',
    background: 'bg-slate-900',
    spawnTable: [],
  },
];

export const CHARACTERS = {
  PROFESSOR: {
    name: 'Prof. Scordarello',
    description: 'Dimentica tutto, tranne quanto sei scarso.',
    sprite: SPRITES.PROFESSOR,
  },
  RIVAL: {
    name: 'Gino il Bullo',
    description: 'Ha il set di Pokémon più forte, ma usa solo "Colpo Coda".',
    sprite: SPRITES.RIVAL,
  },
};
