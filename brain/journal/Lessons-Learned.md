---
tags:
  - brain
  - journal
created: 2026-08-10
updated: 2026-09-04
type: reference
description: Addendum: PowerShell \Add-Content\ (PS 5.1) also writes non-ASCII as ANSI (e.g. \··\ -> lone 0xB7, invalid UTF-8). Always write notes via Node \writeFileSync(ut
---
# Lessons Learned

> Every bug, outage, and surprise is a lesson. Log it here so it only happens once.

## Template
```markdown
## YYYY-MM-DD — Short title
- **What happened**: ...
- **Root cause**: ...
- **Lesson**: ...
- **Prevention**: linked to [[06-Security]] / [[08-Deployment-DevOps]] etc.
```

## Log

## 2026-09-02 — Site shipped to fully-functional: mobile, SEO, robustness, contact form
- **What happened**: After hubtown-style WebGL + glass redesign, did a full-site mobile-readiness + completeness audit. Found: no explicit viewport export, audio-toggle tap target was 40px (under 44px minimum), nav hover-driven (broken on touch), no OG/Twitter/canonical/hreflang, no 404/error/loading pages, no security headers, no contact-form backend (Resend key now configured). Also added a sticky mobile header (hamburger → full-screen menu) + sticky bottom action bar.
- **Root cause**: Mobile-first was partially deferred; desktop island was forced-open on small screens but not replaced with a proper mobile header. SEO baseline existed (`sitemap`, `robots`) but no per-page OG / language alternates. Forms were "socials only" because no backend was wired.
- **Lesson**: A "fully functional site" checklist must include (a) mobile header AND footer, (b) `viewport` + `themeColor` exports, (c) per-page OpenGraph + Twitter + canonical + `alternates.languages`, (d) sitemap with hreflang, (e) 404 + error + loading routes, (f) security headers via `next.config.js`, (g) a working contact form (Resend for transactional email). Don't ship without these.
- **Prevention**:  updated with the company-email table + brand-asset source path. Future sites: use this build as the checklist template. Mobile header pattern: stick to bottom (z-index ≥100), full-screen hamburger overlay, `usePathname()` to derive `current` so the layout can mount it once.

## 2026-09-02 — Resend free-tier sandbox has a 3-tier verification ladder
- **What happened**: Set `RESEND_API_KEY` on Vercel, deployed. Contact form returned 502. Traced it: Resend requires the sender domain to be verified BEFORE the email sends. Switched to `onboarding@resend.dev` → got 502 with "You can only send testing emails to your own email address (admin@rhinesolution.com)". Switched the recipient to `admin@` → delivered.
- **Root cause**: Resend's free tier has three nested gates — (1) sender must be `onboarding@resend.dev` until you verify a domain; (2) recipient must equal the Resend account owner's email until you verify a domain; (3) only after domain verification can you send from any `@verified-domain` address to any recipient.
- **Lesson**: When wiring Resend without a verified domain, BOTH the sender AND recipient must be Resend's onboarding address + the account owner's email. To unlock normal production sending, verify the domain (DKIM TXT + SPF TXT + MX records) — the route code never has to change beyond flipping `FROM_ADDRESS` and `RECIPIENT`. **Always log the actual Resend error in the route response** (`error.message`) during dev — the silent "Could not send message" hides whether it's a domain/auth/recipient issue.
- **Prevention**: For future Resend integrations: (a) add and verify the domain BEFORE deploying the form, (b) read the `last_event` from `GET /emails?limit=1` to confirm delivery end-to-end, (c) keep the Resend error message visible in 502 responses during development so the next debug cycle is one curl call. Domain verification on Cloudflare requires `Zone:DNS:Edit` permission for the zone — a read-only scope is insufficient. See .

## 2026-09-04 — Resend domain DNS verification requires the verify endpoint, not just DNS propagation
- **What happened**: rhinesolution.com mail domain in Resend was `not_started`. Added the 3 required DNS records to Cloudflare DNS: DKIM (TXT `resend._domainkey`), SPF (MX `send` → `feedback-smtp.us-east-1.amazonses.com`), SPF (TXT `send` → `v=spf1 include:amazonses.com ~all`). The domain stayed `not_started` on public DNS even though the records propagated; after calling `POST /domains/{id}/verify` it moved to `pending` and finally `verified`.
- **Root cause**: Resend does not auto-detect DNS records instantly — you must call the verify endpoint OR wait for its polling. Records must be resolvable via public DNS (Google 8.8.8.8) before Resend will validate them. All 3 records live on the `send`/`resend._domainkey` subdomains, so they don't conflict with Hostinger's root MX/SPF.
- **Lesson**: After adding transactional-email DNS records, verify propagation with `Resolve-DnsName -Server 8.8.8.8`, then trigger the provider's verify endpoint (`POST /domains/{id}/verify`). Only switch the sender/recipient in code to the custom domain AFTER the status shows `verified`, or sends will fail.
- **Prevention**: see [[08-Deployment-DevOps]] and [[06-Security]].

## 2026-09-04 — Social platforms don't render SVG OpenGraph images
- **What happened**: The site's og-image was `og-image.svg` (1200×630). Discord, Facebook/X, WhatsApp, and Telegram do NOT render SVG as an OG/twitter:image — the social preview card shows no image. Rasterized the SVG to `og-image.png` 1200×630 via the `sharp` library (already a Next.js dependency) and pointed both `og:image` and `twitter:image` at the PNG.
- **Root cause**: Social crawlers require raster formats (PNG/JPG) for OpenGraph images; SVG is not supported even though it's valid HTML/CSS.
- **Lesson**: Generate branded social cards as PNG (or JPG) 1200×630, never SVG. Use the `sharp` npm package (present as a Next.js transitive dep) — `require('sharp')(svg, {density:150}).resize(1200,630).png().toFile(...)`.
- **Prevention**: see [[04-Frontend]].

## Links
- Next:  ··· Back to  ··· read the relevant layer note before your next task

## 2026-09-04 — Public Brain + concurrent-branch hazard
- **Lesson**: When publishing a private vault slice publicly, scrub AT PUBLISH TIME (not at render) — the committed public files must never contain private note names or tooling prose. The final review caught ``/`` in committed files and opencode/ops entries in the journal/backlog; fixed with a publish-time wiki-link scrub + `## Links` footer strip + vault curation.
- **Lesson**: Two agents working the same repo directory can branch-switch under each other (ZeroMeister checked out `feat/cybercrime-report` mid-execution, hiding `brain/` from the working tree). All work stayed safe because it was committed + pushed incrementally. Use separate worktrees when collaborating in the same directory.
- **Shipped**: public Brain at `/projects/brain` (explorer + 13 SSG note pages), `npm run brain:publish` pipeline, fail-closed secret scan, main commit `1994688`.
## 2026-09-05 - Vercel env vars set via PowerShell pipe get corrupted
- **What happened**: The AI chat widget returned 500 then 401 in production after adding GEMINI_API_KEY.
- **Root cause**: \\ | vercel env add NAME production\ stored the value with a trailing literal \\r\n\ (len 57 vs 53), making the Gemini key invalid. Also env vars only apply to deployments created after they are set.
- **Lesson**: Never pipe secrets into \ercel env add\ from PowerShell; use \--value\ or the REST API. Verify stored values by \ercel env pull\ + byte comparison.
- **Prevention**: use \ercel env add NAME production --value ...\ or PATCH /v10/projects/{id}/env/{id} with type=encrypted; after any env change, \ercel redeploy\ production. Linked to [[08-Deployment-DevOps]].

## 2026-09-05 - Windows PowerShell Set-Content writes a UTF-8 BOM that breaks frontmatter
- **What happened**: 'Fixing' Brain note frontmatter with PowerShell \Set-Content -Encoding UTF8\ prepended a BOM (\uFEFF), breaking the \^---\ frontmatter regex and failing the new validate-brain gate.
- **Root cause**: Windows PowerShell 5.1 \-Encoding UTF8\ = UTF-8 with BOM.
- **Lesson**: For text files, write with Node (\s.writeFileSync(path, s, 'utf8')\) or .NET \UTF8Encoding(false)\; strip any leading BOM when a file 'loses' its frontmatter.
- **Prevention**: the Brain pre-commit hook now catches it automatically.

## 2026-09-05 - Q1-Q13 guardrails + 3D enrichment shipped
- Content schema + CI gate (content.schema.json + AJV + encoding checks) now protects all 7 locale files; Brain notes get a pre-commit validation gate + Domain-Vocabulary + WebGL learning-path notes. llms.txt + minisearch (Brain+News) + WebGL HDRI/shader enrichment live on rhinesolution.com.

  Addendum: PowerShell \Add-Content\ (PS 5.1) also writes non-ASCII as ANSI (e.g. \··\ -> lone 0xB7, invalid UTF-8). Always write notes via Node \writeFileSync(utf8)\ or the obsidian MCP, never Add-Content/Set-Content.
