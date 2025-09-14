import type { Meta, StoryObj } from '@storybook/react';
import { EditFuelLogDialog } from './fuel-log-dialog';
import { Car, FuelLog } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

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

const mockFuelLog: FuelLog = {
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
  receipt_url: 'https://example.com/receipt.jpg',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
};

const meta = {
  title: 'FuelLogs/EditFuelLogDialog',
  component: EditFuelLogDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    cars: mockCars,
    fuelLog: mockFuelLog,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EditFuelLogDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomTrigger: Story = {
  args: {
    trigger: (
      <Button variant="outline" size="sm">
        <Edit className="h-4 w-4 mr-2" />
        Modify Log
      </Button>
    ),
  },
};
