import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites.service';
import { TeamService } from '../../core/services/team.service';
import { NATIONAL_DEX_MAX } from '../../core/data/generations';

interface FeatureCard {
  route: string;
  eyebrow: string;
  title: string;
  copy: string;
  accent: string;
}

@Component({
  selector: 'pa-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly favorites = inject(FavoritesService);
  private readonly team = inject(TeamService);

  protected readonly dexMax = NATIONAL_DEX_MAX;
  protected readonly favCount = this.favorites.count;
  protected readonly teamCount = this.team.count;

  protected readonly features: FeatureCard[] = [
    {
      route: '/dex',
      eyebrow: 'Explore',
      title: 'Full Pokedex',
      copy: 'Search, filter by type and generation, and browse every species with type-colored, virtualized cards.',
      accent: 'var(--type-water)',
    },
    {
      route: '/matchup',
      eyebrow: 'Analyze',
      title: 'Matchup Lab',
      copy: 'Compute offensive and defensive type effectiveness for any Pokemon or custom type combination.',
      accent: 'var(--type-fire)',
    },
    {
      route: '/team',
      eyebrow: 'Build',
      title: 'Team Builder',
      copy: 'Assemble up to six Pokemon and get automatic weakness and coverage analysis for the whole squad.',
      accent: 'var(--type-electric)',
    },
  ];
}
