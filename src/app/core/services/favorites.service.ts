import { Injectable, computed, effect, signal } from '@angular/core';
import { readJson, writeJson } from './storage';

const KEY = 'poke-arena:favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly _ids = signal<number[]>(readJson<number[]>(KEY, []));

  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().length);
  private readonly set = computed(() => new Set(this._ids()));

  constructor() {
    effect(() => writeJson(KEY, this._ids()));
  }

  isFavorite(id: number): boolean {
    return this.set().has(id);
  }

  toggle(id: number): void {
    this._ids.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  clear(): void {
    this._ids.set([]);
  }
}
