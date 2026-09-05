---
tags:
  - brain
  - project
created: 2026-08-10
updated: 2026-09-05
status: in-progress
stack: Next.js 15 + TypeScript + pure CSS + Three.js
type: concept
description: C:/Users/teoal/Projects/projects/rhinesolution-website
---
# Project: Rhine Solution

> **Rhine Solution — Custom Web Development.** Personal portfolio + client acquisition site.

## Location
`C:/Users/teoal/Projects/projects/rhinesolution-website`

## Stack
- **Next.js 15** (App Router) + TypeScript
- **Pure CSS** with custom properties
- **Three.js** WebGL canvas — 4 scroll-driven scenes (Drift / Lines / Roads / Glow)
- **@theatre/core** per-scene keyframeable objects scrubbed from scroll
- **Lenis** smooth momentum scroll
- **No audio** (removed by design — see design rules)
- **Resend** transactional email for the contact form (server route `app/api/contact`)
- **Domain**: `rhinesolution.com` (Hostinger, DNS → Cloudflare → Vercel)
- **Deployment**: Vercel (auto-deploy from `main` on GitHub push)

## Brand (current, dark glass + WebGL)
- **Always-dark navy palette**:
  - Background: `#070e24`
  - Surface: `rgba(13, 26, 56, 0.6)` (glass panels)
  - Ink: `#F2F5FF`
  - Blue (CTA): `#2C6BFF`
  - Blue soft (accent): `#7EA7FF`
  - Border: `rgba(126, 167, 255, 0.18)`
- **Typography**: Rijksoverheid fonts (self-hosted `.ttf` via `next/font/local`) - `--font-rijks-sans`, `--font-rijks-heading` (bold, all h1-h4), `--font-rijks-serif` (+italic). Replaced Google Fonts (Inter + Cormorant Garamond) in the typography overhaul `faadbfe` (2026-09-05). No external font requests.
- **No light mode** — by design, so the WebGL background is always visible through translucent surfaces.

