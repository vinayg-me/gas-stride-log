import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics';

export const ANALYTICS_QUERY_KEYS = {
  all: ['analytics'] as const,
  mileageTrends: (carId: string, months: number) => [...ANALYTICS_QUERY_KEYS.all, 'mileage', carId, months] as const,
  spendingTrends: (carId: string, months: number) => [...ANALYTICS_QUERY_KEYS.all, 'spending', carId, months] as const,
  costPerKmTrends: (carId: string, months: number) => [...ANALYTICS_QUERY_KEYS.all, 'cost-per-km', carId, months] as const,
  fuelPriceTrends: (carId: string, months: number) => [...ANALYTICS_QUERY_KEYS.all, 'fuel-price', carId, months] as const,
  overallAnalytics: (carIds?: string[]) => [...ANALYTICS_QUERY_KEYS.all, 'overall', carIds] as const,
};

export function useMileageTrends(carId: string, months: number = 12) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.mileageTrends(carId, months),
    queryFn: () => AnalyticsService.getMileageTrends(carId, months),
    enabled: !!carId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSpendingTrends(carId: string, months: number = 12) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.spendingTrends(carId, months),
    queryFn: () => AnalyticsService.getSpendingTrends(carId, months),
    enabled: !!carId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCostPerKmTrends(carId: string, months: number = 12) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.costPerKmTrends(carId, months),
    queryFn: () => AnalyticsService.getCostPerKmTrends(carId, months),
    enabled: !!carId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useFuelPriceTrends(carId: string, months: number = 12) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.fuelPriceTrends(carId, months),
    queryFn: () => AnalyticsService.getFuelPriceTrends(carId, months),
    enabled: !!carId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useOverallAnalytics(carIds?: string[]) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.overallAnalytics(carIds),
    queryFn: () => AnalyticsService.getOverallAnalytics(carIds),
    staleTime: 5 * 60 * 1000,
  });
}
