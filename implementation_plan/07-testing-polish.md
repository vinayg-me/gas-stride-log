# Phase 7: Testing & Polish

## Business Context

Establish comprehensive testing infrastructure, implement final polish features, optimize performance, ensure accessibility compliance, and prepare the application for production deployment. This phase focuses on quality assurance, user experience refinement, and production readiness.

## Current State

- ✅ Basic ESLint configuration
- ✅ Storybook setup with component stories
- ✅ TanStack Query for data management
- ✅ TypeScript for type safety
- ❌ No unit testing setup
- ❌ No integration testing with MSW
- ❌ No E2E testing with Playwright
- ❌ No accessibility testing
- ❌ No performance optimization
- ❌ No error boundaries
- ❌ No monitoring/analytics

## Implementation Tasks

### 1. Testing Infrastructure Setup

#### 1.1 Vitest Configuration
**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.stories.tsx',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### 1.2 Test Setup File
**File**: `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
  },
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();
```

#### 1.3 Test Utilities
**File**: `src/test/utils.tsx`

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/auth-context';
import { ReactElement, ReactNode } from 'react';

// Create a custom render function that includes providers
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllTheProvidersProps {
  children: ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock data factories
export const createMockCar = (overrides = {}) => ({
  id: 'test-car-1',
  owner_id: 'test-user-1',
  registration: 'KA-01-AB-1234',
  make: 'Honda',
  model: 'City',
  fuel_type: 'petrol' as const,
  year: 2020,
  tank_capacity_l: 40,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockFuelLog = (overrides = {}) => ({
  id: 'test-log-1',
  car_id: 'test-car-1',
  filled_at: '2024-01-15',
  odometer_km: 45230,
  liters: 40,
  price_per_l: 105.50,
  total_cost: 4220,
  is_partial: false,
  station: 'Indian Oil Petrol Pump',
  notes: 'Full tank',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});
```

### 2. Mock Service Worker Setup

#### 2.1 MSW Configuration
**File**: `src/test/mocks/handlers.ts`

```typescript
import { rest } from 'msw';
import { createMockCar, createMockFuelLog } from '../utils';

const BASE_URL = 'https://bkfzqrzshlmjxwgdnkak.supabase.co/rest/v1';

export const handlers = [
  // Cars endpoints
  rest.get(`${BASE_URL}/cars`, (req, res, ctx) => {
    return res(
      ctx.json([
        createMockCar({ id: '1' }),
        createMockCar({ id: '2', registration: 'KA-05-CD-5678', make: 'Maruti', model: 'Swift' }),
      ])
    );
  }),

  rest.post(`${BASE_URL}/cars`, (req, res, ctx) => {
    const newCar = createMockCar({ id: 'new-car-id' });
    return res(ctx.json(newCar));
  }),

  rest.patch(`${BASE_URL}/cars`, (req, res, ctx) => {
    const updatedCar = createMockCar({ updated_at: new Date().toISOString() });
    return res(ctx.json(updatedCar));
  }),

  rest.delete(`${BASE_URL}/cars`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // Fuel logs endpoints
  rest.get(`${BASE_URL}/fuel_logs`, (req, res, ctx) => {
    const carId = req.url.searchParams.get('car_id');
    const logs = [
      createMockFuelLog({ id: '1', car_id: carId || 'test-car-1' }),
      createMockFuelLog({ 
        id: '2', 
        car_id: carId || 'test-car-1',
        filled_at: '2024-01-10',
        is_partial: true,
        liters: 25,
        total_cost: 2620,
      }),
    ];
    
    return res(ctx.json(logs));
  }),

  rest.post(`${BASE_URL}/fuel_logs`, (req, res, ctx) => {
    const newLog = createMockFuelLog({ id: 'new-log-id' });
    return res(ctx.json(newLog));
  }),

  rest.patch(`${BASE_URL}/fuel_logs`, (req, res, ctx) => {
    const updatedLog = createMockFuelLog({ updated_at: new Date().toISOString() });
    return res(ctx.json(updatedLog));
  }),

  rest.delete(`${BASE_URL}/fuel_logs`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // Auth endpoints
  rest.post(`${BASE_URL}/auth/v1/token`, (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'test-user-1',
          email: 'test@example.com',
        },
      })
    );
  }),

  rest.get(`${BASE_URL}/auth/v1/user`, (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          id: 'test-user-1',
          email: 'test@example.com',
        },
      })
    );
  }),

  // Storage endpoints
  rest.post(`${BASE_URL}/storage/v1/object/receipts/*`, (req, res, ctx) => {
    return res(
      ctx.json({
        path: 'test-user-1/receipt-123.jpg',
      })
    );
  }),

  // Error scenarios
  rest.get(`${BASE_URL}/cars`, (req, res, ctx) => {
    const shouldError = req.url.searchParams.get('error');
    if (shouldError) {
      return res(ctx.status(500), ctx.json({ message: 'Internal server error' }));
    }
    return res(ctx.json([]));
  }),
];
```

#### 2.2 MSW Server Setup
**File**: `src/test/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// Setup MSW for all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 3. Playwright E2E Testing Setup

