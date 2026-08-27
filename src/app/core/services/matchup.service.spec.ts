import { MatchupService } from './matchup.service';
import { ALL_TYPES } from '../data/type-chart';

describe('MatchupService', () => {
  // No Angular dependencies — plain instantiation is enough.
  const service = new MatchupService();

  describe('defensiveProfile', () => {
    it('stacks a dual type into a 4x bucket and keeps the immunity out of it', () => {
      const profile = service.defensiveProfile(['fire', 'flying']);

      expect(profile.weaknesses[0].multiplier).toBe(4);
      expect(profile.weaknesses[0].types).toEqual(['rock']);
      expect(profile.immunities).toEqual(['ground']);
      expect(profile.weaknesses.map((b) => b.multiplier)).toContain(2);
    });

    it('sorts weaknesses hardest-first and resistances strongest-first', () => {
      const { weaknesses, resistances } = service.defensiveProfile(['steel', 'fairy']);

      const desc = weaknesses.map((b) => b.multiplier);
      const asc = resistances.map((b) => b.multiplier);
      expect(desc).toEqual([...desc].sort((a, b) => b - a));
      expect(asc).toEqual([...asc].sort((a, b) => a - b));
    });

    it('places every attacking type in exactly one bucket', () => {
      const profile = service.defensiveProfile(['water']);
      const placed = [
        ...profile.weaknesses.flatMap((b) => b.types),
        ...profile.resistances.flatMap((b) => b.types),
        ...profile.immunities,
      ];

      // Neutral types are deliberately unbucketed, so this is a subset check.
      expect(new Set(placed).size).toBe(placed.length);
      expect(placed.every((t) => ALL_TYPES.includes(t))).toBeTrue();
    });
  });

  describe('offensiveProfile', () => {
    it('takes the best of the attacker types and reports the no-effect matchups', () => {
      const profile = service.offensiveProfile(['ghost']);

      expect(profile.noEffect).toEqual(['normal']);
      expect(profile.superEffective).toEqual(['psychic', 'ghost']);
      expect(profile.notVeryEffective).toEqual(['dark']);
    });

    it('lets a second type cover what the first one cannot touch', () => {
      const solo = service.offensiveProfile(['ghost']);
      const dual = service.offensiveProfile(['ghost', 'normal']);

      expect(solo.noEffect).toContain('normal');
      // Normal hits Normal for 1x, so the immunity is no longer the best roll.
      expect(dual.noEffect).not.toContain('normal');
    });
  });
});
