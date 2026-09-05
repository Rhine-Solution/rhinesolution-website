---
tags:
  - ai-brain
  - knowledge
  - obsidian
created: 2026-09-05
updated: 2026-09-05
type: concept
description: NOUS — the self-organizing AI-augmented chamber of the brain where agents capture, think, and compound.
---
# Machine brain (NOUS)

The machine brain is the AI-augmented chamber (`Brain/_machine/`) where agents capture, think, and compound — separate from the read-only legacy `Brain/`.

- Identity: NOUS. Operating rules live in .
- 15 `brain-*` skills: capture, save, query, lint, consolidate, incident, write, status, context, daily, weekly, index, export, merge, security.
- Write path: every agent write goes through `scripts/brain-write.mjs` (atomic + lock + auto-commit).
- Related: [[rhine-solution]] · [[okm]] · [[index]]