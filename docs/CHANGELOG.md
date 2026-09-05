# Changelog — Rhine Solution

> Notable changes, newest first. Full detail lives in git history. Keep this
> updated on every meaningful release/change.

## 2026-09-05

- **feat(news): news page v2** - per-locale Markdown posts in
  `content/news/{en,nl}/`, static detail pages, category badges, RSS feed at
  `/news/feed.xml`, and a Dev trends widget (top 5 headlines from curated
  RSS/Atom feeds, ISR refresh every 2h). `npm run news:update` /
  `news:accept` generate review-first site-update entries from conventional
  commits. (`81be5ee..3ebb694`)
- **feat(news): all-inline news + on-site dev trends** - posts render their
  full content on `/news` (no links to detail pages in the UI; detail pages
  remain only as RSS/sitemap targets), and dev trends show headline +
  excerpt + "via Source" styled on-site instead of external link lists.
  (`fe79efc`)

## 2026-09-04

- **feat(brain): public knowledge base at /projects/brain** — publish script +
  custom Markdown renderer + file-tree sidebar. (`b354caf`)
- **fix(site): entry gate never hard-locks humans** — gate now shows a
  Continue fallback when the Turnstile widget fails to load/errors (preview
  domains, adblock, transient issues). Widget allowlist updated to include
  stable Vercel aliases. (`5968d45`)
- **ci: lint/typecheck/build gate on main + dev** — GitHub Actions enforces the
  git workflow on every PR/push; added `.env.example`. (`cdb935e`)
- **docs: mandatory git workflow** — feature branches, review before merge.
  (`b109383`)

## Earlier (2026-09-04 and before)

- `a2f6459` fix(site): white text on hero button (AA contrast)
- `126a491` feat(site): DFIR nav, JSON-LD, verified Resend sender, a11y + OG fixes
- `98ff8b7` feat(site): Cloudflare Turnstile human verification
- `55175ae` feat: ZeroMeister DFIR profile (PR #2)
- `bf0b64f` fix(site): remove AI-agent + clone references

## 2026-08 / initial build

- Project scaffold: Next.js 15 + TypeScript + pure CSS + WebGL scene system
- Bilingual EN/NL content, contact form, music portal, DFIR section
- Initial deploy to Vercel; domain `rhinesolution.com` on Cloudflare DNS