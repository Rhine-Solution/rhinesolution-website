# Architecture Decision Records — Rhine Solution

> Every decision that matters is recorded here. Append — never rewrite history.
> Format: short context → decision → consequence.

## ADR-0001 · Next.js 15 (App Router) + TypeScript

**Status:** accepted

- **Context:** need SEO-friendly server rendering, a small serverless API, and
  a single deployable unit for a solo/duo team.
- **Decision:** Next.js 15 App Router with TypeScript, deployed to Vercel.
- **Consequence:** RSC-first, static-first, easy previews. Locale is a route
  segment (`app/[locale]`), not the legacy `i18n` config.

## ADR-0002 · Pure CSS with custom properties

**Status:** accepted

- **Context:** a distinctive always-dark "glass + WebGL" brand; want full visual
  control with minimal toolchain.
- **Decision:** no Tailwind, no CSS-in-JS. Design tokens as CSS custom
  properties in `styles/globals.css`.
- **Consequence:** single locked stylesheet; theme changes are deliberate.

## ADR-0003 · Always-dark design + WebGL (no light theme)

**Status:** accepted — **locked**, do not revert

- **Context:** the brand identity depends on translucent glass over a WebGL
  canvas, which requires a dark background to read.
- **Decision:** dark navy palette (`#070e24`) as the only theme. No light mode.
- **Consequence:** a light-mode toggle would break the design system and is
  explicitly rejected.

## ADR-0004 · No audio

**Status:** accepted — **locked**, do not revert

- **Context:** an audio system added complexity and no product value.
- **Decision:** audio removed entirely.
- **Consequence:** no audio code, no audio assets.

## ADR-0005 · Deploy on Vercel, production branch `main`

**Status:** accepted

- **Context:** need zero-ops deploys, TLS, and per-branch previews.
- **Decision:** Vercel; `main` auto-deploys to production, `dev` and feature
  branches get preview URLs.
- **Consequence:** push to `main` = deploy. Rollback = promote previous build.

## ADR-0006 · Resend for transactional email

**Status:** accepted

- **Context:** contact form needs reliable sending with no email infra.
- **Decision:** Resend; sender `noreply@rhinesolution.com`, recipient
  `info@rhinesolution.com`; domain verified.
- **Consequence:** deliverability managed by Resend; API key in Vercel env.

## ADR-0007 · Cloudflare Turnstile (contact API + entry gate)

**Status:** accepted

- **Context:** bot spam on the contact form; want privacy-friendly verification.
- **Decision:** Turnstile on the contact API (server-verified) and a homepage
  entry gate with a Continue fallback.
- **Consequence:** widget is domain-locked to `rhinesolution.com` (+ stable
  Vercel aliases); never hard-locks humans.

## ADR-0008 · GitHub Actions CI (lint + typecheck + build)

**Status:** accepted

- **Context:** enforce the git workflow automatically for human + AI agents.
- **Decision:** `ci.yml` runs `npm ci`, lint, typecheck, build on every PR/push
  to `main` and `dev`.
- **Consequence:** broken builds cannot merge.

## ADR-0009 · Feature branches + review before merge

**Status:** accepted

- **Context:** direct pushes to `main` caused unreviewed changes.
- **Decision:** mandatory git workflow — branch off `main`, never push directly,
  review before merge.
- **Consequence:** codified in `AGENTS.md`.

## ADR-0010 · Bilingual content in `content/{locale}.json`

**Status:** accepted

- **Context:** EN + NL locales without heavy i18n tooling.
- **Decision:** in-house JSON content files loaded via a typed helper.
- **Consequence:** two files of copy, no ICU dependencies; `<html lang>` set per
  locale.