import { Injectable, effect, signal } from '@angular/core';
import { readJson, writeJson } from './storage';

export type ThemeMode = 'dark' | 'light';
const KEY = 'poke-arena:theme';

/** Must mirror --bg in styles.scss for each theme so mobile browser chrome blends in. */
const THEME_COLORS: Record<ThemeMode, string> = {
  dark: '#0b0e18',
  light: '#eef1f8',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>(this.initial());
  readonly mode = this._mode.asReadonly();

  constructor() {
    effect(() => {
      const mode = this._mode();
      document.documentElement.setAttribute('data-theme', mode);
      this.applyThemeColor(mode);
      writeJson(KEY, mode);
    });
  }

  toggle(): void {
    this._mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  /** Keeps the PWA status-bar / browser chrome color in sync with the active theme. */
  private applyThemeColor(mode: ThemeMode): void {
    if (typeof document === 'undefined') {
      return;
    }
    const color = THEME_COLORS[mode];
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute('content', color));
  }

  private initial(): ThemeMode {
    const stored = readJson<ThemeMode | null>(KEY, null);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    const prefersLight =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  }
}
