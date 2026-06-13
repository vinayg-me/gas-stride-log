import { supabase } from '@/integrations/supabase/client';
import { FuelLog, AddFuelLogForm, FuelLogWithMetrics } from '@/types';
import { db } from '@/lib/db';
import { useAppStore } from '@/store';

export class FuelLogService {
  static async getFuelLogs(carId?: string): Promise<FuelLog[]> {
    if (navigator.onLine) {
      try {
        let query = supabase
          .from('fuel_logs')
          .select('*')
          .order('filled_at', { ascending: false })
          .order('odometer_km', { ascending: false });

        if (carId) {
          query = query.eq('car_id', carId);
        }

        const { data: remoteLogs, error } = await query;

        if (error) throw error;

        if (remoteLogs) {
          // Bulk put remote logs into Dexie as synced: 1
          const formattedLogs = remoteLogs.map((l) => ({ ...l, synced: 1 }));
          
          // Clear older synced logs for this car/all cars, preserving unsynced local logs
          const unsyncedLogs = await (carId 
            ? db.fuelLogs.filter(l => l.car_id === carId && l.synced === 0).toArray()
            : db.fuelLogs.filter(l => l.synced === 0).toArray());

          if (carId) {
            await db.fuelLogs.where('car_id').equals(carId).delete();
          } else {
            await db.fuelLogs.clear();
          }

          await db.fuelLogs.bulkPut([...formattedLogs, ...unsyncedLogs]);

          const combined = [...remoteLogs, ...unsyncedLogs].sort((a, b) => {
            const dateA = new Date(a.filled_at).getTime();
            const dateB = new Date(b.filled_at).getTime();
            if (dateA !== dateB) return dateB - dateA;
            return b.odometer_km - a.odometer_km;
          });

          // Update Zustand store
          if (carId) {
            // Keep logs for other cars intact in store
            const otherCarsLogs = useAppStore.getState().fuelLogs.filter(l => l.car_id !== carId);
            useAppStore.getState().setFuelLogs([...otherCarsLogs, ...combined].sort((a, b) => {
              const dateA = new Date(a.filled_at).getTime();
              const dateB = new Date(b.filled_at).getTime();
              if (dateA !== dateB) return dateB - dateA;
              return b.odometer_km - a.odometer_km;
            }));
          } else {
            useAppStore.getState().setFuelLogs(combined);
          }

          return combined;
        }
      } catch (err) {
        console.warn('Failed to fetch fuel logs from Supabase, falling back to local storage:', err);
      }
    }

    // Offline or request failed: query local Dexie logs
    const localLogs = carId 
      ? await db.fuelLogs.where('car_id').equals(carId).toArray()
      : await db.fuelLogs.toArray();

    const sortedLocalLogs = localLogs.sort((a, b) => {
      const dateA = new Date(a.filled_at).getTime();
      const dateB = new Date(b.filled_at).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return b.odometer_km - a.odometer_km;
    });

    if (carId) {
      const otherLogs = useAppStore.getState().fuelLogs.filter(l => l.car_id !== carId);
      useAppStore.getState().setFuelLogs([...otherLogs, ...sortedLocalLogs].sort((a, b) => {
        const dateA = new Date(a.filled_at).getTime();
        const dateB = new Date(b.filled_at).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return b.odometer_km - a.odometer_km;
      }));
    } else {
      useAppStore.getState().setFuelLogs(sortedLocalLogs);
    }

    return sortedLocalLogs;
  }

