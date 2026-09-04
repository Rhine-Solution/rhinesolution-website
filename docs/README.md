# Engineering Documentation — Rhine Solution

This directory is the **living engineering documentation** for the Rhine Solution
website. It is intended to be read and maintained for as long as the project
lives — a company-style reference, not a one-off.

## Contents

| Document | Purpose |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the app is structured and why |
| [STACK.md](STACK.md) | Tech stack, key decisions, and rationale |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Environments, CI, and release process |
| [SECURITY.md](SECURITY.md) | Security model, verification, and hardening |
| [ADRS.md](ADRS.md) | Architecture Decision Records (living history) |
| [ROADMAP.md](ROADMAP.md) | What we are building next |

## Maintenance rule

Keep this documentation current in the same PR that changes the code it
describes. A change that touches architecture, deployment, security, or a
design decision should update the matching document in the same change set.
Stale documentation is worse than none — if a section drifts, fix it as you go.

## Docs are public

This repository is public. Everything in `docs/` is visible to the world and to
clients. Keep it professional and free of secrets, internal notes, personal
paths, or anything that should stay private. Internal operational detail
belongs in the private Obsidian Brain, not here.

## Naming

- Use `docs/` consistently; do not create parallel doc folders.
- One topic per file, cross-linked from this index.
- Write for a capable reader: state the decision, the reason, and the trade-off.
