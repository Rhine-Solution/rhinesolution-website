# Stack — Rhine Solution

> Why each piece is here, and the key decisions. Living document.

## Core stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 15** (App Router) + TypeScript | SSR/SSG for SEO, serverless API, one deployable unit |
| Styling | **Pure CSS** (custom properties) | No framework lock-in; full control of the glass/WebGL theme |
| 3D / motion | **Three.js + @theatre/core + Lenis** | Scroll-driven WebGL scenes and smooth scroll |
| Deployment | **Vercel** | Zero-config, auto-deploys from `main`, preview URLs per branch |
| Email | **Resend** | Simple transactional API; domain `rhinesolution.com` verified |
| Human verification | **Cloudflare Turnstile** | Bot protection on the contact API + entry gate |
| DNS / CDN | **Cloudflare** | Zones `rhinesolution.com`; Turnstile widget + edge |
| i18n | In-house `content/{locale}.json` | No extra dependency; two locales only |
| CI | **GitHub Actions** | Lint + typecheck + build on every PR/push to `main`/`dev` |

## Key decisions

### Next.js App Router over Pages Router
Chosen for RSC, route groups (`app/[locale]`), and modern metadata/sitemap
helpers. The legacy `i18n` config key is unsupported in App Router — locale is a
path segment.

### Pure CSS over Tailwind / CSS-in-JS
The brand is a specific always-dark WebGL look with translucent surfaces. CSS
custom properties give the design system without a build-time dependency or
runtime style injection. Design tokens live in `styles/globals.css`.

### Vercel over self-hosted / Hostinger VPS
The site is static-first with two small serverless functions. Vercel provides
edge rendering, preview deployments, and TLS for free effort. `main` push =
production deploy; `dev` push = preview.

### Resend over SMTP / other providers
Clean API, verified domain deliverability, no infrastructure to operate. Sender
`noreply@rhinesolution.com` → recipient `info@rhinesolution.com`.

### Turnstile over reCAPTCHA
Free, privacy-friendly, no cookie banner, server-verifiable. Domain-locked; on
non-allowlisted URLs the gate shows a Continue fallback.

## Runtime versions

- Node 22 (see `.nvmrc`).
- Managed by `package-lock.json` (use `npm ci` in CI and locally).

## Environment variables

Documented in `.env.example`:

- `RESEND_API_KEY` — contact form email.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — client-side Turnstile widget.
- `TURNSTILE_SECRET_KEY` — server-side Turnstile verification.

Set per-environment in Vercel (production / preview / development).
