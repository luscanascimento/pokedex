import { Injectable } from '@angular/core';
import { PokemonTypeName } from '../models/pokemon.model';
import { ALL_TYPES, defensiveMultiplier, effectiveness } from '../data/type-chart';

export interface EffectivenessBucket {
  multiplier: number;
  types: PokemonTypeName[];
}

export interface DefensiveProfile {
  weaknesses: EffectivenessBucket[]; // multiplier > 1
  resistances: EffectivenessBucket[]; // 0 < multiplier < 1
  immunities: PokemonTypeName[]; // multiplier == 0
}

export interface OffensiveProfile {
  /** For each of the mon's own types used offensively, what it hits hard. */
  superEffective: PokemonTypeName[];
  notVeryEffective: PokemonTypeName[];
  noEffect: PokemonTypeName[];
}

@Injectable({ providedIn: 'root' })
export class MatchupService {
  /**
   * Defensive profile: how a Pokemon (or type combo) fares when *attacked*
   * by every other type. Buckets grouped by multiplier for a clean chart.
   */
  defensiveProfile(defenderTypes: PokemonTypeName[]): DefensiveProfile {
    const weakMap = new Map<number, PokemonTypeName[]>();
    const resistMap = new Map<number, PokemonTypeName[]>();
    const immunities: PokemonTypeName[] = [];

    for (const atk of ALL_TYPES) {
      const mult = defensiveMultiplier(atk, defenderTypes);
      if (mult === 0) {
        immunities.push(atk);
      } else if (mult > 1) {
        this.push(weakMap, mult, atk);
      } else if (mult < 1) {
        this.push(resistMap, mult, atk);
      }
    }

    return {
      weaknesses: this.toBuckets(weakMap, 'desc'),
      resistances: this.toBuckets(resistMap, 'asc'),
      immunities,
    };
  }

  /**
   * Offensive profile: combining the attacker's STAB types, which defending
   * types get hit for >1x (best of its types), which resist, which are immune.
   */
  offensiveProfile(attackerTypes: PokemonTypeName[]): OffensiveProfile {
    const superEffective: PokemonTypeName[] = [];
    const notVeryEffective: PokemonTypeName[] = [];
    const noEffect: PokemonTypeName[] = [];

    for (const def of ALL_TYPES) {
      const best = Math.max(...attackerTypes.map((atk) => effectiveness(atk, def)));
      if (best > 1) {
        superEffective.push(def);
      } else if (best === 0) {
        noEffect.push(def);
      } else if (best < 1) {
        notVeryEffective.push(def);
      }
    }

    return { superEffective, notVeryEffective, noEffect };
  }

  private push(map: Map<number, PokemonTypeName[]>, mult: number, type: PokemonTypeName): void {
    const arr = map.get(mult) ?? [];
    arr.push(type);
    map.set(mult, arr);
  }

  private toBuckets(
    map: Map<number, PokemonTypeName[]>,
    dir: 'asc' | 'desc',
  ): EffectivenessBucket[] {
    return [...map.entries()]
      .map(([multiplier, types]) => ({ multiplier, types: types.sort() }))
      .sort((a, b) => (dir === 'desc' ? b.multiplier - a.multiplier : a.multiplier - b.multiplier));
  }
}
