---
tags:
  - brain
  - databases
created: 2026-08-10
updated: 2026-08-10
---
# 05 - Databases

> Choose the right tool, design the schema first, and treat migrations as the riskiest operation you run.

## Choosing a database
| Need | Use |
|---|---|
| Relational, transactional, money | PostgreSQL (default answer) |
| Flexible documents, fast iteration | MongoDB / DocumentDB |
| Caching, ephemeral, hot reads | Redis |
| Full-text / search | Postgres FTS, Meilisearch, Elasticsearch |
| Analytics / big queries | ClickHouse, BigQuery, data warehouse |
| Vectors / RAG | pgvector (Postgres) or dedicated vector DB |

## 2026: Postgres-first data platform
- The "SQL vs NoSQL" debate is dead — it's **"Postgres core + edge store when a workload really demands it."** Most production architectures consolidate on Postgres-first, using extensions instead of extra engines:
  - **JSONB** — schema-less documents inside Postgres (index, constrain, full-text search nested fields). Covers 80% of "NoSQL" needs.
  - **pgvector** — embeddings + hybrid semantic search in SQL (AI/RAG).
  - **TimescaleDB** — time-series: compression, retention, downsampling.
  - **PostGIS** — geospatial. **Citus** — horizontal scale-out with familiar SQL.
- Choose NoSQL only for a named problem, not ideology: high-velocity unstructured ingestion (logs, IoT, feeds), or day-one horizontal scale with unpredictable schemas. Then keep a **relational core** for correctness and analytics (SQL joins/window functions belong there), feeding it via CDC/FDW/ETL.
- **JSONB rule of thumb**: strong schema for critical entities (users, orders, payments) + JSONB columns for rapidly-changing metadata. Structure is where you can afford it.
- Data usually **gravitates to structure over time** — migrations to Postgres outnumber the reverse.

## Postgres default rules
- **Migrations > schema push.** Generate migration files; never `push` in production.
  - Migration order matters: **DB first, then code**. New code on old schema = outage during deploy.
- Always a rollback path for a migration. Test restores, not just backups.
- Index what you query, not everything. Composite indexes follow query patterns.
- Use transactions for multi-step writes. Idempotency for retries.
- Explain/Analyze before optimizing. Measure.

## Zero-downtime migrations (2026 playbook)
- **Expand-and-contract**: add column nullable → backfill in follow-up → add constraint → (next deploy) drop old. Never rename or drop a column until all code references are gone for ≥1 full deploy cycle.
- **Dual-write / strangler**: write to both old and new, compare, flip reads, retire old. Log-based **CDC** keeps replicas/consumers in sync without dual-write.
- **Shadow traffic testing**: replay production traffic against the new schema/DB before cutting over.
- Anti-patterns that cause outages: untested migrations, no rollback, rename-in-one-step, `DROP COLUMN`, long row locks on prod tables, editing already-executed migrations, no backups.
- **Diff in CI**: auto-diff schema on every PR so reviewers see exact impact; commit a schema lockfile alongside code; block breaking merges.
- Small frequent changes beat big-bang rewrites; time migrations on prod-sized data; verify data integrity after deploy.

## Schema discipline
- Constraints are documentation: NOT NULL, UNIQUE, CHECK, FKs enforced by the DB.
- Soft deletes only when you actually need history; they break FK semantics.
- Timestamps: `created_at` / `updated_at` everywhere; set defaults in the DB.

## ORM vs raw SQL
- ORM (Prisma, Drizzle, TypeORM) for velocity and type safety.
- Drop to SQL for the hot path / complex reporting queries.
- Always generate typed queries; never concatenate user input into SQL.

## Data safety
- Backup strategy: automatic, tested-restore, off-site.
- Backups are worthless until a restore has been proven.
- Migrations and schema changes need review like code does — they are code.

## Performance
- Set an index budget; monitor slow queries.
- N+1 is the #1 backend perf bug — batch loads (join/query builder includes).
- Cache the read-heavy, hot data; invalidate on write.

## Indexing (2026)
| Index type | When |
|---|---|
| B-tree | Default: `=`, range, ORDER BY, `LIKE 'x%'` (~95% of cases) |
| GIN | Arrays, JSONB containment (`@>`), full-text, pg_trgm |
| BRIN | Huge append-only / time-series, physically ordered |
| Partial | Hot subset (`WHERE status='pending'` / `deleted_at IS NULL`) — ~20× smaller |
| Covering `INCLUDE` | Read-heavy hot paths → index-only scans |
- **`NULLS NOT DISTINCT`** (PG 15+): `UNIQUE NULLS NOT DISTINCT (...)` — lets a unique column hold one NULL (default treats NULLs as distinct → unlimited).
- **Too many indexes hurt writes** (every INSERT / non-HOT UPDATE writes each one) and bloat WAL, caches, planning. Audit `pg_stat_user_indexes`: unused = `idx_scan = 0` (exclude `indisunique`) over ≥1 month → `DROP INDEX CONCURRENTLY`. Treat ≥30–40% bloat as "fix it".

