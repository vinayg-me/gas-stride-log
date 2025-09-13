# Phase 1: Database Schema & Authentication

## Business Context

Establish the foundational backend infrastructure with Supabase database schema, Row Level Security (RLS) policies, and user authentication system. This enables user accounts, data persistence, and secure multi-user access to the FuelTrackr application.

## Current State

- ✅ Supabase client configured (`src/integrations/supabase/client.ts`)
- ✅ Basic database types structure (`src/integrations/supabase/types.ts`)
- ❌ No database tables created
- ❌ No authentication implementation
- ❌ No RLS policies
- ❌ No auth UI components

## Implementation Tasks

### 1. Database Schema Setup

#### 1.1 Create Supabase Migration
**File**: `supabase/migrations/20240101000000_initial_schema.sql`

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create users table (extends auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create cars table
create table public.cars (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  registration text not null,
  make text not null,
  model text not null,
  fuel_type text not null check (fuel_type in ('petrol')),
  tank_capacity_l numeric check (tank_capacity_l > 0),
  year integer check (year >= 1900 and year <= extract(year from now()) + 1),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraints
  unique(owner_id, registration)
);

-- Create fuel_logs table
create table public.fuel_logs (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  filled_at date not null,
  odometer_km numeric not null check (odometer_km >= 0),
  liters numeric not null check (liters > 0),
  price_per_l numeric check (price_per_l > 0),
  total_cost numeric check (total_cost > 0),
  is_partial boolean default false not null,
  station text,
  notes text,
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure either price_per_l or total_cost is provided
  constraint cost_presence check (price_per_l is not null or total_cost is not null)
);

-- Create indexes for better performance
create index fuel_logs_car_id_idx on public.fuel_logs(car_id);
create index fuel_logs_filled_at_idx on public.fuel_logs(filled_at desc);
create index cars_owner_id_idx on public.cars(owner_id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger cars_updated_at
  before update on public.cars
  for each row execute function public.handle_updated_at();

create trigger fuel_logs_updated_at
  before update on public.fuel_logs
  for each row execute function public.handle_updated_at();

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.cars enable row level security;
alter table public.fuel_logs enable row level security;

-- RLS Policies for users table
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- RLS Policies for cars table
create policy "Users can view own cars"
  on public.cars for select
  using (auth.uid() = owner_id);

create policy "Users can insert own cars"
  on public.cars for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own cars"
  on public.cars for update
  using (auth.uid() = owner_id);

create policy "Users can delete own cars"
  on public.cars for delete
  using (auth.uid() = owner_id);

-- RLS Policies for fuel_logs table
create policy "Users can view fuel logs for own cars"
  on public.fuel_logs for select
  using (
    exists (
      select 1 from public.cars 
      where cars.id = fuel_logs.car_id 
      and cars.owner_id = auth.uid()
    )
  );

create policy "Users can insert fuel logs for own cars"
  on public.fuel_logs for insert
  with check (
    exists (
      select 1 from public.cars 
      where cars.id = fuel_logs.car_id 
      and cars.owner_id = auth.uid()
    )
  );

create policy "Users can update fuel logs for own cars"
  on public.fuel_logs for update
  using (
    exists (
      select 1 from public.cars 
      where cars.id = fuel_logs.car_id 
      and cars.owner_id = auth.uid()
    )
  );

create policy "Users can delete fuel logs for own cars"
  on public.fuel_logs for delete
  using (
    exists (
      select 1 from public.cars 
      where cars.id = fuel_logs.car_id 
      and cars.owner_id = auth.uid()
    )
  );

-- Create function to automatically create user profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

#### 1.2 Create Storage Bucket for Receipts
**File**: `supabase/migrations/20240101000001_storage_setup.sql`

```sql
-- Create storage bucket for receipt images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- RLS policy for receipt storage
create policy "Users can upload own receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own receipts"
  on storage.objects for select
  using (
    bucket_id = 'receipts' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own receipts"
  on storage.objects for delete
  using (
    bucket_id = 'receipts' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### 1.3 Update Supabase Types
**File**: `src/integrations/supabase/types.ts`

Generate updated types after running migrations:
```bash
npx supabase gen types typescript --project-id bkfzqrzshlmjxwgdnkak > src/integrations/supabase/types.ts
```

### 2. Authentication Implementation

#### 2.1 Auth Context and Hooks
**File**: `src/contexts/auth-context.tsx`

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithGitHub: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  const signInWithGitHub = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        signInWithGoogle,
        signInWithGitHub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### 2.2 Auth Components
**File**: `src/components/auth/auth-form.tsx`

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, Github } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, signInWithGoogle, signInWithGitHub } = useAuth();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AuthFormData, mode: 'signin' | 'signup') => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = mode === 'signin' 
        ? await signIn(data.email, data.password)
        : await signUp(data.email, data.password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = provider === 'google' 
        ? await signInWithGoogle()
        : await signInWithGitHub();

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome to FuelTrackr
          </CardTitle>
          <CardDescription>
            Track your fuel efficiency with style
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={form.handleSubmit((data) => onSubmit(data, 'signin'))} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    {...form.register('email')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    {...form.register('password')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={form.handleSubmit((data) => onSubmit(data, 'signup'))} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    {...form.register('email')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    {...form.register('password')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2.3 Protected Route Component
**File**: `src/components/auth/protected-route.tsx`

```typescript
import { useAuth } from '@/contexts/auth-context';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AuthForm } from './auth-form';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
}
```

#### 2.4 Auth Callback Page
**File**: `src/pages/AuthCallback.tsx`

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session) {
          navigate('/');
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
```

