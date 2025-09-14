import type { Meta, StoryObj } from '@storybook/react';
import { CarCard } from './car-card';

const meta = {
  title: 'UI/CarCard',
  component: CarCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CarCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCar = {
  id: '1',
  registration: 'KA-01-AB-1234',
  make: 'Honda',
  model: 'City',
  fuel_type: 'petrol' as const,
  tank_capacity_l: 40,
  year: 2020,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  owner_id: 'user1',
};

export const Default: Story = {
  args: {
    car: sampleCar,
    stats: {
      car_id: '1',
      avg_kmpl: 18.5,
      cost_per_km: 4.2,
      last_fill_date: '2024-12-01',
      last_30_days_spend: 3200,
      total_distance: 15000,
      total_spend: 25000,
      total_liters: 1350,
      fuel_logs_count: 45,
    },
  },
};

export const HighEfficiency: Story = {
  args: {
    car: {
      ...sampleCar,
      registration: 'TN-09-BC-5678',
      make: 'Maruti',
      model: 'Swift',
      year: 2022,
    },
    stats: {
      car_id: '2',
      avg_kmpl: 22.8,
      cost_per_km: 3.8,
      last_fill_date: '2024-12-07',
      last_30_days_spend: 2800,
      total_distance: 12500,
      total_spend: 18000,
      total_liters: 950,
      fuel_logs_count: 38,
    },
  },
};

export const LuxuryCar: Story = {
  args: {
    car: {
      ...sampleCar,
      registration: 'DL-01-CD-9999',
      make: 'BMW',
      model: '320i',
      year: 2023,
      tank_capacity_l: 60,
    },
    stats: {
      car_id: '3',
      avg_kmpl: 12.5,
      cost_per_km: 8.5,
      last_fill_date: '2024-12-05',
      last_30_days_spend: 12000,
      total_distance: 8000,
      total_spend: 68000,
      total_liters: 640,
      fuel_logs_count: 25,
    },
  },
};

export const NewCar: Story = {
  args: {
    car: {
      ...sampleCar,
      registration: 'MH-12-EF-0001',
      make: 'Hyundai',
      model: 'Creta',
      year: 2024,
    },
    stats: {
      car_id: '4',
      avg_kmpl: 16.2,
      cost_per_km: 5.1,
      last_fill_date: '2024-12-07',
      last_30_days_spend: 4500,
      total_distance: 2500,
      total_spend: 12750,
      total_liters: 154,
      fuel_logs_count: 8,
    },
  },
};

export const AddCard: Story = {
  args: {
    isAddCard: true,
    onAddClick: () => console.log('Add car clicked'),
  },
};

export const AddCardAsDialogTrigger: Story = {
  args: {
    isAddCard: true,
    asDialogTrigger: true,
  },
};