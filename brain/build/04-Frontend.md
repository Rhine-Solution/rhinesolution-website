---
tags:
  - brain
  - frontend
created: 2026-08-10
updated: 2026-08-10
---
# 04 - Frontend

> 2026: server-first rendering is the default. Performance is the product.

## Stack defaults
- **React/Next.js** (App Router, React Server Components) — SSR/SSG/ISR for SEO + speed.
- **Astro** — island architecture for content-heavy sites (minimal JS shipped).
- **Vue/Svelte** when team knows them — same rules apply.
- **TypeScript** everywhere. No exceptions for new code.

## Build tooling (2026 — Rust is the new native)
- The Rust migration is done: every layer has a production-grade native option and the major frameworks already swapped. Webpack is effectively legacy.
  | Tool | Replaces | 2026 status | When to adopt |
  |---|---|---|---|
  | Turbopack | webpack (in Next.js) | Stable, **default in Next 16** | New / existing Next.js apps now |
  | Rspack 2.x | webpack (standalone) | Stable, webpack API-compatible | Migrating existing webpack configs |
  | Rolldown 1.0 | Rollup/esbuild | Stable — **default in Vite 8** | New Vite projects |
  | Oxc / oxlint | SWC/Babel + ESLint | Linter GA, 50–100× faster | Lint now |
  | Biome 2.5 | ESLint + Prettier | Stable, ~97% Prettier parity, auto-migration | New TS projects |
  | Lightning CSS | PostCSS / CSS transforms | Stable | Already bundled in Turbopack/Vite |
- **TypeScript 7** (the Go port, stable Jul 2026): 8–12× faster with **full type-checking intact** — `tsc` is a fast type-checker again. **Node runs `.ts` natively** (stable 24.12+/25.2+, no build step) — but Node never type-checks, so keep `tsc --noEmit` in CI; `erasableSyntaxOnly` keeps code Node-runnable.
- **Recommended stack for a new full-stack TS project**: Next.js 16 (Turbopack) or Vite 8 (Rolldown) for frontend; **Node 24 LTS running `.ts` directly** for backend; TypeScript 7 for type-check; **Biome** for lint+format; **pnpm 11** (workspaces) — npm is fine for a single package; **Turborepo** for monorepos.
- **Migration path** (webpack + ESLint/Prettier): bundler → **Rspack** (drop-in, keeps plugins); lint/format → `biome migrate eslint --write` + `biome migrate prettier --write` (before uninstalling ESLint); drop Babel/`tsc` transpile since bundlers strip types; runtime → Node 24 native `.ts`.

## Rendering choice
| Need | Use |
|---|---|
| Public content, SEO | Server-render (SSG/ISR) |
| Auth-gated app dashboards | Client rendering ok, but lazy-load everything |
| Mostly static + a few interactive bits | Islands (Astro) |

## 2026: Server-first + RSC is the default architecture
- RSC is no longer a niche optimization — **the default for new React apps**. Mental model: **Server Components for data & display, Client Components (`"use client"`) for interactivity only.**
- Data fetching, auth, initial state live **on the server**; mutations go through **Server Actions**. Client state shrinks to UI transitions + optimistic updates.
- **The `'use client'` trap**: sprinkling it upward pulls the whole tree into the browser. Keep the client boundary at the lowest needed leaf — only hooks, event handlers, browser APIs, interactive libs force it.
- **BFF pattern**: a backend-for-frontend gathers data safely server-side and stops client data waterfalls.
- **React Compiler** makes manual `useMemo`/`useCallback` obsolete — don't over-memoize by habit; optimize **component purity** (predictable, side-effect-free renders) so the compiler can do its job.
- Hydration mismatch is a real production pain — keep server/client rendering deterministic (no `window`/`Date` in render).

