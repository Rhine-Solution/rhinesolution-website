---
tags:
  - brain
  - deploy
created: 2026-08-10
updated: 2026-09-04
---
# 08 - Deployment & DevOps

> Lean ops for this workspace: Vercel + GitHub Actions + Cloudflare. Matches what Rhine Solution actually uses — no enterprise machinery we will never run.

## The real pipeline (Rhine Solution)
```
feat/<name> branch → push → GitHub Actions CI (lint + typecheck + build)
  → PR to main → Vercel preview deployment (per branch)
  → merge to main → CI gate re-runs → Vercel auto-deploys production
```
- **CI**: `.github/workflows/ci.yml` — runs `npm run lint`, `npm run typecheck`, `npm run build` on every PR to `main` and push to `main`. Never merge a branch that fails CI.
- **Deploy**: Vercel, production branch `main`. Push to main = deploy. Nothing else needed.
- **Preview**: every PR/branch gets its own `*.vercel.app` URL — review before merging. `rhinesolution.com` is only ever aliased by production.
- **Rollback**: redeploy the previous production commit in Vercel (Deployments → ⋯ → Promote). The Git history is the source of truth.

## Pre-merge checklist (every PR, even typo fixes)
1. CI green: lint + typecheck + build pass.
2. Diff reviewed — no secrets, no `.env.local`, no unrelated changes.
3. `.env.example` updated if a new env var was added (never the real value).
4. Visual check on the Vercel preview URL (confirm the always-dark + WebGL identity is intact — no light-mode toggle, no audio).
5. If it touches the contact form, verify a test submission lands in `info@rhinesolution.com`.

## Git workflow (enforced by repo AGENTS.md)
- Feature branch off updated `main`; never push directly to `main`.
- Conventional commits (`feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`).
- Run `npm run build` + `npm run typecheck` before every commit.
- One purpose per branch; delete the branch after merge.

## Secrets & env hygiene
- `.env.local` is gitignored and never committed. `.env.example` documents the var names with empty placeholders.
- Vercel env vars (`RESEND_API_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`) are set per-environment; keep production/preview/development consistent.
- Rotate any token shared outside a private channel — see rotation table in .
- The Brain stores the *map* of where secrets live, never the secrets themselves.

## Monitoring (keep it light)
- Deploy status: Vercel dashboard; production deploy per push to `main`.
- Check the live site after any deploy that touches layout/CSS/contact form.
- Contact form failures log in Vercel function logs (`app/api/contact`).
- Alerting: no paging, no on-call for this project. If the site breaks, the deploy is reverted and the issue fixed before the next deploy.

## Deployment strategies (only what we use)
- **Preview per branch** — every change is reviewable before production (this IS our staging).
- **Revert-and-fix** — broken main → revert the offending commit, redeploy, fix on a branch.
- No feature flags, no blue/green, no canary, no DB migrations (static site, no database).

