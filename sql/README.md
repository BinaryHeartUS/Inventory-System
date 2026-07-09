# Database Migrations (Flyway)

Database migrations are managed with **Flyway**. All scripts live under
`FlywayMigrations/`, split into folders by kind of object:

| Folder                                     | Flyway type       | Applies to    | Contents                                              |
| ------------------------------------------ | ----------------- | ------------- | ----------------------------------------------------- |
| `010 - Tracked`                            | Versioned (`V…`)  | all envs      | Types, enums, tables, reference-data seeds, user/role setup, indexes |
| `020 - Untracked - Procedures & Functions` | Repeatable (`R…`) | all envs      | Stored procedures and functions                       |
| `030 - Untracked - Triggers`               | Repeatable (`R…`) | all envs      | Triggers (and their inline trigger functions)         |
| `040 - Untracked - Views`                  | Repeatable (`R…`) | all envs      | Views                                                 |
| `090 - Dev Only - Tracked`                 | Versioned (`V…`)  | **dev only**  | Non-production seed data (e.g. the `developer`/`viewer` accounts) |

`010 - Tracked` is further split into sub-folders so the tree stays small:
`Initialization/` holds the original schema, and later changes go in a folder
named for the **year** they were authored (`2026/`, `2027/`, …).

## Environment-specific migrations

Flyway decides which folders to scan from its **`flyway.locations`** setting, and
that is configured per environment:

- **Every** environment scans `010`–`040` (the shared schema + code objects).
- **Only dev** additionally scans `090 - Dev Only - Tracked`.

So the `090` folder's migrations run when the dev database is (re)created but are
never seen by production — that is how the `developer` and `viewer` accounts stay
out of prod. To add another dev-only fixture, drop a `V…` script in `090`; to add
something prod should also get, it belongs in `010`.

## Versioned vs. Repeatable — the two kinds of migration

Flyway has exactly two script types, and the single-letter prefix on the
**filename** is what tells them apart:

- **`V` = Versioned** ("Tracked"). Runs **once**, ever. Flyway records it in its
  `flyway_schema_history` table and never runs it again. Use for anything that
  can't safely be re-executed — creating a table, adding a column, seeding data.
  Versioned scripts are **immutable**: once one has run in any environment you
  must not edit it (Flyway stores a checksum and refuses to start if a
  previously-applied script changed). To change existing schema you add a **new**
  `V…` script.
- **`R` = Repeatable** ("Untracked"). Runs **every time its content changes**.
  Flyway compares a checksum each deploy and re-applies the script if it differs.
  Use only for objects written with `CREATE OR REPLACE …`, which is why
  procedures, functions, triggers, and views live here — they can be safely
  re-defined in place.

## Why the folders alone aren't enough

**Flyway ignores folder names for typing and ordering.** It scans every
configured location (recursively, so sub-folders like `Initialization/` and
`2026/` are included), flattens the files together, and decides each script's
type and order purely from the **filename**. That has two consequences:

1. Every repeatable file still needs the `R__` prefix — a file in
   `020 - Untracked …` is *not* treated as repeatable just because of the folder;
   without `R__` Flyway wouldn't recognize it as a migration at all.
2. Flyway runs all repeatables in **alphabetical order of their description**,
   regardless of folder. So to guarantee functions run before views we bake the
   order into the name (`020` / `030` / `040`), not the folder.

The folders exist to keep files organized for humans (and, for `090`, to be a
separately-scanned location); the filename is what actually drives Flyway.

## Naming convention

### Versioned — `010 - Tracked` and `090 - Dev Only - Tracked`

Format: `V<yyyymmdd>.<NN>__<Description>.sql`

- `<yyyymmdd>` — the date the change was authored (e.g. `20260709`). Newer dates
  sort after older ones, so migrations naturally run in the order they were
  written. (The initial schema in `Initialization/` shares one authoring date;
  it always sorts first because it predates every later change.)
