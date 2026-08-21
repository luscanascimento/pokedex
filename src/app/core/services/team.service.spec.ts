import { TestBed } from '@angular/core/testing';

import { MAX_TEAM, TeamMember, TeamService } from './team.service';
import { PokemonTypeName } from '../models/pokemon.model';

function member(id: number, name: string, ...types: PokemonTypeName[]): TeamMember {
  return { id, name, sprite: `${id}.png`, types };
}

// Every one of these is 2x (or worse) to Ground.
const GROUND_WEAK = [
  member(26, 'Raichu', 'electric'),
  member(59, 'Arcanine', 'fire'),
  member(31, 'Nidoqueen', 'poison', 'ground'),
];

describe('TeamService', () => {
  let service: TeamService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamService);
    service.clear();
  });

  afterEach(() => localStorage.clear());

  describe('roster management', () => {
    it('starts empty', () => {
      expect(service.members()).toEqual([]);
      expect(service.count()).toBe(0);
      expect(service.isFull()).toBeFalse();
    });

    it('adds, reports membership and removes', () => {
      expect(service.add(member(25, 'Pikachu', 'electric'))).toBeTrue();
      expect(service.count()).toBe(1);
      expect(service.has(25)).toBeTrue();
      expect(service.has(26)).toBeFalse();

      service.remove(25);
      expect(service.count()).toBe(0);
      expect(service.has(25)).toBeFalse();
    });

    it('rejects duplicates and refuses to exceed MAX_TEAM', () => {
      expect(service.add(member(25, 'Pikachu', 'electric'))).toBeTrue();
      expect(service.add(member(25, 'Pikachu', 'electric'))).toBeFalse();
      expect(service.count()).toBe(1);

      for (let id = 100; id < 100 + MAX_TEAM; id++) {
        service.add(member(id, `mon-${id}`, 'normal'));
      }
      expect(service.count()).toBe(MAX_TEAM);
      expect(service.isFull()).toBeTrue();
      expect(service.add(member(999, 'Overflow', 'normal'))).toBeFalse();
      expect(service.count()).toBe(MAX_TEAM);
    });
  });

  describe('analysis', () => {
    it('returns empty buckets for an empty team', () => {
      const { threats, uncovered, resisted } = service.analysis();
      expect(threats).toEqual([]);
      expect(uncovered).toEqual([]);
      expect(resisted).toEqual([]);
    });

    it('flags Ground as the top threat and as uncovered when nothing resists it', () => {
      GROUND_WEAK.forEach((m) => service.add(m));
      const { threats, uncovered } = service.analysis();

      const ground = threats.find((t) => t.type === 'ground');
      expect(ground).toBeDefined();
      expect(ground!.weakCount).toBe(3);
      expect(ground!.resistCount).toBe(0);
      expect(threats[0].type).toBe('ground');
      expect(uncovered).toContain('ground');
    });

    it('drops a type out of uncovered once a member resists it', () => {
      GROUND_WEAK.forEach((m) => service.add(m));
      expect(service.analysis().uncovered).toContain('ground');

      // Skarmory (steel/flying) is immune to Ground.
      service.add(member(227, 'Skarmory', 'steel', 'flying'));
      const { threats, uncovered, resisted } = service.analysis();

      expect(uncovered).not.toContain('ground');
      const ground = threats.find((t) => t.type === 'ground')!;
      expect(ground.weakCount).toBe(3);
      expect(ground.resistCount).toBe(1);
      expect(resisted.some((r) => r.type === 'ground')).toBeTrue();
    });

    it('omits types that nobody is weak to from threats', () => {
      // Steelix (steel/ground) is immune to poison and electric.
      service.add(member(208, 'Steelix', 'steel', 'ground'));
      const { threats, uncovered, resisted } = service.analysis();

      expect(threats.some((t) => t.type === 'poison')).toBeFalse();
      expect(uncovered).not.toContain('poison');
      expect(resisted.some((r) => r.type === 'poison')).toBeTrue();
      expect(threats.some((t) => t.type === 'fire')).toBeTrue();
    });

    it('sorts threats worst-first', () => {
      GROUND_WEAK.forEach((m) => service.add(m));
      const { threats } = service.analysis();
      for (let i = 1; i < threats.length; i++) {
        expect(threats[i - 1].weakCount).toBeGreaterThanOrEqual(threats[i].weakCount);
      }
    });

    it('recomputes when the roster changes', () => {
      expect(service.analysis().threats.length).toBe(0);
      service.add(member(26, 'Raichu', 'electric'));
      expect(service.analysis().threats.length).toBeGreaterThan(0);
      service.clear();
      expect(service.analysis().threats.length).toBe(0);
    });
  });
});
