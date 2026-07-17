import { Pipe, PipeTransform } from '@angular/core';

/** Turns "mr-mime" / "nidoran-f" into "Mr Mime" / "Nidoran F". */
@Pipe({ name: 'displayName' })
export class DisplayNamePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
