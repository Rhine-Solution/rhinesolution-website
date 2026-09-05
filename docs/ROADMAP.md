# Roadmap — Rhine Solution

> Public-facing plan. Items move from "planned" to "done" as they ship. The
> private Brain holds the full working backlog; this is the public version.

## Now (in progress / queued)

- **3D scene enrichment** — HDRI environment lighting, CC0 materials, and a
  custom fragment-shader scene on the existing WebGL scenes (curated from the
  3d-resources hub analysis).
- **Site search** — client-side search (minisearch) over The Brain + News via a
  build-time index, now that the content-validation gate is in place.
- **Brain hardening** — frontmatter/schema validation for the vault notes + a
  shared domain-vocabulary note.
- **Complete the sitemap** — add `/dfir`, `/dfir/lab041`, and music subpages.
- **Cloudflare crawl settings check** — confirm the AI-bot default (effective
  Sep 15, 2026) does not block Googlebot.

## Shipped (recent)

- **Content integrity gate** — `content.schema.json` + CI validation; all 7
  locale files audited clean (no mojibake / U+FFFD).
- **`llms.txt`** — AI-agent readable index of the site.
- **News page v2** — per-locale Markdown posts, RSS feed (`/news/feed.xml`),
  and paginated global development news with detail pages (ISR refresh).
- **AI chat assistant** — Gemini-powered widget with on-site navigation
  (`/api/chat`).
- **7 locales** — en/nl/de/fr/es/it/zh, localized DFIR report, Rijksoverheid
  fonts (self-hosted), corrected colophon copy.
- **Public Brain** — curated knowledge base at `/projects/brain` (publish
  script + custom Markdown renderer + file-tree sidebar).

## Next (worth doing soon)

- **Services page** (EN/NL) — what we sell, how we work, engagement model
  (fixed scope vs retainer). Biggest conversion + SEO gap.
- **Trust signals** — client case studies with measurable outcomes, testimonials,
  a process page.
- **Local signals** — city coverage on the contact page, `LocalBusiness` schema
  with address/KVK, populate `sameAs`.
- **Performance** — route-scope the heavy WebGL JS (keep it off the music
  sub-site), lazy-load the hero scene, honor `prefers-reduced-motion`.
- **DFIR content** — decide: expand into a localized case-study series, or
  unpublish the "confidential" label while public.
- **Legal/business identity** — postal address + KVK on legal pages (GDPR
  controller), consolidate mailboxes.

## Later (bigger efforts / ideas)

- **Content depth** — problem/approach/outcome case studies, DFIR methodology
  page, FAQ; 4–8 substantive pages in both languages.
- **Per-page social cards** — generated OG images per page (e.g. via `@resvg`)
  instead of one PNG.
- **Accessibility hardening** — axe audit: gate dialog focus management,
  duplicate `<h1>` on home, custom cursor occlusion.
- **Modernize Three.js** — migrate deprecated `THREE.Clock` → `THREE.Timer`;
  watch WebGPU backend support.
- **Brain freshness** — verification timestamps + a stale-note review queue;
  formalized content "passes" for vault maintenance.
- **WebGL experiments** — Gaussian splatting / neural rendering as a future
  scene direction.

## Never / rejected

- Light theme (see `ADRS.md` — rejected).
- Audio (see `ADRS.md` — rejected).
- Removing the entry gate (kept by owner decision; Turnstile stays on the
  contact API regardless).

## History

See `CHANGELOG.md` for what already shipped.