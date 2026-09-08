---
tags:
  - ai-brain
  - knowledge
  - process
created: 2026-09-05
updated: 2026-09-06
type: concept
description: OKF/OKM - the frontmatter and freshness conventions every note in this brain follows, plus how retrieval and staleness use them.
---
# OKF / OKM conventions

Every note carries OKF frontmatter: `tags`, `created`, `updated`, `type`, `description`. Every fact is timeless, dated (`as_of`), or a pointer.

- Types: concept, reference, decision, howto, project, metric, claim, manual.
- Tags come from the controlled vocabulary in `scripts/taxonomy.mjs`.
- The validators (`validate-brain.mjs`, `validate-ai-brain.mjs`) enforce both on every commit.
- Fast-changing facts carry `as_of: YYYY-MM-DD`; optional `stale_after: YYYY-MM-DD` makes `brain-lint` surface a note once it is past date.
- Layers: `wiki/` is the long-term semantic layer; `daily/` + `inbox/` are the episodic layer; `skills/` +  are procedural.

## Retrieval (how OKM is used)

- Lexical + tiered search (wiki > daily/ledgers > legacy) with time decay is the **always-on default** - works headless, no model needed.
- Semantic search over the 212-note local index activates when the Mini's Ollama is up (`qwen3:8b` + `nomic-embed-text`).
- See  and  for the full resolution.

## Staleness policy

- `brain-lint` flags notes past `stale_after` and notes with zero backlinks (orphans).
- Orphans are backlinked or archived during the next write; review findings go to `reviews/`.
- The legacy `Brain/` chamber is archived reference (read-only for agents) and is not staleness-tracked; facts that matter for active work get distilled into `wiki/` with proper dating (see ).

## Housekeeping

- The 2026-09-06 knowledge-refresh pass reworked `okm`, `machine-brain`, `index`, `rhine-solution`, added `retrieval`/`machine-config`/`health-dashboard`, and repaired stale dates. Filed as .

Related: [[machine-brain]] -  - [[index]] - 
