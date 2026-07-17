import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

/**
 * Simple in-memory GET cache for PokeAPI responses.
 * PokeAPI payloads are immutable, so caching them avoids redundant
 * round-trips and keeps navigation instant. The Angular service worker
 * layers persistent/offline caching on top in production.
 */
const store = new Map<string, HttpResponse<unknown>>();

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
        store.set(req.urlWithParams, event.clone());
      }
    }),
  );
};
