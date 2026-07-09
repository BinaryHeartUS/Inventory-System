#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/backup-db.sh <dev|prod>
# Dumps one environment's inventory database to a timestamped gzipped SQL file.
#
# Recommended cron entries (daily at 2am, keep 30 days of backups):
#   0 2 * * * /opt/inventory-system/scripts/backup-db.sh prod >> /var/log/inventory-backup-prod.log 2>&1
#   30 2 * * * /opt/inventory-system/scripts/backup-db.sh dev  >> /var/log/inventory-backup-dev.log 2>&1
#
# NOTE: back these up OFF the VPS (e.g. sync $BACKUP_DIR to a Hetzner Storage Box
# or S3 bucket) so a lost server does not take the backups with it.

ENV="${1:?Usage: backup-db.sh <dev|prod>}"
case "$ENV" in
  dev | prod) ;;
  *)
    echo "ERROR: environment must be 'dev' or 'prod', got '$ENV'"
    exit 1
    ;;
esac

BACKUP_DIR="/opt/backups/inventory/${ENV}"
CONTAINER="inventory-${ENV}-db-1"
DB_USER="binaryheart"
DB_NAME="inventory"
RETAIN_DAYS=30

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTFILE="$BACKUP_DIR/inventory_${TIMESTAMP}.sql.gz"

echo "[$(date)] Starting backup → $OUTFILE"

docker exec "$CONTAINER" \
  pg_dump -U "$DB_USER" "$DB_NAME" \
  | gzip > "$OUTFILE"

echo "[$(date)] Backup complete. Size: $(du -sh "$OUTFILE" | cut -f1)"

# Remove backups older than RETAIN_DAYS
find "$BACKUP_DIR" -name "inventory_*.sql.gz" -mtime "+${RETAIN_DAYS}" -delete
echo "[$(date)] Pruned backups older than ${RETAIN_DAYS} days."
