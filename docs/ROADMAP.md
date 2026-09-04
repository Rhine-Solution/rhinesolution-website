# Roadmap — Rhine Solution

> Public-facing plan. Items move from "planned" to "done" as they ship. The
> private Brain holds the full working backlog; this is the public version.

## Now (quick wins, low risk)

- **Correct `<html lang>` per locale** — Dutch pages are currently announced
  and indexed as English.
- **Complete the sitemap** — add `/dfir`, `/dfir/lab041`, and music subpages.
- **Fix stale colophon copy** — remove the "sandbox" wording (email is verified
  and live).
- **Cloudflare crawl settings check** — confirm the AI-bot default (effective
  Sep 15, 2026) does not block Googlebot.

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
- **Per-page social cards** — distinct OG images per page (currently one PNG).
- **Accessibility hardening** — axe audit: gate dialog focus management,
  duplicate `<h1>` on home, custom cursor occlusion.
- **Modernize Three.js** — migrate deprecated `THREE.Clock` → `THREE.Timer`.

## Never / rejected

- Light theme (see `ADRS.md` — rejected).
- Audio (see `ADRS.md` — rejected).
- Removing the entry gate (kept by owner decision; Turnstile stays on the
  contact API regardless).

## History

See `CHANGELOG.md` for what already shipped.