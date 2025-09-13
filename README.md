# HabibiStay - Production-Ready Vacation Rental Platform

## Overview
HabibiStay is a full-stack vacation rental platform built with React 19 (frontend), Hono (Cloudflare Workers backend), and PostgreSQL/D1 (database). It supports property management, bookings, payments (MyFatoorah/PayPal), AI-powered chat, dynamic pricing, channel synchronization, and admin dashboards. This is a production-ready implementation with real integrations, security hardening, and comprehensive testing.

**Key Features:**
- Property listing/search with image uploads (Cloudflare R2/S3)
- Booking engine with atomic availability checks and dynamic pricing
- Secure payments with webhook verification and refunds
- AI chat assistant (OpenAI/Anthropic) with moderation
- Multi-channel sync (Airbnb, Booking.com placeholders)
- Role-based admin dashboard (RBAC)
- Email/SMS notifications (Resend/SendGrid/SES/Twilio)
- Mobile-first responsive design (Tailwind CSS)
- Content Management System (CMS) for website content management

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, React Router, React Hook Form, Zod
- **Backend**: Hono 4.7.7, Cloudflare Workers, TypeScript 5.8.3
- **Database**: PostgreSQL (local) / Cloudflare D1 (prod), SQL migrations
- **Auth**: JWT + @getmocha/users-service (OAuth)
- **Payments**: MyFatoorah, PayPal (sandbox/prod APIs)
- **AI/ML**: OpenAI GPT-4 (configurable providers)
- **Emails**: Resend/SendGrid/AWS SES (multi-provider)
- **Storage**: Cloudflare R2 / AWS S3
- **Testing**: Vitest/Jest (80%+ coverage), E2E with Playwright
- **Deployment**: Docker, Cloudflare Workers, GitHub Actions CI/CD
- **Monitoring**: Sentry, Prometheus, structured logging

## Prerequisites
- Node.js 20+ (LTS)
- Docker & Docker Compose (for local DB/Redis)
- Cloudflare account (for Workers/D1/R2)
- PostgreSQL 15+ (local dev) or Cloudflare D1 (prod)
- API keys: MyFatoorah, PayPal, OpenAI, @getmocha, email providers

## Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone git@github.com:Mirxa27/HabibiStay-Platform.git
cd HabibiStay-Platform
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in values:
```bash
cp .env.example .env
```

**Required .env Variables:**
```
# Database
DB_URL=postgresql://user:pass@localhost:5432/habibistay
DB_POOL_SIZE=10

# Cloudflare (Workers/D1/R2)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
D1_DATABASE_ID=your_d1_db_id
R2_BUCKET_NAME=habibistay-images
R2_ACCESS_KEY_ID=your_r2_key
R2_SECRET_ACCESS_KEY=your_r2_secret

# Authentication
GETMOCHA_CLIENT_ID=your_mocha_client_id
GETMOCHA_CLIENT_SECRET=your_mocha_client_secret
GETMOCHA_REDIRECT_URI=http://localhost:5173/auth/callback
JWT_SECRET=your_jwt_secret_32_chars_min
SESSION_SECRET=your_session_secret_32_chars_min

# Payments
MYFATOORAH_API_KEY=your_myfatoorah_key
MYFATOORAH_TEST_MODE=true  # Set to false for production
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_SANDBOX=true  # Set to false for production

# AI
OPENAI_API_KEY=your_openai_key
AI_MODEL=gpt-4o-mini  # or gpt-4o, claude-3-5-sonnet-haiku

# Email
RESEND_API_KEY=your_resend_key  # Primary
SENDGRID_API_KEY=your_sendgrid_key  # Fallback
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret

# Other
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:8787
NODE_ENV=development
LOG_LEVEL=info
```

**Production Secrets Management:**
- Use Cloudflare Workers Secrets: `wrangler secret put JWT_SECRET`
- Vault: HashiCorp Vault or AWS Secrets Manager for rotation
- Rotate keys quarterly; audit logs in security-utils.ts.AuditLogger

