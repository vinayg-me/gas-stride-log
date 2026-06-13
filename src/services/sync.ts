import { supabase } from '@/integrations/supabase/client';
import { db } from '@/lib/db';
import { useAppStore } from '@/store';

export class SyncManager {
  private static isSyncing = false;

  /**
   * Main sync function: Processes the queue and keeps Dexie/Supabase aligned.
   */
  static async startSync(): Promise<void> {
    if (this.isSyncing) return;
    
    const store = useAppStore.getState();
    if (!store.isOnline) {
      store.setSyncStatus('pending');
      return;
    }

    try {
      this.isSyncing = true;
      store.setSyncStatus('syncing');

      // 1. Process all pending queue items sequentially to guarantee causal order
      await this.processQueue();

      // 2. Fetch fresh data from Supabase to overwrite local cache
      await this.pullFromRemote();

      store.setSyncStatus('synced');
    } catch (error) {
      console.error('Offline synchronization failed:', error);
      store.setSyncStatus('pending');
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Iterates through the Dexie sync queue table and pushes operations to Supabase.
   */
  private static async processQueue(): Promise<void> {
    const queueItems = await db.syncQueue.orderBy('id').toArray();
    if (queueItems.length === 0) return;

    for (const item of queueItems) {
      try {
        let error = null;

        if (item.table === 'cars') {
          if (item.action === 'insert') {
            const { error: err } = await supabase.from('cars').insert(item.payload);
            error = err;
          } else if (item.action === 'update') {
            const { error: err } = await supabase.from('cars').update(item.payload).eq('id', item.recordId);
            error = err;
          } else if (item.action === 'delete') {
            const { error: err } = await supabase.from('cars').delete().eq('id', item.recordId);
            error = err;
          }
        } else if (item.table === 'fuel_logs') {
          if (item.action === 'insert') {
            const { error: err } = await supabase.from('fuel_logs').insert(item.payload);
            error = err;
          } else if (item.action === 'update') {
            const { error: err } = await supabase.from('fuel_logs').update(item.payload).eq('id', item.recordId);
            error = err;
          } else if (item.action === 'delete') {
            const { error: err } = await supabase.from('fuel_logs').delete().eq('id', item.recordId);
            error = err;
          }
        }

        // If conflict error (e.g. unique constraint violated or already exists) or success, clear queue item.
        // If connection is dropped mid-queue, throw error to stop queue execution.
        if (error) {
          // If the error is network related, throw to abort processing the rest of the queue
          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('fetch') || msg.includes('network') || msg.includes('offline') || msg.includes('connection')) {
            throw new Error(`Network error during sync: ${error.message}`);
          }
          console.error(`Error syncing queue item ${item.id} (${item.table}:${item.action}):`, error);
        }

        // Mark record as synced in local table if it wasn't deleted
        if (item.action !== 'delete') {
          if (item.table === 'cars') {
            await db.cars.update(item.recordId, { synced: 1 });
          } else if (item.table === 'fuel_logs') {
            await db.fuelLogs.update(item.recordId, { synced: 1 });
          }
        }

        // Remove successfully processed task from the queue
        if (item.id !== undefined) {
          await db.syncQueue.delete(item.id);
        }
      } catch (err: any) {
        // Halt queue execution if connection drops
        throw err;
      }
    }
  }

  /**
   * Pulls fresh data from Supabase and overwrites local Dexie tables.
   */
  private static async pullFromRemote(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch cars
    const { data: remoteCars, error: carError } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (carError) throw new Error(`Failed to pull cars: ${carError.message}`);

    // Fetch fuel logs
    const { data: remoteLogs, error: logError } = await supabase
      .from('fuel_logs')
      .select('*')
      .order('filled_at', { ascending: false });

    if (logError) throw new Error(`Failed to pull fuel logs: ${logError.message}`);

    // Update Dexie tables (bulkPut keeps existing non-conflicting unsynced records)
    if (remoteCars) {
      const formattedCars = remoteCars.map((c: any) => ({ ...c, synced: 1 }));
      // Clear old synced cars in Dexie and repopulate
      const unsyncedCars = await db.cars.filter(c => c.synced === 0).toArray();
      await db.cars.clear();
      await db.cars.bulkPut([...formattedCars, ...unsyncedCars]);
      
      // Update Zustand store
      useAppStore.getState().setCars([...remoteCars, ...unsyncedCars]);
    }

    if (remoteLogs) {
      const formattedLogs = remoteLogs.map((l: any) => ({ ...l, synced: 1 }));
      // Clear old synced logs in Dexie and repopulate
      const unsyncedLogs = await db.fuelLogs.filter(l => l.synced === 0).toArray();
      await db.fuelLogs.clear();
      await db.fuelLogs.bulkPut([...formattedLogs, ...unsyncedLogs]);

      // Update Zustand store
      useAppStore.getState().setFuelLogs([...remoteLogs, ...unsyncedLogs]);
    }
  }
}
