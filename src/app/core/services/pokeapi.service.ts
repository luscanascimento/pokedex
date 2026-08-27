import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  forkJoin,
  from,
  map,
  mergeMap,
  of,
  shareReplay,
  switchMap,
  toArray,
} from 'rxjs';

import {
  ApiListResponse,
  EvolutionStage,
  PokemonDetail,
  PokemonSummary,
  PokemonTypeName,
  RawEvolutionChain,
  RawEvolutionLink,
  RawPokemon,
  RawSpecies,
  RawTypeMembers,
} from '../models/pokemon.model';
import { NATIONAL_DEX_MAX, generationForId } from '../data/generations';
import { clearHttpCache } from '../interceptors/cache.interceptor';

const API = 'https://pokeapi.co/api/v2';

const ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

/**
 * Max simultaneous detail requests when enriching a page of the dex.
 * A page is 36 cards; unbounded that is 36 parallel hits on the free public
 * PokeAPI every time the user scrolls.
 */
export const ENRICH_CONCURRENCY = 6;

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

@Injectable({ providedIn: 'root' })
export class PokeApiService {
  private readonly http = inject(HttpClient);

  /** Cached full dex index (names + ids). Loaded once, replayed. */
  private index$?: Observable<PokemonSummary[]>;

  /** Per-detail cache so the same Pokemon isn't refetched. */
  private readonly detailCache = new Map<string, Observable<PokemonDetail>>();

