#!/usr/bin/env bash
# Idempotent migration runner.
# - Scripts in CreateTypes/, CreateTables/, and seed scripts (0.x.x, 4.x.x) are
#   tracked in _schema_migrations and only applied once.
# - Scripts in CreateStoredProcedures/, CreateFunctions/, and CreateViews/ all
#   use CREATE OR REPLACE and are re-applied on every run so updates are picked up.
set -euo pipefail

DB_URI="postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/inventory"
SCRIPTS_DIR="/migrations"

echo "=== Waiting for database ==="
until psql "$DB_URI" -c '\q' 2>/dev/null; do
  echo "  database not ready, retrying in 2s..."
  sleep 2
done
echo "  database is ready."

echo "=== Ensuring migrations tracking table exists ==="
psql "$DB_URI" <<'SQL'
CREATE TABLE IF NOT EXISTS _schema_migrations (
    script_name TEXT PRIMARY KEY,
    applied_at  TIMESTAMPTZ DEFAULT now()
);
SQL

# Run a script only if it has not been recorded yet.
run_once() {
  local script="$1"
  local name
  name=$(basename "$script")
  local count
  count=$(psql "$DB_URI" -t -c "SELECT COUNT(*) FROM _schema_migrations WHERE script_name = '$name'" | tr -d ' \n')
  if [[ "$count" -eq 0 ]]; then
    echo "  Applying:  $name"
    psql "$DB_URI" -f "$script"
    psql "$DB_URI" -c "INSERT INTO _schema_migrations(script_name) VALUES ('$name')"
  else
    echo "  Skipping (already applied): $name"
  fi
}

# Always re-apply — safe because these scripts use CREATE OR REPLACE.
run_always() {
  local script="$1"
  echo "  Refreshing: $(basename "$script")"
  psql "$DB_URI" -f "$script"
}

echo "=== Running user-setup and seed scripts ==="
while IFS= read -r -d '' f; do run_once "$f"; done \
  < <(find "$SCRIPTS_DIR" -maxdepth 1 -name "*.sql" -print0 | sort -z)

echo "=== Running type scripts ==="
while IFS= read -r -d '' f; do run_once "$f"; done \
  < <(find "$SCRIPTS_DIR/CreateTypes" -maxdepth 1 -name "*.sql" -print0 | sort -z)
while IFS= read -r -d '' f; do run_once "$f"; done \
  < <(find "$SCRIPTS_DIR/CreateTypes/EnumScripts" -name "*.sql" -print0 | sort -z)

echo "=== Running table scripts ==="
while IFS= read -r -d '' f; do run_once "$f"; done \
  < <(find "$SCRIPTS_DIR/CreateTables" -name "*.sql" -print0 | sort -z)

echo "=== Running stored procedure scripts ==="
while IFS= read -r -d '' f; do run_always "$f"; done \
  < <(find "$SCRIPTS_DIR/CreateStoredProcedures" -maxdepth 1 -name "*.sql" -print0 | sort -z)
while IFS= read -r -d '' f; do run_always "$f"; done \
  < <(find "$SCRIPTS_DIR/CreateStoredProcedures/CountProcedures" -name "*.sql" -print0 | sort -z)

echo "=== Running function scripts ==="
while IFS= read -r -d '' f; do run_always "$f"; done \
  < <(find "$SCRIPTS_DIR/CreateFunctions" -name "*.sql" -print0 | sort -z)

echo "=== Running trigger scripts ==="
while IFS= read -r -d '' f; do run_always "$f"; done \
  < <(find "$SCRIPTS_DIR/CreateTriggers" -name "*.sql" -print0 | sort -z)

echo "=== Running view scripts ==="
while IFS= read -r -d '' f; do run_always "$f"; done \
  < <(find "$SCRIPTS_DIR/CreateViews" -name "*.sql" -print0 | sort -z)

# Update DB user passwords from env vars when explicitly provided (production use).
if [[ -n "${API_USER_PASSWORD:-}" ]]; then
  echo "=== Updating api_user password ==="
  psql "$DB_URI" -c "ALTER USER api_user PASSWORD '$API_USER_PASSWORD'"
fi
if [[ -n "${IMPORTER_PASSWORD:-}" ]]; then
  echo "=== Updating importer password ==="
  psql "$DB_URI" -c "ALTER USER importer PASSWORD '$IMPORTER_PASSWORD'"
fi

echo "=== All migrations complete ==="
