/** Domain models for Poke Arena. Shaped from the PokeAPI v2 responses. */

export type PokemonTypeName =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export interface NamedApiResource {
  name: string;
  url: string;
}

export interface ApiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
}

/** Lightweight card representation used across the grid. */
export interface PokemonSummary {
  id: number;
  name: string;
  types: PokemonTypeName[];
  sprite: string;
  generation: number;
}

export interface PokemonStat {
  name: string;
  label: string;
  value: number;
}

export interface PokemonMoveRef {
  name: string;
  level: number;
}

/** Rich representation used on the detail page. */
export interface PokemonDetail {
  id: number;
  name: string;
  types: PokemonTypeName[];
  height: number; // decimetres
  weight: number; // hectograms
  baseExperience: number | null;
  abilities: { name: string; hidden: boolean }[];
  stats: PokemonStat[];
  statTotal: number;
  sprites: {
    default: string;
    shiny: string;
    artwork: string;
    artworkShiny: string;
  };
  cry: string | null;
  moves: PokemonMoveRef[];
  speciesUrl: string;
  generation: number;
  flavorText: string;
}

export interface EvolutionStage {
  id: number;
  name: string;
  sprite: string;
  types: PokemonTypeName[];
  trigger?: string;
}

/** Raw PokeAPI shapes (only the fields we consume). */
export interface RawPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: { slot: number; type: NamedApiResource }[];
  abilities: { ability: NamedApiResource; is_hidden: boolean; slot: number }[];
  stats: { base_stat: number; stat: NamedApiResource }[];
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
  cries?: { latest: string | null; legacy: string | null };
  moves: {
    move: NamedApiResource;
    version_group_details: {
      level_learned_at: number;
      move_learn_method: NamedApiResource;
    }[];
  }[];
  species: NamedApiResource;
}

export interface RawSpecies {
  id: number;
  generation: NamedApiResource;
  evolution_chain: { url: string };
  flavor_text_entries: {
    flavor_text: string;
    language: NamedApiResource;
    version: NamedApiResource;
  }[];
}

export interface RawEvolutionChain {
  chain: RawEvolutionLink;
}

export interface RawEvolutionLink {
  species: NamedApiResource;
  evolves_to: RawEvolutionLink[];
  evolution_details: {
    min_level: number | null;
    trigger: NamedApiResource;
    item: NamedApiResource | null;
  }[];
}
