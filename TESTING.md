# HabibiStay Testing Documentation

## Overview

This document outlines the comprehensive testing strategy for the HabibiStay platform, including unit tests, integration tests, end-to-end tests, and security testing.

## Testing Stack

- **Testing Framework**: Vitest 1.6.0
- **Component Testing**: React Testing Library 14.3.1  
- **User Interactions**: Testing Library User Event 14.5.2
- **DOM Testing**: jsdom 24.1.0
- **Test Assertions**: Jest DOM matchers
- **Coverage**: Vitest Coverage V8

## Test Structure

```
src/test/
├── setup.ts                    # Global test setup and mocks
├── utils.tsx                   # Test utilities and helpers
├── security-utils.test.ts      # Security utilities tests
├── ChatBot.test.tsx           # ChatBot component tests
├── property-search.test.tsx    # Property search tests
├── booking-system.test.tsx     # Booking system tests
├── api-endpoints.test.ts       # Backend API tests
└── e2e-flows.test.tsx         # End-to-end user flows
```

## Test Categories

### 1. Unit Tests

#### Security Utilities (`src/test/security-utils.test.ts`)
- **Input Sanitization**: Tests for XSS prevention, HTML encoding, filename sanitization
- **Password Security**: Password hashing and verification
- **JWT Management**: Token creation, verification, and expiration
- **File Upload Validation**: File type, size, and security checks
- **SQL Injection Prevention**: Input escaping and parameter validation
- **Rate Limiting**: Request throttling and window management
- **CSRF Protection**: Token generation and validation
- **IP Security**: Blocking and suspicious activity tracking
- **Audit Logging**: Event tracking and user activity logs
- **Validation Schemas**: Email, password, phone, name, and price validation

**Coverage**: 95%+ for all security-critical functions

#### Component Tests (`src/test/ChatBot.test.tsx`)
- **Sara AI Integration**: Message processing, OpenAI integration
- **Voice Interface**: Speech recognition and synthesis
- **Button Interface**: Quick actions and property interactions
- **Property Cards**: Featured property display and booking initiation
- **User Interactions**: Message input, voice commands, accessibility
- **Error Handling**: Network failures, API errors, graceful degradation
- **Loading States**: Typing indicators, disabled states
- **Accessibility**: Keyboard navigation, ARIA labels, screen reader support

**Coverage**: 90%+ for UI components

### 2. Integration Tests

#### Property Search (`src/test/property-search.test.tsx`)
- **Search Functionality**: Location, date, guest filtering
- **Advanced Filters**: Price range, amenities, property type
- **Search Results**: Property display, pagination, sorting
- **Filter Interactions**: Multi-select, clear filters, URL state
- **Responsive Design**: Mobile filters, layout adaptations
- **Error Handling**: No results, API failures, validation errors
- **Performance**: Search optimization, debouncing

#### Booking System (`src/test/booking-system.test.tsx`)
- **Booking Modal**: Form validation, date selection, guest details
- **Payment Modal**: Payment methods, form validation, processing
- **Availability Check**: Date conflicts, property availability
- **Price Calculation**: Base price, fees, taxes, discounts
- **Guest vs Authenticated**: Pre-filled data, localStorage handling
- **Error Scenarios**: Validation failures, API errors, payment failures

### 3. API Tests

#### Backend Endpoints (`src/test/api-endpoints.test.ts`)
- **Properties API**: CRUD operations, search filtering, featured properties
- **Bookings API**: Creation, validation, availability checking
- **Chat API**: OpenAI integration, message processing
- **Payments API**: MyFatoorah integration, payment callbacks
- **Admin API**: Dashboard stats, user management, security controls
- **Authentication**: JWT validation, role-based access
- **Rate Limiting**: Request throttling, IP blocking
- **Error Handling**: Database failures, validation errors, graceful degradation
- **Security**: Input sanitization, SQL injection prevention

**Coverage**: 85%+ for API endpoints

### 4. End-to-End Tests

#### Critical User Flows (`src/test/e2e-flows.test.tsx`)

1. **Guest User Booking Flow**:
   - Homepage → Search → Property Details → Booking → Payment
   - Form validation, error handling, success scenarios

2. **Authenticated User Flow**:
   - Personalized homepage → Sara AI chat → Property booking
   - Pre-filled forms, user preferences, booking history

3. **Admin Management Flow**:
   - Dashboard overview → Property management → Security monitoring
   - CRUD operations, status updates, security actions

4. **Host Onboarding Flow**:
   - Multi-step registration → Property setup → Verification
   - Form validation, file uploads, compliance checks

5. **Error Handling**:
   - Network failures, authentication errors, validation failures
   - Graceful degradation, retry mechanisms, user feedback

**Coverage**: 80%+ for critical user paths

## Test Commands

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch

# Run specific test suites
npm run test:security      # Security tests only
npm run test:components    # Component tests only  
npm run test:api          # API tests only
npm run test:e2e          # End-to-end tests only

