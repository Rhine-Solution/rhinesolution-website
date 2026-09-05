---
tags:
  - ai-brain
  - knowledge
  - process
created: 2026-09-05
updated: 2026-09-05
type: concept
description: OKF/OKM — the frontmatter and freshness conventions every note in this brain follows.
---
# OKF / OKM conventions

Every note carries OKF frontmatter: `tags`, `created`, `updated`, `type`, `description`. Every fact is timeless, dated (`as_of`), or a pointer.

- Types: concept, reference, decision, howto, project, metric, claim, manual.
- Tags come from the controlled vocabulary in `scripts/taxonomy.mjs`.
- The validators (`validate-brain.mjs`, `validate-ai-brain.mjs`) enforce both on every commit.
- Related: [[machine-brain]] ·  · [[index]]