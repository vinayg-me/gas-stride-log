# Phase 3: Fuel Log Management

## Business Context

Implement comprehensive fuel log tracking functionality allowing users to record, edit, and manage their fuel consumption data. This includes the critical full-to-full mileage calculation logic, partial fill handling, receipt image uploads, and form validation. This is the core functionality that enables users to track their vehicle's fuel efficiency and costs.

## Current State

- ✅ FuelLog types and interfaces defined (`src/types/index.ts`)
- ✅ Sample fuel log data structure (`src/lib/sample-data.ts`)
- ✅ Zustand store structure for fuel logs
- ✅ Dialog stories for Add Fuel Log form (static)
- ✅ Recharts integration for future analytics
- ❌ No real fuel log CRUD operations
- ❌ No mileage calculation logic
- ❌ No partial fill handling
- ❌ No receipt image upload functionality
- ❌ No API integration with Supabase

## Implementation Tasks

### 1. Fuel Log API Layer

#### 1.1 Fuel Log Service
**File**: `src/services/fuel-logs.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';
import { FuelLog, AddFuelLogForm } from '@/types';
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
      ...processedData,
      filled_at: logData.filled_at,
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
  static async calculateMileageForCar(carId: string): Promise<{
    logs: Array<FuelLog & { mileage?: number; distance?: number }>;
    averageMileage: number;
  }> {
    const logs = await this.getFuelLogs(carId);
    
    // Sort by filled_at ascending for calculation
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(a.filled_at).getTime() - new Date(b.filled_at).getTime()
    );

    const logsWithMileage: Array<FuelLog & { mileage?: number; distance?: number }> = [];
    let totalMileage = 0;
    let mileageCount = 0;

    for (let i = 0; i < sortedLogs.length; i++) {
      const currentLog = sortedLogs[i];
      const logWithMileage = { ...currentLog };

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

    return {
      logs: logsWithMileage,
      averageMileage,
    };
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
```

