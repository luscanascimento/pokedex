import { Pipe, PipeTransform } from '@angular/core';

/** Formats a dex id as a zero-padded label, e.g. 25 -> "#0025". */
@Pipe({ name: 'dexNumber' })
export class DexNumberPipe implements PipeTransform {
  transform(id: number | null | undefined): string {
    if (id == null) {
      return '#----';
    }
    return `#${id.toString().padStart(4, '0')}`;
  }
}
