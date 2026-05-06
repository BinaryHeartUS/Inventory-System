#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/deploy.sh user@your-server-ip [--reset]
#   --reset  Wipes the database and re-runs all migrations from scratch.
#            Use during development/staging only — destroys all data.
#
# Requires: ssh key auth set up on the target server, docker installed on the server
#
# Required .env variables on the server at /opt/inventory-system/.env:
#   DOMAIN             — public domain (e.g. inventory.binaryheart.org) — Caddy uses this for TLS
#   DB_PASSWORD        — postgres superuser (binaryheart) password
#   API_USER_PASSWORD  — password for the api_user DB role used by the backend
#   IMPORTER_PASSWORD  — password for the importer DB role
#
# See .env.example in the repo root for a template.
#
# First-time server setup (run once manually):
#   curl -fsSL https://get.docker.com | sh
#   ufw allow 80 && ufw allow 443 && ufw allow OpenSSH && ufw enable
#   mkdir -p /opt/inventory-system && cp .env.example /opt/inventory-system/.env
#   # edit /opt/inventory-system/.env with real values

TARGET="${1:?Usage: deploy.sh user@host [--reset]}"
RESET="${2:-}"
REMOTE_DIR="/opt/inventory-system"

echo "Deploying to $TARGET..."

ssh "$TARGET" bash -s -- "$RESET" <<'ENDSSH'
  set -euo pipefail

  REMOTE_DIR="/opt/inventory-system"
  RESET="${1:-}"

  if [ ! -d "$REMOTE_DIR" ]; then
    git clone git@github.com:BinaryHeartUS/Inventory-System.git "$REMOTE_DIR"
  fi

  cd "$REMOTE_DIR"
  git pull

  if [ ! -f .env ]; then
    echo "ERROR: .env file not found at $REMOTE_DIR/.env"
    echo "Copy .env.example to .env and fill in the required values."
    exit 1
  fi

  if [ "$RESET" = "--reset" ]; then
    echo "WARNING: --reset flag set. Wiping database and all containers..."
    docker compose -f docker-compose.prod.yml down
    rm -rf "$REMOTE_DIR/pgdata"
    echo "Database wiped."
  fi

  # Build all images first.
  docker compose -f docker-compose.prod.yml build

  # Bring everything up. Compose respects the depends_on conditions (service_healthy,
  # service_completed_successfully) even in detached mode, so db-migrate will run and
  # complete before the backend starts. Using `run --rm` previously removed the
  # db-migrate container, causing compose to not satisfy the dependency check when
  # starting the backend.
  # Caddy handles TLS automatically via Let's Encrypt on first boot.
  # On --reset, also run the importer to seed data from the Excel file.
  if [ "$RESET" = "--reset" ]; then
    COMPOSE_PROFILES=import docker compose -f docker-compose.prod.yml up -d
  else
    docker compose -f docker-compose.prod.yml up -d
  fi
  echo "Deploy complete. Site available at https://$(grep '^DOMAIN=' .env | cut -d= -f2)"
ENDSSH