#### 3.1 Playwright Configuration
**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### 3.2 E2E Test Examples
**File**: `e2e/fuel-tracking-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Fuel Tracking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full fuel tracking journey', async ({ page }) => {
    // Mock authentication
    await page.route('**/auth/v1/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'test-user', email: 'test@example.com' },
          access_token: 'mock-token',
        }),
      });
    });

    // Mock API responses
    await page.route('**/rest/v1/cars*', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-car-id',
            registration: 'KA-01-AB-1234',
            make: 'Honda',
            model: 'City',
          }),
        });
      }
    });

    // Step 1: Add a car
    await page.click('text=Add Car');
    await page.fill('[placeholder="KA-01-AB-1234"]', 'KA-01-AB-1234');
    await page.fill('[placeholder="Honda"]', 'Honda');
    await page.fill('[placeholder="City"]', 'City');
    await page.fill('[placeholder="2020"]', '2020');
    await page.click('text=Add Car');

    // Verify car was added
    await expect(page.locator('text=Honda City')).toBeVisible();

    // Step 2: Add fuel log
    await page.click('text=Add Fuel Log');
    await page.fill('[placeholder="45230"]', '45230');
    await page.fill('[placeholder="35.50"]', '40');
    await page.fill('[placeholder="105.50"]', '105.50');
    await page.fill('[placeholder="Indian Oil"]', 'Indian Oil Petrol Pump');
    await page.click('text=Save Log');

    // Verify fuel log was added
    await expect(page.locator('text=40L')).toBeVisible();
    await expect(page.locator('text=₹4,220')).toBeVisible();

    // Step 3: Check analytics
    await page.click('text=View Analytics');
    await expect(page.locator('text=Mileage Trends')).toBeVisible();
    await expect(page.locator('text=Monthly Spending')).toBeVisible();
  });

  test('should work offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);

    await page.goto('/');

    // Should show offline indicator
    await expect(page.locator('text=Offline')).toBeVisible();

    // Should still be able to add cars offline
    await page.click('text=Add Car');
    await page.fill('[placeholder="KA-01-AB-1234"]', 'KA-02-CD-5678');
    await page.fill('[placeholder="Honda"]', 'Maruti');
    await page.fill('[placeholder="City"]', 'Swift');
    await page.click('text=Add Car');

    // Should show pending sync status
    await expect(page.locator('text=Pending')).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Should sync automatically
    await expect(page.locator('text=Synced')).toBeVisible({ timeout: 10000 });
  });

  test('should be accessible', async ({ page }) => {
    // Run accessibility tests
    await page.goto('/');

    // Check for proper headings
    await expect(page.locator('h1')).toHaveText(/Smart Fuel Tracking/);

    // Check for proper form labels
    await page.click('text=Add Car');
    await expect(page.locator('label[for="make"]')).toBeVisible();
    await expect(page.locator('label[for="model"]')).toBeVisible();

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Check ARIA attributes
    await expect(page.locator('[role="button"]')).toHaveCount({ min: 1 });
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Mock error responses
    await page.route('**/rest/v1/cars*', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' }),
      });
    });

    await page.goto('/');

    // Should show error message
    await expect(page.locator('text=Failed to load')).toBeVisible();

    // Should provide retry option
    await expect(page.locator('text=Try again')).toBeVisible();
  });
});

test.describe('PWA Features', () => {
  test('should be installable', async ({ page }) => {
    await page.goto('/');

    // Check for PWA manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    // Check for service worker registration
    const swRegistration = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistration).toBe(true);
  });

  test('should cache resources', async ({ page }) => {
    await page.goto('/');

    // Check that resources are cached
    const cacheNames = await page.evaluate(async () => {
      return await caches.keys();
    });

    expect(cacheNames.length).toBeGreaterThan(0);
  });
});
```

