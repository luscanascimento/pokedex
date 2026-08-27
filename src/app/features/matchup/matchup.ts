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
import { PokemonSummary, PokemonTypeName } from '../../core/models/pokemon.model';
import { ALL_TYPES } from '../../core/data/type-chart';
import { TypeBadge } from '../../shared/ui/type-badge/type-badge';
import { SpriteImage } from '../../shared/ui/sprite-image/sprite-image';
import { EffectivenessPanel } from '../../shared/ui/effectiveness-panel/effectiveness-panel';
import { DisplayNamePipe } from '../../shared/pipes/title-case-name.pipe';
import { DexNumberPipe } from '../../shared/pipes/dex-number.pipe';

type Mode = 'types' | 'pokemon';

@Component({
  selector: 'pa-matchup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypeBadge, SpriteImage, EffectivenessPanel, DisplayNamePipe, DexNumberPipe],
  templateUrl: './matchup.html',
  styleUrl: './matchup.scss',
})
export class Matchup implements OnDestroy {
  private readonly api = inject(PokeApiService);
  private readonly destroyed$ = new Subject<void>();

  protected readonly allTypes = ALL_TYPES;
  protected readonly mode = signal<Mode>('types');

  // --- Type-combo builder ---
  protected readonly selectedTypes = signal<PokemonTypeName[]>(['fire']);

  // --- Pokemon picker ---
  private readonly index = signal<PokemonSummary[]>([]);
  protected readonly query = signal('');
  protected readonly picked = signal<PokemonSummary | null>(null);
  protected readonly pickedTypesLoading = signal(false);

  protected readonly suggestions = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (q.length < 2) {
      return [];
    }
    return this.index()
      .filter((p) => p.name.includes(q) || String(p.id) === q)
      .slice(0, 8);
  });

  /** The active types used for the effectiveness computation. */
  protected readonly activeTypes = computed<PokemonTypeName[]>(() => {
    if (this.mode() === 'pokemon') {
      return this.picked()?.types ?? [];
    }
    return this.selectedTypes();
  });

  protected readonly hasResult = computed(() => this.activeTypes().length > 0);

  constructor() {
    this.api
      .getDexIndex()
      .pipe(
        catchError(() => of<PokemonSummary[]>([])),
        takeUntil(this.destroyed$),
      )
      .subscribe((list) => this.index.set(list));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  protected setMode(mode: Mode): void {
    this.mode.set(mode);
  }

  protected toggleType(type: PokemonTypeName): void {
    this.selectedTypes.update((current) => {
      if (current.includes(type)) {
        return current.filter((t) => t !== type);
      }
      if (current.length >= 2) {
        // Replace the oldest to keep max 2 (dual typing).
        return [current[1], type];
      }
      return [...current, type];
    });
  }

  protected isSelected(type: PokemonTypeName): boolean {
    return this.selectedTypes().includes(type);
  }

  protected onSearch(value: string): void {
    this.query.set(value);
  }

  protected pick(summary: PokemonSummary): void {
    this.query.set('');
    if (summary.types.length > 0) {
      this.picked.set(summary);
      return;
    }
    this.pickedTypesLoading.set(true);
    this.api
      .enrichTypes([summary])
      .pipe(
        catchError(() => of([summary])),
        takeUntil(this.destroyed$),
      )
      .subscribe(([enriched]) => {
        this.picked.set(enriched);
        this.pickedTypesLoading.set(false);
      });
  }

  protected clearPick(): void {
    this.picked.set(null);
    this.query.set('');
  }
}
