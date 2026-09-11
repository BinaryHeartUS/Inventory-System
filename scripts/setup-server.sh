#!/usr/bin/env bash
set -euo pipefail

# One-time server bootstrap (and re-run after Caddyfile / deploy/proxy.env changes).
# Creates the shared Docker network and starts the Caddy reverse proxy that fronts
# both the dev and prod environments.
#
# Run from the repo checkout on the server (default /opt/inventory-system):
#   ./scripts/setup-server.sh
#
# Prerequisites (first time only):
#   curl -fsSL https://get.docker.com | sh
#   ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
#   git clone git@github.com:BinaryHeartUS/Inventory-System.git /opt/inventory-system
#   mkdir -p /opt/inventory-system/secrets
#   cp deploy/secrets.env.example secrets/dev.env  # fill in real values
#   cp deploy/secrets.env.example secrets/prod.env # fill in real values

REPO_DIR="${REPO_DIR:-/opt/inventory-system}"
cd "$REPO_DIR"

if ! docker network inspect web >/dev/null 2>&1; then
  echo "Creating shared 'web' network..."
  docker network create web
fi

echo "Starting/updating the Caddy reverse proxy..."
docker compose -p inventory-proxy \
  --env-file deploy/proxy.env \
  -f docker-compose.proxy.yml up -d

echo "Proxy is up. Ensure DNS A/AAAA records for both domains point at this server."
