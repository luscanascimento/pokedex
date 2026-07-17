import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'pa-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty" role="status">
      <div class="empty__mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="48" height="48">
          <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M3 24h18M27 24h18" stroke="currentColor" stroke-width="2" />
          <circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </div>
      <h3 class="empty__title">{{ title() }}</h3>
      @if (message()) {
        <p class="empty__msg">{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: [
    `
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--space-3);
        padding: var(--space-8) var(--space-4);
        color: var(--text-muted);
      }
      .empty__mark {
        color: var(--text-dim);
        opacity: 0.5;
      }
      .empty__title {
        font-family: var(--font-display);
        font-size: var(--fs-lg);
        color: var(--text);
      }
      .empty__msg {
        max-width: 42ch;
        margin: 0;
        font-size: var(--fs-sm);
      }
    `,
  ],
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly message = input<string>('');
}
