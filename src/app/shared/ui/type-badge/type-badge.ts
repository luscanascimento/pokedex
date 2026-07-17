import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PokemonTypeName } from '../../../core/models/pokemon.model';

@Component({
  selector: 'pa-type-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="type-badge"
      [class.type-badge--sm]="size() === 'sm'"
      [style.--type-color]="'var(--type-' + type() + ')'"
      [attr.data-type]="type()"
    >
      <span class="type-badge__dot" aria-hidden="true"></span>
      {{ type() }}
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .type-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        padding: 0.32rem 0.7rem 0.32rem 0.55rem;
        border-radius: var(--radius-pill);
        color: var(--type-color);
        background: color-mix(in srgb, var(--type-color) 16%, transparent);
        border: 1px solid color-mix(in srgb, var(--type-color) 42%, transparent);
        line-height: 1;
        white-space: nowrap;
      }
      .type-badge--sm {
        font-size: 0.62rem;
        padding: 0.22rem 0.5rem 0.22rem 0.4rem;
        letter-spacing: 0.1em;
      }
      .type-badge__dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: var(--type-color);
        box-shadow: 0 0 8px color-mix(in srgb, var(--type-color) 80%, transparent);
      }
    `,
  ],
})
export class TypeBadge {
  readonly type = input.required<PokemonTypeName>();
  readonly size = input<'sm' | 'md'>('md');
}
