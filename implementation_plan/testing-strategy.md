# Testing Strategy for FuelTrackr

## Overview

This document outlines the comprehensive testing strategy for FuelTrackr, covering unit tests, integration tests, end-to-end tests, accessibility testing, and performance testing. The strategy follows the testing pyramid approach with a focus on reliability, maintainability, and comprehensive coverage.

## Testing Pyramid

```
                    /\
                   /  \
                  / E2E \
                 /Tests \
                /________\
               /          \
              / Integration \
             /    Tests     \
            /________________\
           /                  \
          /    Unit Tests      \
         /____________________\
```

### Distribution
- **70% Unit Tests**: Fast, isolated, comprehensive coverage
- **20% Integration Tests**: API integration, component interaction
- **10% E2E Tests**: Critical user journeys, cross-browser testing

## Testing Tools & Technologies

### Unit Testing
- **Vitest**: Fast unit test runner with native TypeScript support
- **React Testing Library**: Component testing with user-centric approach
- **Jest DOM**: Custom matchers for DOM testing
- **MSW (Mock Service Worker)**: API mocking for integration tests

### E2E Testing
- **Playwright**: Cross-browser end-to-end testing
- **Multiple Browsers**: Chrome, Firefox, Safari, Mobile browsers
- **Visual Regression**: Screenshot comparison testing

### Accessibility Testing
- **jest-axe**: Automated accessibility rule checking
- **Manual Testing**: Screen reader and keyboard navigation testing
- **WCAG 2.1 AA Compliance**: Color contrast, focus management, ARIA

### Performance Testing
- **Lighthouse CI**: Automated performance auditing
- **Web Vitals**: Core Web Vitals monitoring
- **Bundle Analysis**: Size and optimization tracking

## Test Categories

### 1. Unit Tests

#### Component Tests
```typescript
// Example: CarCard component test
describe('CarCard', () => {
  it('should display car information correctly', () => {
    const mockCar = createMockCar();
    render(<CarCard car={mockCar} />);
    
    expect(screen.getByText(`${mockCar.make} ${mockCar.model}`)).toBeInTheDocument();
    expect(screen.getByText(mockCar.registration)).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const mockCar = createMockCar();
    
    render(<CarCard car={mockCar} onViewDetails={handleClick} />);
    
    await user.click(screen.getByText('View Details'));
    expect(handleClick).toHaveBeenCalledWith(mockCar.id);
  });
});
```

#### Service Tests
```typescript
// Example: Mileage calculation test
describe('FuelLogService', () => {
  describe('calculateMileageForCar', () => {
    it('should calculate mileage correctly for full-to-full fills', async () => {
      const mockLogs = [/* mock data */];
      vi.mocked(FuelLogService.getFuelLogs).mockResolvedValue(mockLogs);
      
      const result = await FuelLogService.calculateMileageForCar('car-1');
      
      expect(result.averageMileage).toBeCloseTo(15.48, 2);
    });
  });
});
```

#### Hook Tests
```typescript
// Example: Custom hook test
describe('useCars', () => {
  it('should fetch cars data', async () => {
    const mockCars = [createMockCar()];
    vi.mocked(CarService.getCars).mockResolvedValue(mockCars);
    
    const { result } = renderHook(() => useCars());
    
    await waitFor(() => {
      expect(result.current.data).toEqual(mockCars);
    });
  });
});
```

### 2. Integration Tests

#### API Integration
```typescript
// Example: Car management integration test
describe('Car Management Integration', () => {
  it('should create and display new car', async () => {
    // Mock API responses
    server.use(
      rest.post('*/cars', (req, res, ctx) => {
        return res(ctx.json(createMockCar()));
      })
    );

    render(<Dashboard />);
    
    // Create car
    await user.click(screen.getByText('Add Car'));
    await user.type(screen.getByLabelText(/registration/i), 'KA-01-AB-1234');
    await user.click(screen.getByRole('button', { name: /add car/i }));
    
    // Verify car appears
    await expect(screen.findByText('KA-01-AB-1234')).resolves.toBeInTheDocument();
  });
});
```

