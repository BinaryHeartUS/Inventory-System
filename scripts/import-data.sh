#!/usr/bin/env bash
set -euo pipefail

# Run the one-shot data importer against a single environment. Normally invoked by
# the "Import Data" GitHub Actions workflow, but can be run manually on the server.
#
# Usage (run on the server, from the repo checkout):
#   ./scripts/import-data.sh <dev|prod> <image_tag> <data_file>
#
#   <data_file> is a filename inside importer/data/ (baked into the importer image
#   at /data/<data_file>). It must exist in importer/data/ on the checked-out commit.
#
# WARNING: importing writes into the TARGET environment's database. Make sure you
# are pointing at the environment you intend (dev vs prod).
#
# Requires:
#   - docker logged in to ghcr.io (the workflow does this before calling)
#   - the environment already deployed (schema present)
#   - deploy/<env>.env committed and secrets/<env>.env present on the server

ENV="${1:?Usage: import-data.sh <dev|prod> <image_tag> <data_file>}"
TAG="${2:?Usage: import-data.sh <dev|prod> <image_tag> <data_file>}"
FILE="${3:?Usage: import-data.sh <dev|prod> <image_tag> <data_file>}"

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
[ -f "$SECRETS_ENV" ] || { echo "ERROR: missing $SECRETS_ENV"; exit 1; }

export IMAGE_TAG="$TAG"
export IMPORT_FILE_PATH="/data/$FILE"

compose() {
  docker compose -p "inventory-$ENV" \
    --env-file "$CONFIG_ENV" \
    --env-file "$SECRETS_ENV" \
    -f docker-compose.app.yml "$@"
}

echo "=== Importing '$FILE' into $ENV (tag $TAG) ==="
compose pull importer
compose --profile import run --rm importer
echo "=== Import into $ENV complete ==="
