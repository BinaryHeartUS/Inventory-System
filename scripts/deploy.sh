#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/deploy.sh user@your-server-ip
# Requires: ssh key auth set up on the target server, docker installed on the server

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
    echo "Create one with: DB_PASSWORD=yourpassword"
    exit 1
  fi

  docker compose -f docker-compose.prod.yml up --build -d
  echo "Deploy complete. App available on port 80."
EOF
