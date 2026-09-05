# Architecture — Rhine Solution

> Living document. Update it in the same PR that changes what it describes.

## Overview

Rhine Solution is a public marketing/portfolio site for a custom web
development studio. It is a **static-first Next.js application** rendered at the
edge on Vercel, with a small serverless API for the contact form.

Primary goals:

- Fast, indexable, bilingual (EN/NL) content.
- A distinctive always-dark WebGL "glass" brand identity.
- A bot-proof contact path (Turnstile) without a fragile page gate.
- Long-term maintainability by a small team (human + AI agents).

## Runtime model

- **Next.js 15, App Router** on Node runtime, deployed to **Vercel**.
- Most routes are **SSG/prerendered** (static content) or **SSR on demand**.
  The home page and content pages are server-rendered so crawlers see real HTML.
- **Serverless functions**: `app/api/contact` (Resend email) and
  `app/api/verify-human` (Turnstile) are the only dynamic endpoints.
- **No database.** All content lives in `content/{locale}.json` and is loaded at
  build/render time.

## Project layout

```
app/
  [locale]/          # localized pages (home, projects, team, about, contact, …)
    layout.tsx        # per-locale layout
  api/                # serverless functions (contact, verify-human)
  dfir/               # DFIR / cyber case-study section
  music/              # music portal sub-site
  layout.tsx          # root layout (lang, metadata)
  sitemap.ts robots.ts
content/
  en.json nl.json     # all copy, i18n-ready
src/
  components/         # React components (Nav, Footer, EntryGate, Turnstile, …)
  components/scene/   # WebGL scene system (Three.js + Theatre.js + Lenis)
  lib/                # i18n, seo, socials, turnstile helpers
styles/globals.css    # design tokens + global styles (always-dark)
```

## Design system

- **Always-dark navy** (`#070e24`) + WebGL background. No light theme by
  design, so translucent "glass" panels stay readable. `styles/globals.css`
  holds the design tokens — changes there need review.
- Typography: Cormorant Garamond (display) + Inter (body).
- No CSS-in-JS, no Tailwind — pure CSS custom properties.

## Key flows

### Contact form
1. Client renders Turnstile widget (site key).
2. `POST /api/contact` verifies the token via `siteverify`, then sends via
   Resend from `noreply@rhinesolution.com` → `info@rhinesolution.com`.
3. Verification is **server-side only**; the API is the real bot boundary.

### Human verification gate
- An `EntryGate` component overlays the home page.
- Turnstile is domain-locked to `rhinesolution.com` (+ stable Vercel aliases).
- On any widget failure the gate shows a **Continue fallback** so a human is
  never locked out. The gate never blocks crawlers from server-rendered HTML.

### Internationalization
- `app/[locale]/` with `generateStaticParams` for `en`/`nl`.
- `content/{locale}.json` holds all strings; components read via `getContent`.
- `<html lang>` is set per locale.

### Public Brain
- Publishes a curated knowledge base at `/projects/brain` from the `brain/`
  folder via `npm run brain:publish`.
- A custom Markdown renderer (highlight.js tokens, no layout) turns each note
  into a static page; a file-tree sidebar + explorer page provide navigation.
- Content is curated in the vault and synced by the publish script; the site
  just renders what `brain/` contains.

### News & updates
- News posts are per-locale Markdown files in `content/news/{en,nl}/` with
  frontmatter (`date`, `title`, `excerpt`, `category`); `src/lib/news.ts`
  reads them at build time.
- `/news` is ISR (revalidates every 2h) and shows posts + a **Dev trends**
  widget: the top 5 headlines from a curated RSS/Atom feed list
  (`src/lib/news-feeds.ts`), fetched server-side without API keys.
- Posts get static detail pages at `/news/<slug>` and an RSS 2.0 feed at
  `/news/feed.xml` (per locale).
- `npm run news:update` generates review-first drafts from conventional
  commits (feat/fix/refactor/perf since the last news date); `npm run
  news:accept` promotes accepted drafts into both locales.

## Trade-offs and notes

- Heavy WebGL/Three.js loads on the root layout; route-scoping it (music site
  needs none of it) is a known improvement — see `ROADMAP.md`.
- No analytics yet (decision pending).
- `THREE.Clock` deprecation flagged; plan to migrate to `THREE.Timer`.