## Edge runtime & caching (2026)
- **The split model**: V8-isolate **edge for the request path** (caching, streaming, geo) and **Node.js for everything stateful or heavy**. Headline: **Next.js 16.3 drops `runtime='edge'`** — routes run on Node; edge survives as middleware + cache/static layers. Cloudflare Workers is the remaining edge-native platform.
- **Runs on edge**: middleware, auth (Web Crypto), geo/A-B/feature flags, redirects/rewrites, cache-aware routes, response streaming. **Does not**: native modules (bcrypt, sharp, sqlite3), >1–4 MB (Vercel) / >3–10 MB (Workers) bundles, >~30 s compute, cron/background jobs, WebSockets, sustained DB work, large payloads. Outbound is HTTP-only → Postgres needs HTTP drivers (Neon/PlanetScale/Supabase) or read replicas, not `pg` sockets.
- **Caching & invalidation**: `Cache-Control: public, s-maxage=60, stale-while-revalidate=86400` (async SWR is GA on Cloudflare). Next ISR = `s-maxage + stale-while-revalidate`. Purge on every deploy (Vercel auto-purges ~300 ms; a fronting CDN needs a post-deploy prefix purge). **Never override Edge TTL on ISR routes** or revalidation silently stops. Static assets: hash filenames + long TTL. `/api/*`, Server Actions, authed SSR: bypass cache.
- **Streaming**: ship the static shell first (PPR) for sub-100 ms TTFB, then stream Suspense chunks as fetches resolve. Helps **LCP only if the LCP element is in the first chunk**. Don't stream when data resolves <100 ms or deps are sequential. Reserve exact skeleton dimensions or CLS regresses; disable reverse-proxy buffering or chunks arrive as one blob.
- **Edge data**: KV = eventually consistent (~60 s propagation) → config/flags/cache only, never source of truth; Durable Objects / D1 for consistent edge state; Turso embedded replicas = sub-ms reads. **Read at edge, write region-pinned to a single-writer primary** (accept 50–150 ms cross-region write latency).
- **Topology 2026**: edge for the request path + caching + streaming, regional Node pinned to the origin DB for writes/heavy work, single-writer DB with replicated reads. (Ops view: [[08-Deployment-DevOps]].)

## Performance (Core Web Vitals)
- **2026 set: LCP < 2.5s, INP < 200ms (replaced FID — the most commonly failed metric), CLS < 0.1.** Only ~43% of mobile sites pass all three.
- Highest-ROI fixes by metric:
  - **LCP**: preload the LCP image (−500–1500ms), inline critical CSS, `srcset` responsive sizes (5–10× mobile savings), CDN + edge caching for TTFB.
  - **INP**: break long JS tasks with `scheduler.yield()`/`setTimeout(0)`, defer third-party scripts, keep initial JS payload <150KB compressed, web workers for heavy computation, DOM <1500 nodes.
  - **CLS**: explicit width/height on images/videos, font swap/`size-adjust` (Fontaine), reserve space for dynamic content.
- **Measure real users, not just lab**: RUM (`web-vitals` lib, 1KB) + CrUX (28-day field data). Lab (Lighthouse) misses network/device reality — fix the pages real users suffer on.
- **Performance budgets in CI** (bundle size, image weight, third-party count, CWV scores) — degrade the build, not silently.
- No 5MB of JS for a blog post — ship what the page needs. Lazy-load routes and heavy components; code-split by route.