## Partitioning — payoff criteria
- Partition **only** when the table exceeds the working set AND has a clear discard pattern — otherwise fix indexes + autovacuum first.
- Payoff: DROP/DETACH of old partitions is instant (vs. a long DELETE+VACUUM); per-partition indexes stay small; partition pruning skips irrelevant ranges.
- **Constraints**: unique/PK must include the partition key (no global indexes); FK targets become composite; updating the partition key moves the row; HASH modulus can't change without a rebuild.
- RANGE = time-series, LIST = discrete values, HASH = even spread. Roll the window with **pg_partman + pg_cron**; `ATTACH` an existing table with a pre-added CHECK to skip the full scan. PG 18: faster planning with many partitions, `NOT VALID` FK on partitioned tables.

## Connection pooling
- `pool_size ≈ (cores × 2) + 1` (SSD) — size to DB parallelism, not traffic; bigger pools add lock/context-switch contention.
- **PgBouncer transaction mode breaks session features** (prepared statements, `SET`, temp tables, `LISTEN/NOTIFY`) — point migrations/admin at a direct connection. Alert when `SHOW POOLS` shows `cl_waiting > 0`.
- 2026 managed defaults: **Neon** = managed pooler via `-pooler` hostname (up to 10k clients); **Supabase** = Supavisor (transaction :6543, session :5432); **RDS/Aurora** = RDS Proxy. Keep a small client-side pool (`pg.Pool`) per process.

## Tuning knobs (sane defaults)
- `shared_buffers` = **25% RAM** (≤40% hard ceiling); `effective_cache_size` = 50–75% RAM (planner hint only).
- `work_mem` = 32–64 MB global — it's **per sort/hash op per connection**, so big reports need their own session bump; watch for disk spills ("external merge Disk").
- `maintenance_work_mem` = 256 MB–1 GB (index builds, VACUUM). `random_page_cost` = 1.1 on SSD.
- Checkpoints: `max_wal_size` 2–4 GB, `checkpoint_completion_target` 0.9; forced checkpoints (`checkpoints_req`) = too low.
- **Autovacuum**: the default 20% scale factor is too late for big/high-churn tables → per-table `autovacuum_vacuum_scale_factor = 0.01–0.05`, `cost_limit = 1000`; watch `pg_stat_progress_vacuum` and `n_dead_tup`.

## Postgres observability & extensions
- **pg_stat_statements** (`shared_preload_libraries`; sort by `total_exec_time`) → top queries; **auto_explain** logs plans over N ms; progress views for VACUUM/index builds.
- Monitoring: pganalyze (query/index/vacuum advisors), pgHero (free dashboard), Percona PMM, TimescaleDB toolkit.
- **hypopg** — hypothetical indexes (`hypopg_create_index` + EXPLAIN, zero cost). **pg_repack** — online bloat removal (no exclusive lock; needs ~2× table disk). **pg_stat_monitor** — per-time-bucket query stats beyond pg_stat_statements. **pgaudit** — READ/WRITE/DDL audit logs. **pg_cron** — in-DB scheduling (partition maintenance, retention).

## Local-first software & CRDTs (2026)
- **Definition** (Ink & Switch ideals): reads/writes hit a **local client DB first**, auto-syncing in the background; the device copy is primary, the server holds a secondary copy. Offline works, no spinners, real-time collab, data survives vendor shutdown. 2026 is production-mature (Automerge 3, Loro 1.0, SQLite-WASM + OPFS, Apple's CloudKit CRDTs) and shippers include Figma, Linear, Notion, tldraw, Obsidian.
- **Fits** → notes, docs, canvases, CRM, tasks, chat, mobile/field, per-user/partitionable data, offline-critical UX. **Avoid** → money/billing/audit, global invariants, cross-tenant aggregates, strict compliance.
- **CRDT vs OT**: a CRDT merges via commutative/associative/idempotent ops → converges with **no central ordering** (offline/P2P/multi-master). OT needs a central server to serialize ops (smaller, auditable, Google-Docs-style). 2026 pick: **Yjs** (rich-text/editor bindings, huge ecosystem) · **Automerge 3** (arbitrary JSON docs + git-like history) · **Loro** (movable trees, max perf).
- **Conflict resolution**: per-field LWW, counters/registers for stats, merge for lists/sets, custom merge for scalars — **never LWW text** (loses concurrent edits). Hybrid (CRDT structure + OT text) is what Notion does.
- **Sync engines 2026**: **Zero** (Postgres untouched, query-driven sync, new B2B SaaS) · **ElectricSQL** (existing PG, server-authority model) · **PowerSync** (Postgres/Supabase + mobile, bucket-based partial replication) · **Replicache** (own backend) · **Liveblocks / y-sweet** (managed collab). Local store: embedded SQLite via WASM+OPFS (PGlite, cr-sqlite); IndexedDB caveat — **Safari evicts after ~7 days idle**.
- **Gotchas**: **permissions = row-level ACLs enforced server-side at sync time** (never trust client-side filtering); identity = per-user ID + device ID in every mutation; schema drift via version gates + add-only columns; sync rides PG WAL logical replication (ElectricSQL/Zero).
- **AI connection**: local-first + on-device models pair naturally — local embeddings/vector store for agent memory (privacy, no token exfiltration), WebGPU/WASM inference, agents as peers in collab rooms.

