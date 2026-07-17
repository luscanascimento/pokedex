import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { TeamService } from '../../core/services/team.service';
import { EvolutionStage, PokemonDetail } from '../../core/models/pokemon.model';
import { TypeBadge } from '../../shared/ui/type-badge/type-badge';
import { SpriteImage } from '../../shared/ui/sprite-image/sprite-image';
import { Loader } from '../../shared/ui/loader/loader';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { EffectivenessPanel } from '../../shared/ui/effectiveness-panel/effectiveness-panel';
import { DexNumberPipe } from '../../shared/pipes/dex-number.pipe';
import { DisplayNamePipe } from '../../shared/pipes/title-case-name.pipe';
import { GENERATIONS } from '../../core/data/generations';

type LoadState = 'loading' | 'ready' | 'error';

const MAX_STAT = 255;

@Component({
  selector: 'pa-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TypeBadge,
    SpriteImage,
    Loader,
    EmptyState,
    EffectivenessPanel,
    DexNumberPipe,
    DisplayNamePipe,
  ],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class Detail {
  private readonly api = inject(PokeApiService);
  private readonly favorites = inject(FavoritesService);
  private readonly team = inject(TeamService);

  /** Bound from the route via withComponentInputBinding. */
  readonly id = input.required<string>();

  protected readonly state = signal<LoadState>('loading');
  protected readonly shiny = signal(false);
  protected readonly evolutions = signal<EvolutionStage[]>([]);
  protected readonly evoState = signal<LoadState>('loading');

  private readonly detail$ = toObservable(this.id).pipe(
    tap(() => {
      this.state.set('loading');
      this.shiny.set(false);
      this.evoState.set('loading');
      this.evolutions.set([]);
    }),
    switchMap((id) =>
      this.api.getDetail(id).pipe(
        tap((d) => {
          this.state.set('ready');
          this.loadEvolutions(d);
        }),
        catchError(() => {
          this.state.set('error');
          return of<PokemonDetail | null>(null);
        }),
      ),
    ),
  );

  protected readonly detail = toSignal(this.detail$, { initialValue: null });

  protected readonly favoriteIds = this.favorites.ids;
  protected readonly teamMembers = this.team.members;

  protected readonly generationLabel = computed(() => {
    const d = this.detail();
    if (!d) {
      return '';
    }
    const g = GENERATIONS.find((gen) => gen.gen === d.generation);
    return g ? `${g.label} · ${g.region}` : 'Unknown region';
  });

  protected readonly currentSprite = computed(() => {
    const d = this.detail();
    if (!d) {
      return '';
    }
    return this.shiny() ? d.sprites.artworkShiny : d.sprites.artwork;
  });

  protected readonly isFavorite = computed(() => {
    const d = this.detail();
    return d ? this.favoriteIds().includes(d.id) : false;
  });

  protected readonly inTeam = computed(() => {
    const d = this.detail();
    return d ? this.teamMembers().some((m) => m.id === d.id) : false;
  });

  private loadEvolutions(detail: PokemonDetail): void {
    this.evoState.set('loading');
    this.api
      .getEvolutionChain(detail.speciesUrl)
      .pipe(
        catchError(() => {
          this.evoState.set('error');
          return of<EvolutionStage[]>([]);
        }),
      )
      .subscribe((stages) => {
        this.evolutions.set(stages);
        this.evoState.set('ready');
      });
  }

  protected statPercent(value: number): number {
    return Math.min(100, Math.round((value / MAX_STAT) * 100));
  }

  protected statTier(value: number): string {
    if (value >= 120) {
      return 'high';
    }
    if (value >= 70) {
      return 'mid';
    }
    return 'low';
  }

  protected toggleShiny(): void {
    this.shiny.update((v) => !v);
  }

  protected toggleFavorite(): void {
    const d = this.detail();
    if (d) {
      this.favorites.toggle(d.id);
    }
  }

  protected toggleTeam(): void {
    const d = this.detail();
    if (!d) {
      return;
    }
    if (this.team.has(d.id)) {
      this.team.remove(d.id);
    } else {
      this.team.add({ id: d.id, name: d.name, sprite: d.sprites.artwork, types: d.types });
    }
  }
}