### 4. Error Boundaries and Monitoring

#### 4.1 Error Boundary Component
**File**: `src/components/error-boundary.tsx`

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to monitoring service
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, or other monitoring service
      try {
        // window.Sentry?.captureException(error, {
        //   contexts: { react: { componentStack: errorInfo.componentStack } }
        // });
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError);
      }
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
              <CardDescription>
                An unexpected error occurred. We apologize for the inconvenience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium text-destructive mb-2">
                    Error Details (Development Only):
                  </p>
                  <pre className="text-xs text-muted-foreground overflow-auto">
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
                <Button variant="ghost" onClick={this.handleReload} className="w-full">
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 5. Performance Optimization

#### 5.1 Performance Monitoring Hook
**File**: `src/hooks/use-performance.ts`

```typescript
import { useEffect, useRef } from 'react';

export function usePerformanceMonitor(name: string) {
  const startTimeRef = useRef<number>();

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      if (startTimeRef.current) {
        const duration = performance.now() - startTimeRef.current;
        
        // Log performance metrics
        if (process.env.NODE_ENV === 'development') {
          console.log(`${name} rendered in ${duration.toFixed(2)}ms`);
        }

        // Send to analytics in production
        if (process.env.NODE_ENV === 'production') {
          // Example: Send to Google Analytics, Mixpanel, etc.
          // gtag('event', 'timing_complete', {
          //   name: name,
          //   value: Math.round(duration)
          // });
        }
      }
    };
  }, [name]);
}

export function usePageLoadTime() {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
          
          console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
          
          // Send to analytics
          if (process.env.NODE_ENV === 'production') {
            // gtag('event', 'page_load_time', {
            //   value: Math.round(loadTime)
            // });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, []);
}
```

#### 5.2 Bundle Analyzer Script
**File**: `scripts/analyze-bundle.js`

```javascript
import { build } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

async function analyzeBundles() {
  await build({
    plugins: [
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            charts: ['recharts'],
            utils: ['date-fns', 'clsx', 'tailwind-merge'],
          },
        },
      },
    },
  });
}

analyzeBundles().catch(console.error);
```

### 6. Accessibility Implementation

#### 6.1 Accessibility Testing Utilities
**File**: `src/test/accessibility.ts`

```typescript
import { configureAxe } from 'jest-axe';

export const axe = configureAxe({
  rules: {
    // Disable color-contrast rule for now (can be enabled when design is finalized)
    'color-contrast': { enabled: false },
    
    // Custom rules for our application
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },
  },
});

export async function checkA11y(container: HTMLElement) {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

// Custom accessibility matchers
export const a11yMatchers = {
  toBeAccessible: async (received: HTMLElement) => {
    const results = await axe(received);
    const pass = results.violations.length === 0;
    
    if (pass) {
      return {
        message: () => `Expected element to have accessibility violations, but none were found`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected element to be accessible, but found ${results.violations.length} violations:\n${
          results.violations.map(v => `- ${v.description}`).join('\n')
        }`,
        pass: false,
      };
    }
  },
};
```

#### 6.2 Accessibility Hook
**File**: `src/hooks/use-accessibility.ts`

```typescript
import { useEffect, useRef } from 'react';

