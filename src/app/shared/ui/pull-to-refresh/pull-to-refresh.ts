import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  output,
  signal,
} from '@angular/core';

/**
 * Lightweight, touch-only pull-to-refresh wrapper.
 *
 * Wrap network-backed content in <pa-pull-to-refresh (refresh)="reload()">.
 * The gesture only activates when the page is scrolled to the very top and the
 * user is on a touch device, so it never fights normal scrolling or the mouse.
 */
@Component({
  selector: 'pa-pull-to-refresh',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ptr"
      [class.ptr--pulling]="pull() > 0"
      [class.ptr--armed]="armed()"
      [class.ptr--refreshing]="refreshing()"
      [style.--ptr-pull.px]="pull()"
    >
      <div class="ptr__indicator" aria-hidden="true">
        <span class="ptr__spinner"></span>
      </div>
      <ng-content />
    </div>
  `,
  styleUrl: './pull-to-refresh.scss',
  host: {
    '(touchstart)': 'onStart($event)',
    '(touchmove)': 'onMove($event)',
    '(touchend)': 'onEnd()',
    '(touchcancel)': 'onEnd()',
  },
})
export class PullToRefresh {
  private readonly doc = inject(DOCUMENT);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Emitted when the user pulls past the threshold and releases. */
  readonly refresh = output<void>();

  protected readonly pull = signal(0);
  protected readonly armed = signal(false);
  protected readonly refreshing = signal(false);

  private startY = 0;
  private tracking = false;

  private static readonly THRESHOLD = 72;
  private static readonly MAX = 110;

  protected onStart(event: TouchEvent): void {
    if (this.refreshing() || event.touches.length !== 1) {
      return;
    }
    // Only arm the gesture when we're at the very top of the page.
    if (this.scrollTop() > 0) {
      this.tracking = false;
      return;
    }
    this.startY = event.touches[0].clientY;
    this.tracking = true;
  }

  protected onMove(event: TouchEvent): void {
    if (!this.tracking || this.refreshing()) {
      return;
    }
    const delta = event.touches[0].clientY - this.startY;
    if (delta <= 0 || this.scrollTop() > 0) {
      this.pull.set(0);
      this.armed.set(false);
      return;
    }
    // Rubber-band the pull distance.
    const distance = Math.min(PullToRefresh.MAX, delta * 0.5);
    this.pull.set(distance);
    this.armed.set(distance >= PullToRefresh.THRESHOLD);
    if (event.cancelable) {
      event.preventDefault();
    }
  }

  protected onEnd(): void {
    if (!this.tracking) {
      return;
    }
    this.tracking = false;
    if (this.armed()) {
      this.trigger();
    } else {
      this.reset();
    }
  }

  private trigger(): void {
    this.refreshing.set(true);
    this.pull.set(56);
    this.armed.set(false);
    this.refresh.emit();
    // Auto-release; consumers reload async and the view repaints regardless.
    setTimeout(() => this.reset(), 650);
  }

  private reset(): void {
    this.refreshing.set(false);
    this.pull.set(0);
    this.armed.set(false);
  }

  private scrollTop(): number {
    return this.doc.scrollingElement?.scrollTop ?? this.doc.documentElement.scrollTop ?? 0;
  }
}
