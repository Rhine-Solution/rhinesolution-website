---
tags:
  - brain
created: 2026-08-10
updated: 2026-08-10
---
# 14 - Monitoring

> If it isn't observed, it didn't happen. Monitoring is the bridge between "it works on my machine" and "it works in production."

## The four pillars
- **Metrics** — numeric health over time (latency, error rate, throughput, saturation). Prometheus + Grafana, or a managed SaaS.
- **Logs** — events with context for debugging. Structured JSON, request IDs, correlation IDs. Avoid logging PII/secrets (see [[06-Security]]).
- **Traces** — request lifecycle across services (OpenTelemetry → Tempo/Jaeger/Managed). Trace IDs + span attributes.
- **Alerting** — turn the above into "page someone" rules. Alert on user impact, not on every metric wiggle.

## 2026 defaults
- **OpenTelemetry is the standard**: one SDK, one exporter, vendor-neutral. Instrument once, ship anywhere.
- **Sentry** for errors: source maps, release tracking, event grouping. Set an error budget.
- **Uptime checks** (external synthetic): UptimeRobot / StatusCake / Better Stack — hit a `/health` endpoint from outside, alert on 5xx/timeout. Catches DNS, CDN, and edge failures that internal dashboards miss.
- **RUM (Real User Monitoring)** for the frontend: Sentry Performance / Web Vitals SDK — captures LCP/INP/CLS in production. See [[13-Performance]].
- **Dashboards are for humans**: 3–5 charts per page, a "RED" view (Rate, Errors, Duration) per service. A wall of 50 charts nobody reads is maintenance, not monitoring.

## Golden signals (per service)
1. **Rate** — requests per second (traffic up or down is news).
2. **Errors** — 5xx + business-level failures as a %.
3. **Duration** — latency percentiles: p50, p95, p99. Averages hide the tail.
4. **Saturation** — CPU/memory/queue depth, the leading indicator of trouble.

## Alerting rules that don't wake you at 3am
- Alert on **symptoms** (user-facing: error rate > threshold, p99 latency breach), not causes (CPU at 80% — usually fine).
- **Burn-rate / error-budget based**: only alert when the budget will be exhausted (e.g. 1% error rate over 30min = 2% of the 30-day budget). Prevents alert fatigue.
- Page the human only for actionable items. Low-severity → dashboard/slack; on-call → threshold breach only.
- Every alert needs a runbook link. Alert without a runbook is just noise.

## Instrumentation checklist
- [ ] `/health` and `/ready` endpoints (liveness vs. readiness — don't conflate them).
- [ ] Structured logging with request IDs on every service.
- [ ] OTel spans on every external call (DB, cache, third-party API).
- [ ] Source maps uploaded for every release (stack traces must be readable).
- [ ] Error budget defined per critical path (payments, auth = strict).
- [ ] Uptime monitor on the public URL.
- [ ] RUM on the production frontend.
- [ ] Alert rules + runbooks for each pillar.

## What NOT to do
- Don't log secrets, tokens, passwords, or full bodies of sensitive endpoints ([[06-Security]]).
- Don't store high-cardinality keys in metrics (labels = bounded).
- Don't alert on every metric — alert on SLOs.
- Don't monitor only the happy path — track failures, retries, timeouts explicitly.