export function useAnnouncement() {
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create screen reader announcement area
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    document.body.appendChild(announcement);
    
    announcementRef.current = announcement;

    return () => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    };
  }, []);

  const announce = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
    }
  };

  return announce;
}

export function useFocusManagement() {
  const focusableElementsSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(focusableElementsSelector);
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  };

  return { trapFocus };
}

export function useSkipToContent() {
  useEffect(() => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md';
    
    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);
}
```

### 7. Production Deployment Setup

#### 7.1 GitHub Actions Workflow
**File**: `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
        
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 9.0.0
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Run linting
      run: pnpm lint
      
    - name: Run type checking
      run: pnpm tsc --noEmit
      
    - name: Run unit tests
      run: pnpm test:coverage
      
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        
    - name: Build application
      run: pnpm build
      
    - name: Run E2E tests
      run: pnpm test:e2e
      
  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
        
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 9.0.0
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Build for production
      run: pnpm build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2
      with:
        publish-dir: './dist'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: 'Deploy from GitHub Actions'
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

#### 7.2 Environment Configuration
**File**: `.env.example`

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
VITE_VAHAN_API_ENABLED=false
VITE_OCR_ENABLED=true
VITE_ANALYTICS_ENABLED=true

# Analytics (Optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_MIXPANEL_TOKEN=your-mixpanel-token

# Monitoring (Optional)
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_LOGROCKET_APP_ID=your-logrocket-id

# PWA Configuration
VITE_PWA_CACHE_VERSION=v1.0.0
```

### 8. Package.json Scripts Update

#### 8.1 Updated Scripts
**File**: `package.json` (scripts section)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:analyze": "node scripts/analyze-bundle.js",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "chromatic": "chromatic --project-token=your-chromatic-token",
    "prepare": "husky install"
  }
}
```

## Testing Implementation

### Comprehensive Test Suite

#### 8.1 Critical Path Tests
**File**: `src/test/critical-paths.test.tsx`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from './utils';
import userEvent from '@testing-library/user-event';
import { server } from './mocks/server';
import App from '../App';