#### State Management Integration
```typescript
// Example: Store integration test
describe('Store Integration', () => {
  it('should sync state across components', async () => {
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <CarList />
        <CarForm />
      </QueryClientProvider>
    );

    // Add car through form
    await user.click(screen.getByText('Add Car'));
    // ... fill form and submit

    // Verify list updates
    await expect(screen.findByText('New Car')).resolves.toBeInTheDocument();
  });
});
```

### 3. E2E Tests

#### Critical User Journeys
```typescript
// Example: Complete fuel tracking flow
test('should complete fuel tracking journey', async ({ page }) => {
  await page.goto('/');
  
  // Add car
  await page.click('text=Add Car');
  await page.fill('[placeholder="KA-01-AB-1234"]', 'KA-01-AB-1234');
  await page.click('text=Add Car');
  
  // Add fuel log
  await page.click('text=Add Fuel Log');
  await page.fill('[placeholder="45230"]', '45230');
  await page.click('text=Save Log');
  
  // Verify analytics
  await page.click('text=View Analytics');
  await expect(page.locator('text=Mileage Trends')).toBeVisible();
});
```

#### Cross-Browser Testing
```typescript
// Playwright config for multiple browsers
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});
```

#### Offline Testing
```typescript
test('should work offline', async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto('/');
  
  // Should show offline indicator
  await expect(page.locator('text=Offline')).toBeVisible();
  
  // Should allow offline operations
  await page.click('text=Add Car');
  // ... test offline functionality
});
```

### 4. Accessibility Tests

#### Automated A11y Testing
```typescript
describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', async () => {
    render(<CarForm />);
    
    // Test tab navigation
    await user.tab();
    expect(screen.getByLabelText(/registration/i)).toHaveFocus();
    
    await user.tab();
    expect(screen.getByLabelText(/make/i)).toHaveFocus();
  });
});
```

#### Manual A11y Testing Checklist
- [ ] Screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] Keyboard-only navigation
- [ ] High contrast mode support
- [ ] Color blindness testing
- [ ] Focus management in modals
- [ ] ARIA labels and descriptions
- [ ] Semantic HTML structure

### 5. Performance Tests

#### Lighthouse CI Testing
```typescript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.9 }],
      },
    },
  },
};
```

#### Bundle Size Testing
```typescript
// Example: Bundle size test
describe('Bundle Size', () => {
  it('should not exceed size limits', () => {
    const stats = require('../dist/stats.json');
    const mainBundle = stats.assets.find(asset => asset.name.includes('index'));
    
    expect(mainBundle.size).toBeLessThan(500 * 1024); // 500KB limit
  });
});
```

## Test Data Management

### Mock Data Factories
```typescript
// src/test/factories.ts
export const createMockCar = (overrides = {}) => ({
  id: faker.datatype.uuid(),
  registration: faker.vehicle.vrm(),
  make: faker.vehicle.manufacturer(),
  model: faker.vehicle.model(),
  fuel_type: 'petrol',
  ...overrides,
});

export const createMockFuelLog = (overrides = {}) => ({
  id: faker.datatype.uuid(),
  car_id: faker.datatype.uuid(),
  filled_at: faker.date.recent().toISOString().split('T')[0],
  odometer_km: faker.datatype.number({ min: 10000, max: 100000 }),
  liters: faker.datatype.float({ min: 20, max: 60, precision: 0.1 }),
  ...overrides,
});
```

