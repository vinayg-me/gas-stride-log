// FuelTrackr Types - Core domain models

export interface Car {
  id: string;
  owner_id: string;
  registration: string;
  make: string;
  model: string;
  fuel_type: 'petrol';
  tank_capacity_l?: number;
  year?: number;
  created_at: string;
  updated_at: string;
}

export interface FuelLog {
  id: string;
  car_id: string;
  filled_at: string; // ISO date string
  odometer_km: number;
  liters: number;
  price_per_l?: number;
  total_cost?: number;
  is_partial: boolean;
  station?: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

// Enriched fuel log used for UI/analytics where computed values are attached
export type FuelLogWithMetrics = FuelLog & {
  mileage?: number;
  distance?: number;
};

export interface CarStats {
  car_id: string;
  avg_kmpl: number;
  cost_per_km: number;
  total_spend: number;
  total_liters: number;
  total_distance: number;
  last_fill_date: string;
  last_30_days_spend: number;
  fuel_logs_count: number;
}

export interface OverallStats {
  total_cars: number;
  avg_kmpl: number;
  cost_per_km: number;
  total_spend: number;
  total_liters: number;
  total_distance: number;
  monthly_spend: number;
  last_updated: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Form types
export interface AddCarForm {
  registration: string;
  make: string;
  model: string;
  fuel_type: 'petrol';
  tank_capacity_l?: number;
  year?: number;
}

export interface AddFuelLogForm {
  car_id: string;
  filled_at: string;
  odometer_km: number;
  liters: number;
  price_per_l?: number;
  total_cost?: number;
  is_partial: boolean;
  station?: string;
  notes?: string;
  receipt_url?: string;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MileageChartData extends ChartDataPoint {
  kmpl: number;
  distance: number;
  liters: number;
}

export interface SpendChartData extends ChartDataPoint {
  amount: number;
  liters: number;
  fills: number;
}