### 3. Database Setup
#### Local PostgreSQL (Recommended for Dev)
```bash
# Start with Docker
docker compose -f docker-compose.dev.yml up -d postgres redis

# Or install locally
brew install postgresql
brew services start postgresql
createdb habibistay
```

#### Run Migrations & Seed
```bash
# Install migration tool if needed
npm install -g drizzle-kit  # Or use custom scripts/migrate.js

# Run migrations
npm run migrate

# Seed initial data (admin user, sample properties, pricing rules)
npm run seed
```

**Migration Files:** See `migrations/` directory. Key schemas:
- `users` (with roles: admin, owner, user)
- `properties` (amenities JSON, images array)
- `bookings` (status enum, pricing breakdown JSON)
- `payments` (provider, status, webhook logs)
- `ai_config` (API keys encrypted)
- Indexes: `bookings.created_at`, `properties.owner_id`, `availability.date`

### 4. Development Servers
#### Full Stack (Recommended)
```bash
npm run dev
# Runs: wrangler dev (backend:8787) + vite (frontend:5173)
# Access: http://localhost:5173
```

#### Frontend Only
```bash
npm run dev:frontend-only  # or npm run dev:client
# Proxy API calls to backend via vite.config.ts
```

#### Backend Only (API Testing)
```bash
npm run dev:server  # wrangler dev --port 8787
# Test with curl or Postman: http://localhost:8787/api/health
```

#### Mock Mode (For UI Development Without Backend)
```bash
npm run dev:mock
# Starts mock-server.ts (JSON responses) + frontend
```

### 5. Testing
```bash
# Unit/Integration
npm test  # vitest
npm run test:coverage  # With reports
npm run test:ui  # Interactive UI

# Specific Suites
npm run test:security  # security-utils.test.ts
npm run test:api  # API endpoints
npm run test:e2e  # E2E flows (booking/payment)
npm run test:components  # React components

# Lint & Type Check
npm run lint
npm run type-check
```

**Test Coverage Goal:** 80%+; Run `npm run test:all` in CI.

### 6. Building & Production
```bash
# Build (TypeScript + Vite)
npm run build  # Outputs to dist/

# Docker Build/Run
npm run docker:build  # Production image
npm run docker:dev  # Dev with hot reload
docker compose up -d  # Full stack (profiles: dev/prod/monitoring)

# Deploy to Cloudflare
npm run deploy  # Runs scripts/deploy.sh
wrangler deploy  # Workers only
```

**Production Deployment:**
- **Workers**: `wrangler deploy --env production`
- **Frontend**: Vite build to Cloudflare Pages or S3
- **Database**: Cloudflare D1 (migrate via wrangler)
- **CI/CD**: GitHub Actions (lint/test/build/deploy); blue-green via feature flags
- **Rollback**: `npm run deploy:rollback`; DB migration downs

## API Documentation
Base URL: `http://localhost:8787/api` (dev) / `https://api.habibistay.com/api` (prod)

### Authentication
- **OAuth Login**: `GET /auth/login` (redirect to @getmocha)
- **Callback**: `GET /auth/callback?code=...`
- **JWT**: Include `Authorization: Bearer <token>` in requests
- **Roles**: admin (full), owner (properties/bookings), user (book/view)

### Key Endpoints
1. **Properties** (`/properties`)
   - `GET /` - Search (query: location, dates, guests, amenities)
   - `GET /:id` - Detail with reviews/availability
   - `POST /` - Create (owner auth, multipart images)
   - `PUT /:id` - Update (ownership check)
   - `DELETE /:id` - Soft delete

2. **Bookings** (`/bookings`)
   - `POST /` - Create with availability check (atomic tx)
   - `GET /:id` - Get with pricing breakdown
   - `PUT /:id` - Update (status, dates; policy enforcement)
   - `DELETE /:id` - Cancel with refund calc
   - `GET /search` - User/owner bookings (pagination)