- `.<NN>` — a two-digit sequence. Flyway requires every versioned script to have
  a **unique** version, and it orders them by comparing the numeric parts. The
  sequence makes multiple scripts authored on the **same day** both unique and
  ordered, so dependencies go first (a type before the table that uses it, a
  table before the seed that fills it). `V20260709.02` runs after
  `V20260709.01`.
- `__` — Flyway's **mandatory** separator between the version and the human
  description. It is always a **double** underscore; single underscores are just
  normal characters inside the version or description, so the double underscore
  is what marks where the version ends and the name begins.
  (`V20260709.21__Create_Part_Table` → version `20260709.21`, description
  "Create Part Table".)
- `<Description>` — `Snake_Case`. Postgres folds unquoted identifiers to lower
  case, so `Create_Part_Table` reads better than `CreatePartTable`.

Example: `V20260709.21__Create_Part_Table.sql`

### Repeatable — `020 …`, `030 …`, and `040 …`

Format: `R__<NNN>_<Description>.sql`

- `R__` — the repeatable prefix (again, always a double underscore after `R`).
  Repeatables have **no version number** — Flyway never orders them by version,
  only by description.
- `<NNN>` — an ordering prefix baked into the description so the alphabetical sort
  puts things in dependency order: **`020` (procedures & functions) → `030`
  (triggers) → `040` (views).**
- **Why views come last:** Postgres binds the objects a view references at
  `CREATE VIEW` time, so a view that calls a function needs that function to
  already exist → views must run after functions. Procedure and function bodies
  (PL/pgSQL) are resolved lazily, so they have **no** ordering constraint among
  themselves and all share the `020` prefix.
- **Triggers (`030`) sit between them.** A `CREATE TRIGGER` needs its trigger
  function to exist first, but every trigger script in this repo defines its
  function (`CREATE OR REPLACE FUNCTION …`) immediately above the
  `CREATE OR REPLACE TRIGGER …` in the same file, so that dependency is satisfied
  within the script. Triggers otherwise only reference tables (from `010`), so
  their `030` slot is really just for tidy separation — functionally they only
  need to run after `010`.

Example: `R__020_Get_Device_Type.sql`, `R__030_Device_Change_Log_Trigger.sql`,
`R__040_Get_Devices_View.sql`

## Adding a migration

- **New/changed table, type, seed, or index** → add a new `V<today>.<NN>__….sql`
  under `010 - Tracked/<year>/` (create the year folder if it's the first change
  of the year). Pick an `NN` after the last one used that day, and make sure
  anything it depends on has a lower version. Never edit a `V…` script that has
  already been deployed — add a new one instead.
- **New dev-only fixture** → add a `V…` script under `090 - Dev Only - Tracked/`.
- **New/changed stored procedure or function** → add or edit an `R__020_….sql` in
  `020 - Untracked - Procedures & Functions`.
- **New/changed trigger** → add or edit an `R__030_….sql` in
  `030 - Untracked - Triggers`.
- **New/changed view** → add or edit an `R__040_….sql` in
  `040 - Untracked - Views`.

## Restoring a database from a backup

`scripts/backup-db.sh` dumps a whole environment's database with `pg_dump | gzip`.
That dump includes the `flyway_schema_history` table, so a restore needs nothing
Flyway-specific — Flyway resumes from whatever migration state the backup captured
and only applies migrations authored after it.

On the server:

```bash
# 1. Stop writers.
docker compose -p inventory-<env> -f docker-compose.app.yml stop backend frontend

# 2. Recreate an empty database.
docker exec -i inventory-<env>-db-1 psql -U binaryheart -d postgres \
  -c "DROP DATABASE inventory WITH (FORCE);" \
  -c "CREATE DATABASE inventory OWNER binaryheart;"

# 3. Load the dump (tables, data, and flyway_schema_history).
gunzip -c /opt/backups/inventory/<env>/inventory_<timestamp>.sql.gz \
  | docker exec -i inventory-<env>-db-1 psql -U binaryheart -d inventory

# 4. Bring the app back; the next deploy's `flyway migrate` applies anything newer.
docker compose -p inventory-<env> -f docker-compose.app.yml up -d backend frontend
```