## Accessibility (WCAG 2.2 is the target — not optional)
- Semantic HTML. Keyboard operable. Proper labels. Contrast ≥ WCAG AA. **Target WCAG 2.2 AA** ⚠️ verified: 2026-08 (current W3C rec, 87 SCs); legal floor is 2.1 AA. WCAG 3.0 is still a Working Draft (Bronze/Silver/Gold, ~2029–30) — ignore "WCAG 3 Bronze" certifications.
- **It's law, with deadlines** ⚠️ verified: 2026-08: EU **EAA** (e-commerce, banking, transport) enforceable since **Jun 28 2025** for new products, legacy → 2030; EN 301 549 v4.1.1 → WCAG 2.2 expected ~Oct 2026. US ADA **Title II** (public entities): **Apr 26 2027** (pop ≥50k) / Apr 2028 (smaller). Title III (private): WCAG 2.1 AA is de facto — **~8,667 federal suits in 2025 (+37%)**, settlements $5k–75k (Fashion Nova $5.15M). CO HB21-1110 live ($3,500/violation).
- **WCAG 2.2 new AA SCs to know**: 2.4.11 **Focus Not Obscured** (no sticky header/banner covering focus — CSS `scroll-padding`), 2.4.12 Focus Appearance (3:1 contrast indicator), 2.5.8 **Target Size ≥24×24 CSS px**, 3.3.8 Accessible Authentication; A-level: 3.2.6 Consistent Help, 3.3.7 Redundant Entry. `prefers-reduced-motion` is the standard technique for SC 2.3.3.
- **Tooling**: axe-core (open-source, near-zero false positives; powers Lighthouse) + `@axe-core/playwright` as a **CI gate on your top-10 templates** (fail on critical/serious). Automation catches **only ~30–40% of violations** — the rest needs manual keyboard-only + NVDA passes. Fix the 7 most-cited first: form labels, contrast, alt text, link/button names, keyboard traps, skip links.
- **Overlays are dead**: FTC fined accessiBe **$1M** (2025); 22.6% of H1-2025 ADA suits targeted sites *with* overlays; courts reject overlay defenses. Never install one.
- **Bake into the design system**: per-component axe tests in CI, Stark for in-design contrast, focus visible as a design feature. Publish an accessibility statement + document remediation (evidence = legal defense).

## State & data fetching
- Server components/SSR for initial data; client fetching with caching layer (TanStack Query).
- **2026 mental model — 4 layers, pick the tool per layer, never "one global store for everything":**
  | Layer | Examples | Tool |
  |---|---|---|
  | Local UI state | modal open, input value | `useState` / `useReducer` |
  | Derived state | filtered lists, computed | `useMemo` / selectors |
  | Global client state | theme, auth, cart | Zustand (small/med) · Redux Toolkit (enterprise) |
  | Server state | API data | TanStack Query (cache, refetch, dedupe, optimistic) |
- **Never store API responses in a global store** — that's TanStack Query's job. Never use Context as a state manager (re-render blast radius).
- Avoid prop drilling — colocate state. Optimistic UI for the feel; reconcile with server truth.

## Component discipline & design systems (2026)
- Small, single-purpose components. Props over globals.
- **Design tokens**: the W3C DTCG spec is stable (2025.10) — `$value`/`$type`/`$description`; backed by Figma (native since late 2025), Tokens Studio, Style Dictionary (v5 adopts it). Runtime layer = CSS custom properties; theming via `data-theme` attribute swapping `$value` (no JS provider). Token adoption ~84% of product teams.
- **Style Dictionary** (v4/v5): tokens JSON → CSS vars / Swift / Kotlin / Tailwind via `@tokens-studio/sd-transforms`. **Skip it until a second platform/consumer actually exists.**
- **Component strategy**: the **shadcn/ui model** (CLI copy-paste of Radix-primitive + Tailwind components into your repo) dominates. 2026 debate: copy-paste (own code, manual Radix versioning) vs npm package (semver, auto security patches, `data-slot` theming). Tailwind v4 is CSS-first (`@theme` block → utilities + native CSS vars).
- **Verification**: Storybook 9 (`@storybook/addon-a11y` default) + Chromatic or Playwright `toHaveScreenshot()` for component visual-regression in CI; token PRs validated in CI.
- **Minimal small-team setup (single React app)**: Tailwind v4 `@theme` tokens + one primitive layer (Radix or shadcn/ui). Storybook only when the component count grows; a full design system is overkill below ~2 teams / 500 components.

