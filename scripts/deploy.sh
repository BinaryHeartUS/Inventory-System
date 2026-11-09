#!/usr/bin/env bash
set -euo pipefail

# APPLY-APP stage: (re)start one environment's application containers (db,
# backend, frontend) from prebuilt GHCR images. Normally invoked by the GitHub
# Actions deploy workflow AFTER the database migration stage, but can be run
# manually on the server for rollbacks.
#
# This script no longer runs migrations itself — that is the migrate.sh stage.
# (If migrations were never applied for this tag, Compose still runs the
# db-migrate dependency once as a safety net before starting the backend.)
#
# Usage (run on the server, from the repo checkout):
#   ./scripts/deploy.sh <dev|prod> <image_tag>
#
#   <image_tag> is the git commit SHA whose images were built and pushed to GHCR.
#   To roll back, re-run with an earlier SHA (after checking out that commit).
#
# Requires:
#   - docker logged in to ghcr.io (the workflow does this before calling)
#   - deploy/<env>.env committed in the repo
#   - secrets/<env>.env present on the server (see deploy/secrets.env.example)

ENV="${1:?Usage: deploy.sh <dev|prod> <image_tag>}"
TAG="${2:?Usage: deploy.sh <dev|prod> <image_tag>}"

case "$ENV" in
  dev | prod) ;;
  *)
    echo "ERROR: environment must be 'dev' or 'prod', got '$ENV'"
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

if [ "$ENV" = prod ]; then
  issuer="$(compose config --environment | sed -n 's/^AUTH_ISSUER=//p')"
  [ "$issuer" = https://auth.binaryheart.org ] || {
    echo "ERROR: production central auth requires https://auth.binaryheart.org."
    exit 1
  }
fi

echo "=== Deploying $ENV app at tag $TAG ==="
compose pull db backend frontend
compose up -d --remove-orphans db backend frontend
echo "Waiting for Inventory..."
deadline=$((SECONDS + ${HEALTH_TIMEOUT:-180}))
until [ "$(compose exec -T frontend wget -qO- http://127.0.0.1/api/health/ready 2>/dev/null || true)" = OK ]; do
  if [ "$SECONDS" -ge "$deadline" ]; then
    echo "ERROR: Inventory did not become ready; inspect backend/frontend logs."
    compose logs --tail 100 backend frontend
    exit 1
  fi
  sleep 3
  compose exec -T frontend nginx -s reload >/dev/null 2>&1 || true
done
config="$(compose exec -T frontend wget -qO- http://127.0.0.1/api/auth/config)"
issuer="$(compose config --environment | sed -n 's/^AUTH_ISSUER=//p')"
printf '%s' "$config" | grep -Fq "\"issuer\":\"$issuer\"" || {
  echo "ERROR: deployed Inventory has an unexpected authentication issuer."
  exit 1
}
docker image prune -f
echo "=== Deploy of $ENV app complete (tag $TAG) ==="
