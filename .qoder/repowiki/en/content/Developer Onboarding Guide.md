# Developer Onboarding Guide

<cite>
**Referenced Files in This Document**   
- [README.md](file://README.md) - *Updated with comprehensive setup instructions*
- [.env.example](file://.env.example) - *Added complete environment configuration template*
- [package.json](file://package.json) - *Updated with new development scripts*
- [vite.config.ts](file://vite.config.ts) - *Modified for improved development server configuration*
- [wrangler.json](file://wrangler.json) - *Updated with D1 database binding*
- [src/worker/index.full.ts](file://src/worker/index.full.ts) - *Enhanced worker implementation*
- [docker-compose.yml](file://docker-compose.yml) - *Added development and production profiles*
- [Dockerfile](file://Dockerfile) - *Updated for production deployment*
- [DEPLOYMENT.md](file://DEPLOYMENT.md) - *Enhanced with backup and recovery procedures*
- [TESTING.md](file://TESTING.md) - *Updated with comprehensive test coverage details*
- [src/shared/security-config.ts](file://src/shared/security-config.ts) - *Added environment validation and compliance configuration*
</cite>

## Update Summary
**Changes Made**   
- Updated Prerequisites section with Node.js 20+ requirement and Docker installation instructions
- Added comprehensive Environment Configuration section with detailed .env setup instructions
- Enhanced Repository Setup with Docker-based development environment configuration
- Expanded Frontend Development Setup with multiple development modes (full stack, frontend-only, mock mode)
- Added detailed Backend Development Setup with wrangler configuration and local development commands
- Updated API Testing and Endpoints with complete endpoint documentation and testing procedures
- Enhanced Building and Deployment section with Docker and production deployment workflows
- Added comprehensive Testing section with unit, integration, and E2E testing commands
- Updated Common Issues and Solutions with database connection and environment variable troubleshooting
- Added Security & Compliance section with environment validation and GDPR/PCI DSS configuration

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Repository Setup](#repository-setup)
4. [Environment Configuration](#environment-configuration)
5. [Frontend Development Setup](#frontend-development-setup)
6. [Backend Development Setup](#backend-development-setup)
7. [API Testing and Endpoints](#api-testing-and-endpoints)
8. [Testing](#testing)
9. [Building and Deployment](#building-and-deployment)
10. [Security and Compliance](#security-and-compliance)
11. [Debugging and Troubleshooting](#debugging-and-troubleshooting)
12. [Common Issues and Solutions](#common-issues-and-solutions)

## Introduction

This Developer Onboarding Guide provides comprehensive instructions for setting up the HabibiStay development environment. The application is a full-stack platform built with React 19 for the frontend, Cloudflare Workers with Hono for the backend, and PostgreSQL/D1 for the database. It features an AI-powered chatbot, property booking system, and payment integration with MyFatoorah and PayPal. This guide covers all necessary steps from initial setup to deployment, ensuring new developers can quickly become productive.

**Section sources**
- [README.md](file://README.md)

## Prerequisites

Before beginning development, ensure you have the following tools installed:

- **Node.js**: Version 20 or higher (LTS recommended)
- **pnpm**: Node package manager (recommended for this project)
- **Cloudflare CLI (Wrangler)**: Version 4.33.0 or higher for Cloudflare Workers development
- **Git**: For version control and repository cloning
- **Docker & Docker Compose**: For local database and Redis setup
- **PostgreSQL 15+**: For local development database

To install Wrangler globally:
```bash
npm install -g wrangler
```

Verify your installations:
```bash
node --version
pnpm --version
wrangler --version
docker --version
docker-compose --version
```

The project uses Vite as the build tool and development server, with TypeScript for type safety across both frontend and backend code. The frontend leverages several modern libraries including Radix UI for accessible components, react-hook-form for form handling, and date-fns for date operations.

**Section sources**
- [package.json](file://package.json)
- [README.md](file://README.md)

## Repository Setup

Follow these steps to set up the repository locally:

1. Clone the repository:
```bash
git clone https://github.com/Mirxa27/HabibiStay-Platform.git
cd HabibiStay-Platform
```

2. Install dependencies using pnpm:
```bash
pnpm install
```

The project structure follows a modular architecture:
- `src/react-app`: React frontend components and pages
- `src/worker`: Cloudflare Worker backend API
- `src/shared`: Shared types and utilities between frontend and backend
- `migrations`: Database migration scripts
- `scripts`: Deployment, backup, and maintenance scripts
- `config`: Configuration files for nginx, prometheus, and redis

The project uses TypeScript with separate configuration files for different parts of the application, allowing for type sharing between frontend and backend. Docker is used for local development to provide consistent database and caching services.

**Section sources**
- [README.md](file://README.md)
- [docker-compose.yml](file://docker-compose.yml)

## Environment Configuration

Create a `.env` file in the project root directory by copying the example:

```bash
cp .env.example .env
```

Fill in the required values in your `.env` file. Key environment variables include:

```env
# Database Configuration
DB_URL=postgresql://username:password@localhost:5432/habibistay
DB_POOL_SIZE=10
D1_DATABASE_ID=your_d1_database_id_here

# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
R2_BUCKET_NAME=habibistay-images-bucket
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key

# Authentication
GETMOCHA_CLIENT_ID=your_getmocha_client_id
GETMOCHA_CLIENT_SECRET=your_getmocha_client_secret
GETMOCHA_REDIRECT_URI=http://localhost:5173/auth/callback
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters_long
SESSION_SECRET=your_session_secret_key_for_csrf_protection_32_chars_min

# Payments
MYFATOORAH_API_KEY=your_myfatoorah_api_key_here
MYFATOORAH_TEST_MODE=true
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_SANDBOX=true

# AI Services
OPENAI_API_KEY=sk-your_openai_api_key_here
AI_MODEL=gpt-4o-mini

# Email Services
RESEND_API_KEY=your_resend_api_key_here
SENDGRID_API_KEY=your_sendgrid_api_key_here
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# Application URLs
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:8787

# Security and Rate Limiting
NODE_ENV=development
LOG_LEVEL=info
RATE_LIMIT_USER=100
RATE_LIMIT_ADMIN=500
```

For production deployment, use Cloudflare Workers Secrets to manage sensitive information:
```bash
wrangler secret put JWT_SECRET
wrangler secret put MYFATOORAH_API_KEY
wrangler secret put OPENAI_API_KEY
```

The application includes environment validation to ensure required variables are present and properly configured:
```typescript
// src/shared/security-config.ts
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const required = [
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'MYFATOORAH_API_KEY',
    'DATABASE_URL'
  ];
  // Validation logic ensures security requirements are met
}
```

**Section sources**
- [.env.example](file://.env.example)
- [src/shared/security-config.ts](file://src/shared/security-config.ts)
- [README.md](file://README.md)

## Frontend Development Setup

The frontend is built with React 19, Vite, and Tailwind CSS. Multiple development modes are available:

### Full Stack Development
Starts both frontend and backend servers:
```bash
npm run dev
```
This command launches:
- Vite development server at `http://localhost:5173`
- Cloudflare Worker at `http://localhost:8787`
- Automatic proxying of API requests from frontend to backend

### Frontend Only Development
Starts only the Vite development server:
```bash
npm run dev:frontend-only
```
API requests are proxied to the backend via Vite configuration in `vite.config.ts`.

### Mock Mode Development
Starts a mock API server with sample data:
```bash
npm run dev:mock
```
This is useful for UI development without requiring a backend or database.

### Development Server Features
The Vite development server provides:
- Hot module replacement (HMR)
- Fast refresh
- Local development server at `http://localhost:5173`
- Proxy configuration for API requests
- Environment variable loading

The Vite configuration (`vite.config.ts`) includes:
- React plugin for JSX support
- Server proxy to route `/api` requests to the backend
- Build optimization settings

```mermaid
flowchart TD
A["npm run dev"] --> B["Vite Development Server"]
B --> C["React Frontend"]
C --> D["Cloudflare Worker API"]
D --> E["PostgreSQL/D1 Database"]
B --> F["HMR & Fast Refresh"]
B --> G["Environment Variables"]
B --> H["Proxy Configuration"]
```

**Diagram sources**
- [vite.config.ts](file://vite.config.ts)
- [package.json](file://package.json)
- [README.md](file://README.md)

**Section sources**
- [vite.config.ts](file://vite.config.ts)
- [package.json](file://package.json)
- [README.md](file://README.md)

## Backend Development Setup

The backend runs as a Cloudflare Worker using the Hono framework. Key features include:

- RESTful API endpoints under `/api/` prefix
- CORS middleware for cross-origin requests
- Authentication middleware using Mocha user service
- Database operations via Cloudflare D1 or PostgreSQL
- AI chatbot integration with OpenAI
- Payment processing with MyFatoorah and PayPal

The worker entry point is `src/worker/index.full.ts`, which sets up the Hono application with various routes for:
- Authentication (`/api/auth/login`, `/api/auth/callback`)
- Properties (`/api/properties`)
- Bookings (`/api/bookings`)
- Chat functionality (`/api/chat`)
- Admin endpoints (`/api/admin`)

To work with the worker locally, ensure Wrangler is installed and configured. The worker configuration in `wrangler.json` includes:
- D1 database binding for persistent storage
- Compatibility flags for Node.js APIs
- Observability for monitoring and debugging
- Assets configuration for serving static files

```bash
# Run worker in local development mode
wrangler dev

# Run backend only (with Vite proxying to it)
npm run dev:server
```

The worker connects to the database using environment-specific configuration:
- Local development: PostgreSQL via Docker
- Production: Cloudflare D1 database

```
mermaid
classDiagram
class HonoApp {
+use(middleware)
+get(route, handler)
+post(route, handler)
+put(route, handler)
+delete(route, handler)
}
class CorsMiddleware {
+origin : string
+allowMethods : string[]
+allowHeaders : string[]
}
class AuthMiddleware {
+validateSession()
+getUser()
}
class DatabaseService {
+query(sql, params)
+insert(table, data)
+update(table, data, condition)
+delete(table, data, condition)
}
class OpenAIService {
+createCompletion(prompt)
+chatCompletions(messages)
}
class PaymentService {
+createPayment()
+verifyWebhook()
+processRefund()
}
HonoApp --> CorsMiddleware : "uses"
HonoApp --> AuthMiddleware : "uses"
HonoApp --> DatabaseService : "uses"
HonoApp --> OpenAIService : "uses"
HonoApp --> PaymentService : "uses"
```

**Diagram sources**
- [src/worker/index.full.ts](file://src/worker/index.full.ts)
- [wrangler.json](file://wrangler.json)
- [src/shared/security-config.ts](file://src/shared/security-config.ts)

**Section sources**
- [src/worker/index.full.ts](file://src/worker/index.full.ts)
- [wrangler.json](file://wrangler.json)
- [README.md](file://README.md)

## API Testing and Endpoints

The API provides several endpoints for testing and development:

### Authentication Endpoints
```bash
# Get OAuth login redirect
GET /api/auth/login

# Handle OAuth callback
GET /api/auth/callback?code=authorization_code

# Get current user profile
GET /api/users/me
Authorization: Bearer session_token

# Logout
GET /api/logout
```

### Property Endpoints
```bash
# Search properties with filters
GET /api/properties?location=Riyadh&check_in=2025-12-01&check_out=2025-12-05&guests=2

# Get featured properties
GET /api/properties/featured

# Get property by ID
GET /api/properties/1

# Create new property (authenticated)
POST /api/properties
Authorization: Bearer session_token
Content-Type: application/json
{
  "title": "Luxury Apartment",
  "location": "Riyadh",
  "price_per_night": 200,
  "max_guests": 4,
  "amenities": ["wifi", "pool", "parking"]
}
```

### Booking Endpoints
```bash
# Create booking
POST /api/bookings
Content-Type: application/json
{
  "property_id": 1,
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "check_in_date": "2025-12-01",
  "check_out_date": "2025-12-05",
  "total_guests": 2,
  "special_requests": "Late check-in"
}
```

### Chat Endpoint
```bash
# Send message to AI chatbot
POST /api/chat
Content-Type: application/json
{ 
  "message": "Find me a luxury apartment in Riyadh", 
  "conversation_id": "conv_123" 
}
```

### Admin Endpoints
```bash
# Get admin dashboard stats
GET /api/admin/stats
Authorization: Bearer admin_token

# Update AI configuration
PUT /api/admin/ai/config
Authorization: Bearer admin_token
Content-Type: application/json
{
  "model": "gpt-4o",
  "temperature": 0.7
}
```

You can test these endpoints using curl, Postman, or by interacting with the frontend application. The API uses Zod for request validation, ensuring data integrity.

```
mermaid
sequenceDiagram
participant Frontend
participant API as Cloudflare Worker
participant DB as Database
participant OpenAI
Frontend->>API : GET /api/properties?location=Riyadh
API->>DB : Query properties with filters
DB-->>API : Return property data
API->>API : Calculate availability and pricing
API-->>Frontend : Return filtered properties
Frontend->>API : POST /api/chat
API->>DB : Get property context
DB-->>API : Return property data
API->>OpenAI : Create chat completion
OpenAI-->>API : Return AI response
API-->>Frontend : Return chat response
```

**Diagram sources**
- [src/worker/index.full.ts](file://src/worker/index.full.ts)
- [src/test/api-endpoints.test.ts](file://src/test/api-endpoints.test.ts)
- [README.md](file://README.md)

**Section sources**
- [src/worker/index.full.ts](file://src/worker/index.full.ts)
- [README.md](file://README.md)

## Testing

The application has comprehensive test coverage with multiple testing levels:

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in interactive UI mode
npm run test:ui

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:security
npm run test:components
npm run test:api
```

### Test Structure
- **Unit Tests**: Located in `src/test/` and `tests/unit/`, covering individual functions and components
- **Integration Tests**: Located in `tests/integration/`, testing API endpoints and service interactions
- **E2E Tests**: Located in `tests/e2e/`, testing complete user workflows
- **Component Tests**: Located in `src/react-app/components/__tests__/`, testing React components

### Test Coverage
The application aims for 80%+ test coverage, with specific focus on:
- Security utilities and validation
- API endpoints and error handling
- Payment processing and webhook verification
- User authentication and authorization
- Property search and booking logic

```bash
# Run all tests with coverage
npm run test:all

# View test coverage report
# Reports are generated in coverage/ directory
```

The testing framework uses Vitest with the following configuration:
- Mocking of external services (OpenAI, payment gateways)
- In-memory database for fast test execution
- Comprehensive assertion library
- Code coverage reporting

**Section sources**
- [package.json](file://package.json)
- [tests/run-tests.js](file://tests/run-tests.js)
- [TESTING.md](file://TESTING.md)
- [src/test/api-endpoints.test.ts](file://src/test/api-endpoints.test.ts)

## Building and Deployment

To build the application for production:

```bash
npm run build
```

This command executes the build script defined in `package.json`, which runs:
```bash
tsc -b && vite build
```

The build process:
1. Compiles TypeScript code using project references
2. Bundles the frontend with Vite
3. Generates optimized static assets
4. Prepares the worker for deployment

### Docker Deployment
The application includes Docker support for consistent deployment:

```bash
# Build production Docker image
npm run docker:build

# Start development environment with Docker
npm run docker:dev

# Start production environment with Docker
npm run docker:prod

# Start monitoring services
npm run docker:monitoring
```

### Cloudflare Deployment
To deploy to Cloudflare:
```bash
wrangler deploy
```

Additional deployment commands:
```bash
# Deploy with backup
./scripts/deploy.sh deploy

# Create backup
./scripts/deploy.sh backup

# Rollback deployment
./scripts/deploy.sh rollback

# Check deployment health
./scripts/deploy.sh health
```

The deployment process automatically configures the worker with the necessary environment variables and routes, making the application available at your configured domain.

```
mermaid
flowchart TD
A["Development"] --> B["npm run build"]
B --> C["TypeScript Compilation"]
C --> D["Vite Bundling"]
D --> E["Optimized Assets"]
E --> F["Docker Image"]
F --> G["Production Deployment"]
G --> H["Cloudflare Workers"]
H --> I["Global CDN"]
I --> J["Users"]
```

**Diagram sources**
- [Dockerfile](file://Dockerfile)
- [docker-compose.yml](file://docker-compose.yml)
- [package.json](file://package.json)
- [scripts/deploy.sh](file://scripts/deploy.sh)

**Section sources**
- [package.json](file://package.json)
- [Dockerfile](file://Dockerfile)
- [docker-compose.yml](file://docker-compose.yml)
- [DEPLOYMENT.md](file://DEPLOYMENT.md)
- [scripts/deploy.sh](file://scripts/deploy.sh)

## Security and Compliance

The application implements comprehensive security and compliance measures:

### Security Configuration
```typescript
// src/shared/security-config.ts
export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; frame-ancestors 'none';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

### Compliance Settings
```typescript
// src/shared/security-config.ts
export const COMPLIANCE_CONFIG = {
  gdpr: {
    enabled: true,
    dataRetentionDays: 365 * 2,
    requireConsent: true,
    allowDataExport: true,
    allowDataDeletion: true
  },
  pciDss: {
    enabled: true,
    tokenizeCards: true,
    encryptTransmission: true,
    logCardAccess: true,
    requireStrongAuth: true
  }
};
```

### Environment Validation
The application validates environment variables at startup:
```typescript
// src/shared/security-config.ts
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const required = [
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'MYFATOORAH_API_KEY',
    'DATABASE_URL'
  ];
  // Validation ensures security requirements are met
}
```

### Security Best Practices
- **Authentication**: JWT with HS256, CSRF tokens, role-based access control
- **Data Protection**: SQL injection prevention, input sanitization with Zod
- **Payments**: PCI DSS compliant, no card storage, webhook signature verification
- **Privacy**: GDPR-ready with data export and deletion capabilities
- **Auditing**: All actions logged with correlation IDs
- **Rate Limiting**: IP-based rate limiting to prevent abuse

**Section sources**
- [src/shared/security-config.ts](file://src/shared/security-config.ts)
- [SECURITY.md](file://SECURITY.md)
- [config/nginx.conf](file://config/nginx.conf)

## Debugging and Troubleshooting

### Frontend Debugging
Use browser developer tools to debug the React application:
- Inspect component hierarchy and props
- Monitor network requests to the API
- Check console for errors and warnings
- Use React DevTools extension

Key debugging tips:
- Enable strict mode in development for additional warnings
- Use the `@` alias in imports for consistent path resolution
- Check TypeScript compilation errors before running
- Use Vite's error overlay for immediate feedback

### Worker Debugging
Debug Cloudflare Workers using:
- `console.log()` statements (visible in Wrangler dev mode)
- Cloudflare Logs for deployed workers
- Wrangler's local development mode

```bash
# Run worker in local development mode with debug logging
wrangler dev --log-level debug

# Check worker secrets
wrangler secret list
```

Common debugging scenarios:
- Check environment variables are properly configured
- Verify database connection and query syntax
- Validate request/response formats with Zod schemas
- Monitor OpenAI API key and rate limits
- Check payment gateway webhook configurations

```
mermaid
flowchart TD
A["Issue Reported"] --> B{"Frontend or Backend?"}
B --> |Frontend| C["Check Browser Console"]
B --> |Backend| D["Check Worker Logs"]
C --> E["Inspect Network Requests"]
D --> F["Review Console Logs"]
E --> G{"Error Type?"}
F --> G
G --> |TypeScript| H["Fix Type Errors"]
G --> |Runtime| I["Add Error Handling"]
G --> |Network| J["Check API Endpoints"]
H --> K["Test Fix"]
I --> K
J --> K
K --> L["Verify Resolution"]
L --> M["Document Solution"]
```

**Diagram sources**
- [src/worker/index.full.ts](file://src/worker/index.full.ts)
- [src/react-app/App.tsx](file://src/react-app/App.tsx)
- [README.md](file://README.md)

**Section sources**
- [src/worker/index.full.ts](file://src/worker/index.full.ts)
- [src/react-app/App.tsx](file://src/react-app/App.tsx)
- [README.md](file://README.md)

## Common Issues and Solutions

### 1. Database Connection Issues
**Problem**: Cannot connect to database during development
**Solution**: 
- Ensure Docker is running: `docker ps`
- Start database services: `npm run docker:dev`
- Verify database URL in `.env` matches Docker service name
- Run migrations: `npm run migrate`

### 2. Environment Variables Not Loading
**Problem**: Missing environment variables in worker
**Solution**: 
- Verify `.env` file exists in project root
- Check variable names match those in `.env.example`
- Restart development servers after changing `.env`
- For production, use `wrangler secret put` for sensitive variables

### 3. CORS Errors
**Problem**: Cross-origin requests blocked
**Solution**: 
- The worker includes CORS middleware, but ensure your development server origin matches the allowed origins
- Check Vite proxy configuration in `vite.config.ts`
- Verify `FRONTEND_URL` in `.env` matches your development server URL

### 4. Authentication Failures
**Problem**: OAuth flow not completing
**Solution**: 
- Verify `GETMOCHA_CLIENT_ID` and `GETMOCHA_CLIENT_SECRET` are correct
- Ensure `GETMOCHA_REDIRECT_URI` matches the callback URL in Mocha dashboard
- Check JWT_SECRET is at least 32 characters long

### 5. Payment Integration Issues
**Problem**: Payment processing fails
**Solution**: 
- Verify payment API keys are correctly configured
- Check `MYFATOORAH_TEST_MODE` and `PAYPAL_SANDBOX` settings
- For webhook testing, use ngrok to expose local server
- Verify webhook signature verification is properly implemented

### 6. Type Errors Between Frontend and Backend
**Problem**: Shared types not syncing
**Solution**: 
- Use the shared types in `src/shared/types.ts` and `src/shared/security-config.ts`
- Ensure both frontend and worker TypeScript configurations include the necessary files
- Run `npm run type-check` to catch type issues

Regularly run `npm run check` to catch type and build issues early in development.

**Section sources**
- [README.md](file://README.md)
- [.env.example](file://.env.example)
- [src/shared/security-config.ts](file://src/shared/security-config.ts)
- [DEPLOYMENT.md](file://DEPLOYMENT.md)