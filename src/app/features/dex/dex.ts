import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Subject, catchError, of, takeUntil } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { TeamService, MAX_TEAM } from '../../core/services/team.service';
import { PokemonSummary, PokemonTypeName } from '../../core/models/pokemon.model';
import { ALL_TYPES } from '../../core/data/type-chart';
import { GENERATIONS } from '../../core/data/generations';
import { PokemonCard } from '../../shared/ui/pokemon-card/pokemon-card';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PullToRefresh } from '../../shared/ui/pull-to-refresh/pull-to-refresh';

type LoadState = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 36;

@Component({
  selector: 'pa-dex',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PokemonCard, EmptyState, PullToRefresh],
  templateUrl: './dex.html',
  styleUrl: './dex.scss',
})
export class Dex implements OnDestroy {
  private readonly api = inject(PokeApiService);
  private readonly favorites = inject(FavoritesService);
  private readonly team = inject(TeamService);
  private readonly destroyed$ = new Subject<void>();

  protected readonly allTypes = ALL_TYPES;
  protected readonly generations = GENERATIONS;
  protected readonly maxTeam = MAX_TEAM;

  protected readonly state = signal<LoadState>('loading');
  private readonly index = signal<PokemonSummary[]>([]);

  // Filters
  protected readonly query = signal('');
  protected readonly typeFilter = signal<PokemonTypeName | null>(null);
  protected readonly genFilter = signal<number | null>(null);
  /** Dex ids of the active type, from `/type/{name}`. Null while unresolved. */
  private readonly typeMemberIds = signal<Set<number> | null>(null);
  protected readonly visibleCount = signal(PAGE_SIZE);

  protected readonly favoriteIds = this.favorites.ids;
  protected readonly teamMembers = this.team.members;

  /** Search + generation applied on the index. */
  private readonly filteredBase = computed(() => {
    const q = this.query().trim().toLowerCase();
    const gen = this.genFilter();
    return this.index().filter((p) => {
      if (gen !== null && p.generation !== gen) {
        return false;
      }
      if (q) {
        const matchesName = p.name.includes(q);
        const matchesId = String(p.id) === q || `#${p.id}` === q;
        if (!matchesName && !matchesId) {
          return false;
        }
      }
      return true;
    });
  });

  /** Type filter is resolved from the type endpoint, not from enriched cards. */
  protected readonly filtered = computed(() => {
    const base = this.filteredBase();
    if (!this.typeFilter()) {
      return base;
    }
    const ids = this.typeMemberIds();
    return ids ? base.filter((p) => ids.has(p.id)) : [];
  });

  protected readonly visible = computed(() => this.filtered().slice(0, this.visibleCount()));
  protected readonly hasMore = computed(() => this.visible().length < this.filtered().length);
  protected readonly resultCount = computed(() => this.filtered().length);
  protected readonly hasActiveFilters = computed(
    () => !!this.query() || !!this.typeFilter() || this.genFilter() !== null,
  );

  constructor() {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private load(): void {
    this.state.set('loading');
    this.api
      .getDexIndex()
      .pipe(
        catchError(() => {
          this.state.set('error');
          return of<PokemonSummary[]>([]);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe((list) => {
        if (list.length > 0) {
          this.index.set(list);
          this.state.set('ready');
          this.enrichVisible();
        }
      });
  }

  /** Enrich types for the rendered slice only, so cards get their colors. */
  private enrichVisible(): void {
    const pending = this.visible().filter((s) => s.types.length === 0);
    if (pending.length === 0) {
      return;
    }
    this.enrich(pending);
  }

  private enrich(targets: PokemonSummary[]): void {
    this.api
      .enrichTypes(targets)
      .pipe(
        catchError(() => of<PokemonSummary[]>([])),
        takeUntil(this.destroyed$),
      )
      .subscribe((enriched) => this.mergeIntoIndex(enriched));
  }

  /** enrichTypes returns fresh objects, so patch them back into the index by id. */
  private mergeIntoIndex(enriched: PokemonSummary[]): void {
    if (enriched.length === 0) {
      return;
    }
    const byId = new Map(enriched.map((p) => [p.id, p]));
    this.index.update((list) => list.map((p) => byId.get(p.id) ?? p));
  }

  protected onSearch(value: string): void {
    this.query.set(value);
    this.visibleCount.set(PAGE_SIZE);
    this.enrichVisible();
  }

  protected setType(type: PokemonTypeName | null): void {
    const next = this.typeFilter() === type ? null : type;
    this.typeFilter.set(next);
    this.typeMemberIds.set(null);
    this.visibleCount.set(PAGE_SIZE);
    if (!next) {
      this.enrichVisible();
      return;
    }
    // Skeletons, not the empty state: `filtered()` is legitimately empty until
    // the type members land.
    this.state.set('loading');
    this.api
      .getTypeMembers(next)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (ids) => {
          this.typeMemberIds.set(ids);
          this.state.set('ready');
          this.enrichVisible();
        },
        error: () => this.state.set('error'),
      });
  }

  protected setGen(gen: number | null): void {
    this.genFilter.set(this.genFilter() === gen ? null : gen);
    this.visibleCount.set(PAGE_SIZE);
    this.enrichVisible();
  }

  protected loadMore(): void {
    this.visibleCount.update((n) => n + PAGE_SIZE);
    this.enrichVisible();
  }

  protected clearFilters(): void {
    this.query.set('');
    this.typeFilter.set(null);
    this.typeMemberIds.set(null);
    this.genFilter.set(null);
    this.visibleCount.set(PAGE_SIZE);
    this.enrichVisible();
  }

  protected retry(): void {
    this.index.set([]);
    this.load();
  }

  /** Pull-to-refresh: drop the caches and re-fetch the dex index from the network. */
  protected refreshData(): void {
    this.visibleCount.set(PAGE_SIZE);
    this.api.refresh();
    this.load();
  }

  protected isFavorite(id: number): boolean {
    return this.favoriteIds().includes(id);
  }

  protected inTeam(id: number): boolean {
    return this.teamMembers().some((m) => m.id === id);
  }

  protected toggleFavorite(id: number): void {
    this.favorites.toggle(id);
  }

  protected toggleTeam(id: number): void {
    if (this.team.has(id)) {
      this.team.remove(id);
      return;
    }
    const mon = this.index().find((p) => p.id === id);
    if (!mon) {
      return;
    }
    if (mon.types.length === 0) {
      this.api
        .enrichTypes([mon])
        .pipe(takeUntil(this.destroyed$))
        .subscribe(([enriched]) => {
          this.mergeIntoIndex([enriched]);
          this.team.add({
            id: enriched.id,
            name: enriched.name,
            sprite: enriched.sprite,
            types: enriched.types,
          });
        });
      return;
    }
    this.team.add({ id: mon.id, name: mon.name, sprite: mon.sprite, types: mon.types });
  }
}
