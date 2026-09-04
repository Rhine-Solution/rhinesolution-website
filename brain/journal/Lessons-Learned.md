---
tags:
  - brain
  - journal
created: 2026-08-10
updated: 2026-09-04
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

## 2026-08-10 — PowerShell BOM silently disabled all Obsidian plugins
- **What happened**: Edited `.obsidian/community-plugins.json` from PowerShell, then reloaded Obsidian. Local REST API stopped responding on :27123/:27124.
- **Root cause**: `Set-Content -Encoding UTF8` in PowerShell 5.1 writes a **UTF-8 BOM**. Obsidian's JSON parser choked on the BOM, reset the file to `[]`, and disabled every community plugin (dataview, templater, local-rest-api). A full restart just re-read the corrupt file.
- **Lesson**: Never write `.obsidian/*.json` with `Set-Content -Encoding UTF8`. Use BOM-free UTF-8: `[System.IO.File]::WriteAllText($path, $json, (New-Object System.Text.UTF8Encoding($false)))`.
- **Prevention**: after writing any Obsidian config file, restart Obsidian and confirm `community-plugins.json` wasn't reset to `[]`; check first bytes (`91,34` = `["`, not `239,187,191` = BOM). See [[11-Opencode-Integrations]].

## 2026-08-10 — Large single `edit` calls fail JSON parsing; split them
- **What happened**: Applying one big multi-section edit to `04-Frontend.md` failed repeatedly with a JSON parse error on the `edit` tool call, stalling the update.
- **Root cause**: Very large single edits (long old/new strings) can trip the edit tool's argument parsing in long sessions.
- **Lesson**: Keep individual `edit` calls small and focused. For multi-section updates, split into several targeted edits (one section per call) instead of one giant one.
- **Prevention**: if an `edit` fails to parse, retry with smaller chunks before assuming the file changed.

## 2026-08-12 — Cloudflare custom token can be valid+active yet see zero zones
- **What happened**: Built a custom API token (Zone: WAF/Zone Settings/Zone — Edit, scoped "Rhine Solution" account / All zones). `/user/tokens/verify` returned active; `/zones` and `/accounts` returned empty; the known `rhinesolution.com` zone ID returned `9109 Unauthorized`.
- **Root cause**: The token was scoped to an account that does not actually own `rhinesolution.com`. Zone ownership in Cloudflare is per-account; a custom token inherits visibility only from the accounts/zones in its Resources section. The "Rhine Solution" account in the picker was the wrong one.
- **Lesson**: Before trusting a Cloudflare token, verify zone↔account ownership via the dashboard's top-left **account switcher** while viewing the zone. The `rhinesolution.com` zone may live in a different (e.g. personal) account from the one you assumed. `/zones?name=…` should return non-empty for a token that can edit that zone.
- **Prevention**: When creating Cloudflare tokens in [[17-Infrastructure]] flow, open the target zone first, note the account name in the switcher, then select *that exact* account in the token's Zone Resources step. If unsure, just use the dashboard click-path — it bypasses the whole scoping dance. See [[17-Infrastructure]] and [[11-Opencode-Integrations]].

## 2026-08-12 — opencode env vars need a full restart, not just setx
- **What happened**: Ran `setx CLOUDFLARE_API_TOKEN "…"` in PowerShell; got `SUCCESS: Specified value was saved.` but the next API call from inside opencode still used the old token. Even after the user said "I restarted fully" the env looked wrong at first.
- **Root cause**: opencode reads env vars once at process startup. `setx` writes to the registry, not the current process's environment — so the running opencode session keeps the old value until it is closed and reopened. Sometimes a "soft" reload (window restore) doesn't re-read env either; a hard quit + relaunch is needed.
- **Lesson**: Treat `setx` as persistent-but-not-immediate: tell the user explicitly to **fully close and reopen opencode**, and verify by running a `Write-Output` of the env var before retrying API calls.
- **Prevention**: Whenever prompting for `setx`, include the explicit restart step in the same message and ask for confirmation before retrying. Document this in [[11-Opencode-Integrations]] env-var table.

## 2026-08-12 — Don't paste API tokens in chat transcripts
- **What happened**: User pasted a Cloudflare API token directly in chat so I could verify it. Token is now permanently in the session transcript.
- **Root cause**: Faster than going through `setx` for one verification, but the token value is now logged in a file (`opencode-session.jsonl` or equivalent) that may be archived.
- **Lesson**: For one-off verification, accept the tradeoff but flag it loudly and rotate the token afterward. For persistent use, route through `setx` + restart.
- **Prevention**: Default guidance: never paste long-lived secrets in chat. For one-shot verification, paste + rotate immediately after.

## 2026-08-10 — Brain graph audit: MOC claim was aspirational, loop didn't close
- **What happened**: The Brain note claimed "MOC pattern — every Brain note links back to [[Home]] ✅ In place", but 13/15 notes had no Home backlink; the consult loop stopped at Record with no way back to Home.
- **Root cause**: Claimed invariants were never verified against the actual graph; loop was modeled as a one-way pipeline instead of a cycle.
- **Lesson**: Verify graph invariants with a script (broken-link + backlink scan) instead of trusting prose claims; a loop needs an explicit closure edge (Record → Home).
- **Prevention**: Home is now the MOC hub — every note has `Back to [[Home]]` and a `Next:` link walking the loop (01→…→11→Lessons→Home); see [[Home]].

