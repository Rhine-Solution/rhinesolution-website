---
tags:
  - brain
  - architecture
created: 2026-08-10
updated: 2026-08-10
status: archive
type: concept
description: accepted
---
# ADR-001: Next.js App Router + Supabase for the fullstack app

## Status
accepted

## Context
Starting a new fullstack app from the workspace `templates/` scaffold. Requirements: TypeScript end-to-end, quick time-to-value for a solo dev, real auth + Postgres without running infra, server rendering for SEO, and future deploy on Vercel or Hostinger.

## Decision
- **Next.js (App Router, React Server Components)** as the framework â€” SSR/SSG/ISR for SEO, route-based code splitting, edge + Node runtime options ([[04-Frontend]], [[08-Deployment-DevOps]]).
- **Supabase** for Postgres, auth, and (later) realtime â€” managed Postgres + auth without self-hosting ([[05-Databases]]).
- **Drizzle** as the ORM â€” typed, SQL-first, migrations as generated files ([[05-Databases]] migration rules).
- **Zod** for validation at the API boundary ([[03-Backend]] validation & serialization).
- **Vitest** for unit/integration, **Playwright** for E2E ([[07-Testing]]).

## Consequences
- Positive: no infra to run locally; SQL and TS types stay close; migrations are code-reviewed like code.
- Negative: lock-in to Supabase managed Postgres; App Router learning curve; edge vs node runtime decisions per route.
- Trade-offs: chose managed Supabase over self-hosted Postgres (ops cost for a solo dev); chose Drizzle over Prisma (closer to SQL, lighter).

