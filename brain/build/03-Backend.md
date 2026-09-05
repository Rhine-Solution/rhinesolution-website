---
tags:
  - brain
  - backend
created: 2026-08-10
updated: 2026-08-10
type: concept
description: APIs, services, and business logic. TypeScript is the 2026 default for full-stack TypeScript shops; pick the language that fits the team.
---
# 03 - Backend

> APIs, services, and business logic. TypeScript is the 2026 default for full-stack TypeScript shops; pick the language that fits the team.

## Stack defaults
- **Node.js/TypeScript** (NestJS, Fastify, Express) — shared types with frontend.
- **Python** (FastAPI/Django) — data/AI-heavy backends.
- **Go / Rust** — high-throughput, low-latency services.
- Decide by team skill + problem, not hype.

## Non-negotiables
- **Environment config**: secrets only via env vars / secret manager. Never hardcode, never commit, never log.
- **Validation**: validate every input at the boundary (zod, joi, pydantic). Invalid input → 400, not a crash.
- **Error handling**: typed errors, structured logging, never swallow failures silently. Fail loud in dev, fail safe in prod.
- **Rate limiting** on auth and public endpoints.
- **Idempotency** on retryable mutating endpoints.
- **Health check** endpoint (`/healthz`) + readiness probe.

## Logging & observability
- Structured logs (JSON), correlation/trace IDs across services.
- Log context (request id, user id, service, version) — never raw secrets or PII.
- Metrics for: request latency, error rate, queue depth, DB connections.
- Tracing for distributed systems.

## Caching strategy
- Cache the expensive read, invalidate on the write.
- Cache-aside default: check cache → miss → read source → populate with TTL.
- Know your invalidation: TTL, key patterns, versioned keys (deploys!). Stale is worse than slow for money/billing.

## API design (2026)
- **Protocol decision**:
  | Boundary | Pick | Why |
  |---|---|---|
  | Public / third-party API | REST + OpenAPI 3.1 | Universal clients, caching, docs, codegen |
  | Frontend↔backend in a TS monorepo | tRPC | Types from code, no schema to drift (TS-only) |
  | Deeply relational, multiple clients (web+mobile) | GraphQL | Client-driven queries + BFF; accept DataLoader + depth limits |
  | Service-to-service, high throughput / streaming | gRPC / ConnectRPC | protobuf efficiency; internal only |
  | AI/agent tool exposure | MCP | Separate concern (2026) |
- **Versioning**: additive-compatible by default (new optional fields/endpoints never break clients); URI versioning (`/v1/`) on breaking change. Deprecation: `Deprecation: @<unix>` (RFC 9745) + `Sunset: <date>` (RFC 8594) + `Link rel="deprecation"/"successor-version"`; 6–12 month window (18 for major platforms); after sunset return **410 Gone** with migration info, not 404.
- **Errors — RFC 9457 Problem Details** (`application/problem+json`), not ad-hoc shapes: `{type, title, status, detail, instance}` + extension members (`code`, field-level `errors`). Add an envelope wrapper only if you carry global metadata (trace id).
- **Pagination**: cursor (opaque, base64 of the sort key) is the default — stable under writes, O(1) deep pages, `has_more`/`next_cursor`. Offset only for small stable tables or admin "page X of Y". Always a deterministic tiebreaker (`ORDER BY created_at DESC, id DESC`), indexed sort columns, capped limit.
- **Idempotency**: client sends `Idempotency-Key` (uuid) on mutating POSTs; server stores key → **full serialized response** for 24h+ and replays it verbatim. Same key + different body → 422; key in-flight → 409; missing key → 400. `Retry-After` on 429/503; retry network errors + 5xx, never 4xx.
- **Webhooks**: sign HMAC-SHA256 over the **raw body** with a timestamp (`X-Webhook-Signature: t=<ts>,v1=<hmac>`); receiver rejects ts >5 min old, constant-time compare, cache event IDs to block replays. Delivery is **at-least-once** → handlers ack 200 fast and dedupe by event ID. Sender: exponential backoff + full jitter, ~5–8 attempts, DLQ + manual replay. (Svix packages all of this.)
- **Rate limiting headers**: standard `RateLimit-Limit/Remaining/Reset` (IETF draft) over legacy `X-RateLimit-*`; **429 always carries `Retry-After`** (add jitter to avoid thundering herds).
- **OpenAPI 3.1**: JSON Schema 2020-12 (`type: [string, "null"]`, not `nullable`), top-level `webhooks` field. Contract-first for public APIs (typed clients, mocks, CI breaking-change diff); code-first for internal speed — enforce a spec-diff gate either way.

