---
tags:
  - brain
  - project
created: 2026-08-10
updated: 2026-08-10
status: archive
stack: Next.js + Supabase + Zod + Drizzle + Vitest
type: concept
description: ~/Projects/fullstack
---
# Project: fullstack

> Next.js App Router + Supabase fullstack app. Registered in .

## Location
`~/Projects/fullstack`

## Stack
- **Frontend**: Next.js (App Router, React Server Components).
- **Backend**: API routes under `src/app/api`.
- **Database/Auth**: Supabase (`src/lib/supabase`, `src/types/database.ts`).
- **Validation**: Zod.
- **ORM**: Drizzle (migrations as generated files â€” see [[05-Databases]]).
- **Tests**: Vitest + Playwright (see [[07-Testing]]).

## Status
- Next.js scaffold + Zod + Drizzle + Vitest + CI âœ…
- `/api/health` + `/api/echo` + `/api/supabase/ping` + `/api/supabase/opencode-ping` âœ…
- Supabase project wired (anon + service-role), `opencode_ping` table + RLS policies âœ…
- Drizzle migrations pending (port 5432 blocked from this machine)

## Decisions
- [[ADR-001-Nextjs-Supabase]] â€” why Next.js + Supabase.