### Test Database Setup
```typescript
// src/test/database.ts
export async function setupTestDatabase() {
  // Create test tables
  await db.cars.clear();
  await db.fuelLogs.clear();
  
  // Seed with test data
  const testCar = createMockCar();
  await db.cars.add(testCar);
  
  const testLogs = Array.from({ length: 5 }, () => 
    createMockFuelLog({ car_id: testCar.id })
  );
  await db.fuelLogs.bulkAdd(testLogs);
}
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run linting
        run: pnpm lint
      
      - name: Run type checking
        run: pnpm type-check
      
      - name: Run unit tests
        run: pnpm test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Run Lighthouse CI
        run: pnpm lighthouse:ci
```

## Test Coverage Requirements

### Minimum Coverage Thresholds
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Critical Components (90%+ Coverage)
- Authentication components
- Data services (Car, FuelLog, Analytics)
- Form components with validation
- Mileage calculation logic
- Offline sync functionality

### Exclusions from Coverage
- Storybook stories (*.stories.tsx)
- Test files (*.test.tsx, *.spec.tsx)
- Type definitions (*.d.ts)
- Configuration files
- Third-party library wrappers

## Quality Gates

### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:unit"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

### Pull Request Requirements
- [ ] All tests pass
- [ ] Code coverage meets thresholds
- [ ] No linting errors
- [ ] TypeScript compilation successful
- [ ] E2E tests pass for critical paths
- [ ] Accessibility tests pass
- [ ] Performance regression check

## Testing Best Practices

### Unit Tests
1. **Test Behavior, Not Implementation**: Focus on what the component does, not how
2. **Use Descriptive Test Names**: Clear, specific test descriptions
3. **Arrange, Act, Assert**: Structure tests clearly
4. **Mock External Dependencies**: Isolate units under test
5. **Test Edge Cases**: Include error conditions and boundary values

### Integration Tests
1. **Test Real Interactions**: Use actual API calls with MSW
2. **Test Data Flow**: Verify data moves correctly between layers
3. **Test Error Scenarios**: Network failures, validation errors
4. **Test State Synchronization**: Ensure UI reflects data changes

### E2E Tests
1. **Focus on User Journeys**: Test complete workflows
2. **Use Page Object Model**: Organize selectors and actions
3. **Handle Async Operations**: Use proper waiting strategies
4. **Test Across Browsers**: Ensure cross-browser compatibility
5. **Keep Tests Independent**: Each test should be able to run in isolation

### Performance Testing
1. **Set Realistic Budgets**: Based on target user experience
2. **Test on Various Networks**: 3G, 4G, WiFi conditions
3. **Monitor Over Time**: Track performance regression
4. **Test with Real Data**: Use production-like data volumes

## Debugging and Troubleshooting

### Common Issues
1. **Flaky Tests**: Use proper waiting, avoid hardcoded delays
2. **Test Isolation**: Ensure tests don't affect each other
3. **Mock Leakage**: Reset mocks between tests
4. **Async Race Conditions**: Use proper async/await patterns

### Debugging Tools
- **Vitest UI**: Visual test runner interface
- **Playwright Inspector**: Step-through E2E test debugging
- **React DevTools**: Component state inspection
- **MSW DevTools**: API request/response inspection

## Reporting and Metrics

### Test Reports
- **Coverage Reports**: HTML and LCOV formats
- **Test Results**: JUnit XML for CI integration
- **Performance Reports**: Lighthouse CI reports
- **Accessibility Reports**: axe-core violation reports

### Key Metrics
- Test execution time
- Code coverage percentage
- Test failure rate
- Performance scores
- Accessibility violation count

## Future Enhancements

### Planned Improvements
1. **Visual Regression Testing**: Chromatic integration
2. **Contract Testing**: API contract verification
3. **Load Testing**: Performance under load
4. **Security Testing**: OWASP compliance checks
5. **Mobile Testing**: Device-specific testing

### Tool Upgrades
- Regular dependency updates
- New testing tool evaluation
- Performance optimization
- Enhanced reporting capabilities

---

This testing strategy ensures comprehensive coverage of FuelTrackr while maintaining development velocity and code quality. Regular reviews and updates to this strategy will keep it aligned with project needs and industry best practices.
