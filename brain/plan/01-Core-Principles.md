---
tags:
  - brain
  - principles
created: 2026-08-10
updated: 2026-08-10
---
# 01 - Core Principles

> The timeless rules that survive every framework change. From 40 years of shipping software.

## 1. Simplicity beats cleverness
- Write code a junior can read, not a genius can admire.
- The best code is the code you don't write. Delete more than you add.
- YAGNI: build for today's requirements, structure for tomorrow's changes.

## 2. Small, steady steps
- Working software over perfect software. Ship small slices often.
- Never mix unrelated changes in one commit or one PR.
- Refactor in the same area you're already touching (the boy scout rule: leave it cleaner).

## 3. Data is the heart
- Software can be rewritten. **Data cannot.** Back up, migrate carefully, never lose it.
- Design the data model first; the UI and API should serve the data, not fight it.

## 4. Security is not a feature
- Security is a property of every line, from the first commit.
- Never trust user input. Never store secrets in code. Never log secrets.

## 5. Automation over memory
- If you do it twice, automate it. If you remember it, write it down.
- Scripts, CI, linters, tests — the machine remembers so you don't have to.

## 6. Communicate through code
- Names > comments. Comments explain *why*, never repeat *what*.
- The codebase is documentation. If the code is unclear, fix the code.

## 7. Measure before optimizing
- Never guess where the bottleneck is. Profile, measure, then optimize.
- Premature optimization is the root of almost all maintainability problems.

## 8. Failure is data
- Every bug is a lesson. Every outage is a process improvement.
- Postmortems without blame → systems get better.

## 9. Human judgment over dogma
- "Best practice" without context is cargo cult. Rules serve the team, not the reverse.
- When in doubt: smallest change, safest path, most transparent outcome.

## 10. Ask before assuming
- Requirements are rarely the hard part; misunderstanding them is.
- Clarify scope, constraints, and "done" before writing code.

## Links
- Next: [[02-Architecture]] · Back to [[Home]] · see the build layers [[03-Backend]] / [[04-Frontend]] / [[05-Databases]]
