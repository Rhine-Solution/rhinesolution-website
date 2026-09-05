---
tags:
  - brain
  - security
created: 2026-08-10
updated: 2026-08-10
type: concept
description: Every feature, every line, no exceptions. Follow OWASP Top Ten. Security is embedded from the first commit, never bolted on.
---
# 06 - Security

> Every feature, every line, no exceptions. Follow OWASP Top Ten. Security is embedded from the first commit, never bolted on.

## The non-negotiables
1. **Never trust input** — validate server-side on every boundary (zod/joi/pydantic).
2. **Secrets** — env vars/secret manager only. Never in code, repos, or logs.
3. **SQL injection** — parameterized queries / ORM only. Zero string-built SQL.
4. **XSS** — escape all output; framework auto-escaping on; never `dangerouslySetInnerHTML` with user data.
5. **CSRF** — token protection on state-changing requests.
6. **AuthZ on every endpoint** — "is the user allowed to do *this thing* on *this resource*", not just "are they logged in". IDOR is a silent killer.
7. **Rate limiting** on auth, search, public APIs (brute force protection).
8. **TLS everywhere**; HTTPS redirect; secure/HSTS headers.
9. **Password hashing** — bcrypt/argon2. Never store plaintext or MD5/SHA.
10. **Dependencies** — lockfiles, automated vuln scanning (npm audit, Dependabot, renovate), stay patched.

## Webhook/auth pitfalls (from real incidents)
- **Verify webhook signatures** (Stripe, GitHub) — anyone can fire fake events.
- **JWT**: short expiry, rotate signing keys, validate issuer+audience.
- **Session cookies**: HttpOnly, SameSite, Secure.

## Modern auth (passkeys & OAuth 2.1, 2026)
- **Passkeys are mainstream** (FIDO2/WebAuthn): the private key never leaves the device; the server stores only the public key. Sign-in is a challenge-response bound to the exact origin — **phishing is structurally impossible**. Require **User Verification** (biometric/PIN), not just User Presence (tap). Policy: "default-first, not single-path" — prefer passkeys, never the *only* path.
- **Passkey UX**: register via identifier-first form + Conditional UI (autofill) and a triggered post-login prompt (eBay: ~75% of enrollments from one auto-trigger moment). Name credentials ("Windows laptop"). Fallback ladder: passkey → push → magic link → email OTP → SMS last. **Recovery is the moat**: one-time recovery codes + TOTP fallback + re-enrollment on next sign-in.
- **OAuth 2.1** (draft; its practices landed Jan 2025 as RFC 9700 Security BCP): **PKCE mandatory (S256)**, implicit + password grants removed, exact `redirect_uri` matching, no tokens in query strings, refresh rotation required for public clients. Minimal correct stack: **Authorization Code + PKCE → OIDC (`id_token` + discovery) → your own short-lived sessions**. Use OIDC for user sign-in; plain JWT only between your own services.
- **Sessions**: access tokens 5–15 min and effectively unrevocable → control blast radius by lifetime. Refresh: **rotate on every use, reuse detection kills the family**, no grace window. For browser sessions, **opaque tokens in HttpOnly+Secure+SameSite=Lax cookies beat JWTs** (instant revocation, no localStorage XSS theft). Regenerate session ID on login (fixation). Logout everywhere: revoke refresh + IdP session. SPAs: route through a **BFF** so tokens never touch the browser.
- **MFA 2026**: phishing-resistant is the goal — only passkeys/FIDO2 qualify (CISA). TOTP/push are still AiTM-relay/fatigue-phishable; SMS is worst. Staged rollout: any MFA → ban SMS → passkeys → require phishing-resistant for admins. **Step-up auth** for sensitive actions (payments, password change, new device).
- **Cookie auth → CSRF is the enemy; bearer tokens → XSS is.** `SameSite=Lax` blocks most CSRF; keep double-submit cookie + Origin checks as the layered default. Never store long-lived tokens in localStorage.
- **Managed IdP for small teams** (Clerk, Supabase, Auth0, WorkOS): auth is the highest-blast-radius, least-differentiated subsystem — outsource it. Self-host Keycloak/Authentik only for sovereignty/regulation. Beware MAU-based price spikes at scale.

## API security (OWASP API Security Top 10 — 2023 edition is current in 2026)
- APIs are **the** attack surface of 2026; API attacks are the dominant breach vector. Framework: OWASP API Security Top 10 (still 2023 — no 2026 edition released).
- The list, in impact order: **API1 BOLA / IDOR** (~40% of API attacks) · API2 broken auth · API3 BOPLA (mass assignment / over-exposure of fields) · API4 unrestricted resource consumption · API5 broken function-level auth · API6 unrestricted sensitive business flows · API7 SSRF · API8 security misconfiguration · API9 improper inventory (shadow/zombie APIs — unknown APIs are the largest attack vector) · API10 unsafe consumption of 3rd-party APIs (validate responses, scope tokens to minimum permissions).
- **APIs ≠ web apps**: no browser-enforced protections, direct data access, multiple consumers at different trust levels, and your OpenAPI/Swagger docs map the attack surface for free. Never rely on web-app tooling alone.
- Baseline: enforce authN **and** object-level authZ on every endpoint (not just login), rate limit everything, validate input, log & monitor. Make unauthenticated endpoints an explicit reviewed decision, not an oversight.
- **AI adds a layer**: OWASP published "Top 10 for Agentic Applications" (2026) — goal hijacking, prompt injection, insecure inter-agent communication. Secure the API fundamentals under the agents; agents amplify, not replace, those risks.

