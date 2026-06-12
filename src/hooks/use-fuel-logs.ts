import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FuelLogService } from '@/services/fuel-logs';
import { CarService } from '@/services/cars';
import { FuelLog, AddFuelLogForm, Car } from '@/types';
import { toast } from '@/hooks/use-toast';
import { getCarUnits, convertCurrency, convertDistance, convertVolume } from '@/lib/units';

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

export function useCarMileage(carId?: string) {
  return useQuery({
    queryKey: carId
      ? FUEL_LOG_QUERY_KEYS.mileage(carId)
      : ([...FUEL_LOG_QUERY_KEYS.all, 'mileage', 'all-cars'] as const),
    queryFn: () => (carId ? FuelLogService.calculateMileageForCar(carId) : FuelLogService.calculateMileageForAllCars()),
    enabled: true,
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

// Aggregate overall stats across multiple cars
export function useOverallStatistics(carIds: string[]) {
  return useQuery({
    queryKey: [...FUEL_LOG_QUERY_KEYS.all, 'overall', ...carIds],
    enabled: carIds.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [cars, perCar] = await Promise.all([
        CarService.getCars(),
        Promise.all(carIds.map((id) => FuelLogService.getCarStatistics(id)))
      ]);

      const baseCar = cars.find((c) => carIds.includes(c.id));
      const { currency: baseCurrency, distanceUnit: baseDistance, volumeUnit: baseVolume } = getCarUnits(baseCar);

      let totalSpend = 0;
      let totalLiters = 0;
      let totalDistance = 0;
      let last30DaysSpend = 0;

      for (let i = 0; i < carIds.length; i++) {
        const carId = carIds[i];
        const car = cars.find((c) => c.id === carId);
        const stats = perCar[i];
        if (!stats) continue;

        const { currency, distanceUnit, volumeUnit } = getCarUnits(car);

        totalSpend += convertCurrency(stats.totalSpend, currency, baseCurrency);
        last30DaysSpend += convertCurrency(stats.last30DaysSpend, currency, baseCurrency);
        totalDistance += convertDistance(stats.totalDistance, distanceUnit, baseDistance);

        if (volumeUnit === 'gal' || volumeUnit === 'L') {
          totalLiters += convertVolume(stats.totalLiters, volumeUnit, baseVolume);
        } else {
          totalLiters += stats.totalLiters;
        }
      }

      const averageMileage = totalLiters > 0 ? totalDistance / totalLiters : 0;
      const costPerKm = totalDistance > 0 ? totalSpend / totalDistance : 0;

      return {
        totalSpend,
        totalLiters,
        totalDistance,
        averageMileage,
        costPerKm,
        last30DaysSpend,
        baseCurrency,
        baseDistance,
        baseVolume,
      };
    },
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
      // Also invalidate the all-cars mileage and overall aggregates used on Dashboard
      queryClient.invalidateQueries({ queryKey: [...FUEL_LOG_QUERY_KEYS.all, 'mileage', 'all-cars'] });
      queryClient.invalidateQueries({ queryKey: [...FUEL_LOG_QUERY_KEYS.all, 'overall'] });

      // Look up car in cache to set correct dynamic unit (L vs kWh vs kg)
      const cars = queryClient.getQueryData<Car[]>(['cars', 'list']) || [];
      const car = cars.find((c) => c.id === newLog.car_id);
      const unit = car?.fuel_type === 'electric' ? 'kWh' : (car?.fuel_type === 'cng' ? 'kg' : 'L');

      toast({
        title: "Fuel Log Added Successfully",
        description: `${newLog.liters}${unit} recorded for ${new Date(newLog.filled_at).toLocaleDateString()}`,
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
      // Also invalidate the all-cars mileage and overall aggregates used on Dashboard
      queryClient.invalidateQueries({ queryKey: [...FUEL_LOG_QUERY_KEYS.all, 'mileage', 'all-cars'] });
      queryClient.invalidateQueries({ queryKey: [...FUEL_LOG_QUERY_KEYS.all, 'overall'] });

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
      // Also invalidate the all-cars mileage and overall aggregates used on Dashboard
      queryClient.invalidateQueries({ queryKey: [...FUEL_LOG_QUERY_KEYS.all, 'mileage', 'all-cars'] });
      queryClient.invalidateQueries({ queryKey: [...FUEL_LOG_QUERY_KEYS.all, 'overall'] });

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
