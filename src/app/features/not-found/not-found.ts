import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'pa-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="nf">
      <p class="nf__code">404</p>
      <h1 class="nf__title">This route fled!</h1>
      <p class="nf__copy">
        The page you are looking for used Teleport. Let's get you back to the arena.
      </p>
      <a class="pa-btn pa-btn--primary" routerLink="/">Return home</a>
    </section>
  `,
  styles: [
    `
      .nf {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--space-4);
        padding: var(--space-9) var(--space-4);
      }
      .nf__code {
        font-family: var(--font-display);
        font-size: clamp(4rem, 14vw, 8rem);
        font-weight: 700;
        margin: 0;
        background: linear-gradient(120deg, var(--accent), var(--accent-2));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        line-height: 1;
      }
      .nf__title {
        font-size: var(--fs-xl);
      }
      .nf__copy {
        color: var(--text-muted);
        max-width: 40ch;
        margin: 0;
      }
    `,
  ],
})
export class NotFound {}