## 2026-09-02 — Site shipped to fully-functional: mobile, SEO, robustness, contact form
- **What happened**: After hubtown-style WebGL + glass redesign, did a full-site mobile-readiness + completeness audit. Found: no explicit viewport export, audio-toggle tap target was 40px (under 44px minimum), nav hover-driven (broken on touch), no OG/Twitter/canonical/hreflang, no 404/error/loading pages, no security headers, no contact-form backend (Resend key now configured). Also added a sticky mobile header (hamburger → full-screen menu) + sticky bottom action bar.
- **Root cause**: Mobile-first was partially deferred; desktop island was forced-open on small screens but not replaced with a proper mobile header. SEO baseline existed (`sitemap`, `robots`) but no per-page OG / language alternates. Forms were "socials only" because no backend was wired.
- **Lesson**: A "fully functional site" checklist must include (a) mobile header AND footer, (b) `viewport` + `themeColor` exports, (c) per-page OpenGraph + Twitter + canonical + `alternates.languages`, (d) sitemap with hreflang, (e) 404 + error + loading routes, (f) security headers via `next.config.js`, (g) a working contact form (Resend for transactional email). Don't ship without these.
- **Prevention**: [[Projects/rhinesolution]] updated with the company-email table + brand-asset source path. Future sites: use this build as the checklist template. Mobile header pattern: stick to bottom (z-index ≥100), full-screen hamburger overlay, `usePathname()` to derive `current` so the layout can mount it once.

## 2026-09-02 — Resend free-tier sandbox has a 3-tier verification ladder
- **What happened**: Set `RESEND_API_KEY` on Vercel, deployed. Contact form returned 502. Traced it: Resend requires the sender domain to be verified BEFORE the email sends. Switched to `onboarding@resend.dev` → got 502 with "You can only send testing emails to your own email address (admin@rhinesolution.com)". Switched the recipient to `admin@` → delivered.
- **Root cause**: Resend's free tier has three nested gates — (1) sender must be `onboarding@resend.dev` until you verify a domain; (2) recipient must equal the Resend account owner's email until you verify a domain; (3) only after domain verification can you send from any `@verified-domain` address to any recipient.
- **Lesson**: When wiring Resend without a verified domain, BOTH the sender AND recipient must be Resend's onboarding address + the account owner's email. To unlock normal production sending, verify the domain (DKIM TXT + SPF TXT + MX records) — the route code never has to change beyond flipping `FROM_ADDRESS` and `RECIPIENT`. **Always log the actual Resend error in the route response** (`error.message`) during dev — the silent "Could not send message" hides whether it's a domain/auth/recipient issue.
- **Prevention**: For future Resend integrations: (a) add and verify the domain BEFORE deploying the form, (b) read the `last_event` from `GET /emails?limit=1` to confirm delivery end-to-end, (c) keep the Resend error message visible in 502 responses during development so the next debug cycle is one curl call. Domain verification on Cloudflare requires a token with `Zone:DNS:Edit` for the zone — the existing read-only token is insufficient. See [[17-Infrastructure]].

## 2026-09-04 — Resend domain DNS verification requires the verify endpoint, not just DNS propagation
- **What happened**: rhinesolution.com mail domain in Resend was `not_started`. Added the 3 required DNS records to Cloudflare DNS: DKIM (TXT `resend._domainkey`), SPF (MX `send` → `feedback-smtp.us-east-1.amazonses.com`), SPF (TXT `send` → `v=spf1 include:amazonses.com ~all`). The domain stayed `not_started` on public DNS even though the records propagated; after calling `POST /domains/{id}/verify` it moved to `pending` and finally `verified`.
- **Root cause**: Resend does not auto-detect DNS records instantly — you must call the verify endpoint OR wait for its polling. Records must be resolvable via public DNS (Google 8.8.8.8) before Resend will validate them. All 3 records live on the `send`/`resend._domainkey` subdomains, so they don't conflict with Hostinger's root MX/SPF.
- **Lesson**: After adding transactional-email DNS records, verify propagation with `Resolve-DnsName -Server 8.8.8.8`, then trigger the provider's verify endpoint (`POST /domains/{id}/verify`). Only switch the sender/recipient in code to the custom domain AFTER the status shows `verified`, or sends will fail.
- **Prevention**: see [[08-Deployment-DevOps]] and [[06-Security]].

## 2026-09-04 — Social platforms don't render SVG OpenGraph images
- **What happened**: The site's og-image was `og-image.svg` (1200×630). Discord, Facebook/X, WhatsApp, and Telegram do NOT render SVG as an OG/twitter:image — the social preview card shows no image. Rasterized the SVG to `og-image.png` 1200×630 via the `sharp` library (already a Next.js dependency) and pointed both `og:image` and `twitter:image` at the PNG.
- **Root cause**: Social crawlers require raster formats (PNG/JPG) for OpenGraph images; SVG is not supported even though it's valid HTML/CSS.
- **Lesson**: Generate branded social cards as PNG (or JPG) 1200×630, never SVG. Use the `sharp` npm package (present as a Next.js transitive dep) — `require('sharp')(svg, {density:150}).resize(1200,630).png().toFile(...)`.
- **Prevention**: see [[04-Frontend]] / [[11-Opencode-Integrations]].

## Links
- Next: [[Home]] · Back to [[Home]] · read the relevant layer note before your next task