## SEO (2026)
- Clean readable URLs (/blog/seo-architecture-2026, not /post/12345). Semantic headings, descriptive titles, meta descriptions. Server-rendered HTML for indexability.
- **AI Overviews 2026**: appear on ~68% of local searches; AI packs show ~68% fewer businesses → **thin profiles get excluded**; cited businesses see ~35% higher CTR. Services/pricing/FAQ content is AI citation fuel — but one page can't win multiple city+service keywords; add dedicated service/FAQ pages only if chasing them.

## i18n (2026)
- **Canonical Next.js App Router pattern**: `app/[locale]/` dynamic segment + `generateStaticParams` per locale; the `next.config` `i18n` key is **unsupported in App Router**. Routing: middleware (Next ≤15) / **proxy (Next 16+)** matches `Accept-Language` (`@formatjs/intl-localematcher` best-fit) + cookie persistence; `localePrefix: 'always' | 'as-needed'`. Static export → prefix routing only (no negotiation).
- **Library**: **next-intl is the 2026 default** (~900K weekly downloads): native RSC support (server-side translation, no hydration cost), type-safe message keys, ICU MessageFormat. Alternatives: react-i18next (universal, key-based, larger bundle), Lingui (ICU, compile-time extraction, ~5KB runtime). **next-i18next is a Pages Router dead end.**
- **ICU MessageFormat is the cross-stack standard** (Web/iOS/Android/PHP) — prefer it for TMS compatibility. Send only the needed namespaces to the client (`pick(messages, ...)`); set `<html lang dir>` via `getLocaleDirection`.
- **What actually breaks apps**: CLDR plural rules (6 categories `zero one two few many other` — English uses 2, Arabic all 6, Slavic add `few/many`) → never `count === 1 ? ...`; `Intl.DateTimeFormat/NumberFormat/RelativeTimeFormat` for all formatting (Baseline); **Temporal is ES2027, shipped in engines** (polyfill Safari) — replaces date-fns/dayjs for math/zones. RTL: `dir="rtl"` + logical CSS properties; hreflang via `alternates.languages` incl. `x-default`.
- **Tooling**: Lingui CLI message extraction (compile-time) or manual JSON. Start Git+JSON; add a TMS at >1 translator or when OTA fixes matter (POEditor ~$20/mo, Lokalise ~$120/mo best Figma plugin, Crowdin free for OSS). AI/MT pre-translation + human review is standard; major TMSes ship MCP servers.

## Mobile (2026): Expo / Capacitor / Tauri / PWA
- **Decision**: native & Expo give full push/offline/Apple Pay/NFC; **PWA = no store fees, no install friction** — but iOS has no silent push, no Web BT/NFC, manual "Add to Home Screen", storage eviction risk. **Capacitor** = wrap an existing web app in a native shell (plugin bridge) — right when your web app *is* the product. **Tauri** = desktop-first (Rust shell + system webview); mobile "works but rough edges" → RN/Flutter for mobile-first.
- **Expo/React Native 2026**: **SDK 57** (RN 0.86); **New Architecture mandatory** (SDK 55+; legacy frozen Jun 2025); edge-to-edge mandatory on Android 15+; **Expo Go is gone from both stores** → `expo-dev-client` dev builds + EAS Build/Submit/Update (OTA, Hermes bytecode diffing); Expo Router v56 file-based, decoupled from React Navigation, adds web SSR. Not enough → `expo prebuild` (CNG) + config plugins; custom native via Expo Modules API.
- **PWAs 2026**: installability + offline (service worker/Cache Storage) + manifest; iOS push stable since 16.4, **Declarative Web Push** (Safari 18.4+) is a W3C working draft; iOS eviction of long-idle storage persists.
- **Store fees 2026**: Apple Small Business Program **15%** (<$1M/yr proceeds); Google **15% first $1M/yr** (from Jun 30 2026 — 10% service + 5% billing), subs 15% day one on both.
- **Rule of thumb**: responsive web + PWA first; Expo when you need app-store presence or full device APIs; Capacitor to ship an existing web app with native wrappers fast; Tauri for desktop apps from the same stack.

