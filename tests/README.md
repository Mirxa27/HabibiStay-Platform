# HabibiStay Testing Guide

This guide covers the comprehensive testing strategy for HabibiStay platform.

## Testing Structure

```
tests/
├── unit/                    # Unit tests for individual services
│   ├── payment-service.test.ts
│   ├── ai-chat-service.test.ts
│   └── enhanced-email-service.test.ts
├── integration/             # Integration tests for API endpoints
│   ├── booking-api.test.ts
│   └── payment-api.test.ts
├── e2e/                     # End-to-end workflow tests
│   └── booking-flow.test.ts
├── setup.ts                 # Global test configuration
├── jest.config.js          # Jest configuration
├── package.json            # Test dependencies
└── run-tests.js            # Test runner script
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to test environment variables

### Installation

```bash
cd tests/
npm install
```

### Running Tests

#### Quick Start
```bash
# Run all tests
node run-tests.js

# Run specific test suites
node run-tests.js --unit
node run-tests.js --integration
node run-tests.js --e2e

# Run with coverage
node run-tests.js --coverage

# Watch mode for development
node run-tests.js --watch
```

#### Individual Commands
```bash
# Unit tests only
npm run test:unit

# Integration tests only  
npm run test:integration

# End-to-end tests only
npm run test:e2e

# All tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Test Categories

### Unit Tests

Test individual services and utilities in isolation.

**Covered Services:**
- `PaymentService` - Payment processing logic
- `AIChatService` - AI chat functionality 
- `EnhancedEmailService` - Email delivery system
- `SecurityMiddleware` - Authentication & authorization
- `NotificationService` - Multi-channel notifications

**Key Test Cases:**
- Service initialization
- Business logic validation
- Error handling
- Edge cases and boundary conditions
- Mock external dependencies

### Integration Tests

Test API endpoints and their interactions with databases and external services.

**Covered APIs:**
- Booking endpoints (`/api/bookings/*`)
- Payment endpoints (`/api/payments/*`)
- AI chat endpoints (`/api/chat/*`)
- Admin endpoints (`/api/admin/*`)
- Authentication flows

**Key Test Cases:**
- Request/response validation
- Authentication & authorization
- Database operations
- External API integrations
- Error responses and status codes

### End-to-End Tests

Test complete user workflows from start to finish.

**Covered Workflows:**
- Complete booking flow (search → book → pay → confirm)
- Payment processing (multiple providers)
- Booking cancellation and refunds
- AI chat assistance during booking
- Admin dashboard operations

**Key Test Cases:**
- Happy path scenarios
- Error handling and recovery
- Cross-service communication
- Real-world user scenarios

## Test Configuration

### Environment Variables

Tests use mocked environment variables defined in `setup.ts`:

```typescript
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = ':memory:';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.MYFATOORAH_API_KEY = 'test-myfatoorah-key';
// ... more test variables
```

### Database Mocking

Tests use a comprehensive database mock that simulates SQLite operations:

```typescript
const mockDb = {
  prepare: jest.fn().mockReturnThis(),
  bind: jest.fn().mockReturnThis(),
  first: jest.fn(),
  all: jest.fn(),
  run: jest.fn()
};
```

### External API Mocking

External services (OpenAI, MyFatoorah, PayPal) are mocked using Jest:

```typescript
global.fetch = jest.fn();
jest.mock('openai');
```

## Writing Tests

### Unit Test Example

```typescript
describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService(mockDb);
    jest.clearAllMocks();
  });

  it('should create payment successfully', async () => {
    // Arrange
    const paymentRequest = { ... };
    mockDb.run.mockResolvedValue({ meta: { last_row_id: 1 } });
    
    // Act
    const result = await paymentService.createPayment(paymentRequest);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.paymentId).toBeDefined();
  });
});
```

### Integration Test Example

```typescript
describe('POST /api/bookings', () => {
  it('should create booking successfully', async () => {
    // Mock database responses
    mockEnv.DB.first.mockResolvedValueOnce({ ... });
    
    const response = await request(app)
      .post('/api/bookings')
      .send(validBookingData)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

## Coverage Goals

- **Unit Tests**: >90% coverage for core services
- **Integration Tests**: 100% endpoint coverage
- **E2E Tests**: Critical user paths covered

## Test Data Management

### Fixtures

Common test data is defined in test files:

```typescript
const mockBookingData = {
  property_id: 1,
  check_in_date: '2024-03-15',
  check_out_date: '2024-03-18',
  guests: 2,
  guest_name: 'John Doe',
  guest_email: 'john@example.com',
  guest_phone: '+966501234567'
};
```

### Database State

Each test starts with a clean state:
- Database mocks are reset in `beforeEach`
- No persistent state between tests
- Predictable test outcomes

## Debugging Tests

### Common Issues

1. **Mock not working**: Ensure mocks are set up before imports
2. **Async issues**: Use proper `await` and `resolves/rejects`
3. **Database mocks**: Verify mock return values match expected format

### Debugging Commands

```bash
# Run single test file
npm test -- payment-service.test.ts

# Run with verbose output
npm test -- --verbose

# Debug specific test
npm test -- --testNamePattern="should create payment"
```

## Continuous Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd tests && npm install
      - run: cd tests && npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          directory: tests/coverage
```

### Quality Gates

Tests must pass before:
- Merging pull requests
- Deploying to staging
- Deploying to production

## Performance Testing

### Load Testing

For performance testing, use tools like:
- Artillery.js for API load testing
- Lighthouse for frontend performance
- Custom scripts for booking flow performance

### Example Artillery Config

```yaml
config:
  target: 'https://api.habibistay.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Booking flow"
    flow:
      - get:
          url: "/api/properties"
      - post:
          url: "/api/bookings"
          json:
            property_id: 1
            # ... booking data
```

## Security Testing

### Authentication Tests

All endpoints test:
- Unauthenticated access (should return 401)
- Invalid tokens (should return 401)  
- Insufficient permissions (should return 403)
- Valid access (should return expected data)

### Input Validation Tests

Test malicious inputs:
- SQL injection attempts
- XSS payloads
- Invalid data types
- Boundary value testing

## Monitoring & Alerts

### Test Metrics

Track:
- Test execution time
- Coverage percentage
- Flaky test detection
- Failure rates

### Alerts

Set up alerts for:
- Test suite failures in CI
- Coverage drops below threshold
- Performance regression detection

## Best Practices

1. **Test Naming**: Use descriptive test names that explain the scenario
2. **AAA Pattern**: Arrange, Act, Assert structure
3. **Single Responsibility**: One assertion per test when possible
4. **Mock External Dependencies**: Never hit real external services
5. **Test Data**: Use realistic but anonymized data
6. **Cleanup**: Reset state between tests
7. **Documentation**: Comment complex test scenarios

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)