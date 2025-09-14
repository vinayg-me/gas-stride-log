import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CarService } from '../cars';
import { supabase } from '@/integrations/supabase/client';
import { AddCarForm } from '@/types';

// Mock Supabase
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
  single: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
};

describe('CarService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.from as any).mockReturnValue(mockSupabaseQuery);
  });

  describe('getCars', () => {
    it('should fetch cars successfully', async () => {
      const mockCars = [
        { id: '1', make: 'Honda', model: 'City', registration: 'KA-01-AB-1234' },
      ];

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockCars,
        error: null,
      });

      const result = await CarService.getCars();

      expect(supabase.from).toHaveBeenCalledWith('cars');
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockCars);
    });

    it('should throw error when fetch fails', async () => {
      const mockError = { message: 'Database error' };
      mockSupabaseQuery.order.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(CarService.getCars()).rejects.toThrow('Failed to fetch cars: Database error');
    });
  });

  describe('createCar', () => {
    it('should create car successfully', async () => {
      const mockUser = { id: 'user-1' };
      const carData: AddCarForm = {
        registration: 'KA-01-AB-1234',
        make: 'Honda',
        model: 'City',
        fuel_type: 'petrol',
      };
      const mockCreatedCar = { id: 'car-1', ...carData, owner_id: 'user-1' };

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
      });

      mockSupabaseQuery.single.mockResolvedValue({
        data: mockCreatedCar,
        error: null,
      });

      const result = await CarService.createCar(carData);

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('cars');
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        ...carData,
        owner_id: 'user-1',
      });
      expect(result).toEqual(mockCreatedCar);
    });

    it('should throw error when user not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
      });

      const carData: AddCarForm = {
        registration: 'KA-01-AB-1234',
        make: 'Honda',
        model: 'City',
        fuel_type: 'petrol',
      };

      await expect(CarService.createCar(carData)).rejects.toThrow(
        'User must be authenticated to create a car'
      );
    });

    it('should handle duplicate registration error', async () => {
      const mockUser = { id: 'user-1' };
      const carData: AddCarForm = {
        registration: 'KA-01-AB-1234',
        make: 'Honda',
        model: 'City',
        fuel_type: 'petrol',
      };

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
      });

      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint "cars_owner_id_registration_key"' },
      });

      await expect(CarService.createCar(carData)).rejects.toThrow(
        'A car with this registration number already exists'
      );
    });
  });
});