## File structure (feature-first)
```
src/
  modules/
    users/        # controller, service, repo, schemas, tests
    orders/
  shared/         # common utils, errors, middleware
  core/           # domain logic (framework-free)
```

## Background jobs
- Queues (BullMQ, Celery) for email, exports, webhooks, AI inference.
- At-least-once delivery assumption → make jobs idempotent.

## 2026 patterns: event-driven, serverless, edge
- **Event-driven + async-first**: events/queues are the default coupling boundary (Kafka/NATS, or brokerless like Redpanda); long synchronous chains are a smell. Publish events for anything other services care about; don't call their APIs for it.
- **Outbox pattern**: write the event in the same DB transaction as the state change → reliable publication without dual-write. An outbox relay (Debezium CDC or a poller) ships events; consumers dedupe by event ID (idempotent, at-least-once).
- **Durable execution**: Temporal / Inngest — workflows with built-in retries, timers, and saga compensation; beats hand-rolled job queues for multi-step business processes.
- **Serverless (FaaS)**: great for spiky, low-traffic, or event-driven workloads (HTTP on demand, webhooks, cron, queue consumers) — autoscales to zero, no idle cost. Not for long-running, stateful, or very hot paths (cold starts + per-invoke cost). Keep functions single-purpose.
- **Edge computing (2026)**: CDN + compute at the edge (Vercel, Cloudflare, Deno Deploy, regional deploys) for global latency, personalization, A/B tests, geo rules. Edge = stateless and time-bounded; the DB stays centralized (edge-aware or regional read replicas).
- **Backend-for-Frontend (BFF)**: per-client gateway owned by the frontend team; aggregates, shapes, and secures data for one UI. See also [[04-Frontend]].
- **Zero-trust service-to-service**: mTLS or short-lived tokens between services; never trust network position. See [[06-Security]].

