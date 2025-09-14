import type { Meta, StoryObj } from '@storybook/react';
import { AddFuelLogDialog } from './fuel-log-dialog';
import { Car } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
  title: 'FuelLogs/AddFuelLogDialog',
  component: AddFuelLogDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    cars: mockCars,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AddFuelLogDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTrigger: Story = {};

export const WithDefaultCar: Story = {
  args: {
    defaultCarId: '1',
  },
};

export const CustomTrigger: Story = {
  args: {
    trigger: (
      <Button variant="secondary">
        <Plus className="h-4 w-4 mr-2" />
        Add New Log
      </Button>
    ),
  },
};
