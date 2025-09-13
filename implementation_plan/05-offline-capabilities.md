# Phase 5: Offline Capabilities

## Business Context

Implement comprehensive offline-first functionality using IndexedDB (Dexie) and Workbox service workers to ensure the FuelTrackr PWA works seamlessly without internet connectivity. This includes local data storage, background sync, conflict resolution, and sync status indicators.

## Current State

- ✅ PWA manifest configured
- ✅ Basic service worker setup
- ✅ Dexie dependency installed
- ✅ TanStack Query for caching
- ❌ No IndexedDB schema
- ❌ No offline data sync
- ❌ No background sync implementation
- ❌ No conflict resolution
- ❌ No sync status indicators

## Implementation Tasks

### 1. IndexedDB Schema with Dexie

#### 1.1 Database Schema Setup
**File**: `src/services/offline/database.ts`

```typescript
import Dexie, { Table } from 'dexie';
import { Car, FuelLog, User } from '@/types';

// Offline-specific types
export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'cars' | 'fuel_logs' | 'users';
  recordId: string;
  data?: any;
  timestamp: number;
  synced: boolean;
  error?: string;
  retryCount: number;
}

export interface SyncStatus {
  id: string;
  lastSyncAt: number;
  pendingActions: number;
  status: 'synced' | 'pending' | 'syncing' | 'error';
}

export class FuelTrackrDatabase extends Dexie {
  // Tables
  users!: Table<User>;
  cars!: Table<Car>;
  fuelLogs!: Table<FuelLog>;
  offlineActions!: Table<OfflineAction>;
  syncStatus!: Table<SyncStatus>;

  constructor() {
    super('FuelTrackrDatabase');
    
    this.version(1).stores({
      users: 'id, email, created_at',
      cars: 'id, owner_id, registration, make, model, created_at, updated_at',
      fuelLogs: 'id, car_id, filled_at, odometer_km, created_at, updated_at',
      offlineActions: '++id, type, table, recordId, timestamp, synced, retryCount',
      syncStatus: 'id, lastSyncAt, pendingActions, status',
    });

    // Hooks for automatic offline action logging
    this.cars.hook('creating', (primKey, obj, trans) => {
      this.logOfflineAction('create', 'cars', obj.id, obj);
    });

    this.cars.hook('updating', (modifications, primKey, obj, trans) => {
      this.logOfflineAction('update', 'cars', primKey as string, modifications);
    });

    this.cars.hook('deleting', (primKey, obj, trans) => {
      this.logOfflineAction('delete', 'cars', primKey as string);
    });

    this.fuelLogs.hook('creating', (primKey, obj, trans) => {
      this.logOfflineAction('create', 'fuel_logs', obj.id, obj);
    });

    this.fuelLogs.hook('updating', (modifications, primKey, obj, trans) => {
      this.logOfflineAction('update', 'fuel_logs', primKey as string, modifications);
    });

    this.fuelLogs.hook('deleting', (primKey, obj, trans) => {
      this.logOfflineAction('delete', 'fuel_logs', primKey as string);
    });
  }

  private async logOfflineAction(
    type: OfflineAction['type'],
    table: OfflineAction['table'],
    recordId: string,
    data?: any
  ) {
    // Don't log if we're syncing (to avoid infinite loops)
    if ((window as any).__SYNCING__) return;

    const action: Omit<OfflineAction, 'id'> = {
      type,
      table,
      recordId,
      data,
      timestamp: Date.now(),
      synced: false,
      retryCount: 0,
    };

    await this.offlineActions.add(action as OfflineAction);
    await this.updateSyncStatus();
  }

  async updateSyncStatus() {
    const pendingCount = await this.offlineActions.where('synced').equals(false).count();
    const status: SyncStatus['status'] = pendingCount > 0 ? 'pending' : 'synced';

    await this.syncStatus.put({
      id: 'global',
      lastSyncAt: Date.now(),
      pendingActions: pendingCount,
      status,
    });
  }

  async clearSyncedActions() {
    await this.offlineActions.where('synced').equals(true).delete();
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    return await this.offlineActions
      .where('synced')
      .equals(false)
      .orderBy('timestamp')
      .toArray();
  }

  async markActionSynced(actionId: string) {
    await this.offlineActions.update(actionId, { synced: true });
    await this.updateSyncStatus();
  }

  async markActionError(actionId: string, error: string) {
    await this.offlineActions.update(actionId, { 
      error, 
      retryCount: (await this.offlineActions.get(actionId))!.retryCount + 1 
    });
  }
}

export const db = new FuelTrackrDatabase();
```