## Agentic AI security (OWASP, 2026)
- **Design thesis**: you cannot build a model that can't be fooled — **build the system so that when the model is fooled, nothing important breaks**. Blast-radius control beats prevention.
- **OWASP GenAI LLM Top 10 (2026)** — ranked partly by ~6,600 real incidents: 1) Prompt Injection, 2) Sensitive Info Disclosure, 3) **Excessive Agency** (jumped to #3), 4) Supply Chain, 5) Data & Model Poisoning, 6) Unbounded Consumption, 7) Misinformation, 8) Hidden Context Exposure (was "system prompt leakage" — now covers tool schemas, RAG details, policy logic), 9) Vector & Embedding Weaknesses, 10) Improper Output Handling.
- **Excessive agency = excessive functionality + permissions + autonomy**. Controls: minimal single-purpose tools (no open-ended shell/URL fetchers), least-privilege downstream creds, execute tools in the *user's* OAuth context, authZ enforced in downstream systems (never by the model), HITL confirmation for high-impact actions.
- **Prompt-injection defense stack (layered, in order)**: ① model hardening (instruction hierarchy) ② input isolation / spotlighting + tagging untrusted content ③ injection-detection shields on tool responses and prompts ④ deterministic plan-verify-execute (each tool call checked against the plan) ⑤ **treat LLM output as untrusted before it reaches tools/SQL/shell** (validate tool-call args against schemas) ⑥ egress + impact control with HITL ⑦ assume breach: audit everything, keep a kill switch. Research (AgentDojo, AgentRedBench: 32–81% attack success) says no layer fully stops indirect injection — containment is the goal.
- **Tool safety checklist**: default-deny allowlist per task; per-tool read/write perms validated against a JSON schema; budgets in a policy layer (`max_steps`, `max_tool_calls`, `max_seconds`, `max_usd`); kill switch in both the runtime loop and the tool gateway; append-only audit log of every tool call (agent, actor, tool, args, allow/deny, reason); separate decision (LLM) from execution (deterministic code).
- **RAG security**: restrict the vector-store *write plane* to the ingestion service; hash docs at ingest + provenance trust tiers; **retrieval-time access control is the #1 miss** — post-retrieval filtering is security theater (the model already saw the chunk). Enforce per-chunk ACLs, per-tenant index/namespace isolation, or DB-level RLS on pgvector — never filter by user-supplied `tenant_id` (filter injection). Mask PII at ingest.
- **Context window = new leak surface** (~73% of credential leaks in agent skills came via logged tool output): never put secrets in prompts, tool schemas, or skill files; resolve secrets *below the model* (`{{resolve:secretsmanager}}`); block get-secret-style tools; short TTL; redact egress at the tool boundary.
- **Test**: red-team with dynamic attacker LLMs (Garak, PyRIT, promptfoo, SIRAJ); guardrail evals on multi-step traces; CI gate on tool-call graph drift; per-agent behavior baselines + drift alerts.

## Secrets, zero trust & supply chain (2026)
- **Secrets**: never hardcode (git history is permanent — rotation after discovery doesn't un-leak). Env vars are a step up but no audit trail + not encrypted at rest. Target: managed store (Secrets Manager / Vault) fetched by the service's identity, not a shared credential.
- **Dynamic credentials are the 2026 shift**: static db users with 90-day rotation → short-lived JIT credentials (15-min leases) scoped per service. Kubernetes Secrets are base64, not encrypted — use Sealed Secrets or the External Secrets Operator; never commit raw.
- **Defense in depth for leaks**: pre-commit hooks + CI secret scanning + repo scanning (GitHub secret scanning, GitGuardian). Validate detected credentials actually work to kill false-positive fatigue.
- **AI agents get the same discipline**: model-provider API keys belong in the secrets manager (they're a top target); agent credentials least-privilege (not AdministratorAccess); tag agent API calls (session tags / invocation IDs) for audit.
- **Supply chain**: 77% of orgs had a supply-chain incident in the past year. SBOM, artifact signing (SLSA), dependency pinning, automated SCA, lockfiles. A dependency is code you ship — scan it like yours.
- **Zero trust**: identity is the perimeter; never-trust-always-verify; policy-as-code (OPA) on Terraform/K8s; mTLS via service mesh; micro-segmentation stops lateral movement.

## In practice
- Headers: CSP, X-Frame-Options, Referrer-Policy, HSTS.
- File uploads: whitelist types, size limits, virus scan, serve from separate origin/domain.
- Never log PII or secrets. Mask emails/keys in logs.
- Principle of least privilege for every service/API token.
- Security review is part of code review (see [[09-Code-Review-Production]]).

## Checklist per feature
- [ ] Input validated at every entry point
- [ ] AuthZ checked, not just authN
- [ ] Output encoded / escaped
- [ ] No secrets in code or logs
- [ ] Rate limited if public/exposed
- [ ] Webhook/3rd-party signatures verified

