---
tags:
  - brain
  - testing
created: 2026-08-10
updated: 2026-08-10
---
# 07 - Testing

> Tests are the memory of what the system is supposed to do. If it's not tested, it will break in production.

## Test pyramid
```
    /\        E2E (few) — critical user journeys only
   /  \       Integration (some) — API + DB together
  /____\      Unit (many) — fast, isolated, business logic
```
- The pyramid **still holds in 2026**; Google's size model helps set budgets: **Small** (unit) ≤60s, no network/DB/fs · **Medium** (integration) ≤300s, localhost services only · **Large** (E2E) ≤900s, unrestricted. Cost, flakiness, and AI-generation limits all rise with the layers — which is exactly why the base stays broad.

## Rules
- **Unit** covers business rules and edge cases — the domain logic.
- **Integration** proves API + database + auth actually work together.
- **E2E** for the 3–5 money paths (signup → pay → use). Slow tests are rare by design.
- **Contract tests** (Pact) on every service-to-service boundary — they replace many E2E tests for distributed systems and catch breakage earlier.
- Test **behavior**, not implementation. Don't couple tests to internal function names.
- Test the **failure paths**: errors, retries, limits, unauthorized, timeouts.
- **Never test against production** data or credentials.

## Flaky tests are a budget line (2026)
- Baseline reality: ~1.5% of Google's test runs are flaky, affecting ~16% of tests; repair runs ~$2,250/month for a mid-size team — and every flake trains devs to ignore CI, which is the death spiral.
- **Quarantine-first**: move a flaky test to a non-blocking group (still runs, still tracked), set a max 30-day stay, then fix or delete. Quarantine count must trend down.
- **Retry only the failed tests** (test-level, not whole-pipeline re-run), and log every retry — a test that passes on retry is still flaky; use that data to find root causes.
- **Parallel isolation is mandatory**: per-worker DB/schema/namespace, dynamic ports, no shared temp dirs, no execution-order reliance.
- **Fast feedback first**: pipeline order lint → unit → integration → E2E; block merges on lint+unit+integration, keep the full E2E suite out of the blocking path (scheduled or canary).

## Coverage mindset
- Don't chase 100% line coverage — chase the risky paths: auth, money, concurrency, migrations, third-party integration.
- Benchmarks (Google tiers): 60% acceptable / 75% commendable / 90% exemplary — and a high % proves lines ran, not behavior verified. Assertions that check nothing still count as coverage.
- If a bug was reported, write the failing test first, then fix. Regression tests lock the lesson in.
- **2026 consensus on coverage gates**: raw line-coverage thresholds incentivize shallow, assertion-free tests. Use a low global floor (60–65%) to block test deletion, high thresholds (85–90%) **on critical paths only** (payments, auth), and **mutation score** as the real verification signal.

## AI-generated tests (2026)
- AI drafts are **excellent at unit** (small context, clear intent), **mediocre at integration**, **poor at E2E**. Use it for the boring 80%; the interesting 20% is yours.
- **Review every generated test like product code** (selectors, waits, assertions, business value); promote to the blocking suite only after ~20 clean runs. A test you wouldn't trust to stop a release at 6pm doesn't belong in the blocking suite.
- Feed failures back: weak selectors / shared-data flakes → update the AI's rules, so the next draft is more stable.

## Mutation testing (kill the coverage game)
- Inject real faults (flip `>` to `>=`, delete a return) and see which your tests catch — assertion-free tests die here. Stryker (JS/TS), PIT (Java), mutmut (Python).
- **75–85% score on domain logic is healthy; 100% is equivalent-mutant noise** — document or ignore equivalent mutants, don't chase them.
- **Scope so CI stays fast**: mutate only PR-changed files (`--since main`) with a hard break threshold, `coverageAnalysis: "perTest"` (run only the tests covering each mutant), `--incremental`, concurrency; full sweep nightly on a dashboard. Delta-gate changed code, not legacy.
- Feed surviving mutants to agents as acceptance criteria ("kill this mutant, or justify it as equivalent").

## Property-based testing
- Replace hand-picked examples with **invariants**: round-trip `decode(encode(x)) == x`, idempotence `f(f(x)) == f(x)`, metamorphic relations. Highest ROI: parsers, serializers, sorting, reducers, pricing, permission checks.
- **Shrinking is the killer feature**: failures reduce to a minimal counterexample — pin it as a permanent regression test.
- Deterministic via seeds: 100 runs locally, 500–5000 nightly for pure functions. Write properties AND examples together; a property that just re-implements the code is worthless. fast-check (TS) / Hypothesis (Python).

## Testing LLM/AI features (2026)
- **Golden datasets are the differentiator**: 30–300 curated real/distribution-shaped inputs with explicit pass/fail rubrics, versioned as code; wire a fast subset into CI and gate PRs that touch prompts or model config.
- **LLM-as-judge has documented biases** (position, verbosity, self-preference): use rubric decomposition over 1–10, randomized pairwise comparisons, and calibrate against human labels (Cohen's kappa) before trusting pass rates.
- **Deterministic harness = test the plumbing** (parsers, tool-selection, retriever, prompt formatting) with fake models (`FakeListLLM`) — fast, free, never flaky. Real-model evals (RAGAS: faithfulness, context precision/recall) belong in nightly/pre-release, gated by the golden set.
- | Mock the model (unit) | Real model (evals) |
  |---|---|
  | Proves wiring, parsing, error handling | Proves output quality, safety |
  | ~0 cost, deterministic, every commit | Token cost, flaky, nightly/pre-release |

## Frontend testing (2026)
- **Layered**: Vitest/RTL (jsdom) for logic-heavy components; Playwright Component Testing only for the few that need real browser layout/CSS (skip if <10 such components).
- **Playwright E2E**: web-first `await expect(...)` assertions (never `waitForTimeout`), `getByRole` locators, per-test isolated contexts, seed data via the `request` fixture, `trace: 'on-first-retry'` + screenshots only on failure.
- **Visual regression is a maintenance tax**: snapshot a curated design-system set only (Storybook + Chromatic), pin fonts + disable animations, set `maxDiffPixels` deliberately.

## What to automate
- Lint + typecheck on every commit (pre-commit hook).
- Unit + integration in CI on every push.
- E2E in CI on merge to main.
- Load test before anything promises scale (k6, Locust, JMeter).
- Chaos/fault tests for resilience claims.

## Fixtures & data
- Deterministic fixtures. No random values in assertions.
- Reset DB between tests (transactions/rollback or truncate).
- Test the migration path: fresh install **and** upgrade from previous version.

## Practical note
- A test suite that's slow, flaky, or noisy is abandoned → then it's worthless.
- Keep tests fast (< 1–2 min for unit+integration) so devs run them constantly. Target: full build <10 min, flake rate <1%.