#### 1.2 Offline Data Service
**File**: `src/services/offline/offline-data.ts`

```typescript
import { db } from './database';
import { supabase } from '@/integrations/supabase/client';
import { Car, FuelLog, User } from '@/types';

export class OfflineDataService {
  // Car operations
  static async getCarsOffline(): Promise<Car[]> {
    return await db.cars.orderBy('created_at').reverse().toArray();
  }

  static async getCarOffline(id: string): Promise<Car | undefined> {
    return await db.cars.get(id);
  }

  static async createCarOffline(car: Car): Promise<void> {
    await db.cars.add(car);
  }

  static async updateCarOffline(id: string, updates: Partial<Car>): Promise<void> {
    await db.cars.update(id, { ...updates, updated_at: new Date().toISOString() });
  }

  static async deleteCarOffline(id: string): Promise<void> {
    // Also delete related fuel logs
    await db.fuelLogs.where('car_id').equals(id).delete();
    await db.cars.delete(id);
  }

  // Fuel log operations
  static async getFuelLogsOffline(carId?: string): Promise<FuelLog[]> {
    let collection = db.fuelLogs.orderBy('filled_at').reverse();
    
    if (carId) {
      collection = collection.and(log => log.car_id === carId);
    }
    
    return await collection.toArray();
  }

  static async getFuelLogOffline(id: string): Promise<FuelLog | undefined> {
    return await db.fuelLogs.get(id);
  }

  static async createFuelLogOffline(log: FuelLog): Promise<void> {
    await db.fuelLogs.add(log);
  }

  static async updateFuelLogOffline(id: string, updates: Partial<FuelLog>): Promise<void> {
    await db.fuelLogs.update(id, { ...updates, updated_at: new Date().toISOString() });
  }

  static async deleteFuelLogOffline(id: string): Promise<void> {
    await db.fuelLogs.delete(id);
  }

  // Sync operations
  static async syncToServer(): Promise<void> {
    const pendingActions = await db.getPendingActions();
    
    if (pendingActions.length === 0) {
      await db.updateSyncStatus();
      return;
    }

    // Mark as syncing
    await db.syncStatus.put({
      id: 'global',
      lastSyncAt: Date.now(),
      pendingActions: pendingActions.length,
      status: 'syncing',
    });

    (window as any).__SYNCING__ = true;

    try {
      for (const action of pendingActions) {
        await this.syncAction(action);
      }
      
      // Clean up synced actions
      await db.clearSyncedActions();
      
    } catch (error) {
      console.error('Sync failed:', error);
      await db.syncStatus.put({
        id: 'global',
        lastSyncAt: Date.now(),
        pendingActions: pendingActions.length,
        status: 'error',
      });
    } finally {
      (window as any).__SYNCING__ = false;
    }
  }

  private static async syncAction(action: OfflineAction): Promise<void> {
    try {
      switch (action.table) {
        case 'cars':
          await this.syncCarAction(action);
          break;
        case 'fuel_logs':
          await this.syncFuelLogAction(action);
          break;
        default:
          throw new Error(`Unknown table: ${action.table}`);
      }
      
      await db.markActionSynced(action.id);
    } catch (error) {
      console.error(`Failed to sync action ${action.id}:`, error);
      await db.markActionError(action.id, (error as Error).message);
      
      // Don't retry more than 3 times
      if (action.retryCount >= 3) {
        await db.markActionSynced(action.id); // Mark as synced to stop retrying
      }
      
      throw error;
    }
  }

  private static async syncCarAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'create':
        await supabase.from('cars').insert(action.data);
        break;
      case 'update':
        await supabase.from('cars').update(action.data).eq('id', action.recordId);
        break;
      case 'delete':
        await supabase.from('cars').delete().eq('id', action.recordId);
        break;
    }
  }

  private static async syncFuelLogAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'create':
        await supabase.from('fuel_logs').insert(action.data);
        break;
      case 'update':
        await supabase.from('fuel_logs').update(action.data).eq('id', action.recordId);
        break;
      case 'delete':
        await supabase.from('fuel_logs').delete().eq('id', action.recordId);
        break;
    }
  }

  static async syncFromServer(): Promise<void> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Sync cars
      const { data: cars } = await supabase
        .from('cars')
        .select('*')
        .eq('owner_id', user.id);

      if (cars) {
        await db.cars.clear();
        await db.cars.bulkAdd(cars);
      }

      // Sync fuel logs
      const { data: fuelLogs } = await supabase
        .from('fuel_logs')
        .select('*')
        .in('car_id', cars?.map(car => car.id) || []);

      if (fuelLogs) {
        await db.fuelLogs.clear();
        await db.fuelLogs.bulkAdd(fuelLogs);
      }

      await db.updateSyncStatus();
    } catch (error) {
      console.error('Failed to sync from server:', error);
      throw error;
    }
  }

  static async getSyncStatus() {
    const status = await db.syncStatus.get('global');
    return status || {
      id: 'global',
      lastSyncAt: 0,
      pendingActions: 0,
      status: 'synced' as const,
    };
  }
}
```

