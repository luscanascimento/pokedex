import { ALL_TYPES, defensiveMultiplier, effectiveness } from './type-chart';

describe('type-chart', () => {
  describe('effectiveness (single attacker vs single defender)', () => {
    it('handles the three canonical immunities', () => {
      expect(effectiveness('ground', 'flying')).toBe(0);
      expect(effectiveness('normal', 'ghost')).toBe(0);
      expect(effectiveness('ghost', 'normal')).toBe(0);
      expect(effectiveness('electric', 'ground')).toBe(0);
      expect(effectiveness('psychic', 'dark')).toBe(0);
      expect(effectiveness('poison', 'steel')).toBe(0);
      expect(effectiveness('dragon', 'fairy')).toBe(0);
    });

    it('returns 2 for super-effective pairs', () => {
      expect(effectiveness('water', 'fire')).toBe(2);
      expect(effectiveness('fire', 'grass')).toBe(2);
      expect(effectiveness('fighting', 'normal')).toBe(2);
      expect(effectiveness('fairy', 'dragon')).toBe(2);
    });

    it('returns 0.5 for resisted pairs', () => {
      expect(effectiveness('normal', 'rock')).toBe(0.5);
      expect(effectiveness('water', 'grass')).toBe(0.5);
      expect(effectiveness('steel', 'fire')).toBe(0.5);
    });

    it('defaults to 1 for neutral pairs not listed in the chart', () => {
      expect(effectiveness('normal', 'water')).toBe(1);
      expect(effectiveness('dragon', 'water')).toBe(1);
      expect(effectiveness('flying', 'normal')).toBe(1);
    });

    it('is not symmetric — attacking and defending are different roles', () => {
      expect(effectiveness('ground', 'flying')).toBe(0);
      expect(effectiveness('flying', 'ground')).toBe(1);
    });

    it('never produces a multiplier outside {0, 0.5, 1, 2}', () => {
      const seen = new Set<number>();
      for (const atk of ALL_TYPES) {
        for (const def of ALL_TYPES) {
          seen.add(effectiveness(atk, def));
        }
      }
      expect([...seen].sort((a, b) => a - b)).toEqual([0, 0.5, 1, 2]);
    });
  });

  describe('defensiveMultiplier (attacker vs a whole defending typing)', () => {
    it('stacks two weaknesses into 4x', () => {
      expect(defensiveMultiplier('water', ['fire', 'rock'])).toBe(4);
      expect(defensiveMultiplier('ice', ['ground', 'flying'])).toBe(4);
      expect(defensiveMultiplier('rock', ['fire', 'flying'])).toBe(4);
    });

    it('stacks two resistances into 0.25x', () => {
      expect(defensiveMultiplier('grass', ['fire', 'flying'])).toBe(0.25);
      expect(defensiveMultiplier('fire', ['fire', 'water'])).toBe(0.25);
    });

    it('cancels a weakness against a resistance back to 1x', () => {
      // Water: 2x on ground, 0.5x on grass.
      expect(defensiveMultiplier('water', ['ground', 'grass'])).toBe(1);
    });

    it('lets an immunity dominate the product', () => {
      // Gengar (ghost/poison): normal hits ghost for 0, poison is neutral.
      expect(defensiveMultiplier('normal', ['ghost', 'poison'])).toBe(0);
      // Gyarados (water/flying): ground is neutral on water but 0 on flying,
      // so the whole product collapses to 0.
      expect(defensiveMultiplier('ground', ['water', 'flying'])).toBe(0);
      expect(defensiveMultiplier('electric', ['water', 'flying'])).toBe(4);
    });

    it('matches effectiveness exactly for a single-type defender', () => {
      for (const atk of ALL_TYPES) {
        for (const def of ALL_TYPES) {
          expect(defensiveMultiplier(atk, [def]))
            .withContext(`${atk} -> ${def}`)
            .toBe(effectiveness(atk, def));
        }
      }
    });

    it('equals the product of the per-type effectiveness for a dual type', () => {
      expect(defensiveMultiplier('fighting', ['steel', 'rock'])).toBe(
        effectiveness('fighting', 'steel') * effectiveness('fighting', 'rock'),
      );
      expect(defensiveMultiplier('bug', ['dark', 'flying'])).toBe(
        effectiveness('bug', 'dark') * effectiveness('bug', 'flying'),
      );
    });

    it('is order-independent across the defending types', () => {
      expect(defensiveMultiplier('water', ['fire', 'rock'])).toBe(
        defensiveMultiplier('water', ['rock', 'fire']),
      );
      expect(defensiveMultiplier('ice', ['dragon', 'flying'])).toBe(
        defensiveMultiplier('ice', ['flying', 'dragon']),
      );
    });

    it('returns 1 for an empty defending typing (neutral identity)', () => {
      expect(defensiveMultiplier('fire', [])).toBe(1);
      expect(defensiveMultiplier('ghost', [])).toBe(1);
    });
  });

  describe('ALL_TYPES', () => {
    it('lists the 18 modern types exactly once each', () => {
      expect(ALL_TYPES.length).toBe(18);
      expect(new Set(ALL_TYPES).size).toBe(18);
      expect(ALL_TYPES).toContain('fairy');
      expect(ALL_TYPES).toContain('steel');
    });
  });
});
