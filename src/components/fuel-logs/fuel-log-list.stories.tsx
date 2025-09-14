import type { Meta, StoryObj } from '@storybook/react';
import { FuelLogList } from './fuel-log-list';
import { Car, FuelLog } from '@/types';

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

const mockFuelLogs: FuelLog[] = [
  {
    id: '1',
    car_id: '1',
    filled_at: '2024-01-20',
    odometer_km: 45500,
    liters: 38,
    price_per_l: 106.20,
    total_cost: 4035.60,
    is_partial: false,
    station: 'Indian Oil Petrol Pump',
    notes: 'Full tank after highway trip',
    receipt_url: 'https://example.com/receipt1.jpg',
    created_at: '2024-01-20T10:30:00Z',
    updated_at: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    car_id: '1',
    filled_at: '2024-01-15',
    odometer_km: 45230,
    liters: 40,
    price_per_l: 105.50,
    total_cost: 4220,
    is_partial: false,
    station: 'HP Petrol Pump',
    notes: 'Regular fill-up',
    created_at: '2024-01-15T15:45:00Z',
    updated_at: '2024-01-15T15:45:00Z',
  },
  {
    id: '3',
    car_id: '1',
    filled_at: '2024-01-12',
    odometer_km: 45100,
    liters: 20,
    price_per_l: 104.80,
    total_cost: 2096,
    is_partial: true,
    station: 'Bharat Petroleum',
    notes: 'Quick top-up',
    created_at: '2024-01-12T08:20:00Z',
    updated_at: '2024-01-12T08:20:00Z',
  },
  {
    id: '4',
    car_id: '2',
    filled_at: '2024-01-10',
    odometer_km: 28500,
    liters: 35,
    price_per_l: 105.00,
    total_cost: 3675,
    is_partial: false,
    station: 'Shell Petrol Pump',
    created_at: '2024-01-10T12:00:00Z',
    updated_at: '2024-01-10T12:00:00Z',
  },
];

// Mock the hooks
const mockUseFuelLogs = (carId?: string) => ({
  data: carId ? mockFuelLogs.filter(log => log.car_id === carId) : mockFuelLogs,
  isLoading: false,
  error: null,
});

const mockUseCarMileage = (carId: string) => ({
  data: {
    logs: mockFuelLogs
      .filter(log => log.car_id === carId)
      .map((log, index) => ({
        ...log,
        mileage: index === 0 ? 14.2 : index === 1 ? 15.8 : undefined,
        distance: index === 0 ? 270 : index === 1 ? 130 : undefined,
      })),
    averageMileage: 15.0,
  },
});

const meta = {
  title: 'FuelLogs/FuelLogList',
  component: FuelLogList,
  parameters: {
    layout: 'padded',
    mockData: [
      {
        url: '/api/fuel-logs*',
        method: 'GET',
        status: 200,
        response: mockFuelLogs,
      },
    ],
  },
  args: {
    cars: mockCars,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FuelLogList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllFuelLogs: Story = {};

export const SingleCarLogs: Story = {
  args: {
    carId: '1',
  },
};

export const EmptyState: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/fuel-logs*',
        method: 'GET',
        status: 200,
        response: [],
      },
    ],
  },
};

export const LoadingState: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/fuel-logs*',
        method: 'GET',
        status: 200,
        response: mockFuelLogs,
        delay: 2000,
      },
    ],
  },
};

export const ErrorState: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/fuel-logs*',
        method: 'GET',
        status: 500,
        response: { error: 'Internal server error' },
      },
    ],
  },
};