### 2. Service Worker with Workbox

#### 2.1 Service Worker Configuration
**File**: `public/sw.js`

```javascript
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { BackgroundSync } from 'workbox-background-sync';
import { Queue } from 'workbox-background-sync';

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache strategies for different resource types
registerRoute(
  ({ request }) => request.destination === 'document',
  new StaleWhileRevalidate({
    cacheName: 'pages-cache',
  })
);

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [{
      cacheKeyWillBeUsed: async ({ request }) => {
        return request.url;
      },
    }],
  })
);

// Network-first for API calls with background sync fallback
const apiQueue = new Queue('api-queue', {
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('Background sync successful for:', entry.request.url);
      } catch (error) {
        console.error('Background sync failed for:', entry.request.url, error);
        // Re-add to queue for retry
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  },
});

registerRoute(
  ({ url }) => url.pathname.startsWith('/rest/v1/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [{
      requestWillFetch: async ({ request }) => {
        // Clone request for background sync if needed
        return request;
      },
      fetchDidFail: async ({ originalRequest, request, error }) => {
        // Add failed requests to background sync queue
        if (originalRequest.method === 'POST' || originalRequest.method === 'PUT' || originalRequest.method === 'DELETE') {
          await apiQueue.pushRequest({ request: originalRequest });
        }
        throw error;
      },
    }],
  })
);

// Handle background sync events
self.addEventListener('sync', (event) => {
  if (event.tag === 'fuel-trackr-sync') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Trigger sync in the main thread
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        payload: { action: 'sync' }
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: data.data,
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
```

#### 2.2 Service Worker Registration
**File**: `src/services/offline/service-worker.ts`

