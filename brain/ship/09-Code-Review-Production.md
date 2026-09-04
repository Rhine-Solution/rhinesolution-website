---
tags:
  - brain
  - review
created: 2026-08-10
updated: 2026-08-10
---
# 09 - Code Review & Production Readiness

> Before any task is "done": review like a senior who has seen it all. A review isn't a test of who knows more — it's a quality mechanism.

## Review checklist — run before calling anything done
- [ ] **Behavior**: does it do what was asked? Edge cases? Empty states?
- [ ] **Security**: validated input, authZ checked, no secrets, webhook sigs (see [[06-Security]])
- [ ] **Data**: migration-safe, transactional where needed, no N+1, indexes sensible
- [ ] **Errors**: failure paths, retries, timeouts, limits — not just the happy path
- [ ] **Concurrency**: races, idempotency, resource leaks
- [ ] **Observability**: logging, metrics, alertable
- [ ] **Config**: no hardcoded env values; env-var driven
- [ ] **Tests**: meaningful, cover the risky path, not just coverage numbers
- [ ] **Perf**: no premature optimization; measured if it matters
- [ ] **Clarity**: names, small functions, *why* comments, delete dead code
- [ ] **Consistency**: matches existing patterns/conventions in the repo
- [ ] **Rollback**: can this change be undone?

## Production readiness (PRR) mindset
"Ready for production" ≠ "the feature works." It means an operator who didn't build it can:
1. **Tell it broke** (monitoring/alerting exist)
2. **Find out why** (logs/traces/metrics are there)
3. **Fix it** (runbook, rollback, tested restore)

Most incidents come from boring gaps, not exotic bugs:
- No alert fired
- No runbook existed
- Rollback untested
- Backup never restored

## Review etiquette (senior behavior)
- Rigorous on what matters, proportional on what doesn't.
- Explain *why* a change is needed, not just that it is.
- Treat reviews as mentorship + knowledge sharing, not gatekeeping.
- Praise good patterns; teach, don't shame.
- Small PRs get good reviews; 2000-line PRs get rubber stamps.
- **Label feedback blocking vs non-blocking** ("Nit:" for optional) — authors know what to act on. Keep reviews under a defined SLA so they don't become the bottleneck.
- **PR description discipline**: state intent, risky areas, and what's out of scope (with follow-up ticket). Reviewers ask fewer questions; authors defend decisions once.

## AI + review (2026)
- AI generates far more code now — review has adapted. **AI handles the mechanical passes** (style, obvious bugs, missing validation, security patterns, perf); **humans own architecture, business logic, trade-offs, and context** that lives outside the diff.
- **Prompt & process disclosure**: when AI wrote part of a change, the PR must say so — what the AI did and the core prompt used. It's as reviewable as the commit message, and it's how you calibrate the tool.
- **Configure AI review for signal, not noise**: focused concerns (security, perf, common bugs) produce signal; broad "review everything" produces noise that erodes trust. Monitor its effectiveness (bug catch rate, false positives — ~50% comment-acceptance is a good trust benchmark) and tune over time.
- **AI + human beats either alone**: teams with structured AI review caught ~34% more bugs pre-merge. But the architectural calls remain human — AI doesn't know the 80%-memory service or the pricing engine's business rules.
- A solo dev gets the most value from AI review — there's no human fallback.

