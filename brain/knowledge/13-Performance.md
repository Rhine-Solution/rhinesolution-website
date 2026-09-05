---
tags:
  - brain
created: 2026-08-10
updated: 2026-08-10
type: concept
description: Performance is a feature. Slow sites lose users, rank lower in search, and burn money on compute. Optimize what matters, measure everything.
---
# 13 - Performance

> Performance is a feature. Slow sites lose users, rank lower in search, and burn money on compute. Optimize what matters, measure everything.

## Core Web Vitals (2026 baseline)
- **LCP** (Largest Contentful Paint) — load: target **≤2.5s** (75th percentile).
- **INP** (Interaction to Next Paint) — responsiveness: target **≤200ms**. Replaced FID as the interaction metric.
- **CLS** (Cumulative Layout Shift) — visual stability: target **≤0.1**.
- Measure with CrUX (real users) + Lighthouse (lab). Optimize for CrUX first — real users are the truth.

## Where performance actually goes
- **90% of LCP time is frontend**: TTFB, render-blocking CSS/JS, image loading. Backend micro-optimizations are usually a rounding error by comparison.
- **Bundle size is the silent killer**: a 1MB JS bundle can cost 3–5s on mid-range mobile. Budget by route, not by app.
- **Images dominate page weight**: serve WebP/AVIF, `width`/`height` attrs (kills CLS), `srcset` for responsive, lazy-load below the fold, `loading="lazy"` + `fetchpriority="high"` on LCP image.

## Rendering & data strategy (2026)
- **Server Components by default** (Next.js/React): render on server, ship minimal JS. Client Components only where interactivity demands it.
- **Edge rendering for fast TTFB** (Vercel/Cloudflare) on dynamic-but-small content; Node for heavy routes. See [[08-Deployment-DevOps]].
- **Streaming + Suspense** to ship HTML progressively — LCP drops even when a route has slow data.
- **Cache aggressively, invalidate precisely**: immutable assets (year-long), SWR/ISR for content, short TTL for dynamic. Cache invalidation is the actual engineering.

## Frontend techniques
- **Route-level code splitting** (dynamic `import()`), prefetch on hover for likely-next routes.
- **CSS-in-JS is dead for runtime perf** — static CSS/Tailwind, or extract at build time.
- **Fonts**: `font-display: swap`, preload the woff2, `size-adjust` to stop CLS from font swaps, subset only needed glyphs.
- **Animation**: `transform` + `opacity` only (compositor thread), `content-visibility: auto` on long lists, avoid `will-change` overuse.

## Backend & data
- **N+1 queries kill APIs** — batch, join, or use a query builder to avoid ORM lazy-loading traps.
- **Read replicas + caching layer** for read-heavy workloads; single-writer DB. See [[05-Databases]].
- **Background work off the request path** — queues for email/exports/AI. See [[03-Backend]].
- **API pagination, filtering, and field-selection** — don't ship the whole table to the client.

## Profiling workflow (do this, don't guess)
1. Measure CrUX for the real-user baseline.
2. Record a Lighthouse performance trace on a throttled mid-range device (Slow 4G / 4x CPU).
3. Read the trace: identify the bottleneck (LCP element, main-thread time, layout thrash, huge layout/paint).
4. Fix ONE thing, re-measure, compare. Never optimize blind.

## AI/AI-generated performance traps
- Agents will happily add a 200KB chart library for a 3-number stat. **Review every dependency**: tree-shakable? import cost? bundle-phobia it.
- AI-generated code often over-fetches or re-renders whole subtrees — profile before accepting "optimizations."
- Use agents to generate the profiler report reading and the fix plan, but verify with the trace.

## Performance budgets (start here)
- JS per route: **≤170KB gzipped** (max), target ≤100KB.
- CSS: **≤50KB** per route.
- LCP: ≤2.5s · INP: ≤200ms · CLS: ≤0.1.
- First byte (TTFB): ≤800ms on the edge, ≤200ms same-region.

