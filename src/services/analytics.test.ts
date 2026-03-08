import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnalyticsService } from './analytics';
import { FuelLogService } from './fuel-logs';

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getMileageTrends', () => {
    it('should return mileage trend data correctly', async () => {
      const mockMileageData = {
        logs: [
          {
            id: '1',
            car_id: 'car-1',
            filled_at: '2025-12-15',
            odometer_km: 1500,
            liters: 35,
            mileage: 14.29,
            distance: 500,
            is_partial: false,
            created_at: '2025-12-15T00:00:00Z',
            updated_at: '2025-12-15T00:00:00Z',
          },
          {
            id: '2',
            car_id: 'car-1',
            filled_at: '2026-01-01',
            odometer_km: 2000,
            liters: 30,
            mileage: 16.67,
            distance: 500,
            is_partial: false,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
        averageMileage: 15.48,
      };

      vi.spyOn(FuelLogService, 'calculateMileageForCar').mockResolvedValue(mockMileageData);

      const result = await AnalyticsService.getMileageTrends('car-1', 12);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        date: '2026-01-01',
        value: 16.67,
        kmpl: 16.67,
        distance: 500,
        liters: 30,
      });
      expect(result[1]).toMatchObject({
        date: '2025-12-15',
        value: 14.29,
        kmpl: 14.29,
        distance: 500,
        liters: 35,
      });
    });
  });

  describe('getSpendingTrends', () => {
    it('should group spending data by month', async () => {
      const mockLogs = [
        {
          id: '1',
          car_id: 'car-1',
          filled_at: '2025-12-15',
          odometer_km: 1000,
          liters: 40,
          total_cost: 4000,
          is_partial: false,
          created_at: '2025-12-15T00:00:00Z',
          updated_at: '2025-12-15T00:00:00Z',
        },
        {
          id: '2',
          car_id: 'car-1',
          filled_at: '2025-12-30',
          odometer_km: 1500,
          liters: 35,
          total_cost: 3500,
          is_partial: false,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        {
          id: '3',
          car_id: 'car-1',
          filled_at: '2026-01-05',
          odometer_km: 2000,
          liters: 30,
          total_cost: 3000,
          is_partial: false,
          created_at: '2026-01-05T00:00:00Z',
          updated_at: '2026-01-05T00:00:00Z',
        },
      ];

      vi.spyOn(FuelLogService, 'getFuelLogs').mockResolvedValue(mockLogs);

      const result = await AnalyticsService.getSpendingTrends('car-1', 12);

      expect(result).toHaveLength(2);
      
      // December 2025 data (2 fills)
      expect(result[0]).toMatchObject({
        date: '2025-12',
        value: 7500,
        amount: 7500,
        liters: 75,
        fills: 2,
      });
      
      // January 2026 data (1 fill)
      expect(result[1]).toMatchObject({
        date: '2026-01',
        value: 3000,
        amount: 3000,
        liters: 30,
        fills: 1,
      });
    });
  });
});
