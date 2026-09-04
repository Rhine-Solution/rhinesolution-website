# Agent Instructions — Rhine Solution

## Stack
- Next.js 15 (App Router) + TypeScript
- Pure CSS with custom properties
- Deploy: Vercel
- Domain: rhinesolution.com (Cloudflare DNS)

## Conventions
- Server-first (React Server Components default)
- No CSS-in-JS, no Tailwind
- Content in `content/{locale}.json` (i18n ready)
- BOM-free UTF-8 for all `.obsidian/*.json` files

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint

## Git Workflow (MANDATORY)
Follow this workflow on every change to this repo:

1. **ALWAYS work on a feature branch, never on `main`:**
   - `git checkout -b feat/<short-description>` (e.g. `feat/social-icons`, `feat/fix-navbar`)
   - Branch off the latest `main` first: `git checkout main && git pull origin main`
2. **Commit incrementally** with conventional commits: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`.
3. **Before EVERY commit**, run `npm run build` AND `npm run typecheck` — never commit a broken build.
4. **Push only to your feature branch:** `git push origin feat/<name>`. NEVER push directly to `main`.
5. **When done**, report to RAGNAROK (Discord 🤖┃rhine-ragnarok) with the branch name and a short summary, so he can review and merge.
6. **When new work arrives**, start from a fresh branch off updated `main` — never chain commits on an old closed branch.

## See also
- `~/Projects/obsidian-vault/Brain/Projects/rhinesolution-architecture.md`
- `~/Projects/obsidian-vault/Brain/17-Infrastructure.md`