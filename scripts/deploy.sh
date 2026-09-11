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

echo "=== Deploying $ENV app at tag $TAG ==="
compose pull db backend frontend
compose up -d --remove-orphans db backend frontend
docker image prune -f
echo "=== Deploy of $ENV app complete (tag $TAG) ==="