## Durable execution (deep dive, 2026)
- **Model**: a **workflow** is ordinary code whose every step is journaled (event-sourced history) and **replayed** from the last completed step after a crash; **activities** are the side-effecting units the engine retries independently.
- **Determinism rules** (the #1 cause of production DE bugs): workflow code uses only SDK APIs (`workflow.Sleep`, `workflow.Now`) — no `time()`, `random`, or I/O; **all external calls live in activities**. Run static analysis (`workflowcheck`) in CI.
- **When to use it**:
  | Workload shape | Use |
  |---|---|
  | Fire-and-forget (email, webhooks, image resize) | Plain queue (at-least-once is enough) |
  | Single-step, bursty, short-lived | Serverless function |
  | Multi-step process, human-in-the-loop approvals, saga/compensation | **Durable execution** |
  | Long-running AI agents calling tools | **Durable execution** — retries must not re-run billable steps |
  | High-throughput stateless fan-out | Event stream (Kafka/SNS) |
- **AI-agents signal (2026)**: DE became the substrate for agents — LangGraph PostgresSaver, OpenAI Agents SDK resume primitive, Anthropic Managed Agents. Treat the LLM as a *stateless oracle proposing the next action*; the engine holds state, retries, compensation.
- **Ecosystem 2026**: Temporal (incumbent, OSS; Cloud from $100/mo; Worker Versioning + Nexus/Multi-Region GA) · Inngest (serverless-native, no workers; Hobby 50k execs free — but **step-based billing**: a 5-step fn with retries can bill 15–30 execs/run) · Hatchet (queue+workflow on "one Postgres box", MIT) · Restate (single Rust binary, virtual objects, best serverless/edge fit) · AWS Step Functions / Azure Durable Functions (Consumption SKU GA Mar 2026) when cloud-locked. **Postgres-native wave**: Hatchet, DBOS, Riverqueue, pg-boss.
- **Pitfalls (one-line fixes)**:
  - Non-deterministic workflow code → replay mismatch: static analysis in CI.
  - Deploying workflow changes bare breaks running workflows: use **Worker Versioning** (PINNED vs AUTO_UPGRADE) + two-phase deploy (replay-verify, then run).
  - LLM payloads bloat history (Temporal caps ~51,200 events / 50 MB): claim-check pattern (store blob references) + Continue-as-New.
  - No true exactly-once: idempotency keys (`workflow_id` + `activity_id`) on every external write.
  - Sagas need a compensation per step — or mark a step explicitly irreversible.
  - Test with time-skipping environments (`TestWorkflowEnvironment`); replay real histories in CI.

## Payments (deep dive, 2026)
- **Don't hand-roll**: never store card data or build your own card form — that's PCI DSS SAQ-A scope; tokenize via Stripe and redirect to a hosted page. Stripe's guidance: **Checkout Sessions is "the recommended API for most developers"** (hosted full-page Checkout ships Billing, Tax, Adaptive Pricing, Link, dynamic payment methods). `ui_mode: hosted_page | embedded_page | elements`; Payment Intents + Elements only for custom UX. **Payment Links** = zero-code hosted checkout for MVP.
- **Webhooks are the source of truth**: verify `Stripe-Signature` (HMAC-SHA256, `v1`, **raw body**, 5-min tolerance), return 2xx fast + process async, **dedupe by `event.id`** (delivery is not ordered; auto-retries up to 3 days). Handle **`checkout.session.completed`** for fulfillment (not `payment_intent.succeeded` — that's the Payment Intents API); `invoice.payment_failed` for subs. Replay: Dashboard ≤15 days, `stripe events resend` ≤30.
- **Subscriptions**: one Product per tier, multiple Prices per Product (archive old prices, never duplicate). Enable **Smart Retries, dunning (4–5 emails, 14–21 days + grace), Customer Portal, Stripe Tax (~0.5%)** from day one — involuntary churn ≈9% of MRR, dunning recovery ≈3.5× LTV. **Meters API is mandatory** for metered billing since API `2025-03-31.basil` (legacy usage-records API removed).
- **PSD2/SCA (EU/EEA + UK)**: hosted Checkout handles 3DS entirely — another reason to use it. Exemptions (low-value <€30, TRA, trusted beneficiary) **kill liability shift** — fraud chargebacks land on you. **PSD3/PSR** ⚠️ verified: 2026-08 final text published Apr 2026 (PSR applies ~18 months after entry into force); card fraud is 17× higher outside the EEA.
- **Fraud & disputes**: Radar ML is free (trained on >$1T/yr volume) + 3DS gives liability shift (`has_liability_shift`); card-testing defense = CAPTCHA + rate limits + rules like `total_charges_per_ip_address_hourly > 1`; Ethoca (MC) / Verifi (Visa) alerts + RDR auto-resolve; avg chargeback cost ~$128. Track dispute ratios + build an evidence library before volume hits.
- **2026 signal — agentic payments**: Stripe Agent Toolkit SDK + MCP server (`mcp.stripe.com`, OAuth ~25 tools); Agentic Commerce Suite (Dec 2025 — Kate Spade/Best Buy/Coach); Sessions 2026 added Metronome (usage metering), Tempo (micropayments), Privy (agent wallets). AI agents paying for things is the new frontier.

