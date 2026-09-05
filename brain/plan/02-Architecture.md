---
tags:
  - brain
  - architecture
created: 2026-08-10
updated: 2026-08-10
type: concept
description: Don't ask \"monolith or microservices?\" — ask \"what specific problem am I solving?\" If you can't name one, you don't need microservices yet. Technical debt is ne
---
# 02 - Architecture

> 2026 consensus: start **modular monolith**, split only when a real boundary demands it. Make systems easy to change, not just able to work today.

## Default pattern: Modular Monolith
- One deployment unit, strict module boundaries, dependency rules between modules.
- Simplicity of a monolith + the discipline of microservices.
- Only extract a service when a module genuinely needs independent scaling or a separate team.

## When to use what
| Pattern | Use when |
|---|---|
| Modular monolith | Default for most products and MVPs |
| Microservices | Proven scaling boundary, separate teams, isolated failure domains |
| Serverless/FaaS | Spiky or event-driven workloads, scale-to-zero cost needs |
| Event-driven / streaming | Real-time features, audit trails, loose coupling between parts |
| Edge / local-first | Latency-sensitive UX, offline-first apps |
| Clean / hexagonal | Core logic must stay swappable (AI models, vendors, DBs) |

## When to split the monolith (2026 signals)
Don't ask "monolith or microservices?" — ask **"what specific problem am I solving?"** If you can't name one, you don't need microservices yet. Technical debt is never a reason to split — it amplifies it.
| Signal | Read |
|---|---|
| Team size | <8 → monolith; 8–20 → modular monolith; 20+ multi-team, distinct domains → evaluate splitting |
| Forced coupling | Domains deploy together but change separately → real split candidate |
| Independent scaling | One module's load pattern wildly differs (20 instances vs 2) → split it |
| Hard fault isolation | One module's crash must never take down the rest (billing vs public API) |
| Separate release cadence | A module needs its own release cycle / team → extract |
| Technology diversity | Modules genuinely need different runtimes (ML vs web) |
- **Cheap levers first**, before splitting: feature flags, scale host instances, read-only DB replicas.
- **Split via Strangler Fig**: extract loosely-coupled seams first (reporting, notifications — they don't share transactional data), run in parallel, shift traffic gradually, decommission old code after it proves out. Incremental over 12–18 months, never a big-bang rewrite. Observability BEFORE extraction, not after.
- **2026 factors**: AI agents work better inside well-scoped services with clear contracts (new pro-split signal); internal dev platforms (Backstage/Port) cut the ops cost of many services — but don't repeal the need for a real reason.

## Modular monolith — how (bounded contexts & contracts)
- Modules = **bounded contexts** (DDD), NOT entities. Split by business meaning, not by data ("Customer" in Billing ≠ "Customer" in Support).
- Every module exposes a thin public **contract** — three kinds: **Commands** (state change, sync) · **Queries** (read, sync) · **Integration Events** (async broadcast, no wait).
- Each module owns its own persistence schema + isolated tests → **designed for extraction**: the day it justifies its own release cycle, it becomes a service without a rewrite.
- Boundaries enforced by the **compiler** + architecture tests, not the network.
- **Anti-patterns that kill the boundary**: one giant DbContext, cross-module SQL joins, calling module internals instead of commands/queries, dumping Entities into the Contracts project, no ArchTest.

## Layering rules (clean architecture in spirit)
1. **Domain / core** — business rules, no framework imports. This is the app.
2. **Application** — use cases / services, orchestrates the domain.
3. **Infrastructure / adapters** — DB, HTTP, files, AI clients, UI. Swappable.
- Dependencies point **inward**. The core must not know about Express, Prisma, React, or the AI vendor.

## API design
- REST for simple CRUD; GraphQL/tRPC when client needs control; gRPC/streams for internal services.
- Version APIs from day one (`/v1/...`). Never break consumers silently.
- Idempotency keys on mutating endpoints that can be retried (payments!).
- Design for the caller: consistent error shape, meaningful status codes, pagination everywhere.

## Concurrency & async
- Long-running work → background workers + queues, never in the request path.
- Streaming systems: manage backpressure explicitly (buffers/throttles), never let producers overwhelm consumers.
- Event sourcing for auditability when "what happened" matters as much as "current state".

## Decision log
- Record every architecture decision as an ADR (status, context, decision, consequences).
- An architecture without a written why is a future surprise.

## 2026 AI-native considerations
- Hybrid data: relational + vector stores for RAG.
- Async inference for LLM calls (keep UI snappy).
- Agentic loops: agents that call tools and iterate — design evaluator/validator layers because AI output is non-deterministic.

