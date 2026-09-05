# Deployment — Rhine Solution

> How changes reach the live site. Living document.

## Environments

| Branch | Vercel environment | Purpose |
|---|---|---|
| `main` | Production (`rhinesolution.com`) | The live site. Push = deploy. |
| `dev` | Preview | Staging/integration; gets its own `*.vercel.app` URL |
| feature branches | Preview | Per-PR review URL |

The production branch is `main`. Every push to `main` triggers a Vercel
deployment automatically; `rhinesolution.com` is aliased to that deployment.

## Release flow (the git workflow)

1. Work on a feature branch off up-to-date `main` (`feat/<name>`).
2. Before committing: `npm run build` **and** `npm run typecheck` must pass.
3. Push the branch; GitHub Actions runs **CI** (lint + typecheck + build) and
   Vercel creates a **preview** deployment.
4. Open the preview URL, verify, then merge to `main`.
5. Merging to `main` runs CI again and deploys production.

**Never push directly to `main`.**

## CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every PR and push to `main` **and** `dev`:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

A branch that fails any of these must not be merged.

## Rollback

If a production deployment is broken:

1. Vercel → Deployments → find the last good deployment → **Promote**.
2. `rhinesolution.com` points at the good build again.
3. Revert or fix the offending change on a branch, then re-merge.

Git history is the source of truth; the previous deployment is one click away.

## Environment variables

Required in Vercel (all environments):

- `RESEND_API_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `GEMINI_API_KEY`

Keep production / preview / development consistent.

## Manual deploy (emergency)

```bash
vercel --prod
```

Rarely needed — normal deploys come from pushes to `main`.
