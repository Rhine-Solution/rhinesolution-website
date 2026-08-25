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

## See also
- `~/Projects/obsidian-vault/Brain/Projects/rhinesolution-architecture.md`
- `~/Projects/obsidian-vault/Brain/17-Infrastructure.md`
