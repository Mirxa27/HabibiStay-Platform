#!/bin/bash

# HabibiStay Production Deployment Script
# Automated deployment with health checks and rollback capability

set -e

# Configuration
PROJECT_NAME="habibistay"
DEPLOY_USER="deploy"
DEPLOY_PATH="/opt/habibistay"
BACKUP_PATH="/opt/backups/habibistay"
LOG_FILE="/var/log/habibistay-deploy.log"
HEALTH_CHECK_URL="http://localhost:3000/api/health"
ROLLBACK_LIMIT=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${2:-$NC}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

# Error handling
handle_error() {
    log "❌ Error occurred in deployment script at line $1" "$RED"
    cleanup
    exit 1
}

trap 'handle_error $LINENO' ERR

# Cleanup function
cleanup() {
    log "🧹 Cleaning up temporary files..." "$YELLOW"
    rm -rf /tmp/habibistay-deploy-*
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..." "$BLUE"
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log "❌ Docker is not running" "$RED"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker compose > /dev/null; then
        log "❌ Docker Compose is not available" "$RED"
        exit 1
    fi
    
    # Check if required directories exist
    if [ ! -d "$DEPLOY_PATH" ]; then
        log "❌ Deploy path $DEPLOY_PATH does not exist" "$RED"
        exit 1
    fi
    
    # Check if .env.production exists
    if [ ! -f "$DEPLOY_PATH/.env.production" ]; then
        log "❌ Production environment file not found" "$RED"
        exit 1
    fi
    
    log "✅ Prerequisites check passed" "$GREEN"
}

# Create backup
create_backup() {
    log "💾 Creating backup..." "$BLUE"
    
    BACKUP_NAME="habibistay-backup-$(date +%Y%m%d-%H%M%S)"
    BACKUP_DIR="$BACKUP_PATH/$BACKUP_NAME"
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if docker compose -f "$DEPLOY_PATH/docker-compose.yml" --profile prod ps postgres-prod | grep -q "Up"; then
        log "📊 Backing up database..." "$BLUE"
        docker compose -f "$DEPLOY_PATH/docker-compose.yml" --profile prod exec -T postgres-prod \
            pg_dump -U habibistay -d habibistay > "$BACKUP_DIR/database.sql"
    fi
    
    # Backup uploads directory
    if [ -d "$DEPLOY_PATH/uploads" ]; then
        log "📁 Backing up uploads..." "$BLUE"
        cp -r "$DEPLOY_PATH/uploads" "$BACKUP_DIR/"
    fi
    
    # Backup configuration
    log "⚙️ Backing up configuration..." "$BLUE"
    cp "$DEPLOY_PATH/.env.production" "$BACKUP_DIR/"
    cp -r "$DEPLOY_PATH/config" "$BACKUP_DIR/" 2>/dev/null || true
    
    # Create backup metadata
    cat > "$BACKUP_DIR/metadata.json" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "commit": "$(cd $DEPLOY_PATH && git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "version": "$(cd $DEPLOY_PATH && git describe --tags 2>/dev/null || echo 'unknown')",
    "backup_type": "pre-deployment"
}
EOF
    
    # Compress backup
    cd "$BACKUP_PATH"
    tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    
    # Keep only last N backups
    ls -t *.tar.gz | tail -n +$((ROLLBACK_LIMIT + 1)) | xargs -r rm -f
    
    log "✅ Backup created: $BACKUP_NAME.tar.gz" "$GREEN"
    echo "$BACKUP_NAME.tar.gz"
}

# Pull latest changes
pull_changes() {
    log "📥 Pulling latest changes..." "$BLUE"
    
    cd "$DEPLOY_PATH"
    
    # Stash any local changes
    git stash push -m "Pre-deployment stash $(date)"
    
    # Pull latest changes
    git fetch origin
    git pull origin main
    
    # Update submodules if any
    git submodule update --init --recursive
    
    log "✅ Changes pulled successfully" "$GREEN"
}

# Update Docker images
update_images() {
    log "🐳 Updating Docker images..." "$BLUE"
    
    cd "$DEPLOY_PATH"
    
    # Pull latest images
    docker compose --profile prod pull
    
    log "✅ Docker images updated" "$GREEN"
}

# Deploy application
deploy_application() {
    log "🚀 Deploying application..." "$BLUE"
    
    cd "$DEPLOY_PATH"
    
    # Copy production environment
    cp .env.production .env
    
    # Start services
    docker compose --profile prod up -d
    
    log "✅ Application deployed" "$GREEN"
}

# Health check
health_check() {
    log "🏥 Performing health check..." "$BLUE"
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
            log "✅ Health check passed" "$GREEN"
            return 0
        fi
        
        log "⏳ Health check attempt $attempt/$max_attempts failed, retrying..." "$YELLOW"
        sleep 10
        ((attempt++))
    done
    
    log "❌ Health check failed after $max_attempts attempts" "$RED"
    return 1
}

