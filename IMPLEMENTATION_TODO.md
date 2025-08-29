# HabibiStay — Comprehensive Implementation Plan

This document captures a detailed implementation checklist for converting the current HabibiStay codebase from prototype/mocked logic to a production-ready platform.

High-level phases:
- Audit & design
- Backend implementation & integration
- Frontend wiring & UX
- Data & infra
- QA, observability, deployment

## Master Checklist

- [x] Analyze current codebase implementation status
- [x] Examine AdminDashboard functionality
- [x] Review backend services implementation
- [x] Audit database schema and migrations

- [ ] Setup & Environment
  - [ ] Ensure .env variables documented and secure vault instructions added
  - [ ] Create local dev database script & seed runner for migrations
  - [ ] Verify worker / Hono environment runs locally (wrangler / cloudflare dev)
  - [ ] Add developer README for running frontend/backend/worker

- [ ] Authentication & Authorization
  - [ ] Wire production OAuth/session connections to @getmocha users service
  - [ ] Harden auth middleware, session cookie settings, CSRF, sameSite
  - [ ] Implement role based access checks across all admin endpoints
  - [ ] Add tests for auth flows & requireRole behavior

- [ ] API Implementation & Business Logic
  - [ ] Replace any remaining mock/stub responses with database-backed logic
  - [ ] Ensure input validation and sanitization on all endpoints (zod schemas)
  - [ ] Standardize ApiResponse shape across endpoints
  - [ ] Add consistent error handling and error codes
  - [ ] Implement pagination metadata consistently
  - [ ] Add rate-limit and IP-block rules where needed

- [ ] Payments
  - [ ] Complete MyFatoorah integration (API keys, secure signing, webhook verification)
  - [ ] Complete PayPal integration (client id/secret, webhook verification)
  - [ ] Ensure payment records mapping to bookings are normalized
  - [ ] Implement idempotency and retry handling for webhooks
  - [ ] Add refund logic safe-guards and reconciliation scripts
  - [ ] Add integration tests for payment flows (mocked gateways)

- [ ] Booking System
  - [ ] Replace stubbed availability logic with robust calendar / property_availability checks
  - [ ] Ensure overlapping-booking checks are atomic (transactions) to avoid race conditions
  - [ ] Complete pricing calculation with pricing rules, cleaning fees and discounts
  - [ ] Add cancellation policy enforcement and refund processing workflows
  - [ ] Add booking audit logs and notifications

- [ ] Properties & Channel Management
  - [ ] Ensure create/update property endpoints persist correct fields (amenities, images JSON)
  - [ ] Implement channel connections sync handlers (scheduling + manual triggers)
  - [ ] Add property availability calendar maintenance endpoints
  - [ ] Add image upload validation and storage (S3 or Cloud provider)

- [ ] AI Chat / Bot
  - [ ] Secure AI API keys in DB or vault; ensure ai_config table is used by /api/chat/enhanced
  - [ ] Add model provider abstraction to support other vendors
  - [ ] Ensure content moderation / safety checks for messages
  - [ ] Add conversation rate limits and persistence

- [ ] Email & Notifications
  - [ ] Wire an SMTP provider or transactional email API (SendGrid/SES)
  - [ ] Use email templates in DB; verify renderEmailTemplate usage
  - [ ] Implement email queueing and retries
  - [ ] Add push/sms notification placeholders and opt-in settings

- [ ] Data Management & DB
  - [ ] Review and finalize migrations (unique constraints, indexes)
  - [ ] Add missing indexes for reporting queries (bookings.created_at, properties.owner_id)
  - [ ] Add DB transactions where multi-step updates occur (payments + bookings)
  - [ ] Implement periodic maintenance scripts (reconcile payments/bookings)
  - [ ] Add backups and restore docs

- [ ] Tests & Quality
  - [ ] Add unit tests for services (BookingService, PaymentService, PricingService)
  - [ ] Add integration tests for important API flows
  - [ ] Add E2E tests for booking and payment flows
  - [ ] Run lint and configure pre-commit hooks
  - [ ] Increase TypeScript strictness and add missing types

- [ ] Frontend Integration & UX
  - [ ] Replace mock fetches with real API endpoints (AdminDashboard already wired - verify)
  - [ ] Add global loading/error states and error boundaries
  - [ ] Wire auth flows and protected routes
  - [ ] Implement mobile responsiveness and accessibility fixes (WCAG basics)
  - [ ] Add optimistic updates and toasts for actions (e.g., property status change)
  - [ ] Add client-side validation matching server side rules

- [ ] Performance & Observability
  - [ ] Add request/response logging (structured)
  - [ ] Add metrics (Prometheus / Stats) and tracing hooks
  - [ ] Integrate Sentry (or similar) for error tracking
  - [ ] Add caching for expensive read endpoints (featured properties, stats)

- [ ] Security Hardening
  - [ ] Harden SQL injection protections and validate SQL building
  - [ ] Enforce CSP and security headers in worker
  - [ ] Implement webhook signature verification
  - [ ] Secure env secrets; rotate keys instructions
  - [ ] Pen test checklist and scanning integration

- [ ] Deployment & Infra
  - [ ] Finalize Dockerfile and docker-compose for dev and prod
  - [ ] Add CI pipelines (lint, test, build, deploy)
  - [ ] Add Cloudflare Worker config and secrets for production
  - [ ] Add a deployment playbook and rollback mechanism
  - [ ] Add monitoring dashboards and alerting rules

- [ ] Documentation & Handoff
  - [ ] Update README with architecture and run steps
  - [ ] Document environment variables and secret locations
  - [ ] Add API reference for public endpoints
  - [ ] Create runbook for incident response and common tasks

- [ ] Release & Post-release
  - [ ] Dry-run deploy to staging; smoke test
  - [ ] Run load tests on critical flows
  - [ ] Schedule production cutover with monitoring
  - [ ] Post-release validation checklist

## Prioritized Next Steps (for implementation order)
1. Environment setup, migrations & local DB seeds
2. Harden auth + role checks (backend)
3. Payments: finalize MyFatoorah + webhook verification
4. Booking availability atomicity & pricing correctness
5. Frontend: wire booking flow + payment modal
6. Tests (unit + integration) for booking & payment flows
7. Observability + deployment automation