describe('Critical User Paths', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('should complete the new user onboarding flow', async () => {
    const user = userEvent.setup();
    
    render(<App />);

    // Should show empty state for new users
    await expect(screen.findByText(/no cars available/i)).resolves.toBeInTheDocument();

    // Add first car
    await user.click(screen.getByText(/add car/i));
    await user.type(screen.getByLabelText(/registration/i), 'KA-01-AB-1234');
    await user.type(screen.getByLabelText(/make/i), 'Honda');
    await user.type(screen.getByLabelText(/model/i), 'City');
    await user.click(screen.getByRole('button', { name: /add car/i }));

    // Should show success message
    await expect(screen.findByText(/car added successfully/i)).resolves.toBeInTheDocument();

    // Add first fuel log
    await user.click(screen.getByText(/add fuel log/i));
    await user.type(screen.getByLabelText(/odometer/i), '45230');
    await user.type(screen.getByLabelText(/fuel amount/i), '40');
    await user.type(screen.getByLabelText(/price per liter/i), '105.50');
    await user.click(screen.getByRole('button', { name: /save log/i }));

    // Should show fuel log success
    await expect(screen.findByText(/fuel log added successfully/i)).resolves.toBeInTheDocument();

    // Should update dashboard stats
    await expect(screen.findByText(/40l/i)).resolves.toBeInTheDocument();
  });

  it('should handle offline mode gracefully', async () => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    
    render(<App />);

    // Should show offline indicator
    await expect(screen.findByText(/offline/i)).resolves.toBeInTheDocument();

    // Should still allow data entry
    const user = userEvent.setup();
    await user.click(screen.getByText(/add car/i));
    
    // Form should still be functional
    expect(screen.getByLabelText(/registration/i)).toBeInTheDocument();
  });

  it('should maintain data consistency across operations', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Add car
    await user.click(screen.getByText(/add car/i));
    await user.type(screen.getByLabelText(/registration/i), 'KA-01-AB-1234');
    await user.type(screen.getByLabelText(/make/i), 'Honda');
    await user.type(screen.getByLabelText(/model/i), 'City');
    await user.click(screen.getByRole('button', { name: /add car/i }));

    // Verify car appears in list
    await expect(screen.findByText(/honda city/i)).resolves.toBeInTheDocument();

    // Edit car
    await user.click(screen.getByLabelText(/more options/i));
    await user.click(screen.getByText(/edit car/i));
    await user.clear(screen.getByDisplayValue(/city/i));
    await user.type(screen.getByDisplayValue(/city/i), 'Civic');
    await user.click(screen.getByRole('button', { name: /update car/i }));

    // Verify update is reflected
    await expect(screen.findByText(/honda civic/i)).resolves.toBeInTheDocument();
    expect(screen.queryByText(/honda city/i)).not.toBeInTheDocument();
  });
});
```

## How to Test

### Manual Testing Checklist

#### Core Functionality
- [ ] All CRUD operations work correctly
- [ ] Data persists across sessions
- [ ] Offline mode functions properly
- [ ] Sync works when coming back online
- [ ] Error states display appropriately
- [ ] Loading states show during operations
- [ ] Form validation works correctly
- [ ] Responsive design works on all devices

#### Performance
- [ ] Initial page load < 3 seconds
- [ ] Subsequent navigation < 1 second
- [ ] Large data sets load efficiently
- [ ] Images load and display properly
- [ ] Bundle size is optimized
- [ ] Lighthouse score > 90 for all metrics

#### Accessibility
- [ ] Keyboard navigation works throughout app
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] Alt text for all images
- [ ] Proper heading hierarchy
- [ ] Form labels are associated correctly

#### Browser Compatibility
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

#### PWA Features
- [ ] App installs correctly
- [ ] Works offline after installation
- [ ] Service worker updates properly
- [ ] Caching strategies work as expected
- [ ] Background sync functions
- [ ] Push notifications (if implemented)

### Automated Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run accessibility tests
npm run test:a11y

# Run performance tests
npm run test:performance

# Run visual regression tests
npm run chromatic
```

## Definition of Done

- [ ] **Test Coverage**: >90% unit test coverage, >80% integration coverage
- [ ] **E2E Tests**: All critical user paths covered with Playwright
- [ ] **Accessibility**: WCAG 2.1 AA compliance verified
- [ ] **Performance**: Lighthouse score >90 for all metrics
- [ ] **Error Handling**: All error scenarios handled gracefully
- [ ] **Browser Support**: Works in all target browsers
- [ ] **PWA Features**: All PWA requirements met
- [ ] **Security**: Security best practices implemented
- [ ] **Monitoring**: Error tracking and performance monitoring setup
- [ ] **Documentation**: Complete testing and deployment documentation
- [ ] **CI/CD**: Automated pipeline with quality gates
- [ ] **Production Ready**: Successfully deployed and monitored

## Notes

- **Testing Strategy**: Pyramid approach with more unit tests, fewer E2E tests
- **Performance**: Focus on Core Web Vitals and user experience metrics  
- **Accessibility**: Automated testing combined with manual verification
- **Monitoring**: Production monitoring helps catch issues early
- **Documentation**: Keep testing documentation updated with new features
- **Continuous Improvement**: Regular performance and security audits
