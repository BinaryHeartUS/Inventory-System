# Migrating to Flyway — remaining work

This document tracks everything still required to move the database migration
system from the hand-rolled `sql/migrate.sh` runner to **Flyway**. The SQL files
have already been reorganized into the Flyway layout under
`sql/FlywayMigrations/` (see `sql/README.md` for the folder/naming convention);
what remains is the *wiring* — installing Flyway, configuring it per environment,
baselining the existing databases, retiring the old runner and its tracking
table, and updating the GitHub Actions pipeline.

> **Status: NOT deployable yet.** Until the steps below are done, `migrate.sh`
> is broken (it still globs the old `CreateTypes/…` folder names that no longer
> exist). Do not deploy from `main` until this migration is completed or the old
> layout is restored.

---

## 0. Background: what changes and why

### The two tracking tables

| | Old runner | Flyway |
| --- | --- | --- |
| Tracking table | `_schema_migrations` (`script_name`, `applied_at`) | `flyway_schema_history` (version, description, checksum, success, …) |
| "Run once" logic | `run_once()` checks `_schema_migrations` by filename | Versioned `V…` scripts recorded by version + checksum |
| "Re-run on change" | `run_always()` re-runs every deploy unconditionally | Repeatable `R…` scripts re-run only when their checksum changes |
| Ordering | folder-by-folder in the bash script | filename-driven (version order, then repeatables alpha by description) |

The two tables are independent. The cutover has to **baseline** each existing
database so Flyway believes the already-applied `V…` migrations are done and does
not try to re-create tables that already exist.

### Key facts that shape the steps below

- Flyway connects as the Postgres **superuser** `binaryheart` (same as
  `migrate.sh` does today via the `db-migrate` service).
- The `db-migrate` service currently also does two things beyond running SQL that
  Flyway does not do natively and must be preserved:
  1. `ALTER USER api_user/importer PASSWORD …` from `API_USER_PASSWORD` /
     `IMPORTER_PASSWORD` env vars (see the tail of `sql/migrate.sh`).
  2. Waits for the DB to be ready (Compose `depends_on: service_healthy`
     already covers this, so Flyway can rely on it).
- Repeatable order is enforced by the numeric filename prefix
  (`R__020_` procs/functions → `R__030_` triggers → `R__040_` views), **not** by
  the folder. Flyway scans locations recursively.

---

## 1. Fix the SQL that will break under Flyway

Flyway runs each migration with `ON_ERROR_STOP`-equivalent behavior (any failing
statement aborts the migration), unlike the old `psql -f` runner which silently
continued. Two things currently rely on that lenient behavior.

### 1a. `DROP … IF EXISTS` pattern (DONE) and the two function exceptions

Every DDL object in the repeatable folders now follows a uniform
**drop-then-create** pattern so each is safely re-runnable and can be reshaped
(not just body-edited):

- **Procedures & functions (`020`)** — each begins with `DROP PROCEDURE/FUNCTION
  IF EXISTS …;` then `CREATE OR REPLACE …`.
- **Triggers (`030`)** — each begins with `DROP TRIGGER IF EXISTS <trig> ON
  <table>;` + `DROP FUNCTION IF EXISTS <trigfn>();`, then plain `CREATE FUNCTION`
  / `CREATE TRIGGER`.
- **Views (`040`)** — each begins with `DROP VIEW IF EXISTS <view>;` then
  `CREATE VIEW`. (Plain `CREATE OR REPLACE VIEW` can't change a view's column
  set/names/types; the drop lets a view be reshaped.)

