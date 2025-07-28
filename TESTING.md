# 🧪 Military Tees UK - Testing Guide

This guide provides comprehensive information about testing the Military Tees UK e-commerce platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Types](#test-types)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Our testing strategy ensures the Military Tees UK platform is reliable, secure, and performant. We use multiple testing layers:

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Ensure optimal site performance
- **Security Tests**: Validate security measures

### Tech Stack

- **Testing Framework**: Vitest (Jest-compatible)
- **React Testing**: React Testing Library
- **E2E Testing**: Playwright
- **Coverage**: c8 (via Vitest)
- **Mocking**: Jest mocks + MSW for API mocking

## 🔬 Test Types

### 1. Unit Tests

Test individual components, functions, and utilities in isolation.

**Location**: `src/**/*.test.{ts,tsx}`

**Examples**:
- Component rendering and props
- Utility function logic
- Custom hook behavior
- Form validation

### 2. Integration Tests

Test how different parts work together.

**Location**: `src/app/api/**/*.test.ts`, `src/lib/**/*.test.ts`

**Examples**:
- API endpoint functionality
- Database operations
- Authentication flows
- External service integration

### 3. End-to-End Tests

Test complete user journeys from start to finish.

**Location**: `tests/e2e/*.spec.ts`

**Examples**:
- Complete purchase flow
- User registration and login
- Custom order submission
- Admin dashboard workflows

### 4. User Journey Tests

Test complex multi-step user workflows.

**Location**: `tests/journeys/*.spec.ts`

**Examples**:
- Customer lifecycle (registration → purchase → support)
- Custom order process (inquiry → quote → production)
- Admin management workflows

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Test Environment

Create `.env.test.local`:

```env
NODE_ENV=test
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Test Database

```bash
# Create test database schema
npm run db:test:setup

# Seed with test data
npm run db:test:seed
```

### 4. Install Playwright Browsers

```bash
npx playwright install
```

## 🚀 Running Tests

### Quick Commands

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run all tests (unit + E2E)
npm run test:all
```

### Advanced Test Runner

Use our custom test runner for more control:

```bash
# Show available options
npm run test:runner help

# Run specific test types
npm run test:runner unit
npm run test:runner component
npm run test:runner api
npm run test:runner e2e
npm run test:runner journey

# Run in CI mode
npm run test:runner ci

# Run all tests
npm run test:runner all
```

### Test by Category

```bash
# Component tests only
npm run test src/components

# API tests only
npm run test src/app/api

# Hook tests only
npm run test src/hooks

# Database tests only
npm run test src/lib/__tests__/database.test.ts
```

### E2E Test Options

```bash
# Run in headed mode (visible browser)
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e tests/e2e/homepage.spec.ts

# Run tests in specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# Run tests on mobile
npm run test:e2e -- --project="Mobile Chrome"
```

## ✍️ Writing Tests

### Unit Test Example

```typescript
// src/components/__tests__/ProductCard.test.tsx
import { render, screen, fireEvent } from '@/test/utils'
import { ProductCard } from '@/components/products/ProductCard'
import { mockProducts } from '@/test/utils'

describe('ProductCard', () => {
  const mockProduct = mockProducts[0]

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
    expect(screen.getByText(`£${mockProduct.price}`)).toBeInTheDocument()
  })

  it('handles add to cart click', () => {
    const onAddToCart = jest.fn()
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />)
    
    fireEvent.click(screen.getByText('Add to Cart'))
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct)
  })
})
```

### API Test Example

```typescript
// src/app/api/__tests__/products.test.ts
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/products/route'
import { mockSupabaseClient } from '@/test/utils'

describe('/api/products', () => {
  it('returns products successfully', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({
        data: mockProducts,
        error: null
      })
    })

    const request = new NextRequest('http://localhost:3000/api/products')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.products).toEqual(mockProducts)
  })
})
```

### E2E Test Example

```typescript
// tests/e2e/shopping-flow.spec.ts
import { test, expect } from '@playwright/test'

test('can complete purchase flow', async ({ page }) => {
  // Navigate to products
  await page.goto('/products')
  
  // Add product to cart
  await page.locator('[data-testid="product-card"]').first()
    .getByRole('button', { name: /add to cart/i }).click()
  
  // Open cart
  await page.getByLabelText(/cart/i).click()
  
  // Proceed to checkout
  await page.getByRole('button', { name: /checkout/i }).click()
  
  // Verify checkout page
  await expect(page).toHaveURL(/\/checkout/)
})
```

### Test Utilities

We provide comprehensive test utilities in `src/test/utils.tsx`:

```typescript
import { 
  render,                    // Custom render with providers
  mockSupabaseClient,        // Mocked Supabase client
  mockProducts,              // Sample product data
  mockUser,                  // Sample user data
  createMockOrder,           // Order factory function
  mockLocalStorage,          // localStorage mock
  mockFetch                  // fetch mock
} from '@/test/utils'
```

## 🔄 CI/CD Integration

### GitHub Actions

Our CI pipeline runs automatically on:
- **Push to main/develop**: Full test suite
- **Pull requests**: Full test suite + security scans
- **Daily**: Health checks and dependency updates
- **Weekly**: Security audits

### Workflow Files

- `.github/workflows/test.yml`: Main testing workflow
- `.github/workflows/deploy.yml`: Deployment with tests
- `.github/workflows/schedule.yml`: Scheduled testing tasks

### Test Stages

1. **Lint & Type Check**: Code quality validation
2. **Unit Tests**: Component and function testing
3. **API Tests**: Backend functionality testing
4. **E2E Tests**: Full user workflow testing
5. **Security Scan**: Vulnerability assessment
6. **Performance Test**: Lighthouse and load testing

## 📊 Coverage Reports

### Generating Coverage

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

### Coverage Targets

- **Overall**: > 80%
- **Functions**: > 85%
- **Lines**: > 80%
- **Branches**: > 75%

### Critical Path Coverage

Ensure 100% coverage for:
- Payment processing
- User authentication
- Order management
- Security functions

## 🎯 Best Practices

### Writing Good Tests

1. **Test Behavior, Not Implementation**
   ```typescript
   // Good: Test what the user sees
   expect(screen.getByText('Product added to cart')).toBeInTheDocument()
   
   // Bad: Test implementation details
   expect(component.state.cartItems).toHaveLength(1)
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('shows error message when email is invalid')
   
   // Bad
   it('validates email')
   ```

3. **Arrange, Act, Assert Pattern**
   ```typescript
   it('calculates total price correctly', () => {
     // Arrange
     const items = [{ price: 10, quantity: 2 }]
     
     // Act
     const total = calculateTotal(items)
     
     // Assert
     expect(total).toBe(20)
   })
   ```

### Test Organization

```
src/
├── components/
│   ├── __tests__/          # Component tests
│   └── products/
│       └── ProductCard.tsx
├── hooks/
│   ├── __tests__/          # Hook tests
│   └── use-cart.ts
└── test/
    ├── utils.tsx           # Test utilities
    └── setup.ts            # Test setup

tests/
├── e2e/                    # E2E tests
├── journeys/               # User journey tests
└── fixtures/               # Test data files
```

### Mocking Guidelines

1. **Mock External Dependencies**
   ```typescript
   jest.mock('@/lib/supabase/client')
   jest.mock('next/navigation')
   ```

2. **Use MSW for API Mocking**
   ```typescript
   import { rest } from 'msw'
   import { setupServer } from 'msw/node'
   
   const server = setupServer(
     rest.get('/api/products', (req, res, ctx) => {
       return res(ctx.json({ products: mockProducts }))
     })
   )
   ```

3. **Mock Minimally**
   - Only mock what you need
   - Prefer real implementations when possible
   - Mock at the boundary (external services)

## 🔧 Troubleshooting

### Common Issues

#### Tests Failing in CI but Passing Locally

```bash
# Run tests in CI mode locally
CI=true npm run test:ci

# Check for environment differences
npm run test:runner ci
```

#### E2E Tests Timing Out

```bash
# Increase timeout in playwright.config.ts
timeout: 60000

# Run with headed mode to debug
npm run test:e2e -- --headed

# Run single test for debugging
npm run test:e2e -- --grep "specific test name"
```

#### Database Connection Issues

```bash
# Reset test database
npm run db:test:reset

# Check database connection
npm run db:test:connection
```

#### Flaky Tests

1. **Add wait conditions**:
   ```typescript
   await page.waitForSelector('[data-testid="product-card"]')
   await expect(page.getByText('Loading...')).not.toBeVisible()
   ```

2. **Use explicit waits**:
   ```typescript
   await page.waitForLoadState('networkidle')
   await page.waitForTimeout(1000) // Last resort
   ```

3. **Mock time-dependent operations**:
   ```typescript
   jest.useFakeTimers()
   jest.setSystemTime(new Date('2024-01-01'))
   ```

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* npm run test

# Run E2E tests with debug
npm run test:e2e -- --debug

# Run specific test with verbose output
npm run test -- --verbose ProductCard.test.tsx
```

### Performance Issues

```bash
# Run only changed tests
npm run test -- --changed

# Run tests in parallel
npm run test -- --maxWorkers=4

# Skip coverage for faster runs
npm run test -- --coverage=false
```

## 📈 Metrics and Monitoring

### Test Metrics to Track

- **Test Count**: Total number of tests
- **Coverage Percentage**: Code covered by tests
- **Test Duration**: Time to run test suite
- **Flaky Test Rate**: Tests that fail intermittently
- **CI Success Rate**: Percentage of successful CI runs

### Monitoring Tools

- **GitHub Actions**: CI/CD monitoring
- **Codecov**: Coverage tracking
- **Playwright Report**: E2E test results
- **Lighthouse CI**: Performance monitoring

## 🔗 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Matchers](https://jestjs.io/docs/expect)

---

## 🎖️ Ready for Battle Testing!

This comprehensive testing setup ensures Military Tees UK operates with military-grade reliability and precision. Every component, API endpoint, and user journey is thoroughly tested and validated.