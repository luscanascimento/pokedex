import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, catchError, of, takeUntil } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { TeamService } from '../../core/services/team.service';
import { PokemonSummary } from '../../core/models/pokemon.model';
import { PokemonCard } from '../../shared/ui/pokemon-card/pokemon-card';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { Loader } from '../../shared/ui/loader/loader';

type LoadState = 'loading' | 'ready' | 'error';

@Component({
  selector: 'pa-favorites',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PokemonCard, EmptyState, Loader],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class Favorites {
  private readonly api = inject(PokeApiService);
  private readonly favorites = inject(FavoritesService);
  private readonly team = inject(TeamService);
  private readonly destroyed$ = new Subject<void>();

  protected readonly state = signal<LoadState>('loading');
  private readonly index = signal<PokemonSummary[]>([]);

  protected readonly favoriteIds = this.favorites.ids;
  protected readonly teamMembers = this.team.members;

  protected readonly favorites$ = computed(() => {
    const ids = new Set(this.favoriteIds());
    return this.index().filter((p) => ids.has(p.id));
  });

  constructor() {
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
        }
      });

    // Enrich types for favorites whenever the set changes.
    effect(() => {
      const favs = this.favorites$();
      const pending = favs.filter((p) => p.types.length === 0);
      if (pending.length > 0) {
        this.api
          .enrichTypes(pending)
          .pipe(
            catchError(() => of(pending)),
            takeUntil(this.destroyed$),
          )
          .subscribe(() => this.index.update((list) => [...list]));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
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
    if (mon) {
      this.team.add({ id: mon.id, name: mon.name, sprite: mon.sprite, types: mon.types });
    }
  }

  protected clearAll(): void {
    this.favorites.clear();
  }
}
