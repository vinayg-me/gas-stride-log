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
    
    // Reset all mock functions to return `this` for chaining
    mockSupabaseQuery.select.mockReturnThis();
    mockSupabaseQuery.insert.mockReturnThis();
    mockSupabaseQuery.update.mockReturnThis();
    mockSupabaseQuery.delete.mockReturnThis();
    mockSupabaseQuery.eq.mockReturnThis();
    mockSupabaseQuery.single.mockReturnThis();
    mockSupabaseQuery.order.mockReturnThis();
    
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

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockLogs, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockQuery);

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

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockLogs, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockQuery);

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

  describe('getFuelLogs', () => {
    it('should fetch all fuel logs when no carId provided', async () => {
      const mockLogs = [
        { id: '1', car_id: 'car-1', liters: 40 },
        { id: '2', car_id: 'car-2', liters: 35 },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockLogs, error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await FuelLogService.getFuelLogs();

      expect(supabase.from).toHaveBeenCalledWith('fuel_logs');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.order).toHaveBeenCalledWith('filled_at', { ascending: false });
      expect(mockQuery.eq).not.toHaveBeenCalled();
      expect(result).toEqual(mockLogs);
    });

    it('should fetch fuel logs for specific car when carId provided', async () => {
      const mockLogs = [{ id: '1', car_id: 'car-1', liters: 40 }];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockLogs, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await FuelLogService.getFuelLogs('car-1');

      expect(mockQuery.eq).toHaveBeenCalledWith('car_id', 'car-1');
      expect(result).toEqual(mockLogs);
    });

    it('should throw error when database query fails', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(FuelLogService.getFuelLogs()).rejects.toThrow('Failed to fetch fuel logs: Database error');
    });
  });

  describe('createFuelLog', () => {
    it('should create fuel log with processed data', async () => {
      const logData: AddFuelLogForm = {
        car_id: 'car-1',
        filled_at: '2024-01-01',
        odometer_km: 1000,
        liters: 40,
        price_per_l: 105.50,
        is_partial: false,
      };

      const mockCreatedLog = {
        id: '1',
        ...logData,
        total_cost: 4220, // Auto-calculated
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
      };

      mockSupabaseQuery.single.mockResolvedValue({
        data: mockCreatedLog,
        error: null,
      });

      const result = await FuelLogService.createFuelLog(logData);

      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        ...logData,
        total_cost: 4220,
      });
      expect(result).toEqual(mockCreatedLog);
    });
  });

  describe('uploadReceipt', () => {
    it('should upload file and return public URL', async () => {
      const mockFile = new File(['test'], 'receipt.jpg', { type: 'image/jpeg' });
      const userId = 'user-1';
      const logId = 'log-1';

      mockStorage.upload.mockResolvedValue({
        data: { path: 'user-1/log-1-123456.jpg' },
        error: null,
      });

      mockStorage.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/receipt.jpg' },
      });

      const result = await FuelLogService.uploadReceipt(mockFile, userId, logId);

      expect(mockStorage.upload).toHaveBeenCalledWith(
        expect.stringMatching(/^user-1\/log-1-\d+\.jpg$/),
        mockFile,
        {
          cacheControl: '3600',
          upsert: false,
        }
      );
      expect(result).toBe('https://example.com/receipt.jpg');
    });

    it('should throw error when upload fails', async () => {
      const mockFile = new File(['test'], 'receipt.jpg', { type: 'image/jpeg' });

      mockStorage.upload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      });

      await expect(FuelLogService.uploadReceipt(mockFile, 'user-1', 'log-1'))
        .rejects.toThrow('Failed to upload receipt: Upload failed');
    });
  });
});
