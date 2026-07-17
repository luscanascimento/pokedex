import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
export class Dex {
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

  /** Type filter requires enriched types. */
  protected readonly filtered = computed(() => {
    const type = this.typeFilter();
    const base = this.filteredBase();
    if (!type) {
      return base;
    }
    return base.filter((p) => p.types.includes(type));
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

  /** Enrich types for the visible slice so cards render colors + can be filtered. */
  private enrichVisible(): void {
    const slice = this.filteredBase().slice(0, this.visibleCount());
    const pending = slice.filter((s) => s.types.length === 0);
    if (pending.length === 0) {
      return;
    }
    this.api
      .enrichTypes(pending)
      .pipe(
        catchError(() => of(pending)),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => this.index.update((list) => [...list]));
  }

  /** Enrich the full filtered base — needed when a type filter is active. */
  private enrichAll(): void {
    const base = this.filteredBase();
    this.api
      .enrichTypes(base)
      .pipe(
        catchError(() => of(base)),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => this.index.update((list) => [...list]));
  }

  protected onSearch(value: string): void {
    this.query.set(value);
    this.visibleCount.set(PAGE_SIZE);
    if (this.typeFilter()) {
      this.enrichAll();
    } else {
      this.enrichVisible();
    }
  }

  protected setType(type: PokemonTypeName | null): void {
    this.typeFilter.set(this.typeFilter() === type ? null : type);
    this.visibleCount.set(PAGE_SIZE);
    if (this.typeFilter()) {
      this.enrichAll();
    } else {
      this.enrichVisible();
    }
  }

  protected setGen(gen: number | null): void {
    this.genFilter.set(this.genFilter() === gen ? null : gen);
    this.visibleCount.set(PAGE_SIZE);
    if (this.typeFilter()) {
      this.enrichAll();
    } else {
      this.enrichVisible();
    }
  }

  protected loadMore(): void {
    this.visibleCount.update((n) => n + PAGE_SIZE);
    this.enrichVisible();
  }

  protected clearFilters(): void {
    this.query.set('');
    this.typeFilter.set(null);
    this.genFilter.set(null);
    this.visibleCount.set(PAGE_SIZE);
    this.enrichVisible();
  }

  protected retry(): void {
    this.index.set([]);
    this.load();
  }

  /** Pull-to-refresh: re-fetch the dex index from the network. */
  protected refreshData(): void {
    this.visibleCount.set(PAGE_SIZE);
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
        .subscribe(() =>
          this.team.add({ id: mon.id, name: mon.name, sprite: mon.sprite, types: mon.types }),
        );
      return;
    }
    this.team.add({ id: mon.id, name: mon.name, sprite: mon.sprite, types: mon.types });
  }
}
