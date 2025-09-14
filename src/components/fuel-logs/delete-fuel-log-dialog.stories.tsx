import type { Meta, StoryObj } from '@storybook/react';
import { DeleteFuelLogDialog } from './delete-fuel-log-dialog';
import { FuelLog } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

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
  title: 'FuelLogs/DeleteFuelLogDialog',
  component: DeleteFuelLogDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    fuelLog: mockFuelLog,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DeleteFuelLogDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomTrigger: Story = {
  args: {
    trigger: (
      <Button variant="destructive" size="sm">
        <Trash2 className="h-4 w-4 mr-2" />
        Remove Log
      </Button>
    ),
  },
};

export const PartialFill: Story = {
  args: {
    fuelLog: {
      ...mockFuelLog,
      id: '2',
      liters: 25,
      total_cost: 2620,
      is_partial: true,
      notes: 'Quick top-up',
    },
  },
};
