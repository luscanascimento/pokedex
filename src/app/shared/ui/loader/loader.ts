import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'pa-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loader" role="status" [attr.aria-label]="label()">
      <div class="loader__core"></div>
      <span class="loader__label">{{ label() }}</span>
    </div>
  `,
  styles: [
    `
      .loader {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-8);
      }
      .loader__core {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: conic-gradient(from 0deg, var(--accent), var(--accent-2), var(--accent-3), var(--accent));
        -webkit-mask: radial-gradient(farthest-side, transparent 58%, #000 60%);
        mask: radial-gradient(farthest-side, transparent 58%, #000 60%);
        animation: loader-spin 0.85s linear infinite;
      }
      .loader__label {
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--text-dim);
      }
      @keyframes loader-spin {
        to {
          transform: rotate(1turn);
        }
      }
    `,
  ],
})
export class Loader {
  readonly label = input<string>('Loading');
}
