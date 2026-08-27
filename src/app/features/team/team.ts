import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, catchError, of, takeUntil } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { TeamService, MAX_TEAM } from '../../core/services/team.service';
import {
  RegionReadinessService,
  BattleReadiness,
} from '../../core/services/region-readiness.service';
import { leaderSprite, BattleRole } from '../../core/data/gym-leaders';
import { PokemonSummary } from '../../core/models/pokemon.model';
import { TypeBadge } from '../../shared/ui/type-badge/type-badge';
import { SpriteImage } from '../../shared/ui/sprite-image/sprite-image';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { DisplayNamePipe } from '../../shared/pipes/title-case-name.pipe';
import { DexNumberPipe } from '../../shared/pipes/dex-number.pipe';

@Component({
  selector: 'pa-team',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TypeBadge,
    SpriteImage,
    EmptyState,
    DisplayNamePipe,
    DexNumberPipe,
    DecimalPipe,
  ],
  templateUrl: './team.html',
  styleUrl: './team.scss',
})
export class Team implements OnDestroy {
  private readonly api = inject(PokeApiService);
  private readonly team = inject(TeamService);
  private readonly readiness = inject(RegionReadinessService);
  private readonly destroyed$ = new Subject<void>();

  protected readonly maxTeam = MAX_TEAM;
  protected readonly members = this.team.members;
  protected readonly count = this.team.count;
  protected readonly isFull = this.team.isFull;
  protected readonly analysis = this.team.analysis;

  // Region readiness — how the squad fares against every region's gyms + league.
  protected readonly sprite = leaderSprite;
  protected readonly regions = computed(() => this.readiness.rankRegions(this.members()));
  protected readonly strongest = computed(() => this.regions()[0] ?? null);
  protected readonly weakest = computed(() => {
    const ranked = this.regions();
    return ranked.length ? ranked[ranked.length - 1] : null;
  });
  private readonly expanded = signal<number | null>(null);

  protected isExpanded(gen: number): boolean {
    return this.expanded() === gen;
  }

  protected toggleRegion(gen: number): void {
    this.expanded.update((current) => (current === gen ? null : gen));
  }

  protected scoreLevel(score: number): string {
    if (score >= 66) {
      return 'strong';
    }
    if (score >= 45) {
      return 'even';
    }
    return 'weak';
  }

  protected roleLabel(role: BattleRole): string {
    switch (role) {
      case 'gym':
        return 'Gym';
      case 'elite-four':
        return 'Elite Four';
      case 'champion':
        return 'Champion';
    }
  }

  protected battleKey(battle: BattleReadiness): string {
    return `${battle.role}-${battle.leader}-${battle.label}`;
  }

  protected readonly slots = computed(() => {
    const filled = this.members();
    const empty = Math.max(0, MAX_TEAM - filled.length);
    return { filled, empty: Array.from({ length: empty }) };
  });

  // Add flow
  private readonly index = signal<PokemonSummary[]>([]);
  protected readonly query = signal('');
  protected readonly adding = signal(false);

  protected readonly suggestions = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (q.length < 2) {
      return [];
    }
    const inTeam = new Set(this.members().map((m) => m.id));
    return this.index()
      .filter((p) => (p.name.includes(q) || String(p.id) === q) && !inTeam.has(p.id))
      .slice(0, 8);
  });

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

  protected onSearch(value: string): void {
    this.query.set(value);
  }

  protected add(summary: PokemonSummary): void {
    if (this.isFull()) {
      return;
    }
    this.query.set('');
    this.adding.set(true);
    this.api
      .enrichTypes([summary])
      .pipe(
        catchError(() => of([summary])),
        takeUntil(this.destroyed$),
      )
      .subscribe(([enriched]) => {
        this.team.add({
          id: enriched.id,
          name: enriched.name,
          sprite: enriched.sprite,
          types: enriched.types,
        });
        this.adding.set(false);
      });
  }

  protected remove(id: number): void {
    this.team.remove(id);
  }

  protected clear(): void {
    this.team.clear();
  }

  protected threatLevel(weakCount: number): string {
    if (weakCount >= 3) {
      return 'critical';
    }
    if (weakCount === 2) {
      return 'high';
    }
    return 'low';
  }
}
