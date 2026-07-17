import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, shareReplay, switchMap } from 'rxjs';

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
} from '../models/pokemon.model';
import { NATIONAL_DEX_MAX, generationForId } from '../data/generations';

const API = 'https://pokeapi.co/api/v2';
const ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

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
          map((res) =>
            res.results
              .map((r) => this.idFromUrl(r.url))
              .filter((id) => id > 0 && id <= NATIONAL_DEX_MAX)
              .map<PokemonSummary>((id) => ({
                id,
                name: this.nameFromId(res.results, id),
                types: [],
                sprite: `${ARTWORK_BASE}/${id}.png`,
                generation: generationForId(id),
              })),
          ),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }
    return this.index$;
  }

  /** Fetch types for a page of summaries (used to color the cards). */
  enrichTypes(summaries: PokemonSummary[]): Observable<PokemonSummary[]> {
    const pending = summaries.filter((s) => s.types.length === 0);
    if (pending.length === 0) {
      return of(summaries);
    }
    return forkJoin(
      pending.map((s) =>
        this.http.get<RawPokemon>(`${API}/pokemon/${s.id}`).pipe(
          map((raw) => {
            s.types = raw.types
              .sort((a, b) => a.slot - b.slot)
              .map((t) => t.type.name as PokemonTypeName);
            s.name = raw.name;
            return s;
          }),
        ),
      ),
    ).pipe(map(() => summaries));
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
                types: raw.types
                  .sort((a, b) => a.slot - b.slot)
                  .map((t) => t.type.name as PokemonTypeName),
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
        const detail = m.version_group_details.find(
          (d) => d.move_learn_method.name === 'level-up',
        );
        return detail
          ? { name: m.move.name, level: detail.level_learned_at }
          : null;
      })
      .filter((m): m is { name: string; level: number } => m !== null)
      .sort((a, b) => a.level - b.level)
      .slice(0, 10);

    return {
      id: raw.id,
      name: raw.name,
      types: raw.types
        .sort((a, b) => a.slot - b.slot)
        .map((t) => t.type.name as PokemonTypeName),
      height: raw.height,
      weight: raw.weight,
      baseExperience: raw.base_experience,
      abilities: raw.abilities
        .sort((a, b) => a.slot - b.slot)
        .map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
      stats,
      statTotal: stats.reduce((sum, s) => sum + s.value, 0),
      sprites: {
        default: raw.sprites.front_default ?? `${ARTWORK_BASE}/${raw.id}.png`,
        shiny: raw.sprites.front_shiny ?? raw.sprites.front_default ?? '',
        artwork: artwork?.front_default ?? `${ARTWORK_BASE}/${raw.id}.png`,
        artworkShiny: artwork?.front_shiny ?? artwork?.front_default ?? `${ARTWORK_BASE}/${raw.id}.png`,
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

  private flattenEvolution(
    link: RawEvolutionLink,
  ): { name: string; trigger?: string }[] {
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

  private idFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }

  private nameFromId(results: { name: string; url: string }[], id: number): string {
    const match = results.find((r) => this.idFromUrl(r.url) === id);
    return match ? match.name : `pokemon-${id}`;
  }

  private titleCase(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
