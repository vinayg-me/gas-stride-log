import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute, GuestRoute } from "@/components/auth/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import { useAppStore } from "@/store";
import { SyncManager } from "@/services/sync";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import AuthCallback from "@/pages/AuthCallback";
import { AuthForm } from "@/components/auth/auth-form";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.message?.includes('JWT')) return false;
        return failureCount < 3;
      },
    },
  },
});

const AppContent = () => {
  const { setOnlineStatus } = useAppStore();

  useEffect(() => {
    // Initialize initial online status
    setOnlineStatus(navigator.onLine);

    const handleOnline = () => {
      setOnlineStatus(true);
      SyncManager.startSync();
    };

    const handleOffline = () => {
      setOnlineStatus(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Run synchronization immediately if online at startup
    if (navigator.onLine) {
      SyncManager.startSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={
            <GuestRoute>
              <AuthForm />
            </GuestRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AppLayout>
                <Analytics />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
