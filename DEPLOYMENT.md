# HabibiStay Deployment Documentation

## Overview

This document provides comprehensive instructions for deploying HabibiStay to production environments using Docker containers, automated CI/CD pipelines, and monitoring systems.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoring & Logging](#monitoring--logging)
6. [SSL Configuration](#ssl-configuration)
7. [Backup & Recovery](#backup--recovery)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

**Production Server:**
- Ubuntu 22.04 LTS or CentOS 8+
- 4+ CPU cores
- 8GB+ RAM
- 100GB+ SSD storage
- Docker 24.0+
- Docker Compose v2.0+

**Development Environment:**
- Node.js 18+
- NPM 9+
- Git 2.0+
- Docker Desktop

### Required Accounts & Services

- **GitHub Repository** (for code hosting and CI/CD)
- **OpenAI API** (for Sara AI chatbot)
- **Google OAuth** (for authentication)
- **MyFatoorah Account** (for payment processing)
- **PayPal Developer Account** (for payment processing)
- **Cloudinary Account** (for image storage)
- **Domain & SSL Certificate** (for HTTPS)

## Environment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create deployment user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy
sudo mkdir -p /opt/habibistay
sudo chown deploy:deploy /opt/habibistay
```

### 2. Clone Repository

```bash
# Switch to deployment user
sudo su - deploy

# Clone repository
cd /opt
git clone https://github.com/your-username/habibistay.git
cd habibistay

# Set up production environment
cp .env.production .env
```

### 3. Configure Environment Variables

Edit `/opt/habibistay/.env.production` with your actual values:

```bash
# Critical variables to configure
DATABASE_URL=postgresql://habibistay:YOUR_SECURE_PASSWORD@postgres-prod:5432/habibistay
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
OPENAI_API_KEY=sk-your_openai_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
MYFATOORAH_API_KEY=your_myfatoorah_api_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
```

## Docker Deployment

### Production Deployment

```bash
# Build and start production services
docker compose --profile prod up -d

# Check service status
docker compose --profile prod ps

# View logs
docker compose --profile prod logs -f app-prod
```

### Development Environment

```bash
# Start development environment
docker compose --profile dev up -d

# Access development server
# Application: http://localhost:3000
# Vite dev server: http://localhost:5173
```

### Available Docker Profiles

- **`dev`**: Development environment with hot reload
- **`prod`**: Production environment with optimizations
- **`monitoring`**: Prometheus, Grafana, and logging stack

### Docker Commands

```bash
# Start specific profile
docker compose --profile prod up -d

# View service logs
docker compose logs -f app-prod

# Execute commands in container
docker compose exec app-prod npm run migrate

# Scale services
docker compose --profile prod up -d --scale app-prod=3

# Stop services
docker compose --profile prod down

# Remove volumes (careful!)
docker compose --profile prod down -v
```

## CI/CD Pipeline

### GitHub Actions Setup

The repository includes a comprehensive CI/CD pipeline in `.github/workflows/ci-cd.yml` that automatically:

1. **Quality Checks**: ESLint, TypeScript, security audits
2. **Testing**: Unit, integration, security, and E2E tests
3. **Building**: Multi-platform Docker images
4. **Security Scanning**: Trivy and Snyk vulnerability scans
5. **Performance Testing**: Lighthouse CI and load tests
6. **Deployment**: Automated staging and production deployments

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

```bash
# Production Server
PRODUCTION_HOST=your-server-ip
PRODUCTION_USERNAME=deploy
PRODUCTION_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...

# Staging Server (optional)
STAGING_HOST=staging-server-ip
STAGING_USERNAME=deploy
STAGING_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...

# Monitoring
GRAFANA_PASSWORD=secure_grafana_password

# Notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/...
SNYK_TOKEN=your_snyk_token
LHCI_GITHUB_APP_TOKEN=your_lighthouse_token
```

### Manual Deployment

Use the deployment script for manual deployments:

```bash
# Full deployment with backup
./scripts/deploy.sh deploy

# Create manual backup
./scripts/deploy.sh backup

# Health check only
./scripts/deploy.sh health

# Rollback to previous version
./scripts/deploy.sh rollback backup-20240101-120000.tar.gz
```

## Monitoring & Logging

### Monitoring Stack

Start the monitoring services:

```bash
# Start monitoring profile
docker compose --profile monitoring up -d

# Access monitoring dashboards
# Prometheus: http://your-server:9090
# Grafana: http://your-server:3001 (admin/admin)
```

### Key Metrics

**Application Metrics:**
- Request rate and response time
- Error rates and status codes
- Database connection pool
- Memory and CPU usage

**Business Metrics:**
- User registrations and logins
- Property views and bookings
- Payment transaction success rates
- Sara AI interaction metrics

**Infrastructure Metrics:**
- Container resource usage
- Database performance
- Cache hit rates
- Network throughput

### Log Management

**Log Locations:**
- Application logs: `/opt/habibistay/logs/`
- Nginx access logs: `/opt/habibistay/logs/nginx/`
- Container logs: `docker compose logs`

**Log Aggregation:**
```bash
# View application logs
docker compose logs -f app-prod

# View all service logs
docker compose logs -f

# Export logs for analysis
docker compose logs --no-color > deployment-logs.txt
```

## SSL Configuration

### Let's Encrypt SSL (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d habibistay.com -d www.habibistay.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Custom SSL Certificate

Place your SSL files in the correct locations:

```bash
# Copy SSL files
sudo cp your-domain.crt /opt/habibistay/config/ssl/habibistay.crt
sudo cp your-domain.key /opt/habibistay/config/ssl/habibistay.key

# Set correct permissions
sudo chmod 600 /opt/habibistay/config/ssl/habibistay.key
sudo chmod 644 /opt/habibistay/config/ssl/habibistay.crt
```

## Backup & Recovery

### Automated Backups

Backups are automatically created before each deployment and stored in `/opt/backups/habibistay/`.

**Backup Components:**
- PostgreSQL database dump
- Uploaded files and images
- Configuration files
- Application code (Git commit hash)

### Manual Backup

```bash
# Create immediate backup
./scripts/deploy.sh backup

# List available backups
ls -la /opt/backups/habibistay/

# Backup to external storage (recommended)
rsync -av /opt/backups/habibistay/ user@backup-server:/backups/habibistay/
```

### Recovery Process

```bash
# Rollback using deployment script
./scripts/deploy.sh rollback habibistay-backup-20240101-120000.tar.gz

# Manual database restore
docker compose --profile prod exec -T postgres-prod \
  psql -U habibistay -d habibistay < backup-database.sql

# Manual file restore
sudo cp -r backup-uploads/* /opt/habibistay/uploads/
```

### Off-site Backup Strategy

**Recommended approach:**
1. Daily automated local backups
2. Weekly sync to external storage
3. Monthly archive to cloud storage (AWS S3, Google Cloud)

```bash
# Example S3 sync script
aws s3 sync /opt/backups/habibistay/ s3://your-backup-bucket/habibistay/ \
  --exclude "*.log" --delete
```

## Performance Optimization

### Database Optimization

```sql
-- PostgreSQL optimization settings
-- Add to postgresql.conf

shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

### Nginx Optimization

The included Nginx configuration is pre-optimized with:
- Gzip compression for text assets
- Long-term caching for static files
- Rate limiting for API endpoints
- SSL/TLS optimization
- Security headers

### Application Performance

**Redis Caching:**
```bash
# Monitor Redis performance
docker compose exec redis-prod redis-cli monitor

# Check memory usage
docker compose exec redis-prod redis-cli info memory
```

**Database Performance:**
```bash
# Monitor active connections
docker compose exec postgres-prod psql -U habibistay -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
docker compose exec postgres-prod psql -U habibistay -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

### Load Testing

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run tests/load/load-test.yml

# Monitor during load test
watch -n 1 'docker stats --no-stream'
```

## Troubleshooting

### Common Issues

**Service Won't Start:**
```bash
# Check service status
docker compose --profile prod ps

# View service logs
docker compose --profile prod logs app-prod

# Check resource usage
docker stats --no-stream

# Verify environment variables
docker compose --profile prod exec app-prod env | grep -E "DATABASE_URL|OPENAI_API_KEY"
```

**Database Connection Issues:**
```bash
# Test database connectivity
docker compose --profile prod exec app-prod \
  node -e "console.log('Testing DB connection...'); process.exit(0);"

# Check PostgreSQL logs
docker compose --profile prod logs postgres-prod

# Connect to database directly
docker compose --profile prod exec postgres-prod \
  psql -U habibistay -d habibistay
```

**Performance Issues:**
```bash
# Check container resource usage
docker stats --no-stream

# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/health"

# Check Redis memory
docker compose exec redis-prod redis-cli info memory
```

**SSL Certificate Issues:**
```bash
# Test SSL certificate
openssl s_client -connect habibistay.com:443 -servername habibistay.com

# Check certificate expiration
echo | openssl s_client -servername habibistay.com -connect habibistay.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Health Checks

**Application Health:**
```bash
# Basic health check
curl -f http://localhost:3000/api/health

# Detailed system status
curl -s http://localhost:3000/api/admin/system/status | jq .
```

**Service Dependencies:**
```bash
# Check database
curl -s http://localhost:3000/api/health | jq .database

# Check Redis
curl -s http://localhost:3000/api/health | jq .redis

# Check external APIs
curl -s http://localhost:3000/api/health | jq .external_services
```

### Log Analysis

**Common log patterns to watch:**
```bash
# Application errors
docker compose logs app-prod | grep -i error

# Authentication issues
docker compose logs app-prod | grep -i "auth\|login\|token"

# Payment processing
docker compose logs app-prod | grep -i "payment\|myfatoorah\|paypal"

# Performance issues
docker compose logs app-prod | grep -i "slow\|timeout\|memory"
```

### Support & Maintenance

**Regular Maintenance Tasks:**
1. **Daily**: Check service health and review error logs
2. **Weekly**: Update security patches, review performance metrics
3. **Monthly**: Update dependencies, review and optimize database
4. **Quarterly**: Disaster recovery testing, security audit

**Getting Help:**
- Check logs for specific error messages
- Review GitHub Issues for known problems
- Contact system administrator for infrastructure issues
- Monitor community forums for updates and best practices

---

## Quick Reference

### Essential Commands

```bash
# Start production environment
docker compose --profile prod up -d

# Deploy latest changes
./scripts/deploy.sh deploy

# View application logs
docker compose logs -f app-prod

# Create backup
./scripts/deploy.sh backup

# Health check
curl http://localhost:3000/api/health

# Stop all services
docker compose --profile prod down
```

### Important URLs

- **Application**: https://habibistay.com
- **Admin Panel**: https://habibistay.com/admin
- **API Health**: https://habibistay.com/api/health
- **Monitoring**: https://habibistay.com:3001 (Grafana)
- **Metrics**: https://habibistay.com:9090 (Prometheus)

For detailed deployment support, refer to the operations team or check the project wiki for additional resources.