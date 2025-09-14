import type { Meta, StoryObj } from '@storybook/react';
import { AddCarDialog, EditCarDialog } from './car-dialog';
import { DeleteCarDialog } from './delete-car-dialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

const meta = {
  title: 'Cars/CarDialogs',
  decorators: [
    (Story) => (
      <TestWrapper>
        <Story />
      </TestWrapper>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddCarDialog_Default: Story = {
  render: () => <AddCarDialog />,
};

export const AddCarDialog_CustomTrigger: Story = {
  render: () => (
    <AddCarDialog trigger={<Button variant="outline">Custom Add Car Button</Button>} />
  ),
};

export const EditCarDialog_Default: Story = {
  render: () => (
    <EditCarDialog
      car={{
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
      }}
    />
  ),
};

export const DeleteCarDialog_Default: Story = {
  render: () => (
    <DeleteCarDialog
      car={{
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
      }}
    />
  ),
};

export const AllDialogs: Story = {
  render: () => (
    <div className="space-x-4">
      <AddCarDialog />
      <EditCarDialog
        car={{
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
        }}
      />
      <DeleteCarDialog
        car={{
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
        }}
      />
    </div>
  ),
};
