import { PokemonTypeName } from '../models/pokemon.model';

/**
 * Canonical gym-leader, Elite Four and Champion rosters for all nine regions.
 * Sourced from each region's flagship mainline game (see `version`).
 * Used by the Team Builder's Region Readiness analysis.
 */

export type BattleRole = 'gym' | 'elite-four' | 'champion';

export interface LeaderPokemon {
  name: string;
  /** National Dex id, for sprite lookup. */
  dexId: number;
  types: PokemonTypeName[];
}

export interface LeaderBattle {
  leader: string;
  role: BattleRole;
  /** Badge name for gyms, or title for league members. */
  label: string;
  /** The leader's type specialty (absent for some champions). */
  specialtyType?: PokemonTypeName;
  team: LeaderPokemon[];
}

export interface RegionRoster {
  gen: number;
  region: string;
  /** Game version the roster is sourced from. */
  version: string;
  notes?: string;
  battles: LeaderBattle[];
}

/** Small pixel sprite for a leader's Pokemon by National Dex id. */
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export function leaderSprite(dexId: number): string {
  return `${SPRITE_BASE}/${dexId}.png`;
}

export const REGION_ROSTERS: RegionRoster[] = [
  {
    gen: 1,
    region: 'Kanto',
    version: 'FireRed/LeafGreen',
    notes:
      "Teams reflect the main-story (first) battles. Blaine's Vulpix/Growlithe and Blue's starter/Eeveelutions depend on version and player starter choice; the Charizard-line variant of Blue's team is shown. Elite Four and Champion teams are the pre-National-Dex (first challenge) rosters. Mr. Mime is listed as pure Psychic: FR/LG is Gen 3, where the Fairy type did not yet exist.",
    battles: [
      {
        leader: 'Brock',
        role: 'gym',
        label: 'Boulder Badge',
        specialtyType: 'rock',
        team: [
          { name: 'Geodude', dexId: 74, types: ['rock', 'ground'] },
          { name: 'Onix', dexId: 95, types: ['rock', 'ground'] },
        ],
      },
      {
        leader: 'Misty',
        role: 'gym',
        label: 'Cascade Badge',
        specialtyType: 'water',
        team: [
          { name: 'Staryu', dexId: 120, types: ['water'] },
          { name: 'Starmie', dexId: 121, types: ['water', 'psychic'] },
        ],
      },
      {
        leader: 'Lt. Surge',
        role: 'gym',
        label: 'Thunder Badge',
        specialtyType: 'electric',
        team: [
          { name: 'Voltorb', dexId: 100, types: ['electric'] },
          { name: 'Pikachu', dexId: 25, types: ['electric'] },
          { name: 'Raichu', dexId: 26, types: ['electric'] },
        ],
      },
      {
        leader: 'Erika',
        role: 'gym',
        label: 'Rainbow Badge',
        specialtyType: 'grass',
        team: [
          { name: 'Victreebel', dexId: 71, types: ['grass', 'poison'] },
          { name: 'Tangela', dexId: 114, types: ['grass'] },
          { name: 'Vileplume', dexId: 45, types: ['grass', 'poison'] },
        ],
      },
      {
        leader: 'Koga',
        role: 'gym',
        label: 'Soul Badge',
        specialtyType: 'poison',
        team: [
          { name: 'Koffing', dexId: 109, types: ['poison'] },
          { name: 'Muk', dexId: 89, types: ['poison'] },
          { name: 'Koffing', dexId: 109, types: ['poison'] },
          { name: 'Weezing', dexId: 110, types: ['poison'] },
        ],
      },
      {
        leader: 'Sabrina',
        role: 'gym',
        label: 'Marsh Badge',
        specialtyType: 'psychic',
        team: [
          { name: 'Kadabra', dexId: 64, types: ['psychic'] },
          { name: 'Mr. Mime', dexId: 122, types: ['psychic'] },
          { name: 'Venomoth', dexId: 49, types: ['bug', 'poison'] },
          { name: 'Alakazam', dexId: 65, types: ['psychic'] },
        ],
      },
      {
        leader: 'Blaine',
        role: 'gym',
        label: 'Volcano Badge',
        specialtyType: 'fire',
        team: [
          { name: 'Growlithe', dexId: 58, types: ['fire'] },
          { name: 'Ponyta', dexId: 77, types: ['fire'] },
          { name: 'Rapidash', dexId: 78, types: ['fire'] },
          { name: 'Arcanine', dexId: 59, types: ['fire'] },
        ],
      },
      {
        leader: 'Giovanni',
        role: 'gym',
        label: 'Earth Badge',
        specialtyType: 'ground',
        team: [
          { name: 'Rhyhorn', dexId: 111, types: ['ground', 'rock'] },
          { name: 'Dugtrio', dexId: 51, types: ['ground'] },
          { name: 'Nidoqueen', dexId: 31, types: ['poison', 'ground'] },
          { name: 'Nidoking', dexId: 34, types: ['poison', 'ground'] },
          { name: 'Rhyhorn', dexId: 111, types: ['ground', 'rock'] },
        ],
      },
      {
        leader: 'Lorelei',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'ice',
        team: [
          { name: 'Dewgong', dexId: 87, types: ['water', 'ice'] },
          { name: 'Cloyster', dexId: 91, types: ['water', 'ice'] },
          { name: 'Slowbro', dexId: 80, types: ['water', 'psychic'] },
          { name: 'Jynx', dexId: 124, types: ['ice', 'psychic'] },
          { name: 'Lapras', dexId: 131, types: ['water', 'ice'] },
        ],
      },
      {
        leader: 'Bruno',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'fighting',
        team: [
          { name: 'Onix', dexId: 95, types: ['rock', 'ground'] },
          { name: 'Hitmonchan', dexId: 107, types: ['fighting'] },
          { name: 'Hitmonlee', dexId: 106, types: ['fighting'] },
          { name: 'Onix', dexId: 95, types: ['rock', 'ground'] },
          { name: 'Machamp', dexId: 68, types: ['fighting'] },
        ],
      },
      {
        leader: 'Agatha',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'ghost',
        team: [
          { name: 'Gengar', dexId: 94, types: ['ghost', 'poison'] },
          { name: 'Golbat', dexId: 42, types: ['poison', 'flying'] },
          { name: 'Haunter', dexId: 93, types: ['ghost', 'poison'] },
          { name: 'Arbok', dexId: 24, types: ['poison'] },
          { name: 'Gengar', dexId: 94, types: ['ghost', 'poison'] },
        ],
      },
      {
        leader: 'Lance',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'dragon',
        team: [
          { name: 'Gyarados', dexId: 130, types: ['water', 'flying'] },
          { name: 'Dragonair', dexId: 148, types: ['dragon'] },
          { name: 'Dragonair', dexId: 148, types: ['dragon'] },
          { name: 'Aerodactyl', dexId: 142, types: ['rock', 'flying'] },
          { name: 'Dragonite', dexId: 149, types: ['dragon', 'flying'] },
        ],
      },
      {
        leader: 'Blue',
        role: 'champion',
        label: 'Champion',
        team: [
          { name: 'Pidgeot', dexId: 18, types: ['normal', 'flying'] },
          { name: 'Alakazam', dexId: 65, types: ['psychic'] },
          { name: 'Rhydon', dexId: 112, types: ['ground', 'rock'] },
          { name: 'Arcanine', dexId: 59, types: ['fire'] },
          { name: 'Exeggutor', dexId: 103, types: ['grass', 'psychic'] },
          { name: 'Charizard', dexId: 6, types: ['fire', 'flying'] },
        ],
      },
    ],
  },
  {
    gen: 2,
    region: 'Johto',
    version: 'HeartGold/SoulSilver',
    notes:
      'Teams reflect HGSS first-encounter (story mode) rosters. Lance is fought as Champion at Indigo Plateau. In HGSS the Elite Four rooms use the Johto Elite Four (Will, Koga, Bruno, Karen) followed by Lance. Clefairy is listed with its modern canonical Fairy typing (it was Normal-type in Gen 4).',
    battles: [
      {
        leader: 'Falkner',
        role: 'gym',
        label: 'Zephyr Badge',
        specialtyType: 'flying',
        team: [
          { name: 'Pidgey', dexId: 16, types: ['normal', 'flying'] },
          { name: 'Pidgeotto', dexId: 17, types: ['normal', 'flying'] },
        ],
      },
      {
        leader: 'Bugsy',
        role: 'gym',
        label: 'Hive Badge',
        specialtyType: 'bug',
        team: [
          { name: 'Metapod', dexId: 11, types: ['bug'] },
          { name: 'Kakuna', dexId: 14, types: ['bug', 'poison'] },
          { name: 'Scyther', dexId: 123, types: ['bug', 'flying'] },
        ],
      },
      {
        leader: 'Whitney',
        role: 'gym',
        label: 'Plain Badge',
        specialtyType: 'normal',
        team: [
          { name: 'Clefairy', dexId: 35, types: ['fairy'] },
          { name: 'Miltank', dexId: 241, types: ['normal'] },
        ],
      },
      {
        leader: 'Morty',
        role: 'gym',
        label: 'Fog Badge',
        specialtyType: 'ghost',
        team: [
          { name: 'Gastly', dexId: 92, types: ['ghost', 'poison'] },
          { name: 'Haunter', dexId: 93, types: ['ghost', 'poison'] },
          { name: 'Gengar', dexId: 94, types: ['ghost', 'poison'] },
          { name: 'Haunter', dexId: 93, types: ['ghost', 'poison'] },
        ],
      },
      {
        leader: 'Chuck',
        role: 'gym',
        label: 'Storm Badge',
        specialtyType: 'fighting',
        team: [
          { name: 'Primeape', dexId: 57, types: ['fighting'] },
          { name: 'Poliwrath', dexId: 62, types: ['water', 'fighting'] },
        ],
      },
      {
        leader: 'Jasmine',
        role: 'gym',
        label: 'Mineral Badge',
        specialtyType: 'steel',
        team: [
          { name: 'Magnemite', dexId: 81, types: ['electric', 'steel'] },
          { name: 'Magnemite', dexId: 81, types: ['electric', 'steel'] },
          { name: 'Steelix', dexId: 208, types: ['steel', 'ground'] },
        ],
      },
      {
        leader: 'Pryce',
        role: 'gym',
        label: 'Glacier Badge',
        specialtyType: 'ice',
        team: [
          { name: 'Seel', dexId: 86, types: ['water'] },
          { name: 'Dewgong', dexId: 87, types: ['water', 'ice'] },
          { name: 'Piloswine', dexId: 221, types: ['ice', 'ground'] },
        ],
      },
      {
        leader: 'Clair',
        role: 'gym',
        label: 'Rising Badge',
        specialtyType: 'dragon',
        team: [
          { name: 'Dragonair', dexId: 148, types: ['dragon'] },
          { name: 'Dragonair', dexId: 148, types: ['dragon'] },
          { name: 'Dragonair', dexId: 148, types: ['dragon'] },
          { name: 'Kingdra', dexId: 230, types: ['water', 'dragon'] },
        ],
      },
      {
        leader: 'Will',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'psychic',
        team: [
          { name: 'Xatu', dexId: 178, types: ['psychic', 'flying'] },
          { name: 'Jynx', dexId: 124, types: ['ice', 'psychic'] },
          { name: 'Exeggutor', dexId: 103, types: ['grass', 'psychic'] },
          { name: 'Slowbro', dexId: 80, types: ['water', 'psychic'] },
          { name: 'Xatu', dexId: 178, types: ['psychic', 'flying'] },
        ],
      },
      {
        leader: 'Koga',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'poison',
        team: [
          { name: 'Ariados', dexId: 168, types: ['bug', 'poison'] },
          { name: 'Venomoth', dexId: 49, types: ['bug', 'poison'] },
          { name: 'Forretress', dexId: 205, types: ['bug', 'steel'] },
          { name: 'Muk', dexId: 89, types: ['poison'] },
          { name: 'Crobat', dexId: 169, types: ['poison', 'flying'] },
        ],
      },
      {
        leader: 'Bruno',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'fighting',
        team: [
          { name: 'Hitmontop', dexId: 237, types: ['fighting'] },
          { name: 'Hitmonlee', dexId: 106, types: ['fighting'] },
          { name: 'Hitmonchan', dexId: 107, types: ['fighting'] },
          { name: 'Onix', dexId: 95, types: ['rock', 'ground'] },
          { name: 'Machamp', dexId: 68, types: ['fighting'] },
        ],
      },
      {
        leader: 'Karen',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'dark',
        team: [
          { name: 'Umbreon', dexId: 197, types: ['dark'] },
          { name: 'Murkrow', dexId: 198, types: ['dark', 'flying'] },
          { name: 'Vileplume', dexId: 45, types: ['grass', 'poison'] },
          { name: 'Gengar', dexId: 94, types: ['ghost', 'poison'] },
          { name: 'Houndoom', dexId: 229, types: ['dark', 'fire'] },
        ],
      },
      {
        leader: 'Lance',
        role: 'champion',
        label: 'Champion',
        specialtyType: 'dragon',
        team: [
          { name: 'Gyarados', dexId: 130, types: ['water', 'flying'] },
          { name: 'Dragonite', dexId: 149, types: ['dragon', 'flying'] },
          { name: 'Dragonite', dexId: 149, types: ['dragon', 'flying'] },
          { name: 'Aerodactyl', dexId: 142, types: ['rock', 'flying'] },
          { name: 'Charizard', dexId: 6, types: ['fire', 'flying'] },
          { name: 'Dragonite', dexId: 149, types: ['dragon', 'flying'] },
        ],
      },
    ],
  },
  {
    gen: 3,
    region: 'Hoenn',
    version: 'Emerald',
    notes:
      'Emerald-specific rosters. Tate & Liza is a double battle (Mossdeep Gym). Juan replaces Wallace as the 8th gym leader (Sootopolis) since Wallace is the Champion in Emerald.',
    battles: [
      {
        leader: 'Roxanne',
        role: 'gym',
        label: 'Stone Badge',
        specialtyType: 'rock',
        team: [
          { name: 'Geodude', dexId: 74, types: ['rock', 'ground'] },
          { name: 'Geodude', dexId: 74, types: ['rock', 'ground'] },
          { name: 'Nosepass', dexId: 299, types: ['rock'] },
        ],
      },
      {
        leader: 'Brawly',
        role: 'gym',
        label: 'Knuckle Badge',
        specialtyType: 'fighting',
        team: [
          { name: 'Machop', dexId: 66, types: ['fighting'] },
          { name: 'Meditite', dexId: 307, types: ['fighting', 'psychic'] },
          { name: 'Makuhita', dexId: 296, types: ['fighting'] },
        ],
      },
      {
        leader: 'Wattson',
        role: 'gym',
        label: 'Dynamo Badge',
        specialtyType: 'electric',
        team: [
          { name: 'Voltorb', dexId: 100, types: ['electric'] },
          { name: 'Electrike', dexId: 309, types: ['electric'] },
          { name: 'Magneton', dexId: 82, types: ['electric', 'steel'] },
          { name: 'Manectric', dexId: 310, types: ['electric'] },
        ],
      },
      {
        leader: 'Flannery',
        role: 'gym',
        label: 'Heat Badge',
        specialtyType: 'fire',
        team: [
          { name: 'Numel', dexId: 322, types: ['fire', 'ground'] },
          { name: 'Slugma', dexId: 218, types: ['fire'] },
          { name: 'Camerupt', dexId: 323, types: ['fire', 'ground'] },
          { name: 'Torkoal', dexId: 324, types: ['fire'] },
        ],
      },
      {
        leader: 'Norman',
        role: 'gym',
        label: 'Balance Badge',
        specialtyType: 'normal',
        team: [
          { name: 'Spinda', dexId: 327, types: ['normal'] },
          { name: 'Vigoroth', dexId: 288, types: ['normal'] },
          { name: 'Linoone', dexId: 264, types: ['normal'] },
          { name: 'Slaking', dexId: 289, types: ['normal'] },
        ],
      },
      {
        leader: 'Winona',
        role: 'gym',
        label: 'Feather Badge',
        specialtyType: 'flying',
        team: [
          { name: 'Swablu', dexId: 333, types: ['normal', 'flying'] },
          { name: 'Tropius', dexId: 357, types: ['grass', 'flying'] },
          { name: 'Pelipper', dexId: 279, types: ['water', 'flying'] },
          { name: 'Skarmory', dexId: 227, types: ['steel', 'flying'] },
          { name: 'Altaria', dexId: 334, types: ['dragon', 'flying'] },
        ],
      },
      {
        leader: 'Tate & Liza',
        role: 'gym',
        label: 'Mind Badge',
        specialtyType: 'psychic',
        team: [
          { name: 'Claydol', dexId: 344, types: ['ground', 'psychic'] },
          { name: 'Xatu', dexId: 178, types: ['psychic', 'flying'] },
          { name: 'Lunatone', dexId: 337, types: ['rock', 'psychic'] },
          { name: 'Solrock', dexId: 338, types: ['rock', 'psychic'] },
        ],
      },
      {
        leader: 'Juan',
        role: 'gym',
        label: 'Rain Badge',
        specialtyType: 'water',
        team: [
          { name: 'Luvdisc', dexId: 370, types: ['water'] },
          { name: 'Whiscash', dexId: 340, types: ['water', 'ground'] },
          { name: 'Sealeo', dexId: 364, types: ['ice', 'water'] },
          { name: 'Crawdaunt', dexId: 342, types: ['water', 'dark'] },
          { name: 'Kingdra', dexId: 230, types: ['water', 'dragon'] },
        ],
      },
      {
        leader: 'Sidney',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'dark',
        team: [
          { name: 'Mightyena', dexId: 262, types: ['dark'] },
          { name: 'Shiftry', dexId: 275, types: ['grass', 'dark'] },
          { name: 'Cacturne', dexId: 332, types: ['grass', 'dark'] },
          { name: 'Crawdaunt', dexId: 342, types: ['water', 'dark'] },
          { name: 'Absol', dexId: 359, types: ['dark'] },
        ],
      },
      {
        leader: 'Phoebe',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'ghost',
        team: [
          { name: 'Dusclops', dexId: 356, types: ['ghost'] },
          { name: 'Banette', dexId: 354, types: ['ghost'] },
          { name: 'Sableye', dexId: 302, types: ['dark', 'ghost'] },
          { name: 'Banette', dexId: 354, types: ['ghost'] },
          { name: 'Dusclops', dexId: 356, types: ['ghost'] },
        ],
      },
      {
        leader: 'Glacia',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'ice',
        team: [
          { name: 'Sealeo', dexId: 364, types: ['ice', 'water'] },
          { name: 'Sealeo', dexId: 364, types: ['ice', 'water'] },
          { name: 'Glalie', dexId: 362, types: ['ice'] },
          { name: 'Glalie', dexId: 362, types: ['ice'] },
          { name: 'Walrein', dexId: 365, types: ['ice', 'water'] },
        ],
      },
      {
        leader: 'Drake',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'dragon',
        team: [
          { name: 'Shelgon', dexId: 372, types: ['dragon'] },
          { name: 'Altaria', dexId: 334, types: ['dragon', 'flying'] },
          { name: 'Flygon', dexId: 330, types: ['ground', 'dragon'] },
          { name: 'Flygon', dexId: 330, types: ['ground', 'dragon'] },
          { name: 'Kingdra', dexId: 230, types: ['water', 'dragon'] },
          { name: 'Salamence', dexId: 373, types: ['dragon', 'flying'] },
        ],
      },
      {
        leader: 'Wallace',
        role: 'champion',
        label: 'Champion',
        specialtyType: 'water',
        team: [
          { name: 'Wailord', dexId: 321, types: ['water'] },
          { name: 'Tentacruel', dexId: 73, types: ['water', 'poison'] },
          { name: 'Ludicolo', dexId: 272, types: ['water', 'grass'] },
          { name: 'Whiscash', dexId: 340, types: ['water', 'ground'] },
          { name: 'Gyarados', dexId: 130, types: ['water', 'flying'] },
          { name: 'Milotic', dexId: 350, types: ['water'] },
        ],
      },
    ],
  },
  {
    gen: 4,
    region: 'Sinnoh',
    version: 'Platinum',
    notes:
      'Teams reflect Pokemon Platinum story-mode battles (first encounter). Fantina is battled 3rd in Platinum (not 5th as in Diamond/Pearl). Champion Cynthia has no strict single specialty type. Mr. Mime and Togekiss listed with their canonical (modern) typings including Fairy.',
    battles: [
      {
        leader: 'Roark',
        role: 'gym',
        label: 'Coal Badge',
        specialtyType: 'rock',
        team: [
          { name: 'Geodude', dexId: 74, types: ['rock', 'ground'] },
          { name: 'Onix', dexId: 95, types: ['rock', 'ground'] },
          { name: 'Cranidos', dexId: 408, types: ['rock'] },
        ],
      },
      {
        leader: 'Gardenia',
        role: 'gym',
        label: 'Forest Badge',
        specialtyType: 'grass',
        team: [
          { name: 'Turtwig', dexId: 387, types: ['grass'] },
          { name: 'Cherrim', dexId: 421, types: ['grass'] },
          { name: 'Roserade', dexId: 407, types: ['grass', 'poison'] },
        ],
      },
      {
        leader: 'Fantina',
        role: 'gym',
        label: 'Relic Badge',
        specialtyType: 'ghost',
        team: [
          { name: 'Duskull', dexId: 355, types: ['ghost'] },
          { name: 'Haunter', dexId: 93, types: ['ghost', 'poison'] },
          { name: 'Mismagius', dexId: 429, types: ['ghost'] },
        ],
      },
      {
        leader: 'Maylene',
        role: 'gym',
        label: 'Cobble Badge',
        specialtyType: 'fighting',
        team: [
          { name: 'Meditite', dexId: 307, types: ['fighting', 'psychic'] },
          { name: 'Machoke', dexId: 67, types: ['fighting'] },
          { name: 'Lucario', dexId: 448, types: ['fighting', 'steel'] },
        ],
      },
      {
        leader: 'Crasher Wake',
        role: 'gym',
        label: 'Fen Badge',
        specialtyType: 'water',
        team: [
          { name: 'Gyarados', dexId: 130, types: ['water', 'flying'] },
          { name: 'Quagsire', dexId: 195, types: ['water', 'ground'] },
          { name: 'Floatzel', dexId: 419, types: ['water'] },
        ],
      },
      {
        leader: 'Byron',
        role: 'gym',
        label: 'Mine Badge',
        specialtyType: 'steel',
        team: [
          { name: 'Magneton', dexId: 82, types: ['electric', 'steel'] },
          { name: 'Steelix', dexId: 208, types: ['steel', 'ground'] },
          { name: 'Bastiodon', dexId: 411, types: ['rock', 'steel'] },
        ],
      },
      {
        leader: 'Candice',
        role: 'gym',
        label: 'Icicle Badge',
        specialtyType: 'ice',
        team: [
          { name: 'Snover', dexId: 459, types: ['grass', 'ice'] },
          { name: 'Sneasel', dexId: 215, types: ['dark', 'ice'] },
          { name: 'Medicham', dexId: 308, types: ['fighting', 'psychic'] },
          { name: 'Abomasnow', dexId: 460, types: ['grass', 'ice'] },
        ],
      },
      {
        leader: 'Volkner',
        role: 'gym',
        label: 'Beacon Badge',
        specialtyType: 'electric',
        team: [
          { name: 'Jolteon', dexId: 135, types: ['electric'] },
          { name: 'Raichu', dexId: 26, types: ['electric'] },
          { name: 'Luxray', dexId: 405, types: ['electric'] },
          { name: 'Electivire', dexId: 466, types: ['electric'] },
        ],
      },
      {
        leader: 'Aaron',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'bug',
        team: [
          { name: 'Yanmega', dexId: 469, types: ['bug', 'flying'] },
          { name: 'Scizor', dexId: 212, types: ['bug', 'steel'] },
          { name: 'Vespiquen', dexId: 416, types: ['bug', 'flying'] },
          { name: 'Heracross', dexId: 214, types: ['bug', 'fighting'] },
          { name: 'Drapion', dexId: 452, types: ['poison', 'dark'] },
        ],
      },
      {
        leader: 'Bertha',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'ground',
        team: [
          { name: 'Whiscash', dexId: 340, types: ['water', 'ground'] },
          { name: 'Gliscor', dexId: 472, types: ['ground', 'flying'] },
          { name: 'Hippowdon', dexId: 450, types: ['ground'] },
          { name: 'Golem', dexId: 76, types: ['rock', 'ground'] },
          { name: 'Rhyperior', dexId: 464, types: ['ground', 'rock'] },
        ],
      },
      {
        leader: 'Flint',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'fire',
        team: [
          { name: 'Houndoom', dexId: 229, types: ['dark', 'fire'] },
          { name: 'Flareon', dexId: 136, types: ['fire'] },
          { name: 'Rapidash', dexId: 78, types: ['fire'] },
          { name: 'Infernape', dexId: 392, types: ['fire', 'fighting'] },
          { name: 'Magmortar', dexId: 467, types: ['fire'] },
        ],
      },
      {
        leader: 'Lucian',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'psychic',
        team: [
          { name: 'Mr. Mime', dexId: 122, types: ['psychic', 'fairy'] },
          { name: 'Espeon', dexId: 196, types: ['psychic'] },
          { name: 'Bronzong', dexId: 437, types: ['steel', 'psychic'] },
          { name: 'Alakazam', dexId: 65, types: ['psychic'] },
          { name: 'Gallade', dexId: 475, types: ['psychic', 'fighting'] },
        ],
      },
      {
        leader: 'Cynthia',
        role: 'champion',
        label: 'Champion',
        team: [
          { name: 'Spiritomb', dexId: 442, types: ['ghost', 'dark'] },
          { name: 'Roserade', dexId: 407, types: ['grass', 'poison'] },
          { name: 'Togekiss', dexId: 468, types: ['fairy', 'flying'] },
          { name: 'Lucario', dexId: 448, types: ['fighting', 'steel'] },
          { name: 'Milotic', dexId: 350, types: ['water'] },
          { name: 'Garchomp', dexId: 445, types: ['dragon', 'ground'] },
        ],
      },
    ],
  },
  {
    gen: 5,
    region: 'Unova',
    version: 'Black 2/White 2',
    notes:
      'Teams reflect Pokemon Black 2/White 2 first-battle story rosters, with Gen 5 typings (no retroactive Fairy re-typings apply to these species). This is the B2W2 League roster where Iris is Champion (in BW the initial Champion was Alder). Gym leader partial teams reflect the smaller first-visit rosters.',
    battles: [
      {
        leader: 'Cheren',
        role: 'gym',
        label: 'Basic Badge',
        specialtyType: 'normal',
        team: [
          { name: 'Patrat', dexId: 504, types: ['normal'] },
          { name: 'Lillipup', dexId: 506, types: ['normal'] },
        ],
      },
      {
        leader: 'Roxie',
        role: 'gym',
        label: 'Toxic Badge',
        specialtyType: 'poison',
        team: [
          { name: 'Koffing', dexId: 109, types: ['poison'] },
          { name: 'Whirlipede', dexId: 544, types: ['bug', 'poison'] },
        ],
      },
      {
        leader: 'Burgh',
        role: 'gym',
        label: 'Insect Badge',
        specialtyType: 'bug',
        team: [
          { name: 'Swadloon', dexId: 541, types: ['bug', 'grass'] },
          { name: 'Dwebble', dexId: 557, types: ['bug', 'rock'] },
          { name: 'Leavanny', dexId: 542, types: ['bug', 'grass'] },
        ],
      },
      {
        leader: 'Elesa',
        role: 'gym',
        label: 'Bolt Badge',
        specialtyType: 'electric',
        team: [
          { name: 'Emolga', dexId: 587, types: ['electric', 'flying'] },
          { name: 'Flaaffy', dexId: 180, types: ['electric'] },
          { name: 'Zebstrika', dexId: 523, types: ['electric'] },
        ],
      },
      {
        leader: 'Clay',
        role: 'gym',
        label: 'Quake Badge',
        specialtyType: 'ground',
        team: [
          { name: 'Krokorok', dexId: 552, types: ['ground', 'dark'] },
          { name: 'Sandslash', dexId: 28, types: ['ground'] },
          { name: 'Excadrill', dexId: 530, types: ['ground', 'steel'] },
        ],
      },
      {
        leader: 'Skyla',
        role: 'gym',
        label: 'Jet Badge',
        specialtyType: 'flying',
        team: [
          { name: 'Swoobat', dexId: 528, types: ['psychic', 'flying'] },
          { name: 'Skarmory', dexId: 227, types: ['steel', 'flying'] },
          { name: 'Swanna', dexId: 581, types: ['water', 'flying'] },
        ],
      },
      {
        leader: 'Drayden',
        role: 'gym',
        label: 'Legend Badge',
        specialtyType: 'dragon',
        team: [
          { name: 'Druddigon', dexId: 621, types: ['dragon'] },
          { name: 'Flygon', dexId: 330, types: ['ground', 'dragon'] },
          { name: 'Haxorus', dexId: 612, types: ['dragon'] },
        ],
      },
      {
        leader: 'Marlon',
        role: 'gym',
        label: 'Wave Badge',
        specialtyType: 'water',
        team: [
          { name: 'Carracosta', dexId: 565, types: ['water', 'rock'] },
          { name: 'Wailord', dexId: 321, types: ['water'] },
          { name: 'Jellicent', dexId: 593, types: ['water', 'ghost'] },
        ],
      },
      {
        leader: 'Shauntal',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'ghost',
        team: [
          { name: 'Cofagrigus', dexId: 563, types: ['ghost'] },
          { name: 'Drifblim', dexId: 426, types: ['ghost', 'flying'] },
          { name: 'Golurk', dexId: 623, types: ['ground', 'ghost'] },
          { name: 'Chandelure', dexId: 609, types: ['ghost', 'fire'] },
        ],
      },
      {
        leader: 'Grimsley',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'dark',
        team: [
          { name: 'Liepard', dexId: 510, types: ['dark'] },
          { name: 'Scrafty', dexId: 560, types: ['dark', 'fighting'] },
          { name: 'Krookodile', dexId: 553, types: ['ground', 'dark'] },
          { name: 'Bisharp', dexId: 625, types: ['dark', 'steel'] },
        ],
      },
      {
        leader: 'Caitlin',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'psychic',
        team: [
          { name: 'Musharna', dexId: 518, types: ['psychic'] },
          { name: 'Reuniclus', dexId: 579, types: ['psychic'] },
          { name: 'Sigilyph', dexId: 561, types: ['psychic', 'flying'] },
          { name: 'Gothitelle', dexId: 576, types: ['psychic'] },
        ],
      },
      {
        leader: 'Marshal',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'fighting',
        team: [
          { name: 'Throh', dexId: 538, types: ['fighting'] },
          { name: 'Sawk', dexId: 539, types: ['fighting'] },
          { name: 'Mienshao', dexId: 620, types: ['fighting'] },
          { name: 'Conkeldurr', dexId: 534, types: ['fighting'] },
        ],
      },
      {
        leader: 'Iris',
        role: 'champion',
        label: 'Champion',
        specialtyType: 'dragon',
        team: [
          { name: 'Hydreigon', dexId: 635, types: ['dark', 'dragon'] },
          { name: 'Druddigon', dexId: 621, types: ['dragon'] },
          { name: 'Aggron', dexId: 306, types: ['steel', 'rock'] },
          { name: 'Archeops', dexId: 567, types: ['rock', 'flying'] },
          { name: 'Lapras', dexId: 131, types: ['water', 'ice'] },
          { name: 'Haxorus', dexId: 612, types: ['dragon'] },
        ],
      },
    ],
  },
  {
    gen: 6,
    region: 'Kalos',
    version: 'X/Y',
    notes:
      'Story-mode first-encounter teams from Pokemon X and Y. Teams are identical between X and Y for all gym leaders, Elite Four, and Champion.',
    battles: [
      {
        leader: 'Viola',
        role: 'gym',
        label: 'Bug Badge',
        specialtyType: 'bug',
        team: [
          { name: 'Surskit', dexId: 283, types: ['bug', 'water'] },
          { name: 'Vivillon', dexId: 666, types: ['bug', 'flying'] },
        ],
      },
      {
        leader: 'Grant',
        role: 'gym',
        label: 'Cliff Badge',
        specialtyType: 'rock',
        team: [
          { name: 'Amaura', dexId: 698, types: ['rock', 'ice'] },
          { name: 'Tyrunt', dexId: 696, types: ['rock', 'dragon'] },
        ],
      },
      {
        leader: 'Korrina',
        role: 'gym',
        label: 'Rumble Badge',
        specialtyType: 'fighting',
        team: [
          { name: 'Mienfoo', dexId: 619, types: ['fighting'] },
          { name: 'Machoke', dexId: 67, types: ['fighting'] },
          { name: 'Hawlucha', dexId: 701, types: ['fighting', 'flying'] },
        ],
      },
      {
        leader: 'Ramos',
        role: 'gym',
        label: 'Plant Badge',
        specialtyType: 'grass',
        team: [
          { name: 'Jumpluff', dexId: 189, types: ['grass', 'flying'] },
          { name: 'Weepinbell', dexId: 70, types: ['grass', 'poison'] },
          { name: 'Gogoat', dexId: 673, types: ['grass'] },
        ],
      },
      {
        leader: 'Clemont',
        role: 'gym',
        label: 'Voltage Badge',
        specialtyType: 'electric',
        team: [
          { name: 'Emolga', dexId: 587, types: ['electric', 'flying'] },
          { name: 'Magneton', dexId: 82, types: ['electric', 'steel'] },
          { name: 'Heliolisk', dexId: 695, types: ['electric', 'normal'] },
        ],
      },
      {
        leader: 'Valerie',
        role: 'gym',
        label: 'Fairy Badge',
        specialtyType: 'fairy',
        team: [
          { name: 'Mawile', dexId: 303, types: ['steel', 'fairy'] },
          { name: 'Mr. Mime', dexId: 122, types: ['psychic', 'fairy'] },
          { name: 'Sylveon', dexId: 700, types: ['fairy'] },
        ],
      },
      {
        leader: 'Olympia',
        role: 'gym',
        label: 'Psychic Badge',
        specialtyType: 'psychic',
        team: [
          { name: 'Sigilyph', dexId: 561, types: ['psychic', 'flying'] },
          { name: 'Slowking', dexId: 199, types: ['water', 'psychic'] },
          { name: 'Meowstic', dexId: 678, types: ['psychic'] },
        ],
      },
      {
        leader: 'Wulfric',
        role: 'gym',
        label: 'Iceberg Badge',
        specialtyType: 'ice',
        team: [
          { name: 'Abomasnow', dexId: 460, types: ['grass', 'ice'] },
          { name: 'Cryogonal', dexId: 615, types: ['ice'] },
          { name: 'Avalugg', dexId: 713, types: ['ice'] },
        ],
      },
      {
        leader: 'Malva',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'fire',
        team: [
          { name: 'Pyroar', dexId: 668, types: ['fire', 'normal'] },
          { name: 'Torkoal', dexId: 324, types: ['fire'] },
          { name: 'Chandelure', dexId: 609, types: ['ghost', 'fire'] },
          { name: 'Talonflame', dexId: 663, types: ['fire', 'flying'] },
        ],
      },
      {
        leader: 'Siebold',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'water',
        team: [
          { name: 'Clawitzer', dexId: 693, types: ['water'] },
          { name: 'Gyarados', dexId: 130, types: ['water', 'flying'] },
          { name: 'Starmie', dexId: 121, types: ['water', 'psychic'] },
          { name: 'Barbaracle', dexId: 689, types: ['rock', 'water'] },
        ],
      },
      {
        leader: 'Wikstrom',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'steel',
        team: [
          { name: 'Klefki', dexId: 707, types: ['steel', 'fairy'] },
          { name: 'Probopass', dexId: 476, types: ['rock', 'steel'] },
          { name: 'Scizor', dexId: 212, types: ['bug', 'steel'] },
          { name: 'Aegislash', dexId: 681, types: ['steel', 'ghost'] },
        ],
      },
      {
        leader: 'Drasna',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'dragon',
        team: [
          { name: 'Dragalge', dexId: 691, types: ['poison', 'dragon'] },
          { name: 'Druddigon', dexId: 621, types: ['dragon'] },
          { name: 'Altaria', dexId: 334, types: ['dragon', 'flying'] },
          { name: 'Noivern', dexId: 715, types: ['flying', 'dragon'] },
        ],
      },
      {
        leader: 'Diantha',
        role: 'champion',
        label: 'Champion',
        team: [
          { name: 'Hawlucha', dexId: 701, types: ['fighting', 'flying'] },
          { name: 'Tyrantrum', dexId: 697, types: ['rock', 'dragon'] },
          { name: 'Aurorus', dexId: 699, types: ['rock', 'ice'] },
          { name: 'Gourgeist', dexId: 711, types: ['ghost', 'grass'] },
          { name: 'Goodra', dexId: 706, types: ['dragon'] },
          { name: 'Gardevoir', dexId: 282, types: ['psychic', 'fairy'] },
        ],
      },
    ],
  },
  {
    gen: 7,
    region: 'Alola',
    version: 'Ultra Sun/Ultra Moon',
    notes:
      'Alola has no Pokemon Gyms. The island challenge replaces them: trainers complete Trials and battle the four Island Kahunas (grand trials). The Kahunas (Hala, Olivia, Nanu, Hapu) are listed here as the gym-equivalent battles with role:"gym". Olivia serves as both a Kahuna (Akala Island) and an Elite Four member, so she appears twice. In USUM the Champion is Professor Kukui, who has no single type specialty. Kukui\'s Ninetales is the Alolan form (Ice/Fairy), not the Kantonian Fire form.',
    battles: [
      {
        leader: 'Hala',
        role: 'gym',
        label: 'Melemele Grand Trial',
        specialtyType: 'fighting',
        team: [
          { name: 'Machop', dexId: 66, types: ['fighting'] },
          { name: 'Makuhita', dexId: 296, types: ['fighting'] },
          { name: 'Crabrawler', dexId: 739, types: ['fighting'] },
        ],
      },
      {
        leader: 'Olivia',
        role: 'gym',
        label: 'Akala Grand Trial',
        specialtyType: 'rock',
        team: [
          { name: 'Anorith', dexId: 347, types: ['rock', 'bug'] },
          { name: 'Lileep', dexId: 345, types: ['rock', 'grass'] },
          { name: 'Lycanroc', dexId: 745, types: ['rock'] },
        ],
      },
      {
        leader: 'Nanu',
        role: 'gym',
        label: "Ula'ula Grand Trial",
        specialtyType: 'dark',
        team: [
          { name: 'Sableye', dexId: 302, types: ['dark', 'ghost'] },
          { name: 'Krokorok', dexId: 552, types: ['ground', 'dark'] },
          { name: 'Alolan Persian', dexId: 53, types: ['dark'] },
        ],
      },
      {
        leader: 'Hapu',
        role: 'gym',
        label: 'Poni Grand Trial',
        specialtyType: 'ground',
        team: [
          { name: 'Dugtrio', dexId: 51, types: ['ground'] },
          { name: 'Gastrodon', dexId: 423, types: ['water', 'ground'] },
          { name: 'Golurk', dexId: 623, types: ['ground', 'ghost'] },
          { name: 'Mudsdale', dexId: 750, types: ['ground'] },
        ],
      },
      {
        leader: 'Molayne',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'steel',
        team: [
          { name: 'Klefki', dexId: 707, types: ['steel', 'fairy'] },
          { name: 'Bisharp', dexId: 625, types: ['dark', 'steel'] },
          { name: 'Magnezone', dexId: 462, types: ['electric', 'steel'] },
          { name: 'Metagross', dexId: 376, types: ['steel', 'psychic'] },
          { name: 'Alolan Dugtrio', dexId: 51, types: ['ground', 'steel'] },
        ],
      },
      {
        leader: 'Olivia',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'rock',
        team: [
          { name: 'Gigalith', dexId: 526, types: ['rock'] },
          { name: 'Probopass', dexId: 476, types: ['rock', 'steel'] },
          { name: 'Golem', dexId: 76, types: ['rock', 'ground'] },
          { name: 'Relicanth', dexId: 369, types: ['water', 'rock'] },
          { name: 'Lycanroc', dexId: 745, types: ['rock'] },
        ],
      },
      {
        leader: 'Acerola',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'ghost',
        team: [
          { name: 'Drifblim', dexId: 426, types: ['ghost', 'flying'] },
          { name: 'Mimikyu', dexId: 778, types: ['ghost', 'fairy'] },
          { name: 'Dhelmise', dexId: 781, types: ['ghost', 'grass'] },
          { name: 'Froslass', dexId: 478, types: ['ice', 'ghost'] },
          { name: 'Palossand', dexId: 770, types: ['ghost', 'ground'] },
        ],
      },
      {
        leader: 'Kahili',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'flying',
        team: [
          { name: 'Skarmory', dexId: 227, types: ['steel', 'flying'] },
          { name: 'Crobat', dexId: 169, types: ['poison', 'flying'] },
          { name: 'Oricorio', dexId: 741, types: ['fire', 'flying'] },
          { name: 'Mandibuzz', dexId: 630, types: ['dark', 'flying'] },
          { name: 'Toucannon', dexId: 733, types: ['normal', 'flying'] },
        ],
      },
      {
        leader: 'Kukui',
        role: 'champion',
        label: 'Champion',
        team: [
          { name: 'Lycanroc', dexId: 745, types: ['rock'] },
          { name: 'Alolan Ninetales', dexId: 38, types: ['ice', 'fairy'] },
          { name: 'Braviary', dexId: 628, types: ['normal', 'flying'] },
          { name: 'Magnezone', dexId: 462, types: ['electric', 'steel'] },
          { name: 'Snorlax', dexId: 143, types: ['normal'] },
          { name: 'Incineroar', dexId: 727, types: ['fire', 'dark'] },
        ],
      },
    ],
  },
  {
    gen: 8,
    region: 'Galar',
    version: 'Sword/Shield',
    notes:
      "Galar has NO Elite Four; after the 8 gyms the player competes in the Champion Cup, and Leon is treated here as the Champion (role: champion). Version exclusives: Bea (Fighting) is the 4th gym leader in Sword while Allister (Ghost) takes her place in Shield; Gordie (Rock) is the 6th gym leader in Sword while Melony (Ice) takes his place in Shield. Bea (Sword) is used for the 4th gym and Melony (Shield) for the 6th gym. Allister (Ghost) and Gordie (Rock) are the noted alternates. Melony's Darmanitan is Galarian (pure Ice). Teams shown are the story-mode gym-mission teams (not the tougher post-game Champion Cup rematch/Ranked teams). Each leader Dynamaxes their final Pokemon in-game. Opal (Fairy) leads the 5th gym in Ballonlea.",
    battles: [
      {
        leader: 'Milo',
        role: 'gym',
        label: 'Grass Badge',
        specialtyType: 'grass',
        team: [
          { name: 'Gossifleur', dexId: 829, types: ['grass'] },
          { name: 'Eldegoss', dexId: 830, types: ['grass'] },
        ],
      },
      {
        leader: 'Nessa',
        role: 'gym',
        label: 'Water Badge',
        specialtyType: 'water',
        team: [
          { name: 'Goldeen', dexId: 118, types: ['water'] },
          { name: 'Arrokuda', dexId: 846, types: ['water'] },
          { name: 'Drednaw', dexId: 834, types: ['water', 'rock'] },
        ],
      },
      {
        leader: 'Kabu',
        role: 'gym',
        label: 'Fire Badge',
        specialtyType: 'fire',
        team: [
          { name: 'Ninetales', dexId: 38, types: ['fire'] },
          { name: 'Arcanine', dexId: 59, types: ['fire'] },
          { name: 'Centiskorch', dexId: 851, types: ['fire', 'bug'] },
        ],
      },
      {
        leader: 'Bea',
        role: 'gym',
        label: 'Fighting Badge',
        specialtyType: 'fighting',
        team: [
          { name: 'Hitmontop', dexId: 237, types: ['fighting'] },
          { name: 'Pangoro', dexId: 675, types: ['fighting', 'dark'] },
          { name: "Sirfetch'd", dexId: 865, types: ['fighting'] },
          { name: 'Machamp', dexId: 68, types: ['fighting'] },
        ],
      },
      {
        leader: 'Opal',
        role: 'gym',
        label: 'Fairy Badge',
        specialtyType: 'fairy',
        team: [
          { name: 'Weezing', dexId: 110, types: ['poison', 'fairy'] },
          { name: 'Mawile', dexId: 303, types: ['steel', 'fairy'] },
          { name: 'Togekiss', dexId: 468, types: ['fairy', 'flying'] },
          { name: 'Alcremie', dexId: 869, types: ['fairy'] },
        ],
      },
      {
        leader: 'Melony',
        role: 'gym',
        label: 'Ice Badge',
        specialtyType: 'ice',
        team: [
          { name: 'Frosmoth', dexId: 873, types: ['ice', 'bug'] },
          { name: 'Darmanitan', dexId: 555, types: ['ice'] },
          { name: 'Eiscue', dexId: 875, types: ['ice'] },
          { name: 'Lapras', dexId: 131, types: ['water', 'ice'] },
        ],
      },
      {
        leader: 'Piers',
        role: 'gym',
        label: 'Dark Badge',
        specialtyType: 'dark',
        team: [
          { name: 'Scrafty', dexId: 560, types: ['dark', 'fighting'] },
          { name: 'Malamar', dexId: 687, types: ['dark', 'psychic'] },
          { name: 'Skuntank', dexId: 435, types: ['poison', 'dark'] },
          { name: 'Obstagoon', dexId: 862, types: ['dark', 'normal'] },
        ],
      },
      {
        leader: 'Raihan',
        role: 'gym',
        label: 'Dragon Badge',
        specialtyType: 'dragon',
        team: [
          { name: 'Gigalith', dexId: 526, types: ['rock'] },
          { name: 'Flygon', dexId: 330, types: ['ground', 'dragon'] },
          { name: 'Sandaconda', dexId: 844, types: ['ground'] },
          { name: 'Duraludon', dexId: 884, types: ['steel', 'dragon'] },
        ],
      },
      {
        leader: 'Leon',
        role: 'champion',
        label: 'Champion',
        team: [
          { name: 'Aegislash', dexId: 681, types: ['steel', 'ghost'] },
          { name: 'Dragapult', dexId: 887, types: ['dragon', 'ghost'] },
          { name: 'Haxorus', dexId: 612, types: ['dragon'] },
          { name: 'Seismitoad', dexId: 537, types: ['water', 'ground'] },
          { name: 'Rhyperior', dexId: 464, types: ['ground', 'rock'] },
          { name: 'Charizard', dexId: 6, types: ['fire', 'flying'] },
        ],
      },
    ],
  },
  {
    gen: 9,
    region: 'Paldea',
    version: 'Scarlet/Violet',
    notes:
      'Victory Road story-mode main teams (level-scaled, pre-rematch). Larry appears twice: as the Normal-type Medali Gym Leader and as the Flying-type Elite Four member. No version-exclusive gym leaders in the main gym challenge.',
    battles: [
      {
        leader: 'Katy',
        role: 'gym',
        label: 'Bug Badge',
        specialtyType: 'bug',
        team: [
          { name: 'Nymble', dexId: 919, types: ['bug'] },
          { name: 'Tarountula', dexId: 917, types: ['bug'] },
          { name: 'Teddiursa', dexId: 216, types: ['normal'] },
        ],
      },
      {
        leader: 'Brassius',
        role: 'gym',
        label: 'Grass Badge',
        specialtyType: 'grass',
        team: [
          { name: 'Petilil', dexId: 548, types: ['grass'] },
          { name: 'Smoliv', dexId: 928, types: ['grass', 'normal'] },
          { name: 'Sudowoodo', dexId: 185, types: ['rock'] },
        ],
      },
      {
        leader: 'Iono',
        role: 'gym',
        label: 'Electric Badge',
        specialtyType: 'electric',
        team: [
          { name: 'Wattrel', dexId: 940, types: ['electric', 'flying'] },
          { name: 'Bellibolt', dexId: 939, types: ['electric'] },
          { name: 'Luxio', dexId: 404, types: ['electric'] },
          { name: 'Mismagius', dexId: 429, types: ['ghost'] },
        ],
      },
      {
        leader: 'Kofu',
        role: 'gym',
        label: 'Water Badge',
        specialtyType: 'water',
        team: [
          { name: 'Veluza', dexId: 976, types: ['water', 'psychic'] },
          { name: 'Wugtrio', dexId: 961, types: ['water'] },
          { name: 'Crabominable', dexId: 740, types: ['fighting', 'ice'] },
        ],
      },
      {
        leader: 'Larry',
        role: 'gym',
        label: 'Normal Badge',
        specialtyType: 'normal',
        team: [
          { name: 'Komala', dexId: 775, types: ['normal'] },
          { name: 'Dudunsparce', dexId: 982, types: ['normal'] },
          { name: 'Staraptor', dexId: 398, types: ['normal', 'flying'] },
        ],
      },
      {
        leader: 'Ryme',
        role: 'gym',
        label: 'Ghost Badge',
        specialtyType: 'ghost',
        team: [
          { name: 'Banette', dexId: 354, types: ['ghost'] },
          { name: 'Mimikyu', dexId: 778, types: ['ghost', 'fairy'] },
          { name: 'Houndstone', dexId: 972, types: ['ghost'] },
          { name: 'Toxtricity', dexId: 849, types: ['electric', 'poison'] },
        ],
      },
      {
        leader: 'Tulip',
        role: 'gym',
        label: 'Psychic Badge',
        specialtyType: 'psychic',
        team: [
          { name: 'Farigiraf', dexId: 981, types: ['normal', 'psychic'] },
          { name: 'Gardevoir', dexId: 282, types: ['psychic', 'fairy'] },
          { name: 'Espathra', dexId: 956, types: ['psychic'] },
          { name: 'Florges', dexId: 671, types: ['fairy'] },
        ],
      },
      {
        leader: 'Grusha',
        role: 'gym',
        label: 'Ice Badge',
        specialtyType: 'ice',
        team: [
          { name: 'Frosmoth', dexId: 873, types: ['ice', 'bug'] },
          { name: 'Beartic', dexId: 614, types: ['ice'] },
          { name: 'Cetitan', dexId: 975, types: ['ice'] },
          { name: 'Altaria', dexId: 334, types: ['dragon', 'flying'] },
        ],
      },
      {
        leader: 'Rika',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'ground',
        team: [
          { name: 'Whiscash', dexId: 340, types: ['water', 'ground'] },
          { name: 'Camerupt', dexId: 323, types: ['fire', 'ground'] },
          { name: 'Donphan', dexId: 232, types: ['ground'] },
          { name: 'Dugtrio', dexId: 51, types: ['ground'] },
          { name: 'Clodsire', dexId: 980, types: ['poison', 'ground'] },
        ],
      },
      {
        leader: 'Poppy',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'steel',
        team: [
          { name: 'Copperajah', dexId: 879, types: ['steel'] },
          { name: 'Bronzong', dexId: 437, types: ['steel', 'psychic'] },
          { name: 'Corviknight', dexId: 823, types: ['flying', 'steel'] },
          { name: 'Magnezone', dexId: 462, types: ['electric', 'steel'] },
          { name: 'Tinkaton', dexId: 959, types: ['fairy', 'steel'] },
        ],
      },
      {
        leader: 'Larry',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'flying',
        team: [
          { name: 'Tropius', dexId: 357, types: ['grass', 'flying'] },
          { name: 'Staraptor', dexId: 398, types: ['normal', 'flying'] },
          { name: 'Altaria', dexId: 334, types: ['dragon', 'flying'] },
          { name: 'Oricorio', dexId: 741, types: ['fire', 'flying'] },
          { name: 'Flamigo', dexId: 973, types: ['flying', 'fighting'] },
        ],
      },
      {
        leader: 'Hassel',
        role: 'elite-four',
        label: 'Elite Four',
        specialtyType: 'dragon',
        team: [
          { name: 'Noivern', dexId: 715, types: ['flying', 'dragon'] },
          { name: 'Dragalge', dexId: 691, types: ['poison', 'dragon'] },
          { name: 'Flapple', dexId: 841, types: ['grass', 'dragon'] },
          { name: 'Haxorus', dexId: 612, types: ['dragon'] },
          { name: 'Baxcalibur', dexId: 998, types: ['dragon', 'ice'] },
        ],
      },
      {
        leader: 'Geeta',
        role: 'champion',
        label: 'Champion',
        specialtyType: 'normal',
        team: [
          { name: 'Espathra', dexId: 956, types: ['psychic'] },
          { name: 'Gogoat', dexId: 673, types: ['grass'] },
          { name: 'Veluza', dexId: 976, types: ['water', 'psychic'] },
          { name: 'Avalugg', dexId: 713, types: ['ice'] },
          { name: 'Kingambit', dexId: 983, types: ['dark', 'steel'] },
          { name: 'Glimmora', dexId: 970, types: ['rock', 'poison'] },
        ],
      },
    ],
  },
];
