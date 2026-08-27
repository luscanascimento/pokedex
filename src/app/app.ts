import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ThemeService } from './core/services/theme.service';
import { FavoritesService } from './core/services/favorites.service';
import { TeamService } from './core/services/team.service';

/** Icon keys map to inline SVGs rendered by the template. */
type NavIcon = 'home' | 'dex' | 'matchup' | 'team' | 'favorites';

interface NavItem {
  path: string;
  label: string;
  /** Compact label used by the mobile bottom tab bar. */
  shortLabel: string;
  icon: NavIcon;
  /** When true the router treats this as the exact home route for active state. */
  exact?: boolean;
  badge?: () => number;
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly theme = inject(ThemeService);
  private readonly favorites = inject(FavoritesService);
  private readonly team = inject(TeamService);
  private readonly swUpdate = inject(SwUpdate, { optional: true });

  protected readonly mode = this.theme.mode;
  protected readonly updateReady = signal(false);

  /** Desktop primary nav (header). Excludes Home — the brand doubles as the home link. */
  protected readonly nav: NavItem[] = [
    { path: '/dex', label: 'Pokedex', shortLabel: 'Dex', icon: 'dex' },
    { path: '/matchup', label: 'Matchup Lab', shortLabel: 'Matchup', icon: 'matchup' },
    {
      path: '/team',
      label: 'Team Builder',
      shortLabel: 'Team',
      icon: 'team',
      badge: () => this.team.count(),
    },
    {
      path: '/favorites',
      label: 'Favorites',
      shortLabel: 'Faves',
      icon: 'favorites',
      badge: () => this.favorites.count(),
    },
  ];

  /** Mobile bottom tab bar — includes Home so every top-level view is one tap away. */
  protected readonly bottomNav: NavItem[] = [
    { path: '/', label: 'Home', shortLabel: 'Home', icon: 'home', exact: true },
    ...this.nav,
  ];

  protected readonly year = new Date().getFullYear();

  constructor() {
    if (this.swUpdate?.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(
          filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'),
          takeUntilDestroyed(),
        )
        .subscribe(() => this.updateReady.set(true));
    }
  }

  protected toggleTheme(): void {
    this.theme.toggle();
  }

  protected reload(): void {
    document.location.reload();
  }
}
