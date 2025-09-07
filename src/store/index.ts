// FuelTrackr Store - Zustand state management

import { create } from 'zustand';
import { Car, FuelLog, CarStats, OverallStats } from '@/types';

interface AppState {
  // Data
  cars: Car[];
  fuelLogs: FuelLog[];
  carStats: Record<string, CarStats>;
  overallStats: OverallStats | null;
  
  // UI State
  selectedCarId: string | null;
  isOnline: boolean;
  syncStatus: 'synced' | 'pending' | 'syncing';
  
  // Actions
  setCars: (cars: Car[]) => void;
  addCar: (car: Car) => void;
  updateCar: (carId: string, updates: Partial<Car>) => void;
  deleteCar: (carId: string) => void;
  
  setFuelLogs: (logs: FuelLog[]) => void;
  addFuelLog: (log: FuelLog) => void;
  updateFuelLog: (logId: string, updates: Partial<FuelLog>) => void;
  deleteFuelLog: (logId: string) => void;
  
  setCarStats: (stats: Record<string, CarStats>) => void;
  setOverallStats: (stats: OverallStats) => void;
  
  setSelectedCarId: (carId: string | null) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncStatus: (status: 'synced' | 'pending' | 'syncing') => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  cars: [],
  fuelLogs: [],
  carStats: {},
  overallStats: null,
  selectedCarId: null,
  isOnline: true,
  syncStatus: 'synced',
  
  // Car actions
  setCars: (cars) => set({ cars }),
  addCar: (car) => set((state) => ({ 
    cars: [...state.cars, car],
    syncStatus: 'pending'
  })),
  updateCar: (carId, updates) => set((state) => ({
    cars: state.cars.map(car => 
      car.id === carId ? { ...car, ...updates, updated_at: new Date().toISOString() } : car
    ),
    syncStatus: 'pending'
  })),
  deleteCar: (carId) => set((state) => ({
    cars: state.cars.filter(car => car.id !== carId),
    fuelLogs: state.fuelLogs.filter(log => log.car_id !== carId),
    syncStatus: 'pending'
  })),
  
  // Fuel log actions
  setFuelLogs: (fuelLogs) => set({ fuelLogs }),
  addFuelLog: (log) => set((state) => ({ 
    fuelLogs: [...state.fuelLogs, log].sort((a, b) => 
      new Date(b.filled_at).getTime() - new Date(a.filled_at).getTime()
    ),
    syncStatus: 'pending'
  })),
  updateFuelLog: (logId, updates) => set((state) => ({
    fuelLogs: state.fuelLogs.map(log => 
      log.id === logId ? { ...log, ...updates, updated_at: new Date().toISOString() } : log
    ),
    syncStatus: 'pending'
  })),
  deleteFuelLog: (logId) => set((state) => ({
    fuelLogs: state.fuelLogs.filter(log => log.id !== logId),
    syncStatus: 'pending'
  })),
  
  // Stats actions
  setCarStats: (carStats) => set({ carStats }),
  setOverallStats: (overallStats) => set({ overallStats }),
  
  // UI actions
  setSelectedCarId: (selectedCarId) => set({ selectedCarId }),
  setOnlineStatus: (isOnline) => set({ isOnline }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
}));

// Computed selectors
export const useCarById = (carId: string | null) => {
  return useAppStore((state) => 
    carId ? state.cars.find(car => car.id === carId) : null
  );
};

export const useFuelLogsByCar = (carId: string | null) => {
  return useAppStore((state) => 
    carId ? state.fuelLogs.filter(log => log.car_id === carId) : []
  );
};

export const useCarStatsById = (carId: string | null) => {
  return useAppStore((state) => 
    carId ? state.carStats[carId] : null
  );
};