### 3. Update App Structure

#### 3.1 Update App.tsx with Auth
**File**: `src/App.tsx`

```typescript
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import Dashboard from "@/pages/Dashboard";
import AuthCallback from "@/pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.message?.includes('JWT')) return false;
        return failureCount < 3;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

## Testing Implementation

### Unit Tests

#### 3.1 Auth Context Tests
**File**: `src/contexts/__tests__/auth-context.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '../auth-context';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

// Test component to consume auth context
function TestComponent() {
  const { user, loading, signIn } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (user) return <div>Logged in: {user.email}</div>;
  return <div>Not logged in</div>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial loading state', () => {
    // Mock getSession to return null
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null }
    });
    
    // Mock onAuthStateChange
    (supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle sign in success', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSession = { user: mockUser };

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: mockSession }
    });
    
    (supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Logged in: test@example.com')).toBeInTheDocument();
    });
  });
});
```

#### 3.2 Auth Form Tests
**File**: `src/components/auth/__tests__/auth-form.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthForm } from '../auth-form';
import { useAuth } from '@/contexts/auth-context';

// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

const mockAuthContext = {
  user: null,
  session: null,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithGitHub: vi.fn(),
};

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue(mockAuthContext);
  });

  it('should render sign in form by default', () => {
    render(<AuthForm />);
    
    expect(screen.getByText('Welcome to FuelTrackr')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should handle sign in form submission', async () => {
    const user = userEvent.setup();
    mockAuthContext.signIn.mockResolvedValue({ error: null });

    render(<AuthForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockAuthContext.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should display error message on sign in failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    mockAuthContext.signIn.mockResolvedValue({ error: { message: errorMessage } });

    render(<AuthForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
```

### Integration Tests with MSW

#### 3.3 Auth Integration Tests
**File**: `src/components/auth/__tests__/auth-integration.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth-context';
import { AuthForm } from '../auth-form';

// Mock Supabase endpoints
const server = setupServer(
  rest.post('https://bkfzqrzshlmjxwgdnkak.supabase.co/auth/v1/token', (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        user: {
          id: '123',
          email: 'test@example.com',
        },
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('Auth Integration', () => {
  it('should complete full authentication flow', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AuthForm />
      </TestWrapper>
    );

    // Fill in sign in form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Should redirect to dashboard on successful auth
    await waitFor(() => {
      // This would be tested with actual routing in a full integration test
      expect(screen.queryByText('Welcome to FuelTrackr')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
```

## Storybook Updates

#### 3.4 Auth Form Stories
**File**: `src/components/auth/auth-form.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { AuthForm } from './auth-form';
import { AuthProvider } from '@/contexts/auth-context';
import { BrowserRouter } from 'react-router-dom';

const meta = {
  title: 'Auth/AuthForm',
  component: AuthForm,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </BrowserRouter>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AuthForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  parameters: {
    mockData: [
      {
        url: 'https://bkfzqrzshlmjxwgdnkak.supabase.co/auth/v1/token',
        method: 'POST',
        status: 400,
        response: {
          error: 'invalid_credentials',
          error_description: 'Invalid login credentials',
        },
      },
    ],
  },
};
```

## How to Test

### Manual Testing Checklist

#### Database Setup
- [ ] Run Supabase migrations successfully
- [ ] Verify tables created with correct schema
- [ ] Test RLS policies work correctly
- [ ] Verify storage bucket created and accessible

#### Authentication Flow
- [ ] Sign up with email/password creates user
- [ ] Sign in with valid credentials works
- [ ] Sign in with invalid credentials shows error
- [ ] Sign out works and redirects to auth form
- [ ] Google OAuth flow works (requires OAuth setup)
- [ ] GitHub OAuth flow works (requires OAuth setup)
- [ ] Auth state persists on page refresh

#### Protected Routes
- [ ] Unauthenticated users see auth form
- [ ] Authenticated users see app content
- [ ] Auth loading state shows spinner
- [ ] Auth callback page handles OAuth redirects

### Automated Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

## Definition of Done

- [ ] **Database**: All tables, RLS policies, and storage bucket created
- [ ] **Authentication**: Email/password and OAuth sign in/up working
- [ ] **Protected Routes**: Unauthenticated users cannot access app
- [ ] **Error Handling**: Proper error states and user feedback
- [ ] **Unit Tests**: >80% coverage for auth components and context
- [ ] **Integration Tests**: Auth flows tested with MSW
- [ ] **Storybook**: Auth components documented with stories
- [ ] **Manual Testing**: All auth scenarios tested and working
- [ ] **Code Review**: Code reviewed and approved
- [ ] **Documentation**: Setup instructions updated in README

## Notes

- **Environment Variables**: Update `.env.example` with required Supabase keys
- **OAuth Setup**: Requires configuring providers in Supabase dashboard
- **Error Boundaries**: Consider adding error boundaries for auth failures
- **Session Management**: Auth state is automatically synced with Supabase
- **Security**: All auth tokens are handled securely by Supabase SDK