## Site features
- ✅ WebGL hero with 4 scenes + scroll-driven crossfade
- ✅ Lenis smooth scroll + Theatre.js scene choreography
- ✅ Custom cursor (auto-disabled on touch / reduced-motion)
- ✅ Intro loader (RS mark reveal, once per session)
- ✅ Per-letter hero reveal animation
- ✅ Project hover preview overlay
- ✅ Section dividers (full-viewport cinematic breaks)
- ✅ CSS view-transitions for smooth page nav
- ✅ **Mobile**: sticky top header with hamburger → full-screen menu overlay
- ✅ **Mobile**: sticky bottom action bar (Home / Projects / Team / Contact)
- ✅ Bilingual EN/NL via `content/{locale}.json`
- ✅ **Language switcher** (EN/NL toggle in nav + mobile header, PR #3 2026-09-04)
- ✅ Working contact form (Resend, sender `noreply@rhinesolution.com` → recipient `info@rhinesolution.com`)
- ✅ **Turnstile** human verification (entry gate + contact form). Widget allowlist (Cloudflare, updated 2026-09-04): `rhinesolution.com`, `www.rhinesolution.com`, `rhinesolution-website.vercel.app`, `rhinesolution.vercel.app`. Cloudflare rejects wildcard domains. Entry gate has a **Continue fallback** on widget error so humans are never hard-locked on non-allowlisted URLs (e.g. random per-deploy `*.vercel.app` URLs).
- ✅ Security headers (HSTS, X-Frame-Options, etc.) in `next.config.js`
- ⚠️ **DFIR** pages exist (`/dfir`, `/dfir/lab041`) but were **removed from nav/footer by PR #3 (2026-09-04)** — decision pending on whether to restore the nav link
- ✅ JSON-LD structured data (Organization, WebSite, BreadcrumbList)
- ✅ SEO: `metadataBase`, OG (PNG), Twitter, `alternates.languages`, canonical per page, sitemap with hreflang
- ✅ a11y: AA contrast on hero button, proper heading hierarchy
- ✅ **Public Brain** at `/projects/brain` — curated knowledge base with file-tree sidebar + explorer + per-note pages, synced from the vault via `npm run brain:publish` (shipped 2026-09-04)

## Company email accounts (`@rhinesolution.com`)
| Address | Purpose |
|---|---|
| `info@rhinesolution.com` | General info / contact form default recipient |
| `contact@rhinesolution.com` | Contact inquiries (alias of info) |
| `support@rhinesolution.com` | Customer/technical support |
| `business@rhinesolution.com` | Business development / partnerships |
| `soc@rhinesolution.com` | Security operations |
| `dev@rhinesolution.com` | Dev team |
| `admin@rhinesolution.com` | Administration |
| `alert@rhinesolution.com` | Automated alerts (monitoring) |
| `abuse@rhinesolution.com` | Abuse reports |
| `tools@rhinesolution.com` | Internal tooling |

> All addresses resolve via Hostinger mail; SPF/DMARC/DKIM configured in Cloudflare DNS.

## Brand assets (source of truth)
- **Source location**: `~/Documents/School/ROC Aventus/Year 1 - Completed/R&S\`
- **Files**:
  - `Logo/icon.svg` — primary mark (180×180, used as favicon/apple-icon source)
  - `Logo/profile.jpg` — square brand mark (used in social banners)
  - `Logo/Web logo.png` — web header logo
  - `Logo/Social media banner.png` — 1500×500 social header
  - `Logo/social media logo.png` — square social avatar
  - `Logo/Animation Banner.gif` — animated banner
  - `Logo/Black Textured Background.png` — texture overlay
- **Repo derivatives** (auto-generated):
  - `public/favicon.svg` (180×180, navy bg + ink mark)
  - `public/apple-icon.svg` (180×180, same)
  - `public/og-image.svg` (1200×630, brand mark + tagline)

## Status
- ✅ Foundation: Next.js 15 + design system + i18n
- ✅ Core pages: home, projects, project detail, team, team member, about, news, contact, music portal
- ✅ WebGL scene system + scroll choreography
- ✅ Mobile header/footer (sticky bar + full-screen menu)
- ✅ Turnstile CAPTCHA (entry gate + contact form)
- ✅ SEO + social cards (PNG og-image) + hreflang + JSON-LD
- ✅ Robustness: 404, error, loading, global-error pages
- ✅ Security headers (HSTS, X-Frame-Options, etc.) in `next.config.js`
- ✅ Contact form backend via Resend
- ⏳ Continuous improvement

## Deployment state
- ✅ GitHub: `Rhine-Solution/rhinesolution-website` (origin, repoId `1346704492`)
- ✅ Vercel project ID: `prj_zvB5YrqN8jSgnQR51uYHEFpXuzC3` (account `rhinesolution-2251`, name `rhinesolution`)
- ✅ Auto-deploys from `main` on push; production branch `main`
- ✅ Custom domain `rhinesolution.com` aliased on every prod deploy
- ✅ SSL: provisioned by Vercel
- ✅ Mail DNS in Cloudflare: MX mx1/mx2.hostinger.com, SPF, DMARC, DKIM
- ✅ `RESEND_API_KEY` configured in Vercel env (production / preview / development)
- ✅ Contact form delivers via Resend (`app/api/contact/route.ts`)
  - **Current**: sender `noreply@rhinesolution.com`, recipient `info@rhinesolution.com` (domain verified 2026-09-04)
- ✅ **CI**: GitHub Actions `.github/workflows/ci.yml` — lint + typecheck + build on every PR and push to `main` **and** `dev` (enforces the git workflow in repo `AGENTS.md`)
- ✅ **Branches**: `main` (production) + `dev` (preview/staging — gets its own Vercel preview URL)
- ✅ **Live site**: https://rhinesolution.com

## Latest commits
- `c6b49a1` — docs: record public brain feature
- `b354caf` — feat(brain): own /projects/brain path + sitemap entries
- `299a7c5` — feat(brain): static note pages with breadcrumbs
- `f9d6391` — feat(brain): explorer page with folder grouping
- `5d96a12` — feat(brain): file-tree sidebar with mobile drawer
- `10b62b6` — feat(brain): markdown renderer with custom dark-glass styling
- `675b120` — feat(brain): add data layer (manifest, note content, wiki-link resolution)
- `b175c41` — feat(brain): add publish script with fail-closed secret scan
- `1879854` — Merge PR #3: language switcher + DFIR nav removal
- `d814bcd` — feat: remove DFIR from nav + add language switcher
- `df3c07f` — docs: add public engineering docs + fix private-path leak in AGENTS.md
- `5968d45` — fix(gate): never hard-lock humans on widget failure + add dev branch to CI
- `b109383` — docs(agents): add mandatory git workflow (AGENTS.md)
- `a2f6459` — fix(site): use white text on hero button for AA contrast
- `126a491` — feat(site): link DFIR in nav, add JSON-LD, verified Resend sender, a11y + OG fixes
- `98ff8b7` — feat(site): add Cloudflare Turnstile human verification to entry + contact form
- `651a3bc` — Merge feat/hubtown-clone-and-glass-redesign into main
- `fea6f07` — feat: hubtown-style WebGL scene transitions + dark glass theme

## Design rules
1. Dark navy glass + WebGL — never break the background visibility
2. No section borders, no backdrop-blur that hides the canvas
3. Glass-panel pattern: `rgba(13, 26, 56, 0.6)` + `border-radius: var(--radius-lg)` everywhere
4. Mobile-first: tap targets ≥44px, full-screen menus, sticky action bar
5. Accessibility: keyboard nav, focus styles, reduced-motion fallbacks
6. **No breaking changes** (improve forever rule)

## Links
- Back to  ·  ·  · [[12-Backlog]]

## News page - current state (2026-09-05)

- **News v2 merged to main** via PR #4 (`7d521b3`): per-locale Markdown posts (`content/news/{en,nl}/`), RSS feed `/news/feed.xml`, ISR 2h, `npm run news:update` / `news:accept` draft generator.
- **ZeroMeister reworked the news page on top** (`e9ba091`, branch `feat/global-news-rss`): added **paginated global RSS news** (10/page, Newer/Older) from 8 feeds (HN, Next.js, MDN, Smashing, The Verge AI, TechCrunch AI, JavaScript Weekly, Google Developers Blog), each item links to a **detail page** `/news/<slug>` with a "Read the full article" external button. Replaced my `TrendsSection`/`news-trends.ts` with `global-news.ts` + `GlobalNewsSection`. Own posts also link to detail pages again (`NewsCard` is a `<Link>`).
- **UX conflict (OPEN)**: user explicitly requested all-inline news with **no navigation away**; ZeroMeister's rework re-introduced links to detail pages and external "read the full article" buttons. Needs a decision: keep colleague's paginated global news, or restore the inline/no-link preference (or a hybrid: inline own posts + inline excerpt global news).
- Chat assistant shipped with the i18n/chat merge (`87db6f6`): `ChatWidget` + `app/api/chat` calling Gemini (`GEMINI_API_KEY`, model `gemini-3.6-flash`). Fixed 2026-09-05: env var was corrupted (PowerShell pipe appended `\r\n`) - set clean value via Vercel API for production/development/preview and redeployed. See Lessons-Learned.
- Locales are now 7: en/nl/de/fr/es/it/zh (colleague added 5). **FLAG**: the new locale JSON files contain irreversible mojibake (U+FFFD) - site shows garbled text in those locales; needs a proper re-translation/re-encoding pass.

## Latest commits (2026-09-05)
- `e9ba091` - feat(news): paginated global RSS news with detail pages
- `476ce19` - feat(news): add paginated global RSS news with detail pages
- `7d521b3` - Merge PR #4: news page v2
- `44633c2` / `fe79efc` - docs/feat: all-inline news + on-site dev trends (my change, later reworked by colleague)
- `c664dc6` - feat(news): support 7 locales and reconcile with i18n+chat work
- `87db6f6` - feat(i18n+dfir+chat): multi-language locales, localized DFIR report, AI chat assistant
- `b4a9b3e` - feat(chat): add AI assistant widget with site navigation
- `2d6d083` - feat(i18n): add de/fr/es/it/zh locales and localize DFIR report

## Deployment addendum (2026-09-05)
- Vercel env: `GEMINI_API_KEY` set (production/development/preview, encrypted, clean value). Env vars only apply to deployments created after they are set - after any env change run `vercel redeploy`.
- Chat live on production: POST /api/chat returns SSE stream (verified 200).
- `760b3b7` - fix(colophon): document Rijksoverheid fonts, drop Google Fonts mention (PR #5, merged 2026-09-05, all 7 locales, live verified)
- Related plans:  ·  · 
