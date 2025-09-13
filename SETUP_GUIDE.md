# HabibiStay Setup Guide

This guide will help you configure and deploy HabibiStay for the first time, including creating the initial admin user and configuring the platform.

## Quick Start

### 1. Automated Setup (Recommended)

Run the automated setup script that will handle environment configuration, dependency installation, and initial setup:

```bash
# Clone the repository
git clone https://github.com/Mirxa27/HabibiStay-Platform.git
cd HabibiStay-Platform

# Run the automated setup
npm run setup
```

The setup script will:
- Check system requirements (Node.js 18+, Docker optional)
- Create `.env` from `.env.example` with secure secrets
- Install dependencies
- Set up local database (if Docker available)
- Build and test the project
- Provide next steps

### 2. Manual Setup

If you prefer to set up manually:

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env
# Edit .env with your configuration

# 3. Validate configuration
npm run validate-env

# 4. Build the project
npm run build

# 5. Start development server
npm run dev
```

## Initial Admin Setup

### Setup Wizard (First Time)

When you first run the application, you'll be automatically redirected to the setup wizard at `/setup`:

1. **Admin Account Creation**
   - Full name for the admin user
   - Email address (will be used for login)
   - Secure password (minimum 8 characters)
   - Password confirmation

2. **Site Configuration**
   - Site name (default: "HabibiStay")
   - Site URL (optional, for production)

3. **Review & Complete**
   - Review all settings
   - Complete the setup process

The setup wizard will:
- Create the first admin user in the database
- Initialize system configuration
- Redirect to the login page upon completion

### Manual Admin Creation (Alternative)

If you need to create an admin user manually:

```bash
# Run the seed script to create sample data including admin user
npm run seed

# Default admin credentials:
# Email: admin@habibistay.com
# Password: admin123 (change immediately!)
```

## Environment Configuration

### Required Environment Variables

**Critical (Must be configured):**
```bash
DB_URL=postgresql://user:pass@localhost:5432/habibistay
JWT_SECRET=your_secure_jwt_secret_32_chars_minimum
SESSION_SECRET=your_session_secret_32_chars_minimum
```

**Important for Production:**
```bash
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
API_URL=https://api.your-domain.com
```

**Feature Configuration:**
```bash
# AI Chat (OpenAI)
OPENAI_API_KEY=sk-your_openai_key

# Payments (MyFatoorah - Primary)
MYFATOORAH_API_KEY=your_myfatoorah_key
MYFATOORAH_TEST_MODE=false

# Authentication (@getmocha)
GETMOCHA_CLIENT_ID=your_client_id
GETMOCHA_CLIENT_SECRET=your_client_secret

# Email (Resend - Primary)
RESEND_API_KEY=re_your_resend_key
```

### Validation

Check your configuration at any time:

```bash
npm run validate-env
```

This will show:
- ✅ Critical variables (required for basic functionality)
- ⚠️ Important variables (recommended for production)
- 🔵 Feature variables (enable specific functionality)
- ⚪ Optional variables (enhanced features)

## Database Setup

### Local Development (PostgreSQL)

**Option 1: Docker (Recommended)**
```bash
docker-compose -f docker-compose.dev.yml up -d postgres redis
```

**Option 2: Local PostgreSQL**
```bash
# Install PostgreSQL 15+
brew install postgresql  # macOS
sudo apt install postgresql-15  # Ubuntu

# Create database
createdb habibistay

# Update .env with connection string
DB_URL=postgresql://username:password@localhost:5432/habibistay
```

### Production (Cloudflare D1)

For production deployment on Cloudflare Workers:

```bash
# Set up Cloudflare D1 database
wrangler d1 create habibistay-prod

# Update wrangler.toml with database ID
# Set environment variables
wrangler secret put JWT_SECRET
wrangler secret put MYFATOORAH_API_KEY
# ... other secrets
```

### Run Migrations

```bash
# Run database migrations
npm run migrate

# Optional: Seed with sample data
npm run seed
```

## Development

### Start Development Server

```bash
# Full stack (backend + frontend)
npm run dev

# Frontend only (with API proxy)
npm run dev:client

# Backend only (API testing)
npm run dev:server
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8787
- **Setup Wizard**: http://localhost:5173/setup (if not setup)

### Testing

```bash
# Run all tests
npm test

# Run setup-specific tests
npm run test src/test/setup-integration.test.ts

# Run with coverage
npm run test:coverage
```

## Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Validate production environment
   NODE_ENV=production npm run validate-env
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Deploy to Cloudflare**
   ```bash
   npm run deploy
   # or
   wrangler deploy --env production
   ```

4. **Verify Deployment**
   ```bash
   npm run deploy:health
   ```

### Docker Deployment

```bash
# Build production image
docker build -t habibistay .

# Run with Docker Compose
docker-compose --profile prod up -d

# Check services
docker-compose ps
```

## Configuration Reference

### API Endpoints

After setup, the following endpoints are available:

- `GET /api/health` - System health check
- `GET /api/setup/status` - Check if setup is complete
- `POST /api/setup/initialize` - Initialize system (first time only)

### Admin Features

Once setup is complete, access admin features at:

- **Admin Dashboard**: `/admin`
- **CMS Management**: `/admin` → CMS tab
- **User Management**: `/admin` → Users tab
- **Analytics**: `/admin` → Overview tab

## Troubleshooting

### Setup Issues

**"Setup has already been completed" error:**
- This means an admin user already exists
- Access the normal application at `/` instead of `/setup`
- To reset: manually delete admin users from the database

**Database connection errors:**
- Verify `DB_URL` in `.env`
- Ensure PostgreSQL/D1 is running and accessible
- Check firewall and network settings

**Build/compilation errors:**
- Run `npm install --legacy-peer-deps` to resolve peer dependency conflicts
- Clear cache: `rm -rf node_modules/.cache`
- Verify Node.js version is 18+

### Environment Issues

**Missing API keys:**
- Features will be disabled without proper API keys
- Use `npm run validate-env` to check configuration
- See `.env.example` for all available options

**Permission errors:**
- Ensure proper file permissions for scripts: `chmod +x scripts/*.sh`
- Check database permissions for user creation

### Production Issues

**Deployment failures:**
- Verify all secrets are set in Cloudflare Workers
- Check build logs for specific error messages
- Ensure domain DNS is configured correctly

**Performance issues:**
- Enable Redis for caching: set `REDIS_URL`
- Optimize database queries with proper indexes
- Configure CDN for static assets

## Getting Help

1. **Documentation**: Check `README.md` and `DEPLOYMENT.md`
2. **Environment Validation**: Run `npm run validate-env`
3. **Health Check**: Visit `/api/health` to check system status
4. **Logs**: Check application logs for specific error details
5. **Community**: Open an issue on GitHub for support

## Security Checklist

Before going to production:

- [ ] Change default admin password
- [ ] Set secure `JWT_SECRET` and `SESSION_SECRET` (32+ characters)
- [ ] Configure proper SSL/TLS certificates
- [ ] Set up proper firewall rules
- [ ] Enable rate limiting (`REDIS_URL` configured)
- [ ] Configure error tracking (`SENTRY_DSN`)
- [ ] Review and audit all environment variables
- [ ] Test backup and recovery procedures

---

For detailed deployment information, see [DEPLOYMENT.md](./DEPLOYMENT.md).