#### 1.2 Fuel Log React Query Hooks
**File**: `src/hooks/use-fuel-logs.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FuelLogService } from '@/services/fuel-logs';
import { FuelLog, AddFuelLogForm } from '@/types';
import { toast } from '@/hooks/use-toast';

export const FUEL_LOG_QUERY_KEYS = {
  all: ['fuel-logs'] as const,
  lists: () => [...FUEL_LOG_QUERY_KEYS.all, 'list'] as const,
  list: (carId?: string) => [...FUEL_LOG_QUERY_KEYS.lists(), { carId }] as const,
  details: () => [...FUEL_LOG_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FUEL_LOG_QUERY_KEYS.details(), id] as const,
  mileage: (carId: string) => [...FUEL_LOG_QUERY_KEYS.all, 'mileage', carId] as const,
  statistics: (carId: string) => [...FUEL_LOG_QUERY_KEYS.all, 'statistics', carId] as const,
};

export function useFuelLogs(carId?: string) {
  return useQuery({
    queryKey: FUEL_LOG_QUERY_KEYS.list(carId),
    queryFn: () => FuelLogService.getFuelLogs(carId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFuelLog(id: string) {
  return useQuery({
    queryKey: FUEL_LOG_QUERY_KEYS.detail(id),
    queryFn: () => FuelLogService.getFuelLogById(id),
    enabled: !!id,
  });
}

export function useCarMileage(carId: string) {
  return useQuery({
    queryKey: FUEL_LOG_QUERY_KEYS.mileage(carId),
    queryFn: () => FuelLogService.calculateMileageForCar(carId),
    enabled: !!carId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCarStatistics(carId: string) {
  return useQuery({
    queryKey: FUEL_LOG_QUERY_KEYS.statistics(carId),
    queryFn: () => FuelLogService.getCarStatistics(carId),
    enabled: !!carId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logData: AddFuelLogForm) => FuelLogService.createFuelLog(logData),
    onSuccess: (newLog) => {
      // Update the fuel logs list cache
      queryClient.setQueryData<FuelLog[]>(
        FUEL_LOG_QUERY_KEYS.list(newLog.car_id),
        (oldLogs = []) => [newLog, ...oldLogs]
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: FUEL_LOG_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FUEL_LOG_QUERY_KEYS.mileage(newLog.car_id) });
      queryClient.invalidateQueries({ queryKey: FUEL_LOG_QUERY_KEYS.statistics(newLog.car_id) });

      toast({
        title: "Fuel Log Added Successfully",
        description: `${newLog.liters}L recorded for ${new Date(newLog.filled_at).toLocaleDateString()}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Fuel Log",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AddFuelLogForm> }) =>
      FuelLogService.updateFuelLog(id, updates),
    onSuccess: (updatedLog) => {
      // Update the specific log in cache
      queryClient.setQueryData<FuelLog>(
        FUEL_LOG_QUERY_KEYS.detail(updatedLog.id),
        updatedLog
      );

      // Update the log in the list cache
      queryClient.setQueryData<FuelLog[]>(
        FUEL_LOG_QUERY_KEYS.list(updatedLog.car_id),
        (oldLogs = []) =>
          oldLogs.map((log) => (log.id === updatedLog.id ? updatedLog : log))
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: FUEL_LOG_QUERY_KEYS.mileage(updatedLog.car_id) });
      queryClient.invalidateQueries({ queryKey: FUEL_LOG_QUERY_KEYS.statistics(updatedLog.car_id) });

      toast({
        title: "Fuel Log Updated Successfully",
        description: "Your fuel log has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Fuel Log",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: FuelLog) => {
      // Delete receipt if exists
      if (log.receipt_url) {
        await FuelLogService.deleteReceipt(log.receipt_url);
      }
      await FuelLogService.deleteFuelLog(log.id);
      return log;
    },
    onSuccess: (deletedLog) => {
      // Remove the log from the list cache
      queryClient.setQueryData<FuelLog[]>(
        FUEL_LOG_QUERY_KEYS.list(deletedLog.car_id),
        (oldLogs = []) => oldLogs.filter((log) => log.id !== deletedLog.id)
      );

      // Remove the specific log from cache
      queryClient.removeQueries({ queryKey: FUEL_LOG_QUERY_KEYS.detail(deletedLog.id) });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: FUEL_LOG_QUERY_KEYS.mileage(deletedLog.car_id) });
      queryClient.invalidateQueries({ queryKey: FUEL_LOG_QUERY_KEYS.statistics(deletedLog.car_id) });

      toast({
        title: "Fuel Log Deleted Successfully",
        description: "The fuel log has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Fuel Log",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUploadReceipt() {
  return useMutation({
    mutationFn: ({ file, userId, logId }: { file: File; userId: string; logId: string }) =>
      FuelLogService.uploadReceipt(file, userId, logId),
    onError: (error: Error) => {
      toast({
        title: "Failed to Upload Receipt",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
```

### 2. Fuel Log Form Components

#### 2.1 Fuel Log Form
**File**: `src/components/fuel-logs/fuel-log-form.tsx`

```typescript
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Fuel, Upload, X, AlertTriangle } from 'lucide-react';
import { FuelLog, AddFuelLogForm, Car } from '@/types';
import { useUploadReceipt } from '@/hooks/use-fuel-logs';
import { useAuth } from '@/contexts/auth-context';

const fuelLogFormSchema = z.object({
  car_id: z.string().min(1, 'Please select a car'),
  filled_at: z.string().min(1, 'Fill date is required'),
  odometer_km: z
    .number()
    .positive('Odometer reading must be positive')
    .max(9999999, 'Odometer reading seems too high'),
  liters: z
    .number()
    .positive('Fuel amount must be positive')
    .max(500, 'Fuel amount seems too high'),
  price_per_l: z
    .number()
    .positive('Price per liter must be positive')
    .max(1000, 'Price per liter seems too high')
    .optional(),
  total_cost: z
    .number()
    .positive('Total cost must be positive')
    .max(100000, 'Total cost seems too high')
    .optional(),
  is_partial: z.boolean().default(false),
  station: z.string().max(100, 'Station name is too long').optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
}).refine(
  (data) => data.price_per_l !== undefined || data.total_cost !== undefined,
  {
    message: 'Either price per liter or total cost must be provided',
    path: ['price_per_l'],
  }
);

interface FuelLogFormProps {
  cars: Car[];
  fuelLog?: FuelLog;
  defaultCarId?: string;
  onSubmit: (data: AddFuelLogForm) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export function FuelLogForm({
  cars,
  fuelLog,
  defaultCarId,
  onSubmit,
  onCancel,
  isLoading = false,
  className
}: FuelLogFormProps) {
  const { user } = useAuth();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(
    fuelLog?.receipt_url || null
  );
  const uploadReceiptMutation = useUploadReceipt();

  const form = useForm<AddFuelLogForm>({
    resolver: zodResolver(fuelLogFormSchema),
    defaultValues: {
      car_id: fuelLog?.car_id || defaultCarId || '',
      filled_at: fuelLog?.filled_at || new Date().toISOString().split('T')[0],
      odometer_km: fuelLog?.odometer_km || undefined,
      liters: fuelLog?.liters || undefined,
      price_per_l: fuelLog?.price_per_l || undefined,
      total_cost: fuelLog?.total_cost || undefined,
      is_partial: fuelLog?.is_partial || false,
      station: fuelLog?.station || '',
      notes: fuelLog?.notes || '',
    },
  });

  const watchedValues = form.watch(['liters', 'price_per_l', 'total_cost', 'is_partial']);

  // Auto-calculate missing price or total cost
  useEffect(() => {
    const [liters, pricePerL, totalCost] = watchedValues;

    if (liters && pricePerL && !totalCost) {
      form.setValue('total_cost', liters * pricePerL);
    } else if (liters && totalCost && !pricePerL) {
      form.setValue('price_per_l', totalCost / liters);
    }
  }, [watchedValues, form]);

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPEG, PNG, WebP, or PDF file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setReceiptFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setReceiptPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleSubmit = async (data: AddFuelLogForm) => {
    let receiptUrl = fuelLog?.receipt_url;

    // Upload receipt if new file selected
    if (receiptFile && user) {
      try {
        const tempLogId = fuelLog?.id || `temp-${Date.now()}`;
        receiptUrl = await uploadReceiptMutation.mutateAsync({
          file: receiptFile,
          userId: user.id,
          logId: tempLogId,
        });
      } catch (error) {
        // Receipt upload failed, but don't prevent form submission
        console.error('Receipt upload failed:', error);
      }
    }

    const submitData: AddFuelLogForm = {
      ...data,
      receipt_url: receiptUrl,
    };

    onSubmit(submitData);
  };

  const selectedCar = cars.find(car => car.id === form.watch('car_id'));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5" />
          {fuelLog ? 'Edit Fuel Log' : 'Add Fuel Log'}
        </CardTitle>
        <CardDescription>
          {fuelLog 
            ? 'Update your fuel consumption record'
            : 'Record your fuel consumption details for accurate tracking'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Car Selection */}
            <FormField
              control={form.control}
              name="car_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isLoading || !!defaultCarId}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="">Select a car</option>
                      {cars.map((car) => (
                        <option key={car.id} value={car.id}>
                          {car.make} {car.model} ({car.registration})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Odometer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="filled_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fill Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="odometer_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odometer Reading (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="45230"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Current odometer reading in kilometers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fuel Amount and Partial Fill */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Amount (L)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="35.50"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Amount of fuel added in liters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_partial"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-center">
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium">
                        Partial Fill
                      </FormLabel>
                    </div>
                    <FormDescription>
                      Toggle if this was not a full tank fill
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Partial Fill Warning */}
            {form.watch('is_partial') && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Partial fills are included in totals but not used for mileage calculations. 
                  Only full-to-full fills provide accurate km/L measurements.
                </AlertDescription>
              </Alert>
            )}

            {/* Price Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price_per_l"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Liter (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="105.50"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Price per liter in rupees
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Cost (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="3742.50"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Total amount paid in rupees
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Station */}
            <FormField
              control={form.control}
              name="station"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Station (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Indian Oil Petrol Pump"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Name or location of the fuel station
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label>Receipt (Optional)</Label>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('receipt-upload')?.click()}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Receipt
                </Button>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
                {(receiptFile || receiptPreview) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeReceipt}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              {receiptPreview && receiptPreview.startsWith('data:image') && (
                <div className="mt-2">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="max-w-xs max-h-32 object-contain rounded-md border"
                  />
                </div>
              )}
              {receiptFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {receiptFile.name} ({(receiptFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this fill-up..."
                      className="resize-none"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about this fuel log entry
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {fuelLog ? 'Update Log' : 'Save Log'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

#### 2.2 Fuel Log Dialog Components
**File**: `src/components/fuel-logs/fuel-log-dialog.tsx`

```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { FuelLogForm } from './fuel-log-form';
import { DeleteFuelLogDialog } from './delete-fuel-log-dialog';
import { FuelLog, AddFuelLogForm, Car } from '@/types';
import { useCreateFuelLog, useUpdateFuelLog } from '@/hooks/use-fuel-logs';

interface AddFuelLogDialogProps {
  cars: Car[];
  defaultCarId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddFuelLogDialog({ 
  cars, 
  defaultCarId, 
  trigger, 
  open, 
  onOpenChange 
}: AddFuelLogDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const createFuelLogMutation = useCreateFuelLog();

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const handleSubmit = async (data: AddFuelLogForm) => {
    try {
      await createFuelLogMutation.mutateAsync(data);
      handleOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : isOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Fuel Log
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Fuel Log</DialogTitle>
        </DialogHeader>
        <FuelLogForm
          cars={cars}
          defaultCarId={defaultCarId}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isLoading={createFuelLogMutation.isPending}
          className="border-0 shadow-none"
        />
      </DialogContent>
    </Dialog>
  );
}

interface EditFuelLogDialogProps {
  cars: Car[];
  fuelLog: FuelLog;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditFuelLogDialog({ 
  cars, 
  fuelLog, 
  trigger, 
  open, 
  onOpenChange 
}: EditFuelLogDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const updateFuelLogMutation = useUpdateFuelLog();

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const handleSubmit = async (data: AddFuelLogForm) => {
    try {
      await updateFuelLogMutation.mutateAsync({ id: fuelLog.id, updates: data });
      handleOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : isOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Fuel Log</DialogTitle>
        </DialogHeader>
        <FuelLogForm
          cars={cars}
          fuelLog={fuelLog}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isLoading={updateFuelLogMutation.isPending}
          className="border-0 shadow-none"
        />
      </DialogContent>
    </Dialog>
  );
}
```

#### 2.3 Delete Fuel Log Dialog
**File**: `src/components/fuel-logs/delete-fuel-log-dialog.tsx`

```typescript
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { FuelLog } from '@/types';
import { useDeleteFuelLog } from '@/hooks/use-fuel-logs';

interface DeleteFuelLogDialogProps {
  fuelLog: FuelLog;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteFuelLogDialog({ 
  fuelLog, 
  trigger, 
  open, 
  onOpenChange 
}: DeleteFuelLogDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteFuelLogMutation = useDeleteFuelLog();

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFuelLogMutation.mutateAsync(fuelLog);
      handleOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : isOpen;

  return (
    <AlertDialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Fuel Log</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this fuel log entry?
            <br />
            <br />
            <strong>Details:</strong>
            <br />
            Date: {new Date(fuelLog.filled_at).toLocaleDateString()}
            <br />
            Amount: {fuelLog.liters}L
            <br />
            {fuelLog.total_cost && `Cost: ₹${fuelLog.total_cost.toFixed(2)}`}
            <br />
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteFuelLogMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteFuelLogMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteFuelLogMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Log
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 3. Fuel Log List Component

#### 3.1 Fuel Log List
**File**: `src/components/fuel-logs/fuel-log-list.tsx`

```typescript
import { motion } from 'framer-motion';
import { MoreVertical, Edit, Trash2, Receipt, Fuel, Calendar, MapPin, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FuelLog, Car } from '@/types';
import { EditFuelLogDialog } from './fuel-log-dialog';
import { DeleteFuelLogDialog } from './delete-fuel-log-dialog';
import { useFuelLogs, useCarMileage } from '@/hooks/use-fuel-logs';
import { cn } from '@/lib/utils';

interface FuelLogListProps {
  carId?: string;
  cars?: Car[];
  className?: string;
}

export function FuelLogList({ carId, cars = [], className }: FuelLogListProps) {
  const { data: fuelLogs = [], isLoading, error } = useFuelLogs(carId);
  const { data: mileageData } = useCarMileage(carId || '');

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>
          Failed to load fuel logs. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (fuelLogs.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Fuel className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Fuel Logs Yet
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Start tracking your fuel consumption by adding your first fuel log entry.
          </p>
        </CardContent>
      </Card>
    );
  }

  const logsWithMileage = mileageData?.logs || fuelLogs.map(log => ({ ...log }));

  return (
    <div className={cn("space-y-4", className)}>
      {logsWithMileage.map((log, index) => {
        const car = cars.find(c => c.id === log.car_id);
        
        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass-card hover:glow-primary transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Fuel className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {log.liters}L
                        </h3>
                        {log.is_partial && (
                          <Badge variant="secondary" className="text-xs">
                            Partial
                          </Badge>
                        )}
                        {log.mileage && (
                          <Badge variant="outline" className="text-xs">
                            {log.mileage.toFixed(1)} km/L
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.filled_at).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      {car && !carId && (
                        <p className="text-xs text-muted-foreground">
                          {car.make} {car.model}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditFuelLogDialog 
                        cars={cars}
                        fuelLog={log} 
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Log
                          </DropdownMenuItem>
                        } 
                      />
                      <DeleteFuelLogDialog 
                        fuelLog={log} 
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Log
                          </DropdownMenuItem>
                        } 
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <div className="text-lg font-bold text-primary">
                      {log.odometer_km.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">km</div>
                  </div>
                  
                  {log.price_per_l && (
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-lg font-bold text-secondary">
                        ₹{log.price_per_l.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">per liter</div>
                    </div>
                  )}
                  
                  {log.total_cost && (
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-lg font-bold text-green-500">
                        ₹{log.total_cost.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">total</div>
                    </div>
                  )}

                  {log.distance && (
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-lg font-bold text-orange-500">
                        {log.distance}
                      </div>
                      <div className="text-xs text-muted-foreground">km driven</div>
                    </div>
                  )}
                </div>

                {(log.station || log.notes || log.receipt_url) && (
                  <div className="space-y-2 pt-4 border-t border-border/50">
                    {log.station && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{log.station}</span>
                      </div>
                    )}
                    
                    {log.notes && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 mt-0.5" />
                        <span>{log.notes}</span>
                      </div>
                    )}
                    
                    {log.receipt_url && (
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-sm"
                          onClick={() => window.open(log.receipt_url, '_blank')}
                        >
                          View Receipt
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
```

## Testing Implementation

### Unit Tests

#### 3.1 Fuel Log Service Tests
**File**: `src/services/__tests__/fuel-logs.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FuelLogService } from '../fuel-logs';
import { supabase } from '@/integrations/supabase/client';
import { AddFuelLogForm } from '@/types';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

const mockSupabaseQuery = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
};

const mockStorage = {
  upload: vi.fn(),
  remove: vi.fn(),
  getPublicUrl: vi.fn(),
};

describe('FuelLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.from as any).mockReturnValue(mockSupabaseQuery);
    (supabase.storage.from as any).mockReturnValue(mockStorage);
  });

  describe('processLogData', () => {
    it('should calculate total_cost from price_per_l and liters', () => {
      const data = {
        liters: 40,
        price_per_l: 105.50,
      };

      const processed = (FuelLogService as any).processLogData(data);

      expect(processed.total_cost).toBe(4220);
      expect(processed.price_per_l).toBe(105.50);
      expect(processed.liters).toBe(40);
    });

    it('should calculate price_per_l from total_cost and liters', () => {
      const data = {
        liters: 40,
        total_cost: 4220,
      };

      const processed = (FuelLogService as any).processLogData(data);

      expect(processed.price_per_l).toBe(105.50);
      expect(processed.total_cost).toBe(4220);
      expect(processed.liters).toBe(40);
    });

    it('should not modify data when both price_per_l and total_cost are provided', () => {
      const data = {
        liters: 40,
        price_per_l: 105.50,
        total_cost: 4000, // Different from calculated
      };

      const processed = (FuelLogService as any).processLogData(data);

      expect(processed.price_per_l).toBe(105.50);
      expect(processed.total_cost).toBe(4000);
      expect(processed.liters).toBe(40);
    });
  });

  describe('calculateMileageForCar', () => {
    it('should calculate mileage correctly for full-to-full fills', async () => {
      const mockLogs = [
        {
          id: '1',
          car_id: 'car-1',
          filled_at: '2024-01-01',
          odometer_km: 1000,
          liters: 40,
          is_partial: false,
          total_cost: 4000,
        },
        {
          id: '2',
          car_id: 'car-1',
          filled_at: '2024-01-15',
          odometer_km: 1500,
          liters: 35,
          is_partial: false,
          total_cost: 3500,
        },
        {
          id: '3',
          car_id: 'car-1',
          filled_at: '2024-02-01',
          odometer_km: 2000,
          liters: 30,
          is_partial: false,
          total_cost: 3000,
        },
      ];

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockLogs,
        error: null,
      });

      const result = await FuelLogService.calculateMileageForCar('car-1');

      expect(result.logs).toHaveLength(3);
      
      // First log should have no mileage (no previous full fill)
      expect(result.logs[2]).not.toHaveProperty('mileage');
      
      // Second log: 500km / 35L = 14.29 km/L
      expect(result.logs[1].mileage).toBeCloseTo(14.29, 2);
      expect(result.logs[1].distance).toBe(500);
      
      // Third log: 500km / 30L = 16.67 km/L
      expect(result.logs[0].mileage).toBeCloseTo(16.67, 2);
      expect(result.logs[0].distance).toBe(500);

      // Average mileage: (14.29 + 16.67) / 2 = 15.48
      expect(result.averageMileage).toBeCloseTo(15.48, 2);
    });

    it('should handle partial fills correctly', async () => {
      const mockLogs = [
        {
          id: '1',
          car_id: 'car-1',
          filled_at: '2024-01-01',
          odometer_km: 1000,
          liters: 40,
          is_partial: false,
          total_cost: 4000,
        },
        {
          id: '2',
          car_id: 'car-1',
          filled_at: '2024-01-10',
          odometer_km: 1200,
          liters: 20,
          is_partial: true, // Partial fill
          total_cost: 2000,
        },
        {
          id: '3',
          car_id: 'car-1',
          filled_at: '2024-01-20',
          odometer_km: 1600,
          liters: 25,
          is_partial: false,
          total_cost: 2500,
        },
      ];

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockLogs,
        error: null,
      });

      const result = await FuelLogService.calculateMileageForCar('car-1');

      // Third log should include partial fill in calculation
      // Distance: 1600 - 1000 = 600km
      // Liters: 20 (partial) + 25 (full) = 45L
      // Mileage: 600 / 45 = 13.33 km/L
      expect(result.logs[0].mileage).toBeCloseTo(13.33, 2);
      expect(result.logs[0].distance).toBe(600);

      // Partial fill should not have mileage
      expect(result.logs[1]).not.toHaveProperty('mileage');
    });
  });
});
```

#### 3.2 Fuel Log Form Tests
**File**: `src/components/fuel-logs/__tests__/fuel-log-form.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { FuelLogForm } from '../fuel-log-form';
import { AddFuelLogForm, Car } from '@/types';
import { useAuth } from '@/contexts/auth-context';

// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

// Mock upload hook
vi.mock('@/hooks/use-fuel-logs', () => ({
  useUploadReceipt: () => ({
    mutateAsync: vi.fn().mockResolvedValue('https://example.com/receipt.jpg'),
    isPending: false,
  }),
}));

const mockCars: Car[] = [
  {
    id: '1',
    owner_id: 'user-1',
    registration: 'KA-01-AB-1234',
    make: 'Honda',
    model: 'City',
    fuel_type: 'petrol',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe('FuelLogForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: { id: 'user-1' },
    });
  });

  it('should render form fields correctly', () => {
    render(
      <FuelLogForm
        cars={mockCars}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/car/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fill date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/odometer reading/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fuel amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/partial fill/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price per liter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total cost/i)).toBeInTheDocument();
  });

  it('should auto-calculate total cost from price per liter', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/fuel amount/i), '40');
    await user.type(screen.getByLabelText(/price per liter/i), '105.50');

    await waitFor(() => {
      expect(screen.getByDisplayValue('4220')).toBeInTheDocument();
    });
  });

  it('should auto-calculate price per liter from total cost', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/fuel amount/i), '40');
    await user.type(screen.getByLabelText(/total cost/i), '4220');

    await waitFor(() => {
      expect(screen.getByDisplayValue('105.5')).toBeInTheDocument();
    });
  });

  it('should show partial fill warning when partial fill is enabled', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByLabelText(/partial fill/i));

    await waitFor(() => {
      expect(screen.getByText(/partial fills are included in totals but not used for mileage calculations/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        defaultCarId="1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/odometer reading/i), '45230');
    await user.type(screen.getByLabelText(/fuel amount/i), '40');
    await user.type(screen.getByLabelText(/price per liter/i), '105.50');
    await user.type(screen.getByLabelText(/fuel station/i), 'Indian Oil');

    await user.click(screen.getByRole('button', { name: /save log/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          car_id: '1',
          odometer_km: 45230,
          liters: 40,
          price_per_l: 105.50,
          total_cost: 4220,
          is_partial: false,
          station: 'Indian Oil',
        })
      );
    });
  });

  it('should show validation errors for invalid data', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: /save log/i }));

    await waitFor(() => {
      expect(screen.getByText(/please select a car/i)).toBeInTheDocument();
      expect(screen.getByText(/odometer reading must be positive/i)).toBeInTheDocument();
      expect(screen.getByText(/fuel amount must be positive/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should require either price per liter or total cost', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        defaultCarId="1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/odometer reading/i), '45230');
    await user.type(screen.getByLabelText(/fuel amount/i), '40');

    await user.click(screen.getByRole('button', { name: /save log/i }));

    await waitFor(() => {
      expect(screen.getByText(/either price per liter or total cost must be provided/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
```

## Storybook Updates

#### 3.3 Fuel Log Component Stories
**File**: `src/components/fuel-logs/fuel-log-form.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { FuelLogForm } from './fuel-log-form';
import { action } from '@storybook/addon-actions';
import { Car } from '@/types';

const mockCars: Car[] = [
  {
    id: '1',
    owner_id: 'user-1',
    registration: 'KA-01-AB-1234',
    make: 'Honda',
    model: 'City',
    fuel_type: 'petrol',
    year: 2020,
    tank_capacity_l: 40,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    owner_id: 'user-1',
    registration: 'KA-05-CD-5678',
    make: 'Maruti',
    model: 'Swift',
    fuel_type: 'petrol',
    year: 2021,
    tank_capacity_l: 37,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const meta = {
  title: 'FuelLogs/FuelLogForm',
  component: FuelLogForm,
  parameters: {
    layout: 'centered',
  },
  args: {
    cars: mockCars,
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FuelLogForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddFuelLog: Story = {};

export const WithDefaultCar: Story = {
  args: {
    defaultCarId: '1',
  },
};

export const EditFuelLog: Story = {
  args: {
    fuelLog: {
      id: '1',
      car_id: '1',
      filled_at: '2024-01-15',
      odometer_km: 45230,
      liters: 40,
      price_per_l: 105.50,
      total_cost: 4220,
      is_partial: false,
      station: 'Indian Oil Petrol Pump',
      notes: 'Full tank after long trip',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
    },
  },
};

export const PartialFill: Story = {
  args: {
    defaultCarId: '1',
    fuelLog: {
      id: '2',
      car_id: '1',
      filled_at: '2024-01-10',
      odometer_km: 44850,
      liters: 25,
      price_per_l: 104.80,
      total_cost: 2620,
      is_partial: true,
      station: 'HP Petrol Pump',
      notes: 'Quick top-up',
      created_at: '2024-01-10T15:45:00Z',
      updated_at: '2024-01-10T15:45:00Z',
    },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
```

## How to Test

### Manual Testing Checklist

#### Fuel Log CRUD Operations
- [ ] Create new fuel log with all fields
- [ ] Create fuel log with only required fields
- [ ] Create partial fill fuel log (warning should show)
- [ ] Auto-calculation works for price/total cost
- [ ] Edit existing fuel log
- [ ] Delete fuel log (with confirmation)
- [ ] Upload receipt image (JPEG, PNG, WebP, PDF)
- [ ] Remove uploaded receipt
- [ ] Form validation works for all fields

#### Mileage Calculations
- [ ] Full-to-full mileage calculation is accurate
- [ ] Partial fills are excluded from mileage calculation
- [ ] Partial fills are included in totals and distance
- [ ] Average mileage calculation is correct
- [ ] Car statistics are accurate

#### UI/UX Testing
- [ ] Fuel log list displays correctly
- [ ] Loading states show during API calls
- [ ] Error states display appropriate messages
- [ ] Dialogs open/close correctly
- [ ] Form resets properly after submission
- [ ] Receipt preview works for images
- [ ] Responsive design works on mobile

### Automated Testing

```bash
# Run fuel log tests
npm run test src/services/fuel-logs.test.ts
npm run test src/components/fuel-logs/

# Run mileage calculation tests
npm run test -- --testNamePattern="mileage"

# Run all fuel log related tests
npm run test -- --testNamePattern="fuel"

# Run tests with coverage
npm run test:coverage
```

## Definition of Done

- [ ] **CRUD Operations**: All fuel log create, read, update, delete operations working
- [ ] **Mileage Calculations**: Full-to-full method implemented correctly
- [ ] **Partial Fill Handling**: Partial fills properly handled in calculations
- [ ] **Form Validation**: Comprehensive validation with auto-calculation
- [ ] **Receipt Upload**: Image/PDF upload to Supabase Storage working
- [ ] **API Integration**: Real Supabase integration with error handling
- [ ] **Statistics**: Car statistics calculation implemented
- [ ] **UI Components**: Fuel log list and forms working smoothly
- [ ] **Error Handling**: Proper error states and user feedback
- [ ] **Unit Tests**: >80% coverage for fuel log components and services
- [ ] **Integration Tests**: Fuel log management flows tested with MSW
- [ ] **Storybook**: Fuel log components documented with stories
- [ ] **Manual Testing**: All fuel log scenarios tested
- [ ] **Code Review**: Code reviewed and approved

## Notes

- **Mileage Method**: Implements industry-standard full-to-full calculation
- **Data Validation**: Ensures either price_per_l or total_cost is provided
- **File Upload**: Supports common image formats and PDF receipts
- **Performance**: Optimistic updates and intelligent cache invalidation
- **Accessibility**: All form inputs properly labeled and accessible
- **Mobile**: Responsive design for fuel log management on mobile devices
- **Future**: Analytics charts will use this data in Phase 4
