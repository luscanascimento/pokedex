import { Injectable } from '@angular/core';
import { PokemonTypeName } from '../models/pokemon.model';
import { defensiveMultiplier } from '../data/type-chart';
import { LeaderBattle, LeaderPokemon, REGION_ROSTERS } from '../data/gym-leaders';
import { TeamMember } from './team.service';

/** How a single enemy Pokemon matches up against the user's team. */
export interface MonReadiness {
  name: string;
  dexId: number;
  types: PokemonTypeName[];
  /** The team can hit this mon super-effectively (offensive answer). */
  covered: boolean;
  /** This mon threatens the team — its STAB hits at least half the squad >= 2x. */
  threat: boolean;
}

/** Readiness for one leader / Elite Four / champion battle. */
export interface BattleReadiness {
  leader: string;
  role: LeaderBattle['role'];
  label: string;
  specialtyType?: PokemonTypeName;
  team: MonReadiness[];
  /** 0-100 balanced score for this single battle. */
  score: number;
}

/** Readiness for a whole region (gyms + league combined). */
export interface RegionReadiness {
  gen: number;
  region: string;
  version: string;
  notes?: string;
  /** 0-100 balanced (offense + defense) score. Higher = easier for the team. */
  score: number;
  /** 0-100 — share of enemy mons the team can hit super-effectively. */
  offense: number;
  /** 0-100 — share of enemy mons that do NOT threaten the team. */
  defense: number;
  totalMons: number;
  coveredMons: number;
  threatMons: number;
  battles: BattleReadiness[];
  /** The single toughest battle in the region (lowest score). */
  hardestBattle: BattleReadiness | null;
}

@Injectable({ providedIn: 'root' })
export class RegionReadinessService {
  /**
   * Rank all nine regions by how ready `team` is for their gyms + league.
   * Returned sorted strongest (highest score) → weakest (lowest score).
   */
  rankRegions(team: TeamMember[]): RegionReadiness[] {
    if (team.length === 0) {
      return [];
    }
    return REGION_ROSTERS.map((region) => this.analyzeRegion(region, team)).sort(
      (a, b) => b.score - a.score || a.gen - b.gen,
    );
  }

  private analyzeRegion(
    region: (typeof REGION_ROSTERS)[number],
    team: TeamMember[],
  ): RegionReadiness {
    const battles = region.battles.map((b) => this.analyzeBattle(b, team));

    let totalMons = 0;
    let coveredMons = 0;
    let threatMons = 0;
    for (const battle of battles) {
      for (const mon of battle.team) {
        totalMons++;
        if (mon.covered) coveredMons++;
        if (mon.threat) threatMons++;
      }
    }

    const offense = totalMons ? (coveredMons / totalMons) * 100 : 0;
    const defense = totalMons ? ((totalMons - threatMons) / totalMons) * 100 : 0;
    const score = (offense + defense) / 2;

    const hardestBattle =
      battles.length > 0 ? battles.reduce((worst, b) => (b.score < worst.score ? b : worst)) : null;

    return {
      gen: region.gen,
      region: region.region,
      version: region.version,
      notes: region.notes,
      score,
      offense,
      defense,
      totalMons,
      coveredMons,
      threatMons,
      battles,
      hardestBattle,
    };
  }

  private analyzeBattle(battle: LeaderBattle, team: TeamMember[]): BattleReadiness {
    const mons = battle.team.map((mon) => this.analyzeMon(mon, team));
    const total = mons.length;
    const covered = mons.filter((m) => m.covered).length;
    const safe = mons.filter((m) => !m.threat).length;
    const score = total ? ((covered / total) * 100 + (safe / total) * 100) / 2 : 0;

    return {
      leader: battle.leader,
      role: battle.role,
      label: battle.label,
      specialtyType: battle.specialtyType,
      team: mons,
      score,
    };
  }

  private analyzeMon(mon: LeaderPokemon, team: TeamMember[]): MonReadiness {
    // Offensive: any of my members' STAB types hits this mon > 1x.
    const covered = team.some((member) =>
      member.types.some((atk) => defensiveMultiplier(atk, mon.types) > 1),
    );

    // Defensive: this mon's STAB threatens the team if one of its types hits
    // at least half the squad for >= 2x.
    const threshold = Math.ceil(team.length / 2);
    const threat = mon.types.some((atk) => {
      const hits = team.filter((member) => defensiveMultiplier(atk, member.types) >= 2).length;
      return hits >= threshold;
    });

    return { name: mon.name, dexId: mon.dexId, types: mon.types, covered, threat };
  }
}
