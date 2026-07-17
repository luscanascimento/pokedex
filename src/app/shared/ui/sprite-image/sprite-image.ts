import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/** Lazy sprite with skeleton shimmer + graceful fallback on load error. */
@Component({
  selector: 'pa-sprite-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sprite" [class.sprite--loaded]="loaded()">
      @if (!loaded() && !errored()) {
        <div class="sprite__skeleton" aria-hidden="true"></div>
      }
      @if (errored()) {
        <div class="sprite__fallback" aria-hidden="true">?</div>
      } @else {
        <img
          [src]="src()"
          [alt]="alt()"
          loading="lazy"
          decoding="async"
          (load)="loaded.set(true)"
          (error)="errored.set(true)"
        />
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .sprite {
        position: relative;
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        opacity: 0;
        transition: opacity 0.45s var(--ease-out), transform 0.45s var(--ease-out);
        transform: scale(0.94);
        image-rendering: auto;
      }
      .sprite--loaded img {
        opacity: 1;
        transform: scale(1);
      }
      .sprite__skeleton {
        position: absolute;
        inset: 8%;
        border-radius: 50%;
        background: linear-gradient(
          110deg,
          color-mix(in srgb, var(--text-dim) 12%, transparent) 20%,
          color-mix(in srgb, var(--text-dim) 26%, transparent) 40%,
          color-mix(in srgb, var(--text-dim) 12%, transparent) 60%
        );
        background-size: 220% 100%;
        animation: shimmer 1.3s ease-in-out infinite;
      }
      .sprite__fallback {
        font-family: var(--font-display);
        font-size: 2rem;
        color: var(--text-dim);
        opacity: 0.6;
      }
      @keyframes shimmer {
        to {
          background-position: -220% 0;
        }
      }
    `,
  ],
})
export class SpriteImage {
  readonly src = input.required<string>();
  readonly alt = input<string>('');
  protected readonly loaded = signal(false);
  protected readonly errored = signal(false);
}
