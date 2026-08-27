import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

/**
 * Simple in-memory GET cache for PokeAPI responses.
 * PokeAPI payloads are immutable, so caching them avoids redundant
 * round-trips and keeps navigation instant. The Angular service worker
 * layers persistent/offline caching on top in production.
 *
 * Capped so a long browse through the 1025 species can't grow it without bound.
 * Plain FIFO eviction — insertion-ordered Map, oldest key out. Swap for an LRU
 * only if profiling shows real thrashing on the hot entries.
 */
const MAX_ENTRIES = 300;
const store = new Map<string, HttpResponse<unknown>>();

/** Drop every cached response (pull-to-refresh, so a reload really reloads). */
export function clearHttpCache(): void {
  store.clear();
}

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req);
  }

  const cached = store.get(req.urlWithParams);
  if (cached) {
    return of(cached.clone());
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        if (store.size >= MAX_ENTRIES) {
          const oldest = store.keys().next().value;
          if (oldest !== undefined) {
            store.delete(oldest);
          }
        }
        store.set(req.urlWithParams, event.clone());
      }
    }),
  );
};