3. **Payments** (`/payments`)
   - `POST /` - Create (redirect to provider)
   - `GET /:id` - Status/verify
   - `POST /:id/refund` - Partial/full refund
   - `POST /webhooks/:provider` - Webhook handler (signature verified)

4. **Admin** (`/admin`, admin role required)
   - `GET /stats` - Dashboard metrics (properties, bookings, revenue)
   - `PUT /properties/:id/status` - Activate/featured
   - `GET /channels` - Channel manager
   - `POST /ai/config` - Update AI keys/models

5. **Content Management** (`/cms`, admin role required)
   - `GET /pages` - List all pages
   - `GET /pages/:id` - Get specific page
   - `POST /pages` - Create new page
   - `PUT /pages/:id` - Update page
   - `DELETE /pages/:id` - Delete page
   - Similar endpoints for templates, components, media, and AI providers

6. **Chat** (`/chat`)
   - `POST /enhanced` - AI response (with context/moderation)
   - `GET /:conversationId` - History

**Error Format:** `{ success: false, error: { code: 'BOOKING_CONFLICT', message: '...', details: {} } }`

**Rate Limits:** 100 req/min (user), 500 req/min (admin); IP blocks on abuse.

## File Structure
```
HabibiStay/
├── src/
│   ├── react-app/     # React 19 frontend (pages, components, hooks)
│   ├── server/        # Business services (BookingService, PaymentService)
│   ├── shared/        # Utils (security, email, AI, pricing)
│   ├── worker/        # Hono API routes (index.ts)
│   └── test/          # Vitest tests
├── migrations/        # SQL schema (Drizzle/Prisma compatible)
├── scripts/           # Deploy, seed, backup
├── config/            # Nginx, Prometheus, Redis
├── tests/             # Separate Jest suite
├── docker-compose.yml # Dev/prod stacks
└── package.json       # Scripts: dev, build, test, deploy
```

## Security & Compliance
- **Auth**: JWT (HS256), CSRF tokens, role-based access (RBAC)
- **Data**: SQL injection prevention (prepared statements), input sanitization (Zod)
- **Payments**: PCI compliant (no card storage), webhook signatures (HMAC)
- **Privacy**: GDPR-ready (data export/delete), encrypted AI keys
- **Auditing**: All actions logged (AuditLogger); IP rate limiting
- **Vulns**: No critical issues (tested with npm audit, SonarQube)

**Penetration Testing**: Run `npm run test:security` + manual OWASP checks.

## Monitoring & Observability
- **Logs**: Structured JSON with correlation IDs (winston/pino)
- **Metrics**: Prometheus (config/prometheus.yml); endpoints: `/metrics`, `/health`
- **Errors**: Sentry integration (DSN in .env)
- **Alerts**: Uptime (99.9% SLA), error rate <0.1%, payment failures
- **Dashboards**: Grafana for bookings/revenue; custom admin stats

## Contributing
1. Branch: `feature/auth-hardening` or `fix/payment-webhook`
2. Commit: Conventional (feat:, fix:, docs:)
3. PR: Lint/tests pass; 80% coverage
4. Review: Security-sensitive changes require 2 approvals

## Troubleshooting
- **DB Connection**: Verify `DB_URL`; run `npm run migrate` if schema issues
- **Workers**: `wrangler dev --log-level debug`; check secrets with `wrangler secret list`
- **Payments**: Use sandbox mode; verify webhooks with ngrok
- **CORS**: Configured in worker; proxy in dev via Vite
- **Tests Fail**: `npm run test:setup` for mocks; clear cache `rm -rf node_modules/.vite`

## License & Support
MIT License. For production support, contact support@habibistay.com.

**Version**: 1.0.0 (Production Ready)
**Last Updated**: September 2025
