import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncManager } from '../sync';
import { db } from '@/lib/db';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const mockSupabaseQuery = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
};

describe('SyncManager', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    (supabase.from as any).mockReturnValue(mockSupabaseQuery);

    // Reset database state
    await db.cars.clear();
    await db.fuelLogs.clear();
    await db.syncQueue.clear();

    // Reset Zustand store state
    useAppStore.setState({
      isOnline: true,
      syncStatus: 'synced',
      cars: [],
      fuelLogs: [],
    });
  });

  it('should abort syncing if offline', async () => {
    useAppStore.setState({ isOnline: false });

    await SyncManager.startSync();

    expect(useAppStore.getState().syncStatus).toBe('pending');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should process sync queue sequentially and pull remote updates', async () => {
    // 1. Setup mock auth user
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    // 2. Mock database responses
    mockSupabaseQuery.insert.mockResolvedValue({ error: null });
    mockSupabaseQuery.order.mockResolvedValueOnce({
      data: [{ id: 'car-1', make: 'Honda', model: 'City', registration: 'KA-01-AB-1234', owner_id: 'user-1', created_at: new Date().toISOString() }],
      error: null,
    }).mockResolvedValueOnce({
      data: [{ id: 'log-1', car_id: 'car-1', liters: 40, odometer_km: 1000, filled_at: new Date().toISOString() }],
      error: null,
    });

    // 3. Add item to syncQueue
    await db.syncQueue.add({
      table: 'cars',
      action: 'insert',
      recordId: 'car-1',
      payload: { id: 'car-1', make: 'Honda', model: 'City', registration: 'KA-01-AB-1234' },
      created_at: new Date().toISOString(),
    });

    await SyncManager.startSync();

    // Verify queue item is processed
    expect(supabase.from).toHaveBeenCalledWith('cars');
    expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
      id: 'car-1',
      make: 'Honda',
      model: 'City',
      registration: 'KA-01-AB-1234',
    });

    // Verify sync queue is empty now
    const remainingQueue = await db.syncQueue.toArray();
    expect(remainingQueue).toHaveLength(0);

    // Verify Zustand state was updated
    expect(useAppStore.getState().syncStatus).toBe('synced');
    expect(useAppStore.getState().cars).toHaveLength(1);
    expect(useAppStore.getState().fuelLogs).toHaveLength(1);
  });

  it('should halt processing and keep items in queue on network error', async () => {
    // 1. Setup mock auth user
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    // 2. Mock network failure for insert
    mockSupabaseQuery.insert.mockResolvedValue({
      error: { message: 'Failed to fetch (network error)' },
    });

    // 3. Add items to syncQueue
    await db.syncQueue.add({
      table: 'cars',
      action: 'insert',
      recordId: 'car-1',
      payload: { id: 'car-1', make: 'Honda' },
      created_at: new Date().toISOString(),
    });

    await db.syncQueue.add({
      table: 'cars',
      action: 'insert',
      recordId: 'car-2',
      payload: { id: 'car-2', make: 'Toyota' },
      created_at: new Date().toISOString(),
    });

    await SyncManager.startSync();

    // Verify sync status went back to pending
    expect(useAppStore.getState().syncStatus).toBe('pending');

    // Verify items remain in sync queue
    const remainingQueue = await db.syncQueue.toArray();
    expect(remainingQueue).toHaveLength(2);
  });
});
