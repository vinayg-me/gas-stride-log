import type { Meta, StoryObj } from '@storybook/react';
import { Fuel, TrendingUp, IndianRupee } from 'lucide-react';
import { StatCard } from './stat-card';

const meta = {
  title: 'UI/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'premium', 'glass'],
    },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Total Distance',
    value: '12,450 km',
    subtitle: 'Last updated today',
    icon: Fuel,
  },
};

export const WithPositiveTrend: Story = {
  args: {
    title: 'Fuel Efficiency',
    value: '18.5 km/L',
    subtitle: 'Average across all cars',
    icon: TrendingUp,
    trend: {
      value: 8.2,
      isPositive: true,
    },
  },
};

export const WithNegativeTrend: Story = {
  args: {
    title: 'Cost per KM',
    value: '₹4.80',
    subtitle: 'This month',
    icon: IndianRupee,
    trend: {
      value: -2.5,
      isPositive: false,
    },
  },
};

export const Premium: Story = {
  args: {
    title: 'Premium Fuel',
    value: '2,340 L',
    subtitle: 'Total consumed',
    icon: Fuel,
    variant: 'premium',
    trend: {
      value: 12.3,
      isPositive: true,
    },
  },
};

export const Glass: Story = {
  args: {
    title: 'Monthly Spend',
    value: '₹8,450',
    subtitle: 'December 2024',
    icon: IndianRupee,
    variant: 'glass',
  },
};