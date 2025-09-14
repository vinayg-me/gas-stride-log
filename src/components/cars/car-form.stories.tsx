import type { Meta, StoryObj } from '@storybook/react';
import { CarForm } from './car-form';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Cars/CarForm',
  component: CarForm,
  parameters: {
    layout: 'centered',
  },
  args: {
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CarForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddCar: Story = {};

export const EditCar: Story = {
  args: {
    car: {
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
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithoutOptionalFields: Story = {
  args: {
    car: {
      id: '2',
      owner_id: 'user-1',
      registration: 'MH-12-XY-9876',
      make: 'Maruti',
      model: 'Swift',
      fuel_type: 'petrol',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
};