**The two deliberate exceptions:** `R__020_Get_Device_Type_Function.sql` and
`R__020_Get_Charger_Status_Function.sql` **must not** have a `DROP FUNCTION` line.
The `Get_Devices` view (in `040`) calls both, and repeatables run `020` **before**
`040`, so at the moment those `020` files run, the previous deploy's `Get_Devices`
view still exists and Postgres **refuses** to drop a function a view depends on
("cannot drop function … because other objects depend on it") — which aborts the
migration under Flyway. Adding `DROP VIEW` to the view files does **not** fix this
(ordering: the view isn't dropped until the later `040` phase). Both files use
`CREATE OR REPLACE FUNCTION` with an explanatory comment; a signature/return-type
change to either is handled by a versioned migration (case 3 below).

Guard against regressions — this should return only those two files:

```bash
# functions referenced inside any view (they must stay CREATE OR REPLACE, no DROP):
grep -rl 'Get_Device_Type\|Get_Charger_Status' "sql/FlywayMigrations/040 - Untracked - Views"
```

#### What to do instead when a function's signature changes

The reason those `DROP` lines exist is that `CREATE OR REPLACE FUNCTION` **cannot**
change a function's return type, and changing the **argument list** doesn't
replace the old function — Postgres identifies a function by *name + argument
types*, so `CREATE OR REPLACE insert_device(a, b, c)` leaves any previous
`insert_device(a, b)` sitting there as a second overload. So there are three
cases:

1. **Body-only change (the 99% case)** — edit the `R__020_…` file and redeploy.
   `CREATE OR REPLACE` handles it; the checksum changes so Flyway re-runs it. No
   `DROP` needed.
2. **Argument list changes** — edit the `R__020_…` file for the new signature,
   **and** add a one-off **versioned** migration that removes the stale overload:
   `V<today>.NN__Drop_Old_Insert_Device_Signature.sql` containing
   `DROP FUNCTION IF EXISTS insert_device(integer, integer);` (the *old* argument
   types). In a single `flyway migrate`, all pending `V…` run first, then changed
   `R…`, so the drop and the recreate happen in the right order automatically.
3. **Return-type change, or a function a view depends on** — do the whole thing
   in one versioned migration: drop the dependent view, drop the function,
   then let the repeatables recreate them in the same `migrate` run. Because
   versioned migrations run before repeatables, put
   `DROP VIEW IF EXISTS Get_Devices; DROP FUNCTION IF EXISTS Get_Device_Type(integer);`
   in `V<today>.NN__…sql`, edit the function's `R__020_…` file, and make any edit
   (even a comment) to the view's `R__040_…` file so its checksum changes and
   Flyway re-creates it on top of the new function within the same run.

**Should functions just be dated like versioned files (`insert_device_20260709`)?**
No. That turns every routine edit into a rename cascade — you'd have to update
every caller (procedures, views, the backend) each time, and you'd accumulate dead
copies. Keep the repeatable model: stable names, `CREATE OR REPLACE`, and a small
versioned drop only for the rare signature change.

**Why not just `DROP … CASCADE` at the top of every function file?** Because in a
**repeatable** it is actively dangerous. `CASCADE` silently drops dependent
objects (e.g. a view), and Flyway only re-runs a repeatable when *its own*
checksum changed. So if you edit a function (its checksum changes → it re-runs →
`DROP … CASCADE` also drops the view) but the view file itself is unchanged,
Flyway will **not** re-create the view — it's now silently missing until the next
time that view file happens to change. Targeted, explicit drops in **versioned**
migrations (case 2/3 above) avoid this entirely.

### 1b. View grants for `api_user` — already handled

`V20260709.35__Setup_Database_Users_Script.sql` runs in `010` (before the views
are created in `040`), so its point-in-time `GRANT … ON ALL TABLES` does not cover
the views. **But the script already also has:**

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, SELECT, UPDATE, DELETE ON TABLES TO api_user;
```

In Postgres, `ALTER DEFAULT PRIVILEGES … ON TABLES` **applies to views too**
(a view is a relation), for any object created *after* that statement *by the same
role* (here the `binaryheart` superuser Flyway runs as). Since this runs in `010`,
before the views in `040`, every view created later automatically grants `SELECT`
to `api_user`/`importer`. **So the current script is correct — no change is
needed.**

If you ever want belt-and-suspenders (e.g. views created by a *different* role, or
to re-assert grants each deploy), add a repeatable that sorts last,
`R__050_Grant_View_Access.sql`:

```sql
GRANT SELECT ON ALL TABLES IN SCHEMA public TO api_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO importer;
```

but with the default-privileges lines already present this is optional.

### 1c. Audit for placeholder collisions

Flyway does `${...}` placeholder substitution by default. Search the SQL for any
literal `${` (dollar-quoted PL/pgSQL uses `$$ … $$`, which is fine, but a literal
`${` would be treated as a placeholder):

```bash
grep -rn '\${' sql/FlywayMigrations
```

If anything legitimate matches, either escape it or set
`flyway.placeholderReplacement=false` in the config (§3). PL/pgSQL `$$` blocks are
**not** affected.

---

## 2. Install Flyway (replace the migrate image)

The migration container is built from `sql/Dockerfile.migrate`. Replace the
`postgres:16` + `migrate.sh` image with the official Flyway image.

### 2a. New `sql/Dockerfile.migrate`

```dockerfile
FROM flyway/flyway:10-alpine
# Migrations (recursively scanned; folder names are cosmetic).
# The app-user password callback (see 2c) lives alongside the migrations.
COPY FlywayMigrations /flyway/sql
COPY flyway.conf /flyway/conf/flyway.conf
# Uses the image's default entrypoint (`flyway`); the command is set in Compose.
```

No custom entrypoint is needed — the stock `flyway` entrypoint is used and the
command (`migrate` / `info` / `validate`) is supplied by Compose or the CLI.

### 2b. `sql/flyway.conf`

Connection is provided by env vars in Compose; keep only the static bits here.
Locations are **per environment** (see §3), so leave `flyway.locations` to be set
via env var, or make two conf files.

```properties
# JDBC connection is supplied via FLYWAY_URL / FLYWAY_USER / FLYWAY_PASSWORD env.
flyway.schemas=public
flyway.baselineOnMigrate=false
flyway.validateOnMigrate=true
# Repeatables re-run when their checksum changes:
flyway.outOfOrder=false
# Fail if a previously-applied migration's checksum changed:
flyway.cleanDisabled=true
```

> `flyway.cleanDisabled=true` is important — it prevents `flyway clean` (which
> drops everything) from ever running against a real database.

### 2c. Preserve the app-user password step (use a callback, not a wrapper)

`migrate.sh` sets the `api_user`/`importer` passwords from env at the end. Flyway
doesn't do this natively, but the clean way is a Flyway **`afterMigrate`
callback** — a SQL file Flyway automatically runs after a successful `migrate`.
No custom entrypoint or shell wrapper required.

Create `sql/FlywayMigrations/callbacks/afterMigrate__Sync_App_User_Passwords.sql`
(add `filesystem:/flyway/sql/callbacks` to the locations, or drop it in an
already-scanned location):

```sql
ALTER USER api_user PASSWORD '${api_user_password}';
ALTER USER importer PASSWORD '${importer_password}';
```

Flyway fills `${…}` placeholders from env vars named `FLYWAY_PLACEHOLDERS_*`, so
in Compose (§4) set:

```yaml
      FLYWAY_PLACEHOLDERS_API_USER_PASSWORD: ${API_USER_PASSWORD}
      FLYWAY_PLACEHOLDERS_IMPORTER_PASSWORD: ${IMPORTER_PASSWORD}
```

**Why this over the wrapper:** it keeps everything inside Flyway (one process, one
failure mode), needs no `psql` shelling, and runs on every `migrate`. Two things
to note:

- Callbacks are **not** recorded in `flyway_schema_history`, and Flyway does not
  echo SQL bodies at the default `INFO` log level, so the passwords don't leak
  into history or normal logs (don't run these deploys at `-X`/debug).
- The placeholder must always be set. Both `deploy/*.env`/`secrets/*.env` already
  provide `API_USER_PASSWORD`/`IMPORTER_PASSWORD`, so this holds. (If you ever
  need the *conditional* "skip when empty" behavior the old script had, that's the
  one case a tiny entrypoint wrapper would still be justified.)

---

## 3. Per-environment configuration (dev-only locations)

> **Where does `flyway.locations` live? It doesn't exist yet.** There is no Flyway
> config in the repo today because the cutover hasn't happened — creating it is
> part of *this* work (the `flyway.conf` in §2b plus the `FLYWAY_LOCATIONS` env in
> §4). Once those exist, "locations" is just the list of folders Flyway scans.

The dev-only seed (the `developer`/`viewer` accounts) must run in **dev only**.
Flyway has no "scan everything *except* X" option — `locations` is an *additive*
list. It scans each listed location **recursively**, so you point at a folder and
get every `.sql` beneath it. There are two clean ways to get "dev-only":

### Option A (recommended): one shared root + a separate dev-only root

Split the tree into two top-level subtrees so each environment points at whole
folders, with no per-folder enumeration:

```
FlywayMigrations/
  common/      <- 010, 020, 030, 040 (everything both envs share)
  dev-only/    <- the developer/viewer seed
  callbacks/   <- afterMigrate password sync (§2c)
```

Then:

- **prod** → `FLYWAY_LOCATIONS=filesystem:/flyway/sql/common,filesystem:/flyway/sql/callbacks`
- **dev** → `…common,…callbacks,filesystem:/flyway/sql/dev-only`

Prod scans `common` (all of `010`–`040`) and never sees `dev-only`. This is the
"everything except the dev folder" behavior you asked about — achieved by *where*
the folder sits, since Flyway can't exclude a path. Moving the current
`090 - Dev Only - Tracked` under a `dev-only/` sibling of a `common/` parent is
the one structural change this option needs.

### Option B: keep the current flat layout and enumerate

Leave `010`–`040` and `090` as siblings under `FlywayMigrations/` and list the
shared folders explicitly for prod:

- **prod** (`deploy/prod.env`):

  ```
  FLYWAY_LOCATIONS=filesystem:/flyway/sql/010 - Tracked,filesystem:/flyway/sql/020 - Untracked - Procedures & Functions,filesystem:/flyway/sql/030 - Untracked - Triggers,filesystem:/flyway/sql/040 - Untracked - Views,filesystem:/flyway/sql/callbacks
  ```

- **dev** (`deploy/dev.env`): the same list **plus**
  `filesystem:/flyway/sql/090 - Dev Only - Tracked`.

Enumerating four folders in a committed env file is set-once and rarely changes,
so Option B is perfectly fine; Option A is just tidier and future-proof. Note that
dev **cannot** simply point at the whole `FlywayMigrations/` root while prod
enumerates — that works, but then adding a new top-level shared folder means
remembering to add it to prod's list. Option A avoids that.

> Because prod never lists the dev-only folder, prod's `flyway_schema_history`
> simply never contains the developer/viewer seed's version. A location that is
> never scanned produces no migration record at all (no "missing" warning).

---

## 4. Update Docker Compose

`docker-compose.app.yml`'s `db-migrate` service currently passes
`DB_USER/DB_PASSWORD/API_USER_PASSWORD/IMPORTER_PASSWORD`. Add the Flyway
connection env and the command.

```yaml
  db-migrate:
    image: ${REGISTRY}/migrate:${IMAGE_TAG}
    restart: "no"
    depends_on:
      db:
        condition: service_healthy
    environment:
      # Flyway JDBC connection (superuser):
      FLYWAY_URL: jdbc:postgresql://db:5432/inventory
      FLYWAY_USER: binaryheart
      FLYWAY_PASSWORD: ${DB_PASSWORD}
      FLYWAY_LOCATIONS: ${FLYWAY_LOCATIONS}
      # App-user password sync via afterMigrate callback placeholders (§2c):
      FLYWAY_PLACEHOLDERS_API_USER_PASSWORD: ${API_USER_PASSWORD}
      FLYWAY_PLACEHOLDERS_IMPORTER_PASSWORD: ${IMPORTER_PASSWORD}
    command: ["migrate"]
```

The `backend` service already gates on
`db-migrate: condition: service_completed_successfully`, so no change is needed
there — Flyway exiting 0 keeps that contract.

---

## 5. Baseline the existing databases (one-time, per environment)

Both dev and prod already have fully-built schemas managed by `_schema_migrations`.
Flyway must be told "the schema up to the baseline version already exists" so it
does not re-run the `010` migrations (which would fail on existing objects).

Run **once per environment**, over SSH, before the first Flyway deploy:

```bash
# On the server, against the running db container for the env:
docker run --rm --network inventory-<env>_default \
  -e FLYWAY_URL=jdbc:postgresql://db:5432/inventory \
  -e FLYWAY_USER=binaryheart \
  -e FLYWAY_PASSWORD='<db password>' \
  -v "$PWD/sql/FlywayMigrations:/flyway/sql" \
  flyway/flyway:10-alpine \
  -baselineVersion=20260709.39 \
  -baselineDescription="Pre-Flyway baseline" \
  baseline
```

- `-baselineVersion=20260709.39` = the highest `V…` version already applied by the
  old runner. Flyway marks everything **at or below** that version as already
  applied and will only run **newer** versioned migrations going forward.
- After baseline, `flyway_schema_history` exists with a single `<< Flyway Baseline >>`
  row. The **repeatables** (`020`/`030`/`040`) are not versioned, so the first
  `flyway migrate` after baseline will run all of them once (harmless — they are
  all `CREATE OR REPLACE`) and record their checksums.
- **dev caveat:** dev's baseline should still be `20260709.39`; the dev-only
  `.38` seed was already applied by the old runner, so it is below the baseline
  and will not re-run. Good.

> Do NOT run `flyway migrate` before `flyway baseline` on the existing DBs — that
> would attempt every `010` migration against a populated schema and fail.

---

## 6. Retire the old runner and its table

Once Flyway is running in both environments and a deploy has succeeded:

1. **Delete** `sql/migrate.sh`.
2. **Delete** the legacy local-dev init in `sql/Dockerfile` if it still references
   the removed `CreateTypes/…` folders (verify nothing else uses it; the local
   `docker-compose.yml` dev DB may need repointing at Flyway too).
3. **Drop the old tracking table** in each environment (optional, after you are
   confident in the cutover — keep it a while as a safety record):

   ```sql
   DROP TABLE IF EXISTS _schema_migrations;
   ```

4. Update `sql/README.md` cross-references if any still mention `migrate.sh`.

---

## 6a. Restoring a database

There is no `restore-backup.sh` script (only `scripts/backup-db.sh`, which does
`pg_dump | gzip`). With Flyway, **restore is just a normal Postgres restore** —
Flyway needs nothing special, because `flyway_schema_history` is an ordinary table
that is included in the dump and comes back with everything else.

To restore one environment from a backup (run on the server):

```bash
# 1. Stop the app so nothing writes mid-restore.
docker compose -p inventory-<env> -f docker-compose.app.yml stop backend frontend

# 2. Drop and recreate the database (or restore into a fresh empty DB).
docker exec -i inventory-<env>-db-1 \
  psql -U binaryheart -d postgres \
  -c "DROP DATABASE inventory WITH (FORCE);" -c "CREATE DATABASE inventory OWNER binaryheart;"

# 3. Load the dump (it recreates every table, data, AND flyway_schema_history).
gunzip -c /opt/backups/inventory/<env>/inventory_<timestamp>.sql.gz \
  | docker exec -i inventory-<env>-db-1 psql -U binaryheart -d inventory

# 4. Bring the app back. The next deploy's `flyway migrate` sees history already
#    at the backup's point and only applies migrations newer than the backup.
docker compose -p inventory-<env> -f docker-compose.app.yml up -d backend frontend
```

Key point: because the restored dump carries its own `flyway_schema_history`,
Flyway resumes cleanly from whatever state the backup was in — no baseline or
repair needed. Any migrations authored *after* that backup are simply still
pending and apply on the next deploy. (This is also why you never hand-edit prod:
a restore + re-migrate must reproduce the schema.)

---

## 7. Preflight / verification (the "plan" stage)

The main goal here is to **see, before applying, exactly which migrations will
run** — especially the tracked (`V…`) ones, since those are the irreversible
schema changes. Flyway gives that directly:

- **`flyway info`** — the plan output. Prints every migration with its state:
  `Pending` (will run now), `Success` (already applied), `Ignored`, `Failed`,
  plus version, description, and type. Reading the `Pending` rows tells you
  precisely what this deploy would change. This is what the ungated `plan-db`
  stage should print so a human (and, for prod, the reviewer on the gate) can see
  the planned tracked migrations before approving.
- **`flyway validate`** — confirms every already-applied migration still matches
  its file by checksum and that none are missing/failed. Catches "someone edited
  an already-applied `V…`" or a migration that was applied to this DB but no
  longer exists in the repo. Exits non-zero on a problem, so it fails the plan
  stage *before* the gated apply.

Run both in the plan stage: `flyway info` for the human-readable plan, then
`flyway validate` as the pass/fail gate.

> A from-scratch rebuild test (running all migrations against a throwaway
> Postgres) is a *nice-to-have* CI check but not the priority here — `flyway info`
> against the real dev/prod DBs is what tells you what a given deploy will do.
> Flyway Community does not diff live schema vs. expected (that's the paid
> `flyway check`); `info` + `validate` cover the day-to-day need.

---

## 8. Update GitHub Actions

The pipeline in `.github/workflows/_deploy-env.yml` is already structured as
build → plan-db → apply-db (gated) → deploy-app, and `scripts/migrate.sh` already
has `plan`/`apply` stages that today are placeholders. Wire them to Flyway.

### 8a. `scripts/migrate.sh` (server-side wrapper)

Replace the placeholder `plan` branch and the `apply` branch so they call the
Flyway container with the right command:

```bash
# plan branch:
compose run --rm db-migrate info
compose run --rm db-migrate validate

# apply branch (replaces the current db-migrate up/wait logic):
compose run --rm db-migrate migrate
```

`compose run --rm db-migrate <cmd>` reuses the same service env (connection,
locations, passwords) but overrides the command. `validate` failing in `plan`
stops the pipeline **before** the gated apply — exactly the desired behavior.

### 8b. `_deploy-env.yml`

No structural change needed — the stages already map onto Flyway:

- `build` still builds the (now Flyway-based) migrate image.
- `plan-db` runs `scripts/migrate.sh <env> <sha> plan` → `flyway info` +
  `flyway validate` (no changes, safe, ungated).
- `apply-db` runs `scripts/migrate.sh <env> <sha> apply` → `flyway migrate`,
  gated by the GitHub Environment (`inputs.gh_environment`) so prod still requires
  a reviewer before any DB change.
- `deploy-app` unchanged.

(Optional, lower priority \u2014 see \u00a77: a from-scratch \"clean bootstrap\" job in
`.github/workflows/ci-gates.yml` can catch ordering/grant regressions on PRs, but
the day-to-day safeguard is `flyway info`/`validate` in the plan stage.)

### 8c. Add a `FLYWAY_LOCATIONS` value per environment

Ensure `deploy/dev.env` and `deploy/prod.env` set `FLYWAY_LOCATIONS` as in §3
(dev includes the dev-only folder, prod does not). These files are committed and
read by `docker compose --env-file`.

---

## 9. Deploying to dev off a branch

`deploy-dev.yml` is a `workflow_dispatch` where you pick the branch, and every
stage does `git checkout --force "$IMAGE_TAG"` on the server, so **everything the
deploy runs comes from the selected commit**: the migration `.sql` files, the
migrate image, `scripts/migrate.sh`, `scripts/deploy.sh`, and the app images. The
reusable `_deploy-env.yml` is referenced as a local path (`./.github/…`), so it is
also resolved at the **selected ref's** commit — i.e. the workflow logic used is
the branch's copy, not `main`'s. (The only thing GitHub always reads from the
default branch is which workflows are *offered* for `workflow_dispatch`; once
dispatched against a branch, that branch's YAML runs.)

So yes, **Flyway works correctly for branch deploys to dev** — it applies whatever
`V…`/`R…` files exist in that commit and records them in dev's
`flyway_schema_history`. Two things to keep in mind, both consequences of dev
being a *shared, persistent* database:

1. **Un-merged versioned migrations pollute dev history.** If a branch adds
   `V20260801.01__…` and you deploy it to dev, that row is now in dev's history
   with the branch file's checksum. If you then rewrite that migration on the
   branch (rebase, edit) and redeploy, `flyway validate` fails because the
   checksum changed after being applied. Fixes: `flyway repair` (re-aligns the
   checksum), or treat dev as disposable and rebuild it, or avoid applying a
   versioned migration to shared dev until its content is settled.
2. **Out-of-order versions.** With `outOfOrder=false` (the default we set), if a
   branch applied `V20260801.01` to dev and later another branch/`main` tries to
   apply an *earlier* pending version, Flyway will refuse/ignore it. If you
   frequently test overlapping migration branches on the same dev DB, either
   rebuild dev between them or set `flyway.outOfOrder=true` for dev only.

For repeatables (`R…`) none of this bites — they just re-apply on checksum change,
so branch edits to functions/views/triggers deploy to dev cleanly every time.

---

## 10. Cutover checklist (order of operations)

> **Implementation status (code side complete).** Everything that lives in the
> repo has been wired up on branch `TG-18-Flyway-Setup`. What remains are the
> **server-side, one-time** actions (steps 8/9 baseline, and dropping the old
> table in step 10) that can only be run against the live dev/prod databases.
>
> **Two deliberate deviations from the text above, verified against this repo:**
> 1. **Apply does NOT use `compose run --rm db-migrate migrate` (§8a).** The
>    `backend` service gates on `db-migrate: service_completed_successfully`, and
>    `deploy-app` later runs `up -d db backend frontend`. A `--rm` one-off `run`
>    container leaves no *completed service* container, so that later `up` would
>    re-run the migration. `scripts/migrate.sh apply` therefore keeps the proven
>    `up -d db-migrate` + `docker wait` flow — the service's `command: ["migrate"]`
>    makes it run `flyway migrate`, and it leaves the exited(0) service container
>    the backend needs. Only the **plan** branch uses `compose run --rm` (for
>    `info`/`validate`, which leave no state and feed nothing downstream).
> 2. **`flyway.ignoreMigrationPatterns=*:pending` added to `flyway.conf`.** Plain
>    `flyway validate` fails on *pending* migrations by default, which would break
>    every legitimate deploy that adds a new `V…`. With this set, `validate` still
>    fails on real problems (checksum drift, missing, failed) but treats pending
>    work as expected. Chosen layout: **Option B** (flat folders `010`–`040` +
>    `090` + `callbacks`, enumerated explicitly per environment). `FLYWAY_LOCATIONS`
>    is a single comma-separated line; folder names contain spaces and `&`, which
>    is fine because Flyway splits only on commas (keep no space after each comma).
>    The local `docker-compose.yml` was also repointed at Flyway (see step 10).

1. [x] §1a Drop-then-create pattern applied to views (`040`) and triggers
       (`030`); `DROP FUNCTION` removed from the two view-dependent functions
       (`Get_Device_Type`, `Get_Charger_Status`).
2. [x] §1c Audit for `${` placeholder collisions — none found.
3. [x] §2 New `Dockerfile.migrate`, `flyway.conf`, and the `afterMigrate`
       password-sync callback (`callbacks/afterMigrate__Sync_App_User_Passwords.sql`).
       No entrypoint wrapper.
4. [x] §3 **Option B** chosen: flat `FlywayMigrations/` folders (`010`–`040`,
       `090`, `callbacks`). `FLYWAY_LOCATIONS` in `deploy/prod.env` lists
       `010`–`040` + `callbacks`; `deploy/dev.env` lists the same **plus** `090`.
5. [x] §4 `db-migrate` service in `docker-compose.app.yml` updated (Flyway
       connection env, `FLYWAY_LOCATIONS`, `FLYWAY_PLACEHOLDERS_*`, `command`).
6. [x] §8a `scripts/migrate.sh` wired: plan → `flyway info` + `flyway validate`;
       apply → `flyway migrate` via the unchanged `up -d` + `docker wait` flow.
7. [ ] Build + push the new migrate image (CI `build` stage — happens on deploy).
8. [ ] §5 `flyway baseline` **dev** (`-baselineVersion=20260709.39`), then deploy
       to dev; review `flyway info` output and smoke-test.
9. [ ] §5 `flyway baseline` **prod** (gated), then deploy to prod.
10. [x/–] §6 `sql/migrate.sh` **deleted**; legacy `sql/Dockerfile` **deleted** and
        local `docker-compose.yml` repointed at Flyway; docs updated. Dropping
        `_schema_migrations` in each env is still a **manual** post-cutover step
        (keep it a while as a safety record).


Do not start step 9 (the prod baseline/deploy) until the dev deploy in step 8
succeeds and its `flyway info`/`validate` output looks right.