```typescript
import { Workbox } from 'workbox-window';

export class ServiceWorkerManager {
  private wb: Workbox | null = null;
  private registration: ServiceWorkerRegistration | null = null;

  async register(): Promise<void> {
    if ('serviceWorker' in navigator) {
      this.wb = new Workbox('/sw.js');

      // Listen for service worker events
      this.wb.addEventListener('installed', (event) => {
        console.log('Service Worker installed:', event);
      });

      this.wb.addEventListener('waiting', (event) => {
        console.log('Service Worker waiting:', event);
        this.showUpdatePrompt();
      });

      this.wb.addEventListener('controlling', (event) => {
        console.log('Service Worker controlling:', event);
        window.location.reload();
      });

      this.wb.addEventListener('activated', (event) => {
        console.log('Service Worker activated:', event);
      });

      // Listen for background sync messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'BACKGROUND_SYNC') {
          this.handleBackgroundSync(event.data.payload);
        }
      });

      try {
        this.registration = await this.wb.register();
        console.log('Service Worker registered successfully');
        
        // Register for background sync
        await this.registerBackgroundSync();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private async registerBackgroundSync(): Promise<void> {
    if (this.registration && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await this.registration.sync.register('fuel-trackr-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  private showUpdatePrompt(): void {
    // Show update prompt to user
    const updatePrompt = document.createElement('div');
    updatePrompt.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 8px; padding: 16px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <p style="margin: 0 0 12px 0; color: hsl(var(--foreground)); font-size: 14px;">A new version is available!</p>
        <button id="update-button" style="background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-right: 8px;">Update</button>
        <button id="dismiss-button" style="background: transparent; color: hsl(var(--muted-foreground)); border: 1px solid hsl(var(--border)); padding: 8px 16px; border-radius: 6px; cursor: pointer;">Dismiss</button>
      </div>
    `;

    document.body.appendChild(updatePrompt);

    document.getElementById('update-button')?.addEventListener('click', () => {
      this.wb?.messageSkipWaiting();
      document.body.removeChild(updatePrompt);
    });

    document.getElementById('dismiss-button')?.addEventListener('click', () => {
      document.body.removeChild(updatePrompt);
    });
  }

  private async handleBackgroundSync(payload: any): Promise<void> {
    if (payload.action === 'sync') {
      // Trigger data sync
      const { OfflineDataService } = await import('./offline-data');
      try {
        await OfflineDataService.syncToServer();
        console.log('Background sync completed successfully');
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  }

  async requestSync(): Promise<void> {
    if (this.registration && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await this.registration.sync.register('fuel-trackr-sync');
      } catch (error) {
        console.error('Manual sync request failed:', error);
      }
    }
  }
}

export const swManager = new ServiceWorkerManager();
```

### 3. Offline-Aware React Query Integration

#### 3.1 Offline Query Client
**File**: `src/services/offline/offline-query-client.ts`

```typescript
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { OfflineDataService } from './offline-data';
import { toast } from '@/hooks/use-toast';

export function createOfflineQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Handle offline errors gracefully
        if (error instanceof Error && error.message.includes('NetworkError')) {
          console.log('Query failed due to network error, using offline data');
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        // Handle offline mutations
        if (error instanceof Error && error.message.includes('NetworkError')) {
          toast({
            title: "Offline Mode",
            description: "Changes saved locally and will sync when online.",
          });
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
          // Don't retry network errors when offline
          if (error instanceof Error && error.message.includes('NetworkError')) {
            return false;
          }
          return failureCount < 3;
        },
        queryFn: async ({ queryKey, signal }) => {
          // Try online first, fallback to offline
          try {
            // Default query function would be called here
            throw new Error('No query function provided');
          } catch (error) {
            if (navigator.onLine === false) {
              return await handleOfflineQuery(queryKey);
            }
            throw error;
          }
        },
      },
      mutations: {
        retry: (failureCount, error) => {
          // Don't retry network errors when offline
          if (error instanceof Error && error.message.includes('NetworkError')) {
            return false;
          }
          return failureCount < 3;
        },
      },
    },
  });
}

async function handleOfflineQuery(queryKey: readonly unknown[]): Promise<any> {
  const [resource, ...params] = queryKey;

  switch (resource) {
    case 'cars':
      if (params.length === 0) {
        return await OfflineDataService.getCarsOffline();
      } else if (params[0] === 'detail') {
        return await OfflineDataService.getCarOffline(params[1] as string);
      }
      break;
    
    case 'fuel-logs':
      const [, filters] = params;
      if (typeof filters === 'object' && filters && 'carId' in filters) {
        return await OfflineDataService.getFuelLogsOffline(filters.carId as string);
      }
      return await OfflineDataService.getFuelLogsOffline();
    
    default:
      throw new Error(`Offline query not supported for: ${resource}`);
  }
}
```

### 4. Sync Status Components

#### 4.1 Sync Status Indicator
**File**: `src/components/offline/sync-status.tsx`

```typescript
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Cloud, CloudOff, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { OfflineDataService } from '@/services/offline/offline-data';
import { swManager } from '@/services/offline/service-worker';
import { cn } from '@/lib/utils';

interface SyncStatusProps {
  className?: string;
  showText?: boolean;
}

