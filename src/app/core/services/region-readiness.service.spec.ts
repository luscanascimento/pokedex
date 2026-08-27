import { RegionReadinessService } from './region-readiness.service';
import { TeamMember } from './team.service';
import { PokemonTypeName } from '../models/pokemon.model';
import { REGION_ROSTERS } from '../data/gym-leaders';

function member(id: number, name: string, ...types: PokemonTypeName[]): TeamMember {
  return { id, name, sprite: `${id}.png`, types };
}

describe('RegionReadinessService', () => {
  // No Angular dependencies — plain instantiation is enough.
  const service = new RegionReadinessService();

  it('returns an empty ranking for an empty team', () => {
    expect(service.rankRegions([])).toEqual([]);
  });

  // The README quotes these totals. Keep them in step with the data.
  it('carries the roster totals the README advertises', () => {
    const battles = REGION_ROSTERS.flatMap((r) => r.battles);
    const byRole = (role: string) => battles.filter((b) => b.role === role).length;

    expect(REGION_ROSTERS.length).toBe(9);
    expect(battles.length).toBe(109);
    expect(byRole('gym')).toBe(68);
    expect(byRole('elite-four')).toBe(32);
    expect(byRole('champion')).toBe(9);
    expect(battles.reduce((n, b) => n + b.team.length, 0)).toBe(428);
  });

  describe('with a real team', () => {
    const team = [
      member(6, 'Charizard', 'fire', 'flying'),
      member(9, 'Blastoise', 'water'),
      member(3, 'Venusaur', 'grass', 'poison'),
    ];
    const ranked = service.rankRegions(team);

    it('scores every region exactly once', () => {
      expect(ranked.length).toBe(REGION_ROSTERS.length);
      expect(new Set(ranked.map((r) => r.region)).size).toBe(REGION_ROSTERS.length);
    });

    it('sorts strongest-first by score', () => {
      for (let i = 1; i < ranked.length; i++) {
        expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
      }
    });

    it('keeps every score inside 0-100', () => {
      for (const region of ranked) {
        expect(region.score).toBeGreaterThanOrEqual(0);
        expect(region.score).toBeLessThanOrEqual(100);
        expect(region.offense).toBeGreaterThanOrEqual(0);
        expect(region.offense).toBeLessThanOrEqual(100);
        expect(region.defense).toBeGreaterThanOrEqual(0);
        expect(region.defense).toBeLessThanOrEqual(100);
      }
    });

    it('derives the region score as the mean of offense and defense', () => {
      for (const region of ranked) {
        expect(region.score).toBeCloseTo((region.offense + region.defense) / 2, 10);
      }
    });

    it('keeps the counts consistent with the battle breakdown', () => {
      for (const region of ranked) {
        const mons = region.battles.flatMap((b) => b.team);
        expect(region.totalMons).toBe(mons.length);
        expect(region.coveredMons).toBe(mons.filter((m) => m.covered).length);
        expect(region.threatMons).toBe(mons.filter((m) => m.threat).length);
        expect(region.offense).toBeCloseTo((region.coveredMons / region.totalMons) * 100, 10);
      }
    });

    it('identifies the hardest battle as the lowest-scoring one in the region', () => {
      for (const region of ranked) {
        expect(region.hardestBattle).not.toBeNull();
        const min = Math.min(...region.battles.map((b) => b.score));
        expect(region.hardestBattle!.score).toBe(min);
        expect(region.battles).toContain(region.hardestBattle!);
      }
    });

    it('carries the curated roster metadata through untouched', () => {
      const kanto = ranked.find((r) => r.region === 'Kanto')!;
      expect(kanto.gen).toBe(1);
      expect(kanto.version).toBe('FireRed/LeafGreen');
      expect(kanto.notes).toBeTruthy();
      expect(kanto.battles.length).toBeGreaterThan(8);
      expect(kanto.battles[0].leader).toBe('Brock');
      expect(kanto.battles[0].specialtyType).toBe('rock');
    });
  });

  describe('coverage and threat flags', () => {
    it('marks a mon covered when the team has a super-effective STAB and safe otherwise', () => {
      // Blastoise (pure Water) vs Brock's Rock/Ground squad: Water is 4x on them,
      // and their Rock/Ground STAB is neutral-or-worse on Water.
      const brock = service
        .rankRegions([member(9, 'Blastoise', 'water')])
        .find((r) => r.region === 'Kanto')!
        .battles.find((b) => b.leader === 'Brock')!;

      expect(brock.team.every((m) => m.covered)).toBeTrue();
      expect(brock.team.every((m) => !m.threat)).toBeTrue();
      expect(brock.score).toBe(100);
    });

    it('marks a mon as a threat when its STAB hits half the squad for 2x', () => {
      // A pure-Electric solo squad is 2x to Brock's Ground STAB and cannot hit
      // Rock/Ground for more than 1x.
      const brock = service
        .rankRegions([member(26, 'Raichu', 'electric')])
        .find((r) => r.region === 'Kanto')!
        .battles.find((b) => b.leader === 'Brock')!;

      expect(brock.team.some((m) => m.threat)).toBeTrue();
      expect(brock.team.every((m) => !m.covered)).toBeTrue();
      expect(brock.score).toBeLessThan(50);
    });

    it('ranks a broad team above a single type-disadvantaged mon', () => {
      const broad = service.rankRegions([
        member(6, 'Charizard', 'fire', 'flying'),
        member(9, 'Blastoise', 'water'),
        member(3, 'Venusaur', 'grass', 'poison'),
        member(94, 'Gengar', 'ghost', 'poison'),
        member(143, 'Snorlax', 'normal'),
        member(149, 'Dragonite', 'dragon', 'flying'),
      ]);
      const narrow = service.rankRegions([member(129, 'Magikarp', 'water')]);

      expect(broad[0].score).toBeGreaterThan(narrow[0].score);
      expect(broad[0].offense).toBeGreaterThan(narrow[0].offense);
    });
  });
});