# Run smoke tests
run_smoke_tests() {
    log "🧪 Running smoke tests..." "$BLUE"
    
    cd "$DEPLOY_PATH"
    
    # Basic API endpoints test
    local endpoints=(
        "/api/health"
        "/api/properties?limit=1"
        "/api/auth/status"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f -s "http://localhost:3000$endpoint" > /dev/null; then
            log "✅ Endpoint $endpoint is working" "$GREEN"
        else
            log "❌ Endpoint $endpoint failed" "$RED"
            return 1
        fi
    done
    
    log "✅ Smoke tests passed" "$GREEN"
}

# Rollback function
rollback() {
    log "🔄 Rolling back deployment..." "$YELLOW"
    
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        log "❌ No backup file specified for rollback" "$RED"
        return 1
    fi
    
    cd "$DEPLOY_PATH"
    
    # Stop current services
    docker compose --profile prod down
    
    # Extract backup
    cd "$BACKUP_PATH"
    tar -xzf "$backup_file"
    backup_dir="${backup_file%.tar.gz}"
    
    # Restore database
    if [ -f "$BACKUP_PATH/$backup_dir/database.sql" ]; then
        log "📊 Restoring database..." "$BLUE"
        docker compose -f "$DEPLOY_PATH/docker-compose.yml" --profile prod up -d postgres-prod
        sleep 10
        docker compose -f "$DEPLOY_PATH/docker-compose.yml" --profile prod exec -T postgres-prod \
            psql -U habibistay -d habibistay < "$BACKUP_PATH/$backup_dir/database.sql"
    fi
    
    # Restore uploads
    if [ -d "$BACKUP_PATH/$backup_dir/uploads" ]; then
        log "📁 Restoring uploads..." "$BLUE"
        rm -rf "$DEPLOY_PATH/uploads"
        cp -r "$BACKUP_PATH/$backup_dir/uploads" "$DEPLOY_PATH/"
    fi
    
    # Restore configuration
    if [ -f "$BACKUP_PATH/$backup_dir/.env.production" ]; then
        log "⚙️ Restoring configuration..." "$BLUE"
        cp "$BACKUP_PATH/$backup_dir/.env.production" "$DEPLOY_PATH/"
    fi
    
    # Start services
    cd "$DEPLOY_PATH"
    docker compose --profile prod up -d
    
    # Cleanup backup extraction
    rm -rf "$BACKUP_PATH/$backup_dir"
    
    log "✅ Rollback completed" "$GREEN"
}

# Cleanup old resources
cleanup_resources() {
    log "🧹 Cleaning up old resources..." "$BLUE"
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused volumes (be careful with this)
    # docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    log "✅ Cleanup completed" "$GREEN"
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Slack notification (if webhook URL is available)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🏠 HabibiStay Deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || true
    fi
    
    # Email notification (if configured)
    if command -v mail > /dev/null && [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "$message" | mail -s "HabibiStay Deployment $status" "$NOTIFICATION_EMAIL" || true
    fi
}

# Main deployment function
main() {
    log "🏠 Starting HabibiStay deployment..." "$GREEN"
    
    local backup_file=""
    
    # Check prerequisites
    check_prerequisites
    
    # Create backup
    backup_file=$(create_backup)
    
    # Pull latest changes
    pull_changes
    
    # Update Docker images
    update_images
    
    # Deploy application
    deploy_application
    
    # Health check
    if ! health_check; then
        log "❌ Deployment failed health check, rolling back..." "$RED"
        rollback "$backup_file"
        send_notification "FAILED" "Deployment failed health check and was rolled back"
        exit 1
    fi
    
    # Run smoke tests
    if ! run_smoke_tests; then
        log "❌ Deployment failed smoke tests, rolling back..." "$RED"
        rollback "$backup_file"
        send_notification "FAILED" "Deployment failed smoke tests and was rolled back"
        exit 1
    fi
    
    # Cleanup old resources
    cleanup_resources
    
    # Success
    log "🎉 Deployment completed successfully!" "$GREEN"
    send_notification "SUCCESS" "Deployment completed successfully"
    
    # Cleanup
    cleanup
}

# Script options
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        if [ -z "$2" ]; then
            log "❌ Please specify backup file for rollback" "$RED"
            echo "Usage: $0 rollback <backup_file>"
            echo "Available backups:"
            ls -la "$BACKUP_PATH"/*.tar.gz 2>/dev/null || echo "No backups found"
            exit 1
        fi
        rollback "$2"
        ;;
    "health")
        health_check
        ;;
    "backup")
        backup_file=$(create_backup)
        log "✅ Manual backup created: $backup_file" "$GREEN"
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health|backup}"
        echo ""
        echo "Commands:"
        echo "  deploy          - Full deployment with backup and health checks"
        echo "  rollback <file> - Rollback to a specific backup"
        echo "  health          - Run health check only"
        echo "  backup          - Create manual backup"
        exit 1
        ;;
esac