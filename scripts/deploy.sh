#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/deploy.sh user@your-server-ip
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

TARGET="${1:?Usage: deploy.sh user@host}"
REMOTE_DIR="/opt/inventory-system"

echo "Deploying to $TARGET..."

ssh "$TARGET" bash <<EOF
  set -euo pipefail

  if [ ! -d "$REMOTE_DIR" ]; then
    git clone https://github.com/BinaryHeartUS/Inventory-System.git "$REMOTE_DIR"
  fi

  cd "$REMOTE_DIR"
  git pull

  if [ ! -f .env ]; then
    echo "ERROR: .env file not found at $REMOTE_DIR/.env"
    echo "Copy .env.example to .env and fill in the required values."
    exit 1
  fi

  # Caddy handles TLS automatically via Let's Encrypt on first boot.
  # db-migrate runs once and exits; backend/frontend/caddy restart if already running.
  docker compose -f docker-compose.prod.yml up --build -d
  echo "Deploy complete. Site available at https://\$(grep '^DOMAIN=' .env | cut -d= -f2)"
EOF
