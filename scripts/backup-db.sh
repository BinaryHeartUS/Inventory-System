#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/backup-db.sh
# Intended to be called from a cron job on the production server.
# Dumps the inventory database to a timestamped gzipped SQL file.
#
# Recommended cron entry (daily at 2am, keep 30 days of backups):
#   0 2 * * * /opt/inventory-system/scripts/backup-db.sh >> /var/log/inventory-backup.log 2>&1

BACKUP_DIR="/opt/backups/inventory"
CONTAINER="inventory-system-db-1"
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
