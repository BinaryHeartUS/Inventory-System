#!/usr/bin/env bash
set -euo pipefail

# Database migration stage for one environment, split into an ungated PLAN and a
# gated APPLY so it maps cleanly onto Flyway's plan/apply model later.
#
# Usage (run on the server, from the repo checkout):
#   ./scripts/migrate.sh <dev|prod> <image_tag> [plan|apply]
#
#   plan  -> preview only; makes NO changes. TODAY there is no dry-run (migrate.sh
#            applies scripts directly), so this just pulls the migrate image and
#            prints a notice. When Flyway is adopted, replace the plan branch with
#            `flyway info` / `flyway validate`.
#   apply -> run the migrations to completion (the db-migrate one-shot container).
#            Defaults to apply if the stage arg is omitted.
#
# Requires:
#   - docker logged in to ghcr.io (the workflow does this before calling)
#   - deploy/<env>.env committed in the repo
#   - secrets/<env>.env present on the server (see deploy/secrets.env.example)

ENV="${1:?Usage: migrate.sh <dev|prod> <image_tag> [plan|apply]}"
TAG="${2:?Usage: migrate.sh <dev|prod> <image_tag> [plan|apply]}"
STAGE="${3:-apply}"

case "$ENV" in
  dev | prod) ;;
  *)
    echo "ERROR: environment must be 'dev' or 'prod', got '$ENV'"
    exit 1
    ;;
esac

case "$STAGE" in
  plan | apply) ;;
  *)
    echo "ERROR: stage must be 'plan' or 'apply', got '$STAGE'"
    exit 1
    ;;
esac

REPO_DIR="${REPO_DIR:-/opt/inventory-system}"
CONFIG_ENV="$REPO_DIR/deploy/$ENV.env"
SECRETS_ENV="$REPO_DIR/secrets/$ENV.env"

cd "$REPO_DIR"

[ -f "$CONFIG_ENV" ] || { echo "ERROR: missing $CONFIG_ENV"; exit 1; }
[ -f "$SECRETS_ENV" ] || { echo "ERROR: missing $SECRETS_ENV (copy deploy/secrets.env.example)"; exit 1; }

export IMAGE_TAG="$TAG"

compose() {
  docker compose -p "inventory-$ENV" \
    --env-file "$CONFIG_ENV" \
    --env-file "$SECRETS_ENV" \
    -f docker-compose.app.yml "$@"
}

if [ "$STAGE" = "plan" ]; then
  echo "=== [plan-db] $ENV (tag $TAG) ==="
  compose pull db-migrate
  echo "[plan-db] No dry-run is available yet (pre-Flyway): migrate.sh applies"
  echo "[plan-db] pending scripts under sql/ idempotently, tracked in"
  echo "[plan-db] _schema_migrations. Nothing is changed by this plan stage."
  echo "[plan-db] When Flyway lands, this stage will run 'flyway info' /"
  echo "[plan-db] 'flyway validate' to show exactly which migrations would apply."
  echo "=== [plan-db] complete (no changes) ==="
  exit 0
fi

echo "=== [apply-db] $ENV (tag $TAG) ==="
compose pull db db-migrate
# Clear any previous run so the migration container is recreated for this tag.
compose rm -sf db-migrate
# Starts db (waits for healthy per depends_on), then runs the migration to exit.
compose up -d db-migrate
code="$(compose wait db-migrate)"
echo "[apply-db] migration container exited with code ${code}."
if [ "$code" != "0" ]; then
  echo "[apply-db] migration FAILED; dumping logs:"
  compose logs db-migrate || true
  exit "$code"
fi
echo "=== [apply-db] complete (tag $TAG) ==="
