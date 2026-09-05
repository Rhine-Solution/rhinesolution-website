---
tags:
  - brain
created: 2026-08-10
updated: 2026-09-04
type: reference
description: P0 (quick wins, low risk):
---
# 12 - Backlog

> The approved improvement list (2026-08-10). Check items off as they land. Ideas die here, not in chat.

## Approved batch 2026-08-10 (50 items, no duplicates)
### A. Brain content
- [x] A1 — this note
- [x] A2 — [[13-Performance]]
- [x] A3 — [[14-Monitoring]]
- [x] A4 — project note for `fullstack/`
- [x] A6 — `verified:` tags on time-sensitive claims
- [x] A8 — expand  with verified, dated links

### B. Root / workspace
- [x] B11 — `scripts/audit-brain.ps1`
- [x] B12 — `.editorconfig`
- [x] B13 — root `README.md` for the workspace
- [x] B14 — `templates/` real Next.js+Supabase scaffold

### D. Backend / fullstack
- [x] D31 — `/api/health` + echo route
- [x] D35 — Vitest + first tests
- [x] D36 — GitHub Actions CI

### E. rhinesolution site (replaces removed barbershop items)
- [x] E1 — Contact form via Resend (verified sender)
- [x] E2 — Cloudflare Turnstile (entry + contact)
- [x] E3 — DFIR section (nav + pages)
- [x] E4 — JSON-LD structured data
- [x] E5 — a11y AA + heading hierarchy
- [x] E6 — Social OG image (PNG rasterized)

### F. DevOps / workflow
- [x] F42 — deployment (decided: Vercel)
- [x] F43 — Vercel preview deploys

### H. Site research backlog (2026-09-04 — deep research via subagent; for approval before building)
P0 (quick wins, low risk):
- [ ] H1 — Fix `<html lang>` per locale (root layout hardcodes `en`; Dutch pages indexed as English). S.
- [ ] H2 — Add missing URLs to sitemap: `/dfir`, `/dfir/lab041`, music subpages (`/music/top-songs`, `/music/genres`, `/music/top-artists`). S.
- [ ] H3 — Fix stale colophon claim (says Resend sandbox; actually verified `noreply@rhinesolution.com`). S.
- [ ] H4 — Cloudflare zone: verify AI-bot crawl defaults (change effective 2026-09-15) so Googlebot isn't blocked. S (zone config, not repo).
P1 (worth doing next):
- [ ] H5 — Localized Services page (what we sell, process, engagement model). M.
- [ ] H6 — Trust signals: client case studies with outcomes, testimonials, process page. S-M.
- [ ] H7 — Local/regional: city coverage on contact, `LocalBusiness` schema + KVK, fill `sameAs`. M.
- [ ] H8 — Route-scope heavy JS: keep Three.js/Lenis/cursor/loader off music sub-site; lazy-load WebGL; honor `prefers-reduced-motion`. M.
- [ ] H9 — DFIR: expand into localized case-study series or unpublish ("Vertrouwelijk" label while public undermines credibility). S-M.
- [ ] H10 — Business identity on legal pages: postal address + KVK (GDPR controller), consolidate inboxes. S.
P2 (bigger efforts / ideas):
- [ ] H11 — Content depth: case studies, DFIR methodology page, FAQ — 4-8 substantive pages in both languages. L.
- [ ] H12 — Per-page OG images (currently single PNG; verify 1200×630). M.
- [ ] H13 — Accessibility hardening: gate `aria-modal` focus management, duplicate `<h1>` on home, custom cursor occlusion; run axe. M.
- [x] H14 — Public Brain (explorer + per-note pages at `/projects/brain`) — `npm run brain:publish` keeps `brain/` in sync from the vault. D.
Note: entry gate is KEPT by user decision (research confirms crawl risk is low — SSR content + client overlay). Turnstile stays on contact form.

