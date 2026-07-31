#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="${E2E_COMPOSE_PROJECT:-inventory-e2e}"
E2E_PORT="${E2E_PORT:-4173}"
COMPOSE=(docker compose -p "$PROJECT_NAME" -f "$ROOT_DIR/docker-compose.e2e.yml")

cleanup() {
  "${COMPOSE[@]}" down -v --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM
cleanup

E2E_PORT="$E2E_PORT" "${COMPOSE[@]}" up -d --build --wait

set +e
(
  cd "$ROOT_DIR/frontend"
  E2E_BASE_URL="http://127.0.0.1:$E2E_PORT" \
    E2E_COMPOSE_PROJECT="$PROJECT_NAME" \
    npx playwright test "$@"
)
TEST_STATUS=$?
set -e

if [[ $TEST_STATUS -ne 0 ]]; then
  "${COMPOSE[@]}" logs --no-color
fi

exit "$TEST_STATUS"