  static async getFuelLogById(id: string): Promise<FuelLog | null> {
    const localLog = await db.fuelLogs.get(id);
    if (localLog) return localLog;

    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('fuel_logs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        if (data) {
          const log = { ...data, synced: 1 } as FuelLog;
          await db.fuelLogs.put(log);
          return log;
        }
      } catch (err) {
        console.error('Failed to get fuel log by ID from Supabase:', err);
      }
    }

    return null;
  }

  static async createFuelLog(logData: AddFuelLogForm): Promise<FuelLog> {
    const processedData = this.processLogData(logData);
    const now = new Date().toISOString();
    const logId = crypto.randomUUID();

    const newLog: FuelLog = {
      id: logId,
      car_id: logData.car_id,
      filled_at: logData.filled_at,
      odometer_km: logData.odometer_km,
      liters: logData.liters,
      price_per_l: processedData.price_per_l ?? undefined,
      total_cost: processedData.total_cost ?? undefined,
      is_partial: logData.is_partial,
      station: logData.station || undefined,
      notes: logData.notes || undefined,
      receipt_url: logData.receipt_url || undefined,
      created_at: now,
      updated_at: now,
    };

    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('fuel_logs')
          .insert(newLog)
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const syncedLog = { ...data, synced: 1 } as FuelLog;
          await db.fuelLogs.put(syncedLog);
          useAppStore.getState().addFuelLog(syncedLog);
          return syncedLog;
        }
      } catch (err: any) {
        if (err.message && (err.message.includes('Fetch') || err.message.includes('Failed to fetch'))) {
          console.warn('Supabase offline during fuel log creation, queuing sync...');
        } else {
          throw err;
        }
      }
    }

    // Save locally (synced: 0) and queue sync task
    await db.fuelLogs.put({ ...newLog, synced: 0 });
    await db.syncQueue.add({
      table: 'fuel_logs',
      action: 'insert',
      recordId: logId,
      payload: newLog,
      created_at: now,
    });

    useAppStore.getState().addFuelLog(newLog);
    useAppStore.getState().setSyncStatus('pending');

    return newLog;
  }

  static async updateFuelLog(id: string, updates: Partial<AddFuelLogForm>): Promise<FuelLog> {
    const localLog = await db.fuelLogs.get(id);
    if (!localLog) throw new Error('Fuel log not found');

    const processedUpdates = this.processLogData(updates);
    const now = new Date().toISOString();
    const updatedLog: FuelLog = {
      ...localLog,
      ...processedUpdates,
      updated_at: now,
    };

    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('fuel_logs')
          .update(processedUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const syncedLog = { ...data, synced: 1 } as FuelLog;
          await db.fuelLogs.put(syncedLog);
          useAppStore.getState().updateFuelLog(id, syncedLog);
          return syncedLog;
        }
      } catch (err: any) {
        if (err.message && (err.message.includes('Fetch') || err.message.includes('Failed to fetch'))) {
          console.warn('Supabase offline during fuel log update, queuing sync...');
        } else {
          throw err;
        }
      }
    }

    // Save locally
    await db.fuelLogs.put({ ...updatedLog, synced: 0 });

    // Optimize queue: check if an insert task already exists for this log
    const pendingInsert = await db.syncQueue
      .where({ table: 'fuel_logs', action: 'insert', recordId: id })
      .first();

    if (pendingInsert) {
      pendingInsert.payload = { ...pendingInsert.payload, ...processedUpdates, updated_at: now };
      await db.syncQueue.put(pendingInsert);
    } else {
      // Check if update task exists
      const pendingUpdate = await db.syncQueue
        .where({ table: 'fuel_logs', action: 'update', recordId: id })
        .first();

      if (pendingUpdate) {
        pendingUpdate.payload = { ...pendingUpdate.payload, ...processedUpdates };
        await db.syncQueue.put(pendingUpdate);
      } else {
        await db.syncQueue.add({
          table: 'fuel_logs',
          action: 'update',
          recordId: id,
          payload: processedUpdates,
          created_at: now,
        });
      }
    }

    useAppStore.getState().updateFuelLog(id, updatedLog);
    useAppStore.getState().setSyncStatus('pending');

    return updatedLog;
  }

  static async deleteFuelLog(id: string): Promise<void> {
    if (navigator.onLine) {
      try {
        const { error } = await supabase
          .from('fuel_logs')
          .delete()
          .eq('id', id);

        if (error) throw error;

        await db.fuelLogs.delete(id);
        useAppStore.getState().deleteFuelLog(id);
        return;
      } catch (err) {
        console.warn('Supabase offline during fuel log delete, queuing sync:', err);
      }
    }

    // Perform offline deletes
    await db.fuelLogs.delete(id);

    // Optimize queue: if there's a pending insert for this log, cancel it out
    const pendingInsert = await db.syncQueue
      .where({ table: 'fuel_logs', action: 'insert', recordId: id })
      .first();

    if (pendingInsert) {
      if (pendingInsert.id !== undefined) {
        await db.syncQueue.delete(pendingInsert.id);
      }
    } else {
      // Remove any pending updates and add delete task
      const pendingUpdates = await db.syncQueue
        .filter(q => q.table === 'fuel_logs' && q.recordId === id && q.action === 'update')
        .toArray();

      for (const updateTask of pendingUpdates) {
        if (updateTask.id !== undefined) {
          await db.syncQueue.delete(updateTask.id);
        }
      }

      await db.syncQueue.add({
        table: 'fuel_logs',
        action: 'delete',
        recordId: id,
        payload: null,
        created_at: new Date().toISOString(),
      });
    }

    useAppStore.getState().deleteFuelLog(id);
    useAppStore.getState().setSyncStatus('pending');
  }

  static async uploadReceipt(file: File, userId: string, logId: string): Promise<string> {
    // Standard upload logic - requires network
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${logId}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading receipt:', error);
      throw new Error(`Failed to upload receipt: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(data.path);

    return publicUrl;
  }

  static async deleteReceipt(receiptUrl: string): Promise<void> {
    try {
      const url = new URL(receiptUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/');

      const { error } = await supabase.storage
        .from('receipts')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting receipt:', error);
      }
    } catch (error) {
      console.error('Error parsing receipt URL:', error);
    }
  }

  static async getSignedReceiptUrl(receiptUrl: string, expiresInSeconds = 3600): Promise<string> {
    try {
      const url = new URL(receiptUrl);
      const pathname = url.pathname;
      const splitMarker = '/receipts/';
      const markerIndex = pathname.indexOf(splitMarker);
      if (markerIndex === -1) {
        return receiptUrl;
      }
      const filePath = pathname.substring(markerIndex + splitMarker.length);

      const { data, error } = await supabase.storage
        .from('receipts')
        .createSignedUrl(filePath, expiresInSeconds);

      if (error || !data?.signedUrl) {
        return receiptUrl;
      }

      return data.signedUrl;
    } catch (err) {
      return receiptUrl;
    }
  }

  private static processLogData(data: Partial<AddFuelLogForm>): Partial<FuelLog> {
    const processed = { ...data };

    // Auto-calculate missing price_per_l or total_cost
    if (processed.liters && processed.price_per_l && !processed.total_cost) {
      processed.total_cost = Number((processed.liters * processed.price_per_l).toFixed(2));
    } else if (processed.liters && processed.total_cost && !processed.price_per_l) {
      processed.price_per_l = Number((processed.total_cost / processed.liters).toFixed(2));
    }

    return processed as Partial<FuelLog>;
  }

  // Mileage calculation methods
  static async calculateMileageForCar(carId: string): Promise<{ logs: FuelLogWithMetrics[]; averageMileage: number }> {
    const logs = await this.getFuelLogs(carId);
    return this.computeMileageForLogs(logs);
  }

  static async calculateMileageForAllCars(): Promise<{ logs: FuelLogWithMetrics[]; averageMileage: number }> {
    const allLogs = await this.getFuelLogs();

    // Group by car_id
    const carIdToLogs = new Map<string, FuelLog[]>();
    for (const log of allLogs) {
      const bucket = carIdToLogs.get(log.car_id) || [];
      bucket.push(log);
      carIdToLogs.set(log.car_id, bucket);
    }

    const processedPerCar: Array<{ logs: FuelLogWithMetrics[]; averageMileage: number }> = [];
    for (const [, logs] of carIdToLogs) {
      processedPerCar.push(this.computeMileageForLogs(logs));
    }

    const flattenedLogs = processedPerCar.flatMap(x => x.logs).sort((a, b) => {
      const dateA = new Date(a.filled_at).getTime();
      const dateB = new Date(b.filled_at).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return b.odometer_km - a.odometer_km;
    });

    const totalMileage = processedPerCar.reduce((s, x) => s + x.averageMileage * (x.logs.filter(l => l.mileage != null).length > 0 ? 1 : 0), 0);
    const mileageEntries = processedPerCar.reduce((s, x) => s + x.logs.filter(l => l.mileage != null).length, 0);
    const averageMileage = mileageEntries > 0
      ? flattenedLogs.filter(l => l.mileage != null).reduce((s, l) => s + (l.mileage as number), 0) / mileageEntries
      : 0;

    return { logs: flattenedLogs, averageMileage };
  }

  private static computeMileageForLogs(logs: FuelLog[]): { logs: FuelLogWithMetrics[]; averageMileage: number } {
    // Sort by filled_at ascending for calculation per car
    const sortedLogs = [...logs].sort((a, b) => {
      const dateA = new Date(a.filled_at).getTime();
      const dateB = new Date(b.filled_at).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.odometer_km - b.odometer_km;
    });

    const logsWithMileage: FuelLogWithMetrics[] = [];
    let totalMileage = 0;
    let mileageCount = 0;

    for (let i = 0; i < sortedLogs.length; i++) {
      const currentLog = sortedLogs[i];
      const logWithMileage: FuelLogWithMetrics = { ...currentLog };

      if (!currentLog.is_partial && i > 0) {
        // Find the previous full fill
        let previousFullIndex = i - 1;
        while (previousFullIndex >= 0 && sortedLogs[previousFullIndex].is_partial) {
          previousFullIndex--;
        }

        if (previousFullIndex >= 0) {
          const previousFullLog = sortedLogs[previousFullIndex];
          const distance = currentLog.odometer_km - previousFullLog.odometer_km;

          if (distance > 0) {
            // Sum liters from previous full fill (exclusive) to current full fill (inclusive)
            let totalLiters = currentLog.liters;
            for (let j = previousFullIndex + 1; j < i; j++) {
              totalLiters += sortedLogs[j].liters;
            }

            const mileage = distance / totalLiters;
            logWithMileage.mileage = mileage;
            logWithMileage.distance = distance;

            totalMileage += mileage;
            mileageCount++;
          }
        }
      }

      logsWithMileage.push(logWithMileage);
    }

    // Reverse back to descending order for display
    logsWithMileage.reverse();

    const averageMileage = mileageCount > 0 ? totalMileage / mileageCount : 0;

    return { logs: logsWithMileage, averageMileage };
  }

  static async getCarStatistics(carId: string): Promise<{
    totalSpend: number;
    totalLiters: number;
    totalDistance: number;
    averageMileage: number;
    costPerKm: number;
    last30DaysSpend: number;
    lastFillDate: string | null;
    logCount: number;
  }> {
    const logs = await this.getFuelLogs(carId);

    if (logs.length === 0) {
      return {
        totalSpend: 0,
        totalLiters: 0,
        totalDistance: 0,
        averageMileage: 0,
        costPerKm: 0,
        last30DaysSpend: 0,
        lastFillDate: null,
        logCount: 0,
      };
    }

    const totalSpend = logs.reduce((sum, log) => sum + (log.total_cost || 0), 0);
    const totalLiters = logs.reduce((sum, log) => sum + log.liters, 0);

    // Calculate total distance from first to last odometer reading
    const sortedLogs = [...logs].sort((a, b) =>
      new Date(a.filled_at).getTime() - new Date(b.filled_at).getTime()
    );
    const totalDistance = sortedLogs.length > 1
      ? sortedLogs[sortedLogs.length - 1].odometer_km - sortedLogs[0].odometer_km
      : 0;

    // Get mileage calculation
    const { averageMileage } = await this.calculateMileageForCar(carId);

    const costPerKm = totalDistance > 0 ? totalSpend / totalDistance : 0;

    // Calculate last 30 days spend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaysSpend = logs
      .filter(log => new Date(log.filled_at) >= thirtyDaysAgo)
      .reduce((sum, log) => sum + (log.total_cost || 0), 0);

    const lastFillDate = logs.length > 0 ? logs[0].filled_at : null;

    return {
      totalSpend,
      totalLiters,
      totalDistance,
      averageMileage,
      costPerKm,
      last30DaysSpend,
      lastFillDate,
      logCount: logs.length,
    };
  }
}
