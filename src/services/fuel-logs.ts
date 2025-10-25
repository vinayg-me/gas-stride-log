import { supabase } from '@/integrations/supabase/client';
import { FuelLog, AddFuelLogForm, FuelLogWithMetrics } from '@/types';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type FuelLogRow = Tables<'fuel_logs'>;
type FuelLogInsert = TablesInsert<'fuel_logs'>;
type FuelLogUpdate = TablesUpdate<'fuel_logs'>;

export class FuelLogService {
  static async getFuelLogs(carId?: string): Promise<FuelLog[]> {
    let query = supabase
      .from('fuel_logs')
      .select('*')
      .order('filled_at', { ascending: false });

    if (carId) {
      query = query.eq('car_id', carId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching fuel logs:', error);
      throw new Error(`Failed to fetch fuel logs: ${error.message}`);
    }

    return data as FuelLog[];
  }

  static async getFuelLogById(id: string): Promise<FuelLog | null> {
    const { data, error } = await supabase
      .from('fuel_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Fuel log not found
      }
      console.error('Error fetching fuel log:', error);
      throw new Error(`Failed to fetch fuel log: ${error.message}`);
    }

    return data as FuelLog;
  }

  static async createFuelLog(logData: AddFuelLogForm): Promise<FuelLog> {
    // Calculate missing price or total cost
    const processedData = this.processLogData(logData);

    const logInsert: FuelLogInsert = {
      car_id: logData.car_id,
      filled_at: logData.filled_at,
      odometer_km: logData.odometer_km,
      liters: logData.liters,
      is_partial: logData.is_partial,
      price_per_l: processedData.price_per_l ?? null,
      total_cost: processedData.total_cost ?? null,
      station: logData.station ?? null,
      notes: logData.notes ?? null,
      receipt_url: logData.receipt_url ?? null,
    };

    const { data, error } = await supabase
      .from('fuel_logs')
      .insert(logInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating fuel log:', error);
      throw new Error(`Failed to create fuel log: ${error.message}`);
    }

    return data as FuelLog;
  }

  static async updateFuelLog(id: string, updates: Partial<AddFuelLogForm>): Promise<FuelLog> {
    // Process the updates to calculate missing price or total cost
    const processedUpdates = this.processLogData(updates);

    const { data, error } = await supabase
      .from('fuel_logs')
      .update(processedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating fuel log:', error);
      throw new Error(`Failed to update fuel log: ${error.message}`);
    }

    return data as FuelLog;
  }

  static async deleteFuelLog(id: string): Promise<void> {
    const { error } = await supabase
      .from('fuel_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting fuel log:', error);
      throw new Error(`Failed to delete fuel log: ${error.message}`);
    }
  }

  static async uploadReceipt(file: File, userId: string, logId: string): Promise<string> {
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

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(data.path);

    return publicUrl;
  }

  static async deleteReceipt(receiptUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(receiptUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // Get last two parts: userId/filename

      const { error } = await supabase.storage
        .from('receipts')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting receipt:', error);
        // Don't throw error for receipt deletion failure
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

  private static processLogData(data: Partial<AddFuelLogForm>): Partial<FuelLogInsert> {
    const processed = { ...data };

    // Auto-calculate missing price_per_l or total_cost
    if (processed.liters && processed.price_per_l && !processed.total_cost) {
      processed.total_cost = processed.liters * processed.price_per_l;
    } else if (processed.liters && processed.total_cost && !processed.price_per_l) {
      processed.price_per_l = processed.total_cost / processed.liters;
    }

    return processed;
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

    const flattenedLogs = processedPerCar.flatMap(x => x.logs).sort((a, b) =>
      new Date(b.filled_at).getTime() - new Date(a.filled_at).getTime()
    );

    const totalMileage = processedPerCar.reduce((s, x) => s + x.averageMileage * (x.logs.filter(l => l.mileage != null).length > 0 ? 1 : 0), 0);
    const mileageEntries = processedPerCar.reduce((s, x) => s + x.logs.filter(l => l.mileage != null).length, 0);
    const averageMileage = mileageEntries > 0
      ? flattenedLogs.filter(l => l.mileage != null).reduce((s, l) => s + (l.mileage as number), 0) / mileageEntries
      : 0;

    return { logs: flattenedLogs, averageMileage };
  }

  private static computeMileageForLogs(logs: FuelLog[]): { logs: FuelLogWithMetrics[]; averageMileage: number } {
    // Sort by filled_at ascending for calculation per car
    const sortedLogs = [...logs].sort((a, b) =>
      new Date(a.filled_at).getTime() - new Date(b.filled_at).getTime()
    );

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