export function SyncStatus({ className, showText = false }: SyncStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<{
    status: 'synced' | 'pending' | 'syncing' | 'error';
    pendingActions: number;
    lastSyncAt: number;
  }>({
    status: 'synced',
    pendingActions: 0,
    lastSyncAt: Date.now(),
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const loadSyncStatus = async () => {
      const status = await OfflineDataService.getSyncStatus();
      setSyncStatus(status);
    };

    loadSyncStatus();

    // Poll sync status every 5 seconds
    const interval = setInterval(loadSyncStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      await OfflineDataService.syncToServer();
      await swManager.requestSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        variant: 'secondary' as const,
        text: 'Offline',
        color: 'text-orange-500',
      };
    }

    if (isSyncing || syncStatus.status === 'syncing') {
      return {
        icon: Loader2,
        variant: 'secondary' as const,
        text: 'Syncing...',
        color: 'text-blue-500',
        animate: true,
      };
    }

    if (syncStatus.status === 'error') {
      return {
        icon: CloudOff,
        variant: 'destructive' as const,
        text: 'Sync Error',
        color: 'text-red-500',
      };
    }

    if (syncStatus.status === 'pending') {
      return {
        icon: Cloud,
        variant: 'outline' as const,
        text: `${syncStatus.pendingActions} Pending`,
        color: 'text-yellow-500',
      };
    }

    return {
      icon: Cloud,
      variant: 'outline' as const,
      text: 'Synced',
      color: 'text-green-500',
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const statusElement = (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon 
          className={cn("h-3 w-3", config.color, {
            "animate-spin": config.animate,
          })} 
        />
        {showText && <span className="text-xs">{config.text}</span>}
      </Badge>
      
      {isOnline && syncStatus.status !== 'syncing' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={cn("h-3 w-3", { "animate-spin": isSyncing })} />
        </Button>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {statusElement}
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <p className="font-medium">{config.text}</p>
          {syncStatus.pendingActions > 0 && (
            <p className="text-xs text-muted-foreground">
              {syncStatus.pendingActions} changes pending sync
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Last sync: {new Date(syncStatus.lastSyncAt).toLocaleTimeString()}
          </p>
          {isOnline && syncStatus.status !== 'syncing' && (
            <p className="text-xs text-muted-foreground">
              Click refresh to sync now
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
```

### 5. Integration with Existing Services

#### 5.1 Updated Car Hooks for Offline Support
**File**: `src/hooks/use-cars-offline.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CarService } from '@/services/cars';
import { OfflineDataService } from '@/services/offline/offline-data';
import { Car, AddCarForm } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useCarsOffline() {
  return useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      try {
        // Try online first
        if (navigator.onLine) {
          const onlineCars = await CarService.getCars();
          // Update offline cache
          await Promise.all(onlineCars.map(car => OfflineDataService.createCarOffline(car)));
          return onlineCars;
        }
      } catch (error) {
        console.log('Online fetch failed, using offline data:', error);
      }
      
      // Fallback to offline data
      return await OfflineDataService.getCarsOffline();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCarOffline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (carData: AddCarForm) => {
      const newCar: Car = {
        ...carData,
        id: `temp_${Date.now()}`, // Temporary ID
        owner_id: 'current_user', // Will be updated during sync
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Always save offline first
      await OfflineDataService.createCarOffline(newCar);

      // Try online sync if available
      if (navigator.onLine) {
        try {
          const onlineCar = await CarService.createCar(carData);
          // Update offline record with server ID
          await OfflineDataService.updateCarOffline(newCar.id, {
            id: onlineCar.id,
            owner_id: onlineCar.owner_id,
          });
          return onlineCar;
        } catch (error) {
          console.log('Online create failed, will sync later:', error);
        }
      }

      return newCar;
    },
    onSuccess: (newCar) => {
      queryClient.setQueryData<Car[]>(['cars'], (oldCars = []) => [
        newCar,
        ...oldCars,
      ]);

      queryClient.invalidateQueries({ queryKey: ['cars'] });

      const message = navigator.onLine 
        ? "Car added successfully"
        : "Car saved offline and will sync when online";

      toast({
        title: "Car Added",
        description: message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Car",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
```

## Testing Implementation

### Unit Tests

#### 5.1 Offline Database Tests
**File**: `src/services/offline/__tests__/database.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FuelTrackrDatabase } from '../database';
import { Car } from '@/types';

describe('FuelTrackrDatabase', () => {
  let db: FuelTrackrDatabase;

  beforeEach(async () => {
    db = new FuelTrackrDatabase();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('car operations', () => {
    it('should add and retrieve cars', async () => {
      const car: Car = {
        id: 'test-car-1',
        owner_id: 'user-1',
        registration: 'KA-01-AB-1234',
        make: 'Honda',
        model: 'City',
        fuel_type: 'petrol',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.cars.add(car);
      const retrieved = await db.cars.get('test-car-1');

      expect(retrieved).toEqual(car);
    });

    it('should log offline actions when creating cars', async () => {
      const car: Car = {
        id: 'test-car-2',
        owner_id: 'user-1',
        registration: 'KA-02-CD-5678',
        make: 'Maruti',
        model: 'Swift',
        fuel_type: 'petrol',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.cars.add(car);

      const actions = await db.getPendingActions();
      expect(actions).toHaveLength(1);
      expect(actions[0]).toMatchObject({
        type: 'create',
        table: 'cars',
        recordId: 'test-car-2',
        synced: false,
      });
    });
  });

  describe('sync status', () => {
    it('should update sync status when actions are pending', async () => {
      const car: Car = {
        id: 'test-car-3',
        owner_id: 'user-1',
        registration: 'KA-03-EF-9012',
        make: 'Toyota',
        model: 'Innova',
        fuel_type: 'petrol',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.cars.add(car);

      const status = await db.syncStatus.get('global');
      expect(status).toMatchObject({
        pendingActions: 1,
        status: 'pending',
      });
    });

    it('should mark actions as synced', async () => {
      const car: Car = {
        id: 'test-car-4',
        owner_id: 'user-1',
        registration: 'KA-04-GH-3456',
        make: 'Hyundai',
        model: 'Creta',
        fuel_type: 'petrol',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.cars.add(car);

      const actions = await db.getPendingActions();
      await db.markActionSynced(actions[0].id);

      const updatedActions = await db.getPendingActions();
      expect(updatedActions).toHaveLength(0);

      const status = await db.syncStatus.get('global');
      expect(status?.status).toBe('synced');
    });
  });
});
```

## How to Test

### Manual Testing Checklist

#### Offline Functionality
- [ ] App loads and works when offline
- [ ] Can create/edit/delete cars when offline
- [ ] Can create/edit/delete fuel logs when offline
- [ ] Offline changes are queued for sync
- [ ] Sync status indicator shows correct state
- [ ] Data syncs when coming back online
- [ ] Conflict resolution works correctly
- [ ] Service worker updates properly
- [ ] Background sync works

#### PWA Features
- [ ] App can be installed on desktop/mobile
- [ ] App works offline after installation
- [ ] Update prompts appear for new versions
- [ ] Push notifications work (if implemented)
- [ ] App meets PWA criteria (Lighthouse audit)

### Automated Testing

```bash
# Run offline tests
npm run test src/services/offline/

# Run PWA tests
npm run test:e2e -- --grep "offline"

# Test service worker
npm run test:sw

# Run all offline related tests
npm run test -- --testNamePattern="offline"
```

## Definition of Done

- [ ] **IndexedDB**: Local database with Dexie implemented
- [ ] **Service Worker**: Workbox service worker with caching strategies
- [ ] **Background Sync**: Offline actions sync when online
- [ ] **Conflict Resolution**: Last-write-wins conflict resolution
- [ ] **Sync Status**: Visual indicators for sync status
- [ ] **PWA Features**: Installable app with offline support
- [ ] **Query Integration**: TanStack Query works offline
- [ ] **Error Handling**: Graceful offline error handling
- [ ] **Unit Tests**: >80% coverage for offline components
- [ ] **E2E Tests**: Offline scenarios tested with Playwright
- [ ] **Manual Testing**: All offline scenarios verified
- [ ] **Performance**: Offline operations are fast and responsive
- [ ] **Code Review**: Code reviewed and approved

## Notes

- **Offline-First**: App prioritizes local data with server sync
- **Conflict Resolution**: Simple last-write-wins strategy
- **Performance**: IndexedDB operations are optimized
- **PWA Standards**: Meets all PWA requirements
- **Future**: Can be extended with more sophisticated conflict resolution
