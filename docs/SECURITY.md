# Security — Rhine Solution

> Security model and hardening for the site. Living document.

## Threat model

The site is public and static-first. The main attack surface is the **contact
form** (spam, abuse, injection) and the **admin/ops surface** (tokens, DNS,
deploy access). There is no user database, no auth, and no stored PII beyond
what a visitor submits through the contact form.

## Verification (bot protection)

- **Turnstile** guards the contact API and the entry gate.
- Verification is **server-side only** (`app/api/contact` → `siteverify`). The
  client widget is a proof-of-work; the API is the enforcement point.
- The entry gate is cosmetic anti-bot layer; it never hard-locks humans (it
  falls back to "Continue" when the widget cannot load). Real protection is on
  the form API.

## HTTP security headers

Set in `next.config.js` (verify current values when changing config):

- **HSTS** (`Strict-Transport-Security`)
- **X-Frame-Options** / `frame-ancestors`
- **X-Content-Type-Options: nosniff**
- **Referrer-Policy**
- **Permissions-Policy**

## Secrets hygiene

- **No secrets in the repository.** Real values live in Vercel env vars;
  `.env.example` documents names only.
- `.env.local` is gitignored and never committed.
- API tokens live in OS user env vars (PowerShell), not in files.
- Any token shared in a non-private channel must be rotated (see the private
  Brain's rotation checklist).

## Input handling (contact API)

- All fields are trimmed, length-capped, and HTML-escaped before email
  rendering (no reflected HTML).
- Email is validated server-side.
- Turnstile token is verified before the email is sent.

## Data & privacy

- No analytics, no cookies, no trackers (decision pending).
- The privacy policy (public) documents data handling for contact
  submissions.
- Contact submissions are sent by email to `info@rhinesolution.com`; they are
  not stored in a database.

## Dependencies

- Dependabot keeps `package-lock.json` current; CI runs lint/typecheck/build so
  a bad dependency fails before merge.
- GitHub's built-in CodeQL scan runs on pushes to `main` as a second layer.

## Reporting

Report a security issue privately via `security@rhinesolution.com`.