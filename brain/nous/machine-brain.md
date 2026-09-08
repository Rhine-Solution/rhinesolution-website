---
tags:
  - ai-brain
  - knowledge
  - obsidian
created: 2026-09-05
updated: 2026-09-06
type: concept
description: NOUS - the self-organizing AI-augmented chamber of the brain where agents capture, think, and compound. Refreshed 2026-09-06.
---
# Machine brain (NOUS)

The machine brain is the AI-augmented chamber (`Brain/_machine/`) where agents capture, think, and compound - separate from the read-only legacy `Brain/`.

## Identity

- NOUS. Operating rules live in ; the authoritative personality spec lives in .
- Live Discord presence via the  (Free Claude Code bridge on the Mac Mini).
- Boot order at every session start: manual -> personality ->  -> newest daily + reviews.

## Skills & tools

- 15 `brain-*` skills: capture, save, query, lint, consolidate, incident, write, status, context, daily, weekly, index, export, merge, security.
- Write path: every agent write goes through `scripts/brain-write.mjs` (atomic + lock + auto-commit per transaction).
- CI on every push: validators, lint, secret scan, unit tests (`npm run check`).

## Retrieval

- Default: lexical + tiered search with time decay (`scripts/vault-search.mjs`) - fast, headless, no model dependency.
- Semantic: a 212-note index (built 2026-09-06 with `nomic-embed-text`) activates when the local Ollama is up. See  and .

## Machines & state

- Headless machine config + member sync kit:  (scripts, prompts, skills, encrypted secrets, restore).
- Self-reporting status:  (daily health-check posts to Discord + `status/health.md`).
- Scheduler kit for the Mini:  /  /  / .
- Memory tiers + consolidation rules: episodic (`inbox/` + `daily/`) -> semantic (`wiki/`) -> procedural (`skills/` + ). See .

Related: [[rhine-solution]] - [[okm]] - [[index]] - 
