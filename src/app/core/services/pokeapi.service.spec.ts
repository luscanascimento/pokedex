import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ENRICH_CONCURRENCY, PokeApiService } from './pokeapi.service';
import { PokemonSummary } from '../models/pokemon.model';

function summary(id: number): PokemonSummary {
  return { id, name: `mon-${id}`, types: [], sprite: `${id}.png`, generation: 1 };
}

/** Minimal RawPokemon shaped just enough for enrichTypes. */
function rawPokemon(id: number) {
  return {
    id,
    name: `mon-${id}`,
    types: [
      { slot: 2, type: { name: 'flying' } },
      { slot: 1, type: { name: 'fire' } },
    ],
  };
}

describe('PokeApiService', () => {
  let service: PokeApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PokeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('enrichTypes', () => {
    it('never keeps more than ENRICH_CONCURRENCY requests in flight', () => {
      const summaries = Array.from({ length: 40 }, (_, i) => summary(i + 1));
      let done = false;
      service.enrichTypes(summaries).subscribe(() => (done = true));

      // Drain the queue one wave at a time, recording how deep each wave got.
      const waves: number[] = [];
      for (let open = httpMock.match(() => true); open.length > 0; ) {
        waves.push(open.length);
        for (const req of open) {
          req.flush(rawPokemon(Number(req.request.url.split('/').pop())));
        }
        open = httpMock.match(() => true);
      }

      expect(done).toBeTrue();
      expect(Math.max(...waves)).toBeLessThanOrEqual(ENRICH_CONCURRENCY);
      // Guards against a regression to forkJoin, which would fire all 40 at once.
      expect(waves.length).toBeGreaterThan(1);
    });

    it('returns new objects and leaves the inputs untouched', () => {
      const input = summary(4);
      let result: PokemonSummary[] = [];
      service.enrichTypes([input]).subscribe((r) => (result = r));
      httpMock.expectOne((r) => r.url.endsWith('/pokemon/4')).flush(rawPokemon(4));

      expect(result[0]).not.toBe(input);
      expect(result[0].types).toEqual(['fire', 'flying']);
      expect(input.types).toEqual([]);
    });

    it('passes already-enriched summaries through without a request', () => {
      const enriched: PokemonSummary = { ...summary(7), types: ['water'] };
      let result: PokemonSummary[] = [];
      service.enrichTypes([enriched]).subscribe((r) => (result = r));
      expect(result).toEqual([enriched]);
    });
  });

  describe('refresh', () => {
    it('makes the next getDexIndex actually hit the network again', () => {
      const drain = () => {
        const open = httpMock.match(() => true);
        for (const req of open) {
          req.flush({ count: 0, results: [] });
        }
        return open.length;
      };

      service.getDexIndex().subscribe();
      expect(drain()).toBe(1);

      // Memoized: a second read must not go out again.
      service.getDexIndex().subscribe();
      expect(drain()).toBe(0);

      service.refresh();
      service.getDexIndex().subscribe();
      expect(drain()).toBe(1);
    });
  });
});
