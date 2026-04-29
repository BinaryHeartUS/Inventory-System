#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/deploy.sh user@your-server-ip
# Requires: ssh key auth set up on the target server, docker installed on the server
#
# Required .env variables on the server at /opt/inventory-system/.env:
#   DB_PASSWORD        — postgres superuser (binaryheart) password
#   API_USER_PASSWORD  — password for the api_user DB role used by the backend
#   IMPORTER_PASSWORD  — password for the importer DB role
#
# See .env.example in the repo root for a template.

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

  # db-migrate runs once and exits; backend/frontend restart if already running
  docker compose -f docker-compose.prod.yml up --build -d
  echo "Deploy complete. App available on port 80."
EOF