# Run complete test suite
npm run test:all          # All tests + coverage
```

## Coverage Requirements

### Minimum Coverage Thresholds
- **Global Coverage**: 80% lines, functions, branches, statements
- **Security Utilities**: 95% (critical security functions)
- **API Endpoints**: 85% (backend business logic)
- **UI Components**: 90% (user-facing components)
- **Payment Integration**: 95% (financial transactions)

### Coverage Exclusions
- Node modules
- Build/dist directories
- Configuration files
- Test files themselves
- TypeScript declaration files

## Test Data Management

### Mock Data
All test data is generated using factory functions in `src/test/utils.tsx`:

```typescript
// Property factory
const mockProperty = createMockProperty({
  id: 1,
  title: 'Test Property',
  price_per_night: 250,
  // ... other properties
});

// User factory  
const mockUser = createMockUser({
  role: 'admin',
  email: 'admin@habibistay.com',
  // ... other properties
});
```

### API Mocking
- **Fetch API**: Mocked globally with `mockFetch()` helper
- **External APIs**: OpenAI, MyFatoorah responses mocked
- **Database**: SQLite operations mocked for unit tests
- **Authentication**: JWT tokens and sessions mocked

## Accessibility Testing

### Automated Checks
- **Keyboard Navigation**: Tab order, focus management
- **ARIA Labels**: Proper labeling for screen readers
- **Color Contrast**: Visual accessibility validation
- **Semantic HTML**: Proper use of roles and landmarks

### Manual Testing Checklist
- [ ] Screen reader compatibility (NVDA, JAWS)
- [ ] High contrast mode support
- [ ] Keyboard-only navigation
- [ ] Voice control compatibility
- [ ] Mobile accessibility (touch targets, gestures)

## Performance Testing

### Metrics Tracked
- **Component Render Time**: Under 100ms for critical components
- **API Response Time**: Under 200ms for search operations
- **Bundle Size**: Critical path under 200KB gzipped
- **Memory Usage**: No memory leaks in user interactions

### Performance Tests
```typescript
// Example performance test
it('should render property cards quickly', async () => {
  const renderTime = await measureComponentRenderTime(() => {
    renderWithProviders(<PropertyGrid properties={mockProperties} />);
  });
  
  expect(renderTime).toBeLessThan(100); // 100ms threshold
});
```

## Security Testing

### Automated Security Checks
- **Input Validation**: XSS, SQL injection, CSRF protection
- **Authentication**: JWT validation, session management
- **Authorization**: Role-based access control
- **Rate Limiting**: Request throttling, abuse prevention
- **File Upload**: Type validation, size limits, malware scanning

### Security Test Examples
```typescript
it('should prevent XSS attacks', () => {
  const maliciousInput = '<script>alert("xss")</script>';
  const sanitized = sanitizeHtml(maliciousInput);
  expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
});
```

## Continuous Integration

### Test Pipeline
1. **Code Quality**: ESLint, TypeScript checking
2. **Unit Tests**: Component and utility testing
3. **Integration Tests**: API and flow testing
4. **Security Tests**: Vulnerability scanning
5. **Coverage Reports**: Minimum threshold enforcement
6. **Performance Tests**: Regression detection

### Test Automation
- **Pre-commit Hooks**: Run relevant tests before commits
- **Pull Request Checks**: Full test suite on PR creation
- **Deployment Gates**: All tests must pass before deployment
- **Nightly Runs**: Extended test suite with performance profiling

## Debugging Tests

### Common Issues
1. **Async Operations**: Use `waitFor()` for async assertions
2. **Mock Cleanup**: Ensure mocks are cleared between tests
3. **DOM State**: Check for proper cleanup after each test
4. **Network Requests**: Verify all fetch calls are mocked

### Debugging Tools
```typescript
// Debug test output
screen.debug(); // Print current DOM state
screen.logTestingPlaygroundURL(); // Interactive debugging

// Debug user events
const user = userEvent.setup({ delay: null });
await user.click(button, { debug: true });
```

## Best Practices

### Test Organization
- **Descriptive Names**: Clear test descriptions with expected behavior
- **Arrange-Act-Assert**: Consistent test structure
- **Single Responsibility**: One concept per test
- **Data Independence**: No shared state between tests

### Mock Management
- **Minimal Mocking**: Mock only external dependencies
- **Realistic Data**: Use representative test data
- **Mock Cleanup**: Clear mocks between tests
- **Mock Verification**: Verify mock calls when relevant

### Assertion Guidelines
- **Specific Assertions**: Test specific behaviors, not implementation
- **User-Centric**: Test from user's perspective
- **Error Messages**: Clear failure messages for debugging
- **Edge Cases**: Test boundary conditions and error scenarios

## Maintenance

### Regular Updates
- **Dependency Updates**: Keep testing libraries current
- **Test Refactoring**: Update tests when features change
- **Coverage Monitoring**: Track coverage trends over time
- **Performance Baselines**: Update performance thresholds as needed

### Test Health Monitoring
- **Flaky Test Detection**: Identify and fix unstable tests
- **Test Execution Time**: Monitor and optimize slow tests
- **Coverage Gaps**: Regular review of uncovered code
- **Mock Accuracy**: Ensure mocks stay aligned with real APIs

---

## Quick Start Guide

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Tests**:
   ```bash
   npm run test
   ```

3. **Generate Coverage**:
   ```bash
   npm run test:coverage
   ```

4. **View Coverage Report**:
   ```bash
   open coverage/index.html
   ```

5. **Debug Failing Tests**:
   ```bash
   npm run test:ui
   ```

For detailed test implementation examples, see the individual test files in the `src/test/` directory.