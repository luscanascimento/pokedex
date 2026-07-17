export interface GenerationRange {
  gen: number;
  label: string;
  region: string;
  start: number;
  end: number;
}

/** Dex id ranges per generation (used for filtering + label). */
export const GENERATIONS: GenerationRange[] = [
  { gen: 1, label: 'Gen I', region: 'Kanto', start: 1, end: 151 },
  { gen: 2, label: 'Gen II', region: 'Johto', start: 152, end: 251 },
  { gen: 3, label: 'Gen III', region: 'Hoenn', start: 252, end: 386 },
  { gen: 4, label: 'Gen IV', region: 'Sinnoh', start: 387, end: 493 },
  { gen: 5, label: 'Gen V', region: 'Unova', start: 494, end: 649 },
  { gen: 6, label: 'Gen VI', region: 'Kalos', start: 650, end: 721 },
  { gen: 7, label: 'Gen VII', region: 'Alola', start: 722, end: 809 },
  { gen: 8, label: 'Gen VIII', region: 'Galar', start: 810, end: 905 },
  { gen: 9, label: 'Gen IX', region: 'Paldea', start: 906, end: 1025 },
];

/** Total Pokemon we surface in the dex (species with full data). */
export const NATIONAL_DEX_MAX = 1025;

export function generationForId(id: number): number {
  const match = GENERATIONS.find((g) => id >= g.start && id <= g.end);
  return match ? match.gen : 0;
}
