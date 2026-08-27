import { Injectable, computed, effect, signal } from '@angular/core';
import { PokemonTypeName } from '../models/pokemon.model';
import { ALL_TYPES, defensiveMultiplier } from '../data/type-chart';
import { readJson, writeJson } from './storage';

const KEY = 'poke-arena:team';
export const MAX_TEAM = 6;

export interface TeamMember {
  id: number;
  name: string;
  sprite: string;
  types: PokemonTypeName[];
}

export interface TypeThreat {
  type: PokemonTypeName;
  /** number of team members hit super-effectively (>= 2x). */
  weakCount: number;
  /** number of team members that resist / are immune (<= 0.5x). */
  resistCount: number;
}

export interface TeamAnalysis {
  threats: TypeThreat[]; // sorted worst-first
  uncovered: PokemonTypeName[]; // no member resists these
  resisted: TypeThreat[]; // types the team handles well
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly _members = signal<TeamMember[]>(readJson<TeamMember[]>(KEY, []));
  readonly members = this._members.asReadonly();
  readonly count = computed(() => this._members().length);
  readonly isFull = computed(() => this._members().length >= MAX_TEAM);

  constructor() {
    effect(() => writeJson(KEY, this._members()));
  }

  has(id: number): boolean {
    return this._members().some((m) => m.id === id);
  }

  add(member: TeamMember): boolean {
    if (this.isFull() || this.has(member.id)) {
      return false;
    }
    this._members.update((list) => [...list, member]);
    return true;
  }

  remove(id: number): void {
    this._members.update((list) => list.filter((m) => m.id !== id));
  }

  clear(): void {
    this._members.set([]);
  }

  /** Reactive full-team defensive analysis across all 18 attacking types. */
  readonly analysis = computed<TeamAnalysis>(() => {
    const team = this._members();
    if (team.length === 0) {
      return { threats: [], uncovered: [], resisted: [] };
    }

    const rows: TypeThreat[] = ALL_TYPES.map((atk) => {
      let weakCount = 0;
      let resistCount = 0;
      for (const member of team) {
        const mult = defensiveMultiplier(atk, member.types);
        if (mult >= 2) {
          weakCount++;
        } else if (mult <= 0.5) {
          resistCount++;
        }
      }
      return { type: atk, weakCount, resistCount };
    });

    const threats = rows
      .filter((r) => r.weakCount > 0)
      .sort((a, b) => b.weakCount - a.weakCount || a.type.localeCompare(b.type));

    const uncovered = rows.filter((r) => r.resistCount === 0 && r.weakCount > 0).map((r) => r.type);

    const resisted = rows
      .filter((r) => r.resistCount > 0)
      .sort((a, b) => b.resistCount - a.resistCount || a.type.localeCompare(b.type));

    return { threats, uncovered, resisted };
  });
}
