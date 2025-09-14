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
