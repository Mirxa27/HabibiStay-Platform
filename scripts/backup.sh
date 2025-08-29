#!/bin/bash

# Database backup script for HabibiStay
# Automated backup with rotation and monitoring

set -e

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=30
POSTGRES_HOST="${POSTGRES_HOST:-postgres-prod}"
POSTGRES_DB="${POSTGRES_DB:-habibistay}"
POSTGRES_USER="${POSTGRES_USER:-habibistay}"
BACKUP_PREFIX="habibistay-db-backup"
LOG_FILE="/var/log/backup.log"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/${BACKUP_PREFIX}-$(date +%Y%m%d-%H%M%S).sql"
BACKUP_COMPRESSED="$BACKUP_FILE.gz"

log "Starting database backup to $BACKUP_FILE"

# Create database backup
if pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$BACKUP_FILE"; then
    log "Database backup completed successfully"
    
    # Compress backup
    if gzip "$BACKUP_FILE"; then
        log "Backup compressed to $BACKUP_COMPRESSED"
        
        # Verify backup integrity
        if gunzip -t "$BACKUP_COMPRESSED"; then
            log "Backup integrity verified"
        else
            log "ERROR: Backup integrity check failed"
            exit 1
        fi
    else
        log "ERROR: Failed to compress backup"
        exit 1
    fi
else
    log "ERROR: Database backup failed"
    exit 1
fi

# Cleanup old backups
log "Cleaning up backups older than $RETENTION_DAYS days"
find "$BACKUP_DIR" -name "${BACKUP_PREFIX}-*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Log backup summary
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "${BACKUP_PREFIX}-*.sql.gz" -type f | wc -l)
BACKUP_SIZE=$(du -sh "$BACKUP_COMPRESSED" | cut -f1)
log "Backup summary: $BACKUP_COUNT total backups, latest size: $BACKUP_SIZE"

log "Backup process completed successfully"