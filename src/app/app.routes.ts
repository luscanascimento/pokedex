import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'Poke Arena — Pokedex & Battle Lab',
  },
  {
    path: 'dex',
    loadComponent: () => import('./features/dex/dex').then((m) => m.Dex),
    title: 'Pokedex — Poke Arena',
  },
  {
    path: 'pokemon/:id',
    loadComponent: () => import('./features/detail/detail').then((m) => m.Detail),
    title: 'Pokemon — Poke Arena',
  },
  {
    path: 'matchup',
    loadComponent: () => import('./features/matchup/matchup').then((m) => m.Matchup),
    title: 'Matchup Lab — Poke Arena',
  },
  {
    path: 'team',
    loadComponent: () => import('./features/team/team').then((m) => m.Team),
    title: 'Team Builder — Poke Arena',
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites').then((m) => m.Favorites),
    title: 'Favorites — Poke Arena',
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
    title: 'Not found — Poke Arena',
  },
];