  /**
   * The dex index. We derive id/generation cheaply from the list endpoint,
   * and build sprite/artwork URLs deterministically to avoid N detail calls.
   * Types are enriched lazily on the grid via `enrichTypes` where needed.
   */
  getDexIndex(): Observable<PokemonSummary[]> {
    if (!this.index$) {
      this.index$ = this.http
        .get<ApiListResponse>(`${API}/pokemon?limit=${NATIONAL_DEX_MAX}&offset=0`)
        .pipe(
          map((res) => {
            // One pass to build the id -> name lookup. Doing a .find() per entry
            // was O(n^2) (~1M iterations over the 1025-species list).
            const nameById = new Map<number, string>();
            for (const r of res.results) {
              const id = this.idFromUrl(r.url);
              if (id > 0 && id <= NATIONAL_DEX_MAX) {
                nameById.set(id, r.name);
              }
            }
            return [...nameById].map<PokemonSummary>(([id, name]) => ({
              id,
              name,
              types: [],
              sprite: `${ARTWORK_BASE}/${id}.png`,
              generation: generationForId(id),
            }));
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }
    return this.index$;
  }

  /**
   * Drop every memoized response so the next read genuinely hits the network.
   * Backs the Pokedex pull-to-refresh.
   */
  refresh(): void {
    this.index$ = undefined;
    this.detailCache.clear();
    clearHttpCache();
  }

  /**
   * Fetch types for a page of summaries (used to color the cards).
   * Returns new summary objects — the inputs are never mutated — and keeps at
   * most `ENRICH_CONCURRENCY` requests in flight.
   */
  enrichTypes(summaries: PokemonSummary[]): Observable<PokemonSummary[]> {
    const pending = summaries.filter((s) => s.types.length === 0);
    if (pending.length === 0) {
      return of(summaries);
    }
    return from(pending).pipe(
      mergeMap(
        (s) =>
          this.http.get<RawPokemon>(`${API}/pokemon/${s.id}`).pipe(
            map<RawPokemon, PokemonSummary>((raw) => ({
              ...s,
              name: raw.name,
              types: this.sortedTypes(raw),
            })),
          ),
        ENRICH_CONCURRENCY,
      ),
      toArray(),
      map((enriched) => {
        const byId = new Map(enriched.map((p) => [p.id, p]));
        return summaries.map((s) => byId.get(s.id) ?? s);
      }),
    );
  }

  /**
   * National Dex ids belonging to a type, in ONE request.
   * The alternative — reading `types` off every summary — costs 1025 detail
   * calls before the grid can render a single card.
   * Alternate forms come back with ids above the National Dex range; drop them
   * so the ids line up with the index.
   */
  getTypeMembers(type: PokemonTypeName): Observable<Set<number>> {
    return this.http.get<RawTypeMembers>(`${API}/type/${type}`).pipe(
      map((res) => {
        const ids = new Set<number>();
        for (const entry of res.pokemon) {
          const id = this.idFromUrl(entry.pokemon.url);
          if (id > 0 && id <= NATIONAL_DEX_MAX) {
            ids.add(id);
          }
        }
        return ids;
      }),
    );
  }

  getDetail(idOrName: string | number): Observable<PokemonDetail> {
    const key = String(idOrName).toLowerCase();
    let cached = this.detailCache.get(key);
    if (!cached) {
      cached = this.http.get<RawPokemon>(`${API}/pokemon/${key}`).pipe(
        switchMap((raw) =>
          this.http
            .get<RawSpecies>(raw.species.url)
            .pipe(map((species) => this.mapDetail(raw, species))),
        ),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      this.detailCache.set(key, cached);
    }
    return cached;
  }

  /** Evolution chain resolved into displayable stages with sprites + types. */
  getEvolutionChain(speciesUrl: string): Observable<EvolutionStage[]> {
    return this.http.get<RawSpecies>(speciesUrl).pipe(
      switchMap((species) => this.http.get<RawEvolutionChain>(species.evolution_chain.url)),
      map((chain) => this.flattenEvolution(chain.chain)),
      switchMap((stages) => {
        if (stages.length === 0) {
          return of<EvolutionStage[]>([]);
        }
        return forkJoin(
          stages.map((st) =>
            this.http.get<RawPokemon>(`${API}/pokemon/${st.name}`).pipe(
              map<RawPokemon, EvolutionStage>((raw) => ({
                id: raw.id,
                name: raw.name,
                sprite: `${ARTWORK_BASE}/${raw.id}.png`,
                types: this.sortedTypes(raw),
                trigger: st.trigger,
              })),
            ),
          ),
        );
      }),
    );
  }

  private mapDetail(raw: RawPokemon, species: RawSpecies): PokemonDetail {
    const stats = raw.stats.map((s) => ({
      name: s.stat.name,
      label: STAT_LABELS[s.stat.name] ?? s.stat.name,
      value: s.base_stat,
    }));
    const artwork = raw.sprites.other?.['official-artwork'];
    const englishFlavor = species.flavor_text_entries.find((e) => e.language.name === 'en');

    const levelMoves = raw.moves
      .map((m) => {
        const detail = m.version_group_details.find((d) => d.move_learn_method.name === 'level-up');
        return detail ? { name: m.move.name, level: detail.level_learned_at } : null;
      })
      .filter((m): m is { name: string; level: number } => m !== null)
      .sort((a, b) => a.level - b.level)
      .slice(0, 10);

    return {
      id: raw.id,
      name: raw.name,
      types: this.sortedTypes(raw),
      height: raw.height,
      weight: raw.weight,
      baseExperience: raw.base_experience,
      abilities: [...raw.abilities]
        .sort((a, b) => a.slot - b.slot)
        .map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
      stats,
      statTotal: stats.reduce((sum, s) => sum + s.value, 0),
      sprites: {
        default: raw.sprites.front_default ?? `${ARTWORK_BASE}/${raw.id}.png`,
        shiny: raw.sprites.front_shiny ?? raw.sprites.front_default ?? '',
        artwork: artwork?.front_default ?? `${ARTWORK_BASE}/${raw.id}.png`,
        artworkShiny:
          artwork?.front_shiny ?? artwork?.front_default ?? `${ARTWORK_BASE}/${raw.id}.png`,
      },
      cry: raw.cries?.latest ?? null,
      moves: levelMoves,
      speciesUrl: raw.species.url,
      generation: generationForId(raw.id),
      flavorText: englishFlavor
        ? englishFlavor.flavor_text.replace(/[\n\f\r]/g, ' ')
        : 'No Pokedex entry available.',
    };
  }

  private flattenEvolution(link: RawEvolutionLink): { name: string; trigger?: string }[] {
    const out: { name: string; trigger?: string }[] = [];
    const walk = (node: RawEvolutionLink, incomingTrigger?: string): void => {
      out.push({ name: node.species.name, trigger: incomingTrigger });
      for (const child of node.evolves_to) {
        const det = child.evolution_details[0];
        const trigger = det
          ? det.min_level
            ? `Lv. ${det.min_level}`
            : det.item
              ? this.titleCase(det.item.name)
              : this.titleCase(det.trigger.name)
          : undefined;
        walk(child, trigger);
      }
    };
    walk(link);
    return out;
  }

  /** Slot-ordered type names. Copies first — the raw response is not ours to sort. */
  private sortedTypes(raw: RawPokemon): PokemonTypeName[] {
    return [...raw.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name as PokemonTypeName);
  }

  private idFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }

  private titleCase(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
