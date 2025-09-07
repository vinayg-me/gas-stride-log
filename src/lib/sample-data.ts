// Sample data for demonstration

import { Car, FuelLog, CarStats, OverallStats } from "@/types";

export const sampleCars: Car[] = [
  {
    id: "car-1",
    owner_id: "user-1",
    registration: "KA-01-AB-1234",
    make: "Honda",
    model: "City",
    fuel_type: "petrol",
    tank_capacity_l: 40,
    year: 2022,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "car-2", 
    owner_id: "user-1",
    registration: "KA-05-CD-5678",
    make: "Maruti",
    model: "Swift",
    fuel_type: "petrol",
    tank_capacity_l: 37,
    year: 2021,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const sampleFuelLogs: FuelLog[] = [
  {
    id: "log-1",
    car_id: "car-1",
    filled_at: "2024-01-15",
    odometer_km: 10500,
    liters: 35,
    price_per_l: 105.50,
    total_cost: 3692.50,
    is_partial: false,
    station: "Indian Oil Petrol Pump",
    notes: "Full tank",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "log-2",
    car_id: "car-1", 
    filled_at: "2024-01-10",
    odometer_km: 10150,
    liters: 25,
    price_per_l: 104.80,
    total_cost: 2620,
    is_partial: true,
    station: "HP Petrol Pump",
    notes: "Partial fill",
    created_at: "2024-01-10T15:45:00Z",
    updated_at: "2024-01-10T15:45:00Z",
  },
  {
    id: "log-3",
    car_id: "car-2",
    filled_at: "2024-01-12",
    odometer_km: 6450,
    liters: 32,
    price_per_l: 106.20,
    total_cost: 3398.40,
    is_partial: false,
    station: "Bharat Petroleum",
    notes: "Full tank after long trip",
    created_at: "2024-01-12T09:15:00Z",
    updated_at: "2024-01-12T09:15:00Z",
  },
];

export const sampleCarStats: Record<string, CarStats> = {
  "car-1": {
    car_id: "car-1",
    avg_kmpl: 19.2,
    cost_per_km: 5.8,
    total_spend: 15000,
    total_liters: 520,
    total_distance: 10000,
    last_fill_date: "2024-01-15",
    last_30_days_spend: 2500,
    fuel_logs_count: 25,
  },
  "car-2": {
    car_id: "car-2", 
    avg_kmpl: 17.8,
    cost_per_km: 6.6,
    total_spend: 10000,
    total_liters: 370,
    total_distance: 6450,
    last_fill_date: "2024-01-12",
    last_30_days_spend: 1700,
    fuel_logs_count: 18,
  },
};

export const sampleOverallStats: OverallStats = {
  total_cars: 2,
  avg_kmpl: 18.5,
  cost_per_km: 6.2,
  total_spend: 25000,
  total_liters: 890,
  total_distance: 16450,
  monthly_spend: 4200,
  last_updated: new Date().toISOString(),
};