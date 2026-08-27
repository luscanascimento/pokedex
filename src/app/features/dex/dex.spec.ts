import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Dex } from './dex';

const API = 'https://pokeapi.co/api/v2';
const INDEX_SIZE = 6;

function indexResponse() {
  return {
    count: INDEX_SIZE,
    next: null,
    previous: null,
    results: Array.from({ length: INDEX_SIZE }, (_, i) => ({
      name: `mon-${i + 1}`,
      url: `${API}/pokemon/${i + 1}/`,
    })),
  };
}

function rawPokemon(id: number) {
  return { id, name: `mon-${id}`, types: [{ slot: 1, type: { name: 'grass' } }] };
}

function clickTypeChip(fixture: ComponentFixture<Dex>, type: string): void {
  const chips = Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.chip--type'),
  );
  const chip = chips.find((c) => c.textContent?.trim() === type);
  expect(chip).withContext(`chip for ${type}`).toBeDefined();
  chip?.click();
  fixture.detectChanges();
}

describe('Dex', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  /** Boot the grid with a loaded, fully enriched index. */
  function bootedFixture(): ComponentFixture<Dex> {
    const fixture = TestBed.createComponent(Dex);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.startsWith(`${API}/pokemon?limit=`)).flush(indexResponse());
    fixture.detectChanges();
    for (const req of httpMock.match((r) => /\/pokemon\/\d+$/.test(r.url))) {
      req.flush(rawPokemon(Number(req.request.url.split('/').pop())));
    }
    fixture.detectChanges();
    return fixture;
  }

  it('resolves a type filter with a single /type request, not one per species', () => {
    const fixture = bootedFixture();

    clickTypeChip(fixture, 'fire');

    // Regression: this used to enrich the whole index (one detail call per
    // species) just to read the types back off the summaries.
    const req = httpMock.expectOne(`${API}/type/fire`);
    req.flush({
      pokemon: [
        { slot: 1, pokemon: { name: 'mon-2', url: `${API}/pokemon/2/` } },
        // Alternate forms live above the National Dex range and must be dropped.
        { slot: 1, pokemon: { name: 'mon-10250', url: `${API}/pokemon/10250/` } },
      ],
    });
    fixture.detectChanges();

    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('pa-pokemon-card');
    expect(cards.length).toBe(1);
  });

  it('shows skeletons instead of the empty state while the type filter resolves', () => {
    const fixture = bootedFixture();

    clickTypeChip(fixture, 'fire');

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.skeleton-card')).not.toBeNull();
    expect(host.querySelector('pa-empty-state')).toBeNull();

    httpMock.expectOne(`${API}/type/fire`).flush({ pokemon: [] });
  });
});
