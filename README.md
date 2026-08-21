<div align="center">

# ⚔️ Poke Arena

### A modern Pokedex with a competitive twist — browse every species, then compute type matchups and analyze your team's weaknesses.

[![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Signals](https://img.shields.io/badge/State-Signals-4de3c1?style=for-the-badge)](https://angular.dev/guide/signals)
[![PWA](https://img.shields.io/badge/PWA-Offline_Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![SCSS](https://img.shields.io/badge/SCSS-Design_System-CD6799?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com/)
[![PokeAPI](https://img.shields.io/badge/Data-PokeAPI-EF5350?style=for-the-badge)](https://pokeapi.co)

</div>

---

## Overview

**Poke Arena** is a frontend-only single-page application that reimagines the Pokedex as a competitive battle terminal. It consumes the free [PokeAPI](https://pokeapi.co) (no key required) and layers on two features that go beyond a typical dex: a full **Type Matchup Calculator** and an automatic **Team Weakness Analyzer**.

It is built entirely on the modern Angular stack — standalone components, Signals for state, the new control-flow syntax, typed inputs, functional interceptors, and lazy-loaded routes — with TypeScript in **strict mode** and **zero `any`**.

## ✨ Features

- **Browse the full National Dex (Gen I → IX, 1025 species)** — responsive, type-colored cards with lazy-loaded artwork, skeleton shimmer, and progressive "load more" paging.
- **Search & filter** — instant search by name or dex number, plus filter chips for **type** and **generation**.
- **Rich detail view** — animated base-stat bars, abilities (incl. hidden), sample level-up moves, an interactive **evolution chain**, a **normal / shiny** artwork toggle, and per-Pokemon type effectiveness.
- **Type Matchup Lab** — pick a Pokemon _or_ hand-build a dual-type combination and compute **offensive** and **defensive** effectiveness (weaknesses / resistances / immunities) from the complete Gen VI+ type chart.
- **Team Builder** — assemble up to **6 Pokemon** (persisted in `localStorage`) and get **automatic squad analysis**: which attacking types threaten the whole team, which types have no defensive answer, and where your resistances stack.
- **Favorites** — pin any Pokemon; persisted across sessions.
- **PWA** — installable and **offline-capable**: the Angular service worker caches the app shell, visited API data, and sprites.
- **Light & dark themes**, fully responsive, keyboard-accessible with visible focus states and semantic markup.

> The Matchup Lab and the Team Analyzer are the parts worth reading: both run off a hand-written, fully-typed type-effectiveness chart and pure functions, not extra API calls.

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 22.20 and **npm** ≥ 10
- A modern browser

### Install

```bash
npm install
```

### Develop

```bash
npm start
```

Then open <http://localhost:4200>. (The service worker is disabled in dev mode by design.)

### Production build

```bash
npm run build
```

The optimized bundle is emitted to `dist/poke-arena`. To preview the PWA/offline behavior, serve that folder with any static server, e.g.:

```bash
npx http-server dist/poke-arena/browser -p 8080
```

## 📱 Mobile / PWA

Poke Arena is **mobile-first** and an **installable Progressive Web App** — it behaves like a native app on a phone while keeping the full desktop layout.

- **Installable** — on Android tap the browser's **"Add to Home Screen"** / **Install app** prompt; on iOS use **Share → Add to Home Screen**. It launches standalone (no browser chrome) from its own icon, with an app splash and offline app-shell caching via the Angular service worker.
- **Bottom tab bar** — on small screens the header nav collapses into a fixed, thumb-friendly **bottom tab bar** (Home · Dex · Matchup · Team · Faves) with live badge counts; the classic top nav returns on desktop.
- **Touch-optimized** — every interactive control is a **≥ 44 px touch target**, with tap feedback / active states, momentum scrolling on the filter chip rows, and no accidental double-tap zoom on buttons and inputs.
- **Safe-area aware** — layout honors `env(safe-area-inset-*)` so nothing is hidden behind notches, rounded corners, or the home indicator.
- **Adaptive chrome** — the browser/status-bar **theme color tracks the active light/dark theme**, and a subtle **pull-to-refresh** on the Pokedex re-fetches the dex on touch devices.
- Usable from **320 px** up with no horizontal overflow.

## 🗂️ Project Structure

```
src/app/
├── core/                        # App-wide singletons, no UI
│   ├── data/                    # Type chart + generation ranges (pure data)
│   ├── interceptors/            # Functional HTTP cache interceptor
│   ├── models/                  # Typed domain + raw PokeAPI interfaces
│   └── services/                # PokeApi, Favorites, Team, Matchup, Theme (signals)
├── shared/                      # Reusable, presentational building blocks
│   ├── pipes/                   # displayName, dexNumber
│   └── ui/                      # type-badge, sprite-image, pokemon-card,
│                                #   effectiveness-panel, loader, empty-state
├── features/                    # Lazy-loaded route features
│   ├── home/  dex/  detail/
│   ├── matchup/                 # Type Matchup Lab
│   ├── team/                    # Team Builder + squad analysis
│   ├── favorites/  not-found/
├── app.ts / app.html / app.scss # Shell: header, nav, theme, PWA update toast
├── app.config.ts                # Providers: router, http (+cache), service worker
└── app.routes.ts                # Lazy route table
```

## 🧠 What This Demonstrates

- **Modern Angular fluency** — 100% standalone components, `input()` / `output()` signals, `computed()`/`effect()` state, the `@if`/`@for`/`@switch`/`@let` control flow, `inject()` DI, `withComponentInputBinding()` route inputs, functional interceptors, and lazy `loadComponent` routes with `OnPush` everywhere.
- **Type-safe domain modeling** — strict TypeScript with explicit models for both the raw API and the app's domain; the entire type-effectiveness engine is pure, unit-testable functions.
- **Thoughtful async UX** — every data path has loading/skeleton, empty, and error states, an in-memory HTTP cache, and graceful image fallbacks.
- **State architecture** — signal-based services with `localStorage` persistence and derived analysis (`computed`), cleanly separated from presentation.
- **Design craft** — a token-driven SCSS design system (color / spacing / type scale), light + dark themes, a distinctive "battle terminal" aesthetic, tasteful micro-interactions, and full responsiveness.
- **Accessibility & PWA** — semantic HTML, ARIA states, skip link, keyboard navigation, visible focus, `prefers-reduced-motion` support, and an installable, offline-ready service worker.

---

<div align="center">
<sub>Data courtesy of <a href="https://pokeapi.co">PokeAPI</a>. Pokémon and Pokémon character names are trademarks of Nintendo. This is a non-commercial portfolio project.</sub>
</div>
